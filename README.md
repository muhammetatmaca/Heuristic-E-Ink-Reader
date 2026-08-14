# Heuristic E-Ink Reader System

Heuristic E-Ink Reader is a mobile reading application and hardware-level optical simulation engine designed for React Native and Expo. The system emulates the physical and visual characteristics of electrophoretic E-Paper displays (such as Amazon Kindle Carta) on emissive AMOLED and IPS LCD mobile screens.

The application provides dual-engine parsing for reflowable EPUB documents and original vector/matrix PDF files, powered by a 3D cylindrical mesh page curl engine, a hardware Look-Up Table (LUT) waveform simulator, error-diffused dithering matrices, and customizable tactile paper textures.

---

## Key System Capabilities

### 1. Three.js WebGL 3D Cylindrical Page Curl
- Realistic paper mechanics using a 40x40 polygon grid (1600 vertices) with non-linear conical deformation.
- Bidirectional page turning: forward swipes peel the top page to reveal the underlying sheet, while backward swipes fold the previous page over the active canvas.
- Reactive canvas texture updates that maintain a single persistent WebGL context across chapter transitions without reloading.

### 2. Dual Document Processing Architecture
- EPUB Engine: Complete JSZip-based parsing of container metadata, OPF manifests, and NCX/Nav table-of-contents hierarchies. Dynamic mathematical pagination based on typographic parameters (font size, line height ratio, margins, and letter spacing).
- PDF Engine: Mozilla PDF.js rendering that preserves original vector typography, document layout, and illustrations. GPU-accelerated canvas rasterization with optical E-Ink color matrix filters.
- Memory Management: KOReader-inspired dynamic page pooling with Least Recently Used (LRU) texture caching to maintain low memory usage on large documents.

### 3. Hardware E-Paper Emulation & Waveform Simulator
- Waveform Sürüş Modları (LUT Driving Modes):
  - A2 Mode (100 ms): Ultra-fast 1-bit thresholding for rapid page turning with realistic ghosting accumulation.
  - DU Mode (220 ms): Direct update driving with subtle reverse voltage for menus and interface actions.
  - Regal Mode (320 ms): Localized differential LUT refresh that calculates pixel deltas to eliminate ghosting without full screen flashes.
  - GLR16 Mode (480 ms): Grayscale local refresh optimized for crisp 16-level typography.
  - GC16 Mode (950 ms): Full dual-phase kinetic reset (-15V black inversion followed by +15V white inversion) to clear residual particle memory.
- Temperature Compensation: Dynamic scaling of LUT pulse durations based on ambient temperature (-5 deg C to 45 deg C) to simulate electrophoretic fluid viscosity.
- Dithering Algorithms: Atkinson (75% 6-neighbor error diffusion), Floyd-Steinberg (100% 4-neighbor diffusion), Bayer 4x4 ordered threshold matrix, and Blue Noise void-and-cluster matrix.

