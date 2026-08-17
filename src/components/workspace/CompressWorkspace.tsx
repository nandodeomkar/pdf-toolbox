import React, { useState } from 'react';
import { usePdfStore } from '../../store/pdfStore';
import { compressPdfWorker } from '../../services/workerClient';
import { useToast } from '../../context/ToastContext';

export const CompressWorkspace: React.FC = () => {
  const { files, clearFiles } = usePdfStore();
  const { addToast } = useToast();
  const [isCompressing, setIsCompressing] = useState(false);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('medium');

  const handleCompress = async () => {
    const readyFiles = files.filter(f => f.status === 'ready');
    if (readyFiles.length !== 1) {
      addToast('error', 'Select one file', 'Please upload exactly 1 PDF file to compress.');
      return;
    }

    setIsCompressing(true);
    try {
      const response = await compressPdfWorker(readyFiles[0].file, quality);
      
      const blob = new Blob([response.data as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `compressed-${quality}.pdf`;
      a.click();
      
      // Cleanup Object URL to release browser memory
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      addToast('success', 'Compression Complete', 'Your compressed PDF has been downloaded.');
      clearFiles();
      
      // Explicitly recycle the worker after a heavy operation
      import('../../services/workerClient').then(module => module.recycleWorker());
    } catch (err: any) {
      addToast('error', 'Compression Failed', err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div style={{ marginTop: '24px', textAlign: 'center', maxWidth: '400px', margin: '24px auto 0' }}>
      <div style={{ marginBottom: '20px', textAlign: 'left' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
          Compression Quality
        </label>
        <select 
          value={quality} 
          onChange={(e) => setQuality(e.target.value as 'high' | 'medium' | 'low')}
          style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
        >
          <option value="high">High Quality (Less Compression)</option>
          <option value="medium">Medium Quality (Balanced)</option>
          <option value="low">Low Quality (Max Compression)</option>
        </select>
        <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Note: Local compression removes unused objects and streams. For scanned documents, size reduction may vary.
        </p>
      </div>
      <button 
        className="btn btn-primary" 
        onClick={handleCompress} 
        disabled={isCompressing || files.filter(f => f.status === 'ready').length !== 1}
        style={{ width: '100%' }}
      >
        {isCompressing ? 'Compressing...' : 'Compress PDF'}
      </button>
    </div>
  );
};
