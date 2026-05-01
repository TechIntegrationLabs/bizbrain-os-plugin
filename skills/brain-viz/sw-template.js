// Service worker for brain-viz public bundle.
// Caches graph data + HTML + vendor libs for instant repeat visits.
// v2: added landing page (index.html) + 2D viewer (2d.html, force-graph.min.js)
const CACHE = 'brain-viz-v2';
const PRECACHE = [
  './',
  './index.html',
  './2d.html',
  './3d.html',
  './graph.json.gz',
  './communities.json',
  './brand.json',
  './brains.json',
  './vendor/3d-force-graph.min.js',
  './vendor/force-graph.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // skip CDN requests (esm.sh, etc.)

  // Cache-first for static assets; network-first wouldn't help here since content is immutable
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      });
    })
  );
});
