# Phase 4 Context: Testing, Offline Verification & Polish

## Scope
This phase covers the final steps required for the v1.0 Core Essentials & Foundation release, ensuring the PDF Toolbox is robust, performant, fully offline-capable, and ready for deployment.

## Implementation Decisions

Based on the discussion, the following architectural and implementation decisions are locked in for Phase 4:

1. **E2E Testing Framework:**
   - **Playwright** will be used for automated End-to-End tests.
   - Tests will cover the full flow (upload, process, download) for all 5 essential tools.

2. **Memory Management Strategy:**
   - Implement **Worker recycling**. The Web Workers will be explicitly terminated and respawned after large operations to prevent memory leaks and browser crashes.
   - Aggressive cleanup using `URL.revokeObjectURL` for all blob URLs post-download.

3. **Documentation:**
   - Documentation will be **README-focused**.
   - The `README.md` will be enhanced with detailed setup instructions, architecture overview, privacy guarantees, and local deployment options.

4. **Offline PWA Validation:**
   - Utilize **Lighthouse** for automated PWA score validation.
   - Manual verification in Chrome DevTools using the offline network throttle.

5. **Release & Packaging:**
   - The app will be distributed as a **static build** (compiled `dist/` folder).
   - We will rely purely on browser-native PWA installation for a "desktop app" feel (no Electron/Tauri wrappers will be used).

## Next Steps
Downstream agents should proceed with planning the implementation steps using Playwright setup, worker lifecycle adjustments, and documentation updates based on this context.
