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
        this.currentWeek = new Date();
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadDashboardData();
        this.setupSidebarNavigation();
        this.setupMobileMenu();
        this.updateCurrentDate();
        // Initialize back to top button
        if (window.HealthCare && window.HealthCare.initializeBackToTop) {
            window.HealthCare.initializeBackToTop();
        }
    }

    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
            
            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    const isToggle = e.target.closest('#mobile-menu-toggle');
                    const isSidebar = e.target.closest('#sidebar');
                    
                    if (!isToggle && !isSidebar && sidebar.classList.contains('active')) {
                        sidebar.classList.remove('active');
                    }
                }
            });
        }
    }

    updateCurrentDate() {
        const currentDateElement = document.getElementById('current-date');
        if (currentDateElement) {
            const today = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            currentDateElement.textContent = today.toLocaleDateString('en-US', options);
        }
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
            // Update navigation and header elements
            const userNameElement = document.getElementById('user-name');
            const doctorNameElement = document.getElementById('doctor-name');
            const dashboardDoctorName = document.getElementById('dashboard-doctor-name');
            const doctorAvatar = document.getElementById('doctor-avatar');
            const doctorSpecialty = document.getElementById('doctor-specialty');
            
            if (userNameElement) {
                userNameElement.textContent = `Dr. ${this.currentUser.full_name}`;
            }
            
            if (doctorNameElement) {
                doctorNameElement.textContent = `Dr. ${this.currentUser.full_name}`;
            }
            
            if (dashboardDoctorName) {
                dashboardDoctorName.textContent = `Dr. ${this.currentUser.full_name}`;
            }
            
            if (doctorAvatar && this.currentUser.full_name) {
                const initials = this.currentUser.full_name.split(' ')
                    .map(name => name.charAt(0))
                    .join('')
                    .toUpperCase();
                doctorAvatar.textContent = initials;
            }
            
            if (doctorSpecialty) {
                doctorSpecialty.textContent = this.currentUser.department || 'General Medicine';
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
            'profile-specialty': this.currentUser.department || 'General Medicine',
            'profile-experience': this.currentUser.experience || '5',
            'profile-qualification': this.currentUser.qualification || 'MBBS',
            'profile-bio': this.currentUser.bio || ''
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

        // Availability form
        const availabilityForm = document.getElementById('availability-form');
        if (availabilityForm) {
            availabilityForm.addEventListener('submit', this.handleAvailabilityUpdate.bind(this));
        }

        // Save availability button
        const saveAvailabilityBtn = document.getElementById('save-availability-btn');
        if (saveAvailabilityBtn) {
            saveAvailabilityBtn.addEventListener('click', this.handleSaveAvailability.bind(this));
        }

        // Week navigation buttons
        const prevWeekBtn = document.getElementById('prev-week-btn');
        const nextWeekBtn = document.getElementById('next-week-btn');
        
        if (prevWeekBtn) {
            prevWeekBtn.addEventListener('click', this.previousWeek.bind(this));
        }
        
        if (nextWeekBtn) {
            nextWeekBtn.addEventListener('click', this.nextWeek.bind(this));
        }

        // Availability date selector
        const availabilityDate = document.getElementById('availability-date');
        if (availabilityDate) {
            availabilityDate.addEventListener('change', this.loadAvailabilityForDate.bind(this));
        }

        // Patient search
        const patientSearch = document.getElementById('patient-search');
        if (patientSearch) {
            patientSearch.addEventListener('input', this.handlePatientSearch.bind(this));
        }

        // Initialize enhanced patient search functionality
        this.setupEnhancedPatientSearch();
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
            } else {
                // Show empty state when no data available
                this.displayTodayAppointments([]);
            }
        } catch (error) {
            console.error('Failed to load today appointments:', error);
            this.displayTodayAppointments([]);
        }
    }

    displayTodayAppointments(appointments) {
        const container = document.getElementById('today-appointments-list');
        if (!container) return;
        
        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-day"></i>
                    <h3>No appointments scheduled for today</h3>
                    <p>You have a clear schedule today. Enjoy your free time!</p>
                </div>
            `;
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
                        <span>${apt.reason || 'General Consultation'}</span>
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
        const scheduleContainer = document.getElementById('weekly-schedule-grid');
        if (!scheduleContainer) return;

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        scheduleContainer.innerHTML = days.map((day, index) => {
            const daySlots = schedule[day] || [];
            return `
                <div class="schedule-day">
                    <div class="day-header">
                        <h4>${dayNames[index]}</h4>
                        <span class="day-date">${this.getDateForDay(index)}</span>
                    </div>
                    <div class="day-slots">
                        ${daySlots.length > 0 ? 
                            daySlots.map(time => `
                                <div class="schedule-slot" data-day="${day}" data-time="${time}">
                                    <span class="slot-time">${this.formatTime(time)}</span>
                                    <button class="btn btn-sm btn-outline-primary" onclick="doctorDashboard.viewDaySchedule('${day}', '${time}')">
                                        View Details
                                    </button>
                                </div>
                            `).join('') : 
                            '<div class="no-slots">No appointments scheduled</div>'
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadAvailabilityForDate() {
        const dateInput = document.getElementById('availability-date');
        if (!dateInput) return;
        
        const selectedDate = dateInput.value || new Date().toISOString().split('T')[0];
        
        try {
            const response = await fetch(`php/doctor-api.php?action=get_availability&date=${selectedDate}`);
            const data = await response.json();
            
            if (data.success) {
                this.updateAvailabilityDisplay(data.availability);
            } else {
                this.generateAvailabilitySlots(selectedDate);
            }
        } catch (error) {
            console.error('Failed to load availability:', error);
            this.generateAvailabilitySlots(selectedDate);
        }
    }

    generateAvailabilitySlots(date) {
        const slotsContainer = document.getElementById('availability-slots');
        if (!slotsContainer) return;

        const timeSlots = [];
        for (let hour = 8; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                timeSlots.push(time);
            }
        }

        slotsContainer.innerHTML = `
            <div class="availability-header">
                <h4>Set your availability for ${new Date(date).toLocaleDateString()}</h4>
                <p>Select the time slots when you're available for appointments</p>
            </div>
            <div class="time-slots-grid">
                ${timeSlots.map(time => `
                    <div class="time-slot" data-time="${time}">
                        <input type="checkbox" id="slot-${time}" value="${time}">
                        <label for="slot-${time}">${this.formatTime(time)}</label>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async handleSaveAvailability() {
        const dateInput = document.getElementById('availability-date');
        const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
        
        const selectedSlots = Array.from(document.querySelectorAll('#availability-slots input:checked'))
            .map(input => input.value);

        try {
            const response = await fetch('php/doctor-api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=save_availability&date=${selectedDate}&slots=${JSON.stringify(selectedSlots)}`
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Availability saved successfully', 'success');
            } else {
                this.showNotification('Failed to save availability', 'error');
            }
        } catch (error) {
            console.error('Failed to save availability:', error);
            this.showNotification('Failed to save availability', 'error');
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
        const searchBar = e.target.closest('.search-bar');
        
        // Show/hide clear button
        const clearBtn = searchBar?.querySelector('.search-clear');
        if (clearBtn) {
            clearBtn.style.display = searchTerm.length > 0 ? 'block' : 'none';
            if (searchTerm.length > 0) {
                searchBar.classList.add('has-text');
            } else {
                searchBar.classList.remove('has-text');
            }
        }
        
        // Show suggestions for terms longer than 1 character
        if (searchTerm.length > 1) {
            this.showPatientSearchSuggestions(searchTerm);
        } else {
            this.hidePatientSuggestions();
        }
        
        const filteredPatients = this.patients.filter(patient => 
            patient.name.toLowerCase().includes(searchTerm) ||
            patient.email.toLowerCase().includes(searchTerm) ||
            patient.phone.includes(searchTerm)
        );
        
        this.displayPatients(filteredPatients);
        this.updatePatientSearchResults(searchTerm, filteredPatients.length, this.patients.length);
        this.highlightPatientSearchTerms(searchTerm);
    }

    clearPatientSearch() {
        const searchInput = document.getElementById('patient-search');
        const searchBar = document.querySelector('.search-bar');
        const clearBtn = searchBar?.querySelector('.search-clear');
        
        if (searchInput) {
            searchInput.value = '';
        }
        if (clearBtn) {
            clearBtn.style.display = 'none';
        }
        if (searchBar) {
            searchBar.classList.remove('has-text');
        }
        
        this.hidePatientSuggestions();
        this.displayPatients(this.patients);
        this.hidePatientSearchResults();
    }

    setupEnhancedPatientSearch() {
        const searchInput = document.getElementById('patient-search');
        
        if (searchInput) {
            searchInput.addEventListener('input', this.handlePatientSearch.bind(this));
            
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.clearPatientSearch();
                } else if (e.key === 'Enter') {
                    this.hidePatientSuggestions();
                }
            });
        }

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-bar')) {
                this.hidePatientSuggestions();
            }
        });
    }

    showPatientSearchSuggestions(searchTerm) {
        if (!this.patients || this.patients.length === 0) return;

        const suggestions = new Set();
        const term = searchTerm.toLowerCase();

        // Get unique suggestions from patients data
        this.patients.forEach(patient => {
            if (patient.name.toLowerCase().includes(term)) {
                suggestions.add(patient.name);
            }
            if (patient.email && patient.email.toLowerCase().includes(term)) {
                suggestions.add(patient.email);
            }
            if (patient.phone && patient.phone.includes(term)) {
                suggestions.add(patient.phone);
            }
        });

        this.displayPatientSuggestions(Array.from(suggestions).slice(0, 5));
    }

    displayPatientSuggestions(suggestions) {
        const container = document.getElementById('patient-search-suggestions');
        if (!container) return;

        if (suggestions.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = suggestions.map(suggestion => 
            `<div class="search-suggestion" onclick="doctorDashboard.selectPatientSuggestion('${suggestion}')">${suggestion}</div>`
        ).join('');
        
        container.style.display = 'block';
    }

    selectPatientSuggestion(suggestion) {
        const searchInput = document.getElementById('patient-search');
        if (searchInput) {
            searchInput.value = suggestion;
            this.handlePatientSearch({ target: searchInput });
        }
        this.hidePatientSuggestions();
    }

    hidePatientSuggestions() {
        const container = document.getElementById('patient-search-suggestions');
        if (container) {
            container.style.display = 'none';
        }
    }

    updatePatientSearchResults(searchTerm, filteredCount, totalCount) {
        const container = document.getElementById('patient-search-results');
        if (!container) return;

        if (searchTerm && searchTerm.length > 0) {
            container.innerHTML = `Showing ${filteredCount} of ${totalCount} patients for "${searchTerm}"`;
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    }

    hidePatientSearchResults() {
        const container = document.getElementById('patient-search-results');
        if (container) {
            container.style.display = 'none';
        }
    }

    highlightPatientSearchTerms(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) return;

        const tableBody = document.getElementById('patients-table-body');
        if (!tableBody) return;

        const cells = tableBody.querySelectorAll('td');
        cells.forEach(cell => {
            const text = cell.textContent;
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            if (regex.test(text)) {
                cell.innerHTML = text.replace(regex, '<span class="search-highlight">$1</span>');
            }
        });
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

    getDateForDay(dayIndex) {
        const today = new Date();
        const currentDay = today.getDay();
        const targetDay = dayIndex === 6 ? 0 : dayIndex + 1; // Convert our index to JS day index
        const diff = targetDay - currentDay;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + diff);
        
        return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    async viewDaySchedule(day, time) {
        try {
            const response = await fetch(`php/doctor-api.php?action=get_day_schedule&day=${day}&time=${time}`);
            const data = await response.json();
            
            if (data.success) {
                this.showDayScheduleModal(day, time, data.appointments);
            }
        } catch (error) {
            console.error('Failed to load day schedule:', error);
            this.showNotification('Failed to load schedule details', 'error');
        }
    }

    showDayScheduleModal(day, time, appointments) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content schedule-modal">
                <div class="modal-header">
                    <h3>Schedule Details - ${this.capitalizeFirst(day)} at ${this.formatTime(time)}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${appointments.length > 0 ? `
                        <div class="appointment-list">
                            ${appointments.map(apt => `
                                <div class="appointment-card">
                                    <div class="appointment-header">
                                        <h4>${apt.patient_name}</h4>
                                        <span class="status-badge status-${apt.status}">${this.capitalizeFirst(apt.status)}</span>
                                    </div>
                                    <div class="appointment-details">
                                        <p><i class="fas fa-clock"></i> ${this.formatTime(apt.time)}</p>
                                        <p><i class="fas fa-phone"></i> ${apt.patient_phone}</p>
                                        <p><i class="fas fa-envelope"></i> ${apt.patient_email}</p>
                                        <p><i class="fas fa-notes-medical"></i> ${apt.type || 'General Consultation'}</p>
                                    </div>
                                    <div class="appointment-actions">
                                        ${apt.status === 'scheduled' ? 
                                            `<button class="btn btn-primary btn-sm" onclick="doctorDashboard.confirmAppointment(${apt.id})">Confirm</button>` : ''
                                        }
                                        <button class="btn btn-secondary btn-sm" onclick="doctorDashboard.viewPatientHistory(${apt.patient_id})">View History</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <i class="fas fa-calendar-times"></i>
                            <p>No appointments scheduled for this time slot</p>
                            <button class="btn btn-primary" onclick="doctorDashboard.openAvailabilityManager('${day}', '${time}')">
                                Manage Availability
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async openAvailabilityManager(day, time) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content availability-modal">
                <div class="modal-header">
                    <h3>Manage Availability - ${this.capitalizeFirst(day)}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="availability-manager">
                        <div class="time-slot-manager">
                            <h4>Available Time Slots</h4>
                            <div class="time-slots-grid" id="availability-slots">
                                ${this.generateTimeSlots()}
                            </div>
                            <button class="btn btn-primary" onclick="doctorDashboard.saveAvailability('${day}')">
                                Save Availability
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.loadCurrentAvailability(day);
    }

    generateTimeSlots() {
        const slots = [];
        for (let hour = 8; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(`
                    <div class="time-slot" data-time="${time}">
                        <input type="checkbox" id="slot-${time}" value="${time}">
                        <label for="slot-${time}">${this.formatTime(time)}</label>
                    </div>
                `);
            }
        }
        return slots.join('');
    }

    async loadCurrentAvailability(day) {
        try {
            const response = await fetch(`php/doctor-api.php?action=get_day_availability&day=${day}`);
            const data = await response.json();
            
            if (data.success && data.availability) {
                data.availability.forEach(time => {
                    const checkbox = document.getElementById(`slot-${time}`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        } catch (error) {
            console.error('Failed to load current availability:', error);
        }
    }

    async saveAvailability(day) {
        const checkedSlots = Array.from(document.querySelectorAll('#availability-slots input:checked'))
            .map(input => input.value);
        
        try {
            const response = await fetch('php/doctor-api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=update_day_availability&day=${day}&slots=${JSON.stringify(checkedSlots)}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Availability updated successfully', 'success');
                document.querySelector('.modal-overlay').remove();
                this.loadWeeklySchedule(); // Refresh the schedule
            } else {
                this.showNotification('Failed to update availability', 'error');
            }
        } catch (error) {
            console.error('Failed to save availability:', error);
            this.showNotification('Failed to save availability', 'error');
        }
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

    // Patient History Methods
    async viewPatientHistory(patientId) {
        try {
            this.currentPatientId = patientId;
            document.getElementById('patient-history-modal').style.display = 'block';
            
            const response = await fetch(`php/patient-history-api.php?action=get_patient_history&patient_id=${patientId}`);
            const data = await response.json();
            
            if (data.success) {
                this.displayPatientHistory(data.history);
                this.setupHistoryTabs();
            } else {
                this.showNotification('Failed to load patient history', 'error');
                this.closeModal('patient-history-modal');
            }
        } catch (error) {
            console.error('Error loading patient history:', error);
            this.showNotification('Error loading patient history', 'error');
            this.closeModal('patient-history-modal');
        }
    }

    displayPatientHistory(history) {
        const patient = history.patient;
        const stats = history.statistics;
        
        document.getElementById('history-patient-name').textContent = patient.full_name;
        document.getElementById('history-patient-age').textContent = `Age: ${this.calculateAge(patient.date_of_birth)}`;
        document.getElementById('history-patient-gender').textContent = `Gender: ${patient.gender || 'Not specified'}`;
        document.getElementById('history-patient-phone').textContent = `Phone: ${patient.phone}`;
        document.getElementById('history-patient-email').textContent = `Email: ${patient.email}`;
        
        document.getElementById('history-total-appointments').textContent = stats.total_appointments;
        document.getElementById('history-last-visit').textContent = stats.last_visit ? 
            this.formatAppointmentDate(stats.last_visit) : 'No visits';
        
        this.displayPatientAppointments(history.appointments);
        this.displayPatientRecords(history.medical_records);
        this.displayPatientPrescriptions(history.prescriptions);
        this.displayPatientVitals(history.vital_signs);
    }

    displayPatientAppointments(appointments) {
        const container = document.getElementById('patient-appointments-list');
        
        if (!appointments || appointments.length === 0) {
            container.innerHTML = '<div class="no-data">No appointments found</div>';
            return;
        }
        
        const appointmentsHTML = appointments.map(appointment => `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-date">${this.formatAppointmentDate(appointment.date, appointment.time)}</div>
                    <div class="history-status status-${appointment.status}">${this.capitalizeFirst(appointment.status)}</div>
                </div>
                <div class="history-details">
                    <strong>Doctor:</strong> Dr. ${appointment.doctor_name}<br>
                    <strong>Specialty:</strong> ${appointment.specialty}<br>
                    <strong>Type:</strong> ${appointment.appointment_type || 'Consultation'}<br>
                    ${appointment.outcome ? `<strong>Outcome:</strong> ${appointment.outcome}<br>` : ''}
                    ${appointment.notes ? `<strong>Notes:</strong> ${appointment.notes}` : ''}
                </div>
                <div class="history-meta">
                    <span><i class="fas fa-calendar"></i> ${appointment.date}</span>
                    <span><i class="fas fa-clock"></i> ${this.formatTime(appointment.time)}</span>
                    ${appointment.fee ? `<span><i class="fas fa-dollar-sign"></i> $${appointment.fee}</span>` : ''}
                </div>
            </div>
        `).join('');
        
        container.innerHTML = appointmentsHTML;
    }

    displayPatientRecords(records) {
        const container = document.getElementById('patient-records-list');
        
        if (!records || records.length === 0) {
            container.innerHTML = '<div class="no-data">No medical records found</div>';
            return;
        }
        
        const recordsHTML = records.map(record => `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-date">${this.formatAppointmentDate(record.date)}</div>
                    <div class="history-status status-${record.status}">${this.capitalizeFirst(record.status)}</div>
                </div>
                <div class="history-details">
                    <strong>Doctor:</strong> ${record.doctor_name}<br>
                    <strong>Specialty:</strong> ${record.specialty}<br>
                    <strong>Diagnosis:</strong> ${record.diagnosis}<br>
                    <strong>Treatment:</strong> ${record.treatment}<br>
                    ${record.notes ? `<strong>Notes:</strong> ${record.notes}` : ''}
                </div>
                <div class="history-meta">
                    <span><i class="fas fa-calendar"></i> ${record.date}</span>
                    <span><i class="fas fa-stethoscope"></i> ${record.type}</span>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = recordsHTML;
    }

    displayPatientPrescriptions(prescriptions) {
        const container = document.getElementById('patient-prescriptions-list');
        
        if (!prescriptions || prescriptions.length === 0) {
            container.innerHTML = '<div class="no-data">No prescriptions found</div>';
            return;
        }
        
        const prescriptionsHTML = prescriptions.map(prescription => `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-date">${this.formatAppointmentDate(prescription.date)}</div>
                    <div class="history-status status-${prescription.status}">${this.capitalizeFirst(prescription.status)}</div>
                </div>
                <div class="history-details">
                    <strong>Medication:</strong> ${prescription.medication}<br>
                    <strong>Dosage:</strong> ${prescription.dosage}<br>
                    <strong>Frequency:</strong> ${prescription.frequency}<br>
                    <strong>Duration:</strong> ${prescription.duration}<br>
                    <strong>Doctor:</strong> ${prescription.doctor_name}<br>
                    ${prescription.instructions ? `<strong>Instructions:</strong> ${prescription.instructions}` : ''}
                </div>
                <div class="history-meta">
                    <span><i class="fas fa-calendar"></i> ${prescription.date}</span>
                    <span><i class="fas fa-pills"></i> ${prescription.refills} refills left</span>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = prescriptionsHTML;
    }

    displayPatientVitals(vitals) {
        const container = document.getElementById('patient-vitals-list');
        
        if (!vitals || vitals.length === 0) {
            container.innerHTML = '<div class="no-data">No vital signs recorded</div>';
            return;
        }
        
        const vitalsHTML = vitals.map(vital => `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-date">${this.formatAppointmentDate(vital.date)}</div>
                    <div class="history-status status-completed">Recorded</div>
                </div>
                <div class="history-details">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div><strong>Blood Pressure:</strong> ${vital.blood_pressure}</div>
                        <div><strong>Heart Rate:</strong> ${vital.heart_rate} bpm</div>
                        <div><strong>Temperature:</strong> ${vital.temperature}</div>
                        <div><strong>Weight:</strong> ${vital.weight}</div>
                        <div><strong>Height:</strong> ${vital.height}</div>
                        <div><strong>BMI:</strong> ${vital.bmi}</div>
                        <div><strong>Oxygen Sat:</strong> ${vital.oxygen_saturation}</div>
                    </div>
                </div>
                <div class="history-meta">
                    <span><i class="fas fa-calendar"></i> ${vital.date}</span>
                    <span><i class="fas fa-heartbeat"></i> Vital Signs</span>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = vitalsHTML;
    }

    setupHistoryTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    }

    openAddRecordModal() {
        const patientId = this.currentPatientId;
        if (!patientId) {
            this.showNotification('Please select a patient first', 'error');
            return;
        }
        
        document.getElementById('record-patient-id').value = patientId;
        document.getElementById('add-record-modal').style.display = 'block';
    }

    async handleAddMedicalRecord(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData();
            formData.append('action', 'add_medical_record');
            formData.append('patient_id', document.getElementById('record-patient-id').value);
            formData.append('diagnosis', document.getElementById('record-diagnosis').value);
            formData.append('treatment', document.getElementById('record-treatment').value);
            formData.append('notes', document.getElementById('record-notes').value);
            
            const response = await fetch('php/patient-history-api.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Medical record added successfully', 'success');
                this.closeModal('add-record-modal');
                this.viewPatientHistory(this.currentPatientId);
            } else {
                this.showNotification(data.error || 'Failed to add medical record', 'error');
            }
        } catch (error) {
            console.error('Error adding medical record:', error);
            this.showNotification('Error adding medical record', 'error');
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        
        if (modalId === 'add-record-modal') {
            document.getElementById('add-record-form').reset();
        }
    }

    // Additional appointment management methods
    async startConsultation(appointmentId) {
        this.showNotification('Starting consultation...', 'info');
        // In a real application, this would open a consultation interface
        console.log('Starting consultation for appointment:', appointmentId);
    }

    async confirmAppointment(appointmentId) {
        try {
            const response = await fetch('php/doctor-api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=confirm_appointment&appointment_id=${appointmentId}`
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Appointment confirmed successfully', 'success');
                this.loadTodayAppointments();
                this.loadAllAppointments();
            } else {
                this.showNotification('Failed to confirm appointment', 'error');
            }
        } catch (error) {
            console.error('Failed to confirm appointment:', error);
            this.showNotification('Failed to confirm appointment', 'error');
        }
    }

    // Week navigation methods
    previousWeek() {
        this.currentWeek.setDate(this.currentWeek.getDate() - 7);
        this.updateWeekDisplay();
        this.loadWeeklySchedule();
    }

    nextWeek() {
        this.currentWeek.setDate(this.currentWeek.getDate() + 7);
        this.updateWeekDisplay();
        this.loadWeeklySchedule();
    }

    updateWeekDisplay() {
        const weekElement = document.getElementById('current-week');
        if (weekElement) {
            const startOfWeek = new Date(this.currentWeek);
            startOfWeek.setDate(this.currentWeek.getDate() - this.currentWeek.getDay() + 1);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            const weekString = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            weekElement.textContent = weekString;
        }
    }

    clearAllSlots() {
        const slots = document.querySelectorAll('#availability-slots input[type="checkbox"]');
        slots.forEach(slot => slot.checked = false);
        this.showNotification('All time slots cleared', 'info');
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