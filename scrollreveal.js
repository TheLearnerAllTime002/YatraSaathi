// Scroll Reveal Animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Home section animations
    const homeContent = document.querySelector('.home_content');
    const homeCards = document.querySelectorAll('.home_card');
    
    if (homeContent) {
        homeContent.classList.add('reveal-left');
        observer.observe(homeContent);
    }
    
    homeCards.forEach((card, index) => {
        card.classList.add('reveal-right');
        card.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(card);
    });

    // About section animations
    const aboutCards = document.querySelectorAll('.about_card');
    const aboutContent = document.querySelector('.about_content');
    
    aboutCards.forEach((card, index) => {
        card.classList.add('reveal-scale');
        card.style.transitionDelay = `${index * 0.3}s`;
        observer.observe(card);
    });
    
    if (aboutContent) {
        aboutContent.classList.add('reveal-right');
        observer.observe(aboutContent);
    }

    // Destinations section animations
    const destinationsContent = document.querySelector('.destinations_content');
    const destinationsSwiper = document.querySelector('.destinations_swiper');
    
    if (destinationsContent) {
        destinationsContent.classList.add('reveal-left');
        observer.observe(destinationsContent);
    }
    
    if (destinationsSwiper) {
        destinationsSwiper.classList.add('reveal-right');
        observer.observe(destinationsSwiper);
    }

    // Services section animations
    const servicesContent = document.querySelector('.services_content');
    const servicesCards = document.querySelectorAll('.services_card');
    const servicesManImg = document.querySelector('.services_man-img');
    
    if (servicesContent) {
        servicesContent.classList.add('reveal');
        observer.observe(servicesContent);
    }
    
    if (servicesManImg) {
        servicesManImg.classList.add('reveal-left');
        observer.observe(servicesManImg);
    }
    
    servicesCards.forEach((card, index) => {
        card.classList.add('reveal-right');
        card.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(card);
    });

    // Subscribe section animations
    const subscribeContainer = document.querySelector('.subscribe_container');
    
    if (subscribeContainer) {
        subscribeContainer.classList.add('reveal-scale');
        observer.observe(subscribeContainer);
    }

    // Footer section animations
    const footerSections = document.querySelectorAll('.footer_section');
    
    footerSections.forEach((section, index) => {
        section.classList.add('reveal');
        section.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(section);
    });
});