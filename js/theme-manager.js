// Theme Management System for HealthCare+ Website
// Handles automatic time-based theme switching and manual theme controls

class ThemeManager {
    constructor() {
        this.currentTheme = 'auto';
        this.themes = {
            light: 'light',
            dark: 'dark',
            auto: 'auto'
        };
        
        this.timeBasedThemes = {
            morning: { start: 6, end: 12, theme: 'light', accent: 'morning' },
            afternoon: { start: 12, end: 17, theme: 'light', accent: 'afternoon' },
            evening: { start: 17, end: 20, theme: 'dark', accent: 'evening' },
            night: { start: 20, end: 6, theme: 'dark', accent: 'night' }
        };
        
        this.init();
    }
    
    init() {
        this.loadUserPreference();
        this.setupThemeToggle();
        this.setupAutoThemeDetection();
        this.applyTheme();
        this.setupSystemThemeListener();
        
        // Update theme every minute for time-based switching
        setInterval(() => {
            if (this.currentTheme === 'auto') {
                this.applyAutoTheme();
            }
        }, 60000);
    }
    
    loadUserPreference() {
        const savedTheme = localStorage.getItem('healthcare-theme');
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        }
    }
    
    saveUserPreference() {
        localStorage.setItem('healthcare-theme', this.currentTheme);
    }
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.cycleTheme();
            });
            
            // Add keyboard support
            themeToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.cycleTheme();
                }
            });
        }
    }
    
    cycleTheme() {
        const themeOrder = ['auto', 'light', 'dark'];
        const currentIndex = themeOrder.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        
        this.currentTheme = themeOrder[nextIndex];
        this.saveUserPreference();
        this.applyTheme();
        this.updateThemeToggleIcon();
        
        // Show notification
        this.showThemeNotification();
    }
    
    applyTheme() {
        if (this.currentTheme === 'auto') {
            this.applyAutoTheme();
        } else {
            this.applyManualTheme(this.currentTheme);
        }
        
        this.updateThemeToggleIcon();
        this.addThemeTransition();
    }
    
    applyAutoTheme() {
        const timeBasedTheme = this.getTimeBasedTheme();
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let themeToApply;
        let accentToApply;
        
        if (timeBasedTheme) {
            themeToApply = timeBasedTheme.theme;
            accentToApply = timeBasedTheme.accent;
        } else {
            themeToApply = systemPrefersDark ? 'dark' : 'light';
            accentToApply = this.getCurrentTimeAccent();
        }
        
        this.applyManualTheme(themeToApply, accentToApply);
    }
    
    applyManualTheme(theme, accent = null) {
        const html = document.documentElement;
        
        // Remove existing theme classes
        html.removeAttribute('data-theme');
        html.classList.remove('theme-morning', 'theme-afternoon', 'theme-evening', 'theme-night');
        
        // Apply new theme
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.setAttribute('data-theme', 'light');
        }
        
        // Apply time-based accent if provided
        if (accent) {
            html.classList.add(`theme-${accent}`);
        }
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
    }
    
    getTimeBasedTheme() {
        const now = new Date();
        const hour = now.getHours();
        
        for (const [period, config] of Object.entries(this.timeBasedThemes)) {
            if (this.isTimeInRange(hour, config.start, config.end)) {
                return {
                    theme: config.theme,
                    accent: config.accent,
                    period: period
                };
            }
        }
        
        return null;
    }
    
    getCurrentTimeAccent() {
        const hour = new Date().getHours();
        
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 20) return 'evening';
        return 'night';
    }
    
    isTimeInRange(hour, start, end) {
        if (start <= end) {
            return hour >= start && hour < end;
        } else {
            // Handle overnight range (e.g., 20-6)
            return hour >= start || hour < end;
        }
    }
    
    setupAutoThemeDetection() {
        // Detect system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener(() => {
                if (this.currentTheme === 'auto') {
                    this.applyAutoTheme();
                }
            });
        }
    }
    
    setupSystemThemeListener() {
        // Listen for system theme changes
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkModeQuery.addEventListener('change', (e) => {
                if (this.currentTheme === 'auto') {
                    this.applyAutoTheme();
                }
            });
        }
    }
    
    updateThemeToggleIcon() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        
        const icon = themeToggle.querySelector('i');
        if (!icon) return;
        
        // Remove existing classes
        icon.className = '';
        
        switch (this.currentTheme) {
            case 'light':
                icon.className = 'fas fa-sun';
                themeToggle.setAttribute('aria-label', 'Switch to dark theme');
                break;
            case 'dark':
                icon.className = 'fas fa-moon';
                themeToggle.setAttribute('aria-label', 'Switch to auto theme');
                break;
            case 'auto':
                icon.className = 'fas fa-magic';
                themeToggle.setAttribute('aria-label', 'Switch to light theme');
                break;
        }
        
        // Add a subtle animation
        icon.style.transform = 'scale(0.8)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 150);
    }
    
    updateMetaThemeColor(theme) {
        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        
        if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta');
            themeColorMeta.name = 'theme-color';
            document.head.appendChild(themeColorMeta);
        }
        
        const colors = {
            light: '#007bff',
            dark: '#4dabf7'
        };
        
        themeColorMeta.content = colors[theme] || colors.light;
    }
    
    addThemeTransition() {
        const html = document.documentElement;
        html.classList.add('theme-transition');
        
        setTimeout(() => {
            html.classList.remove('theme-transition');
        }, 800);
    }
    
    showThemeNotification() {
        const themeNames = {
            auto: 'Auto (Time-based)',
            light: 'Light',
            dark: 'Dark'
        };
        
        const message = `Theme switched to ${themeNames[this.currentTheme]}`;
        
        if (window.HealthCare && window.HealthCare.showNotification) {
            window.HealthCare.showNotification(message, 'info', 2000);
        } else {
            // Fallback notification
            this.createSimpleNotification(message);
        }
    }
    
    createSimpleNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
    }
    
    // Public methods for external access
    setTheme(theme) {
        if (this.themes[theme]) {
            this.currentTheme = theme;
            this.saveUserPreference();
            this.applyTheme();
            return true;
        }
        return false;
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    getEffectiveTheme() {
        if (this.currentTheme === 'auto') {
            const timeBasedTheme = this.getTimeBasedTheme();
            return timeBasedTheme ? timeBasedTheme.theme : 
                   (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        }
        return this.currentTheme;
    }
    
    getCurrentTimeInfo() {
        const timeBasedTheme = this.getTimeBasedTheme();
        return {
            period: timeBasedTheme ? timeBasedTheme.period : 'unknown',
            theme: timeBasedTheme ? timeBasedTheme.theme : this.getEffectiveTheme(),
            accent: timeBasedTheme ? timeBasedTheme.accent : this.getCurrentTimeAccent()
        };
    }
    
    // Schedule theme changes
    scheduleNextThemeChange() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        // Find next theme change time
        const changeHours = [6, 12, 17, 20]; // Morning, afternoon, evening, night
        let nextChangeHour = changeHours.find(h => h > hour);
        
        if (!nextChangeHour) {
            nextChangeHour = changeHours[0]; // Next day
        }
        
        const nextChange = new Date();
        nextChange.setHours(nextChangeHour, 0, 0, 0);
        
        if (nextChangeHour <= hour) {
            nextChange.setDate(nextChange.getDate() + 1);
        }
        
        const msUntilChange = nextChange.getTime() - now.getTime();
        
        setTimeout(() => {
            if (this.currentTheme === 'auto') {
                this.applyAutoTheme();
                this.showThemeNotification();
            }
            this.scheduleNextThemeChange(); // Schedule next change
        }, msUntilChange);
        
        return nextChange;
    }
    
    // Accessibility features
    respectMotionPreferences() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.documentElement.style.setProperty('--theme-transition-duration', '0s');
        }
    }
    
    // High contrast mode support
    detectHighContrast() {
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        
        if (prefersHighContrast) {
            document.documentElement.classList.add('high-contrast');
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const themeManager = new ThemeManager();
    
    // Make theme manager globally accessible
    window.ThemeManager = themeManager;
    
    // Schedule automatic theme changes
    themeManager.scheduleNextThemeChange();
    
    // Apply accessibility preferences
    themeManager.respectMotionPreferences();
    themeManager.detectHighContrast();
    
    // Listen for accessibility preference changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
            themeManager.respectMotionPreferences();
        });
        
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', () => {
            themeManager.detectHighContrast();
        });
    }
});

// Expose theme utilities globally
window.ThemeUtils = {
    setTheme: (theme) => window.ThemeManager?.setTheme(theme),
    getCurrentTheme: () => window.ThemeManager?.getCurrentTheme(),
    getEffectiveTheme: () => window.ThemeManager?.getEffectiveTheme(),
    getCurrentTimeInfo: () => window.ThemeManager?.getCurrentTimeInfo()
};
