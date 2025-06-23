/**
 * Hospital Page Manager
 * Handles individual hospital page functionality including doctor listings
 */

class HospitalPageManager {
    constructor() {
        this.doctors = [];
        this.filteredDoctors = [];
        this.currentPage = 1;
        this.doctorsPerPage = 6;
        this.hospitalName = '';
    }

    async init() {
        // Get hospital name from page
        this.hospitalName = this.getHospitalName();
        
        // Load doctors for this hospital
        await this.loadHospitalDoctors();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    getHospitalName() {
        const breadcrumb = document.querySelector('.breadcrumb-current');
        return breadcrumb ? breadcrumb.textContent.trim() : 'Hospital';
    }

    async loadHospitalDoctors() {
        try {
            // Load all doctors and filter by hospital
            const response = await fetch('/php/doctors.php');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.doctors) {
                    // Filter doctors for this specific hospital
                    this.doctors = data.doctors.filter(doctor => 
                        this.isHospitalMatch(doctor, this.hospitalName)
                    );
                    this.filteredDoctors = [...this.doctors];
                    this.renderDoctors();
                    this.updatePagination();
                }
            }
        } catch (error) {
            console.error('Error loading hospital doctors:', error);
            this.loadMockDoctors();
        }
        
        // Always load temporary doctors for all hospitals
        this.loadTemporaryDoctors();
    }

    loadTemporaryDoctors() {
        // Temporary doctors data for all hospitals
        const tempDoctors = [
            {
                id: 'temp1',
                name: 'Dr. Priya Mendis',
                specialty: 'Cardiology',
                experience: 15,
                fee: 3500,
                rating: 4.8,
                reviews: 124,
                available: true,
                hospital: this.hospitalName,
                languages: ['English', 'Sinhala'],
                qualifications: 'MBBS, MD (Cardiology)',
                nextAvailable: 'Today 2:00 PM'
            },
            {
                id: 'temp2',
                name: 'Dr. Rajesh Silva',
                specialty: 'Orthopedics',
                experience: 12,
                fee: 4000,
                rating: 4.7,
                reviews: 98,
                available: true,
                hospital: this.hospitalName,
                languages: ['English', 'Sinhala'],
                qualifications: 'MBBS, MS (Orthopedics)',
                nextAvailable: 'Tomorrow 10:00 AM'
            },
            {
                id: 'temp3',
                name: 'Dr. Kushani Fernando',
                specialty: 'Pediatrics',
                experience: 10,
                fee: 3000,
                rating: 4.9,
                reviews: 156,
                available: true,
                hospital: this.hospitalName,
                languages: ['English', 'Sinhala'],
                qualifications: 'MBBS, DCH, MD (Pediatrics)',
                nextAvailable: 'Today 4:30 PM'
            },
            {
                id: 'temp4',
                name: 'Dr. Amila Perera',
                specialty: 'Neurology',
                experience: 18,
                fee: 5000,
                rating: 4.6,
                reviews: 87,
                available: false,
                hospital: this.hospitalName,
                languages: ['English', 'Sinhala'],
                qualifications: 'MBBS, MD (Neurology)',
                nextAvailable: 'Next Week'
            },
            {
                id: 'temp5',
                name: 'Dr. Sanduni Jayasekara',
                specialty: 'Dermatology',
                experience: 8,
                fee: 3500,
                rating: 4.8,
                reviews: 112,
                available: true,
                hospital: this.hospitalName,
                languages: ['English', 'Sinhala'],
                qualifications: 'MBBS, MD (Dermatology)',
                nextAvailable: 'Today 6:00 PM'
            },
            {
                id: 'temp6',
                name: 'Dr. Kamal Bandara',
                specialty: 'General Medicine',
                experience: 14,
                fee: 2500,
                rating: 4.5,
                reviews: 203,
                available: true,
                hospital: this.hospitalName,
                languages: ['English', 'Sinhala'],
                qualifications: 'MBBS, MD (Internal Medicine)',
                nextAvailable: 'Today 1:00 PM'
            }
        ];

        // Add temporary doctors to the list
        this.doctors = [...this.doctors, ...tempDoctors];
        this.filteredDoctors = [...this.doctors];
        this.renderDoctors();
        this.updatePagination();
    }

    isHospitalMatch(doctor, hospitalName) {
        const hospitalLower = hospitalName.toLowerCase();
        const doctorHospital = (doctor.hospital || '').toLowerCase();
        const doctorLocation = (doctor.location || '').toLowerCase();
        
        // Check if hospital name matches
        if (doctorHospital.includes(hospitalLower) || 
            hospitalLower.includes(doctorHospital)) {
            return true;
        }
        
        // Check specific hospital mappings
        const hospitalMappings = {
            'apollo hospital': ['apollo', 'heart center', 'medical center'],
            'asiri hospital': ['asiri', 'central hospital'],
            'nawaloka hospital': ['nawaloka', 'healthcare'],
            'durdans hospital': ['durdans', 'private hospital'],
            'lanka hospital': ['lanka', 'diagnostic'],
            'national hospital': ['national', 'general hospital'],
            'teaching hospital kandy': ['teaching', 'kandy', 'university'],
            'karapitiya teaching hospital': ['karapitiya', 'galle', 'southern'],
            'hemas hospital wattala': ['hemas', 'wattala', 'suburban'],
            'base hospital negombo': ['base', 'negombo', 'district'],
            'asiri central hospital': ['asiri central', 'colombo central']
        };
        
        const mapping = hospitalMappings[hospitalLower];
        if (mapping) {
            return mapping.some(keyword => 
                doctorHospital.includes(keyword) || 
                doctorLocation.includes(keyword)
            );
        }
        
        return false;
    }

    loadMockDoctors() {
        // Comprehensive doctor database for all hospitals
        const allDoctors = [
            // Apollo Hospital Doctors
            {
                id: 1,
                name: 'Dr. Rajesh Kumar',
                specialty: 'Cardiology',
                hospital: 'Apollo Hospital',
                rating: 4.9,
                reviewCount: 156,
                consultationFee: 3500,
                experience: '15 years',
                availability: 'Available Today',
                qualifications: 'MBBS, MD (Cardiology), FACC',
                languages: ['English', 'Hindi', 'Tamil']
            },
            {
                id: 2,
                name: 'Dr. Priya Sharma',
                specialty: 'Neurology',
                hospital: 'Apollo Hospital',
                rating: 4.8,
                reviewCount: 203,
                consultationFee: 4000,
                experience: '12 years',
                availability: 'Available Tomorrow',
                qualifications: 'MBBS, MD (Neurology), DNB',
                languages: ['English', 'Hindi']
            },
            {
                id: 3,
                name: 'Dr. Michael Fernando',
                specialty: 'Orthopedics',
                hospital: 'Apollo Hospital',
                rating: 4.7,
                reviewCount: 189,
                consultationFee: 3800,
                experience: '18 years',
                availability: 'Available Today',
                qualifications: 'MBBS, MS (Orthopedics), FRCS',
                languages: ['English', 'Sinhala']
            },
            {
                id: 4,
                name: 'Dr. Sarah Thompson',
                specialty: 'Pediatrics',
                hospital: 'Apollo Hospital',
                rating: 4.9,
                reviewCount: 245,
                consultationFee: 3200,
                experience: '14 years',
                availability: 'Available Today',
                qualifications: 'MBBS, MD (Pediatrics), MRCPCH',
                languages: ['English']
            },
            {
                id: 5,
                name: 'Dr. Anil Wickramasinghe',
                specialty: 'Gynecology',
                hospital: 'Apollo Hospital',
                rating: 4.8,
                reviewCount: 167,
                consultationFee: 3600,
                experience: '20 years',
                availability: 'Available Tomorrow',
                qualifications: 'MBBS, MS (Obstetrics & Gynecology)',
                languages: ['English', 'Sinhala']
            },

            // Asiri Hospital Doctors
            {
                id: 6,
                name: 'Dr. Chaminda Silva',
                specialty: 'Cardiology',
                hospital: 'Asiri Hospital',
                rating: 4.7,
                reviewCount: 134,
                consultationFee: 3400,
                experience: '16 years',
                availability: 'Available Today',
                qualifications: 'MBBS, MD (Cardiology), MRCP',
                languages: ['English', 'Sinhala']
            },
            {
                id: 7,
                name: 'Dr. Nirmala Perera',
                specialty: 'Dermatology',
                hospital: 'Asiri Hospital',
                rating: 4.8,
                reviewCount: 98,
                consultationFee: 3000,
                experience: '11 years',
                availability: 'Available Tomorrow',
                qualifications: 'MBBS, MD (Dermatology)',
                languages: ['English', 'Sinhala']
            },
            {
                id: 8,
                name: 'Dr. Robert Wilson',
                specialty: 'General Surgery',
                hospital: 'Asiri Hospital',
                rating: 4.6,
                reviewCount: 156,
                consultationFee: 4200,
                experience: '22 years',
                availability: 'Available This Week',
                qualifications: 'MBBS, MS (General Surgery), FRCS',
                languages: ['English']
            },
            {
                id: 9,
                name: 'Dr. Kumari Jayawardena',
                specialty: 'Pediatrics',
                hospital: 'Asiri Hospital',
                rating: 4.9,
                reviewCount: 187,
                consultationFee: 2800,
                experience: '13 years',
                availability: 'Available Today',
                qualifications: 'MBBS, MD (Pediatrics)',
                languages: ['English', 'Sinhala']
            },

            // Nawaloka Hospital Doctors
            {
                id: 10,
                name: 'Dr. Sunil Ratnayake',
                specialty: 'Orthopedics',
                hospital: 'Nawaloka Hospital',
                rating: 4.7,
                reviewCount: 112,
                consultationFee: 3500,
                experience: '17 years',
                availability: 'Available Tomorrow',
                qualifications: 'MBBS, MS (Orthopedic Surgery)',
                languages: ['English', 'Sinhala']
            },
            {
                id: 11,
                name: 'Dr. Amanda Roberts',
                specialty: 'Ophthalmology',
                hospital: 'Nawaloka Hospital',
                rating: 4.8,
                reviewCount: 89,
                consultationFee: 3300,
                experience: '9 years',
                availability: 'Available Today',
                qualifications: 'MBBS, MS (Ophthalmology)',
                languages: ['English']
            },
            {
                id: 12,
                name: 'Dr. Prasad Mendis',
                specialty: 'Gastroenterology',
                hospital: 'Nawaloka Hospital',
                rating: 4.6,
                reviewCount: 145,
                consultationFee: 3800,
                experience: '15 years',
                availability: 'Available This Week',
                qualifications: 'MBBS, MD (Gastroenterology)',
                languages: ['English', 'Sinhala']
            },

            // Durdans Hospital Doctors
            {
                id: 13,
                name: 'Dr. Elizabeth Mitchell',
                specialty: 'Internal Medicine',
                hospital: 'Durdans Hospital',
                rating: 4.8,
                reviewCount: 123,
                consultationFee: 3200,
                experience: '18 years',
                availability: 'Available Today',
                qualifications: 'MBBS, MD (Internal Medicine), MRCP',
                languages: ['English']
            },
            {
                id: 14,
                name: 'Dr. Mahesh Gunawardena',
                specialty: 'Urology',
                hospital: 'Durdans Hospital',
                rating: 4.7,
                reviewCount: 67,
                consultationFee: 4000,
                experience: '14 years',
                availability: 'Available Tomorrow',
                qualifications: 'MBBS, MS (Urology)',
                languages: ['English', 'Sinhala']
            },

            // Lanka Hospital Doctors
            {
                id: 15,
                name: 'Dr. Ravi Senanayake',
                specialty: 'Neurology',
                hospital: 'Lanka Hospital',
                rating: 4.9,
                reviewCount: 178,
                consultationFee: 4500,
                experience: '20 years',
                availability: 'Available Today',
                qualifications: 'MBBS, MD (Neurology), FRCP',
                languages: ['English', 'Sinhala']
            },
            {
                id: 16,
                name: 'Dr. Jennifer Davis',
                specialty: 'Pulmonology',
                hospital: 'Lanka Hospital',
                rating: 4.8,
                reviewCount: 134,
                consultationFee: 3900,
                experience: '16 years',
                availability: 'Available Tomorrow',
                qualifications: 'MBBS, MD (Pulmonology)',
                languages: ['English']
            },

            // National Hospital Doctors
            {
                id: 17,
                name: 'Dr. Kamal Fonseka',
                specialty: 'Emergency Medicine',
                hospital: 'National Hospital of Sri Lanka',
                rating: 4.6,
                reviewCount: 89,
                consultationFee: 2500,
                experience: '12 years',
                availability: 'Available 24/7',
                qualifications: 'MBBS, Diploma in Emergency Medicine',
                languages: ['English', 'Sinhala']
            },
            {
                id: 18,
                name: 'Dr. Samantha Wijesinghe',
                specialty: 'General Surgery',
                hospital: 'National Hospital of Sri Lanka',
                rating: 4.7,
                reviewCount: 156,
                consultationFee: 2800,
                experience: '19 years',
                availability: 'Available Today',
                qualifications: 'MBBS, MS (General Surgery)',
                languages: ['English', 'Sinhala']
            },

            // Teaching Hospital Kandy Doctors
            {
                id: 19,
                name: 'Dr. Pradeep Kumara',
                specialty: 'Cardiology',
                hospital: 'Teaching Hospital Kandy',
                rating: 4.5,
                reviewCount: 78,
                consultationFee: 3000,
                experience: '14 years',
                availability: 'Available Tomorrow',
                qualifications: 'MBBS, MD (Cardiology)',
                languages: ['English', 'Sinhala']
            },
            {
                id: 20,
                name: 'Dr. Niluka Rajapakse',
                specialty: 'Pediatrics',
                hospital: 'Teaching Hospital Kandy',
                rating: 4.7,
                reviewCount: 92,
                consultationFee: 2700,
                experience: '10 years',
                availability: 'Available Today',
                qualifications: 'MBBS, MD (Pediatrics)',
                languages: ['English', 'Sinhala']
            },

            // Asiri Central Hospital Doctors
            {
                id: 21,
                name: 'Dr. David Johnson',
                specialty: 'Oncology',
                hospital: 'Asiri Central Hospital',
                rating: 4.9,
                reviewCount: 145,
                consultationFee: 5000,
                experience: '25 years',
                availability: 'Available This Week',
                qualifications: 'MBBS, MD (Oncology), FRCP',
                languages: ['English']
            },
            {
                id: 22,
                name: 'Dr. Sanduni Perera',
                specialty: 'Dermatology',
                hospital: 'Asiri Central Hospital',
                rating: 4.8,
                reviewCount: 123,
                consultationFee: 3500,
                experience: '12 years',
                availability: 'Available Tomorrow',
                qualifications: 'MBBS, MD (Dermatology)',
                languages: ['English', 'Sinhala']
            },

            // Additional doctors for comprehensive coverage
            {
                id: 23,
                name: 'Dr. Thilina Rathnayake',
                specialty: 'Gastroenterology',
                hospital: 'Apollo Hospital',
                rating: 4.6,
                reviewCount: 89,
                consultationFee: 3700,
                experience: '11 years',
                availability: 'Available This Week',
                qualifications: 'MBBS, MD (Gastroenterology)',
                languages: ['English', 'Sinhala']
            },
            {
                id: 24,
                name: 'Dr. Maria Gonzalez',
                specialty: 'Radiology',
                hospital: 'Asiri Hospital',
                rating: 4.7,
                reviewCount: 76,
                consultationFee: 3300,
                experience: '13 years',
                availability: 'Available Today',
                qualifications: 'MBBS, MD (Radiology)',
                languages: ['English', 'Spanish']
            },
            {
                id: 25,
                name: 'Dr. Kasun Silva',
                specialty: 'Emergency Medicine',
                hospital: 'Nawaloka Hospital',
                rating: 4.5,
                reviewCount: 67,
                consultationFee: 2900,
                experience: '8 years',
                availability: 'Available 24/7',
                qualifications: 'MBBS, Diploma in Emergency Medicine',
                languages: ['English', 'Sinhala']
            },
            {
                id: 26,
                name: 'Dr. Jennifer Wilson',
                specialty: 'Psychiatry',
                hospital: 'Durdans Hospital',
                rating: 4.8,
                reviewCount: 134,
                consultationFee: 3800,
                experience: '16 years',
                availability: 'Available Tomorrow',
                qualifications: 'MBBS, MD (Psychiatry)',
                languages: ['English']
            },
            {
                id: 27,
                name: 'Dr. Nuwan Bandara',
                specialty: 'Endocrinology',
                hospital: 'Lanka Hospital',
                rating: 4.7,
                reviewCount: 98,
                consultationFee: 4100,
                experience: '17 years',
                availability: 'Available Today',
                qualifications: 'MBBS, MD (Endocrinology)',
                languages: ['English', 'Sinhala']
            },
            {
                id: 28,
                name: 'Dr. Sarah Ahmed',
                specialty: 'Rheumatology',
                hospital: 'National Hospital of Sri Lanka',
                rating: 4.6,
                reviewCount: 85,
                consultationFee: 2600,
                experience: '14 years',
                availability: 'Available This Week',
                qualifications: 'MBBS, MD (Rheumatology)',
                languages: ['English', 'Urdu']
            },
            {
                id: 29,
                name: 'Dr. Chathura Wickramasinghe',
                specialty: 'Anesthesiology',
                hospital: 'Teaching Hospital Kandy',
                rating: 4.5,
                reviewCount: 72,
                consultationFee: 2800,
                experience: '9 years',
                availability: 'Available Today',
                qualifications: 'MBBS, MD (Anesthesiology)',
                languages: ['English', 'Sinhala']
            },
            {
                id: 30,
                name: 'Dr. Lisa Thompson',
                specialty: 'Pathology',
                hospital: 'Asiri Central Hospital',
                rating: 4.8,
                reviewCount: 156,
                consultationFee: 3600,
                experience: '18 years',
                availability: 'Available Tomorrow',
                qualifications: 'MBBS, MD (Pathology)',
                languages: ['English']
            }
        ];

        // Filter doctors for current hospital
        this.doctors = allDoctors.filter(doctor => 
            this.isHospitalMatch(doctor, this.hospitalName)
        );
        
        // If no matches found, use all doctors (fallback)
        if (this.doctors.length === 0) {
            this.doctors = allDoctors.slice(0, 8);
        }
        
        this.filteredDoctors = [...this.doctors];
        this.renderDoctors();
        this.updatePagination();
    }

    renderDoctors() {
        const doctorsGrid = document.getElementById('doctors-grid');
        if (!doctorsGrid) return;

        const startIndex = (this.currentPage - 1) * this.doctorsPerPage;
        const endIndex = startIndex + this.doctorsPerPage;
        const doctorsToShow = this.filteredDoctors.slice(startIndex, endIndex);

        if (doctorsToShow.length === 0) {
            doctorsGrid.innerHTML = `
                <div class="no-doctors">
                    <p>No doctors found matching your criteria.</p>
                </div>
            `;
            return;
        }

        doctorsGrid.innerHTML = doctorsToShow.map(doctor => this.createDoctorCard(doctor)).join('');
    }

    createDoctorCard(doctor) {
        const stars = '⭐'.repeat(Math.floor(doctor.rating || 4.5));
        
        return `
            <div class="doctor-card" data-doctor-id="${doctor.id}">
                <div class="doctor-header">
                    <div class="doctor-avatar">
                        <div class="avatar-placeholder">👨‍⚕️</div>
                    </div>
                    <div class="doctor-info">
                        <h3>${doctor.name}</h3>
                        <div class="doctor-specialty">${doctor.specialty || doctor.speciality}</div>
                        <div class="doctor-rating">
                            <span class="rating-stars">${stars}</span>
                            <span class="rating-score">${doctor.rating || 4.5}</span>
                            <span class="rating-count">(${doctor.reviewCount || 0} reviews)</span>
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
                        <span class="detail-value consultation-fee">Rs. ${(doctor.consultationFee || doctor.consultation_fee || 3000).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Availability:</span>
                        <span class="detail-value availability">${doctor.availability || doctor.nextAvailable || 'Available Soon'}</span>
                    </div>
                    ${doctor.qualifications ? `
                    <div class="detail-row">
                        <span class="detail-label">Qualifications:</span>
                        <span class="detail-value">${doctor.qualifications}</span>
                    </div>
                    ` : ''}
                    ${doctor.languages ? `
                    <div class="detail-row">
                        <span class="detail-label">Languages:</span>
                        <span class="detail-value">${doctor.languages.join(', ')}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="doctor-actions">
                    <button class="btn-book-appointment" onclick="bookAppointment('${doctor.id}')">
                        <i class="fas fa-calendar-alt"></i> Book Appointment
                    </button>
                    <button class="btn-view-profile" onclick="viewDoctorProfile('${doctor.id}')">
                        <i class="fas fa-user"></i> View Profile
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Pagination buttons
        const prevBtn = document.getElementById('prev-doctors');
        const nextBtn = document.getElementById('next-doctors');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.changePage(-1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.changePage(1));
        }
    }

    changePage(direction) {
        const totalPages = Math.ceil(this.filteredDoctors.length / this.doctorsPerPage);
        
        if (direction === -1 && this.currentPage > 1) {
            this.currentPage--;
        } else if (direction === 1 && this.currentPage < totalPages) {
            this.currentPage++;
        }
        
        this.renderDoctors();
        this.updatePagination();
        
        // Scroll to top of doctors section
        document.querySelector('.hospital-doctors').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredDoctors.length / this.doctorsPerPage);
        const prevBtn = document.getElementById('prev-doctors');
        const nextBtn = document.getElementById('next-doctors');
        const pageInfo = document.getElementById('page-info');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages;
        }
        
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        }
    }
}

