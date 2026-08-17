# Phase 2 Plan: Core PDF Processing Engine & Document Services

## 1. Context & Goal
Execute the architecture defined in `02-CONTEXT.md` to build out the foundational client-side PDF processing engines using Web Workers and Zustand.

## 2. Execution Steps

### 2.1 Tracer Slice
1. **Install Zustand**: `npm install zustand`
2. **Create Store**: `src/store/pdfStore.ts` to hold documents and generated thumbnails.
3. **Web Worker Engine**: 
   - Create `src/services/pdfWorker.ts` with Vite `?worker` support.
   - Implement `pdfjs-dist` offscreen canvas rendering.
4. **Worker Client**: `src/services/workerClient.ts` for Promise-based communication.

### 2.2 Expansion
5. **Manipulation Services**:
   - `src/services/pdfManipulationService.ts` (merge, split, burst).
6. **Worker Integration**:
   - Hook manipulation services into the `pdfWorker`.
7. **Component Integration**:
   - Connect dropzone/UI to populate Zustand and invoke the worker for rendering.

## 3. Verification
Ensure 0 UI blocking when loading 100-page PDFs.
Ensure generated Blobs render correctly.
