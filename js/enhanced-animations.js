/**
 * Enhanced Animations Manager for HealthCare+ System
 * Provides comprehensive animations for all pages with blue and white theme integration
 */

class EnhancedAnimations {
    constructor() {
        this.observers = [];
        this.animationQueue = [];
        this.isInitialized = false;
        this.animationSpeed = 1;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        this.setupIntersectionObserver();
        this.addPageEntranceAnimations();
        this.setupScrollAnimations();
        this.addHoverAnimations();
        this.setupFormAnimations();
        this.addLoadingAnimations();
        this.setupNavigationAnimations();
        
        this.isInitialized = true;
    }
    
    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, options);
        
        // Observe all animatable elements
        this.observeElements();
    }
    
    observeElements() {
        const selectors = [
            '.feature-card',
            '.stat-card',
            '.doctor-card',
            '.appointment-card',
            '.form-step',
            '.dashboard-card',
            '.hero-content',
            '.section-content',
            '.timeline-item',
            '.value-card',
            '.service-card',
            '.testimonial-card'
        ];
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (!el.hasAttribute('data-animated')) {
                    this.observer.observe(el);
                }
            });
        });
    }
    
    animateElement(element) {
        if (element.hasAttribute('data-animated') || this.reducedMotion) return;
        
        element.setAttribute('data-animated', 'true');
        
        // Add base animation class
        element.classList.add('animate-in');
        
        // Determine animation type based on element
        const animationType = this.getAnimationType(element);
        element.classList.add(animationType);
        
        // Add stagger delay for grouped elements
        this.addStaggerDelay(element);
    }
    
    getAnimationType(element) {
        if (element.classList.contains('feature-card') || 
            element.classList.contains('stat-card')) {
            return 'fade-in-up';
        }
        
        if (element.classList.contains('doctor-card') || 
            element.classList.contains('appointment-card')) {
            return 'scale-in';
        }
        
        if (element.classList.contains('form-step')) {
            return 'slide-in-right';
        }
        
        if (element.classList.contains('timeline-item')) {
            return 'slide-in-left';
        }
        
        return 'fade-in';
    }
    
    addStaggerDelay(element) {
        const parent = element.parentElement;
        const siblings = Array.from(parent.children).filter(child => 
            child.classList.contains(element.classList[0])
        );
        const index = siblings.indexOf(element);
        
        if (index > 0) {
            element.style.animationDelay = `${index * 0.1}s`;
        }
    }
    
    addPageEntranceAnimations() {
        // Hero section animation
        const hero = document.querySelector('.hero, .hero-content');
        if (hero) {
            hero.classList.add('page-entrance');
        }
        
        // Navigation animation
        const nav = document.querySelector('.navbar');
        if (nav) {
            nav.classList.add('nav-entrance');
        }
        
        // Main content animation
        const main = document.querySelector('main, .main-content');
        if (main) {
            main.classList.add('content-entrance');
        }
    }
    
    setupScrollAnimations() {
        let ticking = false;
        
        const updateScrollAnimations = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking && !this.reducedMotion) {
                requestAnimationFrame(updateScrollAnimations);
                ticking = true;
            }
        });
    }
    
    addHoverAnimations() {
        const hoverElements = document.querySelectorAll(`
            .btn, .card, .feature-card, .doctor-card, 
            .nav-link, .sidebar-link, .action-btn
        `);
        
        hoverElements.forEach(element => {
            element.classList.add('hover-animate');
        });
    }
    
    setupFormAnimations() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach((input, index) => {
                // Focus animations
                input.addEventListener('focus', () => {
                    input.parentElement.classList.add('input-focused');
                });
                
                input.addEventListener('blur', () => {
                    input.parentElement.classList.remove('input-focused');
                    if (input.value) {
                        input.parentElement.classList.add('input-filled');
                    } else {
                        input.parentElement.classList.remove('input-filled');
                    }
                });
                
                // Entrance animation
                input.style.animationDelay = `${index * 0.05}s`;
                input.classList.add('input-entrance');
            });
        });
    }
    
    addLoadingAnimations() {
        // Create loading spinner component
        this.createLoadingSpinner();
        
        // Add loading states to buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-primary, .btn-submit')) {
                this.addButtonLoading(e.target);
            }
        });
    }
    
    createLoadingSpinner() {
        const style = document.createElement('style');
        style.textContent = `
            .loading-spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s ease-in-out infinite;
                margin-right: 8px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    addButtonLoading(button) {
        if (button.querySelector('.loading-spinner')) return;
        
        const spinner = document.createElement('span');
        spinner.className = 'loading-spinner';
        button.insertBefore(spinner, button.firstChild);
        button.disabled = true;
        
        // Remove loading after 2 seconds (adjust based on actual request time)
        setTimeout(() => {
            spinner.remove();
            button.disabled = false;
        }, 2000);
    }
    
    setupNavigationAnimations() {
        // Mobile menu animations
        const mobileToggle = document.querySelector('.nav-toggle, .mobile-menu-toggle');
        const mobileMenu = document.querySelector('.nav-menu, .mobile-menu');
        
        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('menu-open');
                mobileToggle.classList.toggle('toggle-active');
            });
        }
        
        // Sidebar animations for dashboards
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('sidebar-open');
            });
        }
    }
    
    // Utility methods for manual animations
    fadeIn(element, duration = 300) {
        if (this.reducedMotion) {
            element.style.opacity = '1';
            return Promise.resolve();
        }
        
        return new Promise(resolve => {
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease`;
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                setTimeout(resolve, duration);
            });
        });
    }
    
    slideDown(element, duration = 300) {
        if (this.reducedMotion) {
            element.style.display = 'block';
            return Promise.resolve();
        }
        
        return new Promise(resolve => {
            const height = element.scrollHeight;
            element.style.height = '0';
            element.style.overflow = 'hidden';
            element.style.transition = `height ${duration}ms ease`;
            element.style.display = 'block';
            
            requestAnimationFrame(() => {
                element.style.height = height + 'px';
                setTimeout(() => {
                    element.style.height = '';
                    element.style.overflow = '';
                    resolve();
                }, duration);
            });
        });
    }
    
    slideUp(element, duration = 300) {
        if (this.reducedMotion) {
            element.style.display = 'none';
            return Promise.resolve();
        }
        
        return new Promise(resolve => {
            element.style.height = element.scrollHeight + 'px';
            element.style.overflow = 'hidden';
            element.style.transition = `height ${duration}ms ease`;
            
            requestAnimationFrame(() => {
                element.style.height = '0';
                setTimeout(() => {
                    element.style.display = 'none';
                    element.style.height = '';
                    element.style.overflow = '';
                    resolve();
                }, duration);
            });
        });
    }
    
    pulse(element, duration = 1000) {
        if (this.reducedMotion) return;
        
        element.style.animation = `pulse ${duration}ms ease-in-out`;
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }
    
    shake(element) {
        if (this.reducedMotion) return;
        
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
    
    // Method to reinitialize for dynamic content
    refresh() {
        this.observeElements();
    }
    
    // Clean up
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.observers.forEach(observer => observer.disconnect());
        this.animationQueue = [];
        this.isInitialized = false;
    }
}

// Initialize enhanced animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.HealthCareAnimations = new EnhancedAnimations();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedAnimations;
}