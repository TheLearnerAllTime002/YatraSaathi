// Counter Animation
function animateCounters(parentElement) {
    const counters = parentElement.querySelectorAll('.counter:not(.animated)');
    counters.forEach(counter => {
        counter.classList.add('animated');
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

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            setTimeout(() => animateCounters(entry.target), 500);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const aboutSection = document.querySelector('.about');
    if (aboutSection) observer.observe(aboutSection);
});
