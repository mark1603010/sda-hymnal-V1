self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('hymnal-cache').then(cache => {
      return cache.addAll([
        'index.html',
        'style.css',
        'app.js',
        'hymns.json',
        'images/icons/icon-192.png',
        'images/icons/icon-512.png'
        // Add more assets as needed
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});s