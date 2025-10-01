// Google Translate API Integration
const API_KEY = 'AIzaSyDm6Z6SoVgUiyjxEbSemS_ZtbZGZ3JnOdI';
const TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'mr', label: 'मराठी' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
    { code: 'ur', label: 'اردو' },
    { code: 'or', label: 'ଓଡ଼ିଆ' },
    { code: 'as', label: 'অসমীয়া' }
];

let currentLang = 'en';
let originalTexts = new Map();

class LanguageTranslator {
    constructor() {
        this.init();
    }

    init() {
        this.createLoadingOverlay();
        this.populateLanguageMenu();
        this.setupEventListeners();
        this.storeOriginalTexts();
        this.loadSavedLanguage();
    }

    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'translate_loading';
        overlay.id = 'translateLoading';
        overlay.innerHTML = '<dotlottie-wc src="https://lottie.host/f7e219a4-9a62-41f0-ab1a-5891fc79d2fd/KphAsUfpFi.lottie" class="translate_lottie" autoplay loop></dotlottie-wc>';
        document.body.appendChild(overlay);
    }

    populateLanguageMenu() {
        const menu = document.getElementById('langMenu');
        menu.innerHTML = LANGUAGES.map(lang => 
            `<button class="lang_option" data-lang="${lang.code}">${lang.label}</button>`
        ).join('');
    }

    setupEventListeners() {
        const btn = document.getElementById('langBtn');
        const dropdown = document.getElementById('langDropdown');
        const menu = document.getElementById('langMenu');

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('active');
        });

        menu.addEventListener('click', (e) => {
            if (e.target.classList.contains('lang_option')) {
                this.selectLanguage(e.target.dataset.lang);
                dropdown.classList.remove('active');
            }
        });
    }

    async selectLanguage(langCode) {
        if (langCode === currentLang) return;

        currentLang = langCode;
        this.updateUI(langCode);
        this.showLoading(true);

        try {
            if (langCode === 'en') {
                this.restoreOriginalTexts();
            } else {
                await this.translatePage(langCode);
            }
            localStorage.setItem('selectedLanguage', langCode);
        } catch (error) {
            console.error('Translation failed:', error);
            alert('Translation failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    updateUI(langCode) {
        const currentLangSpan = document.getElementById('currentLang');
        const selectedLang = LANGUAGES.find(l => l.code === langCode);
        currentLangSpan.textContent = langCode.toUpperCase();

        document.querySelectorAll('.lang_option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === langCode);
        });
    }

    storeOriginalTexts() {
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, input[placeholder]');
        elements.forEach(el => {
            if (el.textContent.trim() && !el.closest('.lang_dropdown')) {
                originalTexts.set(el, el.innerHTML);
            }
            if (el.placeholder) {
                originalTexts.set(`${el.id || el.className}_placeholder`, el.placeholder);
            }
        });
    }

    async translatePage(targetLang) {
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button');
        const texts = [];
        const elementsToTranslate = [];

        elements.forEach(el => {
            const original = originalTexts.get(el);
            if (original && !el.closest('.lang_dropdown')) {
                // Extract only text content for translation
                const textOnly = el.textContent.trim();
                texts.push(textOnly);
                elementsToTranslate.push(el);
            }
        });

        if (texts.length > 0) {
            const translations = await this.translateText(texts, targetLang);
            elementsToTranslate.forEach((el, i) => {
                if (translations[i]) {
                    // For span elements, preserve the HTML structure
                    if (el.tagName === 'SPAN' && el.parentElement.classList.contains('title')) {
                        el.textContent = translations[i];
                    } else {
                        el.textContent = translations[i];
                    }
                }
            });
        }

        // Translate placeholders
        const placeholderElements = document.querySelectorAll('input[placeholder]');
        for (const el of placeholderElements) {
            const originalKey = `${el.id || el.className}_placeholder`;
            const original = originalTexts.get(originalKey);
            if (original) {
                const translated = await this.translateText([original], targetLang);
                if (translated[0]) {
                    el.placeholder = translated[0];
                }
            }
        }
    }

    async translateText(texts, targetLang) {
        const response = await fetch(`${TRANSLATE_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                q: texts,
                target: targetLang,
                format: 'text'
            })
        });

        const data = await response.json();
        return data.data.translations.map(t => t.translatedText);
    }

    restoreOriginalTexts() {
        originalTexts.forEach((originalText, element) => {
            if (typeof element === 'string') {
                // Handle placeholders
                if (element.includes('_placeholder')) {
                    const selector = element.replace('_placeholder', '');
                    const el = document.getElementById(selector) || document.querySelector(`.${selector}`);
                    if (el) el.placeholder = originalText;
                }
            } else {
                element.innerHTML = originalText;
            }
        });
    }

    showLoading(show) {
        const loading = document.getElementById('translateLoading');
        loading.style.display = show ? 'flex' : 'none';
    }

    loadSavedLanguage() {
        const saved = localStorage.getItem('selectedLanguage');
        if (saved && LANGUAGES.find(l => l.code === saved)) {
            this.selectLanguage(saved);
        }
    }
}

// Global function for dynamic content
window.translateUI = async function(element) {
    if (currentLang === 'en') return;
    
    const translator = new LanguageTranslator();
    const elements = element.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button');
    const texts = [];
    const elementsToTranslate = [];
    
    elements.forEach(el => {
        if (el.textContent.trim()) {
            texts.push(el.textContent.trim());
            elementsToTranslate.push(el);
        }
    });

    if (texts.length > 0) {
        const translations = await translator.translateText(texts, currentLang);
        elementsToTranslate.forEach((el, i) => {
            if (translations[i]) {
                el.textContent = translations[i];
            }
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new LanguageTranslator();
});