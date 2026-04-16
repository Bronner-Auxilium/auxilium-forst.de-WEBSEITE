import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// ─── Static files ────────────────────────────────────────────
app.use('/static/*', serveStatic({ root: './' }))

// ─── Shared Layout ───────────────────────────────────────────
const Layout = ({ children, title = 'Auxilium – Ihre Stütze in der Pflege', description = 'Auxilium bietet individuelle Pflegeberatung und ambulante Pflegeleistungen in Forst. Kristina Bronner steht Ihnen mit Herz und Fachkenntnis zur Seite.' }: { children: any, title?: string, description?: string }) => `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <title>${title}</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">

  <!-- Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">

  <!-- Main CSS -->
  <link rel="stylesheet" href="/static/style.css">

  <!-- Favicon as emoji -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🦋</text></svg>">
</head>
<body>

<!-- ─── Navigation ─────────────────────────────────────────── -->
<nav class="navbar" id="navbar" role="navigation" aria-label="Hauptnavigation">
  <div class="navbar__inner">
    <a href="/" class="navbar__logo" aria-label="Auxilium Startseite">
      <div class="logo-icon" aria-hidden="true">🦋</div>
      <div>
        <span>Auxilium</span>
        <span class="logo-sub">Pflegeberatung Forst</span>
      </div>
    </a>

    <nav class="navbar__nav" aria-label="Seitennavigation">
      <a href="/">Start</a>
      <a href="/ueber-auxilium">Über Auxilium</a>
      <a href="/leistungen">Leistungen &amp; Kosten</a>
      <a href="/beratung">Beratung</a>
      <a href="/kontakt">Kontakt</a>
    </nav>

    <a href="/kontakt" class="btn btn-primary navbar__cta">
      <i class="fas fa-phone" aria-hidden="true"></i>
      Jetzt anfragen
    </a>

    <button class="navbar__toggle" id="navToggle" aria-label="Menü öffnen" aria-expanded="false">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>
</nav>

<!-- ─── Page Content ────────────────────────────────────────── -->
${children}

<!-- ─── Footer ─────────────────────────────────────────────── -->
<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer__grid">
      <!-- Brand -->
      <div>
        <div class="footer__logo">
          <div class="logo-icon" aria-hidden="true">🦋</div>
          <span>Auxilium</span>
        </div>
        <p class="footer__desc">
          Einzigartige Pflege für einzigartige Menschen. Ich unterstütze Sie
          und Ihre Angehörigen in Forst und Umgebung – mit Fachkenntnis,
          Herz und Leidenschaft.
        </p>
        <div style="display:flex; gap:12px; margin-top:8px;">
          <a href="mailto:info@auxilium-forst.com" aria-label="E-Mail senden"
             style="width:36px;height:36px;background:rgba(255,255,255,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.7);transition:all 0.25s ease;"
             onmouseover="this.style.background='#E87722';this.style.color='white'"
             onmouseout="this.style.background='rgba(255,255,255,0.1)';this.style.color='rgba(255,255,255,0.7)'">
            <i class="fas fa-envelope" aria-hidden="true"></i>
          </a>
        </div>
      </div>

      <!-- Navigation -->
      <div>
        <p class="footer__heading">Navigation</p>
        <ul class="footer__links">
          <li><a href="/">Start</a></li>
          <li><a href="/ueber-auxilium">Über Auxilium</a></li>
          <li><a href="/leistungen">Leistungen &amp; Kosten</a></li>
          <li><a href="/beratung">Beratung</a></li>
          <li><a href="/kontakt">Kontakt</a></li>
        </ul>
      </div>

      <!-- Services -->
      <div>
        <p class="footer__heading">Leistungen</p>
        <ul class="footer__links">
          <li><a href="/leistungen#koerperpflege">Körperpflege</a></li>
          <li><a href="/leistungen#alltagshilfe">Alltagshilfe</a></li>
          <li><a href="/leistungen#betreuung">Betreuung</a></li>
          <li><a href="/leistungen#einkauf">Einkauf</a></li>
          <li><a href="/beratung">Pflegeberatung</a></li>
        </ul>
      </div>

      <!-- Contact -->
      <div>
        <p class="footer__heading">Kontakt</p>
        <ul class="footer__links">
          <li style="color:rgba(255,255,255,0.65); font-size:0.9rem; margin-bottom:8px;">
            <i class="fas fa-map-marker-alt" aria-hidden="true" style="color:#E87722; margin-right:6px;"></i>
            Forst (Lausitz) &amp; Umgebung
          </li>
          <li style="color:rgba(255,255,255,0.65); font-size:0.9rem; margin-bottom:8px;">
            <i class="fas fa-envelope" aria-hidden="true" style="color:#E87722; margin-right:6px;"></i>
            <a href="mailto:info@auxilium-forst.com">info@auxilium-forst.com</a>
          </li>
          <li style="color:rgba(255,255,255,0.65); font-size:0.9rem;">
            <i class="fas fa-clock" aria-hidden="true" style="color:#E87722; margin-right:6px;"></i>
            Mo–Fr 8:00 – 18:00 Uhr
          </li>
        </ul>
      </div>
    </div>

    <div class="footer__bottom">
      <p>&copy; ${new Date().getFullYear()} Auxilium – Kristina Bronner. Alle Rechte vorbehalten.</p>
      <div style="display:flex; gap:20px;">
        <a href="/impressum" style="color:rgba(255,255,255,0.5); font-size:0.82rem; transition:color 0.25s ease;"
           onmouseover="this.style.color='#E87722'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Impressum</a>
        <a href="/datenschutz" style="color:rgba(255,255,255,0.5); font-size:0.82rem; transition:color 0.25s ease;"
           onmouseover="this.style.color='#E87722'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Datenschutz</a>
      </div>
    </div>
  </div>
</footer>

<!-- Scroll to top -->
<button class="scroll-top" id="scrollTop" aria-label="Nach oben scrollen">
  <i class="fas fa-chevron-up" aria-hidden="true"></i>
</button>

<!-- Main JS -->
<script src="/static/app.js" defer></script>
</body>
</html>`

