// Main JavaScript functionality for HealthCare+ website

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAnimations();
    initializeFormValidation();
    checkAuthStatus();
});

// Navigation functionality
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger menu
            const spans = navToggle.querySelectorAll('span');
            spans.forEach((span, index) => {
                try {
                    if (navMenu.classList.contains('active')) {
                        if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                        if (index === 1) span.style.opacity = '0';
                        if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                    } else {
                        span.style.transform = 'none';
                        span.style.opacity = '1';
                    }
                } catch (error) {
                    console.warn('Navigation animation error:', error);
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                });
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            // Skip if href is just '#' or empty
            if (!href || href === '#' || href.length <= 1) {
                return;
            }
            try {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            } catch (error) {
                console.warn('Invalid selector:', href);
            }
        });
    });
    
    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'var(--nav-bg)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = 'var(--nav-bg)';
                navbar.style.backdropFilter = 'blur(5px)';
            }
        }
    });
}

// Animation and scroll effects
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('theme-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .stat-item, .doctor-card').forEach(el => {
        observer.observe(el);
    });
    
    // Counter animation for stats
    animateCounters();
    
    // Initialize back to top button
    initializeBackToTop();
}

// Animate number counters
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    const speed = 100; // Animation speed
    
    counters.forEach(counter => {
        const animate = () => {
            const target = +counter.getAttribute('data-target');
            const current = +counter.innerText || 0;
            const increment = target / speed;
            
            if (current < target) {
                counter.innerText = Math.ceil(current + increment);
                setTimeout(animate, 20);
            } else {
                counter.innerText = target;
            }
        };
        
        // Start animation when element is visible
        const observer = new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting) {
                animate();
                observer.disconnect();
            }
        }, {
            threshold: 0.5
        });
        
        observer.observe(counter);
    });
}

// Form validation and enhancement
function initializeFormValidation() {
    // Real-time email validation
    document.querySelectorAll('input[type="email"]').forEach(emailInput => {
        emailInput.addEventListener('blur', function() {
            validateEmail(this);
        });
        
        emailInput.addEventListener('input', function() {
            clearValidationError(this);
        });
    });
    
    // Real-time phone validation
    document.querySelectorAll('input[type="tel"]').forEach(phoneInput => {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
        
        phoneInput.addEventListener('blur', function() {
            validatePhone(this);
        });
    });
    
    // Password strength validation
    document.querySelectorAll('input[type="password"]').forEach(passwordInput => {
        if (passwordInput.id === 'password') {
            passwordInput.addEventListener('input', function() {
                validatePasswordStrength(this);
            });
        }
    });
    
    // Form submission handling
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                return false;
            }
        });
    });
}

// Validation functions
function validateEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(input.value);
    
    if (!isValid && input.value) {
        showInputError(input, 'Please enter a valid email address');
        return false;
    } else {
        clearInputError(input);
        return true;
    }
}

function validatePhone(input) {
    const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
    const cleanPhone = input.value.replace(/\D/g, '');
    const isValid = phoneRegex.test(cleanPhone);
    
    if (!isValid && input.value) {
        showInputError(input, 'Please enter a valid phone number');
        return false;
    } else {
        clearInputError(input);
        return true;
    }
}

function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{3})/, '($1) $2');
    }
    input.value = value;
}

function validatePasswordStrength(input) {
    if (!input || !input.value) return;
    
    const password = input.value;
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let score = 0;
    const checks = [
        password.length >= 8,
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /\d/.test(password),
        /[^a-zA-Z\d]/.test(password)
    ];
    
    score = checks.filter(check => check).length;
    
    const strengthLevels = [
        { percentage: 20, class: 'weak', text: 'Very Weak' },
        { percentage: 40, class: 'weak', text: 'Weak' },
        { percentage: 60, class: 'medium', text: 'Medium' },
        { percentage: 80, class: 'strong', text: 'Strong' },
        { percentage: 100, class: 'very-strong', text: 'Very Strong' }
    ];
    
    const strength = strengthLevels[score] || strengthLevels[0];
    
    try {
        strengthBar.style.width = strength.percentage + '%';
        strengthBar.className = 'strength-fill ' + strength.class;
        strengthText.textContent = strength.text;
    } catch (error) {
        console.warn('Password strength validation error:', error);
    }
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            showInputError(input, 'This field is required');
            isValid = false;
        } else {
            // Type-specific validation
            if (input.type === 'email' && !validateEmail(input)) {
                isValid = false;
            } else if (input.type === 'tel' && !validatePhone(input)) {
                isValid = false;
            }
        }
    });
    
    // Password confirmation validation
    const password = form.querySelector('#password');
    const confirmPassword = form.querySelector('#confirmPassword');
    
    if (password && confirmPassword) {
        if (password.value !== confirmPassword.value) {
            showInputError(confirmPassword, 'Passwords do not match');
            isValid = false;
        }
    }
    
    return isValid;
}

