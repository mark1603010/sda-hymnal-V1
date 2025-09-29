const CACHE_NAME = 'sda-hymnal-v1';
const urlsToCache = [
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'hymns.json',
  'images/my_photo/roleen.JPG',
  'images/icons/icon-192.png',
  'images/icons/icon-512.png'
];

// Install event: cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event: serve from cache if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});