/**
 * Welcome Modal System
 * Dynamic welcome modal for first-time users
 */

class WelcomeModal {
    constructor() {
        this.storageKey = 'echannelling_welcome_shown';
        this.modalId = 'welcome-modal-overlay';
        this.init();
    }

    init() {
        // Check if user has seen welcome modal before
        if (!this.shouldShowWelcome()) {
            return;
        }

        // Wait for page to fully load before showing modal
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.showModal(), 1000);
            });
        } else {
            setTimeout(() => this.showModal(), 1000);
        }
    }

    shouldShowWelcome() {
        // Check if welcome was already shown
        const hasSeenWelcome = localStorage.getItem(this.storageKey);
        
        // Only show on main pages (not on login/register pages)
        const currentPage = window.location.pathname;
        const isMainPage = currentPage === '/' || 
                          currentPage.endsWith('index.html') ||
                          currentPage.endsWith('find-doctors.html') ||
                          currentPage.endsWith('hospitals.html') ||
                          currentPage.endsWith('specialities.html');
        
        return !hasSeenWelcome && isMainPage;
    }

    createModal() {
        const modalOverlay = document.createElement('div');
        modalOverlay.id = this.modalId;
        modalOverlay.className = 'welcome-modal-overlay';
        
        modalOverlay.innerHTML = `
            <div class="welcome-modal">
                <div class="welcome-modal-header">
                    <button class="welcome-modal-close" onclick="welcomeModal.closeModal()">&times;</button>
                    <div class="welcome-logo">🏥</div>
                    <h1>Welcome to eChannelling</h1>
                    <p class="subtitle">Sri Lanka's Leading Healthcare Appointment Platform</p>
                </div>
                
                <div class="welcome-modal-body">
                    <div class="welcome-steps">
                        <div class="welcome-step">
                            <div class="step-icon">1</div>
                            <div class="step-content">
                                <h3>Find Your Doctor</h3>
                                <p>Search from our network of qualified doctors across all specialties and hospitals in Sri Lanka.</p>
                            </div>
                        </div>
                        
                        <div class="welcome-step">
                            <div class="step-icon">2</div>
                            <div class="step-content">
                                <h3>Book Appointments</h3>
                                <p>Schedule appointments online with real-time availability and instant confirmation.</p>
                            </div>
                        </div>
                        
                        <div class="welcome-step">
                            <div class="step-icon">3</div>
                            <div class="step-content">
                                <h3>Manage Your Health</h3>
                                <p>Access your medical records, track appointments, and stay connected with your healthcare providers.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="welcome-features">
                        <div class="feature-card">
                            <span class="feature-icon">👨‍⚕️</span>
                            <h4 class="feature-title">Expert Doctors</h4>
                        </div>
                        <div class="feature-card">
                            <span class="feature-icon">🏥</span>
                            <h4 class="feature-title">Top Hospitals</h4>
                        </div>
                        <div class="feature-card">
                            <span class="feature-icon">📱</span>
                            <h4 class="feature-title">Easy Booking</h4>
                        </div>
                        <div class="feature-card">
                            <span class="feature-icon">🔒</span>
                            <h4 class="feature-title">Secure Platform</h4>
                        </div>
                    </div>
                </div>
                
                <div class="welcome-modal-footer">
                    <button class="btn-welcome-primary" onclick="welcomeModal.startExploring()">
                        Start Exploring
                    </button>
                    <button class="btn-welcome-secondary" onclick="welcomeModal.closeModal()">
                        Skip Tour
                    </button>
                    
                    <div class="dont-show-again">
                        <input type="checkbox" id="dont-show-again" onchange="welcomeModal.toggleDontShow(this.checked)">
                        <label for="dont-show-again">Don't show this again</label>
                    </div>
                </div>
            </div>
        `;
        
        return modalOverlay;
    }

    showModal() {
        // Create modal if it doesn't exist
        let modal = document.getElementById(this.modalId);
        if (!modal) {
            modal = this.createModal();
            document.body.appendChild(modal);
        }
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
            modal.querySelector('.welcome-modal').classList.add('animate-in');
        }, 100);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Track modal shown
        this.trackEvent('welcome_modal_shown');
    }

    closeModal() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.remove('show');
            
            // Remove modal after animation
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 400);
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Remove keydown listener
        document.removeEventListener('keydown', this.handleKeydown.bind(this));
        
        // Mark as seen (unless they specifically chose not to)
        if (!document.getElementById('dont-show-again')?.checked) {
            this.markAsShown();
        }
        
        this.trackEvent('welcome_modal_closed');
    }

    startExploring() {
        this.closeModal();
        
        // Navigate to find doctors page or scroll to features
        if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
            // Scroll to features section if on homepage
            const featuresSection = document.querySelector('.features-section, .services-section, .specialties-section');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Navigate to find doctors page
                window.location.href = 'find-doctors.html';
            }
        } else {
            // Navigate to find doctors page
            window.location.href = 'find-doctors.html';
        }
        
        this.trackEvent('welcome_start_exploring');
    }

    toggleDontShow(checked) {
        if (checked) {
            localStorage.setItem(this.storageKey, 'true');
            this.trackEvent('welcome_dont_show_again');
        } else {
            localStorage.removeItem(this.storageKey);
        }
    }

    markAsShown() {
        localStorage.setItem(this.storageKey, 'true');
    }

    handleKeydown(e) {
        if (e.key === 'Escape') {
            this.closeModal();
        }
    }

    trackEvent(eventName) {
        // Basic event tracking (can be enhanced with analytics)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'welcome_modal',
                event_label: window.location.pathname
            });
        }
        
        console.log(`Welcome Modal Event: ${eventName}`);
    }

    // Static methods for external access
    static show() {
        if (window.welcomeModal) {
            window.welcomeModal.showModal();
        }
    }

    static close() {
        if (window.welcomeModal) {
            window.welcomeModal.closeModal();
        }
    }

    static reset() {
        localStorage.removeItem('echannelling_welcome_shown');
        console.log('Welcome modal reset - will show again on next visit');
    }
}

// Auto-initialize welcome modal
document.addEventListener('DOMContentLoaded', function() {
    window.welcomeModal = new WelcomeModal();
});

// Also initialize if script loads after DOM is ready
if (document.readyState !== 'loading') {
    window.welcomeModal = new WelcomeModal();
}

// Global functions for easy access
function showWelcomeModal() {
    WelcomeModal.show();
}

function resetWelcomeModal() {
    WelcomeModal.reset();
}