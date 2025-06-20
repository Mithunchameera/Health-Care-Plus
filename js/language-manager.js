/**
 * Language Manager for HealthCare+ System
 * Handles multi-language support and text translation
 */

class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.init();
    }

    init() {
        this.loadTranslations();
        this.setupEventListeners();
        this.setInitialLanguage();
    }

    loadTranslations() {
        this.translations = {
            en: {
                // Navigation
                'home': 'Home',
                'about_us': 'About Us',
                'contact_us': 'Contact Us',
                'login': 'Login',
                'register': 'Register',
                
                // Hero Section
                'hero_title': 'Your Health, Our Priority',
                'hero_subtitle': 'Book appointments with trusted healthcare professionals instantly. Experience modern healthcare management with our intuitive e-channelling platform.',
                'learn_more': 'Learn More',
                'contact_us_btn': 'Contact Us',
                
                // Features
                'why_choose': 'Why Choose HealthCare+?',
                'easy_booking': 'Easy Booking',
                'easy_booking_desc': 'Schedule appointments with your preferred doctors in just a few clicks. Real-time availability updates.',
                'qualified_doctors': 'Qualified Doctors',
                'qualified_doctors_desc': 'Access to a network of certified healthcare professionals across various specializations.',
                'access_247': '24/7 Access',
                'access_247_desc': 'Book appointments anytime, anywhere. Our platform is available round the clock for your convenience.',
                'secure_private': 'Secure & Private',
                'secure_private_desc': 'Your health data is protected with enterprise-grade security and privacy measures.'
            },
            si: {
                // Navigation
                'home': 'මුල් පිටුව',
                'about_us': 'අප ගැන',
                'contact_us': 'අප හා සම්බන්ධ වන්න',
                'login': 'පිවිසීම',
                'register': 'ලියාපදිංචි වීම',
                
                // Hero Section
                'hero_title': 'ඔබේ සෞඛ්‍යය, අපේ ප්‍රමුඛතාවය',
                'hero_subtitle': 'විශ්වාසදායක සෞඛ්‍ය සේවා වෘත්තිකයන් සමඟ ක්ෂණිකව මුණගැසීම් වෙන්කරවා ගන්න. අපගේ අන්තර්ගත ඊ-චැනලිං වේදිකාව සමඟ නවීන සෞඛ්‍ය කළමනාකරණය අත්විඳින්න.',
                'learn_more': 'තව දැන ගන්න',
                'contact_us_btn': 'අප හා සම්බන්ධ වන්න',
                
                // Features
                'why_choose': 'HealthCare+ තෝරා ගන්නේ ඇයි?',
                'easy_booking': 'පහසු වෙන්කරවීම',
                'easy_booking_desc': 'ක්ලික් කිහිපයකින් ඔබේ කැමති වෛද්‍යවරුන් සමඟ මුණගැසීම් කාලසටහන් කරන්න. තත්‍ය කාලීන ලබා ගත හැකි දිනයන් යාවත්කාලීන කරන්න.',
                'qualified_doctors': 'සුදුසුකම් ලත් වෛද්‍යවරු',
                'qualified_doctors_desc': 'විවිධ විශේෂීකරණයන් පුරා සහතික කළ සෞඛ්‍ය වෘත්තිකයන්ගේ ජාලයකට ප්‍රවේශය.',
                'access_247': '24/7 ප්‍රවේශය',
                'access_247_desc': 'ඕනෑම වේලාවක, ඕනෑම තැනක මුණගැසීම් වෙන්කරවා ගන්න. ඔබේ පහසුව සඳහා අපගේ වේදිකාව 24 පැය ලබා ගත හැකිය.',
                'secure_private': 'ආරක්ෂිත සහ පුද්ගලික',
                'secure_private_desc': 'ඔබේ සෞඛ්‍ය දත්ත ව්‍යාපාරික මට්ටමේ ආරක්ෂණ සහ පුද්ගලිකත්ව ක්‍රම මගින් ආරක්ෂා කර ඇත.'
            }
        };
    }

    setupEventListeners() {
        const languageToggle = document.getElementById('language-toggle');
        const languageDropdown = document.getElementById('language-dropdown');
        const languageOptions = document.querySelectorAll('.language-option');

        if (languageToggle && languageDropdown) {
            // Toggle dropdown
            languageToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                languageDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                languageDropdown.classList.remove('show');
            });

            // Handle language selection
            languageOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    const selectedLang = option.getAttribute('data-lang');
                    this.changeLanguage(selectedLang);
                    languageDropdown.classList.remove('show');
                });
            });
        }
    }

    setInitialLanguage() {
        // Get saved language or detect browser language
        const savedLang = localStorage.getItem('preferred-language');
        const browserLang = navigator.language.split('-')[0];
        
        if (savedLang && this.translations[savedLang]) {
            this.currentLanguage = savedLang;
        } else if (this.translations[browserLang]) {
            this.currentLanguage = browserLang;
        }
        
        this.updateLanguageDisplay();
        this.translatePage();
    }

    changeLanguage(langCode) {
        if (this.translations[langCode]) {
            this.currentLanguage = langCode;
            localStorage.setItem('preferred-language', langCode);
            this.updateLanguageDisplay();
            this.translatePage();
            this.showNotification(`Language changed to ${this.getLanguageName(langCode)}`, 'success');
        }
    }

    updateLanguageDisplay() {
        const currentLangElement = document.getElementById('current-language');
        if (currentLangElement) {
            currentLangElement.textContent = this.currentLanguage.toUpperCase();
        }
    }

    translatePage() {
        const translations = this.translations[this.currentLanguage];
        if (!translations) return;

        // Translate elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });

        // Update page title and meta tags if needed
        const pageTitleKey = document.querySelector('meta[name="page-title"]');
        if (pageTitleKey && translations[pageTitleKey.content]) {
            document.title = translations[pageTitleKey.content];
        }
    }

    getLanguageName(langCode) {
        const names = {
            'en': 'English',
            'si': 'සිංහල'
        };
        return names[langCode] || langCode.toUpperCase();
    }

    getText(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-bg);
            color: var(--text-color);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border-left: 4px solid var(--primary-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        notification.textContent = message;

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
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize language manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageManager;
}