// ─── HOME PAGE ────────────────────────────────────────────────
app.get('/', (c) => {
  return c.html(Layout({
    title: 'Auxilium – Ihre Stütze in der Pflege | Forst',
    children: `
<!-- HERO -->
<section class="hero" aria-labelledby="hero-heading">
  <div class="hero__bg-shapes" aria-hidden="true">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
  </div>

  <div class="hero__inner">
    <div class="hero__content animate-fade-in">
      <div class="hero__badge">
        <span class="badge-dot"></span>
        Individuelle Pflege in Forst &amp; Umgebung
      </div>

      <h1 id="hero-heading" class="hero__title">
        Ihre persönliche <span class="highlight">Stütze</span> –<br>
        wenn Sie sie brauchen
      </h1>

      <p class="hero__text">
        Auxilium begleitet pflegebedürftige Menschen und ihre Angehörigen
        mit Fachkenntnis, Einfühlungsvermögen und echter Leidenschaft.
        Professionell. Günstig. Menschlich.
      </p>

      <div class="hero__actions">
        <a href="/kontakt" class="btn btn-primary">
          <i class="fas fa-calendar-check" aria-hidden="true"></i>
          Kostenloses Erstgespräch
        </a>
        <a href="/leistungen" class="btn btn-outline">
          <i class="fas fa-list" aria-hidden="true"></i>
          Leistungen ansehen
        </a>
      </div>

      <div class="hero__stats">
        <div>
          <div class="hero__stat-number" data-count="5" data-suffix=",7 Mio.">5,7 Mio.</div>
          <div class="hero__stat-label">Pflegebedürftige in DE</div>
        </div>
        <div>
          <div class="hero__stat-number" data-count="80" data-suffix="+ %">80+ %</div>
          <div class="hero__stat-label">werden zu Hause versorgt</div>
        </div>
        <div>
          <div class="hero__stat-number" data-count="100" data-suffix="%">100%</div>
          <div class="hero__stat-label">individuelle Betreuung</div>
        </div>
      </div>
    </div>

    <div class="hero__visual animate-fade-in-delay-1">
      <div class="hero__card-main animate-float">
        <div style="width:100%;height:420px;background:linear-gradient(135deg,#FAEADC 0%,#E87722 50%,#C96210 100%);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;">
          <div style="font-size:7rem;line-height:1;">🦋</div>
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:1.4rem;font-weight:700;color:white;text-align:center;padding:0 32px;line-height:1.4;">
            Einzigartige Pflege für einzigartige Menschen
          </div>
        </div>

        <div class="hero__floating-badge top-left">
          <div class="badge-icon">❤️</div>
          <div class="badge-text">
            <strong>Mit Herz dabei</strong>
            <span>Individuelle Betreuung</span>
          </div>
        </div>

        <div class="hero__floating-badge bottom-right">
          <div class="badge-icon">💡</div>
          <div class="badge-text">
            <strong>Pflegeberatung</strong>
            <span>Kostenlos &amp; unverbindlich</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURE STRIP -->
<div class="feature-strip" role="complementary" aria-label="Unsere Versprechen">
  <div class="container">
    <div class="feature-strip__inner">
      <div class="feature-strip__item">
        <span class="icon" aria-hidden="true">✅</span>
        Günstigere Preise als ambulante Dienste
      </div>
      <div class="feature-strip__item">
        <span class="icon" aria-hidden="true">🤝</span>
        Persönlicher Ansprechpartner
      </div>
      <div class="feature-strip__item">
        <span class="icon" aria-hidden="true">🏠</span>
        Pflege in Ihrem Zuhause
      </div>
      <div class="feature-strip__item">
        <span class="icon" aria-hidden="true">📋</span>
        Abrechnung über Pflegekasse
      </div>
    </div>
  </div>
</div>

<!-- WHY AUXILIUM -->
<section class="section" aria-labelledby="why-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Warum Auxilium?</span>
      <h2 id="why-heading">Pflege, die wirklich hilft</h2>
      <p style="max-width:600px;margin:16px auto 0;">
        Die Entscheidung für einen Pflegedienst ist nicht leicht. Auxilium bietet Ihnen
        eine bewusste Alternative – professionell, menschlich und bezahlbar.
      </p>
    </div>

    <div class="grid-3">
      <article class="card">
        <div class="card__icon" aria-hidden="true">👤</div>
        <h3 class="card__title">Einzigartigkeit</h3>
        <p class="card__text">
          Jeder Mensch verdient individuelle Aufmerksamkeit. Bei Auxilium steht
          Ihre persönliche Situation immer im Mittelpunkt – keine Massenabfertigung.
        </p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">💰</div>
        <h3 class="card__title">Günstigere Preise</h3>
        <p class="card__text">
          Auxilium ist deutlich günstiger als herkömmliche ambulante Pflegedienste –
          und kann über Verhinderungspflege und Entlastungsbetrag abgerechnet werden.
        </p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">🎓</div>
        <h3 class="card__title">Professionelle Beratung</h3>
        <p class="card__text">
          Sie erhalten eine vollständige Übersicht aller Leistungsansprüche aus
          der Pflegekasse – und helfen, diese optimal für sich zu nutzen.
        </p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">🏡</div>
        <h3 class="card__title">Zuhause bleiben</h3>
        <p class="card__text">
          Über 80 % der Pflegebedürftigen wollen zu Hause versorgt werden.
          Auxilium macht das möglich – mit dem Gefühl, das ein Zuhause ausmacht.
        </p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">👨‍👩‍👧</div>
        <h3 class="card__title">Entlastung der Familie</h3>
        <p class="card__text">
          Auch pflegende Angehörige sind Kunden bei Auxilium. Ich stärke dem
          gesamten Umfeld den Rücken und schaffe dringend benötigte Freiräume.
        </p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">🔍</div>
        <h3 class="card__title">Transparenz</h3>
        <p class="card__text">
          Klare Preise, kein Kleingedrucktes. Sie wissen immer genau, was Sie
          erwartet – ohne böse Überraschungen oder versteckte Kosten.
        </p>
      </article>
    </div>
  </div>
</section>

<!-- STATS BANNER -->
<div class="stats-banner" role="complementary" aria-label="Pflegestatistiken">
  <div class="container">
    <div class="stats-banner__grid">
      <div class="text-center">
        <span class="stats-banner__number" data-count="57" data-suffix=" Mio.">5,7 Mio.</span>
        <p class="stats-banner__label">Pflegebedürftige in Deutschland (2019)</p>
      </div>
      <div class="text-center">
        <span class="stats-banner__number" data-count="80" data-suffix="+ %">80+ %</span>
        <p class="stats-banner__label">werden zu Hause versorgt</p>
      </div>
      <div class="text-center">
        <span class="stats-banner__number" data-count="31" data-suffix=" Mio.">3,1 Mio.</span>
        <p class="stats-banner__label">ausschließlich durch Angehörige betreut</p>
      </div>
      <div class="text-center">
        <span class="stats-banner__number" data-count="2060" data-suffix="">2060</span>
        <p class="stats-banner__label">Hochrechnung: über 6 Mio. Pflegebedürftige</p>
      </div>
    </div>
  </div>
</div>

<!-- SERVICES PREVIEW -->
<section class="section section--soft" aria-labelledby="services-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Meine Leistungen</span>
      <h2 id="services-heading">Was ich für Sie tue</h2>
      <p style="max-width:560px;margin:16px auto 0;">
        Vom Erstgespräch bis zur regelmäßigen Betreuung – Auxilium ist für Sie da.
      </p>
    </div>

    <div class="grid-3">
      <article class="service-card">
        <div class="service-card__header">
          <div class="service-card__icon" aria-hidden="true">🛁</div>
          <div>
            <h3 class="service-card__title">Körperpflege</h3>
            <span class="service-card__subtitle">Baden, Duschen, Waschen</span>
          </div>
        </div>
        <div class="service-card__body">
          <p class="service-card__text">
            Unterstützung beim Duschen oder Baden inkl. An- und Auskleiden,
            Zahnpflege und Mobilisierung im Bad.
          </p>
          <div class="service-card__price">
            <span class="price-new">ab 21,00 €</span>
            <span class="price-compare">28,55 €</span>
            <span class="price-note">Vergleich amb. Dienst</span>
          </div>
          <a href="/leistungen#koerperpflege" class="btn btn-outline" style="width:100%;justify-content:center;">
            Details ansehen
          </a>
        </div>
      </article>

      <article class="service-card">
        <div class="service-card__header">
          <div class="service-card__icon" aria-hidden="true">🤲</div>
          <div>
            <h3 class="service-card__title">Betreuung</h3>
            <span class="service-card__subtitle">Begleitung &amp; Gesellschaft</span>
          </div>
        </div>
        <div class="service-card__body">
          <p class="service-card__text">
            Gesellschaft beim Essen, Spaziergänge, Tagesausflüge und vieles mehr –
            die Betreuungsmöglichkeiten sind vielfältig.
          </p>
          <div class="service-card__price">
            <span class="price-new">15,00 €</span>
            <span class="price-compare">17,33 €</span>
            <span class="price-note">je angef. Viertelstunde</span>
          </div>
          <a href="/leistungen#betreuung" class="btn btn-outline" style="width:100%;justify-content:center;">
            Details ansehen
          </a>
        </div>
      </article>

      <article class="service-card">
        <div class="service-card__header">
          <div class="service-card__icon" aria-hidden="true">📋</div>
          <div>
            <h3 class="service-card__title">Alltagsorganisation</h3>
            <span class="service-card__subtitle">Termine, Einkauf &amp; mehr</span>
          </div>
        </div>
        <div class="service-card__body">
          <p class="service-card__text">
            Terminvereinbarungen, Arztbesuche, Friseur, Einkauf –
            Auxilium hilft Ihnen, den Alltag zu meistern.
          </p>
          <div class="service-card__price">
            <span class="price-new">15,00 €</span>
            <span class="price-compare">17,33 €</span>
            <span class="price-note">je angef. Viertelstunde</span>
          </div>
          <a href="/leistungen#alltag" class="btn btn-outline" style="width:100%;justify-content:center;">
            Details ansehen
          </a>
        </div>
      </article>
    </div>

    <div class="text-center mt-8">
      <a href="/leistungen" class="btn btn-primary">
        <i class="fas fa-arrow-right" aria-hidden="true"></i>
        Alle Leistungen und Preise
      </a>
    </div>
  </div>
</section>

<!-- QUOTE / TESTIMONIAL -->
<section class="section" aria-labelledby="quote-heading">
  <div class="container">
    <div class="grid-2">
      <div>
        <span class="section-label">Meine Philosophie</span>
        <h2 id="quote-heading">Zuhause ist kein Ort – es ist ein Gefühl</h2>
        <p style="margin:20px 0 32px;">
          Ich glaube, dass jeder Mensch das Recht hat, in seiner vertrauten
          Umgebung zu leben – auch wenn Pflege notwendig wird. Mit Auxilium
          machen wir das gemeinsam möglich.
        </p>
        <a href="/ueber-auxilium" class="btn btn-primary">
          <i class="fas fa-user" aria-hidden="true"></i>
          Mehr über mich
        </a>
      </div>

      <div style="display:flex; flex-direction:column; gap:20px;">
        <div class="quote-card">
          <div class="quote-card__icon" aria-hidden="true">"</div>
          <p class="quote-card__text">
            Akzeptiere, was ist, lass gehen, was war,
            und habe Vertrauen in das, was kommt.
          </p>
          <div class="quote-card__author">
            <div class="quote-card__avatar" aria-hidden="true">M</div>
            <div>
              <div class="quote-card__name">Ma Vie</div>
              <div class="quote-card__role">Leitspruch von Auxilium</div>
            </div>
          </div>
        </div>

        <div class="quote-card">
          <div class="quote-card__icon" aria-hidden="true">"</div>
          <p class="quote-card__text">
            Der Schmetterling steht für die Kraft der persönlichen Transformation –
            und für den Mut, Hilfe anzunehmen. Auxilium ist die Stütze, die fehlt.
          </p>
          <div class="quote-card__author">
            <div class="quote-card__avatar" aria-hidden="true">KB</div>
            <div>
              <div class="quote-card__name">Kristina Bronner</div>
              <div class="quote-card__role">Gründerin von Auxilium</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FUNDING BOX -->
<section class="section section--muted" aria-labelledby="funding-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Finanzierung</span>
      <h2 id="funding-heading">Nutzen Sie Ihren Pflegekassen-Anspruch</h2>
      <p style="max-width:540px;margin:16px auto 0;">
        Als Bezieher von Pflegegeld stehen Ihnen jährlich Mittel zu, die Sie
        gezielt für Auxilium-Leistungen einsetzen können.
      </p>
    </div>

    <div class="grid-2" style="align-items:stretch; gap:32px;">
      <article class="funding-box">
        <span class="section-label">Verhinderungspflege + Kurzzeitpflege</span>
        <div class="funding-box__amount">3.539 €</div>
        <p class="funding-box__label">Jährlicher Anspruch pro Person</p>
        <p class="funding-box__note">
          Dieser Betrag ist zweckgebunden und kann vollständig für
          Auxilium-Leistungen genutzt werden.
        </p>
        <a href="/beratung" class="btn btn-primary mt-6">
          <i class="fas fa-info-circle" aria-hidden="true"></i>
          Mehr erfahren
        </a>
      </article>

      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="contact-info-item">
          <div class="info-icon" aria-hidden="true">💶</div>
          <div>
            <div class="info-label">Pflegegeld</div>
            <div class="info-value">Geld- oder Sachleistung flexibel nutzen</div>
          </div>
        </div>
        <div class="contact-info-item">
          <div class="info-icon" aria-hidden="true">🔄</div>
          <div>
            <div class="info-label">Entlastungsbetrag</div>
            <div class="info-value">bis zu 125 € monatlich für Betreuung</div>
          </div>
        </div>
        <div class="contact-info-item">
          <div class="info-icon" aria-hidden="true">🏥</div>
          <div>
            <div class="info-label">Kurzzeitpflege</div>
            <div class="info-value">Überbrückung bei Krankenhausaufenthalt</div>
          </div>
        </div>
        <div class="contact-info-item">
          <div class="info-icon" aria-hidden="true">🔧</div>
          <div>
            <div class="info-label">Hilfsmittel &amp; Umbau</div>
            <div class="info-value">Zuschüsse für wohnumfeldverbessernde Maßnahmen</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA BANNER -->
<section style="background:linear-gradient(135deg,#E87722,#C96210); padding:80px 0;" aria-labelledby="cta-heading">
  <div class="container text-center">
    <h2 id="cta-heading" style="color:white;font-size:clamp(1.6rem,3vw,2.4rem);margin-bottom:16px;">
      Bereit für das erste Gespräch?
    </h2>
    <p style="color:rgba(255,255,255,0.85); max-width:520px; margin:0 auto 36px; font-size:1.05rem; line-height:1.7;">
      Das Erstgespräch ist kostenlos und unverbindlich. Gemeinsam finden wir
      heraus, wie Auxilium Ihnen am besten helfen kann.
    </p>
    <div class="flex justify-center gap-4 flex-wrap">
      <a href="/kontakt" class="btn btn-white">
        <i class="fas fa-calendar-check" aria-hidden="true"></i>
        Termin vereinbaren
      </a>
      <a href="/leistungen" class="btn btn-ghost-white">
        <i class="fas fa-list" aria-hidden="true"></i>
        Leistungen ansehen
      </a>
    </div>
  </div>
</section>
`}))
})

