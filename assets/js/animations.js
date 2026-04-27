/**
 * FARMACIA FERNÁNDEZ DÍEZ — GSAP Animations
 * © Unax Aller
 */

gsap.registerPlugin(ScrollTrigger);

/* ── JS-ready flag ────────────────────────────────────────
   Set inline in <head> too, but keep it here as safety. */
document.documentElement.classList.add('js-ready');

/* ── Reduced Motion ───────────────────────────────────── */
const mm = gsap.matchMedia();

/* ── Custom Cursor ────────────────────────────────────── */
function initCursor() {
  // Skip on touch devices and when user prefers reduced motion
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cursor = document.querySelector('.cursor');
  const ring   = document.querySelector('.cursor-ring');
  if (!cursor || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.08, ease: 'none', overwrite: 'auto' });
  });

  gsap.ticker.add(() => {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    gsap.set(ring, { x: ringX, y: ringY });
  });

  // Event delegation — single listener instead of N listeners
  const isHoverable = el => el && (el.matches?.('a, button, [data-hover]') || el.closest?.('a, button, [data-hover]'));
  document.addEventListener('mouseover', e => {
    if (isHoverable(e.target)) {
      cursor.classList.add('hover');
      ring.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (isHoverable(e.target) && !isHoverable(e.relatedTarget)) {
      cursor.classList.remove('hover');
      ring.classList.remove('hover');
    }
  });
}

/* ── Page Loader ──────────────────────────────────────── */
function dismissLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  document.body.classList.remove('js-loader-active');
  gsap.set(loader, { autoAlpha: 0 });
}

function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  // Activate loader now that JS/GSAP is confirmed working
  document.body.classList.add('js-loader-active');

  // Safety net: always dismiss after 800ms regardless of GSAP state
  const safetyTimeout = setTimeout(dismissLoader, 800);

  const tl = gsap.timeline({
    onComplete: () => {
      clearTimeout(safetyTimeout);
      dismissLoader();
    }
  });

  // fromTo — explicit start/end, no dependency on CSS transform state
  tl.fromTo('.loader-logo',
    { autoAlpha: 0, y: 20 },
    { autoAlpha: 1, y: 0, duration: .65, ease: 'power3.out' }
  )
  .to('.loader-logo', {
    autoAlpha: 0, y: -15,
    duration: .45, ease: 'power3.in', delay: .55
  })
  .to(loader, {
    autoAlpha: 0, duration: .45, ease: 'power2.inOut'
  }, '-=.1');
}

/* ── Navigation ───────────────────────────────────────── */
function initNav() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  ScrollTrigger.create({
    start: 'top -60px',
    onEnter: () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled')
  });

  // Hamburger
  const toggle  = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.nav-mobile');
  if (!toggle || !mobileMenu) return;

  const mobileLinks = mobileMenu.querySelectorAll('.nav-mobile-link');
  let isOpen = false;

  const setMenuState = (open) => {
    isOpen = open;
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
  };

  const closeMenu = () => {
    setMenuState(false);
    gsap.to(mobileLinks, { autoAlpha: 0, y: 20, stagger: .04, duration: .3 });
    gsap.to(mobileMenu, {
      autoAlpha: 0,
      duration: .35,
      ease: 'power2.in',
      delay: .1,
      onComplete: () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  };

  toggle.addEventListener('click', () => {
    if (!isOpen) {
      setMenuState(true);
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';

      gsap.to(mobileMenu, { autoAlpha: 1, duration: .35, ease: 'power2.out' });
      gsap.to(mobileLinks, {
        autoAlpha: 1, y: 0,
        stagger: .07,
        duration: .5,
        ease: 'power3.out',
        delay: .1
      });
    } else {
      closeMenu();
    }
  });

  // Close on Escape for keyboard users
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });
}

