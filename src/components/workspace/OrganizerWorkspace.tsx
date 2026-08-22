import React, { useState, useEffect, useRef } from 'react';
import { usePdfStore } from '../../store/pdfStore';
import { renderAllThumbnails, applyPageLayoutWorker } from '../../services/workerClient';
import { PageSlot } from '../../services/pdfManipulationService';
import { useToast } from '../../context/ToastContext';

// 1x1 transparent GIF, used as the thumbnail for an inserted blank page.
const BLANK_THUMBNAIL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const OrganizerWorkspace: React.FC = () => {
  const { files, clearFiles } = usePdfStore();
  const { addToast } = useToast();

  // `thumbs` is indexed by ORIGINAL page index and never mutated. `slots` is the
  // document the user is building. Keeping them separate is what makes the grid
  // and the saved file agree: a slot names its source page explicitly, so
  // reordering or deleting can never leave an index pointing at the wrong page.
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [slots, setSlots] = useState<PageSlot[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(false);

  // Which file we have already tried to extract. Set BEFORE the async call so a
  // rejection cannot re-trigger the effect -- previously the guard was
  // `urls.length === 0`, which stayed true on failure and re-issued the render
  // forever, pinning the worker at 100% CPU and spamming toasts.
  const attemptedFileId = useRef<string | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    const fileItem = files.find((f) => f.status === 'ready');
    if (!fileItem || attemptedFileId.current === fileItem.id) return;

    attemptedFileId.current = fileItem.id;
    setIsLoadingThumbs(true);
    renderAllThumbnails(fileItem.file, fileItem.id)
      .then((res) => {
        setThumbs(res.urls);
        setSlots(res.urls.map((_, i) => ({ kind: 'page', sourceIndex: i, rotation: 0 })));
      })
      .catch((err) => {
        addToast('error', 'Failed to load pages', err.message);
      })
      .finally(() => {
        setIsLoadingThumbs(false);
      });
  }, [files, addToast]);

  const updateSlot = (position: number, change: (slot: PageSlot) => PageSlot) => {
    setSlots((prev) => prev.map((slot, i) => (i === position ? change(slot) : slot)));
  };

  const handleRotate = (position: number) => {
    updateSlot(position, (slot) => ({ ...slot, rotation: slot.rotation + 90 }));
  };

  const handleRotateAll = () => {
    setSlots((prev) => prev.map((slot) => ({ ...slot, rotation: slot.rotation + 90 })));
    addToast('success', 'Rotated All', 'Every page rotated 90 degrees.');
  };

  const handleDelete = (position: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== position));
    addToast('success', 'Page Removed', `Page ${position + 1} removed from the layout.`);
  };

  const handleDuplicate = (position: number) => {
    setSlots((prev) => [...prev.slice(0, position + 1), { ...prev[position] }, ...prev.slice(position + 1)]);
    addToast('success', 'Page Duplicated', `Page ${position + 1} duplicated.`);
  };

  const handleInsertBlank = () => {
    setSlots((prev) => [...prev, { kind: 'blank', rotation: 0 }]);
    addToast('success', 'Blank Page Inserted', 'Added to the end of the document.');
  };

  const handleSort = () => {
    const from = dragItem.current;
    const to = dragOverItem.current;
    dragItem.current = null;
    dragOverItem.current = null;
    if (from === null || to === null || from === to) return;

    setSlots((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  // The layout is unchanged when it is still every source page, in order,
  // unrotated. Derived rather than tracked so it cannot fall out of sync.
  const isPristine =
    slots.length === thumbs.length &&
    slots.every((slot, i) => slot.kind === 'page' && slot.sourceIndex === i && slot.rotation % 360 === 0);

  const handleSave = async () => {
    const readyFiles = files.filter((f) => f.status === 'ready');
    if (readyFiles.length !== 1) return;

    setIsProcessing(true);
    try {
      const response = await applyPageLayoutWorker(readyFiles[0].file, slots);

      const blob = new Blob([response.data as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'organized.pdf';
      a.click();

      // Cleanup Object URL to release browser memory
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      addToast('success', 'Saved', 'Your organized PDF has been downloaded.');
      clearFiles();
      setThumbs([]);
      setSlots([]);
      attemptedFileId.current = null;

      // Explicitly recycle the worker after a heavy operation
      import('../../services/workerClient').then((module) => module.recycleWorker());
    } catch (err: any) {
      addToast('error', 'Failed to save', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (files.filter((f) => f.status === 'ready').length !== 1) {
    return (
      <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Please upload exactly 1 PDF file to organize.
      </div>
    );
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>Organize Pages</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleInsertBlank} disabled={isProcessing}>
            + Insert Blank Page
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleRotateAll}
            disabled={isProcessing || slots.length === 0}
          >
            Rotate All
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={isProcessing || isPristine || slots.length === 0}
          >
            {isProcessing ? 'Saving...' : 'Apply & Save'}
          </button>
        </div>
      </div>

      {isLoadingThumbs ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ marginBottom: '12px' }}></div>
          <p>Extracting all pages...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
          {slots.map((slot, i) => (
            <div
              key={i}
              draggable={true}
              onDragStart={() => (dragItem.current = i)}
              onDragEnter={() => (dragOverItem.current = i)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '8px',
                textAlign: 'center',
                position: 'relative',
                cursor: 'grab'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}
              >
                {i + 1}
              </div>
              <img
                src={slot.kind === 'page' ? thumbs[slot.sourceIndex] : BLANK_THUMBNAIL}
                alt={slot.kind === 'page' ? `Source page ${slot.sourceIndex + 1}` : 'Blank page'}
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'contain',
                  // Preview the rotation, so the grid shows what will be saved.
                  transform: `rotate(${slot.rotation}deg)`,
                  transition: 'transform 150ms ease',
                  background: slot.kind === 'blank' ? 'white' : undefined
                }}
                draggable={false}
              />
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'center',
                  marginTop: '8px',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  onClick={() => handleRotate(i)}
                  style={{
                    background: 'var(--accent-subtle)',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Rotate
                </button>
                <button
                  onClick={() => handleDuplicate(i)}
                  style={{
                    background: 'var(--bg-hover)',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Dup
                </button>
                <button
                  onClick={() => handleDelete(i)}
                  // A PDF cannot have zero pages; block the last delete here
                  // rather than failing at save time.
                  disabled={slots.length === 1}
                  title={slots.length === 1 ? 'A PDF must keep at least one page' : undefined}
                  style={{
                    background: slots.length === 1 ? 'var(--bg-hover)' : '#fee2e2',
                    color: slots.length === 1 ? 'var(--text-secondary)' : '#b91c1c',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: slots.length === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
