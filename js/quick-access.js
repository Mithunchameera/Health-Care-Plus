/**
 * Quick Access Services Manager
 * Handles interactions with medical services grid
 */

class QuickAccessManager {
    constructor() {
        this.services = [
            {
                id: 'ministry-foreign-affairs',
                name: 'Ministry of Foreign Affairs',
                icon: 'fas fa-passport',
                description: 'Medical certificates for visa and travel purposes',
                available: true
            },
            {
                id: 'driving-license-medical',
                name: 'Driving License Medical',
                icon: 'fas fa-car',
                description: 'Medical examination for driving license applications',
                available: true
            },
            {
                id: 'epremium',
                name: 'ePremium',
                icon: 'fas fa-crown',
                description: 'Premium healthcare services and priority bookings',
                available: true,
                premium: true
            },
            {
                id: 'evisa-medical',
                name: 'eVisa Medical Services',
                icon: 'fas fa-plane',
                description: 'Medical services for visa applications',
                available: false,
                comingSoon: true
            },
            {
                id: 'ehospital',
                name: 'eHospital',
                icon: 'fas fa-hospital-user',
                description: 'Hospital services and inpatient care management',
                available: true
            },
            {
                id: 'medical-checkup',
                name: 'Medical Checkup',
                icon: 'fas fa-briefcase-medical',
                description: 'Comprehensive health screening and checkups',
                available: true,
                isNew: true
            },
            {
                id: 'epharmacy',
                name: 'ePharmacy',
                icon: 'fas fa-pills',
                description: 'Online pharmacy and prescription management',
                available: true,
                isNew: true
            },
            {
                id: 'esubscriptions',
                name: 'eSubscriptions',
                icon: 'fas fa-calendar-alt',
                description: 'Subscription-based healthcare services',
                available: true,
                isNew: true
            },
            {
                id: 'ehealth-scan',
                name: 'eHealth Scan',
                icon: 'fas fa-stethoscope',
                description: 'Digital health monitoring and diagnostics',
                available: true
            },
            {
                id: 'running-number',
                name: 'Running Number',
                icon: 'fas fa-file-alt',
                description: 'Queue management system for appointments',
                available: false,
                comingSoon: true
            },
            {
                id: 'ehealth-cart',
                name: 'eHealth Cart',
                icon: 'fas fa-shopping-cart',
                description: 'Shopping cart for medical products and services',
                available: false,
                comingSoon: true
            },
            {
                id: 'elabs',
                name: 'eLabs',
                icon: 'fas fa-syringe',
                description: 'Laboratory tests and results management',
                available: false,
                comingSoon: true
            },
            {
                id: 'claim-refund',
                name: 'Claim Refund',
                icon: 'fas fa-money-check-alt',
                description: 'Insurance claims and refund processing',
                available: true
            },
            {
                id: 'doctor-near-me',
                name: 'Doctor Near Me',
                icon: 'fas fa-map-marker-alt',
                description: 'Find doctors and clinics in your area',
                available: false,
                comingSoon: true
            },
            {
                id: 'ediagnosis',
                name: 'eDiagnosis',
                icon: 'fas fa-diagnoses',
                description: 'AI-powered preliminary diagnosis assistance',
                available: false,
                comingSoon: true
            }
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupServiceTooltips();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const quickAccessItem = e.target.closest('.quick-access-item');
            if (quickAccessItem) {
                this.handleServiceClick(quickAccessItem);
            }
        });
    }

    setupServiceTooltips() {
        const serviceItems = document.querySelectorAll('.quick-access-item');
        serviceItems.forEach(item => {
            const serviceName = item.querySelector('h4').textContent;
            const service = this.services.find(s => s.name === serviceName);
            
            if (service) {
                item.setAttribute('title', service.description);
                item.dataset.serviceId = service.id;
            }
        });
    }

    handleServiceClick(element) {
        const serviceId = element.dataset.serviceId;
        const service = this.services.find(s => s.id === serviceId);
        
        if (!service) return;

        if (!service.available) {
            this.showComingSoonModal(service);
            return;
        }

        switch (service.id) {
            case 'medical-checkup':
                this.openMedicalCheckupBooking();
                break;
            case 'epharmacy':
                this.openPharmacySection();
                break;
            case 'driving-license-medical':
                this.openDrivingMedicalForm();
                break;
            case 'ministry-foreign-affairs':
                this.openTravelMedicalForm();
                break;
            case 'epremium':
                this.showPremiumServices();
                break;
            case 'ehospital':
                this.openHospitalServices();
                break;
            case 'esubscriptions':
                this.openSubscriptionServices();
                break;
            case 'ehealth-scan':
                this.openHealthScanServices();
                break;
            case 'claim-refund':
                this.openClaimRefundForm();
                break;
            default:
                this.showServiceDetails(service);
        }
    }

    openMedicalCheckupBooking() {
        // Navigate to booking with medical checkup filter
        if (window.patientDashboard) {
            window.patientDashboard.showSection('book-appointment');
            this.showNotification('Opening medical checkup booking...', 'info');
        }
    }

    openPharmacySection() {
        this.showServiceModal({
            title: 'ePharmacy Services',
            content: `
                <div class="service-modal-content">
                    <h4>Online Pharmacy Services</h4>
                    <ul class="service-features">
                        <li><i class="fas fa-pills"></i> Prescription refills</li>
                        <li><i class="fas fa-truck"></i> Home delivery</li>
                        <li><i class="fas fa-clock"></i> 24/7 availability</li>
                        <li><i class="fas fa-shield-alt"></i> Genuine medications</li>
                    </ul>
                    <p>Upload your prescription or browse over-the-counter medications.</p>
                </div>
            `,
            actions: [
                { text: 'Upload Prescription', action: 'upload-prescription', primary: true },
                { text: 'Browse Medications', action: 'browse-medications' }
            ]
        });
    }

    openDrivingMedicalForm() {
        this.showServiceModal({
            title: 'Driving License Medical Examination',
            content: `
                <div class="service-modal-content">
                    <h4>Medical Certificate for Driving License</h4>
                    <p>Schedule a medical examination required for your driving license application.</p>
                    <div class="medical-requirements">
                        <h5>Required Tests:</h5>
                        <ul>
                            <li>Vision test</li>
                            <li>Physical examination</li>
                            <li>Medical history review</li>
                        </ul>
                    </div>
                    <p><strong>Fee:</strong> $50.00</p>
                </div>
            `,
            actions: [
                { text: 'Book Appointment', action: 'book-driving-medical', primary: true },
                { text: 'Learn More', action: 'info-driving-medical' }
            ]
        });
    }

    openTravelMedicalForm() {
        this.showServiceModal({
            title: 'Travel Medical Certificate',
            content: `
                <div class="service-modal-content">
                    <h4>Medical Certificate for Travel/Visa</h4>
                    <p>Get medical clearance for international travel and visa applications.</p>
                    <div class="certificate-types">
                        <h5>Available Certificates:</h5>
                        <ul>
                            <li>General health certificate</li>
                            <li>Vaccination records</li>
                            <li>COVID-19 clearance</li>
                            <li>Country-specific requirements</li>
                        </ul>
                    </div>
                    <p><strong>Processing time:</strong> 24-48 hours</p>
                </div>
            `,
            actions: [
                { text: 'Apply Now', action: 'apply-travel-medical', primary: true },
                { text: 'Check Requirements', action: 'check-requirements' }
            ]
        });
    }

    showPremiumServices() {
        this.showServiceModal({
            title: 'ePremium Services',
            content: `
                <div class="service-modal-content premium-content">
                    <div class="premium-header">
                        <i class="fas fa-crown"></i>
                        <h4>Premium Healthcare Experience</h4>
                    </div>
                    <div class="premium-benefits">
                        <div class="benefit-item">
                            <i class="fas fa-star"></i>
                            <span>Priority appointment booking</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-user-md"></i>
                            <span>Access to specialist doctors</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-clock"></i>
                            <span>Reduced waiting times</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-headset"></i>
                            <span>24/7 dedicated support</span>
                        </div>
                    </div>
                    <p class="premium-price"><strong>Monthly subscription:</strong> $29.99</p>
                </div>
            `,
            actions: [
                { text: 'Subscribe Now', action: 'subscribe-premium', primary: true },
                { text: 'Learn More', action: 'premium-info' }
            ]
        });
    }

    openHospitalServices() {
        this.showServiceModal({
            title: 'eHospital Services',
            content: `
                <div class="service-modal-content">
                    <h4>Hospital & Inpatient Services</h4>
                    <div class="hospital-services">
                        <div class="service-category">
                            <h5>Emergency Services</h5>
                            <p>24/7 emergency care and ambulance services</p>
                        </div>
                        <div class="service-category">
                            <h5>Inpatient Care</h5>
                            <p>Room booking and admission management</p>
                        </div>
                        <div class="service-category">
                            <h5>Surgical Services</h5>
                            <p>Operating room scheduling and surgical consultations</p>
                        </div>
                    </div>
                </div>
            `,
            actions: [
                { text: 'Find Hospitals', action: 'find-hospitals', primary: true },
                { text: 'Emergency Contact', action: 'emergency-contact' }
            ]
        });
    }

    openSubscriptionServices() {
        this.showServiceModal({
            title: 'eSubscription Services',
            content: `
                <div class="service-modal-content">
                    <h4>Healthcare Subscription Plans</h4>
                    <div class="subscription-plans">
                        <div class="plan-card">
                            <h5>Basic Plan</h5>
                            <p>$9.99/month</p>
                            <ul>
                                <li>Monthly health checkup</li>
                                <li>Basic lab tests</li>
                                <li>Telemedicine consultations</li>
                            </ul>
                        </div>
                        <div class="plan-card featured">
                            <h5>Premium Plan</h5>
                            <p>$19.99/month</p>
                            <ul>
                                <li>Everything in Basic</li>
                                <li>Specialist consultations</li>
                                <li>Priority scheduling</li>
                                <li>Medication discounts</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `,
            actions: [
                { text: 'Choose Plan', action: 'choose-subscription', primary: true },
                { text: 'Compare Plans', action: 'compare-plans' }
            ]
        });
    }

    openHealthScanServices() {
        this.showServiceModal({
            title: 'eHealth Scan Services',
            content: `
                <div class="service-modal-content">
                    <h4>Digital Health Monitoring</h4>
                    <div class="scan-services">
                        <div class="scan-type">
                            <i class="fas fa-heartbeat"></i>
                            <h5>Vital Signs Monitoring</h5>
                            <p>Continuous tracking of blood pressure, heart rate, and temperature</p>
                        </div>
                        <div class="scan-type">
                            <i class="fas fa-brain"></i>
                            <h5>Health Analytics</h5>
                            <p>AI-powered health insights and recommendations</p>
                        </div>
                        <div class="scan-type">
                            <i class="fas fa-mobile-alt"></i>
                            <h5>Mobile Integration</h5>
                            <p>Sync with fitness trackers and health apps</p>
                        </div>
                    </div>
                </div>
            `,
            actions: [
                { text: 'Start Monitoring', action: 'start-monitoring', primary: true },
                { text: 'View Demo', action: 'view-demo' }
            ]
        });
    }

    openClaimRefundForm() {
        this.showServiceModal({
            title: 'Insurance Claim & Refund',
            content: `
                <div class="service-modal-content">
                    <h4>Submit Insurance Claim</h4>
                    <form class="claim-form">
                        <div class="form-group">
                            <label>Insurance Provider</label>
                            <select required>
                                <option value="">Select your insurance</option>
                                <option value="blue-cross">Blue Cross Blue Shield</option>
                                <option value="aetna">Aetna</option>
                                <option value="cigna">Cigna</option>
                                <option value="humana">Humana</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Policy Number</label>
                            <input type="text" placeholder="Enter your policy number" required>
                        </div>
                        <div class="form-group">
                            <label>Claim Amount</label>
                            <input type="number" placeholder="0.00" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label>Upload Documents</label>
                            <input type="file" multiple accept=".pdf,.jpg,.png">
                            <small>Upload receipts, medical reports, and invoices</small>
                        </div>
                    </form>
                </div>
            `,
            actions: [
                { text: 'Submit Claim', action: 'submit-claim', primary: true },
                { text: 'Save Draft', action: 'save-draft' }
            ]
        });
    }

    showComingSoonModal(service) {
        this.showServiceModal({
            title: 'Coming Soon',
            content: `
                <div class="service-modal-content coming-soon-content">
                    <div class="coming-soon-icon">
                        <i class="${service.icon}"></i>
                    </div>
                    <h4>${service.name}</h4>
                    <p>${service.description}</p>
                    <p class="coming-soon-message">This service is currently under development and will be available soon.</p>
                    <div class="notify-me">
                        <input type="email" placeholder="Enter your email for updates" class="notify-email">
                    </div>
                </div>
            `,
            actions: [
                { text: 'Notify Me', action: 'notify-launch', primary: true },
                { text: 'Close', action: 'close' }
            ]
        });
    }

    showServiceModal(config) {
        // Remove existing modal
        const existingModal = document.getElementById('service-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'service-modal';
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${config.title}</h5>
                        <button type="button" class="btn-close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${config.content}
                    </div>
                    <div class="modal-footer">
                        ${config.actions.map(action => 
                            `<button class="btn ${action.primary ? 'btn-primary' : 'btn-secondary'}" 
                                     onclick="window.quickAccessManager.handleModalAction('${action.action}')">
                                ${action.text}
                             </button>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    handleModalAction(action) {
        const modal = document.getElementById('service-modal');
        
        switch (action) {
            case 'book-driving-medical':
            case 'apply-travel-medical':
            case 'upload-prescription':
            case 'subscribe-premium':
            case 'choose-subscription':
            case 'start-monitoring':
            case 'find-hospitals':
                if (window.patientDashboard) {
                    window.patientDashboard.showSection('book-appointment');
                }
                modal.remove();
                break;
            case 'submit-claim':
                this.showNotification('Claim submitted successfully', 'success');
                modal.remove();
                break;
            case 'notify-launch':
                this.showNotification('You will be notified when this service launches', 'info');
                modal.remove();
                break;
            case 'close':
                modal.remove();
                break;
            default:
                this.showNotification(`Feature "${action}" will be available soon`, 'info');
                break;
        }
    }

    showServiceDetails(service) {
        this.showServiceModal({
            title: service.name,
            content: `
                <div class="service-modal-content">
                    <div class="service-icon-large">
                        <i class="${service.icon}"></i>
                    </div>
                    <h4>${service.name}</h4>
                    <p>${service.description}</p>
                    <p>This service provides comprehensive healthcare solutions tailored to your needs.</p>
                </div>
            `,
            actions: [
                { text: 'Get Started', action: 'get-started', primary: true },
                { text: 'Learn More', action: 'learn-more' }
            ]
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }
}

// Initialize Quick Access Manager
document.addEventListener('DOMContentLoaded', () => {
    window.quickAccessManager = new QuickAccessManager();
});