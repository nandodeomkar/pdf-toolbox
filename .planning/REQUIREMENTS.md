# Requirements: Local PDF Toolbox

## Scope Overview
The initial release focuses on **Core Essentials First** (Merge, Split, Reorder/Delete/Rotate Pages, Compress, Images to PDF) along with the core PWA shell, dark/light theme, and visual page manipulation engine. Subsequent phases will expand into conversions, signatures, annotations, and security.

---

## Phase 1: Core Foundation & Essentials (Active Scope)

### 1. Application Shell & Design System
- [ ] **R1.1**: Modern, sleek responsive UI shell with navigation, search/filter for tools, dark/light theme switch, and privacy shield guarantee.
- [ ] **R1.2**: Drag-and-drop file upload zone with multi-file support, file size limit indicators, paste support, and sample PDF loader for quick testing.
- [ ] **R1.3**: PWA integration (`vite-plugin-pwa`) with offline service worker caching and install prompt.
- [ ] **R1.4**: Toast notification system for success, warning, error, and progress feedback.

### 2. Merge PDFs Tool
- [ ] **R2.1**: Support uploading multiple PDF documents simultaneously.
- [ ] **R2.2**: Visual list/card reordering (drag-and-drop or move up/down) to dictate merge sequence.
- [ ] **R2.3**: First-page thumbnail preview and page count for each uploaded document.
- [ ] **R2.4**: Client-side merge execution via `pdf-lib` and instant one-click download with custom naming.

### 3. Split & Burst PDF Tool
- [ ] **R3.1**: Visual page preview and selection of uploaded PDF.
- [ ] **R3.2**: Split mode: Custom page ranges (e.g. `1-3, 5, 8-10`) into separate or combined files.
- [ ] **R3.3**: Split mode: Fixed intervals (split every *N* pages).
- [ ] **R3.4**: Burst mode: Extract every single page as an individual PDF packaged in a `.zip` archive.

### 4. Visual Page Organizer (Reorder, Rotate, Delete, Duplicate)
- [ ] **R4.1**: Interactive thumbnail grid of all pages rendered client-side via PDF.js.
- [ ] **R4.2**: Drag-and-drop visual reordering of pages.
- [ ] **R4.3**: Per-page rotation (90° clockwise / counter-clockwise) and batch rotate all.
- [ ] **R4.4**: Delete selected pages and duplicate pages.
- [ ] **R4.5**: Insert blank pages at any position.
- [ ] **R4.6**: Export modified PDF document locally with updated page order, rotations, and deletions.

### 5. PDF Compression & Optimizer
- [ ] **R5.1**: Multi-level compression presets: Extreme (max compression), Recommended (balanced quality/size), High Quality (light compression).
- [ ] **R5.2**: Client-side canvas raster scaling and stream optimization.
- [ ] **R5.3**: Real-time before and after file size comparison and percentage saved.

### 6. Images to PDF Tool
- [ ] **R6.1**: Support JPG, PNG, WebP, GIF uploads with multi-file selection.
- [ ] **R6.2**: Drag-and-drop image reordering and preview gallery.
- [ ] **R6.3**: Page layout options: Page size (A4, US Letter, Fit to Image), Orientation (Portrait, Landscape, Auto), Margins (None, Small, Large).
- [ ] **R6.4**: Export combined PDF document locally.

---

## Phase 2: Conversions & Extractions (Expansion Scope)
- [ ] **R7.1**: PDF to Images (PNG, JPG, WebP zip export at 72/150/300 DPI).
- [ ] **R7.2**: PDF to Text (Instant client-side text stream extraction and `.txt` download).
- [ ] **R7.3**: Markdown / Rich Text to PDF converter.
- [ ] **R7.4**: Automated Blank Page Remover (Luminosity & density analysis).

---

## Phase 3: Annotate, Sign & Edit (Expansion Scope)
- [ ] **R8.1**: Interactive Signature Pad (Draw, Type with handwriting fonts, Upload image stamp) with draggable placement on any page.
- [ ] **R8.2**: Watermark Tool (Text and Image watermark with opacity, rotation, and alignment).
- [ ] **R8.3**: Page Numbering (Header/Footer positioning, dynamic formats `{n} of {total}`, custom margins).
- [ ] **R8.4**: PDF Metadata Editor (Title, Author, Subject, Keywords, Creator).

---

## Phase 4: Security & Redaction (Expansion Scope)
- [ ] **R9.1**: PDF Protect / Encrypt with password.
- [ ] **R9.2**: PDF Unlock / Decrypt with password entry.
- [ ] **R9.3**: Permanent Redaction Brush (Rasterized blackout boxes ensuring unrecoverable text removal).
