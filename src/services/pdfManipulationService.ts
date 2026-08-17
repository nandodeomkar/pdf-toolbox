import { PDFDocument, degrees } from 'pdf-lib';
import JSZip from 'jszip';

/**
 * Merges multiple PDF files into a single PDF document.
 */
export const mergePdfs = async (files: File[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
};

/**
 * Bursts a single PDF into individual single-page PDFs and zips them.
 */
export const burstPdf = async (file: File): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pageIndices = pdf.getPageIndices();
  
  const zip = new JSZip();

  for (let i = 0; i < pageIndices.length; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(copiedPage);
    const pdfBytes = await newPdf.save();
    
    // Add to zip, e.g., page-1.pdf
    zip.file(`page-${i + 1}.pdf`, pdfBytes);
  }

  return zip.generateAsync({ type: 'uint8array' });
};

/**
 * Splits a PDF based on custom string ranges (e.g., "1-3, 5, 7-9").
 * If multiple files are generated, they are zipped.
 */
export const splitPdf = async (file: File, rangesStr: string): Promise<{ data: Uint8Array, type: 'pdf' | 'zip' }> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const totalPages = pdf.getPageCount();

  const parseRanges = (str: string) => {
    const segments = str.split(',').map(s => s.trim());
    const extractedDocs: number[][] = [];
    
    for (const segment of segments) {
      if (segment.includes('-')) {
        const [start, end] = segment.split('-').map(Number);
        if (start > 0 && end <= totalPages && start <= end) {
          const range: number[] = [];
          for (let i = start; i <= end; i++) range.push(i - 1); // 0-indexed
          extractedDocs.push(range);
        }
      } else {
        const page = Number(segment);
        if (page > 0 && page <= totalPages) {
          extractedDocs.push([page - 1]);
        }
      }
    }
    return extractedDocs;
  };

  const docRanges = parseRanges(rangesStr);
  
  if (docRanges.length === 0) {
    throw new Error('Invalid or empty page ranges provided.');
  }

  if (docRanges.length === 1) {
    // Single output document, no zip needed
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdf, docRanges[0]);
    copiedPages.forEach(p => newPdf.addPage(p));
    return { data: await newPdf.save(), type: 'pdf' };
  }

  // Multiple output documents, wrap in a zip
  const zip = new JSZip();
  for (let i = 0; i < docRanges.length; i++) {
    const range = docRanges[i];
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdf, range);
    copiedPages.forEach(p => newPdf.addPage(p));
    
    zip.file(`split-${i + 1}.pdf`, await newPdf.save());
  }

  return { data: await zip.generateAsync({ type: 'uint8array' }), type: 'zip' };
};

export type PageOperation = 
  | { type: 'rotate'; pageIndex: number; degrees: number }
  | { type: 'delete'; pageIndex: number }
  | { type: 'duplicate'; pageIndex: number }
  | { type: 'insertBlank'; pageIndex: number }
  | { type: 'reorder'; newOrder: number[] }; // newOrder contains the sequence of old page indices

/**
 * Manipulates pages (Rotate, Delete, Duplicate, Reorder).
 */
export const manipulatePages = async (file: File, operations: PageOperation[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  // Reorder is a special operation that reconstructs the document
  const reorderOp = operations.find(o => o.type === 'reorder') as { type: 'reorder', newOrder: number[] } | undefined;
  
  let workingPdf = pdf;

  if (reorderOp) {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdf, reorderOp.newOrder);
    copiedPages.forEach(p => newPdf.addPage(p));
    workingPdf = newPdf;
  }

  // Apply other operations (mutations)
  // Note: if reorder was applied, pageIndices now map to the *new* document structure.
  // The UI needs to send operations relative to the final desired state or we process in order.
  // For simplicity, we apply them in sequence.

  for (const op of operations) {
    if (op.type === 'rotate') {
      const page = workingPdf.getPage(op.pageIndex);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + op.degrees));
    } else if (op.type === 'delete') {
      workingPdf.removePage(op.pageIndex);
    } else if (op.type === 'duplicate') {
      const [copiedPage] = await workingPdf.copyPages(workingPdf, [op.pageIndex]);
      workingPdf.insertPage(op.pageIndex + 1, copiedPage);
    } else if (op.type === 'insertBlank') {
      const width = workingPdf.getPage(0)?.getWidth() || 595.28; // A4 default
      const height = workingPdf.getPage(0)?.getHeight() || 841.89; // A4 default
      workingPdf.insertPage(op.pageIndex, [width, height]);
    }
  }

  return workingPdf.save();
};
