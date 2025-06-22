/**
 * Doctor Profile Page Manager
 * Handles individual doctor profile display and functionality
 */

class DoctorProfileManager {
    constructor() {
        this.doctorId = null;
        this.doctorData = null;
    }

    async init() {
        // Get doctor ID from URL parameters
        this.doctorId = this.getDoctorIdFromURL();
        
        if (!this.doctorId) {
            this.showError();
            return;
        }

        // Set minimum date for booking form
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('preferred-date');
        if (dateInput) {
            dateInput.min = today;
            dateInput.value = today;
        }

        // Load doctor data
        await this.loadDoctorProfile();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    getDoctorIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadDoctorProfile() {
        try {
            // Try to load from API first
            const response = await fetch(`/php/doctor-api.php?id=${this.doctorId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.doctor) {
                    this.doctorData = data.doctor;
                    this.displayDoctorProfile();
                    return;
                }
            }
        } catch (error) {
            console.error('Error loading doctor from API:', error);
        }

        // Fallback to comprehensive mock data
        this.loadMockDoctorData();
    }

    loadMockDoctorData() {
        const mockDoctors = {
            '1': {
                id: '1',
                name: 'Dr. Sarah Johnson',
                firstName: 'Sarah',
                specialty: 'Cardiology',
                hospital: 'Apollo Hospital Colombo',
                rating: 4.8,
                reviewCount: 156,
                consultationFee: 3500,
                experience: '15 years',
                nextAvailable: 'Today 2:00 PM',
                about: 'Dr. Sarah Johnson is a renowned cardiologist with over 15 years of experience in treating complex heart conditions. She specializes in interventional cardiology and has performed over 2,000 successful cardiac procedures. Dr. Johnson is known for her compassionate patient care and innovative treatment approaches.',
                qualifications: [
                    'MBBS from University of Colombo (2008)',
                    'MD in Cardiology from Postgraduate Institute of Medicine (2013)',
                    'Fellowship in Interventional Cardiology from Harvard Medical School (2015)',
                    'Board Certified Cardiologist'
                ],
                services: [
                    'Cardiac Consultation',
                    'Echocardiography',
                    'Stress Testing',
                    'Cardiac Catheterization',
                    'Angioplasty',
                    'Pacemaker Implantation'
                ],
                languages: ['English', 'Sinhala', 'Tamil'],
                hospitalInfo: {
                    name: 'Apollo Hospital Colombo',
                    address: '578 Elvitigala Mawatha, Colombo 05',
                    phone: '+94 11 243 0000'
                }
            },
            '2': {
                id: '2',
                name: 'Dr. Michael Chen',
                firstName: 'Michael',
                specialty: 'Neurology',
                hospital: 'Asiri Medical Hospital',
                rating: 4.9,
                reviewCount: 203,
                consultationFee: 4000,
                experience: '12 years',
                nextAvailable: 'Tomorrow 10:00 AM',
                about: 'Dr. Michael Chen is a leading neurologist specializing in stroke medicine and epilepsy treatment. He has extensive experience in neurological disorders and has published numerous research papers in international medical journals.',
                qualifications: [
                    'MBBS from University of Peradeniya (2011)',
                    'MD in Neurology from University of Colombo (2016)',
                    'Fellowship in Stroke Medicine from Johns Hopkins (2018)'
                ],
                services: [
                    'Neurological Consultation',
                    'EEG Testing',
                    'Brain Imaging Interpretation',
                    'Stroke Treatment',
                    'Epilepsy Management',
                    'Headache Treatment'
                ],
                languages: ['English', 'Mandarin', 'Sinhala'],
                hospitalInfo: {
                    name: 'Asiri Medical Hospital',
                    address: '181 Kirula Road, Colombo 05',
                    phone: '+94 11 466 5500'
                }
            },
            'temp1': {
                id: 'temp1',
                name: 'Dr. Priya Mendis',
                firstName: 'Priya',
                specialty: 'Cardiology',
                hospital: 'National Hospital',
                rating: 4.8,
                reviewCount: 124,
                consultationFee: 3500,
                experience: '15 years',
                nextAvailable: 'Today 2:00 PM',
                about: 'Dr. Priya Mendis is a distinguished cardiologist with expertise in preventive cardiology and heart disease management. She is passionate about patient education and lifestyle modifications for heart health.',
                qualifications: [
                    'MBBS from University of Sri Jayewardenepura (2008)',
                    'MD in Cardiology (2014)',
                    'Diploma in Preventive Cardiology'
                ],
                services: [
                    'Cardiac Consultation',
                    'Preventive Cardiology',
                    'Heart Disease Management',
                    'Lifestyle Counseling'
                ],
                languages: ['English', 'Sinhala'],
                hospitalInfo: {
                    name: 'National Hospital of Sri Lanka',
                    address: 'Regent Street, Colombo 07',
                    phone: '+94 11 269 1111'
                }
            },
            'temp2': {
                id: 'temp2',
                name: 'Dr. Rajesh Silva',
                firstName: 'Rajesh',
                specialty: 'Orthopedics',
                hospital: 'Lanka Hospital',
                rating: 4.7,
                reviewCount: 98,
                consultationFee: 4000,
                experience: '12 years',
                nextAvailable: 'Tomorrow 10:00 AM',
                about: 'Dr. Rajesh Silva is an experienced orthopedic surgeon specializing in joint replacement and sports medicine. He has performed hundreds of successful surgeries and is known for his minimally invasive techniques.',
                qualifications: [
                    'MBBS from University of Kelaniya (2011)',
                    'MS in Orthopedic Surgery (2016)',
                    'Fellowship in Joint Replacement Surgery'
                ],
                services: [
                    'Joint Replacement Surgery',
                    'Sports Medicine',
                    'Arthroscopic Surgery',
                    'Fracture Treatment'
                ],
                languages: ['English', 'Sinhala'],
                hospitalInfo: {
                    name: 'Lanka Hospital Corporation',
                    address: '578 Elvitigala Mawatha, Narahenpita',
                    phone: '+94 11 543 0000'
                }
            }
        };

        this.doctorData = mockDoctors[this.doctorId];
        
        if (this.doctorData) {
            this.displayDoctorProfile();
        } else {
            this.showError();
        }
    }

    displayDoctorProfile() {
        // Hide loading state and show content
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('profile-content').style.display = 'block';

        const doctor = this.doctorData;

        // Update page title and breadcrumb
        document.title = `${doctor.name} - eChannelling`;
        document.getElementById('doctor-name-breadcrumb').textContent = doctor.name;

        // Header information
        document.getElementById('doctor-name').textContent = doctor.name;
        document.getElementById('doctor-specialty').textContent = doctor.specialty;
        document.getElementById('doctor-hospital').textContent = doctor.hospital;
        document.getElementById('doctor-first-name').textContent = doctor.firstName || doctor.name.split(' ')[1] || 'Doctor';

        // Rating
        const stars = '⭐'.repeat(Math.floor(doctor.rating));
        document.getElementById('doctor-rating-stars').textContent = stars;
        document.getElementById('doctor-rating-score').textContent = doctor.rating;
        document.getElementById('doctor-rating-count').textContent = `(${doctor.reviewCount} reviews)`;

        // Consultation information
        document.getElementById('consultation-fee').textContent = `Rs. ${doctor.consultationFee.toLocaleString()}`;
        document.getElementById('doctor-experience').textContent = doctor.experience;
        document.getElementById('next-available').textContent = doctor.nextAvailable;

        // About section
        document.getElementById('doctor-about').textContent = doctor.about;

        // Qualifications
        const qualificationsList = doctor.qualifications.map(qual => 
            `<div class="qualification-item"><i class="fas fa-graduation-cap"></i> ${qual}</div>`
        ).join('');
        document.getElementById('doctor-qualifications').innerHTML = qualificationsList;

        // Services
        const servicesGrid = doctor.services.map(service => 
            `<div class="service-item"><i class="fas fa-check-circle"></i> ${service}</div>`
        ).join('');
        document.getElementById('doctor-services').innerHTML = servicesGrid;

        // Languages
        const languagesList = doctor.languages.map(lang => 
            `<span class="language-tag">${lang}</span>`
        ).join('');
        document.getElementById('doctor-languages').innerHTML = languagesList;

        // Hospital information
        document.getElementById('hospital-name').textContent = doctor.hospitalInfo.name;
        document.getElementById('hospital-address').textContent = doctor.hospitalInfo.address;
        document.getElementById('hospital-phone').textContent = doctor.hospitalInfo.phone;

        // Reviews section
        document.getElementById('overall-rating').textContent = doctor.rating;
        document.getElementById('overall-stars').textContent = stars;
        document.getElementById('total-reviews').textContent = `Based on ${doctor.reviewCount} reviews`;

        // Load sample reviews
        this.loadSampleReviews();
    }

    loadSampleReviews() {
        const sampleReviews = [
            {
                patientName: 'Anura Perera',
                rating: 5,
                date: '2 weeks ago',
                comment: 'Excellent doctor! Very thorough examination and clear explanation of my condition. Highly recommended.'
            },
            {
                patientName: 'Malini Fernando',
                rating: 5,
                date: '1 month ago',
                comment: 'Dr. is very professional and caring. The treatment was effective and the staff was helpful.'
            },
            {
                patientName: 'Sunil Jayawardena',
                rating: 4,
                date: '2 months ago',
                comment: 'Good experience overall. Doctor was knowledgeable and the appointment was on time.'
            }
        ];

        const reviewsHTML = sampleReviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-name">${review.patientName}</div>
                        <div class="review-date">${review.date}</div>
                    </div>
                    <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
                </div>
                <div class="review-comment">${review.comment}</div>
            </div>
        `).join('');

        document.getElementById('reviews-list').innerHTML = reviewsHTML;
    }

    setupEventListeners() {
        // Book appointment button
        const bookBtn = document.getElementById('book-appointment-btn');
        if (bookBtn) {
            bookBtn.addEventListener('click', () => this.bookAppointment());
        }

        // Save doctor button
        const saveBtn = document.getElementById('save-doctor-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveDoctor());
        }
    }

    bookAppointment() {
        // Navigate to booking page with doctor preselected
        window.location.href = `booking.html?doctor=${this.doctorId}`;
    }

    saveDoctor() {
        // Toggle save state
        const saveBtn = document.getElementById('save-doctor-btn');
        const icon = saveBtn.querySelector('i');
        
        if (icon.classList.contains('fas')) {
            icon.classList.remove('fas');
            icon.classList.add('far');
            saveBtn.innerHTML = '<i class="far fa-heart"></i> Save Doctor';
            this.showNotification('Doctor removed from saved list', 'info');
        } else {
            icon.classList.remove('far');
            icon.classList.add('fas');
            saveBtn.innerHTML = '<i class="fas fa-heart"></i> Saved';
            this.showNotification('Doctor saved to your list', 'success');
        }
    }

    showError() {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('error-state').style.display = 'block';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Quick booking function
function quickBookAppointment() {
    const date = document.getElementById('preferred-date').value;
    const time = document.getElementById('time-preference').value;
    
    if (!date) {
        alert('Please select a preferred date');
        return;
    }
    
    const doctorId = new URLSearchParams(window.location.search).get('id');
    let bookingUrl = `booking.html?doctor=${doctorId}&date=${date}`;
    
    if (time) {
        bookingUrl += `&time=${time}`;
    }
    
    window.location.href = bookingUrl;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.doctorProfileManager = new DoctorProfileManager();
    window.doctorProfileManager.init();
});