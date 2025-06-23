// Doctor Search Functionality for eChannelling

class DoctorSearchManager {
    constructor() {
        this.doctors = [];
        this.filteredDoctors = [];
        this.currentFilters = {
            speciality: '',
            hospital: '',
            location: '',
            availability: '',
            rating: 0
        };
        
        this.initializeSearchManager();
        this.loadMockDoctorData();
    }

    initializeSearchManager() {
        this.setupAdvancedSearch();
        this.setupFilterHandlers();
        this.setupSortingOptions();
    }

    loadMockDoctorData() {
        // Comprehensive mock data matching eChannelling structure
        this.doctors = [
            {
                id: 1,
                name: 'Dr. Kasun Perera',
                speciality: 'Cardiology',
                qualification: 'MBBS, MD (Cardiology), MRCP (UK)',
                hospital: 'Apollo Hospital',
                location: 'Colombo',
                experience: 15,
                rating: 4.8,
                reviewCount: 245,
                consultationFee: 3500,
                nextAvailable: '2025-06-23',
                image: 'images/doctors/dr-kasun-perera.jpg',
                languages: ['English', 'Sinhala'],
                biography: 'Specialist in interventional cardiology with over 15 years of experience.',
                timeSlots: {
                    '2025-06-23': ['09:00', '10:00', '11:00', '14:00', '15:00'],
                    '2025-06-24': ['09:00', '10:00', '14:00', '15:00', '16:00']
                }
            },
            {
                id: 2,
                name: 'Dr. Nimal Silva',
                speciality: 'Cardiology',
                qualification: 'MBBS, MD (Internal Medicine), DM (Cardiology)',
                hospital: 'Asiri Hospital',
                location: 'Colombo',
                experience: 20,
                rating: 4.9,
                reviewCount: 189,
                consultationFee: 4000,
                nextAvailable: '2025-06-23',
                image: 'images/doctors/dr-nimal-silva.jpg',
                languages: ['English', 'Sinhala'],
                biography: 'Leading cardiologist specializing in heart failure and arrhythmia management.',
                timeSlots: {
                    '2025-06-23': ['08:00', '09:00', '10:00', '15:00', '16:00'],
                    '2025-06-24': ['08:00', '09:00', '15:00', '16:00']
                }
            },
            {
                id: 3,
                name: 'Dr. Chamari Wijesinghe',
                speciality: 'Dermatology',
                qualification: 'MBBS, MD (Dermatology), MRCP (UK)',
                hospital: 'Durdans Hospital',
                location: 'Colombo',
                experience: 12,
                rating: 4.7,
                reviewCount: 312,
                consultationFee: 3000,
                nextAvailable: '2025-06-23',
                image: 'images/doctors/dr-chamari-wijesinghe.jpg',
                languages: ['English', 'Sinhala'],
                biography: 'Expert in cosmetic dermatology and skin cancer treatment.',
                timeSlots: {
                    '2025-06-23': ['09:00', '11:00', '14:00', '15:00', '16:00'],
                    '2025-06-24': ['09:00', '10:00', '11:00', '14:00']
                }
            },
            {
                id: 4,
                name: 'Dr. Sampath Rajapakse',
                speciality: 'General Medicine',
                qualification: 'MBBS, MD (Internal Medicine), MRCP (UK)',
                hospital: 'Nawaloka Hospital',
                location: 'Colombo',
                experience: 18,
                rating: 4.6,
                reviewCount: 156,
                consultationFee: 2500,
                nextAvailable: '2025-06-23',
                image: 'images/doctors/dr-sampath-rajapakse.jpg',
                languages: ['English', 'Sinhala'],
                biography: 'General physician with expertise in diabetes and hypertension management.',
                timeSlots: {
                    '2025-06-23': ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'],
                    '2025-06-24': ['08:00', '09:00', '10:00', '14:00', '15:00']
                }
            },
            {
                id: 5,
                name: 'Dr. Ranjith Perera',
                speciality: 'Orthopedic Surgery',
                qualification: 'MBBS, MS (Orthopedic Surgery), FRCS (Edinburgh)',
                hospital: 'Asiri Hospital',
                location: 'Colombo',
                experience: 22,
                rating: 4.8,
                reviewCount: 198,
                consultationFee: 4500,
                nextAvailable: '2025-06-24',
                image: 'images/doctors/dr-ranjith-perera.jpg',
                languages: ['English', 'Sinhala'],
                biography: 'Specialist in joint replacement and sports injury treatment.',
                timeSlots: {
                    '2025-06-24': ['09:00', '10:00', '11:00', '14:00'],
                    '2025-06-25': ['09:00', '10:00', '14:00', '15:00']
                }
            },
            {
                id: 6,
                name: 'Dr. Sandya Amarasinghe',
                speciality: 'Pediatrics',
                qualification: 'MBBS, MD (Pediatrics), MRCPCH (UK)',
                hospital: 'Durdans Hospital',
                location: 'Colombo',
                experience: 14,
                rating: 4.9,
                reviewCount: 267,
                consultationFee: 3200,
                nextAvailable: '2025-06-23',
                image: 'images/doctors/dr-sandya-amarasinghe.jpg',
                languages: ['English', 'Sinhala'],
                biography: 'Pediatrician specializing in child development and vaccination.',
                timeSlots: {
                    '2025-06-23': ['08:00', '09:00', '10:00', '15:00', '16:00'],
                    '2025-06-24': ['08:00', '09:00', '15:00', '16:00']
                }
            }
        ];

        this.filteredDoctors = [...this.doctors];
    }

