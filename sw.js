// Service Worker for caching and performance optimization

const CACHE_NAME = 'echannelling-v1';
const STATIC_CACHE = 'echannelling-static-v1';
const DYNAMIC_CACHE = 'echannelling-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/patient-dashboard.html',
    '/patient-profile.html',
    '/patient-settings.html',
    '/login.html',
    '/css/echannelling-styles.css',
    '/css/responsive.css',
    '/css/performance.css',
    '/js/echannelling-main.js',
    '/js/performance-optimization.js',
    '/images/placeholder-logo.svg'
];

// Install service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate service worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch strategy: Cache First for static files, Network First for dynamic content
self.addEventListener('fetch', event => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Handle static files
    if (STATIC_FILES.some(file => request.url.includes(file))) {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    return response || fetch(request)
                        .then(fetchResponse => {
                            return caches.open(STATIC_CACHE)
                                .then(cache => {
                                    cache.put(request, fetchResponse.clone());
                                    return fetchResponse;
                                });
                        });
                })
        );
        return;
    }
    
    // Handle API calls and dynamic content
    if (request.url.includes('/php/') || request.url.includes('/api/')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Only cache successful responses
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                cache.put(request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(request);
                })
        );
        return;
    }
    
    // Default strategy for other requests
    event.respondWith(
        caches.match(request)
            .then(response => {
                return response || fetch(request);
            })
    );
});

// Background sync for offline functionality
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle background synchronization
            console.log('Background sync triggered')
        );
    }
});

// Handle push notifications for real-time updates
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/images/placeholder-logo.svg',
            badge: '/images/placeholder-logo.svg',
            vibrate: [200, 100, 200],
            data: data.data
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});