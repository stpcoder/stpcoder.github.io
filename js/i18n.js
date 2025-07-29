// Internationalization (i18n) System - Simplified and Robust
(function() {
    'use strict';

    class I18n {
        constructor() {
            this.currentLang = localStorage.getItem('preferred-language') || 'en';
            this.initialized = false;
        }

        init() {
            // Ensure DOM is fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initialize());
            } else {
                this.initialize();
            }
        }

        initialize() {
            if (this.initialized) return;
            
            console.log('Initializing i18n system...');
            this.setupLanguageToggle();
            this.applyLanguage(this.currentLang);
            this.initialized = true;
            console.log('i18n system initialized successfully');
        }

        setupLanguageToggle() {
            // Use event delegation on the parent container
            const toggleContainer = document.getElementById('languageToggle');
            
            if (!toggleContainer) {
                console.error('Language toggle container not found');
                return;
            }

            // Remove any existing listeners
            toggleContainer.replaceWith(toggleContainer.cloneNode(true));
            const newToggleContainer = document.getElementById('languageToggle');

            // Add single event listener to parent
            newToggleContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.lang-btn');
                if (!btn) return;

                e.preventDefault();
                e.stopPropagation();

                const newLang = btn.dataset.lang;
                console.log('Language button clicked:', newLang);

                if (newLang && newLang !== this.currentLang) {
                    this.switchLanguage(newLang);
                }
            });

            // Set initial active state
            this.updateButtonStates();
        }

        updateButtonStates() {
            const buttons = document.querySelectorAll('.lang-btn');
            buttons.forEach(btn => {
                if (btn.dataset.lang === this.currentLang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        switchLanguage(lang) {
            console.log(`Switching language from ${this.currentLang} to ${lang}`);
            this.currentLang = lang;
            localStorage.setItem('preferred-language', lang);
            
            this.applyLanguage(lang);
            this.updateButtonStates();
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: lang } 
            }));
        }

        applyLanguage(lang) {
            console.log('Applying language:', lang);
            
            // Update all elements with data-en or data-ko attributes
            const elements = document.querySelectorAll('[data-en][data-ko]');
            
            elements.forEach(element => {
                const text = element.getAttribute(`data-${lang}`);
                if (text) {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.placeholder = text;
                    } else {
                        element.textContent = text;
                    }
                }
            });

            // Update page title
            document.title = lang === 'ko' ? '제태호 - 포트폴리오' : 'Taeho Je - Portfolio';
            
            // Update document language
            document.documentElement.lang = lang;
            
            // Trigger content update if data manager exists
            if (window.dataManager && typeof window.dataManager.updateLanguage === 'function') {
                window.dataManager.updateLanguage(lang);
            }
        }

        getCurrentLanguage() {
            return this.currentLang;
        }

        // Helper method for dynamic content
        t(textObj) {
            if (typeof textObj === 'object' && textObj !== null) {
                return textObj[this.currentLang] || textObj['en'] || '';
            }
            return textObj || '';
        }
    }

    // Create and initialize i18n instance
    const i18n = new I18n();
    window.i18n = i18n;
    
    // Initialize immediately
    i18n.init();
    
    // Also initialize on window load as backup
    window.addEventListener('load', () => {
        if (!i18n.initialized) {
            i18n.initialize();
        }
    });

    // Export for modules
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = I18n;
    }
})();