/* ── Hero Entrance ────────────────────────────────────── */
function initHeroAnims() {
  const heroTargets = ['.hero-eyebrow', '.hero h1', '.hero-desc', '.hero-actions', '.hero-scroll'];

  // Safety net: guarantee visibility no matter what matchMedia decides.
  // Desktop entrance animation re-hides then reveals via fromTo below.
  gsap.set(heroTargets, { autoAlpha: 1, y: 0 });

  mm.add({
    isDesktop: '(min-width: 769px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  }, ctx => {
    const { isDesktop, reduceMotion } = ctx.conditions;
    if (!isDesktop || reduceMotion) return;

    // parallax on hero image
    const heroBg = document.querySelector('.hero-bg img');
    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.4
        }
      });
    }

    const tl = gsap.timeline({ delay: 0.1 });
    tl.fromTo('.hero-eyebrow', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out' })
      .fromTo('.hero h1',      { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out' }, '-=.4')
      .fromTo('.hero-desc',    { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out' }, '-=.5')
      .fromTo('.hero-actions', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out' }, '-=.4')
      .fromTo('.hero-scroll',  { autoAlpha: 0 },        { autoAlpha: 1, duration: .5 }, '-=.2');
  });
}

/* ── Mouse parallax on hero ───────────────────────────── */
function initMouseParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const hero = document.querySelector('.hero');
  if (!hero) return;

  hero.addEventListener('mousemove', e => {
    const { clientX, clientY } = e;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (clientX - cx) / cx;
    const dy = (clientY - cy) / cy;

    gsap.to('.hero-bg img', {
      x: dx * 12,
      y: dy * 8,
      duration: 1.2,
      ease: 'power2.out'
    });

    gsap.to('.hero-content', {
      x: dx * -6,
      y: dy * -4,
      duration: 1.4,
      ease: 'power2.out'
    });
  });
}

/* ── Scroll Reveals ───────────────────────────────────── */
function initScrollReveals() {
  mm.add('(prefers-reduced-motion: no-preference)', () => {

    // Generic .reveal elements
    ScrollTrigger.batch('.reveal', {
      start: 'top 88%',
      onEnter: batch => gsap.to(batch, {
        autoAlpha: 1, y: 0,
        stagger: .1,
        duration: .75,
        ease: 'power3.out'
      }),
      once: true
    });

    ScrollTrigger.batch('.reveal-left', {
      start: 'top 88%',
      onEnter: batch => gsap.to(batch, {
        autoAlpha: 1, x: 0,
        stagger: .1,
        duration: .8,
        ease: 'power3.out'
      }),
      once: true
    });

    ScrollTrigger.batch('.reveal-right', {
      start: 'top 88%',
      onEnter: batch => gsap.to(batch, {
        autoAlpha: 1, x: 0,
        stagger: .1,
        duration: .8,
        ease: 'power3.out'
      }),
      once: true
    });

    ScrollTrigger.batch('.reveal-scale', {
      start: 'top 90%',
      onEnter: batch => gsap.to(batch, {
        autoAlpha: 1, scale: 1,
        stagger: .08,
        duration: .6,
        ease: 'back.out(1.3)'
      }),
      once: true
    });

    // Service cards stagger
    ScrollTrigger.batch('.service-card, .service-detail-card', {
      start: 'top 85%',
      onEnter: batch => gsap.to(batch, {
        autoAlpha: 1, y: 0,
        stagger: .08,
        duration: .65,
        ease: 'power3.out'
      }),
      once: true
    });

    // Stat numbers count-up
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = parseInt(el.dataset.count || el.textContent, 10);
      const suffix = el.dataset.suffix || '';
      let lastUpdate = 0;

      gsap.fromTo({ val: 0 }, { val: target }, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: function() {
          const now = performance.now();
          if (now - lastUpdate < 16) return;
          lastUpdate = now;
          el.textContent = Math.round(this.targets()[0].val) + suffix;
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          once: true
        }
      });
    });

  });

  // Always visible fallback
  mm.add('(prefers-reduced-motion: reduce)', () => {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .service-card, .service-detail-card')
      .forEach(el => gsap.set(el, { autoAlpha: 1, x: 0, y: 0, scale: 1 }));
  });
}