function showInputError(input, message) {
    clearInputError(input);
    
    input.style.borderColor = 'var(--error-color)';
    
    const errorElement = document.createElement('div');
    errorElement.className = 'input-error';
    errorElement.textContent = message;
    errorElement.style.color = 'var(--error-color)';
    errorElement.style.fontSize = '0.8rem';
    errorElement.style.marginTop = '0.25rem';
    
    input.parentNode.insertAdjacentElement('afterend', errorElement);
}

function clearInputError(input) {
    input.style.borderColor = 'var(--border-color)';
    const errorElement = input.parentNode.parentNode.querySelector('.input-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function clearValidationError(input) {
    clearInputError(input);
}

// Authentication status check
async function checkAuthStatus() {
    try {
        const response = await fetch('php/session-handler.php');
        const data = await response.json();
        
        if (data.authenticated) {
            // Check if we're on the home page and redirect to dashboard
            const currentPage = window.location.pathname;
            if (currentPage === '/' || currentPage === '/index.html' || currentPage.endsWith('index.html')) {
                // Redirect to appropriate dashboard based on user role
                if (data.user.role === 'admin') {
                    window.location.href = 'dashboard-admin.html';
                } else if (data.user.role === 'doctor') {
                    window.location.href = 'dashboard-doctor.html';
                } else {
                    window.location.href = 'dashboard-patient.html';
                }
                return;
            }
            
            updateUIForAuthenticatedUser(data.user);
        }
    } catch (error) {
        console.log('Auth check failed:', error);
    }
}

function updateUIForAuthenticatedUser(user) {
    const loginLink = document.querySelector('a[href="login.html"]');
    if (loginLink) {
        // Replace login link with dashboard button
        loginLink.textContent = 'Dashboard';
        loginLink.className = 'nav-link dashboard-link';
        
        // Set dashboard redirect based on user role
        if (user.role === 'admin') {
            loginLink.href = 'dashboard-admin.html';
        } else if (user.role === 'doctor') {
            loginLink.href = 'dashboard-doctor.html';
        } else {
            loginLink.href = 'dashboard-patient.html';
        }
        
        // Remove click prevention
        loginLink.onclick = null;
        
        // Add logout functionality
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.className = 'nav-link';
        logoutLink.textContent = 'Logout';
        logoutLink.addEventListener('click', logout);
        
        loginLink.parentNode.insertBefore(logoutLink, loginLink.nextSibling);
    }
}

async function logout() {
    try {
        const response = await fetch('php/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=logout'
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Notification system
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add icon based on type
    const icon = document.createElement('i');
    switch (type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle';
            break;
        default:
            icon.className = 'fas fa-info-circle';
    }
    
    notification.insertBefore(icon, notification.firstChild);
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.remove();
    });
}

// Utility functions
function debounce(func, wait) {
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

function throttle(func, limit) {
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

// Loading state management
function showLoading(element) {
    if (element) {
        element.style.opacity = '0.6';
        element.style.pointerEvents = 'none';
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-overlay';
        spinner.innerHTML = '<div class="spinner"></div>';
        spinner.style.position = 'absolute';
        spinner.style.top = '0';
        spinner.style.left = '0';
        spinner.style.right = '0';
        spinner.style.bottom = '0';
        spinner.style.display = 'flex';
        spinner.style.alignItems = 'center';
        spinner.style.justifyContent = 'center';
        spinner.style.background = 'rgba(255, 255, 255, 0.8)';
        spinner.style.zIndex = '1000';
        
        element.style.position = 'relative';
        element.appendChild(spinner);
    }
}

function hideLoading(element) {
    if (element) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
        
        const overlay = element.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

// Local storage utilities
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('LocalStorage error:', error);
    }
}

function getLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('LocalStorage error:', error);
        return null;
    }
}

function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('LocalStorage error:', error);
    }
}

