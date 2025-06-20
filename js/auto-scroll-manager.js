/**
 * Auto-Scroll Manager
 * Handles smooth scrolling and transitions across all pages
 */

class AutoScrollManager {
    constructor() {
        this.isScrolling = false;
        this.scrollOffset = 100; // Offset from top when scrolling to elements
        this.animationDuration = 800; // Duration for scroll animations
        this.init();
    }

    init() {
        this.setupFormFieldScrolling();
        this.setupDropdownScrolling();
        this.setupStepNavigation();
        this.setupSectionTransitions();
        this.setupKeyboardNavigation();
    }

    /**
     * Setup auto-scroll for form fields
     */
    setupFormFieldScrolling() {
        document.addEventListener('focus', (e) => {
            if (this.isFormField(e.target)) {
                this.scrollToElement(e.target, true);
            }
        }, true);

        document.addEventListener('click', (e) => {
            if (this.isFormField(e.target)) {
                setTimeout(() => {
                    this.scrollToElement(e.target, true);
                }, 100);
            }
        });
    }

    /**
     * Setup auto-scroll for dropdown selections
     */
    setupDropdownScrolling() {
        document.addEventListener('change', (e) => {
            if (e.target.tagName === 'SELECT') {
                this.handleDropdownChange(e.target);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'SELECT') {
                this.scrollToElement(e.target, true);
            }
        });
    }