/* ── Carousel (transform-based, GSAP-driven) ─────────── */
function initCarousel() {
  const wrap    = document.querySelector('.carousel-wrap');
  const track   = document.querySelector('.carousel-track');
  if (!track || !wrap) return;

  const slides  = Array.from(track.querySelectorAll('.carousel-slide'));
  const dots    = Array.from(document.querySelectorAll('.carousel-dot'));
  const btnPrev = document.querySelector('.carousel-btn.prev');
  const btnNext = document.querySelector('.carousel-btn.next');
  const counter = document.querySelector('.carousel-count');
  if (!slides.length) return;

  let current = 0;

  // ── Geometry helpers ─────────────────────────────────
  const getGap      = () => parseFloat(getComputedStyle(track).gap) || 24;
  const getSlideW   = () => slides[0].offsetWidth + getGap();
  const getTrackW   = () => slides.reduce((w, s) => w + s.offsetWidth, 0) + getGap() * (slides.length - 1);
  const getMaxOff   = () => Math.min(0, wrap.clientWidth - getTrackW());
  const offsetFor   = (i) => Math.max(getMaxOff(), -i * getSlideW());

  // ── UI state ─────────────────────────────────────────
  const updateUI = () => {
    if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });
    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) btnNext.disabled = current >= slides.length - 1;
  };

  // ── Navigate ─────────────────────────────────────────
  const goTo = (index) => {
    current = Math.max(0, Math.min(slides.length - 1, index));
    gsap.to(track, {
      x: offsetFor(current),
      duration: 0.62,
      ease: 'power3.inOut'
    });
    updateUI();
  };

  // Init
  gsap.set(track, { x: 0 });
  updateUI();

  // Buttons
  btnPrev?.addEventListener('click', () => goTo(current - 1));
  btnNext?.addEventListener('click', () => goTo(current + 1));

  // Dots
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // Keyboard (when track is focused)
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });

  // ── Mouse drag ───────────────────────────────────────
  let isDrag = false, dragStartX = 0, dragStartT = 0;

  track.addEventListener('mousedown', e => {
    isDrag = true;
    dragStartX = e.clientX;
    dragStartT = Date.now();
    track.classList.add('dragging');
    gsap.killTweensOf(track);
  });

  window.addEventListener('mouseup', e => {
    if (!isDrag) return;
    isDrag = false;
    track.classList.remove('dragging');
    const dx = dragStartX - e.clientX;
    const dt = Date.now() - dragStartT;
    if (Math.abs(dx) > 48 || (Math.abs(dx) > 18 && dt < 220)) {
      goTo(current + (dx > 0 ? 1 : -1));
    } else {
      goTo(current); // snap back
    }
  });

  window.addEventListener('mousemove', e => {
    if (!isDrag) return;
    const dx   = e.clientX - dragStartX;
    const base = offsetFor(current);
    const clamped = Math.max(getMaxOff(), Math.min(0, base + dx));
    gsap.set(track, { x: clamped });
  }, { passive: true });

  // ── Touch ────────────────────────────────────────────
  let touchStartX = 0, touchStartT = 0;

  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartT = Date.now();
    gsap.killTweensOf(track);
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    const dx   = e.touches[0].clientX - touchStartX;
    const base = offsetFor(current);
    const clamped = Math.max(getMaxOff(), Math.min(0, base + dx));
    gsap.set(track, { x: clamped });
    track.classList.add('dragging');
  }, { passive: true });

  track.addEventListener('touchend', e => {
    track.classList.remove('dragging');
    const dx = touchStartX - e.changedTouches[0].clientX;
    const dt = Date.now() - touchStartT;
    if (Math.abs(dx) > 48 || (Math.abs(dx) > 18 && dt < 300)) {
      goTo(current + (dx > 0 ? 1 : -1));
    } else {
      goTo(current);
    }
  }, { passive: true });

  // Recalculate on resize
  ScrollTrigger.addEventListener('refresh', () => goTo(current));
}

/* ── Section Line Decorations ─────────────────────────── */
function initSectionDecos() {
  document.querySelectorAll('.gold-divider').forEach(el => {
    gsap.fromTo(el, { scaleX: 0 }, {
      scaleX: 1,
      duration: .8,
      ease: 'power3.out',
      transformOrigin: 'left center',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true
      }
    });
  });
}

