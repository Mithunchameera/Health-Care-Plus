/**
 * Booking System JavaScript
 * Handles multi-step booking process for eChannelling system
 */

class BookingManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.selectedDoctor = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.currentMonth = new Date();
        this.doctors = [];
        
        this.init();
    }
    
    init() {
        this.loadDoctors();
        this.initializeCalendar();
        this.setupEventListeners();
        this.checkURLParams();
    }
    
    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const doctorId = urlParams.get('doctor');
        
        if (doctorId) {
            // Pre-select doctor if ID is provided in URL
            this.loadDoctorById(doctorId);
        }
    }
    
    async loadDoctorById(doctorId) {
        try {
            const response = await fetch(`php/doctors.php?id=${doctorId}`);
            const data = await response.json();
            
            if (data.success && data.doctor) {
                this.selectDoctor(data.doctor);
            }
        } catch (error) {
            console.error('Error loading doctor:', error);
        }
    }
    
    async loadDoctors() {
        try {
            const response = await fetch('php/doctors.php');
            const data = await response.json();
            
            if (data.success && data.doctors) {
                this.doctors = data.doctors;
                this.renderDoctors(this.doctors);
            } else if (Array.isArray(data)) {
                // Handle legacy format
                this.doctors = data;
                this.renderDoctors(this.doctors);
            } else {
                console.error('Error loading doctors:', data);
                this.showError('Failed to load doctors. Please try again.');
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
            this.showError('Failed to load doctors. Please try again.');
        }
    }
    
    renderDoctors(doctors) {
        const doctorsGrid = document.getElementById('doctors-grid');
        
        if (!doctorsGrid) {
            console.error('Doctor grid element not found');
            return;
        }

        if (!doctors || doctors.length === 0) {
            doctorsGrid.innerHTML = '<p class="no-doctors">No doctors available at the moment.</p>';
            return;
        }
        
        console.log('Rendering', doctors.length, 'doctors to grid');
        console.log('First doctor:', doctors[0]);
        
        try {
            const doctorCards = doctors.map((doctor, index) => {
                const safeName = (doctor.name || 'Unknown Doctor').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
                const safeSpecialty = (doctor.specialty || 'General Medicine').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
                const rating = parseFloat(doctor.rating) || 4.5;
                const reviews = parseInt(doctor.reviews) || 0;
                const experience = parseInt(doctor.experience) || 10;
                const fee = parseFloat(doctor.fee) || 200;
                const available = doctor.available !== false;
                const doctorId = doctor.id || index + 1;
                
                return `
                    <div class="doctor-card" data-doctor-id="${doctorId}" onclick="bookingManager.selectDoctorById(${doctorId})">
                        <div class="doctor-image">
                            <img src="images/doctor-placeholder.svg" alt="${safeName}">
                            <div class="availability-badge ${available ? 'available' : 'unavailable'}">
                                ${available ? 'Available' : 'Unavailable'}
                            </div>
                        </div>
                        <div class="doctor-info">
                            <h3>${safeName}</h3>
                            <p class="specialty">${safeSpecialty}</p>
                            <div class="rating">
                                ${this.generateStars(rating)}
                                <span class="rating-text">${rating} (${reviews} reviews)</span>
                            </div>
                            <div class="doctor-details">
                                <p class="experience">${experience} years experience</p>
                                <p class="fee">Rs. ${fee}</p>
                            </div>
                            <button class="btn-select-doctor" onclick="event.stopPropagation(); bookingManager.selectDoctorById(${doctorId})">
                                Select Doctor
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Store doctors data for later access
            this.doctorsData = {};
            doctors.forEach((doctor, index) => {
                this.doctorsData[doctor.id || index + 1] = doctor;
            });
            
            doctorsGrid.innerHTML = doctorCards;
            console.log('Doctor cards HTML generated, length:', doctorCards.length);
            console.log('Grid innerHTML set');
            
        } catch (error) {
            console.error('Error rendering doctors:', error);
            doctorsGrid.innerHTML = '<p class="error">Error loading doctors. Please refresh the page.</p>';
        }
    }
    
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt star"></i>';
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star star"></i>';
        }
        
        return stars;
    }
    
    selectDoctorById(doctorId) {
        const doctor = this.doctorsData[doctorId];
        if (!doctor) {
            console.error('Doctor not found:', doctorId);
            return;
        }
        
        this.selectDoctor(doctor);
    }
    
    selectDoctor(doctor) {
        this.selectedDoctor = doctor;
        
        // Update selected doctor display
        document.getElementById('selected-doctor-name').textContent = doctor.name;
        document.getElementById('selected-doctor-specialty').textContent = doctor.specialty;
        document.getElementById('selected-doctor-fee').textContent = `Fee: $${doctor.fee}`;
        document.getElementById('selected-doctor-rating').textContent = doctor.rating;
        document.getElementById('selected-doctor-stars').innerHTML = this.generateStars(doctor.rating);
        
        // Show selected doctor section and hide search
        document.getElementById('selected-doctor').style.display = 'block';
        document.getElementById('doctor-search').style.display = 'none';
        
        // Enable next button
        document.getElementById('step1-next').disabled = false;
        
        // Update summary
        this.updateSummary();
    }
    
    showDoctorSearch() {
        document.getElementById('selected-doctor').style.display = 'none';
        document.getElementById('doctor-search').style.display = 'block';
        document.getElementById('step1-next').disabled = true;
    }
    
    filterDoctors() {
        const searchInput = document.getElementById('doctor-search-input').value.toLowerCase();
        const specialtyFilter = document.getElementById('specialty-filter').value;
        
        let filteredDoctors = this.doctors.filter(doctor => {
            const matchesSearch = doctor.name.toLowerCase().includes(searchInput) || 
                                doctor.specialty.toLowerCase().includes(searchInput);
            const matchesSpecialty = !specialtyFilter || doctor.specialty === specialtyFilter;
            
            return matchesSearch && matchesSpecialty;
        });
        
        this.renderDoctors(filteredDoctors);
    }
    
    initializeCalendar() {
        this.updateCalendar();
    }
    
    updateCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        // Update month header
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
        
        // Generate calendar grid
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const calendarGrid = document.getElementById('calendar-grid');
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            dayHeader.style.fontWeight = '600';
            dayHeader.style.background = '#f1f5f9';
            dayHeader.style.color = '#64748b';
            calendarGrid.appendChild(dayHeader);
        });
        
        // Add calendar days
        const today = new Date();
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = currentDate.getDate();
            
            // Add classes for styling
            if (currentDate.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            if (currentDate < today) {
                dayElement.classList.add('disabled');
            } else {
                dayElement.addEventListener('click', () => this.selectDate(currentDate));
            }
            
            if (this.selectedDate && 
                currentDate.toDateString() === this.selectedDate.toDateString()) {
                dayElement.classList.add('selected');
            }
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    selectDate(date) {
        this.selectedDate = date;
        this.updateCalendar();
        this.loadTimeSlots();
        this.updateSummary();
    }
    
    loadTimeSlots() {
        const timeSlotsContainer = document.getElementById('time-slots');
        
        if (!this.selectedDate) {
            timeSlotsContainer.innerHTML = '<p class="no-date-selected">Please select a date first</p>';
            return;
        }
        
        // Generate time slots (9 AM to 5 PM)
        const timeSlots = [];
        for (let hour = 9; hour < 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                timeSlots.push(time);
            }
        }
        
        timeSlotsContainer.innerHTML = timeSlots.map(time => {
            const isAvailable = Math.random() > 0.3; // Random availability for demo
            return `
                <div class="time-slot ${isAvailable ? '' : 'unavailable'}" 
                     onclick="${isAvailable ? `bookingManager.selectTime('${time}')` : ''}">
                    ${time}
                </div>
            `;
        }).join('');
    }
    
    selectTime(time) {
        this.selectedTime = time;
        
        // Update UI
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        event.target.classList.add('selected');
        
        // Enable next button
        document.getElementById('step2-next').disabled = false;
        
        this.updateSummary();
    }
    
    prevMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
        this.updateCalendar();
    }
    
    nextMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
        this.updateCalendar();
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            // Validate current step
            if (!this.validateStep(this.currentStep)) {
                return;
            }
            
            this.currentStep++;
            this.updateStepDisplay();
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }
    
    validateStep(step) {
        switch (step) {
            case 1:
                if (!this.selectedDoctor) {
                    this.showError('Please select a doctor');
                    return false;
                }
                break;
            case 2:
                if (!this.selectedDate) {
                    this.showError('Please select a date');
                    return false;
                }
                if (!this.selectedTime) {
                    this.showError('Please select a time');
                    return false;
                }
                break;
            case 3:
                const form = document.getElementById('patient-form');
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return false;
                }
                break;
        }
        return true;
    }
    
    updateStepDisplay() {
        // Update progress steps
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 < this.currentStep) {
                step.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });
        
        // Update form steps
        document.querySelectorAll('.form-step').forEach((step, index) => {
            step.classList.remove('active');
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });
        
        // Update summary if on last step
        if (this.currentStep === 4) {
            this.updateSummary();
        }
    }
    
    updateSummary() {
        if (this.selectedDoctor) {
            document.getElementById('summary-doctor').textContent = this.selectedDoctor.name;
            document.getElementById('summary-specialty').textContent = this.selectedDoctor.specialty;
            document.getElementById('summary-fee').textContent = `$${this.selectedDoctor.fee}`;
        }
        
        if (this.selectedDate) {
            document.getElementById('summary-date').textContent = this.selectedDate.toLocaleDateString();
        }
        
        if (this.selectedTime) {
            document.getElementById('summary-time').textContent = this.selectedTime;
        }
        
        // Update patient info if on payment step
        if (this.currentStep === 4) {
            const patientName = document.getElementById('patient-name').value;
            if (patientName) {
                document.getElementById('summary-patient').textContent = patientName;
            }
        }
    }
    
    confirmBooking() {
        // Validate terms checkbox
        const termsCheckbox = document.getElementById('terms-checkbox');
        if (!termsCheckbox.checked) {
            this.showError('Please accept the terms and conditions');
            return;
        }
        
        // Generate booking reference
        const bookingRef = 'HCP' + Date.now().toString().slice(-6);
        document.getElementById('booking-reference').textContent = bookingRef;
        
        // Show confirmation modal
        const modal = document.getElementById('confirmation-modal');
        modal.classList.add('show');
        
        // Store booking data (in real app, this would be sent to server)
        const bookingData = {
            reference: bookingRef,
            doctor: this.selectedDoctor,
            date: this.selectedDate,
            time: this.selectedTime,
            patient: {
                name: document.getElementById('patient-name').value,
                email: document.getElementById('patient-email').value,
                phone: document.getElementById('patient-phone').value,
                age: document.getElementById('patient-age').value,
                gender: document.getElementById('patient-gender').value,
                reason: document.getElementById('reason-visit').value,
                history: document.getElementById('medical-history').value
            },
            paymentMethod: document.querySelector('input[name="payment-method"]:checked').value
        };
        
        console.log('Booking confirmed:', bookingData);
    }
    
    closeModal() {
        const modal = document.getElementById('confirmation-modal');
        modal.classList.remove('show');
    }
    
    goToDashboard() {
        window.location.href = 'patient-dashboard.html';
    }
    
    setupEventListeners() {
        // Search and filter
        document.getElementById('doctor-search-input').addEventListener('input', () => this.filterDoctors());
        document.getElementById('specialty-filter').addEventListener('change', () => this.filterDoctors());
        
        // Form validation
        const patientForm = document.getElementById('patient-form');
        if (patientForm) {
            patientForm.addEventListener('input', () => {
                const isValid = patientForm.checkValidity();
                document.getElementById('step3-next').disabled = !isValid;
            });
        }
        
        // Close modal on outside click
        document.getElementById('confirmation-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });
    }
    
    showError(message) {
        // Create and show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
}

// Global functions for HTML onclick events
function nextStep() {
    bookingManager.nextStep();
}

function prevStep() {
    bookingManager.prevStep();
}

function prevMonth() {
    bookingManager.prevMonth();
}

function nextMonth() {
    bookingManager.nextMonth();
}

function confirmBooking() {
    bookingManager.confirmBooking();
}

function closeModal() {
    bookingManager.closeModal();
}

function goToDashboard() {
    bookingManager.goToDashboard();
}

function showDoctorSearch() {
    bookingManager.showDoctorSearch();
}

function showTerms() {
    alert('Terms and Conditions would be displayed here.');
}

function showPrivacy() {
    alert('Privacy Policy would be displayed here.');
}

// Initialize booking manager when page loads
let bookingManager;
document.addEventListener('DOMContentLoaded', function() {
    bookingManager = new BookingManager();
});