    /**
     * Setup step-by-step navigation scrolling
     */
    setupStepNavigation() {
        // Handle booking steps
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('step-btn') || 
                e.target.classList.contains('next-step') ||
                e.target.classList.contains('prev-step')) {
                setTimeout(() => {
                    this.scrollToCurrentStep();
                }, 200);
            }
        });

        // Handle tab navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn') ||
                e.target.hasAttribute('data-tab')) {
                setTimeout(() => {
                    this.scrollToActiveTab();
                }, 200);
            }
        });
    }

    /**
     * Setup section transitions
     */
    setupSectionTransitions() {
        document.addEventListener('click', (e) => {
            // Handle navigation links
            if (e.target.classList.contains('nav-link') ||
                e.target.closest('.nav-link')) {
                const link = e.target.closest('.nav-link') || e.target;
                const href = link.getAttribute('href');
                
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.scrollToSection(href.substring(1));
                }
            }

            // Handle sidebar navigation
            if (e.target.classList.contains('sidebar-link') ||
                e.target.closest('.sidebar-link')) {
                setTimeout(() => {
                    this.scrollToTop();
                }, 100);
            }
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                setTimeout(() => {
                    const activeElement = document.activeElement;
                    if (this.isFormField(activeElement)) {
                        this.scrollToElement(activeElement, true);
                    }
                }, 100);
            }
        });
    }

    /**
     * Handle dropdown change events
     */
    handleDropdownChange(select) {
        const selectedValue = select.value;
        
        // Add visual feedback
        this.highlightSelection(select);
        
        // Scroll to next logical element
        const nextElement = this.findNextFormElement(select);
        if (nextElement) {
            setTimeout(() => {
                this.scrollToElement(nextElement, true);
                this.focusElement(nextElement);
            }, 300);
        }
        
        // Trigger any dependent field updates
        this.updateDependentFields(select);
    }

    /**
     * Scroll to current active step
     */
    scrollToCurrentStep() {
        const activeStep = document.querySelector('.step.active') ||
                          document.querySelector('.booking-step.active') ||
                          document.querySelector('.form-step.active');
        
        if (activeStep) {
            this.scrollToElement(activeStep);
        }
    }

    /**
     * Scroll to active tab content
     */
    scrollToActiveTab() {
        const activeTab = document.querySelector('.tab-content.active') ||
                         document.querySelector('.dashboard-section.active');
        
        if (activeTab) {
            this.scrollToElement(activeTab);
        }
    }

    /**
     * Scroll to a specific section
     */
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            this.scrollToElement(section);
        }
    }

    /**
     * Scroll to top of page
     */
    scrollToTop() {
        this.smoothScrollTo(0);
    }

    /**
     * Main scroll to element function
     */
    scrollToElement(element, withOffset = false) {
        if (!element || this.isScrolling) return;

        const rect = element.getBoundingClientRect();
        const offset = withOffset ? this.scrollOffset : 20;
        const targetY = window.pageYOffset + rect.top - offset;

        this.smoothScrollTo(targetY);
        
        // Add highlight effect
        this.addScrollHighlight(element);
    }

    /**
     * Smooth scroll to Y position
     */
    smoothScrollTo(targetY) {
        if (this.isScrolling) return;

        this.isScrolling = true;
        const startY = window.pageYOffset;
        const distance = targetY - startY;
        const startTime = performance.now();

        const scroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.animationDuration, 1);
            
            // Easing function for smooth animation
            const easeInOutCubic = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            window.scrollTo(0, startY + distance * easeInOutCubic);

            if (progress < 1) {
                requestAnimationFrame(scroll);
            } else {
                this.isScrolling = false;
            }
        };

        requestAnimationFrame(scroll);
    }

    /**
     * Add visual highlight when scrolling to element
     */
    addScrollHighlight(element) {
        const originalTransition = element.style.transition;
        
        element.style.transition = 'all 0.3s ease';
        element.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
        element.style.transform = 'scale(1.02)';
        
        setTimeout(() => {
            element.style.boxShadow = '';
            element.style.transform = '';
            element.style.transition = originalTransition;
        }, 600);
    }

    /**
     * Highlight dropdown selection
     */
    highlightSelection(select) {
        const originalBg = select.style.backgroundColor;
        
        select.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        select.style.transition = 'background-color 0.3s ease';
        
        setTimeout(() => {
            select.style.backgroundColor = originalBg;
        }, 500);
    }

    /**
     * Focus on element with visual feedback
     */
    focusElement(element) {
        if (this.isFormField(element)) {
            element.focus();
            
            // Add focus ring animation
            const originalOutline = element.style.outline;
            element.style.outline = '2px solid rgba(59, 130, 246, 0.8)';
            element.style.outlineOffset = '2px';
            
            setTimeout(() => {
                element.style.outline = originalOutline;
                element.style.outlineOffset = '';
            }, 1000);
        }
    }

    /**
     * Find next form element in tab order
     */
    findNextFormElement(currentElement) {
        const formElements = this.getAllFormElements();
        const currentIndex = Array.from(formElements).indexOf(currentElement);
        
        if (currentIndex >= 0 && currentIndex < formElements.length - 1) {
            return formElements[currentIndex + 1];
        }
        
        return null;
    }

    /**
     * Get all form elements on page
     */
    getAllFormElements() {
        return document.querySelectorAll(
            'input:not([type="hidden"]), select, textarea, button[type="submit"]'
        );
    }

    /**
     * Check if element is a form field
     */
    isFormField(element) {
        return element && (
            element.tagName === 'INPUT' ||
            element.tagName === 'SELECT' ||
            element.tagName === 'TEXTAREA' ||
            element.tagName === 'BUTTON'
        ) && element.type !== 'hidden';
    }

    /**
     * Update fields that depend on dropdown selection
     */
    updateDependentFields(select) {
        const selectName = select.name || select.id;
        
        // Handle specific dependencies
        switch (selectName) {
            case 'specialty':
            case 'doctor':
                this.updateDoctorDependentFields(select);
                break;
            case 'date':
                this.updateTimeslotFields(select);
                break;
            case 'country':
                this.updateStateFields(select);
                break;
        }
    }

    /**
     * Update doctor-dependent fields
     */
    updateDoctorDependentFields(select) {
        const timeSlotSelect = document.querySelector('select[name="timeslot"]') ||
                              document.querySelector('#timeslot');
        
        if (timeSlotSelect) {
            // Animate the timeslot field appearing
            timeSlotSelect.style.opacity = '0.5';
            setTimeout(() => {
                timeSlotSelect.style.opacity = '1';
                this.scrollToElement(timeSlotSelect, true);
            }, 200);
        }
    }

    /**
     * Update timeslot fields based on date selection
     */
    updateTimeslotFields(select) {
        const timeslotContainer = document.querySelector('.timeslot-container') ||
                                 document.querySelector('.time-slots');
        
        if (timeslotContainer) {
            timeslotContainer.style.opacity = '0.5';
            setTimeout(() => {
                timeslotContainer.style.opacity = '1';
                this.scrollToElement(timeslotContainer, true);
            }, 300);
        }
    }

    /**
     * Update state fields based on country selection
     */
    updateStateFields(select) {
        const stateSelect = document.querySelector('select[name="state"]') ||
                           document.querySelector('#state');
        
        if (stateSelect) {
            stateSelect.style.opacity = '0.5';
            setTimeout(() => {
                stateSelect.style.opacity = '1';
                this.scrollToElement(stateSelect, true);
            }, 200);
        }
    }

    /**
     * Add smooth transitions between form steps
     */
    addStepTransition(fromStep, toStep) {
        if (fromStep) {
            fromStep.style.opacity = '0';
            fromStep.style.transform = 'translateX(-30px)';
        }
        
        if (toStep) {
            toStep.style.opacity = '0';
            toStep.style.transform = 'translateX(30px)';
            
            setTimeout(() => {
                toStep.style.opacity = '1';
                toStep.style.transform = 'translateX(0)';
                this.scrollToElement(toStep);
            }, 200);
        }
    }

    /**
     * Initialize smooth transitions for existing elements
     */
    initializeTransitions() {
        const formElements = this.getAllFormElements();
        
        formElements.forEach(element => {
            if (!element.style.transition) {
                element.style.transition = 'all 0.3s ease';
            }
        });
        
        // Add transition styles to steps and sections
        const steps = document.querySelectorAll('.step, .form-step, .booking-step');
        steps.forEach(step => {
            step.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        });
    }
}

// Initialize auto-scroll manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.autoScrollManager = new AutoScrollManager();
    
    // Initialize transitions for existing elements
    setTimeout(() => {
        window.autoScrollManager.initializeTransitions();
    }, 100);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoScrollManager;
}