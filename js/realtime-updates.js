// Real-time Updates using Server-Sent Events
// Pure JavaScript implementation replacing WebSocket functionality

class RealTimeUpdates {
    constructor() {
        this.eventSource = null;
        this.reconnectDelay = 1000;
        this.maxReconnectDelay = 30000;
        this.initialize();
    }

    initialize() {
        this.connect();
        this.setupEventHandlers();
    }

    connect() {
        if (this.eventSource) {
            this.eventSource.close();
        }

        try {
            this.eventSource = new EventSource('/php/websocket-handler.php?stream=updates');
            
            this.eventSource.onopen = () => {
                console.log('Real-time connection established');
                this.reconnectDelay = 1000; // Reset delay on successful connection
            };

            this.eventSource.onmessage = (event) => {
                try {
                    const updates = JSON.parse(event.data);
                    this.handleUpdates(updates);
                } catch (error) {
                    console.error('Failed to parse update data:', error);
                }
            };

            this.eventSource.onerror = (error) => {
                console.error('Real-time connection error:', error);
                this.eventSource.close();
                this.scheduleReconnect();
            };

        } catch (error) {
            console.error('Failed to establish real-time connection:', error);
            this.scheduleReconnect();
        }
    }

    handleUpdates(updates) {
        if (!Array.isArray(updates)) {
            updates = [updates];
        }

        updates.forEach(update => {
            switch (update.type) {
                case 'new_appointment':
                    this.handleNewAppointment(update.data);
                    break;
                case 'appointment_update':
                    this.handleAppointmentUpdate(update.data);
                    break;
                case 'doctor_status_change':
                    this.handleDoctorStatusChange(update.data);
                    break;
                default:
                    console.log('Unknown update type:', update.type);
            }
        });
    }

    handleNewAppointment(appointment) {
        // Show notification for new appointment
        this.showNotification('New Appointment', 
            `New appointment booked with ${appointment.first_name} ${appointment.last_name}`);
        
        // Update appointment list if visible
        this.updateAppointmentList();
    }

    handleAppointmentUpdate(appointment) {
        // Update specific appointment in the UI
        const appointmentElement = document.querySelector(`[data-appointment-id="${appointment.id}"]`);
        if (appointmentElement) {
            this.refreshAppointmentElement(appointmentElement, appointment);
        }
    }

    handleDoctorStatusChange(doctor) {
        // Update doctor availability status
        const doctorElements = document.querySelectorAll(`[data-doctor-id="${doctor.id}"]`);
        doctorElements.forEach(element => {
            this.updateDoctorStatus(element, doctor);
        });
    }

    showNotification(title, message) {
        // Notifications are disabled - silent operation
        console.log(`Silent notification: ${title} - ${message}`);
    }

    showInAppNotification(title, message) {
        // In-app notifications are disabled - silent operation
        console.log(`Silent in-app notification: ${title} - ${message}`);
    }

    updateAppointmentList() {
        // Refresh appointment list
        const appointmentList = document.getElementById('appointment-list');
        if (appointmentList) {
            // Trigger refresh of appointment data
            if (window.appointmentManager) {
                window.appointmentManager.refreshAppointments();
            }
        }
    }

    refreshAppointmentElement(element, appointmentData) {
        // Update appointment element with new data
        const statusElement = element.querySelector('.appointment-status');
        if (statusElement) {
            statusElement.textContent = appointmentData.status;
            statusElement.className = `appointment-status status-${appointmentData.status}`;
        }
    }

    updateDoctorStatus(element, doctorData) {
        // Update doctor availability indicator
        const statusElement = element.querySelector('.doctor-status');
        if (statusElement) {
            statusElement.textContent = doctorData.is_available ? 'Available' : 'Unavailable';
            statusElement.className = `doctor-status ${doctorData.is_available ? 'available' : 'unavailable'}`;
        }
    }

    scheduleReconnect() {
        setTimeout(() => {
            this.connect();
            this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
        }, this.reconnectDelay);
    }

    setupEventHandlers() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden, can reduce update frequency or pause
                console.log('Page hidden - real-time updates paused');
            } else {
                // Page is visible again
                console.log('Page visible - real-time updates resumed');
                if (!this.eventSource || this.eventSource.readyState !== EventSource.OPEN) {
                    this.connect();
                }
            }
        });

        // Handle page unload
        window.addEventListener('beforeunload', () => {
            if (this.eventSource) {
                this.eventSource.close();
            }
        });
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}

// Initialize real-time updates when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.realTimeUpdates = new RealTimeUpdates();
});

// Add CSS for notifications
const notificationStyles = `
<style>
/* Notifications disabled - no styles needed */

.doctor-status.available { color: #22c55e; }
.doctor-status.unavailable { color: #ef4444; }

.appointment-status.status-confirmed { color: #3b82f6; }
.appointment-status.status-completed { color: #22c55e; }
.appointment-status.status-cancelled { color: #ef4444; }
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);