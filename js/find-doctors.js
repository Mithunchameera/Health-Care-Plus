// Find Doctors Page JavaScript

class DoctorSearchManager {
    constructor() {
        this.doctors = [];
        this.filteredDoctors = [];
        this.currentPage = 1;
        this.doctorsPerPage = 6;
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
        this.checkForHospitalFilter();
        this.setupSearchForm();
        this.setupFilters();
        this.setupSorting();
        this.setupPagination();
        console.log('Doctor search initialization complete');
    }

    checkForHospitalFilter() {
        // Check URL parameters for hospital filter
        const urlParams = new URLSearchParams(window.location.search);
        const hospitalParam = urlParams.get('hospital');
        
        // Check localStorage for selected hospital
        const selectedHospital = localStorage.getItem('selectedHospital');
        
        if (hospitalParam || selectedHospital) {
            const hospitalName = hospitalParam || selectedHospital;
            this.filterByHospital(hospitalName);
            
            // Update page title to show hospital filter
            this.updatePageTitleForHospital(hospitalName);
            
            // Clear localStorage after use
            localStorage.removeItem('selectedHospital');
        }
    }

    async filterByHospital(hospitalName) {
        try {
            const response = await fetch(`/php/doctors.php?hospital=${encodeURIComponent(hospitalName)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.doctors) {
                    this.filteredDoctors = data.doctors;
                    this.currentPage = 1;
                    this.renderDoctors();
                    this.updateResultsInfo();
                    

                }
            }
        } catch (error) {
            console.error('Error filtering by hospital:', error);
            // Fallback to filtering existing doctors
            this.fallbackFilterByHospital(hospitalName);
        }
    }

    fallbackFilterByHospital(hospitalName) {
        // Filter existing doctors by hospital name
        this.filteredDoctors = this.doctors.filter(doctor => 
            doctor.location && doctor.location.toLowerCase().includes(hospitalName.toLowerCase()) ||
            doctor.hospital && doctor.hospital.toLowerCase().includes(hospitalName.toLowerCase())
        );
        this.currentPage = 1;
        this.renderDoctors();
        this.updateResultsInfo();

    }

    updatePageTitleForHospital(hospitalName) {
        const heroTitle = document.querySelector('.search-hero h1');
        const heroSubtitle = document.querySelector('.search-hero p');
        
        if (heroTitle && heroSubtitle) {
            heroTitle.textContent = `Doctors at ${hospitalName}`;
            heroSubtitle.textContent = `Browse qualified doctors practicing at ${hospitalName}`;
        }
    }



    clearHospitalFilter() {
        // Remove hospital filter and show all doctors
        const indicator = document.querySelector('.hospital-filter-indicator');
        if (indicator) {
            indicator.remove();
        }
        
        // Reset to all doctors
        this.filteredDoctors = [...this.doctors];
        this.currentPage = 1;
        this.renderDoctors();
        this.updateResultsInfo();
        
        // Reset page title
        const heroTitle = document.querySelector('.search-hero h1');
        const heroSubtitle = document.querySelector('.search-hero p');
        
        if (heroTitle && heroSubtitle) {
            heroTitle.textContent = 'Find Your Doctor';
            heroSubtitle.textContent = 'Search and book appointments with qualified doctors across Sri Lanka';
        }
        
        // Update URL to remove hospital parameter
        const url = new URL(window.location);
        url.searchParams.delete('hospital');
        window.history.replaceState({}, '', url);
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
                    this.currentPage = 1; // Reset to first page
                    this.renderDoctors();
                    this.updateResultsInfo();
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
                name: 'Dr. Sarah Johnson',
                speciality: 'Cardiology',
                hospital: 'Medical Center',
                location: 'Downtown',
                rating: 4.8,
                reviewCount: 156,
                consultationFee: 3500,
                availability: 'Available Today',
                experience: '15 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 2,
                name: 'Dr. Michael Chen',
                speciality: 'Neurology',
                hospital: 'Neurological Institute',
                location: 'Uptown',
                rating: 4.9,
                reviewCount: 203,
                consultationFee: 4200,
                availability: 'Available Today',
                experience: '12 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 3,
                name: 'Dr. Emily Rodriguez',
                speciality: 'Pediatrics',
                hospital: 'Children\'s Hospital',
                location: 'Westside',
                rating: 4.7,
                reviewCount: 89,
                consultationFee: 2800,
                availability: 'Available Tomorrow',
                experience: '8 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 4,
                name: 'Dr. David Thompson',
                speciality: 'Orthopedics',
                hospital: 'Orthopedic Center',
                location: 'Central',
                rating: 4.6,
                reviewCount: 134,
                consultationFee: 3800,
                availability: 'Available This Week',
                experience: '20 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 5,
                name: 'Dr. Lisa Park',
                speciality: 'Dermatology',
                hospital: 'Dermatology Clinic',
                location: 'Eastside',
                rating: 4.5,
                reviewCount: 76,
                consultationFee: 3200,
                availability: 'Available Today',
                experience: '10 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 6,
                name: 'Dr. Robert Williams',
                speciality: 'Internal Medicine',
                hospital: 'Primary Care Center',
                location: 'Midtown',
                rating: 4.7,
                reviewCount: 242,
                consultationFee: 2900,
                availability: 'Available Tomorrow',
                experience: '18 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 7,
                name: 'Dr. Amanda Foster',
                speciality: 'Obstetrics & Gynecology',
                hospital: 'Women\'s Health Center',
                location: 'Northside',
                rating: 4.9,
                reviewCount: 187,
                consultationFee: 4100,
                availability: 'Available Today',
                experience: '14 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 8,
                name: 'Dr. James Martinez',
                speciality: 'Psychiatry',
                hospital: 'Mental Health Center',
                location: 'Downtown',
                rating: 4.8,
                reviewCount: 156,
                consultationFee: 4800,
                availability: 'Available This Week',
                experience: '11 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 9,
                name: 'Dr. Helen Chang',
                speciality: 'Ophthalmology',
                hospital: 'Eye Care Center',
                location: 'Westside',
                rating: 4.6,
                reviewCount: 198,
                consultationFee: 4500,
                availability: 'Available Tomorrow',
                experience: '16 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 10,
                name: 'Dr. Thomas Anderson',
                speciality: 'Gastroenterology',
                hospital: 'Digestive Health Center',
                location: 'Central',
                rating: 4.7,
                reviewCount: 134,
                consultationFee: 4000,
                availability: 'Available Today',
                experience: '13 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 11,
                name: 'Dr. Maria Gonzalez',
                speciality: 'Endocrinology',
                hospital: 'Hormone Health Clinic',
                location: 'Southside',
                rating: 4.8,
                reviewCount: 112,
                consultationFee: 3600,
                availability: 'Available Today',
                experience: '9 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 12,
                name: 'Dr. Kevin Lee',
                speciality: 'Urology',
                hospital: 'Urology Associates',
                location: 'Eastside',
                rating: 4.5,
                reviewCount: 167,
                consultationFee: 4300,
                availability: 'Available This Week',
                experience: '17 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 13,
                name: 'Dr. Rachel Kim',
                speciality: 'Oncology',
                hospital: 'Cancer Treatment Center',
                location: 'Downtown',
                rating: 4.9,
                reviewCount: 245,
                consultationFee: 5200,
                availability: 'Available Tomorrow',
                experience: '19 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 14,
                name: 'Dr. Steven Clark',
                speciality: 'Emergency Medicine',
                hospital: 'Emergency Medical Center',
                location: 'Central',
                rating: 4.6,
                reviewCount: 178,
                consultationFee: 3700,
                availability: 'Available Today',
                experience: '12 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 15,
                name: 'Dr. Jessica Wright',
                speciality: 'Rheumatology',
                hospital: 'Arthritis & Rheumatism Center',
                location: 'Northside',
                rating: 4.7,
                reviewCount: 129,
                consultationFee: 3900,
                availability: 'Available This Week',
                experience: '14 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 16,
                name: 'Dr. Mark Davis',
                speciality: 'Pulmonology',
                hospital: 'Respiratory Health Institute',
                location: 'Westside',
                rating: 4.8,
                reviewCount: 165,
                consultationFee: 4100,
                availability: 'Available Tomorrow',
                experience: '16 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 17,
                name: 'Dr. Nina Patel',
                speciality: 'Nephrology',
                hospital: 'Kidney Care Center',
                location: 'Eastside',
                rating: 4.6,
                reviewCount: 143,
                consultationFee: 3800,
                availability: 'Available Today',
                experience: '13 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 18,
                name: 'Dr. Christopher Wilson',
                speciality: 'Infectious Disease',
                hospital: 'Infectious Disease Institute',
                location: 'Midtown',
                rating: 4.7,
                reviewCount: 156,
                consultationFee: 4400,
                availability: 'Available This Week',
                experience: '15 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 19,
                name: 'Dr. Samantha Brown',
                speciality: 'Plastic Surgery',
                hospital: 'Aesthetic Surgery Center',
                location: 'Downtown',
                rating: 4.9,
                reviewCount: 234,
                consultationFee: 5500,
                availability: 'Available Tomorrow',
                experience: '18 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 20,
                name: 'Dr. Daniel Taylor',
                speciality: 'Anesthesiology',
                hospital: 'Surgical Care Center',
                location: 'Central',
                rating: 4.5,
                reviewCount: 98,
                consultationFee: 3500,
                availability: 'Available Today',
                experience: '11 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 21,
                name: 'Dr. Catherine Miller',
                speciality: 'Pathology',
                hospital: 'Diagnostic Laboratory',
                location: 'Northside',
                rating: 4.8,
                reviewCount: 187,
                consultationFee: 3300,
                availability: 'Available This Week',
                experience: '17 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 22,
                name: 'Dr. Anthony Garcia',
                speciality: 'Radiology',
                hospital: 'Imaging Center',
                location: 'Southside',
                rating: 4.6,
                reviewCount: 145,
                consultationFee: 3600,
                availability: 'Available Tomorrow',
                experience: '14 years',
                avatar: '👨‍⚕️'
            },
            {
                id: 23,
                name: 'Dr. Laura White',
                speciality: 'Sports Medicine',
                hospital: 'Sports Medicine Institute',
                location: 'Westside',
                rating: 4.7,
                reviewCount: 176,
                consultationFee: 4200,
                availability: 'Available Today',
                experience: '12 years',
                avatar: '👩‍⚕️'
            },
            {
                id: 24,
                name: 'Dr. Richard Moore',
                speciality: 'Family Medicine',
                hospital: 'Family Health Center',
                location: 'Eastside',
                rating: 4.8,
                reviewCount: 298,
                consultationFee: 2700,
                availability: 'Available Today',
                experience: '20 years',
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
                    // Scroll to top of doctor list when Previous is clicked
                    this.scrollToTopOfList();
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
                    // Scroll to top of doctor list when Next is clicked
                    this.scrollToTopOfList();
                }
            });
        }
    }

    scrollToTopOfList() {
        const doctorsGrid = document.getElementById('doctors-grid');
        if (doctorsGrid) {
            doctorsGrid.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
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
        
        console.log('Rendering', this.filteredDoctors.length, 'total doctors, page', this.currentPage);

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.doctorsPerPage;
        const endIndex = startIndex + this.doctorsPerPage;
        const doctorsToShow = this.filteredDoctors.slice(startIndex, endIndex);
        
        console.log('Showing doctors', startIndex + 1, 'to', Math.min(endIndex, this.filteredDoctors.length), 'of', this.filteredDoctors.length);

        if (doctorsToShow.length === 0) {
            doctorsGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>No doctors found</h3>
                    <p>Try adjusting your search criteria or filters</p>
                    <button class="btn-clear-filters" onclick="doctorSearchManager.clearAllFilters()">Clear All Filters</button>
                </div>
            `;
            this.updatePagination();
            return;
        }

        const doctorCards = doctorsToShow.map(doctor => this.createDoctorCard(doctor)).join('');
        doctorsGrid.innerHTML = doctorCards;
        console.log('Rendered', doctorsToShow.length, 'doctor cards on page', this.currentPage);
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
                    <button class="btn-book-appointment" onclick="bookAppointment('${doctor.id}')">📅 Book Appointment</button>
                    <button class="btn-view-profile" onclick="viewDoctorProfile('${doctor.id}')">👁️ View Profile</button>
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
            
            // Scroll to top of doctor list
            this.scrollToTopOfList();
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