import {
  BAYER_MATRIX_4x4,
  BAYER_MATRIX_8x8,
  BLUE_NOISE_MATRIX_8x8,
  EINK_16_LEVELS,
  EINK_4_LEVELS,
  EINK_2_LEVELS,
  LUMINANCE_WEIGHTS,
  WAVEFORM_PROFILES,
  WaveformPulseDefinition,
} from '../constants/ditherMatrices';
import { DitherAlgorithm, RefreshMode } from '../types/eink';

/**
 * Calculates perceived photometric luminance (0..255)
 */
export function calculateLuminance(r: number, g: number, b: number): number {
  return LUMINANCE_WEIGHTS.r * r + LUMINANCE_WEIGHTS.g * g + LUMINANCE_WEIGHTS.b * b;
}

/**
 * Quantizes an 8-bit luminance value into specified discrete levels (e.g. 2, 4, 8, 16, 256)
 */
export function quantizeGrayscale(val: number, levels: number = 16): number {
  if (levels >= 256) return Math.min(255, Math.max(0, Math.round(val)));
  if (levels === 2) return val >= 128 ? 255 : 0;
  if (levels === 4) {
    let closest = EINK_4_LEVELS[0];
    let minDiff = Math.abs(val - closest);
    for (let i = 1; i < EINK_4_LEVELS.length; i++) {
      const diff = Math.abs(val - EINK_4_LEVELS[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closest = EINK_4_LEVELS[i];
      }
    }
    return closest;
  }
  if (levels === 16) {
    let closest = EINK_16_LEVELS[0];
    let minDiff = Math.abs(val - closest);
    for (let i = 1; i < EINK_16_LEVELS.length; i++) {
      const diff = Math.abs(val - EINK_16_LEVELS[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closest = EINK_16_LEVELS[i];
      }
    }
    return closest;
  }

  const step = 255 / (levels - 1);
  return Math.round(Math.round(val / step) * step);
}

/**
 * Generates test image 2D intensity matrices (width x height) with values 0..255
 */
export type TestPatternType = 'gradient' | 'portrait' | 'typography' | 'sphere';

export function generateTestPatternMatrix(
  pattern: TestPatternType,
  width: number,
  height: number
): number[][] {
  const matrix: number[][] = [];

  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      let val = 128;

      if (pattern === 'gradient') {
        // Linear smooth horizontal gradient (0..255)
        val = (x / (width - 1)) * 255;
      } else if (pattern === 'sphere') {
        // 3D shaded sphere with light source at top-left
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) * 0.42;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= radius) {
          const nx = dx / radius;
          const ny = dy / radius;
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          // Light vector pointing from (-0.6, -0.6, 0.8)
          const lx = -0.577;
          const ly = -0.577;
          const lz = 0.577;
          const dot = Math.max(0, -(nx * lx + ny * ly) + nz * lz);
          val = Math.round(dot * 255);
        } else {
          val = 240; // Background off-white
        }
      } else if (pattern === 'typography') {
        // High-contrast serif letter 'A' shape with anti-aliased edges
        const u = x / width;
        const v = y / height;
        // Background
        val = 245;
        // Outer triangle
        const leftSlope = 0.5 - (1 - v) * 0.35;
        const rightSlope = 0.5 + (1 - v) * 0.35;
        if (u >= leftSlope && u <= rightSlope && v >= 0.15 && v <= 0.85) {
          // Inside triangle
          const innerLeft = 0.5 - (0.55 - v) * 0.25;
          const innerRight = 0.5 + (0.55 - v) * 0.25;
          const isInnerHole = v >= 0.35 && v <= 0.55 && u >= innerLeft && u <= innerRight;
          if (!isInnerHole) {
            val = 20; // Letter body
          }
        }
        // Horizontal bar
        if (v >= 0.55 && v <= 0.65 && u >= 0.28 && u <= 0.72) {
          val = 20;
        }
      } else if (pattern === 'portrait') {
        // Simulated photographic facial tone contours
        const u = (x - width / 2) / (width / 2);
        const v = (y - height / 2) / (height / 2);
        const dist = Math.sqrt(u * u + v * v);
        // Soft radial vignette with contrast variations
        const base = Math.sin(u * 3) * Math.cos(v * 3);
        val = Math.min(255, Math.max(0, Math.round(128 + base * 70 + (1 - dist) * 60)));
      }

      row.push(Math.min(255, Math.max(0, Math.round(val))));
    }
    matrix.push(row);
  }

  return matrix;
}

/**
 * Applies 2D Dithering on a given 2D Grayscale Matrix (0..255)
 * Returns the dithered matrix with quantized pixel values (0..255).
 */
