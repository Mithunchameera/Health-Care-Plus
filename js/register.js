/**
 * Multi-Step Registration Form Manager
 * Handles form validation, step navigation, and user experience
 */

class RegistrationFormManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStepDisplay();
        this.setupPasswordValidation();
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Next buttons
        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });

        // Back buttons
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });

        // Form submission
        const form = document.getElementById('registerForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Input validation on blur
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Auto-scroll on select changes
        document.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', (e) => {
                if (e.target.value) {
                    setTimeout(() => {
                        this.autoScrollToNext(e.target);
                    }, 300);
                }
            });
        });

        // Auto-scroll on important field completion
        document.querySelectorAll('input[type="email"], input[type="tel"]').forEach(input => {
            input.addEventListener('blur', (e) => {
                if (this.validateField(e.target) && e.target.value) {
                    setTimeout(() => {
                        this.autoScrollToNext(e.target);
                    }, 500);
                }
            });
        });
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateStepDisplay();
                this.smoothScrollToStep();
            }
        }
    }

    smoothScrollToStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            // Add transition effect
            currentStepElement.style.opacity = '0';
            currentStepElement.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                currentStepElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
                
                // Animate in the new step
                currentStepElement.style.transition = 'all 0.5s ease-in-out';
                currentStepElement.style.opacity = '1';
                currentStepElement.style.transform = 'translateY(0)';
                
                // Focus on first input
                const firstInput = currentStepElement.querySelector('input, select');
                if (firstInput) {
                    setTimeout(() => {
                        firstInput.focus();
                    }, 600);
                }
            }, 200);
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    updateStepDisplay() {
        // Update progress steps
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle('active', stepNumber === this.currentStep);
            step.classList.toggle('completed', stepNumber < this.currentStep);
        });

        // Update form steps
        document.querySelectorAll('.form-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle('active', stepNumber === this.currentStep);
        });

        // Scroll to top of form
        const registerCard = document.querySelector('.register-card');
        if (registerCard) {
            registerCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (!currentStepElement) return false;

        const inputs = currentStepElement.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            errorMessage = `${this.getFieldLabel(field)} is required`;
            isValid = false;
        }

        // Specific field validations
        if (value && isValid) {
            switch (fieldName) {
                case 'email':
                    if (!this.isValidEmail(value)) {
                        errorMessage = 'Please enter a valid email address';
                        isValid = false;
                    }
                    break;
                case 'phone':
                    if (!this.isValidPhone(value)) {
                        errorMessage = 'Please enter a valid phone number';
                        isValid = false;
                    }
                    break;
                case 'dateOfBirth':
                    const age = this.calculateAge(new Date(value));
                    if (age < 18) {
                        errorMessage = 'You must be at least 18 years old';
                        isValid = false;
                    }
                    break;
                case 'password':
                    const strength = this.calculatePasswordStrength(value);
                    if (strength.score < 3) {
                        errorMessage = 'Password is too weak. Please create a stronger password';
                        isValid = false;
                    }
                    break;
                case 'confirmPassword':
                    const password = document.getElementById('password')?.value;
                    if (value !== password) {
                        errorMessage = 'Passwords do not match';
                        isValid = false;
                    }
                    break;
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    setupPasswordValidation() {
        const passwordField = document.getElementById('password');
        if (passwordField) {
            passwordField.addEventListener('input', () => {
                this.updatePasswordStrength();
                this.updatePasswordRequirements();
            });
        }
    }

    updatePasswordStrength() {
        const passwordField = document.getElementById('password');
        if (!passwordField) return;

        const password = passwordField.value;
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        if (strengthBar && strengthText) {
            const strength = this.calculatePasswordStrength(password);
            strengthBar.style.width = strength.percentage + '%';
            strengthBar.className = 'strength-fill ' + strength.class;
            strengthText.textContent = strength.text;
        }
    }

    updatePasswordRequirements() {
        const passwordField = document.getElementById('password');
        if (!passwordField) return;

        const password = passwordField.value;
        
        const requirements = [
            { id: 'length-req', test: password.length >= 8 },
            { id: 'uppercase-req', test: /[A-Z]/.test(password) },
            { id: 'lowercase-req', test: /[a-z]/.test(password) },
            { id: 'number-req', test: /[0-9]/.test(password) }
        ];

        requirements.forEach(req => {
            const element = document.getElementById(req.id);
            if (element) {
                element.classList.toggle('valid', req.test);
                const icon = element.querySelector('i');
                if (icon) {
                    icon.className = req.test ? 'fas fa-check' : 'fas fa-times';
                }
            }
        });
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        return {
            score: score,
            percentage: (score / 5) * 100,
            class: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong',
            text: score <= 2 ? 'Weak password' : score <= 4 ? 'Medium strength' : 'Strong password'
        };
    }

    saveCurrentStepData() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (!currentStepElement) return;

        const inputs = currentStepElement.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                this.formData[input.name] = input.checked;
            } else {
                this.formData[input.name] = input.value;
            }
        });
    }

    handleFormSubmit(e) {
        if (this.currentStep !== this.totalSteps) {
            e.preventDefault();
            return;
        }

        if (!this.validateCurrentStep()) {
            e.preventDefault();
            return;
        }

        // Check terms agreement
        const termsCheckbox = document.querySelector('input[name="terms"]');
        if (termsCheckbox && !termsCheckbox.checked) {
            e.preventDefault();
            this.showNotification('Please agree to the terms and conditions', 'error');
            return;
        }

        // Form is valid, allow submission
        this.showNotification('Creating your account...', 'info');
    }

    setupFormValidation() {
        // Real-time validation for all fields
        document.querySelectorAll('input, select').forEach(field => {
            field.addEventListener('input', () => {
                if (field.value.trim()) {
                    this.validateField(field);
                }
            });
        });
    }

    showFieldError(field, message) {
        const errorElement = document.getElementById(field.id + '-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        field.style.borderColor = 'var(--error-color, #ef4444)';
    }

    clearFieldError(field) {
        const errorElement = document.getElementById(field.id + '-error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        field.style.borderColor = '';
    }

    getFieldLabel(field) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        return label ? label.textContent.replace(' *', '') : field.name;
    }

    calculateAge(birthDate) {
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1;
        }
        return age;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(cleanPhone);
    }

    showNotification(message, type) {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Password toggle function
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const button = field.nextElementSibling;
    if (!button) return;

    const icon = button.querySelector('i');
    if (!icon) return;
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        field.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Add auto-scroll methods to RegistrationFormManager
RegistrationFormManager.prototype.smoothScrollToStep = function() {
    const activeStep = document.querySelector('.form-step.active');
    if (activeStep) {
        activeStep.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
    }
};

RegistrationFormManager.prototype.autoScrollToNext = function(currentElement) {
    const formGroup = currentElement.closest('.form-group');
    if (formGroup) {
        // Find the next form group or next step
        let nextElement = formGroup.nextElementSibling;
        
        // If no next sibling in current step, try to find next step
        if (!nextElement) {
            const currentStep = currentElement.closest('.form-step');
            const nextStep = currentStep?.nextElementSibling;
            if (nextStep && nextStep.classList.contains('form-step')) {
                nextElement = nextStep.querySelector('.form-group');
            }
        }
        
        // Scroll to next element or try auto-advance to next step
        if (nextElement) {
            nextElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
            
            // Focus on the first input in the next form group
            const nextInput = nextElement.querySelector('input, select, textarea');
            if (nextInput) {
                setTimeout(() => {
                    nextInput.focus();
                }, 600);
            }
        } else {
            // Check if current step is complete and auto-advance
            if (this.validateCurrentStep()) {
                setTimeout(() => {
                    this.nextStep();
                }, 800);
            }
        }
    }
};

// Initialize the registration form manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('registerForm')) {
        new RegistrationFormManager();
    }
});