// This is a dummy service worker to prevent 404 errors.
// Currently, this application does not use PWA features.
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Do nothing, just pass through
});
