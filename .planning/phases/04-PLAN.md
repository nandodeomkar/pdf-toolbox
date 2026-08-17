# Phase 4 Plan: Testing, Offline Verification & Polish

This plan addresses the final "Core Essentials" phase for the PDF Toolbox, based on decisions locked in `04-CONTEXT.md`.

## Execution Steps

### 1. E2E Testing with Playwright
1. **package.json**: Add `@playwright/test` to devDependencies. Add `test:e2e` and `test:e2e:ui` scripts.
2. **playwright.config.ts**: Create configuration to run headless tests using the local dev server.
3. **e2e/tools.spec.ts**: Write E2E tests for:
   - Merge Tool
   - Split & Burst Tool
   - Organizer Tool
   - Compress Tool
   - Images to PDF Tool

### 2. Memory Management (Worker Recycling)
1. **src/services/workerClient.ts**: 
   - Expose a `recycleWorker()` method to terminate the active Web Worker and reset it.
2. **Component Lifecycle Hooks**:
   - Update `ToolWorkspace.tsx` and individual tool components to invoke `recycleWorker()` upon successful download or when unmounting.
   - Ensure object URLs created for downloads are explicitly revoked using `URL.revokeObjectURL()`.

### 3. Documentation & Release Packaging
1. **README.md**: Rewrite to include:
   - Project Vision & Privacy Guarantees (100% local, zero-data-collection).
   - Architecture & Tech Stack details.
   - Local Development Setup.
   - Instructions on how to install the app via PWA.

### 4. Verification & Validation
1. **PWA Lighthouse Audit**: Validate the PWA manifest and service worker configuration locally.
2. **Memory Leak Test**: Verify via Chrome Task Manager that large PDFs release memory after processing.
3. **Final Build Check**: Ensure `npm run build` cleanly compiles the project.
