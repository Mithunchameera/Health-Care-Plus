/**
 * Quick Actions JavaScript
 * Handles quick action buttons and shortcuts
 */

class QuickActions {
    constructor() {
        this.actions = [
            {
                id: 'book-appointment',
                icon: 'fas fa-calendar-plus',
                title: 'Book Appointment',
                description: 'Schedule a new appointment',
                action: () => this.bookAppointment(),
                color: 'primary'
            },
            {
                id: 'emergency-contact',
                icon: 'fas fa-phone-alt',
                title: 'Emergency Call',
                description: 'Call emergency services',
                action: () => this.emergencyCall(),
                color: 'danger'
            },
            {
                id: 'message-doctor',
                icon: 'fas fa-comments',
                title: 'Message Doctor',
                description: 'Send a message to your doctor',
                action: () => this.messageDoctor(),
                color: 'info'
            },
            {
                id: 'view-records',
                icon: 'fas fa-file-medical',
                title: 'Medical Records',
                description: 'View your medical history',
                action: () => this.viewRecords(),
                color: 'success'
            },
            {
                id: 'find-doctors',
                icon: 'fas fa-user-md',
                title: 'Find Doctors',
                description: 'Search for healthcare providers',
                action: () => this.findDoctors(),
                color: 'secondary'
            },
            {
                id: 'medication-reminder',
                icon: 'fas fa-pills',
                title: 'Medication',
                description: 'Set medication reminders',
                action: () => this.medicationReminder(),
                color: 'warning'
            }
        ];
        this.init();
    }

    init() {
        this.createQuickActionButton();
        this.setupKeyboardShortcuts();
    }

    createQuickActionButton() {
        // Add floating quick action button
        const quickActionBtn = document.createElement('div');
        quickActionBtn.className = 'quick-action-fab';
        quickActionBtn.innerHTML = `
            <button class="fab-main" onclick="quickActions.toggleQuickActions()">
                <i class="fas fa-plus"></i>
            </button>
            <div class="fab-menu" id="quick-actions-menu">
                ${this.actions.map(action => `
                    <button class="fab-item fab-${action.color}" onclick="quickActions.executeAction('${action.id}')" title="${action.description}">
                        <i class="${action.icon}"></i>
                    </button>
                `).join('')}
            </div>
        `;
        document.body.appendChild(quickActionBtn);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Q for quick actions
            if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
                e.preventDefault();
                this.toggleQuickActions();
            }
            
            // Escape to close quick actions
            if (e.key === 'Escape') {
                this.closeQuickActions();
            }
        });
    }

    toggleQuickActions() {
        const menu = document.getElementById('quick-actions-menu');
        const isOpen = menu.classList.contains('open');
        
        if (isOpen) {
            this.closeQuickActions();
        } else {
            this.openQuickActions();
        }
    }

    openQuickActions() {
        const menu = document.getElementById('quick-actions-menu');
        const mainBtn = document.querySelector('.fab-main');
        
        menu.classList.add('open');
        mainBtn.classList.add('active');
        
        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'quick-actions-backdrop';
        backdrop.onclick = () => this.closeQuickActions();
        document.body.appendChild(backdrop);
    }

    closeQuickActions() {
        const menu = document.getElementById('quick-actions-menu');
        const mainBtn = document.querySelector('.fab-main');
        const backdrop = document.querySelector('.quick-actions-backdrop');
        
        menu.classList.remove('open');
        mainBtn.classList.remove('active');
        
        if (backdrop) {
            backdrop.remove();
        }
    }

    executeAction(actionId) {
        const action = this.actions.find(a => a.id === actionId);
        if (action) {
            this.closeQuickActions();
            action.action();
            this.showActionFeedback(action.title);
        }
    }

    showActionFeedback(actionTitle) {
        const feedback = document.createElement('div');
        feedback.className = 'action-feedback';
        feedback.textContent = `${actionTitle} activated`;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            feedback.remove();
        }, 2000);
    }

    // Action implementations
    bookAppointment() {
        window.location.href = 'book-appointment.html';
    }

    emergencyCall() {
        const modal = this.createModal('Emergency Contact', `
            <div class="emergency-contacts">
                <div class="emergency-item urgent">
                    <i class="fas fa-ambulance"></i>
                    <div class="emergency-info">
                        <h4>Emergency Services</h4>
                        <p>Life-threatening emergencies</p>
                        <a href="tel:911" class="btn btn-danger">Call 911</a>
                    </div>
                </div>
                <div class="emergency-item">
                    <i class="fas fa-hospital"></i>
                    <div class="emergency-info">
                        <h4>Hospital Hotline</h4>
                        <p>Non-emergency medical advice</p>
                        <a href="tel:+15551234567" class="btn btn-primary">Call (555) 123-4567</a>
                    </div>
                </div>
                <div class="emergency-item">
                    <i class="fas fa-user-md"></i>
                    <div class="emergency-info">
                        <h4>Your Doctor</h4>
                        <p>Dr. Johnson - Primary Care</p>
                        <a href="tel:+15559876543" class="btn btn-secondary">Call (555) 987-6543</a>
                    </div>
                </div>
            </div>
        `);
    }

    messageDoctor() {
        if (window.patientDashboard) {
            window.patientDashboard.showSection('messages');
        }
    }

    viewRecords() {
        if (window.patientDashboard) {
            window.patientDashboard.showSection('appointments');
        }
    }

    findDoctors() {
        if (window.patientDashboard) {
            window.patientDashboard.showSection('doctors');
        }
    }

    medicationReminder() {
        const modal = this.createModal('Medication Reminder', `
            <div class="medication-reminder">
                <div class="reminder-form">
                    <div class="form-group">
                        <label for="med-name">Medication Name</label>
                        <input type="text" id="med-name" placeholder="Enter medication name">
                    </div>
                    <div class="form-group">
                        <label for="med-time">Reminder Time</label>
                        <input type="time" id="med-time">
                    </div>
                    <div class="form-group">
                        <label for="med-frequency">Frequency</label>
                        <select id="med-frequency">
                            <option value="once">Once daily</option>
                            <option value="twice">Twice daily</option>
                            <option value="three">Three times daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="quickActions.setMedicationReminder()">
                        Set Reminder
                    </button>
                </div>
                <div class="current-reminders">
                    <h4>Current Reminders</h4>
                    <div id="medication-list">
                        <div class="med-item">
                            <i class="fas fa-pills"></i>
                            <div class="med-info">
                                <strong>Aspirin</strong>
                                <span>Daily at 8:00 AM</span>
                            </div>
                            <button class="btn btn-sm btn-outline">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    setMedicationReminder() {
        const name = document.getElementById('med-name').value;
        const time = document.getElementById('med-time').value;
        const frequency = document.getElementById('med-frequency').value;
        
        if (name && time) {
            // Store in localStorage for demo
            const reminders = JSON.parse(localStorage.getItem('medicationReminders') || '[]');
            reminders.push({ name, time, frequency, id: Date.now() });
            localStorage.setItem('medicationReminders', JSON.stringify(reminders));
            
            this.showNotification('Medication reminder set successfully', 'success');
            this.closeModal();
        } else {
            this.showNotification('Please fill in all fields', 'error');
        }
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay quick-action-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="quickActions.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    closeModal() {
        const modal = document.querySelector('.quick-action-modal');
        if (modal) {
            modal.remove();
        }
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
}

// Initialize Quick Actions
document.addEventListener('DOMContentLoaded', function() {
    window.quickActions = new QuickActions();
});