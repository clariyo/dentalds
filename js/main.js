/* ============================================================
   Dental Design Studio — Main JS
   ============================================================ */

(function() {
  'use strict';

  /* ── Navbar scroll effect ────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Mobile navigation ───────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // close on link click
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Scroll-reveal (fade-up) ─────────────────────────── */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => revealObs.observe(el));
  }

  /* ── Counter animation ───────────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting || e.target.dataset.done) return;
        e.target.dataset.done = '1';
        const target   = parseFloat(e.target.dataset.count);
        const suffix   = e.target.dataset.suffix || '';
        const prefix   = e.target.dataset.prefix || '';
        const duration = 1800;
        const start    = performance.now();
        const isFloat  = target % 1 !== 0;
        const update   = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const v = target * (1 - Math.pow(1 - p, 3));
          e.target.textContent = prefix + (isFloat ? v.toFixed(1) : Math.floor(v)) + suffix;
          if (p < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
      });
    }, { threshold: 0.6 });
    counters.forEach(c => counterObs.observe(c));
  }

  /* ── Reviews carousel ────────────────────────────────── */
  const track    = document.getElementById('reviewsTrack');
  const prevBtn  = document.getElementById('carouselPrev');
  const nextBtn  = document.getElementById('carouselNext');
  if (track) {
    const cards    = Array.from(track.querySelectorAll('.review-card'));
    const dotsCont = document.getElementById('carouselDots');
    let idx = 0;
    let autoTimer;

    const getVisible = () => window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;

    // Build dots
    function buildDots() {
      if (!dotsCont) return;
      const vis   = getVisible();
      const total = Math.max(1, cards.length - vis + 1);
      dotsCont.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const d = document.createElement('button');
        d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Review ' + (i + 1));
        d.addEventListener('click', () => goTo(i));
        dotsCont.appendChild(d);
      }
    }

    function updateDots() {
      if (!dotsCont) return;
      dotsCont.querySelectorAll('.carousel-dot').forEach((d, i) =>
        d.classList.toggle('active', i === idx));
    }

    function goTo(n) {
      const vis = getVisible();
      const max = Math.max(0, cards.length - vis);
      idx = Math.max(0, Math.min(n, max));
      const w   = cards[0] ? cards[0].offsetWidth + 22 : 0;
      track.style.transform = `translateX(-${idx * w}px)`;
      updateDots();
    }

    function next() { const vis = getVisible(); goTo(idx >= cards.length - vis ? 0 : idx + 1); }
    function prev() { const vis = getVisible(); goTo(idx <= 0 ? cards.length - vis : idx - 1); }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    // Touch swipe
    let touchX = 0;
    track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    }, { passive: true });

    function startAuto() {
      autoTimer = setInterval(next, 5000);
    }
    function stopAuto() { clearInterval(autoTimer); }

    const wrap = track.parentElement;
    if (wrap) {
      wrap.addEventListener('mouseenter', stopAuto);
      wrap.addEventListener('mouseleave', startAuto);
    }

    window.addEventListener('resize', () => { buildDots(); goTo(0); });
    buildDots();
    startAuto();
  }

  /* ── Active nav link ─────────────────────────────────── */
  const page = (window.location.pathname.split('/').pop() || 'index.html').replace(/\?.*$/, '');
  document.querySelectorAll('.nav-link, .footer-link').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html') ||
        (href !== 'index.html' && page !== '' && href.startsWith(page.split('.')[0]))) {
      a.classList.add('active');
    }
  });

  /* ── Contact form ────────────────────────────────────── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn     = form.querySelector('[type=submit]');
      const origTxt = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      // Replace this timeout with your real form endpoint (e.g. Formspree, Netlify Forms)
      setTimeout(() => {
        btn.textContent = '✓ Message Sent — We\'ll be in touch!';
        btn.style.background = '#22c55e';
        form.reset();
        setTimeout(() => {
          btn.textContent  = origTxt;
          btn.style.background = '';
          btn.disabled = false;
        }, 5000);
      }, 1400);
    });
  }

  /* ── Smooth anchor scrolling ─────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();
