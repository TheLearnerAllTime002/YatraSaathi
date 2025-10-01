// Google Translator API Configuration
const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyDm6Z6SoVgUiyjxEbSemS_ZtbZGZ3JnOdI';
const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

// Language codes and names mapping
const LANGUAGES = {
    'en': 'English',
    'hi': 'हिन्दी',
    'bn': 'বাংলা',
    'ta': 'தமிழ்',
    'te': 'తెలుగు',
    'mr': 'मराठी',
    'gu': 'ગુજરાતી',
    'kn': 'ಕನ್ನಡ',
    'ml': 'മലയാളം',
    'pa': 'ਪੰਜਾਬੀ',
    'or': 'ଓଡ଼ିଆ',
    'ur': 'اردو'
};

// Current translation state
let currentLanguage = 'en';
let originalTexts = new Map();

// Translation dropdown elements
const translationBtn = document.getElementById('translationBtn');
const translationDropdown = document.getElementById('translationDropdown');
const translationMenu = document.getElementById('translationMenu');
const closeTranslation = document.getElementById('closeTranslation');
const translationOptions = document.querySelectorAll('.translation-option');

// Initialize translation system
document.addEventListener('DOMContentLoaded', function() {
    initializeTranslation();
});

// Initialize translation functionality
function initializeTranslation() {
    // Store original texts
    storeOriginalTexts();

    // Setup event listeners
    setupTranslationEventListeners();

    // Load saved language preference
    loadSavedLanguagePreference();
}

// Store original texts for restoration
function storeOriginalTexts() {
    const translatableElements = document.querySelectorAll(`
        h1, h2, h3, h4, h5, h6,
        p, span, a, button, li,
        .home_title, .home_desc, .home_card-title,
        .about_title, .about_desc, .about_stat span,
        .destinations_title, .destinations_desc,
        .services_title, .services_desc,
        .subscribe_title, .subscribe_desc,
        .footer_title, .footer_desc, .footer_heading,
        .search_input::placeholder
    `);

    translatableElements.forEach(element => {
        const text = element.textContent.trim();
        if (text && !originalTexts.has(element)) {
            originalTexts.set(element, text);
        }
    });
}

// Setup translation event listeners
function setupTranslationEventListeners() {
    // Toggle dropdown
    translationBtn?.addEventListener('click', toggleTranslationDropdown);

    // Close dropdown
    closeTranslation?.addEventListener('click', closeTranslationDropdown);

    // Language selection
    translationOptions.forEach(option => {
        option.addEventListener('click', function() {
            const targetLang = this.dataset.lang;
            selectLanguage(targetLang);
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!translationDropdown?.contains(e.target)) {
            closeTranslationDropdown();
        }
    });
}

// Toggle translation dropdown
function toggleTranslationDropdown() {
    translationDropdown?.classList.toggle('active');
}

// Close translation dropdown
function closeTranslationDropdown() {
    translationDropdown?.classList.remove('active');
}

// Select language and start translation
async function selectLanguage(targetLang) {
    if (targetLang === currentLanguage) return;

    // Update current language
    currentLanguage = targetLang;

    // Update button text
    updateTranslationButton(targetLang);

    // Close dropdown
    closeTranslationDropdown();

    // Show loading state
    setTranslationLoadingState(true);

    try {
        // Translate all content
        await translateAllContent(targetLang);

        // Save language preference
        saveLanguagePreference(targetLang);

        // Show success feedback
        showTranslationFeedback('Language changed successfully!');

    } catch (error) {
        console.error('Translation error:', error);
        showTranslationFeedback('Translation failed. Please try again.', 'error');
        revertToOriginalLanguage();
    } finally {
        setTranslationLoadingState(false);
    }
}

// Update translation button text
function updateTranslationButton(langCode) {
    const languageName = LANGUAGES[langCode] || 'English';
    const btnText = translationBtn?.querySelector('span');
    if (btnText) {
        btnText.textContent = languageName;
    }
}

// Set loading state for translation
function setTranslationLoadingState(loading) {
    translationOptions.forEach(option => {
        if (loading) {
            option.classList.add('translating');
            option.disabled = true;
        } else {
            option.classList.remove('translating');
            option.disabled = false;
        }
    });
}

// Translate all content
async function translateAllContent(targetLang) {
    if (targetLang === 'en') {
        // Restore original texts
        restoreOriginalTexts();
        return;
    }

    // Get all translatable elements
    const elementsToTranslate = getTranslatableElements();

    // Translate in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < elementsToTranslate.length; i += batchSize) {
        const batch = elementsToTranslate.slice(i, i + batchSize);
        await translateBatch(batch, targetLang);
    }
}

