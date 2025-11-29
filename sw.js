const CACHE_NAME = 'yugioh-tournament-v8';
const OFFLINE_URL = 'index.html';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];

// INSTALACIÓN
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// ACTIVACIÓN
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener('fetch', event => {
  // Para navegación → fallback index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Otros recursos
  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request)
          .then(res => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            return res;
          })
          .catch(() => cached)
      );
    })
  );
});
