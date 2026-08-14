export type ColorSchemeMode = 
  | 'paperwhite'      // Day Paperwhite: #F3F3F3 clean crisp paper
  | 'warm_cream'      // Warm Cream / Vintage Parchment: #F4F1D0
  | 'amber_sepia'     // Warm Amber / Night: #F4ECD8
  | 'anti_halation'   // Anti-Halation Dark: #212222 bg with #F4F1D0 text
  | 'pure_monochrome';// Pure 16-level grayscale E-Ink

export type PaperType = 
  | 'book_parchment'  // Kitap Kağıdı (Sarı/Mat #F4F1D0)
  | 'deckle_rough'    // Tırtıklı & Ham Kesim (Deckle Edge & Pürüzlü Lif)
  | 'japanese_washi'  // Japon Washi (Doğal Uzun Lifli)
  | 'cotton_rag'      // Pamuklu Kağıt (Mikro Lifli)
  | 'kraft_recycled'  // Geri Dönüştürülmüş Ham Kraft
  | 'smooth_vellum'   // Pürüzsüz Parşömen
  | 'newsprint';      // Gazete Kağıdı

export type InkWeight = 
  | 'light'           // İnce Mürekkep
  | 'regular'         // Standart E-Paper
  | 'bold_press';     // Pres Baskı (Yoğun Mürekkep)

export type DitherAlgorithm = 
  | 'none'            // Hard Thresholding (No Dither)
  | 'floyd_steinberg' // Floyd-Steinberg 4-neighbor Error Diffusion
  | 'atkinson'        // Atkinson 6-neighbor 75% Error Diffusion
  | 'bayer4'          // Bayer 4x4 Ordered Matrix Dithering
  | 'bayer8'          // Bayer 8x8 Ordered Matrix Dithering
  | 'blue_noise'      // Blue Noise / Void-and-Cluster High-Frequency Dither
  | 'randomized';     // Randomized Micro-Pigment Error Diffusion

export type RefreshMode = 
  | 'fast_a2'         // A2 Mode: 100ms ultra-fast 1-bit driving, high ghosting accumulation, 0 flash
  | 'du'              // DU (Direct Update): 200ms quick refresh, low latency, subtle ghosting
  | 'regal'           // Regal Mode: Differential localized LUT refresh, 280ms
  | 'glr16'           // GLR16: Grayscale Local Refresh for pure text rendering (450ms)
  | 'gc16'            // GC16: Full Inversion Refresh, 900ms, complete dual-phase black/white cycle, zero ghosting
  | 'pure_paper';     // Pure Paper Mode: Warm texture, subtle dither and natural contrast

export type FontFamily = 
  | 'Literata'
  | 'Bookerly'
  | 'Georgia'
  | 'Merriweather'
  | 'System';

export interface WaveformPulse {
  phaseName: string;
  voltage: number; // +15, -15, 0 (Volts)
  durationMs: number;
  description: string;
}

export interface EinkSettings {
  // Color & Lighting
  colorScheme: ColorSchemeMode;
  warmLightIntensity: number; // 0 to 100
  backlightIntensity: number; // 0 to 100
  
  // Paper & Texture Simulation
  paperType: PaperType;
  paperTextureIntensity: number; // 0 to 100 (Visible fiber & noise)
  paperAging: number; // 0 to 100 (Vignette & patina)
  deckleEdgeRoughness: number; // 0 to 100 (Tırtıklı kenar & ham pürüzlü diş yoğunluğu)
  customTexturePrompt: string; // Özel doku promptu
  inkWeight: InkWeight;
  
  // Optical & E-Paper Simulation
  ditherAlgorithm: DitherAlgorithm;
  quantizationLevels: 2 | 4 | 8 | 16 | 256;
  ghostingEnabled: boolean;
  ghostingOpacity: number;
  
  // Waveform & Refresh
  refreshMode: RefreshMode;
  flashFrequency: number;
  flashDurationMs: number;
  temperatureCelsius: number;
  
  // Power & Performance
  idleZeroFpsMode: boolean;
  fpsLimit: 30 | 60;
}

export interface TypographySettings {
  fontFamily: FontFamily;
  fontSize: number;
  lineHeightRatio: number;
  letterSpacing: number;
  paragraphSpacing: number;
  horizontalMargin: number;
  textAlign: 'left' | 'justify';
  hyphenation: boolean;
}

export interface EinkProfile {
  name: string;
  description: string;
  settings: Partial<EinkSettings>;
}
