/**
 * Terms and Conditions Modal Manager
 * Handles display of terms, privacy policy, and cancellation policy modals
 */

// Terms and Conditions Modal
function openTermsModal() {
    const modal = createModal('terms-modal', 'Terms and Conditions', getTermsContent());
    document.body.appendChild(modal);
}

// Privacy Policy Modal
function openPrivacyModal() {
    const modal = createModal('privacy-modal', 'Privacy Policy', getPrivacyContent());
    document.body.appendChild(modal);
}

// Cancellation Policy Modal
function openCancellationModal() {
    const modal = createModal('cancellation-modal', 'Cancellation Policy', getCancellationContent());
    document.body.appendChild(modal);
}

// Refund Policy Modal
function openRefundModal() {
    const modal = createModal('refund-modal', 'Refund Policy', getRefundContent());
    document.body.appendChild(modal);
}

// Generic modal creation function
function createModal(id, title, content) {
    // Remove existing modal if present
    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'terms-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;

    modal.innerHTML = `
        <div class="modal-content" style="
            background: var(--card-bg, #ffffff);
            color: var(--text-color, #333333);
            border-radius: 12px;
            max-width: 800px;
            max-height: 80vh;
            width: 90%;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
        ">
            <div class="modal-header" style="
                padding: 1.5rem;
                border-bottom: 2px solid var(--border-color, #e5e5e5);
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
            ">
                <h2 style="margin: 0; font-size: 1.5rem;">
                    <i class="fas fa-file-contract" style="margin-right: 0.5rem;"></i>
                    ${title}
                </h2>
                <button class="close-modal" style="
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='transparent'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" style="
                padding: 2rem;
                overflow-y: auto;
                flex: 1;
                line-height: 1.6;
            ">
                ${content}
            </div>
            <div class="modal-footer" style="
                padding: 1.5rem;
                border-top: 2px solid var(--border-color, #e5e5e5);
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
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
                    I Understand
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    const closeButtons = modal.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => modal.remove());
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Close on Escape key
    const handleKeyPress = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleKeyPress);
        }
    };
    document.addEventListener('keydown', handleKeyPress);

    return modal;
}

// Terms and Conditions Content
function getTermsContent() {
    return `
        <div class="terms-content">
            <h3><i class="fas fa-handshake"></i> Agreement to Terms</h3>
            <p>By using HealthCare+ services, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>
            
            <h3><i class="fas fa-user-md"></i> Medical Services</h3>
            <ul>
                <li>Our platform facilitates appointments with licensed healthcare professionals</li>
                <li>All medical advice and treatment are provided by qualified doctors</li>
                <li>Emergency situations require immediate medical attention - call 911</li>
                <li>Prescription medications require valid doctor consultation</li>
            </ul>
            
            <h3><i class="fas fa-calendar-check"></i> Appointments</h3>
            <ul>
                <li>Appointments must be booked in advance through our platform</li>
                <li>Cancellations must be made at least 24 hours before appointment time</li>
                <li>Late cancellations may incur charges as per our cancellation policy</li>
                <li>No-shows will be charged the full appointment fee</li>
            </ul>
            
            <h3><i class="fas fa-credit-card"></i> Payment Terms</h3>
            <ul>
                <li>Payment is required at the time of booking</li>
                <li>We accept major credit cards and digital payments</li>
                <li>Refunds are processed according to our refund policy</li>
                <li>Insurance claims are handled separately from direct payments</li>
            </ul>
            
            <h3><i class="fas fa-shield-alt"></i> Liability and Disclaimers</h3>
            <p>HealthCare+ provides a platform for healthcare services but is not directly responsible for medical treatment outcomes. All medical decisions should be made in consultation with qualified healthcare providers.</p>
            
            <p class="last-updated"><strong>Last updated:</strong> June 2025</p>
        </div>
    `;
}

// Privacy Policy Content
function getPrivacyContent() {
    return `
        <div class="privacy-content">
            <h3><i class="fas fa-lock"></i> Information We Collect</h3>
            <ul>
                <li>Personal information (name, email, phone number)</li>
                <li>Medical information necessary for appointments</li>
                <li>Payment information (processed securely)</li>
                <li>Usage data to improve our services</li>
            </ul>
            
            <h3><i class="fas fa-database"></i> How We Use Your Information</h3>
            <ul>
                <li>Facilitate medical appointments and consultations</li>
                <li>Process payments and insurance claims</li>
                <li>Send appointment reminders and important updates</li>
                <li>Improve our platform and services</li>
            </ul>
            
            <h3><i class="fas fa-share-alt"></i> Information Sharing</h3>
            <p>We never sell your personal information. We only share data when:</p>
            <ul>
                <li>Required for medical treatment (with your healthcare provider)</li>
                <li>Necessary for payment processing</li>
                <li>Required by law or legal proceedings</li>
                <li>With your explicit consent</li>
            </ul>
            
            <h3><i class="fas fa-shield-virus"></i> Data Security</h3>
            <p>Your medical information is encrypted and stored securely in compliance with HIPAA regulations. We use industry-standard security measures to protect your data.</p>
            
            <h3><i class="fas fa-user-cog"></i> Your Rights</h3>
            <ul>
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request data deletion (subject to medical record requirements)</li>
                <li>Opt-out of non-essential communications</li>
            </ul>
            
            <p class="last-updated"><strong>Last updated:</strong> June 2025</p>
        </div>
    `;
}

// Cancellation Policy Content
function getCancellationContent() {
    return `
        <div class="cancellation-content">
            <h3><i class="fas fa-calendar-times"></i> Cancellation Timeline</h3>
            <div class="policy-grid">
                <div class="policy-item">
                    <h4>24+ Hours Notice</h4>
                    <p>Full refund available</p>
                </div>
                <div class="policy-item">
                    <h4>12-24 Hours Notice</h4>
                    <p>50% cancellation fee applies</p>
                </div>
                <div class="policy-item">
                    <h4>Less than 12 Hours</h4>
                    <p>Full appointment fee charged</p>
                </div>
                <div class="policy-item">
                    <h4>No Show</h4>
                    <p>Full fee charged, no refund</p>
                </div>
            </div>
            
            <h3><i class="fas fa-procedures"></i> Emergency Situations</h3>
            <p>Medical emergencies that require immediate attention are exempt from cancellation fees. Documentation may be required.</p>
            
            <h3><i class="fas fa-redo"></i> Rescheduling</h3>
            <ul>
                <li>Free rescheduling available with 24+ hours notice</li>
                <li>Same-day rescheduling subject to availability and may incur fees</li>
                <li>Multiple rescheduling attempts may result in rebooking fees</li>
            </ul>
            
            <h3><i class="fas fa-clock"></i> Doctor Cancellations</h3>
            <p>If your doctor needs to cancel:</p>
            <ul>
                <li>You'll receive immediate notification</li>
                <li>Full refund or free rescheduling offered</li>
                <li>Priority booking for next available appointment</li>
            </ul>
            
            <p class="last-updated"><strong>Last updated:</strong> June 2025</p>
        </div>
        
        <style>
            .policy-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin: 1rem 0;
            }
            .policy-item {
                padding: 1rem;
                border: 2px solid var(--border-color, #e5e5e5);
                border-radius: 8px;
                text-align: center;
                background: var(--input-bg, #f8f9fa);
            }
            .policy-item h4 {
                color: var(--primary-color, #3b82f6);
                margin-bottom: 0.5rem;
            }
        </style>
    `;
}

// Refund Policy Content
function getRefundContent() {
    return `
        <div class="refund-content">
            <h3><i class="fas fa-money-bill-wave"></i> Refund Eligibility</h3>
            <ul>
                <li>Cancellations made 24+ hours in advance: Full refund</li>
                <li>Technical issues preventing service delivery: Full refund</li>
                <li>Doctor-initiated cancellations: Full refund or rescheduling</li>
                <li>Duplicate payments: Full refund of duplicate amount</li>
            </ul>
            
            <h3><i class="fas fa-clock"></i> Refund Processing Time</h3>
            <ul>
                <li>Credit card refunds: 3-5 business days</li>
                <li>Digital wallet refunds: 1-2 business days</li>
                <li>Bank transfers: 5-7 business days</li>
                <li>Insurance claims: Processed according to insurer timeline</li>
            </ul>
            
            <h3><i class="fas fa-ban"></i> Non-Refundable Situations</h3>
            <ul>
                <li>No-show appointments</li>
                <li>Late cancellations (less than 24 hours)</li>
                <li>Services already rendered</li>
                <li>Prescription fulfillment fees</li>
            </ul>
            
            <h3><i class="fas fa-envelope"></i> How to Request a Refund</h3>
            <ol>
                <li>Contact our support team within 30 days</li>
                <li>Provide your appointment details and reason</li>
                <li>Submit any supporting documentation</li>
                <li>Refund will be processed within 5-7 business days</li>
            </ol>
            
            <h3><i class="fas fa-question-circle"></i> Questions?</h3>
            <p>For refund questions, contact our billing department at <a href="mailto:billing@healthcareplus.com">billing@healthcareplus.com</a> or call (555) 123-HEALTH.</p>
            
            <p class="last-updated"><strong>Last updated:</strong> June 2025</p>
        </div>
    `;
}

// Initialize terms modal functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Make functions globally available
    window.openTermsModal = openTermsModal;
    window.openPrivacyModal = openPrivacyModal;
    window.openCancellationModal = openCancellationModal;
    window.openRefundModal = openRefundModal;
});