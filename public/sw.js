/* Island Quest — minimal offline shell service worker (best-effort). */
const CACHE = 'iq-shell-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Network-first for navigations; fall back to cached shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          void caches.open(CACHE).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html');
          return (
            cached ||
            new Response(
              '<!doctype html><title>Island Quest</title><body style="font-family:system-ui;padding:2rem;background:#fff8ef"><h1>Island Quest</h1><p>You are offline. Reconnect to continue your adventure.</p></body>',
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
            )
          );
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).catch(() => hit)),
  );
});