// Filter functions
function filterDoctors() {
    if (!window.hospitalPageManager) return;
    
    const specialtyFilter = document.getElementById('specialty-filter').value.toLowerCase();
    const nameSearch = document.getElementById('doctor-search').value.toLowerCase();
    
    window.hospitalPageManager.filteredDoctors = window.hospitalPageManager.doctors.filter(doctor => {
        const matchesSpecialty = !specialtyFilter || 
            (doctor.specialty || doctor.speciality || '').toLowerCase().includes(specialtyFilter);
        const matchesName = !nameSearch || 
            doctor.name.toLowerCase().includes(nameSearch) ||
            (doctor.specialty || doctor.speciality || '').toLowerCase().includes(nameSearch);
        
        return matchesSpecialty && matchesName;
    });
    
    window.hospitalPageManager.currentPage = 1;
    window.hospitalPageManager.renderDoctors();
    window.hospitalPageManager.updatePagination();
}

function changePage(direction) {
    if (window.hospitalPageManager) {
        window.hospitalPageManager.changePage(direction);
    }
}

// Global functions for booking and viewing profiles
function bookAppointment(doctorId) {
    if (doctorId) {
        window.location.href = `book-appointment.html?doctor=${doctorId}`;
    } else {
        window.location.href = 'book-appointment.html';
    }
}

function viewDoctorProfile(doctorId) {
    // Navigate to doctor profile page
    window.location.href = `doctor-profile.html?id=${doctorId}`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.hospitalPageManager = new HospitalPageManager();
    window.hospitalPageManager.init();
});