// Counter Animation
let counterObserver;
let hasAnimated = false;

function animateCounters(parentElement) {
    const counters = parentElement.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const increment = target > 0 ? target / 50 : 1;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 40);
    });
}

function initCounters() {
    if (counterObserver) {
        counterObserver.disconnect();
    }
    
    counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                setTimeout(() => animateCounters(entry.target), 500);
            }
        });
    }, { threshold: 0.5 });

    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        counterObserver.observe(aboutSection);
    }
}

function resetCounters() {
    hasAnimated = false;
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        counter.textContent = '0';
    });
    initCounters();
}

document.addEventListener('DOMContentLoaded', initCounters);

// Global function to reset counters after translation
window.resetCounters = resetCounters;
