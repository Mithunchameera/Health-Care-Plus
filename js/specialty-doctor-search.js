/**
 * Specialty Doctor Search System
 * Handles filtering and display of doctors by specialty
 */

class SpecialtyDoctorSearch {
    constructor(specialty) {
        this.specialty = specialty;
        this.doctors = [];
        this.filteredDoctors = [];
        this.currentPage = 1;
        this.doctorsPerPage = 6;
        this.init();
    }

    async init() {
        await this.loadDoctors();
        this.filterBySpecialty();
        this.renderDoctors();
        this.updatePageTitle();
        this.setupEventListeners();
    }

    async loadDoctors() {
        try {
            const response = await fetch('php/doctors.php');
            if (response.ok) {
                this.doctors = await response.json();
            } else {
                // Fallback to mock data if API fails
                this.doctors = this.getMockDoctors();
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
            this.doctors = this.getMockDoctors();
        }
    }

    filterBySpecialty() {
        this.filteredDoctors = this.doctors.filter(doctor => 
            doctor.specialty.toLowerCase().includes(this.specialty.toLowerCase()) ||
            (doctor.subspecialties && doctor.subspecialties.some(sub => 
                sub.toLowerCase().includes(this.specialty.toLowerCase())
            ))
        );
    }

    renderDoctors() {
        const doctorsGrid = document.getElementById('doctors-grid');
        if (!doctorsGrid) return;

        const startIndex = (this.currentPage - 1) * this.doctorsPerPage;
        const endIndex = startIndex + this.doctorsPerPage;
        const doctorsToShow = this.filteredDoctors.slice(startIndex, endIndex);

        if (doctorsToShow.length === 0) {
            doctorsGrid.innerHTML = `
                <div class="no-doctors-found">
                    <div class="no-doctors-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                    <h3>No ${this.specialty} specialists found</h3>
                    <p>We're constantly adding new doctors to our network. Please check back soon or browse all doctors.</p>
                    <a href="find-doctors.html" class="btn-primary">View All Doctors</a>
                </div>
            `;
            return;
        }

        doctorsGrid.innerHTML = doctorsToShow.map(doctor => this.createDoctorCard(doctor)).join('');
        this.updatePagination();
        this.updateResultsInfo();
    }

    createDoctorCard(doctor) {
        const rating = doctor.rating || 4.5;
        const reviews = doctor.reviews || doctor.total_reviews || 0;
        const fee = doctor.fee || doctor.consultation_fee || 'Contact for price';
        
        return `
            <div class="doctor-card" data-doctor-id="${doctor.id}">
                <div class="doctor-image">
                    <img src="${doctor.profile_picture || 'images/doctor-placeholder.svg'}" 
                         alt="Dr. ${doctor.name}" 
                         onerror="this.src='images/doctor-placeholder.svg'">
                    <div class="doctor-status ${doctor.available ? 'available' : 'unavailable'}">
                        ${doctor.available ? 'Available' : 'Unavailable'}
                    </div>
                </div>
                <div class="doctor-info">
                    <h3 class="doctor-name">Dr. ${doctor.name}</h3>
                    <p class="doctor-specialty">${doctor.specialty}</p>
                    ${doctor.subspecialties ? `<p class="doctor-subspecialty">${doctor.subspecialties.join(', ')}</p>` : ''}
                    <p class="doctor-experience">${doctor.experience || doctor.experience_years || 0} years experience</p>
                    <p class="doctor-location">${doctor.location || 'Location not specified'}</p>
                    <div class="doctor-rating">
                        <div class="stars">${this.generateStars(rating)}</div>
                        <span class="rating-text">${rating} (${reviews} reviews)</span>
                    </div>
                    <div class="doctor-fee">
                        <span class="fee-label">Consultation Fee:</span>
                        <span class="fee-amount">Rs. ${typeof fee === 'number' ? fee.toFixed(2) : fee}</span>
                    </div>
                    <div class="doctor-actions">
                        <button class="btn-primary btn-book" onclick="bookAppointment(${doctor.id})">
                            Book Appointment
                        </button>
                        <button class="btn-secondary btn-view" onclick="viewDoctorProfile(${doctor.id})">
                            View Profile
                        </button>
                    </div>
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
            stars += '<i class="star filled">★</i>';
        }
        if (hasHalfStar) {
            stars += '<i class="star half">★</i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="star empty">☆</i>';
        }
        return stars;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredDoctors.length / this.doctorsPerPage);
        const paginationContainer = document.getElementById('pagination');
        
        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button class="pagination-btn" onclick="specialtySearch.changePage(${this.currentPage - 1})">Previous</button>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="pagination-btn active">${i}</button>`;
            } else {
                paginationHTML += `<button class="pagination-btn" onclick="specialtySearch.changePage(${i})">${i}</button>`;
            }
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="pagination-btn" onclick="specialtySearch.changePage(${this.currentPage + 1})">Next</button>`;
        }

        paginationContainer.innerHTML = paginationHTML;
    }

    updateResultsInfo() {
        const resultsInfo = document.getElementById('results-info');
        if (!resultsInfo) return;

        const total = this.filteredDoctors.length;
        const startIndex = (this.currentPage - 1) * this.doctorsPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.doctorsPerPage, total);

        resultsInfo.textContent = `Showing ${startIndex}-${endIndex} of ${total} ${this.specialty} specialists`;
    }

    updatePageTitle() {
        const pageTitle = document.querySelector('.doctors-hero h1');
        const specialtyInfo = document.querySelector('.specialty-info');
        
        if (pageTitle) {
            pageTitle.textContent = `Find ${this.specialty} Specialists`;
        }

        if (specialtyInfo) {
            specialtyInfo.innerHTML = `
                <p>Discover qualified ${this.specialty.toLowerCase()} specialists in Sri Lanka. Book appointments with experienced doctors who specialize in ${this.specialty.toLowerCase()} treatments and consultations.</p>
            `;
        }
    }

    changePage(page) {
        this.currentPage = page;
        this.renderDoctors();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('doctor-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchDoctors(e.target.value);
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('sort-doctors');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortDoctors(e.target.value);
            });
        }
    }

    searchDoctors(query) {
        if (!query.trim()) {
            this.filterBySpecialty();
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredDoctors = this.doctors.filter(doctor => 
                (doctor.specialty.toLowerCase().includes(this.specialty.toLowerCase()) ||
                (doctor.subspecialties && doctor.subspecialties.some(sub => 
                    sub.toLowerCase().includes(this.specialty.toLowerCase())
                ))) &&
                (doctor.name.toLowerCase().includes(searchTerm) ||
                doctor.specialty.toLowerCase().includes(searchTerm) ||
                doctor.location.toLowerCase().includes(searchTerm))
            );
        }
        
        this.currentPage = 1;
        this.renderDoctors();
    }

    sortDoctors(sortBy) {
        switch (sortBy) {
            case 'name':
                this.filteredDoctors.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'rating':
                this.filteredDoctors.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'experience':
                this.filteredDoctors.sort((a, b) => (b.experience || b.experience_years || 0) - (a.experience || a.experience_years || 0));
                break;
            case 'fee':
                this.filteredDoctors.sort((a, b) => (a.fee || a.consultation_fee || 0) - (b.fee || b.consultation_fee || 0));
                break;
        }
        
        this.currentPage = 1;
        this.renderDoctors();
    }

    getMockDoctors() {
        return [
            {
                id: 1,
                name: "Sarah Johnson",
                specialty: "Cardiology",
                subspecialties: ["Interventional Cardiology", "Heart Failure"],
                experience: 15,
                location: "Medical Center, Colombo",
                rating: 4.8,
                reviews: 156,
                fee: 3500,
                available: true
            },
            {
                id: 2,
                name: "Lisa Park",
                specialty: "Dermatology",
                subspecialties: ["Cosmetic Dermatology", "Skin Cancer"],
                experience: 10,
                location: "Dermatology Clinic, Kandy",
                rating: 4.5,
                reviews: 76,
                fee: 2800,
                available: true
            },
            {
                id: 3,
                name: "David Thompson",
                specialty: "Orthopedics",
                subspecialties: ["Sports Medicine", "Joint Replacement"],
                experience: 20,
                location: "Orthopedic Center, Galle",
                rating: 4.6,
                reviews: 134,
                fee: 4000,
                available: true
            },
            {
                id: 4,
                name: "Emily Rodriguez",
                specialty: "Pediatrics",
                subspecialties: ["Pediatric Emergency Medicine", "Child Development"],
                experience: 8,
                location: "Children's Hospital, Colombo",
                rating: 4.7,
                reviews: 89,
                fee: 2500,
                available: true
            },
            {
                id: 5,
                name: "Robert Williams",
                specialty: "General Medicine",
                subspecialties: ["Internal Medicine", "Diabetes Management"],
                experience: 18,
                location: "Primary Care Center, Negombo",
                rating: 4.7,
                reviews: 242,
                fee: 2200,
                available: true
            },
            {
                id: 6,
                name: "Michael Chang",
                specialty: "Surgery",
                subspecialties: ["General Surgery", "Laparoscopic Surgery"],
                experience: 22,
                location: "Surgical Center, Colombo",
                rating: 4.9,
                reviews: 203,
                fee: 5000,
                available: true
            },
            {
                id: 7,
                name: "Amanda Foster",
                specialty: "Gynecology",
                subspecialties: ["Obstetrics", "Reproductive Health"],
                experience: 14,
                location: "Women's Health Center, Kandy",
                rating: 4.9,
                reviews: 187,
                fee: 3200,
                available: true
            },
            {
                id: 8,
                name: "James Martinez",
                specialty: "Psychiatry",
                subspecialties: ["Anxiety Disorders", "Depression Treatment"],
                experience: 11,
                location: "Mental Health Center, Colombo",
                rating: 4.8,
                reviews: 156,
                fee: 4500,
                available: true
            },
            {
                id: 9,
                name: "Helen Chang",
                specialty: "Ophthalmology",
                subspecialties: ["Cataract Surgery", "Retinal Disorders"],
                experience: 16,
                location: "Eye Care Center, Galle",
                rating: 4.6,
                reviews: 198,
                fee: 3800,
                available: true
            }
        ];
    }
}

// Global functions for booking and viewing profiles
function bookAppointment(doctorId) {
    window.location.href = `booking-new.html?doctor=${doctorId}`;
}

function viewDoctorProfile(doctorId) {
    window.location.href = `doctor-profile.html?id=${doctorId}`;
}

// Initialize based on page URL
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    let specialty = '';
    
    if (path.includes('cardiologists')) specialty = 'Cardiology';
    else if (path.includes('dermatologists')) specialty = 'Dermatology';
    else if (path.includes('orthopedic')) specialty = 'Orthopedics';
    else if (path.includes('pediatricians')) specialty = 'Pediatrics';
    else if (path.includes('general-physicians')) specialty = 'General Medicine';
    else if (path.includes('surgeons')) specialty = 'Surgery';
    else if (path.includes('gynecologists')) specialty = 'Gynecology';
    else if (path.includes('psychiatrists')) specialty = 'Psychiatry';
    else if (path.includes('eye-specialists')) specialty = 'Ophthalmology';
    
    if (specialty) {
        window.specialtySearch = new SpecialtyDoctorSearch(specialty);
    }
});