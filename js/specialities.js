// Specialities Page JavaScript

class SpecialitiesManager {
    constructor() {
        this.specialities = [];
        this.filteredSpecialities = [];
        this.initializeSpecialities();
    }

    initializeSpecialities() {
        this.loadSpecialitiesData();
        this.setupSearch();
        this.setupAnimations();
    }

    loadSpecialitiesData() {
        // Get all speciality cards
        this.specialities = Array.from(document.querySelectorAll('.speciality-card'));
        this.filteredSpecialities = [...this.specialities];
    }

    setupSearch() {
        const searchInput = document.getElementById('speciality-search');
        const searchBtn = document.querySelector('.btn-search');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(searchInput.value);
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.handleSearch(searchInput.value);
            });
        }
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            // Show all specialities
            this.specialities.forEach(card => {
                card.classList.remove('hidden', 'filtered');
                card.classList.add('animate-in');
            });
            return;
        }

        this.specialities.forEach(card => {
            const specialityName = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const conditions = Array.from(card.querySelectorAll('.common-conditions li'))
                .map(li => li.textContent.toLowerCase())
                .join(' ');

            const isMatch = specialityName.includes(searchTerm) || 
                          description.includes(searchTerm) || 
                          conditions.includes(searchTerm);

            if (isMatch) {
                card.classList.remove('hidden', 'filtered');
                card.classList.add('animate-in');
            } else {
                card.classList.add('filtered');
                card.classList.remove('animate-in');
            }
        });

        // Show search results count
        const visibleCards = this.specialities.filter(card => 
            !card.classList.contains('hidden') && !card.classList.contains('filtered')
        );

        this.showSearchResults(visibleCards.length, searchTerm);
    }

    showSearchResults(count, searchTerm) {
        // Remove existing search result message
        const existingMessage = document.querySelector('.search-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new search result message
        const message = document.createElement('div');
        message.className = 'search-results-message';
        message.innerHTML = `
            <p>Found ${count} specialit${count === 1 ? 'y' : 'ies'} matching "${searchTerm}"</p>
            ${count === 0 ? '<p class="no-results-text">Try searching for different terms or browse all specialities.</p>' : ''}
            <button class="btn-clear-search" onclick="specialitiesManager.clearSearch()">Clear Search</button>
        `;

        // Insert message before the grid
        const grid = document.querySelector('.specialities-grid');
        grid.parentNode.insertBefore(message, grid);

        // Auto-hide message after 5 seconds if there are results
        if (count > 0) {
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 5000);
        }
    }

    clearSearch() {
        const searchInput = document.getElementById('speciality-search');
        if (searchInput) {
            searchInput.value = '';
        }

        // Remove search results message
        const message = document.querySelector('.search-results-message');
        if (message) {
            message.remove();
        }

        // Show all specialities
        this.handleSearch('');
    }

    setupAnimations() {
        // Animate cards on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add a small delay for staggered animation
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, index * 100);
                }
            });
        }, observerOptions);

        // Observe all speciality cards
        this.specialities.forEach(card => {
            observer.observe(card);
        });
    }

    // Navigate to doctors page with speciality filter
    findDoctors(speciality) {
        window.location.href = `find-doctors.html?speciality=${encodeURIComponent(speciality)}`;
    }
}

// Initialize specialities manager
let specialitiesManager;

document.addEventListener('DOMContentLoaded', () => {
    specialitiesManager = new SpecialitiesManager();
});

