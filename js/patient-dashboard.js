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
        this.setupMobileMenu();
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadDashboardData();
        this.setupSidebarNavigation();
        this.setupProfilePicture();
        this.setupSearchFunctionality();
    }

    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (mobileToggle && sidebar && overlay) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
                overlay.classList.toggle('show');
            });

            overlay.addEventListener('click', () => {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            });
        }
    }

    async checkAuthentication() {
        // Use demo data for demo environment - no automatic redirections
        this.currentUser = {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            role: 'patient'
        };
        this.updateUserDisplay();
    }

    updateUserDisplay() {
        if (this.currentUser) {
            const userNameElement = document.getElementById('user-name');
            const patientNameElement = document.getElementById('patient-name');
            const patientEmailElement = document.getElementById('patient-email');
            
            const fullName = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
            
            if (userNameElement) {
                userNameElement.textContent = fullName;
            }
            if (patientNameElement) {
                patientNameElement.textContent = fullName;
            }
            if (patientEmailElement) {
                patientEmailElement.textContent = this.currentUser.email;
            }
        }
    }

    setupEventListeners() {
        // Logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Profile update form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileUpdate(e);
            });
        }

        // Book appointment buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="book-appointment"]')) {
                const doctorId = e.target.dataset.doctorId;
                this.bookAppointment(doctorId);
            }
            
            if (e.target.matches('[data-action="view-doctor"]')) {
                const doctorId = e.target.dataset.doctorId;
                this.viewDoctorProfile(doctorId);
            }
            
            if (e.target.matches('[data-action="cancel-appointment"]')) {
                const appointmentId = e.target.dataset.appointmentId;
                this.cancelAppointment(appointmentId);
            }
        });
    }

    setupSidebarNavigation() {
        const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
        
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                console.log('Switching to section:', section);
                this.showSection(section);
                
                // Update active state
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Close mobile menu if open
                this.closeMobileMenu();
            });
        });

        // Show dashboard by default
        this.showSection('dashboard');
        const dashboardLink = document.querySelector('[data-section="dashboard"]');
        if (dashboardLink) {
            dashboardLink.classList.add('active');
        }
    }

    setupProfilePicture() {
        const profilePictureInput = document.getElementById('profile-picture');
        const profilePreview = document.getElementById('profile-preview');
        
        if (profilePictureInput && profilePreview) {
            profilePictureInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        profilePreview.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    setupSearchFunctionality() {
        const searchInput = document.getElementById('doctor-search');
        const filterSpecialty = document.getElementById('filter-specialty');
        const filterLocation = document.getElementById('filter-location');
        const clearSearchBtn = document.getElementById('clear-search');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterDoctors());
        }
        
        if (filterSpecialty) {
            filterSpecialty.addEventListener('change', () => this.filterDoctors());
        }
        
        if (filterLocation) {
            filterLocation.addEventListener('change', () => this.filterDoctors());
        }
        
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => this.clearSearch());
        }
    }

    showSection(sectionName) {
        console.log('Showing section:', sectionName);
        
        // Hide all sections with better selector
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('active');
            this.loadSectionData(sectionName);
        } else {
            console.warn('Section not found:', `${sectionName}-section`);
        }
    }
    
    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
    }

    async loadSectionData(sectionName) {
        switch(sectionName) {
            case 'dashboard':
                await this.loadDashboardStats();
                await this.loadUpcomingAppointments();
                break;
            case 'appointments':
                await this.loadAllAppointments();
                break;
            case 'doctors':
                await this.loadDoctors();
                break;
            case 'book-appointment':
            case 'booking':
                await this.loadBookingDoctors();
                break;
            case 'medical-records':
                await this.loadMedicalRecords();
                break;
            case 'messages':
                await this.loadMessages();
                break;
        }
    }

    async loadDashboardData() {
        await this.loadDashboardStats();
        await this.loadUpcomingAppointments();
    }

    async loadDashboardStats() {
        try {
            const response = await fetch('php/patient-api.php?action=get_dashboard_stats');
            if (!response.ok) {
                throw new Error('Failed to load dashboard stats');
            }
            
            const stats = await response.json();
            this.updateStatsDisplay(stats);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            // Use mock data for demo
            const mockStats = {
                total_appointments: 12,
                upcoming_appointments: 2,
                completed_appointments: 8,
                cancelled_appointments: 2
            };
            this.updateStatsDisplay(mockStats);
        }
    }

    updateStatsDisplay(stats) {
        const elements = {
            'total-appointments': stats.total_appointments || 0,
            'upcoming-appointments': stats.upcoming_appointments || 0,
            'completed-appointments': stats.completed_appointments || 0,
            'cancelled-appointments': stats.cancelled_appointments || 0
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    async loadUpcomingAppointments() {
        try {
            const response = await fetch('php/patient-api.php?action=get_upcoming_appointments');
            if (!response.ok) {
                throw new Error('Failed to load upcoming appointments');
            }
            
            const appointments = await response.json();
            this.displayUpcomingAppointments(appointments);
        } catch (error) {
            console.error('Error loading upcoming appointments:', error);
            // Use mock data for demo
            const mockAppointments = [
                {
                    id: 1,
                    doctor_name: 'Dr. Sarah Johnson',
                    specialty: 'Cardiology',
                    appointment_date: '2025-06-25',
                    appointment_time: '10:00',
                    status: 'confirmed',
                    booking_reference: 'HCP20250625001'
                },
                {
                    id: 2,
                    doctor_name: 'Dr. Michael Chen',
                    specialty: 'Neurology',
                    appointment_date: '2025-06-28',
                    appointment_time: '14:30',
                    status: 'scheduled',
                    booking_reference: 'HCP20250628002'
                }
            ];
            this.displayUpcomingAppointments(mockAppointments);
        }
    }

    displayUpcomingAppointments(appointments) {
        const container = document.getElementById('upcoming-appointments-list');
        if (!container) return;

        if (appointments.length === 0) {
            container.innerHTML = '<p class="no-data">No upcoming appointments</p>';
            return;
        }

        const appointmentsHTML = appointments.map(appointment => `
            <div class="appointment-card">
                <div class="appointment-info">
                    <h4>${appointment.doctor_name}</h4>
                    <p class="specialty">${appointment.specialty}</p>
                    <div class="appointment-details">
                        <span class="date"><i class="fas fa-calendar"></i> ${this.formatDate(appointment.appointment_date)}</span>
                        <span class="time"><i class="fas fa-clock"></i> ${this.formatTime(appointment.appointment_time)}</span>
                    </div>
                    <div class="booking-reference">
                        Ref: ${appointment.booking_reference}
                    </div>
                </div>
                <div class="appointment-actions">
                    <span class="status status-${appointment.status}">${this.capitalizeFirst(appointment.status)}</span>
                    <button class="btn btn-sm btn-outline" data-action="cancel-appointment" data-appointment-id="${appointment.id}">
                        Cancel
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = appointmentsHTML;
    }

    async loadAllAppointments() {
        try {
            const response = await fetch('php/patient-api.php?action=get_all_appointments');
            if (!response.ok) {
                throw new Error('Failed to load appointments');
            }
            
            const appointments = await response.json();
            this.displayAllAppointments(appointments);
        } catch (error) {
            console.error('Error loading appointments:', error);
            // Use mock data for demo
            const mockAppointments = [
                {
                    id: 1,
                    doctor_name: 'Dr. Sarah Johnson',
                    specialty: 'Cardiology',
                    appointment_date: '2025-06-25',
                    appointment_time: '10:00',
                    status: 'confirmed',
                    booking_reference: 'HCP20250625001',
                    consultation_fee: 250.00
                },
                {
                    id: 2,
                    doctor_name: 'Dr. Michael Chen',
                    specialty: 'Neurology',
                    appointment_date: '2025-06-28',
                    appointment_time: '14:30',
                    status: 'scheduled',
                    booking_reference: 'HCP20250628002',
                    consultation_fee: 300.00
                },
                {
                    id: 3,
                    doctor_name: 'Dr. Emily Rodriguez',
                    specialty: 'Pediatrics',
                    appointment_date: '2025-06-15',
                    appointment_time: '09:00',
                    status: 'completed',
                    booking_reference: 'HCP20250615003',
                    consultation_fee: 180.00
                }
            ];
            this.displayAllAppointments(mockAppointments);
        }
    }

    displayAllAppointments(appointments) {
        const container = document.getElementById('all-appointments-list');
        if (!container) return;

        if (appointments.length === 0) {
            container.innerHTML = '<p class="no-data">No appointments found</p>';
            return;
        }

        const appointmentsHTML = appointments.map(appointment => `
            <div class="appointment-row">
                <div class="appointment-info">
                    <h4>${appointment.doctor_name}</h4>
                    <p class="specialty">${appointment.specialty}</p>
                </div>
                <div class="appointment-datetime">
                    <span class="date">${this.formatDate(appointment.appointment_date)}</span>
                    <span class="time">${this.formatTime(appointment.appointment_time)}</span>
                </div>
                <div class="appointment-status">
                    <span class="status status-${appointment.status}">${this.capitalizeFirst(appointment.status)}</span>
                </div>
                <div class="appointment-fee">
                    $${appointment.consultation_fee}
                </div>
                <div class="appointment-actions">
                    <span class="booking-ref">${appointment.booking_reference}</span>
                    ${appointment.status === 'scheduled' || appointment.status === 'confirmed' ? 
                        `<button class="btn btn-sm btn-outline" data-action="cancel-appointment" data-appointment-id="${appointment.id}">Cancel</button>` : 
                        ''
                    }
                </div>
            </div>
        `).join('');

        container.innerHTML = appointmentsHTML;
    }

    async loadDoctors() {
        // Load all 10 doctors for find doctors page
        this.doctors = [
            {
                id: 1,
                name: "Dr. Sarah Johnson",
                specialty: "Cardiologist",
                experience: 15,
                rating: 4.9,
                reviews: 234,
                fee: 150,
                location: "New York",
                languages: ["English", "Spanish"]
            },
            {
                id: 2,
                name: "Dr. Michael Chen",
                specialty: "Orthopedic Surgeon",
                experience: 12,
                rating: 4.8,
                reviews: 189,
                fee: 180,
                location: "Los Angeles",
                languages: ["English", "Mandarin"]
            },
            {
                id: 3,
                name: "Dr. Emily Rodriguez",
                specialty: "Pediatrician",
                experience: 8,
                rating: 4.7,
                reviews: 156,
                fee: 120,
                location: "Chicago",
                languages: ["English", "Spanish"]
            },
            {
                id: 4,
                name: "Dr. David Wilson",
                specialty: "Dermatologist",
                experience: 10,
                rating: 4.6,
                reviews: 142,
                fee: 140,
                location: "Houston",
                languages: ["English"]
            },
            {
                id: 5,
                name: "Dr. Lisa Anderson",
                specialty: "Neurologist",
                experience: 14,
                rating: 4.9,
                reviews: 198,
                fee: 170,
                location: "Miami",
                languages: ["English", "French"]
            },
            {
                id: 6,
                name: "Dr. James Thompson",
                specialty: "General Surgeon",
                experience: 18,
                rating: 4.8,
                reviews: 267,
                fee: 200,
                location: "Philadelphia",
                languages: ["English"]
            },
            {
                id: 7,
                name: "Dr. Maria Garcia",
                specialty: "Gynecologist",
                experience: 11,
                rating: 4.7,
                reviews: 178,
                fee: 160,
                location: "San Francisco",
                languages: ["English", "Spanish"]
            },
            {
                id: 8,
                name: "Dr. Robert Kim",
                specialty: "Psychiatrist",
                experience: 9,
                rating: 4.6,
                reviews: 134,
                fee: 130,
                location: "Seattle",
                languages: ["English", "Korean"]
            },
            {
                id: 9,
                name: "Dr. Jennifer Lee",
                specialty: "Ophthalmologist",
                experience: 13,
                rating: 4.8,
                reviews: 201,
                fee: 155,
                location: "Boston",
                languages: ["English"]
            },
            {
                id: 10,
                name: "Dr. Mark Davis",
                specialty: "Endocrinologist",
                experience: 16,
                rating: 4.9,
                reviews: 223,
                fee: 165,
                location: "Denver",
                languages: ["English"]
            }
        ];
        this.filteredDoctors = this.doctors;
        this.displayDoctors(this.doctors);
        this.populateFilterOptions(this.doctors);
    }

    loadMockDoctors() {
        // Complete list of all 10 doctors - no longer using fallback data
        this.loadDoctors();
    }

    displayDoctors(doctors) {
        const container = document.getElementById('doctors-container');
        if (!container) return;

        if (doctors.length === 0) {
            container.innerHTML = '<p class="no-data">No doctors found</p>';
            return;
        }

        const doctorsHTML = doctors.map(doctor => `
            <div class="doctor-card">
                <div class="doctor-avatar">
                    <i class="fas fa-user-md"></i>
                </div>
                <div class="doctor-info">
                    <h3>${doctor.name}</h3>
                    <p class="specialty">${doctor.specialty}</p>
                    <p class="experience">${doctor.experience} years experience</p>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${doctor.location}</p>
                    <div class="rating">
                        ${this.generateStars(doctor.rating)}
                        <span class="rating-text">${doctor.rating} (${doctor.reviews} reviews)</span>
                    </div>
                    <div class="fee">
                        Consultation Fee: <strong>$${doctor.fee}</strong>
                    </div>
                    <div class="languages">
                        Languages: ${doctor.languages.join(', ')}
                    </div>
                </div>
                <div class="doctor-actions">
                    <button class="btn btn-primary" data-action="book-appointment" data-doctor-id="${doctor.id}">
                        Book Appointment
                    </button>
                    <button class="btn btn-outline" data-action="view-doctor" data-doctor-id="${doctor.id}">
                        View Profile
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = doctorsHTML;
    }

    populateFilterOptions(doctors) {
        const specialtyFilter = document.getElementById('filter-specialty');
        const locationFilter = document.getElementById('filter-location');

        if (specialtyFilter) {
            const specialties = [...new Set(doctors.map(d => d.specialty))];
            specialtyFilter.innerHTML = '<option value="">All Specialties</option>' +
                specialties.map(specialty => `<option value="${specialty}">${specialty}</option>`).join('');
        }

        if (locationFilter) {
            const locations = [...new Set(doctors.map(d => d.location))];
            locationFilter.innerHTML = '<option value="">All Locations</option>' +
                locations.map(location => `<option value="${location}">${location}</option>`).join('');
        }
    }

    filterDoctors() {
        const searchTerm = document.getElementById('doctor-search')?.value.toLowerCase() || '';
        const specialtyFilter = document.getElementById('filter-specialty')?.value || '';
        const locationFilter = document.getElementById('filter-location')?.value || '';

        this.filteredDoctors = this.doctors.filter(doctor => {
            const matchesSearch = doctor.name.toLowerCase().includes(searchTerm) ||
                                doctor.specialty.toLowerCase().includes(searchTerm);
            const matchesSpecialty = !specialtyFilter || doctor.specialty === specialtyFilter;
            const matchesLocation = !locationFilter || doctor.location === locationFilter;

            return matchesSearch && matchesSpecialty && matchesLocation;
        });

        this.displayDoctors(this.filteredDoctors);
    }

    clearSearch() {
        const searchInput = document.getElementById('doctor-search');
        const specialtyFilter = document.getElementById('filter-specialty');
        const locationFilter = document.getElementById('filter-location');

        if (searchInput) searchInput.value = '';
        if (specialtyFilter) specialtyFilter.value = '';
        if (locationFilter) locationFilter.value = '';

        this.filteredDoctors = this.doctors;
        this.displayDoctors(this.doctors);
    }

    async loadMedicalRecords() {
        try {
            const response = await fetch('php/patient-api.php?action=get_medical_records');
            if (!response.ok) {
                throw new Error('Failed to load medical records');
            }
            
            const records = await response.json();
            this.displayMedicalRecords(records);
        } catch (error) {
            console.error('Error loading medical records:', error);
            // Use mock data for demo
            const mockRecords = [
                {
                    id: 1,
                    doctor_name: 'Dr. Sarah Johnson',
                    diagnosis: 'Hypertension',
                    treatment: 'Lifestyle modifications and medication',
                    medications: 'Lisinopril 10mg daily',
                    record_date: '2025-06-15',
                    follow_up_date: '2025-07-15'
                },
                {
                    id: 2,
                    doctor_name: 'Dr. Emily Rodriguez',
                    diagnosis: 'Annual checkup',
                    treatment: 'Routine examination, all normal',
                    medications: 'None',
                    record_date: '2025-05-20',
                    follow_up_date: '2026-05-20'
                }
            ];
            this.displayMedicalRecords(mockRecords);
        }
    }

    displayMedicalRecords(records) {
        const container = document.getElementById('medical-records-list');
        if (!container) return;

        if (records.length === 0) {
            container.innerHTML = '<p class="no-data">No medical records found</p>';
            return;
        }

        const recordsHTML = records.map(record => `
            <div class="medical-record-card">
                <div class="record-header">
                    <h4>Visit with ${record.doctor_name}</h4>
                    <span class="record-date">${this.formatDate(record.record_date)}</span>
                </div>
                <div class="record-content">
                    <div class="record-field">
                        <label>Diagnosis:</label>
                        <p>${record.diagnosis}</p>
                    </div>
                    <div class="record-field">
                        <label>Treatment:</label>
                        <p>${record.treatment}</p>
                    </div>
                    <div class="record-field">
                        <label>Medications:</label>
                        <p>${record.medications}</p>
                    </div>
                    ${record.follow_up_date ? `
                        <div class="record-field">
                            <label>Follow-up Date:</label>
                            <p>${this.formatDate(record.follow_up_date)}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = recordsHTML;
    }

    async loadMessages() {
        try {
            const response = await fetch('php/messaging-api.php?action=get_conversations');
            if (!response.ok) {
                throw new Error('Failed to load messages');
            }
            
            const conversations = await response.json();
            this.displayMessages(conversations);
        } catch (error) {
            console.error('Error loading messages:', error);
            // Use mock data for demo
            const mockConversations = [
                {
                    id: 1,
                    other_user_name: 'Dr. Sarah Johnson',
                    other_user_type: 'doctor',
                    last_message: 'Please continue taking your medication as prescribed.',
                    last_message_time: '2025-06-20 10:30:00',
                    unread_count: 0
                },
                {
                    id: 2,
                    other_user_name: 'Dr. Michael Chen',
                    other_user_type: 'doctor',
                    last_message: 'Your test results look good. Schedule a follow-up in 3 months.',
                    last_message_time: '2025-06-19 14:15:00',
                    unread_count: 1
                }
            ];
            this.displayMessages(mockConversations);
        }
    }

    displayMessages(conversations) {
        const container = document.getElementById('messages-list');
        if (!container) return;

        if (conversations.length === 0) {
            container.innerHTML = '<p class="no-data">No messages found</p>';
            return;
        }

        const messagesHTML = conversations.map(conversation => `
            <div class="message-conversation" data-conversation-id="${conversation.id}">
                <div class="conversation-avatar">
                    <i class="fas fa-user-md"></i>
                </div>
                <div class="conversation-info">
                    <h4>${conversation.other_user_name}</h4>
                    <p class="last-message">${conversation.last_message}</p>
                    <span class="message-time">${this.formatDateTime(conversation.last_message_time)}</span>
                </div>
                ${conversation.unread_count > 0 ? `
                    <div class="unread-badge">${conversation.unread_count}</div>
                ` : ''}
            </div>
        `).join('');

        container.innerHTML = messagesHTML;
    }

    bookAppointment(doctorId) {
        // Navigate to booking page
        window.location.href = 'booking.html';
    }

    viewDoctorProfile(doctorId) {
        const doctor = this.doctors.find(d => d.id == doctorId);
        if (doctor) {
            this.showDoctorModal(doctor);
        }
    }

    showDoctorModal(doctor) {
        const modalHTML = `
            <div class="modal fade" id="doctorModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${doctor.name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="doctor-profile">
                                <div class="doctor-basic-info">
                                    <h6>Specialty: ${doctor.specialty}</h6>
                                    <p>Education: ${doctor.education}</p>
                                    <p>Experience: ${doctor.experience} years</p>
                                    <p>Location: ${doctor.location}</p>
                                    <p>Languages: ${doctor.languages.join(', ')}</p>
                                </div>
                                <div class="doctor-about">
                                    <h6>About</h6>
                                    <p>${doctor.about}</p>
                                </div>
                                <div class="doctor-services">
                                    <h6>Services</h6>
                                    <ul>
                                        ${doctor.services.map(service => `<li>${service}</li>`).join('')}
                                    </ul>
                                </div>
                                <div class="doctor-certifications">
                                    <h6>Certifications</h6>
                                    <ul>
                                        ${doctor.certifications.map(cert => `<li>${cert}</li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" onclick="window.location.href='booking.html'">
                                Book Appointment
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('doctorModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal (using simple display toggle since we don't have Bootstrap)
        const modal = document.getElementById('doctorModal');
        modal.style.display = 'block';
        modal.classList.add('show');

        // Close modal functionality
        const closeButtons = modal.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.style.display = 'none';
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            });
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    viewAppointment(appointmentId) {
        // Find the appointment in the appointments list
        const appointment = this.appointments.find(apt => apt.id == appointmentId);
        
        if (!appointment) {
            this.showNotification('Appointment not found', 'error');
            return;
        }

        // Create modal HTML
        const modalHtml = `
            <div class="modal-overlay" id="appointmentModal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
                <div class="modal-content" style="background: var(--card-bg); border-radius: 12px; padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
                        <h3 style="margin: 0; color: var(--primary-color);">Appointment Details</h3>
                        <button class="btn-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-color);">&times;</button>
                    </div>
                    
                    <div class="appointment-info">
                        <div class="info-grid" style="display: grid; gap: 1rem;">
                            <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                                <span style="font-weight: 600; color: var(--text-color);">Appointment ID:</span>
                                <span style="color: var(--text-secondary);">#${appointment.id}</span>
                            </div>
                            
                            <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                                <span style="font-weight: 600; color: var(--text-color);">Doctor:</span>
                                <span style="color: var(--text-secondary);">${appointment.doctor_name || 'Unknown Doctor'}</span>
                            </div>
                            
                            <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                                <span style="font-weight: 600; color: var(--text-color);">Specialty:</span>
                                <span style="color: var(--text-secondary);">${appointment.specialty || 'General'}</span>
                            </div>
                            
                            <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                                <span style="font-weight: 600; color: var(--text-color);">Date:</span>
                                <span style="color: var(--text-secondary);">${this.formatDate(appointment.appointment_date)}</span>
                            </div>
                            
                            <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                                <span style="font-weight: 600; color: var(--text-color);">Time:</span>
                                <span style="color: var(--text-secondary);">${this.formatTime(appointment.appointment_time)}</span>
                            </div>
                            
                            <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                                <span style="font-weight: 600; color: var(--text-color);">Status:</span>
                                <span class="status-badge status-${appointment.status}" style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; text-transform: capitalize;">${this.capitalizeFirst(appointment.status)}</span>
                            </div>
                            
                            <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                                <span style="font-weight: 600; color: var(--text-color);">Consultation Fee:</span>
                                <span style="color: var(--primary-color); font-weight: 600;">$${appointment.consultation_fee || '0.00'}</span>
                            </div>
                            
                            ${appointment.reason_for_visit ? `
                            <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                                <span style="font-weight: 600; color: var(--text-color);">Reason for Visit:</span>
                                <span style="color: var(--text-secondary);">${appointment.reason_for_visit}</span>
                            </div>
                            ` : ''}
                            
                            ${appointment.notes ? `
                            <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                                <span style="font-weight: 600; color: var(--text-color);">Notes:</span>
                                <span style="color: var(--text-secondary);">${appointment.notes}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="modal-actions" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                        ${appointment.status === 'pending' && appointment.payment_status === 'pending' ? `
                            <button class="btn btn-primary" onclick="payAppointment(${appointment.id})" style="padding: 0.75rem 1.5rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer;">
                                <i class="fas fa-credit-card"></i> Pay Now
                            </button>
                        ` : ''}
                        
                        ${appointment.status !== 'cancelled' && appointment.status !== 'completed' ? `
                            <button class="btn btn-secondary" onclick="window.patientDashboard.cancelAppointment(${appointment.id}); document.getElementById('appointmentModal').remove();" style="padding: 0.75rem 1.5rem; background: var(--secondary-color); color: var(--text-color); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer;">
                                <i class="fas fa-times"></i> Cancel Appointment
                            </button>
                        ` : ''}
                        
                        <button class="btn btn-outline btn-close" style="padding: 0.75rem 1.5rem; background: transparent; color: var(--text-color); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing modals
        const existingModal = document.getElementById('appointmentModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Setup close functionality
        const modal = document.getElementById('appointmentModal');
        const closeButtons = modal.querySelectorAll('.btn-close');
        
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async cancelAppointment(appointmentId) {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            const response = await fetch('php/patient-api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'cancel_appointment',
                    appointment_id: appointmentId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to cancel appointment');
            }

            const result = await response.json();
            if (result.success) {
                this.showNotification('Appointment cancelled successfully', 'success');
                this.loadDashboardData();
                this.loadAllAppointments();
            } else {
                throw new Error(result.message || 'Failed to cancel appointment');
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            this.showNotification('Failed to cancel appointment', 'error');
        }
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
            console.error('Logout error:', error);
            // Ensure flags are set even on error
            sessionStorage.setItem('allowHomeAccess', 'true');
            sessionStorage.setItem('skipHomeRedirect', 'true');
            window.location.href = 'index.html';
        }
    }

    async handleProfileUpdate(e) {
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch('php/patient-api.php', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const result = await response.json();
            if (result.success) {
                this.showNotification('Profile updated successfully', 'success');
                this.checkAuthentication(); // Refresh user data
            } else {
                throw new Error(result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('Failed to update profile', 'error');
        }
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
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

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }
    async loadBookingDoctors() {
        console.log('Loading booking doctors...');
        
        // Immediately display mock data for booking section
        this.displayBookingDoctors();
        
        try {
            const response = await fetch('php/patient-api.php?action=get_doctors');
            const data = await response.json();
            
            if (data.success && data.doctors) {
                this.doctors = data.doctors;
                this.displayBookingDoctors();
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
            // Already showing mock data, so no need for error display
        }
    }

    displayBookingDoctors() {
        console.log('Displaying booking doctors...');
        const container = document.getElementById('booking-doctors-list');
        if (!container) {
            console.error('Booking doctors container not found');
            return;
        }

        // Force container visibility with timeout
        container.style.display = 'grid';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        container.style.gap = '1.5rem';
        container.style.width = '100%';
        container.style.minHeight = '400px';
        container.style.background = 'transparent';
        
        // Force refresh the container
        setTimeout(() => {
            container.style.display = 'grid';
            console.log('Forced grid display after timeout');
        }, 50);

        // Create doctor cards directly in HTML for immediate display
        container.innerHTML = `
            <div class="doctor-card" data-doctor-id="1" style="display: flex !important; flex-direction: column !important; min-height: 300px !important; background: var(--card-bg) !important; border: 1px solid var(--border-color) !important; border-radius: 12px !important; padding: 1.5rem !important;">
                <div class="doctor-photo">
                    <div class="doctor-initials">SW</div>
                </div>
                <div class="doctor-info">
                    <h4>Dr. Sarah Wilson</h4>
                    <p class="specialty">Cardiologist</p>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> New York</p>
                    <div class="doctor-rating">
                        <div class="stars">★★★★★</div>
                        <span class="rating-text">4.8 (245 reviews)</span>
                    </div>
                    <div class="consultation-fee">
                        <span class="fee-label">Consultation Fee:</span>
                        <span class="fee-amount">$150</span>
                    </div>
                </div>
                <div class="doctor-actions">
                    <button class="btn btn-primary select-doctor-btn" onclick="bookAppointment(1)">
                        <i class="fas fa-calendar-plus"></i> Book Now
                    </button>
                    <button class="btn btn-secondary" onclick="viewDoctorProfile(1)">
                        <i class="fas fa-eye"></i> View Profile
                    </button>
                </div>
            </div>
            <div class="doctor-card" data-doctor-id="2" style="display: flex !important; flex-direction: column !important; min-height: 300px !important; background: var(--card-bg) !important; border: 1px solid var(--border-color) !important; border-radius: 12px !important; padding: 1.5rem !important;">
                <div class="doctor-photo">
                    <div class="doctor-initials">MC</div>
                </div>
                <div class="doctor-info">
                    <h4>Dr. Michael Chen</h4>
                    <p class="specialty">Neurologist</p>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> Los Angeles</p>
                    <div class="doctor-rating">
                        <div class="stars">★★★★★</div>
                        <span class="rating-text">4.9 (198 reviews)</span>
                    </div>
                    <div class="consultation-fee">
                        <span class="fee-label">Consultation Fee:</span>
                        <span class="fee-amount">$180</span>
                    </div>
                </div>
                <div class="doctor-actions">
                    <button class="btn btn-primary select-doctor-btn" onclick="bookAppointment(2)">
                        <i class="fas fa-calendar-plus"></i> Book Now
                    </button>
                    <button class="btn btn-secondary" onclick="viewDoctorProfile(2)">
                        <i class="fas fa-eye"></i> View Profile
                    </button>
                </div>
            </div>
            <div class="doctor-card" data-doctor-id="3" style="display: flex !important; flex-direction: column !important; min-height: 300px !important; background: var(--card-bg) !important; border: 1px solid var(--border-color) !important; border-radius: 12px !important; padding: 1.5rem !important;">
                <div class="doctor-photo">
                    <div class="doctor-initials">ER</div>
                </div>
                <div class="doctor-info">
                    <h4>Dr. Emily Rodriguez</h4>
                    <p class="specialty">Pediatrician</p>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> Chicago</p>
                    <div class="doctor-rating">
                        <div class="stars">★★★★☆</div>
                        <span class="rating-text">4.7 (156 reviews)</span>
                    </div>
                    <div class="consultation-fee">
                        <span class="fee-label">Consultation Fee:</span>
                        <span class="fee-amount">$120</span>
                    </div>
                </div>
                <div class="doctor-actions">
                    <button class="btn btn-primary select-doctor-btn" onclick="bookAppointment(3)">
                        <i class="fas fa-calendar-plus"></i> Book Now
                    </button>
                    <button class="btn btn-secondary" onclick="viewDoctorProfile(3)">
                        <i class="fas fa-eye"></i> View Profile
                    </button>
                </div>
            </div>
        `;
        
        console.log('Booking doctors displayed successfully');
    }

    createBookingDoctorCard(doctor) {
        const initials = doctor.name.split(' ').map(n => n[0]).join('');
        const stars = this.generateStars(doctor.rating);
        
        return `
            <div class="doctor-card" data-doctor-id="${doctor.id}">
                <div class="doctor-photo">
                    <div class="doctor-initials">${initials}</div>
                </div>
                <div class="doctor-info">
                    <h4>${doctor.name}</h4>
                    <p class="specialty">${doctor.specialty}</p>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${doctor.location}</p>
                    <div class="doctor-rating">
                        <div class="stars">${stars}</div>
                        <span class="rating-text">${doctor.rating} (${doctor.reviews} reviews)</span>
                    </div>
                    <div class="consultation-fee">
                        <span class="fee-label">Consultation Fee:</span>
                        <span class="fee-amount">$${doctor.fee}</span>
                    </div>
                </div>
                <div class="doctor-actions">
                    <button class="btn btn-primary select-doctor-btn" onclick="bookAppointment(${doctor.id})">
                        <i class="fas fa-calendar-plus"></i> Book Now
                    </button>
                    <button class="btn btn-secondary" onclick="viewDoctorProfile(${doctor.id})">
                        <i class="fas fa-eye"></i> View Profile
                    </button>
                </div>
            </div>
        `;
        
        return `
            <div class="doctor-card" onclick="selectDoctorForBooking('${doctor.id}', '${doctor.name}', '${doctor.specialty}', '${doctor.location}', '${doctor.rating}', '${doctor.reviews}', '$${doctor.fee}')">
                <div class="doctor-photo">
                    <div class="doctor-initials">${initials}</div>
                </div>
                <div class="doctor-info">
                    <h4>${doctor.name}</h4>
                    <p class="specialty">${doctor.specialty}</p>
                    <p class="location">${doctor.location}</p>
                    <div class="rating">
                        ${stars}
                        <span class="rating-text">${doctor.rating} (${doctor.reviews} reviews)</span>
                    </div>
                    <div class="consultation-fee">
                        <span class="fee-label">Consultation Fee:</span>
                        <span class="fee-amount">$${doctor.fee}</span>
                    </div>
                </div>
                <div class="doctor-actions">
                    <button class="btn btn-primary btn-sm">
                        <i class="fas fa-calendar-plus"></i> Select Doctor
                    </button>
                </div>
            </div>
        `;
    }

    displayBookingDoctorsError() {
        const container = document.getElementById('booking-doctors-grid');
        if (!container) return;

        container.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--warning-color); margin-bottom: 1rem;"></i>
                <h3>Unable to Load Doctors</h3>
                <p>Please try refreshing the page or contact support if the problem persists.</p>
                <button class="btn btn-primary" onclick="window.patientDashboard.loadBookingDoctors()">
                    <i class="fas fa-refresh"></i> Try Again
                </button>
            </div>
        `;
    }

    selectDoctorForBooking(doctorId, doctorName, specialty, location, rating, reviews, fee) {
        // Store selected doctor data
        this.selectedDoctor = {
            id: doctorId,
            name: doctorName,
            specialty: specialty,
            location: location,
            rating: rating,
            reviews: reviews,
            fee: fee
        };

        // Update selected doctor display
        const selectedDisplay = document.getElementById('selected-doctor-display');
        const doctorsGrid = document.getElementById('booking-doctors-grid');
        
        if (selectedDisplay && doctorsGrid) {
            // Show selected doctor card
            selectedDisplay.style.display = 'block';
            doctorsGrid.style.display = 'none';
            
            // Update selected doctor information
            document.getElementById('selected-doctor-name').textContent = doctorName;
            document.getElementById('selected-doctor-specialty').textContent = specialty;
            document.getElementById('selected-doctor-location').textContent = location;
            document.getElementById('selected-doctor-fee').textContent = fee;
            
            // Update rating stars
            const ratingContainer = document.getElementById('selected-doctor-rating');
            const reviewsContainer = document.getElementById('selected-doctor-reviews');
            if (ratingContainer) {
                ratingContainer.innerHTML = this.generateStars(rating);
            }
            if (reviewsContainer) {
                reviewsContainer.textContent = `(${reviews} reviews)`;
            }
        }

        // Enable next step
        this.updateBookingProgress(2);
        this.showNotification('Doctor selected successfully! Please choose your appointment time.', 'success');
    }

    clearDoctorSelection() {
        this.selectedDoctor = null;
        
        // Hide selected doctor display and show doctors grid
        const selectedDisplay = document.getElementById('selected-doctor-display');
        const doctorsGrid = document.getElementById('booking-doctors-grid');
        
        if (selectedDisplay && doctorsGrid) {
            selectedDisplay.style.display = 'none';
            doctorsGrid.style.display = 'grid';
        }

        // Reset booking progress
        this.updateBookingProgress(1);
    }

    updateBookingProgress(step) {
        const progressSteps = document.querySelectorAll('.progress-step');
        const bookingSteps = document.querySelectorAll('.booking-step');
        
        // Update progress indicators
        progressSteps.forEach((stepElement, index) => {
            if (index < step) {
                stepElement.classList.add('active');
            } else {
                stepElement.classList.remove('active');
            }
        });
        
        // Show appropriate booking step
        bookingSteps.forEach((stepElement, index) => {
            if (index === step - 1) {
                stepElement.style.display = 'block';
                stepElement.classList.add('active');
            } else {
                stepElement.style.display = 'none';
                stepElement.classList.remove('active');
            }
        });
    }

    // Payment functionality
    payAppointment(appointmentId) {
        try {
            // Get appointment details from the appointments list
            const appointment = this.appointments.find(apt => apt.id == appointmentId);
            
            if (!appointment) {
                this.showNotification('Appointment not found', 'error');
                return;
            }

            // Prepare payment data
            const paymentData = {
                appointmentId: appointmentId,
                doctorName: appointment.doctor_name || 'Unknown Doctor',
                specialty: appointment.specialty || 'General',
                date: appointment.appointment_date,
                time: appointment.appointment_time,
                fee: appointment.consultation_fee || 0,
                patientName: this.currentUser ? `${this.currentUser.first_name} ${this.currentUser.last_name}` : 'Patient',
                bookingId: `HC${Date.now()}`
            };

            // Store payment data in session storage for the payment page
            sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
            
            // Redirect to payment page
            window.location.href = 'payment.html';
            
        } catch (error) {
            console.error('Error initiating payment:', error);
            this.showNotification('Failed to initiate payment', 'error');
        }
    }
}

// Global functions for onclick handlers
function payAppointment(appointmentId) {
    if (window.patientDashboard) {
        window.patientDashboard.payAppointment(appointmentId);
    } else {
        console.error('Patient dashboard not initialized');
    }
}

function viewAppointment(appointmentId) {
    if (window.patientDashboard) {
        window.patientDashboard.viewAppointment(appointmentId);
    } else {
        console.error('Patient dashboard not initialized');
    }
}

function cancelAppointment(appointmentId) {
    if (window.patientDashboard) {
        window.patientDashboard.cancelAppointment(appointmentId);
    } else {
        console.error('Patient dashboard not initialized');
    }
}

function selectDoctorForBooking(doctorId, doctorName, specialty, location, rating, reviews, fee) {
    if (window.patientDashboard) {
        window.patientDashboard.selectDoctorForBooking(doctorId, doctorName, specialty, location, rating, reviews, fee);
    } else {
        console.error('Patient dashboard not initialized');
    }
}

function clearDoctorSelection() {
    if (window.patientDashboard) {
        window.patientDashboard.clearDoctorSelection();
    } else {
        console.error('Patient dashboard not initialized');
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.patientDashboard = new PatientDashboard();
});