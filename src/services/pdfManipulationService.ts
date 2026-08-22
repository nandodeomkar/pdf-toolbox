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

/**
 * One page of the document the user is assembling.
 *
 * `sourceIndex` always refers to a page of the ORIGINAL upload and never
 * changes as the layout is edited. That is what makes this safe.
 *
 * This replaced a `PageOperation[]` mutation log whose indices were captured at
 * click time and replayed here. Replaying against a document that shrinks as
 * deletes are applied silently produced the wrong document: deleting the pages
 * shown as 1 and 2 of a 5-page file removed originals 1 and 3, kept 2, emitted
 * the right page COUNT, and reported success -- so there was no signal to the
 * user that anything was wrong. A layout is a description of the finished
 * document rather than a recipe to replay, so no index can go stale.
 */
export type PageSlot =
  | { kind: 'page'; sourceIndex: number; rotation: number }
  | { kind: 'blank'; rotation: number };

/** pdf-lib only accepts quarter turns, and rejects negatives. */
const normalizeQuarterTurn = (angle: number): number => {
  const snapped = Math.round(angle / 90) * 90;
  return ((snapped % 360) + 360) % 360;
};

/**
 * Rebuilds `file` as the exact sequence of pages described by `slots`.
 */
export const applyPageLayout = async (file: File, slots: PageSlot[]): Promise<Uint8Array> => {
  if (slots.length === 0) {
    throw new Error('A PDF needs at least one page. Restore a page before saving.');
  }

  const source = await PDFDocument.load(await file.arrayBuffer());
  const sourceCount = source.getPageCount();
  if (sourceCount === 0) {
    throw new Error('This PDF has no pages to organize.');
  }

  const hasBadRef = slots.some(
    (slot) =>
      slot.kind === 'page' &&
      (!Number.isInteger(slot.sourceIndex) || slot.sourceIndex < 0 || slot.sourceIndex >= sourceCount)
  );
  if (hasBadRef) {
    throw new Error('This page layout refers to a page that is not in the document.');
  }

  const output = await PDFDocument.create();

  // Every referenced page is copied in a single call, in slot order. Repeating
  // an index yields independent copies, which is what makes duplicate work
  // without mutating the source document.
  const copied = await output.copyPages(
    source,
    slots.flatMap((slot) => (slot.kind === 'page' ? [slot.sourceIndex] : []))
  );

  // Blank pages take the first source page's dimensions so they don't appear
  // as an odd size in the middle of the document.
  const blankSize: [number, number] = [source.getPage(0).getWidth(), source.getPage(0).getHeight()];

  let nextCopy = 0;
  for (const slot of slots) {
    const page = slot.kind === 'page' ? output.addPage(copied[nextCopy++]) : output.addPage(blankSize);
    // Rotation is relative to whatever the source page already carried.
    page.setRotation(degrees(normalizeQuarterTurn(page.getRotation().angle + slot.rotation)));
  }

  return output.save();
};
