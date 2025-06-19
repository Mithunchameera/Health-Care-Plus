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
        this.loadDashboardData();
        this.setupSidebarNavigation();
        this.setupMobileMenu();
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
            // Update navigation and header elements
            const userNameElement = document.getElementById('user-name');
            const adminNameElement = document.getElementById('admin-name');
            const adminRoleElement = document.getElementById('admin-role');
            const adminAvatar = document.getElementById('admin-avatar');
            
            if (userNameElement) {
                userNameElement.textContent = `${this.currentUser.full_name} (Admin)`;
            }
            
            if (adminNameElement) {
                adminNameElement.textContent = this.currentUser.full_name;
            }
            
            if (adminRoleElement) {
                adminRoleElement.textContent = this.capitalizeFirst(this.currentUser.role);
            }
            
            if (adminAvatar && this.currentUser.full_name) {
                const initials = this.currentUser.full_name.split(' ')
                    .map(name => name.charAt(0))
                    .join('')
                    .toUpperCase();
                adminAvatar.textContent = initials;
            }
        }
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Settings form
        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', this.handleSettingsUpdate.bind(this));
        }

        // Initialize advanced search functionality
        this.setupSearchListeners();

        // Legacy search inputs for compatibility
        const searchInputs = {
            'doctor-search': this.filterDoctors.bind(this),
            'appointment-search': this.filterAppointments.bind(this),
            'patient-search': this.filterPatients.bind(this),
            'staff-search': this.filterStaff.bind(this)
        };

        // Filter selects
        const filterSelects = {
            'doctor-specialty-filter': this.filterDoctors.bind(this),
            'appointment-status-filter': this.filterAppointments.bind(this),
            'appointment-date-filter': this.filterAppointments.bind(this)
        };

        Object.entries(filterSelects).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', handler);
            }
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
                const sectionName = link.getAttribute('data-section');
                this.showSection(sectionName);
                
                // Close mobile sidebar
                if (window.innerWidth <= 768) {
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar) {
                        sidebar.classList.remove('active');
                    }
                }
            });
        });
    }

    showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.content-section, section[id$="-section"]');
        sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('active');
        } else {
            // If section doesn't exist, show dashboard
            const dashboardSection = document.getElementById('dashboard-section');
            if (dashboardSection) {
                dashboardSection.style.display = 'block';
                dashboardSection.classList.add('active');
            }
        }
        
        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
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
            case 'reports':
                await this.loadReportsData();
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
            } else {
                // Load demo stats for display
                this.updateStatsDisplay({
                    total_doctors: 25,
                    total_patients: 1248,
                    total_appointments: 342,
                    total_revenue: 45680
                });
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
            this.updateStatsDisplay({
                total_doctors: 25,
                total_patients: 1248,
                total_appointments: 342,
                total_revenue: 45680
            });
        }
    }

    updateStatsDisplay(stats) {
        const statElements = {
            'total-doctors': stats.total_doctors,
            'total-patients': stats.total_patients,
            'total-appointments': stats.total_appointments,
            'total-revenue': `$${stats.total_revenue?.toLocaleString() || '45,680'}`
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
                this.displayRecentActivity(data.activities);
            } else {
                this.displayRecentActivity([]);
            }
        } catch (error) {
            console.error('Failed to load recent activity:', error);
            this.displayRecentActivity([]);
        }
    }

    displayRecentActivity(activities) {
        const container = document.getElementById('recent-activity-list');
        if (!container) return;
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <h4>No recent activity</h4>
                        <p>System activity will appear here</p>
                    </div>
                    <div class="activity-time">Now</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.description}</h4>
                    <p>by ${activity.user_name}</p>
                </div>
                <div class="activity-time">${this.formatTime(activity.created_at)}</div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'appointment': 'fa-calendar-check',
            'doctor': 'fa-user-md',
            'patient': 'fa-user',
            'staff': 'fa-user-tie',
            'system': 'fa-cog'
        };
        return icons[type] || 'fa-info-circle';
    }

    async loadDoctors() {
        try {
            const response = await fetch('php/admin-api.php?action=get_doctors');
            const data = await response.json();
            
            if (data.success) {
                this.doctors = data.doctors;
                this.displayDoctors(this.doctors);
            } else {
                this.doctors = [];
                this.displayDoctors([]);
            }
        } catch (error) {
            console.error('Failed to load doctors:', error);
            this.doctors = [];
            this.displayDoctors([]);
        }
    }

    displayDoctors(doctors) {
        const tbody = document.getElementById('doctors-table-body');
        if (!tbody) return;
        
        if (doctors.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-user-md" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                        <p>No doctors found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = doctors.map(doctor => `
            <tr>
                <td>Dr. ${doctor.full_name}</td>
                <td>${doctor.specialty || doctor.department}</td>
                <td>
                    <div>${doctor.phone}</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">${doctor.email}</div>
                </td>
                <td>${doctor.experience || 'N/A'} years</td>
                <td>
                    <span class="status-badge status-${doctor.status || 'active'}">
                        ${this.capitalizeFirst(doctor.status || 'active')}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="adminDashboard.editDoctor(${doctor.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.viewDoctorSchedule(${doctor.id})">
                        <i class="fas fa-calendar"></i> Schedule
                    </button>
                    <button class="btn btn-sm ${doctor.status === 'active' ? 'btn-warning' : 'btn-success'}" 
                            onclick="adminDashboard.toggleDoctorStatus(${doctor.id})">
                        <i class="fas ${doctor.status === 'active' ? 'fa-pause' : 'fa-play'}"></i>
                        ${doctor.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
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
            } else {
                this.appointments = [];
                this.displayAppointments([]);
            }
        } catch (error) {
            console.error('Failed to load appointments:', error);
            this.appointments = [];
            this.displayAppointments([]);
        }
    }

    displayAppointments(appointments) {
        const tbody = document.getElementById('appointments-table-body');
        if (!tbody) return;
        
        if (appointments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-calendar-check" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                        <p>No appointments found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = appointments.map(apt => `
            <tr>
                <td>${this.formatAppointmentDate(apt.date, apt.time)}</td>
                <td>${apt.patient_name}</td>
                <td>Dr. ${apt.doctor_name}</td>
                <td>${apt.type || 'Consultation'}</td>
                <td>
                    <span class="status-badge status-${apt.status}">
                        ${this.capitalizeFirst(apt.status)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="adminDashboard.viewAppointment(${apt.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${apt.status === 'scheduled' ? 
                        `<button class="btn btn-sm btn-success" onclick="adminDashboard.confirmAppointment(${apt.id})">
                            <i class="fas fa-check"></i> Confirm
                        </button>` : ''
                    }
                    ${apt.status !== 'completed' && apt.status !== 'cancelled' ? 
                        `<button class="btn btn-sm btn-danger" onclick="adminDashboard.cancelAppointment(${apt.id})">
                            <i class="fas fa-times"></i> Cancel
                        </button>` : ''
                    }
                </td>
            </tr>
        `).join('');
    }

    async loadPatients() {
        try {
            const response = await fetch('php/admin-api.php?action=get_patients');
            const data = await response.json();
            
            if (data.success) {
                this.patients = data.patients;
                this.displayPatients(this.patients);
            } else {
                this.patients = [];
                this.displayPatients([]);
            }
        } catch (error) {
            console.error('Failed to load patients:', error);
            this.patients = [];
            this.displayPatients([]);
        }
    }

    displayPatients(patients) {
        const tbody = document.getElementById('patients-table-body');
        if (!tbody) return;
        
        if (patients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-users" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                        <p>No patients found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = patients.map(patient => `
            <tr>
                <td>${patient.full_name}</td>
                <td>
                    <div>${patient.phone}</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">${patient.email}</div>
                </td>
                <td>${this.calculateAge(patient.date_of_birth)}</td>
                <td>${patient.last_visit || 'Never'}</td>
                <td>${patient.total_visits || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="adminDashboard.viewPatient(${patient.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.viewPatientHistory(${patient.id})">
                        <i class="fas fa-history"></i> History
                    </button>
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
            } else {
                this.staff = [];
                this.displayStaff([]);
            }
        } catch (error) {
            console.error('Failed to load staff:', error);
            this.staff = [];
            this.displayStaff([]);
        }
    }

    displayStaff(staff) {
        const tbody = document.getElementById('staff-table-body');
        if (!tbody) return;
        
        if (staff.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-user-tie" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                        <p>No staff members found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = staff.map(member => `
            <tr>
                <td>${member.full_name}</td>
                <td>${this.capitalizeFirst(member.role)}</td>
                <td>
                    <div>${member.phone}</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">${member.email}</div>
                </td>
                <td>${member.department || 'General'}</td>
                <td>
                    <span class="status-badge status-${member.status || 'active'}">
                        ${this.capitalizeFirst(member.status || 'active')}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="adminDashboard.editStaff(${member.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm ${member.status === 'active' ? 'btn-warning' : 'btn-success'}" 
                            onclick="adminDashboard.toggleStaffStatus(${member.id})">
                        <i class="fas ${member.status === 'active' ? 'fa-pause' : 'fa-play'}"></i>
                        ${member.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadReportsData() {
        try {
            const response = await fetch('php/admin-api.php?action=get_reports_data');
            const data = await response.json();
            
            if (data.success) {
                this.updateReportsDisplay(data.reports);
            } else {
                this.updateReportsDisplay({
                    today_appointments: 28,
                    new_patients: 15,
                    occupancy_rate: 85,
                    avg_rating: 4.7
                });
            }
        } catch (error) {
            console.error('Failed to load reports data:', error);
            this.updateReportsDisplay({
                today_appointments: 28,
                new_patients: 15,
                occupancy_rate: 85,
                avg_rating: 4.7
            });
        }
    }

    updateReportsDisplay(reports) {
        const reportElements = {
            'today-appointments': reports.today_appointments,
            'new-patients': reports.new_patients,
            'occupancy-rate': `${reports.occupancy_rate}%`,
            'avg-rating': reports.avg_rating
        };
        
        Object.entries(reportElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    // Filter methods
    filterDoctors() {
        const searchTerm = document.getElementById('doctor-search')?.value.toLowerCase() || '';
        const specialtyFilter = document.getElementById('doctor-specialty-filter')?.value || '';
        
        const filteredDoctors = this.doctors.filter(doctor => {
            const matchesSearch = doctor.full_name.toLowerCase().includes(searchTerm) ||
                                doctor.email.toLowerCase().includes(searchTerm) ||
                                (doctor.specialty && doctor.specialty.toLowerCase().includes(searchTerm)) ||
                                (doctor.department && doctor.department.toLowerCase().includes(searchTerm)) ||
                                (doctor.phone && doctor.phone.includes(searchTerm));
            
            const matchesSpecialty = !specialtyFilter || 
                                   (doctor.specialty && doctor.specialty.toLowerCase().includes(specialtyFilter)) ||
                                   (doctor.department && doctor.department.toLowerCase().includes(specialtyFilter));
            
            return matchesSearch && matchesSpecialty;
        });
        
        this.displayDoctors(filteredDoctors);
        this.updateSearchResults('doctor', filteredDoctors.length, this.doctors.length, searchTerm);
        this.highlightSearchTerms(searchTerm);
    }

    clearDoctorSearch() {
        const searchInput = document.getElementById('doctor-search');
        const specialtyFilter = document.getElementById('doctor-specialty-filter');
        const searchBar = document.querySelector('.search-bar');
        
        if (searchInput) {
            searchInput.value = '';
            searchBar?.classList.remove('has-text');
        }
        if (specialtyFilter) {
            specialtyFilter.value = '';
        }
        
        this.hideSuggestions('doctor-search-suggestions');
        this.displayDoctors(this.doctors);
        this.hideSearchResults('doctor-search-results');
    }

    clearPatientSearch() {
        const searchInput = document.getElementById('patient-search');
        const searchBar = searchInput?.closest('.search-bar');
        
        if (searchInput) {
            searchInput.value = '';
        }
        if (searchBar) {
            searchBar.classList.remove('has-text');
        }
        
        this.hideSuggestions('patient-search-suggestions');
        this.displayPatients(this.patients);
        this.hideSearchResults('patient-search-results');
    }

    clearStaffSearch() {
        const searchInput = document.getElementById('staff-search');
        const searchBar = searchInput?.closest('.search-bar');
        
        if (searchInput) {
            searchInput.value = '';
        }
        if (searchBar) {
            searchBar.classList.remove('has-text');
        }
        
        this.hideSuggestions('staff-search-suggestions');
        this.displayStaff(this.staff);
        this.hideSearchResults('staff-search-results');
    }

    clearAppointmentSearch() {
        const searchInput = document.getElementById('appointment-search');
        const statusFilter = document.getElementById('appointment-status-filter');
        const dateFilter = document.getElementById('appointment-date-filter');
        const searchBar = searchInput?.closest('.search-bar');
        
        if (searchInput) {
            searchInput.value = '';
        }
        if (statusFilter) {
            statusFilter.value = '';
        }
        if (dateFilter) {
            dateFilter.value = '';
        }
        if (searchBar) {
            searchBar.classList.remove('has-text');
        }
        
        this.hideSuggestions('appointment-search-suggestions');
        this.displayAppointments(this.appointments);
        this.hideSearchResults('appointment-search-results');
    }

    setupSearchListeners() {
        // Doctor search
        const doctorSearch = document.getElementById('doctor-search');
        if (doctorSearch) {
            doctorSearch.addEventListener('input', (e) => {
                const searchBar = e.target.closest('.search-bar');
                if (e.target.value.length > 0) {
                    searchBar?.classList.add('has-text');
                    this.showSearchSuggestions('doctor', e.target.value);
                } else {
                    searchBar?.classList.remove('has-text');
                    this.hideSuggestions('doctor-search-suggestions');
                }
                this.filterDoctors();
            });

            doctorSearch.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.clearDoctorSearch();
                }
            });
        }

        // Specialty filter
        const specialtyFilter = document.getElementById('doctor-specialty-filter');
        if (specialtyFilter) {
            specialtyFilter.addEventListener('change', () => {
                this.filterDoctors();
            });
        }

        // Appointment search
        const appointmentSearch = document.getElementById('appointment-search');
        if (appointmentSearch) {
            appointmentSearch.addEventListener('input', (e) => {
                const searchBar = e.target.closest('.search-bar');
                if (e.target.value.length > 0) {
                    searchBar?.classList.add('has-text');
                    this.showSearchSuggestions('appointment', e.target.value);
                } else {
                    searchBar?.classList.remove('has-text');
                    this.hideSuggestions('appointment-search-suggestions');
                }
                this.filterAppointments();
            });
        }

        // Click outside to hide suggestions
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-bar')) {
                this.hideSuggestions('doctor-search-suggestions');
                this.hideSuggestions('appointment-search-suggestions');
            }
        });
    }

    showSearchSuggestions(type, searchTerm) {
        if (searchTerm.length < 2) return;

        const suggestions = [];
        const term = searchTerm.toLowerCase();

        if (type === 'doctor') {
            // Get unique suggestions from doctors data
            const doctorSuggestions = new Set();
            this.doctors.forEach(doctor => {
                if (doctor.full_name.toLowerCase().includes(term)) {
                    doctorSuggestions.add(doctor.full_name);
                }
                if (doctor.specialty && doctor.specialty.toLowerCase().includes(term)) {
                    doctorSuggestions.add(doctor.specialty);
                }
                if (doctor.email && doctor.email.toLowerCase().includes(term)) {
                    doctorSuggestions.add(doctor.email);
                }
            });
            suggestions.push(...Array.from(doctorSuggestions).slice(0, 5));
        }

        this.displaySuggestions(`${type}-search-suggestions`, suggestions, searchTerm);
    }

    displaySuggestions(containerId, suggestions, searchTerm) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (suggestions.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = suggestions.map(suggestion => 
            `<div class="search-suggestion" onclick="adminDashboard.selectSuggestion('${containerId}', '${suggestion}')">${suggestion}</div>`
        ).join('');
        
        container.style.display = 'block';
    }

    selectSuggestion(containerId, suggestion) {
        const inputId = containerId.replace('-suggestions', '');
        const input = document.getElementById(inputId);
        if (input) {
            input.value = suggestion;
            input.focus();
            
            // Trigger search
            if (inputId.includes('doctor')) {
                this.filterDoctors();
            } else if (inputId.includes('appointment')) {
                this.filterAppointments();
            }
        }
        this.hideSuggestions(containerId);
    }

    hideSuggestions(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
        }
    }

    updateSearchResults(type, filteredCount, totalCount, searchTerm) {
        const resultId = `${type}-search-results`;
        const container = document.getElementById(resultId);
        if (!container) return;

        if (searchTerm && searchTerm.length > 0) {
            container.innerHTML = `Showing ${filteredCount} of ${totalCount} ${type}s for "${searchTerm}"`;
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    }

    hideSearchResults(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
        }
    }

    highlightSearchTerms(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) return;

        const tableBody = document.getElementById('doctors-table-body');
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

    filterAppointments() {
        const searchTerm = document.getElementById('appointment-search')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('appointment-status-filter')?.value || '';
        const dateFilter = document.getElementById('appointment-date-filter')?.value || '';
        
        const filteredAppointments = this.appointments.filter(apt => {
            const matchesSearch = apt.patient_name.toLowerCase().includes(searchTerm) ||
                                apt.doctor_name.toLowerCase().includes(searchTerm);
            const matchesStatus = !statusFilter || apt.status === statusFilter;
            const matchesDate = !dateFilter || apt.date === dateFilter;
            
            return matchesSearch && matchesStatus && matchesDate;
        });
        
        this.displayAppointments(filteredAppointments);
    }

    filterPatients() {
        const searchTerm = document.getElementById('patient-search')?.value.toLowerCase() || '';
        
        const filteredPatients = this.patients.filter(patient => 
            patient.full_name.toLowerCase().includes(searchTerm) ||
            patient.email.toLowerCase().includes(searchTerm) ||
            patient.phone.includes(searchTerm)
        );
        
        this.displayPatients(filteredPatients);
    }

    filterStaff() {
        const searchTerm = document.getElementById('staff-search')?.value.toLowerCase() || '';
        
        const filteredStaff = this.staff.filter(member => 
            member.full_name.toLowerCase().includes(searchTerm) ||
            member.email.toLowerCase().includes(searchTerm) ||
            member.role.toLowerCase().includes(searchTerm)
        );
        
        this.displayStaff(filteredStaff);
    }

    // Event handlers
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

    // Modal and action methods
    openAddDoctorModal() {
        const modal = document.getElementById('add-doctor-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.setupPhotoUpload('doctor-profile-photo', 'doctor-photo-preview');
            this.setupAddDoctorForm();
        }
    }

    openAddStaffModal() {
        const modal = document.getElementById('add-staff-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.setupPhotoUpload('staff-profile-photo', 'staff-photo-preview');
            this.setupAddStaffForm();
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            // Reset form
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                // Reset photo preview
                const photoPreview = modal.querySelector('.photo-preview');
                if (photoPreview) {
                    photoPreview.innerHTML = '<i class="fas fa-camera"></i><span>Click to upload photo</span>';
                    photoPreview.classList.remove('has-image');
                }
            }
        }
    }

    setupPhotoUpload(inputId, previewId) {
        const fileInput = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        
        if (fileInput && preview) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        preview.innerHTML = `<img src="${e.target.result}" alt="Profile Photo">`;
                        preview.classList.add('has-image');
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Click to upload functionality
            preview.addEventListener('click', () => {
                fileInput.click();
            });
        }
    }

    setupAddDoctorForm() {
        const form = document.getElementById('add-doctor-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                await this.handleAddDoctor(form);
            };
        }
    }

    setupAddStaffForm() {
        const form = document.getElementById('add-staff-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                await this.handleAddStaff(form);
            };
        }
    }

    async handleAddDoctor(form) {
        try {
            const formData = new FormData(form);
            
            // Create user account first
            const userData = {
                action: 'create_doctor',
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                specialty: formData.get('specialty'),
                experience: formData.get('experience'),
                license_number: formData.get('license_number'),
                consultation_fee: formData.get('consultation_fee'),
                education: formData.get('education'),
                bio: formData.get('bio')
            };

            const response = await fetch('php/admin-api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Doctor added successfully!', 'success');
                this.closeModal('add-doctor-modal');
                // Refresh doctors list if we're on that section
                if (document.getElementById('doctors-section').style.display !== 'none') {
                    this.loadDoctors();
                }
            } else {
                this.showNotification(result.error || 'Failed to add doctor', 'error');
            }
        } catch (error) {
            console.error('Add doctor failed:', error);
            this.showNotification('Failed to add doctor', 'error');
        }
    }

    async handleAddStaff(form) {
        try {
            const formData = new FormData(form);
            
            const staffData = {
                action: 'create_staff',
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                role: formData.get('role'),
                department: formData.get('department'),
                employee_id: formData.get('employee_id'),
                hire_date: formData.get('hire_date'),
                qualifications: formData.get('qualifications')
            };

            const response = await fetch('php/admin-api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(staffData)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Staff member added successfully!', 'success');
                this.closeModal('add-staff-modal');
                // Refresh staff list if we're on that section
                if (document.getElementById('staff-section').style.display !== 'none') {
                    this.loadStaff();
                }
            } else {
                this.showNotification(result.error || 'Failed to add staff member', 'error');
            }
        } catch (error) {
            console.error('Add staff failed:', error);
            this.showNotification('Failed to add staff member', 'error');
        }
    }

    async editDoctor(doctorId) {
        this.showNotification(`Edit Doctor ${doctorId} feature coming soon`, 'info');
    }

    async viewDoctorSchedule(doctorId) {
        this.showNotification(`View Doctor ${doctorId} schedule feature coming soon`, 'info');
    }

    async toggleDoctorStatus(doctorId) {
        this.showNotification(`Toggle Doctor ${doctorId} status feature coming soon`, 'info');
    }

    async viewAppointment(appointmentId) {
        this.showNotification(`View Appointment ${appointmentId} feature coming soon`, 'info');
    }

    async confirmAppointment(appointmentId) {
        this.showNotification(`Confirm Appointment ${appointmentId} feature coming soon`, 'info');
    }

    async cancelAppointment(appointmentId) {
        this.showNotification(`Cancel Appointment ${appointmentId} feature coming soon`, 'info');
    }

    async viewPatient(patientId) {
        this.showNotification(`View Patient ${patientId} feature coming soon`, 'info');
    }

    async viewPatientHistory(patientId) {
        this.showNotification(`View Patient ${patientId} history feature coming soon`, 'info');
    }

    async editStaff(staffId) {
        this.showNotification(`Edit Staff ${staffId} feature coming soon`, 'info');
    }

    async toggleStaffStatus(staffId) {
        this.showNotification(`Toggle Staff ${staffId} status feature coming soon`, 'info');
    }

    // Utility methods
    calculateAge(dateOfBirth) {
        if (!dateOfBirth) return 'N/A';
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
        if (!time) return '';
        return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatAppointmentDate(date, time) {
        if (!date) return '';
        const appointmentDate = new Date(`${date} ${time || '00:00'}`);
        return appointmentDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) + (time ? ' ' + this.formatTime(time) : '');
    }

    capitalizeFirst(str) {
        if (!str) return '';
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