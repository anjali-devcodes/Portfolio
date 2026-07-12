/* ==========================================================================
   DietBite Portfolio — script.js
   Handles: loading screen, navbar scroll state, mobile menu, dark mode,
   active-link highlighting, scroll-reveal animation, scroll-to-top,
   and a frontend-only contact form.
   ========================================================================== */

/* ---------------------------------------------------------------------
   EmailJS configuration
   ---------------------------------------------------------------------
   1. Create a free account at https://www.emailjs.com
   2. Add an Email Service (e.g. Gmail) -> copy its Service ID below.
   3. Create an Email Template with variables: {{from_name}}, {{from_email}},
      {{message}} -> copy its Template ID below.
   4. Account > General -> copy your Public Key below.
   Until these three values are filled in, the form falls back to a
   friendly "email me directly" message instead of failing silently.
   ------------------------------------------------------------------ */
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

const emailjsIsConfigured = () =>
  ![EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID].some(v => v.startsWith('YOUR_'));

if (window.emailjs && emailjsIsConfigured()) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Loading screen ---------------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader && loader.classList.add('loaded'), 350);
  });
  // Fallback in case the load event already fired
  setTimeout(() => loader && loader.classList.add('loaded'), 2500);

  /* ---------------- Dark mode toggle ---------------- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('db-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  } else if (prefersDark) {
    root.setAttribute('data-theme', 'dark');
  }

  themeToggle && themeToggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    if (next === 'light') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('db-theme', next);
  });

  /* ---------------- Mobile nav ---------------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle && navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle && navToggle.classList.remove('open');
      navToggle && navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------- Navbar scrolled state ---------------- */
  const navbar = document.getElementById('navbar');
  const scrollTopBtn = document.getElementById('scrollTop');

  const onScroll = () => {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', y > 40);
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', y > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  scrollTopBtn && scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------------- Active nav link on scroll (scroll-spy) ---------------- */
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navAnchors = Array.from(document.querySelectorAll('.nav-link'));

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => spyObserver.observe(sec));

  /* ---------------- Scroll-reveal ---------------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  /* ---------------- Contact form (frontend only) ---------------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  const validators = {
    name: (v) => v.trim().length >= 2 ? '' : 'Please enter your name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email.',
    message: (v) => v.trim().length >= 10 ? '' : 'Message should be at least 10 characters.'
  };

  const showError = (field, msg) => {
    const el = form.querySelector(`[data-error-for="${field}"]`);
    if (el) el.textContent = msg;
  };

  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasError = false;

    Object.keys(validators).forEach(field => {
      const input = form.elements[field];
      const msg = validators[field](input.value);
      showError(field, msg);
      if (msg) hasError = true;
    });

    if (hasError) {
      formNote.style.color = '#E14D4D';
      formNote.textContent = 'Please fix the fields above.';
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;

    // If EmailJS hasn't been configured yet (see the top of this file),
    // fall back to a friendly message instead of failing silently.
    if (!window.emailjs || !emailjsIsConfigured()) {
      formNote.style.color = 'var(--accent)';
      formNote.textContent = 'Thanks! This form isn\'t connected yet — please email me directly for now.';
      form.reset();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    formNote.style.color = 'var(--ink-soft)';
    formNote.textContent = '';

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name: form.elements.name.value.trim(),
      from_email: form.elements.email.value.trim(),
      message: form.elements.message.value.trim()
    }).then(() => {
      formNote.style.color = 'var(--accent)';
      formNote.textContent = 'Thanks! Your message has been sent — I\'ll get back to you soon.';
      form.reset();
    }).catch(() => {
      formNote.style.color = '#E14D4D';
      formNote.textContent = 'Something went wrong sending that. Please email me directly instead.';
    }).finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    });
  });

  // Clear individual errors as the user types
  form && form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => showError(input.name, ''));
  });

  /* ---------------- Screenshot lightbox ---------------- */
  initLightbox();

});

/**
 * Screenshot lightbox / gallery.
 * Groups every image tagged `data-gallery="<name>"` into its own gallery
 * (DietBite screenshots vs. the single GrowthAI Studio screenshot), so
 * Prev/Next only ever cycles through screenshots of the same project.
 */
function initLightbox() {
  const galleryImgs = Array.from(document.querySelectorAll('.gallery-img'));
  if (!galleryImgs.length) return;

  // Build { galleryName: [ {src, alt, caption}, ... ] } preserving DOM order
  const groups = {};
  galleryImgs.forEach(img => {
    const name = img.dataset.gallery || 'default';
    const figcaption = img.closest('figure')?.querySelector('figcaption');
    if (!groups[name]) groups[name] = [];
    groups[name].push({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt') || '',
      caption: figcaption ? figcaption.textContent.trim() : ''
    });
    // Remember which gallery + index this exact element opens
    img.dataset.galleryIndex = groups[name].length - 1;
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  if (!lightbox) return;

  let activeGroup = [];
  let activeIndex = 0;
  let lastFocusedEl = null;

  const render = () => {
    const item = activeGroup[activeIndex];
    if (!item) return;
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    lightboxCaption.textContent = item.caption;

    const multiple = activeGroup.length > 1;
    prevBtn.classList.toggle('is-hidden', !multiple);
    nextBtn.classList.toggle('is-hidden', !multiple);
    lightboxCounter.textContent = multiple ? `${activeIndex + 1} / ${activeGroup.length}` : '';
  };

  const openLightbox = (groupName, index, triggerEl) => {
    activeGroup = groups[groupName] || [];
    activeIndex = index;
    lastFocusedEl = triggerEl || document.activeElement;

    render();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // lock background scroll
    closeBtn.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedEl) lastFocusedEl.focus();
  };

  const showPrev = () => {
    if (!activeGroup.length) return;
    activeIndex = (activeIndex - 1 + activeGroup.length) % activeGroup.length;
    render();
  };
  const showNext = () => {
    if (!activeGroup.length) return;
    activeIndex = (activeIndex + 1) % activeGroup.length;
    render();
  };

  // Open on click
  galleryImgs.forEach(img => {
    img.addEventListener('click', () => {
      openLightbox(img.dataset.gallery, Number(img.dataset.galleryIndex), img);
    });
    // Open on keyboard (Enter / Space) since images are focusable buttons
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img.dataset.gallery, Number(img.dataset.galleryIndex), img);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // Click outside the image (on the dark overlay) closes the lightbox
  document.querySelectorAll('[data-lightbox-close]').forEach(el => {
    el.addEventListener('click', closeLightbox);
  });

  // Keyboard support: Esc closes, arrows navigate
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
}
