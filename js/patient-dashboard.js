/**
 * Patient Dashboard JavaScript
 * Handles patient-specific functionality
 */

class PatientDashboard {
    constructor() {
        this.currentUser = null;
        this.appointments = [];
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadDashboardData();
        this.setupSidebarNavigation();
    }

    async checkAuthentication() {
        try {
            const response = await fetch('php/session-auth.php?check_auth=1');
            const data = await response.json();
            
            if (!data.authenticated || data.user.role !== 'patient') {
                window.location.href = 'login.html';
                return;
            }
            
            this.currentUser = data.user;
            this.updateUserDisplay();
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = 'login.html';
        }
    }

    updateUserDisplay() {
        if (this.currentUser) {
            const userNameElement = document.getElementById('user-name');
            const patientNameElement = document.getElementById('patient-name');
            
            if (userNameElement) {
                userNameElement.textContent = `Welcome, ${this.currentUser.full_name}`;
            }
            
            if (patientNameElement) {
                patientNameElement.textContent = this.currentUser.full_name;
            }
            
            this.populateProfileForm();
        }
    }

    populateProfileForm() {
        if (!this.currentUser) return;
        
        const fields = {
            'profile-name': this.currentUser.full_name,
            'profile-email': this.currentUser.email,
            'profile-phone': this.currentUser.phone,
            'profile-dob': this.currentUser.date_of_birth,
            'profile-address': this.currentUser.address,
            'profile-emergency': this.currentUser.emergency_contact,
            'profile-insurance': this.currentUser.insurance_number
        };
        
        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && value) {
                element.value = value;
            }
        });
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Profile form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', this.handleProfileUpdate.bind(this));
        }

        // Quick action buttons
        document.querySelectorAll('.action-btn, .sidebar-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const section = btn.getAttribute('data-section') || btn.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });
    }

    setupSidebarNavigation() {
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all links
                sidebarLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Show corresponding section
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'appointments':
                await this.loadAppointments();
                break;
            case 'dashboard':
                await this.loadDashboardStats();
                break;
            case 'payments':
                await this.loadPaymentHistory();
                break;
        }
    }

    async loadDashboardData() {
        try {
            await this.loadDashboardStats();
            await this.loadUpcomingAppointments();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    async loadDashboardStats() {
        try {
            const response = await fetch('php/patient-api.php?action=get_stats');
            const data = await response.json();
            
            if (data.success) {
                this.updateStatsDisplay(data.stats);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
            // Use default values if API fails
            this.updateStatsDisplay({
                total_appointments: 12,
                upcoming_appointments: 3,
                doctors_visited: 5,
                prescriptions: 8
            });
        }
    }

    updateStatsDisplay(stats) {
        const statElements = {
            'total-appointments': stats.total_appointments,
            'upcoming-appointments': stats.upcoming_appointments,
            'doctors-visited': stats.doctors_visited,
            'prescriptions': stats.prescriptions
        };
        
        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    async loadUpcomingAppointments() {
        try {
            const response = await fetch('php/patient-api.php?action=get_upcoming_appointments');
            const data = await response.json();
            
            if (data.success) {
                this.displayUpcomingAppointments(data.appointments);
            }
        } catch (error) {
            console.error('Failed to load upcoming appointments:', error);
        }
    }

    displayUpcomingAppointments(appointments) {
        const container = document.getElementById('upcoming-appointments-list');
        if (!container) return;
        
        if (appointments.length === 0) {
            container.innerHTML = '<p>No upcoming appointments.</p>';
            return;
        }
        
        container.innerHTML = appointments.map(apt => `
            <div class="appointment-card">
                <div class="appointment-date">${this.formatAppointmentDate(apt.date, apt.time)}</div>
                <div class="appointment-doctor">${apt.doctor_name} - ${apt.specialty}</div>
                <div class="appointment-status">${this.capitalizeFirst(apt.status)}</div>
            </div>
        `).join('');
    }

    async loadAppointments() {
        try {
            const response = await fetch('php/patient-api.php?action=get_appointments');
            const data = await response.json();
            
            if (data.success) {
                this.displayAppointmentsTable(data.appointments);
            }
        } catch (error) {
            console.error('Failed to load appointments:', error);
        }
    }

    displayAppointmentsTable(appointments) {
        const tbody = document.getElementById('appointments-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = appointments.map(apt => `
            <tr>
                <td>${this.formatAppointmentDate(apt.date, apt.time)}</td>
                <td>${apt.doctor_name}</td>
                <td>${apt.specialty}</td>
                <td><span class="status-badge status-${apt.status}">${this.capitalizeFirst(apt.status)}</span></td>
                <td>$${apt.fee}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="patientDashboard.viewAppointment(${apt.id})">View</button>
                    ${apt.status === 'pending' ? `<button class="btn btn-sm btn-secondary" onclick="patientDashboard.payAppointment(${apt.id})">Pay Now</button>` : ''}
                    ${apt.status !== 'completed' ? `<button class="btn btn-sm btn-danger" onclick="patientDashboard.cancelAppointment(${apt.id})">Cancel</button>` : ''}
                </td>
            </tr>
        `).join('');
    }

    async loadPaymentHistory() {
        try {
            const response = await fetch('php/patient-api.php?action=get_payment_history');
            const data = await response.json();
            
            if (data.success) {
                this.displayPaymentHistory(data.payments);
            }
        } catch (error) {
            console.error('Failed to load payment history:', error);
        }
    }

    displayPaymentHistory(payments) {
        // Payment history display logic
        console.log('Payment history loaded:', payments);
    }

    async handleLogout() {
        try {
            const response = await fetch('php/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'action=logout'
            });
            
            const data = await response.json();
            
            if (data.success) {
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Logout failed:', error);
            // Force logout on error
            window.location.href = 'login.html';
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        formData.append('action', 'update_profile');
        
        try {
            const response = await fetch('php/patient-api.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Profile updated successfully!', 'success');
                this.currentUser = { ...this.currentUser, ...data.user };
                this.updateUserDisplay();
            } else {
                this.showNotification(data.error || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            this.showNotification('Failed to update profile', 'error');
        }
    }

    async viewAppointment(appointmentId) {
        try {
            const response = await fetch(`php/patient-api.php?action=get_appointment&id=${appointmentId}`);
            const data = await response.json();
            
            if (data.success) {
                this.showAppointmentDetails(data.appointment);
            }
        } catch (error) {
            console.error('Failed to load appointment details:', error);
        }
    }

    async cancelAppointment(appointmentId) {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }
        
        try {
            const response = await fetch('php/patient-api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=cancel_appointment&id=${appointmentId}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Appointment cancelled successfully', 'success');
                this.loadAppointments();
                this.loadDashboardData();
            } else {
                this.showNotification(data.error || 'Failed to cancel appointment', 'error');
            }
        } catch (error) {
            console.error('Failed to cancel appointment:', error);
            this.showNotification('Failed to cancel appointment', 'error');
        }
    }

    async payAppointment(appointmentId) {
        // Redirect to payment page or open payment modal
        window.location.href = `payment.html?appointment=${appointmentId}`;
    }

    showAppointmentDetails(appointment) {
        // Show appointment details in a modal or new section
        console.log('Appointment details:', appointment);
    }

    formatAppointmentDate(date, time) {
        const appointmentDate = new Date(`${date} ${time}`);
        return appointmentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) + ' - ' + appointmentDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showNotification(message, type = 'info') {
        // Use the existing notification system from main.js
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize patient dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.patientDashboard = new PatientDashboard();
});