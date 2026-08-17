import React, { useEffect } from 'react';
import { FileDropzone } from '../common/FileDropzone';
import { usePdfStore } from '../../store/pdfStore';
import { renderThumbnail, recycleWorker } from '../../services/workerClient';
import { useToast } from '../../context/ToastContext';
import { ToolDefinition } from '../../types';

import { MergeWorkspace } from './MergeWorkspace';
import { SplitWorkspace } from './SplitWorkspace';
import { OrganizerWorkspace } from './OrganizerWorkspace';
import { CompressWorkspace } from './CompressWorkspace';
import { ConverterWorkspace } from './ConverterWorkspace';

interface ToolWorkspaceProps {
  tool: ToolDefinition;
}

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({ tool }) => {
  const { files, addFiles, updateFile, clearFiles } = usePdfStore();
  const { addToast } = useToast();

  useEffect(() => {
    // Clear files and recycle worker to free memory when switching tools
    return () => {
      clearFiles();
      recycleWorker();
    };
  }, [tool.id, clearFiles]);

  const handleFilesSelected = async (newFiles: File[]) => {
    addFiles(newFiles);
  };

  // Effect to process pending files
  useEffect(() => {
    files.forEach((fileItem) => {
      if (fileItem.status === 'pending') {
        // Mark as processing immediately to prevent duplicate runs
        updateFile(fileItem.id, { status: 'processing' });

        renderThumbnail(fileItem.file, fileItem.id)
          .then((res) => {
            updateFile(fileItem.id, {
              status: 'ready',
              thumbnailUrls: [res.url],
              pageCount: res.pageCount
            });
          })
          .catch((err) => {
            updateFile(fileItem.id, {
              status: 'error',
              errorMessage: err.message
            });
            addToast('error', 'Render Failed', `Failed to render ${fileItem.name}: ${err.message}`);
          });
      }
    });
  }, [files, updateFile, addToast]);

  const renderSpecificWorkspace = () => {
    switch (tool.id) {
      case 'merge': return <MergeWorkspace />;
      case 'split': return <SplitWorkspace />;
      case 'organize': return <OrganizerWorkspace />;
      case 'compress': return <CompressWorkspace />;
      case 'images-to-pdf': return <ConverterWorkspace />;
      default: return null;
    }
  };

  return (
    <div className="tool-workspace-content" style={{ padding: '24px 0' }}>
      {/* Hide dropzone if organizer is active and files exist, as organizer renders its own grid */}
      {!(tool.id === 'organize' && files.length > 0) && (
        <FileDropzone
          onFilesSelected={handleFilesSelected}
          acceptedFileTypes={tool.acceptedFileTypes}
          allowMultiple={tool.allowMultiple}
          title={`Upload files for ${tool.title}`}
        />
      )}

      {files.length > 0 && tool.id !== 'organize' && (
        <div style={{ marginTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {files.map((file) => (
            <div 
              key={file.id} 
              style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-subtle)', 
                padding: '16px', 
                borderRadius: 'var(--radius-lg)',
                width: '180px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {file.status === 'pending' || file.status === 'processing' ? (
                <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="spinner">Rendering...</div>
                </div>
              ) : file.status === 'ready' && file.thumbnailUrls ? (
                <img 
                  src={file.thumbnailUrls[0]} 
                  alt={file.name} 
                  style={{ width: '100%', height: '120px', objectFit: 'contain', marginBottom: '12px' }} 
                />
              ) : (
                <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)' }}>
                  Error
                </div>
              )}
              <div style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </div>
              {file.pageCount && (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {file.pageCount} pages
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {renderSpecificWorkspace()}
    </div>
  );
};

