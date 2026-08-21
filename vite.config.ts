import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const STANDARD_FONTS_PREFIX = 'standard_fonts/';

/**
 * Serves pdf.js's standard-14 font data (Helvetica/Times/Courier/Symbol/...)
 * as static assets under `<base>standard_fonts/`.
 *
 * The worker sets `disableFontFace: true` (it has no `document`, so the native
 * Font Loading API is unavailable there — see src/services/pdfWorker.ts), which
 * makes pdf.js path-fill glyphs instead. Path-filling needs this font data for
 * any PDF that doesn't embed its fonts, which is most simple/generated PDFs.
 * Without it pdf.js silently drops every glyph and renders pages with no text,
 * warning only at `info` level.
 *
 * The files are copied out of node_modules rather than vendored into public/ so
 * they can't drift from the installed pdfjs-dist version; an engine/font-data
 * mismatch would be another silent rendering bug. Both modes are covered:
 * `configureServer` serves them in dev (nothing is written to disk there),
 * `generateBundle` emits them into dist/ for the production build.
 */
function pdfjsStandardFonts(): Plugin {
  const fontsDir = path.join(
    path.dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json')),
    'standard_fonts'
  );

  return {
    name: 'pdfjs-standard-fonts',

    configureServer(server) {
      const base = server.config.base;
      server.middlewares.use((req, res, next) => {
        const pathname = decodeURIComponent((req.url || '').split('?')[0]);
        const rel = pathname.startsWith(base)
          ? pathname.slice(base.length)
          : pathname.replace(/^\//, '');
        if (!rel.startsWith(STANDARD_FONTS_PREFIX)) return next();

        // basename() keeps a crafted request from escaping the fonts directory.
        const name = path.basename(rel);
        const file = path.join(fontsDir, name);
        if (!fs.existsSync(file)) return next();

        res.setHeader('Content-Type', 'application/octet-stream');
        res.end(fs.readFileSync(file));
      });
    },

    generateBundle() {
      for (const name of fs.readdirSync(fontsDir)) {
        this.emitFile({
          type: 'asset',
          fileName: STANDARD_FONTS_PREFIX + name,
          source: fs.readFileSync(path.join(fontsDir, name))
        });
      }
    }
  };
}

export default defineConfig({
  base: '/pdf-toolbox/',
  plugins: [
    react(),
    pdfjsStandardFonts(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registration is done explicitly in src/main.tsx via `virtual:pwa-register`
      // so we can reload the page as soon as a new service worker takes control.
      // Without this, an updated deploy can take two full navigations to reach a
      // client that already has the old service worker active.
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'PDF Toolbox - 100% Local & Privacy-First',
        short_name: 'PDF Toolbox',
        description: 'Offline, private, client-side PDF manipulation toolkit. Merge, split, organize, compress, and convert PDFs with zero server uploads.',
        theme_color: '#10b981',
        background_color: '#09090b',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // 'mjs' is included defensively for any future pdf.js-style ESM asset;
        // the pdf.js engine itself is now inlined into the worker chunk (see
        // src/services/pdfWorker.ts) rather than emitted as a separate .mjs file.
        //
        // 'pfb' and 'ttf' cover pdf.js's standard-14 font data (emitted by the
        // pdfjsStandardFonts plugin above). They MUST stay precached: the worker
        // path-fills glyphs from these files, so without them offline renders
        // come out with no text at all — the exact bug the plugin exists to fix,
        // reintroduced only once the app goes offline.
        globPatterns: ['**/*.{js,mjs,css,html,svg,png,wasm,webmanifest,pfb,ttf}'],
        // The worker chunk now bundles the pdf.js engine directly and is
        // ~2.2MB, over Workbox's 2MiB default precache cap. Without raising
        // this, vite-plugin-pwa fails the production build outright (and
        // nothing deploys). Headroom is left for pdf.js growth.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      }
    })
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022'
    }
  },
  build: {
    target: 'es2022'
  }
});
