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

    // Site-Header (Banner+Navbar) als Wrapper – padding-top des ersten
    // scrollbaren Inhaltsblocks dynamisch auf Header-Höhe setzen
    const siteHeader = document.getElementById('siteHeader');
    const adjustPagePadding = () => {
      if (!siteHeader) return;
      const h = siteHeader.offsetHeight;
      // Ersten Content-Block nach dem Header finden und Padding setzen
      const firstContent = siteHeader.nextElementSibling;
      if (firstContent) {
        (firstContent as HTMLElement).style.paddingTop = h + 'px';
      }
    };
    adjustPagePadding();
    window.addEventListener('resize', adjustPagePadding, { passive: true });

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

  /* ─── Stellenangebote: Print / PDF ──────────────────────── */
  const printArea = document.querySelector('.job-print-area');
  if (printArea) {
    // Druckbereich direkt als Body-Kind verschieben (vor dem Drucken)
    let printPlaceholder = null;
    window.addEventListener('beforeprint', () => {
      // Platzhalter merken, um nach dem Druck zurückzuversetzen
      printPlaceholder = document.createComment('print-placeholder');
      printArea.parentNode.insertBefore(printPlaceholder, printArea);
      document.body.appendChild(printArea);
      document.body.classList.add('printing');
    });
    window.addEventListener('afterprint', () => {
      document.body.classList.remove('printing');
      if (printPlaceholder && printPlaceholder.parentNode) {
        printPlaceholder.parentNode.insertBefore(printArea, printPlaceholder);
        printPlaceholder.parentNode.removeChild(printPlaceholder);
      }
      printPlaceholder = null;
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
      const btn      = contactForm.querySelector('button[type="submit"]');
      const successEl = document.getElementById('formSuccess');
      const errorEl   = document.getElementById('formError');
      const errorMsg  = document.getElementById('formErrorMsg');

      // Button sperren
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Wird gesendet…';
      btn.disabled = true;
      if (errorEl) errorEl.style.display = 'none';

      // Formulardaten sammeln
      const data = {
        firstName:  contactForm.querySelector('#firstName')?.value  || '',
        lastName:   contactForm.querySelector('#lastName')?.value   || '',
        city:       contactForm.querySelector('#city')?.value       || '',
        phone:      contactForm.querySelector('#phone')?.value      || '',
        email:      contactForm.querySelector('#email')?.value      || '',
        subject:    contactForm.querySelector('#subject')?.value    || '',
        message:    contactForm.querySelector('#message')?.value    || '',
        privacy:    String(contactForm.querySelector('#privacy')?.checked || false),
        recaptchaToken: ''
      };

      // reCAPTCHA v3 Token holen (falls Site Key im data-Attribut)
      const siteKey = contactForm.getAttribute('data-site-key');
      if (siteKey && typeof grecaptcha !== 'undefined') {
        try {
          data.recaptchaToken = await new Promise((resolve, reject) => {
            grecaptcha.ready(() => {
              grecaptcha.execute(siteKey, { action: 'contact_form' })
                .then(resolve).catch(reject);
            });
          });
        } catch {
          // reCAPTCHA-Fehler: trotzdem senden (Server entscheidet)
        }
      }

      // API-Call
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await res.json();

        if (json.ok) {
          contactForm.style.display = 'none';
          if (successEl) successEl.style.display = 'block';
        } else {
          // Fehler anzeigen, Button wieder aktivieren
          btn.innerHTML = originalHTML;
          btn.disabled = false;
          if (errorEl) {
            if (errorMsg) errorMsg.textContent = json.error || 'Ein Fehler ist aufgetreten.';
            errorEl.style.display = 'block';
            errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      } catch {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        if (errorEl) {
          if (errorMsg) errorMsg.textContent = 'Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung.';
          errorEl.style.display = 'block';
        }
      }
    });
  }

  /* ─── Counter animation (count-up with prefix/suffix) ────── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const targetRaw = parseFloat(el.getAttribute('data-count'));
            const prefix  = el.getAttribute('data-prefix')  || '';
            const suffix  = el.getAttribute('data-suffix')  || '';
            const isDecimal = String(el.getAttribute('data-count')).includes('.');
            const duration = 1800;
            const start = Date.now();

            const tick = () => {
              const elapsed  = Date.now() - start;
              const progress = Math.min(elapsed / duration, 1);
              const ease     = 1 - Math.pow(1 - progress, 3);
              const value    = targetRaw * ease;
              const display  = isDecimal
                ? value.toFixed(1).replace('.', ',')
                : Math.round(value);
              el.textContent = prefix + display + suffix;
              if (progress < 1) requestAnimationFrame(tick);
              else el.textContent = prefix + (isDecimal ? String(targetRaw).replace('.', ',') : targetRaw) + suffix;
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

  /* ═══════════════════════════════════════════════════════════
     DSGVO Cookie-Banner
     ═══════════════════════════════════════════════════════════ */
  (function cookieConsent() {
    const STORAGE_KEY = 'aux_cookie_consent';
    const banner      = document.getElementById('cookieBanner');
    const btnAcceptAll   = document.getElementById('cookieAcceptAll');
    const btnRejectAll   = document.getElementById('cookieRejectAll');
    const btnSave        = document.getElementById('cookieSaveSelected');
    const btnSettings    = document.getElementById('cookieSettingsBtn');
    const toggleAnalytics = document.getElementById('cookieAnalytics');

    if (!banner) return;

    // ── Consent aus localStorage lesen ──────────────────────
    function loadConsent() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
      catch(e) { return null; }
    }

    // ── Consent speichern ────────────────────────────────────
    function saveConsent(analytics) {
      const consent = {
        necessary: true,
        analytics: !!analytics,
        timestamp: new Date().toISOString(),
        version: '1'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
      return consent;
    }

    // ── Google Analytics laden (nur nach Zustimmung) ─────────
    function loadGA(enable) {
      if (typeof gtag !== 'function') return;
      gtag('consent', 'update', {
        analytics_storage: enable ? 'granted' : 'denied'
      });
      if (enable && window.__AUX_GA_ID) {
        gtag('js', new Date());
        gtag('config', window.__AUX_GA_ID, { anonymize_ip: true });
      }
    }

    // ── Banner anzeigen ──────────────────────────────────────
    function showBanner() {
      banner.hidden = false;
      banner.removeAttribute('hidden');
      document.body.style.overflow = 'hidden'; // kein Scrollen dahinter
      // Fokus auf ersten Button setzen (Accessibility)
      setTimeout(() => {
        const firstBtn = banner.querySelector('.cookie-btn');
        if (firstBtn) firstBtn.focus();
      }, 100);
    }

    // ── Banner schließen ─────────────────────────────────────
    function closeBanner() {
      banner.hidden = true;
      document.body.style.overflow = '';
    }

    // ── Auf gespeicherte Einstellung reagieren ───────────────
    function applyConsent(consent) {
      if (!consent) return;
      // Toggle-State wiederherstellen
      if (toggleAnalytics) toggleAnalytics.checked = !!consent.analytics;
      loadGA(consent.analytics);
    }

    // ── Initialisierung ──────────────────────────────────────
    const saved = loadConsent();
    if (!saved) {
      // Noch keine Entscheidung – Banner nach kurzem Delay zeigen
      setTimeout(showBanner, 600);
    } else {
      // Gespeicherte Einstellung anwenden
      applyConsent(saved);
    }

    // ── Button-Events ────────────────────────────────────────
    if (btnAcceptAll) {
      btnAcceptAll.addEventListener('click', () => {
        if (toggleAnalytics) toggleAnalytics.checked = true;
        const c = saveConsent(true);
        applyConsent(c);
        closeBanner();
      });
    }

    if (btnRejectAll) {
      btnRejectAll.addEventListener('click', () => {
        if (toggleAnalytics) toggleAnalytics.checked = false;
        const c = saveConsent(false);
        applyConsent(c);
        closeBanner();
      });
    }

    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const analyticsChecked = toggleAnalytics ? toggleAnalytics.checked : false;
        const c = saveConsent(analyticsChecked);
        applyConsent(c);
        closeBanner();
      });
    }

    // ── Footer-Button: Einstellungen erneut öffnen ───────────
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        // Aktuellen Stand ins Formular laden
        const current = loadConsent();
        if (current && toggleAnalytics) {
          toggleAnalytics.checked = !!current.analytics;
        }
        showBanner();
      });
    }

    // ── ESC-Taste schließt Banner NICHT (DSGVO: Entscheidung erforderlich)
    // Klick auf Backdrop schließt ebenfalls nicht aus demselben Grund

  })(); // Ende cookieConsent

})();
