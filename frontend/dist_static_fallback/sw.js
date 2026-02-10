// Service Worker - DISABLED
// This file intentionally left minimal to unregister old service workers

self.addEventListener('install', function(event) {
    console.log('[SW] Service worker disabled - skipping install');
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('[SW] Service worker disabled - clearing caches');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    console.log('[SW] Deleting cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(function() {
            console.log('[SW] All caches cleared - unregistering');
            return self.registration.unregister();
        })
    );
});

self.addEventListener('fetch', function(event) {
    // Pass through - no caching
    return;
});
