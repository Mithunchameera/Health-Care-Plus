/**
 * Performance Optimizer for HealthCare+ Dashboards
 * Handles lazy loading, caching, and performance improvements
 */

class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.loadingStates = new Map();
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupCaching();
        this.optimizeImages();
        this.preloadCriticalResources();
    }

    setupLazyLoading() {
        // Lazy load sections when they become visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    this.loadSectionData(section);
                    observer.unobserve(section);
                }
            });
        }, { threshold: 0.1 });

        // Observe dashboard sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            observer.observe(section);
        });
    }

    setupCaching() {
        // Cache API responses for faster subsequent loads
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            // Only cache GET requests
            if (!options.method || options.method === 'GET') {
                const cacheKey = url;
                
                if (this.cache.has(cacheKey)) {
                    const cached = this.cache.get(cacheKey);
                    const now = Date.now();
                    
                    // Cache for 5 minutes
                    if (now - cached.timestamp < 300000) {
                        return new Response(JSON.stringify(cached.data), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                }
            }

            const response = await originalFetch(url, options);
            
            // Cache successful GET responses
            if (response.ok && (!options.method || options.method === 'GET')) {
                try {
                    const clone = response.clone();
                    const data = await clone.json();
                    this.cache.set(url, {
                        data: data,
                        timestamp: Date.now()
                    });
                } catch (e) {
                    // Non-JSON response, don't cache
                }
            }

            return response;
        };
    }

    optimizeImages() {
        // Add loading="lazy" to images
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }

    preloadCriticalResources() {
        // Preload critical CSS and JS files
        const criticalResources = [
            { href: 'css/dashboard-styles.css', as: 'style' },
            { href: 'js/enhanced-animations.js', as: 'script' },
            { href: 'js/theme-manager.js', as: 'script' }
        ];

        criticalResources.forEach(resource => {
            if (!document.querySelector(`link[href="${resource.href}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource.href;
                link.as = resource.as;
                document.head.appendChild(link);
            }
        });
    }

    async loadSectionData(section) {
        const sectionId = section.id;
        const loadingKey = `loading_${sectionId}`;

        // Prevent duplicate loading
        if (this.loadingStates.get(loadingKey)) {
            return;
        }

        this.loadingStates.set(loadingKey, true);
        this.showSectionLoading(section);

        try {
            // Trigger section-specific loading based on dashboard type
            if (window.patientDashboard) {
                await this.loadPatientSection(sectionId);
            } else if (window.adminDashboard) {
                await this.loadAdminSection(sectionId);
            } else if (window.doctorDashboard) {
                await this.loadDoctorSection(sectionId);
            }
        } catch (error) {
            console.error(`Error loading section ${sectionId}:`, error);
            this.showSectionError(section, error.message);
        } finally {
            this.hideSectionLoading(section);
            this.loadingStates.set(loadingKey, false);
        }
    }

    async loadPatientSection(sectionId) {
        if (!window.patientDashboard) return;

        switch (sectionId) {
            case 'dashboard-section':
                await window.patientDashboard.loadDashboardStats();
                await window.patientDashboard.loadUpcomingAppointments();
                break;
            case 'appointments-section':
                await window.patientDashboard.loadAllAppointments();
                break;
            case 'doctors-section':
                await window.patientDashboard.loadDoctors();
                break;
            case 'medical-records-section':
                await window.patientDashboard.loadMedicalRecords();
                break;
            case 'messages-section':
                await window.patientDashboard.loadMessages();
                break;
        }
    }

    async loadAdminSection(sectionId) {
        if (!window.adminDashboard) return;

        switch (sectionId) {
            case 'dashboard-section':
                await window.adminDashboard.loadDashboardStats();
                await window.adminDashboard.loadRecentActivity();
                break;
            case 'doctors-section':
                await window.adminDashboard.loadDoctors();
                break;
            case 'appointments-section':
                await window.adminDashboard.loadAppointments();
                break;
            case 'patients-section':
                await window.adminDashboard.loadPatients();
                break;
            case 'staff-section':
                await window.adminDashboard.loadStaff();
                break;
            case 'reports-section':
                await window.adminDashboard.loadReportsData();
                break;
        }
    }

    async loadDoctorSection(sectionId) {
        if (!window.doctorDashboard) return;

        switch (sectionId) {
            case 'dashboard-section':
                await window.doctorDashboard.loadDashboardStats();
                await window.doctorDashboard.loadTodayAppointments();
                break;
            case 'appointments-section':
                await window.doctorDashboard.loadAllAppointments();
                break;
            case 'patients-section':
                await window.doctorDashboard.loadPatients();
                break;
            case 'schedule-section':
                await window.doctorDashboard.loadWeeklySchedule();
                break;
            case 'availability-section':
                await window.doctorDashboard.loadAvailabilityForDate();
                break;
        }
    }

    showSectionLoading(section) {
        // Add loading skeleton
        const existingContent = section.innerHTML;
        section.dataset.originalContent = existingContent;
        
        section.innerHTML = `
            <div class="loading-skeleton">
                <div class="skeleton-card loading-skeleton"></div>
                <div class="skeleton-card loading-skeleton"></div>
                <div class="skeleton-card loading-skeleton"></div>
            </div>
        `;
    }

    hideSectionLoading(section) {
        // Restore original content if loading was shown
        if (section.dataset.originalContent) {
            section.innerHTML = section.dataset.originalContent;
            delete section.dataset.originalContent;
        }
    }

    showSectionError(section, errorMessage) {
        section.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Unable to load content</h4>
                <p>${errorMessage}</p>
                <button class="btn btn-primary" onclick="window.location.reload()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }

    // Debounce function for search inputs
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Get cache size
    getCacheSize() {
        return this.cache.size;
    }
}

// Initialize performance optimizer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
});