// Specialty Details Data
const specialtyData = {
    'cardiology': {
        title: 'Cardiology',
        icon: '❤️',
        description: 'Cardiology is a medical specialty that deals with disorders of the heart and blood vessels. Cardiologists are specialized doctors who diagnose, treat, and prevent cardiovascular diseases including heart attacks, heart failure, arrhythmias, and congenital heart defects.',
        doctorCount: '25+',
        hospitalCount: '8',
        avgWait: '2-3 days',
        avgFee: 'Rs. 2,500 - 4,000',
        conditions: [
            'Heart Disease and Heart Attacks',
            'High Blood Pressure (Hypertension)',
            'Heart Rhythm Disorders (Arrhythmia)',
            'Heart Failure and Cardiomyopathy',
            'Coronary Artery Disease',
            'Valve Disorders',
            'Congenital Heart Defects'
        ],
        symptoms: [
            'Chest pain or discomfort',
            'Shortness of breath',
            'Irregular heartbeat or palpitations',
            'Swelling in legs, ankles, or feet',
            'Excessive fatigue',
            'Dizziness or fainting',
            'High blood pressure readings'
        ],
        expectations: 'During your cardiology consultation, expect a thorough medical history review, physical examination focusing on your heart and circulation, and possibly diagnostic tests like ECG, echocardiogram, or stress tests. Your cardiologist will discuss lifestyle modifications, medications, or procedures as needed.',
        hospitals: [
            { name: 'National Hospital of Sri Lanka', rating: '⭐⭐⭐⭐⭐' },
            { name: 'Apollo Hospital Colombo', rating: '⭐⭐⭐⭐⭐' },
            { name: 'Asiri Central Hospital', rating: '⭐⭐⭐⭐' },
            { name: 'Durdans Hospital', rating: '⭐⭐⭐⭐' }
        ]
    },
    'dermatology': {
        title: 'Dermatology',
        icon: '🧴',
        description: 'Dermatology focuses on the diagnosis and treatment of skin, hair, and nail disorders. Dermatologists treat conditions ranging from common skin problems like acne and eczema to serious diseases like skin cancer, providing both medical and cosmetic treatments.',
        doctorCount: '18+',
        hospitalCount: '6',
        avgWait: '1-2 weeks',
        avgFee: 'Rs. 2,000 - 3,500',
        conditions: [
            'Acne and Acne Scarring',
            'Skin Cancer and Mole Removal',
            'Eczema and Dermatitis',
            'Psoriasis',
            'Hair Loss and Alopecia',
            'Skin Infections',
            'Cosmetic Procedures'
        ],
        symptoms: [
            'Persistent skin rashes or irritation',
            'Changes in moles or skin growths',
            'Severe acne that doesn\'t respond to treatment',
            'Hair loss or thinning',
            'Skin infections or wounds that won\'t heal',
            'Excessive dryness or oily skin',
            'Cosmetic skin concerns'
        ],
        expectations: 'Your dermatologist will examine your skin, hair, and nails thoroughly. They may use specialized tools like dermatoscopes for detailed examination. Treatment plans may include topical medications, oral treatments, or procedures like chemical peels or laser therapy.',
        hospitals: [
            { name: 'Asiri Central Hospital', rating: '⭐⭐⭐⭐⭐' },
            { name: 'Apollo Hospital Colombo', rating: '⭐⭐⭐⭐' },
            { name: 'Nawaloka Hospital', rating: '⭐⭐⭐⭐' },
            { name: 'Lanka Hospital', rating: '⭐⭐⭐⭐' }
        ]
    },
    'orthopedic': {
        title: 'Orthopedic Surgery',
        icon: '🦴',
        description: 'Orthopedic surgery specializes in the diagnosis, treatment, and rehabilitation of disorders of the musculoskeletal system including bones, joints, ligaments, tendons, and muscles. Orthopedic surgeons treat everything from fractures to joint replacements.',
        doctorCount: '30+',
        hospitalCount: '10',
        avgWait: '1-2 weeks',
        avgFee: 'Rs. 3,000 - 5,000',
        conditions: [
            'Fractures and Bone Injuries',
            'Arthritis and Joint Problems',
            'Sports Injuries',
            'Joint Replacement Surgery',
            'Back and Spine Problems',
            'Tendon and Ligament Injuries',
            'Bone Tumors'
        ],
        symptoms: [
            'Persistent joint or bone pain',
            'Limited range of motion',
            'Swelling or deformity',
            'Difficulty walking or bearing weight',
            'Sports-related injuries',
            'Back or neck pain',
            'Chronic arthritis symptoms'
        ],
        expectations: 'Your orthopedic consultation will include a physical examination of the affected area, review of imaging studies (X-rays, MRI, CT scans), and discussion of treatment options ranging from conservative management to surgical intervention.',
        hospitals: [
            { name: 'National Hospital of Sri Lanka', rating: '⭐⭐⭐⭐⭐' },
            { name: 'Apollo Hospital Colombo', rating: '⭐⭐⭐⭐⭐' },
            { name: 'Asiri Central Hospital', rating: '⭐⭐⭐⭐' },
            { name: 'Durdans Hospital', rating: '⭐⭐⭐⭐⭐' }
        ]
    },
    'pediatrics': {
        title: 'Pediatrics',
        icon: '👶',
        description: 'Pediatrics is the medical specialty focused on the health and medical care of infants, children, and adolescents from birth up to 18 years. Pediatricians provide comprehensive healthcare including preventive care, diagnosis, and treatment of childhood illnesses.',
        doctorCount: '22+',
        hospitalCount: '7',
        avgWait: '3-5 days',
        avgFee: 'Rs. 1,800 - 3,000',
        conditions: [
            'Childhood Development and Growth',
            'Vaccinations and Immunizations',
            'Common Childhood Illnesses',
            'Respiratory Infections',
            'Behavioral and Learning Issues',
            'Nutritional Problems',
            'Adolescent Health'
        ],
        symptoms: [
            'Delayed growth or development',
            'Persistent fever or illness',
            'Breathing difficulties',
            'Feeding or eating problems',
            'Behavioral concerns',
            'School performance issues',
            'Vaccination schedule maintenance'
        ],
        expectations: 'Pediatric visits include growth and development assessments, physical examinations appropriate for the child\'s age, vaccination updates, and guidance on nutrition, safety, and developmental milestones. Parents are encouraged to ask questions about their child\'s health and development.',
        hospitals: [
            { name: 'Lady Ridgeway Hospital', rating: '⭐⭐⭐⭐⭐' },
            { name: 'Apollo Hospital Colombo', rating: '⭐⭐⭐⭐' },
            { name: 'Asiri Central Hospital', rating: '⭐⭐⭐⭐' },
            { name: 'Nawaloka Hospital', rating: '⭐⭐⭐⭐' }
        ]
    },
    'general-medicine': {
        title: 'General Medicine',
        icon: '🩺',
        description: 'General medicine provides comprehensive primary healthcare for adults, focusing on the prevention, diagnosis, and treatment of a wide range of medical conditions. General physicians serve as the first point of contact for most health concerns.',
        doctorCount: '45+',
        hospitalCount: '12',
        avgWait: '1-3 days',
        avgFee: 'Rs. 1,500 - 2,500',
        conditions: [
            'Routine Health Checkups',
            'Diabetes Management',
            'Hypertension Control',
            'Respiratory Infections',
            'Preventive Care and Screenings',
            'Chronic Disease Management',
            'General Health Consultations'
        ],
        symptoms: [
            'General illness or malaise',
            'Chronic condition management needs',
            'Preventive health screening',
            'Multiple health concerns',
            'Medication management',
            'Health risk assessment',
            'Annual health checkups'
        ],
        expectations: 'Your general medicine consultation will include a comprehensive health assessment, review of medical history, physical examination, and coordination of care with specialists if needed. Focus is on overall health maintenance and early detection of health issues.',
        hospitals: [
            { name: 'National Hospital of Sri Lanka', rating: '⭐⭐⭐⭐' },
            { name: 'Apollo Hospital Colombo', rating: '⭐⭐⭐⭐' },
            { name: 'Asiri Central Hospital', rating: '⭐⭐⭐⭐' },
            { name: 'Durdans Hospital', rating: '⭐⭐⭐⭐' }
        ]
    },
    'surgery': {
        title: 'General Surgery',
        icon: '🔬',
        description: 'General surgery encompasses surgical procedures involving the abdomen, digestive system, endocrine system, and other areas. General surgeons perform both elective and emergency operations to treat various medical conditions.',
        doctorCount: '20+',
        hospitalCount: '8',
        avgWait: '1-2 weeks',
        avgFee: 'Rs. 4,000 - 6,000',
        conditions: [
            'Appendectomy',
            'Gallbladder Surgery',
            'Hernia Repair',
            'Emergency Surgery',
            'Abdominal Surgery',
            'Breast Surgery',
            'Thyroid Surgery'
        ],
        symptoms: [
            'Severe abdominal pain',
            'Hernias or lumps',
            'Gallbladder problems',
            'Emergency surgical conditions',
            'Breast lumps or abnormalities',
            'Thyroid nodules',
            'Chronic surgical conditions'
        ],
        expectations: 'Surgical consultations involve detailed examination, review of diagnostic tests, discussion of surgical options, risks and benefits, pre-operative preparation, and post-operative care planning. Emergency surgeries may require immediate intervention.',
        hospitals: [
            { name: 'National Hospital of Sri Lanka', rating: '⭐⭐⭐⭐⭐' },
            { name: 'Apollo Hospital Colombo', rating: '⭐⭐⭐⭐⭐' },
            { name: 'Asiri Central Hospital', rating: '⭐⭐⭐⭐' },
            { name: 'Durdans Hospital', rating: '⭐⭐⭐⭐⭐' }
        ]
    },
    'gynecology': {
        title: 'Gynecology',
        icon: '👩‍⚕️',
        description: 'Gynecology focuses on women\'s reproductive health, including the diagnosis and treatment of conditions affecting the female reproductive system. Gynecologists provide comprehensive care from adolescence through menopause and beyond.',
        doctorCount: '15+',
        hospitalCount: '6',
        avgWait: '1-2 weeks',
        avgFee: 'Rs. 2,500 - 4,000',
        conditions: [
            'Prenatal Care and Pregnancy',
            'Gynecologic Examinations',
            'Family Planning and Contraception',
            'Reproductive Health Issues',
            'Menstrual Disorders',
            'Menopause Management',
            'Gynecologic Surgery'
        ],
        symptoms: [
            'Irregular menstrual cycles',
            'Pregnancy-related concerns',
            'Pelvic pain or discomfort',
            'Reproductive health questions',
            'Menopause symptoms',
            'Contraception consultation',
            'Annual gynecologic screening'
        ],
        expectations: 'Gynecologic visits include pelvic examinations, Pap smears, breast examinations, discussion of reproductive health concerns, and preventive care guidance. Prenatal visits include monitoring of pregnancy progress and fetal development.',
        hospitals: [
            { name: 'Castle Street Women\'s Hospital', rating: '⭐⭐⭐⭐⭐' },
            { name: 'Apollo Hospital Colombo', rating: '⭐⭐⭐⭐' },
            { name: 'Asiri Central Hospital', rating: '⭐⭐⭐⭐' },
            { name: 'Durdans Hospital', rating: '⭐⭐⭐⭐' }
        ]
    },
    'psychiatry': {
        title: 'Psychiatry',
        icon: '🧠',
        description: 'Psychiatry is the medical specialty devoted to the diagnosis, prevention, and treatment of mental health disorders. Psychiatrists help patients with various psychological conditions through therapy, medication, and comprehensive treatment plans.',
        doctorCount: '12+',
        hospitalCount: '5',
        avgWait: '1-3 weeks',
        avgFee: 'Rs. 3,000 - 5,000',
        conditions: [
            'Depression and Anxiety Disorders',
            'Stress and Trauma Management',
            'Behavioral Therapy',
            'Mental Wellness Counseling',
            'Bipolar Disorder',
            'ADHD and Learning Disorders',
            'Substance Abuse Treatment'
        ],
        symptoms: [
            'Persistent sadness or anxiety',
            'Difficulty coping with stress',
            'Changes in sleep or appetite',
            'Concentration problems',
            'Mood swings or irritability',
            'Social withdrawal',
            'Thoughts of self-harm'
        ],
        expectations: 'Psychiatric consultations involve detailed mental health assessments, discussion of symptoms and triggers, exploration of treatment options including therapy and medication, and development of personalized treatment plans for mental wellness.',
        hospitals: [
            { name: 'National Institute of Mental Health', rating: '⭐⭐⭐⭐⭐' },
            { name: 'Apollo Hospital Colombo', rating: '⭐⭐⭐⭐' },
            { name: 'Asiri Central Hospital', rating: '⭐⭐⭐⭐' },
            { name: 'Durdans Hospital', rating: '⭐⭐⭐⭐' }
        ]
    },
    'ophthalmology': {
        title: 'Ophthalmology',
        icon: '👁️',
        description: 'Ophthalmology is the medical specialty that deals with the diagnosis and treatment of eye and vision disorders. Ophthalmologists provide comprehensive eye care including medical treatment, surgical procedures, and vision correction.',
        doctorCount: '14+',
        hospitalCount: '6',
        avgWait: '1-2 weeks',
        avgFee: 'Rs. 2,200 - 3,800',
        conditions: [
            'Comprehensive Eye Examinations',
            'Cataract Surgery',
            'Glaucoma Treatment',
            'Vision Correction and Refractive Surgery',
            'Retinal Disorders',
            'Diabetic Eye Disease',
            'Pediatric Eye Care'
        ],
        symptoms: [
            'Vision changes or loss',
            'Eye pain or discomfort',
            'Flashing lights or floaters',
            'Double vision',
            'Eye infections or injuries',
            'Difficulty seeing at night',
            'Need for vision correction'
        ],
        expectations: 'Eye examinations include visual acuity tests, pupil dilation, pressure measurements, and detailed examination of eye structures. Treatment may involve glasses, contact lenses, medications, or surgical procedures depending on the condition.',
        hospitals: [
            { name: 'National Eye Hospital', rating: '⭐⭐⭐⭐⭐' },
            { name: 'Apollo Hospital Colombo', rating: '⭐⭐⭐⭐' },
            { name: 'Asiri Central Hospital', rating: '⭐⭐⭐⭐' },
            { name: 'Nawaloka Hospital', rating: '⭐⭐⭐⭐' }
        ]
    }
};

