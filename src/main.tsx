import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';

// Reload as soon as a new service worker takes control, so a fresh deploy
// (e.g. a bug fix) reaches an already-open tab in one step instead of two.
// `registerType: 'autoUpdate'` already makes the new worker call skipWaiting()
// + clientsClaim() as soon as it installs; this just makes the page catch up.
let reloadingForUpdate = false;
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (reloadingForUpdate) return;
  reloadingForUpdate = true;
  window.location.reload();
});

const updateServiceWorker = registerSW({
  immediate: true,
  onRegistered(registration) {
    // The page never navigates (SPA), so also poll periodically for updates.
    if (registration) {
      setInterval(() => registration.update(), 60 * 60 * 1000);
    }
  },
  onNeedRefresh() {
    updateServiceWorker(true);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