// ─── ÜBER AUXILIUM ────────────────────────────────────────────
app.get('/ueber-auxilium', (c) => {
  return c.html(Layout({
    title: 'Über Auxilium – Kristina Bronner | Pflegeberatung Forst',
    description: 'Lernen Sie Kristina Bronner und die Philosophie von Auxilium kennen. Individuelle Pflege mit Herz und Fachkenntnis in Forst.',
    children: `
<section class="page-hero" aria-labelledby="page-heading">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Start</a>
      <span class="sep" aria-hidden="true">›</span>
      <span class="current">Über Auxilium</span>
    </nav>
    <span class="section-label">Über uns</span>
    <h1 id="page-heading">Einzigartige Pflege für einzigartige Menschen</h1>
    <p style="color:rgba(255,255,255,0.8); max-width:560px; margin-top:16px; font-size:1.05rem;">
      Lernen Sie Kristina Bronner und die Idee hinter Auxilium kennen.
    </p>
  </div>
</section>

<!-- PERSON SECTION -->
<section class="section" aria-labelledby="person-heading">
  <div class="container">
    <div class="grid-2" style="gap:64px;">
      <div>
        <span class="section-label">Zur Person</span>
        <h2 id="person-heading">Kristina Bronner</h2>
        <p style="margin: 16px 0 24px;">
          Als Gründerin von Auxilium bringe ich meine Leidenschaft für die Pflege mit
          echtem Engagement in Ihren Alltag. Mein Versprechen: individuelle, qualitativ
          hochwertige Versorgung – nicht nur pflegerisch, sondern als ganzheitliche
          Unterstützung für Sie und Ihre Angehörigen.
        </p>
        <p style="margin-bottom: 24px;">
          Ich glaube daran, dass jeder Mensch das Recht hat, in seiner vertrauten
          Umgebung zu leben und seinen Alltag so angenehm wie möglich zu gestalten –
          unabhängig von Einschränkungen. Dabei stehen die Teilhabe am sozialen Leben
          und das Wohlergehen des gesamten Umfelds im Vordergrund.
        </p>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="step-item">
            <div class="step-number" aria-hidden="true">💜</div>
            <div class="step-content">
              <div class="step-title">Leidenschaft für Menschen</div>
              <div class="step-text">Jeder Mensch ist einzigartig – diese Überzeugung trägt meine Arbeit täglich.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number" aria-hidden="true">🎓</div>
            <div class="step-content">
              <div class="step-title">Fachkenntnis &amp; Qualität</div>
              <div class="step-text">Professionelle Pflege auf höchstem Niveau, verbunden mit menschlicher Wärme.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number" aria-hidden="true">🤝</div>
            <div class="step-content">
              <div class="step-title">Verlässlichkeit</div>
              <div class="step-text">Sie können sich auf mich verlassen – pünktlich, konstant und transparent.</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style="background:linear-gradient(135deg,#FAEADC,#F5D5B8);border-radius:20px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.14);text-align:center;padding:48px 32px;">
          <div style="font-size:6rem;margin-bottom:16px;">🦋</div>
          <h3 style="font-family:'Playfair Display',Georgia,serif; font-size:1.4rem; color:#2D2D2D; margin-bottom:12px;">
            Das Symbol von Auxilium
          </h3>
          <p style="font-size:0.9rem; color:#666; line-height:1.75;">
            Ein Schmetterling mit einem fehlenden Flügel – symbolisch für die Kraft der
            persönlichen Transformation. Der Mut, Hilfe anzunehmen. Auxilium ist die
            Stütze, die diesen Flügel ersetzt.
          </p>
          <div style="margin-top:24px; padding:16px; background:white; border-radius:12px;">
            <div style="font-size:0.82rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#E87722; margin-bottom:6px;">Farbe & Bedeutung</div>
            <div style="font-size:0.88rem; color:#333;">
              <span style="display:inline-block; width:12px; height:12px; background:#E87722; border-radius:50%; margin-right:6px; vertical-align:middle;"></span>
              Orange steht für Lebensenergie und Leidenschaft
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- MISSION / LEITBILD -->
<section class="section section--soft" aria-labelledby="mission-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Leitbild</span>
      <h2 id="mission-heading">Wofür Auxilium steht</h2>
    </div>

    <div class="grid-3">
      <article class="card">
        <div class="card__icon" aria-hidden="true">🌟</div>
        <h3 class="card__title">Ganzheitlichkeit</h3>
        <p class="card__text">
          Pflege bedeutet mehr als körperliche Versorgung. Auxilium denkt den
          ganzen Menschen – seine sozialen Bedürfnisse, sein Wohlbefinden und
          das seiner Familie.
        </p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">🔓</div>
        <h3 class="card__title">Freiräume schaffen</h3>
        <p class="card__text">
          Pflegende Angehörige brauchen Auszeiten. Ich schaffe die Freiräume,
          die Sie benötigen – damit Sie wieder auftanken und neue Kraft schöpfen können.
        </p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">🏅</div>
        <h3 class="card__title">Qualität als Standard</h3>
        <p class="card__text">
          Qualitativ hochwertige Pflege ist kein Luxus, sondern ein Recht. Auxilium
          liefert diesen Standard – zu fairen, transparenten Preisen.
        </p>
      </article>
    </div>
  </div>
</section>

<!-- PHILOSOPHY QUOTE -->
<section class="section" aria-labelledby="philosophy-heading">
  <div class="container">
    <div style="max-width:800px; margin:0 auto;">
      <div class="quote-card" style="padding:56px;">
        <div class="quote-card__icon" aria-hidden="true">"</div>
        <p class="quote-card__text" style="font-size:1.25rem;">
          Wir ALLE sind früher oder später auf pflegerische Hilfe angewiesen.
          Gut, wenn es noch professionelles Pflegepersonal gibt, welches qualitativ
          hochwertige Pflege anbieten kann!
        </p>
        <div class="quote-card__author" style="margin-top:28px;">
          <div class="quote-card__avatar">KB</div>
          <div>
            <div class="quote-card__name">Kristina Bronner</div>
            <div class="quote-card__role">Gründerin &amp; Pflegeberaterin, Auxilium Forst</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PROCESS -->
<section class="section section--soft" aria-labelledby="process-heading">
  <div class="container">
    <div class="grid-2" style="gap:64px;">
      <div>
        <span class="section-label">Mein Ansatz</span>
        <h2 id="process-heading">So arbeite ich mit Ihnen</h2>
        <p style="margin:16px 0 32px;">
          Vom ersten Kontakt bis zur laufenden Betreuung – Auxilium begleitet Sie
          Schritt für Schritt.
        </p>

        <div style="display:flex; flex-direction:column; gap:24px;">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <div class="step-title">Kostenloses Erstgespräch</div>
              <div class="step-text">Wir lernen uns kennen, ich höre Ihnen zu und verstehe Ihre Bedürfnisse und Wünsche.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <div class="step-title">Individuelle Bedarfsanalyse</div>
              <div class="step-text">Gemeinsam erkunden wir Ihre Ressourcen und Möglichkeiten – und welche Hilfe wirklich sinnvoll ist.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <div class="step-title">Pflegeplan erstellen</div>
              <div class="step-text">Ein maßgeschneiderter Plan, der sich nach Ihrem Leben richtet – nicht umgekehrt.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <div class="step-title">Regelmäßige Betreuung</div>
              <div class="step-text">Zuverlässige Unterstützung im Alltag – mit regelmäßigem Austausch und Anpassung bei Bedarf.</div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:20px;">
        <div class="contact-info-item">
          <div class="info-icon" aria-hidden="true">📍</div>
          <div>
            <div class="info-label">Einsatzgebiet</div>
            <div class="info-value">Forst (Lausitz) und Umgebung</div>
          </div>
        </div>
        <div class="contact-info-item">
          <div class="info-icon" aria-hidden="true">🕐</div>
          <div>
            <div class="info-label">Erreichbarkeit</div>
            <div class="info-value">Montag–Freitag, 8:00–18:00 Uhr</div>
          </div>
        </div>
        <div class="contact-info-item">
          <div class="info-icon" aria-hidden="true">💬</div>
          <div>
            <div class="info-label">Erstgespräch</div>
            <div class="info-value">Kostenlos &amp; unverbindlich</div>
          </div>
        </div>
        <a href="/kontakt" class="btn btn-primary" style="margin-top:8px; align-self:flex-start;">
          <i class="fas fa-calendar" aria-hidden="true"></i>
          Termin anfragen
        </a>
      </div>
    </div>
  </div>
</section>
`}))
})

