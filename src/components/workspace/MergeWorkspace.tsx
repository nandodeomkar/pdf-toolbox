import React from 'react';
import { usePdfStore } from '../../store/pdfStore';
import { mergePdfsWorker } from '../../services/workerClient';
import { useToast } from '../../context/ToastContext';

export const MergeWorkspace: React.FC = () => {
  const { files, clearFiles } = usePdfStore();
  const { addToast } = useToast();
  const [isMerging, setIsMerging] = React.useState(false);

  const handleMerge = async () => {
    const readyFiles = files.filter(f => f.status === 'ready');
    if (readyFiles.length < 2) {
      addToast('error', 'Need more files', 'Please upload at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);
    try {
      const response = await mergePdfsWorker(readyFiles.map(f => f.file));
      
      const blob = new Blob([response.data as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      a.click();
      
      // Cleanup Object URL to release browser memory
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      addToast('success', 'Merge Complete', 'Your merged PDF has been downloaded.');
      clearFiles();
      
      // Explicitly recycle the worker after a heavy operation
      import('../../services/workerClient').then(module => module.recycleWorker());
    } catch (err: any) {
      addToast('error', 'Merge Failed', err.message);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div style={{ marginTop: '24px', textAlign: 'center' }}>
      <button 
        className="btn btn-primary" 
        onClick={handleMerge} 
        disabled={isMerging || files.filter(f => f.status === 'ready').length < 2}
      >
        {isMerging ? 'Merging...' : 'Merge PDFs'}
      </button>
      <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Files will be merged in the order shown above.
      </p>
    </div>
  );
};
