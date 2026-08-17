import React, { useState, useEffect } from 'react';
import { usePdfStore } from '../../store/pdfStore';
import { renderAllThumbnails, manipulatePagesWorker } from '../../services/workerClient';
import { PageOperation } from '../../services/pdfManipulationService';
import { useToast } from '../../context/ToastContext';

export const OrganizerWorkspace: React.FC = () => {
  const { files, clearFiles } = usePdfStore();
  const { addToast } = useToast();
  
  const [urls, setUrls] = useState<string[]>([]);
  const [operations, setOperations] = useState<PageOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(false);
  
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    // Create new array of current indices
    const currentIndices = urls.map((_, i) => i);
    
    // Swap visually
    const newUrls = [...urls];
    const draggedUrl = newUrls.splice(dragItem.current, 1)[0];
    newUrls.splice(dragOverItem.current, 0, draggedUrl);
    
    // Swap indices to build reorder operation
    const draggedIdx = currentIndices.splice(dragItem.current, 1)[0];
    currentIndices.splice(dragOverItem.current, 0, draggedIdx);

    setUrls(newUrls);
    
    // We queue a reorder operation. To be perfectly accurate, this is complex with sequential ops.
    // For this scope, we just append a reorder with the new sequence of the *current* state.
    setOperations(prev => [...prev, { type: 'reorder', newOrder: currentIndices }]);
    
    dragItem.current = null;
    dragOverItem.current = null;
  };

  useEffect(() => {
    const fileItem = files.find(f => f.status === 'ready');
    if (fileItem && urls.length === 0 && !isLoadingThumbs) {
      setIsLoadingThumbs(true);
      renderAllThumbnails(fileItem.file, fileItem.id)
        .then(res => {
          setUrls(res.urls);
        })
        .catch(err => {
          addToast('error', 'Failed to load thumbnails', err.message);
        })
        .finally(() => {
          setIsLoadingThumbs(false);
        });
    }
  }, [files, urls.length, isLoadingThumbs, addToast]);

  const handleRotate = (pageIndex: number) => {
    setOperations(prev => [...prev, { type: 'rotate', pageIndex, degrees: 90 }]);
    addToast('success', 'Page Rotated', `Page ${pageIndex + 1} rotated 90 degrees.`);
  };

  const handleRotateAll = () => {
    // Generate rotate ops for all currently visible pages
    const ops: PageOperation[] = urls.map((url, i) => url ? { type: 'rotate', pageIndex: i, degrees: 90 } : null).filter(Boolean) as PageOperation[];
    setOperations(prev => [...prev, ...ops]);
    addToast('success', 'Rotated All', 'All pages rotated 90 degrees.');
  };

  const handleDelete = (pageIndex: number) => {
    setOperations(prev => [...prev, { type: 'delete', pageIndex }]);
    setUrls(prev => prev.map((url, i) => i === pageIndex ? '' : url));
    addToast('success', 'Page Deleted', `Page ${pageIndex + 1} will be deleted.`);
  };

  const handleDuplicate = (pageIndex: number) => {
    setOperations(prev => [...prev, { type: 'duplicate', pageIndex }]);
    const newUrls = [...urls];
    newUrls.splice(pageIndex + 1, 0, urls[pageIndex]); // visually insert clone next to it
    setUrls(newUrls);
    addToast('success', 'Page Duplicated', `Page ${pageIndex + 1} duplicated.`);
  };

  const handleInsertBlank = () => {
    // Insert at the end for simplicity
    const newIndex = urls.length;
    setOperations(prev => [...prev, { type: 'insertBlank', pageIndex: newIndex }]);
    // Use a blank data URI for the visual representation
    const blankImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    setUrls(prev => [...prev, blankImage]);
    addToast('success', 'Blank Page Inserted', 'Added to the end of the document.');
  };

  const handleSave = async () => {
    const readyFiles = files.filter(f => f.status === 'ready');
    if (readyFiles.length !== 1) return;

    setIsProcessing(true);
    try {
      const response = await manipulatePagesWorker(readyFiles[0].file, operations);
      
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
      setUrls([]);
      setOperations([]);
      
      // Explicitly recycle the worker after a heavy operation
      import('../../services/workerClient').then(module => module.recycleWorker());
    } catch (err: any) {
      addToast('error', 'Failed to save', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (files.filter(f => f.status === 'ready').length !== 1) {
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
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={handleInsertBlank} 
            disabled={isProcessing}
          >
            + Insert Blank Page
          </button>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={handleRotateAll} 
            disabled={isProcessing || urls.length === 0}
          >
            Rotate All
          </button>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={handleSave} 
            disabled={isProcessing || operations.length === 0}
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
          {urls.map((url, i) => url ? (
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
              <div style={{ 
                position: 'absolute', 
                top: 4, right: 4, 
                background: 'rgba(0,0,0,0.5)', 
                color: 'white', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontSize: '11px'
              }}>
                {i + 1}
              </div>
              <img src={url} alt={`Page ${i + 1}`} style={{ width: '100%', height: '180px', objectFit: 'contain' }} draggable={false} />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => handleRotate(i)}
                  style={{ background: 'var(--accent-subtle)', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                >
                  Rotate
                </button>
                <button 
                  onClick={() => handleDuplicate(i)}
                  style={{ background: 'var(--bg-hover)', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                >
                  Dup
                </button>
                <button 
                  onClick={() => handleDelete(i)}
                  style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  );
};