// ─── LEISTUNGEN & KOSTEN ──────────────────────────────────────
app.get('/leistungen', (c) => {
  return c.html(Layout({
    title: 'Leistungen & Kosten – Auxilium Pflegedienst Forst',
    description: 'Alle Pflegeleistungen von Auxilium auf einen Blick – mit transparenten Preisen und Vergleich zu ambulanten Pflegediensten.',
    children: `
<section class="page-hero" aria-labelledby="page-heading">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Start</a>
      <span class="sep" aria-hidden="true">›</span>
      <span class="current">Leistungen &amp; Kosten</span>
    </nav>
    <span class="section-label">Leistungen</span>
    <h1 id="page-heading">Transparente Preise – faire Leistungen</h1>
    <p style="color:rgba(255,255,255,0.8); max-width:560px; margin-top:16px; font-size:1.05rem;">
      Alle Leistungen von Auxilium im Überblick – mit ehrlichem Preisvergleich.
    </p>
  </div>
</section>

<!-- INTRO -->
<section class="section" aria-labelledby="intro-heading">
  <div class="container">
    <div class="grid-2" style="gap:64px;">
      <div>
        <span class="section-label">Mein Ansatz</span>
        <h2 id="intro-heading">Es gibt immer eine Lösung – und nicht nur eine</h2>
        <p style="margin: 16px 0 20px;">
          Wir alle begegnen dem Leben auf unsere eigene Weise. Auxilium hilft Ihnen,
          Ihre persönliche Lösung zu finden, indem wir gemeinsam Ihre Ressourcen erörtern
          und daran aufbauen.
        </p>
        <p style="margin-bottom: 28px;">
          Für mich steht die individuelle Versorgung meiner Kunden im Zentrum.
          Ich will meine Kunden ganzheitlich gut versorgt wissen – das bezieht sich
          nicht nur auf den pflegerischen Aspekt, sondern auch auf die Teilhabe am sozialen Leben.
        </p>
        <div style="background:var(--primary-light);border-radius:12px;padding:20px;border-left:4px solid var(--primary);">
          <p style="font-size:0.9rem;font-weight:600;color:var(--secondary);margin-bottom:4px;">
            ⚠️ Alle Preise verstehen sich zzgl. Wegpauschale
          </p>
          <p style="font-size:0.82rem;color:var(--text-light);">
            Die Wegpauschale variiert je nach Einsatzort und wird vorab transparent kommuniziert.
          </p>
        </div>
      </div>

      <article class="funding-box">
        <span class="section-label">Ihr Vorteil</span>
        <div class="funding-box__amount">3.539 €</div>
        <p class="funding-box__label">Jährlicher Anspruch (Verhinderungs- + Kurzzeitpflege)</p>
        <p style="font-size:0.9rem;color:var(--text-light);margin:16px 0;">
          Wenn Sie Pflegegeld beziehen oder Kombinationsleistung nutzen und bereits die
          Verhinderungspflege (+ Kurzzeitpflege) in Anspruch nehmen, steht Ihnen dieser
          Betrag zur Verfügung – zweckgebunden für Auxilium-Leistungen.
        </p>
        <p class="funding-box__note">Setzen Sie diesen Betrag sinnvoll für sich ein!</p>
        <a href="/beratung" class="btn btn-primary mt-6" style="display:inline-flex;">
          <i class="fas fa-info-circle" aria-hidden="true"></i>
          Beratung anfragen
        </a>
      </article>
    </div>
  </div>
</section>

<!-- SERVICES DETAIL -->
<section class="section section--soft" aria-labelledby="services-detail-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Alle Leistungen</span>
      <h2 id="services-detail-heading">Was Auxilium für Sie tut</h2>
    </div>

    <div class="grid-2" style="gap:28px;">

      <!-- Große Körperpflege -->
      <article class="service-card" id="koerperpflege">
        <div class="service-card__header">
          <div class="service-card__icon" aria-hidden="true">🛁</div>
          <div>
            <h3 class="service-card__title">Große Körperpflege</h3>
            <span class="service-card__subtitle">Baden / Duschen · ca. 35 Min</span>
          </div>
        </div>
        <div class="service-card__body">
          <p class="service-card__text">
            Unterstützung beim Duschen oder Baden. Mit im Paket enthalten:
            Hilfe beim An- und Auskleiden, Zahnpflege und Mobilisierung im Bad.
          </p>
          <div class="service-card__price">
            <span class="price-new">35,00 €</span>
            <span class="price-compare">42,69 €</span>
            <span class="price-note">Ambulanter Dienst</span>
          </div>
          <div style="font-size:0.8rem;color:var(--primary);font-weight:600;">
            ✅ Sie sparen: 7,69 € pro Einsatz
          </div>
        </div>
      </article>

      <!-- Kleine Körperpflege -->
      <article class="service-card">
        <div class="service-card__header">
          <div class="service-card__icon" aria-hidden="true">🧼</div>
          <div>
            <h3 class="service-card__title">Kleine Körperpflege</h3>
            <span class="service-card__subtitle">"Katzenwäsche" · ca. 20 Min</span>
          </div>
        </div>
        <div class="service-card__body">
          <p class="service-card__text">
            Körperpflege am Waschbecken morgens und/oder abends: Waschung des
            Oberkörpers, Rückenwaschung, Intimpflege sowie Zahnpflege.
          </p>
          <div class="service-card__price">
            <span class="price-new">21,00 €</span>
            <span class="price-compare">28,55 €</span>
            <span class="price-note">Ambulanter Dienst</span>
          </div>
          <div style="font-size:0.8rem;color:var(--primary);font-weight:600;">
            ✅ Sie sparen: 7,55 € pro Einsatz
          </div>
        </div>
      </article>

      <!-- Einkauf -->
      <article class="service-card" id="einkauf">
        <div class="service-card__header">
          <div class="service-card__icon" aria-hidden="true">🛒</div>
          <div>
            <h3 class="service-card__title">Einkauf</h3>
            <span class="service-card__subtitle">Immer frische Lebensmittel</span>
          </div>
        </div>
        <div class="service-card__body">
          <p class="service-card__text">
            Sie haben Schwierigkeiten, Ihren Einkauf zu erledigen? Lassen Sie
            uns gemeinsam schauen, was Sie brauchen – und Sie bekommen es!
          </p>
          <div class="service-card__price">
            <span class="price-new">15,00 €</span>
            <span class="price-compare">17,33 €</span>
            <span class="price-note">je angef. Viertelstunde</span>
          </div>
          <div style="font-size:0.78rem;color:#999;margin-top:4px;">
            ⚠️ Ambulanter Dienst berechnet je angefangene Viertelstunde (17,33 €!)
          </div>
        </div>
      </article>

      <!-- Betreuung -->
      <article class="service-card" id="betreuung">
        <div class="service-card__header">
          <div class="service-card__icon" aria-hidden="true">🤲</div>
          <div>
            <h3 class="service-card__title">Pflegerische Betreuungsmaßnahme</h3>
            <span class="service-card__subtitle">Stets gut umsorgt</span>
          </div>
        </div>
        <div class="service-card__body">
          <p class="service-card__text">
            Gesellschaft beim Essen, Spaziergänge (wenn Sie unsicher auf den Beinen sind),
            Tagesausflüge und vieles mehr. Die Betreuungsmöglichkeiten sind endlos!
            Was wünschen Sie sich?
          </p>
          <div class="service-card__price">
            <span class="price-new">15,00 €</span>
            <span class="price-compare">17,33 €</span>
            <span class="price-note">je angef. Viertelstunde</span>
          </div>
          <div style="font-size:0.78rem;color:#999;margin-top:4px;">
            ⚠️ Ambulanter Dienst berechnet je angefangene Viertelstunde
          </div>
        </div>
      </article>

      <!-- Alltagsorganisation -->
      <article class="service-card" id="alltag">
        <div class="service-card__header">
          <div class="service-card__icon" aria-hidden="true">📅</div>
          <div>
            <h3 class="service-card__title">Alltagsorganisation</h3>
            <span class="service-card__subtitle">Im Alltag alles im Griff</span>
          </div>
        </div>
        <div class="service-card__body">
          <p class="service-card__text">
            Termine vereinbaren oder wahrnehmen, Arztbesuche, Friseur, Behördengänge –
            und falls der Alltag im Chaos versinkt: Auxilium ist zur Stelle und bringt
            wieder Ordnung.
          </p>
          <div class="service-card__price">
            <span class="price-new">15,00 €</span>
            <span class="price-compare">17,33 €</span>
            <span class="price-note">je angef. Viertelstunde</span>
          </div>
          <div style="font-size:0.78rem;color:#999;margin-top:4px;">
            ⚠️ Ambulanter Dienst berechnet je angefangene Viertelstunde
          </div>
        </div>
      </article>

      <!-- CTA Card -->
      <article class="service-card" style="background:linear-gradient(135deg,var(--primary),var(--primary-dark));border:none;">
        <div class="service-card__body" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:40px;">
          <div style="font-size:3rem;margin-bottom:16px;" aria-hidden="true">💬</div>
          <h3 class="service-card__title" style="color:white;margin-bottom:12px;">Nicht das Richtige dabei?</h3>
          <p style="color:rgba(255,255,255,0.85);font-size:0.9rem;margin-bottom:24px;line-height:1.7;">
            Haben Sie individuelle Wünsche? Sprechen Sie mich an –
            gemeinsam finden wir eine Lösung.
          </p>
          <a href="/kontakt" class="btn btn-white">
            <i class="fas fa-phone" aria-hidden="true"></i>
            Jetzt anfragen
          </a>
        </div>
      </article>

    </div>
  </div>
</section>

<!-- WHO CAN USE -->
<section class="section" aria-labelledby="who-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Wer kann Auxilium nutzen?</span>
      <h2 id="who-heading">Auxilium ist für Sie, wenn …</h2>
    </div>

    <div class="grid-3">
      <article class="card" style="text-align:center;">
        <div class="card__icon" style="margin:0 auto 20px;" aria-hidden="true">💶</div>
        <h3 class="card__title">Sie Pflegegeld beziehen</h3>
        <p class="card__text">
          Pflegegeldempfänger können Auxilium-Leistungen flexibel und
          unkompliziert abrechnen.
        </p>
      </article>

      <article class="card" style="text-align:center;">
        <div class="card__icon" style="margin:0 auto 20px;" aria-hidden="true">🔄</div>
        <h3 class="card__title">Verhinderungspflege / Entlastungsbetrag</h3>
        <p class="card__text">
          Wer Verhinderungspflege oder den Entlastungsbetrag nutzt,
          kann Auxilium bis zu 3.539 € im Jahr finanzieren.
        </p>
      </article>

      <article class="card" style="text-align:center;">
        <div class="card__icon" style="margin:0 auto 20px;" aria-hidden="true">💳</div>
        <h3 class="card__title">Privatzahler/-innen</h3>
        <p class="card__text">
          Auch ohne Pflegekassen-Leistungen sind alle Auxilium-Angebote
          als Privatleistung buchbar – zu fairen Preisen.
        </p>
      </article>
    </div>

    <div class="text-center mt-8">
      <a href="/kontakt" class="btn btn-primary">
        <i class="fas fa-calendar-check" aria-hidden="true"></i>
        Kostenloses Erstgespräch vereinbaren
      </a>
    </div>
  </div>
</section>
`}))
})

