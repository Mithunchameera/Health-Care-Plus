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
        this.setupProfilePhotoUpload();
        this.populateProfileForm();
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
        // Use demo data for demo environment - no authentication checks or redirections
        this.currentUser = {
            id: 1,
            first_name: 'Dr. Sarah',
            last_name: 'Johnson',
            email: 'dr.johnson@healthcareplus.com',
            role: 'doctor'
        };
        this.updateUserDisplay();
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
        
        // Add medical record form
        const addRecordForm = document.getElementById('add-record-form');
        if (addRecordForm) {
            addRecordForm.addEventListener('submit', this.handleAddMedicalRecord.bind(this));
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
        // Use demo data directly to avoid authentication calls
        this.updateStatsDisplay({
            today_appointments: 8,
            total_patients: 156,
            upcoming_count: 3,
            doctor_rating: 4.8
        });
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
        // Use demo data directly to avoid authentication calls
        this.displayTodayAppointments([
            {
                id: 1,
                patient_name: 'John Smith',
                time: '09:00',
                type: 'Consultation',
                status: 'confirmed',
                patient_phone: '(555) 123-4567'
            },
            {
                id: 2,
                patient_name: 'Mary Johnson',
                time: '10:30',
                type: 'Follow-up',
                status: 'confirmed',
                patient_phone: '(555) 987-6543'
            }
        ]);
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
        // Use demo data to avoid authentication calls
        this.displayAppointmentsTable([
            {
                id: 1,
                date: '2025-06-21',
                time: '09:00',
                patient_name: 'John Smith',
                patient_phone: '(555) 123-4567',
                patient_id: 1,
                type: 'Consultation',
                status: 'confirmed'
            }
        ]);
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
        // Use demo data to avoid authentication calls
        this.patients = [
            {
                id: 1,
                first_name: 'John',
                last_name: 'Smith',
                email: 'john.smith@email.com',
                phone: '(555) 123-4567',
                date_of_birth: '1985-03-15'
            }
        ];
        this.displayPatients(this.patients);
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
                    <button class="btn btn-sm btn-primary" onclick="doctorDashboard.viewPatientDetails(${patient.id})">
                        <i class="fas fa-user-circle"></i> View Details
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadWeeklySchedule() {
        // Use demo data to avoid authentication calls
        this.displayWeeklySchedule({
            Monday: ['09:00', '10:00', '11:00'],
            Tuesday: ['09:00', '10:00'],
            Wednesday: ['14:00', '15:00', '16:00'],
            Thursday: ['09:00', '10:00', '11:00', '14:00'],
            Friday: ['09:00', '10:00']
        });
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
            // Set flags to allow staying on home page after logout
            sessionStorage.setItem('allowHomeAccess', 'true');
            sessionStorage.setItem('skipHomeRedirect', 'true');
            
            const response = await fetch('php/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'logout' })
            });
            
            // Redirect to home page instead of login
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout failed:', error);
            // Ensure flags are set even on error
            sessionStorage.setItem('allowHomeAccess', 'true');
            sessionStorage.setItem('skipHomeRedirect', 'true');
            window.location.href = 'index.html';
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        try {
            // Collect form data
            const profileData = {
                name: document.getElementById('profile-name').value,
                specialty: document.getElementById('profile-specialty').value,
                subspecialty: document.getElementById('profile-subspecialty').value,
                license: document.getElementById('profile-license').value,
                phone: document.getElementById('profile-phone').value,
                email: document.getElementById('profile-email').value,
                officeAddress: document.getElementById('profile-office-address').value,
                hospital: document.getElementById('profile-hospital').value,
                experience: document.getElementById('profile-experience').value,
                qualification: document.getElementById('profile-qualification').value,
                certifications: document.getElementById('profile-certifications').value,
                languages: document.getElementById('profile-languages').value,
                bio: document.getElementById('profile-bio').value,
                consultationFee: document.getElementById('profile-consultation-fee').value,
                followUpFee: document.getElementById('profile-follow-up-fee').value,
                services: document.getElementById('profile-services').value,
                typicalHours: document.getElementById('profile-typical-hours').value,
                appointmentDuration: document.getElementById('profile-appointment-duration').value
            };

            // Save to localStorage
            localStorage.setItem('doctor_profile', JSON.stringify(profileData));
            
            // Update current user data
            if (this.currentUser) {
                this.currentUser.name = profileData.name;
                this.currentUser.specialty = profileData.specialty;
                this.currentUser.phone = profileData.phone;
                this.currentUser.email = profileData.email;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }

            // Update display elements
            this.updateUserDisplay();
            this.updateProfileDisplay({
                'profile-name': profileData.name,
                'profile-specialty': profileData.specialty
            });
            
            this.showNotification('Profile updated successfully!', 'success');
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

    // Patient Details Methods
    async viewPatientDetails(patientId) {
        try {
            this.currentPatientId = patientId;
            document.getElementById('patient-details-modal').style.display = 'block';
            
            // Load comprehensive patient data
            const [patientResponse, historyResponse, recordsResponse] = await Promise.all([
                fetch(`php/patient-api.php?action=get_patient_details&patient_id=${patientId}`),
                fetch(`php/patient-history-api.php?action=get_patient_history&patient_id=${patientId}`),
                fetch(`php/patient-api.php?action=get_medical_records&patient_id=${patientId}`)
            ]);
            
            const patientData = await patientResponse.json();
            const historyData = await historyResponse.json();
            const recordsData = await recordsResponse.json();
            
            if (patientData.success && historyData.success) {
                this.displayPatientDetails(patientData.patient, historyData.history, recordsData.records || []);
                this.setupPatientDetailsTabs();
            } else {
                this.showNotification('Failed to load patient details', 'error');
                this.closeModal('patient-details-modal');
            }
        } catch (error) {
            console.error('Error loading patient details:', error);
            this.showNotification('Error loading patient details', 'error');
            this.closeModal('patient-details-modal');
        }
    }

    displayPatientDetails(patient, history, records) {
        const content = document.getElementById('patient-details-content');
        const age = this.calculateAge(patient.date_of_birth);
        
        content.innerHTML = `
            <div class="patient-details-container">
                <div class="patient-info-card">
                    <div class="patient-avatar">
                        ${patient.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div class="patient-basic-info">
                        <h4>${patient.full_name}</h4>
                        <p><i class="fas fa-birthday-cake"></i> ${age} years old</p>
                        <p><i class="fas fa-envelope"></i> ${patient.email}</p>
                        <p><i class="fas fa-phone"></i> ${patient.phone}</p>
                    </div>
                    
                    <div class="patient-details-info">
                        <div class="info-item">
                            <span class="info-label">Patient ID</span>
                            <span class="info-value">#${patient.id}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Blood Type</span>
                            <span class="info-value">${patient.blood_type || 'Not specified'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Address</span>
                            <span class="info-value">${patient.address || 'Not provided'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Emergency Contact</span>
                            <span class="info-value">${patient.emergency_contact || 'Not provided'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="patient-details-main">
                    <div class="patient-tabs">
                        <button class="tab-button active" data-tab="appointments">
                            <i class="fas fa-calendar-alt"></i> Appointments
                        </button>
                        <button class="tab-button" data-tab="records">
                            <i class="fas fa-file-medical"></i> Medical Records
                        </button>
                        <button class="tab-button" data-tab="prescriptions">
                            <i class="fas fa-pills"></i> Prescriptions
                        </button>
                        <button class="tab-button" data-tab="vitals">
                            <i class="fas fa-heartbeat"></i> Vitals
                        </button>
                    </div>
                    
                    <div id="appointments-tab" class="tab-content active">
                        ${this.renderAppointmentHistory(history)}
                    </div>
                    
                    <div id="records-tab" class="tab-content">
                        ${this.renderMedicalRecords(records)}
                    </div>
                    
                    <div id="prescriptions-tab" class="tab-content">
                        ${this.renderPrescriptions(records.filter(r => r.type === 'prescription'))}
                    </div>
                    
                    <div id="vitals-tab" class="tab-content">
                        ${this.renderVitals(patient)}
                    </div>
                </div>
            </div>
            
            <button class="add-record-btn" onclick="doctorDashboard.openAddRecordModal()">
                <i class="fas fa-plus"></i>
            </button>
        `;
    }

    renderAppointmentHistory(appointments) {
        if (!appointments.length) {
            return '<p class="text-center text-muted">No appointment history found.</p>';
        }

        return appointments.map(apt => `
            <div class="appointment-history-item">
                <div>
                    <div class="appointment-date-time">
                        ${this.formatAppointmentDate(apt.date, apt.time)}
                    </div>
                    <div class="text-muted">${apt.reason || 'General consultation'}</div>
                </div>
                <span class="appointment-status ${apt.status}">
                    ${this.capitalizeFirst(apt.status)}
                </span>
            </div>
        `).join('');
    }

    renderMedicalRecords(records) {
        if (!records.length) {
            return '<p class="text-center text-muted">No medical records found.</p>';
        }

        return records.map(record => `
            <div class="medical-record-item">
                <div class="record-header">
                    <span class="record-type">${this.capitalizeFirst(record.type)}</span>
                    <span class="record-date">${new Date(record.date).toLocaleDateString()}</span>
                </div>
                <div class="record-title">${record.title}</div>
                <div class="record-description">${record.description}</div>
            </div>
        `).join('');
    }

    renderPrescriptions(prescriptions) {
        if (!prescriptions.length) {
            return '<p class="text-center text-muted">No prescriptions found.</p>';
        }

        return prescriptions.map(prescription => `
            <div class="medical-record-item">
                <div class="record-header">
                    <span class="record-type">Prescription</span>
                    <span class="record-date">${new Date(prescription.date).toLocaleDateString()}</span>
                </div>
                <div class="record-title">${prescription.title}</div>
                <div class="record-description">${prescription.description}</div>
            </div>
        `).join('');
    }

    renderVitals(patient) {
        const vitals = [
            { icon: 'fas fa-heartbeat', value: patient.heart_rate || '--', label: 'Heart Rate (bpm)' },
            { icon: 'fas fa-thermometer-half', value: patient.temperature || '--', label: 'Temperature (°F)' },
            { icon: 'fas fa-tachometer-alt', value: patient.blood_pressure || '--', label: 'Blood Pressure' },
            { icon: 'fas fa-weight', value: patient.weight || '--', label: 'Weight (kg)' },
            { icon: 'fas fa-ruler-vertical', value: patient.height || '--', label: 'Height (cm)' },
            { icon: 'fas fa-lungs', value: patient.oxygen_saturation || '--', label: 'Oxygen Saturation (%)' }
        ];

        return `
            <div class="vitals-grid">
                ${vitals.map(vital => `
                    <div class="vital-card">
                        <div class="vital-icon">
                            <i class="${vital.icon}"></i>
                        </div>
                        <div class="vital-value">${vital.value}</div>
                        <div class="vital-label">${vital.label}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupPatientDetailsTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                
                // Remove active class from all tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to selected tab
                button.classList.add('active');
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });
    }

    openAddRecordModal() {
        document.getElementById('record-patient-id').value = this.currentPatientId;
        document.getElementById('record-date').value = new Date().toISOString().slice(0, 16);
        document.getElementById('add-record-modal').style.display = 'block';
    }

    async handleAddMedicalRecord(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('action', 'add_medical_record');
        formData.append('patient_id', document.getElementById('record-patient-id').value);
        formData.append('type', document.getElementById('record-type').value);
        formData.append('title', document.getElementById('record-title').value);
        formData.append('description', document.getElementById('record-description').value);
        formData.append('date', document.getElementById('record-date').value);

        try {
            const response = await fetch('php/patient-api.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Medical record added successfully', 'success');
                this.closeModal('add-record-modal');
                // Refresh patient details
                this.viewPatientDetails(this.currentPatientId);
            } else {
                this.showNotification(data.error || 'Failed to add medical record', 'error');
            }
        } catch (error) {
            console.error('Error adding medical record:', error);
            this.showNotification('Error adding medical record', 'error');
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

    setupProfilePhotoUpload() {
        const profilePicture = document.getElementById('profile-picture');
        const photoInput = document.getElementById('profile-photo-input');
        const changePhotoBtn = document.getElementById('change-photo-btn');
        const resetProfileBtn = document.getElementById('reset-profile-btn');

        // Load existing profile photo
        this.loadProfilePhoto();

        // Handle photo upload
        if (profilePicture && photoInput) {
            profilePicture.addEventListener('click', () => {
                photoInput.click();
            });

            if (changePhotoBtn) {
                changePhotoBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    photoInput.click();
                });
            }

            photoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handlePhotoUpload(file);
                }
            });
        }

        // Handle reset profile button
        if (resetProfileBtn) {
            resetProfileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetProfileForm();
            });
        }
    }

    async loadProfilePhoto() {
        const savedPhoto = localStorage.getItem('doctor_profile_photo');
        const profileImage = document.getElementById('profile-image');
        const profilePlaceholder = document.getElementById('profile-placeholder');
        const sidebarAvatar = document.getElementById('doctor-avatar');

        if (savedPhoto && profileImage && profilePlaceholder) {
            profileImage.src = savedPhoto;
            profileImage.style.display = 'block';
            profilePlaceholder.style.display = 'none';
            
            // Update sidebar avatar
            if (sidebarAvatar) {
                sidebarAvatar.innerHTML = `<img src="${savedPhoto}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            }
        }
    }

    handlePhotoUpload(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Image size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            
            // Update profile photo display
            const profileImage = document.getElementById('profile-image');
            const profilePlaceholder = document.getElementById('profile-placeholder');
            const sidebarAvatar = document.getElementById('doctor-avatar');

            if (profileImage && profilePlaceholder) {
                profileImage.src = imageData;
                profileImage.style.display = 'block';
                profilePlaceholder.style.display = 'none';
            }

            // Update sidebar avatar
            if (sidebarAvatar) {
                sidebarAvatar.innerHTML = `<img src="${imageData}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            }

            // Save to localStorage
            localStorage.setItem('doctor_profile_photo', imageData);
            
            this.showNotification('Profile photo updated successfully!', 'success');
        };

        reader.readAsDataURL(file);
    }

    populateProfileForm() {
        // Get saved profile data
        const savedProfile = JSON.parse(localStorage.getItem('doctor_profile') || '{}');
        const currentUser = this.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');

        // Default values for doctor profile
        const fields = {
            'profile-name': savedProfile.name || currentUser.name || 'Dr. Sarah Johnson',
            'profile-specialty': savedProfile.specialty || currentUser.specialty || 'Cardiology',
            'profile-subspecialty': savedProfile.subspecialty || '',
            'profile-license': savedProfile.license || 'MD123456',
            'profile-phone': savedProfile.phone || currentUser.phone || '+1 (555) 123-4567',
            'profile-email': savedProfile.email || currentUser.email || 'sarah.johnson@healthcare.com',
            'profile-office-address': savedProfile.officeAddress || '123 Medical Center Blvd, Suite 400',
            'profile-hospital': savedProfile.hospital || 'City General Hospital',
            'profile-experience': savedProfile.experience || '15',
            'profile-qualification': savedProfile.qualification || 'MD, Harvard Medical School',
            'profile-certifications': savedProfile.certifications || 'Board Certified in Cardiology',
            'profile-languages': savedProfile.languages || 'English, Spanish',
            'profile-bio': savedProfile.bio || 'Experienced cardiologist specializing in preventive care and advanced cardiac procedures. Committed to providing personalized, compassionate healthcare.',
            'profile-consultation-fee': savedProfile.consultationFee || '150.00',
            'profile-follow-up-fee': savedProfile.followUpFee || '100.00',
            'profile-services': savedProfile.services || 'General Consultation, ECG, Stress Testing, Cardiac Catheterization',
            'profile-typical-hours': savedProfile.typicalHours || 'Monday-Friday: 9:00 AM - 5:00 PM',
            'profile-appointment-duration': savedProfile.appointmentDuration || '30'
        };

        // Set form values
        Object.entries(fields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = value;
            }
        });

        // Update display elements
        this.updateProfileDisplay(fields);
    }

    updateProfileDisplay(fields) {
        const displayName = document.getElementById('profile-display-name');
        const displaySpecialty = document.getElementById('profile-display-specialty');
        const doctorName = document.getElementById('doctor-name');
        const doctorSpecialty = document.getElementById('doctor-specialty');

        if (displayName) displayName.textContent = fields['profile-name'];
        if (displaySpecialty) displaySpecialty.textContent = fields['profile-specialty'];
        if (doctorName) doctorName.textContent = fields['profile-name'];
        if (doctorSpecialty) doctorSpecialty.textContent = fields['profile-specialty'];
    }

    resetProfileForm() {
        // Clear saved profile data
        localStorage.removeItem('doctor_profile');
        localStorage.removeItem('doctor_profile_photo');
        
        // Reset profile photo
        const profileImage = document.getElementById('profile-image');
        const profilePlaceholder = document.getElementById('profile-placeholder');
        const sidebarAvatar = document.getElementById('doctor-avatar');
        
        if (profileImage && profilePlaceholder) {
            profileImage.style.display = 'none';
            profilePlaceholder.style.display = 'flex';
        }
        
        if (sidebarAvatar) {
            sidebarAvatar.innerHTML = 'SJ';
        }
        
        // Repopulate with defaults
        this.populateProfileForm();
        
        this.showNotification('Profile reset to defaults', 'info');
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