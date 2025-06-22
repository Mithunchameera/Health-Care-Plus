/**
 * Translation Manager for eChannelling System
 * Handles language switching and translations
 */

const translations = {
    en: {
        // Navigation
        home: "Home",
        findDoctors: "Find Doctors",
        hospitals: "Hospitals",
        specialities: "Specialities",
        about: "About",
        contact: "Contact",
        login: "Login",
        register: "Register",
        logout: "Logout",
        
        // Common buttons
        viewProfile: "View Profile",
        bookNow: "Book Now",
        viewDoctors: "View Doctors",
        moreInfo: "More Info",
        search: "Search",
        filter: "Filter",
        next: "Next",
        previous: "Previous",
        submit: "Submit",
        cancel: "Cancel",
        save: "Save",
        edit: "Edit",
        delete: "Delete",
        
        // Homepage
        heroTitle: "Find a Doctor\nBook Appointment\nOnline",
        heroSubtitle: "Sri Lanka's largest Doctor Channeling Network. Seamlessly schedule appointments with top doctors, ensuring swift access to quality healthcare.",
        getStarted: "Get Started",
        learnMore: "Learn More",
        
        // Find Doctors
        findDoctorsTitle: "Find Doctors",
        findDoctorsSubtitle: "Search and book appointments with qualified doctors",
        searchDoctors: "Search doctors...",
        allSpecialities: "All Specialities",
        allLocations: "All Locations",
        sortBy: "Sort by",
        relevance: "Relevance",
        rating: "Rating",
        experience: "Experience",
        fee: "Fee",
        doctorsFound: "doctors found",
        yearsExperience: "years experience",
        consultationFee: "Consultation Fee",
        availableToday: "Available Today",
        notAvailable: "Not Available",
        
        // Hospitals
        hospitalsTitle: "Hospital Network",
        hospitalsSubtitle: "Discover Sri Lanka's leading hospitals and medical centers in our network",
        searchHospitals: "Search hospitals...",
        allTypes: "All Types",
        generalHospital: "General Hospital",
        specializedCenter: "Specialized Center",
        privateHospital: "Private Hospital",
        doctors: "Doctors",
        specialties: "Specialities",
        emergency: "Emergency",
        
        // Specialities
        specialitiesTitle: "Medical Specialities",
        specialitiesSubtitle: "Find doctors by their area of expertise",
        
        // About
        aboutTitle: "About eChannelling",
        aboutSubtitle: "Sri Lanka's leading healthcare appointment booking platform",
        ourMission: "Our Mission",
        ourVision: "Our Vision",
        ourValues: "Our Values",
        ourTeam: "Our Team",
        
        // Contact
        contactTitle: "Contact Us",
        contactSubtitle: "Get in touch with our support team",
        name: "Name",
        email: "Email",
        subject: "Subject",
        message: "Message",
        sendMessage: "Send Message",
        phone: "Phone",
        address: "Address",
        
        // Forms
        firstName: "First Name",
        lastName: "Last Name",
        password: "Password",
        confirmPassword: "Confirm Password",
        dateOfBirth: "Date of Birth",
        gender: "Gender",
        mobileNumber: "Mobile Number",
        nicNumber: "NIC Number",
        
        // Dashboard
        dashboard: "Dashboard",
        myAppointments: "My Appointments",
        bookAppointment: "Book Appointment",
        myProfile: "My Profile",
        settings: "Settings",
        notifications: "Notifications",
        
        // Appointment Status
        pending: "Pending",
        confirmed: "Confirmed",
        completed: "Completed",
        cancelled: "Cancelled",
        
        // Common phrases
        loading: "Loading...",
        noResults: "No results found",
        tryAgain: "Try again",
        success: "Success",
        error: "Error",
        warning: "Warning",
        info: "Info"
    },
    
    si: {
        // Navigation
        home: "මුල් පිටුව",
        findDoctors: "වෛද්‍යවරුන් සොයන්න",
        hospitals: "රෝහල්",
        specialities: "විශේෂාංග",
        about: "අප ගැන",
        contact: "සම්බන්ධ වන්න",
        login: "ප්‍රවේශ වන්න",
        register: "ලියාපදිංචි වන්න",
        logout: "ඉවත් වන්න",
        
        // Common buttons
        viewProfile: "පැතිකඩ බලන්න",
        bookNow: "දැන් වෙන්කරන්න",
        viewDoctors: "වෛද්‍යවරුන් බලන්න",
        moreInfo: "වැඩි විස්තර",
        search: "සොයන්න",
        filter: "පෙරහන",
        next: "ඊළඟ",
        previous: "පෙර",
        submit: "ඉදිරිපත් කරන්න",
        cancel: "අවලංගු කරන්න",
        save: "සුරකින්න",
        edit: "සංස්කරණය",
        delete: "මකන්න",
        
        // Homepage
        heroTitle: "වෛද්‍යවරයෙකු සොයන්න\nහමුවීමක් වෙන්කරන්න\nඔන්ලයින්",
        heroSubtitle: "ශ්‍රී ලංකාවේ විශාලතම වෛද්‍ය චැනලිං ජාලය. ඉහළ මට්ටමේ වෛද්‍යවරුන් සමඟ පහසුවෙන් හමුවීම් සකස් කර ගැනීම, ගුණාත්මක සෞඛ්‍ය සේවා සඳහා ශීඝ්‍ර ප්‍රවේශය සහතික කරයි.",
        getStarted: "ආරම්භ කරන්න",
        learnMore: "වැඩි දැනගන්න",
        
        // Find Doctors
        findDoctorsTitle: "වෛද්‍යවරුන් සොයන්න",
        findDoctorsSubtitle: "සුදුසුකම් ලත් වෛද්‍යවරුන් සොයා හමුවීම් වෙන්කරන්න",
        searchDoctors: "වෛද්‍යවරුන් සොයන්න...",
        allSpecialities: "සියලුම විශේෂාංග",
        allLocations: "සියලුම ස්ථාන",
        sortBy: "අනුව පෙලගැස්වීම",
        relevance: "අදාළත්වය",
        rating: "ඇගයීම",
        experience: "අත්දැකීම",
        fee: "ගාස්තු",
        doctorsFound: "වෛද්‍යවරුන් සොයා ගන්නා ලදී",
        yearsExperience: "වසර අත්දැකීම",
        consultationFee: "උපදේශන ගාස්තු",
        availableToday: "අද ලබා ගත හැක",
        notAvailable: "ලබා ගත නොහැක",
        
        // Hospitals
        hospitalsTitle: "රෝහල් ජාලය",
        hospitalsSubtitle: "අපගේ ජාලයේ ශ්‍රී ලංකාවේ ප්‍රමුඛ රෝහල් සහ වෛද්‍ය මධ්‍යස්ථාන සොයා ගන්න",
        searchHospitals: "රෝහල් සොයන්න...",
        allTypes: "සියලුම වර්ග",
        generalHospital: "සාමාන්‍ය රෝහල",
        specializedCenter: "විශේෂාංගීකරණය කළ මධ්‍යස්ථානය",
        privateHospital: "පෞද්ගලික රෝහල",
        doctors: "වෛද්‍යවරුන්",
        specialties: "විශේෂාංග",
        emergency: "හදිසි",
        
        // Specialities
        specialitiesTitle: "වෛද්‍ය විශේෂාංග",
        specialitiesSubtitle: "ඔවුන්ගේ විශේෂතා ක්ෂේත්‍රය අනුව වෛද්‍යවරුන් සොයන්න",
        
        // About
        aboutTitle: "eChannelling ගැන",
        aboutSubtitle: "ශ්‍රී ලංකාවේ ප්‍රමුඛ සෞඛ්‍ය සේවා හමුවීම් වෙන්කිරීමේ වේදිකාව",
        ourMission: "අපගේ මෙහෙවර",
        ourVision: "අපගේ දැක්ම",
        ourValues: "අපගේ වටිනාකම්",
        ourTeam: "අපගේ කණ්ඩායම",
        
        // Contact
        contactTitle: "අප සමඟ සම්බන්ධ වන්න",
        contactSubtitle: "අපගේ සහාය කණ්ඩායම සමඟ සම්බන්ධ වන්න",
        name: "නම",
        email: "ඊමේල්",
        subject: "විෂය",
        message: "පණිවිඩය",
        sendMessage: "පණිවිඩය යවන්න",
        phone: "දුරකථනය",
        address: "ලිපිනය",
        
        // Forms
        firstName: "මුල් නම",
        lastName: "අවසාන නම",
        password: "මුරපදය",
        confirmPassword: "මුරපදය සනාථ කරන්න",
        dateOfBirth: "උපන් දිනය",
        gender: "ලිංගය",
        mobileNumber: "ජංගම දුරකථන අංකය",
        nicNumber: "ජා.හැ.ප. අංකය",
        
        // Dashboard
        dashboard: "පාලක පුවරුව",
        myAppointments: "මගේ හමුවීම්",
        bookAppointment: "හමුවීම වෙන්කරන්න",
        myProfile: "මගේ පැතිකඩ",
        settings: "සැකසීම්",
        notifications: "දැනුම්දීම්",
        
        // Appointment Status
        pending: "අපේක්ෂිත",
        confirmed: "සනාථ කළ",
        completed: "සම්පූර්ණ කළ",
        cancelled: "අවලංගු කළ",
        
        // Common phrases
        loading: "පූරණය වෙමින්...",
        noResults: "ප්‍රතිඵල හමු නොවීය",
        tryAgain: "නැවත උත්සාහ කරන්න",
        success: "සාර්ථකයි",
        error: "දෝෂය",
        warning: "අනතුරු ඇඟවීම",
        info: "තොරතුරු"
    }
};