// ─── BERATUNG ─────────────────────────────────────────────────
app.get('/beratung', (c) => {
  return c.html(Layout({
    title: 'Pflegeberatung – Auxilium Forst',
    description: 'Kostenlose Pflegeberatung in Forst: Pflegeversicherung, Hilfsmittel, Entlastungsbetrag, Verhinderungspflege und mehr – Auxilium erklärt Ihre Ansprüche.',
    children: `
<section class="page-hero" aria-labelledby="page-heading">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Start</a>
      <span class="sep" aria-hidden="true">›</span>
      <span class="current">Beratung</span>
    </nav>
    <span class="section-label">Pflegeberatung</span>
    <h1 id="page-heading">Kennen Sie alle Ihre Ansprüche?</h1>
    <p style="color:rgba(255,255,255,0.8); max-width:560px; margin-top:16px; font-size:1.05rem;">
      Die Pflegeversicherung bietet viele Möglichkeiten – ich helfe Ihnen, sie zu verstehen und optimal zu nutzen.
    </p>
  </div>
</section>

<!-- BERATUNG INTRO -->
<section class="section" aria-labelledby="advice-heading">
  <div class="container">
    <div class="grid-2" style="gap:64px;">
      <div>
        <span class="section-label">Warum Beratung?</span>
        <h2 id="advice-heading">Die Pflegeversicherung ist komplex – ich mache es einfach</h2>
        <p style="margin:16px 0 20px;">
          Die Pflegeversicherung ist lediglich eine "Teilkaskoversicherung" und setzt
          damit einen privaten Eigenanteil voraus. Deshalb ist es wichtig, alle Ansprüche
          zu kennen und zu nutzen.
        </p>
        <p style="margin-bottom: 28px;">
          Bei Auxilium erhalten Sie nicht nur Pflegeleistungen, sondern auf Wunsch auch
          eine vollständige Beratung zu allen Ihnen zustehenden Leistungen aus der Pflegekasse –
          damit Sie die beste Finanzierungslösung für Ihre Situation finden.
        </p>
        <a href="/kontakt" class="btn btn-primary">
          <i class="fas fa-calendar" aria-hidden="true"></i>
          Beratungsgespräch anfragen
        </a>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="contact-info-item">
          <div class="info-icon" aria-hidden="true">💡</div>
          <div>
            <div class="info-label">Vorteil</div>
            <div class="info-value">Individuelle Finanzierungsberatung inklusive</div>
          </div>
        </div>
        <div class="contact-info-item">
          <div class="info-icon" aria-hidden="true">📞</div>
          <div>
            <div class="info-label">Erstkontakt</div>
            <div class="info-value">Kostenlos und unverbindlich</div>
          </div>
        </div>
        <div class="contact-info-item">
          <div class="info-icon" aria-hidden="true">🏠</div>
          <div>
            <div class="info-label">Ort</div>
            <div class="info-value">Bei Ihnen zu Hause oder telefonisch</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- LEISTUNGEN DER PFLEGEVERSICHERUNG -->
<section class="section section--soft" aria-labelledby="insurance-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Pflegeversicherung</span>
      <h2 id="insurance-heading">Ihre Ansprüche im Überblick</h2>
      <p style="max-width:540px;margin:16px auto 0;">
        Folgende Leistungen können für die Finanzierung von Auxilium genutzt werden.
        Ich berate Sie gerne zu den Details.
      </p>
    </div>

    <div class="grid-2" style="gap:24px;">

      <article class="card">
        <div class="card__icon" aria-hidden="true">💶</div>
        <h3 class="card__title">Pflegerische Hilfen</h3>
        <p class="card__text">Geld- oder Sachleistung – je nach Bedarf und Pflegegrad optimal einsetzen.</p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">🔄</div>
        <h3 class="card__title">Entlastungsbetrag</h3>
        <p class="card__text">Bis zu 125 € monatlich (1.500 € jährlich) für anerkannte Entlastungsleistungen.</p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">⏸️</div>
        <h3 class="card__title">Kurzzeitpflege</h3>
        <p class="card__text">Überbrückung bei Krankenhausaufenthalten oder zur Entlastung der Angehörigen.</p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">🚀</div>
        <h3 class="card__title">Verhinderungspflege</h3>
        <p class="card__text">Wenn die reguläre Pflegeperson ausfällt – bis zu 1.612 € im Jahr (erhöhbar auf 3.539 €).</p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">🌗</div>
        <h3 class="card__title">Tages- und Nachtpflege</h3>
        <p class="card__text">Ergänzende Betreuung in teilstationären Einrichtungen tagsüber oder nachts.</p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">🏃</div>
        <h3 class="card__title">Reha</h3>
        <p class="card__text">Wissen Sie um Ihre Ansprüche auf eine Rehabilitation? Ich informiere Sie umfassend.</p>
      </article>

    </div>
  </div>
</section>

<!-- HILFSMITTEL -->
<section class="section" aria-labelledby="aids-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Hilfsmittel &amp; Wohnumfeld</span>
      <h2 id="aids-heading">Mehr Selbstständigkeit durch die richtigen Mittel</h2>
    </div>

    <div class="grid-3">
      <article class="card">
        <div class="card__icon" aria-hidden="true">🛡️</div>
        <h3 class="card__title">Pflegehilfsmittel</h3>
        <p class="card__text">Monatlich bis zu 40 € für zum Verbrauch bestimmte Pflegehilfsmittel (z. B. Einmalhandschuhe, Desinfektionsmittel).</p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">♿</div>
        <h3 class="card__title">Technische Hilfsmittel</h3>
        <p class="card__text">Zuschüsse für Rollstühle, Pflegebetten, Lifter und andere Hilfsmittel zur Erleichterung der Pflege.</p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">🏠</div>
        <h3 class="card__title">Wohnumfeldverbesserung</h3>
        <p class="card__text">Bis zu 4.000 € Zuschuss pro Maßnahme für barrierefreie Umbauten (Haltegriffe, Dusche, Rampen etc.).</p>
      </article>
    </div>
  </div>
</section>

<!-- BERUFLICHE ENTLASTUNG -->
<section class="section section--soft" aria-labelledby="work-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Für Berufstätige</span>
      <h2 id="work-heading">Pflegebedingte Freistellung von der Arbeit</h2>
    </div>

    <div class="grid-3">
      <article class="card">
        <div class="card__icon" aria-hidden="true">💼</div>
        <h3 class="card__title">Pflegeunterstützungsgeld</h3>
        <p class="card__text">Kurzfristige Arbeitsfreistellung (bis 10 Tage) bei akuter Pflegesituation – mit staatlicher Unterstützung.</p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">⏱️</div>
        <h3 class="card__title">Reduzierung der Arbeitszeit</h3>
        <p class="card__text">Bis zu 24 Monate Teilzeit-Option für pflegende Angehörige – mit zinslosen Darlehen des Bundes.</p>
      </article>

      <article class="card">
        <div class="card__icon" aria-hidden="true">📆</div>
        <h3 class="card__title">Option der Freistellung</h3>
        <p class="card__text">Vollständige Freistellung bis zu 6 Monate möglich – für intensive Pflegephasen oder die letzte Lebensphase.</p>
      </article>
    </div>
  </div>
</section>

<!-- PREVENTION / GESUNDHEIT -->
<section class="section" aria-labelledby="prevention-heading">
  <div class="container">
    <div class="grid-2" style="gap:64px;">
      <div>
        <span class="section-label">Prävention &amp; Gesundheit</span>
        <h2 id="prevention-heading">Vorbeugung ist besser als Nachsorge</h2>
        <p style="margin:16px 0 24px;">
          Die Pflegekasse unterstützt auch präventive Maßnahmen, die helfen,
          Pflegebedürftigkeit zu verhindern oder zu verzögern.
        </p>

        <div style="display:flex; flex-direction:column; gap:20px;">
          <div class="step-item">
            <div class="step-number" aria-hidden="true">💪</div>
            <div class="step-content">
              <div class="step-title">Gesundheitskurse</div>
              <div class="step-text">Präventionskurse (z. B. Bewegung, Ernährung, Stressbewältigung) werden von der Kasse bezuschusst.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number" aria-hidden="true">📚</div>
            <div class="step-content">
              <div class="step-title">Pflegekurse für Angehörige</div>
              <div class="step-text">Kostenlose Schulungen für pflegende Angehörige – vermittelt durch die Pflegekasse.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="quote-card">
        <div class="quote-card__icon" aria-hidden="true">"</div>
        <p class="quote-card__text">
          Der Verstand verspürt nur noch Stress und Überforderung, der einem die
          Lebensenergie raubt. Dann ist Auxilium der richtige Ansprechpartner für Sie!
        </p>
        <div class="quote-card__author" style="margin-top:24px;">
          <div class="quote-card__avatar">KB</div>
          <div>
            <div class="quote-card__name">Kristina Bronner</div>
            <div class="quote-card__role">Auxilium Pflegeberatung</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section style="background:linear-gradient(135deg,#E87722,#C96210); padding:80px 0;" aria-labelledby="advice-cta-heading">
  <div class="container text-center">
    <h2 id="advice-cta-heading" style="color:white;margin-bottom:16px;">
      Lassen Sie sich kostenlos beraten
    </h2>
    <p style="color:rgba(255,255,255,0.85); max-width:500px; margin:0 auto 36px; font-size:1.05rem; line-height:1.7;">
      In einem kostenlosen Gespräch analysiere ich mit Ihnen alle Ansprüche und
      erstelle die beste Finanzierungsstrategie für Ihre Situation.
    </p>
    <a href="/kontakt" class="btn btn-white">
      <i class="fas fa-calendar-check" aria-hidden="true"></i>
      Jetzt Beratungstermin anfragen
    </a>
  </div>
</section>
`}))
})

