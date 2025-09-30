const CACHE_NAME = 'sda-hymnal-v1.0.1';  //mao ni ang mo show sa version nig naay update
console.log('Service Worker running with version:', CACHE_NAME);
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

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // Optional: return a fallback page or asset
        return caches.match('offline.html');
      });
    })
  );
});

//mao ni ang mopagawas sa message
self.addEventListener('message', event => {
if (event.data === 'checkForUpdate') {
  if (self.registration.waiting) {
    // Only notify if a new SW is waiting to activate
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'UPDATE_AVAILABLE' });
      });
    });
  }
}

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting(); // ✅ Activate new version immediately
  }
});