    setupAdvancedSearch() {
        const searchInput = document.getElementById('doctor-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchDoctors(e.target.value);
            });
        }
    }

    setupFilterHandlers() {
        const filterElements = {
            speciality: document.getElementById('filter-speciality'),
            hospital: document.getElementById('filter-hospital'),
            location: document.getElementById('filter-location'),
            availability: document.getElementById('filter-availability'),
            rating: document.getElementById('filter-rating')
        };

        Object.keys(filterElements).forEach(filterType => {
            const element = filterElements[filterType];
            if (element) {
                element.addEventListener('change', (e) => {
                    this.updateFilter(filterType, e.target.value);
                });
            }
        });
    }

    setupSortingOptions() {
        const sortSelect = document.getElementById('sort-doctors');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortDoctors(e.target.value);
            });
        }
    }

    searchDoctors(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredDoctors = [...this.doctors];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredDoctors = this.doctors.filter(doctor => 
                doctor.name.toLowerCase().includes(term) ||
                doctor.speciality.toLowerCase().includes(term) ||
                doctor.hospital.toLowerCase().includes(term) ||
                doctor.qualification.toLowerCase().includes(term)
            );
        }
        
        this.applyFilters();
        this.renderDoctorResults();
    }

    updateFilter(filterType, value) {
        this.currentFilters[filterType] = value;
        this.applyFilters();
        this.renderDoctorResults();
    }

    applyFilters() {
        let filtered = [...this.filteredDoctors];

        // Apply speciality filter
        if (this.currentFilters.speciality) {
            filtered = filtered.filter(doctor => 
                doctor.speciality === this.currentFilters.speciality
            );
        }

        // Apply hospital filter
        if (this.currentFilters.hospital) {
            filtered = filtered.filter(doctor => 
                doctor.hospital === this.currentFilters.hospital
            );
        }

        // Apply location filter
        if (this.currentFilters.location) {
            filtered = filtered.filter(doctor => 
                doctor.location === this.currentFilters.location
            );
        }

        // Apply rating filter
        if (this.currentFilters.rating) {
            const minRating = parseFloat(this.currentFilters.rating);
            filtered = filtered.filter(doctor => doctor.rating >= minRating);
        }

        // Apply availability filter
        if (this.currentFilters.availability) {
            const today = new Date();
            const filterDate = new Date(today);
            
            switch (this.currentFilters.availability) {
                case 'today':
                    // Keep current date
                    break;
                case 'tomorrow':
                    filterDate.setDate(today.getDate() + 1);
                    break;
                case 'week':
                    filterDate.setDate(today.getDate() + 7);
                    break;
            }
            
            const filterDateStr = filterDate.toISOString().split('T')[0];
            filtered = filtered.filter(doctor => 
                doctor.timeSlots && doctor.timeSlots[filterDateStr]
            );
        }

        this.filteredDoctors = filtered;
    }

    sortDoctors(sortBy) {
        switch (sortBy) {
            case 'rating':
                this.filteredDoctors.sort((a, b) => b.rating - a.rating);
                break;
            case 'experience':
                this.filteredDoctors.sort((a, b) => b.experience - a.experience);
                break;
            case 'fee-low':
                this.filteredDoctors.sort((a, b) => a.consultationFee - b.consultationFee);
                break;
            case 'fee-high':
                this.filteredDoctors.sort((a, b) => b.consultationFee - a.consultationFee);
                break;
            case 'name':
                this.filteredDoctors.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'availability':
                this.filteredDoctors.sort((a, b) => 
                    new Date(a.nextAvailable) - new Date(b.nextAvailable)
                );
                break;
            default:
                // Default sorting by rating
                this.filteredDoctors.sort((a, b) => b.rating - a.rating);
        }
        
        this.renderDoctorResults();
    }

    renderDoctorResults() {
        const resultsContainer = document.getElementById('doctor-results');
        if (!resultsContainer) return;

        if (this.filteredDoctors.length === 0) {
            resultsContainer.innerHTML = this.renderNoResults();
            return;
        }

        const resultsHTML = this.filteredDoctors.map(doctor => 
            this.renderDoctorCard(doctor)
        ).join('');

        resultsContainer.innerHTML = resultsHTML;
        this.setupDoctorCardEvents();
    }

    renderDoctorCard(doctor) {
        const stars = this.renderStarRating(doctor.rating);
        const availabilityBadge = this.renderAvailabilityBadge(doctor);

        return `
            <div class="doctor-card" data-doctor-id="${doctor.id}">
                <div class="doctor-image">
                    <img src="${doctor.image}" alt="${doctor.name}" onerror="this.src='images/default-doctor.jpg'">
                    ${availabilityBadge}
                </div>
                <div class="doctor-info">
                    <div class="doctor-header">
                        <h3 class="doctor-name">${doctor.name}</h3>
                        <div class="doctor-rating">
                            ${stars}
                            <span class="rating-score">${doctor.rating}</span>
                            <span class="review-count">(${doctor.reviewCount} reviews)</span>
                        </div>
                    </div>
                    <div class="doctor-details">
                        <p class="doctor-speciality">${doctor.speciality}</p>
                        <p class="doctor-qualification">${doctor.qualification}</p>
                        <div class="doctor-meta">
                            <span class="hospital-name">${doctor.hospital}</span>
                            <span class="experience">${doctor.experience} years experience</span>
                        </div>
                        <div class="languages">
                            <span class="languages-label">Languages:</span>
                            ${doctor.languages.map(lang => `<span class="language-tag">${lang}</span>`).join('')}
                        </div>
                    </div>
                    <div class="doctor-actions">
                        <div class="consultation-fee">
                            <span class="fee-label">Consultation Fee:</span>
                            <span class="fee-amount">Rs. ${doctor.consultationFee.toLocaleString()}</span>
                        </div>
                        <div class="action-buttons">
                            <button class="btn-view-profile" onclick="viewDoctorProfile(${doctor.id})">View Profile</button>
                            <button class="btn-book-appointment" data-doctor-id="${doctor.id}">Book Appointment</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return `
            <div class="star-rating">
                ${'★'.repeat(fullStars)}
                ${hasHalfStar ? '☆' : ''}
                ${'☆'.repeat(emptyStars)}
            </div>
        `;
    }

    renderAvailabilityBadge(doctor) {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        if (doctor.timeSlots && doctor.timeSlots[today] && doctor.timeSlots[today].length > 0) {
            return '<div class="availability-badge available-today">Available Today</div>';
        } else if (doctor.timeSlots && doctor.timeSlots[tomorrowStr] && doctor.timeSlots[tomorrowStr].length > 0) {
            return '<div class="availability-badge available-tomorrow">Available Tomorrow</div>';
        } else {
            return '<div class="availability-badge available-later">Available Later</div>';
        }
    }

    renderNoResults() {
        return `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No Doctors Found</h3>
                <p>Try adjusting your search criteria or filters to find more results.</p>
                <button class="btn-clear-filters" onclick="doctorSearch.clearAllFilters()">Clear All Filters</button>
            </div>
        `;
    }

    setupDoctorCardEvents() {
        // View profile buttons
        document.querySelectorAll('.btn-view-profile').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const doctorId = e.target.getAttribute('data-doctor-id');
                this.showDoctorProfile(doctorId);
            });
        });

        // Book appointment buttons
        document.querySelectorAll('.btn-book-appointment').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const doctorId = e.target.getAttribute('data-doctor-id');
                this.initiateBooking(doctorId);
            });
        });
    }

    showDoctorProfile(doctorId) {
        // Navigate to individual doctor profile page
        window.location.href = `doctor-profile.html?id=${doctorId}`;
    }

    createDoctorProfileModal(doctor) {
        const modal = document.createElement('div');
        modal.className = 'doctor-profile-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Doctor Profile</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="profile-header">
                        <img src="${doctor.image}" alt="${doctor.name}" class="profile-image">
                        <div class="profile-info">
                            <h3>${doctor.name}</h3>
                            <p class="speciality">${doctor.speciality}</p>
                            <div class="rating">
                                ${this.renderStarRating(doctor.rating)}
                                <span>${doctor.rating} (${doctor.reviewCount} reviews)</span>
                            </div>
                        </div>
                    </div>
                    <div class="profile-details">
                        <h4>Qualifications</h4>
                        <p>${doctor.qualification}</p>
                        
                        <h4>Experience</h4>
                        <p>${doctor.experience} years</p>
                        
                        <h4>Hospital</h4>
                        <p>${doctor.hospital}, ${doctor.location}</p>
                        
                        <h4>Languages</h4>
                        <p>${doctor.languages.join(', ')}</p>
                        
                        <h4>About</h4>
                        <p>${doctor.biography}</p>
                        
                        <h4>Consultation Fee</h4>
                        <p class="fee">Rs. ${doctor.consultationFee.toLocaleString()}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-book-appointment" data-doctor-id="${doctor.id}">Book Appointment</button>
                </div>
            </div>
        `;

        // Setup modal events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => document.body.removeChild(modal), 300);
        });

        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => document.body.removeChild(modal), 300);
        });

        modal.querySelector('.btn-book-appointment').addEventListener('click', (e) => {
            const doctorId = e.target.getAttribute('data-doctor-id');
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
                this.initiateBooking(doctorId);
            }, 300);
        });

        return modal;
    }

    initiateBooking(doctorId) {
        const doctor = this.doctors.find(d => d.id == doctorId);
        if (!doctor) return;

        // For now, show alert - in real implementation, would navigate to booking page
        alert(`Booking appointment with ${doctor.name}. This would redirect to the appointment booking page with time slot selection.`);
    }

    clearAllFilters() {
        // Reset filters
        this.currentFilters = {
            speciality: '',
            hospital: '',
            location: '',
            availability: '',
            rating: 0
        };

        // Clear form elements
        const filterElements = document.querySelectorAll('#filter-speciality, #filter-hospital, #filter-location, #filter-availability, #filter-rating');
        filterElements.forEach(element => {
            if (element) element.value = '';
        });

        // Clear search
        const searchInput = document.getElementById('doctor-search');
        if (searchInput) searchInput.value = '';

        // Reset results
        this.filteredDoctors = [...this.doctors];
        this.renderDoctorResults();
    }

    // Public method to get doctor by ID
    getDoctorById(id) {
        return this.doctors.find(doctor => doctor.id == id);
    }

    // Public method to get available time slots
    getAvailableSlots(doctorId, date) {
        const doctor = this.getDoctorById(doctorId);
        if (!doctor || !doctor.timeSlots) return [];
        
        return doctor.timeSlots[date] || [];
    }
}

// Export for global use
let doctorSearch;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    doctorSearch = new DoctorSearchManager();
});