// ─── KONTAKT ──────────────────────────────────────────────────
app.get('/kontakt', (c) => {
  return c.html(Layout({
    title: 'Kontakt – Auxilium Pflegeberatung Forst',
    description: 'Nehmen Sie Kontakt mit Auxilium auf – kostenlose und unverbindliche Erstberatung für Pflegebedürftige und Angehörige in Forst.',
    children: `
<section class="page-hero" aria-labelledby="page-heading">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Start</a>
      <span class="sep" aria-hidden="true">›</span>
      <span class="current">Kontakt</span>
    </nav>
    <span class="section-label">Kontakt</span>
    <h1 id="page-heading">Wie kann Auxilium Ihnen helfen?</h1>
    <p style="color:rgba(255,255,255,0.8); max-width:560px; margin-top:16px; font-size:1.05rem;">
      Nehmen Sie Kontakt auf – das Erstgespräch ist kostenlos und unverbindlich.
    </p>
  </div>
</section>

<section class="section" aria-labelledby="contact-heading">
  <div class="container">
    <div class="grid-2" style="gap:64px; align-items:start;">

      <!-- Contact Info -->
      <div>
        <span class="section-label">Kontaktinformationen</span>
        <h2 id="contact-heading">Ich freue mich auf Ihre Nachricht</h2>
        <p style="margin:16px 0 32px; font-size:1rem;">
          Egal ob Sie Fragen zu Leistungen haben, eine Beratung wünschen oder
          einfach mehr über Auxilium erfahren möchten – schreiben Sie mir!
        </p>

        <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:40px;">
          <div class="contact-info-item">
            <div class="info-icon" aria-hidden="true">📍</div>
            <div>
              <div class="info-label">Einsatzgebiet</div>
              <div class="info-value">Forst (Lausitz) und Umgebung</div>
            </div>
          </div>
          <div class="contact-info-item">
            <div class="info-icon" aria-hidden="true">✉️</div>
            <div>
              <div class="info-label">E-Mail</div>
              <div class="info-value">
                <a href="mailto:info@auxilium-forst.com" style="color:var(--primary);">info@auxilium-forst.com</a>
              </div>
            </div>
          </div>
          <div class="contact-info-item">
            <div class="info-icon" aria-hidden="true">🕐</div>
            <div>
              <div class="info-label">Erreichbarkeit</div>
              <div class="info-value">Mo–Fr, 8:00 – 18:00 Uhr</div>
            </div>
          </div>
          <div class="contact-info-item">
            <div class="info-icon" aria-hidden="true">💬</div>
            <div>
              <div class="info-label">Erstgespräch</div>
              <div class="info-value">Kostenlos &amp; unverbindlich</div>
            </div>
          </div>
        </div>

        <!-- FAQ Accordion -->
        <h3 style="margin-bottom:20px; font-size:1.1rem;">Häufige Fragen</h3>
        <div class="accordion-list">
          <div class="accordion-item">
            <button class="accordion-toggle" aria-expanded="false">
              Wer kann Auxilium nutzen?
              <span class="chevron" aria-hidden="true"><i class="fas fa-chevron-down"></i></span>
            </button>
            <div class="accordion-body">
              <div class="accordion-body__inner">
                Auxilium richtet sich an Personen, die Pflegegeld beziehen, die Verhinderungspflege
                oder den Entlastungsbetrag nutzen wollen, sowie an Privatzahler/-innen.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <button class="accordion-toggle" aria-expanded="false">
              Ist das Erstgespräch wirklich kostenlos?
              <span class="chevron" aria-hidden="true"><i class="fas fa-chevron-down"></i></span>
            </button>
            <div class="accordion-body">
              <div class="accordion-body__inner">
                Ja, das Erstgespräch ist vollständig kostenlos und unverbindlich. Es dient dazu,
                Ihre Bedürfnisse kennenzulernen und gemeinsam zu schauen, wie Auxilium helfen kann.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <button class="accordion-toggle" aria-expanded="false">
              Kann ich Auxilium über die Pflegekasse abrechnen?
              <span class="chevron" aria-hidden="true"><i class="fas fa-chevron-down"></i></span>
            </button>
            <div class="accordion-body">
              <div class="accordion-body__inner">
                Ja! Auxilium kann über Verhinderungspflege und den Entlastungsbetrag abgerechnet werden.
                Bei einer Beratung zeige ich Ihnen genau, welche Möglichkeiten für Sie zutreffen.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <button class="accordion-toggle" aria-expanded="false">
              In welchen Bereichen ist Auxilium tätig?
              <span class="chevron" aria-hidden="true"><i class="fas fa-chevron-down"></i></span>
            </button>
            <div class="accordion-body">
              <div class="accordion-body__inner">
                Auxilium ist in Forst (Lausitz) und der unmittelbaren Umgebung tätig. Die genaue
                Wegpauschale hängt vom Einsatzort ab und wird vorab transparent kommuniziert.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div>
        <div class="contact-form">
          <h3 style="margin-bottom:8px;">Nachricht senden</h3>
          <p style="margin-bottom:28px; font-size:0.9rem; color:var(--text-light);">
            Füllen Sie das Formular aus – ich melde mich so schnell wie möglich bei Ihnen.
          </p>

          <form id="contactForm" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="firstName">Vorname *</label>
                <input class="form-input" id="firstName" name="firstName" type="text" placeholder="Max" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="lastName">Nachname *</label>
                <input class="form-input" id="lastName" name="lastName" type="text" placeholder="Mustermann" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="city">Wohnort</label>
              <input class="form-input" id="city" name="city" type="text" placeholder="z. B. Forst (Lausitz)">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="phone">Telefon</label>
                <input class="form-input" id="phone" name="phone" type="tel" placeholder="+49 ...">
              </div>
              <div class="form-group">
                <label class="form-label" for="email">E-Mail *</label>
                <input class="form-input" id="email" name="email" type="email" placeholder="max@beispiel.de" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="subject">Betreff</label>
              <select class="form-select" id="subject" name="subject">
                <option value="">Bitte wählen…</option>
                <option value="erstgespraech">Kostenloses Erstgespräch</option>
                <option value="beratung">Pflegeberatung</option>
                <option value="leistungen">Frage zu Leistungen &amp; Preisen</option>
                <option value="sonstiges">Sonstiges</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="message">Ihre Nachricht *</label>
              <textarea class="form-textarea" id="message" name="message"
                placeholder="Wie kann Auxilium Ihnen helfen? Beschreiben Sie kurz Ihre Situation…"
                rows="5" required></textarea>
            </div>

            <div class="form-group" style="flex-direction:row;align-items:flex-start;gap:10px;margin-bottom:24px;">
              <input type="checkbox" id="privacy" name="privacy" required
                style="margin-top:3px; accent-color:var(--primary); width:16px; height:16px; flex-shrink:0;">
              <label for="privacy" style="font-size:0.82rem; color:var(--text-light); cursor:pointer;">
                Ich stimme der Verarbeitung meiner Daten gemäß der
                <a href="/datenschutz" style="color:var(--primary);">Datenschutzerklärung</a> zu. *
              </label>
            </div>

            <button type="submit" class="btn btn-primary w-full" style="justify-content:center; font-size:1rem;">
              <i class="fas fa-paper-plane" aria-hidden="true"></i>
              Nachricht senden
            </button>
          </form>

          <div id="formSuccess" class="form-success">
            <div style="font-size:2.5rem;margin-bottom:12px;" aria-hidden="true">✅</div>
            <h4 style="color:#166534;margin-bottom:8px;">Vielen Dank!</h4>
            <p style="font-size:0.9rem;">Ihre Nachricht wurde erfolgreich übermittelt. Ich melde mich so bald wie möglich bei Ihnen!</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
`}))
})

