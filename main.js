/* ===========================
   LUOVA KAMPAAMO – MAIN.JS
   =========================== */

'use strict';

// --- Footer year ---
const yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Sticky header ---
const header = document.querySelector('.site-header');

function handleHeaderScroll() {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();

// --- Mobile hamburger menu ---
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

function toggleMenu(open) {
  const isOpen = open !== undefined ? open : !hamburger.classList.contains('active');

  hamburger.classList.toggle('active', isOpen);
  navMenu.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => toggleMenu());

  // Close on nav link click
  navMenu.querySelectorAll('.nav-link, .nav-cta-btn').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && hamburger.classList.contains('active')) {
      toggleMenu(false);
      hamburger.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (
      hamburger.classList.contains('active') &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      toggleMenu(false);
    }
  });
}

// --- Active nav link on scroll ---
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function setActiveLink() {
  const scrollY = window.scrollY + 120;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);

    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(l => l.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'page');
      }
    }
  });
}

window.addEventListener('scroll', setActiveLink, { passive: true });

// --- Scroll reveal animation ---
const revealElements = document.querySelectorAll(
  '.service-card, .pricing-category, .gallery-item, .trust-card, .about-text, .about-image-wrap, .contact-list-item, .highlight'
);

// Add reveal class
revealElements.forEach((el, index) => {
  el.classList.add('reveal');

  // Stagger delay for grid items
  const parent = el.parentElement;
  const siblings = Array.from(parent.children).filter(
    child => child.classList.contains(el.classList[0])
  );
  const indexInGroup = siblings.indexOf(el);

  if (indexInGroup <= 3 && indexInGroup > 0) {
    el.classList.add(`reveal-delay-${indexInGroup}`);
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  }
);

revealElements.forEach(el => revealObserver.observe(el));

// --- Contact form ---
const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');
const submitBtn = document.getElementById('submitBtn');

const validators = {
  nimi: {
    validate: val => val.trim().length >= 2,
    message: 'Syötä vähintään 2 merkkiä pitkä nimi.'
  },
  puhelin: {
    validate: val => /^[\d\s\+\-\(\)]{6,}$/.test(val.trim()),
    message: 'Syötä kelvollinen puhelinnumero.'
  },
  email: {
    validate: val => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
    message: 'Syötä kelvollinen sähköpostiosoite.'
  }
};

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (field && errorEl) {
    field.setAttribute('aria-invalid', 'true');
    field.style.borderColor = '#c0392b';
    errorEl.textContent = message;
  }
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (field && errorEl) {
    field.removeAttribute('aria-invalid');
    field.style.borderColor = '';
    errorEl.textContent = '';
  }
}

function validateForm() {
  let valid = true;

  Object.entries(validators).forEach(([fieldId, { validate, message }]) => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    if (!validate(field.value)) {
      showFieldError(fieldId, message);
      valid = false;
    } else {
      clearFieldError(fieldId);
    }
  });

  return valid;
}

// Live validation
if (contactForm) {
  ['nimi', 'puhelin', 'email'].forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.addEventListener('blur', () => {
      const { validate, message } = validators[fieldId];
      if (!validate(field.value)) {
        showFieldError(fieldId, message);
      } else {
        clearFieldError(fieldId);
      }
    });

    field.addEventListener('input', () => {
      const { validate } = validators[fieldId];
      if (validate(field.value)) {
        clearFieldError(fieldId);
      }
    });
  });

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = contactForm.querySelector('[aria-invalid="true"]');
      if (firstError) firstError.focus();
      return;
    }

    // UI: loading state
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline';
    formFeedback.className = 'form-feedback';
    formFeedback.style.display = 'none';

    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      if (response.ok) {
        formFeedback.textContent = '✓ Kiitos viestistäsi! Otamme sinuun yhteyttä mahdollisimman pian.';
        formFeedback.className = 'form-feedback success';
        formFeedback.style.display = 'block';
        contactForm.reset();

        // Scroll to feedback
        formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        throw new Error('Palvelimen virhe');
      }
    } catch {
      formFeedback.textContent = '✗ Viestin lähetys epäonnistui. Yritä uudelleen tai soita numeroon 040 0450902.';
      formFeedback.className = 'form-feedback error';
      formFeedback.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoading) btnLoading.style.display = 'none';
    }
  });
}

// --- Smooth anchor scroll with header offset ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    const headerHeight = header ? header.offsetHeight : 80;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    // Update URL without scroll
    history.pushState(null, '', `#${targetId}`);
  });
});

// --- Gallery image lightbox hint (accessibility) ---
document.querySelectorAll('.gallery-item').forEach(item => {
  item.setAttribute('role', 'img');
  const img = item.querySelector('img');
  if (img) {
    item.setAttribute('aria-label', img.getAttribute('alt') || 'Galleriakuva');
  }
});