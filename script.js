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

// Language switcher
function setLang(lang) {
    const t = translations[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.lang-btn[onclick="setLang('${lang}')"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Update html lang attribute
    document.documentElement.lang = lang;

    // Save preference
    localStorage.setItem('zagato-lang', lang);
}

// Restore saved language on page load (URL param > localStorage > default)
(function() {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    const lang = (urlLang && translations[urlLang]) ? urlLang : localStorage.getItem('zagato-lang');
    if (lang && translations[lang]) {
        setLang(lang);
    }
})();

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
