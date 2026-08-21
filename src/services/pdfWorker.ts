import * as pdfjsLib from 'pdfjs-dist';

// Bundle the pdf.js engine directly into this worker chunk rather than fetching
// it at runtime. `pdf.worker.mjs` assigns `globalThis.pdfjsWorker` at module
// scope, and both `PDFWorker._initialize()` and `_setupFakeWorkerGlobal`
// short-circuit on `globalThis.pdfjsWorker?.WorkerMessageHandler` *before* they
// read `GlobalWorkerOptions.workerSrc`. So the throwing `workerSrc` getter is
// never reached, no dynamic `import()` is issued, and no separate
// `dist/assets/pdf.worker-*.mjs` asset is emitted — which keeps the engine
// inside the precached chunk and makes offline rendering work.
//
// Do NOT reintroduce a `GlobalWorkerOptions.workerSrc` assignment here: the
// runtime URL it produced was the source of the "No GlobalWorkerOptions.
// workerSrc specified" render failures, and it left the engine un-precached.
import 'pdfjs-dist/build/pdf.worker.mjs';

import { mergePdfs, burstPdf, splitPdf, manipulatePages, PageOperation } from './pdfManipulationService';
import { compressPdf } from './compressService';
import { convertImagesToPdf, ConversionOptions } from './conversionService';

// pdf.js's getDocument() picks its CanvasFactory/FontLoader/FilterFactory
// defaults based on `isNodeJS` alone: anything that isn't Node is assumed to
// have a `document` (i.e. to be the browser main thread). That's false for a
// Web Worker. Three DOM dependencies that only surface for PDFs exercising
// the relevant features would otherwise throw "Cannot read properties of
// undefined (reading 'createElement')" (or '.fonts') deep inside rendering:
//
//  - DOMCanvasFactory creates *internal scratch* canvases (for tiling
//    patterns, transparency groups, soft-mask groups, Type3 glyph caches) via
//    `document.createElement('canvas')`. This is separate from the top-level
//    canvasContext we pass to page.render() below, and simple PDFs (plain
//    text/images) never need a scratch canvas — which is why those render
//    fine while a document using any of the above doesn't. We supply an
//    OffscreenCanvas-backed factory matching pdf.js's expected
//    {create, reset, destroy} shape instead.
//  - FontLoader.addNativeFontFace/insertRule touches `document.fonts` /
//    `document.createElement('style')` for embedded fonts loaded via the
//    native Font Loading API. `disableFontFace: true` makes pdf.js render
//    glyphs via canvas path-fill instead — the standard headless/worker mode.
//  - DOMFilterFactory (soft-mask / blend-mode / high-contrast-mode canvas
//    compositing) injects an off-screen <svg><defs> into `document.body`.
//
// None of DOMCanvasFactory/DOMFilterFactory/NodeCanvasFactory/NodeFilterFactory
// are exported from pdfjs-dist's public API, so we implement the two factories
// ourselves rather than subclassing pdf.js's internal (unexported) base classes.
// Where pdf.js fetches its standard-14 font data (Helvetica/Times/Courier/...).
//
// `disableFontFace: true` above is mandatory in a worker — the native Font
// Loading API needs `document.fonts`, which doesn't exist here — and it makes
// pdf.js render glyphs by path-filling instead. Path-filling needs this font
// data for any PDF that doesn't embed its fonts, i.e. most simple and
// generated PDFs. Omit it and pdf.js drops every glyph, rendering pages with
// no text at all while warning only at `info` level:
//   Warning: UnknownErrorException: Ensure that the `standardFontDataUrl` API
//   parameter is provided.
//
// These are same-origin assets served by the pdfjsStandardFonts plugin in
// vite.config.ts and precached by the service worker, so this stays a
// zero-upload, fully offline-capable path. `self.location.origin` makes the
// URL absolute: pdf.js resolves it internally rather than against this chunk's
// own location under /assets/.
const STANDARD_FONT_DATA_URL = new URL(
  `${import.meta.env.BASE_URL}standard_fonts/`,
  self.location.origin
).href;

class OffscreenCanvasFactory {
  create(width: number, height: number) {
    if (width <= 0 || height <= 0) {
      throw new Error('Invalid canvas size');
    }
    const canvas = new OffscreenCanvas(width, height);
    return { canvas, context: canvas.getContext('2d') };
  }
  reset(canvasAndContext: { canvas: OffscreenCanvas | null }, width: number, height: number): void {
    if (!canvasAndContext.canvas) throw new Error('Canvas is not specified');
    if (width <= 0 || height <= 0) throw new Error('Invalid canvas size');
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext: { canvas: OffscreenCanvas | null; context: unknown }): void {
    if (!canvasAndContext.canvas) throw new Error('Canvas is not specified');
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

class NoDomFilterFactory {
  addFilter(): string { return 'none'; }
  addHCMFilter(): string { return 'none'; }
  addAlphaFilter(): string { return 'none'; }
  addLuminosityFilter(): string { return 'none'; }
  addHighlightHCMFilter(): string { return 'none'; }
  destroy(): void {}
}

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
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        disableFontFace: true,
        standardFontDataUrl: STANDARD_FONT_DATA_URL,
        // Must be explicit. pdf.js only auto-enables worker-side fetching when
        // `isValidFetchUrl(cMapUrl, document.baseURI)` passes -- a main-thread
        // assumption twice over: there is no `document` here, and we pass no
        // cMapUrl, so the check short-circuits falsy before it can throw. Left
        // to default, pdf.js routes font loading through the main-thread
        // StandardFontDataFactory instead, which never delivers the bytes and
        // reports nothing: `font.data` stays null, the worker skips
        // buildFontPaths entirely, and every glyph is dropped with only an
        // `info`-level getPathGenerator warning. Setting this true makes the
        // worker fetch the data itself with a plain `fetch`.
        useWorkerFetch: true,
        CanvasFactory: OffscreenCanvasFactory,
        FilterFactory: NoDomFilterFactory
      });
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

