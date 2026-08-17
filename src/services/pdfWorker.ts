import * as pdfjsLib from 'pdfjs-dist';

// Configure the pdf.js worker. Using `new URL(..., import.meta.url)` lets Vite
// resolve and bundle the worker file correctly at build time.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();
import { mergePdfs, burstPdf, splitPdf, manipulatePages, PageOperation } from './pdfManipulationService';
import { compressPdf } from './compressService';
import { convertImagesToPdf, ConversionOptions } from './conversionService';

export type WorkerMessage =
  | { type: 'RENDER_THUMBNAIL'; payload: { file: File; id: string } }
  | { type: 'RENDER_ALL_THUMBNAILS'; payload: { file: File; id: string } }
  | { type: 'MERGE_PDFS'; payload: { files: File[]; id: string } }
  | { type: 'BURST_PDF'; payload: { file: File; id: string } }
  | { type: 'SPLIT_PDF'; payload: { file: File; ranges: string; id: string } }
  | { type: 'MANIPULATE_PAGES'; payload: { file: File; operations: PageOperation[]; id: string } }
  | { type: 'COMPRESS_PDF'; payload: { file: File; quality: 'high' | 'medium' | 'low'; id: string } }
  | { type: 'CONVERT_IMAGES'; payload: { files: File[]; options: ConversionOptions; id: string } };

export type WorkerResponse =
  | { type: 'THUMBNAIL_SUCCESS'; payload: { id: string; url: string; pageCount: number } }
  | { type: 'ALL_THUMBNAILS_SUCCESS'; payload: { id: string; urls: string[]; pageCount: number } }
  | { type: 'THUMBNAIL_ERROR'; payload: { id: string; error: string } }
  | { type: 'MANIPULATION_SUCCESS'; payload: { id: string; data: Uint8Array; resultType: 'pdf' | 'zip' } }
  | { type: 'MANIPULATION_ERROR'; payload: { id: string; error: string } };

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;

  if (type === 'RENDER_THUMBNAIL' || type === 'RENDER_ALL_THUMBNAILS') {
    try {
      const { file, id } = payload;
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const pageCount = pdf.numPages;

      if (typeof OffscreenCanvas === 'undefined') {
        throw new Error('OffscreenCanvas is not supported in this environment');
      }

      if (type === 'RENDER_THUMBNAIL') {
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = new OffscreenCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not create 2d context');

        await page.render({ canvasContext: context as any, viewport }).promise;
        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
        const url = URL.createObjectURL(blob);

        self.postMessage({
          type: 'THUMBNAIL_SUCCESS',
          payload: { id, url, pageCount }
        } as WorkerResponse);
      } else {
        // RENDER_ALL_THUMBNAILS
        const urls: string[] = [];
        for (let i = 1; i <= pageCount; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.0 }); // Lower scale for multiple thumbs
          const canvas = new OffscreenCanvas(viewport.width, viewport.height);
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Could not create 2d context');

          await page.render({ canvasContext: context as any, viewport }).promise;
          const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
          urls.push(URL.createObjectURL(blob));
        }

        self.postMessage({
          type: 'ALL_THUMBNAILS_SUCCESS',
          payload: { id, urls, pageCount }
        } as WorkerResponse);
      }

    } catch (error: any) {
      self.postMessage({
        type: 'THUMBNAIL_ERROR',
        payload: { id: payload.id, error: error.message || 'Failed to render thumbnail' }
      } as WorkerResponse);
    }
  } else {
    // Handle Manipulation commands
    try {
      let data: Uint8Array;
      let resultType: 'pdf' | 'zip' = 'pdf';

      if (type === 'MERGE_PDFS') {
        data = await mergePdfs(payload.files);
      } else if (type === 'BURST_PDF') {
        data = await burstPdf(payload.file);
        resultType = 'zip';
      } else if (type === 'SPLIT_PDF') {
        const res = await splitPdf(payload.file, payload.ranges);
        data = res.data;
        resultType = res.type;
      } else if (type === 'MANIPULATE_PAGES') {
        data = await manipulatePages(payload.file, payload.operations);
      } else if (type === 'COMPRESS_PDF') {
        data = await compressPdf(payload.file, payload.quality);
      } else if (type === 'CONVERT_IMAGES') {
        data = await convertImagesToPdf(payload.files, payload.options);
      } else {
        throw new Error('Unknown command');
      }

      self.postMessage({
        type: 'MANIPULATION_SUCCESS',
        payload: { id: payload.id, data, resultType }
      } as WorkerResponse);
    } catch (error: any) {
      self.postMessage({
        type: 'MANIPULATION_ERROR',
        payload: { id: payload.id, error: error.message || 'Manipulation failed' }
      } as WorkerResponse);
    }
  }
};