export function apply2DDither(
  inputMatrix: number[][],
  algorithm: DitherAlgorithm,
  levels: number = 16
): number[][] {
  const height = inputMatrix.length;
  if (height === 0) return [];
  const width = inputMatrix[0].length;

  // Clone buffer to avoid mutating input (use float for error accumulation)
  const buffer: number[][] = inputMatrix.map((row) => [...row]);
  const output: number[][] = [];

  if (algorithm === 'none') {
    // Hard Thresholding without error dispersion
    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        row.push(quantizeGrayscale(buffer[y][x], levels));
      }
      output.push(row);
    }
    return output;
  }

  if (algorithm === 'bayer4') {
    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        const threshold = (BAYER_MATRIX_4x4[y % 4][x % 4] - 0.5) * (255 / (levels - 1));
        const adjustedVal = buffer[y][x] + threshold;
        row.push(quantizeGrayscale(adjustedVal, levels));
      }
      output.push(row);
    }
    return output;
  }

  if (algorithm === 'bayer8') {
    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        const threshold = (BAYER_MATRIX_8x8[y % 8][x % 8] - 0.5) * (255 / (levels - 1));
        const adjustedVal = buffer[y][x] + threshold;
        row.push(quantizeGrayscale(adjustedVal, levels));
      }
      output.push(row);
    }
    return output;
  }

  if (algorithm === 'blue_noise') {
    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        const threshold = (BLUE_NOISE_MATRIX_8x8[y % 8][x % 8] - 0.5) * (255 / (levels - 1));
        const adjustedVal = buffer[y][x] + threshold;
        row.push(quantizeGrayscale(adjustedVal, levels));
      }
      output.push(row);
    }
    return output;
  }

  if (algorithm === 'randomized') {
    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        const jitter = (Math.random() - 0.5) * (255 / (levels - 1));
        row.push(quantizeGrayscale(buffer[y][x] + jitter, levels));
      }
      output.push(row);
    }
    return output;
  }

  if (algorithm === 'floyd_steinberg') {
    // Floyd-Steinberg Error Diffusion:
    //         [X]   7/16
    //  3/16  5/16  1/16
    for (let y = 0; y < height; y++) {
      const outRow: number[] = [];
      for (let x = 0; x < width; x++) {
        const oldVal = buffer[y][x];
        const newVal = quantizeGrayscale(oldVal, levels);
        outRow.push(newVal);
        const error = oldVal - newVal;

        if (x + 1 < width) {
          buffer[y][x + 1] += error * (7 / 16);
        }
        if (y + 1 < height) {
          if (x - 1 >= 0) {
            buffer[y + 1][x - 1] += error * (3 / 16);
          }
          buffer[y + 1][x] += error * (5 / 16);
          if (x + 1 < width) {
            buffer[y + 1][x + 1] += error * (1 / 16);
          }
        }
      }
      output.push(outRow);
    }
    return output;
  }

  if (algorithm === 'atkinson') {
    // Atkinson Dithering (Apple Macintosh / E-Ink Standard):
    // Spreads only 6/8 (75%) of error across 6 neighboring pixels, discarding 25% for crisp contrast:
    //         [X]   1/8   1/8
    //   1/8   1/8   1/8
    //         1/8
    for (let y = 0; y < height; y++) {
      const outRow: number[] = [];
      for (let x = 0; x < width; x++) {
        const oldVal = buffer[y][x];
        const newVal = quantizeGrayscale(oldVal, levels);
        outRow.push(newVal);
        const error = (oldVal - newVal) / 8; // 1/8th of error per neighbor

        if (x + 1 < width) buffer[y][x + 1] += error;
        if (x + 2 < width) buffer[y][x + 2] += error;
        if (y + 1 < height) {
          if (x - 1 >= 0) buffer[y + 1][x - 1] += error;
          buffer[y + 1][x] += error;
          if (x + 1 < width) buffer[y + 1][x + 1] += error;
        }
        if (y + 2 < height) {
          buffer[y + 2][x] += error;
        }
      }
      output.push(outRow);
    }
    return output;
  }

  return inputMatrix;
}

/**
 * Calculates Mean Squared Error (MSE) between original matrix and dithered matrix
 */
export function calculateDitherMSE(original: number[][], dithered: number[][]): number {
  let sumSq = 0;
  let count = 0;
  const height = original.length;
  if (height === 0) return 0;
  const width = original[0].length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const diff = original[y][x] - dithered[y][x];
      sumSq += diff * diff;
      count++;
    }
  }
  return count > 0 ? Math.round(sumSq / count) : 0;
}

/**
 * Retrieves Waveform driving profile and telemetry for any refresh mode
 */
export function getWaveformTelemetry(mode: RefreshMode): WaveformPulseDefinition {
  return WAVEFORM_PROFILES[mode] || WAVEFORM_PROFILES.regal;
}

/**
 * Evaluates warm frontlight overlay color
 */
export function getWarmBacklightColor(intensity: number): string {
  if (intensity <= 0) return 'transparent';
  const alpha = (intensity / 100) * 0.22;
  return `rgba(255, 180, 50, ${alpha.toFixed(3)})`;
}

/**
 * Generates an SVG procedural paper noise data URI
 */
export function generatePaperGrainDataUri(opacity: number = 0.05): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${opacity} 0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
