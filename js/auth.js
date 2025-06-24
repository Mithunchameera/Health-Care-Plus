// Authentication JavaScript for eChannelling

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.initializeAuth();
    }

    initializeAuth() {
        this.setupFormHandlers();
        this.setupPasswordStrength();
        this.setupSocialLogin();
        this.checkAuthStatus();
    }

    setupFormHandlers() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('register-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        }
    }

    checkPasswordStrength(password) {
        const strengthBar = document.getElementById('strength-bar');
        const strengthText = document.getElementById('strength-text');
        
        if (!strengthBar || !strengthText) return;

        let strength = 0;
        let feedback = '';

        // Check password criteria
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        // Remove existing classes
        strengthBar.className = 'strength-bar';

        switch (strength) {
            case 0:
            case 1:
                strengthBar.classList.add('weak');
                feedback = 'Weak password';
                break;
            case 2:
                strengthBar.classList.add('fair');
                feedback = 'Fair password';
                break;
            case 3:
            case 4:
                strengthBar.classList.add('good');
                feedback = 'Good password';
                break;
            case 5:
                strengthBar.classList.add('strong');
                feedback = 'Strong password';
                break;
        }

        strengthText.textContent = feedback;
    }

    setupSocialLogin() {
        // Social login will be implemented with actual OAuth providers
        console.log('Social login setup complete');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
            remember: formData.get('remember') === 'on'
        };

        // Show loading state
        const submitBtn = e.target.querySelector('.btn-auth-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing In...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await this.simulateAuthRequest();
            
            // Mock user data
            this.currentUser = {
                id: 1,
                email: loginData.email,
                name: 'John Doe',
                role: 'patient',
                avatar: null
            };

            // Store user session
            if (loginData.remember) {
                localStorage.setItem('echannelling_user', JSON.stringify(this.currentUser));
            } else {
                sessionStorage.setItem('echannelling_user', JSON.stringify(this.currentUser));
            }

            this.showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect based on user role
            setTimeout(() => {
                this.redirectAfterLogin(this.currentUser.role);
            }, 1500);

        } catch (error) {
            this.showNotification('Invalid email or password. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const registerData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            dateOfBirth: formData.get('dateOfBirth'),
            gender: formData.get('gender'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            terms: formData.get('terms') === 'on',
            newsletter: formData.get('newsletter') === 'on'
        };

        // Validation
        if (!this.validateRegistration(registerData)) {
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('.btn-auth-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await this.simulateAuthRequest();
            
            this.showNotification('Account created successfully! Please check your email for verification.', 'success');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            this.showNotification('Registration failed. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    validateRegistration(data) {
        if (data.password !== data.confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return false;
        }

        if (data.password.length < 8) {
            this.showNotification('Password must be at least 8 characters long', 'error');
            return false;
        }

        if (!data.terms) {
            this.showNotification('You must agree to the Terms of Service', 'error');
            return false;
        }

        // Validate age (must be at least 13 years old)
        const birthDate = new Date(data.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 13) {
            this.showNotification('You must be at least 13 years old to register', 'error');
            return false;
        }

        return true;
    }

    async simulateAuthRequest() {
        // Simulate network delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 90% success rate for demo
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('Authentication failed'));
                }
            }, 1500);
        });
    }

    redirectAfterLogin(role) {
        switch (role) {
            case 'doctor':
                window.location.href = 'doctor-dashboard.html';
                break;
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'patient':
            default:
                window.location.href = 'patient-dashboard.html';
                break;
        }
    }

    checkAuthStatus() {
        const storedUser = localStorage.getItem('echannelling_user') || 
                          sessionStorage.getItem('echannelling_user');
        
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            // Don't auto-redirect if user is already on their correct dashboard
            const currentPage = window.location.pathname.split('/').pop();
            const expectedPage = this.getExpectedDashboard(this.currentUser.role);
            
            // Only redirect if on wrong dashboard, not if already on correct one
            if (currentPage !== expectedPage && this.shouldRedirect(currentPage)) {
                this.redirectAfterLogin(this.currentUser.role);
            }
        }
    }

    getExpectedDashboard(role) {
        switch (role) {
            case 'doctor':
                return 'doctor-dashboard.html';
            case 'admin':
                return 'admin-dashboard.html';
            case 'patient':
            default:
                return 'patient-dashboard.html';
        }
    }

    shouldRedirect(currentPage) {
        // Don't redirect if already on a dashboard page or login/register pages
        const noRedirectPages = [
            'doctor-dashboard.html',
            'admin-dashboard.html', 
            'patient-dashboard.html',
            'login.html',
            'register.html',
            'index.html',
            ''
        ];
        return !noRedirectPages.includes(currentPage);
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('echannelling_user');
        sessionStorage.removeItem('echannelling_user');
        window.location.href = 'index.html';
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
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Global functions for inline event handlers
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '🙈';
    } else {
        input.type = 'password';
        toggle.textContent = '👁️';
    }
}

function loginWithGoogle() {
    authManager.showNotification('Google login will be implemented with OAuth integration', 'info');
}

function loginWithFacebook() {
    authManager.showNotification('Facebook login will be implemented with OAuth integration', 'info');
}

function registerWithGoogle() {
    authManager.showNotification('Google registration will be implemented with OAuth integration', 'info');
}

function registerWithFacebook() {
    authManager.showNotification('Facebook registration will be implemented with OAuth integration', 'info');
}

// Initialize authentication manager
let authManager;

document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
});