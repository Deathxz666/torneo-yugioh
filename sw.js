const CACHE_NAME = 'yugioh-tournament-v5';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// INSTALACIÓN
self.addEventListener('install', (event) => {
  console.log('SW instalado');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// ACTIVACIÓN
self.addEventListener('activate', (event) => {
  console.log('SW activado');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ❌ NO cachear nada externo
  if (url.origin !== location.origin) {
    return; // permitir carga normal, sin cache
  }

  event.respondWith(
    caches.match(event.request).then(cacheRes => {
      return (
        cacheRes ||
        fetch(event.request)
          .then((networkRes) => {
            // solo clonamos si es OK y del mismo origen
            if (
              networkRes &&
              networkRes.status === 200 &&
              networkRes.type === "basic"
            ) {
              const resClone = networkRes.clone();
              caches.open(CACHE_NAME).then(cache =>
                cache.put(event.request, resClone)
              );
            }
            return networkRes;
          })
          .catch(() =>
            caches.match('./index.html')
          )
      );
    })
  );
});
