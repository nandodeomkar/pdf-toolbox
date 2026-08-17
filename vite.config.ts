import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/pdf-toolbox/',
  plugins: [
    react(),
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
        globPatterns: ['**/*.{js,mjs,css,html,svg,png,wasm,webmanifest}'],
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
