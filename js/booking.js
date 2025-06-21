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
    
    init() {
        this.setupStepNavigation();
        this.loadDoctors();
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
            const response = await fetch(`php/doctors.php?id=${doctorId}`);
            const data = await response.json();
            
            if (!data.error && data.id) {
                this.selectDoctor(data);
                this.nextStep();
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
        // Load all 10 doctors for appointment booking
        this.doctors = [
            {
                id: 1,
                name: "Dr. Sarah Johnson",
                specialty: "Cardiologist",
                experience: 15,
                rating: 4.9,
                reviews: 234,
                fee: 150,
                available: true
            },
            {
                id: 2,
                name: "Dr. Michael Chen",
                specialty: "Orthopedic Surgeon",
                experience: 12,
                rating: 4.8,
                reviews: 189,
                fee: 180,
                available: true
            },
            {
                id: 3,
                name: "Dr. Emily Rodriguez",
                specialty: "Pediatrician",
                experience: 8,
                rating: 4.7,
                reviews: 156,
                fee: 120,
                available: true
            },
            {
                id: 4,
                name: "Dr. David Wilson",
                specialty: "Dermatologist",
                experience: 10,
                rating: 4.6,
                reviews: 142,
                fee: 140,
                available: true
            },
            {
                id: 5,
                name: "Dr. Lisa Anderson",
                specialty: "Neurologist",
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
    }
    
    displayDoctorList(doctors) {
        const doctorList = document.getElementById('doctors-container');
        if (!doctorList) return;
        
        doctorList.innerHTML = doctors.map(doctor => `
            <div class="doctor-card booking-doctor" data-doctor-id="${doctor.id}">
                <div class="doctor-header">
                    <div class="doctor-avatar">
                        <i class="fas fa-user-md"></i>
                    </div>
                    <div class="doctor-basic-info">
                        <h4 class="doctor-name">${doctor.name}</h4>
                        <p class="doctor-specialty">${doctor.specialty}</p>
                        <div class="doctor-status ${doctor.available ? 'available' : 'busy'}">
                            ${doctor.available ? 'Available' : 'Busy'}
                        </div>
                    </div>
                </div>
                
                <div class="doctor-details">
                    <p class="doctor-experience">${doctor.experience} years experience</p>
                    
                    <div class="doctor-rating">
                        <div class="stars">
                            ${this.generateStars(doctor.rating)}
                        </div>
                        <span class="rating-text">${doctor.rating} (${doctor.reviews} reviews)</span>
                    </div>
                    
                    <div class="doctor-fee">
                        <strong>$${doctor.fee}</strong> consultation fee
                    </div>
                </div>
                
                <button class="select-doctor-btn" data-doctor-id="${doctor.id}">
                    Select Doctor
                </button>
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
        this.selectedDoctor = doctor;
        
        // Update UI
        const selectedDoctorDiv = document.getElementById('selectedDoctor');
        if (selectedDoctorDiv) {
            selectedDoctorDiv.style.display = 'block';
            selectedDoctorDiv.innerHTML = `
                <div class="selected-doctor-info">
                    <div class="doctor-avatar small">
                        <i class="fas fa-user-md"></i>
                    </div>
                    <div>
                        <h4>Dr. ${doctor.name}</h4>
                        <p>${doctor.specialty}</p>
                        <p><strong>$${doctor.fee}</strong> consultation fee</p>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="bookingManager.clearDoctorSelection()">
                        Change Doctor
                    </button>
                </div>
            `;
        }
        
        // Hide doctor list
        const doctorList = document.getElementById('doctorList');
        if (doctorList) {
            doctorList.style.display = 'none';
        }
        
        // Enable next button
        this.updateStepValidation();
    }
    
    clearDoctorSelection() {
        this.selectedDoctor = null;
        
        const selectedDoctorDiv = document.getElementById('selectedDoctor');
        if (selectedDoctorDiv) {
            selectedDoctorDiv.style.display = 'none';
        }
        
        const doctorList = document.getElementById('doctorList');
        if (doctorList) {
            doctorList.style.display = 'block';
        }
        
        this.updateStepValidation();
    }
    
    setupCalendar() {
        const currentMonth = document.getElementById('currentMonth');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        const calendarGrid = document.getElementById('calendarGrid');
        
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
        const currentMonth = document.getElementById('currentMonth');
        const calendarGrid = document.getElementById('calendarGrid');
        
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
        const timeSlotsContainer = document.getElementById('timeSlots');
        if (!timeSlotsContainer || !this.selectedDoctor) return;
        
        try {
            const dateStr = date.toISOString().split('T')[0];
            const response = await fetch(`php/booking-handler.php?action=getSlots&doctor=${this.selectedDoctor.id}&date=${dateStr}`);
            const data = await response.json();
            
            if (data.error) {
                this.showError('Failed to load time slots: ' + data.error);
                return;
            }
            
            this.availableSlots = data.slots || [];
            this.displayTimeSlots();
            
        } catch (error) {
            console.error('Error loading time slots:', error);
            this.showError('Failed to load available time slots.');
        }
    }
    
    displayTimeSlots() {
        const timeSlotsContainer = document.getElementById('timeSlots');
        if (!timeSlotsContainer) return;
        
        if (this.availableSlots.length === 0) {
            timeSlotsContainer.innerHTML = `
                <div class="no-slots">
                    <i class="fas fa-calendar-times"></i>
                    <p>No available time slots for this date.</p>
                    <p>Please select another date.</p>
                </div>
            `;
            return;
        }
        
        timeSlotsContainer.innerHTML = this.availableSlots.map(slot => `
            <div class="time-slot ${slot.available ? '' : 'unavailable'}" 
                 data-time="${slot.time}" 
                 ${slot.available ? '' : 'title="This slot is not available"'}>
                ${slot.time}
            </div>
        `).join('');
        
        // Add click handlers for available slots
        timeSlotsContainer.querySelectorAll('.time-slot:not(.unavailable)').forEach(slot => {
            slot.addEventListener('click', () => {
                this.selectTime(slot.dataset.time);
            });
        });
    }
    
    selectTime(time) {
        this.selectedTime = time;
        
        // Update UI
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        document.querySelector(`[data-time="${time}"]`).classList.add('selected');
        
        this.updateStepValidation();
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
                    <a href="booking.html" class="btn btn-secondary">Book Another</a>
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
}

// Initialize booking manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.booking-section')) {
        window.bookingManager = new BookingManager();
    }
});
