import React, { useState } from 'react';
import { usePdfStore } from '../../store/pdfStore';
import { convertImagesToPdfWorker } from '../../services/workerClient';
import { ConversionOptions } from '../../services/conversionService';
import { useToast } from '../../context/ToastContext';

export const ConverterWorkspace: React.FC = () => {
  const { files, clearFiles } = usePdfStore();
  const { addToast } = useToast();
  const [isConverting, setIsConverting] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 20
  });

  const handleConvert = async () => {
    const readyFiles = files.filter(f => f.status === 'ready');
    if (readyFiles.length === 0) {
      addToast('error', 'Select images', 'Please upload at least 1 image file.');
      return;
    }

    setIsConverting(true);
    try {
      const response = await convertImagesToPdfWorker(readyFiles.map(f => f.file), options);
      
      const blob = new Blob([response.data as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted-images.pdf';
      a.click();
      
      // Cleanup Object URL to release browser memory
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      addToast('success', 'Conversion Complete', 'Your new PDF has been downloaded.');
      clearFiles();
      
      // Explicitly recycle the worker after a heavy operation
      import('../../services/workerClient').then(module => module.recycleWorker());
    } catch (err: any) {
      addToast('error', 'Conversion Failed', err.message);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div style={{ marginTop: '24px', textAlign: 'center', maxWidth: '400px', margin: '24px auto 0' }}>
      <div style={{ marginBottom: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Page Size</label>
          <select 
            value={options.pageSize} 
            onChange={(e) => setOptions({...options, pageSize: e.target.value as any})}
            style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
          >
            <option value="A4">A4</option>
            <option value="Letter">Letter</option>
            <option value="Fit">Fit to Image</option>
          </select>
        </div>
        
        {options.pageSize !== 'Fit' && (
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Orientation</label>
            <select 
              value={options.orientation} 
              onChange={(e) => setOptions({...options, orientation: e.target.value as any})}
              style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        )}
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Margin (pixels)</label>
          <input 
            type="number" 
            value={options.margin} 
            onChange={(e) => setOptions({...options, margin: Number(e.target.value)})} 
            style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
          />
        </div>
      </div>
      
      <button 
        className="btn btn-primary" 
        onClick={handleConvert} 
        disabled={isConverting || files.filter(f => f.status === 'ready').length === 0}
        style={{ width: '100%', marginTop: '12px' }}
      >
        {isConverting ? 'Converting...' : 'Convert to PDF'}
      </button>
    </div>
  );
};
