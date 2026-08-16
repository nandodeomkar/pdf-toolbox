import React, { useRef, useState, useEffect, DragEvent, ChangeEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string[];
  allowMultiple?: boolean;
  maxFileSizeMB?: number;
  title?: string;
  subtitle?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesSelected,
  acceptedFileTypes = ['.pdf', 'application/pdf'],
  allowMultiple = true,
  maxFileSizeMB = 200,
  title,
  subtitle
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const validateAndPassFiles = (filesList: FileList | File[]) => {
    const rawFiles = Array.from(filesList);
    if (rawFiles.length === 0) return;

    const validFiles: File[] = [];

    for (const file of rawFiles) {
      // Size check
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSizeMB) {
        addToast(
          'warning',
          'File Too Large',
          `"${file.name}" (${fileSizeMB.toFixed(1)} MB) exceeds the ${maxFileSizeMB} MB safety limit.`
        );
        continue;
      }

      // Extension / Type check
      const fileNameLower = file.name.toLowerCase();
      const isAccepted = acceptedFileTypes.some((type) => {
        if (type.startsWith('.')) {
          return fileNameLower.endsWith(type.toLowerCase());
        }
        if (type.includes('*')) {
          const prefix = type.split('*')[0];
          return file.type.startsWith(prefix);
        }
        return file.type === type;
      });

      if (!isAccepted) {
        addToast(
          'error',
          'Unsupported Format',
          `"${file.name}" is not a supported format (${acceptedFileTypes.join(', ')}).`
        );
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    if (!allowMultiple && validFiles.length > 1) {
      addToast('info', 'Single File Only', 'Only the first valid file was loaded.');
      onFilesSelected([validFiles[0]]);
    } else {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFiles(e.target.files);
      // Reset input value so re-uploading the same file triggers change
      e.target.value = '';
    }
  };

  // Clipboard paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        validateAndPassFiles(e.clipboardData.files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [acceptedFileTypes, allowMultiple, maxFileSizeMB]);

  return (
    <div
      className={`dropzone-container ${isDragOver ? 'is-dragover' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload files by dragging or clicking"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={allowMultiple}
        accept={acceptedFileTypes.join(',')}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      <div className="dropzone-icon-circle">
        <UploadCloud size={30} />
      </div>

      <h3 className="dropzone-title">
        {title || (allowMultiple ? 'Choose PDF or image files' : 'Choose a PDF file')}
      </h3>
      <p className="dropzone-subtitle">
        {subtitle || 'Drag & drop files here, or click to browse from your computer'}
      </p>

      <div className="dropzone-limits">
        <span>Formats: {acceptedFileTypes.join(', ')}</span>
        <span>•</span>
        <span>Max: {maxFileSizeMB} MB</span>
        <span>•</span>
        <span>Ctrl+V to paste</span>
      </div>
    </div>
  );
};
