# Phase 1 Plan: Project Setup, Design System & PWA Architecture

## Executive Summary
Establish the foundational infrastructure, Zinc & Emerald Vanilla CSS design system, responsive app shell, navigation & search, reusable drag-and-drop file ingestion components, toast notifications, tool registry, and PWA offline configuration.

---

## Tasks Breakdown

### Task 1.1: Project Scaffolding & Dependencies
- Initialize Vite + React + TypeScript in the root directory.
- Install dependencies: `react`, `react-dom`, `lucide-react`, `pdf-lib`, `pdfjs-dist`, `jszip`, `canvas-confetti`, `vite-plugin-pwa`.
- Setup `tsconfig.json`, `vite.config.ts` (with PWA plugin and worker format), and `index.html`.

### Task 1.2: Zinc & Emerald Master Design System (`src/index.css`)
- Define comprehensive CSS custom properties for Dark and Light themes:
  - Zinc backgrounds (`--bg-app`, `--bg-surface`, `--bg-card`, `--bg-hover`, `--border-subtle`, `--border-strong`).
  - Typography colors (`--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`).
  - Emerald accents (`--accent-primary`, `--accent-hover`, `--accent-subtle`, `--accent-text`).
  - Status colors (`--success`, `--error`, `--warning`, `--info`).
  - Radii, shadows, transitions, and z-index layers.
- Base reset, typography hierarchy, custom scrollbar styling, button variants, input/search styles, badges, and responsive utility classes.

### Task 1.3: Types & Tool Registry
- Create `src/types/index.ts` defining Tool definitions, Category types, UploadedFile interfaces, Toast types, and Theme modes.
- Create `src/config/tools.ts` containing the registry of all essential tools (Merge, Split, Organize, Compress, Images to PDF, etc.) with metadata, icons, tags, and category mappings.

### Task 1.4: Core Layout & Navigation Components
- `src/components/layout/Navbar.tsx`: Header containing brand logo, live search bar, category filter tabs, theme toggle button, and privacy guarantee badge modal.
- `src/components/layout/PrivacyModal.tsx`: Interactive modal detailing the 100% client-side privacy architecture.
- `src/components/layout/Footer.tsx`: Clean footer with offline status indicator, open-source details, and local processing confirmation.
- `src/components/dashboard/Dashboard.tsx`: Dynamic grid of tool cards with category filter filtering, real-time search, favorite tags, and tool launch triggers.
- `src/components/dashboard/ToolCard.tsx`: Accessible, interactive card with hover elevations, badges, and description.

### Task 1.5: Reusable File Ingestion & Feedback Components
- `src/components/common/FileDropzone.tsx`: Drag-and-drop zone supporting single & multi-file drops, file browser picker, clipboard paste (`Ctrl+V`), format validation (`.pdf`, images), file size badge, and visual drag-active states.
- `src/components/common/ToastContainer.tsx` & `src/context/ToastContext.tsx`: Floating toast notification system with animated progress bars, type icons (success, error, warning, info), and auto-dismiss.
- `src/components/layout/ToolHeader.tsx`: Common header for active tool workspaces with back button, breadcrumbs, title, description, and status tags.

### Task 1.6: App Shell & Routing Integration
- Connect state in `src/App.tsx`: Theme persistence in `localStorage`, active tool navigation, search filter sync, toast provider wrapping, and offline/online network listener.
- Verify hot reload, build output, type checking, and UI responsiveness.

---

## Verification Criteria
1. `npm run build` succeeds with zero TypeScript or bundling errors.
2. App runs locally with `npm run dev` and renders a clean, modern Zinc & Emerald dashboard.
3. Theme switcher toggles between Dark and Light themes with instant contrast adjustment.
4. Search bar and category chips filter the tool grid instantly.
5. Drag-and-drop FileDropzone accepts valid PDF/image files, rejects invalid types with toast warnings, and supports pasting from clipboard.
6. Privacy modal displays the client-side architecture guarantee.
