```javascript
const CACHE_NAME = 'apes-cache-v1';
const urlsToCache = [
  '/apes-hybrid-scouting-lens/',
  '/apes-hybrid-scouting-lens/index.html',
  '/apes-hybrid-scouting-lens/style.css',
  '/apes-hybrid-scouting-lens/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```
