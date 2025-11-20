// sw.js - Service Worker mejorado para offline completo
const CACHE_NAME = 'yugioh-tournament-offline-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', function(event) {
  console.log('🔄 Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Cache abierto, guardando recursos...');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('✅ Todos los recursos guardados en cache');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('🎯 Service Worker activado');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Devuelve el recurso desde cache si existe
        if (response) {
          return response;
        }
        
        // Si no está en cache, haz la petición network
        return fetch(event.request).then(function(response) {
          // Si la petición falla, devuelve una página offline
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clona la respuesta para guardarla en cache
          var responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function() {
          // Si estamos offline y no hay cache, devuelve una respuesta básica
          return new Response('Offline', {
            status: 408,
            statusText: 'Offline'
          });
        });
      })
  );
});
