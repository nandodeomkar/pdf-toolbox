import React, { useState } from 'react';
import { usePdfStore } from '../../store/pdfStore';
import { splitPdfWorker } from '../../services/workerClient';
import { useToast } from '../../context/ToastContext';

export const SplitWorkspace: React.FC = () => {
  const { files, clearFiles } = usePdfStore();
  const { addToast } = useToast();
  const [isSplitting, setIsSplitting] = useState(false);
  const [ranges, setRanges] = useState('');

  const handleSplit = async () => {
    const readyFiles = files.filter(f => f.status === 'ready');
    if (readyFiles.length !== 1) {
      addToast('error', 'Select one file', 'Please upload exactly 1 PDF file to split.');
      return;
    }
    if (!ranges.trim()) {
      addToast('error', 'Empty ranges', 'Please specify the page ranges.');
      return;
    }

    setIsSplitting(true);
    try {
      const response = await splitPdfWorker(readyFiles[0].file, ranges);
      
      const mimeType = response.resultType === 'zip' ? 'application/zip' : 'application/pdf';
      const extension = response.resultType === 'zip' ? '.zip' : '.pdf';
      const blob = new Blob([response.data as unknown as BlobPart], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `split-output${extension}`;
      a.click();
      
      // Cleanup Object URL to release browser memory
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      addToast('success', 'Split Complete', 'Your split PDF(s) have been downloaded.');
      clearFiles();
      
      // Explicitly recycle the worker after a heavy operation
      import('../../services/workerClient').then(module => module.recycleWorker());
    } catch (err: any) {
      addToast('error', 'Split Failed', err.message);
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div style={{ marginTop: '24px', textAlign: 'center', maxWidth: '400px', margin: '24px auto 0' }}>
      <div style={{ marginBottom: '16px', textAlign: 'left' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
          Page Ranges (e.g., "1-3, 5, 7-9")
        </label>
        <input 
          type="text" 
          value={ranges} 
          onChange={(e) => setRanges(e.target.value)} 
          placeholder="e.g. 1-3, 5, 7-9"
          style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
        />
        <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Tip: Multiple ranges will generate a ZIP file containing a PDF for each range.
        </p>
      </div>
      <button 
        className="btn btn-primary" 
        onClick={handleSplit} 
        disabled={isSplitting || files.filter(f => f.status === 'ready').length !== 1 || !ranges.trim()}
        style={{ width: '100%' }}
      >
        {isSplitting ? 'Processing...' : 'Split PDF'}
      </button>
    </div>
  );
};
