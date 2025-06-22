// Find Doctors Page JavaScript

class DoctorSearchManager {
    constructor() {
        this.doctors = [];
        this.filteredDoctors = [];
        this.currentPage = 1;
        this.doctorsPerPage = 12;
        this.filters = {
            speciality: '',
            location: '',
            availability: [],
            rating: [],
            fee: []
        };
        this.sortBy = 'relevance';
        this.initializeDoctorSearch();
    }

    async initializeDoctorSearch() {
        console.log('Initializing doctor search...');
        await this.loadDoctorsData();
        this.setupSearchForm();
        this.setupFilters();
        this.setupSorting();
        this.setupPagination();
        console.log('Doctor search initialization complete');
    }

    async loadDoctorsData() {
        try {
            // Try to load from API first
            const response = await fetch('/php/doctors.php');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.doctors) {
                    this.doctors = data.doctors;
                    this.filteredDoctors = [...this.doctors];
                    console.log('API data loaded:', this.doctors.length, 'doctors');
                    this.renderDoctors();
                    return;
                }
            }
        } catch (error) {
            console.log('API unavailable, using static data');
        }
        
        // Fallback to static data
        this.doctors = [
            {
                id: 1,
                name: 'Dr. Kasun Perera',
                speciality: 'Cardiology',
                hospital: 'Apollo Hospital',
                location: 'Colombo',
                rating: 4.8,
                reviewCount: 156,
                consultationFee: 3500,
                availability: 'Available Today',
                experience: '15 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 2,
                name: 'Dr. Sarah Wilson',
                speciality: 'Dermatology',
                hospital: 'Asiri Hospital',
                location: 'Colombo',
                rating: 4.9,
                reviewCount: 203,
                consultationFee: 4000,
                availability: 'Available Tomorrow',
                experience: '12 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 3,
                name: 'Dr. Michael Silva',
                speciality: 'Orthopedic Surgery',
                hospital: 'Nawaloka Hospital',
                location: 'Colombo',
                rating: 4.7,
                reviewCount: 189,
                consultationFee: 5500,
                availability: 'Available Today',
                experience: '18 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 4,
                name: 'Dr. Priya Jayawardena',
                speciality: 'Pediatrics',
                hospital: 'Lanka Hospital',
                location: 'Colombo',
                rating: 4.9,
                reviewCount: 267,
                consultationFee: 3000,
                availability: 'Available This Week',
                experience: '10 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 5,
                name: 'Dr. Rajesh Fernando',
                speciality: 'General Medicine',
                hospital: 'Durdans Hospital',
                location: 'Colombo',
                rating: 4.6,
                reviewCount: 145,
                consultationFee: 2500,
                availability: 'Available Today',
                experience: '20 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 6,
                name: 'Dr. Amani Perera',
                speciality: 'Gynecology',
                hospital: 'Asiri Hospital',
                location: 'Kandy',
                rating: 4.8,
                reviewCount: 178,
                consultationFee: 4500,
                availability: 'Available Tomorrow',
                experience: '14 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 7,
                name: 'Dr. Michael Johnson',
                speciality: 'Neurology',
                hospital: 'National Hospital',
                location: 'Colombo',
                rating: 4.9,
                reviewCount: 312,
                consultationFee: 6000,
                availability: 'Available Today',
                experience: '22 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 8,
                name: 'Dr. Lakshmi Dias',
                speciality: 'Ophthalmology',
                hospital: 'Eye Hospital',
                location: 'Colombo',
                rating: 4.8,
                reviewCount: 198,
                consultationFee: 3800,
                availability: 'Available Today',
                experience: '16 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 9,
                name: 'Dr. Rohan Wickramasinghe',
                speciality: 'ENT',
                hospital: 'Asiri Hospital',
                location: 'Galle',
                rating: 4.7,
                reviewCount: 134,
                consultationFee: 3200,
                availability: 'Available Tomorrow',
                experience: '13 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 10,
                name: 'Dr. Kavitha Rathnayake',
                speciality: 'Psychiatry',
                hospital: 'Lanka Hospital',
                location: 'Colombo',
                rating: 4.9,
                reviewCount: 245,
                consultationFee: 4200,
                availability: 'Available Today',
                experience: '17 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 11,
                name: 'Dr. Saman Gunawardena',
                speciality: 'Urology',
                hospital: 'Apollo Hospital',
                location: 'Colombo',
                rating: 4.6,
                reviewCount: 167,
                consultationFee: 4800,
                availability: 'Available Tomorrow',
                experience: '19 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 12,
                name: 'Dr. Nimesha Jayawardena',
                speciality: 'Radiology',
                hospital: 'Durdans Hospital',
                location: 'Colombo',
                rating: 4.7,
                reviewCount: 156,
                consultationFee: 3600,
                availability: 'Available Today',
                experience: '11 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 13,
                name: 'Dr. Chaminda Mendis',
                speciality: 'Gastroenterology',
                hospital: 'Nawaloka Hospital',
                location: 'Kandy',
                rating: 4.8,
                reviewCount: 189,
                consultationFee: 5200,
                availability: 'Available Today',
                experience: '21 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 14,
                name: 'Dr. Anura Samaranayake',
                speciality: 'Pulmonology',
                hospital: 'Teaching Hospital',
                location: 'Kandy',
                rating: 4.7,
                reviewCount: 112,
                consultationFee: 3400,
                availability: 'Available Tomorrow',
                experience: '14 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 15,
                name: 'Dr. Niluka Perera',
                speciality: 'Endocrinology',
                hospital: 'Lanka Hospital',
                location: 'Colombo',
                rating: 4.9,
                reviewCount: 223,
                consultationFee: 4600,
                availability: 'Available Today',
                experience: '16 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 16,
                name: 'Dr. Ruwan Amarasinghe',
                speciality: 'Oncology',
                hospital: 'Cancer Institute',
                location: 'Colombo',
                rating: 4.9,
                reviewCount: 278,
                consultationFee: 7000,
                availability: 'Available Tomorrow',
                experience: '25 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 17,
                name: 'Dr. Ishara Wickramage',
                speciality: 'Rheumatology',
                hospital: 'Asiri Hospital',
                location: 'Colombo',
                rating: 4.6,
                reviewCount: 145,
                consultationFee: 3900,
                availability: 'Available Today',
                experience: '12 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 18,
                name: 'Dr. Mahesh Kumarasinghe',
                speciality: 'Plastic Surgery',
                hospital: 'Apollo Hospital',
                location: 'Colombo',
                rating: 4.8,
                reviewCount: 167,
                consultationFee: 8000,
                availability: 'Available Tomorrow',
                experience: '18 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 19,
                name: 'Dr. Sanduni Rajapakse',
                speciality: 'Anesthesiology',
                hospital: 'National Hospital',
                location: 'Colombo',
                rating: 4.7,
                reviewCount: 134,
                consultationFee: 3300,
                availability: 'Available Today',
                experience: '13 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 20,
                name: 'Dr. Upul Dissanayake',
                speciality: 'Emergency Medicine',
                hospital: 'General Hospital',
                location: 'Galle',
                rating: 4.8,
                reviewCount: 189,
                consultationFee: 2800,
                availability: 'Available Today',
                experience: '15 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 21,
                name: 'Dr. Dilani Wijesinghe',
                speciality: 'Pathology',
                hospital: 'Medical Research Institute',
                location: 'Colombo',
                rating: 4.6,
                reviewCount: 98,
                consultationFee: 3100,
                availability: 'Available Tomorrow',
                experience: '14 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 22,
                name: 'Dr. Arjuna Herath',
                speciality: 'Sports Medicine',
                hospital: 'Sports Medicine Center',
                location: 'Colombo',
                rating: 4.7,
                reviewCount: 156,
                consultationFee: 4400,
                availability: 'Available Today',
                experience: '11 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 23,
                name: 'Dr. Chandima Jayasuriya',
                speciality: 'Geriatrics',
                hospital: 'Elder Care Hospital',
                location: 'Kandy',
                rating: 4.8,
                reviewCount: 167,
                consultationFee: 3700,
                availability: 'Available Tomorrow',
                experience: '20 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 24,
                name: 'Dr. Nalin Wickremaratne',
                speciality: 'Family Medicine',
                hospital: 'Community Health Center',
                location: 'Galle',
                rating: 4.5,
                reviewCount: 123,
                consultationFee: 2200,
                availability: 'Available Today',
                experience: '16 years',
                avatar: '👨‍⚕️'
            }
        ];

        this.filteredDoctors = [...this.doctors];
        console.log('Static data loaded:', this.doctors.length, 'doctors');
        this.setupSpecialtyButtons();
        this.renderDoctors();
    }

    setupSearchForm() {
        const searchForm = document.getElementById('doctor-search-form');
        const specialitySelect = document.getElementById('speciality-select');
        const locationSelect = document.getElementById('location-select');
        const doctorNameInput = document.getElementById('doctor-name-input');

        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }

        // Real-time search on input changes
        [specialitySelect, locationSelect, doctorNameInput].forEach(element => {
            if (element) {
                element.addEventListener('change', () => this.performSearch());
                if (element.type === 'text') {
                    element.addEventListener('input', this.debounce(() => this.performSearch(), 300));
                }
            }
        });
    }

    setupFilters() {
        const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.applyFilters());
        });

        const clearFiltersBtn = document.querySelector('.btn-clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        }
    }

    setupSorting() {
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.sortDoctors();
                this.renderDoctors();
            });
        }
    }

    setupPagination() {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderDoctors();
                    this.updatePagination();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.filteredDoctors.length / this.doctorsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderDoctors();
                    this.updatePagination();
                }
            });
        }
    }

    performSearch() {
        const speciality = document.getElementById('speciality-select')?.value || '';
        const location = document.getElementById('location-select')?.value || '';
        const doctorName = document.getElementById('doctor-name-input')?.value || '';

        this.filters.speciality = speciality;
        this.filters.location = location;

        this.filteredDoctors = this.doctors.filter(doctor => {
            const matchesSpeciality = !speciality || 
                doctor.speciality.toLowerCase().includes(speciality.toLowerCase());
            const matchesLocation = !location || 
                doctor.location.toLowerCase().includes(location.toLowerCase());
            const matchesName = !doctorName || 
                doctor.name.toLowerCase().includes(doctorName.toLowerCase()) ||
                doctor.hospital.toLowerCase().includes(doctorName.toLowerCase());

            return matchesSpeciality && matchesLocation && matchesName;
        });

        this.applyFilters();
        this.currentPage = 1;
        this.renderDoctors();
        this.updateResultsInfo();
    }

    applyFilters() {
        const availabilityFilters = Array.from(document.querySelectorAll('.filter-checkbox[value="today"], .filter-checkbox[value="tomorrow"], .filter-checkbox[value="week"]'))
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const ratingFilters = Array.from(document.querySelectorAll('.filter-checkbox[value="5"], .filter-checkbox[value="4"], .filter-checkbox[value="3"]'))
            .filter(cb => cb.checked)
            .map(cb => parseInt(cb.value));

        const feeFilters = Array.from(document.querySelectorAll('.filter-checkbox[value="low"], .filter-checkbox[value="medium"], .filter-checkbox[value="high"]'))
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        let filtered = [...this.filteredDoctors];

        // Apply availability filter
        if (availabilityFilters.length > 0) {
            filtered = filtered.filter(doctor => {
                return availabilityFilters.some(filter => {
                    switch (filter) {
                        case 'today':
                            return doctor.availability.includes('Today');
                        case 'tomorrow':
                            return doctor.availability.includes('Tomorrow');
                        case 'week':
                            return doctor.availability.includes('Week');
                        default:
                            return true;
                    }
                });
            });
        }

        // Apply rating filter
        if (ratingFilters.length > 0) {
            const minRating = Math.min(...ratingFilters);
            filtered = filtered.filter(doctor => doctor.rating >= minRating);
        }

        // Apply fee filter
        if (feeFilters.length > 0) {
            filtered = filtered.filter(doctor => {
                return feeFilters.some(filter => {
                    switch (filter) {
                        case 'low':
                            return doctor.consultationFee < 2000;
                        case 'medium':
                            return doctor.consultationFee >= 2000 && doctor.consultationFee <= 5000;
                        case 'high':
                            return doctor.consultationFee > 5000;
                        default:
                            return true;
                    }
                });
            });
        }

        this.filteredDoctors = filtered;
        this.currentPage = 1;
        this.renderDoctors();
        this.updateResultsInfo();
    }

    clearAllFilters() {
        // Clear all checkboxes
        document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear search form
        document.getElementById('speciality-select').value = '';
        document.getElementById('location-select').value = '';
        document.getElementById('doctor-name-input').value = '';

        // Reset filters
        this.filters = {
            speciality: '',
            location: '',
            availability: [],
            rating: [],
            fee: []
        };

        // Reset data
        this.filteredDoctors = [...this.doctors];
        this.currentPage = 1;
        this.renderDoctors();
        this.updateResultsInfo();
    }

    sortDoctors() {
        switch (this.sortBy) {
            case 'rating':
                this.filteredDoctors.sort((a, b) => b.rating - a.rating);
                break;
            case 'fee-low':
                this.filteredDoctors.sort((a, b) => a.consultationFee - b.consultationFee);
                break;
            case 'fee-high':
                this.filteredDoctors.sort((a, b) => b.consultationFee - a.consultationFee);
                break;
            case 'availability':
                this.filteredDoctors.sort((a, b) => {
                    const order = ['Available Today', 'Available Tomorrow', 'Available This Week'];
                    return order.indexOf(a.availability) - order.indexOf(b.availability);
                });
                break;
            case 'relevance':
            default:
                // Keep original order for relevance
                break;
        }
    }

    renderDoctors() {
        const doctorsGrid = document.getElementById('doctors-grid');
        if (!doctorsGrid) {
            console.error('Doctors grid element not found');
            return;
        }
        
        console.log('Rendering', this.filteredDoctors.length, 'doctors');

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.doctorsPerPage;
        const endIndex = startIndex + this.doctorsPerPage;
        const doctorsToShow = this.filteredDoctors.slice(startIndex, endIndex);

        if (doctorsToShow.length === 0) {
            doctorsGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>No doctors found</h3>
                    <p>Try adjusting your search criteria or filters</p>
                    <button class="btn-clear-filters" onclick="doctorSearchManager.clearAllFilters()">Clear All Filters</button>
                </div>
            `;
            return;
        }

        const doctorCards = doctorsToShow.map(doctor => this.createDoctorCard(doctor)).join('');
        doctorsGrid.innerHTML = doctorCards;
        console.log('Rendered', doctorsToShow.length, 'doctor cards');
        this.updatePagination();
        this.updateResultsInfo();
    }

    createDoctorCard(doctor) {
        const stars = '⭐'.repeat(Math.floor(doctor.rating));
        
        return `
            <div class="doctor-card" data-doctor-id="${doctor.id}">
                <div class="doctor-header">
                    <div class="doctor-avatar">${doctor.avatar}</div>
                    <div class="doctor-info">
                        <h3>${doctor.name}</h3>
                        <div class="doctor-speciality">${doctor.speciality}</div>
                        <div class="doctor-hospital">${doctor.hospital}</div>
                        <div class="doctor-rating">
                            <span class="rating-stars">${stars}</span>
                            <span class="rating-score">${doctor.rating}</span>
                            <span class="rating-count">(${doctor.reviewCount} reviews)</span>
                        </div>
                    </div>
                </div>
                
                <div class="doctor-details">
                    <div class="detail-row">
                        <span class="detail-label">Experience:</span>
                        <span class="detail-value">${doctor.experience}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Consultation Fee:</span>
                        <span class="detail-value consultation-fee">Rs. ${doctor.consultationFee.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Availability:</span>
                        <span class="detail-value availability">${doctor.availability}</span>
                    </div>
                </div>
                
                <div class="doctor-actions">
                    <button class="btn-book-appointment" onclick="bookAppointment(${doctor.id})">📅 Book Appointment</button>
                    <button class="btn-view-profile" onclick="viewDoctorProfile(${doctor.id})">👁️ View Profile</button>
                </div>
            </div>
        `;
    }

    updateResultsInfo() {
        const resultsCount = document.getElementById('results-count');
        const resultsDescription = document.getElementById('results-description');

        if (resultsCount) {
            const count = this.filteredDoctors.length;
            resultsCount.textContent = `Showing ${count} doctor${count !== 1 ? 's' : ''}`;
        }

        if (resultsDescription) {
            if (this.filteredDoctors.length === 0) {
                resultsDescription.textContent = 'No doctors match your search criteria';
            } else {
                resultsDescription.textContent = 'Find the right doctor for your needs';
            }
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredDoctors.length / this.doctorsPerPage);
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages;
        }

        // Update page numbers
        const pageNumbers = document.querySelector('.pagination-numbers');
        if (pageNumbers) {
            pageNumbers.innerHTML = this.generatePageNumbers(totalPages);
        }
    }

    generatePageNumbers(totalPages) {
        let html = '';
        const current = this.currentPage;
        
        // Always show first page
        html += `<span class="page-number ${current === 1 ? 'active' : ''}" onclick="doctorSearchManager.goToPage(1)">1</span>`;
        
        if (totalPages <= 7) {
            // Show all pages
            for (let i = 2; i <= totalPages; i++) {
                html += `<span class="page-number ${current === i ? 'active' : ''}" onclick="doctorSearchManager.goToPage(${i})">${i}</span>`;
            }
        } else {
            // Show condensed pagination
            if (current > 3) {
                html += '<span class="pagination-dots">...</span>';
            }
            
            const start = Math.max(2, current - 1);
            const end = Math.min(totalPages - 1, current + 1);
            
            for (let i = start; i <= end; i++) {
                html += `<span class="page-number ${current === i ? 'active' : ''}" onclick="doctorSearchManager.goToPage(${i})">${i}</span>`;
            }
            
            if (current < totalPages - 2) {
                html += '<span class="pagination-dots">...</span>';
            }
            
            // Always show last page
            if (totalPages > 1) {
                html += `<span class="page-number ${current === totalPages ? 'active' : ''}" onclick="doctorSearchManager.goToPage(${totalPages})">${totalPages}</span>`;
            }
        }
        
        return html;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredDoctors.length / this.doctorsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderDoctors();
            this.updatePagination();
            
            // Scroll to top of results
            document.querySelector('.doctors-main').scrollIntoView({ behavior: 'smooth' });
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Global functions for button actions
function bookAppointment(doctorId) {
    console.log('Booking appointment with doctor ID:', doctorId);
    // In a real implementation, this would open a booking modal or redirect to booking page
    alert('Booking system will be implemented. Doctor ID: ' + doctorId);
}

function viewDoctorProfile(doctorId) {
    console.log('Viewing profile for doctor ID:', doctorId);
    // In a real implementation, this would open a profile modal or redirect to profile page
    window.location.href = `doctor-profile.html?id=${doctorId}`;
}

// Initialize doctor search manager
let doctorSearchManager;
window.DoctorSearchManager = DoctorSearchManager;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing doctor search...');
    doctorSearchManager = new DoctorSearchManager();
});



// Add CSS for no results
const doctorSearchStyles = `
.no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: var(--spacing-2xl);
    background: var(--light-gray);
    border-radius: var(--radius-xl);
}

.no-results-icon {
    font-size: 64px;
    margin-bottom: var(--spacing-lg);
}

.no-results h3 {
    font-size: var(--font-size-xl);
    color: var(--primary-blue-dark);
    margin-bottom: var(--spacing-md);
}

.no-results p {
    color: var(--text-gray);
    margin-bottom: var(--spacing-lg);
}

.no-results .btn-clear-filters {
    background: var(--primary-blue);
    color: var(--white);
    border: none;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all 0.3s ease;
}

.no-results .btn-clear-filters:hover {
    background-color: var(--primary-blue-light);
}
`;

// Inject styles
const doctorStyleSheet = document.createElement('style');
doctorStyleSheet.textContent = doctorSearchStyles;
document.head.appendChild(doctorStyleSheet);