/**
 * FARMACIA FERNÁNDEZ DÍEZ — GSAP Animations
 * © Unax Aller
 */

gsap.registerPlugin(ScrollTrigger);

/* ── Reduced Motion ───────────────────────────────────── */
const mm = gsap.matchMedia();

/* ── Custom Cursor ────────────────────────────────────── */
function initCursor() {
  const cursor = document.querySelector('.cursor');
  const ring   = document.querySelector('.cursor-ring');
  if (!cursor || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.08, ease: 'none' });
  });

  gsap.ticker.add(() => {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    gsap.set(ring, { x: ringX, y: ringY });
  });

  document.querySelectorAll('a, button, [data-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      ring.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      ring.classList.remove('hover');
    });
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

  // Safety net: always dismiss after 3.5s regardless of GSAP state
  const safetyTimeout = setTimeout(dismissLoader, 3500);

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

  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    toggle.classList.toggle('open', isOpen);

    if (isOpen) {
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
      gsap.to(mobileLinks, { autoAlpha: 0, y: 20, stagger: .04, duration: .3 });
      gsap.to(mobileMenu, {
        autoAlpha: 0,
        duration: .35,
        ease: 'power2.in',
        delay: .15,
        onComplete: () => {
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      isOpen = false;
      toggle.classList.remove('open');
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
    });
  });
}

/* ── Hero Entrance ────────────────────────────────────── */
function initHeroAnims() {
  mm.add({
    isDesktop: '(min-width: 769px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  }, ctx => {
    const { reduceMotion } = ctx.conditions;
    if (reduceMotion) return;

    const tl = gsap.timeline({ delay: 0.1 });

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

    tl.to('.hero-eyebrow', { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out' })
      .to('.hero h1',      { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out' }, '-=.4')
      .to('.hero-desc',    { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out' }, '-=.5')
      .to('.hero-actions', { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out' }, '-=.4')
      .to('.hero-scroll',  { autoAlpha: 1, duration: .5 }, '-=.2');
  });

  // Always show on mobile
  mm.add('(max-width: 768px)', () => {
    gsap.set(['.hero-eyebrow', '.hero h1', '.hero-desc', '.hero-actions', '.hero-scroll'],
      { autoAlpha: 1, y: 0 });
  });
}

/* ── Mouse parallax on hero ───────────────────────────── */
function initMouseParallax() {
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

      gsap.fromTo({ val: 0 }, { val: target }, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: function() {
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

/* ── Carousel ─────────────────────────────────────────── */
function initCarousel() {
  const track  = document.querySelector('.carousel-track');
  const dots   = document.querySelectorAll('.carousel-dot');
  const btnPrev = document.querySelector('.carousel-btn.prev');
  const btnNext = document.querySelector('.carousel-btn.next');

  if (!track) return;

  let isDown = false;
  let startX, scrollLeft;

  track.addEventListener('mousedown', e => {
    isDown = true;
    track.classList.add('grabbing');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  track.addEventListener('mouseleave', () => { isDown = false; track.classList.remove('grabbing'); });
  track.addEventListener('mouseup', () => { isDown = false; track.classList.remove('grabbing'); });
  track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.8;
    track.scrollLeft = scrollLeft - walk;
  });

  // touch
  let touchStart = 0;
  track.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; });
  track.addEventListener('touchend', e => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) scrollBy(diff > 0 ? 1 : -1);
  });

  const slideWidth = () => track.firstElementChild?.offsetWidth + 24 || 320;

  function scrollBy(dir) {
    gsap.to(track, {
      scrollLeft: track.scrollLeft + dir * slideWidth(),
      duration: .55,
      ease: 'power2.inOut'
    });
  }

  if (btnPrev) btnPrev.addEventListener('click', () => scrollBy(-1));
  if (btnNext) btnNext.addEventListener('click', () => scrollBy(1));

  // Dot sync
  if (dots.length) {
    track.addEventListener('scroll', () => {
      const idx = Math.round(track.scrollLeft / slideWidth());
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }, { passive: true });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        gsap.to(track, {
          scrollLeft: i * slideWidth(),
          duration: .55,
          ease: 'power2.inOut'
        });
      });
    });
  }
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
  document.querySelectorAll('.form-group input, .form-group textarea, .form-group select')
    .forEach(el => {
      el.addEventListener('focus', () => {
        gsap.to(el.closest('.form-group'), { y: -2, duration: .2, ease: 'power2.out' });
      });
      el.addEventListener('blur', () => {
        gsap.to(el.closest('.form-group'), { y: 0, duration: .2, ease: 'power2.out' });
      });
    });

  const form = document.querySelector('.contact-form form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const original = btn.textContent;

    gsap.to(btn, { scale: .96, duration: .1, yoyo: true, repeat: 1 });
    btn.textContent = '✓';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      form.reset();
    }, 2200);
  });
}

/* ── Page transition (fade between pages) ─────────────── */
function initPageTransitions() {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  // Ensure overlay is invisible on load — no entrance animation needed
  gsap.set(overlay, { autoAlpha: 0 });

  document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"])').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('javascript')) return;
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

/* ── Init All ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
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

  // Refresh ScrollTrigger after images load
  window.addEventListener('load', () => ScrollTrigger.refresh());
});