/* ── Form microinteractions ──────────────────────────── */
function initFormMicro() {
  // Focus lift animation
  document.querySelectorAll('.form-group input, .form-group textarea, .form-group select')
    .forEach(el => {
      el.addEventListener('focus', () => {
        gsap.to(el.closest('.form-group'), { y: -2, duration: .2, ease: 'power2.out' });
      });
      el.addEventListener('blur', () => {
        gsap.to(el.closest('.form-group'), { y: 0, duration: .2, ease: 'power2.out' });
        validateField(el);
      });
    });

  const lang = document.documentElement.lang || 'es';
  const msgs = {
    es: { required: 'Este campo es obligatorio', email: 'Introduce un email válido', tel: 'Introduce un teléfono válido', sent: '¡Mensaje preparado! Se abrirá tu cliente de correo.' },
    en: { required: 'This field is required', email: 'Enter a valid email address', tel: 'Enter a valid phone number', sent: 'Message ready! Your email client will open.' },
    eu: { required: 'Eremu hau nahitaezkoa da', email: 'Sartu baliozko helbide elektroniko bat', tel: 'Sartu baliozko telefono zenbaki bat', sent: 'Mezua prest! Zure posta bezero ireki da.' },
    fr: { required: 'Ce champ est obligatoire', email: 'Entrez une adresse e-mail valide', tel: 'Entrez un numéro de téléphone valide', sent: 'Message prêt ! Votre client de messagerie va s\'ouvrir.' }
  };
  const M = msgs[lang] || msgs.es;

  function showError(group, el, msg) {
    let errEl = group.querySelector('.form-error');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'form-error';
      errEl.setAttribute('role', 'alert');
      errEl.setAttribute('aria-live', 'polite');
      group.appendChild(errEl);
    }
    errEl.textContent = msg;
    errEl.classList.add('visible');
    group.classList.add('has-error');
    el.setAttribute('aria-invalid', 'true');
  }

  function clearError(group, el) {
    const errEl = group.querySelector('.form-error');
    if (errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); }
    group.classList.remove('has-error');
    el.removeAttribute('aria-invalid');
  }

  function validateField(el) {
    const group = el.closest('.form-group');
    if (!group) return true;
    if (el.required && !el.value.trim()) {
      showError(group, el, M.required);
      return false;
    }
    if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
      showError(group, el, M.email);
      return false;
    }
    if (el.type === 'tel' && el.value && !/^[\d\s\+\-\(\)]{7,}$/.test(el.value)) {
      showError(group, el, M.tel);
      return false;
    }
    clearError(group, el);
    return true;
  }

  const form = document.querySelector('form[name="contacto"], form[name="contact"], form[name="kontaktua"]');
  if (!form) return;

  form.removeAttribute('novalidate');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const fields = form.querySelectorAll('input, textarea, select');
    let valid = true;
    fields.forEach(f => { if (!validateField(f)) valid = false; });
    if (!valid) {
      const firstErr = form.querySelector('.has-error input, .has-error textarea, .has-error select');
      firstErr?.focus();
      return;
    }

    const data = new FormData(form);
    const pick = (...keys) => {
      for (const k of keys) {
        const v = data.get(k);
        if (v != null && String(v).trim()) return String(v).trim();
      }
      return '';
    };
    const nombre  = pick('nombre', 'name', 'nom', 'izena');
    const email   = pick('email', 'posta');
    const tel     = pick('telefono', 'phone', 'tel', 'telefonoa');
    const asunto  = pick('asunto', 'subject', 'sujet', 'gaia');
    const mensaje = pick('mensaje', 'message', 'mezua');

    const subjectMap = {
      es: 'Consulta web',
      eu: 'Webetik bidalitako kontsulta',
      en: 'Website enquiry',
      fr: 'Demande depuis le site web'
    };
    const labelMap = {
      es: { name: 'Nombre', email: 'Email', tel: 'Teléfono', subject: 'Asunto', msg: 'Mensaje' },
      eu: { name: 'Izena',  email: 'Posta', tel: 'Telefonoa', subject: 'Gaia', msg: 'Mezua' },
      en: { name: 'Name',   email: 'Email', tel: 'Phone',     subject: 'Subject', msg: 'Message' },
      fr: { name: 'Nom',    email: 'Email', tel: 'Téléphone', subject: 'Sujet',   msg: 'Message' }
    };
    const L = labelMap[lang] || labelMap.es;
    const subject = `${subjectMap[lang] || subjectMap.es}${asunto ? ' — ' + asunto : ''}`;
    const body = [
      `${L.name}: ${nombre}`,
      `${L.email}: ${email}`,
      tel ? `${L.tel}: ${tel}` : null,
      asunto ? `${L.subject}: ${asunto}` : null,
      '',
      `${L.msg}:`,
      mensaje
    ].filter(Boolean).join('\n');

    const mailto = `mailto:farmaciafernandez@hotmail.es?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Show success feedback
    let fb = form.querySelector('.form-submit-feedback');
    if (!fb) {
      fb = document.createElement('div');
      fb.className = 'form-submit-feedback success';
      fb.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>${M.sent}</span>`;
      form.appendChild(fb);
    }
    fb.classList.add('show');
    setTimeout(() => fb.classList.remove('show'), 5000);

    window.location.href = mailto;
  });
}

