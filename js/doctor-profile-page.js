/**
 * Doctor Profile Page JavaScript
 * Handles individual doctor profile page functionality
 */

class DoctorProfilePage {
    constructor() {
        this.doctorId = null;
        this.doctorData = null;
    }

    async init() {
        // Get doctor ID from URL parameters
        this.doctorId = this.getDoctorIdFromURL();
        
        if (!this.doctorId) {
            this.showError('Doctor not found');
            return;
        }

        // Load doctor data
        await this.loadDoctorData();
        
        // Render profile
        this.renderProfile();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    getDoctorIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadDoctorData() {
        try {
            const response = await fetch(`php/patient-api.php?action=get_doctor_details&id=${this.doctorId}`);
            const result = await response.json();
            
            if (result.success) {
                this.doctorData = result.doctor;
            } else {
                // Fallback to mock data for demo
                this.doctorData = this.getMockDoctorData(this.doctorId);
            }
        } catch (error) {
            console.error('Error loading doctor data:', error);
            // Use mock data as fallback
            this.doctorData = this.getMockDoctorData(this.doctorId);
        }
    }

    getMockDoctorData(doctorId) {
        const doctors = [
            {
                id: 1,
                name: "Dr. Sarah Johnson",
                specialty: "Cardiology",
                qualification: "MBBS, MD Cardiology",
                experience: "15+ years",
                rating: 4.8,
                reviews: 245,
                consultation_fee: "5,000",
                location: "Colombo General Hospital",
                available_days: "Mon, Wed, Fri",
                next_available: "2025-06-25",
                phone: "+94 77 123 4567",
                email: "sarah.johnson@healthcareplus.lk",
                languages: ["English", "Sinhala"],
                bio: "Dr. Sarah Johnson is a highly experienced cardiologist with over 15 years of expertise in interventional cardiology. She specializes in advanced cardiac procedures and has published numerous research papers in international cardiology journals.",
                specializations: ["Interventional Cardiology", "Cardiac Catheterization", "Angioplasty", "Heart Disease Prevention"],
                education: ["MBBS - University of Colombo (2008)", "MD Cardiology - Postgraduate Institute of Medicine (2012)", "Fellowship in Interventional Cardiology - Singapore General Hospital (2014)"],
                working_hours: "9:00 AM - 5:00 PM",
                hospital: "Colombo General Hospital",
                address: "Regent Street, Colombo 08"
            },
            {
                id: 2,
                name: "Dr. Michael Chen",
                specialty: "Orthopedics",
                qualification: "MBBS, MS Orthopedics",
                experience: "12+ years",
                rating: 4.7,
                reviews: 189,
                consultation_fee: "4,500",
                location: "National Hospital",
                available_days: "Tue, Thu, Sat",
                next_available: "2025-06-24",
                phone: "+94 77 234 5678",
                email: "michael.chen@healthcareplus.lk",
                languages: ["English", "Tamil"],
                bio: "Dr. Michael Chen is a renowned orthopedic surgeon specializing in joint replacement and sports medicine. He has performed over 2000 successful surgeries and is known for his innovative surgical techniques.",
                specializations: ["Joint Replacement", "Sports Medicine", "Arthroscopy", "Trauma Surgery"],
                education: ["MBBS - University of Peradeniya (2010)", "MS Orthopedics - Postgraduate Institute of Medicine (2015)", "Fellowship in Joint Replacement - Johns Hopkins Hospital (2017)"],
                working_hours: "8:00 AM - 4:00 PM",
                hospital: "National Hospital of Sri Lanka",
                address: "Regent Street, Colombo 10"
            },
            {
                id: 3,
                name: "Dr. Priya Patel",
                specialty: "Pediatrics",
                qualification: "MBBS, MD Pediatrics",
                experience: "10+ years",
                rating: 4.9,
                reviews: 312,
                consultation_fee: "3,500",
                location: "Lady Ridgeway Hospital",
                available_days: "Mon, Tue, Thu, Fri",
                next_available: "2025-06-23",
                phone: "+94 77 345 6789",
                email: "priya.patel@healthcareplus.lk",
                languages: ["English", "Hindi", "Sinhala"],
                bio: "Dr. Priya Patel is a dedicated pediatrician with extensive experience in child healthcare. She specializes in developmental pediatrics and has been instrumental in implementing child-friendly healthcare practices.",
                specializations: ["Developmental Pediatrics", "Neonatal Care", "Child Nutrition", "Vaccination Programs"],
                education: ["MBBS - University of Sri Jayewardenepura (2012)", "MD Pediatrics - Postgraduate Institute of Medicine (2017)", "Diploma in Child Health - Royal College of Pediatrics (2018)"],
                working_hours: "9:00 AM - 6:00 PM",
                hospital: "Lady Ridgeway Hospital for Children",
                address: "Borella, Colombo 08"
            },
            {
                id: 4,
                name: "Dr. James Wilson",
                specialty: "Neurology",
                qualification: "MBBS, MD Neurology",
                experience: "18+ years",
                rating: 4.6,
                reviews: 156,
                consultation_fee: "6,000",
                location: "Colombo South Teaching Hospital",
                available_days: "Wed, Fri, Sat",
                next_available: "2025-06-26",
                phone: "+94 77 456 7890",
                email: "james.wilson@healthcareplus.lk",
                languages: ["English"],
                bio: "Dr. James Wilson is a leading neurologist with expertise in treating complex neurological disorders. He has pioneered several treatment protocols and is actively involved in neurological research.",
                specializations: ["Stroke Management", "Epilepsy Treatment", "Movement Disorders", "Headache Medicine"],
                education: ["MBBS - University of Colombo (2005)", "MD Neurology - Postgraduate Institute of Medicine (2010)", "Fellowship in Stroke Medicine - Mayo Clinic (2012)"],
                working_hours: "10:00 AM - 6:00 PM",
                hospital: "Colombo South Teaching Hospital",
                address: "Kalubowila, Dehiwala"
            },
            {
                id: 5,
                name: "Dr. Emily Rodriguez",
                specialty: "Dermatology",
                qualification: "MBBS, MD Dermatology",
                experience: "8+ years",
                rating: 4.7,
                reviews: 198,
                consultation_fee: "4,000",
                location: "Skin & Beauty Clinic",
                available_days: "Mon, Wed, Thu, Sat",
                next_available: "2025-06-24",
                phone: "+94 77 567 8901",
                email: "emily.rodriguez@healthcareplus.lk",
                languages: ["English", "Spanish", "Sinhala"],
                bio: "Dr. Emily Rodriguez is a skilled dermatologist specializing in both medical and cosmetic dermatology. She stays updated with the latest treatments and technologies in skin care.",
                specializations: ["Medical Dermatology", "Cosmetic Dermatology", "Laser Treatments", "Skin Cancer Screening"],
                education: ["MBBS - University of Kelaniya (2014)", "MD Dermatology - Postgraduate Institute of Medicine (2019)", "Diploma in Aesthetic Medicine - American Academy of Aesthetic Medicine (2020)"],
                working_hours: "9:00 AM - 5:00 PM",
                hospital: "Skin & Beauty Clinic",
                address: "Bambalapitiya, Colombo 04"
            },
            {
                id: 6,
                name: "Dr. David Kim",
                specialty: "General Surgery",
                qualification: "MBBS, MS General Surgery",
                experience: "20+ years",
                rating: 4.8,
                reviews: 267,
                consultation_fee: "5,500",
                location: "Asiri Central Hospital",
                available_days: "Tue, Wed, Fri, Sat",
                next_available: "2025-06-25",
                phone: "+94 77 678 9012",
                email: "david.kim@healthcareplus.lk",
                languages: ["English", "Korean"],
                bio: "Dr. David Kim is a veteran general surgeon with two decades of experience in complex surgical procedures. He is known for his precision and has mentored many young surgeons.",
                specializations: ["Laparoscopic Surgery", "Hepatobiliary Surgery", "Colorectal Surgery", "Trauma Surgery"],
                education: ["MBBS - University of Colombo (2003)", "MS General Surgery - Postgraduate Institute of Medicine (2008)", "Fellowship in Laparoscopic Surgery - Seoul National University (2010)"],
                working_hours: "8:00 AM - 4:00 PM",
                hospital: "Asiri Central Hospital",
                address: "Colombo 10"
            }
        ];

        return doctors.find(doctor => doctor.id == doctorId) || doctors[0];
    }

    renderProfile() {
        if (!this.doctorData) {
            this.showError('Doctor data not available');
            return;
        }

        this.renderHeader();
        this.renderBasicInfo();
        this.renderAbout();
        this.renderSpecializations();
        this.renderEducation();
        this.renderAvailability();
        this.renderContact();
        this.renderLanguages();
        this.renderLocation();
    }

    renderHeader() {
        const initials = this.doctorData.name.split(' ').map(n => n[0]).join('');
        const stars = this.generateStarsHTML(this.doctorData.rating);
        
        const headerHTML = `
            <div class="doctor-header-content">
                <div class="doctor-avatar-large">${initials}</div>
                <div class="doctor-info">
                    <h1>${this.doctorData.name}</h1>
                    <h2>${this.doctorData.specialty}</h2>
                    <div class="doctor-rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-text">${this.doctorData.rating} (${this.doctorData.reviews} reviews)</span>
                    </div>
                    <div class="doctor-meta">
                        <span class="experience">
                            <i class="fas fa-user-md"></i> ${this.doctorData.experience}
                        </span>
                        <span class="qualification">
                            <i class="fas fa-graduation-cap"></i> ${this.doctorData.qualification}
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('doctor-header').innerHTML = headerHTML;
    }

    renderBasicInfo() {
        const infoHTML = `
            <div class="info-item">
                <label><i class="fas fa-stethoscope"></i> Specialty:</label>
                <span>${this.doctorData.specialty}</span>
            </div>
            <div class="info-item">
                <label><i class="fas fa-graduation-cap"></i> Qualification:</label>
                <span>${this.doctorData.qualification}</span>
            </div>
            <div class="info-item">
                <label><i class="fas fa-clock"></i> Experience:</label>
                <span>${this.doctorData.experience}</span>
            </div>
            <div class="info-item">
                <label><i class="fas fa-dollar-sign"></i> Consultation Fee:</label>
                <span>LKR ${this.doctorData.consultation_fee}</span>
            </div>
            <div class="info-item">
                <label><i class="fas fa-hospital"></i> Hospital:</label>
                <span>${this.doctorData.hospital || this.doctorData.location}</span>
            </div>
            <div class="info-item">
                <label><i class="fas fa-clock"></i> Working Hours:</label>
                <span>${this.doctorData.working_hours || 'Contact for details'}</span>
            </div>
        `;
        
        document.getElementById('basic-info-content').innerHTML = infoHTML;
    }

    renderAbout() {
        const aboutHTML = `
            <p>${this.doctorData.bio}</p>
        `;
        
        document.getElementById('about-content').innerHTML = aboutHTML;
    }

    renderSpecializations() {
        const specializations = this.doctorData.specializations || [this.doctorData.specialty];
        const specializationsHTML = specializations.map(spec => 
            `<span class="specialization-tag">${spec}</span>`
        ).join('');
        
        document.getElementById('specializations-content').innerHTML = specializationsHTML;
    }

    renderEducation() {
        const education = this.doctorData.education || ['Information not available'];
        const educationHTML = education.map(edu => 
            `<div class="education-item"><i class="fas fa-graduation-cap"></i> ${edu}</div>`
        ).join('');
        
        document.getElementById('education-content').innerHTML = educationHTML;
    }

    renderAvailability() {
        const availabilityHTML = `
            <div class="availability-item">
                <label><i class="fas fa-calendar"></i> Available Days:</label>
                <span>${this.doctorData.available_days}</span>
            </div>
            <div class="availability-item">
                <label><i class="fas fa-clock"></i> Next Available:</label>
                <span>${this.doctorData.next_available}</span>
            </div>
            <div class="availability-item">
                <label><i class="fas fa-time"></i> Working Hours:</label>
                <span>${this.doctorData.working_hours || 'Contact for details'}</span>
            </div>
        `;
        
        document.getElementById('availability-content').innerHTML = availabilityHTML;
    }

    renderContact() {
        const contactHTML = `
            <div class="contact-item">
                <label><i class="fas fa-phone"></i> Phone:</label>
                <span>${this.doctorData.phone}</span>
            </div>
            <div class="contact-item">
                <label><i class="fas fa-envelope"></i> Email:</label>
                <span>${this.doctorData.email}</span>
            </div>
        `;
        
        document.getElementById('contact-content').innerHTML = contactHTML;
    }

    renderLanguages() {
        const languages = this.doctorData.languages || ['English'];
        const languagesHTML = languages.map(lang => 
            `<span class="language-tag">${lang}</span>`
        ).join('');
        
        document.getElementById('languages-content').innerHTML = languagesHTML;
    }

    renderLocation() {
        const locationHTML = `
            <div class="location-item">
                <label><i class="fas fa-hospital"></i> Hospital/Clinic:</label>
                <span>${this.doctorData.hospital || this.doctorData.location}</span>
            </div>
            <div class="location-item">
                <label><i class="fas fa-map-marker-alt"></i> Address:</label>
                <span>${this.doctorData.address || this.doctorData.location}</span>
            </div>
        `;
        
        document.getElementById('location-content').innerHTML = locationHTML;
    }

    generateStarsHTML(rating) {
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

    setupEventListeners() {
        // Setup navigation and action buttons
        this.setupActionButtons();
    }

    setupActionButtons() {
        // Book appointment button functionality will be handled by global functions
    }

    showError(message) {
        const errorHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>${message}</p>
                <a href="find-doctors.html" class="btn btn-primary">Find Doctors</a>
            </div>
        `;
        
        document.querySelector('.doctor-profile-page .container').innerHTML = errorHTML;
    }
}

// Global functions for profile page
function goBack() {
    if (document.referrer) {
        window.history.back();
    } else {
        window.location.href = 'find-doctors.html';
    }
}

function bookAppointment() {
    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('id');
    
    // Navigate to booking page
    window.location.href = 'find-doctors.html';
}

function shareProfile() {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Profile link copied to clipboard!');
        });
    }
}

function printProfile() {
    window.print();
}

// Initialize the profile page
document.addEventListener('DOMContentLoaded', function() {
    const profilePage = new DoctorProfilePage();
    profilePage.init();
});