import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))

// ─── Layout helper ────────────────────────────────────────────
function layout(title: string, description: string, body: string): string {
  const year = new Date().getFullYear()
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
          <li style="color:rgba(255,255,255,0.62);font-size:0.875rem;"><i class="fas fa-map-marker-alt" style="color:var(--primary);margin-right:7px;width:14px;" aria-hidden="true"></i>Forst (Baden) &amp; Umgebung</li>
          <li style="font-size:0.875rem;"><i class="fas fa-envelope" style="color:var(--primary);margin-right:7px;width:14px;" aria-hidden="true"></i><a href="mailto:info@auxilium-forst.com" style="color:rgba(255,255,255,0.62);">info@auxilium-forst.com</a></li>
          <li style="color:rgba(255,255,255,0.62);font-size:0.875rem;"><i class="fas fa-clock" style="color:var(--primary);margin-right:7px;width:14px;" aria-hidden="true"></i>Mo&ndash;Fr &middot; 8:00 &ndash; 18:00 Uhr</li>
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
app.get('/', (c) => {
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
      <div class="hero__stats">
        <div><div class="hero__stat-number">5,7 Mio.</div><div class="hero__stat-label">Pflegebed&uuml;rftige<br>in Deutschland</div></div>
        <div><div class="hero__stat-number">80+ %</div><div class="hero__stat-label">werden zu Hause<br>versorgt</div></div>
        <div><div class="hero__stat-number">100 %</div><div class="hero__stat-label">individuelle<br>Betreuung</div></div>
      </div>
    </div>
    <div class="hero__visual animate-fade-in-delay-1">
      <div class="logo-hero-card animate-float">
        <img src="/static/logo.jpg" alt="Auxilium &ndash; Schmetterling Logo">
        <div class="logo-hero-overlay">
          <h3>Auxilium</h3>
          <p>Lat. f&uuml;r &bdquo;Hilfe&ldquo; &ndash; Ihre St&uuml;tze in der Pflege</p>
        </div>
        <div class="hero__floating-badge top-left">
          <div class="badge-icon">&#x2764;</div>
          <div class="badge-text"><strong>Mit Herz dabei</strong><span>Individuelle Betreuung</span></div>
        </div>
        <div class="hero__floating-badge bottom-right">
          <div class="badge-icon">&#x1F4A1;</div>
          <div class="badge-text"><strong>Pflegeberatung</strong><span>Kostenlos &amp; unverbindlich</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="feature-strip" role="complementary">
  <div class="container">
    <div class="feature-strip__inner">
      <div class="feature-strip__item"><span class="icon" aria-hidden="true">&#x2705;</span>G&uuml;nstigere Preise als ambulante Dienste</div>
      <div class="feature-strip__item"><span class="icon" aria-hidden="true">&#x1F91D;</span>Pers&ouml;nlicher Ansprechpartner</div>
      <div class="feature-strip__item"><span class="icon" aria-hidden="true">&#x1F3E0;</span>Pflege in Ihrem Zuhause</div>
      <div class="feature-strip__item"><span class="icon" aria-hidden="true">&#x1F4CB;</span>Abrechnung &uuml;ber Pflegekasse</div>
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
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F464;</div><h3 class="card__title">Einzigartigkeit</h3><p class="card__text">Jeder Mensch verdient individuelle Aufmerksamkeit. Bei Auxilium steht Ihre pers&ouml;nliche Situation immer im Mittelpunkt.</p></article>
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F4B0;</div><h3 class="card__title">G&uuml;nstigere Preise</h3><p class="card__text">Auxilium ist deutlich g&uuml;nstiger als herk&ouml;mmliche ambulante Pflegedienste &ndash; und kann &uuml;ber Verhinderungspflege abgerechnet werden.</p></article>
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F393;</div><h3 class="card__title">Professionelle Beratung</h3><p class="card__text">Sie erhalten eine vollst&auml;ndige &Uuml;bersicht aller Leistungsanspr&uuml;che aus der Pflegekasse &ndash; optimal f&uuml;r Ihre Situation genutzt.</p></article>
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F3E1;</div><h3 class="card__title">Zuhause bleiben</h3><p class="card__text">&Uuml;ber 80 % der Pflegebed&uuml;rftigen wollen zu Hause versorgt werden. Auxilium macht das m&ouml;glich &ndash; mit echtem Heimgef&uuml;hl.</p></article>
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F46A;</div><h3 class="card__title">Entlastung der Familie</h3><p class="card__text">Auch pflegende Angeh&ouml;rige sind Kunden bei Auxilium. Ich schaffe FreiR&auml;ume und st&auml;rke dem gesamten Umfeld den R&uuml;cken.</p></article>
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F50D;</div><h3 class="card__title">Transparenz</h3><p class="card__text">Klare Preise, kein Kleingedrucktes. Sie wissen immer genau, was Sie erwartet &ndash; ohne &Uuml;berraschungen oder versteckte Kosten.</p></article>
    </div>
  </div>
</section>

<div class="stats-banner" role="complementary">
  <div class="container">
    <div class="stats-banner__grid">
      <div class="text-center"><span class="stats-banner__number">5,7 Mio.</span><p class="stats-banner__label">Pflegebed&uuml;rftige in Deutschland (2019)</p></div>
      <div class="text-center"><span class="stats-banner__number">80+ %</span><p class="stats-banner__label">werden zu Hause versorgt</p></div>
      <div class="text-center"><span class="stats-banner__number">3,1 Mio.</span><p class="stats-banner__label">ausschlie&szlig;lich durch Angeh&ouml;rige betreut</p></div>
      <div class="text-center"><span class="stats-banner__number">2060</span><p class="stats-banner__label">Hochrechnung: &uuml;ber 6 Mio. Pflegebed&uuml;rftige</p></div>
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
      <article class="service-card">
        <div class="service-card__header">
          <div class="service-card__icon" aria-hidden="true">&#x1F6C1;</div>
          <div class="service-card__header-text"><h3 class="service-card__title">K&ouml;rperpflege</h3><span class="service-card__subtitle">Baden, Duschen, Waschen</span></div>
        </div>
        <div class="service-card__body">
          <p class="service-card__text">Unterst&uuml;tzung beim Duschen oder Baden inkl. An- und Auskleiden, Zahnpflege und Mobilisierung im Bad.</p>
          <div class="service-card__price"><span class="price-new">ab 21,00 &euro;</span><span class="price-compare">28,55 &euro;</span><span class="price-note">Vergleich ambulanter Dienst</span></div>
          <div class="service-card__savings">&#x2705; Sie sparen: bis zu 7,69 &euro; pro Einsatz</div>
          <a href="/leistungen#koerperpflege" class="btn btn-outline btn-full-width">Details ansehen</a>
        </div>
      </article>
      <article class="service-card">
        <div class="service-card__header">
          <div class="service-card__icon" aria-hidden="true">&#x1F932;</div>
          <div class="service-card__header-text"><h3 class="service-card__title">Betreuung</h3><span class="service-card__subtitle">Begleitung &amp; Gesellschaft</span></div>
        </div>
        <div class="service-card__body">
          <p class="service-card__text">Gesellschaft beim Essen, Spazierg&auml;nge, Tagesausflu&szlig;e und vieles mehr &ndash; die Betreuungsm&ouml;glichkeiten sind vielf&auml;ltig.</p>
          <div class="service-card__price"><span class="price-new">15,00 &euro;</span><span class="price-compare">17,33 &euro;</span><span class="price-note">je angefangene Viertelstunde</span></div>
          <div class="service-card__savings">&#x2705; G&uuml;nstiger als ambulanter Dienst</div>
          <a href="/leistungen#betreuung" class="btn btn-outline btn-full-width">Details ansehen</a>
        </div>
      </article>
      <article class="service-card">
        <div class="service-card__header">
          <div class="service-card__icon" aria-hidden="true">&#x1F4C5;</div>
          <div class="service-card__header-text"><h3 class="service-card__title">Alltagsorganisation</h3><span class="service-card__subtitle">Termine, Einkauf &amp; mehr</span></div>
        </div>
        <div class="service-card__body">
          <p class="service-card__text">Terminvereinbarungen, Arztbesuche, Friseur, Einkauf &ndash; Auxilium hilft Ihnen, den Alltag zu meistern.</p>
          <div class="service-card__price"><span class="price-new">15,00 &euro;</span><span class="price-compare">17,33 &euro;</span><span class="price-note">je angefangene Viertelstunde</span></div>
          <div class="service-card__savings">&#x2705; G&uuml;nstiger als ambulanter Dienst</div>
          <a href="/leistungen#alltag" class="btn btn-outline btn-full-width">Details ansehen</a>
        </div>
      </article>
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
        <span class="section-label">Verhinderungspflege + Kurzzeitpflege</span>
        <div class="funding-box__amount">3.539 &euro;</div>
        <p class="funding-box__label">J&auml;hrlicher Anspruch pro Person</p>
        <p class="funding-box__note">Dieser Betrag ist zweckgebunden und kann vollst&auml;ndig f&uuml;r Auxilium-Leistungen genutzt werden.</p>
        <a href="/beratung" class="btn btn-accent mt-6"><i class="fas fa-info-circle" aria-hidden="true"></i>Mehr erfahren</a>
      </article>
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="contact-info-item"><div class="info-icon" aria-hidden="true">&#x1F4B6;</div><div><div class="info-label">Pflegegeld</div><div class="info-value">Geld- oder Sachleistung flexibel nutzen</div></div></div>
        <div class="contact-info-item"><div class="info-icon" aria-hidden="true">&#x1F504;</div><div><div class="info-label">Entlastungsbetrag</div><div class="info-value">bis zu 125 &euro; monatlich f&uuml;r Betreuung</div></div></div>
        <div class="contact-info-item"><div class="info-icon" aria-hidden="true">&#x1F3E5;</div><div><div class="info-label">Kurzzeitpflege</div><div class="info-value">&Uuml;berbr&uuml;ckung bei Krankenhausaufenthalt</div></div></div>
        <div class="contact-info-item"><div class="info-icon" aria-hidden="true">&#x1F527;</div><div><div class="info-label">Hilfsmittel &amp; Umbau</div><div class="info-value">Zusch&uuml;sse f&uuml;r wohnumfeldverbessernde Ma&szlig;nahmen</div></div></div>
      </div>
    </div>
  </div>
</section>

<section style="background:linear-gradient(135deg,#8B1A1A,#6B1010);padding:72px 0;" aria-labelledby="cta-heading">
  <div class="container text-center">
    <h2 id="cta-heading" style="color:white;margin-bottom:14px;">Bereit f&uuml;r das erste Gespr&auml;ch?</h2>
    <p style="color:rgba(255,235,220,0.88);max-width:500px;margin:0 auto 32px;font-size:1rem;line-height:1.75;">Das Erstgespr&auml;ch ist kostenlos und unverbindlich. Gemeinsam finden wir heraus, wie Auxilium Ihnen am besten helfen kann.</p>
    <div class="flex justify-center gap-4 flex-wrap">
      <a href="/kontakt" class="btn btn-white"><i class="fas fa-calendar-check" aria-hidden="true"></i>Termin vereinbaren</a>
      <a href="/leistungen" class="btn btn-ghost-white"><i class="fas fa-list" aria-hidden="true"></i>Leistungen ansehen</a>
    </div>
  </div>
</section>`
  return c.html(layout('Auxilium &ndash; Ihre St&uuml;tze in der Pflege | Forst Baden', 'Auxilium bietet individuelle Pflegeberatung und ambulante Pflegeleistungen in Forst Baden.', body))
})

// ─── ÜBER AUXILIUM ────────────────────────────────────────────
app.get('/ueber-auxilium', (c) => {
  const hero = pageHero('&Uuml;ber uns', 'Einzigartige Pflege f&uuml;r einzigartige Menschen', 'Lernen Sie Kristina Bronner und die Idee hinter Auxilium kennen.', '&Uuml;ber Auxilium')
  const body = hero + `
<section class="section" aria-labelledby="person-heading">
  <div class="container">
    <div class="grid-2" style="gap:56px;">
      <div>
        <span class="section-label">Zur Person</span>
        <h2 id="person-heading">Kristina Bronner</h2>
        <p style="margin:16px 0 20px;">Als Gr&uuml;nderin von Auxilium bringe ich meine Leidenschaft f&uuml;r die Pflege mit echtem Engagement in Ihren Alltag. Mein Versprechen: individuelle, qualitativ hochwertige Versorgung &ndash; nicht nur pflegerisch, sondern als ganzheitliche Unterst&uuml;tzung f&uuml;r Sie und Ihre Angeh&ouml;rigen.</p>
        <p style="margin-bottom:28px;">Ich glaube daran, dass jeder Mensch das Recht hat, in seiner vertrauten Umgebung zu leben und seinen Alltag so angenehm wie m&ouml;glich zu gestalten. Die Teilhabe am sozialen Leben und das Wohlergehen des gesamten Umfelds stehen dabei im Vordergrund.</p>
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div class="step-item"><div class="step-number" aria-hidden="true">&#x1F49C;</div><div class="step-content"><div class="step-title">Leidenschaft f&uuml;r Menschen</div><div class="step-text">Jeder Mensch ist einzigartig &ndash; diese &Uuml;berzeugung tr&auml;gt meine Arbeit t&auml;glich.</div></div></div>
          <div class="step-item"><div class="step-number" aria-hidden="true">&#x1F393;</div><div class="step-content"><div class="step-title">Fachkenntnis &amp; Qualit&auml;t</div><div class="step-text">Professionelle Pflege auf h&ouml;chstem Niveau, verbunden mit menschlicher W&auml;rme.</div></div></div>
          <div class="step-item"><div class="step-number" aria-hidden="true">&#x1F91D;</div><div class="step-content"><div class="step-title">Verl&auml;sslichkeit</div><div class="step-text">Sie k&ouml;nnen sich auf mich verlassen &ndash; p&uuml;nktlich, konstant und transparent.</div></div></div>
        </div>
      </div>
      <div>
        <div style="border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-lg);margin-bottom:20px;">
          <img src="/static/logo.jpg" alt="Auxilium Logo &ndash; Schmetterling" style="width:100%;height:280px;object-fit:cover;object-position:center 30%;">
        </div>
        <div style="background:var(--primary-light);border:2px solid var(--primary);border-radius:var(--radius-lg);padding:24px;text-align:center;">
          <div style="font-size:2.5rem;margin-bottom:10px;" aria-hidden="true">&#x1F98B;</div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.2rem;color:var(--secondary);margin-bottom:10px;">Das Symbol von Auxilium</h3>
          <p style="font-size:0.875rem;color:var(--text-light);line-height:1.72;margin-bottom:14px;">Ein Schmetterling mit einem fehlenden Fl&uuml;gel &ndash; symbolisch f&uuml;r die Kraft der pers&ouml;nlichen Transformation. Der Mut, Hilfe anzunehmen. <strong style="color:var(--accent);">Auxilium</strong> ist die St&uuml;tze, die fehlt.</p>
          <div style="display:inline-flex;align-items:center;gap:8px;font-size:0.82rem;color:var(--text-light);">
            <span style="display:inline-block;width:10px;height:10px;background:var(--primary);border-radius:50%;"></span>
            Amber-Orange steht f&uuml;r Lebensenergie und Leidenschaft
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--soft" aria-labelledby="mission-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Leitbild</span>
      <h2 id="mission-heading">Wof&uuml;r Auxilium steht</h2>
    </div>
    <div class="grid-3">
      <article class="card"><div class="card__icon" aria-hidden="true">&#x2B50;</div><h3 class="card__title">Ganzheitlichkeit</h3><p class="card__text">Pflege bedeutet mehr als k&ouml;rperliche Versorgung. Auxilium denkt den ganzen Menschen &ndash; soziale Bed&uuml;rfnisse, Wohlbefinden und das der Familie.</p></article>
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F513;</div><h3 class="card__title">Freiräume schaffen</h3><p class="card__text">Pflegende Angeh&ouml;rige brauchen Auszeiten. Ich schaffe die Freiräume, die Sie ben&ouml;tigen &ndash; damit Sie wieder auftanken k&ouml;nnen.</p></article>
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F3C5;</div><h3 class="card__title">Qualit&auml;t als Standard</h3><p class="card__text">Qualitativ hochwertige Pflege ist kein Luxus, sondern ein Recht. Auxilium liefert diesen Standard &ndash; zu fairen, transparenten Preisen.</p></article>
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
        <div class="contact-info-item"><div class="info-icon" aria-hidden="true">&#x1F4CD;</div><div><div class="info-label">Einsatzgebiet</div><div class="info-value">Forst (Baden) und Umgebung</div></div></div>
        <div class="contact-info-item"><div class="info-icon" aria-hidden="true">&#x1F550;</div><div><div class="info-label">Erreichbarkeit</div><div class="info-value">Montag&ndash;Freitag, 8:00&ndash;18:00 Uhr</div></div></div>
        <div class="contact-info-item"><div class="info-icon" aria-hidden="true">&#x1F4AC;</div><div><div class="info-label">Erstgespr&auml;ch</div><div class="info-value">Kostenlos &amp; unverbindlich</div></div></div>
        <a href="/kontakt" class="btn btn-accent" style="align-self:flex-start;margin-top:4px;"><i class="fas fa-calendar" aria-hidden="true"></i>Termin anfragen</a>
      </div>
    </div>
  </div>
</section>`
  return c.html(layout('&Uuml;ber Auxilium &ndash; Kristina Bronner | Pflegeberatung Forst Baden', 'Lernen Sie Kristina Bronner und die Philosophie von Auxilium kennen.', body))
})

// ─── LEISTUNGEN ───────────────────────────────────────────────
app.get('/leistungen', (c) => {
  const hero = pageHero('Leistungen', 'Transparente Preise &ndash; faire Leistungen', 'Alle Leistungen von Auxilium im &Uuml;berblick &ndash; mit ehrlichem Preisvergleich.', 'Leistungen &amp; Kosten')
  const serviceCard = (id: string, icon: string, title: string, sub: string, text: string, priceNew: string, priceOld: string, priceNote: string, saving: string) =>
    `<article class="service-card"${id ? ` id="${id}"` : ''}>
      <div class="service-card__header">
        <div class="service-card__icon" aria-hidden="true">${icon}</div>
        <div class="service-card__header-text"><h3 class="service-card__title">${title}</h3><span class="service-card__subtitle">${sub}</span></div>
      </div>
      <div class="service-card__body">
        <p class="service-card__text">${text}</p>
        <div class="service-card__price"><span class="price-new">${priceNew}</span><span class="price-compare">${priceOld}</span><span class="price-note">${priceNote}</span></div>
        <div class="service-card__savings">&#x2705; ${saving}</div>
      </div>
    </article>`

  const body = hero + `
<section class="section" aria-labelledby="intro-heading">
  <div class="container">
    <div class="grid-2" style="gap:56px;">
      <div>
        <span class="section-label">Mein Ansatz</span>
        <h2 id="intro-heading">Es gibt immer eine L&ouml;sung &ndash; und nicht nur eine</h2>
        <p style="margin:14px 0 18px;">Wir alle begegnen dem Leben auf unsere eigene Weise. Auxilium hilft Ihnen, Ihre pers&ouml;nliche L&ouml;sung zu finden.</p>
        <div style="background:var(--primary-light);border-radius:var(--radius);padding:18px;border-left:4px solid var(--primary);">
          <p style="font-size:0.875rem;font-weight:600;color:var(--secondary);margin-bottom:4px;">&#x26A0;&#xFE0F; Alle Preise zzgl. Wegpauschale</p>
          <p style="font-size:0.8rem;color:var(--text-light);">Die Wegpauschale variiert je nach Einsatzort und wird vorab kommuniziert.</p>
        </div>
      </div>
      <article class="funding-box">
        <span class="section-label">Ihr Vorteil</span>
        <div class="funding-box__amount">3.539 &euro;</div>
        <p class="funding-box__label">J&auml;hrlicher Anspruch (Verhinderungs- + Kurzzeitpflege)</p>
        <p style="font-size:0.875rem;color:var(--text-light);margin:14px 0 10px;line-height:1.7;">Wenn Sie Pflegegeld beziehen, steht Ihnen dieser Betrag zweckgebunden zur Verf&uuml;gung.</p>
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
      ${serviceCard('koerperpflege','&#x1F6C1;','Gro&szlig;e K&ouml;rperpflege','Baden / Duschen &middot; ca. 35 Min','Unterst&uuml;tzung beim Duschen oder Baden inkl. An- und Auskleiden, Zahnpflege und Mobilisierung im Bad.','35,00 &euro;','42,69 &euro;','Ambulanter Dienst','Sie sparen: 7,69 &euro; pro Einsatz')}
      ${serviceCard('','&#x1F9FC;','Kleine K&ouml;rperpflege','&bdquo;Katzenw&auml;sche&ldquo; &middot; ca. 20 Min','K&ouml;rperpflege am Waschbecken morgens und/oder abends: Oberkoerper, R&uuml;cken, Intimbereich sowie Zahnpflege.','21,00 &euro;','28,55 &euro;','Ambulanter Dienst','Sie sparen: 7,55 &euro; pro Einsatz')}
      ${serviceCard('einkauf','&#x1F6D2;','Einkauf','Immer frische Lebensmittel','Sie haben Schwierigkeiten beim Einkaufen? Lassen Sie uns schauen, was Sie brauchen &ndash; und Sie bekommen es!','15,00 &euro;','17,33 &euro;','je angef. Viertelstunde (amb. Dienst)','G&uuml;nstiger als ambulanter Dienst')}
      ${serviceCard('betreuung','&#x1F932;','Pflegerische Betreuung','Stets gut umsorgt','Gesellschaft beim Essen, Spazierg&auml;nge, Tagesausflu&uml;ge und vieles mehr. Was w&uuml;nschen Sie sich?','15,00 &euro;','17,33 &euro;','je angef. Viertelstunde (amb. Dienst)','G&uuml;nstiger als ambulanter Dienst')}
      ${serviceCard('alltag','&#x1F4C5;','Alltagsorganisation','Im Alltag alles im Griff','Termine vereinbaren, Arztbesuche, Friseur, Beh&ouml;rdeng&auml;nge &ndash; und falls der Alltag im Chaos versinkt: Auxilium hilft.','15,00 &euro;','17,33 &euro;','je angef. Viertelstunde (amb. Dienst)','G&uuml;nstiger als ambulanter Dienst')}
      <article class="service-card" style="background:linear-gradient(135deg,var(--accent),var(--accent-dark));border:none;">
        <div class="service-card__body" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:36px 28px;">
          <div style="font-size:2.5rem;margin-bottom:14px;" aria-hidden="true">&#x1F4AC;</div>
          <h3 style="color:white;margin-bottom:10px;font-size:1.1rem;">Nicht das Richtige dabei?</h3>
          <p style="color:rgba(255,235,220,0.88);font-size:0.875rem;margin-bottom:22px;line-height:1.7;">Haben Sie individuelle W&uuml;nsche? Sprechen Sie mich an &ndash; gemeinsam finden wir eine L&ouml;sung.</p>
          <a href="/kontakt" class="btn btn-white"><i class="fas fa-phone" aria-hidden="true"></i>Jetzt anfragen</a>
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
      <article class="card" style="text-align:center;"><div class="card__icon" style="margin:0 auto 18px;" aria-hidden="true">&#x1F4B6;</div><h3 class="card__title">Sie Pflegegeld beziehen</h3><p class="card__text">Pflegegeldempf&auml;nger k&ouml;nnen Auxilium-Leistungen flexibel und unkompliziert abrechnen.</p></article>
      <article class="card" style="text-align:center;"><div class="card__icon" style="margin:0 auto 18px;" aria-hidden="true">&#x1F504;</div><h3 class="card__title">Verhinderungspflege nutzen</h3><p class="card__text">Wer Verhinderungspflege oder den Entlastungsbetrag nutzt, kann Auxilium bis zu 3.539 &euro; im Jahr finanzieren.</p></article>
      <article class="card" style="text-align:center;"><div class="card__icon" style="margin:0 auto 18px;" aria-hidden="true">&#x1F4B3;</div><h3 class="card__title">Privatzahler/-innen</h3><p class="card__text">Auch ohne Pflegekassen-Leistungen sind alle Auxilium-Angebote als Privatleistung buchbar.</p></article>
    </div>
    <div class="text-center mt-8">
      <a href="/kontakt" class="btn btn-accent"><i class="fas fa-calendar-check" aria-hidden="true"></i>Kostenloses Erstgespr&auml;ch vereinbaren</a>
    </div>
  </div>
</section>`
  return c.html(layout('Leistungen &amp; Kosten &ndash; Auxilium Forst Baden', 'Alle Pflegeleistungen von Auxilium auf einen Blick &ndash; transparent und fair.', body))
})

// ─── BERATUNG ─────────────────────────────────────────────────
app.get('/beratung', (c) => {
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
        <div class="contact-info-item"><div class="info-icon" aria-hidden="true">&#x1F4A1;</div><div><div class="info-label">Vorteil</div><div class="info-value">Individuelle Finanzierungsberatung inklusive</div></div></div>
        <div class="contact-info-item"><div class="info-icon" aria-hidden="true">&#x1F4DE;</div><div><div class="info-label">Erstkontakt</div><div class="info-value">Kostenlos und unverbindlich</div></div></div>
        <div class="contact-info-item"><div class="info-icon" aria-hidden="true">&#x1F3E0;</div><div><div class="info-label">Ort</div><div class="info-value">Bei Ihnen zu Hause oder telefonisch</div></div></div>
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
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F4B6;</div><h3 class="card__title">Pflegerische Hilfen</h3><p class="card__text">Geld- oder Sachleistung &ndash; je nach Bedarf und Pflegegrad optimal einsetzen.</p></article>
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F504;</div><h3 class="card__title">Entlastungsbetrag</h3><p class="card__text">Bis zu 125 &euro; monatlich (1.500 &euro; j&auml;hrlich) f&uuml;r anerkannte Entlastungsleistungen.</p></article>
      <article class="card"><div class="card__icon" aria-hidden="true">&#x23F8;</div><h3 class="card__title">Kurzzeitpflege</h3><p class="card__text">&Uuml;berbr&uuml;ckung bei Krankenhausaufenthalten oder zur Entlastung der Angeh&ouml;rigen.</p></article>
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F680;</div><h3 class="card__title">Verhinderungspflege</h3><p class="card__text">Wenn die regul&auml;re Pflegeperson ausf&auml;llt &ndash; bis zu 3.539 &euro; im Jahr nutzbar.</p></article>
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F317;</div><h3 class="card__title">Tages- und Nachtpflege</h3><p class="card__text">Erg&auml;nzende Betreuung in teilstation&auml;ren Einrichtungen tagss&uuml;ber oder nachts.</p></article>
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F3C3;</div><h3 class="card__title">Reha</h3><p class="card__text">Wissen Sie um Ihre Anspr&uuml;che auf eine Rehabilitation? Ich informiere Sie umfassend.</p></article>
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
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F6E1;</div><h3 class="card__title">Pflegehilfsmittel</h3><p class="card__text">Monatlich bis zu 40 &euro; f&uuml;r zum Verbrauch bestimmte Pflegehilfsmittel.</p></article>
      <article class="card"><div class="card__icon" aria-hidden="true">&#x267F;</div><h3 class="card__title">Technische Hilfsmittel</h3><p class="card__text">Zusch&uuml;sse f&uuml;r Rollst&uuml;hle, Pflegebetten, Lifter und andere Hilfsmittel.</p></article>
      <article class="card"><div class="card__icon" aria-hidden="true">&#x1F3E0;</div><h3 class="card__title">Wohnumfeldverbesserung</h3><p class="card__text">Bis zu 4.000 &euro; Zuschuss pro Ma&szlig;nahme f&uuml;r barrierefreie Umbauten.</p></article>
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
          <div class="step-item"><div class="step-number" aria-hidden="true">&#x1F4BC;</div><div class="step-content"><div class="step-title">Pflegeunterst&uuml;tzungsgeld</div><div class="step-text">Kurzfristige Freistellung bis 10 Tage bei akuter Pflegesituation.</div></div></div>
          <div class="step-item"><div class="step-number" aria-hidden="true">&#x23F1;</div><div class="step-content"><div class="step-title">Reduzierung der Arbeitszeit</div><div class="step-text">Bis zu 24 Monate Teilzeit-Option f&uuml;r pflegende Angeh&ouml;rige.</div></div></div>
          <div class="step-item"><div class="step-number" aria-hidden="true">&#x1F4C6;</div><div class="step-content"><div class="step-title">Option der Freistellung</div><div class="step-text">Vollst&auml;ndige Freistellung bis zu 6 Monate m&ouml;glich.</div></div></div>
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

<section style="background:linear-gradient(135deg,#8B1A1A,#6B1010);padding:72px 0;" aria-labelledby="advice-cta-heading">
  <div class="container text-center">
    <h2 id="advice-cta-heading" style="color:white;margin-bottom:14px;">Lassen Sie sich kostenlos beraten</h2>
    <p style="color:rgba(255,235,220,0.88);max-width:480px;margin:0 auto 32px;font-size:1rem;line-height:1.75;">In einem kostenlosen Gespr&auml;ch analysiere ich mit Ihnen alle Anspr&uuml;che und erstelle die beste Finanzierungsstrategie f&uuml;r Ihre Situation.</p>
    <a href="/kontakt" class="btn btn-white"><i class="fas fa-calendar-check" aria-hidden="true"></i>Jetzt Beratungstermin anfragen</a>
  </div>
</section>`
  return c.html(layout('Pflegeberatung &ndash; Auxilium Forst Baden', 'Kostenlose Pflegeberatung in Forst (Baden): Pflegeversicherung, Entlastungsbetrag und mehr.', body))
})

// ─── KONTAKT ──────────────────────────────────────────────────
app.get('/kontakt', (c) => {
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
          <div class="contact-info-item"><div class="info-icon" aria-hidden="true">&#x1F4CD;</div><div><div class="info-label">Einsatzgebiet</div><div class="info-value">Forst (Baden) und Umgebung</div></div></div>
          <div class="contact-info-item"><div class="info-icon" aria-hidden="true">&#x2709;</div><div><div class="info-label">E-Mail</div><div class="info-value"><a href="mailto:info@auxilium-forst.com" style="color:var(--accent);">info@auxilium-forst.com</a></div></div></div>
          <div class="contact-info-item"><div class="info-icon" aria-hidden="true">&#x1F550;</div><div><div class="info-label">Erreichbarkeit</div><div class="info-value">Mo&ndash;Fr, 8:00 &ndash; 18:00 Uhr</div></div></div>
          <div class="contact-info-item"><div class="info-icon" aria-hidden="true">&#x1F4AC;</div><div><div class="info-label">Erstgespr&auml;ch</div><div class="info-value">Kostenlos &amp; unverbindlich</div></div></div>
        </div>
        <h3 style="margin-bottom:18px;font-size:1.05rem;">H&auml;ufige Fragen</h3>
        <div class="accordion-list">
          <div class="accordion-item">
            <button class="accordion-toggle" aria-expanded="false">Wer kann Auxilium nutzen?<span class="chevron" aria-hidden="true"><i class="fas fa-chevron-down"></i></span></button>
            <div class="accordion-body"><div class="accordion-body__inner">Auxilium richtet sich an Pflegegeldempf&auml;nger, Personen die Verhinderungspflege oder den Entlastungsbetrag nutzen wollen, sowie Privatzahler/-innen.</div></div>
          </div>
          <div class="accordion-item">
            <button class="accordion-toggle" aria-expanded="false">Ist das Erstgespr&auml;ch wirklich kostenlos?<span class="chevron" aria-hidden="true"><i class="fas fa-chevron-down"></i></span></button>
            <div class="accordion-body"><div class="accordion-body__inner">Ja, das Erstgespr&auml;ch ist vollst&auml;ndig kostenlos und unverbindlich. Es dient dazu, Ihre Bed&uuml;rfnisse kennenzulernen.</div></div>
          </div>
          <div class="accordion-item">
            <button class="accordion-toggle" aria-expanded="false">Kann ich Auxilium &uuml;ber die Pflegekasse abrechnen?<span class="chevron" aria-hidden="true"><i class="fas fa-chevron-down"></i></span></button>
            <div class="accordion-body"><div class="accordion-body__inner">Ja! Auxilium kann &uuml;ber Verhinderungspflege und den Entlastungsbetrag abgerechnet werden. Ich zeige Ihnen alle M&ouml;glichkeiten.</div></div>
          </div>
          <div class="accordion-item">
            <button class="accordion-toggle" aria-expanded="false">In welchen Bereichen ist Auxilium t&auml;tig?<span class="chevron" aria-hidden="true"><i class="fas fa-chevron-down"></i></span></button>
            <div class="accordion-body"><div class="accordion-body__inner">Auxilium ist in Forst (Baden) und der Umgebung t&auml;tig. Die Wegpauschale h&auml;ngt vom Einsatzort ab und wird vorab kommuniziert.</div></div>
          </div>
        </div>
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
  return c.html(layout('Kontakt &ndash; Auxilium Pflegeberatung Forst Baden', 'Nehmen Sie Kontakt mit Auxilium auf &ndash; kostenlose Erstberatung in Forst (Baden).', body))
})

// ─── Impressum ────────────────────────────────────────────────
app.get('/impressum', (c) => {
  const body = pageHero('Rechtliches', 'Impressum', '', 'Impressum') + `
<section class="section"><div class="container" style="max-width:760px;">
  <article style="background:white;border-radius:16px;padding:44px;box-shadow:var(--shadow-md);border:1px solid var(--border);">
    <h2 style="margin-bottom:22px;">Angaben gem&auml;&szlig; &sect; 5 TMG</h2>
    <p style="margin-bottom:8px;"><strong>Kristina Bronner</strong></p>
    <p style="margin-bottom:8px;">Auxilium &ndash; Pflegeberatung &amp; Pflegeleistungen</p>
    <p style="margin-bottom:8px;">Forst (Baden)</p>
    <p style="margin-bottom:24px;">Deutschland</p>
    <h3 style="margin-bottom:10px;">Kontakt</h3>
    <p>E-Mail: <a href="mailto:info@auxilium-forst.com" style="color:var(--accent);">info@auxilium-forst.com</a></p>
  </article>
</div></section>`
  return c.html(layout('Impressum &ndash; Auxilium Forst Baden', 'Impressum von Auxilium Pflegeberatung in Forst Baden.', body))
})

// ─── Datenschutz ──────────────────────────────────────────────
app.get('/datenschutz', (c) => {
  const body = pageHero('Rechtliches', 'Datenschutzerkl&auml;rung', '', 'Datenschutz') + `
<section class="section"><div class="container" style="max-width:760px;">
  <article style="background:white;border-radius:16px;padding:44px;box-shadow:var(--shadow-md);border:1px solid var(--border);">
    <h2 style="margin-bottom:16px;">Datenschutz auf einen Blick</h2>
    <p style="margin-bottom:18px;">Die Betreiberin dieser Website nimmt den Schutz Ihrer pers&ouml;nlichen Daten ernst. Wir behandeln Ihre Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften.</p>
    <h3 style="margin-bottom:10px;">Kontaktformular</h3>
    <p style="margin-bottom:18px;">Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben zwecks Bearbeitung gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
    <h3 style="margin-bottom:10px;">Verantwortliche Stelle</h3>
    <p>Kristina Bronner, Auxilium, Forst (Baden) &ndash; <a href="mailto:info@auxilium-forst.com" style="color:var(--accent);">info@auxilium-forst.com</a></p>
  </article>
</div></section>`
  return c.html(layout('Datenschutz &ndash; Auxilium Forst Baden', 'Datenschutzerkl&auml;rung von Auxilium Pflegeberatung Forst Baden.', body))
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

export default app
