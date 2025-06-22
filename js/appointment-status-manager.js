// Real-time Appointment Status Manager
class AppointmentStatusManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.appointments = new Map();
        this.statusUpdateInterval = null;
        this.initialize();
    }

    initialize() {
        this.setupStatusDisplay();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.loadAppointments();
    }

    getCurrentUser() {
        // Get current user from session/localStorage
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : { id: 1, role: 'patient' }; // Default for demo
    }

    async loadAppointments() {
        try {
            const response = await fetch(`/php/appointment-status-api.php?user_id=${this.currentUser.id}&role=${this.currentUser.role}`);
            const data = await response.json();
            
            if (data.success) {
                this.updateAppointmentDisplay(data.appointments);
            } else {
                console.error('Failed to load appointments:', data.error);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
    }

    updateAppointmentDisplay(appointments) {
        const container = document.getElementById('appointments-container');
        if (!container) return;

        // Store appointments for real-time updates
        appointments.forEach(apt => {
            this.appointments.set(apt.id, apt);
        });

        // Group appointments by status for better organization
        const groupedAppointments = this.groupAppointmentsByStatus(appointments);
        
        container.innerHTML = '';
        
        Object.keys(groupedAppointments).forEach(status => {
            if (groupedAppointments[status].length > 0) {
                const statusSection = this.createStatusSection(status, groupedAppointments[status]);
                container.appendChild(statusSection);
            }
        });
    }

    groupAppointmentsByStatus(appointments) {
        const groups = {
            upcoming: [],
            confirmed: [],
            scheduled: [],
            completed: [],
            cancelled: [],
            no_show: [],
            overdue: []
        };

        appointments.forEach(apt => {
            const status = apt.display_status || apt.status;
            if (groups[status]) {
                groups[status].push(apt);
            }
        });

        return groups;
    }

    createStatusSection(status, appointments) {
        const section = document.createElement('div');
        section.className = 'status-section';
        section.innerHTML = `
            <div class="status-header">
                <h3 class="status-title">${this.getStatusTitle(status)}</h3>
                <span class="status-count">${appointments.length}</span>
            </div>
            <div class="appointments-list" data-status="${status}">
                ${appointments.map(apt => this.createAppointmentCard(apt)).join('')}
            </div>
        `;
        return section;
    }

    createAppointmentCard(appointment) {
        const indicator = appointment.status_indicator;
        const canUpdate = appointment.can_update;
        const nextActions = appointment.next_actions || [];

        return `
            <div class="appointment-card" data-appointment-id="${appointment.id}">
                <div class="appointment-header">
                    <div class="status-indicator ${indicator.pulse ? 'pulse' : ''}" 
                         style="background-color: ${indicator.color}">
                        <i class="icon-${indicator.icon}"></i>
                    </div>
                    <div class="appointment-info">
                        <h4 class="appointment-title">
                            ${this.currentUser.role === 'patient' ? 
                              `Dr. ${appointment.doctor_name} ${appointment.doctor_surname}` :
                              `${appointment.patient_name} ${appointment.patient_surname}`
                            }
                        </h4>
                        <p class="appointment-specialty">${appointment.specialty || 'General Consultation'}</p>
                    </div>
                    <div class="appointment-status">
                        <span class="status-badge status-${appointment.status}">${this.getStatusLabel(appointment.status)}</span>
                    </div>
                </div>
                
                <div class="appointment-details">
                    <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${this.formatDate(appointment.appointment_date)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Time:</span>
                        <span class="detail-value">${this.formatTime(appointment.appointment_time)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Reference:</span>
                        <span class="detail-value">${appointment.booking_reference}</span>
                    </div>
                    ${appointment.payment_status ? `
                    <div class="detail-row">
                        <span class="detail-label">Payment:</span>
                        <span class="detail-value payment-${appointment.payment_status}">${this.getPaymentLabel(appointment.payment_status)}</span>
                    </div>
                    ` : ''}
                </div>

                ${canUpdate && nextActions.length > 0 ? `
                <div class="appointment-actions">
                    ${nextActions.map(action => `
                        <button class="action-btn action-${action}" 
                                onclick="appointmentStatusManager.handleAction('${appointment.id}', '${action}')">
                            ${this.getActionLabel(action)}
                        </button>
                    `).join('')}
                </div>
                ` : ''}

                <div class="appointment-timestamp">
                    Last updated: ${this.formatTimestamp(appointment.updated_at)}
                </div>
            </div>
        `;
    }

    async handleAction(appointmentId, action) {
        const appointment = this.appointments.get(parseInt(appointmentId));
        if (!appointment) return;

        let newStatus;
        let notes = '';

        switch (action) {
            case 'confirm':
                newStatus = 'confirmed';
                break;
            case 'complete':
                newStatus = 'completed';
                notes = prompt('Any notes about the completed appointment?') || '';
                break;
            case 'cancel':
                newStatus = 'cancelled';
                notes = prompt('Reason for cancellation?') || '';
                break;
            case 'mark_no_show':
                newStatus = 'no_show';
                break;
            default:
                console.error('Unknown action:', action);
                return;
        }

        if (newStatus) {
            await this.updateAppointmentStatus(appointmentId, newStatus, notes);
        }
    }

    async updateAppointmentStatus(appointmentId, newStatus, notes = '') {
        try {
            const response = await fetch('/php/appointment-status-api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    appointment_id: appointmentId,
                    status: newStatus,
                    user_id: this.currentUser.id,
                    role: this.currentUser.role,
                    notes: notes
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Appointment status updated successfully', 'success');
                // Real-time update will be handled by SSE
            } else {
                this.showNotification(data.error || 'Failed to update status', 'error');
            }
        } catch (error) {
            console.error('Error updating appointment status:', error);
            this.showNotification('Failed to update appointment status', 'error');
        }
    }

    startRealTimeUpdates() {
        // Listen for real-time updates from Server-Sent Events
        if (window.realTimeUpdates) {
            const originalHandler = window.realTimeUpdates.handleUpdates.bind(window.realTimeUpdates);
            window.realTimeUpdates.handleUpdates = (updates) => {
                originalHandler(updates);
                this.handleRealTimeUpdates(updates);
            };
        }

        // Periodic refresh as fallback - reduced frequency
        this.statusUpdateInterval = setInterval(() => {
            this.loadAppointments();
        }, 60000); // Refresh every 60 seconds
    }

    handleRealTimeUpdates(updates) {
        if (!Array.isArray(updates)) {
            updates = [updates];
        }

        updates.forEach(update => {
            if (update.type === 'appointment_status_change') {
                this.handleStatusChange(update.data);
            }
        });
    }

    handleStatusChange(data) {
        const appointmentCard = document.querySelector(`[data-appointment-id="${data.appointment_id}"]`);
        if (appointmentCard) {
            // Update the appointment in our local store
            this.appointments.set(data.appointment_id, data.appointment);
            
            // Re-render the specific appointment card with animation
            this.animateStatusChange(appointmentCard, data.old_status, data.new_status);
            
            // Reload appointments to reorganize sections - faster
            setTimeout(() => {
                this.loadAppointments();
            }, 300);
        }
    }

    animateStatusChange(card, oldStatus, newStatus) {
        // Add animation class
        card.classList.add('status-changing');
        
        // Update status badge with animation
        const statusBadge = card.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.classList.add('updating');
            setTimeout(() => {
                statusBadge.className = `status-badge status-${newStatus}`;
                statusBadge.textContent = this.getStatusLabel(newStatus);
                statusBadge.classList.remove('updating');
            }, 300);
        }
        
        // Remove animation class after completion
        setTimeout(() => {
            card.classList.remove('status-changing');
        }, 1000);
    }

    setupEventListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Refresh when page becomes visible
                this.loadAppointments();
            }
        });

        // Handle window focus
        window.addEventListener('focus', () => {
            this.loadAppointments();
        });
    }

    setupStatusDisplay() {
        // Create appointments container if it doesn't exist
        if (!document.getElementById('appointments-container')) {
            const container = document.createElement('div');
            container.id = 'appointments-container';
            container.className = 'appointments-container';
            
            const targetElement = document.querySelector('.dashboard-content') || 
                                 document.querySelector('.main-content') || 
                                 document.body;
            targetElement.appendChild(container);
        }
    }

    // Utility methods for formatting and labels
    getStatusTitle(status) {
        const titles = {
            upcoming: 'Upcoming Appointments',
            confirmed: 'Confirmed Appointments',
            scheduled: 'Scheduled Appointments',
            completed: 'Completed Appointments',
            cancelled: 'Cancelled Appointments',
            no_show: 'No Show Appointments',
            overdue: 'Overdue Appointments'
        };
        return titles[status] || 'Appointments';
    }

    getStatusLabel(status) {
        const labels = {
            scheduled: 'Scheduled',
            confirmed: 'Confirmed',
            upcoming: 'Upcoming',
            completed: 'Completed',
            cancelled: 'Cancelled',
            no_show: 'No Show',
            overdue: 'Overdue'
        };
        return labels[status] || status;
    }

    getActionLabel(action) {
        const labels = {
            confirm: 'Confirm',
            complete: 'Mark Complete',
            cancel: 'Cancel',
            mark_no_show: 'Mark No Show',
            edit: 'Edit',
            reschedule: 'Reschedule'
        };
        return labels[action] || action;
    }

    getPaymentLabel(status) {
        const labels = {
            pending: 'Pending',
            paid: 'Paid',
            refunded: 'Refunded',
            completed: 'Completed',
            failed: 'Failed'
        };
        return labels[status] || status;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatTime(timeString) {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    showNotification(message, type = 'info') {
        // Notifications are disabled - silent operation
        console.log(`Silent appointment notification: ${message}`);
    }

    destroy() {
        if (this.statusUpdateInterval) {
            clearInterval(this.statusUpdateInterval);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.appointmentStatusManager = new AppointmentStatusManager();
});

// Add CSS for status indicators
const statusStyles = `
<style>
.appointments-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.status-section {
    margin-bottom: 30px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
}

.status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.status-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
}

.status-count {
    background: #3b82f6;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
}

.appointments-list {
    padding: 20px;
}

.appointment-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    transition: all 0.3s ease;
}

.appointment-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-2px);
}

.appointment-card.status-changing {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}

.appointment-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
}

.status-indicator {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    color: white;
    font-size: 18px;
    position: relative;
}

.status-indicator.pulse::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    background: inherit;
    opacity: 0.3;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.1); opacity: 0.1; }
    100% { transform: scale(1); opacity: 0.3; }
}

.appointment-info {
    flex: 1;
}

.appointment-title {
    margin: 0 0 4px 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
}

.appointment-specialty {
    margin: 0;
    color: #64748b;
    font-size: 0.875rem;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    transition: all 0.3s ease;
}

.status-badge.updating {
    transform: scale(1.1);
    opacity: 0.7;
}

.status-scheduled { background: #dbeafe; color: #1d4ed8; }
.status-confirmed { background: #dcfce7; color: #166534; }
.status-upcoming { background: #fef3c7; color: #92400e; }
.status-completed { background: #d1fae5; color: #065f46; }
.status-cancelled { background: #fee2e2; color: #dc2626; }
.status-no_show { background: #f3f4f6; color: #374151; }
.status-overdue { background: #fecaca; color: #991b1b; }

.appointment-details {
    margin: 16px 0;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.detail-label {
    font-weight: 500;
    color: #64748b;
}

.detail-value {
    color: #1e293b;
}

.payment-pending { color: #f59e0b; }
.payment-paid { color: #10b981; }
.payment-failed { color: #ef4444; }

.appointment-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
}

.action-btn {
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #fff;
    color: #374151;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.action-btn:hover {
    background: #f9fafb;
    border-color: #9ca3af;
}

.action-confirm { border-color: #22c55e; color: #22c55e; }
.action-confirm:hover { background: #22c55e; color: white; }

.action-complete { border-color: #10b981; color: #10b981; }
.action-complete:hover { background: #10b981; color: white; }

.action-cancel { border-color: #ef4444; color: #ef4444; }
.action-cancel:hover { background: #ef4444; color: white; }

.appointment-timestamp {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 12px;
    text-align: right;
}

@media (max-width: 768px) {
    .appointment-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .status-indicator {
        margin-bottom: 12px;
    }
    
    .appointment-actions {
        flex-direction: column;
    }
    
    .action-btn {
        text-align: center;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', statusStyles);