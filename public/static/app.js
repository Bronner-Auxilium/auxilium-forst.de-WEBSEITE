/* ============================================================
   Auxilium – Frontend JavaScript
   Navigation, Accordion, Scroll-Animations, Form Handling
   ============================================================ */

(function () {
  'use strict';

  /* ─── Navbar: scroll effect, subpage-class & mobile toggle ── */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');

  if (navbar) {
    // Unterseiten: Navbar immer mit weißem Hintergrund (kein Transparent)
    const isSubpage = window.location.pathname !== '/';
    if (isSubpage) {
      navbar.classList.add('navbar--subpage');
    }

    const onScroll = () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        if (!isSubpage) navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (navToggle && navbar) {
    navToggle.addEventListener('click', () => {
      navbar.classList.toggle('mobile-open');
      const isOpen = navbar.classList.contains('mobile-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on nav link click
    navbar.querySelectorAll('.navbar__nav a').forEach(link => {
      link.addEventListener('click', () => {
        navbar.classList.remove('mobile-open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        navbar.classList.remove('mobile-open');
      }
    });
  }

  /* ─── Active nav link ────────────────────────────────────── */
  const currentPath = window.location.pathname;
  document.querySelectorAll('.navbar__nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '/' && href === '/')) {
      link.classList.add('active');
    } else if (href !== '/' && currentPath.startsWith(href)) {
      link.classList.add('active');
    }
  });

  /* ─── Scroll-to-top button ───────────────────────────────── */
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─── Intersection Observer: fade-in on scroll ───────────── */
  const observeEls = document.querySelectorAll(
    '.card, .service-card, .step-item, .contact-info-item, .quote-card, .funding-box, .person-card'
  );

  if ('IntersectionObserver' in window && observeEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, i * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observeEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  }

  /* ─── Accordion / FAQ ────────────────────────────────────── */
  document.querySelectorAll('.accordion-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const body = toggle.nextElementSibling;
      const isOpen = toggle.classList.contains('open');

      // Close all others in same group
      const parent = toggle.closest('.accordion-list');
      if (parent) {
        parent.querySelectorAll('.accordion-toggle.open').forEach(t => {
          t.classList.remove('open');
          t.nextElementSibling.classList.remove('open');
        });
      }

      if (!isOpen) {
        toggle.classList.add('open');
        if (body) body.classList.add('open');
      }
    });
  });

  /* ─── Contact Form ───────────────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const successMsg = document.getElementById('formSuccess');

      const originalText = btn.textContent;
      btn.textContent = 'Wird gesendet…';
      btn.disabled = true;

      // Simulate sending (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 1200));

      contactForm.style.display = 'none';
      if (successMsg) {
        successMsg.style.display = 'block';
      }
    });
  }

  /* ─── Counter animation ──────────────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count'), 10);
            const suffix = el.getAttribute('data-suffix') || '';
            const duration = 1800;
            const start = Date.now();

            const tick = () => {
              const elapsed = Date.now() - start;
              const progress = Math.min(elapsed / duration, 1);
              const ease = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.round(target * ease) + suffix;
              if (progress < 1) requestAnimationFrame(tick);
            };
            tick();
            countObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(el => countObserver.observe(el));
  }

  /* ─── Smooth scroll for anchor links ────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const offset = 88;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

})();
