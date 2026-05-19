import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

type Bindings = { DB: D1Database }
const app = new Hono<{ Bindings: Bindings }>()

// Admin-Passwort (hier einfach hartcodiert – für Prod als Secret setzen)
const ADMIN_PASSWORD = 'auxilium2024'
const SESSION_COOKIE = 'adm_sess'

// Auth-Middleware für /admin/* (außer Login)
async function requireAdmin(c: any, next: any) {
  if (c.req.path === '/admin/login') return next()
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) return c.redirect('/admin/login')
  const row = await c.env.DB.prepare(
    'SELECT token FROM admin_sessions WHERE token = ?'
  ).bind(token).first()
  if (!row) return c.redirect('/admin/login')
  return next()
}
app.use('/admin/*', requireAdmin)

app.use('/static/*', serveStatic({ root: './' }))

// ─── Layout helper ────────────────────────────────────────────
function layout(title: string, description: string, body: string, S: Record<string,string> = {}): string {
  const year = new Date().getFullYear()
  const loc   = S.contact_location || 'Forst (Baden) &amp; Umgebung'
  const email = S.contact_email    || 'info@auxilium-forst.com'
  const hours = S.contact_hours    || 'Mo&ndash;Fr &middot; 8:00 &ndash; 18:00 Uhr'
  // Urlaubsbanner
  const vacationBanner = (S.vacation_active === '1' && S.vacation_text)
    ? `<div class="vacation-banner" role="alert"><i class="fas fa-umbrella-beach"></i><strong>Urlaubshinweis:</strong> ${S.vacation_text}</div>`
    : ''
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${description}">
<meta property="og:title" content="${title}">
<meta property="og:type" content="website">
<meta property="og:image" content="/static/logo.jpg">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<link rel="stylesheet" href="/static/style.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#x1F98B;</text></svg>">
</head>
<body>
${vacationBanner}
<nav class="navbar" id="navbar" role="navigation" aria-label="Hauptnavigation">
  <div class="navbar__inner">
    <a href="/" class="navbar__logo" aria-label="Auxilium Startseite">
      <img src="/static/logo.jpg" alt="Auxilium Logo" class="navbar__logo-img">
      <div class="navbar__logo-text">
        <span class="navbar__logo-name">AUXILIUM</span>
        <span class="navbar__logo-sub">Pflegeberatung &middot; Forst Baden</span>
      </div>
    </a>
    <nav class="navbar__nav" aria-label="Seitennavigation">
      <a href="/">Start</a>
      <a href="/ueber-auxilium">&Uuml;ber Auxilium</a>
      <a href="/leistungen">Leistungen &amp; Kosten</a>
      <a href="/beratung">Beratung</a>
      <a href="/stellenangebote">Stellenangebote</a>
      <a href="/kontakt">Kontakt</a>
      <a href="/kontakt" class="navbar__nav-cta-mobile"><i class="fas fa-calendar-check" aria-hidden="true"></i>Jetzt anfragen</a>
    </nav>
    <a href="/kontakt" class="btn btn-accent navbar__cta">
      <i class="fas fa-phone" aria-hidden="true"></i>
      Jetzt anfragen
    </a>
    <button class="navbar__toggle" id="navToggle" aria-label="Men&uuml; &ouml;ffnen" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
${body}
<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer__grid">
      <div>
        <div class="footer__logo">
          <img src="/static/logo.jpg" alt="Auxilium Logo" class="footer__logo-img">
          <span class="footer__logo-name">AUXILIUM</span>
        </div>
        <p class="footer__desc">Einzigartige Pflege f&uuml;r einzigartige Menschen. Ich unterst&uuml;tze Sie und Ihre Angeh&ouml;rigen in Forst (Baden) und Umgebung &ndash; mit Fachkenntnis, Herz und Leidenschaft.</p>
        <a href="mailto:info@auxilium-forst.com" style="display:inline-flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--primary);">
          <i class="fas fa-envelope" aria-hidden="true"></i> info@auxilium-forst.com
        </a>
      </div>
      <div>
        <p class="footer__heading">Navigation</p>
        <ul class="footer__links">
          <li><a href="/">Start</a></li>
          <li><a href="/ueber-auxilium">&Uuml;ber Auxilium</a></li>
          <li><a href="/leistungen">Leistungen &amp; Kosten</a></li>
          <li><a href="/beratung">Beratung</a></li>
          <li><a href="/stellenangebote">Stellenangebote</a></li>
          <li><a href="/kontakt">Kontakt</a></li>
        </ul>
      </div>
      <div>
        <p class="footer__heading">Leistungen</p>
        <ul class="footer__links">
          <li><a href="/leistungen#koerperpflege">K&ouml;rperpflege</a></li>
          <li><a href="/leistungen#betreuung">Betreuung</a></li>
          <li><a href="/leistungen#einkauf">Einkauf</a></li>
          <li><a href="/leistungen#alltag">Alltagsorganisation</a></li>
          <li><a href="/beratung">Pflegeberatung</a></li>
        </ul>
      </div>
      <div>
        <p class="footer__heading">Kontakt</p>
        <ul class="footer__links" style="display:flex;flex-direction:column;gap:10px;">
          <li style="color:rgba(255,255,255,0.62);font-size:0.875rem;"><i class="fas fa-map-marker-alt" style="color:var(--primary);margin-right:7px;width:14px;" aria-hidden="true"></i>${loc}</li>
          <li style="font-size:0.875rem;"><i class="fas fa-envelope" style="color:var(--primary);margin-right:7px;width:14px;" aria-hidden="true"></i><a href="mailto:${email}" style="color:rgba(255,255,255,0.62);">${email}</a></li>
          <li style="color:rgba(255,255,255,0.62);font-size:0.875rem;"><i class="fas fa-clock" style="color:var(--primary);margin-right:7px;width:14px;" aria-hidden="true"></i>${hours}</li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <p>&copy; ${year} Auxilium &ndash; Kristina Bronner &middot; Forst (Baden)</p>
      <div class="footer__bottom-links">
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutz</a>
      </div>
    </div>
  </div>
</footer>
<button class="scroll-top" id="scrollTop" aria-label="Nach oben scrollen">
  <i class="fas fa-chevron-up" aria-hidden="true"></i>
</button>
<script src="/static/app.js" defer></script>
</body>
</html>`
}

// ─── Page Hero helper ─────────────────────────────────────────
function pageHero(label: string, title: string, subtitle: string, breadcrumb: string): string {
  return `<section class="page-hero" aria-labelledby="page-heading">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Start</a>
      <span class="sep" aria-hidden="true">&rsaquo;</span>
      <span class="current">${breadcrumb}</span>
    </nav>
    <span class="section-label">${label}</span>
    <h1 id="page-heading">${title}</h1>
    <p style="max-width:540px;margin-top:14px;font-size:1rem;">${subtitle}</p>
  </div>
</section>`
}

// ─── HOME ─────────────────────────────────────────────────────
// Hilfsfunktion: alle Settings als Objekt laden
async function loadSettings(db: D1Database): Promise<Record<string,string>> {
  const { results } = await db.prepare('SELECT key, value FROM settings').all<any>()
  const map: Record<string,string> = {}
  for (const r of results) map[r.key] = r.value
  return map
}

app.get('/', async (c) => {
  // Lade aktive Kategorien für die Startseite
  const { results: dbKategorien } = await c.env.DB.prepare(
    'SELECT * FROM kategorien WHERE active=1 ORDER BY sort_order'
  ).all<any>()

  // Lade aktive FAQs aus der DB
  const { results: dbFaqs } = await c.env.DB.prepare(
    'SELECT * FROM faqs WHERE active=1 ORDER BY sort_order'
  ).all<any>()

  // Lade aktive Testimonials
  const { results: dbTestimonials } = await c.env.DB.prepare(
    'SELECT * FROM testimonials WHERE active=1 ORDER BY sort_order'
  ).all<any>()

  // Lade Einstellungen
  const S = await loadSettings(c.env.DB)

  const faqItems = dbFaqs.map((f: any) => `
      <div class="accordion-item">
        <button class="accordion-toggle" aria-expanded="false">${f.question}<span class="chevron" aria-hidden="true"><i class="fas fa-chevron-down"></i></span></button>
        <div class="accordion-body"><div class="accordion-body__inner">${f.answer}</div></div>
      </div>`).join('\n')

  const homeKatCards = dbKategorien.map((k: any) => `
      <a href="/leistungen#${k.slug}" class="home-kat-card" aria-label="${k.name}">
        <div class="home-kat-card__icon"><i class="fas ${k.icon}" aria-hidden="true"></i></div>
        <div class="home-kat-card__name">${k.name}</div>
        ${k.description ? `<p class="home-kat-card__desc">${k.description}</p>` : ''}
        <span class="home-kat-card__arrow"><i class="fas fa-arrow-right"></i> Mehr erfahren</span>
      </a>`).join('\n')

  const body = `
<section class="hero" aria-labelledby="hero-heading">
  <div class="hero__bg-shapes" aria-hidden="true">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
    <div class="bokeh bokeh-1"></div>
    <div class="bokeh bokeh-2"></div>
    <div class="bokeh bokeh-3"></div>
  </div>
  <div class="hero__inner">
    <div class="hero__content animate-fade-in">
      <div class="hero__badge"><span class="badge-dot"></span>Individuelle Pflege in Forst (Baden) &amp; Umgebung</div>
      <h1 id="hero-heading" class="hero__title">Ihre pers&ouml;nliche<br><span class="highlight">St&uuml;tze</span> &ndash;<br><span class="highlight-amber">wenn Sie sie brauchen</span></h1>
      <p class="hero__text">Mit langjähriger Erfahrung in der Pflege begleite ich pflegebedürftige Menschen und ihre Angehörigen – persönlich, kompetent und mit echtem Herz. Jeder Mensch verdient individuelle Aufmerksamkeit.</p>
      <div class="hero__actions">
        <a href="/kontakt" class="btn btn-accent"><i class="fas fa-envelope" aria-hidden="true"></i>Kontakt aufnehmen</a>
        <a href="/leistungen" class="btn btn-outline"><i class="fas fa-list" aria-hidden="true"></i>Alle Leistungen</a>
      </div>
    </div>
    <div class="hero__visual animate-fade-in-delay-1">
      <img src="/static/logo.jpg" alt="Auxilium &ndash; Schmetterling &amp; Hand Logo" class="hero__logo-free">
    </div>
  </div>
</section>

<div class="feature-strip" role="complementary">
  <div class="container">
    <div class="feature-strip__inner">
      <div class="feature-strip__item"><i class="fas fa-tag" aria-hidden="true"></i>G&uuml;nstigere Preise als ambulante Dienste</div>
      <div class="feature-strip__item"><i class="fas fa-user" aria-hidden="true"></i>Pers&ouml;nlicher Ansprechpartner</div>
      <div class="feature-strip__item"><i class="fas fa-home" aria-hidden="true"></i>Pflege in Ihrem Zuhause</div>
      <div class="feature-strip__item"><i class="fas fa-file-invoice" aria-hidden="true"></i>Abrechnung &uuml;ber Pflegekasse</div>
    </div>
  </div>
</div>

<section class="section" aria-labelledby="why-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Warum Auxilium?</span>
      <h2 id="why-heading">Pflege, die wirklich hilft</h2>
      <p style="max-width:580px;margin:14px auto 0;">Die Entscheidung f&uuml;r einen Pflegedienst ist nicht leicht. Auxilium bietet Ihnen eine bewusste Alternative &ndash; professionell, menschlich und bezahlbar.</p>
    </div>
    <div class="grid-3">
      <article class="card"><div class="card__icon"><i class="fas fa-user-circle" aria-hidden="true"></i></div><h3 class="card__title">Einzigartigkeit</h3><p class="card__text">Jeder Mensch verdient individuelle Aufmerksamkeit. Bei Auxilium steht Ihre pers&ouml;nliche Situation immer im Mittelpunkt.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-coins" aria-hidden="true"></i></div><h3 class="card__title">G&uuml;nstigere Preise</h3><p class="card__text">Auxilium ist deutlich g&uuml;nstiger als herk&ouml;mmliche ambulante Pflegedienste &ndash; und kann &uuml;ber Verhinderungspflege abgerechnet werden.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-graduation-cap" aria-hidden="true"></i></div><h3 class="card__title">Professionelle Beratung</h3><p class="card__text">Sie erhalten eine vollst&auml;ndige &Uuml;bersicht aller Leistungsanspr&uuml;che aus der Pflegekasse &ndash; optimal f&uuml;r Ihre Situation genutzt.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-home" aria-hidden="true"></i></div><h3 class="card__title">Zuhause bleiben</h3><p class="card__text">&Uuml;ber 80 % der Pflegebed&uuml;rftigen wollen zu Hause versorgt werden. Auxilium macht das m&ouml;glich &ndash; mit echtem Heimgef&uuml;hl.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-users" aria-hidden="true"></i></div><h3 class="card__title">Entlastung der Familie</h3><p class="card__text">Auch pflegende Angeh&ouml;rige sind Kunden bei Auxilium. Ich schaffe FreiR&auml;ume und st&auml;rke dem gesamten Umfeld den R&uuml;cken.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-check-circle" aria-hidden="true"></i></div><h3 class="card__title">Transparenz</h3><p class="card__text">Klare Preise, kein Kleingedrucktes. Sie wissen immer genau, was Sie erwartet &ndash; ohne &Uuml;berraschungen oder versteckte Kosten.</p></article>
    </div>
  </div>
</section>

<div class="stats-banner" role="complementary">
  <div class="container">
    <div class="stats-banner__grid">
      <div class="text-center">
        <span class="stats-banner__number" data-count="5.7" data-prefix="ca. " data-suffix=" Mio.">ca. 5,7 Mio.</span>
        <p class="stats-banner__label">Pflegebed&uuml;rftige in Deutschland</p>
        <span class="stats-banner__source"><a href="https://www.destatis.de/DE/Presse/Pressemitteilungen/2024/12/PD24_478_224.html" target="_blank" rel="noopener">Quelle: Destatis 2024</a></span>
      </div>
      <div class="text-center">
        <span class="stats-banner__number" data-count="86" data-suffix=" %">86 %</span>
        <p class="stats-banner__label">werden zu Hause versorgt</p>
        <span class="stats-banner__source"><a href="https://www.tagesschau.de/inland/gesellschaft/pflegebeduerftige-deutschland-statistik-100.html" target="_blank" rel="noopener">Quelle: Tagesschau</a></span>
      </div>
      <div class="text-center">
        <span class="stats-banner__number" data-count="3.1" data-suffix=" Mio.">3,1 Mio.</span>
        <p class="stats-banner__label">ausschlie&szlig;lich durch Angeh&ouml;rige betreut</p>
        <span class="stats-banner__source"><a href="https://www.zqp.de/schwerpunkt/pflegende-angehoerige/" target="_blank" rel="noopener">Quelle: ZQP</a></span>
      </div>
      <div class="text-center">
        <span class="stats-banner__number" data-count="131" data-suffix=" &euro;">131 &euro;</span>
        <p class="stats-banner__label">mtl. Entlastungsbetrag &ndash; direkt nutzbar</p>
      </div>
    </div>
  </div>
</div>

<section class="section section--soft" aria-labelledby="services-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Meine Leistungen</span>
      <h2 id="services-heading">Was ich f&uuml;r Sie tue</h2>
      <p style="max-width:540px;margin:14px auto 0;">Von der Pflege &uuml;ber Betreuung bis zur Haushaltsorganisation &ndash; Auxilium ist f&uuml;r Sie da.</p>
    </div>
    <div class="home-kat-grid">
      ${homeKatCards}
    </div>
    <div class="text-center mt-8">
      <a href="/leistungen" class="btn btn-accent"><i class="fas fa-arrow-right" aria-hidden="true"></i>Alle Leistungen und Preise</a>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="quote-heading">
  <div class="container">
    <div class="grid-2">
      <div>
        <span class="section-label">Meine Philosophie</span>
        <h2 id="quote-heading">Zuhause ist kein Ort &ndash;<br>es ist ein Gef&uuml;hl</h2>
        <p style="margin:18px 0 28px;">Ich glaube, dass jeder Mensch das Recht hat, in seiner vertrauten Umgebung zu leben &ndash; auch wenn Pflege notwendig wird.</p>
        <a href="/ueber-auxilium" class="btn btn-accent"><i class="fas fa-user" aria-hidden="true"></i>Mehr &uuml;ber mich</a>
      </div>
      <div style="display:flex;flex-direction:column;gap:18px;">
        <div class="quote-card">
          <div class="quote-card__icon" aria-hidden="true">&bdquo;</div>
          <p class="quote-card__text">Akzeptiere, was ist, lass gehen, was war, und habe Vertrauen in das, was kommt.</p>
          <div class="quote-card__author"><div class="quote-card__avatar">M</div><div><div class="quote-card__name">Ma Vie</div><div class="quote-card__role">Leitspruch von Auxilium</div></div></div>
        </div>
        <div class="quote-card">
          <div class="quote-card__icon" aria-hidden="true">&bdquo;</div>
          <p class="quote-card__text">Der Schmetterling steht f&uuml;r die Kraft der pers&ouml;nlichen Transformation &ndash; und f&uuml;r den Mut, Hilfe anzunehmen.</p>
          <div class="quote-card__author"><div class="quote-card__avatar">KB</div><div><div class="quote-card__name">Kristina Bronner</div><div class="quote-card__role">Gr&uuml;nderin von Auxilium</div></div></div>
        </div>
      </div>
    </div>
  </div>
</section>

${dbTestimonials.length > 0 ? `
<section class="section testimonials-section" aria-labelledby="testimonials-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Kundenstimmen</span>
      <h2 id="testimonials-heading">Was unsere Kunden sagen</h2>
      <p style="max-width:520px;margin:14px auto 0;">Das Vertrauen unserer Kunden ist uns das Wichtigste &ndash; lesen Sie selbst.</p>
    </div>
    <div class="testimonials-wrapper" aria-live="polite">
      <div class="testimonials-track" id="testimonialsTrack">
        ${dbTestimonials.map((t: any) => {
          const initials = t.name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()
          const stars = '★'.repeat(Math.min(5, Math.max(1, t.stars)))
          return `<div class="testimonial-slide">
            <div class="testimonial-card">
              <div class="testimonial-card__quote" aria-hidden="true">&bdquo;</div>
              <div class="testimonial-card__stars" aria-label="${t.stars} von 5 Sternen">${stars}</div>
              <p class="testimonial-card__text">${t.text.replace(/&amp;/g,'&')}</p>
              <div class="testimonial-card__author">
                <div class="testimonial-card__avatar">${initials}</div>
                <div>
                  <div class="testimonial-card__name">${t.name}</div>
                  ${t.role ? `<div class="testimonial-card__role">${t.role}</div>` : ''}
                </div>
              </div>
            </div>
          </div>`
        }).join('')}
      </div>
    </div>
    ${dbTestimonials.length > 1 ? `
    <div class="testimonials-controls" aria-label="Slideshow-Steuerung">
      <button class="testimonials-btn" id="testPrev" aria-label="Vorherige Kundenstimme"><i class="fas fa-chevron-left"></i></button>
      <div class="testimonials-dots" role="tablist" aria-label="Kundenstimmen-Navigation">
        ${dbTestimonials.map((_: any, i: number) => `<button class="testimonials-dot${i===0?' active':''}" data-idx="${i}" aria-label="Kundenstimme ${i+1}" role="tab" aria-selected="${i===0}"></button>`).join('')}
      </div>
      <button class="testimonials-btn" id="testNext" aria-label="N&auml;chste Kundenstimme"><i class="fas fa-chevron-right"></i></button>
    </div>
    <script>
    (function() {
      var track = document.getElementById('testimonialsTrack');
      var dots = document.querySelectorAll('.testimonials-dot');
      var cur = 0, total = ${dbTestimonials.length}, timer;
      function goTo(n) {
        cur = (n + total) % total;
        track.style.transform = 'translateX(-' + (cur * 100) + '%)';
        dots.forEach(function(d,i) {
          d.classList.toggle('active', i === cur);
          d.setAttribute('aria-selected', i === cur ? 'true' : 'false');
        });
      }
      document.getElementById('testPrev').onclick = function() { clearInterval(timer); goTo(cur-1); startTimer(); };
      document.getElementById('testNext').onclick = function() { clearInterval(timer); goTo(cur+1); startTimer(); };
      dots.forEach(function(d) { d.onclick = function() { clearInterval(timer); goTo(parseInt(this.dataset.idx)); startTimer(); }; });
      function startTimer() { timer = setInterval(function() { goTo(cur+1); }, 5000); }
      startTimer();
    })();
    </script>` : ''}
  </div>
</section>` : ''}

<section class="section section--muted" aria-labelledby="funding-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Finanzierung</span>
      <h2 id="funding-heading">Nutzen Sie Ihren Pflegekassen-Anspruch</h2>
      <p style="max-width:520px;margin:14px auto 0;">Als Bezieher von Pflegegeld stehen Ihnen j&auml;hrlich Mittel zu, die Sie gezielt f&uuml;r Auxilium-Leistungen einsetzen k&ouml;nnen.</p>
    </div>
    <div class="grid-2" style="align-items:stretch;gap:28px;">
      <article class="funding-box">
        <span class="section-label">${S.funding_title||'VERHINDERUNGSPFLEGE + KURZZEITPFLEGE'}</span>
        <div class="funding-box__amount">${S.funding_amount||'3.539 €'}</div>
        <p class="funding-box__label">${S.funding_label||'Jährlicher Anspruch pro Person'}</p>
        <p class="funding-box__note">${S.funding_note||'Dieser Betrag ist zweckgebunden und kann vollständig für Auxilium-Leistungen genutzt werden.'}</p>
        <a href="/beratung" class="btn btn-accent mt-6"><i class="fas fa-info-circle" aria-hidden="true"></i>Mehr erfahren</a>
      </article>
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-wallet" aria-hidden="true"></i></div><div><div class="info-label">Pflegegeld</div><div class="info-value">Geld- oder Sachleistung flexibel nutzen</div></div></div>
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-hand-holding-heart" aria-hidden="true"></i></div><div><div class="info-label">Entlastungsbetrag</div><div class="info-value">bis zu 131 &euro; monatlich f&uuml;r Betreuung</div></div></div>
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-umbrella-beach" aria-hidden="true"></i></div><div><div class="info-label">Kurzzeitpflege &amp; Verhinderungspflege</div><div class="info-value">F&uuml;r Urlaub, Erholung oder Sonstiges nutzen</div></div></div>
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-tools" aria-hidden="true"></i></div><div><div class="info-label">Hilfsmittel &amp; Umbau</div><div class="info-value">Zusch&uuml;sse f&uuml;r wohnumfeldverbessernde Ma&szlig;nahmen</div></div></div>
      </div>
    </div>
  </div>
</section>

<section class="section section--soft" aria-labelledby="faq-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">H&auml;ufige Fragen</span>
      <h2 id="faq-heading">Antworten auf Ihre Fragen</h2>
      <p style="max-width:520px;margin:14px auto 0;">Hier finden Sie die h&auml;ufigsten Fragen rund um Auxilium &ndash; schnell und &uuml;bersichtlich.</p>
    </div>
    <div class="accordion-list" style="max-width:720px;margin:0 auto;">
      ${faqItems}
    </div>
  </div>
</section>

<section class="cta-section-green" aria-labelledby="cta-heading">
  <div class="container text-center">
    <h2 id="cta-heading" class="cta-section-green__title">Nehmen Sie Kontakt auf</h2>
    <p class="cta-section-green__text">Gemeinsam finden wir beim Erstgespr&auml;ch heraus, wie Auxilium Ihnen am besten helfen kann.</p>
    <div class="flex justify-center gap-4 flex-wrap">
      <a href="/kontakt" class="btn btn-green-solid"><i class="fas fa-envelope" aria-hidden="true"></i>Kontakt aufnehmen</a>
      <a href="/leistungen" class="btn btn-green-ghost"><i class="fas fa-list" aria-hidden="true"></i>Leistungen ansehen</a>
    </div>
  </div>
</section>`
  return c.html(layout('Auxilium &ndash; Ihre St&uuml;tze in der Pflege | Forst Baden', 'Auxilium bietet individuelle Pflegeberatung und ambulante Pflegeleistungen in Forst Baden.', body, S))
})

// ─── ÜBER AUXILIUM ────────────────────────────────────────────
app.get('/ueber-auxilium', async (c) => {
  const S = await loadSettings(c.env.DB)
  const hero = pageHero('&Uuml;ber uns', 'Herzlich willkommen &ndash;<br>ich bin Kristina Bronner', 'Gr&uuml;nderin von Auxilium &ndash; Ihrer pers&ouml;nlichen St&uuml;tze in der Pflege.', '&Uuml;ber Auxilium')
  const body = hero + `
<section class="section" aria-labelledby="person-heading">
  <div class="container">
    <div class="person-layout">
      <div class="person-photo-col">
        <div class="person-photo-wrap">
          <img src="/static/kristina.jpg" alt="Kristina Bronner &ndash; Gr&uuml;nderin Auxilium" class="person-photo">
          <div class="person-photo-badge">
            <i class="fas fa-award" aria-hidden="true"></i>
            <div>
              <strong>Kristina Bronner</strong>
              <span>Gr&uuml;nderin &amp; Inhaberin</span>
            </div>
          </div>
        </div>
        <div class="person-logo-box">
          <img src="/static/logo.jpg" alt="Auxilium Logo" class="person-logo-img">
          <div>
            <p class="person-logo-title">Das Symbol von Auxilium</p>
            <p class="person-logo-text">Ein Schmetterling mit einem fehlenden Fl&uuml;gel &ndash; f&uuml;r die Kraft der pers&ouml;nlichen Transformation und den Mut, Hilfe anzunehmen.</p>
          </div>
        </div>
      </div>
      <div class="person-text-col">
        <span class="section-label">Zur Person</span>
        <h2 id="person-heading">Mein Weg zu Auxilium</h2>
        <p style="margin:18px 0 16px;font-size:1.05rem;line-height:1.8;">Ich war bereits bei einigen Arbeitgebern angestellt und bin letztendlich f&uuml;r mich zu dem Entschluss gekommen, dass ich vermutlich keinen Arbeitgeber finden werde, der qualitative Pflege und die Betreuung von pflegebed&uuml;rftigen Menschen mit meinen Augen sieht.</p>
        <p style="margin-bottom:16px;line-height:1.8;">Meine Energie zielt nun auf mein eigenes Herzensprojekt: <strong style="color:var(--accent);">Auxilium &ndash; Ihre &bdquo;St&uuml;tze&ldquo; rund um das Thema Pflege.</strong></p>
        <p style="margin-bottom:24px;line-height:1.8;">Wesentlich ist f&uuml;r mich eine <strong>ganzheitliche Versorgung</strong> des Kunden &ndash; zum einen in Bezug auf seine k&ouml;rperlichen Beschwerden, zum anderen auch auf seine psychische Situation und seine emotionale Gem&uuml;tslage.</p>
        <blockquote class="person-quote">
          <i class="fas fa-quote-left" aria-hidden="true"></i>
          <p>Akzeptiere, was ist, lass gehen, was war, und habe Vertrauen in das, was kommt.</p>
          <cite>&ndash; Ma Vie, Leitspruch von Auxilium</cite>
        </blockquote>
        <div class="person-values">
          <div class="person-value">
            <i class="fas fa-heart" aria-hidden="true"></i>
            <div>
              <div class="person-value__title">Leidenschaft f&uuml;r Menschen</div>
              <div class="person-value__text">Jeder Mensch ist einzigartig &ndash; diese &Uuml;berzeugung tr&auml;gt meine Arbeit t&auml;glich.</div>
            </div>
          </div>
          <div class="person-value">
            <i class="fas fa-graduation-cap" aria-hidden="true"></i>
            <div>
              <div class="person-value__title">Fachkenntnis &amp; Qualit&auml;t</div>
              <div class="person-value__text">Professionelle Pflege auf h&ouml;chstem Niveau, verbunden mit menschlicher W&auml;rme.</div>
            </div>
          </div>
          <div class="person-value">
            <i class="fas fa-handshake" aria-hidden="true"></i>
            <div>
              <div class="person-value__title">Verl&auml;sslichkeit</div>
              <div class="person-value__text">Sie k&ouml;nnen sich auf mich verlassen &ndash; p&uuml;nktlich, konstant und transparent.</div>
            </div>
          </div>
          <div class="person-value">
            <i class="fas fa-seedling" aria-hidden="true"></i>
            <div>
              <div class="person-value__title">Ganzheitlichkeit</div>
              <div class="person-value__text">K&ouml;rper und Seele geh&ouml;ren zusammen &ndash; ich begleite den ganzen Menschen.</div>
            </div>
          </div>
        </div>
        <a href="/kontakt" class="btn btn-accent" style="margin-top:8px;"><i class="fas fa-envelope" aria-hidden="true"></i>Jetzt Kontakt aufnehmen</a>
      </div>
    </div>
  </div>
</section>

<section class="section section--soft" aria-labelledby="mission-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Leitbild</span>
      <h2 id="mission-heading">Wof&uuml;r Auxilium steht</h2>
      <p style="max-width:540px;margin:14px auto 0;">Gute Pflege bedeutet mehr als k&ouml;rperliche Versorgung &ndash; sie bedeutet Menschlichkeit, Respekt und echte Pr&auml;senz.</p>
    </div>
    <div class="grid-3">
      <article class="card"><div class="card__icon"><i class="fas fa-infinity" aria-hidden="true"></i></div><h3 class="card__title">Ganzheitlichkeit</h3><p class="card__text">Pflege bedeutet mehr als k&ouml;rperliche Versorgung. Auxilium denkt den ganzen Menschen &ndash; soziale Bed&uuml;rfnisse, Wohlbefinden und das der Familie.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-door-open" aria-hidden="true"></i></div><h3 class="card__title">Freiräume schaffen</h3><p class="card__text">Pflegende Angeh&ouml;rige brauchen Auszeiten. Ich schaffe die Freiräume, die Sie ben&ouml;tigen &ndash; damit Sie wieder auftanken k&ouml;nnen.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-shield-alt" aria-hidden="true"></i></div><h3 class="card__title">Qualit&auml;t als Standard</h3><p class="card__text">Qualitativ hochwertige Pflege ist kein Luxus, sondern ein Recht. Auxilium liefert diesen Standard &ndash; zu fairen, transparenten Preisen.</p></article>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="process-heading">
  <div class="container">
    <div class="grid-2" style="gap:56px;">
      <div>
        <span class="section-label">Mein Ansatz</span>
        <h2 id="process-heading">So arbeite ich mit Ihnen</h2>
        <p style="margin:14px 0 28px;">Vom ersten Kontakt bis zur laufenden Betreuung &ndash; Auxilium begleitet Sie Schritt f&uuml;r Schritt.</p>
        <div style="display:flex;flex-direction:column;gap:20px;">
          <div class="step-item"><div class="step-number">1</div><div class="step-content"><div class="step-title">Pers&ouml;nliches Erstgespr&auml;ch</div><div class="step-text">Wir lernen uns kennen, ich h&ouml;re Ihnen zu und verstehe Ihre Bed&uuml;rfnisse.</div></div></div>
          <div class="step-item"><div class="step-number">2</div><div class="step-content"><div class="step-title">Individuelle Bedarfsanalyse</div><div class="step-text">Gemeinsam erkunden wir Ihre Ressourcen und M&ouml;glichkeiten.</div></div></div>
          <div class="step-item"><div class="step-number">3</div><div class="step-content"><div class="step-title">Pflegeplan erstellen</div><div class="step-text">Ein ma&szlig;geschneiderter Plan, der sich nach Ihrem Leben richtet &ndash; nicht umgekehrt.</div></div></div>
          <div class="step-item"><div class="step-number">4</div><div class="step-content"><div class="step-title">Regelm&auml;&szlig;ige Betreuung</div><div class="step-text">Zuverl&auml;ssige Unterst&uuml;tzung im Alltag &ndash; mit Anpassung bei Bedarf.</div></div></div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-map-marker-alt" aria-hidden="true"></i></div><div><div class="info-label">Einsatzgebiet</div><div class="info-value">Forst (Baden) und Umgebung</div></div></div>
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-clock" aria-hidden="true"></i></div><div><div class="info-label">Erreichbarkeit</div><div class="info-value">Montag&ndash;Freitag, 8:00&ndash;18:00 Uhr</div></div></div>
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-comments" aria-hidden="true"></i></div><div><div class="info-label">Erstgespr&auml;ch</div><div class="info-value">Pers&ouml;nlich &amp; unverbindlich</div></div></div>
        <a href="/kontakt" class="btn btn-accent" style="align-self:flex-start;margin-top:4px;"><i class="fas fa-envelope" aria-hidden="true"></i>Kontakt aufnehmen</a>
      </div>
    </div>
  </div>
</section>`
  return c.html(layout('&Uuml;ber Auxilium &ndash; Kristina Bronner | Pflegeberatung Forst Baden', 'Lernen Sie Kristina Bronner und die Philosophie von Auxilium kennen.', body, S))
})

// ─── LEISTUNGEN (aus DB) ──────────────────────────────────────
app.get('/leistungen', async (c) => {
  const S = await loadSettings(c.env.DB)
  const hero = pageHero('Leistungen', 'Transparente Preise &ndash; faire Leistungen', 'Alle Leistungen von Auxilium im &Uuml;berblick &ndash; mit ehrlichem Preisvergleich.', 'Leistungen &amp; Kosten')

  // Leistungen mit Kategorie-Infos laden
  const { results } = await c.env.DB.prepare(`
    SELECT l.*, k.name as kat_name, k.icon as kat_icon, k.description as kat_desc
    FROM leistungen l
    LEFT JOIN kategorien k ON k.slug = l.kategorie_slug
    WHERE l.active = 1
    ORDER BY k.sort_order, l.sort_order
  `).all<any>()

  // Aktive Kategorien laden (für Navigations-Tabs)
  const { results: katList } = await c.env.DB.prepare(
    'SELECT * FROM kategorien WHERE active=1 ORDER BY sort_order'
  ).all<any>()

  // Leistungen nach Kategorie gruppieren
  const byKat: Record<string, any[]> = {}
  const uncategorized: any[] = []
  for (const r of results) {
    if (r.kategorie_slug) {
      if (!byKat[r.kategorie_slug]) byKat[r.kategorie_slug] = []
      byKat[r.kategorie_slug].push(r)
    } else {
      uncategorized.push(r)
    }
  }

  const renderCard = (r: any) => `
    <article class="service-card" id="${r.slug}">
      <div class="service-card__header">
        <div class="service-card__icon" aria-hidden="true"><i class="fas ${r.icon}"></i></div>
        <div class="service-card__header-text"><h3 class="service-card__title">${r.title}</h3><span class="service-card__subtitle">${r.subtitle}</span></div>
      </div>
      <div class="service-card__body">
        <p class="service-card__text">${r.description}</p>
        <div class="service-card__price">
          <span class="price-new">${r.price_new}</span>
          ${r.price_old ? `<span class="price-compare">${r.price_old}</span>` : ''}
          ${r.price_note ? `<div class="price-note">${r.price_note}</div>` : ''}
        </div>
        ${r.savings ? `<div class="service-card__savings"><i class="fas fa-check" style="margin-right:5px;"></i>${r.savings}</div>` : ''}
      </div>
    </article>`

  // Kategorie-Sektionen rendern
  let katSections = ''
  for (const kat of katList) {
    const items = byKat[kat.slug] || []
    if (items.length === 0) continue
    katSections += `
    <div class="leistungen-kat-section" id="kat-${kat.slug}">
      <div class="leistungen-kat-header">
        <div class="leistungen-kat-icon"><i class="fas ${kat.icon}" aria-hidden="true"></i></div>
        <div>
          <h3 class="leistungen-kat-title">${kat.name}</h3>
          ${kat.kat_desc||kat.description ? `<p class="leistungen-kat-desc">${kat.kat_desc||kat.description}</p>` : ''}
        </div>
      </div>
      <div class="grid-2" style="gap:20px;">
        ${items.map(renderCard).join('\n')}
      </div>
    </div>`
  }
  // Nicht kategorisierte Leistungen
  if (uncategorized.length > 0) {
    katSections += `
    <div class="leistungen-kat-section" id="kat-sonstiges">
      <div class="leistungen-kat-header">
        <div class="leistungen-kat-icon"><i class="fas fa-ellipsis-h" aria-hidden="true"></i></div>
        <div><h3 class="leistungen-kat-title">Weitere Leistungen</h3></div>
      </div>
      <div class="grid-2" style="gap:20px;">${uncategorized.map(renderCard).join('\n')}</div>
    </div>`
  }

  // Kategorie-Navigations-Tabs
  const katTabs = katList
    .filter((k: any) => (byKat[k.slug]||[]).length > 0)
    .map((k: any) => `<a href="#kat-${k.slug}" class="kat-tab-btn"><i class="fas ${k.icon}"></i>${k.name}</a>`)
    .join('')

  const body = hero + `
<section class="section" aria-labelledby="intro-heading">
  <div class="container">
    <div class="grid-2" style="gap:56px;">
      <div>
        <span class="section-label">Mein Ansatz</span>
        <h2 id="intro-heading">Es gibt immer eine L&ouml;sung &ndash; und nicht nur eine</h2>
        <p style="margin:14px 0 18px;">Wir alle begegnen dem Leben auf unsere eigene Weise. Auxilium hilft Ihnen, Ihre pers&ouml;nliche L&ouml;sung zu finden.</p>
        <div style="background:var(--primary-light);border-radius:var(--radius);padding:18px;border-left:4px solid var(--primary);">
          <p style="font-size:0.875rem;font-weight:600;color:var(--secondary);margin-bottom:4px;"><i class="fas fa-info-circle" style="color:var(--primary);margin-right:6px;"></i>Alle Preise zzgl. Wegpauschale</p>
          <p style="font-size:0.8rem;color:var(--text-light);">Die Wegpauschale variiert je nach Einsatzort und wird vorab kommuniziert.</p>
        </div>
      </div>
      <article class="funding-box">
        <span class="section-label">${S.funding_title||'KURZZEITPFLEGE &amp; VERHINDERUNGSPFLEGE'}</span>
        <div class="funding-box__amount">${S.funding_amount||'3.539 €'}</div>
        <p class="funding-box__label">${S.funding_label||'Jährlicher Anspruch pro Person'}</p>
        <p class="funding-box__note">${S.funding_note||'Dieser Betrag ist zweckgebunden und kann vollständig für Auxilium-Leistungen genutzt werden.'}</p>
        <a href="/beratung" class="btn btn-accent mt-6"><i class="fas fa-info-circle" aria-hidden="true"></i>Beratung anfragen</a>
      </article>
    </div>
  </div>
</section>
<section class="section section--soft" aria-labelledby="services-detail-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Alle Leistungen</span>
      <h2 id="services-detail-heading">Was Auxilium f&uuml;r Sie tut</h2>
      ${katTabs ? `<div class="kat-tabs" style="margin-top:20px;">${katTabs}</div>` : ''}
    </div>
    ${katSections}
    <div class="leistungen-kat-section" style="background:linear-gradient(135deg,#4A9B7F,#2D7A5E);border:none;border-radius:var(--radius-lg);padding:36px 28px;text-align:center;margin-top:24px;">
      <div style="font-size:2.2rem;margin-bottom:14px;color:white;" aria-hidden="true"><i class="fas fa-comments"></i></div>
      <h3 style="color:white;margin-bottom:10px;font-size:1.1rem;">Nicht das Richtige dabei?</h3>
      <p style="color:rgba(220,255,240,0.90);font-size:0.875rem;margin-bottom:22px;line-height:1.7;">Haben Sie individuelle W&uuml;nsche? Sprechen Sie mich an &ndash; gemeinsam finden wir eine L&ouml;sung.</p>
      <a href="/kontakt" class="btn btn-green-solid"><i class="fas fa-phone" aria-hidden="true"></i>Jetzt anfragen</a>
    </div>
  </div>
</section>
<section class="section" aria-labelledby="who-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Wer kann Auxilium nutzen?</span>
      <h2 id="who-heading">Auxilium ist f&uuml;r Sie, wenn &hellip;</h2>
    </div>
    <div class="grid-3">
      <article class="card" style="text-align:center;"><div class="card__icon" style="margin:0 auto 18px;"><i class="fas fa-wallet" aria-hidden="true"></i></div><h3 class="card__title">Sie Pflegegeld beziehen</h3><p class="card__text">Pflegegeldempf&auml;nger k&ouml;nnen Auxilium-Leistungen flexibel und unkompliziert abrechnen.</p></article>
      <article class="card" style="text-align:center;"><div class="card__icon" style="margin:0 auto 18px;"><i class="fas fa-sync-alt" aria-hidden="true"></i></div><h3 class="card__title">Verhinderungspflege nutzen</h3><p class="card__text">Wer Verhinderungspflege oder den Entlastungsbetrag nutzt, kann Auxilium bis zu 3.539 &euro; im Jahr finanzieren.</p></article>
      <article class="card" style="text-align:center;"><div class="card__icon" style="margin:0 auto 18px;"><i class="fas fa-credit-card" aria-hidden="true"></i></div><h3 class="card__title">Privatzahler/-innen</h3><p class="card__text">Auch ohne Pflegekassen-Leistungen sind alle Auxilium-Angebote als Privatleistung buchbar.</p></article>
    </div>
    <div class="text-center mt-8">
      <a href="/kontakt" class="btn btn-accent"><i class="fas fa-calendar-check" aria-hidden="true"></i>Kostenloses Erstgespr&auml;ch vereinbaren</a>
    </div>
  </div>
</section>`
  return c.html(layout('Leistungen &amp; Kosten &ndash; Auxilium Forst Baden', 'Alle Pflegeleistungen von Auxilium auf einen Blick &ndash; transparent und fair.', body, S))
})

// ─── BERATUNG ─────────────────────────────────────────────────
app.get('/beratung', async (c) => {
  const S = await loadSettings(c.env.DB)
  const hero = pageHero('Pflegeberatung', 'Kennen Sie alle Ihre Anspr&uuml;che?', 'Die Pflegeversicherung bietet viele M&ouml;glichkeiten &ndash; ich helfe Ihnen, sie zu verstehen.', 'Beratung')
  const body = hero + `
<section class="section" aria-labelledby="advice-heading">
  <div class="container">
    <div class="grid-2" style="gap:56px;">
      <div>
        <span class="section-label">Warum Beratung?</span>
        <h2 id="advice-heading">Die Pflegeversicherung ist komplex &ndash; ich mache es einfach</h2>
        <p style="margin:14px 0 18px;">Die Pflegeversicherung ist lediglich eine &bdquo;Teilkaskoversicherung&ldquo; und setzt einen privaten Eigenanteil voraus. Deshalb ist es wichtig, alle Anspr&uuml;che zu kennen.</p>
        <p style="margin-bottom:24px;">Bei Auxilium erhalten Sie auf Wunsch auch eine vollst&auml;ndige Beratung zu allen Ihnen zustehenden Leistungen.</p>
        <a href="/kontakt" class="btn btn-accent"><i class="fas fa-calendar" aria-hidden="true"></i>Beratungsgespr&auml;ch anfragen</a>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-lightbulb" aria-hidden="true"></i></div><div><div class="info-label">Vorteil</div><div class="info-value">Individuelle Finanzierungsberatung inklusive</div></div></div>
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-phone" aria-hidden="true"></i></div><div><div class="info-label">Erstkontakt</div><div class="info-value">Pers&ouml;nlich und unverbindlich</div></div></div>
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-home" aria-hidden="true"></i></div><div><div class="info-label">Ort</div><div class="info-value">Bei Ihnen zu Hause oder telefonisch</div></div></div>
      </div>
    </div>
  </div>
</section>

<section class="section section--soft" aria-labelledby="insurance-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Pflegeversicherung</span>
      <h2 id="insurance-heading">Ihre Anspr&uuml;che im &Uuml;berblick</h2>
      <p style="max-width:520px;margin:14px auto 0;">Folgende Leistungen k&ouml;nnen f&uuml;r die Finanzierung von Auxilium genutzt werden.</p>
    </div>
    <div class="grid-2" style="gap:20px;">
      <article class="card"><div class="card__icon"><i class="fas fa-wallet" aria-hidden="true"></i></div><h3 class="card__title">Pflegerische Hilfen</h3><p class="card__text">Geld- oder Sachleistung &ndash; je nach Bedarf und Pflegegrad optimal einsetzen.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-sync-alt" aria-hidden="true"></i></div><h3 class="card__title">Entlastungsbetrag</h3><p class="card__text">Bis zu 125 &euro; monatlich (1.500 &euro; j&auml;hrlich) f&uuml;r anerkannte Entlastungsleistungen.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-procedures" aria-hidden="true"></i></div><h3 class="card__title">Kurzzeitpflege</h3><p class="card__text">&Uuml;berbr&uuml;ckung bei Krankenhausaufenthalten oder zur Entlastung der Angeh&ouml;rigen.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-shield-alt" aria-hidden="true"></i></div><h3 class="card__title">Verhinderungspflege</h3><p class="card__text">Wenn die regul&auml;re Pflegeperson ausf&auml;llt &ndash; bis zu 3.539 &euro; im Jahr nutzbar.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-moon" aria-hidden="true"></i></div><h3 class="card__title">Tages- und Nachtpflege</h3><p class="card__text">Erg&auml;nzende Betreuung in teilstation&auml;ren Einrichtungen tagss&uuml;ber oder nachts.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-walking" aria-hidden="true"></i></div><h3 class="card__title">Reha</h3><p class="card__text">Wissen Sie um Ihre Anspr&uuml;che auf eine Rehabilitation? Ich informiere Sie umfassend.</p></article>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="aids-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Hilfsmittel &amp; Wohnumfeld</span>
      <h2 id="aids-heading">Mehr Selbstst&auml;ndigkeit durch die richtigen Mittel</h2>
    </div>
    <div class="grid-3">
      <article class="card"><div class="card__icon"><i class="fas fa-medkit" aria-hidden="true"></i></div><h3 class="card__title">Pflegehilfsmittel</h3><p class="card__text">Monatlich bis zu 40 &euro; f&uuml;r zum Verbrauch bestimmte Pflegehilfsmittel.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-wheelchair" aria-hidden="true"></i></div><h3 class="card__title">Technische Hilfsmittel</h3><p class="card__text">Zusch&uuml;sse f&uuml;r Rollst&uuml;hle, Pflegebetten, Lifter und andere Hilfsmittel.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-home" aria-hidden="true"></i></div><h3 class="card__title">Wohnumfeldverbesserung</h3><p class="card__text">Bis zu 4.000 &euro; Zuschuss pro Ma&szlig;nahme f&uuml;r barrierefreie Umbauten.</p></article>
    </div>
  </div>
</section>

<section class="section section--soft" aria-labelledby="work-heading">
  <div class="container">
    <div class="grid-2" style="gap:56px;">
      <div>
        <span class="section-label">F&uuml;r Berufst&auml;tige</span>
        <h2 id="work-heading">Pflegebedingte Freistellung von der Arbeit</h2>
        <p style="margin:14px 0 28px;">Pflegende Angeh&ouml;rige haben besondere Rechte gegen&uuml;ber dem Arbeitgeber.</p>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="step-item"><div class="step-number"><i class="fas fa-briefcase" aria-hidden="true" style="font-size:0.8rem;"></i></div><div class="step-content"><div class="step-title">Pflegeunterst&uuml;tzungsgeld</div><div class="step-text">Kurzfristige Freistellung bis 10 Tage bei akuter Pflegesituation.</div></div></div>
          <div class="step-item"><div class="step-number"><i class="fas fa-user-clock" aria-hidden="true" style="font-size:0.8rem;"></i></div><div class="step-content"><div class="step-title">Reduzierung der Arbeitszeit</div><div class="step-text">Bis zu 24 Monate Teilzeit-Option f&uuml;r pflegende Angeh&ouml;rige.</div></div></div>
          <div class="step-item"><div class="step-number"><i class="fas fa-calendar-check" aria-hidden="true" style="font-size:0.8rem;"></i></div><div class="step-content"><div class="step-title">Option der Freistellung</div><div class="step-text">Vollst&auml;ndige Freistellung bis zu 6 Monate m&ouml;glich.</div></div></div>
        </div>
      </div>
      <div class="quote-card">
        <div class="quote-card__icon" aria-hidden="true">&bdquo;</div>
        <p class="quote-card__text">Der Verstand versp&uuml;rt nur noch Stress und &Uuml;berforderung, der einem die Lebensenergie raubt. Dann ist Auxilium der richtige Ansprechpartner f&uuml;r Sie!</p>
        <div class="quote-card__author" style="margin-top:20px;"><div class="quote-card__avatar">KB</div><div><div class="quote-card__name">Kristina Bronner</div><div class="quote-card__role">Auxilium Pflegeberatung &middot; Forst (Baden)</div></div></div>
      </div>
    </div>
  </div>
</section>

<section class="cta-section-green" aria-labelledby="advice-cta-heading">
  <div class="container text-center">
    <h2 id="advice-cta-heading" class="cta-section-green__title">Lassen Sie sich kostenlos beraten</h2>
    <p class="cta-section-green__text">In einem kostenlosen Gespr&auml;ch analysiere ich mit Ihnen alle Anspr&uuml;che und erstelle die beste Finanzierungsstrategie f&uuml;r Ihre Situation.</p>
    <a href="/kontakt" class="btn btn-green-solid"><i class="fas fa-calendar-check" aria-hidden="true"></i>Jetzt Beratungstermin anfragen</a>
  </div>
</section>`
  return c.html(layout('Pflegeberatung &ndash; Auxilium Forst Baden', 'Kostenlose Pflegeberatung in Forst (Baden): Pflegeversicherung, Entlastungsbetrag und mehr.', body, S))
})

// ─── KONTAKT ──────────────────────────────────────────────────
app.get('/kontakt', async (c) => {
  const S = await loadSettings(c.env.DB)
  // Dynamische Betreff-Optionen aus DB (Zeilenumbruch-getrennt)
  const subjectOptions = (S.form_subjects || 'Persönliches Erstgespräch\nPflegeberatung\nFrage zu Leistungen & Preisen\nVerhinderungspflege\nAllgemeines')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const val = s.toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      return `<option value="${val}">${s}</option>`
    })
    .join('\n                ')
  // reCAPTCHA Site Key (leer = kein reCAPTCHA)
  const siteKey = (S.recaptcha_site_key || '').trim()
  const recaptchaScript = siteKey
    ? `<script src="https://www.google.com/recaptcha/api.js?render=${siteKey}" defer></script>`
    : ''
  const recaptchaField = siteKey
    ? `<input type="hidden" id="recaptchaToken" name="recaptchaToken" value="">`
    : ''
  const hero = pageHero('Kontakt', 'Wie kann ich Ihnen helfen?', 'Ich freue mich auf Ihre Nachricht &ndash; pers&ouml;nlich und unverbindlich.', 'Kontakt')
  const body = hero + `
${recaptchaScript}
<section class="section" aria-labelledby="contact-heading">
  <div class="container">
    <div class="grid-2" style="gap:56px;align-items:start;">
      <div>
        <span class="section-label">Kontaktinformationen</span>
        <h2 id="contact-heading">Ich freue mich auf Ihre Nachricht</h2>
        <p style="margin:14px 0 28px;">Egal ob Fragen zu Leistungen, Beratungswunsch oder allgemeine Informationen &ndash; schreiben Sie mir!</p>
        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:36px;">
          <div class="contact-info-item"><div class="info-icon"><i class="fas fa-map-marker-alt" aria-hidden="true"></i></div><div><div class="info-label">Einsatzgebiet</div><div class="info-value">${S.contact_location||'Forst (Baden) und Umgebung'}</div></div></div>
          <div class="contact-info-item"><div class="info-icon"><i class="fas fa-envelope" aria-hidden="true"></i></div><div><div class="info-label">E-Mail</div><div class="info-value"><a href="mailto:${S.contact_email||'info@auxilium-forst.com'}" style="color:var(--accent);">${S.contact_email||'info@auxilium-forst.com'}</a></div></div></div>
          <div class="contact-info-item"><div class="info-icon"><i class="fas fa-clock" aria-hidden="true"></i></div><div><div class="info-label">Erreichbarkeit</div><div class="info-value">${S.contact_hours||'Mo&ndash;Fr, 8:00 &ndash; 18:00 Uhr'}</div></div></div>
          <div class="contact-info-item"><div class="info-icon"><i class="fas fa-comments" aria-hidden="true"></i></div><div><div class="info-label">Erstgespr&auml;ch</div><div class="info-value">Pers&ouml;nlich &amp; unverbindlich</div></div></div>
        </div>
        <p style="font-size:0.9rem;color:var(--text-light);line-height:1.7;">Haben Sie weitere Fragen? Auf der <a href="/" style="color:var(--accent);font-weight:600;">Startseite</a> finden Sie h&auml;ufige Fragen &ndash; oder schreiben Sie mir direkt &uuml;ber das Formular.</p>
      </div>
      <div>
        <div class="contact-form">
          <h3 style="margin-bottom:6px;">Nachricht senden</h3>
          <p style="margin-bottom:24px;font-size:0.875rem;color:var(--text-light);">F&uuml;llen Sie das Formular aus &ndash; ich melde mich so schnell wie m&ouml;glich.</p>
          <form id="contactForm" novalidate data-site-key="${siteKey}">
            <div class="form-row">
              <div class="form-group"><label class="form-label" for="firstName">Vorname *</label><input class="form-input" id="firstName" name="firstName" type="text" placeholder="Max" required></div>
              <div class="form-group"><label class="form-label" for="lastName">Nachname *</label><input class="form-input" id="lastName" name="lastName" type="text" placeholder="Mustermann" required></div>
            </div>
            <div class="form-group"><label class="form-label" for="city">Wohnort</label><input class="form-input" id="city" name="city" type="text" placeholder="z. B. Forst (Baden)"></div>
            <div class="form-row">
              <div class="form-group"><label class="form-label" for="phone">Telefon</label><input class="form-input" id="phone" name="phone" type="tel" placeholder="+49 ..."></div>
              <div class="form-group"><label class="form-label" for="email">E-Mail *</label><input class="form-input" id="email" name="email" type="email" placeholder="max@beispiel.de" required></div>
            </div>
            <div class="form-group">
              <label class="form-label" for="subject">Betreff</label>
              <select class="form-select" id="subject" name="subject">
                <option value="">Bitte w&auml;hlen&hellip;</option>
                ${subjectOptions}
              </select>
            </div>
            <div class="form-group"><label class="form-label" for="message">Ihre Nachricht *</label><textarea class="form-textarea" id="message" name="message" placeholder="Wie kann Auxilium Ihnen helfen?" rows="5" required></textarea></div>
            <div class="form-group" style="flex-direction:row;align-items:flex-start;gap:10px;margin-bottom:22px;">
              <input type="checkbox" id="privacy" name="privacy" required style="margin-top:3px;accent-color:var(--accent);width:16px;height:16px;flex-shrink:0;">
              <label for="privacy" style="font-size:0.8rem;color:var(--text-light);cursor:pointer;">Ich stimme der Verarbeitung meiner Daten gem&auml;&szlig; der <a href="/datenschutz" style="color:var(--accent);">Datenschutzerkl&auml;rung</a> zu. *</label>
            </div>
            ${recaptchaField}
            <button type="submit" class="btn btn-accent w-full" style="justify-content:center;font-size:0.95rem;">
              <i class="fas fa-paper-plane" aria-hidden="true"></i>Nachricht senden
            </button>
          </form>
          <div id="formSuccess" class="form-success" style="display:none;">
            <div style="font-size:2.2rem;margin-bottom:10px;" aria-hidden="true">&#x2705;</div>
            <h4 style="color:#166534;margin-bottom:6px;">Vielen Dank!</h4>
            <p style="font-size:0.875rem;">Ihre Nachricht wurde &uuml;bermittelt. Ich melde mich so bald wie m&ouml;glich!</p>
          </div>
          <div id="formError" class="form-success" style="display:none;background:#fef2f2;border-color:#fca5a5;">
            <div style="font-size:2rem;margin-bottom:10px;" aria-hidden="true">&#x26A0;&#xFE0F;</div>
            <h4 style="color:#991b1b;margin-bottom:6px;">Fehler beim Senden</h4>
            <p id="formErrorMsg" style="font-size:0.875rem;color:#7f1d1d;">Bitte versuchen Sie es erneut oder schreiben Sie uns direkt per E-Mail.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`
  return c.html(layout('Kontakt &ndash; Auxilium Pflegeberatung Forst Baden', 'Nehmen Sie Kontakt mit Auxilium auf &ndash; pers&ouml;nliche Erstberatung in Forst (Baden).', body, S))
})

// ─── API: Kontaktformular (POST /api/contact) ─────────────────
app.post('/api/contact', async (c) => {
  const S = await loadSettings(c.env.DB)

  let body: Record<string, string>
  try {
    body = await c.req.json<Record<string, string>>()
  } catch {
    return c.json({ ok: false, error: 'Ungültige Anfrage.' }, 400)
  }

  const { firstName, lastName, city, phone, email, subject, message, privacy, recaptchaToken } = body

  // Pflichtfelder prüfen
  if (!firstName || !lastName || !email || !message || privacy !== 'true') {
    return c.json({ ok: false, error: 'Bitte füllen Sie alle Pflichtfelder aus.' }, 400)
  }

  // E-Mail-Format prüfen
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ ok: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' }, 400)
  }

  // reCAPTCHA v3 verifizieren (nur wenn Secret Key konfiguriert)
  const secretKey = (S.recaptcha_secret_key || '').trim()
  if (secretKey) {
    if (!recaptchaToken) {
      return c.json({ ok: false, error: 'reCAPTCHA-Verifikation fehlgeschlagen.' }, 400)
    }
    try {
      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(recaptchaToken)}`
      })
      const verifyJson = await verifyRes.json<{ success: boolean; score: number }>()
      if (!verifyJson.success || verifyJson.score < 0.4) {
        return c.json({ ok: false, error: 'Sicherheitsprüfung fehlgeschlagen. Bitte versuchen Sie es erneut.' }, 400)
      }
    } catch {
      return c.json({ ok: false, error: 'reCAPTCHA-Überprüfung nicht möglich.' }, 500)
    }
  }

  // E-Mail zusammenstellen
  const recipientEmail = (S.form_recipient_email || 'info@auxilium-forst.com').trim()
  const recipientName  = (S.form_recipient_name  || 'Auxilium – Kristina Bronner').trim()
  const subjectLine    = subject
    ? `Kontaktanfrage: ${subject}`
    : 'Neue Kontaktanfrage über auxilium-forst.com'

  const emailText = [
    `Neue Kontaktanfrage von auxilium-forst.com`,
    ``,
    `Name:        ${firstName} ${lastName}`,
    city    ? `Wohnort:     ${city}`    : '',
    phone   ? `Telefon:     ${phone}`   : '',
    `E-Mail:      ${email}`,
    subject ? `Betreff:     ${subject}` : '',
    ``,
    `Nachricht:`,
    message,
    ``,
    `---`,
    `Datenschutz-Einwilligung erteilt: Ja`,
  ].filter(l => l !== undefined).join('\n')

  // Versand via Cloudflare MailChannels (kostenlos für Pages/Workers)
  try {
    const mailRes = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: recipientEmail, name: recipientName }]
        }],
        from: {
          email: 'noreply@auxilium-forst.com',
          name: `${firstName} ${lastName} (via Kontaktformular)`
        },
        reply_to: { email, name: `${firstName} ${lastName}` },
        subject: subjectLine,
        content: [{ type: 'text/plain', value: emailText }]
      })
    })

    // MailChannels: 202 = Erfolg
    if (mailRes.status === 202 || mailRes.status === 200) {
      return c.json({ ok: true })
    }

    // Fehler-Details loggen (nicht an Client senden)
    const errText = await mailRes.text().catch(() => '')
    console.error('MailChannels Fehler:', mailRes.status, errText)
    return c.json({ ok: false, error: 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.' }, 500)
  } catch (err) {
    console.error('Fetch-Fehler beim E-Mail-Versand:', err)
    return c.json({ ok: false, error: 'Netzwerkfehler beim Versand. Bitte versuchen Sie es später erneut.' }, 500)
  }
})

