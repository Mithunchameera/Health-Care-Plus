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
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); bookAppointment(${doctor.id})">
                        <i class="fas fa-calendar-plus"></i> Book
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); viewDoctorProfile(${doctor.id})">
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

function toggleView(view) {
    if (window.patientDashboard) {
        window.patientDashboard.toggleView(view);
    }
}

function bookAppointment(doctorId) {
    // Navigate to booking page with pre-selected doctor
    window.location.href = `booking.html?doctor=${doctorId}`;
}

function viewDoctorProfile(doctorId) {
    // Show doctor profile modal or navigate to profile page
    console.log('Viewing doctor profile:', doctorId);
    // This can be expanded to show a detailed modal
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