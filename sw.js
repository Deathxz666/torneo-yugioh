const CACHE_NAME = 'yugioh-tournament-complete-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com'
];

// INSTALACIÓN - Cachear todo inmediatamente
self.addEventListener('install', function(event) {
  console.log('🔄 Instalando Service Worker OFFLINE...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Cacheando recursos para OFFLINE...');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('✅ TODOS los recursos cacheados - App lista para OFFLINE');
        return self.skipWaiting();
      })
  );
});

// ACTIVACIÓN - Tomar control inmediato
self.addEventListener('activate', function(event) {
  console.log('🎯 Service Worker activado - Modo OFFLINE activo');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// INTERCEPTAR TODAS LAS PETICIONES
self.addEventListener('fetch', function(event) {
  // Solo cachear peticiones HTTP/HTTPS
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Devolver desde cache si existe
        if (response) {
          return response;
        }
        
        // Hacer petición network como fallback
        return fetch(event.request)
          .then(function(networkResponse) {
            // Cachear nuevas respuestas
            if (networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(function() {
            // Si estamos completamente offline
            return new Response('🔌 Modo offline', {
              status: 200,
              headers: {'Content-Type': 'text/plain'}
            });
          });
      })
  );
});
