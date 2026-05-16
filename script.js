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

// Hero slideshow - rotate every 5 seconds
(function() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length < 2) return;
    let current = 0;
    setInterval(function() {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 5000);
})();

// ===== Lightbox =====
(function() {
    const lightbox = document.getElementById('lightbox');
    const stage = document.getElementById('lightboxStage');
    const thumbsEl = document.getElementById('lightboxThumbs');
    const btnClose = document.getElementById('lightboxClose');
    const btnPrev = document.getElementById('lightboxPrev');
    const btnNext = document.getElementById('lightboxNext');
    if (!lightbox) return;

    let items = [];   // [{type:'image'|'video', src, alt}]
    let index = 0;
    let autoTimer = null;
    const AUTO_MS = 4500;

    function collectItems(card) {
        const result = [];
        // Images from thumbs
        card.querySelectorAll('.gallery-thumbs img.thumb').forEach(img => {
            result.push({ type: 'image', src: img.src, alt: img.alt });
        });
        // Video (if exists)
        const videoEl = card.querySelector('.video-overlay video source, .video-overlay video');
        if (videoEl) {
            const src = videoEl.tagName === 'SOURCE' ? videoEl.src : videoEl.currentSrc || videoEl.src;
            if (src) result.push({ type: 'video', src: src, alt: 'Video' });
        }
        return result;
    }

    function render() {
        const item = items[index];
        stage.innerHTML = '';
        if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt || '';
            stage.appendChild(img);
        } else {
            const video = document.createElement('video');
            video.src = item.src;
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            stage.appendChild(video);
        }
        // Update thumb active state
        thumbsEl.querySelectorAll('.lightbox-thumb').forEach((t, i) => {
            t.classList.toggle('active', i === index);
            if (i === index) t.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
        });
    }

    function buildThumbs() {
        thumbsEl.innerHTML = '';
        items.forEach((it, i) => {
            const btn = document.createElement('button');
            btn.className = 'lightbox-thumb';
            if (it.type === 'image') {
                const img = document.createElement('img');
                img.src = it.src;
                img.alt = it.alt || '';
                btn.appendChild(img);
            } else {
                btn.classList.add('lightbox-thumb-video');
                btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            }
            btn.addEventListener('click', () => {
                goTo(i);
                restartAuto();
            });
            thumbsEl.appendChild(btn);
        });
    }

    function goTo(i) {
        index = (i + items.length) % items.length;
        render();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function startAuto() {
        stopAuto();
        autoTimer = setInterval(() => {
            // Skip auto-advance while video is playing
            const v = stage.querySelector('video');
            if (v && !v.paused && !v.ended) return;
            next();
        }, AUTO_MS);
    }

    function stopAuto() {
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
        }
    }

    function restartAuto() {
        stopAuto();
        startAuto();
    }

    function open(card, startIndex) {
        items = collectItems(card);
        if (!items.length) return;
        index = Math.max(0, Math.min(startIndex || 0, items.length - 1));
        buildThumbs();
        render();
        lightbox.style.display = 'flex';
        document.body.classList.add('lightbox-open');
        startAuto();
    }

    function close() {
        lightbox.style.display = 'none';
        document.body.classList.remove('lightbox-open');
        stopAuto();
        const v = stage.querySelector('video');
        if (v) v.pause();
        stage.innerHTML = '';
        thumbsEl.innerHTML = '';
    }

    // Open from main image click
    document.querySelectorAll('.apartment-card').forEach(card => {
        const main = card.querySelector('.gallery-main img');
        if (main) {
            main.addEventListener('click', () => {
                // Find which thumb is active to use as start index
                const thumbs = Array.from(card.querySelectorAll('.gallery-thumbs img.thumb'));
                const activeIdx = thumbs.findIndex(t => t.classList.contains('active'));
                open(card, activeIdx >= 0 ? activeIdx : 0);
            });
        }
        // Click on video thumb opens lightbox at the video instead of inline overlay
        const vidThumb = card.querySelector('.thumb-video');
        if (vidThumb) {
            vidThumb.onclick = (e) => {
                e.preventDefault();
                const all = collectItems(card);
                const videoIdx = all.findIndex(it => it.type === 'video');
                open(card, videoIdx >= 0 ? videoIdx : 0);
            };
        }
    });

    btnClose.addEventListener('click', close);
    btnNext.addEventListener('click', () => { next(); restartAuto(); });
    btnPrev.addEventListener('click', () => { prev(); restartAuto(); });

    // Click on dark background closes
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) close();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'none' || !lightbox.style.display) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowRight') { next(); restartAuto(); }
        else if (e.key === 'ArrowLeft') { prev(); restartAuto(); }
    });

})();
