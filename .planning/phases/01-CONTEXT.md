# Phase 1 Context: Project Setup, Design System & PWA Architecture

## Phase Intent
Establish the foundation of the Local PDF Toolbox: a blazing-fast, responsive Vite + React + TypeScript web app with an installable PWA service worker, custom Zinc & Emerald Vanilla CSS design system, dark/light theme switching, minimal topbar navigation with search and category filtering, reusable multi-file dropzones (without sample files, manual uploads only), and toast feedback system.

---

## User Decisions & Choices Locked

### 1. Navigation & Layout
- **Structure**: Minimal Top Bar with quick tool search bar, category filter chips (`All`, `Organize`, `Optimize`, `Convert`, etc.), theme switcher, and persistent "100% Offline & Local" privacy shield indicator.
- **View Transition**: Seamless transition between the Dashboard Tool Grid and the Active Tool Workspace, with breadcrumb/back navigation.

### 2. Design System & Aesthetics
- **Theme**: Zinc & Emerald palette.
  - Dark mode: Deep zinc backgrounds (`#09090b`, `#18181b`, `#27272a`), emerald accents (`#10b981`, `#059669`), crisp white/zinc typography.
  - Light mode: Clean slate/zinc backgrounds (`#fafafa`, `#ffffff`, `#f4f4f5`), deep zinc text (`#09090b`), emerald accents.
- **Typography**: Clean modern sans-serif typography (`Inter` / `Plus Jakarta Sans`) with optical sizing and balanced letter-spacing.
- **Interactions**: Smooth micro-interactions, responsive card hover states, drag-and-drop feedback.

### 3. File Dropzone & Ingestion
- **Dropzone**: Drag-and-drop zone supporting single & multi-file drops, file browser trigger, copy-paste file support, clear file size displays, and format validation.
- **Sample Files**: Excluded (manual uploads only as decided).

### 4. PWA & Offline
- **Service Worker**: Cache-first strategy for app shell, scripts, styles, and web workers to allow 100% offline usage.
- **Manifest**: Web App Manifest with icons, theme colors, and standalone display mode.

---

## Downstream Deliverables
- Setup Vite + React + TypeScript + PWA plugin.
- Master CSS Design System (`index.css`) with Zinc & Emerald tokens, reset, typography, cards, buttons, badges, inputs, and dark/light mode.
- Topbar & Navigation (`Navbar.tsx`) with search, filter tabs, privacy badge, and theme toggle.
- File Dropzone component (`FileDropzone.tsx`) with drag-and-drop, paste support, and validation.
- Toast notification manager (`ToastContext.tsx` / `ToastContainer.tsx`).
- Tool Registry (`toolsConfig.ts`) with metadata for all essential tools.
