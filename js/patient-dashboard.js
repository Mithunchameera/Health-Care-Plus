// Patient Dashboard JavaScript

class PatientDashboard {
    constructor() {
        this.currentSection = 'overview';
        this.appointments = [];
        this.doctors = [];
        this.initializeDashboard();
    }

    initializeDashboard() {
        this.setupNavigation();
        this.loadPatientData();
        this.setupQuickActions();
        this.setupTableActions();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
                
                // Update active navigation
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                link.closest('.nav-item').classList.add('active');
            });
        });

        // Global showSection function for buttons
        window.showSection = (sectionId) => {
            this.showSection(sectionId);
            
            // Update navigation
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            const navLink = document.querySelector(`[data-section="${sectionId}"]`);
            if (navLink) {
                navLink.closest('.nav-item').classList.add('active');
            }
        };
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Load section-specific data
            this.loadSectionData(sectionId);
        }
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'appointments':
                this.loadAppointments();
                break;
            case 'book-appointment':
                this.loadFavoriteDoctors();
                break;
            case 'medical-records':
                this.loadMedicalRecords();
                break;
            case 'doctors':
                this.loadMyDoctors();
                break;
            case 'payments':
                this.loadPaymentHistory();
                break;
            case 'messages':
                this.loadMessages();
                break;
            default:
                break;
        }
    }

    loadPatientData() {
        // Mock patient data
        this.patientData = {
            name: 'John Fernando',
            email: 'john.fernando@email.com',
            phone: '+94 77 123 4567',
            dateOfBirth: '1980-05-15',
            gender: 'Male',
            address: 'Colombo 07, Sri Lanka'
        };

        // Mock appointments
        this.appointments = [
            {
                id: 1,
                date: '2025-06-23',
                time: '14:00',
                doctor: 'Dr. Kasun Perera',
                speciality: 'Cardiology',
                hospital: 'Apollo Hospital',
                status: 'confirmed',
                type: 'consultation'
            },
            {
                id: 2,
                date: '2025-06-25',
                time: '10:00',
                doctor: 'Dr. Sarah Wilson',
                speciality: 'Dermatology',
                hospital: 'Asiri Hospital',
                status: 'confirmed',
                type: 'follow-up'
            },
            {
                id: 3,
                date: '2025-06-28',
                time: '15:30',
                doctor: 'Dr. Michael Silva',
                speciality: 'General Medicine',
                hospital: 'Nawaloka Hospital',
                status: 'pending',
                type: 'consultation'
            }
        ];

        // Update dashboard stats
        this.updateDashboardStats();
    }

    updateDashboardStats() {
        const upcomingAppointments = this.appointments.filter(apt => 
            new Date(apt.date + 'T' + apt.time) > new Date()
        ).length;

        // Update stat cards if they exist
        const statCards = document.querySelectorAll('.stat-number');
        if (statCards.length >= 4) {
            statCards[0].textContent = upcomingAppointments;
            statCards[1].textContent = '5'; // Favorite doctors
            statCards[2].textContent = '12'; // Medical records
            statCards[3].textContent = 'Rs. 8,500'; // Monthly spending
        }
    }

    setupQuickActions() {
        // Quick action buttons are handled by onclick attributes in HTML
        console.log('Quick actions setup complete');
    }

    loadAppointments() {
        console.log('Loading appointments:', this.appointments);
        // Appointments table is already rendered in HTML
        console.log('Appointments loaded:', [
            { id: 1, date: 'June 22, 2025', time: '09:00 AM', patient: 'John Fernando', type: 'Cardiology Consultation', status: 'confirmed' },
            { id: 2, date: 'June 22, 2025', time: '10:30 AM', patient: 'Maria Silva', type: 'Follow-up Checkup', status: 'confirmed' }
        ]);
    }

    loadFavoriteDoctors() {
        console.log('Loading favorite doctors');
        // Book appointment options are already displayed
    }

    loadMedicalRecords() {
        console.log('Loading medical records');
        // Medical records section ready for content
    }

    loadMyDoctors() {
        console.log('Loading my doctors');
        console.log('Doctors loaded:', [
            { id: 1, name: 'Dr. Kasun Perera', email: 'kasun.perera@apollo.lk', speciality: 'Cardiology', hospital: 'Apollo Hospital', patients: 245, rating: 4.8, status: 'active' },
            { id: 2, name: 'Dr. Sarah Wilson', email: 'sarah.wilson@asiri.lk', speciality: 'Dermatology', hospital: 'Asiri Hospital', patients: 189, rating: 4.9, status: 'active' }
        ]);
    }

    loadPaymentHistory() {
        console.log('Loading payment history');
        // Payment history section ready for content
    }

    loadMessages() {
        console.log('Loading messages');
        // Messages section ready for content
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.patientDashboard = new PatientDashboard();
});

// Notifications functionality
function toggleNotifications() {
    const panel = document.getElementById('notifications-panel');
    panel.classList.toggle('show');
    
    // Close dropdown when clicking outside
    if (panel.classList.contains('show')) {
        document.addEventListener('click', closeNotificationsOnOutsideClick);
    } else {
        document.removeEventListener('click', closeNotificationsOnOutsideClick);
    }
}

