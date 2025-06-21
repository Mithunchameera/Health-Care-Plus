// Booking System JavaScript for HealthCare+ Website
// Handles multi-step appointment booking process with database integration

class BookingManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.selectedDoctor = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.availableSlots = [];
        this.doctors = [];
        this.displayedMonth = new Date();
        
        this.init();
    }
    
    async init() {
        this.setupStepNavigation();
        await this.loadDoctors();
        this.setupCalendar();
        this.setupDoctorSearch();
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
            
            // Find from loaded doctors array
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
            
            if (result.success && result.doctors) {
                this.doctors = result.doctors;
                console.log('Loaded doctors successfully:', this.doctors.length);
            } else {
                console.error('Failed to load doctors:', result.error);
                // Use comprehensive fallback data
                this.doctors = [
                    {
                        id: 1,
                        name: "Dr. Sarah Johnson",
                        specialty: "Cardiology",
                        experience: 15,
                        rating: 4.9,
                        reviews: 234,
                        consultation_fee: 250,
                        bio: "Dr. Johnson specializes in advanced cardiac procedures with over 15 years of experience.",
                        languages: ["English", "Spanish"],
                        hospital: "City General Hospital",
                        location: "Downtown",
                        nextAvailable: "Today 2:00 PM"
                    },
                    {
                        id: 2,
                        name: "Dr. Michael Chen",
                        specialty: "Orthopedic Surgery",
                        experience: 12,
                        rating: 4.8,
                        reviews: 189,
                        consultation_fee: 280,
                        bio: "Dr. Chen focuses on sports-related injuries and advanced orthopedic procedures.",
                        languages: ["English", "Mandarin"],
                        hospital: "Sports Medicine Center",
                        location: "Uptown",
                        nextAvailable: "Tomorrow 9:00 AM"
                    },
                    {
                        id: 3,
                        name: "Dr. Emily Rodriguez",
                        specialty: "Pediatrics",
                        experience: 8,
                        rating: 4.7,
                        reviews: 156,
                        consultation_fee: 180,
                        bio: "Dr. Rodriguez specializes in child development and comprehensive pediatric care.",
                        languages: ["English", "Spanish"],
                        hospital: "Children's Medical Center",
                        location: "Westside",
                        nextAvailable: "Today 4:00 PM"
                    }
                ];
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
            // Use mock data as fallback
            this.doctors = [
                {
                    id: 1,
                    name: "Dr. Sarah Johnson",
                    specialty: "Cardiology",
                    experience: 15,
                    rating: 4.9,
                    reviews: 234,
                    consultation_fee: 250,
                    bio: "Dr. Johnson specializes in advanced cardiac procedures with over 15 years of experience.",
                    languages: ["English", "Spanish"],
                    hospital: "City General Hospital",
                    location: "Downtown",
                    nextAvailable: "Today 2:00 PM"
                }
            ];
        }
        
        // Display the list immediately
        this.displayDoctorList(this.doctors);
    }
    
    displayDoctorList(doctors) {
        const doctorList = document.getElementById('doctor-list');
        
        if (!doctorList) {
            console.error('Doctor list container not found!');
            return;
        }
        
        if (!doctors || doctors.length === 0) {
            doctorList.innerHTML = `
                <div class="no-doctors" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-user-md" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No doctors available at this time.</p>
                </div>
            `;
            return;
        }
        
        // Add comprehensive doctor data for booking
        const enhancedDoctors = doctors.map(doctor => ({
            ...doctor,
            name: doctor.name || `Dr. ${doctor.first_name} ${doctor.last_name}`,
            specialty: doctor.specialty || 'General Medicine',
            experience: doctor.experience || 10,
            rating: doctor.rating || 4.5,
            reviews: doctor.reviews || 50,
            fee: doctor.consultation_fee || doctor.fee || 150,
            bio: doctor.bio || `Dr. ${doctor.name} is an experienced physician specializing in ${doctor.specialty}.`,
            languages: doctor.languages || ['English'],
            hospital: doctor.hospital || 'HealthCare+ Medical Center',
            location: doctor.location || 'Main Campus',
            nextAvailable: doctor.nextAvailable || 'Today 2:00 PM'
        }));
        
        doctorList.innerHTML = enhancedDoctors.map(doctor => `
            <div class="doctor-card" data-doctor-id="${doctor.id}">
                <div class="doctor-info">
                    <div class="doctor-header">
                        <div class="doctor-avatar">
                            ${doctor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div class="doctor-details-header">
                            <h3>${doctor.name}</h3>
                            <span class="specialty">${doctor.specialty}</span>
                            <div class="rating">
                                ${this.generateStars(doctor.rating)}
                                <span class="rating-text">${doctor.rating} (${doctor.reviews} reviews)</span>
                            </div>
                        </div>
                    </div>
                    <div class="doctor-details">
                        <div class="detail-row">
                            <i class="fas fa-graduation-cap"></i>
                            <span>${doctor.experience} years experience</span>
                        </div>
                        <div class="detail-row">
                            <i class="fas fa-hospital"></i>
                            <span>${doctor.hospital}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${doctor.location}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fas fa-dollar-sign"></i>
                            <span>$${doctor.fee} consultation fee</span>
                        </div>
                        <div class="detail-row">
                            <i class="fas fa-clock"></i>
                            <span>Next: ${doctor.nextAvailable}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fas fa-language"></i>
                            <span>${doctor.languages.join(', ')}</span>
                        </div>
                    </div>
                    <div class="doctor-bio">
                        <p>${doctor.bio}</p>
                    </div>
                    <div class="doctor-actions">
                        <button class="btn btn-primary select-doctor-btn" 
                                data-doctor-id="${doctor.id}">
                            <i class="fas fa-check"></i>
                            Select Doctor
                        </button>
                        <button class="btn btn-outline view-profile-btn" 
                                data-doctor-id="${doctor.id}">
                            <i class="fas fa-eye"></i>
                            View Profile
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.addDoctorCardStyles();
        this.setupDoctorEventListeners();
    }
    
    setupDoctorEventListeners() {
        // Add event listeners for select doctor buttons
        document.querySelectorAll('.select-doctor-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const doctorId = parseInt(e.target.getAttribute('data-doctor-id'));
                const doctor = this.doctors.find(d => d.id === doctorId);
                if (doctor) {
                    this.selectDoctor(doctor);
                }
            });
        });

        // Add event listeners for view profile buttons
        document.querySelectorAll('.view-profile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const doctorId = parseInt(e.target.getAttribute('data-doctor-id'));
                this.viewDoctorDetails(doctorId);
            });
        });
    }

    addDoctorCardStyles() {
        if (document.head.querySelector('#doctor-card-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'doctor-card-styles';
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
            .doctor-card.selected {
                border-color: var(--primary-color);
                background: rgba(37, 99, 235, 0.05);
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
        document.head.appendChild(style);
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
        const prevMonthBtn = document.getElementById('prev-month');
        const nextMonthBtn = document.getElementById('next-month');
        
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
            // Load available time slots from the patient API
            const response = await fetch(`php/patient-api.php?action=get_available_slots&doctor_id=${this.selectedDoctor.id}&date=${date.toISOString().split('T')[0]}`);
            const result = await response.json();
            
            if (result.success && result.slots) {
                this.availableSlots = result.slots.map(time => ({
                    time: time,
                    available: true
                }));
            } else {
                console.error('Failed to load time slots:', result.error);
                // Generate default time slots as fallback
                this.availableSlots = [
                    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
                ].map(time => ({
                    time: time,
                    available: true
                }));
            }
        } catch (error) {
            console.error('Error loading time slots:', error);
            // Generate default time slots as fallback
            this.availableSlots = [
                '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
            ].map(time => ({
                time: time,
                available: true
            }));
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
        
        // Update UI to show selection
        document.querySelectorAll('.time-slot-modern').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        const selectedSlot = document.querySelector(`[data-time="${time}"]`);
        if (selectedSlot) {
            selectedSlot.classList.add('selected');
        }
        
        this.updateStepValidation();
        this.showNotification(`Selected time: ${time}`, 'success');
    }
    
    nextStep() {
        if (!this.validateCurrentStep()) return;
        
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
            this.updateStepIndicator();
            this.updateNavigationButtons();
            
            if (this.currentStep === 4) {
                this.updateSummary();
            }
            
            // Smooth scroll to the current step
            setTimeout(() => {
                this.smoothScrollToStep();
            }, 200);
        }
    }
    
    smoothScrollToStep() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        if (currentStepElement) {
            currentStepElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.updateStepIndicator();
            this.updateNavigationButtons();
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
            if (cleanPhone.length < 10) {
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
        
        this.updateNavigationButtons();
    }
    
    updateStepIndicator() {
        for (let i = 1; i <= this.totalSteps; i++) {
            const indicator = document.querySelector(`.step-indicator[data-step="${i}"]`);
            if (indicator) {
                indicator.classList.toggle('active', i === this.currentStep);
                indicator.classList.toggle('completed', i < this.currentStep);
            }
        }
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const confirmBtn = document.getElementById('confirmBtn');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'inline-block' : 'none';
        }
        
        if (nextBtn) {
            nextBtn.style.display = this.currentStep < this.totalSteps ? 'inline-block' : 'none';
        }
        
        if (confirmBtn) {
            confirmBtn.style.display = this.currentStep === this.totalSteps ? 'inline-block' : 'none';
        }
    }
    
    updateStepValidation() {
        const nextBtn = document.getElementById('nextBtn');
        if (!nextBtn) return;
        
        let isValid = false;
        
        switch (this.currentStep) {
            case 1:
                isValid = !!this.selectedDoctor;
                break;
            case 2:
                isValid = !!(this.selectedDate && this.selectedTime);
                break;
            case 3:
                isValid = this.validatePatientForm();
                break;
            default:
                isValid = true;
        }
        
        nextBtn.disabled = !isValid;
        nextBtn.classList.toggle('disabled', !isValid);
    }
    
    updateSummary() {
        if (!this.selectedDoctor || !this.selectedDate || !this.selectedTime) return;
        
        const summaryContent = document.getElementById('summary-content');
        if (!summaryContent) return;
        
        const bookingData = this.collectBookingData();
        
        summaryContent.innerHTML = `
            <div class="summary-section">
                <h4>Doctor Information</h4>
                <p><strong>Doctor:</strong> ${this.selectedDoctor.name}</p>
                <p><strong>Specialty:</strong> ${this.selectedDoctor.specialty}</p>
                <p><strong>Consultation Fee:</strong> $${this.selectedDoctor.fee}</p>
            </div>
            <div class="summary-section">
                <h4>Appointment Details</h4>
                <p><strong>Date:</strong> ${this.selectedDate.toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${this.selectedTime}</p>
            </div>
            <div class="summary-section">
                <h4>Patient Information</h4>
                <p><strong>Name:</strong> ${bookingData.patientName}</p>
                <p><strong>Age:</strong> ${bookingData.patientAge}</p>
                <p><strong>Gender:</strong> ${bookingData.patientGender}</p>
                <p><strong>Phone:</strong> ${bookingData.patientPhone}</p>
                <p><strong>Email:</strong> ${bookingData.patientEmail}</p>
            </div>
        `;
    }
    
    async confirmBooking() {
        const confirmBtn = document.getElementById('confirmBtn');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Booking...';
        }
        
        try {
            const bookingData = this.collectBookingData();
            
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
            const response = await fetch('php/patient-api.php?action=book_appointment', {
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
        } finally {
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Confirm Booking';
            }
        }
    }
    
    collectBookingData() {
        return {
            doctorId: this.selectedDoctor.id,
            date: this.selectedDate.toISOString().split('T')[0],
            time: this.selectedTime,
            patientName: document.getElementById('patientName')?.value || '',
            patientAge: document.getElementById('patientAge')?.value || '',
            patientGender: document.getElementById('patientGender')?.value || '',
            patientPhone: document.getElementById('patientPhone')?.value || '',
            patientEmail: document.getElementById('patientEmail')?.value || '',
            symptoms: document.getElementById('symptoms')?.value || '',
            medicalHistory: document.getElementById('medicalHistory')?.value || ''
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
                    <p><strong>Doctor:</strong> ${this.selectedDoctor.name}</p>
                    <p><strong>Date:</strong> ${this.selectedDate.toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${this.selectedTime}</p>
                    <p><strong>Consultation Fee:</strong> $${appointment.consultation_fee}</p>
                </div>
                <div class="success-actions">
                    <a href="dashboard-patient.html" class="btn btn-primary">View My Appointments</a>
                    <a href="booking.html" class="btn btn-secondary">Book Another</a>
                    <a href="index.html" class="btn btn-outline">Back to Home</a>
                </div>
            </div>
        `;
    }
    
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
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    viewDoctorDetails(doctorId) {
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (!doctor) return;
        
        // Create and show doctor details modal
        const modal = document.createElement('div');
        modal.className = 'doctor-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${doctor.name}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="doctor-specialty">${doctor.specialty}</div>
                    <div class="doctor-rating">
                        ${this.generateStars(doctor.rating)} ${doctor.rating} (${doctor.reviews} reviews)
                    </div>
                    <div class="doctor-experience">${doctor.experience} years of experience</div>
                    <div class="consultation-fee">Consultation Fee: $${doctor.fee}</div>
                    ${doctor.bio ? `<div class="doctor-bio">${doctor.bio}</div>` : ''}
                    ${doctor.languages ? `<div class="languages">Languages: ${doctor.languages.join(', ')}</div>` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="bookingManager.selectDoctor(${JSON.stringify(doctor).replace(/"/g, '&quot;')}); this.closest('.doctor-details-modal').remove();">Select This Doctor</button>
                    <button class="btn btn-secondary close-modal">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add modal styles and event listeners
        this.addModalStyles();
        this.setupModalEvents(modal);
    }
    
    addModalStyles() {
        if (document.head.querySelector('#modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .doctor-details-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .modal-content {
                background: var(--card-bg);
                border-radius: 12px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            .close-modal {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--text-secondary);
            }
            .modal-footer {
                display: flex;
                gap: 1rem;
                margin-top: 1.5rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupModalEvents(modal) {
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = '#ef4444';
    }
    
    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        field.style.borderColor = '';
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            info: '#3b82f6',
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    formatTime(timeStr) {
        if (!timeStr) return '';
        
        try {
            const [hours, minutes] = timeStr.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch (error) {
            return timeStr;
        }
    }
}

// Initialize the booking manager when the page loads
let bookingManager;
document.addEventListener('DOMContentLoaded', () => {
    bookingManager = new BookingManager();
});