import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { getPrefs } from '@/repositories/local';
import '@/styles/global.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element missing');
}

// Parent/prefs reduced motion + system preference
try {
  if (getPrefs().reducedMotion) {
    document.documentElement.classList.add('reduced-motion');
  }
} catch {
  /* ignore */
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Minimal offline shell message (no full SW dependency for v1)
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  // Optional: register only if public/sw.js is present after build
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline shell is best-effort */
    });
  });
}
