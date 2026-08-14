import { ColorSchemeMode } from '../types/eink';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceSlate: string;    // Reference #546382 Slate Blue
  surfaceDark: string;     // Reference #2F3030 Charcoal Dark
  parchment: string;       // Reference #F4F1D0 Cream Parchment
  text: string;
  textSecondary: string;
  textMuted: string;
  textOnSlate: string;     // Reference #F4F1D0 text on Slate
  border: string;
  accent: string;
  accentSlate: string;     // #546382
  accentCharcoal: string;  // #2F3030
  accentParchment: string; // #F4F1D0
  highlightYellow: string;
  highlightGreen: string;
  highlightAmber: string;
  einkDark: string;
  einkLight: string;
  isDark: boolean;
}

export const COLOR_THEMES: Record<ColorSchemeMode, ThemeColors> = {
  paperwhite: {
    background: '#EDEDEB',       // Authentic Amazon Kindle Carta Paperwhite
    surface: '#F7F7F5',
    surfaceAlt: '#E4E4E0',
    surfaceSlate: '#546382',     // Slate Blue Hero
    surfaceDark: '#2F3030',      // Charcoal Card
    parchment: '#EDEDEB',        // Clean Paperwhite Accent
    text: '#111111',             // Deep Carbon Black Ink
    textSecondary: '#546382',
    textMuted: '#7E8B9B',
    textOnSlate: '#F4F1D0',
    border: '#D4D6D8',
    accent: '#546382',
    accentSlate: '#546382',
    accentCharcoal: '#2F3030',
    accentParchment: '#EDEDEB',
    highlightYellow: 'rgba(235, 235, 230, 0.6)',
    highlightGreen: 'rgba(76, 175, 80, 0.3)',
    highlightAmber: 'rgba(255, 152, 0, 0.35)',
    einkDark: '#111111',
    einkLight: '#EDEDEB',
    isDark: false,
  },
  warm_cream: {
    background: '#F4F1D0',       // Reference Vintage Vanilla Parchment #F4F1D0
    surface: '#FAF8E8',
    surfaceAlt: '#EBE7C5',
    surfaceSlate: '#546382',
    surfaceDark: '#2F3030',
    parchment: '#F4F1D0',
    text: '#1F1E1C',
    textSecondary: '#4A4843',
    textMuted: '#8C887B',
    textOnSlate: '#F4F1D0',
    border: '#DDD8B8',
    accent: '#546382',
    accentSlate: '#546382',
    accentCharcoal: '#2F3030',
    accentParchment: '#F4F1D0',
    highlightYellow: 'rgba(255, 235, 59, 0.4)',
    highlightGreen: 'rgba(76, 175, 80, 0.3)',
    highlightAmber: 'rgba(255, 152, 0, 0.35)',
    einkDark: '#1F1E1C',
    einkLight: '#F4F1D0',
    isDark: false,
  },
  amber_sepia: {
    background: '#F4ECD8',
    surface: '#FAF4E6',
    surfaceAlt: '#E8DEC6',
    surfaceSlate: '#3D4C65',
    surfaceDark: '#2F3030',
    parchment: '#F4F1D0',
    text: '#2C251C',
    textSecondary: '#635645',
    textMuted: '#A0917B',
    textOnSlate: '#F4F1D0',
    border: '#D8CBB2',
    accent: '#5E4E38',
    accentSlate: '#3D4C65',
    accentCharcoal: '#2F3030',
    accentParchment: '#F4F1D0',
    highlightYellow: 'rgba(255, 214, 0, 0.4)',
    highlightGreen: 'rgba(100, 180, 100, 0.3)',
    highlightAmber: 'rgba(255, 130, 0, 0.35)',
    einkDark: '#2C251C',
    einkLight: '#F4ECD8',
    isDark: false,
  },
  anti_halation: {
    background: '#212222',       // Reference Dark Charcoal #212222
    surface: '#2F3030',          // Reference Charcoal Card #2F3030
    surfaceAlt: '#3A3B3B',
    surfaceSlate: '#546382',     // Slate Header
    surfaceDark: '#1E1F1F',
    parchment: '#F4F1D0',
    text: '#F4F1D0',             // Soft Parchment text on dark
    textSecondary: '#B8B598',
    textMuted: '#7A7865',
    textOnSlate: '#F4F1D0',
    border: '#3F4242',
    accent: '#546382',
    accentSlate: '#546382',
    accentCharcoal: '#2F3030',
    accentParchment: '#F4F1D0',
    highlightYellow: 'rgba(244, 241, 208, 0.25)',
    highlightGreen: 'rgba(76, 175, 80, 0.25)',
    highlightAmber: 'rgba(224, 192, 151, 0.3)',
    einkDark: '#F4F1D0',
    einkLight: '#212222',
    isDark: true,
  },
  pure_monochrome: {
    background: '#EDEDED',
    surface: '#F6F6F6',
    surfaceAlt: '#DFDFDF',
    surfaceSlate: '#354057',
    surfaceDark: '#222222',
    parchment: '#FFFFFF',
    text: '#0D0D0D',
    textSecondary: '#404040',
    textMuted: '#808080',
    textOnSlate: '#FFFFFF',
    border: '#C8C8C8',
    accent: '#202020',
    accentSlate: '#354057',
    accentCharcoal: '#222222',
    accentParchment: '#FFFFFF',
    highlightYellow: 'rgba(0, 0, 0, 0.15)',
    highlightGreen: 'rgba(0, 0, 0, 0.2)',
    highlightAmber: 'rgba(0, 0, 0, 0.1)',
    einkDark: '#0D0D0D',
    einkLight: '#EDEDED',
    isDark: false,
  },
};
