// Performance Optimization JavaScript

class PerformanceOptimizer {
    constructor() {
        this.initializeOptimizations();
    }

    initializeOptimizations() {
        this.preloadCriticalResources();
        this.optimizeImages();
        this.implementLazyLoading();
        this.optimizeScripts();
        this.cacheResources();
        this.minimizeReflows();
    }

    // Preload critical resources
    preloadCriticalResources() {
        const criticalResources = [
            '/css/echannelling-styles.css',
            '/css/responsive.css',
            '/js/universal-navigation.js'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }

    // Optimize image loading
    optimizeImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy-image');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy-image');
            });
        }
    }

    // Implement lazy loading for non-critical content
    implementLazyLoading() {
        const lazyElements = document.querySelectorAll('.lazy-load');
        
        if ('IntersectionObserver' in window) {
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        element.classList.add('loaded');
                        lazyObserver.unobserve(element);
                    }
                });
            }, { rootMargin: '50px' });

            lazyElements.forEach(el => lazyObserver.observe(el));
        }
    }

    // Optimize script loading
    optimizeScripts() {
        // Defer non-critical scripts
        const nonCriticalScripts = document.querySelectorAll('script[data-defer]');
        nonCriticalScripts.forEach(script => {
            script.defer = true;
        });

        // Load scripts asynchronously when needed
        window.loadScript = (src, callback) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = callback;
            document.head.appendChild(script);
        };
    }

    // Implement resource caching
    cacheResources() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }

        // Local storage caching for frequently used data
        this.cache = {
            set: (key, data, expiry = 3600000) => { // 1 hour default
                const item = {
                    data: data,
                    timestamp: Date.now(),
                    expiry: expiry
                };
                localStorage.setItem(key, JSON.stringify(item));
            },
            get: (key) => {
                const item = localStorage.getItem(key);
                if (!item) return null;
                
                const parsed = JSON.parse(item);
                if (Date.now() - parsed.timestamp > parsed.expiry) {
                    localStorage.removeItem(key);
                    return null;
                }
                return parsed.data;
            }
        };
    }

    // Minimize reflows and repaints
    minimizeReflows() {
        // Batch DOM operations
        window.batchDOMOperations = (operations) => {
            requestAnimationFrame(() => {
                operations.forEach(op => op());
            });
        };

        // Debounce resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                window.dispatchEvent(new Event('debouncedResize'));
            }, 250);
        });
    }

    // Resource loading monitor
    monitorPerformance() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    const paintEntries = performance.getEntriesByType('paint');
                    
                    console.log('Performance Metrics:');
                    console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
                    console.log('Load Complete:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
                    
                    paintEntries.forEach(entry => {
                        console.log(entry.name + ':', entry.startTime, 'ms');
                    });
                }, 0);
            });
        }
    }
}

// Optimize API calls
class APIOptimizer {
    constructor() {
        this.requestCache = new Map();
        this.pendingRequests = new Map();
    }

    // Debounced fetch with caching
    async optimizedFetch(url, options = {}, cacheTime = 300000) { // 5 min cache
        const cacheKey = url + JSON.stringify(options);
        
        // Check cache first
        if (this.requestCache.has(cacheKey)) {
            const cached = this.requestCache.get(cacheKey);
            if (Date.now() - cached.timestamp < cacheTime) {
                return Promise.resolve(cached.data);
            }
        }

        // Check for pending requests
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }

        // Make new request
        const promise = fetch(url, options)
            .then(response => response.json())
            .then(data => {
                this.requestCache.set(cacheKey, {
                    data: data,
                    timestamp: Date.now()
                });
                this.pendingRequests.delete(cacheKey);
                return data;
            })
            .catch(error => {
                this.pendingRequests.delete(cacheKey);
                throw error;
            });

        this.pendingRequests.set(cacheKey, promise);
        return promise;
    }
}

// Initialize optimizations
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
    window.apiOptimizer = new APIOptimizer();
    
    // Override fetch for automatic optimization
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (url.includes('/php/') || url.includes('/api/')) {
            return window.apiOptimizer.optimizedFetch(url, options);
        }
        return originalFetch.apply(this, arguments);
    };
});

// Optimize scroll performance
let ticking = false;
function optimizeScroll() {
    if (!ticking) {
        requestAnimationFrame(() => {
            // Handle scroll events here
            ticking = false;
        });
        ticking = true;
    }
}
window.addEventListener('scroll', optimizeScroll, { passive: true });