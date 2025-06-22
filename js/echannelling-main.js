// eChannelling Main JavaScript

class EChannellingApp {
    constructor() {
        this.initializeApp();
        this.setupEventListeners();
        this.loadDoctorData();
    }

    initializeApp() {
        // Mobile menu functionality
        this.setupMobileMenu();
        
        // Smooth scrolling for navigation
        this.setupSmoothScrolling();
        
        // Form interactions
        this.setupFormHandlers();
        
        // Animation on scroll
        this.setupScrollAnimations();
        
        console.log('eChannelling app initialized');
    }

    setupEventListeners() {
        // This method was being called but not defined - adding it for compatibility
        this.setupMobileMenu();
        this.setupSmoothScrolling();
    }

    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mainNav = document.querySelector('.main-nav');

        if (mobileToggle && mainNav) {
            mobileToggle.addEventListener('click', () => {
                mobileToggle.classList.toggle('active');
                mainNav.classList.toggle('mobile-open');
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileToggle.contains(e.target) && !mainNav.contains(e.target)) {
                    mobileToggle.classList.remove('active');
                    mainNav.classList.remove('mobile-open');
                }
            });
        }
    }

    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80; // Account for fixed header
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
                
                // Close mobile menu if open
                document.querySelector('.main-nav').classList.remove('mobile-open');
                document.querySelector('.mobile-menu-toggle').classList.remove('active');
            });
        });
    }

    setupFormHandlers() {
        const searchForm = document.querySelector('.search-form');
        const specialitySelect = document.getElementById('speciality');
        const doctorSelect = document.getElementById('doctor');
        const hospitalSelect = document.getElementById('hospital');

        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearchSubmit();
            });
        }

        if (specialitySelect) {
            specialitySelect.addEventListener('change', () => {
                this.updateDoctorOptions(specialitySelect.value);
            });
        }
    }

    loadDoctorData() {
        // Mock doctor data - in real implementation, this would come from API
        this.doctorData = {
            cardiology: [
                { id: 1, name: 'Dr. Kasun Perera', hospital: 'Apollo Hospital' },
                { id: 2, name: 'Dr. Nimal Silva', hospital: 'Asiri Hospital' },
                { id: 3, name: 'Dr. Sunil Fernando', hospital: 'Nawaloka Hospital' }
            ],
            dermatology: [
                { id: 4, name: 'Dr. Chamari Wijesinghe', hospital: 'Durdans Hospital' },
                { id: 5, name: 'Dr. Rohan Jayawardena', hospital: 'Apollo Hospital' },
                { id: 6, name: 'Dr. Priya Mendis', hospital: 'Asiri Hospital' }
            ],
            'general-medicine': [
                { id: 7, name: 'Dr. Sampath Rajapakse', hospital: 'Nawaloka Hospital' },
                { id: 8, name: 'Dr. Malini Gunasekara', hospital: 'Apollo Hospital' },
                { id: 9, name: 'Dr. Chandana Senanayake', hospital: 'Durdans Hospital' }
            ],
            orthopedic: [
                { id: 10, name: 'Dr. Ranjith Perera', hospital: 'Asiri Hospital' },
                { id: 11, name: 'Dr. Thilak Bandara', hospital: 'Apollo Hospital' },
                { id: 12, name: 'Dr. Manjula Wijesekara', hospital: 'Nawaloka Hospital' }
            ],
            pediatrics: [
                { id: 13, name: 'Dr. Sandya Amarasinghe', hospital: 'Durdans Hospital' },
                { id: 14, name: 'Dr. Chatura Wickramasinghe', hospital: 'Apollo Hospital' },
                { id: 15, name: 'Dr. Kumari Liyanage', hospital: 'Asiri Hospital' }
            ],
            psychiatry: [
                { id: 16, name: 'Dr. Mahesh Rajapakse', hospital: 'Nawaloka Hospital' },
                { id: 17, name: 'Dr. Nelum Gunasekara', hospital: 'Apollo Hospital' }
            ],
            surgery: [
                { id: 18, name: 'Dr. Piyal Fernando', hospital: 'Durdans Hospital' },
                { id: 19, name: 'Dr. Ruwan Dissanayake', hospital: 'Asiri Hospital' },
                { id: 20, name: 'Dr. Kapila Jayasuriya', hospital: 'Nawaloka Hospital' }
            ]
        };
    }

    updateDoctorOptions(speciality) {
        const doctorSelect = document.getElementById('doctor');
        
        if (!doctorSelect || !speciality) return;

        // Clear existing options
        doctorSelect.innerHTML = '<option value="">Choose Doctor</option>';

        // Add doctors for selected speciality
        if (this.doctorData[speciality]) {
            this.doctorData[speciality].forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = doctor.name;
                option.dataset.hospital = doctor.hospital;
                doctorSelect.appendChild(option);
            });
        }

        // Auto-scroll to next field
        this.smoothScrollToElement(doctorSelect);
    }

    handleSearchSubmit() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('.btn-search');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Searching...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            this.showSearchResults(formData);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    getFormData() {
        return {
            speciality: document.getElementById('speciality')?.value || '',
            doctor: document.getElementById('doctor')?.value || '',
            hospital: document.getElementById('hospital')?.value || '',
            date: document.getElementById('appointment-date')?.value || ''
        };
    }

    validateForm(formData) {
        const requiredFields = ['speciality', 'date'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            this.showNotification('Please fill in all required fields', 'error');
            return false;
        }

        // Validate date is not in the past
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            this.showNotification('Please select a future date', 'error');
            return false;
        }

        return true;
    }

    showSearchResults(formData) {
        // In a real implementation, this would navigate to results page
        const message = `Search completed for ${formData.speciality} ${formData.doctor ? 'with ' + this.getDoctorName(formData.doctor) : ''} on ${formData.date}`;
        this.showNotification(message, 'success');
        
        // For demo purposes, show alert
        alert('Search functionality will redirect to doctor listings page with available time slots.');
    }

    getDoctorName(doctorId) {
        for (const speciality in this.doctorData) {
            const doctor = this.doctorData[speciality].find(d => d.id == doctorId);
            if (doctor) return doctor.name;
        }
        return '';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            minWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // Set background color based on type
        const colors = {
            success: '#0CC029',
            error: '#ef4444',
            warning: '#FFD21D',
            info: '#0057a4'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.service-card, .speciality-card, .feature-item');
        animateElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    smoothScrollToElement(element) {
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
}

// Language switching functionality
class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {
            en: {
                'Find a Doctor': 'Find a Doctor',
                'Book Appointment': 'Book Appointment',
                'Online': 'Online',
                'Choose Speciality': 'Choose Speciality',
                'Choose Doctor': 'Choose Doctor',
                'Choose Hospital': 'Choose Hospital',
                'Search Doctors': 'Search Doctors'
            },
            si: {
                'Find a Doctor': 'වෛද්‍යවරයකු සොයන්න',
                'Book Appointment': 'හමුවීම් වේලාව',
                'Online': 'අන්තර්ජාලය',
                'Choose Speciality': 'විශේෂත්වය තෝරන්න',
                'Choose Doctor': 'වෛද්‍යවරයා තෝරන්න',
                'Choose Hospital': 'රෝහල තෝරන්න',
                'Search Doctors': 'වෛද්‍යවරුන් සොයන්න'
            }
        };
        this.setupLanguageToggle();
    }

    setupLanguageToggle() {
        const langBtn = document.querySelector('.btn-language');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'si' : 'en';
        this.updatePageContent();
        this.updateLanguageButton();
    }

    updatePageContent() {
        // Update translatable elements
        const translatableElements = document.querySelectorAll('[data-translate]');
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (this.translations[this.currentLanguage][key]) {
                element.textContent = this.translations[this.currentLanguage][key];
            }
        });
    }

    updateLanguageButton() {
        const langBtn = document.querySelector('.btn-language');
        if (langBtn) {
            langBtn.textContent = this.currentLanguage === 'en' ? 'EN | සිං' : 'සිං | EN';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EChannellingApp();
    new LanguageManager();
    
    // Set minimum date for appointment date input
    const appointmentDateInput = document.getElementById('appointment-date');
    if (appointmentDateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        appointmentDateInput.min = tomorrow.toISOString().split('T')[0];
    }
});

// Add CSS for scroll animations
const animationStyles = `
.animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
}

.service-card.animate-on-scroll {
    transition-delay: 0.1s;
}

.service-card:nth-child(2).animate-on-scroll {
    transition-delay: 0.2s;
}

.service-card:nth-child(3).animate-on-scroll {
    transition-delay: 0.3s;
}

.service-card:nth-child(4).animate-on-scroll {
    transition-delay: 0.4s;
}
`;

// Inject animation styles
const mainStyleSheet = document.createElement('style');
mainStyleSheet.textContent = animationStyles;
document.head.appendChild(mainStyleSheet);