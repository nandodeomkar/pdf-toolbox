export type ToolCategory = 'all' | 'organize' | 'optimize' | 'convert' | 'security' | 'edit';

export interface ToolDefinition {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: ToolCategory;
  iconName: string;
  tags: string[];
  isPopular?: boolean;
  isNew?: boolean;
  status: 'ready' | 'beta' | 'coming-soon';
  acceptedFileTypes: string[]; // e.g. ['.pdf'] or ['.jpg', '.jpeg', '.png', '.webp']
  allowMultiple: boolean;
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  pageCount?: number;
  previewUrl?: string;
  thumbnailUrls?: string[];
  status?: 'pending' | 'processing' | 'ready' | 'error';
  errorMessage?: string;
}

export type ThemeMode = 'dark' | 'light' | 'system';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
