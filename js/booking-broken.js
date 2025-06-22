// Booking System JavaScript for HealthCare+ Website
// Handles multi-step appointment booking process

class BookingManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.selectedDoctor = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.availableSlots = [];
        this.doctors = [];
        
        this.init();
    }
    
    async init() {
        this.setupStepNavigation();
        await this.loadDoctors();
        this.setupCalendar();
        this.bindEvents();
        this.checkURLParams();
        // Initialize back to top button
        if (window.HealthCare && window.HealthCare.initializeBackToTop) {
            window.HealthCare.initializeBackToTop();
        }
    }
    
    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const doctorId = urlParams.get('doctor');
        
        if (doctorId) {
            this.preselectDoctor(doctorId);
        }
    }
    
    async preselectDoctor(doctorId) {
        try {
            // First check sessionStorage for doctor data
            const storedDoctor = sessionStorage.getItem('selectedDoctor');
            if (storedDoctor) {
                const doctor = JSON.parse(storedDoctor);
                if (doctor.id == doctorId) {
                    this.selectDoctor(doctor);
                    this.nextStep();
                    return;
                }
            }
            
            // If not in sessionStorage, find from local doctors array
            const doctor = this.doctors.find(d => d.id == doctorId);
            if (doctor) {
                this.selectDoctor(doctor);
                this.nextStep();
            } else {
                console.warn('Doctor not found with ID:', doctorId);
            }
        } catch (error) {
            console.error('Error preselecting doctor:', error);
        }
    }
    
    setupStepNavigation() {
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const confirmBtn = document.getElementById('confirmBtn');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmBooking());
        }
    }
    
    async loadDoctors() {
        try {
            // Load doctors from the database API
            const response = await fetch('php/patient-api.php?action=get_doctors');
            const result = await response.json();
            
            if (result.success) {
                this.doctors = result.doctors;
            } else {
                console.error('Failed to load doctors:', result.error);
                this.doctors = [];
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
            this.doctors = [];
        }
        
        this.displayDoctorList(this.doctors);
    }
    
    displayDoctorList(doctors) {
        const doctorList = document.getElementById('doctor-list');
        if (!doctorList) return;
        
        if (doctors.length === 0) {
            doctorList.innerHTML = `
                <div class="no-doctors">
                    <i class="fas fa-user-md"></i>
                    <p>No doctors available at this time.</p>
                </div>
            `;
            return;
        }
        
        doctorList.innerHTML = doctors.map(doctor => `
            <div class="doctor-card" data-doctor-id="${doctor.id}">
                <div class="doctor-info">
                    <div class="doctor-header">
                        <h3>${doctor.name}</h3>
                        <span class="specialty">${doctor.specialty}</span>
                    </div>
                    <div class="doctor-details">
                        <div class="experience">
                            <i class="fas fa-graduation-cap"></i>
                            ${doctor.experience} years experience
                        </div>
                        <div class="rating">
                            ${this.generateStars(doctor.rating)}
                            <span class="rating-text">${doctor.rating} (${doctor.reviews} reviews)</span>
                        </div>
                        <div class="fee">
                            <i class="fas fa-dollar-sign"></i>
                            Consultation: $${doctor.fee}
                        </div>
                        ${doctor.bio ? `<div class="bio">${doctor.bio}</div>` : ''}
                        ${doctor.languages ? `<div class="languages">Languages: ${doctor.languages.join(', ')}</div>` : ''}
                    </div>
                    <div class="doctor-actions">
                        <button class="btn btn-primary select-doctor-btn" 
                                onclick="bookingManager.selectDoctor(${JSON.stringify(doctor).replace(/"/g, '&quot;')})">
                            Select Doctor
                        </button>
                        <button class="btn btn-outline view-profile-btn" 
                                onclick="bookingManager.viewDoctorDetails(${doctor.id})">
                            View Profile
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add modern styling for doctor cards
        const style = document.createElement('style');
        style.textContent = `
            .doctor-card {
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .doctor-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(37, 99, 235, 0.15);
            }
            .doctor-header h3 {
                color: var(--primary-color);
                margin: 0 0 0.5rem 0;
            }
            .specialty {
                background: var(--primary-color);
                color: white;
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.875rem;
                font-weight: 500;
            }
            .doctor-details > div {
                margin: 0.5rem 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: var(--text-secondary);
            }
            .rating .fas {
                color: #fbbf24;
            }
            .bio {
                font-style: italic;
                color: var(--text-color);
                margin: 1rem 0;
            }
            .doctor-actions {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
            }
            .no-doctors {
                text-align: center;
                padding: 3rem;
                color: var(--text-secondary);
            }
            .no-doctors i {
                font-size: 3rem;
                margin-bottom: 1rem;
                color: var(--primary-color);
            }
        `;
        if (!document.head.querySelector('#doctor-card-styles')) {
            style.id = 'doctor-card-styles';
            document.head.appendChild(style);
        }
    }
    
    setupDoctorSearch() {
        const searchInput = document.getElementById('doctor-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredDoctors = this.doctors.filter(doctor => 
                    doctor.name.toLowerCase().includes(searchTerm) ||
                    doctor.specialty.toLowerCase().includes(searchTerm)
                );
                this.displayDoctorList(filteredDoctors);
            });
        }
        
        // Add specialty filter
        const specialtyFilter = document.getElementById('specialty-filter');
        if (specialtyFilter) {
            specialtyFilter.addEventListener('change', (e) => {
                const specialty = e.target.value;
                const filteredDoctors = specialty === 'all' ? 
                    this.doctors : 
                    this.doctors.filter(doctor => doctor.specialty === specialty);
                this.displayDoctorList(filteredDoctors);
            });
        }
    }
    
    selectDoctor(doctor) {
        this.selectedDoctor = doctor;
        
        // Update UI to show selection
        document.querySelectorAll('.doctor-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-doctor-id="${doctor.id}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            
            // Add selected styling
            const style = document.createElement('style');
            style.textContent = `
                .doctor-card.selected {
                    border-color: var(--primary-color);
                    background: rgba(37, 99, 235, 0.05);
                }
            `;
            if (!document.head.querySelector('#selected-doctor-styles')) {
                style.id = 'selected-doctor-styles';
                document.head.appendChild(style);
            }
        }
        
        this.updateStepValidation();
        this.showNotification(`Selected ${doctor.name} for consultation`, 'success');
    }
    
    clearDoctorSelection() {
        this.selectedDoctor = null;
        document.querySelectorAll('.doctor-card').forEach(card => {
            card.classList.remove('selected');
        });
        this.updateStepValidation();
    }
    
    
    setupCalendar() {
                experience: 14,
                rating: 4.9,
                reviews: 198,
                fee: 170,
                available: true
            },
            {
                id: 6,
                name: "Dr. James Thompson",
                specialty: "General Surgeon",
                experience: 18,
                rating: 4.8,
                reviews: 267,
                fee: 200,
                available: true
            },
            {
                id: 7,
                name: "Dr. Maria Garcia",
                specialty: "Gynecologist",
                experience: 11,
                rating: 4.7,
                reviews: 178,
                fee: 160,
                available: true
            },
            {
                id: 8,
                name: "Dr. Robert Kim",
                specialty: "Psychiatrist",
                experience: 9,
                rating: 4.6,
                reviews: 134,
                fee: 130,
                available: true
            },
            {
                id: 9,
                name: "Dr. Jennifer Lee",
                specialty: "Ophthalmologist",
                experience: 13,
                rating: 4.8,
                reviews: 201,
                fee: 155,
                available: true
            },
            {
                id: 10,
                name: "Dr. Mark Davis",
                specialty: "Endocrinologist",
                experience: 16,
                rating: 4.9,
                reviews: 223,
                fee: 165,
                available: true
            }
        ];
            this.displayDoctorList(this.doctors);
        } catch (error) {
            console.error('Failed to load doctors:', error);
            this.showError('Failed to load doctors list');
        }
    }
    
    displayDoctorList(doctors) {
        const doctorList = document.getElementById('doctors-container');
        if (!doctorList) {
            console.error('Doctors container not found');
            return;
        }
        
        if (!doctors || doctors.length === 0) {
            doctorList.innerHTML = `
                <div class="no-doctors-message">
                    <div class="no-doctors-icon">
                        <i class="fas fa-user-md"></i>
                    </div>
                    <h3>No Doctors Available</h3>
                    <p>Please try adjusting your search criteria or contact support.</p>
                </div>
            `;
            return;
        }
        
        console.log('Displaying doctors:', doctors.length);
        
        doctorList.innerHTML = doctors.map(doctor => `
            <div class="doctor-card booking-doctor" data-doctor-id="${doctor.id}">
                <div class="doctor-header">
                    <div class="doctor-avatar">
                        ${doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div class="doctor-basic-info">
                        <h4 class="doctor-name">${doctor.name}</h4>
                        <p class="doctor-specialty">${doctor.specialty}</p>
                        <p class="doctor-subspecialty">${doctor.subspecialty || ''}</p>
                        <div class="doctor-status ${doctor.available ? 'available' : 'busy'}">
                            ${doctor.available ? 'Available Today' : 'Busy'}
                        </div>
                    </div>
                </div>
                
                <div class="doctor-details">
                    <div class="doctor-meta-info">
                        <div class="meta-item">
                            <i class="fas fa-graduation-cap"></i>
                            <span>${doctor.experience} years experience</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-hospital"></i>
                            <span>${doctor.hospital || 'Medical Center'}</span>
                        </div>
                    </div>
                    
                    <div class="doctor-rating">
                        <div class="stars">
                            ${this.generateStars(doctor.rating)}
                        </div>
                        <span class="rating-text">${doctor.rating} (${doctor.reviews} reviews)</span>
                    </div>
                    
                    <div class="doctor-specialties">
                        ${doctor.conditions ? doctor.conditions.slice(0, 3).map(condition => 
                            `<span class="specialty-tag">${condition}</span>`
                        ).join('') : ''}
                    </div>
                    
                    <div class="doctor-fee">
                        <span class="fee-label">Consultation Fee:</span>
                        <strong class="fee-amount">$${doctor.fee}</strong>
                    </div>
                    
                    <div class="next-available">
                        <i class="fas fa-clock"></i>
                        <span>Next: ${doctor.nextAvailable || 'Contact clinic'}</span>
                    </div>
                </div>
                
                <div class="doctor-actions">
                    <button class="btn-view-details" onclick="bookingManager.viewDoctorDetails(${doctor.id})">
                        <i class="fas fa-info-circle"></i>
                        View Profile
                    </button>
                    <button class="btn-select-doctor" onclick="bookingManager.selectDoctor(${JSON.stringify(doctor).replace(/"/g, '&quot;')})">
                        <i class="fas fa-calendar-check"></i>
                        Book Appointment
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        doctorList.querySelectorAll('.booking-doctor').forEach(card => {
            card.addEventListener('click', () => {
                const doctorId = parseInt(card.dataset.doctorId);
                const doctor = doctors.find(d => d.id === doctorId);
                if (doctor) {
                    this.selectDoctor(doctor);
                }
            });
        });
        
        // Setup search functionality
        this.setupDoctorSearch();
    }
    
    setupDoctorSearch() {
        const searchInput = document.getElementById('doctorSearchInput');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredDoctors = this.doctors.filter(doctor => 
                doctor.name.toLowerCase().includes(searchTerm) ||
                doctor.specialty.toLowerCase().includes(searchTerm)
            );
            this.displayDoctorList(filteredDoctors);
        });
    }
    
    selectDoctor(doctor) {
        console.log('Selecting doctor:', doctor);
        this.selectedDoctor = doctor;
        
        // Remove any existing selection highlights
        document.querySelectorAll('.doctor-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Highlight selected doctor card
        const selectedCard = document.querySelector(`[data-doctor-id="${doctor.id}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Update UI with selected doctor info
        const selectedDoctorDiv = document.getElementById('selectedDoctor');
        if (selectedDoctorDiv) {
            selectedDoctorDiv.style.display = 'block';
            selectedDoctorDiv.innerHTML = `
                <div class="selected-doctor-info">
                    <div class="doctor-avatar small">
                        ${doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div class="selected-info">
                        <h4>${doctor.name}</h4>
                        <p>${doctor.specialty}</p>
                        <p class="fee-info"><strong>$${doctor.fee}</strong> consultation fee</p>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="bookingManager.clearDoctorSelection()">
                        <i class="fas fa-edit"></i> Change Doctor
                    </button>
                </div>
            `;
        }
        
        // Hide doctor list container
        const doctorsContainer = document.getElementById('doctors-container');
        if (doctorsContainer) {
            doctorsContainer.style.display = 'none';
        }
        
        // Enable next button and update validation
        this.updateStepValidation();
        
        // Show notification
        this.showNotification(`Selected ${doctor.name} - ${doctor.specialty}`, 'success');
    }
    
    clearDoctorSelection() {
        this.selectedDoctor = null;
        
        // Remove selection highlights
        document.querySelectorAll('.doctor-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedDoctorDiv = document.getElementById('selectedDoctor');
        if (selectedDoctorDiv) {
            selectedDoctorDiv.style.display = 'none';
        }
        
        const doctorsContainer = document.getElementById('doctors-container');
        if (doctorsContainer) {
            doctorsContainer.style.display = 'block';
        }
        
        this.updateStepValidation();
    }
    
    setupCalendar() {
        const currentMonth = document.getElementById('current-month');
        const prevMonthBtn = document.getElementById('prev-month');
        const nextMonthBtn = document.getElementById('next-month');
        const calendarGrid = document.getElementById('calendar-grid');
        
        this.currentDate = new Date();
        this.displayedMonth = new Date();
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                this.displayedMonth.setMonth(this.displayedMonth.getMonth() - 1);
                this.renderCalendar();
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                this.displayedMonth.setMonth(this.displayedMonth.getMonth() + 1);
                this.renderCalendar();
            });
        }
        
        this.renderCalendar();
    }
    
    renderCalendar() {
        const currentMonth = document.getElementById('current-month');
        const calendarGrid = document.getElementById('calendar-grid');
        
        if (!currentMonth || !calendarGrid) return;
        
        const year = this.displayedMonth.getFullYear();
        const month = this.displayedMonth.getMonth();
        
        currentMonth.textContent = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(this.displayedMonth);
        
        // Clear calendar
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-header-day';
            header.textContent = day;
            header.style.fontWeight = 'bold';
            header.style.padding = '0.5rem';
            header.style.textAlign = 'center';
            header.style.color = 'var(--text-secondary)';
            calendarGrid.appendChild(header);
        });
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-cell empty';
            calendarGrid.appendChild(emptyCell);
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            cell.textContent = day;
            
            // Check if date is in the past
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (cellDate < today) {
                cell.classList.add('disabled');
            } else {
                cell.addEventListener('click', () => {
                    this.selectDate(cellDate);
                });
            }
            
            // Highlight selected date
            if (this.selectedDate && this.isSameDate(cellDate, this.selectedDate)) {
                cell.classList.add('selected');
            }
            
            calendarGrid.appendChild(cell);
        }
    }
    
    selectDate(date) {
        this.selectedDate = date;
        this.selectedTime = null; // Reset time selection
        
        // Update calendar display
        this.renderCalendar();
        
        // Load time slots for selected date
        this.loadTimeSlots(date);
        
        this.updateStepValidation();
    }
    
    async loadTimeSlots(date) {
        const timeSlotsContainer = document.getElementById('time-slots');
        const selectedDateDisplay = document.getElementById('selected-date-display');
        
        if (!timeSlotsContainer || !this.selectedDoctor) return;
        
        // Update selected date display
        if (selectedDateDisplay) {
            selectedDateDisplay.textContent = date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
        
        try {
            // Load available time slots from the database
            const response = await fetch(`php/appointments-api.php?action=get_available_slots&doctor_id=${this.selectedDoctor.id}&date=${date.toISOString().split('T')[0]}`);
            const result = await response.json();
            
            if (result.success) {
                this.availableSlots = result.slots.map(time => ({
                    time: time,
                    available: true
                }));
            } else {
                console.error('Failed to load time slots:', result.error);
                this.availableSlots = [];
            }
        } catch (error) {
            console.error('Error loading time slots:', error);
            this.availableSlots = [];
        }
        
        this.displayTimeSlots();
    }
    
    displayTimeSlots() {
        const timeSlotsContainer = document.getElementById('time-slots');
        if (!timeSlotsContainer) return;
        
        if (this.availableSlots.length === 0) {
            timeSlotsContainer.innerHTML = `
                <div class="time-placeholder">
                    <i class="fas fa-calendar-times"></i>
                    <p>No available time slots for this date.</p>
                    <p>Please select another date.</p>
                </div>
            `;
            return;
        }
        
        timeSlotsContainer.innerHTML = this.availableSlots.map(slot => `
            <div class="time-slot-modern ${slot.available ? 'available' : 'unavailable'}" 
                 data-time="${slot.time}" 
                 ${slot.available ? '' : 'title="This slot is not available"'}>
                <div class="time-display">${slot.time}</div>
                ${slot.available ? '<div class="slot-status">Available</div>' : '<div class="slot-status">Booked</div>'}
            </div>
        `).join('');
        
        // Add click handlers for available slots
        timeSlotsContainer.querySelectorAll('.time-slot-modern.available').forEach(slot => {
            slot.addEventListener('click', () => {
                this.selectTime(slot.dataset.time);
            });
        });
    }
    
    selectTime(time) {
        this.selectedTime = time;
        
        // Update UI
        document.querySelectorAll('.time-slot-modern').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        document.querySelector(`[data-time="${time}"]`).classList.add('selected');
        
        this.updateStepValidation();
    }
    
    generateTimeSlots(date) {
        const slots = [];
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Define working hours based on day
        const startHour = isWeekend ? 10 : 9; // Later start on weekends
        const endHour = isWeekend ? 16 : 18; // Earlier end on weekends
        const slotDuration = 30; // 30-minute slots
        
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += slotDuration) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayTime = this.formatTime(timeStr);
                
                // Randomly make some slots unavailable (simulate real booking scenario)
                const isAvailable = Math.random() > 0.3; // 70% availability rate
                
                // Don't show past times for today
                const now = new Date();
                const slotDateTime = new Date(date);
                slotDateTime.setHours(hour, minute, 0, 0);
                
                const isPastTime = date.toDateString() === now.toDateString() && slotDateTime <= now;
                
                if (!isPastTime) {
                    slots.push({
                        time: displayTime,
                        value: timeStr,
                        available: isAvailable
                    });
                }
            }
        }
        
        return slots;
    }
    
    nextStep() {
        if (!this.validateCurrentStep()) {
            return;
        }
        
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
            this.updateStepIndicator();
            this.smoothScrollToStep();
            
            if (this.currentStep === 4) {
                this.updateSummary();
            }
        }
    }

    smoothScrollToStep() {
        const currentStepElement = document.querySelector(`.booking-step[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            // Add transition effect
            currentStepElement.style.opacity = '0';
            currentStepElement.style.transform = 'translateX(30px)';
            
            setTimeout(() => {
                currentStepElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
                
                // Animate in the new step
                currentStepElement.style.transition = 'all 0.6s ease-out';
                currentStepElement.style.opacity = '1';
                currentStepElement.style.transform = 'translateX(0)';
                
                // Focus on interactive elements
                const focusElement = currentStepElement.querySelector('input, select, .doctor-card, .time-slot, .btn-primary');
                if (focusElement) {
                    setTimeout(() => {
                        focusElement.focus();
                        if (focusElement.scrollIntoView) {
                            focusElement.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'center' 
                            });
                        }
                    }, 700);
                }
            }, 200);
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.updateStepIndicator();
        }
    }
    
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                if (!this.selectedDoctor) {
                    this.showError('Please select a doctor to continue.');
                    return false;
                }
                break;
                
            case 2:
                if (!this.selectedDate || !this.selectedTime) {
                    this.showError('Please select both date and time to continue.');
                    return false;
                }
                break;
                
            case 3:
                return this.validatePatientForm();
                
            default:
                return true;
        }
        
        return true;
    }
    
    validatePatientForm() {
        const requiredFields = ['patientName', 'patientAge', 'patientGender', 'patientPhone', 'patientEmail'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else if (field) {
                this.clearFieldError(field);
            }
        });
        
        // Validate email
        const emailField = document.getElementById('patientEmail');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                this.showFieldError(emailField, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        // Validate phone
        const phoneField = document.getElementById('patientPhone');
        if (phoneField && phoneField.value) {
            const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
            const cleanPhone = phoneField.value.replace(/\D/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                this.showFieldError(phoneField, 'Please enter a valid phone number');
                isValid = false;
            }
        }
        
        // Validate age
        const ageField = document.getElementById('patientAge');
        if (ageField && ageField.value) {
            const age = parseInt(ageField.value);
            if (age < 1 || age > 120) {
                this.showFieldError(ageField, 'Please enter a valid age');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    updateStepDisplay() {
        // Hide all steps
        for (let i = 1; i <= this.totalSteps; i++) {
            const step = document.getElementById(`step${i}`);
            if (step) {
                step.style.display = 'none';
            }
        }
        
        // Show current step
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
        }
        
        // Update navigation buttons
        this.updateNavigationButtons();
    }
    
    updateStepIndicator() {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active');
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });
    }
    
    updateNavigationButtons() {
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const confirmBtn = document.getElementById('confirmBtn');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        }
        
        if (nextBtn) {
            nextBtn.style.display = this.currentStep < this.totalSteps ? 'block' : 'none';
        }
        
        if (confirmBtn) {
            confirmBtn.style.display = this.currentStep === this.totalSteps ? 'block' : 'none';
        }
    }
    
    updateStepValidation() {
        this.updateNavigationButtons();
    }
    
    updateSummary() {
        document.getElementById('summaryDoctor').textContent = `Dr. ${this.selectedDoctor.name}`;
        document.getElementById('summarySpecialty').textContent = this.selectedDoctor.specialty;
        document.getElementById('summaryDate').textContent = this.selectedDate.toLocaleDateString();
        document.getElementById('summaryTime').textContent = this.selectedTime;
        document.getElementById('summaryPatient').textContent = document.getElementById('patientName').value;
        document.getElementById('summaryFee').textContent = `$${this.selectedDoctor.fee}`;
    }
    
    async confirmBooking() {
        try {
            const bookingData = this.collectBookingData();
            
            // Prepare API request data
            const appointmentData = {
                doctor_id: this.selectedDoctor.id,
                appointment_date: this.selectedDate.toISOString().split('T')[0],
                appointment_time: this.selectedTime,
                patient_name: bookingData.patientName,
                patient_email: bookingData.patientEmail,
                patient_phone: bookingData.patientPhone,
                reason_for_visit: bookingData.symptoms || 'General consultation'
            };
            
            // Call the appointment booking API
            const response = await fetch('php/appointments-api.php?action=book_appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccessMessage(result.booking_reference, result.appointment);
            } else {
                this.showError(result.error || 'Failed to book appointment');
            }
            
        } catch (error) {
            console.error('Error confirming booking:', error);
            this.showError('Failed to confirm booking. Please try again.');
        }
    }
    
    collectBookingData() {
        return {
            doctorId: this.selectedDoctor.id,
            date: this.selectedDate.toISOString().split('T')[0],
            time: this.selectedTime,
            patientName: document.getElementById('patientName').value,
            patientAge: document.getElementById('patientAge').value,
            patientGender: document.getElementById('patientGender').value,
            patientPhone: document.getElementById('patientPhone').value,
            patientEmail: document.getElementById('patientEmail').value,
            symptoms: document.getElementById('symptoms').value,
            medicalHistory: document.getElementById('medicalHistory').value
        };
    }
    
    showSuccessMessage(bookingReference, appointment) {
        const container = document.querySelector('.booking-container');
        container.innerHTML = `
            <div class="booking-success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Appointment Confirmed!</h2>
                <p>Your appointment has been successfully booked and saved to your appointments.</p>
                <div class="booking-details">
                    <p><strong>Booking Reference:</strong> ${bookingReference}</p>
                    <p><strong>Doctor:</strong> Dr. ${this.selectedDoctor.name}</p>
                    <p><strong>Date:</strong> ${this.selectedDate.toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${this.selectedTime}</p>
                    <p><strong>Consultation Fee:</strong> $${appointment.consultation_fee}</p>
                </div>
                <div class="success-actions">
                    <a href="dashboard-patient.html" class="btn btn-primary">View My Appointments</a>
                    <a href="find-doctors.html" class="btn btn-secondary">Book Another</a>
                    <a href="index.html" class="btn btn-outline">Back to Home</a>
                </div>
            </div>
        `;
    }
    
    // Utility methods
    bindEvents() {
        const form = document.getElementById('bookingForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.currentStep === this.totalSteps) {
                    this.confirmBooking();
                } else {
                    this.nextStep();
                }
            });
        }
    }
    
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (halfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
    
    isSameDate(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    viewDoctorDetails(doctorId) {
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (!doctor) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay doctor-details-modal';
        modal.innerHTML = `
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-user-md"></i> Doctor Profile - ${doctor.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="doctor-profile-container">
                        <div class="doctor-profile-header">
                            <div class="doctor-avatar-xl">
                                ${doctor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div class="doctor-profile-info">
                                <h2>${doctor.name}</h2>
                                <p class="doctor-title">${doctor.specialty}</p>
                                <p class="doctor-subtitle">${doctor.subspecialty || ''}</p>
                                <div class="doctor-credentials">
                                    <div class="credential-item">
                                        <i class="fas fa-graduation-cap"></i>
                                        <span>${doctor.education || 'Medical Degree'}</span>
                                    </div>
                                    <div class="credential-item">
                                        <i class="fas fa-hospital"></i>
                                        <span>${doctor.hospital || 'Medical Center'}</span>
                                    </div>
                                    <div class="credential-item">
                                        <i class="fas fa-calendar"></i>
                                        <span>${doctor.experience} years experience</span>
                                    </div>
                                </div>
                            </div>
                            <div class="doctor-profile-stats">
                                <div class="stat-card">
                                    <div class="stat-number">${doctor.rating}</div>
                                    <div class="stat-label">Rating</div>
                                    <div class="stat-stars">${this.generateStars(doctor.rating)}</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">${doctor.reviews}</div>
                                    <div class="stat-label">Reviews</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">$${doctor.fee}</div>
                                    <div class="stat-label">Consultation</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="doctor-profile-content">
                            <div class="profile-section">
                                <h4><i class="fas fa-info-circle"></i> About Dr. ${doctor.name.split(' ').slice(-1)[0]}</h4>
                                <p>${doctor.about || 'Experienced healthcare professional dedicated to providing quality medical care.'}</p>
                            </div>
                            
                            <div class="profile-section">
                                <h4><i class="fas fa-stethoscope"></i> Conditions Treated</h4>
                                <div class="conditions-grid">
                                    ${doctor.conditions ? doctor.conditions.map(condition => 
                                        `<div class="condition-card">
                                            <i class="fas fa-check-circle"></i>
                                            <span>${condition}</span>
                                        </div>`
                                    ).join('') : '<p>General medical conditions</p>'}
                                </div>
                            </div>
                            
                            <div class="profile-section">
                                <h4><i class="fas fa-language"></i> Languages Spoken</h4>
                                <div class="languages-grid">
                                    ${doctor.languages ? doctor.languages.map(lang => 
                                        `<span class="language-badge">${lang}</span>`
                                    ).join('') : '<span class="language-badge">English</span>'}
                                </div>
                            </div>
                            
                            <div class="profile-section">
                                <h4><i class="fas fa-video"></i> Consultation Options</h4>
                                <div class="consultation-options-detailed">
                                    ${doctor.consultationType ? doctor.consultationType.map(type => 
                                        `<div class="consultation-option">
                                            <i class="fas fa-${type === 'Video Call' ? 'video' : 'user-md'}"></i>
                                            <span>${type}</span>
                                        </div>`
                                    ).join('') : '<div class="consultation-option"><i class="fas fa-user-md"></i><span>In-person consultation</span></div>'}
                                </div>
                            </div>
                            
                            <div class="profile-section">
                                <h4><i class="fas fa-clock"></i> Availability</h4>
                                <div class="availability-info">
                                    <div class="next-slot">
                                        <strong>Next Available:</strong> ${doctor.nextAvailable || 'Contact clinic'}
                                    </div>
                                    <p>Book your appointment now to secure your preferred time slot.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Close</button>
                    <button class="btn btn-primary" onclick="bookingManager.selectDoctor(${JSON.stringify(doctor).replace(/"/g, '&quot;')}); this.closest('.modal-overlay').remove();">
                        <i class="fas fa-calendar-plus"></i> Book Appointment
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    showError(message) {
        if (window.HealthCare && window.HealthCare.showNotification) {
            window.HealthCare.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }
    
    showFieldError(field, message) {
        field.style.borderColor = 'var(--error-color)';
        
        // Remove existing error
        const existingError = field.parentNode.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.color = 'var(--error-color)';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '0.25rem';
        
        field.parentNode.parentNode.appendChild(errorElement);
    }
    
    clearFieldError(field) {
        field.style.borderColor = 'var(--border-color)';
        const errorElement = field.parentNode.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    showNotification(message, type = 'info') {
        if (window.HealthCare && window.HealthCare.showNotification) {
            window.HealthCare.showNotification(message, type);
        } else {
            // Create a simple notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            // Style the notification
            Object.assign(notification.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                zIndex: '10000',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateX(100%)',
                transition: 'transform 0.3s ease'
            });
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
    }
    
    formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    }
    
    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
}

// Initialize booking manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.booking-container-modern')) {
        window.bookingManager = new BookingManager();
    }
});
