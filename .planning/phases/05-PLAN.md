# Phase 5 Plan: Organizer Gap Closure (Audit Fixes)

This phase closes the gaps found during the v1.0 milestone audit regarding the Organizer Workspace.

## Execution Steps

### 1. Update pdfManipulationService
- Expand the `PageOperation` union type with `{ type: 'insertBlank'; pageIndex: number }`.
- Update `manipulatePages` to execute the structural changes efficiently and support inserting blank pages.

### 2. Implement Organizer UI Features
- **Drag and Drop:** Add native HTML5 drag-and-drop to grid items to reorder `urls` visually and build the `reorder` operation.
- **Batch Rotate:** Add a "Rotate All" button that pushes +90 degrees to all active pages.
- **Duplicate:** Add a "Duplicate" button per thumbnail to clone the page.
- **Insert Blank:** Add an "Insert Blank" button in the toolbar to push a blank page placeholder.

### 3. Verify Fixes
- Start the app and load a PDF into the Organizer.
- Test Drag and Drop visually.
- Test Batch Rotate visually.
- Test Duplicate and Insert Blank visually.
- Click Apply & Save to ensure the downloaded PDF is correct and no memory leaks occur.
