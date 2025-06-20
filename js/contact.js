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
        
        if (this.isSubmitting) return;
        
        if (!this.validateForm()) {
            this.showNotification('Please fix the errors in the form', 'error');
            return;
        }

        this.isSubmitting = true;
        this.showLoading();

        try {
            const formData = this.collectFormData();
            const response = await this.submitMessage(formData);
            
            if (response.success) {
                this.showSuccessMessage(response);
                this.resetForm();
            } else {
                throw new Error(response.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            this.showNotification(error.message || 'Failed to send message. Please try again.', 'error');
        } finally {
            this.isSubmitting = false;
            this.hideLoading();
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
        const response = await fetch('php/contact-handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

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
        // Phone validation
        else if (field.type === 'tel' && value && value.length < 10) {
            errorMessage = 'Please enter a valid phone number';
            isValid = false;
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
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 10) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})/, '($1) $2-');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})/, '($1) ');
        }
        input.value = value;
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
        // Create success modal
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for contacting us. We have received your message and will respond within 24 hours.</p>
                <p><strong>Message ID:</strong> ${response.message_id}</p>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="this.closest('.success-modal').remove()">
                        Close
                    </button>
                    <a href="dashboard-admin.html?tab=messages" class="btn btn-secondary">
                        View in Admin Dashboard
                    </a>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 10000);
    }

    resetForm() {
        this.form.reset();
        const errors = this.form.querySelectorAll('.field-error');
        errors.forEach(error => error.remove());
        
        const errorFields = this.form.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
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