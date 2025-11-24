const CACHE_NAME = 'yugioh-tournament-v5';

const urlsToCache = [
  './index.html',
  './manifest.json',
  './sw.js'
];

// INSTALL
self.addEventListener('install', event => {
  console.log('🔄 Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Cacheando archivos locales...');
      return cache.addAll(urlsToCache);
    }).then(() => self.skipWaiting())
  );
});

// ACTIVATE
self.addEventListener('activate', event => {
  console.log('🎯 Activando Service Worker...');
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      return fetch(event.request)
        .then(networkResponse => {

          // Cache SOLO archivos del mismo dominio
          if (networkResponse.status === 200 && 
              event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, networkResponse.clone()));
          }

          return networkResponse;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