// Make functions globally accessible
window.showSpecialityDetails = function(specialtyId) {
    const data = specialtyData[specialtyId];
    if (!data) return;

    // Populate modal content
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalIcon').textContent = data.icon;
    document.getElementById('modalDescription').textContent = data.description;
    document.getElementById('modalDoctorCount').textContent = data.doctorCount;
    document.getElementById('modalHospitalCount').textContent = data.hospitalCount;
    document.getElementById('modalAvgWait').textContent = data.avgWait;
    document.getElementById('modalAvgFee').textContent = data.avgFee;

    // Populate conditions list
    const conditionsList = document.getElementById('modalConditions');
    conditionsList.innerHTML = data.conditions.map(condition => 
        `<li>${condition}</li>`
    ).join('');

    // Populate symptoms list
    const symptomsList = document.getElementById('modalSymptoms');
    symptomsList.innerHTML = data.symptoms.map(symptom => 
        `<li>${symptom}</li>`
    ).join('');

    // Populate expectations
    document.getElementById('modalExpectations').textContent = data.expectations;

    // Populate hospitals list
    const hospitalsList = document.getElementById('modalHospitals');
    hospitalsList.innerHTML = data.hospitals.map(hospital => 
        `<div class="hospital-item">
            <span class="hospital-name">${hospital.name}</span>
            <span class="hospital-rating">${hospital.rating}</span>
        </div>`
    ).join('');

    // Set up find doctors button
    const findDoctorsBtn = document.getElementById('modalFindDoctors');
    findDoctorsBtn.onclick = () => {
        window.location.href = `find-doctors.html?speciality=${specialtyId}`;
    };

    // Show modal
    document.getElementById('specialityModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

window.closeSpecialityModal = function() {
    document.getElementById('specialityModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('specialityModal');
    if (event.target === modal) {
        closeSpecialityModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeSpecialityModal();
    }
});

// Add CSS for search results and animations
const specialitiesStyles = `
.search-results-message {
    background: var(--white);
    padding: var(--spacing-lg);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    text-align: center;
    margin-bottom: var(--spacing-xl);
    border-left: 4px solid var(--primary-blue);
}

.search-results-message p {
    margin-bottom: var(--spacing-sm);
    color: var(--primary-blue-dark);
    font-weight: 500;
}

.no-results-text {
    color: var(--text-gray);
    font-size: var(--font-size-sm);
}

.btn-clear-search {
    background: none;
    border: 1px solid var(--primary-blue);
    color: var(--primary-blue);
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: var(--spacing-sm);
}

.btn-clear-search:hover {
    background-color: var(--primary-blue);
    color: var(--white);
}

.speciality-card {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.3s ease;
}

.speciality-card.animate-in {
    opacity: 1;
    transform: translateY(0);
}

.speciality-card.filtered {
    opacity: 0.3;
    transform: scale(0.95);
    pointer-events: none;
}

.speciality-card.hidden {
    display: none;
}

/* Hover effects for better interactivity */
.speciality-card:hover .speciality-icon {
    transform: scale(1.1);
    transition: transform 0.3s ease;
}

.speciality-card:hover h3 {
    color: var(--primary-blue);
    transition: color 0.3s ease;
}
`;

// Inject specialities-specific styles
const specialitiesStyleSheet = document.createElement('style');
specialitiesStyleSheet.textContent = specialitiesStyles;
document.head.appendChild(specialitiesStyleSheet);