function closeNotificationsOnOutsideClick(event) {
    const panel = document.getElementById('notifications-panel');
    const button = document.querySelector('.notification-btn');
    
    if (!panel.contains(event.target) && !button.contains(event.target)) {
        panel.classList.remove('show');
        document.removeEventListener('click', closeNotificationsOnOutsideClick);
    }
}

function markAllAsRead() {
    const unreadItems = document.querySelectorAll('.notification-item.unread');
    unreadItems.forEach(item => {
        item.classList.remove('unread');
        item.classList.add('read');
    });
    
    // Update badge count
    const badge = document.querySelector('.notification-badge');
    badge.textContent = '0';
    badge.style.display = 'none';
    
    // Show success message
    showNotificationSuccess('All notifications marked as read');
}

function viewAppointment(appointmentId) {
    showSection('appointments');
    toggleNotifications();
    showNotificationSuccess('Viewing appointment details');
}

function viewResults() {
    showSection('medical-records');
    toggleNotifications();
    showNotificationSuccess('Viewing test results');
}

function viewReceipt() {
    showSection('payments');
    toggleNotifications();
    showNotificationSuccess('Viewing payment receipt');
}

function showNotificationSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

    setupTableActions() {
        // Setup action buttons in tables
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-action')) {
                const action = e.target.getAttribute('title').toLowerCase();
                const row = e.target.closest('tr');
                const appointmentId = this.getAppointmentIdFromRow(row);
                
                this.handleAppointmentAction(action, appointmentId, row);
            }

            // Handle filter tabs
            if (e.target.classList.contains('filter-tab')) {
                // Update active tab
                e.target.parentElement.querySelectorAll('.filter-tab').forEach(tab => 
                    tab.classList.remove('active')
                );
                e.target.classList.add('active');
                
                // Apply filter
                const filter = e.target.getAttribute('data-filter');
                this.filterAppointments(filter);
            }

            // Handle book favorite doctor
            if (e.target.classList.contains('btn-book-favorite')) {
                const doctorCard = e.target.closest('.favorite-doctor-card');
                const doctorName = doctorCard.querySelector('h4').textContent;
                this.bookFavoriteDoctor(doctorName);
            }
        });
    }

    getAppointmentIdFromRow(row) {
        // In a real implementation, this would get the ID from a data attribute
        const doctorName = row.querySelector('.doctor-name').textContent;
        const appointment = this.appointments.find(apt => apt.doctor === doctorName);
        return appointment ? appointment.id : null;
    }

    handleAppointmentAction(action, appointmentId, row) {
        switch (action) {
            case 'view details':
                this.viewAppointmentDetails(appointmentId);
                break;
            case 'reschedule':
                this.rescheduleAppointment(appointmentId);
                break;
            case 'cancel':
                this.cancelAppointment(appointmentId, row);
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    viewAppointmentDetails(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            this.showNotification(`Viewing details for appointment with ${appointment.doctor}`, 'info');
            // In a real implementation, this would open a modal with full details
        }
    }

    rescheduleAppointment(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            this.showNotification(`Rescheduling appointment with ${appointment.doctor}`, 'info');
            // In a real implementation, this would open a reschedule modal
        }
    }

    cancelAppointment(appointmentId, row) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (appointment && confirm(`Are you sure you want to cancel your appointment with ${appointment.doctor}?`)) {
            // Update appointment status
            appointment.status = 'cancelled';
            
            // Update UI
            const statusBadge = row.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.textContent = 'Cancelled';
                statusBadge.className = 'status-badge cancelled';
            }
            
            this.showNotification('Appointment cancelled successfully', 'success');
            this.updateDashboardStats();
        }
    }

    filterAppointments(filter) {
        const rows = document.querySelectorAll('.appointments-table tbody tr');
        const now = new Date();
        
        rows.forEach(row => {
            const dateText = row.querySelector('.date').textContent;
            const timeText = row.querySelector('.time').textContent;
            const status = row.querySelector('.status-badge').textContent.toLowerCase();
            
            // Parse appointment date
            const appointmentDate = new Date(dateText + ' ' + timeText);
            
            let show = true;
            
            switch (filter) {
                case 'upcoming':
                    show = appointmentDate > now && status !== 'cancelled';
                    break;
                case 'past':
                    show = appointmentDate < now;
                    break;
                case 'cancelled':
                    show = status === 'cancelled';
                    break;
                case 'all':
                default:
                    show = true;
                    break;
            }
            
            row.style.display = show ? '' : 'none';
        });
    }

    bookFavoriteDoctor(doctorName) {
        this.showNotification(`Booking appointment with ${doctorName}...`, 'info');
        // In a real implementation, this would redirect to booking page with doctor pre-selected
        setTimeout(() => {
            window.location.href = `find-doctors.html?doctor=${encodeURIComponent(doctorName)}`;
        }, 1000);
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
}

// Initialize patient dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const patientDashboard = new PatientDashboard();
    
    // Make it globally accessible
    window.patientDashboard = patientDashboard;
});