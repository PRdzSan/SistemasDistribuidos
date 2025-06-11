const CACHE_NAME = 'task-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico'
];

// Instalar y cachear archivos iniciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Activar y limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  // Solo manejar solicitudes GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (
          response &&
          response.status === 200 &&
          response.type === 'basic'
        ) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          // Si no está en caché, intenta devolver '/'
          return cached || caches.match('/');
        })
      )
  );
});