// ─── Impressum & Datenschutz (simple) ─────────────────────────
app.get('/impressum', (c) => {
  return c.html(Layout({
    title: 'Impressum – Auxilium Forst',
    children: `
<section class="page-hero" aria-labelledby="impressum-heading">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Start</a><span class="sep" aria-hidden="true">›</span>
      <span class="current">Impressum</span>
    </nav>
    <h1 id="impressum-heading">Impressum</h1>
  </div>
</section>
<section class="section">
  <div class="container" style="max-width:800px;">
    <article style="background:white;border-radius:16px;padding:48px;box-shadow:0 8px 24px rgba(0,0,0,0.08);border:1px solid var(--border);">
      <h2 style="margin-bottom:24px;">Angaben gemäß § 5 TMG</h2>
      <p style="margin-bottom:8px;"><strong>Kristina Bronner</strong></p>
      <p style="margin-bottom:8px;">Auxilium – Pflegeberatung &amp; Pflegeleistungen</p>
      <p style="margin-bottom:8px;">Forst (Lausitz)</p>
      <p style="margin-bottom:24px;">Deutschland</p>
      <h3 style="margin-bottom:12px;">Kontakt</h3>
      <p style="margin-bottom:24px;">
        E-Mail: <a href="mailto:info@auxilium-forst.com" style="color:var(--primary);">info@auxilium-forst.com</a>
      </p>
      <p style="font-size:0.9rem;color:var(--text-light);">
        Für vollständige Impressumsangaben wenden Sie sich bitte direkt an Auxilium.
      </p>
    </article>
  </div>
</section>`}))
})