// Get all translatable elements
function getTranslatableElements() {
    return document.querySelectorAll(`
        h1, h2, h3, h4, h5, h6,
        p, span, a, button, li,
        .home_title, .home_desc, .home_card-title,
        .about_title, .about_desc, .about_stat span,
        .destinations_title, .destinations_desc,
        .services_title, .services_desc,
        .subscribe_title, .subscribe_desc,
        .footer_title, .footer_desc, .footer_heading
    `);
}

// Translate a batch of elements
async function translateBatch(elements, targetLang) {
    const textsToTranslate = [];

    elements.forEach(element => {
        const originalText = originalTexts.get(element);
        if (originalText) {
            textsToTranslate.push({
                element: element,
                text: originalText
            });
        }
    });

    if (textsToTranslate.length === 0) return;

    try {
        // Translate all texts in the batch
        const translations = await Promise.all(
            textsToTranslate.map(async ({ text }) => {
                return await translateText(text, targetLang);
            })
        );

        // Update elements with translated text
        textsToTranslate.forEach(({ element }, index) => {
            if (translations[index]) {
                element.textContent = translations[index];
            }
        });

    } catch (error) {
        console.error('Batch translation error:', error);
        throw error;
    }
}

// Google Translate API function
async function translateText(text, targetLang) {
    try {
        const response = await fetch(`${TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                target: targetLang,
                format: 'text'
            })
        });

        if (!response.ok) {
            throw new Error(`Translation API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.data && data.data.translations && data.data.translations[0]) {
            return data.data.translations[0].translatedText;
        } else {
            throw new Error('Invalid translation response');
        }

    } catch (error) {
        console.error('Translation request failed:', error);
        return text; // Return original text if translation fails
    }
}

// Restore original texts
function restoreOriginalTexts() {
    originalTexts.forEach((originalText, element) => {
        element.textContent = originalText;
    });
}

// Save language preference to localStorage
function saveLanguagePreference(language) {
    try {
        localStorage.setItem('yatraSathiLanguage', language);
    } catch (error) {
        console.warn('Could not save language preference:', error);
    }
}

// Load saved language preference
function loadSavedLanguagePreference() {
    try {
        const savedLanguage = localStorage.getItem('yatraSathiLanguage');
        if (savedLanguage && LANGUAGES[savedLanguage]) {
            selectLanguage(savedLanguage);
        }
    } catch (error) {
        console.warn('Could not load language preference:', error);
    }
}

// Revert to original language on error
function revertToOriginalLanguage() {
    currentLanguage = 'en';
    updateTranslationButton('en');
    restoreOriginalTexts();
}

// Show translation feedback
function showTranslationFeedback(message, type = 'success') {
    // Remove existing feedback
    const existingFeedback = document.querySelector('.translation-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = `translation-feedback ${type}`;
    feedback.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    // Style the feedback
    Object.assign(feedback.style, {
        position: 'fixed',
        top: '120px',
        right: '20px',
        background: type === 'success'
            ? 'linear-gradient(135deg, #FF6B35, #F7931E)'
            : 'linear-gradient(135deg, #ff4757, #ff3742)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        fontWeight: '600',
        fontSize: '0.9rem',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
        transform: 'translateX(400px)',
        transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    });

    document.body.appendChild(feedback);

    // Animate in
    setTimeout(() => {
        feedback.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
        feedback.style.transform = 'translateX(400px)';
        setTimeout(() => feedback.remove(), 400);
    }, 3000);
}

// Handle API errors gracefully
window.addEventListener('error', function(e) {
    if (e.message.includes('Translation') || e.message.includes('API')) {
        showTranslationFeedback('Translation service temporarily unavailable', 'error');
    }
});

// Export functions for potential external use
window.TranslationSystem = {
    translateText,
    selectLanguage,
    restoreOriginalTexts,
    getCurrentLanguage: () => currentLanguage,
    getSupportedLanguages: () => LANGUAGES
};