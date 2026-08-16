# Phase 1 Research: Project Setup, Design System & PWA Architecture

## Domain & Ecosystem Investigation

### 1. Build Engine & Libraries
- **Vite 6 / 5 + React 18 / 19 + TypeScript**: Fastest dev server with instantaneous HMR, modern ES modules, and zero config bundling for client-side web workers.
- **`pdf-lib` (v1.17.1)**: Runs 100% in browser, zero native dependencies, handles PDF document creation, page copying, merging, rotation, encryption, metadata, watermarks.
- **`pdfjs-dist` (v4.x / v3.x)**: Official Mozilla PDF renderer. Runs in browser canvas. Note on worker: Configure `GlobalWorkerOptions.workerSrc` to use bundled or local worker blob to ensure 100% offline functionality.
- **`jszip` (v3.10.1)**: In-memory zip generation for batch image/page downloads.
- **`lucide-react` (v0.400+)**: Lightweight, modern, tree-shakable SVG icon set.
- **`vite-plugin-pwa`**: Generates service worker with `Workbox` for precaching all assets (HTML, CSS, JS, Wasm, fonts, workers) enabling full offline execution.

### 2. Design System Architecture (Zinc & Emerald)
- High-contrast, clean modern aesthetic avoiding cliché design traps (no purple on dark, no colored glowing outlines, no grid-mesh overlays).
- CSS Variables in `:root` and `[data-theme="dark"]` for seamless instant theme toggling without page reload.
- Mobile-first responsive layout with fluid grid templates (`repeat(auto-fill, minmax(280px, 1fr))`).

### 3. File Handling & Memory Safety
- Use `File` / `Blob` and `ArrayBuffer` directly in memory.
- Revoke `URL.createObjectURL` after download or thumbnail destruction to prevent browser memory leaks on multi-page operations.
- Clean validation for accepted MIME types (`application/pdf`, `image/png`, `image/jpeg`, `image/webp`).

## Potential Risks & Mitigations
- **PDF.js Web Worker offline loading**: Mitigate by bundling the pdf.worker using Vite or creating an inline URL worker so it works without any external CDN dependency.
- **Large PDF memory spikes**: Maintain single ArrayBuffer references and clean up canvas contexts after rendering thumbnails.
