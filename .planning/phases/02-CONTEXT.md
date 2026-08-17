# Phase 2 Context: Core PDF Processing Engine & Document Services

## Overview
This document captures architectural and implementation decisions for Phase 2, which involves building the core client-side PDF rendering and manipulation services. These decisions guide the downstream research and planning agents.

## Decisions

### 1. State Management
- **Decision**: Install and use `zustand` for managing PDF processing state.
- **Rationale**: While React Context is currently used for global UI states (like Toasts), Zustand is much better suited for managing complex Document data (File lists, ArrayBuffers, page order, rotations) without causing unnecessary top-down re-renders.
- **Action**: Must run `npm install zustand` during the execution phase.

### 2. Web Worker Strategy
- **Decision**: Use Vite Web Workers (`?worker`) for heavy PDF tasks.
- **Rationale**: `pdfjs-dist` (rendering) and `pdf-lib` (manipulation) are CPU-intensive. To prevent the UI (spinners, toast animations) from freezing when merging large files or generating thumbnails, all heavy lifting must run in background threads.
- **Pattern**: `import Worker from './worker?worker'`

### 3. Engine Abstraction Layer
- **Decision**: Expose services as standalone functional utilities, not OOP classes.
- **Rationale**: Pure functional utilities (e.g., `export const mergePdfs = async (files) => {...}`) are stateless. This makes it trivial to import them inside Web Worker scripts, avoiding the complexity of serializing and sharing class instances across the thread boundary.

### 4. Thumbnail Rendering Strategy
- **Decision**: Render using `OffscreenCanvas` at 1.5x scale, cached as `Blob` URLs.
- **Rationale**: Rendering at 1.5x provides retina-crisp visuals while maintaining performance. Generating thumbnails in a worker, converting them to `Blob URL` strings, and returning them to the main thread allows us to cache the images in the Zustand store and render them instantly via standard `<img>` tags, ensuring zero lag on scroll.
