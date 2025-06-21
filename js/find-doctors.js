/**
 * Find Doctors Page Manager
 * Handles doctor search, filtering, and display functionality
 */

class FindDoctorsManager {
    constructor() {
        this.doctors = [];
        this.filteredDoctors = [];
        this.currentFilters = {
            search: '',
            specialty: '',
            location: '',
            rating: '',
            consultationType: ''
        };
        this.init();
    }

    init() {
        this.loadDoctors();
        this.setupEventListeners();
        this.setupVideoBackground();
    }

    setupVideoBackground() {
        if (typeof ThreeVideoBackground !== 'undefined') {
            new ThreeVideoBackground('find-doctors-video-background', {
                colors: ['#2563eb', '#1e40af', '#1d4ed8'],
                intensity: 0.3
            });
        }
    }

    async loadDoctors() {
        try {
            // Comprehensive doctor data
            this.doctors = [
                {
                    id: 1,
                    name: "Dr. Sarah Johnson",
                    specialty: "Cardiologist",
                    subspecialty: "Interventional Cardiology",
                    experience: 15,
                    rating: 4.9,
                    reviews: 234,
                    fee: 150,
                    available: true,
                    education: "MD - Harvard Medical School",
                    hospital: "City General Hospital",
                    location: "Downtown",
                    languages: ["English", "Spanish"],
                    about: "Dr. Johnson specializes in advanced cardiac procedures with over 15 years of experience treating complex heart conditions.",
                    conditions: ["Heart Disease", "Hypertension", "Arrhythmia", "Heart Failure", "Coronary Artery Disease"],
                    nextAvailable: "Today 2:00 PM",
                    consultationType: ["In-person", "Video Call"],
                    phone: "+1 (555) 101-2001",
                    email: "s.johnson@cityhospital.com"
                },
                {
                    id: 2,
                    name: "Dr. Michael Chen",
                    specialty: "Orthopedic Surgeon",
                    subspecialty: "Sports Medicine",
                    experience: 12,
                    rating: 4.8,
                    reviews: 189,
                    fee: 180,
                    available: true,
                    education: "MD - Johns Hopkins University",
                    hospital: "Sports Medicine Center",
                    location: "Uptown",
                    languages: ["English", "Mandarin"],
                    about: "Dr. Chen focuses on sports-related injuries and advanced orthopedic procedures for athletes.",
                    conditions: ["Sports Injuries", "Joint Pain", "Fractures", "Arthritis", "ACL Reconstruction"],
                    nextAvailable: "Tomorrow 9:00 AM",
                    consultationType: ["In-person"],
                    phone: "+1 (555) 102-2002",
                    email: "m.chen@sportsmedicine.com"
                },
                {
                    id: 3,
                    name: "Dr. Emily Rodriguez",
                    specialty: "Pediatrician",
                    subspecialty: "Developmental Pediatrics",
                    experience: 8,
                    rating: 4.7,
                    reviews: 156,
                    fee: 120,
                    available: true,
                    education: "MD - Stanford Medical School",
                    hospital: "Children's Medical Center",
                    location: "Westside",
                    languages: ["English", "Spanish", "Portuguese"],
                    about: "Dr. Rodriguez specializes in child development and comprehensive pediatric care.",
                    conditions: ["Child Development", "Vaccines", "Common Childhood Illnesses", "Growth Disorders", "ADHD"],
                    nextAvailable: "Today 4:00 PM",
                    consultationType: ["In-person", "Video Call"],
                    phone: "+1 (555) 103-2003",
                    email: "e.rodriguez@childrenscenter.com"
                },
                {
                    id: 4,
                    name: "Dr. David Wilson",
                    specialty: "Dermatologist",
                    subspecialty: "Cosmetic Dermatology",
                    experience: 10,
                    rating: 4.6,
                    reviews: 142,
                    fee: 140,
                    available: true,
                    education: "MD - UCLA Medical School",
                    hospital: "Skin Care Institute",
                    location: "Downtown",
                    languages: ["English"],
                    about: "Dr. Wilson combines medical and cosmetic dermatology for comprehensive skin care.",
                    conditions: ["Acne", "Skin Cancer", "Eczema", "Cosmetic Procedures", "Psoriasis"],
                    nextAvailable: "Monday 10:00 AM",
                    consultationType: ["In-person", "Video Call"],
                    phone: "+1 (555) 104-2004",
                    email: "d.wilson@skincare.com"
                },
                {
                    id: 5,
                    name: "Dr. Lisa Anderson",
                    specialty: "Neurologist",
                    subspecialty: "Movement Disorders",
                    experience: 14,
                    rating: 4.9,
                    reviews: 198,
                    fee: 170,
                    available: true,
                    education: "MD - Mayo Clinic Medical School",
                    hospital: "Neurological Institute",
                    location: "Eastside",
                    languages: ["English", "French"],
                    about: "Dr. Anderson specializes in complex neurological disorders and brain health.",
                    conditions: ["Parkinson's Disease", "Epilepsy", "Migraines", "Multiple Sclerosis", "Stroke"],
                    nextAvailable: "Today 1:00 PM",
                    consultationType: ["In-person", "Video Call"],
                    phone: "+1 (555) 105-2005",
                    email: "l.anderson@neuroinstitute.com"
                },
                {
                    id: 6,
                    name: "Dr. James Thompson",
                    specialty: "General Surgeon",
                    subspecialty: "Minimally Invasive Surgery",
                    experience: 18,
                    rating: 4.8,
                    reviews: 267,
                    fee: 200,
                    available: true,
                    education: "MD - Cleveland Clinic Medical School",
                    hospital: "Metropolitan Surgical Center",
                    location: "Downtown",
                    languages: ["English"],
                    about: "Dr. Thompson specializes in minimally invasive surgical techniques.",
                    conditions: ["Gallbladder Surgery", "Hernia Repair", "Appendectomy", "Colon Surgery", "Laparoscopic Surgery"],
                    nextAvailable: "Tuesday 8:00 AM",
                    consultationType: ["In-person"],
                    phone: "+1 (555) 106-2006",
                    email: "j.thompson@metrosurgical.com"
                },
                {
                    id: 7,
                    name: "Dr. Maria Garcia",
                    specialty: "Gynecologist",
                    subspecialty: "Women's Health",
                    experience: 11,
                    rating: 4.7,
                    reviews: 178,
                    fee: 160,
                    available: true,
                    education: "MD - University of California",
                    hospital: "Women's Health Center",
                    location: "Uptown",
                    languages: ["English", "Spanish"],
                    about: "Dr. Garcia provides comprehensive women's healthcare services.",
                    conditions: ["Reproductive Health", "Pregnancy Care", "Menopause", "PCOS", "Gynecological Surgery"],
                    nextAvailable: "Today 3:00 PM",
                    consultationType: ["In-person", "Video Call"],
                    phone: "+1 (555) 107-2007",
                    email: "m.garcia@womenshealth.com"
                },
                {
                    id: 8,
                    name: "Dr. Robert Kim",
                    specialty: "Psychiatrist",
                    subspecialty: "Adult Psychiatry",
                    experience: 9,
                    rating: 4.6,
                    reviews: 134,
                    fee: 130,
                    available: true,
                    education: "MD - Yale Medical School",
                    hospital: "Mental Health Institute",
                    location: "Westside",
                    languages: ["English", "Korean"],
                    about: "Dr. Kim specializes in adult mental health and psychological wellness.",
                    conditions: ["Depression", "Anxiety", "ADHD", "Bipolar Disorder", "PTSD"],
                    nextAvailable: "Tomorrow 11:00 AM",
                    consultationType: ["In-person", "Video Call"],
                    phone: "+1 (555) 108-2008",
                    email: "r.kim@mentalhealth.com"
                }
            ];

            this.filteredDoctors = [...this.doctors];
            this.displayDoctors(this.filteredDoctors);
            this.updateResultsCount();

        } catch (error) {
            console.error('Failed to load doctors:', error);
            this.showError('Failed to load doctors list');
        }
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('doctor-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Filter selects
        const specialtyFilter = document.getElementById('specialty-filter');
        const locationFilter = document.getElementById('location-filter');
        const ratingFilter = document.getElementById('rating-filter');
        const consultationTypeFilter = document.getElementById('consultation-type-filter');

        if (specialtyFilter) {
            specialtyFilter.addEventListener('change', (e) => {
                this.currentFilters.specialty = e.target.value;
                this.applyFilters();
            });
        }

        if (locationFilter) {
            locationFilter.addEventListener('change', (e) => {
                this.currentFilters.location = e.target.value;
                this.applyFilters();
            });
        }

        if (ratingFilter) {
            ratingFilter.addEventListener('change', (e) => {
                this.currentFilters.rating = e.target.value;
                this.applyFilters();
            });
        }

        if (consultationTypeFilter) {
            consultationTypeFilter.addEventListener('change', (e) => {
                this.currentFilters.consultationType = e.target.value;
                this.applyFilters();
            });
        }

        // Search button
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        let filtered = [...this.doctors];

        // Search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(doctor => 
                doctor.name.toLowerCase().includes(searchTerm) ||
                doctor.specialty.toLowerCase().includes(searchTerm) ||
                doctor.subspecialty?.toLowerCase().includes(searchTerm) ||
                doctor.conditions.some(condition => condition.toLowerCase().includes(searchTerm)) ||
                doctor.hospital.toLowerCase().includes(searchTerm)
            );
        }

