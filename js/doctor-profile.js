/**
 * Doctor Profile Page JavaScript
 * Handles individual doctor profile display and interactions
 */

class DoctorProfile {
    constructor() {
        this.doctorId = null;
        this.doctorData = null;
        this.currentTab = 'overview';
    }

    async init() {
        try {
            // Get doctor ID from URL parameters
            this.doctorId = this.getDoctorIdFromURL();
            
            if (!this.doctorId) {
                this.showError('Doctor ID not found in URL');
                return;
            }

            // Load doctor data
            await this.loadDoctorData();
            
            // Populate profile information
            this.populateProfile();
            
            // Load additional content
            await this.loadRelatedDoctors();
            
            console.log('Doctor profile initialized successfully');
        } catch (error) {
            console.error('Error initializing doctor profile:', error);
            this.showError('Failed to load doctor profile');
        }
    }

    getDoctorIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadDoctorData() {
        try {
            const response = await fetch(`php/doctor-api.php?id=${this.doctorId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch doctor data');
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (!data.success || !data.doctor) {
                throw new Error('Invalid doctor data received');
            }
            
            this.doctorData = data.doctor;
            console.log('Doctor data loaded:', this.doctorData);
        } catch (error) {
            console.error('Error loading doctor data:', error);
            throw error;
        }
    }

    populateProfile() {
        if (!this.doctorData) {
            console.error('No doctor data available for profile population');
            return;
        }

        const doctor = this.doctorData;
        console.log('Populating profile with doctor data:', doctor);

        // Update page title
        document.title = `Dr. ${doctor.name} - ${doctor.specialty} - eChannelling`;

        // Populate header information
        this.updateElement('doctor-name-breadcrumb', doctor.name);
        this.updateElement('doctor-name', `Dr. ${doctor.name}`);
        this.updateElement('doctor-name-about', doctor.name);
        this.updateElement('doctor-specialty', doctor.specialty);
        this.updateElement('doctor-experience', `${doctor.experience_years || doctor.experience} years experience`);
        this.updateElement('doctor-location', doctor.location);
        this.updateElement('doctor-fee', doctor.consultation_fee || doctor.fee || '0');
        this.updateElement('doctor-phone', doctor.phone);
        this.updateElement('doctor-email', doctor.email);
        this.updateElement('doctor-bio', doctor.bio || doctor.about || 'Professional medical practitioner dedicated to providing excellent healthcare services.');

        // Update rating and reviews
        this.updateRating(doctor.rating, doctor.total_reviews || doctor.reviews);
        
        // Update availability
        this.updateAvailability(doctor.is_available || doctor.available);

        // Populate quick info
        this.updateElement('license-number', doctor.license_number || 'Licensed Practitioner');
        this.updateElement('experience-years', doctor.experience_years || doctor.experience);
        this.updateElement('patients-treated', doctor.patients_treated || (doctor.total_reviews || doctor.reviews) * 10);
        this.updateElement('doctor-education', doctor.education || 'Medical Degree');

        // Populate specializations
        const subspecialties = doctor.subspecialties ? doctor.subspecialties.split(', ') : (doctor.subspecialities || doctor.certifications || []);
        this.populateSpecializations(subspecialties);
        
        // Populate languages
        this.populateLanguages(doctor.languages || ['English']);

        // Populate other tabs
        this.populateExperienceTab(doctor);
        this.populateServicesTab(doctor.services || doctor.certifications || []);
        this.populateScheduleTab();
        this.populateReviewsTab(doctor);

        // Update related specialty reference
        this.updateElement('related-specialty', doctor.specialty);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            console.log(`Updated element ${id} with value: ${value}`);
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    updateRating(rating, reviewCount) {
        // Update rating display
        this.updateElement('doctor-rating', rating);
        this.updateElement('doctor-reviews', reviewCount);
        this.updateElement('avg-rating', rating);
        this.updateElement('total-reviews', reviewCount);

        // Update star displays
        this.updateStars('doctor-rating-stars', rating);
        this.updateStars('avg-rating-stars', rating);
    }

    updateStars(elementId, rating) {
        const starsContainer = document.getElementById(elementId);
        if (!starsContainer) return;

        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        let starsHTML = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt star"></i>';
        }
        
        // Empty stars
        const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < remainingStars; i++) {
            starsHTML += '<i class="far fa-star star"></i>';
        }
        
        starsContainer.innerHTML = starsHTML;
    }

    updateAvailability(isAvailable) {
        const badge = document.getElementById('availability-badge');
        if (!badge) return;

        if (isAvailable) {
            badge.innerHTML = '<i class="fas fa-circle"></i><span>Available Today</span>';
            badge.style.background = '#10b981';
        } else {
            badge.innerHTML = '<i class="fas fa-circle"></i><span>Busy Today</span>';
            badge.style.background = '#ef4444';
        }
    }

    populateSpecializations(specializations) {
        const container = document.getElementById('doctor-specializations');
        if (!container) return;

        if (!Array.isArray(specializations) || specializations.length === 0) {
            container.innerHTML = '<span class="specialization-tag">General Practice</span>';
            return;
        }

        container.innerHTML = specializations
            .map(spec => `<span class="specialization-tag">${spec}</span>`)
            .join('');
    }

    populateLanguages(languages) {
        const container = document.getElementById('doctor-languages');
        if (!container) return;

        if (!Array.isArray(languages) || languages.length === 0) {
            container.innerHTML = '<span class="language-tag">English</span>';
            return;
        }

        container.innerHTML = languages
            .map(lang => `<span class="language-tag">${lang}</span>`)
            .join('');
    }

    populateExperienceTab(doctor) {
        const timeline = document.getElementById('experience-timeline');
        if (!timeline) return;

        // Generate experience timeline
        const experiences = this.generateExperienceTimeline(doctor);
        
        timeline.innerHTML = experiences.map(exp => `
            <div class="timeline-item">
                <div class="timeline-content">
                    <h4>${exp.institution}</h4>
                    <div class="position">${exp.position}</div>
                    <div class="duration">${exp.duration}</div>
                    <p>${exp.description}</p>
                </div>
            </div>
        `).join('');

        // Populate certifications
        const certificationsContainer = document.getElementById('doctor-certifications');
        if (certificationsContainer) {
            const certifications = doctor.certifications || doctor.subspecialities || [];
            
            if (certifications.length === 0) {
                certificationsContainer.innerHTML = `
                    <div class="certification-card">
                        <h5>Board Certified Physician</h5>
                        <div class="issuer">Medical Board Certification</div>
                    </div>
                `;
            } else {
                certificationsContainer.innerHTML = certifications.map(cert => `
                    <div class="certification-card">
                        <h5>${cert}</h5>
                        <div class="issuer">Professional Certification</div>
                    </div>
                `).join('');
            }
        }
    }

    generateExperienceTimeline(doctor) {
        const currentYear = new Date().getFullYear();
        const experienceYears = doctor.experience || 10;
        
        return [
            {
                institution: doctor.location.split(',')[0] || 'Medical Center',
                position: `Senior ${doctor.specialty} Specialist`,
                duration: `${currentYear - Math.floor(experienceYears / 2)} - Present`,
                description: `Leading specialist providing comprehensive ${doctor.specialty.toLowerCase()} care and treatment.`
            },
            {
                institution: 'General Hospital',
                position: `${doctor.specialty} Physician`,
                duration: `${currentYear - experienceYears} - ${currentYear - Math.floor(experienceYears / 2)}`,
                description: `Provided quality medical care and developed expertise in ${doctor.specialty.toLowerCase()}.`
            }
        ];
    }

    populateServicesTab(services) {
        const container = document.getElementById('doctor-services');
        if (!container) return;

        if (!Array.isArray(services) || services.length === 0) {
            services = ['Medical Consultation', 'Health Assessment', 'Treatment Planning', 'Follow-up Care'];
        }

        container.innerHTML = services.map(service => `
            <div class="service-card">
                <div class="service-icon">
                    <i class="fas fa-stethoscope"></i>
                </div>
                <h5>${service}</h5>
                <p>Professional ${service.toLowerCase()} services with personalized care.</p>
            </div>
        `).join('');
    }

    populateScheduleTab() {
        const container = document.getElementById('schedule-calendar');
        if (!container) return;

        // Generate next 7 days schedule
        const schedule = this.generateWeeklySchedule();
        
        container.innerHTML = `
            <div class="calendar-header">
                <h4>Available Time Slots - Next 7 Days</h4>
            </div>
            ${schedule.map(day => `
                <div class="day-schedule">
                    <h5>${day.date} - ${day.day}</h5>
                    <div class="time-slots">
                        ${day.slots.map(slot => `
                            <div class="time-slot ${slot.available ? 'available' : 'booked'}" 
                                 onclick="selectTimeSlot('${day.date}', '${slot.time}')">
                                ${slot.time}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        `;
    }

    generateWeeklySchedule() {
        const schedule = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const slots = [];
            const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
            
            timeSlots.forEach(time => {
                slots.push({
                    time: time,
                    available: Math.random() > 0.3 // Random availability
                });
            });
            
            schedule.push({
                date: dateStr,
                day: dayName,
                slots: slots
            });
        }
        
        return schedule;
    }

    populateReviewsTab(doctor) {
        const container = document.getElementById('reviews-list');
        if (!container) return;

        // Generate sample reviews
        const reviews = this.generateSampleReviews(doctor.reviews || 5);
        
        container.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">${review.initials}</div>
                        <div>
                            <div class="reviewer-name">${review.name}</div>
                            <div class="review-date">${review.date}</div>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${this.generateStarsHTML(review.rating)}
                    </div>
                </div>
                <div class="review-text">${review.text}</div>
            </div>
        `).join('');
    }

    generateSampleReviews(count) {
        const sampleReviews = [
            {
                name: 'Sarah Johnson',
                initials: 'SJ',
                rating: 5,
                text: 'Excellent doctor with great bedside manner. Very thorough examination and clear explanation of treatment options.',
                date: '2 weeks ago'
            },
            {
                name: 'Michael Chen',
                initials: 'MC',
                rating: 4,
                text: 'Professional and knowledgeable. Appointment was on time and the doctor answered all my questions patiently.',
                date: '1 month ago'
            },
            {
                name: 'Emily Davis',
                initials: 'ED',
                rating: 5,
                text: 'Outstanding care and expertise. I felt confident in the treatment plan and saw great results.',
                date: '6 weeks ago'
            },
            {
                name: 'David Wilson',
                initials: 'DW',
                rating: 4,
                text: 'Good experience overall. The doctor was thorough and the staff was helpful.',
                date: '2 months ago'
            },
            {
                name: 'Lisa Anderson',
                initials: 'LA',
                rating: 5,
                text: 'Highly recommend! Very caring doctor who takes time to listen and provide personalized care.',
                date: '3 months ago'
            }
        ];

        return sampleReviews.slice(0, Math.min(count, sampleReviews.length));
    }

    generateStarsHTML(rating) {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHTML += '<i class="fas fa-star star"></i>';
            } else {
                starsHTML += '<i class="far fa-star star"></i>';
            }
        }
        return starsHTML;
    }

    async loadRelatedDoctors() {
        try {
            if (!this.doctorData || !this.doctorData.specialty) return;

            const response = await fetch(`php/doctors.php?specialty=${encodeURIComponent(this.doctorData.specialty)}`);
            const doctors = await response.json();
            
            // Filter out current doctor and limit to 4
            const relatedDoctors = doctors
                .filter(doc => doc.id != this.doctorId)
                .slice(0, 4);
            
            this.populateRelatedDoctors(relatedDoctors);
        } catch (error) {
            console.error('Error loading related doctors:', error);
        }
    }

    populateRelatedDoctors(doctors) {
        const container = document.getElementById('related-doctors');
        if (!container) return;

        if (doctors.length === 0) {
            container.innerHTML = '<p>No related doctors found.</p>';
            return;
        }

        container.innerHTML = doctors.map(doctor => `
            <div class="related-doctor-card" onclick="viewDoctorProfile(${doctor.id})">
                <img src="images/doctor-placeholder.svg" alt="Dr. ${doctor.name}" class="related-doctor-avatar">
                <h4>Dr. ${doctor.name}</h4>
                <div class="specialty">${doctor.specialty}</div>
                <div class="rating">
                    <span>${doctor.rating}</span>
                    <i class="fas fa-star"></i>
                    <span>(${doctor.reviews} reviews)</span>
                </div>
                <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); bookAppointment(${doctor.id})">
                    Book Appointment
                </button>
            </div>
        `).join('');
    }

    showError(message) {
        const mainContent = document.querySelector('.profile-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="container">
                    <div class="error-message">
                        <h2>Error Loading Profile</h2>
                        <p>${message}</p>
                        <a href="find-doctors.html" class="btn-primary">Browse All Doctors</a>
                    </div>
                </div>
            `;
        }
    }
}

// Tab switching functionality
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to selected tab button
    event.target.classList.add('active');
}

// Action functions
function bookAppointment(doctorId = null) {
    const id = doctorId || new URLSearchParams(window.location.search).get('id');
    if (id) {
        window.location.href = `book-appointment.html?doctor=${id}`;
    } else {
        window.location.href = 'book-appointment.html';
    }
}

function contactDoctor() {
    // Implement contact functionality
    alert('Contact functionality will be implemented soon.');
}

function selectTimeSlot(date, time) {
    alert(`Selected time slot: ${date} at ${time}. Booking functionality will be implemented.`);
}

function viewDoctorProfile(doctorId) {
    window.location.href = `doctor-profile.html?id=${doctorId}`;
}

// Initialize doctor profile when page loads
document.addEventListener('DOMContentLoaded', () => {
    const doctorProfile = new DoctorProfile();
    doctorProfile.init();
});

// Export for global access
window.DoctorProfile = DoctorProfile;