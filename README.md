# PDF Toolbox

A 100% client-side, offline, open-source PDF manipulation suite designed as a privacy-respecting, zero-upload alternative to online PDF services.

## 🔒 Privacy Guarantee
**Zero network uploads.** All PDF rendering, merging, splitting, compression, conversion, and editing happens strictly inside your browser runtime using Web Workers and local rendering engines. Your files never leave your device's memory.

## 🚀 Features (Core Essentials)
- **Merge PDFs:** Combine multiple PDFs into one document easily.
- **Split & Burst PDFs:** Extract specific page ranges or burst a PDF into individual files.
- **Compress PDF:** Reduce file size using multi-level presets with local raster optimization.
- **Organize Pages:** Visually reorder, rotate, or delete pages in a drag-and-drop grid.
- **Images to PDF:** Convert multiple images into a combined PDF with adjustable layouts and margins.

## 🛠️ Architecture
- **Framework:** Vite + React 19 + TypeScript
- **Styling:** Custom Vanilla CSS Design System with light/dark theme support.
- **PDF Core Engines:** 
  - `pdf-lib` for document manipulation and generation.
  - `pdfjs-dist` for client-side visual rendering and extractions.
- **State Management:** `zustand`
- **Offline Capabilities:** Progressive Web App (PWA) configuration via `vite-plugin-pwa`.

## 📦 Local Development

### Prerequisites
- Node.js (v18 or higher recommended)

### Setup
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

### Running Tests
We use Playwright for end-to-end testing to verify our core tools.
```bash
npm run test:e2e
```

## 🌐 PWA Installation (Desktop App Experience)
PDF Toolbox is fully configured as a Progressive Web App (PWA). Once you visit the hosted site or run the production build locally:
1. Look for the "Install" icon in your browser's address bar (Chrome/Edge).
2. Click **Install PDF Toolbox**.
3. It will now run as a standalone desktop application, capable of functioning entirely offline.

## 🧠 Memory Management
Heavy PDF operations can consume significant browser memory. PDF Toolbox implements active **Web Worker Recycling**:
- Operations are offloaded to an isolated worker thread.
- Upon completion of a task, the worker is explicitly terminated and respawned.
- Large blob URLs are eagerly revoked to prevent memory leaks and keep the application snappy even after batch processing.

## License
MIT License
