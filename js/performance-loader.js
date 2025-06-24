// Performance Optimized Script Loader
class PerformanceLoader {
    constructor() {
        this.loadedScripts = new Set();
        this.loadingQueue = [];
        this.isLoading = false;
    }

    // Preload critical scripts immediately
    preloadCritical() {
        const criticalScripts = [
            'js/realtime-updates.js'
        ];
        
        criticalScripts.forEach(src => {
            this.preloadScript(src);
        });
    }

    // Preload script without executing
    preloadScript(src) {
        if (this.loadedScripts.has(src)) return;
        
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = src;
        document.head.appendChild(link);
    }

    // Load scripts with priority queue
    async loadScript(src, priority = 'normal') {
        if (this.loadedScripts.has(src)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = () => {
                this.loadedScripts.add(src);
                resolve();
            };
            
            script.onerror = reject;
            
            if (priority === 'high') {
                document.head.insertBefore(script, document.head.firstChild);
            } else {
                document.head.appendChild(script);
            }
        });
    }

    // Load multiple scripts in parallel
    async loadScripts(scripts) {
        const promises = scripts.map(script => {
            if (typeof script === 'string') {
                return this.loadScript(script);
            }
            return this.loadScript(script.src, script.priority);
        });
        
        return Promise.all(promises);
    }

    // Lazy load non-critical scripts
    lazyLoadOnInteraction(scripts, events = ['click', 'scroll', 'keydown']) {
        const loadOnce = () => {
            events.forEach(event => {
                document.removeEventListener(event, loadOnce);
            });
            this.loadScripts(scripts);
        };

        events.forEach(event => {
            document.addEventListener(event, loadOnce, { once: true, passive: true });
        });

        // Fallback: load after 1 second anyway
        setTimeout(() => loadOnce(), 1000);
    }

    // Load scripts when element becomes visible
    loadOnVisible(scripts, selector) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadScripts(scripts);
                    observer.unobserve(entry.target);
                }
            });
        });

        const element = document.querySelector(selector);
        if (element) {
            observer.observe(element);
        }
    }

    // Optimize existing script loading
    optimizeScriptLoading() {
        // Remove existing script tags to prevent double loading
        const existingScripts = document.querySelectorAll('script[src]');
        const scriptSources = Array.from(existingScripts).map(script => script.src);
        
        // Mark as loaded
        scriptSources.forEach(src => {
            const relativeSrc = src.replace(window.location.origin, '');
            this.loadedScripts.add(relativeSrc);
        });
    }
}

// Initialize performance loader
const performanceLoader = new PerformanceLoader();

// Optimize loading based on page type
document.addEventListener('DOMContentLoaded', () => {
    performanceLoader.optimizeScriptLoading();
    
    // Load critical scripts first
    const criticalScripts = [
        { src: 'js/universal-navigation.js', priority: 'high' }
    ];
    
    // Load feature-specific scripts based on page
    const currentPage = window.location.pathname;
    let featureScripts = [];
    
    if (currentPage.includes('dashboard') || currentPage.includes('test-appointment')) {
        featureScripts = [
            'js/appointment-status-manager.js',
            'js/realtime-updates.js'
        ];
    } else if (currentPage.includes('payment')) {
        featureScripts = ['js/stripe-integration.js'];
    } else if (currentPage.includes('find-doctors') || currentPage.includes('booking')) {
        featureScripts = ['js/doctor-search.js', 'js/booking.js'];
    }
    
    // Load critical scripts immediately
    performanceLoader.loadScripts(criticalScripts).then(() => {
        // Load feature scripts after critical ones
        if (featureScripts.length > 0) {
            performanceLoader.lazyLoadOnInteraction(featureScripts);
        }
    });
});

// Export for global use
window.performanceLoader = performanceLoader;