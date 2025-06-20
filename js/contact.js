/**
 * Contact Form Handler
 * Handles form submission and messaging integration
 */

class ContactFormManager {
    constructor() {
        this.form = null;
        this.submitButton = null;
        this.isSubmitting = false;
        this.init();
    }

    init() {
        this.form = document.getElementById('contactForm');
        if (!this.form) return;

        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.setupEventListeners();
        this.setupFormValidation();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    setupFormValidation() {
        // Email validation
        const emailInput = this.form.querySelector('#email');
        if (emailInput) {
            emailInput.addEventListener('input', () => {
                if (emailInput.value && !this.isValidEmail(emailInput.value)) {
                    this.showFieldError(emailInput, 'Please enter a valid email address');
                } else {
                    this.clearFieldError(emailInput);
                }
            });
        }

        // Phone validation
        const phoneInput = this.form.querySelector('#phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', () => {
                this.formatPhoneNumber(phoneInput);
            });
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        console.log('Form submission started');
        
        if (this.isSubmitting) {
            console.log('Already submitting, ignoring');
            return;
        }
        
        if (!this.validateForm()) {
            console.log('Form validation failed');
            this.showNotification('Please fill in all required fields correctly', 'error');
            return;
        }

        this.isSubmitting = true;
        this.showLoading();
        console.log('Loading state shown');

        try {
            const formData = this.collectFormData();
            console.log('Form data collected:', formData);
            
            const response = await this.submitMessage(formData);
            console.log('Response received:', response);
            
            if (response.success) {
                console.log('Success response, showing success message');
                this.showSuccessMessage(response);
                // Reset form after successful submission
                setTimeout(() => {
                    this.resetForm();
                    console.log('Form reset completed after successful submission');
                }, 1000);
            } else {
                throw new Error(response.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            this.showNotification(error.message || 'Failed to send message. Please try again.', 'error');
        } finally {
            this.isSubmitting = false;
            this.hideLoading();
            console.log('Submission completed, loading state hidden');
        }
    }

    collectFormData() {
        const formData = new FormData(this.form);
        return {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
    }

    async submitMessage(data) {
        console.log('Submitting contact form data:', data);
        
        const response = await fetch('php/contact-handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Response data:', result);
        return result;
    }

    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');
        
        // Clear all existing errors first
        const existingErrors = this.form.querySelectorAll('.field-error');
        existingErrors.forEach(error => error.remove());
        
        const errorFields = this.form.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            // Scroll to first error field
            const firstErrorField = this.form.querySelector('.error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorField.focus();
            }
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            errorMessage = `${this.getFieldLabel(field)} is required`;
            isValid = false;
        }
        // Email validation
        else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            errorMessage = 'Please enter a valid email address';
            isValid = false;
        }
        // Phone validation - more flexible for different formats
        else if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/; // Basic international format
            const digitsOnly = value.replace(/\D/g, '');
            if (digitsOnly.length < 10 || digitsOnly.length > 15) {
                errorMessage = 'Please enter a valid phone number (10-15 digits)';
                isValid = false;
            }
        }
        // Message length validation
        else if (field.name === 'message' && value && value.length < 10) {
            errorMessage = 'Message must be at least 10 characters long';
            isValid = false;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    getFieldLabel(field) {
        const label = field.parentNode.querySelector('label');
        return label ? label.textContent : field.name;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    formatPhoneNumber(input) {
        // Allow more flexible phone number formats
        let value = input.value;
        
        // Only format if it looks like a US number (starts with digit, no country code)
        if (/^\d/.test(value) && !value.startsWith('+')) {
            value = value.replace(/\D/g, '');
            if (value.length >= 10) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})/, '($1) $2-');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})/, '($1) ');
            }
            input.value = value;
        }
        // For international numbers or other formats, leave as-is
    }

    showLoading() {
        if (this.submitButton) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        }
    }

    hideLoading() {
        if (this.submitButton) {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = 'Send Message';
        }
    }

    showSuccessMessage(response) {
        console.log('Creating success modal');
        
        // Remove any existing modals first
        const existingModals = document.querySelectorAll('.success-modal');
        existingModals.forEach(modal => modal.remove());
        
        // Create success modal
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div class="modal-overlay" style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
            "></div>
            <div class="modal-content" style="
                position: relative;
                background: var(--card-bg, #ffffff);
                color: var(--text-color, #333333);
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 90%;
                text-align: center;
                animation: modalSlideIn 0.3s ease-out;
            ">
                <div class="success-icon" style="
                    font-size: 4rem;
                    color: #22c55e;
                    margin-bottom: 1rem;
                ">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 style="
                    margin-bottom: 1rem;
                    color: var(--text-color, #333333);
                    font-size: 1.5rem;
                ">Message Sent Successfully!</h3>
                <p style="
                    margin-bottom: 1rem;
                    color: var(--text-secondary, #666666);
                    line-height: 1.5;
                ">Thank you for contacting us. We have received your message and will respond within 24 hours.</p>
                <p style="
                    margin-bottom: 2rem;
                    color: var(--text-color, #333333);
                    font-weight: 500;
                "><strong>Message ID:</strong> ${response.message_id}</p>
                <div class="modal-actions" style="
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                ">
                    <button class="btn btn-primary close-modal" style="
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    ">
                        Close
                    </button>
                    <a href="dashboard-admin.html?tab=messages" class="btn btn-secondary" style="
                        background: transparent;
                        color: var(--primary-color, #3b82f6);
                        border: 2px solid var(--primary-color, #3b82f6);
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        text-decoration: none;
                        font-weight: 500;
                        transition: all 0.3s ease;
                        display: inline-block;
                    ">
                        View in Admin Dashboard
                    </a>
                </div>
            </div>
        `;
        
        // Add animation keyframes to document
        if (!document.querySelector('#modal-animations')) {
            const style = document.createElement('style');
            style.id = 'modal-animations';
            style.textContent = `
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(modal);
        console.log('Success modal added to DOM');
        
        // Add close button event listener
        const closeButton = modal.querySelector('.close-modal');
        closeButton.addEventListener('click', () => {
            console.log('Close button clicked');
            modal.remove();
        });
        
        // Close on overlay click
        const overlay = modal.querySelector('.modal-overlay');
        overlay.addEventListener('click', () => {
            console.log('Overlay clicked');
            modal.remove();
        });
        
        // Close on Escape key
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                console.log('Escape key pressed');
                modal.remove();
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
        
        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                console.log('Auto-removing modal after timeout');
                modal.remove();
            }
        }, 15000);
        
        console.log('Success modal setup completed');
    }

    resetForm() {
        this.form.reset();
        const errors = this.form.querySelectorAll('.field-error');
        errors.forEach(error => error.remove());
        
        const errorFields = this.form.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
        
        console.log('Form reset completed');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-bg);
            color: var(--text-color);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border-left: 4px solid ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : 'var(--primary-color)'};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            max-width: 400px;
        `;
        
        const icon = type === 'error' ? 'fas fa-exclamation-circle' : 
                    type === 'success' ? 'fas fa-check-circle' : 
                    'fas fa-info-circle';
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="${icon}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize contact form manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactFormManager();
});