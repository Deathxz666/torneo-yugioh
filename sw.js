const CACHE_NAME = "yugioh-tournament-v7";
const OFFLINE_URL = "/torneo-yugioh/index.html";

// Archivos que deben existir offline
const urlsToCache = [
  "/torneo-yugioh/",
  "/torneo-yugioh/index.html",
  "/torneo-yugioh/manifest.json",
  "/torneo-yugioh/sw.js",
  "/torneo-yugioh/icon-192.png",
  "/torneo-yugioh/icon-512.png",

  // React - Necesario para que tu app funcione sin internet
  "https://unpkg.com/react@18/umd/react.development.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.development.js",

  // Babel (tu app lo usa para interpretar JSX en runtime)
  "https://unpkg.com/@babel/standalone/babel.min.js",

  // Tailwind CDN
  "https://cdn.tailwindcss.com",
];

// INSTALACIÓN: precargar todo
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// ACTIVACIÓN: limpiar versiones antiguas
self.addEventListener("activate", (event) => {
  clients.claim();
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
});

// FETCH: Offline estable y compatible con PWABuilder
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Navegación → Network First con fallback offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Otros archivos → Cache First con actualización en segundo plano
  event.respondWith(
    caches.match(request).then((cacheRes) => {
      return (
        cacheRes ||
        fetch(request)
          .then((response) => {
            // Cache dinámico
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cloned);
            });
            return response;
          })
          .catch(() => cacheRes) // fallback
      );
    })
  );
});