/* ── Page transition (fade between pages) ─────────────── */
function initPageTransitions() {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  // Ensure overlay is invisible on load — no entrance animation needed
  gsap.set(overlay, { autoAlpha: 0 });

  // Reset overlay if page is restored from bfcache (back/forward navigation)
  window.addEventListener('pageshow', e => {
    if (e.persisted) gsap.set(overlay, { autoAlpha: 0 });
  });

  // Skip transitions entirely for users who prefer reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not(.lang-btn):not(.nav-mobile-lang):not(.skip-link):not(.footer-legal a)').forEach(link => {
    // Skip language switchers and legal links — no fade needed
    if (link.closest('.lang-switcher') || link.closest('.footer-legal') || link.closest('.nav-mobile-langs')) return;

    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('javascript')) return;

      // Preserve native browser shortcuts: new tab, new window, download, middle-click
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;

      e.preventDefault();

      gsap.to(overlay, {
        autoAlpha: 1,
        duration: .3,
        ease: 'power2.in',
        onComplete: () => { window.location.href = href; }
      });
    });
  });
}

/* ── Video Parallax (services pages) ─────────────────── */
function initVideoParallax() {
  // On mobile/save-data/slow-conn, remove decorative videos to save bandwidth
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const slowConn = conn && (conn.saveData || /(2g|slow-2g)/.test(conn.effectiveType || ''));
  if (isMobile || slowConn) {
    document.querySelectorAll('.page-hero-video-wrap video, .services-bio-banner .vbg video, .services-cta-video .vbg video').forEach(v => {
      v.pause();
      v.removeAttribute('src');
      v.querySelectorAll('source').forEach(s => s.remove());
      v.load();
      v.remove();
    });
    return;
  }

  // Page-hero video entrance
  const heroVid = document.querySelector('.page-hero-video-wrap video');
  if (heroVid) {
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(heroVid,
        { scale: 1.08, opacity: 0 },
        { scale: 1, opacity: 0.38, duration: 2, ease: 'power2.out', delay: 0.5 }
      );
    });
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(heroVid, { opacity: 0.38, scale: 1 });
    });
  }

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Bio-banner video parallax scrub
    const bioBannerVid = document.querySelector('.services-bio-banner .vbg video');
    if (bioBannerVid) {
      gsap.to(bioBannerVid, {
        yPercent: 22,
        ease: 'none',
        scrollTrigger: {
          trigger: '.services-bio-banner',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.4
        }
      });
    }

    // CTA video parallax scrub
    const ctaVid = document.querySelector('.services-cta-video .vbg video');
    if (ctaVid) {
      gsap.to(ctaVid, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.services-cta-video',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.4
        }
      });
    }

    // Bio-banner text stagger reveal
    const bioBanner = document.querySelector('.services-bio-banner');
    if (bioBanner) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: bioBanner,
          start: 'top 68%',
          once: true
        }
      });
      tl.fromTo('.services-bio-banner .bio-label',
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out' }
      )
      .fromTo('.services-bio-banner h2',
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out' },
        '-=.38'
      )
      .fromTo('.services-bio-banner p',
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: .65, ease: 'power3.out' },
        '-=.42'
      );
    }
  });

  // Reduced motion fallback
  mm.add('(prefers-reduced-motion: reduce)', () => {
    [
      '.services-bio-banner .bio-label',
      '.services-bio-banner h2',
      '.services-bio-banner p'
    ].forEach(sel => {
      document.querySelectorAll(sel).forEach(el => gsap.set(el, { autoAlpha: 1, y: 0 }));
    });
  });
}

