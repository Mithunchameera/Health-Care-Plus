/**
 * Modern Doctor Card Component
 * Creates beautiful, responsive doctor profile cards
 */

class DoctorCardComponent {
    constructor() {
        this.initializeStyles();
    }

    /**
     * Create a modern doctor card
     */
    createDoctorCard(doctor) {
        const initials = this.generateInitials(doctor.name);
        const availabilityClass = doctor.available ? 'available' : 'unavailable';
        const statusText = doctor.available ? 'Available' : 'Unavailable';
        
        return `
            <div class="doctor-card-modern" data-doctor-id="${doctor.id}">
                <div class="doctor-card-header">
                    <div class="doctor-avatar-container">
                        <div class="doctor-avatar ${availabilityClass}">
                            <span class="avatar-initials">${initials}</span>
                            <div class="availability-indicator">
                                <i class="fas fa-circle"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="doctor-info">
                        <h3 class="doctor-name">${doctor.name}</h3>
                        <p class="doctor-specialty">${doctor.specialty}</p>
                        <p class="doctor-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${doctor.location}
                        </p>
                    </div>
                    
                    <div class="doctor-actions">
                        <button class="action-btn favorite-btn" title="Add to favorites">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="action-btn more-btn" title="More options">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>
                
                <div class="doctor-card-body">
                    <div class="doctor-stats">
                        <div class="stat-item">
                            <span class="stat-value">${doctor.experience}</span>
                            <span class="stat-label">Years</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${doctor.rating}</span>
                            <span class="stat-label">Rating</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">$${doctor.fee}</span>
                            <span class="stat-label">Fee</span>
                        </div>
                    </div>
                    
                    <div class="doctor-specialties">
                        ${doctor.subspecialties ? doctor.subspecialties.slice(0, 2).map(spec => 
                            `<span class="specialty-tag">${spec}</span>`
                        ).join('') : ''}
                    </div>
                </div>
                
                <div class="doctor-card-footer">
                    <div class="availability-status ${availabilityClass}">
                        <i class="fas fa-circle"></i>
                        <span>${statusText}</span>
                    </div>
                    
                    <div class="card-actions">
                        <button class="btn-card btn-secondary" onclick="viewDoctorProfile('${doctor.id}')">
                            <i class="fas fa-user"></i>
                            Profile
                        </button>
                        <button class="btn-card btn-primary" onclick="bookAppointment('${doctor.id}')" ${!doctor.available ? 'disabled' : ''}>
                            <i class="fas fa-calendar-plus"></i>
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create a compact doctor card for quick selection
     */
    createCompactDoctorCard(doctor) {
        const initials = this.generateInitials(doctor.name);
        const availabilityClass = doctor.available ? 'available' : 'unavailable';
        
        return `
            <div class="doctor-card-compact" data-doctor-id="${doctor.id}" onclick="selectDoctor(${doctor.id})">
                <div class="compact-avatar ${availabilityClass}">
                    <span class="avatar-initials">${initials}</span>
                    <div class="availability-dot"></div>
                </div>
                
                <div class="compact-info">
                    <h4 class="compact-name">${doctor.name}</h4>
                    <p class="compact-specialty">${doctor.specialty}</p>
                    <p class="compact-location">${doctor.location}</p>
                </div>
                
                <div class="compact-details">
                    <div class="compact-rating">
                        <i class="fas fa-star"></i>
                        <span>${doctor.rating}</span>
                    </div>
                    <div class="compact-fee">$${doctor.fee}</div>
                </div>
            </div>
        `;
    }

    /**
     * Generate initials from doctor name
     */
    generateInitials(name) {
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    /**
     * Initialize CSS styles for doctor cards
     */
    initializeStyles() {
        if (document.getElementById('doctor-card-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'doctor-card-styles';
        styles.textContent = `
            /* Modern Doctor Card Styles */
            .doctor-card-modern {
                background: var(--card-bg, #ffffff);
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                overflow: hidden;
                transition: all 0.3s ease;
                border: 1px solid var(--border-color, #e5e7eb);
                position: relative;
            }

            .doctor-card-modern:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
            }

            .doctor-card-header {
                padding: 1.5rem;
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                background: linear-gradient(135deg, var(--card-bg, #ffffff) 0%, var(--bg-secondary, #f8fafc) 100%);
            }

            .doctor-avatar-container {
                position: relative;
            }

            .doctor-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }

            .doctor-avatar.unavailable {
                background: linear-gradient(135deg, #6b7280, #4b5563);
                box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
            }

            .avatar-initials {
                color: white;
                font-weight: 600;
                font-size: 1.2rem;
                letter-spacing: 0.5px;
            }

            .availability-indicator {
                position: absolute;
                bottom: -2px;
                right: -2px;
                width: 18px;
                height: 18px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .availability-indicator i {
                font-size: 10px;
                color: #22c55e;
            }

            .doctor-avatar.unavailable .availability-indicator i {
                color: #ef4444;
            }

            .doctor-info {
                flex: 1;
                min-width: 0;
            }

            .doctor-name {
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--text-color, #1f2937);
                margin: 0 0 0.25rem 0;
                line-height: 1.2;
            }

            .doctor-specialty {
                font-size: 1rem;
                color: var(--primary-color, #3b82f6);
                font-weight: 500;
                margin: 0 0 0.5rem 0;
            }

            .doctor-location {
                font-size: 0.9rem;
                color: var(--text-secondary, #6b7280);
                margin: 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .doctor-location i {
                width: 12px;
                text-align: center;
            }

            .doctor-actions {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .action-btn {
                width: 36px;
                height: 36px;
                border: none;
                background: var(--bg-secondary, #f8fafc);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                color: var(--text-secondary, #6b7280);
            }

            .action-btn:hover {
                background: var(--primary-color, #3b82f6);
                color: white;
                transform: scale(1.05);
            }

            .doctor-card-body {
                padding: 0 1.5rem 1rem 1.5rem;
            }

            .doctor-stats {
                display: flex;
                justify-content: space-between;
                margin-bottom: 1rem;
                padding: 1rem;
                background: var(--bg-secondary, #f8fafc);
                border-radius: 12px;
            }

            .stat-item {
                text-align: center;
                flex: 1;
            }

            .stat-value {
                display: block;
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--text-color, #1f2937);
                margin-bottom: 0.25rem;
            }

            .stat-label {
                font-size: 0.8rem;
                color: var(--text-secondary, #6b7280);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .doctor-specialties {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .specialty-tag {
                background: var(--primary-color-light, #dbeafe);
                color: var(--primary-color, #3b82f6);
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 500;
            }

            .doctor-card-footer {
                padding: 1rem 1.5rem;
                background: var(--bg-secondary, #f8fafc);
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top: 1px solid var(--border-color, #e5e7eb);
            }

            .availability-status {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
                font-weight: 500;
            }

            .availability-status.available {
                color: #22c55e;
            }

            .availability-status.unavailable {
                color: #ef4444;
            }

            .availability-status i {
                font-size: 8px;
            }

            .card-actions {
                display: flex;
                gap: 0.75rem;
            }

            .btn-card {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .btn-card.btn-secondary {
                background: var(--bg-color, #ffffff);
                color: var(--text-color, #1f2937);
                border: 1px solid var(--border-color, #e5e7eb);
            }

            .btn-card.btn-secondary:hover {
                background: var(--bg-secondary, #f8fafc);
                transform: translateY(-1px);
            }

            .btn-card.btn-primary {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
            }

            .btn-card.btn-primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }

            .btn-card:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none !important;
            }

            /* Compact Doctor Card Styles */
            .doctor-card-compact {
                background: var(--card-bg, #ffffff);
                border: 1px solid var(--border-color, #e5e7eb);
                border-radius: 12px;
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 0.75rem;
            }

            .doctor-card-compact:hover {
                background: var(--bg-secondary, #f8fafc);
                border-color: var(--primary-color, #3b82f6);
                transform: translateX(4px);
            }

            .compact-avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                flex-shrink: 0;
            }

            .compact-avatar.unavailable {
                background: linear-gradient(135deg, #6b7280, #4b5563);
            }

            .compact-avatar .avatar-initials {
                color: white;
                font-weight: 600;
                font-size: 1rem;
            }

            .availability-dot {
                position: absolute;
                bottom: 2px;
                right: 2px;
                width: 12px;
                height: 12px;
                background: #22c55e;
                border: 2px solid white;
                border-radius: 50%;
            }

            .compact-avatar.unavailable .availability-dot {
                background: #ef4444;
            }

            .compact-info {
                flex: 1;
                min-width: 0;
            }

            .compact-name {
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--text-color, #1f2937);
                margin: 0 0 0.25rem 0;
            }

            .compact-specialty {
                font-size: 0.9rem;
                color: var(--primary-color, #3b82f6);
                font-weight: 500;
                margin: 0 0 0.25rem 0;
            }

            .compact-location {
                font-size: 0.8rem;
                color: var(--text-secondary, #6b7280);
                margin: 0;
            }

            .compact-details {
                text-align: right;
                flex-shrink: 0;
            }

            .compact-rating {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                color: #f59e0b;
                font-size: 0.9rem;
                font-weight: 500;
                margin-bottom: 0.25rem;
                justify-content: flex-end;
            }

            .compact-fee {
                font-size: 1rem;
                font-weight: 600;
                color: var(--text-color, #1f2937);
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .doctor-card-header {
                    padding: 1rem;
                    gap: 0.75rem;
                }

                .doctor-avatar {
                    width: 50px;
                    height: 50px;
                }

                .avatar-initials {
                    font-size: 1rem;
                }

                .doctor-name {
                    font-size: 1.1rem;
                }

                .doctor-stats {
                    padding: 0.75rem;
                }

                .doctor-card-footer {
                    padding: 0.75rem 1rem;
                    flex-direction: column;
                    gap: 0.75rem;
                    align-items: stretch;
                }

                .card-actions {
                    justify-content: center;
                }

                .doctor-card-compact {
                    padding: 0.75rem;
                    gap: 0.75rem;
                }

                .compact-avatar {
                    width: 40px;
                    height: 40px;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Initialize the component
document.addEventListener('DOMContentLoaded', () => {
    window.doctorCardComponent = new DoctorCardComponent();
    
    // Make functions globally available
    window.createDoctorCard = (doctor) => window.doctorCardComponent.createDoctorCard(doctor);
    window.createCompactDoctorCard = (doctor) => window.doctorCardComponent.createCompactDoctorCard(doctor);
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DoctorCardComponent;
}