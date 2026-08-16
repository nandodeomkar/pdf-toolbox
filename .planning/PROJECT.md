# PDF Toolbox (Local & Privacy-First)

## Project Vision
A 100% client-side, offline, open-source PDF manipulation suite designed as a privacy-respecting, zero-upload alternative to services like iLovePDF and Smallpdf. All PDF rendering, merging, splitting, compression, conversion, and editing happens strictly inside the user's browser runtime using WebAssembly, Web Workers, and local Canvas/PDF engines.

## Key Principles
1. **Absolute Privacy**: Zero network uploads. Files never leave RAM/IndexedDB on the user's device.
2. **100% Offline Capability**: Runs seamlessly without internet connectivity via a Progressive Web App (PWA) service worker, installable as a desktop app.
3. **No Paywalls or Arbitrary Limits**: Full feature access, unlimited file sizes (limited only by device RAM), and batch processing.
4. **Modern & Delightful UX**: Sleek minimalist interface, fluid drag-and-drop, visual page thumbnail grids, dark/light theme toggle, and instant feedback.

## Tech Stack
- **Framework**: Vite + React + TypeScript
- **Styling**: Modern Vanilla CSS Design System with CSS variables, fluid responsive layouts, glassmorphism, and dark/light modes
- **PDF Core Engines**: `pdf-lib` (manipulation, generation, encryption, watermarking) + `pdfjs-dist` (rendering, page extraction, text extraction)
- **Image & Archive Processing**: HTML5 Canvas, `@pdf-lib/upng` / image re-encoders, `jszip` (batch download packaging), `file-saver`
- **PWA & Offline**: `vite-plugin-pwa` + Service Worker caching for complete offline functionality
- **Icons**: `lucide-react`

## Target Audience
- Privacy-conscious individuals and professionals handling sensitive financial, medical, legal, or personal documents.
- Users who need fast, offline, free PDF tools without subscription paywalls, watermarks, or upload delays.
