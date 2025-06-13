/**
 * Patient Dashboard JavaScript
 * Handles patient-specific functionality
 */

class PatientDashboard {
    constructor() {
        this.currentUser = null;
        this.appointments = [];
        this.doctors = [];
        this.filteredDoctors = [];
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
            case 'doctors':
                if (this.loadDoctors) {
                    await this.loadDoctors();
                }
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

    // Doctor search and management methods
    async loadDoctors() {
        try {
            const response = await fetch('php/patient-api.php?action=get_doctors');
            const data = await response.json();
            
            if (data.success) {
                this.doctors = data.doctors;
                this.filteredDoctors = [...this.doctors];
                this.displayDoctors();
                this.updateResultsCount();
            } else {
                console.error('Failed to load doctors:', data.error);
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
        }
    }
    
    displayDoctors() {
        const container = document.getElementById('doctors-container');
        const noResults = document.getElementById('no-results');
        
        if (!container) return;
        
        if (this.filteredDoctors.length === 0) {
            container.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }
        
        container.style.display = 'grid';
        noResults.style.display = 'none';
        
        const currentView = container.classList.contains('doctors-list') ? 'list' : 'grid';
        
        if (currentView === 'grid') {
            container.innerHTML = this.filteredDoctors.map(doctor => this.createDoctorCard(doctor)).join('');
        } else {
            container.innerHTML = this.filteredDoctors.map(doctor => this.createDoctorListItem(doctor)).join('');
        }
    }
    
    createDoctorCard(doctor) {
        const initials = doctor.name.split(' ').map(n => n[0]).join('');
        const stars = this.generateStars(doctor.rating);
        const availabilityClass = doctor.available ? 'available' : 'unavailable';
        const availabilityText = doctor.available ? 'Available' : 'Unavailable';
        
        return `
            <div class="doctor-card" onclick="viewDoctorProfile(${doctor.id})">
                <div class="doctor-header">
                    <div class="doctor-avatar">${initials}</div>
                    <div class="doctor-info">
                        <h3>${doctor.name}</h3>
                        <div class="doctor-specialty">${doctor.specialty}</div>
                    </div>
                </div>
                
                <div class="doctor-details">
                    <div class="doctor-rating">
                        <span class="stars">${stars}</span>
                        <span>${doctor.rating}</span>
                        <span>(${doctor.reviews} reviews)</span>
                    </div>
                    
                    <div class="doctor-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${doctor.location}</span>
                    </div>
                    
                    <div class="doctor-detail">
                        <i class="fas fa-graduation-cap"></i>
                        <span>${doctor.education}</span>
                    </div>
                    
                    <div class="doctor-detail">
                        <i class="fas fa-clock"></i>
                        <span>${doctor.experience} years experience</span>
                    </div>
                    
                    <div class="doctor-detail">
                        <i class="fas fa-dollar-sign"></i>
                        <span>$${doctor.fee}</span>
                    </div>
                </div>
                
                <div class="doctor-availability ${availabilityClass}">
                    ${availabilityText}
                </div>
                
                <div class="doctor-actions">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); bookAppointment(${doctor.id})">
                        <i class="fas fa-calendar-plus"></i> Book Now
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); viewDoctorProfile(${doctor.id})">
                        <i class="fas fa-eye"></i> View Profile
                    </button>
                </div>
            </div>
        `;
    }
    
    createDoctorListItem(doctor) {
        const initials = doctor.name.split(' ').map(n => n[0]).join('');
        const stars = this.generateStars(doctor.rating);
        const availabilityClass = doctor.available ? 'available' : 'unavailable';
        const availabilityText = doctor.available ? 'Available' : 'Unavailable';
        
        return `
            <div class="doctor-list-item" onclick="viewDoctorProfile(${doctor.id})">
                <div class="doctor-avatar">${initials}</div>
                <div class="doctor-list-info">
                    <h4>${doctor.name}</h4>
                    <div class="doctor-specialty">${doctor.specialty}</div>
                    <div class="doctor-rating">
                        <span class="stars">${stars}</span>
                        <span>${doctor.rating} (${doctor.reviews} reviews)</span>
                    </div>
                    <div class="doctor-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${doctor.location}</span>
                    </div>
                    <div class="doctor-availability ${availabilityClass}">
                        ${availabilityText}
                    </div>
                </div>
                <div class="doctor-list-actions">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); bookAppointment(${doctor.id})">
                        <i class="fas fa-calendar-plus"></i> Book
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); viewDoctorProfile(${doctor.id})">
                        <i class="fas fa-eye"></i> Profile
                    </button>
                </div>
            </div>
        `;
    }
    
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
    
    searchDoctors() {
        const searchTerm = document.getElementById('doctor-search')?.value.toLowerCase() || '';
        const specialtyFilter = document.getElementById('specialty-filter')?.value || '';
        const locationFilter = document.getElementById('location-filter')?.value || '';
        const availabilityFilter = document.getElementById('availability-filter')?.value || '';
        
        this.filteredDoctors = this.doctors.filter(doctor => {
            const matchesSearch = doctor.name.toLowerCase().includes(searchTerm) ||
                                doctor.specialty.toLowerCase().includes(searchTerm);
            
            const matchesSpecialty = !specialtyFilter || doctor.specialty === specialtyFilter;
            const matchesLocation = !locationFilter || doctor.location === locationFilter;
            const matchesAvailability = !availabilityFilter || 
                                      (availabilityFilter === 'available' && doctor.available) ||
                                      (availabilityFilter === 'unavailable' && !doctor.available);
            
            return matchesSearch && matchesSpecialty && matchesLocation && matchesAvailability;
        });
        
        this.displayDoctors();
        this.updateResultsCount();
    }
    
    clearFilters() {
        const searchInput = document.getElementById('doctor-search');
        const specialtyFilter = document.getElementById('specialty-filter');
        const locationFilter = document.getElementById('location-filter');
        const availabilityFilter = document.getElementById('availability-filter');
        
        if (searchInput) searchInput.value = '';
        if (specialtyFilter) specialtyFilter.value = '';
        if (locationFilter) locationFilter.value = '';
        if (availabilityFilter) availabilityFilter.value = '';
        
        this.filteredDoctors = [...this.doctors];
        this.displayDoctors();
        this.updateResultsCount();
    }
    
    toggleView(view) {
        const container = document.getElementById('doctors-container');
        const gridBtn = document.querySelector('.view-btn[data-view="grid"]');
        const listBtn = document.querySelector('.view-btn[data-view="list"]');
        
        if (!container) return;
        
        if (view === 'list') {
            container.className = 'doctors-list';
            if (gridBtn) gridBtn.classList.remove('active');
            if (listBtn) listBtn.classList.add('active');
        } else {
            container.className = 'doctors-grid';
            if (listBtn) listBtn.classList.remove('active');
            if (gridBtn) gridBtn.classList.add('active');
        }
        
        this.displayDoctors();
    }
    
    updateResultsCount() {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            const count = this.filteredDoctors.length;
            const total = this.doctors.length;
            resultsCount.textContent = `Showing ${count} of ${total} doctors`;
        }
    }
}

// Global functions for doctor interactions
function searchDoctors() {
    if (window.patientDashboard) {
        window.patientDashboard.searchDoctors();
    }
}

function filterDoctors() {
    if (window.patientDashboard) {
        window.patientDashboard.searchDoctors();
    }
}

function clearFilters() {
    if (window.patientDashboard) {
        window.patientDashboard.clearFilters();
    }
}

function toggleView(view) {
    if (window.patientDashboard) {
        window.patientDashboard.toggleView(view);
    }
}

function bookAppointment(doctorId) {
    // Navigate to booking page with pre-selected doctor
    window.location.href = `booking.html?doctor=${doctorId}`;
}

function viewDoctorProfile(doctorId) {
    // Show doctor profile modal or navigate to profile page
    console.log('Viewing doctor profile:', doctorId);
    // This can be expanded to show a detailed modal
}

// Initialize patient dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.patientDashboard = new PatientDashboard();
});