document.addEventListener("DOMContentLoaded", () => {

    // ================================================================
    // CUSTOM CURSOR
    // ================================================================
    const dot  = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    if (dot && ring) {
        let mx = -200, my = -200, rx = -200, ry = -200;

        document.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
            dot.style.left = mx + 'px';
            dot.style.top  = my + 'px';
        });

        (function lerpRing() {
            rx += (mx - rx) * 0.11;
            ry += (my - ry) * 0.11;
            ring.style.left = rx + 'px';
            ring.style.top  = ry + 'px';
            requestAnimationFrame(lerpRing);
        })();

        document.querySelectorAll('a, button, .brand-logo-img, .sw-icon').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
        });
        document.addEventListener('mousedown', () => document.body.classList.add('cur-click'));
        document.addEventListener('mouseup',   () => document.body.classList.remove('cur-click'));
    }

    // ================================================================
    // HERO TITLE — letter swap caótico (B/R/X/N/V)
    // ================================================================
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const letters = heroTitle.querySelectorAll('.hl');
        const POOL = ['B','R','X','N','V'];
        const originals = Array.from(letters).map(l => l.textContent);
        let timers = [];
        let isHovering = false;

        function clearTimers() {
            timers.forEach(t => clearTimeout(t));
            timers = [];
        }

        function startSwap() {
            if (isHovering) return;
            isHovering = true;
            clearTimers();
            letters.forEach((letter, i) => {
                const orig = originals[i];
                const duration = 400 + i * 30;
                const interval = 50;
                const start = performance.now();

                const tick = () => {
                    const elapsed = performance.now() - start;
                    if (elapsed >= duration) {
                        letter.textContent = orig;
                        return;
                    }
                    let next;
                    do { next = POOL[Math.floor(Math.random() * POOL.length)]; }
                    while (next === letter.textContent && POOL.length > 1);
                    letter.textContent = next;
                    timers.push(setTimeout(tick, interval));
                };
                timers.push(setTimeout(tick, i * 40));
            });
        }

        function resetLetters() {
            isHovering = false;
            clearTimers();
            letters.forEach((l, i) => l.textContent = originals[i]);
        }

        heroTitle.addEventListener('mouseenter', startSwap);
        heroTitle.addEventListener('mouseleave', resetLetters);

        heroTitle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startSwap();
            setTimeout(resetLetters, 700);
        }, { passive: false });
    }

    // ================================================================
    // SOFTWARE ICONS — per-brand colour + glow on hover / touch
    // ================================================================
    let activeTouchIcon = null;

    document.querySelectorAll('.sw-icon').forEach(icon => {
        const color = icon.dataset.color || '#fff';
        const label = icon.querySelector('.sw-label');
        const glow  = icon.querySelector('.sw-glow');

        if (glow) glow.style.boxShadow = `0 0 40px ${color}55, 0 0 80px ${color}22`;

        function activateIcon() {
            icon.style.background  = `color-mix(in srgb, ${color} 9%, #0d0d0d)`;
            icon.style.borderColor = `${color}55`;
            icon.style.boxShadow   = `0 20px 50px ${color}30, 0 0 0 1px ${color}25`;
            if (label) label.style.color = color;
            if (glow)  glow.style.opacity = '1';
            icon.classList.add('sw-active');
        }

        function deactivateIcon() {
            icon.style.background  = '';
            icon.style.borderColor = '';
            icon.style.boxShadow   = '';
            if (label) label.style.color = '';
            if (glow)  glow.style.opacity = '0';
            icon.classList.remove('sw-active');
        }

        icon.addEventListener('mouseenter', activateIcon);
        icon.addEventListener('mouseleave', deactivateIcon);

        icon.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (activeTouchIcon === icon) {
                deactivateIcon();
                activeTouchIcon = null;
            } else {
                if (activeTouchIcon) {
                    const prev = activeTouchIcon;
                    const prevLabel = prev.querySelector('.sw-label');
                    const prevGlow  = prev.querySelector('.sw-glow');
                    prev.style.background = prev.style.borderColor = prev.style.boxShadow = '';
                    if (prevLabel) prevLabel.style.color = '';
                    if (prevGlow)  prevGlow.style.opacity = '0';
                    prev.classList.remove('sw-active');
                }
                activateIcon();
                activeTouchIcon = icon;
            }
        }, { passive: false });

        icon.addEventListener('pointerdown', () => { icon.style.transform = 'translateY(-8px) scale(0.91)'; });
        icon.addEventListener('pointerup',   () => { icon.style.transform = ''; });
    });

    document.addEventListener('touchstart', (e) => {
        if (activeTouchIcon && !activeTouchIcon.contains(e.target)) {
            const prev = activeTouchIcon;
            const prevLabel = prev.querySelector('.sw-label');
            const prevGlow  = prev.querySelector('.sw-glow');
            prev.style.background = prev.style.borderColor = prev.style.boxShadow = '';
            if (prevLabel) prevLabel.style.color = '';
            if (prevGlow)  prevGlow.style.opacity = '0';
            prev.classList.remove('sw-active');
            activeTouchIcon = null;
        }
    }, { passive: true });

    // ================================================================
    // EXPERIENCE BARS — set CSS custom property for animated width
    // ================================================================
    document.querySelectorAll('.exp-item').forEach(item => {
        const pct = item.dataset.pct || '0';
        item.style.setProperty('--pct', pct + '%');
    });

    // ================================================================
    // SCROLL REVEAL — Intersection Observer
    // ================================================================
    const isMobile = window.innerWidth <= 600;

    const revealObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('in-view'); revealObs.unobserve(e.target); }
        });
    }, { threshold: isMobile ? 0.05 : 0.15 });

    document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up').forEach(el => revealObs.observe(el));

    const itemObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('in-view'); itemObs.unobserve(e.target); }
        });
    }, { threshold: isMobile ? 0.02 : 0.1 });

    document.querySelectorAll('.exp-item, .spec-item').forEach(el => itemObs.observe(el));

    const footerObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            e.target.classList.toggle('in-view', e.isIntersecting);
        });
    }, { threshold: isMobile ? 0.1 : 0.2 });

    document.querySelectorAll('.footer-title, .footer-sub').forEach(el => footerObs.observe(el));

});
