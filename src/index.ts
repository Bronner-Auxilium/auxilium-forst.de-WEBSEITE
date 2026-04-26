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
  // Lade die ersten 3 aktiven Leistungen für die Startseite aus der DB
  const { results: dbLeistungen } = await c.env.DB.prepare(
    'SELECT * FROM leistungen WHERE active=1 ORDER BY sort_order LIMIT 3'
  ).all<any>()

  // Lade aktive FAQs aus der DB
  const { results: dbFaqs } = await c.env.DB.prepare(
    'SELECT * FROM faqs WHERE active=1 ORDER BY sort_order'
  ).all<any>()

  // Lade Einstellungen
  const S = await loadSettings(c.env.DB)

  const faqItems = dbFaqs.map((f: any) => `
      <div class="accordion-item">
        <button class="accordion-toggle" aria-expanded="false">${f.question}<span class="chevron" aria-hidden="true"><i class="fas fa-chevron-down"></i></span></button>
        <div class="accordion-body"><div class="accordion-body__inner">${f.answer}</div></div>
      </div>`).join('\n')

  const homeServiceCards = dbLeistungen.map((r: any) => `
      <article class="service-card">
        <div class="service-card__header">
          <div class="service-card__icon"><i class="fas ${r.icon}" aria-hidden="true"></i></div>
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
          <a href="/leistungen#${r.slug}" class="btn btn-outline btn-full-width" style="margin-top:10px;">Details ansehen</a>
        </div>
      </article>`).join('\n')

  const body = `
<section class="hero" aria-labelledby="hero-heading">
  <div class="hero__bg-shapes" aria-hidden="true">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
  </div>
  <div class="hero__inner">
    <div class="hero__content animate-fade-in">
      <div class="hero__badge"><span class="badge-dot"></span>Individuelle Pflege in Forst (Baden) &amp; Umgebung</div>
      <h1 id="hero-heading" class="hero__title">Ihre pers&ouml;nliche<br><span class="highlight">St&uuml;tze</span> &ndash;<br><span class="highlight-amber">wenn Sie sie brauchen</span></h1>
      <p class="hero__text">Auxilium begleitet pflegebed&uuml;rftige Menschen und ihre Angeh&ouml;rigen mit Fachkenntnis, Einf&uuml;hlungsverm&ouml;gen und echter Leidenschaft. Professionell. G&uuml;nstig. Menschlich.</p>
      <div class="hero__actions">
        <a href="/kontakt" class="btn btn-accent"><i class="fas fa-calendar-check" aria-hidden="true"></i>Kostenloses Erstgespr&auml;ch</a>
        <a href="/leistungen" class="btn btn-outline"><i class="fas fa-list" aria-hidden="true"></i>Alle Leistungen</a>
      </div>

    </div>
    <div class="hero__visual animate-fade-in-delay-1">
      <div class="logo-hero-card animate-float">
        <img src="/static/logo.jpg" alt="Auxilium &ndash; Schmetterling Logo">
      </div>
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
      <div class="text-center"><span class="stats-banner__number">ca. 6 Mio.</span><p class="stats-banner__label">Pflegebed&uuml;rftige in Deutschland</p></div>
      <div class="text-center"><span class="stats-banner__number">80+ %</span><p class="stats-banner__label">werden zu Hause versorgt</p></div>
      <div class="text-center"><span class="stats-banner__number">3,1 Mio.</span><p class="stats-banner__label">ausschlie&szlig;lich durch Angeh&ouml;rige betreut</p></div>
      <div class="text-center"><span class="stats-banner__number">125 &euro;</span><p class="stats-banner__label">mtl. Entlastungsbetrag &ndash; direkt nutzbar</p></div>
    </div>
  </div>
</div>

<section class="section section--soft" aria-labelledby="services-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Meine Leistungen</span>
      <h2 id="services-heading">Was ich f&uuml;r Sie tue</h2>
      <p style="max-width:540px;margin:14px auto 0;">Vom Erstgespr&auml;ch bis zur regelm&auml;&szlig;igen Betreuung &ndash; Auxilium ist f&uuml;r Sie da.</p>
    </div>
    <div class="services-grid">
      ${homeServiceCards}
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
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-hand-holding-heart" aria-hidden="true"></i></div><div><div class="info-label">Entlastungsbetrag</div><div class="info-value">bis zu 125 &euro; monatlich f&uuml;r Betreuung</div></div></div>
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-hospital" aria-hidden="true"></i></div><div><div class="info-label">Kurzzeitpflege</div><div class="info-value">&Uuml;berbr&uuml;ckung bei Krankenhausaufenthalt</div></div></div>
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
    <h2 id="cta-heading" class="cta-section-green__title">Bereit f&uuml;r das erste Gespr&auml;ch?</h2>
    <p class="cta-section-green__text">Das Erstgespr&auml;ch ist kostenlos und unverbindlich. Gemeinsam finden wir heraus, wie Auxilium Ihnen am besten helfen kann.</p>
    <div class="flex justify-center gap-4 flex-wrap">
      <a href="/kontakt" class="btn btn-green-solid"><i class="fas fa-calendar-check" aria-hidden="true"></i>Termin vereinbaren</a>
      <a href="/leistungen" class="btn btn-green-ghost"><i class="fas fa-list" aria-hidden="true"></i>Leistungen ansehen</a>
    </div>
  </div>
</section>`
  return c.html(layout('Auxilium &ndash; Ihre St&uuml;tze in der Pflege | Forst Baden', 'Auxilium bietet individuelle Pflegeberatung und ambulante Pflegeleistungen in Forst Baden.', body, S))
})

