/**
 * Bayer Matrix Threshold maps for Ordered Dithering (Normalized 0..1)
 * Used to mimic E-Ink electrophoretic micro-capsule pigment orientation.
 */

// 4x4 Bayer Matrix
export const BAYER_MATRIX_4x4: number[][] = [
  [ 0/16,  8/16,  2/16, 10/16],
  [12/16,  4/16, 14/16,  6/16],
  [ 3/16, 11/16,  1/16,  9/16],
  [15/16,  7/16, 13/16,  5/16],
];

// 8x8 Bayer Matrix
export const BAYER_MATRIX_8x8: number[][] = [
  [ 0/64, 32/64,  8/64, 40/64,  2/64, 34/64, 10/64, 42/64],
  [48/64, 16/64, 56/64, 24/64, 50/64, 18/64, 58/64, 26/64],
  [12/64, 44/64,  4/64, 36/64, 14/64, 46/64,  6/64, 38/64],
  [60/64, 28/64, 52/64, 20/64, 62/64, 30/64, 54/64, 22/64],
  [ 3/64, 35/64, 11/64, 43/64,  1/64, 33/64,  9/64, 41/64],
  [51/64, 19/64, 59/64, 27/64, 49/64, 17/64, 57/64, 25/64],
  [15/64, 47/64,  7/64, 39/64, 13/64, 45/64,  5/64, 37/64],
  [63/64, 31/64, 55/64, 23/64, 61/64, 29/64, 53/64, 21/64],
];

// 8x8 Blue Noise / High-Frequency Void-and-Cluster Matrix
export const BLUE_NOISE_MATRIX_8x8: number[][] = [
  [14/64, 45/64, 22/64, 58/64,  7/64, 38/64, 19/64, 53/64],
  [50/64,  2/64, 35/64, 11/64, 47/64, 26/64, 60/64,  5/64],
  [27/64, 61/64, 17/64, 54/64,  1/64, 42/64, 15/64, 33/64],
  [40/64, 10/64, 44/64, 24/64, 56/64, 18/64, 49/64,  9/64],
  [ 6/64, 52/64, 30/64, 63/64,  4/64, 31/64,  3/64, 36/64],
  [46/64, 20/64,  8/64, 37/64, 21/64, 57/64, 28/64, 62/64],
  [13/64, 59/64, 41/64, 16/64, 48/64, 12/64, 43/64, 23/64],
  [34/64, 25/64,  0/64, 51/64, 29/64, 39/64, 55/64, 32/64],
];

// 16 Grayscale Steps for E-Ink Pearl / Carta standard displays
export const EINK_16_LEVELS: number[] = [
  0,   17,  34,  51,
  68,  85, 102, 119,
  136, 153, 170, 187,
  204, 221, 238, 255
];

// 4 Grayscale Steps (2-bit)
export const EINK_4_LEVELS: number[] = [0, 85, 170, 255];

// 2 Grayscale Steps (1-bit / Pure Monochrome)
export const EINK_2_LEVELS: number[] = [0, 255];

// Photometric Luminance calculation coefficients (ITU-R BT.709)
export const LUMINANCE_WEIGHTS = {
  r: 0.2126,
  g: 0.7152,
  b: 0.0722,
};

// Waveform Driving Pulse Profiles (+15V, -15V, 0V timings)
export interface WaveformPulseDefinition {
  modeName: string;
  totalDurationMs: number;
  ghostingLevelPercent: number;
  flickerType: 'none' | 'subtle' | 'full_inversion';
  pulses: { voltage: number; durationRatio: number; label: string }[];
}

export const WAVEFORM_PROFILES: Record<string, WaveformPulseDefinition> = {
  fast_a2: {
    modeName: 'A2 (Hızlı 1-Bit)',
    totalDurationMs: 120,
    ghostingLevelPercent: 12,
    flickerType: 'none',
    pulses: [
      { voltage: 15, durationRatio: 0.8, label: 'Hızlı Kutuplanma (+15V)' },
      { voltage: 0, durationRatio: 0.2, label: 'Durgunluk (0V)' },
    ],
  },
  du: {
    modeName: 'DU (Direct Update)',
    totalDurationMs: 220,
    ghostingLevelPercent: 6,
    flickerType: 'none',
    pulses: [
      { voltage: 15, durationRatio: 0.5, label: 'Hedef Voltaj (+15V)' },
      { voltage: -5, durationRatio: 0.3, label: 'Karşı Sönümleme (-5V)' },
      { voltage: 0, durationRatio: 0.2, label: 'Durgunluk (0V)' },
    ],
  },
  regal: {
    modeName: 'Regal (Diferansiyel LUT)',
    totalDurationMs: 320,
    ghostingLevelPercent: 1,
    flickerType: 'subtle',
    pulses: [
      { voltage: -15, durationRatio: 0.25, label: 'Lokal Delta Tersleme (-15V)' },
      { voltage: 15, durationRatio: 0.45, label: 'Hedef Gri İtme (+15V)' },
      { voltage: -5, durationRatio: 0.15, label: 'İnce Denge (-5V)' },
      { voltage: 0, durationRatio: 0.15, label: 'Durgunluk (0V)' },
    ],
  },
  glr16: {
    modeName: 'GLR16 (Metin Odaklı Gri)',
    totalDurationMs: 480,
    ghostingLevelPercent: 0.5,
    flickerType: 'subtle',
    pulses: [
      { voltage: -15, durationRatio: 0.3, label: 'Önceki Durum Silme (-15V)' },
      { voltage: 15, durationRatio: 0.4, label: '16-Seviye Gri Sürüş (+15V)' },
      { voltage: -10, durationRatio: 0.2, label: 'Relaksasyon (-10V)' },
      { voltage: 0, durationRatio: 0.1, label: 'Durgunluk (0V)' },
    ],
  },
  gc16: {
    modeName: 'GC16 (Tam Çakım & Temizlik)',
    totalDurationMs: 950,
    ghostingLevelPercent: 0,
    flickerType: 'full_inversion',
    pulses: [
      { voltage: -15, durationRatio: 0.3, label: 'Tam Siyaha Sürüş (-15V)' },
      { voltage: 15, durationRatio: 0.3, label: 'Tam Beyaza Sürüş (+15V)' },
      { voltage: -15, durationRatio: 0.2, label: 'Kinetik Sıfırlama (-15V)' },
      { voltage: 15, durationRatio: 0.15, label: 'Nihai Görüntü Sürüşü (+15V)' },
      { voltage: 0, durationRatio: 0.05, label: 'Durgunluk (0V)' },
    ],
  },
  pure_paper: {
    modeName: 'Doğal Kağıt Modu',
    totalDurationMs: 380,
    ghostingLevelPercent: 2,
    flickerType: 'subtle',
    pulses: [
      { voltage: -10, durationRatio: 0.3, label: 'Yumuşak Sıfırlama (-10V)' },
      { voltage: 12, durationRatio: 0.5, label: 'Doğal Kontrast Sürüşü (+12V)' },
      { voltage: 0, durationRatio: 0.2, label: 'Durgunluk (0V)' },
    ],
  },
};
