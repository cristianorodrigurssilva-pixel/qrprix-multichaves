const CACHE_NAME = 'qrpix-multi-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.json?v=2',
  './icon-192.png?v=2',
  './icon-512.png?v=2'
];

// Instala o novo Service Worker e ativa imediatamente
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Limpa os caches antigos (v1) para forçar o carregamento dos novos ícones
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepta as requisições e entrega os arquivos do novo cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
