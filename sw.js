const CACHE_NAME = 'sda-hymnal-v1.0.1';  //mao ni ang mo show sa version nig naay update
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
  self.skipWaiting(); // activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});


// Fetch event: serve from cache if available
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // take control of all pages
});

//mao ni ang mopagawas sa message
self.addEventListener('message', event => {
  if (event.data === 'checkForUpdate') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'UPDATE_AVAILABLE' });
      });
    });
  }
});