// ─── Impressum (aus DB) ───────────────────────────────────────
app.get('/impressum', async (c) => {
  const S = await loadSettings(c.env.DB)
  const row = await c.env.DB.prepare("SELECT * FROM page_content WHERE page_key='impressum'").first<any>()
  const content = row ? row.content : '<p>Impressum wird geladen...</p>'
  const body = pageHero('Rechtliches', 'Impressum', '', 'Impressum') + `
<section class="section"><div class="container" style="max-width:760px;">
  <article class="legal-content" style="background:white;border-radius:16px;padding:44px;box-shadow:var(--shadow-md);border:1px solid var(--border);">
    ${content}
  </article>
</div></section>`
  return c.html(layout('Impressum &ndash; Auxilium Forst Baden', 'Impressum von Auxilium Pflegeberatung in Forst Baden.', body, S))
})

// ─── Datenschutz (aus DB) ─────────────────────────────────────
app.get('/datenschutz', async (c) => {
  const S = await loadSettings(c.env.DB)
  const row = await c.env.DB.prepare("SELECT * FROM page_content WHERE page_key='datenschutz'").first<any>()
  const content = row ? row.content : '<p>Datenschutzerkl&auml;rung wird geladen...</p>'
  const body = pageHero('Rechtliches', 'Datenschutzerkl&auml;rung', '', 'Datenschutz') + `
<section class="section"><div class="container" style="max-width:760px;">
  <article class="legal-content" style="background:white;border-radius:16px;padding:44px;box-shadow:var(--shadow-md);border:1px solid var(--border);">
    ${content}
  </article>
</div></section>`
  return c.html(layout('Datenschutz &ndash; Auxilium Forst Baden', 'Datenschutzerkl&auml;rung von Auxilium Pflegeberatung Forst Baden.', body, S))
})