app.get('/datenschutz', (c) => {
  return c.html(Layout({
    title: 'Datenschutz – Auxilium Forst',
    children: `
<section class="page-hero" aria-labelledby="datenschutz-heading">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Start</a><span class="sep" aria-hidden="true">›</span>
      <span class="current">Datenschutz</span>
    </nav>
    <h1 id="datenschutz-heading">Datenschutzerklärung</h1>
  </div>
</section>
<section class="section">
  <div class="container" style="max-width:800px;">
    <article style="background:white;border-radius:16px;padding:48px;box-shadow:0 8px 24px rgba(0,0,0,0.08);border:1px solid var(--border);">
      <h2 style="margin-bottom:16px;">Datenschutz auf einen Blick</h2>
      <p style="margin-bottom:20px;">
        Die Betreiberin dieser Website nimmt den Schutz Ihrer persönlichen Daten ernst.
        Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der
        gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
      </p>
      <h3 style="margin-bottom:12px;">Kontaktformular</h3>
      <p style="margin-bottom:20px;">
        Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben
        aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten
        zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
        Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
      </p>
      <h3 style="margin-bottom:12px;">Verantwortliche Stelle</h3>
      <p>
        Kristina Bronner, Auxilium, Forst (Lausitz) –
        <a href="mailto:info@auxilium-forst.com" style="color:var(--primary);">info@auxilium-forst.com</a>
      </p>
    </article>
  </div>
</section>`}))
})

// ─── 404 ──────────────────────────────────────────────────────
app.notFound((c) => {
  return c.html(Layout({
    title: '404 – Seite nicht gefunden | Auxilium',
    children: `
<div style="min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px;">
  <div>
    <div style="font-size:5rem;margin-bottom:16px;" aria-hidden="true">🦋</div>
    <h1 style="font-size:3rem;margin-bottom:12px;">404</h1>
    <h2 style="font-size:1.4rem;margin-bottom:20px;color:var(--text-light);">Seite nicht gefunden</h2>
    <p style="color:var(--text-light);max-width:400px;margin:0 auto 32px;">
      Diese Seite existiert leider nicht. Vielleicht hilft Ihnen eine der folgenden Seiten weiter?
    </p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="/" class="btn btn-primary">
        <i class="fas fa-home" aria-hidden="true"></i> Zur Startseite
      </a>
      <a href="/kontakt" class="btn btn-outline">
        <i class="fas fa-phone" aria-hidden="true"></i> Kontakt
      </a>
    </div>
  </div>
</div>`}))
}, 404)

export default app
