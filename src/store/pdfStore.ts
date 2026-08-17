import { create } from 'zustand';
import { UploadedFileItem } from '../types';

interface PdfStoreState {
  files: UploadedFileItem[];
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, updates: Partial<UploadedFileItem>) => void;
  reorderFiles: (startIndex: number, endIndex: number) => void;
  clearFiles: () => void;
}

export const usePdfStore = create<PdfStoreState>((set) => ({
  files: [],

  addFiles: (newFiles: File[]) => {
    set((state) => {
      const newItems: UploadedFileItem[] = newFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
      }));
      return { files: [...state.files, ...newItems] };
    });
  },

  removeFile: (id: string) => {
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    }));
  },

  updateFile: (id: string, updates: Partial<UploadedFileItem>) => {
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  },

  reorderFiles: (startIndex: number, endIndex: number) => {
    set((state) => {
      const result = Array.from(state.files);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { files: result };
    });
  },

  clearFiles: () => {
    set({ files: [] });
  },
}));
