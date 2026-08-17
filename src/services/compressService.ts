import { PDFDocument } from 'pdf-lib';

/**
 * Basic client-side PDF compression heuristics.
 * `pdf-lib` does not natively support deep compression like ghostscript, 
 * but we can strip unneeded objects and save with `useObjectStreams` to save some space.
 */
export const compressPdf = async (file: File, quality: 'high' | 'medium' | 'low'): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  // Using ignoreEncryption to bypass encrypted files (we can't compress those easily anyway)
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  
  // For now, quality just acts as a placeholder or we can toggle useObjectStreams based on it.
  const useObjectStreams = quality !== 'high'; // 'high' means less compression
  const pdfBytes = await pdf.save({ useObjectStreams });
  
  return pdfBytes;
};