/* ── Footer utilities ─────────────────────────────────── */
function initFooter() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Highlight today's row in hours table
  const rows = document.querySelectorAll('.hours-table tr');
  if (!rows.length) return;

  const dayIndex = new Date().getDay(); // 0=Sunday

  // 0=Sun,1=Mon,...,5=Fri,6=Sat — same across all locales
  if (dayIndex === 6 && rows[1]) {
    rows[1].classList.add('today'); // Saturday row
  } else if (dayIndex !== 0 && rows[0]) {
    rows[0].classList.add('today'); // Mon-Fri row
  } else if (rows[2]) {
    rows[2].classList.add('today'); // Sunday (closed)
  }
}

/* ── Init All ─────────────────────────────────────────── */
/* ── Section Header Video Background ────────────────────── */
function initSectionHeaderVideos() {
  const section = document.querySelector('#servicios, #services, #zerbitzuak');
  if (!section) return;

  // Skip on small screens, slow connections, or when user prefers reduced motion / saved data
  if (window.matchMedia('(max-width: 768px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn && (conn.saveData || /(2g|slow-2g)/.test(conn.effectiveType || ''))) return;

  const depth = location.pathname.split('/').filter(Boolean).length;
  const prefix = depth >= 2 ? '../' : './';
  const src = `${prefix}assets/videos/15967945-uhd_3840_2024_60fps.mp4`;

  const vid = document.createElement('video');
  vid.autoplay = true;
  vid.muted    = true;
  vid.loop     = true;
  vid.playsInline = true;
  vid.setAttribute('preload', 'none');
  vid.setAttribute('aria-hidden', 'true');
  vid.className = 'section-header-bg-video';
  const source = document.createElement('source');
  source.src  = src;
  source.type = 'video/mp4';
  vid.appendChild(source);
  section.insertBefore(vid, section.firstChild);

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.to(vid, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2
      }
    });
  });
}

/* ── Cookie Consent ───────────────────────────────────── */
function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  const accepted = localStorage.getItem('cookie-consent');
  if (accepted) return;

  setTimeout(() => banner.classList.add('visible'), 1200);

  document.getElementById('cookie-accept')?.addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'accepted');
    banner.classList.remove('visible');
  });

  document.getElementById('cookie-reject')?.addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'rejected');
    banner.classList.remove('visible');
    // Disable GTM dataLayer push on rejection
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'consent_rejected' });
  });
}

/* ── Back to Top ──────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  const updateVisibility = () => btn.classList.toggle('visible', window.scrollY > 400);
  window.addEventListener('scroll', updateVisibility, { passive: true });
  updateVisibility();
  btn.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Open/Closed Status Badge ─────────────────────────── */
function initStatusBadge() {
  const badge = document.getElementById('open-status');
  if (!badge) return;

  const lang = document.documentElement.lang || 'es';
  const labels = {
    es: { open: 'Abierto ahora', closed: 'Cerrado ahora' },
    en: { open: 'Open now',      closed: 'Closed now' },
    eu: { open: 'Irekita orain', closed: 'Itxita orain' },
    fr: { open: 'Ouvert',        closed: 'Fermé' }
  };
  const L = labels[lang] || labels.es;

  // Schedule: Mon-Fri 09-13 & 17-20, Sat 09-13, Sun closed. Spain time (UTC+1/+2)
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  const day = now.getDay(); // 0=Sun, 6=Sat
  const h = now.getHours();
  const m = now.getMinutes();
  const t = h * 60 + m;

  let isOpen = false;
  if (day >= 1 && day <= 5) {
    isOpen = (t >= 540 && t < 780) || (t >= 1020 && t < 1200);
  } else if (day === 6) {
    isOpen = t >= 540 && t < 780;
  }

  badge.textContent = isOpen ? L.open : L.closed;
  badge.className = `status-badge ${isOpen ? 'open' : 'closed'}`;
}

document.addEventListener('DOMContentLoaded', () => {
  initFooter();
  initLoader();
  initCursor();
  initNav();
  initHeroAnims();
  initMouseParallax();
  initScrollReveals();
  initCarousel();
  initSectionDecos();
  initFormMicro();
  initPageTransitions();
  initVideoParallax();
  initSectionHeaderVideos();
  initCookieBanner();
  initBackToTop();
  initStatusBadge();

  // Refresh ScrollTrigger after images load
  window.addEventListener('load', () => ScrollTrigger.refresh());
});
