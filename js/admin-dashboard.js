/**
 * Admin Dashboard JavaScript
 * Handles admin-specific functionality
 */

class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.doctors = [];
        this.appointments = [];
        this.patients = [];
        this.staff = [];
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.setupFormHandlers();
        this.loadDashboardData();
        this.setupSidebarNavigation();
        // Initialize back to top button
        if (window.HealthCare && window.HealthCare.initializeBackToTop) {
            window.HealthCare.initializeBackToTop();
        }
    }

    async checkAuthentication() {
        try {
            const response = await fetch('php/session-auth.php?check_auth=1');
            const data = await response.json();
            
            if (!data.authenticated || !['admin', 'staff'].includes(data.user.role)) {
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
            
            if (userNameElement) {
                userNameElement.textContent = `${this.currentUser.full_name} (${this.capitalizeFirst(this.currentUser.role)})`;
            }
        }
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Forms
        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', this.handleSettingsUpdate.bind(this));
        }

        const addDoctorForm = document.getElementById('add-doctor-form');
        if (addDoctorForm) {
            addDoctorForm.addEventListener('submit', this.handleAddDoctor.bind(this));
        }

        const addStaffForm = document.getElementById('add-staff-form');
        if (addStaffForm) {
            addStaffForm.addEventListener('submit', this.handleAddStaff.bind(this));
        }

        const editStaffForm = document.getElementById('edit-staff-form');
        if (editStaffForm) {
            editStaffForm.addEventListener('submit', this.handleEditStaff.bind(this));
        }

        // Filters
        const specialtyFilter = document.getElementById('specialty-filter');
        if (specialtyFilter) {
            specialtyFilter.addEventListener('change', this.filterDoctors.bind(this));
        }

        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', this.filterDoctors.bind(this));
        }

        const doctorSearch = document.getElementById('doctor-search');
        if (doctorSearch) {
            doctorSearch.addEventListener('input', this.filterDoctors.bind(this));
        }

        const patientSearch = document.getElementById('patient-search');
        if (patientSearch) {
            patientSearch.addEventListener('input', this.filterPatients.bind(this));
        }

        // Date filters for appointments
        const startDate = document.getElementById('start-date');
        const endDate = document.getElementById('end-date');
        if (startDate && endDate) {
            startDate.addEventListener('change', this.filterAppointments.bind(this));
            endDate.addEventListener('change', this.filterAppointments.bind(this));
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
            case 'doctors':
                await this.loadDoctors();
                break;
            case 'appointments':
                await this.loadAppointments();
                break;
            case 'patients':
                await this.loadPatients();
                break;
            case 'staff':
                await this.loadStaff();
                break;
            case 'dashboard':
                await this.loadDashboardStats();
                break;
        }
    }

    async loadDashboardData() {
        try {
            await this.loadDashboardStats();
            await this.loadRecentActivity();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    async loadDashboardStats() {
        try {
            const response = await fetch('php/admin-api.php?action=get_stats');
            const data = await response.json();
            
            if (data.success) {
                this.updateStatsDisplay(data.stats);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
            this.updateStatsDisplay({
                total_doctors: 25,
                total_patients: 1250,
                today_appointments: 45,
                monthly_revenue: 125000
            });
        }
    }

    updateStatsDisplay(stats) {
        const statElements = {
            'total-doctors': stats.total_doctors,
            'total-patients': stats.total_patients,
            'today-appointments': stats.today_appointments,
            'monthly-revenue': `$${(stats.monthly_revenue / 1000).toFixed(0)}K`
        };
        
        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    async loadRecentActivity() {
        try {
            const response = await fetch('php/admin-api.php?action=get_recent_activity');
            const data = await response.json();
            
            if (data.success) {
                this.displayRecentActivity(data.activity);
            }
        } catch (error) {
            console.error('Failed to load recent activity:', error);
        }
    }

    displayRecentActivity(activities) {
        const tbody = document.getElementById('activity-table-body');
        if (!tbody || !activities) return;
        
        tbody.innerHTML = activities.map(activity => `
            <tr>
                <td>${this.formatTime(activity.time)}</td>
                <td>${activity.description}</td>
                <td>${activity.user}</td>
                <td><span class="status-badge status-${activity.status}">${this.capitalizeFirst(activity.status)}</span></td>
            </tr>
        `).join('');
    }

    async loadDoctors() {
        try {
            const response = await fetch('php/admin-api.php?action=get_doctors');
            const data = await response.json();
            
            if (data.success) {
                this.doctors = data.doctors;
                this.displayDoctors(this.doctors);
            }
        } catch (error) {
            console.error('Failed to load doctors:', error);
        }
    }

    displayDoctors(doctors) {
        const tbody = document.getElementById('doctors-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = doctors.map(doctor => `
            <tr>
                <td>
                    <div>${doctor.name}</div>
                    <div style="font-size: 0.875rem; color: #666;">${doctor.email}</div>
                </td>
                <td>${doctor.specialty}</td>
                <td>${doctor.experience} years</td>
                <td>${doctor.patients_treated}</td>
                <td>${doctor.rating}/5</td>
                <td><span class="status-badge status-${doctor.available ? 'active' : 'inactive'}">${doctor.available ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="adminDashboard.editDoctor(${doctor.id})">Edit</button>
                        <button class="btn btn-sm btn-secondary" onclick="adminDashboard.viewDoctorSchedule(${doctor.id})">Schedule</button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.toggleDoctorStatus(${doctor.id})">${doctor.available ? 'Deactivate' : 'Activate'}</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadAppointments() {
        try {
            const response = await fetch('php/admin-api.php?action=get_appointments');
            const data = await response.json();
            
            if (data.success) {
                this.appointments = data.appointments;
                this.displayAppointments(this.appointments);
                this.populateAppointmentFilters();
            }
        } catch (error) {
            console.error('Failed to load appointments:', error);
        }
    }

    displayAppointments(appointments) {
        const tbody = document.getElementById('appointments-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = appointments.map(apt => `
            <tr>
                <td>${this.formatAppointmentDate(apt.date, apt.time)}</td>
                <td>${apt.patient_name}</td>
                <td>${apt.doctor_name}</td>
                <td>${apt.type || 'Consultation'}</td>
                <td>$${apt.fee}</td>
                <td><span class="status-badge status-${apt.status}">${this.capitalizeFirst(apt.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="adminDashboard.viewAppointment(${apt.id})">View</button>
                        ${apt.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="adminDashboard.confirmAppointment(${apt.id})">Confirm</button>` : ''}
                        ${apt.status !== 'completed' ? `<button class="btn btn-sm btn-danger" onclick="adminDashboard.cancelAppointment(${apt.id})">Cancel</button>` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    populateAppointmentFilters() {
        const doctorFilter = document.getElementById('appointment-doctor-filter');
        if (!doctorFilter) return;
        
        const uniqueDoctors = [...new Set(this.appointments.map(apt => apt.doctor_name))];
        doctorFilter.innerHTML = '<option value="">All Doctors</option>' + 
            uniqueDoctors.map(doctor => `<option value="${doctor}">${doctor}</option>`).join('');
    }

    async loadPatients() {
        try {
            const response = await fetch('php/admin-api.php?action=get_patients');
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
                <td>${this.calculateAge(patient.date_of_birth)}</td>
                <td>${patient.last_visit || 'Never'}</td>
                <td>${patient.total_visits || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="adminDashboard.viewPatient(${patient.id})">View</button>
                        <button class="btn btn-sm btn-secondary" onclick="adminDashboard.viewPatientHistory(${patient.id})">History</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadStaff() {
        try {
            const response = await fetch('php/admin-api.php?action=get_staff');
            const data = await response.json();
            
            if (data.success) {
                this.staff = data.staff;
                this.displayStaff(this.staff);
            }
        } catch (error) {
            console.error('Failed to load staff:', error);
        }
    }

    displayStaff(staff) {
        const tbody = document.getElementById('staff-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = staff.map(member => `
            <tr>
                <td>${member.name}</td>
                <td>${this.capitalizeFirst(member.role)}</td>
                <td>${member.department}</td>
                <td>${member.phone}</td>
                <td><span class="status-badge status-active">Active</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="adminDashboard.editStaff(${member.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.toggleStaffStatus(${member.id})">Deactivate</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterDoctors() {
        const specialty = document.getElementById('specialty-filter').value;
        const status = document.getElementById('status-filter').value;
        const search = document.getElementById('doctor-search').value.toLowerCase();
        
        const filtered = this.doctors.filter(doctor => {
            const matchesSpecialty = !specialty || doctor.specialty.toLowerCase().includes(specialty);
            const matchesStatus = !status || (status === 'active' ? doctor.available : !doctor.available);
            const matchesSearch = !search || 
                doctor.name.toLowerCase().includes(search) ||
                doctor.email.toLowerCase().includes(search);
            
            return matchesSpecialty && matchesStatus && matchesSearch;
        });
        
        this.displayDoctors(filtered);
    }

    filterAppointments() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const doctor = document.getElementById('appointment-doctor-filter').value;
        const status = document.getElementById('appointment-status-filter').value;
        
        const filtered = this.appointments.filter(apt => {
            const matchesDateRange = (!startDate || apt.date >= startDate) && 
                                   (!endDate || apt.date <= endDate);
            const matchesDoctor = !doctor || apt.doctor_name === doctor;
            const matchesStatus = !status || apt.status === status;
            
            return matchesDateRange && matchesDoctor && matchesStatus;
        });
        
        this.displayAppointments(filtered);
    }

    filterPatients() {
        const search = document.getElementById('patient-search').value.toLowerCase();
        
        const filtered = this.patients.filter(patient => 
            patient.name.toLowerCase().includes(search) ||
            patient.email.toLowerCase().includes(search) ||
            patient.phone.includes(search)
        );
        
        this.displayPatients(filtered);
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

    async handleSettingsUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        formData.append('action', 'update_settings');
        
        try {
            const response = await fetch('php/admin-api.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Settings updated successfully!', 'success');
            } else {
                this.showNotification(data.error || 'Failed to update settings', 'error');
            }
        } catch (error) {
            console.error('Settings update failed:', error);
            this.showNotification('Failed to update settings', 'error');
        }
    }

    async handleAddDoctor(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        formData.append('action', 'add_doctor');
        
        try {
            const response = await fetch('php/admin-api.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Doctor added successfully!', 'success');
                this.closeModal('addDoctorModal');
                this.loadDoctors();
                e.target.reset();
            } else {
                this.showNotification(data.error || 'Failed to add doctor', 'error');
            }
        } catch (error) {
            console.error('Add doctor failed:', error);
            this.showNotification('Failed to add doctor', 'error');
        }
    }

    async handleAddStaff(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        formData.append('action', 'add_staff');
        
        try {
            const response = await fetch('php/admin-api.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Staff member added successfully!', 'success');
                this.closeModal('addStaffModal');
                this.loadStaff();
                e.target.reset();
            } else {
                this.showNotification(data.error || 'Failed to add staff member', 'error');
            }
        } catch (error) {
            console.error('Add staff failed:', error);
            this.showNotification('Failed to add staff member', 'error');
        }
    }

    async handleEditStaff(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        formData.append('action', 'update_staff');
        
        try {
            const response = await fetch('php/admin-api.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Staff member updated successfully!', 'success');
                this.closeModal('editStaffModal');
                this.loadStaff();
            } else {
                this.showNotification(data.error || 'Failed to update staff member', 'error');
            }
        } catch (error) {
            console.error('Update staff failed:', error);
            this.showNotification('Failed to update staff member', 'error');
        }
    }

    // Modal and utility functions
    openAddDoctorModal() {
        document.getElementById('addDoctorModal').style.display = 'block';
    }

    openAddStaffModal() {
        document.getElementById('addStaffModal').style.display = 'block';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    async editDoctor(doctorId) {
        this.showNotification('Edit doctor functionality coming soon', 'info');
    }

    async viewDoctorSchedule(doctorId) {
        this.showNotification('View doctor schedule functionality coming soon', 'info');
    }

    async toggleDoctorStatus(doctorId) {
        try {
            // Find the doctor to get current status
            const doctor = this.doctors.find(d => d.id === doctorId);
            if (!doctor) {
                this.showNotification('Doctor not found', 'error');
                return;
            }

            const currentStatus = doctor.available;
            const actionText = currentStatus ? 'deactivate' : 'activate';
            
            // Show confirmation dialog
            if (!confirm(`Are you sure you want to ${actionText} Dr. ${doctor.name}?`)) {
                return;
            }

            const response = await fetch('php/admin-api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=toggle_doctor_status&doctor_id=${doctorId}&status=${!currentStatus}`
            });

            const data = await response.json();

            if (data.success) {
                // Update local data
                doctor.available = !currentStatus;
                
                // Refresh the doctors display
                this.displayDoctors(this.doctors);
                
                const statusText = doctor.available ? 'activated' : 'deactivated';
                this.showNotification(`Dr. ${doctor.name} has been ${statusText} successfully`, 'success');
                
                // Log the activity in the activity feed
                this.addActivityToFeed(`Doctor ${doctor.name} ${statusText}`, 'admin', statusText);
            } else {
                this.showNotification(data.error || 'Failed to update doctor status', 'error');
            }
        } catch (error) {
            console.error('Toggle doctor status error:', error);
            this.showNotification('Failed to update doctor status', 'error');
        }
    }

    async viewAppointment(appointmentId) {
        this.showNotification('View appointment details functionality coming soon', 'info');
    }

    async confirmAppointment(appointmentId) {
        this.showNotification('Confirm appointment functionality coming soon', 'info');
    }

    async cancelAppointment(appointmentId) {
        this.showNotification('Cancel appointment functionality coming soon', 'info');
    }

    async viewPatient(patientId) {
        this.showNotification('View patient details functionality coming soon', 'info');
    }

    async viewPatientHistory(patientId) {
        this.showNotification('View patient history functionality coming soon', 'info');
    }

    async editStaff(staffId) {
        try {
            // Load staff member data
            const response = await fetch(`php/admin-api.php?action=get_staff_by_id&id=${staffId}`);
            const data = await response.json();
            
            if (data.success && data.staff) {
                const staff = data.staff;
                
                // Populate the form
                document.getElementById('edit-staff-id').value = staff.id;
                document.getElementById('edit-staff-name').value = staff.name;
                document.getElementById('edit-staff-email').value = staff.email;
                document.getElementById('edit-staff-phone').value = staff.phone;
                document.getElementById('edit-staff-role').value = staff.role;
                document.getElementById('edit-staff-department').value = staff.department;
                document.getElementById('edit-staff-hire-date').value = staff.hire_date;
                document.getElementById('edit-staff-status').value = staff.is_active ? '1' : '0';
                
                // Show the modal
                document.getElementById('editStaffModal').style.display = 'block';
            } else {
                this.showNotification(data.error || 'Failed to load staff data', 'error');
            }
        } catch (error) {
            console.error('Edit staff failed:', error);
            this.showNotification('Failed to load staff data', 'error');
        }
    }

    async toggleStaffStatus(staffId) {
        try {
            const response = await fetch('php/admin-api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=toggle_staff_status&staff_id=${staffId}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Staff status updated successfully!', 'success');
                this.loadStaff(); // Reload staff list
            } else {
                this.showNotification(data.error || 'Failed to update staff status', 'error');
            }
        } catch (error) {
            console.error('Toggle staff status failed:', error);
            this.showNotification('Failed to update staff status', 'error');
        }
    }

    calculateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
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

    addActivityToFeed(description, userRole, status = 'completed') {
        // Add activity to recent activity display
        const tbody = document.getElementById('activity-table-body');
        if (tbody) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${timeString}</td>
                <td>${description}</td>
                <td>${this.currentUser ? this.currentUser.full_name : 'Administrator'}</td>
                <td><span class="status-badge status-${status}">${this.capitalizeFirst(status)}</span></td>
            `;
            
            // Insert at the beginning of the table
            tbody.insertBefore(newRow, tbody.firstChild);
            
            // Keep only the latest 10 activities visible
            while (tbody.children.length > 10) {
                tbody.removeChild(tbody.lastChild);
            }
        }
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
window.openAddDoctorModal = () => window.adminDashboard.openAddDoctorModal();
window.openAddStaffModal = () => window.adminDashboard.openAddStaffModal();
window.closeModal = (modalId) => window.adminDashboard.closeModal(modalId);
window.editDoctor = (id) => window.adminDashboard.editDoctor(id);
window.viewDoctorSchedule = (id) => window.adminDashboard.viewDoctorSchedule(id);
window.toggleDoctorStatus = (id) => window.adminDashboard.toggleDoctorStatus(id);
window.viewAppointment = (id) => window.adminDashboard.viewAppointment(id);
window.confirmAppointment = (id) => window.adminDashboard.confirmAppointment(id);
window.cancelAppointment = (id) => window.adminDashboard.cancelAppointment(id);
window.viewPatient = (id) => window.adminDashboard.viewPatient(id);
window.viewPatientHistory = (id) => window.adminDashboard.viewPatientHistory(id);
window.editStaff = (id) => window.adminDashboard.editStaff(id);
window.toggleStaffStatus = (id) => window.adminDashboard.toggleStaffStatus(id);

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});