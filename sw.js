const CACHE_NAME = 'yugioh-tournament-v5';
const OFFLINE_URL = '/torneo-yugioh/index.html';

const urlsToCache = [
  '/torneo-yugioh/',
  '/torneo-yugioh/index.html',
  '/torneo-yugioh/manifest.json',
  '/torneo-yugioh/sw.js'
];

// INSTALACIÓN: cache básico
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ACTIVACIÓN: limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH: estrategia App Shell
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    // Para navegaciones -> siempre entregar index.html
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Para otros recursos
  event.respondWith(
    caches.match(event.request).then(res => {
      return (
        res ||
        fetch(event.request)
          .then(response => {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, cloned);
            });
            return response;
          })
          .catch(() => res)
      );
    })
  );
});
