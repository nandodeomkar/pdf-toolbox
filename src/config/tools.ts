import { ToolDefinition } from '../types';

export const TOOLS: ToolDefinition[] = [
  {
    id: 'merge',
    title: 'Merge PDF',
    shortDescription: 'Combine multiple PDFs into a single document in any order.',
    fullDescription: 'Merge two or more PDF files into a single unified document. Drag and drop to reorder files easily before merging.',
    category: 'organize',
    iconName: 'Layers',
    tags: ['combine', 'join', 'merge', 'organize'],
    isPopular: true,
    status: 'ready',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    allowMultiple: true
  },
  {
    id: 'split',
    title: 'Split & Extract PDF',
    shortDescription: 'Split a PDF by custom page ranges, intervals, or burst all pages.',
    fullDescription: 'Extract specific page ranges (e.g. 1-3, 5), split into fixed page chunks, or burst every page into individual PDFs.',
    category: 'organize',
    iconName: 'Scissors',
    tags: ['split', 'extract', 'burst', 'separate', 'pages'],
    isPopular: true,
    status: 'ready',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    allowMultiple: false
  },
  {
    id: 'organize',
    title: 'Organize & Rotate Pages',
    shortDescription: 'Visually reorder, rotate, delete, or duplicate pages.',
    fullDescription: 'Interactive visual grid of all pages in your document. Rearrange with drag-and-drop, rotate 90°, delete, or add blank pages.',
    category: 'organize',
    iconName: 'LayoutGrid',
    tags: ['reorder', 'rotate', 'delete', 'duplicate', 'pages'],
    isPopular: true,
    status: 'ready',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    allowMultiple: false
  },
  {
    id: 'compress',
    title: 'Compress PDF',
    shortDescription: 'Reduce PDF file size while optimizing visual clarity.',
    fullDescription: 'Reduce the file size of your PDF files using client-side image and stream optimization. Choose from multiple quality presets.',
    category: 'optimize',
    iconName: 'Minimize2',
    tags: ['shrink', 'reduce', 'compress', 'optimize', 'size'],
    isPopular: true,
    status: 'ready',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    allowMultiple: false
  },
  {
    id: 'images-to-pdf',
    title: 'Images to PDF',
    shortDescription: 'Convert JPG, PNG, and WebP images into a styled PDF.',
    fullDescription: 'Convert multiple images (PNG, JPG, WebP) into a single PDF document with custom page sizes, orientations, and margins.',
    category: 'convert',
    iconName: 'Image',
    tags: ['jpg to pdf', 'png to pdf', 'images', 'convert', 'photos'],
    isPopular: true,
    status: 'ready',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp', '.gif', 'image/*'],
    allowMultiple: true
  },
  {
    id: 'pdf-to-images',
    title: 'PDF to Images',
    shortDescription: 'Convert PDF pages into high-resolution PNG or JPG images.',
    fullDescription: 'Export all pages or selected pages of a PDF document as high-resolution images bundled in a ZIP archive.',
    category: 'convert',
    iconName: 'FileImage',
    tags: ['pdf to png', 'pdf to jpg', 'export', 'render'],
    status: 'ready',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    allowMultiple: false
  },
  {
    id: 'pdf-to-text',
    title: 'PDF to Text',
    shortDescription: 'Extract text content from any PDF document instantly.',
    fullDescription: 'Extract all readable text from your PDF document locally and download as a formatted plain text (.txt) file.',
    category: 'convert',
    iconName: 'FileText',
    tags: ['extract text', 'text', 'txt', 'convert'],
    status: 'ready',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    allowMultiple: false
  },
  {
    id: 'protect',
    title: 'Protect PDF',
    shortDescription: 'Encrypt your PDF with a secure password.',
    fullDescription: 'Add strong password encryption to your PDF document to prevent unauthorized opening or viewing.',
    category: 'security',
    iconName: 'Lock',
    tags: ['encrypt', 'password', 'security', 'protect'],
    status: 'ready',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    allowMultiple: false
  },
  {
    id: 'watermark',
    title: 'Watermark PDF',
    shortDescription: 'Add custom text or image watermarks to your document.',
    fullDescription: 'Stamp customized text or image watermarks across your PDF pages with adjustable opacity, angle, and position.',
    category: 'edit',
    iconName: 'Stamp',
    tags: ['watermark', 'stamp', 'branding', 'copyright'],
    status: 'ready',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    allowMultiple: false
  },
  {
    id: 'page-numbers',
    title: 'Page Numbers',
    shortDescription: 'Add headers, footers, and page numbers with custom formats.',
    fullDescription: 'Number your PDF pages with custom formatting (e.g. Page X of Y), placement (top/bottom, left/center/right), and font styling.',
    category: 'edit',
    iconName: 'Hash',
    tags: ['numbering', 'footer', 'header', 'page numbers'],
    status: 'ready',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    allowMultiple: false
  }
];

export const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Tools' },
  { id: 'organize', label: 'Organize' },
  { id: 'optimize', label: 'Optimize' },
  { id: 'convert', label: 'Convert' },
  { id: 'security', label: 'Security' },
  { id: 'edit', label: 'Edit & Stamp' }
];
