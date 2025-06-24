/**
 * Universal Navigation System
 * Provides back button and scroll-to-top functionality for all pages
 */

class UniversalNavigationHandler {
    constructor() {
        this.scrollThreshold = 300;
        this.init();
    }

    init() {
        this.createBottomBackButton();
        this.createScrollToTopButton();
        this.setupEventListeners();
        this.handlePageNavigation();
    }



    createBottomBackButton() {
        // Check if bottom back button already exists
        if (document.getElementById('bottom-back-btn')) return;

        const bottomBackButton = document.createElement('button');
        bottomBackButton.id = 'bottom-back-btn';
        bottomBackButton.className = 'bottom-back-btn';
        bottomBackButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H6m6-7l-7 7 7 7"/>
            </svg>
            <span>Back to Previous Page</span>
        `;
        bottomBackButton.title = 'Go back to previous page';
        
        // Only show back button if not on home page and has history
        const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
        if (!isHomePage && (window.history.length > 1 || document.referrer)) {
            // Insert before footer or at end of body
            const footer = document.querySelector('footer');
            if (footer) {
                footer.parentNode.insertBefore(bottomBackButton, footer);
            } else {
                document.body.appendChild(bottomBackButton);
            }
        }
    }

    createScrollToTopButton() {
        // Remove existing scroll button if present
        const existingBtn = document.querySelector('.scroll-to-top-btn');
        if (existingBtn) {
            existingBtn.remove();
        }

        const scrollButton = document.createElement('button');
        scrollButton.className = 'scroll-to-top-btn';
        scrollButton.innerHTML = '⬆️';
        scrollButton.title = 'Scroll to top | උඩටම යන්න';
        scrollButton.setAttribute('aria-label', 'Scroll to top');
        
        document.body.appendChild(scrollButton);
    }

    setupEventListeners() {
        // Bottom back button functionality
        const bottomBackButton = document.getElementById('bottom-back-btn');
        if (bottomBackButton) {
            bottomBackButton.addEventListener('click', this.handleBackClick.bind(this));
        }

        // Scroll to top functionality
        const scrollButton = document.querySelector('.scroll-to-top-btn');
        if (scrollButton) {
            scrollButton.addEventListener('click', this.scrollToTop.bind(this));
            
            // Keyboard accessibility
            scrollButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.scrollToTop();
                }
            });
        }

        // Show/hide scroll button based on scroll position with throttling
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', this.handlePopState.bind(this));
    }

    handleBackClick() {
        // Try to go back in history first
        if (window.history.length > 1) {
            window.history.back();
        } else if (document.referrer && document.referrer !== window.location.href) {
            // If no history, go to referrer
            window.location.href = document.referrer;
        } else {
            // Fallback to home page
            window.location.href = 'index.html';
        }
    }

    handleScroll() {
        const scrollButton = document.querySelector('.scroll-to-top-btn');
        if (!scrollButton) return;

        const scrolled = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrolled > 400) {
            scrollButton.classList.add('show');
        } else {
            scrollButton.classList.remove('show');
        }
    }

    scrollToTop() {
        const scrollButton = document.querySelector('.scroll-to-top-btn');
        
        // Add click animation
        if (scrollButton) {
            scrollButton.style.transform = 'translateY(-2px) scale(0.9)';
            setTimeout(() => {
                scrollButton.style.transform = '';
            }, 150);
        }
        
        // Smooth scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Focus management for accessibility
        setTimeout(() => {
            const header = document.querySelector('header, .header');
            if (header) {
                header.focus();
            }
        }, 500);
    }

    handlePopState() {
        // Handle browser navigation
        this.updateBackButtonVisibility();
    }

    updateBackButtonVisibility() {
        const bottomBackButton = document.getElementById('bottom-back-btn');
        
        const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
        const hasHistory = window.history.length > 1 || document.referrer;
        
        if (!isHomePage && hasHistory) {
            if (bottomBackButton) bottomBackButton.style.display = 'flex';
        } else {
            if (bottomBackButton) bottomBackButton.style.display = 'none';
        }
    }

    handlePageNavigation() {
        // Store the current page in session storage for better back navigation
        const currentPage = window.location.pathname;
        const previousPage = sessionStorage.getItem('previousPage');
        
        if (previousPage && previousPage !== currentPage) {
            sessionStorage.setItem('previousPage', previousPage);
        }
        sessionStorage.setItem('currentPage', currentPage);
    }

    // Method to programmatically trigger back navigation
    static goBack() {
        const instance = window.universalNavigation;
        if (instance) {
            instance.handleBackClick();
        }
    }

    // Method to programmatically scroll to top
    static scrollToTop() {
        const instance = window.universalNavigation;
        if (instance) {
            instance.scrollToTop();
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.universalNavigation = new UniversalNavigationHandler();
});

// Also initialize if script loads after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.universalNavigation) {
            window.universalNavigation = new UniversalNavigationHandler();
        }
    });
} else {
    if (!window.universalNavigation) {
        window.universalNavigation = new UniversalNavigationHandler();
    }
}