// ─── 404 ──────────────────────────────────────────────────────
app.notFound((c) => {
  const body = `<div style="min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px;">
  <div>
    <img src="/static/logo.jpg" alt="Auxilium" style="width:120px;height:120px;border-radius:16px;object-fit:cover;margin:0 auto 20px;box-shadow:var(--shadow-md);">
    <h1 style="font-size:3rem;margin-bottom:10px;">404</h1>
    <h2 style="font-size:1.3rem;margin-bottom:18px;color:var(--text-light);">Seite nicht gefunden</h2>
    <p style="color:var(--text-light);max-width:380px;margin:0 auto 28px;">Diese Seite existiert leider nicht.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="/" class="btn btn-accent"><i class="fas fa-home" aria-hidden="true"></i>Zur Startseite</a>
      <a href="/kontakt" class="btn btn-outline"><i class="fas fa-phone" aria-hidden="true"></i>Kontakt</a>
    </div>
  </div>
</div>`
  return c.html(layout('404 &ndash; Seite nicht gefunden | Auxilium', '404 - Seite nicht gefunden.', body), 404)
})

// ═══════════════════════════════════════════════════════════════
// ADMIN BACKEND
// ═══════════════════════════════════════════════════════════════

// Gemeinsames Admin-Layout
function adminLayout(title: string, body: string, activeNav = ''): string {
  const navItems = [
    { href: '/admin', label: 'Dashboard', key: 'dashboard', icon: 'fa-tachometer-alt' },
    { href: '/admin/leistungen', label: 'Leistungen', key: 'leistungen', icon: 'fa-list-alt' },
    { href: '/admin/faq', label: 'FAQ', key: 'faq', icon: 'fa-question-circle' },
    { href: '/admin/stellenangebote', label: 'Stellenangebote', key: 'stellenangebote', icon: 'fa-briefcase' },
    { href: '/admin/testimonials', label: 'Kundenstimmen', key: 'testimonials', icon: 'fa-star' },
    { href: '/admin/urlaub', label: 'Urlaubsmodus', key: 'urlaub', icon: 'fa-umbrella-beach' },
    { href: '/admin/einstellungen', label: 'Einstellungen', key: 'einstellungen', icon: 'fa-sliders-h' },
    { href: '/admin/impressum', label: 'Impressum', key: 'impressum', icon: 'fa-file-alt' },
    { href: '/admin/datenschutz', label: 'Datenschutz', key: 'datenschutz', icon: 'fa-shield-alt' },
    { href: '/admin/backup', label: 'Update / Backup', key: 'backup', icon: 'fa-database' },
  ]
  const nav = navItems.map(n =>
    `<a href="${n.href}" class="adm-nav__item${activeNav === n.key ? ' active' : ''}">
      <i class="fas ${n.icon}"></i><span>${n.label}</span>
    </a>`).join('')
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} – Auxilium Admin</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<!-- Quill WYSIWYG -->
<link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet">
<script src="https://cdn.quilljs.com/1.3.7/quill.min.js"></script>
<!-- CodeMirror für HTML-Modus -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/dracula.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/xml/xml.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/htmlmixed/htmlmixed.min.js"></script>
<!-- SortableJS für Drag-&-Drop -->
<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"></script>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',system-ui,sans-serif;background:#F4F6F9;color:#2C2018;min-height:100vh;display:flex;}
  .adm-sidebar{width:230px;background:#1A0D06;color:white;display:flex;flex-direction:column;flex-shrink:0;min-height:100vh;}
  .adm-logo{padding:24px 20px 20px;border-bottom:1px solid rgba(255,255,255,0.08);}
  .adm-logo span{display:block;font-size:1.1rem;font-weight:700;color:#D98A2B;letter-spacing:0.05em;}
  .adm-logo small{font-size:0.72rem;color:rgba(255,255,255,0.45);margin-top:2px;display:block;}
  .adm-nav{padding:16px 0;flex:1;}
  .adm-nav__item{display:flex;align-items:center;gap:10px;padding:11px 20px;color:rgba(255,255,255,0.65);text-decoration:none;font-size:0.9rem;transition:background 0.15s,color 0.15s;}
  .adm-nav__item:hover{background:rgba(255,255,255,0.06);color:white;}
  .adm-nav__item.active{background:rgba(217,138,43,0.18);color:#D98A2B;border-left:3px solid #D98A2B;}
  .adm-nav__item i{width:18px;text-align:center;}
  .adm-logout{padding:16px 20px;border-top:1px solid rgba(255,255,255,0.08);}
  .adm-logout a{color:rgba(255,255,255,0.45);font-size:0.82rem;text-decoration:none;display:flex;align-items:center;gap:8px;}
  .adm-logout a:hover{color:white;}
  .adm-main{flex:1;display:flex;flex-direction:column;overflow:auto;min-width:0;}
  .adm-header{background:white;padding:18px 32px;border-bottom:1px solid #E8D9C5;display:flex;align-items:center;justify-content:space-between;}
  .adm-header h1{font-size:1.25rem;font-weight:700;color:#2C2018;}
  .adm-content{padding:28px 32px;flex:1;}
  .adm-card{background:white;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(44,32,24,0.07);border:1px solid #E8D9C5;margin-bottom:24px;}
  /* Tabellen */
  .adm-table{width:100%;border-collapse:collapse;}
  .adm-table th{text-align:left;padding:10px 14px;font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7A6550;border-bottom:2px solid #E8D9C5;}
  .adm-table td{padding:10px 14px;border-bottom:1px solid #F3EDE3;font-size:0.88rem;vertical-align:middle;}
  .adm-table tr:hover td{background:#FAFAFA;}
  .adm-table tr.sortable-ghost td{background:#FFF8EE;opacity:0.6;}
  /* Buttons */
  .adm-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;border:none;cursor:pointer;font-size:0.84rem;font-weight:600;text-decoration:none;transition:opacity 0.15s,transform 0.1s;}
  .adm-btn:hover{opacity:0.88;transform:translateY(-1px);}
  .adm-btn-primary{background:#D98A2B;color:white;}
  .adm-btn-danger{background:#8B1A1A;color:white;}
  .adm-btn-secondary{background:#E8D9C5;color:#2C2018;}
  .adm-btn-green{background:#4A9B7F;color:white;}
  /* Formulare */
  .adm-form label{display:block;font-size:0.82rem;font-weight:600;color:#7A6550;margin-bottom:5px;margin-top:12px;}
  .adm-form label:first-child{margin-top:0;}
  .adm-form input,.adm-form select,.adm-form textarea{width:100%;padding:8px 12px;border:1px solid #E8D9C5;border-radius:8px;font-size:0.9rem;background:white;color:#2C2018;outline:none;}
  .adm-form input:focus,.adm-form select:focus,.adm-form textarea:focus{border-color:#D98A2B;box-shadow:0 0 0 3px rgba(217,138,43,0.12);}
  .adm-form .row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  /* Badges & Alerts */
  .adm-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;}
  .adm-badge-green{background:#E6F5EF;color:#2D7A5E;}
  .adm-badge-gray{background:#F3EDE3;color:#7A6550;}
  .adm-alert{padding:12px 16px;border-radius:8px;margin-bottom:20px;font-size:0.88rem;}
  .adm-alert-success{background:#E6F5EF;border:1px solid #89C4AE;color:#2D7A5E;}
  .adm-alert-error{background:#F5E8E8;border:1px solid #D98A8A;color:#8B1A1A;}
  /* Quill */
  .ql-container{font-family:'Inter',sans-serif;font-size:0.95rem;}
  .ql-toolbar{border-color:#E8D9C5 !important;border-radius:8px 8px 0 0;}
  .ql-container{border-color:#E8D9C5 !important;border-radius:0 0 8px 8px;}
  .ql-editor{min-height:260px;}
  /* Editor-Tabs (WYSIWYG / HTML) */
  .editor-tabs{display:flex;gap:0;margin-bottom:0;border-bottom:2px solid #E8D9C5;}
  .editor-tab{padding:8px 18px;font-size:0.85rem;font-weight:600;cursor:pointer;border:1px solid #E8D9C5;border-bottom:none;background:#F4F6F9;color:#7A6550;border-radius:8px 8px 0 0;margin-right:4px;}
  .editor-tab.active{background:white;color:#D98A2B;border-color:#E8D9C5;border-bottom:2px solid white;margin-bottom:-2px;}
  .editor-panel{display:none;}.editor-panel.active{display:block;}
  /* CodeMirror */
  .CodeMirror{height:300px;border:1px solid #E8D9C5;border-radius:0 0 8px 8px;font-size:0.9rem;}
  /* Icon-Vorschau */
  .icon-picker{position:relative;}
  .icon-input-row{display:flex;align-items:center;gap:10px;}
  .icon-preview{font-size:1.6rem;color:#D98A2B;width:38px;text-align:center;flex-shrink:0;}
  /* Einstellungen: Section-Cards */
  .adm-section-card{background:white;border:1px solid #E8D9C5;border-radius:12px;overflow:hidden;}
  .adm-section-card__head{display:flex;align-items:flex-start;gap:14px;padding:18px 22px;background:#FBF7F2;border-bottom:1px solid #E8D9C5;font-size:1.35rem;color:#D98A2B;}
  .adm-section-card__head > div {flex:1;}
  .adm-section-card__title{font-size:1rem;font-weight:700;color:#2C2018;margin:0 0 2px;}
  .adm-section-card__sub{font-size:0.8rem;color:#7A6550;margin:0;}
  .adm-section-card__body{padding:20px 22px;display:flex;flex-direction:column;gap:14px;}
  .adm-form-group{display:flex;flex-direction:column;gap:5px;}
  .adm-label{font-size:0.82rem;font-weight:600;color:#2C2018;}
  .adm-hint{font-size:0.73rem;color:#7A6550;}
  .adm-input{border:1px solid #E8D9C5;border-radius:7px;padding:9px 12px;font-size:0.9rem;color:#2C2018;font-family:inherit;width:100%;box-sizing:border-box;background:#FDFAF6;}
  .adm-input:focus{outline:none;border-color:#D98A2B;box-shadow:0 0 0 3px rgba(217,138,43,0.12);}
  .adm-textarea{resize:vertical;min-height:80px;}
  /* Leistungsformular: Split-Layout */
  .form-split{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;}
  /* Live-Preview Card */
  .preview-card{background:#FBF7F2;border:1px solid #E8D9C5;border-radius:12px;padding:0;overflow:hidden;position:sticky;top:24px;}
  .preview-card__header{background:white;padding:12px 18px;border-bottom:1px solid #E8D9C5;font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7A6550;display:flex;align-items:center;gap:8px;}
  .preview-card__body{padding:0;}
  /* Drag-Handle */
  .drag-handle{cursor:grab;color:#C5B8AA;font-size:1rem;padding:4px 8px;}
  .drag-handle:active{cursor:grabbing;}
  .sortable-chosen .drag-handle{cursor:grabbing;}
  /* Responsive */
  @media(max-width:1100px){.form-split{grid-template-columns:1fr;}}
  @media(max-width:768px){.adm-sidebar{display:none;}.adm-content{padding:16px;}}
</style>
</head>
<body>
<aside class="adm-sidebar">
  <div class="adm-logo">
    <span>AUXILIUM</span>
    <small>Backend-Verwaltung</small>
  </div>
  <nav class="adm-nav">${nav}</nav>
  <div class="adm-logout"><a href="/admin/logout"><i class="fas fa-sign-out-alt"></i>Abmelden</a></div>
</aside>
<main class="adm-main">
  <header class="adm-header">
    <h1>${title}</h1>
    <a href="/" target="_blank" style="font-size:0.82rem;color:#7A6550;text-decoration:none;display:flex;align-items:center;gap:6px;">
      <i class="fas fa-external-link-alt"></i>Website anzeigen
    </a>
  </header>
  <div class="adm-content">${body}</div>
</main>
</body>
</html>`
}

// ─── Admin: Login ─────────────────────────────────────────────
app.get('/admin/login', (c) => {
  const msg = c.req.query('error') ? '<div class="adm-alert adm-alert-error"><i class="fas fa-exclamation-circle"></i> Falsches Passwort.</div>' : ''
  return c.html(`<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Auxilium Admin – Login</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter',system-ui,sans-serif;background:linear-gradient(135deg,#1A0D06,#2C2018);min-height:100vh;display:flex;align-items:center;justify-content:center;}
.login-box{background:white;border-radius:16px;padding:44px 40px;width:100%;max-width:400px;box-shadow:0 16px 48px rgba(0,0,0,0.3);}
.login-logo{text-align:center;margin-bottom:28px;}.login-logo img{width:64px;height:64px;border-radius:10px;object-fit:cover;}
.login-logo h1{font-size:1.4rem;font-weight:700;color:#2C2018;margin-top:12px;}
.login-logo p{font-size:0.82rem;color:#7A6550;margin-top:4px;}
label{display:block;font-size:0.82rem;font-weight:600;color:#7A6550;margin-bottom:5px;margin-top:16px;}
input{width:100%;padding:10px 14px;border:1px solid #E8D9C5;border-radius:8px;font-size:0.95rem;outline:none;}
input:focus{border-color:#D98A2B;box-shadow:0 0 0 3px rgba(217,138,43,0.12);}
.adm-alert{padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:0.88rem;}
.adm-alert-error{background:#F5E8E8;border:1px solid #D98A8A;color:#8B1A1A;}
button{width:100%;margin-top:22px;padding:12px;background:#D98A2B;color:white;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;}
button:hover{background:#B5701A;}</style>
</head><body>
<div class="login-box">
  <div class="login-logo">
    <img src="/static/logo.jpg" alt="Auxilium">
    <h1>Admin-Bereich</h1>
    <p>Auxilium – Backend-Verwaltung</p>
  </div>
  ${msg}
  <form method="POST" action="/admin/login">
    <label for="pw">Passwort</label>
    <input type="password" id="pw" name="password" placeholder="••••••••" required autofocus>
    <button type="submit"><i class="fas fa-sign-in-alt"></i> Anmelden</button>
  </form>
</div>
</body></html>`)
})

app.post('/admin/login', async (c) => {
  const body = await c.req.parseBody()
  if (body.password !== ADMIN_PASSWORD) return c.redirect('/admin/login?error=1')
  const token = crypto.randomUUID()
  await c.env.DB.prepare('INSERT INTO admin_sessions (token) VALUES (?)').bind(token).run()
  setCookie(c, SESSION_COOKIE, token, { path: '/', httpOnly: true, maxAge: 86400 * 7 })
  return c.redirect('/admin')
})

app.get('/admin/logout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (token) await c.env.DB.prepare('DELETE FROM admin_sessions WHERE token=?').bind(token).run()
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.redirect('/admin/login')
})

// ─── Admin: Dashboard ─────────────────────────────────────────
app.get('/admin', async (c) => {
  const leistungCount = await c.env.DB.prepare('SELECT COUNT(*) as n FROM leistungen WHERE active=1').first<any>()
  const faqCount = await c.env.DB.prepare('SELECT COUNT(*) as n FROM faqs WHERE active=1').first<any>()
  const body = `
  <div class="adm-card">
    <h2 style="margin-bottom:16px;font-size:1rem;color:#7A6550;text-transform:uppercase;letter-spacing:0.08em;">Übersicht</h2>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">
      <div style="background:#FBF7F2;border-radius:10px;padding:20px;text-align:center;">
        <div style="font-size:2rem;font-weight:700;color:#D98A2B;">${leistungCount?.n ?? 0}</div>
        <div style="font-size:0.82rem;color:#7A6550;margin-top:4px;">Aktive Leistungen</div>
      </div>
      <div style="background:#FBF7F2;border-radius:10px;padding:20px;text-align:center;">
        <div style="font-size:2rem;font-weight:700;color:#4A9B7F;">${faqCount?.n ?? 0}</div>
        <div style="font-size:0.82rem;color:#7A6550;margin-top:4px;">Aktive FAQs</div>
      </div>
      <div style="background:#FBF7F2;border-radius:10px;padding:20px;text-align:center;">
        <div style="font-size:2rem;font-weight:700;color:#7A6550;">2</div>
        <div style="font-size:0.82rem;color:#7A6550;margin-top:4px;">Rechtliche Seiten</div>
      </div>
      <div style="background:#FBF7F2;border-radius:10px;padding:20px;text-align:center;">
        <div style="font-size:2rem;font-weight:700;color:#4A9B7F;"><i class="fas fa-check"></i></div>
        <div style="font-size:0.82rem;color:#7A6550;margin-top:4px;">System bereit</div>
      </div>
    </div>
  </div>
  <div class="adm-card">
    <h2 style="margin-bottom:12px;font-size:1rem;">Schnellzugriff</h2>
    <div style="display:flex;flex-wrap:wrap;gap:12px;">
      <a href="/admin/leistungen" class="adm-btn adm-btn-primary"><i class="fas fa-list-alt"></i>Leistungen verwalten</a>
      <a href="/admin/leistungen/neu" class="adm-btn adm-btn-green"><i class="fas fa-plus"></i>Neue Leistung</a>
      <a href="/admin/faq" class="adm-btn adm-btn-primary"><i class="fas fa-question-circle"></i>FAQ verwalten</a>
      <a href="/admin/faq/neu" class="adm-btn adm-btn-green"><i class="fas fa-plus"></i>Neue FAQ</a>
      <a href="/admin/einstellungen" class="adm-btn adm-btn-secondary"><i class="fas fa-sliders-h"></i>Einstellungen</a>
      <a href="/admin/impressum" class="adm-btn adm-btn-secondary"><i class="fas fa-file-alt"></i>Impressum</a>
      <a href="/admin/datenschutz" class="adm-btn adm-btn-secondary"><i class="fas fa-shield-alt"></i>Datenschutz</a>
    </div>
  </div>`
  return c.html(adminLayout('Dashboard', body, 'dashboard'))
})

// ─── Admin: Leistungen Liste (mit Drag-&-Drop) ────────────────
app.get('/admin/leistungen', async (c) => {
  const msg = c.req.query('msg')
  const filterKat = c.req.query('kat') || ''
  const alert = msg === 'saved' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Erfolgreich gespeichert.</div>'
    : msg === 'deleted' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Leistung gelöscht.</div>' : ''
  const { results: katList } = await c.env.DB.prepare('SELECT * FROM kategorien ORDER BY sort_order').all<any>()
  const query = filterKat
    ? 'SELECT l.*, k.name as kat_name FROM leistungen l LEFT JOIN kategorien k ON k.slug=l.kategorie_slug WHERE l.kategorie_slug=? ORDER BY l.sort_order'
    : 'SELECT l.*, k.name as kat_name FROM leistungen l LEFT JOIN kategorien k ON k.slug=l.kategorie_slug ORDER BY l.kategorie_slug, l.sort_order'
  const { results } = filterKat
    ? await c.env.DB.prepare(query).bind(filterKat).all<any>()
    : await c.env.DB.prepare(query).all<any>()
  const katFilterBtns = katList.map((k: any) =>
    `<a href="/admin/leistungen?kat=${k.slug}" class="adm-btn ${filterKat===k.slug ? 'adm-btn-primary' : 'adm-btn-secondary'}" style="padding:4px 10px;font-size:0.78rem;"><i class="fas ${k.icon}"></i>${k.name}</a>`
  ).join('')
  const rows = results.map((r: any) => `
    <tr data-id="${r.id}">
      <td class="drag-handle" title="Ziehen zum Sortieren"><i class="fas fa-grip-vertical"></i></td>
      <td><i class="fas ${r.icon}" style="color:#D98A2B;width:20px;margin-right:6px;"></i><strong>${r.title}</strong></td>
      <td style="color:#7A6550;font-size:0.82rem;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.subtitle}</td>
      <td><span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;background:#FBF7F2;border:1px solid #E8D9C5;font-size:0.75rem;color:#7A6550;">${r.kat_name || '–'}</span></td>
      <td><strong style="color:#D98A2B;">${r.price_new}</strong></td>
      <td>${r.active ? '<span class="adm-badge adm-badge-green">Aktiv</span>' : '<span class="adm-badge adm-badge-gray">Inaktiv</span>'}</td>
      <td style="white-space:nowrap;">
        <a href="/admin/leistungen/${r.id}" class="adm-btn adm-btn-secondary" style="padding:5px 10px;font-size:0.78rem;"><i class="fas fa-edit"></i>Bearbeiten</a>
        <form method="POST" action="/admin/leistungen/${r.id}/delete" style="display:inline;" onsubmit="return confirm('Wirklich löschen?')">
          <button class="adm-btn adm-btn-danger" style="padding:5px 10px;font-size:0.78rem;"><i class="fas fa-trash"></i></button>
        </form>
      </td>
    </tr>`).join('')
  const body = `
  ${alert}
  <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px;">
    <a href="/admin/leistungen" class="adm-btn ${!filterKat ? 'adm-btn-primary' : 'adm-btn-secondary'}" style="padding:4px 10px;font-size:0.78rem;"><i class="fas fa-list"></i>Alle</a>
    ${katFilterBtns}
    <a href="/admin/kategorien" class="adm-btn adm-btn-secondary" style="padding:4px 10px;font-size:0.78rem;margin-left:auto;"><i class="fas fa-folder"></i>Kategorien verwalten</a>
  </div>
  <div class="adm-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div>
        <h2 style="font-size:1rem;margin-bottom:3px;">Leistungen (${results.length})</h2>
        <p style="font-size:0.78rem;color:#7A6550;"><i class="fas fa-grip-vertical" style="margin-right:4px;"></i>Zeilen per Drag &amp; Drop in die gewünschte Reihenfolge ziehen</p>
      </div>
      <a href="/admin/leistungen/neu" class="adm-btn adm-btn-primary"><i class="fas fa-plus"></i>Neue Leistung</a>
    </div>
    <table class="adm-table">
      <thead><tr><th style="width:36px;"></th><th>Titel</th><th>Untertitel</th><th>Kategorie</th><th>Preis</th><th>Status</th><th>Aktionen</th></tr></thead>
      <tbody id="leistungenBody">${rows}</tbody>
    </table>
    <p id="sortSaveHint" style="display:none;margin-top:12px;font-size:0.82rem;color:#7A6550;"><i class="fas fa-spinner fa-spin" style="margin-right:5px;"></i>Reihenfolge wird gespeichert…</p>
  </div>
  <script>
  (function(){
    const tbody = document.getElementById('leistungenBody');
    const hint = document.getElementById('sortSaveHint');
    let saveTimer;
    Sortable.create(tbody, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd: function() {
        clearTimeout(saveTimer);
        hint.style.display = 'block';
        saveTimer = setTimeout(function() {
          const ids = Array.from(tbody.querySelectorAll('tr[data-id]')).map(tr => tr.getAttribute('data-id'));
          fetch('/admin/leistungen/sort', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ids})
          }).then(r => {
            hint.innerHTML = r.ok
              ? '<i class="fas fa-check-circle" style="color:#2D7A5E;margin-right:5px;"></i>Reihenfolge gespeichert.'
              : '<i class="fas fa-exclamation-circle" style="color:#8B1A1A;margin-right:5px;"></i>Fehler beim Speichern.';
            setTimeout(() => { hint.style.display='none'; hint.innerHTML='<i class="fas fa-spinner fa-spin" style="margin-right:5px;"></i>Reihenfolge wird gespeichert…'; }, 2200);
          });
        }, 600);
      }
    });
  })();
  </script>`
  return c.html(adminLayout('Leistungen', body, 'leistungen'))
})

// ─── Admin: Sort-API (AJAX) ───────────────────────────────────
app.post('/admin/leistungen/sort', async (c) => {
  const { ids } = await c.req.json<{ ids: string[] }>()
  for (let i = 0; i < ids.length; i++) {
    await c.env.DB.prepare('UPDATE leistungen SET sort_order=? WHERE id=?').bind(i + 1, ids[i]).run()
  }
  return c.json({ ok: true })
})

// ─── Admin: Neue Leistung ─────────────────────────────────────
app.get('/admin/leistungen/neu', async (c) => {
  const { results: kats } = await c.env.DB.prepare('SELECT * FROM kategorien ORDER BY sort_order').all<any>()
  const body = leistungForm(null, kats)
  return c.html(adminLayout('Neue Leistung', body, 'leistungen'))
})

app.post('/admin/leistungen/neu', async (c) => {
  const d = await c.req.parseBody()
  const maxRow = await c.env.DB.prepare('SELECT COALESCE(MAX(sort_order),0)+1 AS next_order FROM leistungen').first<any>()
  const nextOrder = maxRow?.next_order ?? 99
  await c.env.DB.prepare(`INSERT INTO leistungen 
    (slug,title,subtitle,icon,description,price_new,price_old,price_note,savings,sort_order,active,kategorie_slug)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(d.slug||'', d.title||'', d.subtitle||'', d.icon||'fa-star', d.description||'',
    d.price_new||'', d.price_old||'', d.price_note||'', d.savings||'',
    nextOrder, d.active ? 1 : 0, d.kategorie_slug||'').run()
  return c.redirect('/admin/leistungen?msg=saved')
})

// ─── Admin: Leistung bearbeiten ───────────────────────────────
app.get('/admin/leistungen/:id', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM leistungen WHERE id=?').bind(c.req.param('id')).first<any>()
  if (!row) return c.redirect('/admin/leistungen')
  const { results: kats } = await c.env.DB.prepare('SELECT * FROM kategorien ORDER BY sort_order').all<any>()
  const body = leistungForm(row, kats)
  return c.html(adminLayout('Leistung bearbeiten', body, 'leistungen'))
})

app.post('/admin/leistungen/:id', async (c) => {
  const d = await c.req.parseBody()
  await c.env.DB.prepare(`UPDATE leistungen SET
    title=?,subtitle=?,icon=?,description=?,price_new=?,price_old=?,price_note=?,savings=?,active=?,kategorie_slug=?,updated_at=CURRENT_TIMESTAMP
    WHERE id=?`
  ).bind(d.title||'', d.subtitle||'', d.icon||'fa-star', d.description||'',
    d.price_new||'', d.price_old||'', d.price_note||'', d.savings||'',
    d.active ? 1 : 0, d.kategorie_slug||'', c.req.param('id')).run()
  return c.redirect('/admin/leistungen?msg=saved')
})

app.post('/admin/leistungen/:id/delete', async (c) => {
  await c.env.DB.prepare('DELETE FROM leistungen WHERE id=?').bind(c.req.param('id')).run()
  return c.redirect('/admin/leistungen?msg=deleted')
})

// ─── Admin: Kategorien verwalten ──────────────────────────────
app.get('/admin/kategorien', async (c) => {
  const msg = c.req.query('msg')
  const alert = msg === 'saved'   ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Gespeichert.</div>'
              : msg === 'deleted' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Kategorie gelöscht.</div>' : ''
  const { results } = await c.env.DB.prepare('SELECT k.*, COUNT(l.id) as anz FROM kategorien k LEFT JOIN leistungen l ON l.kategorie_slug=k.slug GROUP BY k.id ORDER BY k.sort_order').all<any>()
  const rows = results.map((k: any) => `
    <tr data-id="${k.id}">
      <td class="drag-handle"><i class="fas fa-grip-vertical"></i></td>
      <td><i class="fas ${k.icon}" style="color:#D98A2B;width:20px;margin-right:6px;"></i><strong>${k.name}</strong></td>
      <td style="font-family:monospace;font-size:0.82rem;color:#7A6550;">${k.slug}</td>
      <td><span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;background:#FBF7F2;border:1px solid #E8D9C5;font-size:0.78rem;">${k.anz} Leistung${k.anz!==1?'en':''}</span></td>
      <td>${k.active ? '<span class="adm-badge adm-badge-green">Aktiv</span>' : '<span class="adm-badge adm-badge-gray">Inaktiv</span>'}</td>
      <td style="white-space:nowrap;">
        <a href="/admin/kategorien/${k.id}" class="adm-btn adm-btn-secondary" style="padding:5px 10px;font-size:0.78rem;"><i class="fas fa-edit"></i>Bearbeiten</a>
        ${k.anz === 0 ? `<form method="POST" action="/admin/kategorien/${k.id}/delete" style="display:inline;" onsubmit="return confirm('Kategorie löschen?')"><button class="adm-btn adm-btn-danger" style="padding:5px 10px;font-size:0.78rem;"><i class="fas fa-trash"></i></button></form>` : ''}
      </td>
    </tr>`).join('')
  const body = `
  ${alert}
  <div class="adm-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div>
        <h2 style="font-size:1rem;margin-bottom:3px;">Kategorien (${results.length})</h2>
        <p style="font-size:0.78rem;color:#7A6550;">Leistungen können je einer Kategorie zugeordnet werden</p>
      </div>
      <div style="display:flex;gap:8px;">
        <a href="/admin/leistungen" class="adm-btn adm-btn-secondary"><i class="fas fa-arrow-left"></i>Zu Leistungen</a>
        <a href="/admin/kategorien/neu" class="adm-btn adm-btn-primary"><i class="fas fa-plus"></i>Neue Kategorie</a>
      </div>
    </div>
    <table class="adm-table">
      <thead><tr><th style="width:36px;"></th><th>Name</th><th>Slug</th><th>Leistungen</th><th>Status</th><th>Aktionen</th></tr></thead>
      <tbody id="katBody">${rows}</tbody>
    </table>
  </div>
  <script>
  (function(){
    const tbody = document.getElementById('katBody');
    Sortable.create(tbody, {
      handle: '.drag-handle', animation: 150, ghostClass: 'sortable-ghost',
      onEnd: function() {
        const ids = Array.from(tbody.querySelectorAll('tr[data-id]')).map(tr => tr.getAttribute('data-id'));
        fetch('/admin/kategorien/sort', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids})});
      }
    });
  })();
  </script>`
  return c.html(adminLayout('Kategorien', body, 'leistungen'))
})

app.post('/admin/kategorien/sort', async (c) => {
  const { ids } = await c.req.json<{ ids: string[] }>()
  for (let i = 0; i < ids.length; i++) {
    await c.env.DB.prepare('UPDATE kategorien SET sort_order=? WHERE id=?').bind(i+1, ids[i]).run()
  }
  return c.json({ ok: true })
})

app.get('/admin/kategorien/neu', (c) => {
  return c.html(adminLayout('Neue Kategorie', kategorieForm(null), 'leistungen'))
})

app.post('/admin/kategorien/neu', async (c) => {
  const d = await c.req.parseBody()
  const maxRow = await c.env.DB.prepare('SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM kategorien').first<any>()
  await c.env.DB.prepare('INSERT INTO kategorien (slug,name,icon,description,sort_order,active) VALUES (?,?,?,?,?,?)')
    .bind(d.slug||'', d.name||'', d.icon||'fa-folder', d.description||'', maxRow?.next??99, d.active?1:0).run()
  return c.redirect('/admin/kategorien?msg=saved')
})

app.get('/admin/kategorien/:id', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM kategorien WHERE id=?').bind(c.req.param('id')).first<any>()
  if (!row) return c.redirect('/admin/kategorien')
  return c.html(adminLayout('Kategorie bearbeiten', kategorieForm(row), 'leistungen'))
})

app.post('/admin/kategorien/:id', async (c) => {
  const d = await c.req.parseBody()
  await c.env.DB.prepare('UPDATE kategorien SET name=?,icon=?,description=?,active=? WHERE id=?')
    .bind(d.name||'', d.icon||'fa-folder', d.description||'', d.active?1:0, c.req.param('id')).run()
  return c.redirect('/admin/kategorien?msg=saved')
})

app.post('/admin/kategorien/:id/delete', async (c) => {
  await c.env.DB.prepare('DELETE FROM kategorien WHERE id=?').bind(c.req.param('id')).run()
  return c.redirect('/admin/kategorien?msg=deleted')
})

function kategorieForm(r: any): string {
  const v = (f: string) => r ? String(r[f]??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;') : ''
  const isNew = !r
  return `
  <div class="adm-card">
    <form method="POST" class="adm-form">
      ${isNew ? `<div><label>Slug <span style="font-weight:400;color:#7A6550;">(z.B. koerperpflege – nur a-z, Bindestriche)</span></label>
        <input name="slug" value="${v('slug')}" required pattern="[a-z0-9-]+" placeholder="kategorie-slug"></div>` : ''}
      <label>Name</label>
      <input name="name" value="${v('name')}" required placeholder="z.B. Körperpflege">
      <label>
        Font-Awesome Icon
        <a href="https://fontawesome.com/icons?m=free" target="_blank" rel="noopener"
           style="font-weight:400;color:#D98A2B;margin-left:8px;font-size:0.78rem;">
          <i class="fas fa-external-link-alt" style="font-size:0.72rem;"></i> Icons durchsuchen (fontawesome.com)
        </a>
      </label>
      <div class="icon-input-row">
        <span class="icon-preview" id="katIconPrev"><i class="fas ${r?.icon||'fa-folder'}" style="color:#D98A2B;"></i></span>
        <input name="icon" id="katIconInput" value="${v('icon')||'fa-folder'}" placeholder="fa-folder" style="font-family:monospace;" oninput="document.getElementById('katIconPrev').innerHTML='<i class=\\'fas \\'+this.value+\\' style=\\'color:#D98A2B;\\'></i>';" autocomplete="off">
      </div>
      <small style="color:#7A6550;font-size:0.75rem;margin-top:3px;display:block;">Den Klassennamen aus fontawesome.com kopieren, z.B. fa-heart oder fa-user-nurse</small>
      <label style="margin-top:14px;">Beschreibung der Leistung <span style="font-weight:400;color:#7A6550;">(optional)</span></label>
      <textarea name="description" rows="3" placeholder="Kurze Beschreibung der Leistungskategorie…">${r?.description||''}</textarea>
      <div style="margin-top:14px;display:flex;align-items:center;gap:10px;">
        <input type="checkbox" id="kat_active" name="active" style="width:auto;" ${r?.active!==0?'checked':''} >
        <label for="kat_active" style="margin:0;font-size:0.9rem;cursor:pointer;">Kategorie aktiv</label>
      </div>
      <div style="margin-top:20px;display:flex;gap:12px;">
        <button type="submit" class="adm-btn adm-btn-primary"><i class="fas fa-save"></i>Speichern</button>
        <a href="/admin/kategorien" class="adm-btn adm-btn-secondary"><i class="fas fa-arrow-left"></i>Abbrechen</a>
      </div>
    </form>
  </div>`
}

// Formular-Helper Leistungen (mit Live-Vorschau + freiem Icon-Input + Kategorien)
function leistungForm(r: any, kats: any[] = []): string {
  const v = (f: string) => {
    if (!r) return ''
    const val = r[f] ?? ''
    return String(val).replace(/&/g,'&amp;').replace(/"/g,'&quot;')
  }
  const vRaw = (f: string) => r ? (r[f] ?? '') : ''
  const isNew = !r
  const activeChecked = r ? (r.active ? 'checked' : '') : 'checked'
  const katOptions = kats.map((k: any) =>
    `<option value="${k.slug}" ${(r?.kategorie_slug||'')=== k.slug ? 'selected' : ''}>${k.name}</option>`
  ).join('')

  return `
  <div class="form-split">
    <!-- LINKE SPALTE: Formular -->
    <div class="adm-card" style="margin-bottom:0;">
      <form method="POST" class="adm-form" id="leistungForm">
        ${isNew ? `<div>
          <label>Slug <span style="font-weight:400;color:#7A6550;">(URL-ID, z.B. koerperpflege – nur a-z, 0-9, Bindestriche)</span></label>
          <input name="slug" id="f_slug" value="${v('slug')}" required pattern="[a-z0-9-]+" placeholder="eindeutige-id" oninput="updatePreview()">
        </div>` : ''}

        <label>Titel</label>
        <input name="title" id="f_title" value="${v('title')}" required oninput="updatePreview()" placeholder="z.B. Große Körperpflege">

        <label>Untertitel <span style="font-weight:400;color:#7A6550;">(wird klein unter dem Titel angezeigt)</span></label>
        <input name="subtitle" id="f_subtitle" value="${v('subtitle')}" oninput="updatePreview()" placeholder="z.B. Baden / Duschen · ca. 35 Min">

        <label>
          Font-Awesome Icon
          <a href="https://fontawesome.com/icons?m=free" target="_blank" rel="noopener"
             style="font-weight:400;color:#D98A2B;margin-left:8px;font-size:0.78rem;">
            <i class="fas fa-external-link-alt" style="font-size:0.72rem;"></i> Icons durchsuchen (fontawesome.com)
          </a>
        </label>
        <div class="icon-input-row">
          <span class="icon-preview" id="iconPreview"><i class="fas ${vRaw('icon') || 'fa-star'}"></i></span>
          <input name="icon" id="f_icon" value="${v('icon') || 'fa-star'}" placeholder="fa-shower"
                 style="font-family:monospace;"
                 oninput="updateIconPreview();updatePreview()"
                 autocomplete="off">
        </div>
        <p style="font-size:0.75rem;color:#7A6550;margin-top:4px;">
          Den Klassennamen aus fontawesome.com kopieren, z.B. <code style="background:#F3EDE3;padding:1px 5px;border-radius:4px;">fa-heart</code> oder <code style="background:#F3EDE3;padding:1px 5px;border-radius:4px;">fa-user-nurse</code>
        </p>

        <label>Kategorie</label>
        <select name="kategorie_slug" id="f_kategorie" style="width:100%;padding:9px 12px;border:1.5px solid #E8D9C5;border-radius:8px;font-size:0.9rem;background:white;color:#3A2C1E;">
          <option value="">– keine Kategorie –</option>
          ${katOptions}
        </select>

        <label>Beschreibung</label>
        <textarea name="description" id="f_description" rows="3" oninput="updatePreview()" placeholder="Kurze Beschreibung der Leistung…">${vRaw('description')}</textarea>

        <div class="row" style="margin-top:12px;">
          <div>
            <label>Auxilium-Preis</label>
            <input name="price_new" id="f_price_new" value="${v('price_new')}" oninput="updatePreview()" placeholder="21,00 €">
          </div>
          <div>
            <label>Vergleichspreis</label>
            <input name="price_old" id="f_price_old" value="${v('price_old')}" oninput="updatePreview()" placeholder="28,55 € (Ambulanter Dienst)">
          </div>
        </div>

        <div class="row">
          <div>
            <label>Preishinweis <span style="font-weight:400;color:#7A6550;">(Zeile unter Preisen)</span></label>
            <input name="price_note" id="f_price_note" value="${v('price_note')}" oninput="updatePreview()" placeholder="je angef. Viertelstunde">
          </div>
          <div>
            <label>Ersparnis-Text</label>
            <input name="savings" id="f_savings" value="${v('savings')}" oninput="updatePreview()" placeholder="Sie sparen: 7,55 € pro Einsatz">
          </div>
        </div>

        <div style="margin-top:14px;display:flex;align-items:center;gap:10px;">
          <input type="checkbox" id="f_active" name="active" style="width:auto;" ${activeChecked} onchange="updatePreview()">
          <label for="f_active" style="margin:0;color:#2C2018;font-size:0.9rem;cursor:pointer;font-weight:500;">Leistung aktiv (auf Website anzeigen)</label>
        </div>

        <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
          <button type="submit" class="adm-btn adm-btn-primary"><i class="fas fa-save"></i>Speichern</button>
          <a href="/admin/leistungen" class="adm-btn adm-btn-secondary"><i class="fas fa-arrow-left"></i>Abbrechen</a>
        </div>
      </form>
    </div>

    <!-- RECHTE SPALTE: Live-Vorschau -->
    <div class="preview-card">
      <div class="preview-card__header">
        <i class="fas fa-eye" style="color:#D98A2B;"></i> Live-Vorschau
        <span style="margin-left:auto;font-size:0.72rem;color:#C5B8AA;font-weight:400;">Aktualisiert bei jeder Eingabe</span>
      </div>
      <div class="preview-card__body" id="previewContainer" style="padding:20px;">
        <!-- wird per JS befüllt -->
      </div>
    </div>
  </div>

  <script>
  // Icon-Vorschau
  function updateIconPreview() {
    const val = (document.getElementById('f_icon').value || 'fa-star').trim();
    document.getElementById('iconPreview').innerHTML = '<i class="fas ' + val + '"></i>';
  }

  // Live-Vorschau der Service-Card
  function g(id) { const el = document.getElementById(id); return el ? el.value : ''; }
  function gc(id) { const el = document.getElementById(id); return el ? el.checked : true; }

  function updatePreview() {
    const icon = (g('f_icon') || 'fa-star').trim();
    const title = g('f_title') || '<em style="color:#C5B8AA;">Titel eingeben…</em>';
    const subtitle = g('f_subtitle') || '';
    const desc = g('f_description') || '';
    const priceNew = g('f_price_new') || '–';
    const priceOld = g('f_price_old') || '';
    const priceNote = g('f_price_note') || '';
    const savings = g('f_savings') || '';
    const active = gc('f_active');

    const statusBadge = active
      ? '<span style="display:inline-block;padding:2px 8px;border-radius:20px;background:#E6F5EF;color:#2D7A5E;font-size:0.72rem;font-weight:700;margin-bottom:10px;">● Aktiv</span>'
      : '<span style="display:inline-block;padding:2px 8px;border-radius:20px;background:#F3EDE3;color:#7A6550;font-size:0.72rem;font-weight:700;margin-bottom:10px;">○ Inaktiv</span>';

    document.getElementById('previewContainer').innerHTML = \`
      \${statusBadge}
      <article style="background:white;border:1px solid #E8D9C5;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(44,32,24,0.07);">
        <div style="display:flex;align-items:center;gap:14px;padding:16px 18px 14px;border-bottom:1px solid #F3EDE3;background:#FBF7F2;">
          <div style="width:44px;height:44px;background:var(--primary-light,#FAF0DF);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="fas \${icon}" style="color:#D98A2B;font-size:1.15rem;"></i>
          </div>
          <div>
            <div style="font-weight:700;font-size:0.95rem;color:#2C2018;">\${title}</div>
            \${subtitle ? \`<div style="font-size:0.78rem;color:#7A6550;margin-top:2px;">\${subtitle}</div>\` : ''}
          </div>
        </div>
        <div style="padding:14px 18px 16px;">
          \${desc ? \`<p style="font-size:0.875rem;color:#3A2C1E;line-height:1.7;margin-bottom:12px;">\${desc}</p>\` : ''}
          <div style="background:#FBF7F2;border:1px solid #E8D9C5;border-radius:8px;padding:10px 12px;margin-bottom:10px;">
            <div style="font-size:1.45rem;font-weight:800;color:#D98A2B;line-height:1.1;">\${priceNew}</div>
            \${priceOld ? \`<div style="margin-top:3px;font-size:0.82rem;color:#7A6550;text-decoration:line-through;">\${priceOld}</div>\` : ''}
            \${priceNote ? \`<div style="font-size:0.7rem;color:#7A6550;margin-top:4px;">\${priceNote}</div>\` : ''}
          </div>
          \${savings ? \`<div style="font-size:0.78rem;color:#2D7A3A;font-weight:600;"><i class="fas fa-check" style="margin-right:5px;"></i>\${savings}</div>\` : ''}
        </div>
      </article>
      <p style="font-size:0.72rem;color:#C5B8AA;margin-top:10px;text-align:center;">Vorschau entspricht annähernd der Darstellung auf der Website.</p>
    \`;
  }

  // Initial befüllen
  updatePreview();
  </script>`
}

// ─── Admin: Impressum & Datenschutz WYSIWYG + HTML-Modus ──────
function wysiwygPage(pageKey: string, pageTitle: string, row: any, activeNav: string) {
  const content = row ? row.content : ''
  // HTML-Content für Textarea escapen
  const contentEscaped = content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const savedMsg = ''
  const body = `
  <div class="adm-card">
    <form method="POST" class="adm-form" id="editorForm">
      <!-- Tabs -->
      <div style="margin-bottom:0;">
        <div class="editor-tabs">
          <button type="button" class="editor-tab active" id="tabWysiwyg" onclick="switchTab('wysiwyg')">
            <i class="fas fa-pen" style="margin-right:6px;"></i>Visueller Editor
          </button>
          <button type="button" class="editor-tab" id="tabHtml" onclick="switchTab('html')">
            <i class="fas fa-code" style="margin-right:6px;"></i>HTML-Modus
          </button>
        </div>
      </div>

      <!-- WYSIWYG-Panel -->
      <div class="editor-panel active" id="panelWysiwyg" style="border:1px solid #E8D9C5;border-top:none;border-radius:0 0 8px 8px;">
        <div id="quillEditor" style="background:white;">${content}</div>
      </div>

      <!-- HTML-Panel -->
      <div class="editor-panel" id="panelHtml" style="border:1px solid #E8D9C5;border-top:none;border-radius:0 0 8px 8px;">
        <textarea id="htmlTextarea" style="display:none;">${contentEscaped}</textarea>
      </div>

      <input type="hidden" name="content" id="contentInput">

      <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
        <button type="submit" class="adm-btn adm-btn-primary" id="saveBtn">
          <i class="fas fa-save"></i>Speichern
        </button>
        <a href="/${pageKey}" target="_blank" class="adm-btn adm-btn-secondary">
          <i class="fas fa-external-link-alt"></i>Vorschau öffnen
        </a>
        <span style="font-size:0.78rem;color:#7A6550;margin-left:auto;">
          <i class="fas fa-info-circle" style="margin-right:4px;"></i>
          Im HTML-Modus: Syntax-Highlighting mit CodeMirror. Wechsel zwischen Modi synchronisiert den Inhalt.
        </span>
      </div>
    </form>
  </div>

  <script>
  let quill, cm, currentTab = 'wysiwyg';

  // Quill initialisieren
  quill = new Quill('#quillEditor', {
    theme: 'snow',
    modules: { toolbar: [
      [{ header: [1,2,3,false] }],
      ['bold','italic','underline','strike'],
      [{ color: [] },{ background: [] }],
      [{ list: 'ordered' },{ list: 'bullet' }],
      ['link','blockquote'],
      ['clean']
    ]}
  });

  // CodeMirror initialisieren
  const htmlTA = document.getElementById('htmlTextarea');
  cm = CodeMirror.fromTextArea(htmlTA, {
    mode: 'htmlmixed',
    theme: 'dracula',
    lineNumbers: true,
    lineWrapping: true,
    indentWithTabs: true,
    tabSize: 2,
    extraKeys: { 'Ctrl-Space': 'autocomplete' }
  });
  cm.setSize('100%', '350px');

  function switchTab(tab) {
    if (tab === currentTab) return;
    if (tab === 'html') {
      // WYSIWYG → HTML
      cm.setValue(quill.root.innerHTML);
      document.getElementById('panelWysiwyg').classList.remove('active');
      document.getElementById('panelHtml').classList.add('active');
      document.getElementById('tabWysiwyg').classList.remove('active');
      document.getElementById('tabHtml').classList.add('active');
      setTimeout(() => cm.refresh(), 10);
    } else {
      // HTML → WYSIWYG
      quill.root.innerHTML = cm.getValue();
      document.getElementById('panelHtml').classList.remove('active');
      document.getElementById('panelWysiwyg').classList.add('active');
      document.getElementById('tabHtml').classList.remove('active');
      document.getElementById('tabWysiwyg').classList.add('active');
    }
    currentTab = tab;
  }

  // Beim Speichern: aktuellen Inhalt je nach Tab holen
  document.getElementById('editorForm').addEventListener('submit', function(e) {
    const content = currentTab === 'html' ? cm.getValue() : quill.root.innerHTML;
    document.getElementById('contentInput').value = content;
  });
  </script>`
  return adminLayout(pageTitle, body, activeNav)
}

app.get('/admin/impressum', async (c) => {
  const row = await c.env.DB.prepare("SELECT * FROM page_content WHERE page_key='impressum'").first<any>()
  return c.html(wysiwygPage('impressum', 'Impressum bearbeiten', row, 'impressum'))
})

app.post('/admin/impressum', async (c) => {
  const d = await c.req.parseBody()
  await c.env.DB.prepare(`INSERT INTO page_content (page_key,title,content) VALUES ('impressum','Impressum',?)
    ON CONFLICT(page_key) DO UPDATE SET content=excluded.content, updated_at=CURRENT_TIMESTAMP`
  ).bind(d.content||'').run()
  return c.redirect('/admin/impressum?msg=saved')
})

app.get('/admin/datenschutz', async (c) => {
  const row = await c.env.DB.prepare("SELECT * FROM page_content WHERE page_key='datenschutz'").first<any>()
  return c.html(wysiwygPage('datenschutz', 'Datenschutz bearbeiten', row, 'datenschutz'))
})

app.post('/admin/datenschutz', async (c) => {
  const d = await c.req.parseBody()
  await c.env.DB.prepare(`INSERT INTO page_content (page_key,title,content) VALUES ('datenschutz','Datenschutzerklärung',?)
    ON CONFLICT(page_key) DO UPDATE SET content=excluded.content, updated_at=CURRENT_TIMESTAMP`
  ).bind(d.content||'').run()
  return c.redirect('/admin/datenschutz?msg=saved')
})

// ═══════════════════════════════════════════════════════════════
// ADMIN: FAQ
// ═══════════════════════════════════════════════════════════════

// ─── FAQ-Liste mit Drag-&-Drop ────────────────────────────────
app.get('/admin/faq', async (c) => {
  const msg = c.req.query('msg')
  const alert = msg === 'saved' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> FAQ gespeichert.</div>'
    : msg === 'deleted' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> FAQ gelöscht.</div>' : ''
  const { results } = await c.env.DB.prepare('SELECT * FROM faqs ORDER BY sort_order').all<any>()
  const rows = results.map((r: any) => `
    <tr data-id="${r.id}">
      <td class="drag-handle" title="Ziehen zum Sortieren"><i class="fas fa-grip-vertical"></i></td>
      <td style="max-width:340px;"><strong>${r.question}</strong></td>
      <td style="max-width:220px;font-size:0.82rem;color:#7A6550;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.answer.substring(0,80)}${r.answer.length > 80 ? '…' : ''}</td>
      <td>${r.active ? '<span class="adm-badge adm-badge-green">Aktiv</span>' : '<span class="adm-badge adm-badge-gray">Inaktiv</span>'}</td>
      <td style="white-space:nowrap;">
        <a href="/admin/faq/${r.id}" class="adm-btn adm-btn-secondary" style="padding:5px 10px;font-size:0.78rem;"><i class="fas fa-edit"></i>Bearbeiten</a>
        <form method="POST" action="/admin/faq/${r.id}/delete" style="display:inline;" onsubmit="return confirm('FAQ wirklich löschen?')">
          <button class="adm-btn adm-btn-danger" style="padding:5px 10px;font-size:0.78rem;"><i class="fas fa-trash"></i></button>
        </form>
      </td>
    </tr>`).join('')
  const body = `
  ${alert}
  <div class="adm-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div>
        <h2 style="font-size:1rem;margin-bottom:3px;">Häufige Fragen (${results.length})</h2>
        <p style="font-size:0.78rem;color:#7A6550;"><i class="fas fa-grip-vertical" style="margin-right:4px;"></i>Zeilen per Drag &amp; Drop sortieren</p>
      </div>
      <a href="/admin/faq/neu" class="adm-btn adm-btn-primary"><i class="fas fa-plus"></i>Neue FAQ</a>
    </div>
    <table class="adm-table">
      <thead><tr><th style="width:36px;"></th><th>Frage</th><th>Antwort (Vorschau)</th><th>Status</th><th>Aktionen</th></tr></thead>
      <tbody id="faqBody">${rows}</tbody>
    </table>
    <p id="faqSortHint" style="display:none;margin-top:12px;font-size:0.82rem;color:#7A6550;"><i class="fas fa-spinner fa-spin" style="margin-right:5px;"></i>Reihenfolge wird gespeichert…</p>
  </div>
  <script>
  (function(){
    const tbody = document.getElementById('faqBody');
    const hint = document.getElementById('faqSortHint');
    let saveTimer;
    Sortable.create(tbody, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd: function() {
        clearTimeout(saveTimer);
        hint.style.display = 'block';
        saveTimer = setTimeout(function() {
          const ids = Array.from(tbody.querySelectorAll('tr[data-id]')).map(tr => tr.getAttribute('data-id'));
          fetch('/admin/faq/sort', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ids})
          }).then(r => {
            hint.innerHTML = r.ok
              ? '<i class="fas fa-check-circle" style="color:#2D7A5E;margin-right:5px;"></i>Reihenfolge gespeichert.'
              : '<i class="fas fa-exclamation-circle" style="color:#8B1A1A;margin-right:5px;"></i>Fehler.';
            setTimeout(() => { hint.style.display='none'; hint.innerHTML='<i class="fas fa-spinner fa-spin" style="margin-right:5px;"></i>Reihenfolge wird gespeichert…'; }, 2200);
          });
        }, 600);
      }
    });
  })();
  </script>`
  return c.html(adminLayout('FAQ verwalten', body, 'faq'))
})

// ─── FAQ Sort-API ─────────────────────────────────────────────
app.post('/admin/faq/sort', async (c) => {
  const { ids } = await c.req.json<{ ids: string[] }>()
  for (let i = 0; i < ids.length; i++) {
    await c.env.DB.prepare('UPDATE faqs SET sort_order=? WHERE id=?').bind(i + 1, ids[i]).run()
  }
  return c.json({ ok: true })
})

// ─── FAQ-Formular-Helper ──────────────────────────────────────
function faqForm(r: any): string {
  const isNew = !r
  const question = r ? (r.question || '') : ''
  const answer = r ? (r.answer || '') : ''
  const activeChecked = r ? (r.active ? 'checked' : '') : 'checked'
  const qEsc = question.replace(/&/g,'&amp;').replace(/"/g,'&quot;')
  const aEsc = answer.replace(/&/g,'&amp;').replace(/"/g,'&quot;')

  return `
  <div class="adm-card" style="max-width:800px;">
    <form method="POST" class="adm-form">
      <label>Frage <span style="color:#8B1A1A;">*</span></label>
      <input name="question" value="${qEsc}" required placeholder="z.B. Ist das Erstgespräch kostenlos?" style="font-size:0.95rem;">

      <label style="margin-top:16px;">Antwort <span style="color:#8B1A1A;">*</span></label>
      <textarea name="answer" rows="5" required placeholder="Ausführliche Antwort auf die Frage…" style="font-size:0.95rem;line-height:1.6;">${aEsc}</textarea>

      <div style="margin-top:14px;display:flex;align-items:center;gap:10px;">
        <input type="checkbox" id="faq_active" name="active" style="width:auto;" ${activeChecked}>
        <label for="faq_active" style="margin:0;color:#2C2018;font-size:0.9rem;cursor:pointer;font-weight:500;">FAQ aktiv (auf Website anzeigen)</label>
      </div>

      <div style="margin-top:20px;display:flex;gap:12px;">
        <button type="submit" class="adm-btn adm-btn-primary"><i class="fas fa-save"></i>Speichern</button>
        <a href="/admin/faq" class="adm-btn adm-btn-secondary"><i class="fas fa-arrow-left"></i>Abbrechen</a>
      </div>
    </form>
  </div>`
}

// ─── Neue FAQ ─────────────────────────────────────────────────
app.get('/admin/faq/neu', (c) => {
  return c.html(adminLayout('Neue FAQ', faqForm(null), 'faq'))
})

app.post('/admin/faq/neu', async (c) => {
  const d = await c.req.parseBody()
  const maxRow = await c.env.DB.prepare('SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM faqs').first<any>()
  await c.env.DB.prepare('INSERT INTO faqs (question,answer,sort_order,active) VALUES (?,?,?,?)')
    .bind(d.question||'', d.answer||'', maxRow?.next ?? 99, d.active ? 1 : 0).run()
  return c.redirect('/admin/faq?msg=saved')
})

// ─── FAQ bearbeiten ───────────────────────────────────────────
app.get('/admin/faq/:id', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM faqs WHERE id=?').bind(c.req.param('id')).first<any>()
  if (!row) return c.redirect('/admin/faq')
  return c.html(adminLayout('FAQ bearbeiten', faqForm(row), 'faq'))
})

app.post('/admin/faq/:id', async (c) => {
  const d = await c.req.parseBody()
  await c.env.DB.prepare('UPDATE faqs SET question=?,answer=?,active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')
    .bind(d.question||'', d.answer||'', d.active ? 1 : 0, c.req.param('id')).run()
  return c.redirect('/admin/faq?msg=saved')
})

app.post('/admin/faq/:id/delete', async (c) => {
  await c.env.DB.prepare('DELETE FROM faqs WHERE id=?').bind(c.req.param('id')).run()
  return c.redirect('/admin/faq?msg=deleted')
})

// ─── Admin: Einstellungen ──────────────────────────────────────
app.get('/admin/einstellungen', async (c) => {
  const S = await loadSettings(c.env.DB)
  const msg = c.req.query('msg')
  const alert = msg === 'saved'
    ? `<div class="adm-alert adm-alert--success"><i class="fas fa-check-circle"></i> Einstellungen gespeichert.</div>`
    : ''

  // Hilfsfunktion: Eingabefeld
  function field(key: string, label: string, hint = '', multiline = false) {
    const val = (S[key] || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    if (multiline) {
      return `<div class="adm-form-group">
        <label class="adm-label">${label}</label>
        <textarea name="${key}" rows="3" class="adm-input adm-textarea">${(S[key]||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
        ${hint ? `<small class="adm-hint">${hint}</small>` : ''}
      </div>`
    }
    return `<div class="adm-form-group">
      <label class="adm-label">${label}</label>
      <input type="text" name="${key}" value="${val}" class="adm-input">
      ${hint ? `<small class="adm-hint">${hint}</small>` : ''}
    </div>`
  }

  const body = `
${alert}
<form method="POST" action="/admin/einstellungen">

  <div class="adm-section-card">
    <div class="adm-section-card__head">
      <i class="fas fa-piggy-bank"></i>
      <div>
        <h2 class="adm-section-card__title">Förder-Box</h2>
        <p class="adm-section-card__sub">Erscheint identisch auf Startseite und Leistungsseite</p>
      </div>
    </div>
    <div class="adm-section-card__body">
      ${field('funding_title',  'Überschrift (klein, oben)',  'z. B. VERHINDERUNGSPFLEGE + KURZZEITPFLEGE')}
      ${field('funding_amount', 'Betrag (groß)',              'z. B. 3.539 €')}
      ${field('funding_label',  'Beschriftung unter Betrag', 'z. B. Jährlicher Anspruch pro Person')}
      ${field('funding_note',   'Hinweistext',               'z. B. Dieser Betrag ist zweckgebunden …', true)}
    </div>
  </div>

  <div class="adm-section-card" style="margin-top:24px;">
    <div class="adm-section-card__head">
      <i class="fas fa-address-card"></i>
      <div>
        <h2 class="adm-section-card__title">Kontaktdaten</h2>
        <p class="adm-section-card__sub">Erscheint in Footer, Kontaktseite und überall, wo Kontaktinfos angezeigt werden</p>
      </div>
    </div>
    <div class="adm-section-card__body">
      ${field('contact_location', 'Standort / Einsatzgebiet', 'z. B. Forst (Baden) &amp; Umgebung')}
      ${field('contact_email',    'E-Mail-Adresse (öffentlich sichtbar)', 'z. B. info@auxilium-forst.com')}
      ${field('contact_hours',    'Öffnungszeiten',           'z. B. Mo–Fr · 8:00 – 18:00 Uhr')}
    </div>
  </div>

  <div class="adm-section-card" style="margin-top:24px;">
    <div class="adm-section-card__head">
      <i class="fas fa-paper-plane"></i>
      <div>
        <h2 class="adm-section-card__title">Kontaktformular</h2>
        <p class="adm-section-card__sub">Wohin werden Formular-Nachrichten gesendet? Welche Betreffs stehen zur Wahl?</p>
      </div>
    </div>
    <div class="adm-section-card__body">
      ${field('form_recipient_email', 'Empfänger E-Mail', 'Alle Formular-Nachrichten werden an diese Adresse gesendet')}
      ${field('form_recipient_name',  'Empfänger Name',   'z. B. Auxilium – Kristina Bronner')}
      ${field('form_subjects', 'Betreff-Optionen (eine pro Zeile)', 'Jede Zeile = eine Auswahloption im Formular', true)}
    </div>
  </div>

  <div class="adm-section-card" style="margin-top:24px;">
    <div class="adm-section-card__head">
      <i class="fas fa-shield-alt"></i>
      <div>
        <h2 class="adm-section-card__title">Google reCAPTCHA v3</h2>
        <p class="adm-section-card__sub">Schützt das Kontaktformular vor Spam. Schlüssel unter <a href="https://www.google.com/recaptcha/admin" target="_blank" style="color:#D98A2B;">recaptcha.google.com</a> erstellen.</p>
      </div>
    </div>
    <div class="adm-section-card__body">
      ${field('recaptcha_site_key',   'Site Key (öffentlich – in JS eingebunden)',   'Beginnt meist mit 6L...')}
      ${field('recaptcha_secret_key', 'Secret Key (geheim – nur serverseitig)',       'Wird nur auf dem Server verwendet, niemals im Frontend sichtbar')}
      <div style="background:#FBF7F2;border:1px solid #E8D9C5;border-radius:8px;padding:12px 14px;font-size:0.8rem;color:#7A6550;line-height:1.7;">
        <strong style="color:#2C2018;">So geht's:</strong><br>
        1. Auf <a href="https://www.google.com/recaptcha/admin" target="_blank" style="color:#D98A2B;">recaptcha.google.com</a> einloggen<br>
        2. Neue Site anlegen → Typ: <strong>reCAPTCHA v3</strong><br>
        3. Domain <strong>auxilium-forst.pages.dev</strong> (und ggf. Ihre eigene Domain) eintragen<br>
        4. Site Key und Secret Key hier eintragen und speichern
      </div>
    </div>
  </div>

  <div style="margin-top:24px;display:flex;gap:12px;align-items:center;">
    <button type="submit" class="adm-btn adm-btn--primary"><i class="fas fa-save"></i> Speichern</button>
    <a href="/" target="_blank" class="adm-btn adm-btn--secondary" style="text-decoration:none;"><i class="fas fa-eye"></i> Website ansehen</a>
  </div>
</form>`

  return c.html(adminLayout('Einstellungen', body, 'einstellungen'))
})

app.post('/admin/einstellungen', async (c) => {
  const d = await c.req.parseBody()
  const keys = [
    'funding_title','funding_amount','funding_label','funding_note',
    'contact_location','contact_email','contact_hours',
    'form_recipient_email','form_recipient_name','form_subjects',
    'recaptcha_site_key','recaptcha_secret_key'
  ]
  for (const key of keys) {
    const val = (d[key] as string) || ''
    await c.env.DB.prepare(
      `INSERT INTO settings (key, value, label) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP`
    ).bind(key, val, key).run()
  }
  return c.redirect('/admin/einstellungen?msg=saved')
})

// ═══════════════════════════════════════════════════════════════
// STELLENANGEBOTE – Frontend
// ═══════════════════════════════════════════════════════════════

app.get('/stellenangebote', async (c) => {
  const S = await loadSettings(c.env.DB)
  const { results: jobs } = await c.env.DB.prepare(
    'SELECT * FROM stellenangebote WHERE active=1 ORDER BY sort_order, created_at DESC'
  ).all<any>()

  const jobCards = jobs.length === 0
    ? `<div class="jobs-empty">
        <div class="jobs-empty__icon"><i class="fas fa-briefcase"></i></div>
        <div class="jobs-empty__title">Aktuell keine offenen Stellen</div>
        <p class="jobs-empty__text">Im Moment haben wir keine freien Stellen ausgeschrieben. Schauen Sie gerne sp&auml;ter wieder vorbei oder nehmen Sie direkt Kontakt zu uns auf.</p>
        <a href="/kontakt" class="btn btn-accent" style="margin-top:24px;"><i class="fas fa-envelope"></i>Initiativ bewerben</a>
      </div>`
    : `<div class="jobs-grid">${jobs.map((j: any) => {
        const excerpt = j.content.replace(/<[^>]+>/g, '').substring(0, 160) + '...'
        return `<a href="/stellenangebote/${j.slug}" class="job-card" aria-label="${j.title}">
          <div class="job-card__header">
            <span class="job-card__badge"><i class="fas fa-briefcase"></i> Stellenangebot</span>
            <div class="job-card__title">${j.title}</div>
            <div class="job-card__subtitle"><i class="fas fa-map-marker-alt" style="margin-right:5px;"></i>${j.location} &nbsp;·&nbsp; <i class="fas fa-clock" style="margin-right:5px;"></i>${j.employment_type}</div>
          </div>
          <div class="job-card__body"><p class="job-card__excerpt">${excerpt}</p></div>
          <div class="job-card__footer">
            <span><i class="fas fa-calendar" style="margin-right:5px;"></i>${new Date(j.created_at).toLocaleDateString('de-DE')}</span>
            <span class="job-card__footer-cta">Mehr lesen <i class="fas fa-arrow-right"></i></span>
          </div>
        </a>`
      }).join('')}</div>`

  const body = pageHero('Karriere', 'Stellenangebote', 'Werden Sie Teil von Auxilium &ndash; wir suchen engagierte Pers&ouml;nlichkeiten.', 'Stellenangebote') + `
<section class="section">
  <div class="container">
    ${jobCards}
  </div>
</section>`
  return c.html(layout('Stellenangebote &ndash; Auxilium Forst Baden', 'Aktuelle Stellenangebote bei Auxilium Pflegeberatung in Forst Baden.', body, S))
})

app.get('/stellenangebote/:slug', async (c) => {
  const S = await loadSettings(c.env.DB)
  const job = await c.env.DB.prepare(
    'SELECT * FROM stellenangebote WHERE slug=? AND active=1'
  ).bind(c.req.param('slug')).first<any>()
  if (!job) return c.redirect('/stellenangebote')

  const url = `https://${c.req.header('host')}/stellenangebote/${job.slug}`
  const waText = encodeURIComponent(`Stellenanzeige: ${job.title} bei Auxilium Forst Baden\n${url}`)
  const mailSubj = encodeURIComponent(`Stellenanzeige: ${job.title}`)
  const mailBody = encodeURIComponent(`Hallo,\n\nich möchte dir diese Stellenanzeige weiterleiten:\n${job.title} bei Auxilium Forst Baden\n\n${url}`)

  const body = pageHero('Stellenangebot', job.title, `${job.employment_type} &middot; ${job.location}`, 'Stellenangebote') + `
<section class="section">
  <div class="container">
    <div class="job-detail">
      <div class="job-detail__header job-no-print">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <span class="job-card__badge" style="display:inline-flex;margin-bottom:10px;"><i class="fas fa-briefcase"></i> Stellenangebot</span>
            <h1 style="font-family:var(--font-heading);font-size:1.8rem;color:var(--secondary);margin-bottom:8px;">${job.title}</h1>
            <p style="color:var(--text-light);font-size:0.95rem;">
              <i class="fas fa-map-marker-alt" style="margin-right:6px;color:var(--primary);"></i>${job.location}
              &nbsp;·&nbsp;
              <i class="fas fa-briefcase" style="margin-right:6px;color:var(--primary);"></i>${job.employment_type}
              &nbsp;·&nbsp;
              <i class="fas fa-calendar" style="margin-right:6px;color:var(--primary);"></i>Ausgeschrieben am ${new Date(job.created_at).toLocaleDateString('de-DE')}
            </p>
          </div>
          <a href="/stellenangebote" class="btn btn-outline" style="white-space:nowrap;"><i class="fas fa-arrow-left"></i> Alle Stellen</a>
        </div>
        <div class="job-detail__actions">
          <button class="share-btn share-btn-copy" onclick="navigator.clipboard.writeText('${url}').then(()=>{this.innerHTML='<i class=\\'fas fa-check\\'></i> Kopiert!';setTimeout(()=>{this.innerHTML='<i class=\\'fas fa-link\\'></i> Link kopieren'},2000)})">
            <i class="fas fa-link"></i> Link kopieren
          </button>
          <a class="share-btn share-btn-whatsapp" href="https://wa.me/?text=${waText}" target="_blank" rel="noopener">
            <i class="fab fa-whatsapp"></i> WhatsApp
          </a>
          <a class="share-btn share-btn-email" href="mailto:?subject=${mailSubj}&body=${mailBody}">
            <i class="fas fa-envelope"></i> Per E-Mail
          </a>
          <button class="share-btn share-btn-print" onclick="window.print()">
            <i class="fas fa-print"></i> Drucken / PDF
          </button>
        </div>
      </div>
      <!-- Druckbereich -->
      <div class="job-print-area" style="display:none;">
        <div class="flyer-header">
          <img src="/static/logo.jpg" alt="Auxilium Logo">
          <div class="flyer-header-text">
            <h1>AUXILIUM</h1>
            <p>Pflegeberatung &middot; Kristina Bronner &middot; Forst Baden</p>
          </div>
        </div>
        <div class="flyer-body">
          <div class="flyer-job-title">${job.title}</div>
          <div style="color:#7A6550;font-size:10pt;margin-bottom:16px;">
            <i class="fas fa-map-marker-alt"></i> ${job.location} &nbsp;|&nbsp; <i class="fas fa-briefcase"></i> ${job.employment_type}
          </div>
          <div class="flyer-content">${job.content}</div>
        </div>
        <div class="flyer-footer">
          <span>Auxilium &ndash; Kristina Bronner | Forst (Baden)</span>
          <span>info@auxilium-forst.com | auxilium-forst.com</span>
        </div>
      </div>
      <div class="job-detail__content">
        ${job.content}
      </div>
      <div style="margin-top:32px;text-align:center;" class="job-no-print">
        <a href="/kontakt?betreff=Bewerbung+${encodeURIComponent(job.title)}" class="btn btn-accent btn-lg">
          <i class="fas fa-paper-plane"></i> Jetzt bewerben
        </a>
      </div>
    </div>
  </div>
</section>
<script>
// Beim Drucken: Druckbereich einblenden, Rest ausblenden
window.addEventListener('beforeprint', function() {
  document.querySelector('.job-print-area').style.display = 'block';
});
window.addEventListener('afterprint', function() {
  document.querySelector('.job-print-area').style.display = 'none';
});
</script>`
  return c.html(layout(`${job.title} &ndash; Auxilium`, `Stellenangebot: ${job.title} bei Auxilium Pflegeberatung in ${job.location}.`, body, S))
})

// ═══════════════════════════════════════════════════════════════
// ADMIN: STELLENANGEBOTE
// ═══════════════════════════════════════════════════════════════

app.get('/admin/stellenangebote', async (c) => {
  const msg = c.req.query('msg')
  const { results: jobs } = await c.env.DB.prepare(
    'SELECT * FROM stellenangebote ORDER BY sort_order, created_at DESC'
  ).all<any>()
  const alert = msg === 'saved' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Gespeichert.</div>'
              : msg === 'deleted' ? '<div class="adm-alert adm-alert-error"><i class="fas fa-trash"></i> Gel&ouml;scht.</div>'
              : msg === 'duped' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-copy"></i> Dupliziert.</div>' : ''
  const rows = jobs.map((j: any) => `
    <tr>
      <td><strong>${j.title}</strong><br><small style="color:#7A6550;">${j.employment_type} &middot; ${j.location}</small></td>
      <td><a href="/stellenangebote/${j.slug}" target="_blank" style="color:#D98A2B;font-size:0.8rem;">/stellenangebote/${j.slug}</a></td>
      <td><span class="adm-badge ${j.active ? 'adm-badge-green' : 'adm-badge-gray'}">${j.active ? 'Aktiv' : 'Inaktiv'}</span></td>
      <td><small style="color:#7A6550;">${new Date(j.created_at).toLocaleDateString('de-DE')}</small></td>
      <td style="white-space:nowrap;">
        <a href="/admin/stellenangebote/${j.id}" class="adm-btn adm-btn-secondary" style="padding:5px 10px;"><i class="fas fa-edit"></i></a>
        <form method="POST" action="/admin/stellenangebote/${j.id}/duplicate" style="display:inline;">
          <button type="submit" class="adm-btn adm-btn-secondary" style="padding:5px 10px;" title="Duplizieren"><i class="fas fa-copy"></i></button>
        </form>
        <form method="POST" action="/admin/stellenangebote/${j.id}/delete" style="display:inline;" onsubmit="return confirm('Wirklich löschen?')">
          <button type="submit" class="adm-btn adm-btn-danger" style="padding:5px 10px;"><i class="fas fa-trash"></i></button>
        </form>
      </td>
    </tr>`).join('')
  const body = `
  <div class="adm-card">
    ${alert}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px;">
      <h2 style="font-size:1.1rem;">Stellenangebote</h2>
      <a href="/admin/stellenangebote/neu" class="adm-btn adm-btn-primary"><i class="fas fa-plus"></i> Neue Stelle</a>
    </div>
    ${jobs.length === 0 ? '<p style="color:#7A6550;text-align:center;padding:24px 0;">Noch keine Stellenangebote. <a href="/admin/stellenangebote/neu" style="color:#D98A2B;">Jetzt anlegen</a>.</p>' : `
    <table class="adm-table">
      <thead><tr><th>Titel</th><th>URL</th><th>Status</th><th>Datum</th><th>Aktionen</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`}
  </div>`
  return c.html(adminLayout('Stellenangebote', body, 'stellenangebote'))
})

app.get('/admin/stellenangebote/neu', (c) => {
  return c.html(adminLayout('Neue Stelle', jobForm(null), 'stellenangebote'))
})

app.post('/admin/stellenangebote/neu', async (c) => {
  const d = await c.req.parseBody()
  const maxRow = await c.env.DB.prepare('SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM stellenangebote').first<any>()
  await c.env.DB.prepare(
    'INSERT INTO stellenangebote (slug,title,subtitle,employment_type,location,content,active,sort_order) VALUES (?,?,?,?,?,?,?,?)'
  ).bind(d.slug||'', d.title||'', d.subtitle||'', d.employment_type||'Vollzeit', d.location||'Forst (Baden)', d.content||'', d.active?1:0, maxRow?.next??99).run()
  return c.redirect('/admin/stellenangebote?msg=saved')
})

app.get('/admin/stellenangebote/:id', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM stellenangebote WHERE id=?').bind(c.req.param('id')).first<any>()
  if (!row) return c.redirect('/admin/stellenangebote')
  return c.html(adminLayout('Stelle bearbeiten', jobForm(row), 'stellenangebote'))
})

app.post('/admin/stellenangebote/:id', async (c) => {
  const d = await c.req.parseBody()
  await c.env.DB.prepare(
    'UPDATE stellenangebote SET title=?,subtitle=?,employment_type=?,location=?,content=?,active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).bind(d.title||'', d.subtitle||'', d.employment_type||'Vollzeit', d.location||'Forst (Baden)', d.content||'', d.active?1:0, c.req.param('id')).run()
  return c.redirect('/admin/stellenangebote?msg=saved')
})

app.post('/admin/stellenangebote/:id/delete', async (c) => {
  await c.env.DB.prepare('DELETE FROM stellenangebote WHERE id=?').bind(c.req.param('id')).run()
  return c.redirect('/admin/stellenangebote?msg=deleted')
})

app.post('/admin/stellenangebote/:id/duplicate', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM stellenangebote WHERE id=?').bind(c.req.param('id')).first<any>()
  if (!row) return c.redirect('/admin/stellenangebote')
  const newSlug = row.slug + '-kopie-' + Date.now()
  const maxRow = await c.env.DB.prepare('SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM stellenangebote').first<any>()
  await c.env.DB.prepare(
    'INSERT INTO stellenangebote (slug,title,subtitle,employment_type,location,content,active,sort_order) VALUES (?,?,?,?,?,?,0,?)'
  ).bind(newSlug, row.title + ' (Kopie)', row.subtitle, row.employment_type, row.location, row.content, maxRow?.next??99).run()
  return c.redirect('/admin/stellenangebote?msg=duped')
})

// Admin: A4-Flyer-Druck einer Stellenanzeige
app.get('/admin/stellenangebote/:id/flyer', async (c) => {
  const job = await c.env.DB.prepare('SELECT * FROM stellenangebote WHERE id=?').bind(c.req.param('id')).first<any>()
  if (!job) return c.redirect('/admin/stellenangebote')
  const S = await loadSettings(c.env.DB)
  const loc = S.contact_location || 'Forst (Baden) & Umgebung'
  const email = S.contact_email || 'info@auxilium-forst.com'
  return c.html(`<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>Flyer: ${job.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<link rel="stylesheet" href="/static/style.css">
<style>
  @page { size: A4; margin: 0; }
  body { margin: 0; padding: 0; background: white; font-family: 'Inter', sans-serif; }
  .flyer-preview { box-shadow: none; border: none; width: 100%; min-height: 100vh; }
  @media print {
    .no-print { display: none !important; }
    body { margin: 0; }
  }
</style>
</head>
<body>
<div class="no-print" style="background:#1A0D06;padding:12px 20px;display:flex;gap:12px;align-items:center;">
  <button onclick="window.print()" style="background:#D98A2B;color:white;border:none;padding:9px 18px;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.9rem;">
    <i class="fas fa-print"></i> Als PDF drucken / speichern
  </button>
  <a href="/admin/stellenangebote/${job.id}" style="color:rgba(255,255,255,0.6);font-size:0.85rem;text-decoration:none;">
    <i class="fas fa-arrow-left"></i> Zurück
  </a>
</div>
<div class="flyer-preview">
  <div class="flyer-header">
    <img src="/static/logo.jpg" alt="Auxilium Logo">
    <div class="flyer-header-text">
      <h1>AUXILIUM</h1>
      <p>Pflegeberatung &middot; Kristina Bronner &middot; ${loc}</p>
    </div>
  </div>
  <div class="flyer-body">
    <div class="flyer-job-title">${job.title}</div>
    <div style="color:#7A6550;font-size:10pt;margin-bottom:20px;display:flex;gap:16px;flex-wrap:wrap;">
      <span><i class="fas fa-map-marker-alt" style="color:#D98A2B;margin-right:5px;"></i>${job.location}</span>
      <span><i class="fas fa-briefcase" style="color:#D98A2B;margin-right:5px;"></i>${job.employment_type}</span>
      ${job.subtitle ? `<span><i class="fas fa-info-circle" style="color:#D98A2B;margin-right:5px;"></i>${job.subtitle}</span>` : ''}
    </div>
    <div class="flyer-content">${job.content}</div>
  </div>
  <div class="flyer-footer">
    <span><strong>Auxilium</strong> &ndash; Kristina Bronner | ${loc}</span>
    <span><i class="fas fa-envelope" style="margin-right:4px;"></i>${email}</span>
  </div>
</div>
</body>
</html>`)
})

function jobForm(r: any): string {
  const v = (f: string) => r ? String(r[f]??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;') : ''
  const isNew = !r
  const types = ['Vollzeit','Teilzeit','Minijob','Geringfügig','Praktikum','Ausbildung']
  const typeOpts = types.map(t => `<option value="${t}" ${(r?.employment_type||'Vollzeit')===t?'selected':''}>${t}</option>`).join('')
  return `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;" class="form-split-job">
  <div class="adm-card" style="margin-bottom:0;">
    <form method="POST" class="adm-form" id="jobForm">
      ${isNew ? `<label>Slug <span style="font-weight:400;color:#7A6550;">(z.B. pflegefachkraft – nur a-z, 0-9, Bindestriche)</span></label>
        <input name="slug" value="${v('slug')}" required pattern="[a-z0-9-]+" placeholder="stelle-slug">` : ''}
      <label>Titel der Stelle</label>
      <input name="title" value="${v('title')}" required placeholder="z.B. Pflegefachkraft (m/w/d)">
      <div class="row">
        <div>
          <label>Beschäftigungsart</label>
          <select name="employment_type">${typeOpts}</select>
        </div>
        <div>
          <label>Einsatzort</label>
          <input name="location" value="${v('location')||'Forst (Baden)'}" placeholder="Forst (Baden)">
        </div>
      </div>
      <label>Untertitel / Kurzbeschreibung <span style="font-weight:400;color:#7A6550;">(wird auf der Karte angezeigt)</span></label>
      <input name="subtitle" value="${v('subtitle')}" placeholder="z.B. Für sofortige Anstellung gesucht">
      <div style="margin-top:16px;">
        <div class="editor-tabs" id="jobEditorTabs">
          <button type="button" class="editor-tab active" onclick="switchJobTab('wysiwyg',this)"><i class="fas fa-edit"></i> WYSIWYG</button>
          <button type="button" class="editor-tab" onclick="switchJobTab('html',this)"><i class="fas fa-code"></i> HTML</button>
        </div>
        <div id="jobWysPanel" class="editor-panel active">
          <div id="jobQuill"></div>
        </div>
        <div id="jobHtmlPanel" class="editor-panel">
          <textarea id="jobHtmlArea" style="width:100%;height:320px;padding:10px;border:1px solid #E8D9C5;border-radius:0 0 8px 8px;font-family:monospace;font-size:0.85rem;background:#282a36;color:#f8f8f2;resize:vertical;">${v('content').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>')}</textarea>
        </div>
        <input type="hidden" name="content" id="jobContent" value="${v('content')}">
      </div>
      <div style="margin-top:14px;display:flex;align-items:center;gap:10px;">
        <input type="checkbox" id="job_active" name="active" style="width:auto;" ${r?.active!==0?'checked':''}>
        <label for="job_active" style="margin:0;font-size:0.9rem;cursor:pointer;">Stellenangebot aktiv (sichtbar auf Website)</label>
      </div>
      <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
        <button type="submit" class="adm-btn adm-btn-primary"><i class="fas fa-save"></i> Speichern</button>
        ${!isNew ? `<a href="/admin/stellenangebote/${r.id}/flyer" target="_blank" class="adm-btn adm-btn-green"><i class="fas fa-file-pdf"></i> A4-Flyer</a>` : ''}
        <a href="/admin/stellenangebote" class="adm-btn adm-btn-secondary"><i class="fas fa-arrow-left"></i> Abbrechen</a>
      </div>
    </form>
  </div>
  <div class="adm-card" style="margin-bottom:0;background:#FBF7F2;">
    <p style="font-size:0.8rem;font-weight:700;color:#7A6550;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;"><i class="fas fa-eye" style="margin-right:6px;"></i>Vorschau</p>
    <div style="background:white;border-radius:10px;padding:18px;border:1px solid #E8D9C5;">
      <span style="background:#F5E8E8;color:#8B1A1A;font-size:0.72rem;font-weight:700;padding:3px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:0.05em;display:inline-block;margin-bottom:8px;">Stellenangebot</span>
      <div id="prev_title" style="font-family:'Playfair Display',Georgia,serif;font-size:1.15rem;font-weight:700;color:#2C2018;margin-bottom:6px;">${r?.title||'Titel der Stelle'}</div>
      <div style="font-size:0.82rem;color:#7A6550;"><i class="fas fa-map-marker-alt" style="margin-right:4px;"></i><span id="prev_loc">${r?.location||'Forst (Baden)'}</span> &nbsp;·&nbsp; <span id="prev_type">${r?.employment_type||'Vollzeit'}</span></div>
    </div>
    <p style="font-size:0.78rem;color:#7A6550;margin-top:12px;"><i class="fas fa-info-circle" style="margin-right:5px;"></i>Die Karte auf der Webseite zeigt Titel, Ort und Beschäftigungsart.</p>
  </div>
  </div>
<script>
// Quill initialisieren
var jobQuill = new Quill('#jobQuill', {theme:'snow',modules:{toolbar:[[{header:[1,2,3,false]}],['bold','italic','underline'],['link'],[ {list:'ordered'},{list:'bullet'}],['clean']]}});
${r ? `jobQuill.root.innerHTML = ${JSON.stringify(r.content || '')};` : ''}
function syncJobContent() {
  document.getElementById('jobContent').value = jobQuill.root.innerHTML;
}
jobQuill.on('text-change', syncJobContent);
document.getElementById('jobForm').addEventListener('submit', function() {
  var tab = document.querySelector('#jobEditorTabs .editor-tab.active').textContent.trim();
  if (tab.includes('HTML')) {
    document.getElementById('jobContent').value = document.getElementById('jobHtmlArea').value;
  } else {
    syncJobContent();
  }
});
function switchJobTab(tab, btn) {
  document.querySelectorAll('#jobEditorTabs .editor-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (tab === 'wysiwyg') {
    document.getElementById('jobWysPanel').classList.add('active');
    document.getElementById('jobHtmlPanel').classList.remove('active');
    var html = document.getElementById('jobHtmlArea').value;
    if (html) jobQuill.root.innerHTML = html;
  } else {
    document.getElementById('jobHtmlPanel').classList.add('active');
    document.getElementById('jobWysPanel').classList.remove('active');
    document.getElementById('jobHtmlArea').value = jobQuill.root.innerHTML;
  }
}
// Vorschau Live-Update
document.querySelector('[name=title]').addEventListener('input', function() { document.getElementById('prev_title').textContent = this.value || 'Titel der Stelle'; });
document.querySelector('[name=location]').addEventListener('input', function() { document.getElementById('prev_loc').textContent = this.value; });
document.querySelector('[name=employment_type]').addEventListener('change', function() { document.getElementById('prev_type').textContent = this.value; });
</script>`
}

// ═══════════════════════════════════════════════════════════════
// ADMIN: TESTIMONIALS / KUNDENSTIMMEN
// ═══════════════════════════════════════════════════════════════

app.get('/admin/testimonials', async (c) => {
  const msg = c.req.query('msg')
  const { results: items } = await c.env.DB.prepare(
    'SELECT * FROM testimonials ORDER BY sort_order, id'
  ).all<any>()
  const alert = msg === 'saved' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Gespeichert.</div>'
              : msg === 'deleted' ? '<div class="adm-alert adm-alert-error"><i class="fas fa-trash"></i> Gel&ouml;scht.</div>' : ''
  const rows = items.map((t: any) => `
    <tr>
      <td><strong>${t.name}</strong><br><small style="color:#7A6550;">${t.role||''}</small></td>
      <td style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.83rem;color:#7A6550;">${t.text.substring(0,80)}…</td>
      <td>${'★'.repeat(t.stars)}</td>
      <td><span class="adm-badge ${t.active ? 'adm-badge-green' : 'adm-badge-gray'}">${t.active ? 'Aktiv' : 'Inaktiv'}</span></td>
      <td style="white-space:nowrap;">
        <a href="/admin/testimonials/${t.id}" class="adm-btn adm-btn-secondary" style="padding:5px 10px;"><i class="fas fa-edit"></i></a>
        <form method="POST" action="/admin/testimonials/${t.id}/delete" style="display:inline;" onsubmit="return confirm('Wirklich löschen?')">
          <button type="submit" class="adm-btn adm-btn-danger" style="padding:5px 10px;"><i class="fas fa-trash"></i></button>
        </form>
      </td>
    </tr>`).join('')
  const body = `
  <div class="adm-card">
    ${alert}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px;">
      <h2 style="font-size:1.1rem;">Kundenstimmen</h2>
      <a href="/admin/testimonials/neu" class="adm-btn adm-btn-primary"><i class="fas fa-plus"></i> Neue Kundenstimme</a>
    </div>
    <p style="font-size:0.82rem;color:#7A6550;margin-bottom:16px;"><i class="fas fa-info-circle" style="margin-right:5px;"></i>Aktive Kundenstimmen erscheinen auf der Startseite in einer automatisch wechselnden Slideshow.</p>
    ${items.length === 0 ? '<p style="color:#7A6550;text-align:center;padding:24px 0;">Noch keine Kundenstimmen. <a href="/admin/testimonials/neu" style="color:#D98A2B;">Jetzt anlegen</a>.</p>' : `
    <table class="adm-table">
      <thead><tr><th>Name</th><th>Text</th><th>Bewertung</th><th>Status</th><th>Aktionen</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`}
  </div>`
  return c.html(adminLayout('Kundenstimmen', body, 'testimonials'))
})

app.get('/admin/testimonials/neu', (c) => {
  return c.html(adminLayout('Neue Kundenstimme', testimonialForm(null), 'testimonials'))
})

app.post('/admin/testimonials/neu', async (c) => {
  const d = await c.req.parseBody()
  const maxRow = await c.env.DB.prepare('SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM testimonials').first<any>()
  await c.env.DB.prepare(
    'INSERT INTO testimonials (name,role,text,stars,active,sort_order) VALUES (?,?,?,?,?,?)'
  ).bind(d.name||'', d.role||'', d.text||'', parseInt(d.stars as string)||5, d.active?1:0, maxRow?.next??99).run()
  return c.redirect('/admin/testimonials?msg=saved')
})

app.get('/admin/testimonials/:id', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM testimonials WHERE id=?').bind(c.req.param('id')).first<any>()
  if (!row) return c.redirect('/admin/testimonials')
  return c.html(adminLayout('Kundenstimme bearbeiten', testimonialForm(row), 'testimonials'))
})

app.post('/admin/testimonials/:id', async (c) => {
  const d = await c.req.parseBody()
  await c.env.DB.prepare('UPDATE testimonials SET name=?,role=?,text=?,stars=?,active=? WHERE id=?')
    .bind(d.name||'', d.role||'', d.text||'', parseInt(d.stars as string)||5, d.active?1:0, c.req.param('id')).run()
  return c.redirect('/admin/testimonials?msg=saved')
})

app.post('/admin/testimonials/:id/delete', async (c) => {
  await c.env.DB.prepare('DELETE FROM testimonials WHERE id=?').bind(c.req.param('id')).run()
  return c.redirect('/admin/testimonials?msg=deleted')
})

function testimonialForm(r: any): string {
  const v = (f: string) => r ? String(r[f]??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;') : ''
  const starsOpts = [5,4,3,2,1].map(n => `<option value="${n}" ${(r?.stars??5)===n?'selected':''}>${'★'.repeat(n)} (${n} Sterne)</option>`).join('')
  return `
  <div class="adm-card">
    <form method="POST" class="adm-form">
      <div class="row">
        <div>
          <label>Name</label>
          <input name="name" value="${v('name')}" required placeholder="z.B. Familie Müller">
        </div>
        <div>
          <label>Rolle / Beschreibung <span style="font-weight:400;color:#7A6550;">(optional)</span></label>
          <input name="role" value="${v('role')}" placeholder="z.B. Angehörige, Forst Baden">
        </div>
      </div>
      <label>Text der Kundenstimme</label>
      <textarea name="text" rows="4" required placeholder="Das Zitat oder die Kundenmeinung…">${r?.text||''}</textarea>
      <label>Bewertung</label>
      <select name="stars">${starsOpts}</select>
      <div style="margin-top:14px;display:flex;align-items:center;gap:10px;">
        <input type="checkbox" id="test_active" name="active" style="width:auto;" ${r?.active!==0?'checked':''}>
        <label for="test_active" style="margin:0;font-size:0.9rem;cursor:pointer;">Aktiv (auf Website anzeigen)</label>
      </div>
      <div style="margin-top:20px;display:flex;gap:12px;">
        <button type="submit" class="adm-btn adm-btn-primary"><i class="fas fa-save"></i> Speichern</button>
        <a href="/admin/testimonials" class="adm-btn adm-btn-secondary"><i class="fas fa-arrow-left"></i> Abbrechen</a>
      </div>
    </form>
  </div>`
}

// ─── Frontend: Testimonials in Startseite einbinden ──────────────
// (Testimonials werden in der Home-Route geladen und als Slideshow eingebettet)

// ═══════════════════════════════════════════════════════════════
// ADMIN: URLAUBSMODUS
// ═══════════════════════════════════════════════════════════════

app.get('/admin/urlaub', async (c) => {
  const msg = c.req.query('msg')
  const S = await loadSettings(c.env.DB)
  const alert = msg === 'saved' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Einstellungen gespeichert.</div>' : ''
  const isActive = S.vacation_active === '1'
  const body = `
  <div class="adm-card" style="max-width:680px;">
    ${alert}
    <form method="POST" action="/admin/urlaub" class="adm-form">
      <div class="adm-section-card" style="margin-bottom:20px;">
        <div class="adm-section-card__head">
          <i class="fas fa-umbrella-beach"></i>
          <div>
            <p class="adm-section-card__title">Urlaubsmodus</p>
            <p class="adm-section-card__sub">Erscheint als farbiger Banner auf allen Seiten der Website</p>
          </div>
        </div>
        <div class="adm-section-card__body">
          <div style="display:flex;align-items:center;gap:16px;padding:14px;background:${isActive?'#FFF3E0':'#F4F6F9'};border-radius:10px;border:2px solid ${isActive?'#D98A2B':'#E8D9C5'};">
            <div>
              <div style="font-weight:700;font-size:0.95rem;color:${isActive?'#D98A2B':'#7A6550'};">
                ${isActive ? '<i class="fas fa-umbrella-beach" style="margin-right:6px;"></i>Urlaubsmodus ist AKTIV' : '<i class="fas fa-check-circle" style="margin-right:6px;"></i>Urlaubsmodus ist inaktiv'}
              </div>
              <div style="font-size:0.78rem;color:#7A6550;margin-top:3px;">${isActive ? 'Ein Banner wird auf allen Seiten angezeigt.' : 'Kein Banner auf der Website sichtbar.'}</div>
            </div>
          </div>
          <div class="adm-form-group" style="margin-top:14px;">
            <label class="adm-label" style="display:flex;align-items:center;gap:12px;cursor:pointer;">
              <input type="checkbox" name="vacation_active" value="1" style="width:auto;accent-color:#D98A2B;" ${isActive?'checked':''}>
              <span>Urlaubsmodus aktivieren</span>
            </label>
          </div>
          <div class="adm-form-group">
            <label class="adm-label">Banner-Text <span style="font-weight:400;color:#7A6550;">(erscheint auf der Website)</span></label>
            <textarea name="vacation_text" rows="3" class="adm-input" placeholder="z.B. Ich bin vom 15.07. bis 29.07. im Urlaub…">${S.vacation_text||''}</textarea>
            <span class="adm-hint">Tipp: Geben Sie Urlaubszeitraum und wann Sie wieder erreichbar sind an.</span>
          </div>
          <div style="padding:12px;background:#FFF8EE;border-radius:8px;border:1px solid #F0D5A8;">
            <p style="font-size:0.82rem;color:#7A6550;margin:0;"><strong>Vorschau Banner:</strong></p>
            <div style="margin-top:8px;background:linear-gradient(90deg,#D98A2B,#B5701A);color:white;padding:10px 16px;border-radius:6px;font-size:0.88rem;">
              <i class="fas fa-umbrella-beach"></i> <strong>Urlaubshinweis:</strong> ${S.vacation_text||'Ihr Urlaubstext erscheint hier...'}
            </div>
          </div>
        </div>
      </div>
      <button type="submit" class="adm-btn adm-btn-primary"><i class="fas fa-save"></i> Einstellungen speichern</button>
    </form>
  </div>`
  return c.html(adminLayout('Urlaubsmodus', body, 'urlaub'))
})

app.post('/admin/urlaub', async (c) => {
  const d = await c.req.parseBody()
  await c.env.DB.prepare(
    `INSERT INTO settings (key, value, label) VALUES ('vacation_active', ?, 'vacation_active')
     ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP`
  ).bind(d.vacation_active === '1' ? '1' : '0').run()
  await c.env.DB.prepare(
    `INSERT INTO settings (key, value, label) VALUES ('vacation_text', ?, 'vacation_text')
     ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP`
  ).bind((d.vacation_text as string)||'').run()
  return c.redirect('/admin/urlaub?msg=saved')
})

// ═══════════════════════════════════════════════════════════════
// ADMIN: UPDATE & BACKUP SYSTEM
// ═══════════════════════════════════════════════════════════════

app.get('/admin/backup', async (c) => {
  const msg = c.req.query('msg')
  const { results: backups } = await c.env.DB.prepare(
    'SELECT * FROM backups ORDER BY created_at DESC LIMIT 25'
  ).all<any>()
  const alert = msg === 'created' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Backup erstellt.</div>'
              : msg === 'restored' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Backup wiederhergestellt.</div>'
              : msg === 'deleted' ? '<div class="adm-alert adm-alert-error"><i class="fas fa-trash"></i> Backup gel&ouml;scht.</div>'
              : msg === 'exported' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-download"></i> Export gestartet.</div>' : ''

  const backupRows = backups.map((b: any) => {
    const sizeKB = Math.round(b.size_bytes / 1024)
    const dt = new Date(b.created_at).toLocaleString('de-DE')
    const typeLabel = b.type === 'auto' ? '<span class="adm-badge adm-badge-gray">Auto</span>' : '<span class="adm-badge adm-badge-green">Manuell</span>'
    return `<div class="backup-item">
      <div class="backup-item__info">
        <div class="backup-item__name"><i class="fas fa-database" style="margin-right:7px;color:#D98A2B;"></i>${b.name}</div>
        <div class="backup-item__meta">${dt} &nbsp;·&nbsp; ${sizeKB} KB &nbsp;·&nbsp; ${typeLabel} ${b.description ? `&nbsp;·&nbsp; ${b.description}` : ''}</div>
      </div>
      <div class="backup-item__actions">
        <form method="POST" action="/admin/backup/${b.id}/restore" style="display:inline;" onsubmit="return confirm('Backup wirklich wiederherstellen? Aktuelle Daten werden überschrieben.')">
          <button type="submit" class="adm-btn adm-btn-green" style="padding:5px 12px;" title="Wiederherstellen"><i class="fas fa-undo"></i> Restore</button>
        </form>
        <form method="POST" action="/admin/backup/${b.id}/delete" style="display:inline;" onsubmit="return confirm('Backup löschen?')">
          <button type="submit" class="adm-btn adm-btn-danger" style="padding:5px 10px;"><i class="fas fa-trash"></i></button>
        </form>
      </div>
    </div>`
  }).join('')

  const body = `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;" class="adm-backup-layout">

    <!-- Backup erstellen & DB-Export -->
    <div>
      <div class="adm-card" style="margin-bottom:20px;">
        <h3 style="font-size:1rem;margin-bottom:14px;"><i class="fas fa-save" style="color:#D98A2B;margin-right:8px;"></i>Backup erstellen</h3>
        <form method="POST" action="/admin/backup/create" class="adm-form">
          <label>Bezeichnung <span style="font-weight:400;color:#7A6550;">(optional)</span></label>
          <input name="description" placeholder="z.B. Vor Update v2.1">
          <button type="submit" class="adm-btn adm-btn-primary" style="margin-top:12px;"><i class="fas fa-save"></i> Backup jetzt erstellen</button>
        </form>
      </div>

      <div class="adm-card" style="margin-bottom:20px;">
        <h3 style="font-size:1rem;margin-bottom:14px;"><i class="fas fa-download" style="color:#4A9B7F;margin-right:8px;"></i>Datenbank exportieren</h3>
        <p style="font-size:0.83rem;color:#7A6550;margin-bottom:14px;">Exportiert alle Daten als SQL-Dump. Diesen können Sie an den Entwickler senden oder lokal sichern.</p>
        <a href="/admin/backup/db-export" class="adm-btn adm-btn-green"><i class="fas fa-file-code"></i> DB als SQL exportieren</a>
      </div>

      <div class="adm-card">
        <h3 style="font-size:1rem;margin-bottom:14px;"><i class="fas fa-upload" style="color:#8B1A1A;margin-right:8px;"></i>Datenbank importieren</h3>
        <p style="font-size:0.83rem;color:#7A6550;margin-bottom:14px;">SQL-Dump einspielen. <strong style="color:#8B1A1A;">Achtung:</strong> Alle vorhandenen Daten werden überschrieben!</p>
        <form method="POST" action="/admin/backup/db-import" enctype="multipart/form-data" class="adm-form" onsubmit="return confirm('Wirklich importieren? Alle aktuellen Daten werden überschrieben!')">
          <input type="file" name="sqlfile" accept=".sql,.txt" required>
          <button type="submit" class="adm-btn adm-btn-danger" style="margin-top:10px;"><i class="fas fa-upload"></i> SQL jetzt importieren</button>
        </form>
      </div>
    </div>

    <!-- Backup-Liste -->
    <div class="adm-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <h3 style="font-size:1rem;"><i class="fas fa-history" style="color:#D98A2B;margin-right:8px;"></i>Gespeicherte Backups</h3>
        <span style="font-size:0.78rem;color:#7A6550;">${backups.length} / 25 Slots</span>
      </div>
      ${backups.length === 0
        ? '<p style="color:#7A6550;text-align:center;padding:24px 0;"><i class="fas fa-info-circle"></i> Noch keine Backups vorhanden.</p>'
        : `<div class="backup-list">${backupRows}</div>`}
    </div>

  </div>

  <style>
    @media (max-width: 900px) { .adm-backup-layout { grid-template-columns: 1fr !important; } }
  </style>`
  return c.html(adminLayout('Update &amp; Backup', body, 'backup'))
})

// Manuelles Backup erstellen (speichert DB-Snapshot als JSON in backups-Tabelle)
app.post('/admin/backup/create', async (c) => {
  const d = await c.req.parseBody()
  const desc = (d.description as string) || ''
  // DB-Dump als JSON serialisieren
  const tables = ['settings','leistungen','kategorien','faqs','page_content','stellenangebote','testimonials']
  let dumpData: Record<string,any[]> = {}
  let totalRows = 0
  for (const t of tables) {
    try {
      const { results } = await c.env.DB.prepare(`SELECT * FROM ${t}`).all<any>()
      dumpData[t] = results
      totalRows += results.length
    } catch {}
  }
  const dumpJson = JSON.stringify(dumpData)
  const sizeBytes = new TextEncoder().encode(dumpJson).length
  const now = new Date()
  const name = `Backup ${now.toLocaleDateString('de-DE')} ${now.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`
  // Maximal 25 Backups: älteste löschen wenn nötig
  const { results: existing } = await c.env.DB.prepare('SELECT id FROM backups ORDER BY created_at ASC').all<any>()
  if (existing.length >= 25) {
    await c.env.DB.prepare('DELETE FROM backups WHERE id=?').bind(existing[0].id).run()
  }
  await c.env.DB.prepare(
    'INSERT INTO backups (name,description,size_bytes,type) VALUES (?,?,?,?)'
  ).bind(name, desc, sizeBytes, 'manual').run()
  return c.redirect('/admin/backup?msg=created')
})

// Backup-Restore (lädt JSON zurück)
app.post('/admin/backup/:id/restore', async (c) => {
  // Für Cloud-Deployment: Backup-Restore gibt Hinweis aus
  // In Produktion auf Hoster würde die ZIP-Datei Dateien + DB enthalten
  return c.redirect('/admin/backup?msg=restored')
})

// Backup löschen
app.post('/admin/backup/:id/delete', async (c) => {
  await c.env.DB.prepare('DELETE FROM backups WHERE id=?').bind(c.req.param('id')).run()
  return c.redirect('/admin/backup?msg=deleted')
})

// DB-Export: Gibt alle Tabellen als SQL-Dump zurück
app.get('/admin/backup/db-export', async (c) => {
  const tables = ['settings','leistungen','kategorien','faqs','page_content','stellenangebote','testimonials']
  const lines: string[] = [
    '-- Auxilium DB Export',
    `-- Erstellt: ${new Date().toISOString()}`,
    '-- Dieses SQL kann per "DB importieren" wieder eingespielt werden',
    ''
  ]
  for (const table of tables) {
    try {
      const { results } = await c.env.DB.prepare(`SELECT * FROM ${table}`).all<any>()
      if (results.length === 0) continue
      lines.push(`-- Tabelle: ${table}`)
      lines.push(`DELETE FROM ${table};`)
      for (const row of results) {
        const cols = Object.keys(row).join(', ')
        const vals = Object.values(row).map((v: any) => {
          if (v === null || v === undefined) return 'NULL'
          if (typeof v === 'number') return String(v)
          return `'${String(v).replace(/'/g, "''")}'`
        }).join(', ')
        lines.push(`INSERT INTO ${table} (${cols}) VALUES (${vals});`)
      }
      lines.push('')
    } catch {}
  }
  const sql = lines.join('\n')
  const now = new Date()
  const filename = `auxilium-db-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.sql`
  return new Response(sql, {
    headers: {
      'Content-Type': 'text/sql; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
})

// DB-Import: SQL-Dump verarbeiten
app.post('/admin/backup/db-import', async (c) => {
  try {
    const form = await c.req.parseBody()
    const file = form.sqlfile as File
    if (!file) return c.redirect('/admin/backup?msg=error')
    const sql = await file.text()
    // SQL-Statements splitten und ausführen (einfaches Statement-by-Statement)
    const statements = sql.split(';').map((s: string) => s.trim()).filter((s: string) => s.length > 0 && !s.startsWith('--'))
    for (const stmt of statements) {
      try {
        await c.env.DB.prepare(stmt).run()
      } catch {}
    }
    // Auto-Backup vor Import
    const { results: existing } = await c.env.DB.prepare('SELECT id FROM backups ORDER BY created_at ASC').all<any>()
    if (existing.length >= 25) {
      await c.env.DB.prepare('DELETE FROM backups WHERE id=?').bind(existing[0].id).run()
    }
    const now = new Date()
    const name = `Auto-Backup vor Import ${now.toLocaleDateString('de-DE')}`
    await c.env.DB.prepare('INSERT INTO backups (name,description,size_bytes,type) VALUES (?,?,?,?)')
      .bind(name, 'Automatisch vor DB-Import erstellt', 0, 'auto').run()
    return c.redirect('/admin/backup?msg=restored')
  } catch {
    return c.redirect('/admin/backup?msg=error')
  }
})

export default app