// ─── ÜBER AUXILIUM ────────────────────────────────────────────
app.get('/ueber-auxilium', async (c) => {
  const S = await loadSettings(c.env.DB)
  const hero = pageHero('&Uuml;ber uns', 'Herzlich willkommen &ndash; ich bin Kristina Bronner', 'Gr&uuml;nderin von Auxilium &ndash; Ihrer pers&ouml;nlichen St&uuml;tze in der Pflege.', '&Uuml;ber Auxilium')
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
        <a href="/kontakt" class="btn btn-accent" style="margin-top:8px;"><i class="fas fa-calendar-check" aria-hidden="true"></i>Kostenloses Erstgespr&auml;ch</a>
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
          <div class="step-item"><div class="step-number">1</div><div class="step-content"><div class="step-title">Kostenloses Erstgespr&auml;ch</div><div class="step-text">Wir lernen uns kennen, ich h&ouml;re Ihnen zu und verstehe Ihre Bed&uuml;rfnisse.</div></div></div>
          <div class="step-item"><div class="step-number">2</div><div class="step-content"><div class="step-title">Individuelle Bedarfsanalyse</div><div class="step-text">Gemeinsam erkunden wir Ihre Ressourcen und M&ouml;glichkeiten.</div></div></div>
          <div class="step-item"><div class="step-number">3</div><div class="step-content"><div class="step-title">Pflegeplan erstellen</div><div class="step-text">Ein ma&szlig;geschneiderter Plan, der sich nach Ihrem Leben richtet &ndash; nicht umgekehrt.</div></div></div>
          <div class="step-item"><div class="step-number">4</div><div class="step-content"><div class="step-title">Regelm&auml;&szlig;ige Betreuung</div><div class="step-text">Zuverl&auml;ssige Unterst&uuml;tzung im Alltag &ndash; mit Anpassung bei Bedarf.</div></div></div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-map-marker-alt" aria-hidden="true"></i></div><div><div class="info-label">Einsatzgebiet</div><div class="info-value">Forst (Baden) und Umgebung</div></div></div>
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-clock" aria-hidden="true"></i></div><div><div class="info-label">Erreichbarkeit</div><div class="info-value">Montag&ndash;Freitag, 8:00&ndash;18:00 Uhr</div></div></div>
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-comments" aria-hidden="true"></i></div><div><div class="info-label">Erstgespr&auml;ch</div><div class="info-value">Kostenlos &amp; unverbindlich</div></div></div>
        <a href="/kontakt" class="btn btn-accent" style="align-self:flex-start;margin-top:4px;"><i class="fas fa-calendar" aria-hidden="true"></i>Termin anfragen</a>
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
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM leistungen WHERE active=1 ORDER BY sort_order'
  ).all<any>()
  const cards = results.map((r: any) => `
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
    </article>`).join('\n')
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
        <span class="section-label">${S.funding_title||'VERHINDERUNGSPFLEGE + KURZZEITPFLEGE'}</span>
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
    </div>
    <div class="grid-2" style="gap:24px;align-items:stretch;">
      ${cards}
      <article class="service-card" style="background:linear-gradient(135deg,#4A9B7F,#2D7A5E);border:none;">
        <div class="service-card__body" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:36px 28px;">
          <div style="font-size:2.2rem;margin-bottom:14px;color:white;" aria-hidden="true"><i class="fas fa-comments"></i></div>
          <h3 style="color:white;margin-bottom:10px;font-size:1.1rem;">Nicht das Richtige dabei?</h3>
          <p style="color:rgba(220,255,240,0.90);font-size:0.875rem;margin-bottom:22px;line-height:1.7;">Haben Sie individuelle W&uuml;nsche? Sprechen Sie mich an &ndash; gemeinsam finden wir eine L&ouml;sung.</p>
          <a href="/kontakt" class="btn btn-green-solid"><i class="fas fa-phone" aria-hidden="true"></i>Jetzt anfragen</a>
        </div>
      </article>
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
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-phone" aria-hidden="true"></i></div><div><div class="info-label">Erstkontakt</div><div class="info-value">Kostenlos und unverbindlich</div></div></div>
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
  const hero = pageHero('Kontakt', 'Wie kann Auxilium Ihnen helfen?', 'Das Erstgespr&auml;ch ist kostenlos und unverbindlich.', 'Kontakt')
  const body = hero + `
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
          <div class="contact-info-item"><div class="info-icon"><i class="fas fa-clock" aria-hidden="true"></i></div><div><div class="info-label">Erreichbarkeit</div><div class="info-value">${S.contact_hours||'Mo–Fr, 8:00 – 18:00 Uhr'}</div></div></div>
          <div class="contact-info-item"><div class="info-icon"><i class="fas fa-comments" aria-hidden="true"></i></div><div><div class="info-label">Erstgespr&auml;ch</div><div class="info-value">Kostenlos &amp; unverbindlich</div></div></div>
        </div>
        <p style="font-size:0.9rem;color:var(--text-light);line-height:1.7;">Haben Sie weitere Fragen? Auf der <a href="/" style="color:var(--accent);font-weight:600;">Startseite</a> finden Sie h&auml;ufige Fragen &ndash; oder schreiben Sie mir direkt &uuml;ber das Formular.</p>
      </div>
      <div>
        <div class="contact-form">
          <h3 style="margin-bottom:6px;">Nachricht senden</h3>
          <p style="margin-bottom:24px;font-size:0.875rem;color:var(--text-light);">F&uuml;llen Sie das Formular aus &ndash; ich melde mich so schnell wie m&ouml;glich.</p>
          <form id="contactForm" novalidate>
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
                <option value="erstgespraech">Kostenloses Erstgespr&auml;ch</option>
                <option value="beratung">Pflegeberatung</option>
                <option value="leistungen">Frage zu Leistungen &amp; Preisen</option>
                <option value="sonstiges">Sonstiges</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label" for="message">Ihre Nachricht *</label><textarea class="form-textarea" id="message" name="message" placeholder="Wie kann Auxilium Ihnen helfen?" rows="5" required></textarea></div>
            <div class="form-group" style="flex-direction:row;align-items:flex-start;gap:10px;margin-bottom:22px;">
              <input type="checkbox" id="privacy" name="privacy" required style="margin-top:3px;accent-color:var(--accent);width:16px;height:16px;flex-shrink:0;">
              <label for="privacy" style="font-size:0.8rem;color:var(--text-light);cursor:pointer;">Ich stimme der Verarbeitung meiner Daten gem&auml;&szlig; der <a href="/datenschutz" style="color:var(--accent);">Datenschutzerkl&auml;rung</a> zu. *</label>
            </div>
            <button type="submit" class="btn btn-accent w-full" style="justify-content:center;font-size:0.95rem;">
              <i class="fas fa-paper-plane" aria-hidden="true"></i>Nachricht senden
            </button>
          </form>
          <div id="formSuccess" class="form-success">
            <div style="font-size:2.2rem;margin-bottom:10px;" aria-hidden="true">&#x2705;</div>
            <h4 style="color:#166534;margin-bottom:6px;">Vielen Dank!</h4>
            <p style="font-size:0.875rem;">Ihre Nachricht wurde &uuml;bermittelt. Ich melde mich so bald wie m&ouml;glich!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`
  return c.html(layout('Kontakt &ndash; Auxilium Pflegeberatung Forst Baden', 'Nehmen Sie Kontakt mit Auxilium auf &ndash; kostenlose Erstberatung in Forst (Baden).', body, S))
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
    { href: '/admin/einstellungen', label: 'Einstellungen', key: 'einstellungen', icon: 'fa-sliders-h' },
    { href: '/admin/impressum', label: 'Impressum', key: 'impressum', icon: 'fa-file-alt' },
    { href: '/admin/datenschutz', label: 'Datenschutz', key: 'datenschutz', icon: 'fa-shield-alt' },
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
  const alert = msg === 'saved' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Erfolgreich gespeichert.</div>'
    : msg === 'deleted' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Leistung gelöscht.</div>' : ''
  const { results } = await c.env.DB.prepare('SELECT * FROM leistungen ORDER BY sort_order').all<any>()
  const rows = results.map((r: any) => `
    <tr data-id="${r.id}">
      <td class="drag-handle" title="Ziehen zum Sortieren"><i class="fas fa-grip-vertical"></i></td>
      <td><i class="fas ${r.icon}" style="color:#D98A2B;width:20px;margin-right:6px;"></i><strong>${r.title}</strong></td>
      <td style="color:#7A6550;font-size:0.82rem;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.subtitle}</td>
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
  <div class="adm-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div>
        <h2 style="font-size:1rem;margin-bottom:3px;">Alle Leistungen (${results.length})</h2>
        <p style="font-size:0.78rem;color:#7A6550;"><i class="fas fa-grip-vertical" style="margin-right:4px;"></i>Zeilen per Drag &amp; Drop in die gewünschte Reihenfolge ziehen</p>
      </div>
      <a href="/admin/leistungen/neu" class="adm-btn adm-btn-primary"><i class="fas fa-plus"></i>Neue Leistung</a>
    </div>
    <table class="adm-table">
      <thead><tr><th style="width:36px;"></th><th>Titel</th><th>Untertitel</th><th>Preis</th><th>Status</th><th>Aktionen</th></tr></thead>
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
app.get('/admin/leistungen/neu', (c) => {
  const body = leistungForm(null)
  return c.html(adminLayout('Neue Leistung', body, 'leistungen'))
})

app.post('/admin/leistungen/neu', async (c) => {
  const d = await c.req.parseBody()
  // sort_order: ans Ende (MAX + 1)
  const maxRow = await c.env.DB.prepare('SELECT COALESCE(MAX(sort_order),0)+1 AS next_order FROM leistungen').first<any>()
  const nextOrder = maxRow?.next_order ?? 99
  await c.env.DB.prepare(`INSERT INTO leistungen 
    (slug,title,subtitle,icon,description,price_new,price_old,price_note,savings,sort_order,active)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(d.slug||'', d.title||'', d.subtitle||'', d.icon||'fa-star', d.description||'',
    d.price_new||'', d.price_old||'', d.price_note||'', d.savings||'',
    nextOrder, d.active ? 1 : 0).run()
  return c.redirect('/admin/leistungen?msg=saved')
})