// Global Auto-Scroll Functionality
function initializeAutoScroll() {
    // Auto-scroll for select elements
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', function(e) {
            if (e.target.value && e.target.value !== '') {
                setTimeout(() => {
                    autoScrollToNext(e.target);
                }, 300);
            }
        });
    });

    // Auto-scroll for important form fields
    document.querySelectorAll('input[type="email"], input[type="tel"], input[type="date"]').forEach(input => {
        input.addEventListener('blur', function(e) {
            if (e.target.value && validateInputField(e.target)) {
                setTimeout(() => {
                    autoScrollToNext(e.target);
                }, 500);
            }
        });
    });

    // Auto-scroll for radio button groups
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function(e) {
            setTimeout(() => {
                autoScrollToNext(e.target);
            }, 400);
        });
    });
}

function autoScrollToNext(currentElement) {
    const nextElement = findNextScrollTarget(currentElement);
    
    if (nextElement) {
        // Enhanced smooth scroll with better timing
        nextElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
        
        addScrollHighlight(nextElement);
        
        const nextInput = nextElement.querySelector('input, select, textarea, button');
        if (nextInput && !nextInput.disabled && nextInput.type !== 'hidden') {
            setTimeout(() => {
                nextInput.focus();
                if (nextInput.type === 'text' || nextInput.type === 'email' || nextInput.type === 'tel') {
                    nextInput.select();
                }
            }, 800);
        }
    } else {
        // Check if we need to go to next step/page
        const currentStep = currentElement.closest('.form-step, .booking-step');
        if (currentStep) {
            const nextButton = currentStep.querySelector('.btn-next, .next-step, [onclick*="nextStep"]');
            if (nextButton && !nextButton.disabled) {
                setTimeout(() => {
                    nextButton.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    addScrollHighlight(nextButton);
                }, 500);
            }
        }
    }
}

function findNextScrollTarget(currentElement) {
    const formGroup = currentElement.closest('.form-group, .input-group, .field-group');
    if (!formGroup) return null;
    
    let nextElement = formGroup.nextElementSibling;
    while (nextElement && !isValidScrollTarget(nextElement)) {
        nextElement = nextElement.nextElementSibling;
    }
    
    if (!nextElement) {
        const currentSection = currentElement.closest('.form-step, .booking-step, .content-section, section');
        if (currentSection) {
            const nextSection = currentSection.nextElementSibling;
            if (nextSection && isValidScrollTarget(nextSection)) {
                nextElement = nextSection.querySelector('.form-group, .input-group, .field-group');
            }
        }
    }
    
    if (!nextElement) {
        const container = currentElement.closest('.form-grid, .form-container, .booking-container');
        if (container) {
            const allFormGroups = container.querySelectorAll('.form-group, .input-group, .field-group');
            const currentIndex = Array.from(allFormGroups).indexOf(formGroup);
            if (currentIndex >= 0 && currentIndex < allFormGroups.length - 1) {
                nextElement = allFormGroups[currentIndex + 1];
            }
        }
    }
    
    return nextElement;
}

function isValidScrollTarget(element) {
    return element && 
           element.offsetHeight > 0 && 
           element.offsetWidth > 0 && 
           !element.hidden &&
           getComputedStyle(element).display !== 'none';
}

function addScrollHighlight(element) {
    element.style.transition = 'box-shadow 0.3s ease, transform 0.3s ease';
    element.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.2)';
    element.style.transform = 'translateY(-2px)';
    
    setTimeout(() => {
        element.style.boxShadow = '';
        element.style.transform = '';
        setTimeout(() => {
            element.style.transition = '';
        }, 300);
    }, 1000);
}

function validateInputField(input) {
    if (input.type === 'email') {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
    }
    if (input.type === 'tel') {
        return input.value.length >= 10;
    }
    if (input.type === 'date') {
        return input.value !== '';
    }
    return input.value.trim() !== '';
}

// Initialize auto-scroll and back to top when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeAutoScroll();
    initializeBackToTop();
});

// Export functions for use in other modules
window.HealthCare = {
    showNotification,
    showLoading,
    hideLoading,
    setLocalStorage,
    getLocalStorage,
    removeLocalStorage,
    validateEmail,
    validatePhone,
    debounce,
    throttle,
    autoScrollToNext,
    initializeAutoScroll,
    initializeBackToTop
};

// Initialize back to top button
function initializeBackToTop() {
    // Create back to top button
    const backToTopButton = document.createElement('a');
    backToTopButton.href = '#';
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    
    // Add to body
    document.body.appendChild(backToTopButton);
    
    // Show/hide button on scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // Smooth scroll to top
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
