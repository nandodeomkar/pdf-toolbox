import PdfWorker from './pdfWorker?worker';
import { WorkerMessage, WorkerResponse } from './pdfWorker';
import { ConversionOptions } from './conversionService';

// Singleton instance of the worker
let worker: Worker | null = null;

const getWorker = (): Worker => {
  if (!worker) {
    worker = new PdfWorker();
  }
  return worker;
};

/**
 * Terminates the current worker to release memory and clears the singleton reference.
 * A new worker will be lazily created on the next request.
 */
export const recycleWorker = (): void => {
  if (worker) {
    worker.terminate();
    worker = null;
  }
};

/**
 * Requests the Web Worker to render a thumbnail for the given PDF file.
 */
export const renderThumbnail = (file: File, id: string): Promise<{ url: string; pageCount: number }> => {
  return new Promise((resolve, reject) => {
    const w = getWorker();

    const handleMessage = (e: MessageEvent<WorkerResponse>) => {
      const response = e.data;
      if (response.type === 'THUMBNAIL_SUCCESS' && response.payload.id === id) {
        w.removeEventListener('message', handleMessage);
        resolve({ url: response.payload.url, pageCount: response.payload.pageCount });
      } else if (response.type === 'THUMBNAIL_ERROR' && response.payload.id === id) {
        w.removeEventListener('message', handleMessage);
        reject(new Error(response.payload.error));
      }
    };

    w.addEventListener('message', handleMessage);

    w.postMessage({
      type: 'RENDER_THUMBNAIL',
      payload: { file, id }
    } as WorkerMessage);
  });
};

export const renderAllThumbnails = (file: File, id: string): Promise<{ urls: string[]; pageCount: number }> => {
  return new Promise((resolve, reject) => {
    const w = getWorker();

    const handleMessage = (e: MessageEvent<WorkerResponse>) => {
      const response = e.data;
      if (response.type === 'ALL_THUMBNAILS_SUCCESS' && response.payload.id === id) {
        w.removeEventListener('message', handleMessage);
        resolve({ urls: response.payload.urls, pageCount: response.payload.pageCount });
      } else if (response.type === 'THUMBNAIL_ERROR' && response.payload.id === id) {
        w.removeEventListener('message', handleMessage);
        reject(new Error(response.payload.error));
      }
    };

    w.addEventListener('message', handleMessage);

    w.postMessage({
      type: 'RENDER_ALL_THUMBNAILS',
      payload: { file, id }
    } as WorkerMessage);
  });
};

/**
 * Generic helper for manipulation commands.
 */
const sendManipulationCommand = (
  type: WorkerMessage['type'],
  payload: any
): Promise<{ data: Uint8Array; resultType: 'pdf' | 'zip' }> => {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    const id = payload.id;

    const handleMessage = (e: MessageEvent<WorkerResponse>) => {
      const response = e.data;
      if (response.type === 'MANIPULATION_SUCCESS' && response.payload.id === id) {
        w.removeEventListener('message', handleMessage);
        resolve({ data: response.payload.data, resultType: response.payload.resultType });
      } else if (response.type === 'MANIPULATION_ERROR' && response.payload.id === id) {
        w.removeEventListener('message', handleMessage);
        reject(new Error(response.payload.error));
      }
    };

    w.addEventListener('message', handleMessage);
    w.postMessage({ type, payload } as unknown as WorkerMessage);
  });
};

export const mergePdfsWorker = (files: File[]): Promise<{ data: Uint8Array; resultType: 'pdf' | 'zip' }> => {
  return sendManipulationCommand('MERGE_PDFS', { files, id: crypto.randomUUID() });
};

export const burstPdfWorker = (file: File): Promise<{ data: Uint8Array; resultType: 'pdf' | 'zip' }> => {
  return sendManipulationCommand('BURST_PDF', { file, id: crypto.randomUUID() });
};

export const splitPdfWorker = (file: File, ranges: string): Promise<{ data: Uint8Array; resultType: 'pdf' | 'zip' }> => {
  return sendManipulationCommand('SPLIT_PDF', { file, ranges, id: crypto.randomUUID() });
};

export const manipulatePagesWorker = (file: File, operations: any[]): Promise<{ data: Uint8Array; resultType: 'pdf' | 'zip' }> => {
  return sendManipulationCommand('MANIPULATE_PAGES', { file, operations, id: crypto.randomUUID() });
};

export const compressPdfWorker = (file: File, quality: 'high' | 'medium' | 'low'): Promise<{ data: Uint8Array; resultType: 'pdf' | 'zip' }> => {
  return sendManipulationCommand('COMPRESS_PDF', { file, quality, id: crypto.randomUUID() });
};

export const convertImagesToPdfWorker = (files: File[], options: ConversionOptions): Promise<{ data: Uint8Array; resultType: 'pdf' | 'zip' }> => {
  return sendManipulationCommand('CONVERT_IMAGES', { files, options, id: crypto.randomUUID() });
};

