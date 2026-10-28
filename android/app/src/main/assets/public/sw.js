// Service Worker - Brain Studio PWA
const CACHE_NAME = 'brain-studio-v4-safe';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Purga imediatamente caches legados que possam conter scripts incompatíveis
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignora chamadas de API, WebSockets, extensões e caminhos de desenvolvimento do Vite
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/src') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/node_modules') ||
    url.pathname.includes('vite') ||
    url.protocol.startsWith('ws')
  ) {
    return;
  }

  // Requisições normais com proteção estrita contra retorno de HTML para scripts/assets
  event.respondWith(
    fetch(event.request)
      .then((networkRes) => {
        return networkRes;
      })
      .catch(async () => {
        // Tenta buscar no cache específico da requisição
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // CRÍTICO: Fallback para '/' APENAS em navegação de página inteira (HTML)
        // NUNCA retornar index.html para requisições de scripts, fontes, css ou imagens
        if (event.request.mode === 'navigate') {
          const cachedHome = await caches.match('/');
          if (cachedHome) return cachedHome;
        }

        return new Response('Asset indisponível offline', {
          status: 404,
          statusText: 'Not Found',
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
});