        // Specialty filter
        if (this.currentFilters.specialty) {
            filtered = filtered.filter(doctor => doctor.specialty === this.currentFilters.specialty);
        }

        // Location filter
        if (this.currentFilters.location) {
            filtered = filtered.filter(doctor => doctor.location === this.currentFilters.location);
        }

        // Rating filter
        if (this.currentFilters.rating) {
            const minRating = parseFloat(this.currentFilters.rating);
            filtered = filtered.filter(doctor => doctor.rating >= minRating);
        }

        // Consultation type filter
        if (this.currentFilters.consultationType) {
            filtered = filtered.filter(doctor => 
                doctor.consultationType.includes(this.currentFilters.consultationType)
            );
        }

        this.filteredDoctors = filtered;
        this.displayDoctors(this.filteredDoctors);
        this.updateResultsCount();
    }

    displayDoctors(doctors) {
        const doctorsGrid = document.getElementById('doctors-grid');
        if (!doctorsGrid) return;

        if (doctors.length === 0) {
            doctorsGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>No doctors found</h3>
                    <p>Try adjusting your search criteria or filters</p>
                </div>
            `;
            return;
        }

        doctorsGrid.innerHTML = doctors.map(doctor => `
            <div class="doctor-card-find" data-doctor-id="${doctor.id}">
                <div class="doctor-card-header">
                    <div class="doctor-avatar">
                        ${doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div class="doctor-info">
                        <h3>${doctor.name}</h3>
                        <p class="specialty">${doctor.specialty}</p>
                        <p class="subspecialty">${doctor.subspecialty || ''}</p>
                        <div class="doctor-meta">
                            <span class="experience">
                                <i class="fas fa-graduation-cap"></i>
                                ${doctor.experience} years
                            </span>
                            <span class="location">
                                <i class="fas fa-map-marker-alt"></i>
                                ${doctor.location}
                            </span>
                        </div>
                    </div>
                    <div class="doctor-rating">
                        <div class="rating-stars">
                            ${this.generateStars(doctor.rating)}
                        </div>
                        <span class="rating-text">${doctor.rating} (${doctor.reviews})</span>
                    </div>
                </div>

                <div class="doctor-card-body">
                    <div class="hospital-info">
                        <i class="fas fa-hospital"></i>
                        <span>${doctor.hospital}</span>
                    </div>

                    <div class="about-doctor">
                        <p>${doctor.about}</p>
                    </div>

                    <div class="specialties-section">
                        <h4>Conditions Treated:</h4>
                        <div class="conditions-tags">
                            ${doctor.conditions.slice(0, 4).map(condition => 
                                `<span class="condition-tag">${condition}</span>`
                            ).join('')}
                            ${doctor.conditions.length > 4 ? 
                                `<span class="more-conditions">+${doctor.conditions.length - 4} more</span>` : ''}
                        </div>
                    </div>

                    <div class="consultation-info">
                        <div class="consultation-types">
                            <h4>Available:</h4>
                            <div class="types-list">
                                ${doctor.consultationType.map(type => 
                                    `<span class="consultation-type">${type}</span>`
                                ).join('')}
                            </div>
                        </div>
                        <div class="next-available">
                            <i class="fas fa-clock"></i>
                            <span>Next: ${doctor.nextAvailable}</span>
                        </div>
                    </div>

                    <div class="contact-info">
                        <div class="contact-item">
                            <i class="fas fa-phone"></i>
                            <span>${doctor.phone}</span>
                        </div>
                        <div class="fee-info">
                            <span class="fee-label">Consultation Fee:</span>
                            <span class="fee-amount">$${doctor.fee}</span>
                        </div>
                    </div>
                </div>

                <div class="doctor-card-footer">
                    <button class="btn-view-profile" onclick="findDoctorsManager.viewDoctorProfile(${doctor.id})">
                        <i class="fas fa-info-circle"></i>
                        View Profile
                    </button>
                    <button class="btn-book-appointment" onclick="findDoctorsManager.bookAppointment(${doctor.id})">
                        <i class="fas fa-calendar-plus"></i>
                        Book Appointment
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            const count = this.filteredDoctors.length;
            resultsCount.textContent = `Showing ${count} doctor${count !== 1 ? 's' : ''}`;
        }
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    viewDoctorProfile(doctorId) {
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (!doctor) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay doctor-profile-modal';
        modal.innerHTML = `
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-user-md"></i> Doctor Profile - ${doctor.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="doctor-profile-detailed">
                        <div class="profile-header">
                            <div class="doctor-avatar-large">
                                ${doctor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div class="doctor-details">
                                <h2>${doctor.name}</h2>
                                <p class="title">${doctor.specialty} - ${doctor.subspecialty}</p>
                                <div class="credentials">
                                    <div class="credential">
                                        <i class="fas fa-graduation-cap"></i>
                                        <span>${doctor.education}</span>
                                    </div>
                                    <div class="credential">
                                        <i class="fas fa-hospital"></i>
                                        <span>${doctor.hospital}</span>
                                    </div>
                                    <div class="credential">
                                        <i class="fas fa-calendar"></i>
                                        <span>${doctor.experience} years experience</span>
                                    </div>
                                </div>
                                <div class="rating-section">
                                    <div class="stars">${this.generateStars(doctor.rating)}</div>
                                    <span>${doctor.rating} (${doctor.reviews} reviews)</span>
                                </div>
                            </div>
                        </div>

                        <div class="profile-content">
                            <div class="section">
                                <h4>About</h4>
                                <p>${doctor.about}</p>
                            </div>

                            <div class="section">
                                <h4>Conditions Treated</h4>
                                <div class="conditions-grid">
                                    ${doctor.conditions.map(condition => 
                                        `<span class="condition-pill">${condition}</span>`
                                    ).join('')}
                                </div>
                            </div>

                            <div class="section">
                                <h4>Languages</h4>
                                <div class="languages">
                                    ${doctor.languages.map(lang => 
                                        `<span class="language-pill">${lang}</span>`
                                    ).join('')}
                                </div>
                            </div>

                            <div class="section">
                                <h4>Consultation Options</h4>
                                <div class="consultation-options">
                                    ${doctor.consultationType.map(type => 
                                        `<div class="consultation-option">
                                            <i class="fas fa-${type === 'Video Call' ? 'video' : 'user-md'}"></i>
                                            <span>${type}</span>
                                        </div>`
                                    ).join('')}
                                </div>
                            </div>

                            <div class="section">
                                <h4>Contact Information</h4>
                                <div class="contact-details">
                                    <div class="contact-item">
                                        <i class="fas fa-phone"></i>
                                        <span>${doctor.phone}</span>
                                    </div>
                                    <div class="contact-item">
                                        <i class="fas fa-envelope"></i>
                                        <span>${doctor.email}</span>
                                    </div>
                                    <div class="contact-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <span>${doctor.hospital}, ${doctor.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Close</button>
                    <button class="btn btn-primary" onclick="findDoctorsManager.bookAppointment(${doctor.id}); this.closest('.modal-overlay').remove();">
                        <i class="fas fa-calendar-plus"></i> Book Appointment
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    bookAppointment(doctorId) {
        // Redirect to booking page with doctor pre-selected
        window.location.href = `booking.html?doctor=${doctorId}`;
    }

    showError(message) {
        const doctorsGrid = document.getElementById('doctors-grid');
        if (doctorsGrid) {
            doctorsGrid.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Error Loading Doctors</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Initialize the Find Doctors Manager
let findDoctorsManager;
document.addEventListener('DOMContentLoaded', () => {
    findDoctorsManager = new FindDoctorsManager();
});