class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('echannelling_language') || 'en';
        this.translations = translations;
        this.observers = [];
    }

    init() {
        this.setupLanguageSelector();
        this.translatePage();
        this.observeLanguageChanges();
    }

    setupLanguageSelector() {
        const languageBtn = document.querySelector('.btn-language');
        if (languageBtn) {
            this.updateLanguageButton(languageBtn);
            languageBtn.addEventListener('click', () => this.toggleLanguage());
        }
    }

    updateLanguageButton(btn) {
        btn.textContent = this.currentLanguage === 'en' ? 'EN | සිං' : 'සිං | EN';
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'si' : 'en';
        localStorage.setItem('echannelling_language', this.currentLanguage);
        
        // Update button text
        const languageBtn = document.querySelector('.btn-language');
        if (languageBtn) {
            this.updateLanguageButton(languageBtn);
        }
        
        // Translate the page
        this.translatePage();
        
        // Notify observers
        this.notifyLanguageChange();
    }

    translatePage() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getTranslation(key);
            
            if (translation) {
                if (element.tagName === 'INPUT' && element.type !== 'button' && element.type !== 'submit') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Handle special cases
        this.translateDynamicContent();
    }

    translateDynamicContent() {
        // Translate doctor cards
        this.translateDoctorCards();
        
        // Translate hospital cards
        this.translateHospitalCards();
        
        // Translate form labels
        this.translateFormLabels();
        
        // Handle multiline text
        this.translateMultilineText();
    }

    translateDoctorCards() {
        const doctorCards = document.querySelectorAll('.doctor-card');
        doctorCards.forEach(card => {
            const experienceText = card.querySelector('.doctor-experience');
            const feeText = card.querySelector('.doctor-fee');
            const availabilityText = card.querySelector('.doctor-availability');
            
            if (experienceText && experienceText.textContent.includes('years')) {
                const years = experienceText.textContent.match(/\d+/)[0];
                experienceText.textContent = this.currentLanguage === 'en' 
                    ? `${years} years experience` 
                    : `වසර ${years} අත්දැකීම`;
            }
            
            if (availabilityText) {
                if (availabilityText.textContent.includes('Available')) {
                    availabilityText.textContent = this.currentLanguage === 'en' 
                        ? 'Available Today' 
                        : 'අද ලබා ගත හැක';
                } else if (availabilityText.textContent.includes('Not Available')) {
                    availabilityText.textContent = this.currentLanguage === 'en' 
                        ? 'Not Available' 
                        : 'ලබා ගත නොහැක';
                }
            }
        });
    }

    translateHospitalCards() {
        const hospitalCards = document.querySelectorAll('.hospital-card');
        hospitalCards.forEach(card => {
            const statsLabels = card.querySelectorAll('.stat-label');
            statsLabels.forEach(label => {
                const text = label.textContent.trim();
                if (text === 'Doctors') {
                    label.textContent = this.currentLanguage === 'en' ? 'Doctors' : 'වෛද්‍යවරුන්';
                } else if (text === 'Specialities') {
                    label.textContent = this.currentLanguage === 'en' ? 'Specialities' : 'විශේෂාංග';
                } else if (text === 'Emergency') {
                    label.textContent = this.currentLanguage === 'en' ? 'Emergency' : 'හදිසි';
                }
            });
        });
    }

    translateFormLabels() {
        const labels = document.querySelectorAll('label');
        labels.forEach(label => {
            const text = label.textContent.trim();
            const translation = this.getTranslationByText(text);
            if (translation) {
                label.textContent = translation;
            }
        });
    }

    getTranslation(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    getTranslationByText(text) {
        // Find translation by matching English text
        const englishKeys = Object.keys(this.translations.en);
        for (let key of englishKeys) {
            if (this.translations.en[key] === text) {
                return this.translations[this.currentLanguage][key];
            }
        }
        return null;
    }

    translateMultilineText() {
        // Handle multiline text elements with data-translate
        const multilineElements = document.querySelectorAll('[data-translate="heroTitle"]');
        multilineElements.forEach(element => {
            const translation = this.getTranslation('heroTitle');
            if (translation) {
                // Convert \n to <br> for HTML display
                element.innerHTML = translation.replace(/\n/g, '<br>');
            }
        });
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    observeLanguageChanges() {
        // Watch for new elements added to DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const translateElements = node.querySelectorAll('[data-translate]');
                            translateElements.forEach(element => {
                                const key = element.getAttribute('data-translate');
                                const translation = this.getTranslation(key);
                                if (translation) {
                                    element.textContent = translation;
                                }
                            });
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    addLanguageChangeObserver(callback) {
        this.observers.push(callback);
    }

    notifyLanguageChange() {
        this.observers.forEach(callback => callback(this.currentLanguage));
    }
}

// Global instance
window.translationManager = new TranslationManager();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.translationManager.init();
});