// ─── Admin: Leistung bearbeiten ───────────────────────────────
app.get('/admin/leistungen/:id', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM leistungen WHERE id=?').bind(c.req.param('id')).first<any>()
  if (!row) return c.redirect('/admin/leistungen')
  const body = leistungForm(row)
  return c.html(adminLayout('Leistung bearbeiten', body, 'leistungen'))
})

app.post('/admin/leistungen/:id', async (c) => {
  const d = await c.req.parseBody()
  await c.env.DB.prepare(`UPDATE leistungen SET
    title=?,subtitle=?,icon=?,description=?,price_new=?,price_old=?,price_note=?,savings=?,active=?,updated_at=CURRENT_TIMESTAMP
    WHERE id=?`
  ).bind(d.title||'', d.subtitle||'', d.icon||'fa-star', d.description||'',
    d.price_new||'', d.price_old||'', d.price_note||'', d.savings||'',
    d.active ? 1 : 0, c.req.param('id')).run()
  return c.redirect('/admin/leistungen?msg=saved')
})

app.post('/admin/leistungen/:id/delete', async (c) => {
  await c.env.DB.prepare('DELETE FROM leistungen WHERE id=?').bind(c.req.param('id')).run()
  return c.redirect('/admin/leistungen?msg=deleted')
})

// Formular-Helper Leistungen (mit Live-Vorschau + freiem Icon-Input)
function leistungForm(r: any): string {
  const v = (f: string) => {
    if (!r) return ''
    const val = r[f] ?? ''
    // HTML-Entities für Attribute escapen
    return String(val).replace(/&/g,'&amp;').replace(/"/g,'&quot;')
  }
  const vRaw = (f: string) => r ? (r[f] ?? '') : ''
  const isNew = !r
  const activeChecked = r ? (r.active ? 'checked' : '') : 'checked'

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
      ${field('contact_email',    'E-Mail-Adresse',           'z. B. info@auxilium-forst.com')}
      ${field('contact_hours',    'Öffnungszeiten',           'z. B. Mo–Fr · 8:00 – 18:00 Uhr')}
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
    'contact_location','contact_email','contact_hours'
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

export default app
