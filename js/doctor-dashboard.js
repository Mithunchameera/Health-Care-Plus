/**
 * Doctor Dashboard JavaScript
 * Handles doctor-specific functionality
 */

class DoctorDashboard {
    constructor() {
        this.currentUser = null;
        this.appointments = [];
        this.patients = [];
        this.availability = {};
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadDashboardData();
        this.setupSidebarNavigation();
        this.setupAvailabilitySelector();
    }

    async checkAuthentication() {
        try {
            const response = await fetch('php/session-auth.php?check_auth=1');
            const data = await response.json();
            
            if (!data.authenticated || data.user.role !== 'doctor') {
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
            const doctorNameElement = document.getElementById('doctor-name');
            
            if (userNameElement) {
                userNameElement.textContent = `Dr. ${this.currentUser.full_name}`;
            }
            
            if (doctorNameElement) {
                doctorNameElement.textContent = this.currentUser.full_name;
            }
            
            this.populateProfileForm();
        }
    }

    populateProfileForm() {
        if (!this.currentUser) return;
        
        const fields = {
            'doctor-full-name': this.currentUser.full_name,
            'doctor-email': this.currentUser.email,
            'doctor-phone': this.currentUser.phone,
            'doctor-specialty': this.currentUser.department,
            'doctor-license': this.currentUser.license_number
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
        const profileForm = document.getElementById('doctor-profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', this.handleProfileUpdate.bind(this));
        }

        // Availability form
        const availabilityForm = document.getElementById('availability-form');
        if (availabilityForm) {
            availabilityForm.addEventListener('submit', this.handleAvailabilityUpdate.bind(this));
        }

        // Patient search
        const patientSearch = document.getElementById('patient-search');
        if (patientSearch) {
            patientSearch.addEventListener('input', this.handlePatientSearch.bind(this));
        }
    }

    setupSidebarNavigation() {
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });
    }

    setupAvailabilitySelector() {
        const timeSlots = document.querySelectorAll('.time-slot');
        timeSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                if (!slot.classList.contains('booked')) {
                    slot.classList.toggle('selected');
                }
            });
        });

        const dateInput = document.getElementById('availability-date');
        if (dateInput) {
            dateInput.addEventListener('change', this.loadAvailabilityForDate.bind(this));
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    showSection(sectionName) {
        // Hide all sections with fade out
        document.querySelectorAll('.content-section').forEach(section => {
            if (section.style.display !== 'none') {
                section.style.opacity = '0';
                section.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    section.style.display = 'none';
                }, 200);
            }
        });
        
        // Show selected section with fade in
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            setTimeout(() => {
                targetSection.style.display = 'block';
                targetSection.style.opacity = '0';
                targetSection.style.transform = 'translateY(20px)';
                
                // Smooth scroll to section
                targetSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
                
                // Animate in
                setTimeout(() => {
                    targetSection.style.transition = 'all 0.4s ease-out';
                    targetSection.style.opacity = '1';
                    targetSection.style.transform = 'translateY(0)';
                }, 100);
            }, 250);
        }
        
        this.loadSectionData(sectionName);
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'appointments':
                await this.loadAllAppointments();
                break;
            case 'patients':
                await this.loadPatients();
                break;
            case 'schedule':
                await this.loadWeeklySchedule();
                break;
            case 'availability':
                await this.loadAvailabilityForDate();
                break;
            case 'dashboard':
                await this.loadDashboardStats();
                break;
        }
    }

    async loadDashboardData() {
        try {
            await this.loadDashboardStats();
            await this.loadTodayAppointments();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    async loadDashboardStats() {
        try {
            const response = await fetch('php/doctor-api.php?action=get_stats');
            const data = await response.json();
            
            if (data.success) {
                this.updateStatsDisplay(data.stats);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
            this.updateStatsDisplay({
                today_appointments: 8,
                total_patients: 156,
                upcoming_count: 3,
                doctor_rating: 4.8
            });
        }
    }

    updateStatsDisplay(stats) {
        const statElements = {
            'today-appointments': stats.today_appointments,
            'total-patients': stats.total_patients,
            'upcoming-count': stats.upcoming_count,
            'doctor-rating': stats.doctor_rating
        };
        
        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    async loadTodayAppointments() {
        try {
            const response = await fetch('php/doctor-api.php?action=get_today_appointments');
            const data = await response.json();
            
            if (data.success) {
                this.displayTodayAppointments(data.appointments);
            }
        } catch (error) {
            console.error('Failed to load today appointments:', error);
        }
    }

    displayTodayAppointments(appointments) {
        const container = document.getElementById('today-appointments-list');
        if (!container) return;
        
        if (appointments.length === 0) {
            container.innerHTML = '<p>No appointments for today.</p>';
            return;
        }
        
        container.innerHTML = appointments.map(apt => `
            <div class="appointment-card">
                <div class="appointment-header">
                    <div class="appointment-time">${this.formatTime(apt.time)}</div>
                    <div class="appointment-status status-${apt.status}">${this.capitalizeFirst(apt.status)}</div>
                </div>
                <div class="patient-info">
                    <div class="patient-detail">
                        <i class="fas fa-user"></i>
                        <span>${apt.patient_name}</span>
                    </div>
                    <div class="patient-detail">
                        <i class="fas fa-phone"></i>
                        <span>${apt.patient_phone}</span>
                    </div>
                    <div class="patient-detail">
                        <i class="fas fa-envelope"></i>
                        <span>${apt.patient_email}</span>
                    </div>
                    <div class="patient-detail">
                        <i class="fas fa-notes-medical"></i>
                        <span>${apt.type || 'Consultation'}</span>
                    </div>
                </div>
                <div class="btn-group">
                    ${apt.status === 'confirmed' ? 
                        `<button class="btn btn-primary btn-sm" onclick="doctorDashboard.startConsultation(${apt.id})">
                            <i class="fas fa-play"></i> Start Consultation
                        </button>` : 
                        `<button class="btn btn-primary btn-sm" onclick="doctorDashboard.confirmAppointment(${apt.id})">
                            <i class="fas fa-check"></i> Confirm
                        </button>`
                    }
                    <button class="btn btn-secondary btn-sm" onclick="doctorDashboard.viewPatientHistory(${apt.patient_id})">
                        <i class="fas fa-history"></i> View History
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadAllAppointments() {
        try {
            const response = await fetch('php/doctor-api.php?action=get_appointments');
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
                <td>${apt.patient_name}</td>
                <td>${apt.patient_phone}</td>
                <td>${apt.type || 'Consultation'}</td>
                <td><span class="status-badge status-${apt.status}">${this.capitalizeFirst(apt.status)}</span></td>
                <td>
                    ${apt.status === 'confirmed' ? 
                        `<button class="btn btn-sm btn-primary" onclick="doctorDashboard.startConsultation(${apt.id})">Start</button>` :
                        `<button class="btn btn-sm btn-primary" onclick="doctorDashboard.confirmAppointment(${apt.id})">Confirm</button>`
                    }
                    <button class="btn btn-sm btn-secondary" onclick="doctorDashboard.viewPatientHistory(${apt.patient_id})">History</button>
                </td>
            </tr>
        `).join('');
    }

    async loadPatients() {
        try {
            const response = await fetch('php/doctor-api.php?action=get_patients');
            const data = await response.json();
            
            if (data.success) {
                this.patients = data.patients;
                this.displayPatients(this.patients);
            }
        } catch (error) {
            console.error('Failed to load patients:', error);
        }
    }

    displayPatients(patients) {
        const tbody = document.getElementById('patients-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = patients.map(patient => `
            <tr>
                <td>${patient.name}</td>
                <td>
                    <div>${patient.phone}</div>
                    <div style="font-size: 0.875rem; color: #666;">${patient.email}</div>
                </td>
                <td>${patient.last_visit || 'Never'}</td>
                <td>${patient.total_visits || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="doctorDashboard.viewPatientHistory(${patient.id})">View History</button>
                </td>
            </tr>
        `).join('');
    }

    async loadWeeklySchedule() {
        try {
            const response = await fetch('php/doctor-api.php?action=get_weekly_schedule');
            const data = await response.json();
            
            if (data.success) {
                this.displayWeeklySchedule(data.schedule);
            }
        } catch (error) {
            console.error('Failed to load weekly schedule:', error);
        }
    }

    displayWeeklySchedule(schedule) {
        // Weekly schedule display logic
        console.log('Weekly schedule loaded:', schedule);
    }

    async loadAvailabilityForDate() {
        const dateInput = document.getElementById('availability-date');
        const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
        
        try {
            const response = await fetch(`php/doctor-api.php?action=get_availability&date=${selectedDate}`);
            const data = await response.json();
            
            if (data.success) {
                this.updateAvailabilityDisplay(data.availability);
            }
        } catch (error) {
            console.error('Failed to load availability:', error);
        }
    }

    updateAvailabilityDisplay(availability) {
        const timeSlots = document.querySelectorAll('.time-slot');
        timeSlots.forEach(slot => {
            const time = slot.getAttribute('data-time');
            slot.classList.remove('selected', 'booked');
            
            if (availability.booked && availability.booked.includes(time)) {
                slot.classList.add('booked');
            } else if (availability.available && availability.available.includes(time)) {
                slot.classList.add('selected');
            }
        });
    }

    handlePatientSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredPatients = this.patients.filter(patient => 
            patient.name.toLowerCase().includes(searchTerm) ||
            patient.email.toLowerCase().includes(searchTerm) ||
            patient.phone.includes(searchTerm)
        );
        this.displayPatients(filteredPatients);
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
            window.location.href = 'login.html';
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        formData.append('action', 'update_profile');
        
        try {
            const response = await fetch('php/doctor-api.php', {
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

    async handleAvailabilityUpdate(e) {
        e.preventDefault();
        
        const selectedDate = document.getElementById('availability-date').value;
        const selectedSlots = [];
        
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            selectedSlots.push(slot.getAttribute('data-time'));
        });
        
        try {
            const response = await fetch('php/doctor-api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=update_availability&date=${selectedDate}&slots=${JSON.stringify(selectedSlots)}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Availability updated successfully!', 'success');
            } else {
                this.showNotification(data.error || 'Failed to update availability', 'error');
            }
        } catch (error) {
            console.error('Availability update failed:', error);
            this.showNotification('Failed to update availability', 'error');
        }
    }

    async startConsultation(appointmentId) {
        this.showNotification('Starting consultation...', 'info');
        // Implement consultation start logic
    }

    async confirmAppointment(appointmentId) {
        try {
            const response = await fetch('php/doctor-api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=confirm_appointment&id=${appointmentId}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Appointment confirmed', 'success');
                this.loadTodayAppointments();
                this.loadAllAppointments();
            } else {
                this.showNotification(data.error || 'Failed to confirm appointment', 'error');
            }
        } catch (error) {
            console.error('Failed to confirm appointment:', error);
            this.showNotification('Failed to confirm appointment', 'error');
        }
    }

    async viewPatientHistory(patientId) {
        try {
            const response = await fetch(`php/doctor-api.php?action=get_patient_history&patient_id=${patientId}`);
            const data = await response.json();
            
            if (data.success) {
                this.showPatientHistoryModal(data.patient, data.history);
            }
        } catch (error) {
            console.error('Failed to load patient history:', error);
        }
    }

    showPatientHistoryModal(patient, history) {
        // Display patient history in a modal
        console.log('Patient history:', patient, history);
    }

    clearAllSlots() {
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });
    }

    previousWeek() {
        // Navigate to previous week
        this.showNotification('Previous week navigation', 'info');
    }

    nextWeek() {
        // Navigate to next week
        this.showNotification('Next week navigation', 'info');
    }

    formatTime(time) {
        return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatAppointmentDate(date, time) {
        const appointmentDate = new Date(`${date} ${time}`);
        return appointmentDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) + ' ' + this.formatTime(time);
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Global functions for onclick events
window.startConsultation = (id) => window.doctorDashboard.startConsultation(id);
window.confirmAppointment = (id) => window.doctorDashboard.confirmAppointment(id);
window.viewPatientHistory = (id) => window.doctorDashboard.viewPatientHistory(id);
window.clearAllSlots = () => window.doctorDashboard.clearAllSlots();
window.previousWeek = () => window.doctorDashboard.previousWeek();
window.nextWeek = () => window.doctorDashboard.nextWeek();

// Initialize doctor dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.doctorDashboard = new DoctorDashboard();
});