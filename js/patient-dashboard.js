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
        // Appointments are already loaded in the HTML table
        // In a real implementation, this would fetch from an API
    }

    loadFavoriteDoctors() {
        console.log('Loading favorite doctors');
        // Favorite doctors are already displayed in the book-appointment section
    }

    loadMedicalRecords() {
        console.log('Loading medical records');
        // Medical records functionality to be implemented
    }

    loadMyDoctors() {
        console.log('Loading my doctors');
        // My doctors functionality to be implemented
    }

    loadPaymentHistory() {
        console.log('Loading payment history');
        // Payment history functionality to be implemented
    }

    loadMessages() {
        console.log('Loading messages');
        // Messages functionality to be implemented
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