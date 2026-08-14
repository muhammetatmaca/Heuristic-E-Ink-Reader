import { create } from 'zustand';
import { EinkSettings, TypographySettings, ColorSchemeMode, RefreshMode, DitherAlgorithm, PaperType, InkWeight } from '../types/eink';

interface SettingsState {
  eink: EinkSettings;
  typography: TypographySettings;
  isFlashActive: boolean;
  manualRefreshTrigger: number;
  ghostingStack: string[];
  
  // Actions
  updateEinkSettings: (settings: Partial<EinkSettings>) => void;
  updateTypography: (typography: Partial<TypographySettings>) => void;
  setColorScheme: (scheme: ColorSchemeMode) => void;
  setPaperType: (paperType: PaperType) => void;
  setRefreshMode: (mode: RefreshMode) => void;
  setDitherAlgorithm: (algorithm: DitherAlgorithm) => void;
  triggerManualFlash: () => void;
  setFlashActive: (active: boolean) => void;
  pushGhostingSnapshot: (text: string) => void;
  clearGhosting: () => void;
  resetDefaults: () => void;
}

const DEFAULT_EINK_SETTINGS: EinkSettings = {
  colorScheme: 'warm_cream',      // Authentic Warm Parchment #F4F1D0
  warmLightIntensity: 20,         // Gentle natural reading ambient
  backlightIntensity: 0,
  paperType: 'deckle_rough',      // Authentic Handmade Deckle-Edge Rough Paper with Real Fibers
  paperTextureIntensity: 75,      // Rich visible tactile paper tooth & fibers
  paperAging: 35,                 // Warm vintage book patina
  deckleEdgeRoughness: 50,        // Physical spine shadow & organic relief
  customTexturePrompt: 'Authentic 4K macro photograph of antique handmade deckle-edge rag book paper with visible raw cotton fibers, coarse tooth grain, organic irregular edges, and soft warm parchment tint #F4F1D0, studio diffuse lighting, seamless texture',
  inkWeight: 'bold_press',        // Sharp deep letterpress ink
  ditherAlgorithm: 'atkinson',
  quantizationLevels: 16,
  ghostingEnabled: true,
  ghostingOpacity: 0.05,
  refreshMode: 'regal',
  flashFrequency: 5,
  flashDurationMs: 280,
  temperatureCelsius: 22,
  idleZeroFpsMode: true,
  fpsLimit: 30,
};

const DEFAULT_TYPOGRAPHY_SETTINGS: TypographySettings = {
  fontFamily: 'Literata',
  fontSize: 18,
  lineHeightRatio: 1.55,
  letterSpacing: 0.2,
  paragraphSpacing: 16,
  horizontalMargin: 24,
  textAlign: 'left',
  hyphenation: true,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  eink: DEFAULT_EINK_SETTINGS,
  typography: DEFAULT_TYPOGRAPHY_SETTINGS,
  isFlashActive: false,
  manualRefreshTrigger: 0,
  ghostingStack: [],

  updateEinkSettings: (newSettings) =>
    set((state) => ({ eink: { ...state.eink, ...newSettings } })),

  updateTypography: (newTypography) =>
    set((state) => ({ typography: { ...state.typography, ...newTypography } })),

  setColorScheme: (colorScheme) =>
    set((state) => ({ eink: { ...state.eink, colorScheme } })),

  setPaperType: (paperType) =>
    set((state) => ({ eink: { ...state.eink, paperType } })),

  setRefreshMode: (refreshMode) =>
    set((state) => ({ eink: { ...state.eink, refreshMode } })),

  setDitherAlgorithm: (ditherAlgorithm) =>
    set((state) => ({ eink: { ...state.eink, ditherAlgorithm } })),

  triggerManualFlash: () =>
    set((state) => ({
      manualRefreshTrigger: state.manualRefreshTrigger + 1,
      ghostingStack: [],
    })),

  setFlashActive: (isFlashActive) => set({ isFlashActive }),

  pushGhostingSnapshot: (text) =>
    set((state) => {
      const maxLayers = state.eink.refreshMode === 'fast_a2' ? 3 : 1;
      const updated = [text, ...state.ghostingStack.slice(0, maxLayers - 1)];
      return { ghostingStack: updated };
    }),

  clearGhosting: () => set({ ghostingStack: [] }),

  resetDefaults: () =>
    set({
      eink: DEFAULT_EINK_SETTINGS,
      typography: DEFAULT_TYPOGRAPHY_SETTINGS,
      ghostingStack: [],
    }),
}));
