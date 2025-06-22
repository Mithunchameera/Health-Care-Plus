/**
 * Doctor Search and Management for Patient Dashboard
 */

// Extend PatientDashboard with doctor search functionality
if (typeof PatientDashboard !== 'undefined') {
    // Add doctor search methods to PatientDashboard prototype
    PatientDashboard.prototype.loadDoctors = async function() {
        try {
            const response = await fetch('php/patient-api.php?action=get_doctors');
            const data = await response.json();
            
            if (data.success) {
                this.doctors = data.doctors;
                this.filteredDoctors = [...this.doctors];
                this.displayDoctors();
                this.updateResultsCount();
            } else {
                console.error('Failed to load doctors:', data.error);
                this.showLoadingError();
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
            this.showLoadingError();
        }
    };
    
    PatientDashboard.prototype.showLoadingError = function() {
        const container = document.getElementById('doctors-container');
        if (container) {
            container.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load doctors. Please try again.</p>
                    <button class="btn btn-primary" onclick="window.patientDashboard.loadDoctors()">Retry</button>
                </div>
            `;
        }
    };
    
    PatientDashboard.prototype.displayDoctors = function() {
        const container = document.getElementById('doctors-container');
        const noResults = document.getElementById('no-results');
        
        if (!container) return;
        
        if (this.filteredDoctors.length === 0) {
            container.style.display = 'none';
            if (noResults) noResults.style.display = 'block';
            return;
        }
        
        container.style.display = 'grid';
        if (noResults) noResults.style.display = 'none';
        
        const currentView = container.classList.contains('doctors-list') ? 'list' : 'grid';
        
        if (currentView === 'grid') {
            container.innerHTML = this.filteredDoctors.map(doctor => this.createDoctorCard(doctor)).join('');
        } else {
            container.innerHTML = this.filteredDoctors.map(doctor => this.createDoctorListItem(doctor)).join('');
        }
    };
    
    PatientDashboard.prototype.createDoctorCard = function(doctor) {
        const initials = doctor.name.split(' ').map(n => n[0]).join('');
        const stars = this.generateStars(doctor.rating);
        const availabilityClass = doctor.available ? 'available' : 'unavailable';
        const availabilityText = doctor.available ? 'Available' : 'Unavailable';
        
        return `
            <div class="doctor-card" onclick="viewDoctorProfile(${doctor.id})">
                <div class="doctor-header">
                    <div class="doctor-avatar">${initials}</div>
                    <div class="doctor-info">
                        <h3>${doctor.name}</h3>
                        <div class="doctor-specialty">${doctor.specialty}</div>
                    </div>
                </div>
                
                <div class="doctor-details">
                    <div class="doctor-rating">
                        <span class="stars">${stars}</span>
                        <span>${doctor.rating}</span>
                        <span>(${doctor.reviews} reviews)</span>
                    </div>
                    
                    <div class="doctor-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${doctor.location}</span>
                    </div>
                    
                    <div class="doctor-detail">
                        <i class="fas fa-graduation-cap"></i>
                        <span>${doctor.education}</span>
                    </div>
                    
                    <div class="doctor-detail">
                        <i class="fas fa-clock"></i>
                        <span>${doctor.experience} years experience</span>
                    </div>
                    
                    <div class="doctor-detail">
                        <i class="fas fa-dollar-sign"></i>
                        <span>$${doctor.fee}</span>
                    </div>
                </div>
                
                <div class="doctor-availability ${availabilityClass}">
                    ${availabilityText}
                </div>
                
                <div class="doctor-actions">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); bookAppointment(${doctor.id})">
                        <i class="fas fa-calendar-plus"></i> Book Now
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); viewDoctorProfile(${doctor.id})">
                        <i class="fas fa-eye"></i> View Profile
                    </button>
                </div>
            </div>
        `;
    };
    
    PatientDashboard.prototype.createDoctorListItem = function(doctor) {
        const initials = doctor.name.split(' ').map(n => n[0]).join('');
        const stars = this.generateStars(doctor.rating);
        const availabilityClass = doctor.available ? 'available' : 'unavailable';
        const availabilityText = doctor.available ? 'Available' : 'Unavailable';
        
        return `
            <div class="doctor-list-item" onclick="viewDoctorProfile(${doctor.id})">
                <div class="doctor-avatar">${initials}</div>
                <div class="doctor-list-info">
                    <h4>${doctor.name}</h4>
                    <div class="doctor-specialty">${doctor.specialty}</div>
                    <div class="doctor-rating">
                        <span class="stars">${stars}</span>
                        <span>${doctor.rating} (${doctor.reviews} reviews)</span>
                    </div>
                    <div class="doctor-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${doctor.location}</span>
                    </div>
                    <div class="doctor-availability ${availabilityClass}">
                        ${availabilityText}
                    </div>
                </div>
                <div class="doctor-list-actions">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); bookAppointment('${doctor.id}')">
                        <i class="fas fa-calendar-plus"></i> Book
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); viewDoctorProfile('${doctor.id}')">
                        <i class="fas fa-eye"></i> Profile
                    </button>
                </div>
            </div>
        `;
    };
    
    PatientDashboard.prototype.generateStars = function(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    };
    
    PatientDashboard.prototype.searchDoctors = function() {
        const searchTerm = document.getElementById('doctor-search')?.value.toLowerCase() || '';
        const specialtyFilter = document.getElementById('specialty-filter')?.value || '';
        const locationFilter = document.getElementById('location-filter')?.value || '';
        const availabilityFilter = document.getElementById('availability-filter')?.value || '';
        
        this.filteredDoctors = this.doctors.filter(doctor => {
            const matchesSearch = doctor.name.toLowerCase().includes(searchTerm) ||
                                doctor.specialty.toLowerCase().includes(searchTerm);
            
            const matchesSpecialty = !specialtyFilter || doctor.specialty === specialtyFilter;
            const matchesLocation = !locationFilter || doctor.location === locationFilter;
            const matchesAvailability = !availabilityFilter || 
                                      (availabilityFilter === 'available' && doctor.available) ||
                                      (availabilityFilter === 'unavailable' && !doctor.available);
            
            return matchesSearch && matchesSpecialty && matchesLocation && matchesAvailability;
        });
        
        this.displayDoctors();
        this.updateResultsCount();
    };
    
    PatientDashboard.prototype.clearFilters = function() {
        const searchInput = document.getElementById('doctor-search');
        const specialtyFilter = document.getElementById('specialty-filter');
        const locationFilter = document.getElementById('location-filter');
        const availabilityFilter = document.getElementById('availability-filter');
        
        if (searchInput) searchInput.value = '';
        if (specialtyFilter) specialtyFilter.value = '';
        if (locationFilter) locationFilter.value = '';
        if (availabilityFilter) availabilityFilter.value = '';
        
        this.filteredDoctors = [...this.doctors];
        this.displayDoctors();
        this.updateResultsCount();
    };
    
    PatientDashboard.prototype.toggleView = function(view) {
        const container = document.getElementById('doctors-container');
        const gridBtn = document.querySelector('.view-btn[data-view="grid"]');
        const listBtn = document.querySelector('.view-btn[data-view="list"]');
        
        if (!container) return;
        
        if (view === 'list') {
            container.className = 'doctors-list';
            if (gridBtn) gridBtn.classList.remove('active');
            if (listBtn) listBtn.classList.add('active');
        } else {
            container.className = 'doctors-grid';
            if (listBtn) listBtn.classList.remove('active');
            if (gridBtn) gridBtn.classList.add('active');
        }
        
        this.displayDoctors();
    };
    
    PatientDashboard.prototype.updateResultsCount = function() {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            const count = this.filteredDoctors.length;
            const total = this.doctors.length;
            resultsCount.textContent = `Showing ${count} of ${total} doctors`;
        }
    };
}

// Global functions for doctor interactions
function searchDoctors() {
    if (window.patientDashboard) {
        window.patientDashboard.searchDoctors();
    }
}

function filterDoctors() {
    if (window.patientDashboard) {
        window.patientDashboard.searchDoctors();
    }
}

function clearFilters() {
    if (window.patientDashboard) {
        window.patientDashboard.clearFilters();
    }
}

function clearDoctorSearch() {
    if (window.patientDashboard) {
        window.patientDashboard.clearDoctorSearch();
    }
}

function toggleView(view) {
    if (window.patientDashboard) {
        window.patientDashboard.toggleView(view);
    }
}

function bookAppointment(doctorId) {
    // Navigate to booking page
    window.location.href = 'find-doctors.html';
}

function viewDoctorProfile(doctorId) {
    console.log('Viewing doctor profile:', doctorId);
    
    // Navigate to dedicated doctor profile page
    window.location.href = `doctor-profile.html?id=${doctorId}`;
}

function showDoctorProfileModal(doctor) {
    // Remove existing modal if any
    const existingModal = document.getElementById('doctor-profile-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const initials = doctor.name.split(' ').map(n => n[0]).join('');
    const stars = generateStarsString(doctor.rating || 4.5);
    
    const modalHTML = `
        <div class="modal-overlay" id="doctor-profile-modal" onclick="closeDoctorProfileModal()">
            <div class="modal-content doctor-profile-modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2><i class="fas fa-user-md"></i> Doctor Profile</h2>
                    <button class="modal-close" onclick="closeDoctorProfileModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="doctor-profile-header">
                        <div class="doctor-profile-avatar">${initials}</div>
                        <div class="doctor-profile-info">
                            <h3>${doctor.name}</h3>
                            <div class="doctor-specialty">${doctor.specialty}</div>
                            <div class="doctor-rating">
                                <span class="stars">${stars}</span>
                                <span>${doctor.rating || 4.5} (${doctor.reviews || 0} reviews)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="doctor-profile-details">
                        <div class="profile-section">
                            <h4><i class="fas fa-info-circle"></i> Basic Information</h4>
                            <div class="profile-grid">
                                <div class="profile-item">
                                    <label>Experience:</label>
                                    <span>${doctor.experience || 'N/A'}</span>
                                </div>
                                <div class="profile-item">
                                    <label>Qualification:</label>
                                    <span>${doctor.qualification || 'MBBS'}</span>
                                </div>
                                <div class="profile-item">
                                    <label>Consultation Fee:</label>
                                    <span>LKR ${doctor.consultation_fee || doctor.fee || 'Contact clinic'}</span>
                                </div>
                                <div class="profile-item">
                                    <label>Location:</label>
                                    <span>${doctor.location || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h4><i class="fas fa-calendar-alt"></i> Availability</h4>
                            <div class="availability-info">
                                <div class="profile-item">
                                    <label>Available Days:</label>
                                    <span>${doctor.available_days || 'Contact for schedule'}</span>
                                </div>
                                <div class="profile-item">
                                    <label>Next Available:</label>
                                    <span>${doctor.next_available || 'Contact clinic'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h4><i class="fas fa-user"></i> About Doctor</h4>
                            <p class="doctor-bio">
                                ${doctor.bio || 'Experienced medical professional dedicated to providing quality healthcare services.'}
                            </p>
                        </div>
                        
                        <div class="profile-section">
                            <h4><i class="fas fa-globe"></i> Languages</h4>
                            <div class="languages-list">
                                ${(doctor.languages || ['English']).map(lang => 
                                    `<span class="language-tag">${lang}</span>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h4><i class="fas fa-envelope"></i> Contact Information</h4>
                            <div class="contact-info">
                                <div class="profile-item">
                                    <label>Phone:</label>
                                    <span>${doctor.phone || 'Contact clinic'}</span>
                                </div>
                                <div class="profile-item">
                                    <label>Email:</label>
                                    <span>${doctor.email || 'Contact clinic'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="bookAppointment(${doctor.id}); closeDoctorProfileModal();">
                        <i class="fas fa-calendar-plus"></i> Book Appointment
                    </button>
                    <button class="btn btn-secondary" onclick="closeDoctorProfileModal()">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add modal styles if not already present
    addDoctorProfileModalStyles();
}

function closeDoctorProfileModal() {
    const modal = document.getElementById('doctor-profile-modal');
    if (modal) {
        modal.remove();
    }
}

function generateStarsString(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function addDoctorProfileModalStyles() {
    // Check if styles already exist
    if (document.getElementById('doctor-profile-modal-styles')) {
        return;
    }
    
    const styles = `
        <style id="doctor-profile-modal-styles">
        .doctor-profile-modal {
            max-width: 800px;
            width: 90vw;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .doctor-profile-header {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--primary-color), #1d4ed8);
            border-radius: 12px;
            color: white;
        }
        
        .doctor-profile-avatar {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: bold;
            color: white;
            border: 3px solid rgba(255, 255, 255, 0.3);
        }
        
        .doctor-profile-info h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
        }
        
        .doctor-profile-info .doctor-specialty {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 0.5rem;
        }
        
        .doctor-profile-info .doctor-rating {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .doctor-profile-info .stars {
            color: #fbbf24;
        }
        
        .doctor-profile-details {
            padding: 0 1rem;
        }
        
        .profile-section {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: var(--card-bg);
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }
        
        .profile-section h4 {
            color: var(--text-color);
            margin: 0 0 1rem 0;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .profile-section h4 i {
            color: var(--primary-color);
        }
        
        .profile-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        
        .profile-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background: var(--bg-secondary);
            border-radius: 6px;
        }
        
        .profile-item label {
            font-weight: 600;
            color: var(--text-secondary);
        }
        
        .profile-item span {
            color: var(--text-color);
            font-weight: 500;
        }
        
        .doctor-bio {
            color: var(--text-color);
            line-height: 1.6;
            margin: 0;
        }
        
        .languages-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .language-tag {
            background: var(--primary-color);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
        }
        
        .availability-info,
        .contact-info {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        @media (max-width: 768px) {
            .doctor-profile-modal {
                width: 95vw;
                margin: 1rem;
            }
            
            .doctor-profile-header {
                flex-direction: column;
                text-align: center;
            }
            
            .profile-grid {
                grid-template-columns: 1fr;
            }
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Add search functionality on Enter key
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('doctor-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchDoctors();
            }
        });
    }
});