### 4. Tactile Paper Textures & Ergonomics
- Seven Physical Paper Types: Deckle-Edge Rough Paper, Book Parchment (#F4F1D0), Japanese Washi, Cotton Rag, Recycled Kraft, Smooth Vellum, and Newsprint.
- User Customization: Adjustable deckle edge roughness, fiber texture intensity, vintage patina aging, and ink weight (Light, Regular, Bold Press).
- Anti-Halation Dark Mode: Anthracite background (#212222) paired with warm cream text (#F4F1D0) to eliminate retinal halation and eye fatigue for astigmatic readers in low-light environments.

### 5. Data Persistence & File Security
- Local Device Storage: Books, reading progress percentages, last read page indices, and bookmarks are persistently stored using AsyncStorage and the local file system.
- Strict Format Validation: File import filters exclusively allow .epub, .pdf, and .txt files while blocking images and incompatible documents.
- Zero-FPS Power Saving: The Three.js draw loop is suspended during static reading to minimize battery and CPU/GPU consumption.

---

## Technical Stack

- Framework: React Native 0.86.2 with Expo SDK 57 (New Architecture enabled)
- Graphics & 3D: Three.js (r128), WebGL, HTML5 Canvas, React Native SVG
- State Management: Zustand 5.0
- Storage: React Native AsyncStorage, Expo FileSystem
- Navigation: React Navigation 7.0 (Native Stack & Bottom Tabs)
- Document Parsers: JSZip, Mozilla PDF.js
- Fonts: Custom Serif (Georgia), Monospace (Menlo/Roboto Mono), and Google Fonts (Cinzel, Cormorant Garamond, Caveat)

---

## Project Structure

```text
eink/
├── E-Ink_Okuma_Uygulamasi_Mimarisi_ve_Gelistirme_Raporu.pdf  # Comprehensive technical report
├── E-Ink_Okuma_Uygulamasi_Mimarisi_ve_Gelistirme_Raporu.html # Report source
├── README.md                                                 # Root documentation
└── eink-app/
    ├── assets/                                               # Static images and deckle paper texture
    ├── src/
    │   ├── components/
    │   │   ├── BookCard.tsx                                  # Library book list and grid item
    │   │   ├── DitherVisualizer.tsx                          # Interactive dithering and waveform simulator
    │   │   ├── EInkDisplaySurface.tsx                        # Native surface with texture and ghosting layers
    │   │   ├── EInkSettingsModal.tsx                         # 4-tab master optical lab controls
    │   │   ├── GeometricSeal.tsx                             # Procedural SVG seal graphics
    │   │   ├── OnboardingModal.tsx                           # 10-chapter literary and technical guide
    │   │   ├── PDFViewerSurface.tsx                          # Mozilla PDF.js canvas with optical filters
    │   │   ├── ReaderFooter.tsx                              # Progress bar and navigation controls
    │   │   ├── ReaderHeader.tsx                              # Reading HUD and action triggers
    │   │   ├── RealBookPageFlip.tsx                          # Three.js 3D WebGL cylindrical page curl engine
    │   │   ├── SearchModal.tsx                               # In-book full-text search
    │   │   ├── TableOfContentsModal.tsx                      # Chapter navigation and bookmarks
    │   │   └── TypographySettingsModal.tsx                   # Font size, family, and layout controls
    │   ├── constants/
    │   │   ├── deckleTextureBase64.ts                        # High-resolution paper texture data
    │   │   ├── defaultBooks.ts                               # Initial sample library (Guy de Maupassant & Margaret Ayer Barnes)
    │   │   └── theme.ts                                      # Color schemes and palettes
    │   ├── navigation/
    │   │   └── RootNavigator.tsx                             # Screen navigation configuration
    │   ├── screens/
    │   │   ├── EInkLabScreen.tsx                             # Optical laboratory and oscilloscope
    │   │   ├── LibraryScreen.tsx                             # Library, search, import, and view modes
    │   │   ├── ReaderScreen.tsx                              # Unified reader routing (EPUB & PDF)
    │   │   └── SettingsScreen.tsx                            # System preferences and reset controls
    │   ├── store/
    │   │   ├── libraryStore.ts                               # Persistent book library and reading progress
    │   │   ├── readerStore.ts                                # Active reader state and UI modals
    │   │   └── settingsStore.ts                              # Optical E-Ink settings and typography store
    │   ├── types/
    │   │   ├── book.ts                                       # Book, chapter, and bookmark data schemas
    │   │   └── eink.ts                                       # Waveform, paper, dither, and color type definitions
    │   └── utils/
    │       ├── ditherEngine.ts                               # Dithering mathematics and LUT telemetry
    │       ├── documentParser.ts                             # Text pagination and word wrapping calculations
    │       └── fileImporter.ts                               # EPUB and PDF document picker with validation
    ├── App.tsx                                               # Application entry point
    └── package.json                                          # Dependency definitions
```

---

## Installation and Execution

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager
- Expo Go application on mobile device (Android / iOS)

### Installation Steps

1. Navigate to the project directory:
   ```bash
   cd eink/eink-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start -c --host lan
   ```

4. Scan the generated QR code using the Expo Go app or a camera on an Android/iOS device connected to the same local network.

---

## Testing and Verification

- TypeScript static analysis:
  ```bash
  npx tsc --noEmit
  ```
- All components conform to strict TypeScript interfaces with zero build errors.

---

## License

This project is licensed under the MIT License. All literature texts and sample books are in the public domain.
