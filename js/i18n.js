// Internationalization (i18n) System
class I18n {
    constructor() {
        this.currentLang = 'en';
        this.translations = {};
        this.init();
    }

    init() {
        // Load saved language or default to English
        this.currentLang = localStorage.getItem('preferred-language') || 'en';
        
        // Set up language toggle buttons
        this.setupLanguageToggle();
        
        // Apply initial language
        this.applyLanguage(this.currentLang);
    }

    setupLanguageToggle() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const newLang = btn.dataset.lang;
                this.switchLanguage(newLang);
                
                // Update button states
                langButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Set initial active button
        document.querySelector(`[data-lang="${this.currentLang}"]`)?.classList.add('active');
    }

    switchLanguage(lang) {
        if (lang === this.currentLang) return;
        
        this.currentLang = lang;
        localStorage.setItem('preferred-language', lang);
        
        // Apply language with smooth transition
        this.applyLanguage(lang);
        
        // Update document language attribute
        document.documentElement.lang = lang;
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }

    applyLanguage(lang) {
        // Update all elements with data attributes
        const elements = document.querySelectorAll('[data-en], [data-ko]');
        
        elements.forEach(element => {
            const text = element.getAttribute(`data-${lang}`);
            if (text) {
                // Handle different element types
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = text;
                } else {
                    element.textContent = text;
                }
                
                // Add fade effect for smooth transition
                element.style.opacity = '0.5';
                setTimeout(() => {
                    element.style.opacity = '1';
                }, 150);
            }
        });

        // Update dynamic content from resume data
        this.updateDynamicContent(lang);
        
        // Update page title
        document.title = lang === 'ko' ? '제태호 - 포트폴리오' : 'Taeho Je - Portfolio';
    }

    updateDynamicContent(lang) {
        // This will be called by the data manager to update content
        if (window.dataManager && window.dataManager.resumeData) {
            window.dataManager.updateLanguage(lang);
        }
    }

    // Get translated text for dynamic content
    t(key, lang = null) {
        const currentLang = lang || this.currentLang;
        
        // If the key is an object with language properties
        if (typeof key === 'object' && key[currentLang]) {
            return key[currentLang];
        }
        
        // If it's a string, return as is
        if (typeof key === 'string') {
            return key;
        }
        
        return key;
    }

    // Format numbers according to locale
    formatNumber(number, options = {}) {
        const locale = this.currentLang === 'ko' ? 'ko-KR' : 'en-US';
        return new Intl.NumberFormat(locale, options).format(number);
    }

    // Format dates according to locale
    formatDate(date, options = {}) {
        const locale = this.currentLang === 'ko' ? 'ko-KR' : 'en-US';
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            ...options
        };
        return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLang;
    }

    // Check if current language is RTL (not applicable for Korean/English but useful for future)
    isRTL() {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(this.currentLang);
    }
}

// Initialize i18n system
const i18n = new I18n();
window.i18n = i18n;

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}