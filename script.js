// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
    }
});

// Gallery image switching
function switchImage(thumb, cardId) {
    const card = document.getElementById(cardId);
    const mainImg = card.querySelector('.gallery-main img');
    if (thumb.tagName === 'IMG') {
        mainImg.src = thumb.src;
        mainImg.alt = thumb.alt;
    }
    card.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    closeVideo(cardId);
}

// Video overlay
function openVideo(cardId) {
    const overlay = document.getElementById(cardId + '-video');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.querySelector('video').play();
    }
}

function closeVideo(cardId) {
    const overlay = document.getElementById(cardId + '-video');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.querySelector('video').pause();
    }
}

// Smooth reveal animations on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.apartment-card, .location-card, .contact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
