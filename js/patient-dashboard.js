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
        this.setupProfilePicture();
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
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        
        if (mobileMenuToggle && sidebar && sidebarOverlay) {
            mobileMenuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                sidebarOverlay.classList.toggle('show');
                
                // Change icon
                const icon = mobileMenuToggle.querySelector('i');
                if (sidebar.classList.contains('open')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            });
            
            // Close sidebar when overlay is clicked
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('show');
                mobileMenuToggle.querySelector('i').className = 'fas fa-bars';
            });
            
            // Close sidebar when menu item is clicked (mobile)
            const sidebarLinks = sidebar.querySelectorAll('.sidebar-menu a');
            sidebarLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('open');
                        sidebarOverlay.classList.remove('show');
                        mobileMenuToggle.querySelector('i').className = 'fas fa-bars';
                    }
                });
            });
        }

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
        
        // Handle window resize to close mobile menu on desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                const sidebar = document.querySelector('.sidebar');
                const sidebarOverlay = document.getElementById('sidebar-overlay');
                const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
                
                if (sidebar && sidebarOverlay && mobileMenuToggle) {
                    sidebar.classList.remove('open');
                    sidebarOverlay.classList.remove('show');
                    mobileMenuToggle.querySelector('i').className = 'fas fa-bars';
                }
            }
        });

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
            case 'book-appointment':
                this.initializeBooking();
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
            // Get user email from session or localStorage
            const userEmail = this.getCurrentUserEmail();
            if (!userEmail) {
                console.log('No user email found, using demo data');
                return;
            }
            
            const response = await fetch(`php/appointments-api.php?action=get_patient_appointments&patient_email=${encodeURIComponent(userEmail)}`);
            const data = await response.json();
            
            if (data.success) {
                this.displayAppointmentsTable(data.appointments);
            }
        } catch (error) {
            console.error('Failed to load appointments:', error);
        }
    }

    getCurrentUserEmail() {
        // Try to get from session storage or localStorage
        return sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail') || 'patient@demo.com';
    }

    displayAppointmentsTable(appointments) {
        const tbody = document.getElementById('appointments-table-body');
        if (!tbody) return;
        
        if (appointments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No appointments found. <a href="booking.html">Book your first appointment</a></td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = appointments.map(apt => `
            <tr>
                <td>${this.formatAppointmentDate(apt.appointment_date, apt.appointment_time)}</td>
                <td>Dr. ${apt.doctor_first_name} ${apt.doctor_last_name}</td>
                <td>${apt.specialty}</td>
                <td><span class="status-badge status-${apt.status}">${this.capitalizeFirst(apt.status)}</span></td>
                <td>$${apt.consultation_fee}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="patientDashboard.viewAppointment(${apt.id})">View</button>
                    ${apt.status === 'scheduled' ? `<button class="btn btn-sm btn-secondary" onclick="patientDashboard.payAppointment(${apt.id})">Pay Now</button>` : ''}
                    ${apt.status !== 'completed' && apt.status !== 'cancelled' ? `<button class="btn btn-sm btn-danger" onclick="patientDashboard.cancelAppointment(${apt.id})">Cancel</button>` : ''}
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
            const response = await fetch('php/appointments-api.php?action=cancel_appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointment_id: appointmentId
                })
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

    setupProfilePicture() {
        const profilePictureInput = document.getElementById('profile-picture-input');
        const profilePicturePreview = document.getElementById('profile-picture-preview');
        const profilePictureContainer = document.querySelector('.profile-picture-container');

        if (profilePictureInput && profilePicturePreview) {
            profilePictureInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Validate file type
                    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                    if (!validTypes.includes(file.type)) {
                        this.showNotification('Please select a valid image file (JPEG, PNG, or GIF)', 'error');
                        return;
                    }

                    // Validate file size (max 5MB)
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    if (file.size > maxSize) {
                        this.showNotification('Image file size must be less than 5MB', 'error');
                        return;
                    }

                    // Read and preview the image
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        profilePicturePreview.src = e.target.result;
                        this.showNotification('Profile picture updated successfully', 'success');
                        
                        // Store in localStorage for demo purposes
                        localStorage.setItem('profilePicture', e.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Add click handler to the container for easier access
            if (profilePictureContainer) {
                profilePictureContainer.addEventListener('click', () => {
                    profilePictureInput.click();
                });
            }

            // Load saved profile picture from localStorage
            const savedPicture = localStorage.getItem('profilePicture');
            if (savedPicture) {
                profilePicturePreview.src = savedPicture;
            }
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

    // Booking functionality
    initializeBooking() {
        this.selectedDoctor = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.currentStep = 1;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        
        this.setupBookingEventListeners();
        this.loadBookingDoctors();
    }

    setupBookingEventListeners() {
        // Filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.filterBookingDoctors(e.target.dataset.specialty);
            });
        });

        // Search
        const searchInput = document.getElementById('booking-doctor-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchBookingDoctors(e.target.value);
            });
        }

        // Calendar navigation
        const prevBtn = document.getElementById('prev-month-btn');
        const nextBtn = document.getElementById('next-month-btn');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.navigateMonth(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.navigateMonth(1));

        // Terms checkbox
        const termsCheckbox = document.getElementById('terms-agreement');
        if (termsCheckbox) {
            termsCheckbox.addEventListener('change', () => {
                const confirmBtn = document.getElementById('confirm-booking-btn');
                if (confirmBtn) {
                    confirmBtn.disabled = !termsCheckbox.checked;
                }
            });
        }
    }

    async loadBookingDoctors() {
        try {
            const response = await fetch('php/patient-api.php?action=get_doctors');
            const data = await response.json();
            
            if (data.success) {
                this.doctors = data.doctors;
                this.displayBookingDoctors(this.doctors);
            }
        } catch (error) {
            console.error('Error loading doctors for booking:', error);
        }
    }

    displayBookingDoctors(doctors) {
        const container = document.getElementById('booking-doctors-grid');
        if (!container) return;

        container.innerHTML = doctors.map(doctor => this.createBookingDoctorCard(doctor)).join('');
    }

    createBookingDoctorCard(doctor) {
        const initials = doctor.name.split(' ').map(n => n[0]).join('');
        const stars = this.generateStars(doctor.rating);
        const availabilityClass = doctor.available ? 'available' : 'unavailable';
        const availabilityText = doctor.available ? 'Available' : 'Unavailable';

        return `
            <div class="booking-doctor-card" onclick="window.patientDashboard.selectDoctor(${doctor.id})" data-doctor-id="${doctor.id}">
                <div class="doctor-header">
                    <div class="doctor-avatar">${initials}</div>
                    <div class="doctor-info">
                        <h4>${doctor.name}</h4>
                        <p>${doctor.specialty}</p>
                        <div class="doctor-rating">
                            <span class="stars">${stars}</span>
                            <span>${doctor.rating} (${doctor.reviews})</span>
                        </div>
                    </div>
                </div>
                
                <div class="doctor-details">
                    <div class="doctor-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${doctor.location}</span>
                    </div>
                    <div class="doctor-detail">
                        <i class="fas fa-dollar-sign"></i>
                        <span>$${doctor.fee}</span>
                    </div>
                    <div class="doctor-availability ${availabilityClass}">
                        ${availabilityText}
                    </div>
                </div>
            </div>
        `;
    }

    filterBookingDoctors(specialty) {
        if (specialty === 'all') {
            this.displayBookingDoctors(this.doctors);
        } else {
            const filtered = this.doctors.filter(doctor => doctor.specialty === specialty);
            this.displayBookingDoctors(filtered);
        }
    }

    searchBookingDoctors(searchTerm) {
        const term = searchTerm.toLowerCase();
        const filtered = this.doctors.filter(doctor => 
            doctor.name.toLowerCase().includes(term) ||
            doctor.specialty.toLowerCase().includes(term) ||
            doctor.location.toLowerCase().includes(term)
        );
        this.displayBookingDoctors(filtered);
    }

    selectDoctor(doctorId) {
        this.selectedDoctor = this.doctors.find(d => d.id === doctorId);
        if (!this.selectedDoctor) return;

        // Update selected doctor display
        this.updateSelectedDoctorDisplay();
        
        // Hide doctors grid and show selected doctor
        document.getElementById('booking-doctors-grid').style.display = 'none';
        document.getElementById('selected-doctor-display').style.display = 'block';
        
        // Enable next button
        document.getElementById('next-to-time').disabled = false;
    }

    updateSelectedDoctorDisplay() {
        if (!this.selectedDoctor) return;

        document.getElementById('selected-doctor-name').textContent = this.selectedDoctor.name;
        document.getElementById('selected-doctor-specialty').textContent = this.selectedDoctor.specialty;
        document.getElementById('selected-doctor-location').textContent = this.selectedDoctor.location;
        document.getElementById('selected-doctor-rating').innerHTML = this.generateStars(this.selectedDoctor.rating);
        document.getElementById('selected-doctor-reviews').textContent = `(${this.selectedDoctor.reviews} reviews)`;
        document.getElementById('selected-doctor-fee').textContent = `$${this.selectedDoctor.fee}`;
    }

    clearDoctorSelection() {
        this.selectedDoctor = null;
        document.getElementById('booking-doctors-grid').style.display = 'grid';
        document.getElementById('selected-doctor-display').style.display = 'none';
        document.getElementById('next-to-time').disabled = true;
    }

    generateCalendar() {
        const calendar = document.getElementById('booking-calendar');
        const monthYear = document.getElementById('calendar-month-year');
        
        if (!calendar || !monthYear) return;

        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        
        monthYear.textContent = `${months[this.currentMonth]} ${this.currentYear}`;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const today = new Date();

        let calendarHTML = '';
        
        // Day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            calendarHTML += `<div class="calendar-day-header">${day}</div>`;
        });

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<div class="calendar-day disabled"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const isDisabled = date <= today;
            const classes = ['calendar-day'];
            
            if (isDisabled) classes.push('disabled');
            
            const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            calendarHTML += `
                <div class="${classes.join(' ')}" 
                     ${!isDisabled ? `onclick="window.patientDashboard.selectDate('${dateStr}')"` : ''}>
                    ${day}
                </div>
            `;
        }

        calendar.innerHTML = calendarHTML;
    }

    navigateMonth(direction) {
        this.currentMonth += direction;
        
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        
        this.generateCalendar();
    }

    selectDate(dateStr) {
        this.selectedDate = dateStr;
        
        // Update calendar display
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        event.target.classList.add('selected');
        
        // Load time slots
        this.loadTimeSlots(dateStr);
    }

    async loadTimeSlots(date) {
        const timesContainer = document.getElementById('available-times');
        if (!timesContainer) return;

        if (!this.selectedDoctor) {
            timesContainer.innerHTML = '<p class="text-muted">Please select a doctor first</p>';
            return;
        }

        // Show loading state
        timesContainer.innerHTML = '<p class="text-muted">Loading available times...</p>';

        try {
            const response = await fetch(`php/patient-api.php?action=get_timeslots&doctor_id=${this.selectedDoctor.id}&date=${date}`);
            const data = await response.json();
            
            if (data.success && data.timeslots && data.timeslots.length > 0) {
                const timesHTML = data.timeslots.map(slot => `
                    <div class="timeslot" onclick="window.patientDashboard.selectTime('${slot.time}')">
                        ${slot.formatted || this.formatTime(slot.time)}
                    </div>
                `).join('');
                timesContainer.innerHTML = timesHTML;
            } else {
                const message = data.error || 'No available times for the selected date';
                timesContainer.innerHTML = `<p class="text-muted">${message}</p>`;
            }
        } catch (error) {
            console.error('Error loading time slots:', error);
            timesContainer.innerHTML = '<p class="text-muted">Error loading available times. Please try again.</p>';
        }
    }

    selectTime(time) {
        this.selectedTime = time;
        
        // Update time slot display
        document.querySelectorAll('.timeslot').forEach(slot => {
            slot.classList.remove('selected');
        });
        event.target.classList.add('selected');
        
        // Show appointment summary
        this.updateAppointmentSummary();
        document.getElementById('appointment-summary').style.display = 'block';
        
        // Enable next button
        document.getElementById('next-to-confirm').disabled = false;
    }

    updateAppointmentSummary() {
        if (!this.selectedDoctor || !this.selectedDate || !this.selectedTime) return;

        document.getElementById('summary-doctor').textContent = this.selectedDoctor.name;
        document.getElementById('summary-date').textContent = this.formatDate(this.selectedDate);
        document.getElementById('summary-time').textContent = this.formatTime(this.selectedTime);
        document.getElementById('summary-fee').textContent = `$${this.selectedDoctor.fee}`;
    }

    updateConfirmationDetails() {
        if (!this.selectedDoctor || !this.selectedDate || !this.selectedTime) return;

        document.getElementById('confirm-doctor-name').textContent = this.selectedDoctor.name;
        document.getElementById('confirm-doctor-specialty').textContent = this.selectedDoctor.specialty;
        document.getElementById('confirm-doctor-location').textContent = this.selectedDoctor.location;
        document.getElementById('confirm-date').textContent = this.formatDate(this.selectedDate);
        document.getElementById('confirm-time').textContent = this.formatTime(this.selectedTime);
        document.getElementById('confirm-fee').textContent = `$${this.selectedDoctor.fee}`;
    }

    async confirmAppointmentBooking() {
        if (!this.selectedDoctor || !this.selectedDate || !this.selectedTime) {
            this.showNotification('Please complete all booking steps', 'error');
            return;
        }

        const visitReason = document.getElementById('visit-reason').value;
        
        const bookingData = {
            doctor_id: this.selectedDoctor.id,
            appointment_date: this.selectedDate,
            appointment_time: this.selectedTime,
            reason: visitReason,
            patient_name: this.currentUser.full_name,
            patient_email: this.currentUser.email,
            patient_phone: this.currentUser.phone
        };

        try {
            const response = await fetch('php/booking-handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();
            
            if (data.success) {
                // Store booking data in session storage for payment page
                sessionStorage.setItem('pendingBooking', JSON.stringify({
                    bookingId: data.booking_id,
                    doctor: this.selectedDoctor,
                    date: this.selectedDate,
                    time: this.selectedTime,
                    reason: visitReason,
                    fee: this.selectedDoctor.fee
                }));
                
                // Redirect to payment page
                window.location.href = 'payment.html';
            } else {
                this.showNotification(data.error || 'Booking failed', 'error');
            }
        } catch (error) {
            console.error('Booking error:', error);
            this.showNotification('Booking failed. Please try again.', 'error');
        }
    }

    resetBooking() {
        this.selectedDoctor = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.updateBookingStep(1);
        document.getElementById('booking-doctors-grid').style.display = 'grid';
        document.getElementById('selected-doctor-display').style.display = 'none';
        document.getElementById('next-to-time').disabled = true;
        document.getElementById('next-to-confirm').disabled = true;
        document.getElementById('appointment-summary').style.display = 'none';
        document.getElementById('visit-reason').value = '';
        document.getElementById('terms-agreement').checked = false;
    }

    updateBookingStep(step) {
        // Update progress indicator
        document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
            stepEl.classList.toggle('active', index < step);
        });

        // Show/hide steps
        document.querySelectorAll('.booking-step').forEach((stepEl, index) => {
            stepEl.classList.toggle('active', index === step - 1);
        });

        this.currentStep = step;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    formatTime(timeStr) {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
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
    if (window.patientDashboard) {
        window.patientDashboard.showSection('book-appointment');
        // Pre-select doctor if provided
        if (doctorId) {
            setTimeout(() => {
                window.patientDashboard.selectDoctor(doctorId);
            }, 500);
        }
    }
}

// Global booking functions
function clearDoctorSelection() {
    if (window.patientDashboard) {
        window.patientDashboard.clearDoctorSelection();
    }
}

function goToTimeSelection() {
    if (window.patientDashboard) {
        window.patientDashboard.updateBookingStep(2);
        window.patientDashboard.generateCalendar();
    }
}

function goToConfirmation() {
    if (window.patientDashboard) {
        window.patientDashboard.updateBookingStep(3);
        window.patientDashboard.updateConfirmationDetails();
    }
}

function goBackToDoctor() {
    if (window.patientDashboard) {
        window.patientDashboard.updateBookingStep(1);
    }
}

function goBackToTime() {
    if (window.patientDashboard) {
        window.patientDashboard.updateBookingStep(2);
    }
}

function confirmAppointmentBooking() {
    if (window.patientDashboard) {
        window.patientDashboard.confirmAppointmentBooking();
    }
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

