// eChannelling Sign-in Page JavaScript

class EChannellingSignIn {
    constructor() {
        this.form = document.getElementById('signin-form');
        this.isLoading = false;
        this.initializeSignIn();
    }

    initializeSignIn() {
        this.setupFormHandler();
        this.setupPasswordToggle();
        this.setupFormValidation();
        this.setupRememberMe();
    }

    setupFormHandler() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    setupPasswordToggle() {
        window.togglePassword = (button) => {
            const input = button.parentElement.querySelector('input[type="password"], input[type="text"]');
            const icon = button.querySelector('svg');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.innerHTML = `
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                `;
            } else {
                input.type = 'password';
                icon.innerHTML = `
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                `;
            }
        };
    }

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        let isValid = true;
        let errorMessage = '';

        // Clear previous error
        this.clearFieldError(field);

        // Required validation
        if (!value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email/Member ID validation
        if (fieldType === 'text' && value) {
            // Check if it's an email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            // Check if it's a NIC (Sri Lankan format)
            const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
            // Check if it's a member ID (alphanumeric)
            const memberIdRegex = /^[A-Za-z0-9]+$/;
            
            if (!emailRegex.test(value) && !nicRegex.test(value) && !memberIdRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email, NIC, or member ID';
            }
        }

        // Password validation
        if (fieldType === 'password' && value && value.length < 6) {
            isValid = false;
            errorMessage = 'Password must be at least 6 characters';
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('form-error');
        
        // Remove existing error
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentElement.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('form-error');
        const errorMessage = field.parentElement.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const formData = new FormData(this.form);
        const loginData = {
            identifier: this.form.querySelector('input[type="text"]').value,
            password: formData.get('password'),
            remember: this.form.querySelector('input[type="checkbox"]').checked
        };

        // Validate all fields
        const inputs = this.form.querySelectorAll('input[required]');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showNotification('Please correct the errors below', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Simulate API call
            await this.authenticateUser(loginData);
            
            this.showNotification('Sign in successful! Redirecting...', 'success');
            
            // Store session if remember me is checked
            if (loginData.remember) {
                localStorage.setItem('echannelling_remember', 'true');
            }
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                const userData = JSON.parse(sessionStorage.getItem('echannelling_user'));
                if (userData && userData.redirect) {
                    window.location.href = userData.redirect;
                } else {
                    window.location.href = 'patient-dashboard.html';
                }
            }, 1500);

        } catch (error) {
            this.showNotification(error.message || 'Invalid credentials. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    async authenticateUser(credentials) {
        // Simulate authentication
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Mock authentication logic
                if (credentials.identifier && credentials.password) {
                    // Store user data in session
                    const userData = {
                        identifier: credentials.identifier,
                        loginTime: new Date().toISOString()
                    };
                    
                    // Simulate different user types
                    if (credentials.identifier.includes('admin')) {
                        userData.role = 'admin';
                        userData.redirect = 'admin-dashboard.html';
                    } else if (credentials.identifier.includes('doctor')) {
                        userData.role = 'doctor';
                        userData.redirect = 'doctor-dashboard.html';
                    } else {
                        userData.role = 'patient';
                        userData.redirect = 'patient-dashboard.html';
                    }
                    
                    // Store in session
                    sessionStorage.setItem('echannelling_user', JSON.stringify(userData));
                    
                    resolve(userData);
                } else {
                    reject(new Error('Please enter valid credentials'));
                }
            }, 1500);
        });
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        const submitBtn = this.form.querySelector('button[type="submit"]');
        
        if (loading) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="flex items-center justify-center">
                    <svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Signing in...
                </span>
            `;
        } else {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <span class="flex items-center justify-center">
                    Sign in
                    <svg class="w-4 group-hover:ml-0 -ml-7 group-hover:opacity-100 opacity-0 duration-200 stroke-current stroke-2 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                </span>
            `;
        }
    }

    setupRememberMe() {
        // Check if user should be remembered
        const shouldRemember = localStorage.getItem('echannelling_remember');
        if (shouldRemember) {
            const checkbox = this.form.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = true;
            }
        }
    }

    showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
        
        // Set colors based on type
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-black',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EChannellingSignIn();
});

// Add mobile number functionality
document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.querySelector('button:contains("Mobile number")');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            alert('Mobile number sign-in option will be implemented in the next version.');
        });
    }
});