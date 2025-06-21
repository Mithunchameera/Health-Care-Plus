/**
 * Global Functions for Doctor Card Interactions
 * Provides consistent functionality across all pages
 */

// Doctor profile viewing
function viewDoctorProfile(doctorId) {
    console.log(`Viewing profile for doctor ${doctorId}`);
    
    // Create and show doctor profile modal
    const modal = document.createElement('div');
    modal.className = 'doctor-profile-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div class="profile-modal-content" style="
            background: var(--card-bg, #ffffff);
            border-radius: 16px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        ">
            <div class="profile-header" style="
                padding: 2rem;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                border-radius: 16px 16px 0 0;
                text-align: center;
            ">
                <button class="close-profile" style="
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="profile-avatar" style="
                    width: 80px;
                    height: 80px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    margin: 0 auto 1rem auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    font-weight: 600;
                ">
                    Loading...
                </div>
                
                <h2 style="margin: 0 0 0.5rem 0;">Loading Doctor Profile...</h2>
                <p style="margin: 0; opacity: 0.9;">Please wait while we load the details</p>
            </div>
            
            <div class="profile-body" style="
                padding: 2rem;
                text-align: center;
            ">
                <div class="loading-spinner" style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid var(--border-color, #e5e7eb);
                    border-top: 4px solid var(--primary-color, #3b82f6);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 2rem auto;
                "></div>
                
                <p style="color: var(--text-secondary, #6b7280);">
                    Loading detailed information...
                </p>
            </div>
        </div>
        
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal handlers
    const closeBtn = modal.querySelector('.close-profile');
    closeBtn.addEventListener('click', () => modal.remove());
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Simulate loading and populate with doctor data
    setTimeout(() => {
        loadDoctorProfileData(modal, doctorId);
    }, 1000);
}

// Book appointment with doctor
function bookAppointment(doctorId) {
    console.log(`Booking appointment with doctor ${doctorId}`);
    
    // Always redirect to clean booking page
    window.location.href = 'booking.html';
}

// Select doctor (for booking page)
function selectDoctor(doctorId) {
    console.log(`Selecting doctor ${doctorId} for booking`);
    
    // Remove previous selections
    document.querySelectorAll('.doctor-card-modern, .doctor-card-compact').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to current card
    const selectedCard = document.querySelector(`[data-doctor-id="${doctorId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        
        // Add selection styles
        selectedCard.style.borderColor = 'var(--primary-color, #3b82f6)';
        selectedCard.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
        
        // Store selected doctor
        if (window.bookingManager && window.bookingManager.selectDoctor) {
            window.bookingManager.selectDoctor(doctorId);
        }
        
        // Scroll to next step if available
        if (window.autoScrollManager) {
            setTimeout(() => {
                const nextStep = document.querySelector('.booking-step:not(.completed) + .booking-step');
                if (nextStep) {
                    window.autoScrollManager.scrollToElement(nextStep);
                }
            }, 500);
        }
    }
}

// Load doctor profile data
function loadDoctorProfileData(modal, doctorId) {
    // In a real implementation, this would fetch from API
    // For now, we'll use mock data
    const mockDoctor = {
        id: doctorId,
        name: 'Sarah Johnson',
        specialty: 'Cardiology',
        location: 'Medical Center, Downtown',
        experience: 15,
        rating: 4.8,
        reviews: 156,
        fee: 250,
        education: 'Harvard Medical School',
        certifications: ['Board Certified Cardiologist', 'Advanced Cardiac Life Support'],
        languages: ['English', 'Spanish'],
        about: 'Dr. Johnson is a board-certified cardiologist with extensive experience in treating heart conditions.',
        services: ['Cardiac Consultation', 'ECG', 'Stress Testing', 'Heart Surgery']
    };
    
    const initials = mockDoctor.name.split(' ').map(n => n[0]).join('');
    
    modal.querySelector('.profile-modal-content').innerHTML = `
        <div class="profile-header" style="
            padding: 2rem;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border-radius: 16px 16px 0 0;
            text-align: center;
        ">
            <button class="close-profile" style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="profile-avatar" style="
                width: 80px;
                height: 80px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                margin: 0 auto 1rem auto;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                font-weight: 600;
            ">
                ${initials}
            </div>
            
            <h2 style="margin: 0 0 0.5rem 0;">${mockDoctor.name}</h2>
            <p style="margin: 0; opacity: 0.9;">${mockDoctor.specialty}</p>
        </div>
        
        <div class="profile-body" style="padding: 2rem;">
            <div class="profile-stats" style="
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
                text-align: center;
            ">
                <div style="
                    padding: 1rem;
                    background: var(--bg-secondary, #f8fafc);
                    border-radius: 12px;
                ">
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--primary-color, #3b82f6);">
                        ${mockDoctor.experience}
                    </div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary, #6b7280);">
                        Years Experience
                    </div>
                </div>
                
                <div style="
                    padding: 1rem;
                    background: var(--bg-secondary, #f8fafc);
                    border-radius: 12px;
                ">
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--primary-color, #3b82f6);">
                        ${mockDoctor.rating}
                    </div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary, #6b7280);">
                        Rating
                    </div>
                </div>
                
                <div style="
                    padding: 1rem;
                    background: var(--bg-secondary, #f8fafc);
                    border-radius: 12px;
                ">
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--primary-color, #3b82f6);">
                        $${mockDoctor.fee}
                    </div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary, #6b7280);">
                        Consultation Fee
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--text-color, #1f2937);">
                    <i class="fas fa-user-md" style="margin-right: 0.5rem; color: var(--primary-color, #3b82f6);"></i>
                    About
                </h3>
                <p style="line-height: 1.6; color: var(--text-secondary, #6b7280);">
                    ${mockDoctor.about}
                </p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--text-color, #1f2937);">
                    <i class="fas fa-map-marker-alt" style="margin-right: 0.5rem; color: var(--primary-color, #3b82f6);"></i>
                    Location
                </h3>
                <p style="color: var(--text-secondary, #6b7280);">${mockDoctor.location}</p>
            </div>
            
            <div style="text-align: center;">
                <button onclick="bookAppointment(${mockDoctor.id}); this.closest('.doctor-profile-modal').remove();" style="
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(59, 130, 246, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    <i class="fas fa-calendar-plus"></i>
                    Book Appointment
                </button>
            </div>
        </div>
    `;
    
    // Re-attach close handler
    const closeBtn = modal.querySelector('.close-profile');
    closeBtn.addEventListener('click', () => modal.remove());
}

// Initialize global functions
document.addEventListener('DOMContentLoaded', () => {
    // Make functions globally available
    window.viewDoctorProfile = viewDoctorProfile;
    window.bookAppointment = bookAppointment;
    window.selectDoctor = selectDoctor;
    window.loadDoctorProfileData = loadDoctorProfileData;
});