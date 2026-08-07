import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

type Bindings = { DB: D1Database; MEDIA: KVNamespace }
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
  const email = S.contact_email    || 'info@auxilium-forst.de'
  const hours = S.contact_hours    || 'Mo&ndash;Fr &middot; 9:00 &ndash; 16:00 Uhr'
  // Info-Banner (Modal)
  const bannerActive = S.banner_active === '1'
  const bannerIntervalMinutes = S.banner_interval_minutes || '60'
  const bannerTitle = S.banner_title || ''
  const bannerIcon = S.banner_icon || ''
  const bannerText = S.banner_text || ''
  const bannerHasBg = S.banner_bg_image === '1' // KV-Flag: '1' = Bild vorhanden
  const bannerBgOpacity = S.banner_bg_opacity || '50'
  const bgOpacityDecimal = (parseInt(bannerBgOpacity, 10) / 100).toFixed(2)
  // Cache-Buster: jedes neue Upload setzt einen neuen Timestamp in banner_bg_ts
  const bannerBgTs = S.banner_bg_ts || '1'
  const bannerBgUrl = "/media/banner-bg?v=" + bannerBgTs
  const modalBgStyle = bannerHasBg
    ? "background-image:url('" + bannerBgUrl + "');background-size:cover;background-position:center;"
    : ''
  const innerBgStyle = bannerHasBg
    ? 'background:rgba(255,255,255,' + bgOpacityDecimal + ');'
    : 'background:white;'
  const infoBannerHtml = bannerActive ? `
<!-- Info-Banner Modal -->
<div id="infoBannerBackdrop" class="info-banner-backdrop" style="display:none;" onclick="closeInfoBanner()" role="dialog" aria-modal="true" aria-label="Info-Banner"></div>
<div id="infoBannerModal" class="info-banner-modal" style="display:none;${modalBgStyle}" role="alertdialog" aria-labelledby="infoBannerTitle" aria-describedby="infoBannerBody">
  <div class="info-banner-modal__inner" style="${innerBgStyle}">
    <button class="info-banner-modal__close" onclick="closeInfoBanner()" aria-label="Info-Banner schließen">&times;</button>
    ${(bannerIcon || bannerTitle) ? `<div class="info-banner-modal__header">
      ${bannerIcon ? `<span class="info-banner-modal__icon" aria-hidden="true"><i class="${bannerIcon}"></i></span>` : ''}
      ${bannerTitle ? `<h2 class="info-banner-modal__title" id="infoBannerTitle">${bannerTitle}</h2>` : '<h2 class="info-banner-modal__title" id="infoBannerTitle" style="display:none"></h2>'}
    </div>` : '<h2 id="infoBannerTitle" style="display:none"></h2>'}
    <div class="info-banner-modal__body" id="infoBannerBody">${bannerText}</div>
  </div>
</div>
<script>
(function(){
  var key='aux_infobanner_last_shown';
  var interval=${bannerIntervalMinutes};
  var last=localStorage.getItem(key);
  var show=true;
  if(last){var diff=(Date.now()-parseInt(last,10))/60000;if(diff<interval)show=false;}
  if(show){
    var backdrop=document.getElementById('infoBannerBackdrop');
    var modal=document.getElementById('infoBannerModal');
    if(backdrop&&modal){
      setTimeout(function(){
        backdrop.style.display='block';
        modal.style.display='flex';
        requestAnimationFrame(function(){
          backdrop.classList.add('visible');
          modal.classList.add('visible');
        });
        localStorage.setItem(key,String(Date.now()));
        // Fokus auf Modal setzen (kein sichtbarer Ring am Button)
        var closeBtn=modal.querySelector('.info-banner-modal__close');
        if(closeBtn){closeBtn.setAttribute('tabindex','0');modal.setAttribute('tabindex','-1');modal.focus();}
      },600);
    }
  }
  window.closeInfoBanner=function(){
    var backdrop=document.getElementById('infoBannerBackdrop');
    var modal=document.getElementById('infoBannerModal');
    if(backdrop)backdrop.classList.remove('visible');
    if(modal)modal.classList.remove('visible');
    setTimeout(function(){
      if(backdrop)backdrop.style.display='none';
      if(modal)modal.style.display='none';
    },350);
  };
  // ESC-Taste schließt Modal
  document.addEventListener('keydown',function(e){if(e.key==='Escape')window.closeInfoBanner();});
})();
</script>` : ''
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#ffffff">
<meta name="description" content="${description}">
<meta name="keywords" content="Pflegeberatung Forst Baden, Pflege Bruchsal, ambulante Pflege 76694, Verhinderungspflege, Pflegedienst Karlsruhe, Körperpflege, Betreuung zuhause, Kristina Bronner">
<meta name="author" content="Kristina Bronner – Auxilium Pflegeberatung">
<meta name="robots" content="index, follow">
<meta name="geo.region" content="DE-BW">
<meta name="geo.placename" content="Forst (Baden)">
<meta name="geo.position" content="49.1833;8.5833">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:image" content="/static/logo.png">
<meta property="og:locale" content="de_DE">
<meta property="og:site_name" content="Auxilium – Pflegeberatung Forst Baden">
<link rel="canonical" href="https://auxilium-forst.de${S._canonical||''}">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<link rel="stylesheet" href="/static/style.css">
<!-- Favicon: Auxilium Logo -->
<link rel="icon" type="image/png" href="/static/logo.png">
<link rel="apple-touch-icon" href="/static/logo.png">
${S.ga_id ? `<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${S.ga_id}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${S.ga_id}',{anonymize_ip:true});</script>` : ''}
<!-- Strukturierte Daten: LocalBusiness -->
<script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"Auxilium – Pflegeberatung Forst Baden","description":"Individuelle Pflege und Pflegeberatung in Forst Baden und Umgebung","url":"https://auxilium-forst.de","telephone":"","email":"info@auxilium-forst.de","address":{"@type":"PostalAddress","streetAddress":"","addressLocality":"Forst","postalCode":"76694","addressCountry":"DE"},"areaServed":[{"@type":"City","name":"Forst","postalCode":"76694"},{"@type":"City","name":"Bruchsal","postalCode":"76646"},{"@type":"City","name":"Karlsdorf-Neuthard","postalCode":"76689"}],"priceRange":"€€","openingHours":"Mo-Fr 09:00-16:00"}</script>
</head>
<body>
<a href="#main-content" class="skip-link">Zum Hauptinhalt springen</a>
${infoBannerHtml}<div id="siteHeader" class="site-header"><nav class="navbar" id="navbar" role="navigation" aria-label="Hauptnavigation">
  <div class="navbar__inner">
    <a href="/" class="navbar__logo" aria-label="Auxilium Startseite">
      <img src="/static/logo.png" alt="Auxilium Logo" class="navbar__logo-img">
      <div class="navbar__logo-text">
        <span class="navbar__logo-name">AUXILIUM</span>
        <span class="navbar__logo-sub">Pflegeberatung</span>
        <span class="navbar__logo-sub">Forst (Baden) &amp; Umgebung</span>
      </div>
    </a>
    <nav class="navbar__nav" aria-label="Seitennavigation" id="mainNav">
      <a href="/">Start</a>
      <a href="/ueber-auxilium">&Uuml;ber Auxilium</a>
      <a href="/leistungen">Leistungen &amp; Kosten</a>
      <a href="/beratung">Beratung</a>
      <a href="/ratgeber">Ratgeber</a>
      <a href="/stellenangebote">Stellenangebote</a>
      <a href="/kontakt" class="navbar__nav-cta-mobile"><i class="fas fa-calendar-check" aria-hidden="true"></i>Jetzt anfragen</a>
    </nav>
    <a href="/kontakt" class="btn btn-accent navbar__cta">
      <i class="fas fa-phone" aria-hidden="true"></i>
      Jetzt anfragen
    </a>
    <button class="navbar__toggle" id="navToggle" aria-label="Men&uuml; &ouml;ffnen" aria-expanded="false" aria-controls="mainNav">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav></div><!-- /.site-header -->
${body}
<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer__grid">
      <div>
        <div class="footer__logo">
          <img src="/static/logo.png" alt="Auxilium Pflegeberatung Logo – Kristina Bronner Forst Baden" class="footer__logo-img">
          <span class="footer__logo-name">AUXILIUM</span>
        </div>
        <p class="footer__desc">Individuelle Pflege, Betreuung &amp; Pflegeberatung in Forst (Baden) und Umgebung &ndash; Kristina Bronner begleitet pflegebed&uuml;rftige Menschen und ihre Angeh&ouml;rigen mit Fachkenntnis, Herz und Leidenschaft.</p>
        <a href="mailto:${email}" style="display:inline-flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--primary);">
          <i class="fas fa-envelope" aria-hidden="true"></i> ${email}
        </a>
      </div>
      <div>
        <p class="footer__heading">Navigation</p>
        <ul class="footer__links">
          <li><a href="/">Start</a></li>
          <li><a href="/ueber-auxilium">&Uuml;ber Auxilium</a></li>
          <li><a href="/leistungen">Leistungen &amp; Kosten</a></li>
          <li><a href="/beratung">Pflegeberatung</a></li>
          <li><a href="/ratgeber">Ratgeber &amp; Tipps</a></li>
          <li><a href="/stellenangebote">Stellenangebote</a></li>
          <li><a href="/kontakt">Kontakt</a></li>
        </ul>
      </div>
      <div>
        <p class="footer__heading">Wo ist Auxilium &uuml;berall t&auml;tig?</p>
        <ul class="footer__links" style="column-count:2;column-gap:12px;">
          <li><a href="/pflege/forst-76694" title="Pflegeberatung 76694 Forst">76694 Forst</a></li>
          <li><a href="/pflege/bruchsal-76646" title="Pflegeberatung 76646 Bruchsal">76646 Bruchsal</a></li>
          <li><a href="/pflege/hambruecken-76707" title="Pflege 76707 Hambr&uuml;cken">76707 Hambr&uuml;cken</a></li>
          <li><a href="/pflege/karlsdorf-neuthard-76689" title="Pflege 76689 Karlsdorf-Neuthard">76689 Karlsdorf</a></li>
          <li><a href="/pflege/oestringen-76684" title="Pflege 76684 &Ouml;stringen">76684 &Ouml;stringen</a></li>
          <li><a href="/pflege/ubstadt-weiher-76698" title="Pflege 76698 Ubstadt-Weiher">76698 Ubstadt-Weiher</a></li>
          <li><a href="/pflege/bad-schoenborn-76669" title="Pflege 76669 Bad Sch&ouml;nborn">76669 Bad Sch&ouml;nborn</a></li>
          <li><a href="/pflege/kraichtal-76703" title="Pflege 76703 Kraichtal">76703 Kraichtal</a></li>
          <li><a href="/pflege/kronau-76709" title="Pflege 76709 Kronau">76709 Kronau</a></li>
          <li><a href="/pflege/waghausel-68753" title="Pflege 68753 Waghäusel">68753 Waghäusel</a></li>
          <li><a href="/pflege/philippsburg-76661" title="Pflege 76661 Philippsburg">76661 Philippsburg</a></li>
          <li><a href="/pflege/graben-neudorf-76676" title="Pflege 76676 Graben-Neudorf">76676 Graben-Neudorf</a></li>
        </ul>
      </div>
      <div>
        <p class="footer__heading">Kontakt</p>
        <ul class="footer__links" style="display:flex;flex-direction:column;gap:10px;">
          <li style="color:rgba(255,255,255,0.62);font-size:0.875rem;"><i class="fas fa-map-marker-alt" style="color:var(--primary);margin-right:7px;width:14px;" aria-hidden="true"></i>${loc}</li>
          <li style="font-size:0.875rem;"><i class="fas fa-envelope" style="color:var(--primary);margin-right:7px;width:14px;" aria-hidden="true"></i><a href="mailto:${email}" style="color:rgba(255,255,255,0.62);">${email}</a></li>
          <li style="color:rgba(255,255,255,0.62);font-size:0.875rem;"><i class="fas fa-clock" style="color:var(--primary);margin-right:7px;width:14px;" aria-hidden="true"></i>${hours}</li>
        </ul>
        <p style="font-size:0.72rem;color:rgba(255,255,255,0.30);margin-top:18px;line-height:1.6;">
          Pflege &middot; Pflegeberatung &middot; Verhinderungspflege &middot; Betreuung &middot; Hauswirtschaft &middot; K&ouml;rperpflege &middot; 76694 Forst &middot; 76646 Bruchsal &middot; Landkreis Karlsruhe
        </p>
      </div>
    </div>
    <div class="footer__bottom">
      <p>&copy; <span id="footer-year">${year}</span> Auxilium &ndash; Kristina Bronner &middot; Forst (Baden) &middot; Alle Rechte vorbehalten</p>
      <div class="footer__bottom-links">
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutz</a>
        <a href="/barrierefreiheit">Barrierefreiheit</a>
        <button id="cookieSettingsBtn" onclick="openCookieSettings()" style="background:none;border:none;color:rgba(255,255,255,0.55);font-size:inherit;cursor:pointer;padding:0;font-family:inherit;">Cookie-Einstellungen</button>
      </div>
    </div>
  </div>
</footer>

<!-- Cookie-Banner -->
<div id="cookieBanner" class="cookie-banner" role="dialog" aria-modal="true" aria-labelledby="cookieBannerTitle" aria-describedby="cookieBannerDesc" style="display:none;">
  <div class="cookie-banner__box">
    <h2 class="cookie-banner__title" id="cookieBannerTitle"><i class="fas fa-cookie-bite" aria-hidden="true"></i> Cookie-Einstellungen</h2>
    <p class="cookie-banner__desc" id="cookieBannerDesc">
      Diese Website verwendet Cookies, um grundlegende Funktionen bereitzustellen. Wir setzen <strong>keine</strong> Tracking- oder Marketing-Cookies ohne Ihre Zustimmung ein. Nur technisch notwendige Cookies sind standardmäßig aktiv.
    </p>
    <div class="cookie-banner__options">
      <label class="cookie-option">
        <input type="checkbox" checked disabled aria-label="Technisch notwendige Cookies (immer aktiv)">
        <div>
          <strong>Technisch notwendige Cookies</strong>
          <span>Session-Verwaltung, Sicherheit. Immer aktiv.</span>
        </div>
      </label>
      <label class="cookie-option" id="cookieAnalyticsLabel">
        <input type="checkbox" id="cookieAnalytics" aria-label="Analyse-Cookies (Google Analytics)">
        <div>
          <strong>Analyse (Google Analytics)</strong>
          <span>Anonymisierte Nutzungsstatistiken. Nur wenn aktiv.</span>
        </div>
      </label>
    </div>
    <div class="cookie-banner__actions">
      <button class="cookie-btn cookie-btn-all" onclick="acceptAllCookies()">Alle akzeptieren</button>
      <button class="cookie-btn cookie-btn-save" onclick="saveCookieSettings()">Auswahl speichern</button>
      <button class="cookie-btn cookie-btn-necessary" onclick="acceptNecessaryCookies()">Nur notwendige</button>
    </div>
    <p style="font-size:0.73rem;color:#7A6550;margin-top:12px;"><a href="/datenschutz" style="color:var(--primary);">Datenschutzerklärung</a> &middot; <a href="/impressum" style="color:var(--primary);">Impressum</a></p>
  </div>
</div>
<div id="cookieBannerBackdrop" class="cookie-banner-backdrop" style="display:none;" onclick="saveCookieSettings()"></div>

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
      <span class="current" aria-current="page">${breadcrumb}</span>
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
        <button class="accordion-toggle" aria-expanded="false" aria-controls="faq-body-${f.id}">${f.question}<span class="chevron" aria-hidden="true"><i class="fas fa-chevron-down"></i></span></button>
        <div class="accordion-body" id="faq-body-${f.id}"><div class="accordion-body__inner">${f.answer}</div></div>
      </div>`).join('\n')

  const homeKatCards = dbKategorien.map((k: any) => `
      <a href="/leistungen#${k.slug}" class="home-kat-card" aria-label="${k.name}">
        <div class="home-kat-card__icon"><i class="fas ${k.icon}" aria-hidden="true"></i></div>
        <div class="home-kat-card__name">${k.name}</div>
        ${k.description ? `<p class="home-kat-card__desc">${k.description}</p>` : ''}
        <span class="home-kat-card__arrow"><i class="fas fa-arrow-right"></i> Mehr erfahren</span>
      </a>`).join('\n')

  const body = `
<main id="main-content" tabindex="-1">
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
      <h1 id="hero-heading" class="hero__title">Ihre pers&ouml;nliche<br><span class="highlight">St&uuml;tze</span> &ndash;<br><span class="highlight-amber">wenn Sie sie brauchen</span></h1>
      <p class="hero__text">Mit Auxilium biete ich Ihnen individuelle Betreuung, Beratung sowie Pflege im Raum Forst (Baden) und Umgebung an. Mit langjähriger Erfahrung in der Pflege begleite ich pflegebedürftige Menschen und ihre Angehörigen – persönlich, kompetent und mit Herz. Dabei steht für mich im Fokus, dass jeder Mensch individuelle Aufmerksamkeit verdient.</p>
      <div class="hero__actions">
        <a href="/kontakt" class="btn btn-accent"><i class="fas fa-envelope" aria-hidden="true"></i>Kontakt aufnehmen</a>
        <a href="/leistungen" class="btn btn-outline"><i class="fas fa-list" aria-hidden="true"></i>Alle Leistungen</a>
      </div>
    </div>
    <div class="hero__visual animate-fade-in-delay-1">
      <img src="/static/logo-hero.png" alt="Auxilium &ndash; Schmetterling &amp; Hand Logo" class="hero__logo-free">
    </div>
  </div>
</section>

<div class="feature-strip" role="complementary" aria-label="Kernvorteile von Auxilium">
  <div class="container">
    <ul class="feature-strip__inner" style="list-style:none;padding:0;margin:0;">
      <li class="feature-strip__item"><i class="fas fa-tag" aria-hidden="true"></i>G&uuml;nstigere Preise als ambulante Dienste</li>
      <li class="feature-strip__item"><i class="fas fa-user" aria-hidden="true"></i>Pers&ouml;nlicher Ansprechpartner</li>
      <li class="feature-strip__item"><i class="fas fa-home" aria-hidden="true"></i>Pflege in Ihrem Zuhause</li>
      <li class="feature-strip__item"><i class="fas fa-file-invoice" aria-hidden="true"></i>Abrechnung &uuml;ber die Pflegekasse</li>
    </ul>
  </div>
</div>

<section class="section" aria-labelledby="why-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Wieso Auxilium?</span>
      <h2 id="why-heading">Pflege, die wirklich ankommt</h2>
      <p style="max-width:580px;margin:14px auto 0;">Die Entscheidung f&uuml;r einen Pflegedienst ist nicht leicht. Auxilium bietet Ihnen eine bewusste Alternative &ndash; professionell, menschlich und bezahlbar.</p>
    </div>
    <div class="grid-3">
      <article class="card"><div class="card__icon"><i class="fas fa-user-circle" aria-hidden="true"></i></div><h3 class="card__title">Eine feste Bezugsperson</h3><p class="card__text">Bei Auxilium haben Sie dauerhaft EINE feste Bezugsperson &ndash; f&uuml;r Kontinuit&auml;t und echtes Vertrauen in der Pflege.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-coins" aria-hidden="true"></i></div><h3 class="card__title">G&uuml;nstigere Preise</h3><p class="card__text">Auxilium arbeitet im kleinen Team &ndash; deshalb sind die Preise g&uuml;nstiger als klassische ambulante Dienste. Keine zus&auml;tzlichen Ausbildungs- und Investitionskosten je Einsatz.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-layer-group" aria-hidden="true"></i></div><h3 class="card__title">Flexibel kombinierbar</h3><p class="card__text">Auxilium kombiniert bei Bedarf unterschiedliche Arbeitsbereiche flexibel: pflegerisch, betreuerisch und hauswirtschaftlich &ndash; alles in EINEM Einsatz, stressfrei und individuell.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-home" aria-hidden="true"></i></div><h3 class="card__title">Zuhause bleiben</h3><p class="card__text">&Uuml;ber 80 % der Pflegebed&uuml;rftigen wollen zu Hause versorgt werden. Auxilium macht das m&ouml;glich &ndash; mit echtem Heimgef&uuml;hl.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-users" aria-hidden="true"></i></div><h3 class="card__title">Entlastung der Familie</h3><p class="card__text">Auch pflegende Angeh&ouml;rige sind Kunden bei Auxilium. Ich schaffe Freir&auml;ume und st&auml;rke dem gesamten Umfeld den R&uuml;cken.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-ban" aria-hidden="true"></i></div><h3 class="card__title">Keine Medizin</h3><p class="card__text">Auxilium &uuml;bernimmt KEINE medizinische Versorgung wie Verbandswechsel oder Spritzen &ndash; daf&uuml;r alles rund um Pflege, Betreuung und Hauswirtschaft.</p></article>
    </div>
  </div>
</section>

<div class="stats-banner" role="region" aria-label="Pflegestatistiken Deutschland">
  <div class="container">
    <dl class="stats-banner__grid">
      <div class="text-center">
        <dt class="stats-banner__label">Pflegebed&uuml;rftige in Deutschland</dt>
        <dd><span class="stats-banner__number" data-count="5.7" data-prefix="ca. " data-suffix=" Mio." aria-label="ca. 5,7 Millionen">ca. 5,7 Mio.</span></dd>
        <span class="stats-banner__source"><a href="https://www.destatis.de/DE/Presse/Pressemitteilungen/2024/12/PD24_478_224.html" target="_blank" rel="noopener noreferrer">Quelle: Destatis 2024 <span class="sr-only">(öffnet in neuem Tab)</span></a></span>
      </div>
      <div class="text-center">
        <dt class="stats-banner__label">werden zu Hause versorgt</dt>
        <dd><span class="stats-banner__number" data-count="86" data-suffix=" %" aria-label="86 Prozent">86 %</span></dd>
        <span class="stats-banner__source"><a href="https://www.tagesschau.de/inland/gesellschaft/pflegebeduerftige-deutschland-statistik-100.html" target="_blank" rel="noopener noreferrer">Quelle: Tagesschau <span class="sr-only">(öffnet in neuem Tab)</span></a></span>
      </div>
      <div class="text-center">
        <dt class="stats-banner__label">ausschlie&szlig;lich durch Angeh&ouml;rige betreut</dt>
        <dd><span class="stats-banner__number" data-count="3.1" data-suffix=" Mio." aria-label="3,1 Millionen">3,1 Mio.</span></dd>
        <span class="stats-banner__source"><a href="https://www.zqp.de/schwerpunkt/pflegende-angehoerige/" target="_blank" rel="noopener noreferrer">Quelle: ZQP <span class="sr-only">(öffnet in neuem Tab)</span></a></span>
      </div>
    </dl>
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

${(S.show_testimonials !== '0') && dbTestimonials.length > 0 ? `
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
      <p style="max-width:520px;margin:14px auto 0;">Hier finden Sie die h&auml;ufigsten Fragen rund um Auxilium &ndash;<br>schnell und &uuml;bersichtlich.</p>
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
</section>
</main>`
  return c.html(layout('Auxilium &ndash; Ihre St&uuml;tze in der Pflege | Forst Baden', 'Auxilium bietet individuelle Pflegeberatung und ambulante Pflegeleistungen in Forst Baden.', body, S))
})

// ─── ÜBER AUXILIUM ────────────────────────────────────────────
app.get('/ueber-auxilium', async (c) => {
  const S = await loadSettings(c.env.DB)
  const hero = pageHero('&Uuml;ber uns', 'Herzlich willkommen &ndash;<br>ich bin Kristina Bronner', 'Gr&uuml;nderin von Auxilium &ndash; Ihrer pers&ouml;nlichen St&uuml;tze in der Pflege.', '&Uuml;ber Auxilium')
  const body = hero + `

<!-- ═══ ZUR PERSON ═══════════════════════════════════════════ -->
<section class="section" aria-labelledby="person-heading">
  <div class="container">
    <div class="person-layout">
      <div class="person-photo-col">
        <div class="person-photo-wrap">
          <img src="/static/kristina.jpg" alt="Kristina Bronner &ndash; Gr&uuml;nderin Auxilium" class="person-photo">
        </div>
        <div class="person-photo-badge person-photo-badge--below">
          <i class="fas fa-award" aria-hidden="true"></i>
          <div>
            <strong>Kristina Bronner</strong>
            <span>Gr&uuml;nderin &amp; Inhaberin</span>
          </div>
        </div>
      </div>
      <div class="person-text-col">
        <span class="section-label">Zur Person</span>
        <h2 id="person-heading">Mein Weg zu Auxilium</h2>
        <p style="margin:18px 0 16px;font-size:1.05rem;line-height:1.8;">Ich war bereits bei einigen Arbeitgebern angestellt und bin letztendlich f&uuml;r mich zu dem Entschluss gekommen, dass ich vermutlich keinen Arbeitgeber finden werde, der qualitative Pflege und die Betreuung von pflegebed&uuml;rftigen Menschen mit meinen Augen sieht.</p>
        <p style="margin-bottom:16px;line-height:1.8;">Meine Energie zielt nun auf mein eigenes Herzensprojekt: <strong style="color:var(--accent);">Auxilium &ndash; Ihre &bdquo;St&uuml;tze&ldquo; rund um das Thema Pflege.</strong></p>
        <p style="margin-bottom:28px;line-height:1.8;">Wesentlich ist f&uuml;r mich eine <strong>ganzheitliche Versorgung</strong> des Kunden &ndash; zum einen in Bezug auf seine k&ouml;rperlichen Beschwerden, zum anderen auch auf seine psychische Situation und seine emotionale Gem&uuml;tslage.</p>
        <blockquote class="person-quote">
          <i class="fas fa-quote-left" aria-hidden="true"></i>
          <p>Akzeptiere, was ist, lass gehen, was war, und habe Vertrauen in das, was kommt.</p>
          <cite>&ndash; Ma Vie, Leitspruch von Auxilium</cite>
        </blockquote>
      </div>
    </div>
  </div>
</section>

<!-- ═══ LEITBILD ══════════════════════════════════════════════ -->
<section class="section section--soft" aria-labelledby="mission-heading">
  <div class="container">
    <div class="text-center mb-12">
      <span class="section-label">Leitbild</span>
      <h2 id="mission-heading">Wof&uuml;r Auxilium steht</h2>
      <p style="max-width:540px;margin:14px auto 0;">Gute Pflege bedeutet f&uuml;r Auxilium: Menschlichkeit, Respekt und echte Pr&auml;senz.</p>
    </div>

    <!-- Symbol-Box: Logo + Schmetterling-Erkl&auml;rung -->
    <div class="person-symbol-box" style="margin-bottom:48px;">
      <img src="/static/logo.png" alt="Auxilium Logo &ndash; Schmetterling mit fehlendem Fl&uuml;gel" class="person-symbol-img">
      <div class="person-symbol-text">
        <p class="person-logo-title">Wof&uuml;r steht das Symbol von Auxilium?</p>
        <p class="person-logo-text">Man erkennt einen Schmetterling mit einem fehlenden Teil-Fl&uuml;gel. Dies steht f&uuml;r einen Mangel, etwas &bdquo;das fehlt&ldquo; und Hilfe bedarf. Hier wird der Fl&uuml;gel durch die helfende Hand von Auxilium gest&uuml;tzt, um wieder Halt zu erlangen.</p>
      </div>
    </div>

    <!-- 6 Werte-Karten -->
    <div class="grid-3">
      <article class="card">
        <div class="card__icon"><i class="fas fa-heart" aria-hidden="true"></i></div>
        <h3 class="card__title">Leidenschaft f&uuml;r Menschen</h3>
        <p class="card__text">Jeder Mensch ist einzigartig &ndash; diese &Uuml;berzeugung tr&auml;gt meine Arbeit t&auml;glich.</p>
      </article>
      <article class="card">
        <div class="card__icon"><i class="fas fa-graduation-cap" aria-hidden="true"></i></div>
        <h3 class="card__title">Fachkenntnis &amp; Qualit&auml;t</h3>
        <p class="card__text">Professionelle Pflege auf h&ouml;chstem Niveau, verbunden mit menschlicher W&auml;rme.</p>
      </article>
      <article class="card">
        <div class="card__icon"><i class="fas fa-handshake" aria-hidden="true"></i></div>
        <h3 class="card__title">Verl&auml;sslichkeit</h3>
        <p class="card__text">Sie k&ouml;nnen sich auf mich verlassen &ndash; p&uuml;nktlich, konstant und transparent.</p>
      </article>
      <article class="card">
        <div class="card__icon"><i class="fas fa-infinity" aria-hidden="true"></i></div>
        <h3 class="card__title">Ganzheitlichkeit</h3>
        <p class="card__text">Pflege bedeutet mehr als k&ouml;rperliche Versorgung. Auxilium denkt den ganzen Menschen &ndash; soziale Bed&uuml;rfnisse, Wohlbefinden und das der Familie.</p>
      </article>
      <article class="card">
        <div class="card__icon"><i class="fas fa-door-open" aria-hidden="true"></i></div>
        <h3 class="card__title">Freiräume schaffen</h3>
        <p class="card__text">Pflegende Angeh&ouml;rige brauchen Auszeiten. Ich schaffe die Freiräume, die Sie ben&ouml;tigen &ndash; damit Sie wieder auftanken k&ouml;nnen.</p>
      </article>
      <article class="card">
        <div class="card__icon"><i class="fas fa-shield-alt" aria-hidden="true"></i></div>
        <h3 class="card__title">Qualit&auml;t als Standard</h3>
        <p class="card__text">Qualitativ hochwertige Pflege ist kein Luxus, sondern ein Recht. Auxilium liefert diesen Standard &ndash; zu fairen, transparenten Preisen.</p>
      </article>
    </div>
  </div>
</section>

<!-- ═══ MEIN ANSATZ ═══════════════════════════════════════════ -->
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
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-clock" aria-hidden="true"></i></div><div><div class="info-label">Erreichbarkeit</div><div class="info-value">Montag&ndash;Freitag, 9:00&ndash;16:00 Uhr</div></div></div>
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-comments" aria-hidden="true"></i></div><div><div class="info-label">Erstgespr&auml;ch</div><div class="info-value">Pers&ouml;nliche Erstberatung</div></div></div>
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
        <h2 id="intro-heading">Wir finden eine L&ouml;sung, die zu ihrer individuellen Situation passt.</h2>
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
      <h2 id="who-heading">Auxilium ist f&uuml;r Sie, wenn Sie&nbsp;&hellip;</h2>
    </div>
    <div class="grid-4">
      <article class="card" style="text-align:center;"><div class="card__icon" style="margin:0 auto 18px;"><i class="fas fa-wallet" aria-hidden="true"></i></div><h3 class="card__title">Pflegegeld beziehen</h3><p class="card__text">Pflegegeldempf&auml;nger k&ouml;nnen Auxilium-Leistungen flexibel und unkompliziert &uuml;ber die Pflegekasse abrechnen.</p></article>
      <article class="card" style="text-align:center;"><div class="card__icon" style="margin:0 auto 18px;"><i class="fas fa-sync-alt" aria-hidden="true"></i></div><h3 class="card__title">Verhinderungspflege nutzen</h3><p class="card__text">Bis zu 3.539 &euro; Verhinderungspflege stehen Ihnen als Pflegegeld-Empf&auml;nger j&auml;hrlich zur Verf&uuml;gung &ndash; direkt f&uuml;r Auxilium-Leistungen einsetzbar.</p></article>
      <article class="card" style="text-align:center;"><div class="card__icon" style="margin:0 auto 18px;"><i class="fas fa-hand-holding-usd" aria-hidden="true"></i></div><h3 class="card__title">den Entlastungsbetrag nutzen</h3><p class="card__text">131 &euro; monatlich f&uuml;r anerkannte Entlastungsleistungen &ndash; Auxilium ist als anerkannter Entlastungsdienst abrechnungsf&auml;hig.</p></article>
      <article class="card" style="text-align:center;"><div class="card__icon" style="margin:0 auto 18px;"><i class="fas fa-credit-card" aria-hidden="true"></i></div><h3 class="card__title">Privatzahler/-in sind</h3><p class="card__text">Auch ohne Pflegekassen-Leistungen sind alle Auxilium-Angebote als Privatleistung buchbar.</p></article>
    </div>
    <div class="text-center mt-8">
      <a href="/kontakt" class="btn btn-accent"><i class="fas fa-calendar-check" aria-hidden="true"></i>Pers&ouml;nliches Erstgespr&auml;ch vereinbaren</a>
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
        <div class="contact-info-item"><div class="info-icon"><i class="fas fa-phone" aria-hidden="true"></i></div><div><div class="info-label">Erstkontakt</div><div class="info-value">Pers&ouml;nliche Erstberatung</div></div></div>
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
      <article class="card"><div class="card__icon"><i class="fas fa-sync-alt" aria-hidden="true"></i></div><h3 class="card__title">Entlastungsbetrag</h3><p class="card__text">131 &euro; monatlich (1.572 &euro; j&auml;hrlich) f&uuml;r anerkannte Entlastungsleistungen ab Pflegegrad 1.</p></article>
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
    <h2 id="advice-cta-heading" class="cta-section-green__title">Lassen Sie sich pers&ouml;nlich beraten</h2>
    <p class="cta-section-green__text">In einem pers&ouml;nlichen Gespr&auml;ch analysiere ich mit Ihnen alle Anspr&uuml;che und erstelle die beste Finanzierungsstrategie f&uuml;r Ihre Situation.</p>
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
  const hero = pageHero('Kontakt', 'Wie kann ich Ihnen helfen?', 'Ich freue mich auf Ihre Nachricht &ndash; pers&ouml;nliche Erstberatung f&uuml;r Ihre Pflegesituation.', 'Kontakt')
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
          <div class="contact-info-item"><div class="info-icon"><i class="fas fa-envelope" aria-hidden="true"></i></div><div><div class="info-label">E-Mail</div><div class="info-value"><a href="mailto:${S.contact_email||'info@auxilium-forst.de'}" style="color:var(--accent);">${S.contact_email||'info@auxilium-forst.de'}</a></div></div></div>
          <div class="contact-info-item"><div class="info-icon"><i class="fas fa-clock" aria-hidden="true"></i></div><div><div class="info-label">Erreichbarkeit</div><div class="info-value">${S.contact_hours||'Mo&ndash;Fr, 9:00 &ndash; 16:00 Uhr'}</div></div></div>
          <div class="contact-info-item"><div class="info-icon"><i class="fas fa-comments" aria-hidden="true"></i></div><div><div class="info-label">Erstgespr&auml;ch</div><div class="info-value">Pers&ouml;nliche Erstberatung</div></div></div>
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
            <div id="formError" class="form-feedback form-feedback--error" style="display:none;" role="alert" aria-live="assertive">
              <i class="fas fa-exclamation-circle form-feedback__icon" aria-hidden="true"></i>
              <p id="formErrorMsg" class="form-feedback__text">Ein Fehler ist aufgetreten.</p>
            </div>
            <button type="submit" class="btn btn-accent w-full" style="justify-content:center;font-size:0.95rem;">
              <i class="fas fa-paper-plane" aria-hidden="true"></i>Nachricht senden
            </button>
          </form>
          <div id="formSuccess" class="form-feedback form-feedback--success" style="display:none;" role="status">
            <div class="form-feedback__check" aria-hidden="true"><i class="fas fa-check"></i></div>
            <div>
              <h4 class="form-feedback__title">Vielen Dank!</h4>
              <p class="form-feedback__text">Ihre Nachricht wurde &uuml;bermittelt. Ich melde mich so bald wie m&ouml;glich!</p>
            </div>
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

  // Pflichtfelder prüfen (granulare Fehlermeldungen)
  if (!firstName) return c.json({ ok: false, error: 'Ihre Nachricht konnte nicht abgesendet werden, da kein Vorname eingegeben wurde.' }, 400)
  if (!lastName)  return c.json({ ok: false, error: 'Ihre Nachricht konnte nicht abgesendet werden, da kein Nachname eingegeben wurde.' }, 400)
  if (!email)     return c.json({ ok: false, error: 'Ihre Nachricht konnte nicht abgesendet werden, da keine E-Mail-Adresse eingegeben wurde.' }, 400)
  if (!message)   return c.json({ ok: false, error: 'Ihre Nachricht konnte nicht abgesendet werden, da keine Nachricht eingegeben wurde.' }, 400)
  if (privacy !== 'true') return c.json({ ok: false, error: 'Ihre Nachricht konnte nicht abgesendet werden, da Sie unsere Datenschutzbestimmungen nicht akzeptiert haben.' }, 400)

  // E-Mail-Format prüfen
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ ok: false, error: 'Ihre Nachricht konnte nicht abgesendet werden, da die E-Mail-Adresse ungültig ist.' }, 400)
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
  const recipientEmail = (S.form_recipient_email || 'info@auxilium-forst.de').trim()
  const recipientName  = (S.form_recipient_name  || 'Auxilium – Kristina Bronner').trim()
  const subjectLine    = subject
    ? `Kontaktanfrage: ${subject}`
    : 'Neue Kontaktanfrage über auxilium-forst.de'

  const emailText = [
    `Neue Kontaktanfrage von auxilium-forst.de`,
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

  // ── Schritt 1: Anfrage in D1 speichern (primärer Fallback) ──
  let dbSaved = false
  try {
    await c.env.DB.prepare(`
      INSERT INTO contact_submissions
        (first_name, last_name, city, phone, email, subject, message, privacy, mail_sent)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)
    `).bind(
      firstName, lastName,
      city    || null,
      phone   || null,
      email,
      subject || null,
      message
    ).run()
    dbSaved = true
  } catch (dbErr) {
    console.error('D1-Speicher Fehler:', dbErr)
  }

  // ── Schritt 2: Versand via MailChannels (Best-Effort) ────────
  let mailSent = false
  try {
    const mailRes = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: recipientEmail, name: recipientName }]
        }],
        from: {
          email: 'noreply@auxilium-forst.de',
          name: `${firstName} ${lastName} (via Kontaktformular)`
        },
        reply_to: { email, name: `${firstName} ${lastName}` },
        subject: subjectLine,
        content: [{ type: 'text/plain', value: emailText }]
      })
    })
    if (mailRes.status === 202 || mailRes.status === 200) {
      mailSent = true
      // Erfolg in D1 markieren
      if (dbSaved) {
        try {
          await c.env.DB.prepare(
            `UPDATE contact_submissions SET mail_sent=1
             WHERE email=? AND id=(SELECT MAX(id) FROM contact_submissions WHERE email=?)`
          ).bind(email, email).run()
        } catch { /* nicht kritisch */ }
      }
    } else {
      const errText = await mailRes.text().catch(() => '')
      console.error('MailChannels Fehler:', mailRes.status, errText)
    }
  } catch (err) {
    console.error('Fetch-Fehler beim E-Mail-Versand:', err)
  }

  // ── Ergebnis: Erfolg wenn D1 gespeichert ODER Mail versendet ─
  if (dbSaved || mailSent) {
    return c.json({ ok: true })
  }

  return c.json({
    ok: false,
    error: 'Ihre Anfrage konnte leider nicht übermittelt werden. Bitte versuchen Sie es später erneut oder rufen Sie uns direkt an.'
  }, 500)
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

// ═══════════════════════════════════════════════════════════════
// ORTSCHAFTEN-LANDINGPAGES (SEO)
// ═══════════════════════════════════════════════════════════════

const ORTE: Record<string, {name:string, plz:string, landkreis:string, text:string}> = {
  'forst-76694':          { name:'Forst (Baden)', plz:'76694', landkreis:'Landkreis Karlsruhe', text:'Als Heimatbasis von Auxilium ist Forst (Baden) der Mittelpunkt unserer T&auml;tigkeit. Kurze Wege, pers&ouml;nliche Betreuung &ndash; hier bin ich f&uuml;r Sie da.' },
  'bruchsal-76646':       { name:'Bruchsal', plz:'76646', landkreis:'Landkreis Karlsruhe', text:'Bruchsal ist eine der st&auml;rksten Regionen im Landkreis Karlsruhe. Auxilium ist regelm&auml;&szlig;ig in Bruchsal und Umgebung unterwegs &ndash; mit flexiblen Terminen f&uuml;r Sie.' },
  'hambruecken-76707':    { name:'Hambr&uuml;cken', plz:'76707', landkreis:'Landkreis Karlsruhe', text:'F&uuml;r Pflegebed&uuml;rftige in Hambr&uuml;cken bietet Auxilium pers&ouml;nliche Unterst&uuml;tzung direkt im Zuhause &ndash; professionell und menschlich.' },
  'karlsdorf-neuthard-76689': { name:'Karlsdorf-Neuthard', plz:'76689', landkreis:'Landkreis Karlsruhe', text:'Auxilium betreut pflegebed&uuml;rftige Menschen in Karlsdorf-Neuthard &ndash; mit Fachwissen und pers&ouml;nlichem Engagement.' },
  'oestringen-76684':     { name:'&Ouml;stringen', plz:'76684', landkreis:'Landkreis Karlsruhe', text:'Auch in &Ouml;stringen und Umgebung ist Auxilium f&uuml;r Sie da &ndash; f&uuml;r Pflege, Beratung und Betreuung in Ihrer vertrauten Umgebung.' },
  'ubstadt-weiher-76698': { name:'Ubstadt-Weiher', plz:'76698', landkreis:'Landkreis Karlsruhe', text:'In Ubstadt-Weiher unterst&uuml;tzt Auxilium pflegebed&uuml;rftige Menschen und ihre Angeh&ouml;rigen &ndash; flexibel, kompetent und herzlich.' },
  'bad-schoenborn-76669': { name:'Bad Sch&ouml;nborn', plz:'76669', landkreis:'Landkreis Karlsruhe', text:'F&uuml;r Familien und Pflegebed&uuml;rftige in Bad Sch&ouml;nborn ist Auxilium ein verl&auml;sslicher Partner f&uuml;r alle Pflege- und Beratungsleistungen.' },
  'kraichtal-76703':      { name:'Kraichtal', plz:'76703', landkreis:'Landkreis Karlsruhe', text:'Auxilium erreicht auch Kraichtal und die umliegenden Ortschaften &ndash; f&uuml;r individuelle Pflege ohne lange Anfahrtswege.' },
  'kronau-76709':         { name:'Kronau', plz:'76709', landkreis:'Landkreis Karlsruhe', text:'In Kronau bietet Auxilium pers&ouml;nliche Pflegeleistungen an &ndash; genau auf Ihre Bed&uuml;rfnisse zugeschnitten.' },
  'waghausel-68753':      { name:'Waghäusel', plz:'68753', landkreis:'Landkreis Karlsruhe', text:'Auch Waghäusel geh&ouml;rt zu unserem Einzugsgebiet. Auxilium ist f&uuml;r Sie vor Ort.' },
  'philippsburg-76661':   { name:'Philippsburg', plz:'76661', landkreis:'Landkreis Karlsruhe', text:'Auxilium unterst&uuml;tzt pflegebed&uuml;rftige Menschen in Philippsburg &ndash; mit professioneller Pflege und persönlichem Service.' },
  'graben-neudorf-76676': { name:'Graben-Neudorf', plz:'76676', landkreis:'Landkreis Karlsruhe', text:'F&uuml;r Pflegebed&uuml;rftige in Graben-Neudorf bietet Auxilium alle Leistungen rund um Pflege, Beratung und Alltagsunterst&uuml;tzung.' },
}

app.get('/pflege/:slug', async (c) => {
  const slug = c.req.param('slug')
  const ort = ORTE[slug]
  if (!ort) return c.redirect('/')
  const S = await loadSettings(c.env.DB)
  const { results: kats } = await c.env.DB.prepare('SELECT * FROM kategorien WHERE active=1 ORDER BY sort_order LIMIT 6').all<any>()
  const katLinks = kats.map((k: any) => `<a href="/leistungen#${k.slug}" class="home-kat-card" style="text-decoration:none;">
    <div class="home-kat-card__icon"><i class="fas ${k.icon}"></i></div>
    <div class="home-kat-card__name">${k.name}</div>
    <span class="home-kat-card__arrow"><i class="fas fa-arrow-right"></i> Details</span>
  </a>`).join('')

  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Auxilium – Pflegeberatung ${ort.name}`,
    "description": `Individuelle Pflege und Pflegeberatung in ${ort.name} (${ort.plz}) – Kristina Bronner, Auxilium`,
    "url": `https://auxilium-forst.de/pflege/${slug}`,
    "areaServed": { "@type": "City", "name": ort.name, "postalCode": ort.plz }
  })

  const body = pageHero(
    `Pflege in ${ort.plz}`,
    `Pflegeberatung &amp; Pflege in ${ort.name}`,
    `Auxilium begleitet pflegebed&uuml;rftige Menschen in ${ort.name} (${ort.plz}) &ndash; professionell, menschlich und g&uuml;nstig.`,
    ort.name
  ) + `
<script type="application/ld+json">${structuredData}</script>
<section class="section">
  <div class="container" style="max-width:860px;">
    <div class="text-center mb-12">
      <span class="section-label">Pflegedienst ${ort.plz} ${ort.name}</span>
      <h2>Auxilium in ${ort.name}</h2>
      <p style="max-width:620px;margin:16px auto 0;">${ort.text} Profitieren Sie von individueller Pflege, kompetenter Beratung und der Abrechnung &uuml;ber Ihre Pflegekasse.</p>
    </div>
    <div class="grid-3" style="margin-bottom:48px;">
      <article class="card"><div class="card__icon"><i class="fas fa-home"></i></div><h3 class="card__title">H&auml;usliche Pflege</h3><p class="card__text">K&ouml;rperpflege, Betreuung und Hauswirtschaft direkt bei Ihnen zu Hause in ${ort.name}.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-hand-holding-heart"></i></div><h3 class="card__title">Pflegeberatung</h3><p class="card__text">Ich berate Sie zu allen Pflegeleistungen, Pflegegrad-Antrag und Pflegekassen-Leistungen in ${ort.name}.</p></article>
      <article class="card"><div class="card__icon"><i class="fas fa-coins"></i></div><h3 class="card__title">G&uuml;nstige Preise</h3><p class="card__text">Auxilium ist deutlich g&uuml;nstiger als ambulante Pflegedienste &ndash; und abrechenbar &uuml;ber Verhinderungspflege.</p></article>
    </div>
    ${kats.length > 0 ? `<h3 style="text-align:center;margin-bottom:24px;">Meine Leistungen in ${ort.name}</h3>
    <div class="home-kat-grid">${katLinks}</div>` : ''}
    <div class="text-center" style="margin-top:48px;">
      <p style="margin-bottom:20px;color:var(--text-light);">Interessiert? Kontaktieren Sie mich f&uuml;r ein pers&ouml;nliches Erstgespr&auml;ch in ${ort.name} (${ort.plz}).</p>
      <a href="/kontakt" class="btn btn-accent"><i class="fas fa-envelope"></i>Pers&ouml;nliches Erstgespr&auml;ch anfragen</a>
    </div>
  </div>
</section>`
  return c.html(layout(
    `Pflegeberatung ${ort.plz} ${ort.name} – Auxilium`,
    `Individuelle Pflege und Pflegeberatung in ${ort.name} (${ort.plz}). Auxilium – Kristina Bronner. Verhinderungspflege, Körperpflege, Betreuung & Hauswirtschaft.`,
    body, { ...S, _canonical: `/pflege/${slug}` }
  ))
})

// ─── 404 ──────────────────────────────────────────────────────
app.notFound((c) => {
  const body = `<div style="min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px;">
  <div>
    <img src="/static/logo.png" alt="Auxilium" style="width:120px;height:120px;border-radius:16px;object-fit:cover;margin:0 auto 20px;box-shadow:var(--shadow-md);">
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
    { href: '/admin/infobanner', label: 'Info-Banner', key: 'infobanner', icon: 'fa-info-circle' },
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
.login-logo{text-align:center;margin-bottom:28px;}
.login-logo img{width:160px;height:auto;object-fit:contain;display:block;margin:0 auto;}
.login-logo h1{font-size:1.4rem;font-weight:700;color:#2C2018;margin-top:16px;}
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
    <img src="/static/logo.png" alt="Auxilium">
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
  const jobCount = await c.env.DB.prepare('SELECT COUNT(*) as n FROM stellenangebote WHERE active=1').first<any>()
  const testCount = await c.env.DB.prepare('SELECT COUNT(*) as n FROM testimonials WHERE active=1').first<any>()
  const backupCount = await c.env.DB.prepare('SELECT COUNT(*) as n FROM backups').first<any>()
  const S = await loadSettings(c.env.DB)
  const gaId = S.ga_id || ''

  const gaWidget = gaId
    ? `<div class="adm-card" style="margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <i class="fab fa-google" style="color:#4285F4;font-size:1.2rem;"></i>
        <h2 style="font-size:1rem;margin:0;">Google Analytics</h2>
        <span style="font-size:0.75rem;color:#7A6550;margin-left:auto;background:#F3EDE3;padding:3px 10px;border-radius:20px;">${gaId}</span>
      </div>
      <div id="gaLoading" style="text-align:center;padding:24px;color:#7A6550;font-size:0.88rem;">
        <i class="fas fa-spinner fa-spin" style="font-size:1.4rem;color:#D98A2B;display:block;margin-bottom:10px;"></i>
        Lade Statistiken…
      </div>
      <div id="gaStats" style="display:none;">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:18px;">
          <div style="background:#F0F7FF;border-radius:10px;padding:16px;text-align:center;border:1px solid #C8E0FF;">
            <div id="ga-today" style="font-size:1.8rem;font-weight:700;color:#1565C0;">–</div>
            <div style="font-size:0.78rem;color:#1976D2;margin-top:3px;">Besucher heute</div>
          </div>
          <div style="background:#F0FFF7;border-radius:10px;padding:16px;text-align:center;border:1px solid #A8E6C8;">
            <div id="ga-month" style="font-size:1.8rem;font-weight:700;color:#2D7A5E;">–</div>
            <div style="font-size:0.78rem;color:#2D7A5E;margin-top:3px;">Besucher diesen Monat</div>
          </div>
          <div style="background:#FBF7F2;border-radius:10px;padding:16px;text-align:center;border:1px solid #E8D9C5;">
            <div id="ga-prev" style="font-size:1.8rem;font-weight:700;color:#7A6550;">–</div>
            <div style="font-size:0.78rem;color:#7A6550;margin-top:3px;">Besucher Vormonat</div>
          </div>
        </div>
        <div style="background:#FBF7F2;border-radius:8px;padding:12px 16px;font-size:0.8rem;color:#7A6550;">
          <i class="fas fa-info-circle" style="margin-right:5px;color:#D98A2B;"></i>
          Statistiken werden direkt aus dem eingebetteten GA-Script gelesen. Neue Daten erscheinen nach dem ersten Seitenaufruf der Website (ca. 24–48h Verzögerung bei GA4).
          <a href="https://analytics.google.com" target="_blank" style="color:#D98A2B;margin-left:8px;">Google Analytics öffnen →</a>
        </div>
      </div>
      <div id="gaError" style="display:none;background:#F5E8E8;border:1px solid #D98A8A;border-radius:8px;padding:12px 16px;font-size:0.85rem;color:#8B1A1A;">
        <i class="fas fa-exclamation-triangle" style="margin-right:6px;"></i>
        <span id="gaErrorMsg">GA-Statistiken konnten nicht geladen werden.</span>
        <br><small style="color:#B55;">Hinweis: Google Analytics 4 erlaubt keinen direkten API-Zugriff ohne OAuth-Authentifizierung. Klicken Sie auf "Google Analytics öffnen" um Statistiken direkt bei Google abzurufen.</small>
      </div>
      <script>
      // GA4-Statistiken via gtag DataLayer auslesen (client-seitig was möglich)
      (function() {
        // Wir prüfen ob gtag verfügbar und versuchen PageView-Infos abzurufen
        // Da GA4 keine direkte JS-API für Statistiken bietet, zeigen wir einen
        // hilfreichen Hinweis mit Link zu Google Analytics
        setTimeout(function() {
          document.getElementById('gaLoading').style.display = 'none';
          document.getElementById('gaError').style.display = 'block';
          document.getElementById('gaErrorMsg').textContent = 
            'Direkte Statistik-Anzeige erfordert Google Analytics Data API (serverseitig mit OAuth). ';
        }, 1500);
      })();
      </script>
    </div>`
    : `<div class="adm-card" style="margin-bottom:20px;border:2px dashed #E8D9C5;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <i class="fab fa-google" style="color:#BDBDBD;font-size:1.2rem;"></i>
        <h2 style="font-size:1rem;margin:0;color:#7A6550;">Google Analytics – nicht konfiguriert</h2>
      </div>
      <p style="font-size:0.85rem;color:#7A6550;margin-bottom:12px;">Sobald Sie eine Google Analytics Tracking-ID hinterlegen, wird das Tracking-Script automatisch auf allen Seiten eingebunden. Statistiken werden dann nach ca. 24–48h verfügbar.</p>
      <a href="/admin/einstellungen#ga" class="adm-btn adm-btn-secondary"><i class="fab fa-google"></i> GA-Tracking-ID hinterlegen</a>
    </div>`

  const body = `
  <div class="adm-card" style="margin-bottom:20px;">
    <h2 style="margin-bottom:16px;font-size:1rem;color:#7A6550;text-transform:uppercase;letter-spacing:0.08em;">Übersicht</h2>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;">
      <div style="background:#FBF7F2;border-radius:10px;padding:18px;text-align:center;">
        <div style="font-size:2rem;font-weight:700;color:#D98A2B;">${leistungCount?.n ?? 0}</div>
        <div style="font-size:0.8rem;color:#7A6550;margin-top:4px;">Leistungen</div>
      </div>
      <div style="background:#FBF7F2;border-radius:10px;padding:18px;text-align:center;">
        <div style="font-size:2rem;font-weight:700;color:#4A9B7F;">${faqCount?.n ?? 0}</div>
        <div style="font-size:0.8rem;color:#7A6550;margin-top:4px;">FAQs</div>
      </div>
      <div style="background:#FBF7F2;border-radius:10px;padding:18px;text-align:center;">
        <div style="font-size:2rem;font-weight:700;color:#8B1A1A;">${jobCount?.n ?? 0}</div>
        <div style="font-size:0.8rem;color:#7A6550;margin-top:4px;">Stellen</div>
      </div>
      <div style="background:#FBF7F2;border-radius:10px;padding:18px;text-align:center;">
        <div style="font-size:2rem;font-weight:700;color:#D98A2B;">${testCount?.n ?? 0}</div>
        <div style="font-size:0.8rem;color:#7A6550;margin-top:4px;">Kundenstimmen</div>
      </div>
      <div style="background:#FBF7F2;border-radius:10px;padding:18px;text-align:center;">
        <div style="font-size:2rem;font-weight:700;color:#7A6550;">${backupCount?.n ?? 0}</div>
        <div style="font-size:0.8rem;color:#7A6550;margin-top:4px;">Backups</div>
      </div>
    </div>
  </div>

  ${gaWidget}

  <div class="adm-card">
    <h2 style="margin-bottom:12px;font-size:1rem;">Schnellzugriff</h2>
    <div style="display:flex;flex-wrap:wrap;gap:12px;">
      <a href="/admin/leistungen" class="adm-btn adm-btn-primary"><i class="fas fa-list-alt"></i>Leistungen</a>
      <a href="/admin/leistungen/neu" class="adm-btn adm-btn-green"><i class="fas fa-plus"></i>Neue Leistung</a>
      <a href="/admin/faq" class="adm-btn adm-btn-primary"><i class="fas fa-question-circle"></i>FAQ</a>
      <a href="/admin/stellenangebote" class="adm-btn adm-btn-primary"><i class="fas fa-briefcase"></i>Stellenangebote</a>
      <a href="/admin/testimonials" class="adm-btn adm-btn-primary"><i class="fas fa-star"></i>Kundenstimmen</a>
      <a href="/admin/infobanner" class="adm-btn adm-btn-secondary"><i class="fas fa-info-circle"></i>Info-Banner</a>
      <a href="/admin/einstellungen" class="adm-btn adm-btn-secondary"><i class="fas fa-sliders-h"></i>Einstellungen</a>
      <a href="/admin/backup" class="adm-btn adm-btn-secondary"><i class="fas fa-database"></i>Backup</a>
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
      <input name="question" value="${qEsc}" required placeholder="z.B. Wie läuft die persönliche Erstberatung ab?" style="font-size:0.95rem;">

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
      ${field('contact_email',    'E-Mail-Adresse (öffentlich sichtbar)', 'z. B. info@auxilium-forst.de')}
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

  <div class="adm-section-card" style="margin-top:24px;">
    <div class="adm-section-card__head">
      <i class="fab fa-google"></i>
      <div>
        <h2 class="adm-section-card__title">Google Analytics</h2>
        <p class="adm-section-card__sub">Besucher-Statistiken auf dem Dashboard anzeigen. Tracking-ID unter <a href="https://analytics.google.com" target="_blank" style="color:#D98A2B;">analytics.google.com</a> erstellen.</p>
      </div>
    </div>
    <div class="adm-section-card__body">
      ${field('ga_id', 'Google Analytics Tracking-ID (Measurement ID)', 'Format: G-XXXXXXXXXX (Google Analytics 4) oder UA-XXXXXXXX-X')}
      <div style="background:#FBF7F2;border:1px solid #E8D9C5;border-radius:8px;padding:12px 14px;font-size:0.8rem;color:#7A6550;line-height:1.7;">
        <strong style="color:#2C2018;">Einrichtung:</strong><br>
        1. <a href="https://analytics.google.com" target="_blank" style="color:#D98A2B;">analytics.google.com</a> → Neues Property anlegen (GA4)<br>
        2. Datenstrom hinzufügen → Web → Ihre Domain eingeben<br>
        3. Measurement ID (beginnt mit G-) hier eintragen und speichern<br>
        4. Das Tracking-Script wird automatisch auf allen Seiten eingebunden.<br>
        5. Statistiken im <a href="/admin" style="color:#D98A2B;">Dashboard</a> sehen (nach ca. 24h Daten verfügbar)
      </div>
      <p style="font-size:0.78rem;color:#7A6550;margin-top:8px;"><i class="fas fa-info-circle" style="margin-right:5px;"></i>Hinweis: Die Datenschutzerklärung muss bei Nutzung von Google Analytics entsprechend angepasst werden.</p>
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
    'recaptcha_site_key','recaptcha_secret_key',
    'ga_id'
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
            ${(job.salary||'').trim() ? `
            <div style="display:inline-flex;align-items:center;gap:10px;margin-top:12px;background:linear-gradient(90deg,rgba(217,138,43,0.12),rgba(217,138,43,0.06));border:1.5px solid rgba(217,138,43,0.35);border-radius:10px;padding:10px 18px;">
              <i class="fas fa-euro-sign" style="color:var(--primary);font-size:1rem;"></i>
              <span style="font-size:1rem;font-weight:700;color:var(--secondary);">Gehalt / Vergütung:</span>
              <span style="font-size:1rem;color:var(--primary);font-weight:700;">${job.salary}</span>
            </div>` : ''}
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
          <button class="share-btn share-btn-print" type="button">
            <i class="fas fa-print"></i> Drucken / PDF
          </button>
        </div>
      </div>
      <!-- Druckbereich: CSS-only gesteuert (kein JS-Toggle nötig) -->
      <div class="job-print-area">
        <div class="flyer-header">
          <img src="/static/logo.png" alt="Auxilium Logo">
          <div class="flyer-header-text">
            <h1>AUXILIUM</h1>
            <p>Pflegeberatung &middot; Kristina Bronner &middot; Forst Baden</p>
          </div>
        </div>
        <div class="flyer-body">
          <div class="flyer-job-title">${job.title}</div>
          <div style="color:#7A6550;font-size:10pt;margin-bottom:16px;display:flex;gap:16px;flex-wrap:wrap;">
            <span><i class="fas fa-map-marker-alt" style="color:#D98A2B;margin-right:5px;"></i>${job.location}</span>
            <span><i class="fas fa-briefcase" style="color:#D98A2B;margin-right:5px;"></i>${job.employment_type}</span>
            ${(job.salary||'').trim() ? `<span><i class="fas fa-euro-sign" style="color:#D98A2B;margin-right:5px;"></i>${job.salary}</span>` : ''}
          </div>
          <div class="flyer-content">${job.content}</div>
        </div>
        <div class="flyer-footer">
          <span>Auxilium &ndash; Kristina Bronner | Forst (Baden)</span>
          <span>info@auxilium-forst.de | auxilium-forst.de</span>
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
</section>`
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
    'INSERT INTO stellenangebote (slug,title,subtitle,employment_type,location,salary,content,active,sort_order) VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(d.slug||'', d.title||'', d.subtitle||'', d.employment_type||'Vollzeit', d.location||'Forst (Baden)', d.salary||'', d.content||'', d.active?1:0, maxRow?.next??99).run()
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
    'UPDATE stellenangebote SET title=?,subtitle=?,employment_type=?,location=?,salary=?,content=?,active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).bind(d.title||'', d.subtitle||'', d.employment_type||'Vollzeit', d.location||'Forst (Baden)', d.salary||'', d.content||'', d.active?1:0, c.req.param('id')).run()
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
    'INSERT INTO stellenangebote (slug,title,subtitle,employment_type,location,salary,content,active,sort_order) VALUES (?,?,?,?,?,?,?,0,?)'
  ).bind(newSlug, row.title + ' (Kopie)', row.subtitle, row.employment_type, row.location, row.salary||'', row.content, maxRow?.next??99).run()
  return c.redirect('/admin/stellenangebote?msg=duped')
})

// Admin: A4-Flyer-Druck einer Stellenanzeige
app.get('/admin/stellenangebote/:id/flyer', async (c) => {
  const job = await c.env.DB.prepare('SELECT * FROM stellenangebote WHERE id=?').bind(c.req.param('id')).first<any>()
  if (!job) return c.redirect('/admin/stellenangebote')
  const S = await loadSettings(c.env.DB)
  const loc = S.contact_location || 'Forst (Baden) & Umgebung'
  const email = S.contact_email || 'info@auxilium-forst.de'
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
    <img src="/static/logo.png" alt="Auxilium Logo">
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
    ${(job.salary||'').trim() ? `<div style="background:#FFF8EE;border:1.5px solid #D98A2B;border-radius:8px;padding:10px 16px;margin-bottom:18px;display:inline-flex;align-items:center;gap:10px;">
      <i class="fas fa-euro-sign" style="color:#D98A2B;"></i>
      <strong style="color:#2C2018;">Gehalt / Vergütung:</strong>
      <span style="color:#B5701A;font-weight:700;">${job.salary}</span>
    </div>` : ''}
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
      <label>Gehalt / Vergütung <span style="font-weight:400;color:#7A6550;">(optional – erscheint prominent in der Anzeige)</span></label>
      <input name="salary" value="${v('salary')}" placeholder="z.B. 2.400 – 2.800 € brutto/Monat oder nach Vereinbarung">
      <small style="color:#7A6550;font-size:0.75rem;display:block;margin-top:3px;">Leer lassen, wenn keine Gehaltsangabe gewünscht. Bei Angabe wird das Gehalt farbig hervorgehoben.</small>
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
  const S = await loadSettings(c.env.DB)
  const showTestimonials = S.show_testimonials !== '0'
  const alert = msg === 'saved' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Gespeichert.</div>'
              : msg === 'deleted' ? '<div class="adm-alert adm-alert-error"><i class="fas fa-trash"></i> Gel&ouml;scht.</div>'
              : msg === 'toggled' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Sichtbarkeit gespeichert.</div>' : ''
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
  ${alert}
  <!-- Toggle: Kundenstimmen-Sektion auf Startseite ein/ausblenden -->
  <div class="adm-card" style="margin-bottom:20px;border-left:4px solid ${showTestimonials ? '#2D7A5E' : '#D98A2B'};">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <div>
        <p style="font-weight:700;font-size:0.95rem;margin-bottom:3px;color:#2C2018;">
          <i class="fas fa-eye${showTestimonials ? '' : '-slash'}" style="color:${showTestimonials ? '#2D7A5E' : '#D98A2B'};margin-right:8px;"></i>
          Kundenstimmen-Bereich auf der Startseite: <strong style="color:${showTestimonials ? '#2D7A5E' : '#8B1A1A'};">${showTestimonials ? 'SICHTBAR' : 'AUSGEBLENDET'}</strong>
        </p>
        <p style="font-size:0.82rem;color:#7A6550;">Hier können Sie den gesamten Kundenstimmen-Bereich auf der Startseite ein- oder ausblenden.</p>
      </div>
      <form method="POST" action="/admin/testimonials/toggle-visibility">
        <input type="hidden" name="show" value="${showTestimonials ? '0' : '1'}">
        <button type="submit" class="adm-btn ${showTestimonials ? 'adm-btn-danger' : 'adm-btn-green'}" style="white-space:nowrap;">
          <i class="fas fa-${showTestimonials ? 'eye-slash' : 'eye'}"></i>
          ${showTestimonials ? 'Ausblenden' : 'Einblenden'}
        </button>
      </form>
    </div>
  </div>

  <div class="adm-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px;">
      <h2 style="font-size:1.1rem;">Kundenstimmen (${items.length})</h2>
      <a href="/admin/testimonials/neu" class="adm-btn adm-btn-primary"><i class="fas fa-plus"></i> Neue Kundenstimme</a>
    </div>
    <p style="font-size:0.82rem;color:#7A6550;margin-bottom:16px;"><i class="fas fa-info-circle" style="margin-right:5px;"></i>Aktive Kundenstimmen erscheinen auf der Startseite in einer automatisch wechselnden Slideshow (sofern der Bereich oben eingeblendet ist).</p>
    ${items.length === 0 ? '<p style="color:#7A6550;text-align:center;padding:24px 0;">Noch keine Kundenstimmen. <a href="/admin/testimonials/neu" style="color:#D98A2B;">Jetzt anlegen</a>.</p>' : `
    <table class="adm-table">
      <thead><tr><th>Name</th><th>Text</th><th>Bewertung</th><th>Status</th><th>Aktionen</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`}
  </div>`
  return c.html(adminLayout('Kundenstimmen', body, 'testimonials'))
})

// Toggle-Route: Kundenstimmen-Sektion sichtbar/unsichtbar
app.post('/admin/testimonials/toggle-visibility', async (c) => {
  const d = await c.req.parseBody()
  const val = (d.show === '1') ? '1' : '0'
  await c.env.DB.prepare(
    `INSERT INTO settings (key, value, label) VALUES ('show_testimonials', ?, 'show_testimonials')
     ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP`
  ).bind(val).run()
  return c.redirect('/admin/testimonials?msg=toggled')
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

// Redirect alter URL
app.get('/admin/urlaub', (c) => c.redirect('/admin/infobanner', 301))

// ═══════════════════════════════════════════════════════════════
// ADMIN: INFO-BANNER
// ═══════════════════════════════════════════════════════════════

app.get('/admin/infobanner', async (c) => {
  const msg = c.req.query('msg')
  const S = await loadSettings(c.env.DB)
  const alert = msg === 'saved' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Info-Banner gespeichert.</div>'
    : msg === 'error' ? '<div class="adm-alert adm-alert-error"><i class="fas fa-exclamation-circle"></i> Fehler beim Speichern.</div>' : ''
  const isActive = S.banner_active === '1'
  // banner_bg_image = '1' wenn Bild in KV vorhanden, '' wenn nicht
  const hasBgImage = S.banner_bg_image === '1'
  const bgOpacity = S.banner_bg_opacity || '50'
  const interval = S.banner_interval_minutes || '60'
  // Cache-Buster-URL für Admin-Vorschau und Thumbnail
  const adminBgTs = S.banner_bg_ts || '1'
  const adminBgUrl = '/media/banner-bg?v=' + adminBgTs

  const body = `
  ${alert}
  <!-- 2-Spalten-Layout: Formular links, Live-Vorschau rechts -->
  <div style="display:grid;grid-template-columns:1fr 380px;gap:28px;align-items:start;" class="ib-page-grid">

  <form method="POST" action="/admin/infobanner" enctype="multipart/form-data" class="adm-form" id="ibForm">

    <!-- Status-Karte -->
    <div class="adm-card" style="margin-bottom:20px;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:44px;height:44px;border-radius:12px;background:${isActive?'linear-gradient(135deg,#D98A2B,#B5701A)':'#E8D9C5'};display:flex;align-items:center;justify-content:center;">
            <i class="fas fa-info-circle" style="color:white;font-size:1.2rem;"></i>
          </div>
          <div>
            <div style="font-weight:700;font-size:0.97rem;color:${isActive?'#D98A2B':'#7A6550'};">
              Info-Banner ist ${isActive?'<span style="color:#D98A2B;">AKTIV</span>':'<span>inaktiv</span>'}
            </div>
            <div style="font-size:0.78rem;color:#7A6550;margin-top:2px;">${isActive?'Banner erscheint auf der Website für Besucher.':'Kein Banner wird auf der Website angezeigt.'}</div>
          </div>
        </div>
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;background:${isActive?'#FFF3E0':'#F4F6F9'};padding:10px 16px;border-radius:10px;border:2px solid ${isActive?'#D98A2B':'#E8D9C5'};">
          <input type="checkbox" name="banner_active" value="1" style="width:18px;height:18px;accent-color:#D98A2B;" ${isActive?'checked':''} id="ib_active_cb">
          <span style="font-weight:600;font-size:0.9rem;">Banner aktivieren</span>
        </label>
      </div>
    </div>

    <!-- Inhalt-Karte -->
    <div class="adm-card" style="margin-bottom:20px;">
      <h3 style="font-size:1rem;margin-bottom:16px;color:#2C2018;"><i class="fas fa-pen" style="color:#D98A2B;margin-right:8px;"></i>Banner-Inhalt</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;" class="infobanner-grid-2">
        <div class="adm-form-group">
          <label class="adm-label" for="ib_title">Titel <span style="font-weight:400;color:#7A6550;">(optional)</span></label>
          <input type="text" id="ib_title" name="banner_title" value="${(S.banner_title||'').replace(/"/g,'&quot;')}" class="adm-input" placeholder="z.B. Wichtiger Hinweis" oninput="ibUpdatePreview()">
        </div>
        <div class="adm-form-group">
          <label class="adm-label" for="ib_icon">
            Icon <span style="font-weight:400;color:#7A6550;">(optional)</span>
            <a href="https://fontawesome.com/icons?q=&s=solid" target="_blank" rel="noopener noreferrer" style="font-size:0.75rem;color:#D98A2B;margin-left:6px;text-decoration:none;" title="FontAwesome Icons durchsuchen"><i class="fas fa-external-link-alt" style="font-size:0.65rem;"></i> fontawesome.com</a>
          </label>
          <input type="text" id="ib_icon" name="banner_icon" value="${(S.banner_icon||'').replace(/"/g,'&quot;')}" class="adm-input" placeholder="z.B. fas fa-umbrella-beach" oninput="ibUpdatePreview()">
          <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:8px;">
            <span style="font-size:0.75rem;color:#7A6550;width:100%;margin-bottom:2px;">Beispiele (klicken zum Übernehmen):</span>
            <button type="button" class="ib-icon-example" onclick="ibSetIcon('fas fa-info-circle')" title="fas fa-info-circle"><i class="fas fa-info-circle"></i> fas fa-info-circle</button>
            <button type="button" class="ib-icon-example" onclick="ibSetIcon('fas fa-umbrella-beach')" title="fas fa-umbrella-beach"><i class="fas fa-umbrella-beach"></i> fas fa-umbrella-beach</button>
            <button type="button" class="ib-icon-example" onclick="ibSetIcon('fas fa-star')" title="fas fa-star"><i class="fas fa-star"></i> fas fa-star</button>
            <button type="button" class="ib-icon-example" onclick="ibSetIcon('fas fa-exclamation-triangle')" title="fas fa-exclamation-triangle"><i class="fas fa-exclamation-triangle"></i> fas fa-exclamation-triangle</button>
            <button type="button" class="ib-icon-example" onclick="ibSetIcon('fas fa-calendar-alt')" title="fas fa-calendar-alt"><i class="fas fa-calendar-alt"></i> fas fa-calendar-alt</button>
            <button type="button" class="ib-icon-example" onclick="ibSetIcon('fas fa-heart')" title="fas fa-heart"><i class="fas fa-heart"></i> fas fa-heart</button>
            <button type="button" class="ib-icon-example" onclick="ibSetIcon('fas fa-bullhorn')" title="fas fa-bullhorn"><i class="fas fa-bullhorn"></i> fas fa-bullhorn</button>
            <button type="button" class="ib-icon-example" onclick="ibSetIcon('fas fa-clock')" title="fas fa-clock"><i class="fas fa-clock"></i> fas fa-clock</button>
          </div>
        </div>
      </div>

      <!-- WYSIWYG-Editor mit Link-Ziel-Auswahl -->
      <div class="adm-form-group">
        <label class="adm-label">Banner-Text</label>
        <div style="border:1px solid #E8D9C5;border-radius:10px;overflow:hidden;background:white;">
          <div style="display:flex;flex-wrap:wrap;gap:4px;padding:8px 10px;background:#F9F5F0;border-bottom:1px solid #E8D9C5;">
            <button type="button" onclick="ibExecCmd('bold')" title="Fett" style="background:none;border:1px solid #ddd;border-radius:5px;padding:4px 8px;cursor:pointer;" aria-label="Fett"><b>B</b></button>
            <button type="button" onclick="ibExecCmd('italic')" title="Kursiv" style="background:none;border:1px solid #ddd;border-radius:5px;padding:4px 8px;cursor:pointer;" aria-label="Kursiv"><i>I</i></button>
            <button type="button" onclick="ibExecCmd('underline')" title="Unterstrichen" style="background:none;border:1px solid #ddd;border-radius:5px;padding:4px 8px;cursor:pointer;" aria-label="Unterstrichen"><u>U</u></button>
            <span style="width:1px;background:#ddd;margin:2px 4px;" aria-hidden="true"></span>
            <button type="button" onclick="ibExecCmd('insertUnorderedList')" title="Liste" style="background:none;border:1px solid #ddd;border-radius:5px;padding:4px 8px;cursor:pointer;" aria-label="Aufzählungsliste"><i class="fas fa-list" aria-hidden="true"></i></button>
            <button type="button" onclick="ibExecCmd('justifyLeft')" title="Links" style="background:none;border:1px solid #ddd;border-radius:5px;padding:4px 8px;cursor:pointer;" aria-label="Linksbündig"><i class="fas fa-align-left" aria-hidden="true"></i></button>
            <button type="button" onclick="ibExecCmd('justifyCenter')" title="Zentriert" style="background:none;border:1px solid #ddd;border-radius:5px;padding:4px 8px;cursor:pointer;" aria-label="Zentriert"><i class="fas fa-align-center" aria-hidden="true"></i></button>
            <button type="button" onclick="ibInsertLink()" title="Link einfügen" style="background:none;border:1px solid #ddd;border-radius:5px;padding:4px 8px;cursor:pointer;" aria-label="Link einfügen"><i class="fas fa-link" aria-hidden="true"></i></button>
            <span style="width:1px;background:#ddd;margin:2px 4px;" aria-hidden="true"></span>
            <button type="button" id="ibToggleHtml" onclick="ibToggleHtmlMode()" title="HTML-Ansicht umschalten" style="background:none;border:1px solid #ddd;border-radius:5px;padding:4px 8px;cursor:pointer;font-size:0.78rem;font-family:monospace;" aria-label="HTML-Modus">&lt;/&gt;</button>
          </div>
          <div id="ibEditor" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Banner-Textinhalt" style="min-height:120px;padding:14px;outline:none;font-size:0.9rem;line-height:1.6;color:#2C2018;" oninput="ibUpdatePreview()">${S.banner_text||''}</div>
          <textarea id="ibHtmlArea" name="banner_text" aria-label="HTML-Quellcode" style="display:none;width:100%;min-height:120px;padding:14px;font-family:monospace;font-size:0.82rem;border:none;outline:none;resize:vertical;" oninput="ibUpdatePreview()">${(S.banner_text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
        </div>
      </div>
    </div>

    <!-- Hintergrundbild-Karte -->
    <div class="adm-card" style="margin-bottom:20px;">
      <h3 style="font-size:1rem;margin-bottom:16px;color:#2C2018;"><i class="fas fa-image" style="color:#D98A2B;margin-right:8px;"></i>Hintergrundbild</h3>

      <div class="adm-form-group">
        <label class="adm-label" for="ib_bg_file">Bild hochladen <span style="font-weight:400;color:#7A6550;">(JPG, PNG, WebP – max. 20 MB)</span></label>
        <input type="file" id="ib_bg_file" name="banner_bg_file" accept="image/jpeg,image/png,image/webp" class="adm-input" style="padding:8px;" onchange="ibPreviewBgImage(this)">
        ${hasBgImage
          ? `<div style="margin-top:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
               <p style="font-size:0.82rem;color:#4A9B7F;margin:0;"><i class="fas fa-check-circle"></i> Hintergrundbild ist gespeichert</p>
               <img src="${adminBgUrl}" alt="Vorschau Hintergrundbild" style="max-width:200px;max-height:120px;border-radius:8px;border:1px solid #E8D9C5;object-fit:cover;" loading="lazy">
             </div>
             <p style="font-size:0.78rem;color:#7A6550;margin-top:8px;">Neues Bild hochladen, um es zu ersetzen. Feld leer lassen, um beizubehalten.</p>`
          : '<span class="adm-hint">Noch kein Bild hochgeladen. Ohne Bild erscheint das Modal mit weißem Hintergrund.</span>'}
      </div>
      <div class="adm-form-group" style="margin-top:14px;">
        <label class="adm-label" for="ib_opacity">Bildtransparenz <span style="font-weight:400;color:#7A6550;">(0% = vollständig sichtbar, 100% = unsichtbar)</span></label>
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
          <input type="range" id="ib_opacity" name="banner_bg_opacity" min="0" max="100" value="${bgOpacity}" style="width:180px;accent-color:#D98A2B;" oninput="document.getElementById('ib_opacity_val').textContent=this.value+'%';ibUpdatePreview()">
          <span id="ib_opacity_val" style="font-weight:700;color:#D98A2B;min-width:40px;">${bgOpacity}%</span>
          <input type="number" name="banner_bg_opacity_num" min="0" max="100" value="${bgOpacity}" class="adm-input" style="max-width:80px;" oninput="document.getElementById('ib_opacity').value=this.value;document.getElementById('ib_opacity_val').textContent=this.value+'%';ibUpdatePreview()" aria-label="Transparenz in Prozent">
        </div>
        <span class="adm-hint">Empfohlen: 30–60% für leichten Hintergrundeffekt.</span>
      </div>
      ${hasBgImage ? `<div style="margin-top:12px;">
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
          <input type="checkbox" name="banner_bg_delete" value="1" style="width:16px;height:16px;accent-color:#8B1A1A;" aria-label="Hintergrundbild löschen">
          <span style="font-size:0.85rem;color:#8B1A1A;">Hintergrundbild löschen</span>
        </label>
      </div>` : ''}
    </div>

    <!-- Anzeige-Intervall-Karte -->
    <div class="adm-card" style="margin-bottom:20px;">
      <h3 style="font-size:1rem;margin-bottom:16px;color:#2C2018;"><i class="fas fa-clock" style="color:#D98A2B;margin-right:8px;"></i>Anzeigeintervall</h3>
      <div class="adm-form-group">
        <label class="adm-label" for="ib_interval">Banner erneut anzeigen nach <span style="font-weight:400;color:#7A6550;">(Minuten pro Browser)</span></label>
        <div style="display:flex;align-items:center;gap:12px;">
          <input type="number" id="ib_interval" name="banner_interval_minutes" value="${interval}" min="1" max="99999" class="adm-input" style="max-width:120px;">
          <span style="font-size:0.85rem;color:#7A6550;">Minuten</span>
        </div>
        <span class="adm-hint">Nach dem ersten Anzeigen wird das Banner pro Browser erst nach dieser Zeit wieder eingeblendet. Standard: 60 Minuten.</span>
      </div>
    </div>

    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <button type="submit" class="adm-btn adm-btn-primary"><i class="fas fa-save"></i> Einstellungen speichern</button>
      <a href="/" target="_blank" class="adm-btn adm-btn-secondary" rel="noopener"><i class="fas fa-eye"></i> Website ansehen</a>
    </div>
  </form>

  <!-- Live-Vorschau rechts -->
  <div class="ib-preview-panel" style="position:sticky;top:90px;">
    <div style="background:white;border:1px solid #E8D9C5;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(44,32,24,0.08);">
      <div style="padding:14px 18px;background:#F9F5F0;border-bottom:1px solid #E8D9C5;display:flex;align-items:center;gap:8px;">
        <i class="fas fa-eye" style="color:#D98A2B;"></i>
        <span style="font-size:0.88rem;font-weight:600;color:#2C2018;">Live-Vorschau</span>
        <span style="font-size:0.75rem;color:#7A6550;margin-left:auto;">aktualisiert sich live</span>
      </div>
      <!-- Mini-Modal-Preview -->
      <div style="padding:20px;background:#e8e0d4;min-height:340px;display:flex;align-items:center;justify-content:center;position:relative;">
        <!-- Backdrop-Simulation -->
        <div style="position:absolute;inset:0;background:rgba(30,20,10,0.55);border-radius:0 0 0 0;"></div>
        <!-- Modal-Box: background-image direkt am Modal (1:1 wie echtes Modal) -->
        <div id="ibPreviewModal" style="position:relative;z-index:2;border-radius:20px;width:100%;max-width:320px;box-shadow:0 8px 40px rgba(0,0,0,0.3);overflow:hidden;${hasBgImage ? "background-image:url('" + adminBgUrl + "');background-size:cover;background-position:center;" : 'background:white;'}">
          <!-- Innenbereich: weißer oder halbtransparenter Hintergrund -->
          <div id="ibPreviewInner" style="padding:32px 28px 28px;${hasBgImage ? 'background:rgba(255,255,255,' + (parseInt(bgOpacity,10)/100).toFixed(2) + ');' : 'background:white;'}display:flex;flex-direction:column;gap:16px;position:relative;">
            <!-- Schließen-Button -->
            <button type="button" style="position:absolute;top:10px;right:12px;width:30px;height:30px;border-radius:50%;background:rgba(44,32,24,0.1);border:none;font-size:1.2rem;color:#2C2018;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;" aria-label="Schließen">×</button>
            <!-- Header: Icon + Titel (wie .info-banner-modal__header) -->
            <div id="ibPreviewHeader" style="display:${(S.banner_icon||S.banner_title)?'flex':'none'};align-items:center;gap:12px;padding-right:28px;">
              <div id="ibPreviewIcon" style="width:44px;height:44px;min-width:44px;border-radius:12px;background:linear-gradient(135deg,#D98A2B,#B5701A);display:${S.banner_icon?'flex':'none'};align-items:center;justify-content:center;font-size:1.25rem;color:white;box-shadow:0 4px 12px rgba(217,138,43,0.35);">${S.banner_icon ? '<i class="' + (S.banner_icon||'').replace(/"/g,'&quot;') + '"></i>' : ''}</div>
              <div id="ibPreviewTitle" style="font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:1rem;color:#2C2018;line-height:1.25;">${(S.banner_title||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')||'<span style="color:#bbb;font-style:italic;font-weight:400;font-family:inherit;">Kein Titel</span>'}</div>
            </div>
            <!-- Body -->
            <div id="ibPreviewText" style="font-size:0.82rem;color:#3D2B1A;line-height:1.7;">${S.banner_text||'<span style="color:#999;font-style:italic;">Kein Text eingegeben</span>'}</div>
          </div>
        </div>
      </div>
      <div style="padding:10px 18px;background:#F9F5F0;border-top:1px solid #E8D9C5;">
        <span style="font-size:0.75rem;color:#7A6550;"><i class="fas fa-info-circle" style="margin-right:4px;"></i>So erscheint der Banner auf der Website</span>
      </div>
    </div>
  </div>

  </div><!-- end ib-page-grid -->

  <!-- Link-Einfügen-Dialog -->
  <div id="ibLinkDialog" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;" role="dialog" aria-modal="true" aria-labelledby="ibLinkDialogTitle">
    <div style="background:white;border-radius:14px;padding:28px 32px;max-width:460px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
      <h3 id="ibLinkDialogTitle" style="margin:0 0 18px;font-size:1rem;">Link einfügen</h3>
      <div style="margin-bottom:12px;">
        <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:5px;" for="ibLinkUrl">URL</label>
        <input type="url" id="ibLinkUrl" placeholder="https://www.beispiel.de" style="width:100%;padding:8px 12px;border:1px solid #E8D9C5;border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
      </div>
      <div style="margin-bottom:18px;">
        <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:8px;">Link öffnen in</label>
        <div style="display:flex;gap:16px;">
          <label style="display:flex;align-items:center;gap:7px;cursor:pointer;">
            <input type="radio" name="ibLinkTarget" value="_self" checked style="accent-color:#D98A2B;"> Gleichem Fenster
          </label>
          <label style="display:flex;align-items:center;gap:7px;cursor:pointer;">
            <input type="radio" name="ibLinkTarget" value="_blank" style="accent-color:#D98A2B;"> Neuem Tab
          </label>
        </div>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button type="button" onclick="ibLinkCancel()" style="background:none;border:1px solid #E8D9C5;border-radius:8px;padding:8px 16px;cursor:pointer;font-size:0.88rem;">Abbrechen</button>
        <button type="button" onclick="ibLinkConfirm()" style="background:#D98A2B;color:white;border:none;border-radius:8px;padding:8px 18px;cursor:pointer;font-size:0.88rem;font-weight:600;">Einfügen</button>
      </div>
    </div>
  </div>

  <style>
    @media(max-width:900px){.ib-page-grid{grid-template-columns:1fr!important;}}
    @media(max-width:600px){.infobanner-grid-2{grid-template-columns:1fr!important;}}
    @media(max-width:900px){.ib-preview-panel{position:static!important;}}
    .ib-icon-example {
      display:inline-flex;align-items:center;gap:5px;
      background:#F9F5F0;border:1px solid #E8D9C5;border-radius:7px;
      padding:4px 10px;cursor:pointer;font-size:0.78rem;color:#4A3728;
      transition:background 0.15s,border-color 0.15s;white-space:nowrap;
    }
    .ib-icon-example:hover { background:#FFF3E0;border-color:#D98A2B;color:#D98A2B; }
  </style>
  <script>
    var ibHtmlMode = false;
    var ibEditor = document.getElementById('ibEditor');
    var ibHtmlArea = document.getElementById('ibHtmlArea');
    var ibSavedRange = null;

    function ibExecCmd(cmd, val) {
      if(ibHtmlMode) return;
      ibEditor.focus();
      document.execCommand(cmd, false, val||null);
      ibUpdatePreview();
    }
    function ibInsertLink() {
      if(ibHtmlMode) return;
      ibEditor.focus();
      var sel = window.getSelection();
      if(sel && sel.rangeCount > 0) ibSavedRange = sel.getRangeAt(0).cloneRange();
      var dlg = document.getElementById('ibLinkDialog');
      dlg.style.display = 'flex';
      document.getElementById('ibLinkUrl').value = '';
      document.getElementById('ibLinkUrl').focus();
    }
    function ibLinkCancel() {
      document.getElementById('ibLinkDialog').style.display = 'none';
    }
    function ibLinkConfirm() {
      var url = document.getElementById('ibLinkUrl').value.trim();
      var target = document.querySelector('input[name="ibLinkTarget"]:checked').value;
      if(!url){ alert('Bitte eine URL eingeben.'); return; }
      document.getElementById('ibLinkDialog').style.display = 'none';
      ibEditor.focus();
      if(ibSavedRange) {
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(ibSavedRange);
      }
      document.execCommand('createLink', false, url);
      var links = ibEditor.querySelectorAll('a[href="'+url+'"]');
      links.forEach(function(l){ l.target = target; if(target==='_blank') l.rel='noopener noreferrer'; });
      ibUpdatePreview();
    }
    document.getElementById('ibLinkDialog').addEventListener('keydown', function(e){ if(e.key==='Escape') ibLinkCancel(); });

    function ibToggleHtmlMode() {
      ibHtmlMode = !ibHtmlMode;
      var btn = document.getElementById('ibToggleHtml');
      if(ibHtmlMode) {
        ibHtmlArea.value = ibEditor.innerHTML;
        ibEditor.style.display='none';
        ibHtmlArea.style.display='block';
        btn.style.background='#D98A2B';btn.style.color='white';btn.style.borderColor='#D98A2B';
      } else {
        ibEditor.innerHTML = ibHtmlArea.value;
        ibHtmlArea.style.display='none';
        ibEditor.style.display='block';
        btn.style.background='';btn.style.color='';btn.style.borderColor='';
      }
      ibUpdatePreview();
    }

    // Icon-Beispiel anklicken → Feld befüllen
    function ibSetIcon(cls) {
      document.getElementById('ib_icon').value = cls;
      ibUpdatePreview();
    }

    // Datei-Vorschau im Preview aktualisieren
    function ibPreviewBgImage(input) {
      if(input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
          var bg = document.getElementById('ibPreviewBg');
          if(bg) { bg.style.backgroundImage = 'url(' + e.target.result + ')'; }
        };
        reader.readAsDataURL(input.files[0]);
      }
    }

    // Live-Vorschau aktualisieren (1:1 echtes Modal-Layout)
    function ibUpdatePreview() {
      var title   = (document.getElementById('ib_title')||{value:''}).value.trim();
      var icon    = (document.getElementById('ib_icon')||{value:''}).value.trim();
      var text    = ibHtmlMode ? ibHtmlArea.value : ibEditor.innerHTML;
      var opacityPct = document.getElementById('ib_opacity') ? parseInt(document.getElementById('ib_opacity').value,10) : 50;
      var opacityDecimal = (opacityPct/100).toFixed(2);

      var prevModal  = document.getElementById('ibPreviewModal');
      var prevIcon   = document.getElementById('ibPreviewIcon');
      var prevTitle  = document.getElementById('ibPreviewTitle');
      var prevText   = document.getElementById('ibPreviewText');
      var prevInner  = document.getElementById('ibPreviewInner');
      var prevHeader = document.getElementById('ibPreviewHeader');

      // Hintergrundbild: prüfen ob vorhanden (backgroundImage am Modal selbst)
      var hasBg = prevModal && prevModal.style.backgroundImage && prevModal.style.backgroundImage !== '' && prevModal.style.backgroundImage !== 'none';

      // Icon: Box anzeigen/verstecken
      if(prevIcon) {
        if(icon) {
          prevIcon.innerHTML = '<i class="' + icon + '"></i>';
          prevIcon.style.display = 'flex';
        } else {
          prevIcon.innerHTML = '';
          prevIcon.style.display = 'none';
        }
      }
      // Titel
      if(prevTitle) {
        if(title) {
          prevTitle.innerHTML = '';
          prevTitle.textContent = title;
          prevTitle.style.color = '#2C2018';
          prevTitle.style.fontStyle = 'normal';
          prevTitle.style.fontWeight = '700';
        } else {
          prevTitle.innerHTML = '<span style="color:#bbb;font-style:italic;font-weight:400;font-family:inherit;">Kein Titel</span>';
        }
      }
      // Header: nur anzeigen wenn Icon oder Titel
      if(prevHeader) prevHeader.style.display = (icon || title) ? 'flex' : 'none';
      // Text
      if(prevText) prevText.innerHTML = text || '<span style="color:#999;font-style:italic;">Kein Text eingegeben</span>';
      // Inner-Hintergrund: halbtransparent wenn Bild vorhanden
      if(prevInner) {
        prevInner.style.background = hasBg ? 'rgba(255,255,255,' + opacityDecimal + ')' : 'white';
      }
    }

    // Datei-Vorschau: Bild direkt am Modal-Element setzen
    function ibPreviewBgImage(input) {
      var prevModal = document.getElementById('ibPreviewModal');
      var prevInner = document.getElementById('ibPreviewInner');
      if(input.files && input.files[0] && prevModal) {
        var reader = new FileReader();
        reader.onload = function(e) {
          prevModal.style.backgroundImage = 'url(' + e.target.result + ')';
          prevModal.style.backgroundSize = 'cover';
          prevModal.style.backgroundPosition = 'center';
          prevModal.style.background = ''; // background shorthand zurücksetzen
          ibUpdatePreview();
        };
        reader.readAsDataURL(input.files[0]);
      }
    }

    // Beim Absenden: Slider + WYSIWYG synchronisieren
    document.getElementById('ibForm').addEventListener('submit', function(){
      if(!ibHtmlMode) ibHtmlArea.value = ibEditor.innerHTML;
      ibHtmlArea.style.display='block';
      var slider = document.getElementById('ib_opacity');
      var numField = document.querySelector('input[name="banner_bg_opacity_num"]');
      if(slider && numField) numField.value = slider.value;
    });

    // Initial-Preview
    ibUpdatePreview();
  </script>`
  return c.html(adminLayout('Info-Banner', body, 'infobanner'))
})

app.post('/admin/infobanner', async (c) => {
  try {
    const form = await c.req.parseBody({ all: true })
    const upsert = async (key: string, value: string) => {
      await c.env.DB.prepare(
        `INSERT INTO settings (key, value, label) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP`
      ).bind(key, value, key).run()
    }
    await upsert('banner_active', form.banner_active === '1' ? '1' : '0')
    await upsert('banner_title', (form.banner_title as string) || '')
    await upsert('banner_icon', (form.banner_icon as string) || '')
    await upsert('banner_text', (form.banner_text as string) || '')
    await upsert('banner_interval_minutes', (form.banner_interval_minutes as string) || '60')
    // Opacity: aus number-Feld (slider-Wert)
    const rawOpacity = (form.banner_bg_opacity_num as string) || (form.banner_bg_opacity as string) || '50'
    const opacity = Math.min(100, Math.max(0, parseInt(rawOpacity, 10) || 50)).toString()
    await upsert('banner_bg_opacity', opacity)

    // Hintergrundbild: löschen oder hochladen
    if (form.banner_bg_delete === '1') {
      await c.env.MEDIA.delete('banner-bg')
      await upsert('banner_bg_image', '')   // Flag leeren
      await upsert('banner_bg_ts', '')      // Version-Token leeren
    } else {
      const bgFile = form.banner_bg_file as File
      if (bgFile && bgFile.size > 0) {
        const buffer = await bgFile.arrayBuffer()
        const mimeType = bgFile.type || 'image/jpeg'
        await c.env.MEDIA.put('banner-bg', buffer, {
          metadata: { mime: mimeType, uploadedAt: new Date().toISOString() }
        })
        await upsert('banner_bg_image', '1')                  // Flag: Bild vorhanden
        await upsert('banner_bg_ts', Date.now().toString())   // Cache-Buster: neuer Timestamp bei jedem Upload
      }
    }
    return c.redirect('/admin/infobanner?msg=saved')
  } catch (e) {
    console.error('infobanner save error:', e)
    return c.redirect('/admin/infobanner?msg=error')
  }
})

// ═══════════════════════════════════════════════════════════════
// ADMIN: UPDATE & BACKUP SYSTEM
// ═══════════════════════════════════════════════════════════════

app.get('/admin/backup', async (c) => {
  const msg = c.req.query('msg')
  const { results: backups } = await c.env.DB.prepare(
    'SELECT * FROM backups ORDER BY created_at DESC LIMIT 25'
  ).all<any>()
  const alert = msg === 'created' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-check-circle"></i> Backup wurde erfolgreich erstellt.</div>'
              : msg === 'restored' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-undo"></i> Backup wurde erfolgreich wiederhergestellt.</div>'
              : msg === 'deleted' ? '<div class="adm-alert adm-alert-error"><i class="fas fa-trash"></i> Backup gel&ouml;scht.</div>'
              : msg === 'error' ? '<div class="adm-alert adm-alert-error"><i class="fas fa-exclamation-circle"></i> Fehler beim Verarbeiten des Backups.</div>'
              : msg === 'exported' ? '<div class="adm-alert adm-alert-success"><i class="fas fa-download"></i> Export gestartet.</div>' : ''

  const backupRows = backups.map((b: any) => {
    const sizeKB = Math.round(b.size_bytes / 1024)
    const dt = new Date(b.created_at).toLocaleString('de-DE')
    const typeLabel = b.type === 'auto' ? '<span class="adm-badge adm-badge-gray">Auto</span>' : '<span class="adm-badge adm-badge-green">Manuell</span>'
    const hasData = b.dump_data && b.dump_data !== ''
    return `<div class="backup-item" id="backup-${b.id}">
      <div class="backup-item__info">
        <div class="backup-item__name"><i class="fas fa-database" style="margin-right:7px;color:#D98A2B;"></i>${b.name}</div>
        <div class="backup-item__meta">${dt} &nbsp;·&nbsp; ${sizeKB} KB &nbsp;·&nbsp; ${typeLabel} ${b.description ? `&nbsp;·&nbsp; <em>${b.description}</em>` : ''}</div>
      </div>
      <div class="backup-item__actions" style="flex-wrap:wrap;">
        ${hasData ? `<a href="/admin/backup/${b.id}/download" class="adm-btn adm-btn-secondary" style="padding:5px 10px;" title="Als JSON herunterladen"><i class="fas fa-download"></i></a>` : ''}
        <button class="adm-btn adm-btn-green" style="padding:5px 12px;" title="${hasData ? 'Wiederherstellen' : 'Keine Daten (älteres Format)'}"
          onclick="startRestore(${b.id},'${b.name.replace(/'/g,"\\'")}',${hasData ? 'true' : 'false'})">
          <i class="fas fa-undo"></i> Restore
        </button>
        <form method="POST" action="/admin/backup/${b.id}/delete" style="display:inline;" onsubmit="return confirm('Backup löschen?')">
          <button type="submit" class="adm-btn adm-btn-danger" style="padding:5px 10px;"><i class="fas fa-trash"></i></button>
        </form>
      </div>
    </div>`
  }).join('')

  const body = `
  ${alert}

  <!-- Fortschritts-Overlay -->
  <div id="progressOverlay" style="display:none;position:fixed;inset:0;background:rgba(26,13,6,0.72);z-index:9999;align-items:center;justify-content:center;">
    <div style="background:white;border-radius:16px;padding:36px 44px;max-width:420px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <div id="progIcon" style="font-size:2.4rem;color:#D98A2B;margin-bottom:14px;"><i class="fas fa-cog fa-spin"></i></div>
      <div id="progTitle" style="font-size:1.1rem;font-weight:700;color:#2C2018;margin-bottom:6px;">Bitte warten…</div>
      <div id="progSubtitle" style="font-size:0.85rem;color:#7A6550;margin-bottom:20px;min-height:20px;">Daten werden verarbeitet…</div>
      <div style="background:#F3EDE3;border-radius:100px;height:12px;overflow:hidden;margin-bottom:12px;">
        <div id="progBar" style="height:100%;background:linear-gradient(90deg,#D98A2B,#B5701A);border-radius:100px;width:0%;transition:width 0.4s ease;"></div>
      </div>
      <div id="progPercent" style="font-size:0.8rem;color:#7A6550;">0 %</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;" class="adm-backup-layout">

    <!-- Backup erstellen & DB-Export -->
    <div>
      <div class="adm-card" style="margin-bottom:20px;">
        <h3 style="font-size:1rem;margin-bottom:14px;"><i class="fas fa-save" style="color:#D98A2B;margin-right:8px;"></i>Backup erstellen</h3>
        <div class="adm-form">
          <label>Bezeichnung <span style="font-weight:400;color:#7A6550;">(optional)</span></label>
          <input id="backupDesc" placeholder="z.B. Vor Update v2.1" style="width:100%;padding:8px 12px;border:1px solid #E8D9C5;border-radius:8px;font-size:0.9rem;background:white;color:#2C2018;margin-bottom:12px;">
          <button class="adm-btn adm-btn-primary" onclick="startBackup()"><i class="fas fa-save"></i> Backup jetzt erstellen</button>
        </div>
      </div>

      <div class="adm-card" style="margin-bottom:20px;">
        <h3 style="font-size:1rem;margin-bottom:14px;"><i class="fas fa-download" style="color:#4A9B7F;margin-right:8px;"></i>Datenbank exportieren</h3>

        <!-- JSON-Export -->
        <div style="background:linear-gradient(135deg,#FBF7F2,#F3EDE3);border:1.5px solid #D98A2B;border-radius:10px;padding:14px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <i class="fas fa-file-export" style="color:#D98A2B;"></i>
            <strong style="font-size:0.88rem;color:#2C2018;">Exportdatei für Updates</strong>
          </div>
          <p style="font-size:0.8rem;color:#7A6550;margin-bottom:10px;">
            Aktuelle Daten werden exportiert und können für Updates der Webseite verwendet werden, damit diese nicht überschrieben werden.
          </p>
          <a href="/admin/backup/json-export" class="adm-btn adm-btn-primary"><i class="fas fa-file-export"></i> Jetzt als JSON exportieren</a>
        </div>
      </div>

      <div class="adm-card">
        <h3 style="font-size:1rem;margin-bottom:14px;"><i class="fas fa-upload" style="color:#4A9B7F;margin-right:8px;"></i>JSON importieren</h3>
        <p style="font-size:0.83rem;color:#7A6550;margin-bottom:14px;">Zuvor exportierte JSON-Datei einspielen. <strong style="color:#8B1A1A;">Achtung:</strong> Alle vorhandenen Daten werden überschrieben!</p>
        <form method="POST" action="/admin/backup/json-import" enctype="multipart/form-data" class="adm-form" onsubmit="return confirm('Wirklich importieren? Alle aktuellen Daten werden überschrieben!')">
          <input type="file" name="jsonfile" accept=".json" required>
          <button type="submit" class="adm-btn adm-btn-danger" style="margin-top:10px;"><i class="fas fa-upload"></i> JSON jetzt importieren</button>
        </form>
      </div>
    </div>

    <!-- Backup-Liste -->
    <div class="adm-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <h3 style="font-size:1rem;"><i class="fas fa-history" style="color:#D98A2B;margin-right:8px;"></i>Gespeicherte Backups</h3>
        <span style="font-size:0.78rem;color:#7A6550;">${backups.length} / 25 Slots</span>
      </div>
      <div id="backupList">
      ${backups.length === 0
        ? '<p style="color:#7A6550;text-align:center;padding:24px 0;"><i class="fas fa-info-circle"></i> Noch keine Backups vorhanden.</p>'
        : `<div class="backup-list">${backupRows}</div>`}
      </div>
    </div>

  </div>

  <style>
    @media (max-width: 900px) { .adm-backup-layout { grid-template-columns: 1fr !important; } }
  </style>

  <script>
  // ─── Progress-Overlay Hilfsfunktionen ─────────────────────────
  function showProgress(title, subtitle) {
    document.getElementById('progressOverlay').style.display = 'flex';
    document.getElementById('progTitle').textContent = title;
    document.getElementById('progSubtitle').textContent = subtitle;
    document.getElementById('progBar').style.width = '0%';
    document.getElementById('progPercent').textContent = '0 %';
    document.getElementById('progIcon').innerHTML = '<i class="fas fa-cog fa-spin" style="color:#D98A2B;font-size:2.4rem;"></i>';
  }
  function updateProgress(pct, subtitle) {
    document.getElementById('progBar').style.width = pct + '%';
    document.getElementById('progPercent').textContent = Math.round(pct) + ' %';
    if (subtitle) document.getElementById('progSubtitle').textContent = subtitle;
  }
  function finishProgress(success, message) {
    updateProgress(100, '');
    var icon = document.getElementById('progIcon');
    var title = document.getElementById('progTitle');
    if (success) {
      icon.innerHTML = '<i class="fas fa-check-circle" style="color:#2D7A5E;font-size:2.4rem;"></i>';
      title.textContent = 'Erfolgreich!';
      title.style.color = '#2D7A5E';
    } else {
      icon.innerHTML = '<i class="fas fa-exclamation-circle" style="color:#8B1A1A;font-size:2.4rem;"></i>';
      title.textContent = 'Fehler';
      title.style.color = '#8B1A1A';
    }
    document.getElementById('progSubtitle').textContent = message;
    document.getElementById('progBar').style.background = success ? '#2D7A5E' : '#8B1A1A';
    setTimeout(function() {
      document.getElementById('progressOverlay').style.display = 'none';
      document.getElementById('progBar').style.background = 'linear-gradient(90deg,#D98A2B,#B5701A)';
      document.getElementById('progTitle').style.color = '#2C2018';
      if (success) location.reload();
    }, 2000);
  }

  // ─── Backup erstellen (AJAX) ───────────────────────────────────
  function startBackup() {
    var desc = document.getElementById('backupDesc').value;
    showProgress('Backup wird erstellt…', 'Datenbankinhalt wird gesichert…');
    var pct = 0;
    var interval = setInterval(function() {
      pct = Math.min(pct + 12, 85);
      updateProgress(pct, pct < 40 ? 'Tabellen werden gelesen…' : pct < 70 ? 'Daten werden komprimiert…' : 'Backup wird gespeichert…');
    }, 300);
    fetch('/admin/api/backup/create', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ description: desc })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      clearInterval(interval);
      if (data.ok) {
        finishProgress(true, '"' + data.name + '" gespeichert · ' + data.totalRows + ' Datensätze · ' + data.sizeKB + ' KB');
      } else {
        finishProgress(false, data.error || 'Unbekannter Fehler');
      }
    })
    .catch(function(err) {
      clearInterval(interval);
      finishProgress(false, 'Netzwerkfehler: ' + err.message);
    });
  }

  // ─── Backup wiederherstellen (AJAX) ───────────────────────────
  function startRestore(id, name, hasData) {
    if (!hasData) {
      alert('Dieses Backup enthält keine wiederherstellbaren Daten (zu altes Format).');
      return;
    }
    if (!confirm('Backup "' + name + '" wirklich wiederherstellen?\\n\\nAchtung: Aktuelle Daten werden durch den Backup-Stand ersetzt!')) return;
    showProgress('Backup wird wiederhergestellt…', 'Bitte warten – Datenbank wird zurückgesetzt…');
    var pct = 0;
    var interval = setInterval(function() {
      pct = Math.min(pct + 10, 82);
      updateProgress(pct, pct < 30 ? 'Backup-Daten werden gelesen…' : pct < 60 ? 'Tabellen werden geleert…' : 'Daten werden eingespielt…');
    }, 350);
    fetch('/admin/api/backup/' + id + '/restore', { method: 'POST' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      clearInterval(interval);
      if (data.ok) {
        finishProgress(true, '"' + data.backupName + '" wiederhergestellt · ' + data.restoredRows + ' Datensätze');
      } else {
        finishProgress(false, data.error || 'Unbekannter Fehler');
      }
    })
    .catch(function(err) {
      clearInterval(interval);
      finishProgress(false, 'Netzwerkfehler: ' + err.message);
    });
  }
  </script>`
  return c.html(adminLayout('Update &amp; Backup', body, 'backup'))
})

// ─── AJAX-API: Backup erstellen (JSON-Response für Fortschrittsbalken) ────
app.post('/admin/api/backup/create', async (c) => {
  try {
    const d = await c.req.json<{ description?: string }>().catch(() => ({}))
    const desc = d.description || ''
    const tables = ['settings','leistungen','kategorien','faqs','page_content','stellenangebote','testimonials']
    const dumpData: Record<string,any[]> = {}
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
      'INSERT INTO backups (name,description,size_bytes,type,dump_data) VALUES (?,?,?,?,?)'
    ).bind(name, desc, sizeBytes, 'manual', dumpJson).run()
    return c.json({ ok: true, name, totalRows, sizeKB: Math.round(sizeBytes/1024) })
  } catch (err: any) {
    return c.json({ ok: false, error: String(err?.message || err) }, 500)
  }
})

// Manuelles Backup erstellen (speichert DB-Snapshot als JSON in backups-Tabelle)
app.post('/admin/backup/create', async (c) => {
  const d = await c.req.parseBody()
  const desc = (d.description as string) || ''
  // DB-Dump als JSON serialisieren
  const tables = ['settings','leistungen','kategorien','faqs','page_content','stellenangebote','testimonials']
  const dumpData: Record<string,any[]> = {}
  for (const t of tables) {
    try {
      const { results } = await c.env.DB.prepare(`SELECT * FROM ${t}`).all<any>()
      dumpData[t] = results
    } catch {}
  }
  const dumpJson = JSON.stringify(dumpData)
  const sizeBytes = new TextEncoder().encode(dumpJson).length
  const now = new Date()
  const name = `Backup ${now.toLocaleDateString('de-DE')} ${now.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`
  const { results: existing } = await c.env.DB.prepare('SELECT id FROM backups ORDER BY created_at ASC').all<any>()
  if (existing.length >= 25) {
    await c.env.DB.prepare('DELETE FROM backups WHERE id=?').bind(existing[0].id).run()
  }
  await c.env.DB.prepare(
    'INSERT INTO backups (name,description,size_bytes,type,dump_data) VALUES (?,?,?,?,?)'
  ).bind(name, desc, sizeBytes, 'manual', dumpJson).run()
  return c.redirect('/admin/backup?msg=created')
})

// ─── AJAX-API: Backup wiederherstellen (JSON-Response für Fortschrittsbalken) ─
app.post('/admin/api/backup/:id/restore', async (c) => {
  try {
    const id = c.req.param('id')
    const backup = await c.env.DB.prepare('SELECT * FROM backups WHERE id=?').bind(id).first<any>()
    if (!backup) return c.json({ ok: false, error: 'Backup nicht gefunden.' }, 404)
    if (!backup.dump_data || backup.dump_data === '') {
      return c.json({ ok: false, error: 'Dieses Backup enthält keine wiederherstellbaren Daten (älteres Format ohne dump_data).' }, 400)
    }
    const dumpData: Record<string, any[]> = JSON.parse(backup.dump_data)
    const restorableTables = ['settings','leistungen','kategorien','faqs','page_content','stellenangebote','testimonials']
    let restoredRows = 0
    for (const table of restorableTables) {
      const rows = dumpData[table]
      if (!rows || rows.length === 0) continue
      try {
        // Tabelle leeren (außer settings – dort mergen wir)
        if (table !== 'settings') {
          await c.env.DB.prepare(`DELETE FROM ${table}`).run()
        }
        for (const row of rows) {
          const cols = Object.keys(row)
          const placeholders = cols.map(() => '?').join(', ')
          const vals = Object.values(row)
          if (table === 'settings') {
            await c.env.DB.prepare(
              `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})
               ON CONFLICT(key) DO UPDATE SET value=excluded.value`
            ).bind(...vals).run()
          } else {
            await c.env.DB.prepare(
              `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`
            ).bind(...vals).run()
          }
          restoredRows++
        }
      } catch {}
    }
    return c.json({ ok: true, restoredRows, backupName: backup.name })
  } catch (err: any) {
    return c.json({ ok: false, error: String(err?.message || err) }, 500)
  }
})

// Backup-Restore (Fallback: Formular-Submit-Route)
app.post('/admin/backup/:id/restore', async (c) => {
  try {
    const id = c.req.param('id')
    const backup = await c.env.DB.prepare('SELECT * FROM backups WHERE id=?').bind(id).first<any>()
    if (!backup || !backup.dump_data) return c.redirect('/admin/backup?msg=error')
    const dumpData: Record<string, any[]> = JSON.parse(backup.dump_data)
    const restorableTables = ['settings','leistungen','kategorien','faqs','page_content','stellenangebote','testimonials']
    for (const table of restorableTables) {
      const rows = dumpData[table]
      if (!rows || rows.length === 0) continue
      try {
        if (table !== 'settings') await c.env.DB.prepare(`DELETE FROM ${table}`).run()
        for (const row of rows) {
          const cols = Object.keys(row)
          const placeholders = cols.map(() => '?').join(', ')
          const vals = Object.values(row)
          if (table === 'settings') {
            await c.env.DB.prepare(
              `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) ON CONFLICT(key) DO UPDATE SET value=excluded.value`
            ).bind(...vals).run()
          } else {
            await c.env.DB.prepare(
              `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`
            ).bind(...vals).run()
          }
        }
      } catch {}
    }
    return c.redirect('/admin/backup?msg=restored')
  } catch {
    return c.redirect('/admin/backup?msg=error')
  }
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

// ─── JSON-Export: Alle Daten als JSON-Datei ───────────────────────────────────
app.get('/admin/backup/json-export', async (c) => {
  const tables = ['settings','leistungen','kategorien','faqs','page_content','stellenangebote','testimonials']
  const exportData: Record<string, any[]> = {}
  let totalRows = 0
  for (const table of tables) {
    try {
      const { results } = await c.env.DB.prepare(`SELECT * FROM ${table}`).all<any>()
      exportData[table] = results
      totalRows += results.length
    } catch { exportData[table] = [] }
  }
  const meta = {
    exported_at: new Date().toISOString(),
    total_rows: totalRows,
    tables: Object.keys(exportData),
    format: 'auxilium-json-v1',
    note: 'Auxilium Webseite – Exportierte Daten für Updates'
  }
  const output = JSON.stringify({ _meta: meta, data: exportData }, null, 2)
  const now = new Date()
  const filename = `auxilium-daten-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.json`
  return new Response(output, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
})

// ─── Backup als JSON herunterladen ────────────────────────────────────────────
app.get('/admin/backup/:id/download', async (c) => {
  const id = c.req.param('id')
  const backup = await c.env.DB.prepare('SELECT * FROM backups WHERE id=?').bind(id).first<any>()
  if (!backup || !backup.dump_data) {
    return c.text('Backup nicht gefunden oder keine Daten vorhanden.', 404)
  }
  // dump_data ist bereits JSON-String – hübsch formatiert ausgeben
  let pretty = backup.dump_data
  try { pretty = JSON.stringify(JSON.parse(backup.dump_data), null, 2) } catch {}
  const now = new Date(backup.created_at)
  const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
  const safeName = backup.name.replace(/[^a-z0-9äöü\-]/gi, '_').toLowerCase()
  const filename = `auxilium-backup-${dateStr}-${safeName}.json`
  return new Response(pretty, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
})

// ─── JSON-Import: JSON-Datei einspielen ──────────────────────────────────────
app.post('/admin/backup/json-import', async (c) => {
  try {
    const form = await c.req.parseBody()
    const file = form.jsonfile as File
    if (!file) return c.redirect('/admin/backup?msg=error')
    const raw = await file.text()
    let importData: any
    try { importData = JSON.parse(raw) } catch { return c.redirect('/admin/backup?msg=error') }
    // Unterstützt { data: { tabelle: [...] } } und direkt { tabelle: [...] }
    const tables = importData.data ?? importData
    const allowedTables = ['settings','leistungen','kategorien','faqs','page_content','stellenangebote','testimonials']
    let imported = 0
    for (const table of allowedTables) {
      if (!Array.isArray(tables[table]) || tables[table].length === 0) continue
      try {
        await c.env.DB.prepare(`DELETE FROM ${table}`).run()
        for (const row of tables[table]) {
          const cols = Object.keys(row)
          const placeholders = cols.map(() => '?').join(', ')
          const vals = Object.values(row)
          await c.env.DB.prepare(`INSERT OR IGNORE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`)
            .bind(...vals).run()
          imported++
        }
      } catch {}
    }
    // Auto-Backup-Slot-Verwaltung
    const { results: existing } = await c.env.DB.prepare('SELECT id FROM backups ORDER BY created_at ASC').all<any>()
    if (existing.length >= 25) {
      await c.env.DB.prepare('DELETE FROM backups WHERE id=?').bind(existing[0].id).run()
    }
    const now = new Date()
    const name = `Auto-Backup vor JSON-Import ${now.toLocaleDateString('de-DE')}`
    await c.env.DB.prepare('INSERT INTO backups (name,description,size_bytes,type) VALUES (?,?,?,?)')
      .bind(name, `Automatisch vor JSON-Import erstellt (${imported} Datensätze)`, 0, 'auto').run()
    return c.redirect('/admin/backup?msg=restored')
  } catch {
    return c.redirect('/admin/backup?msg=error')
  }
})

// ─── Media: Banner-Hintergrundbild aus KV ────────────────────
app.get('/media/banner-bg', async (c) => {
  try {
    // Korrekte KV-API: getWithMetadata gibt { value, metadata } zurück
    const result = await c.env.MEDIA.getWithMetadata<{ mime: string; uploadedAt: string }>('banner-bg', { type: 'arrayBuffer' })
    if (!result || result.value === null) return c.text('Not found', 404)
    const mime = result.metadata?.mime || 'image/jpeg'
    // Cache-Control: immutable wenn ?v= Parameter vorhanden (Cache-Buster)
    // Ohne Parameter: kein Cache (Fallback für direkte Aufrufe)
    const hasVersion = c.req.query('v')
    return new Response(result.value as ArrayBuffer, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': hasVersion
          ? 'public, max-age=31536000, immutable'  // Mit ?v=: 1 Jahr cachen – neue URL = neues Bild
          : 'no-store',                              // Ohne ?v=: nie cachen
        'Vary': 'Accept'
      }
    })
  } catch (e) {
    console.error('media/banner-bg error:', e)
    return c.text('Not found', 404)
  }
})

// ─── Barrierefreiheit ─────────────────────────────────────────
app.get('/barrierefreiheit', async (c) => {
  const S = await loadSettings(c.env.DB)
  // Datum der letzten inhaltlichen Prüfung – wird bei jedem Deploy automatisch gesetzt
  const pruefDatum = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const body = `
  ${pageHero('Rechtliches', 'Erklärung zur Barrierefreiheit', '', 'barrierefreiheit')}
  <main id="main-content" class="section">
    <div class="container" style="max-width:820px;">
      <div class="content-block" style="background:white;border-radius:16px;padding:40px 48px;box-shadow:0 2px 20px rgba(44,32,24,0.07);">
        <h1 style="font-size:1.6rem;margin-bottom:6px;">Erklärung zur Barrierefreiheit</h1>
        <p style="font-size:0.85rem;color:#7A6550;margin-bottom:32px;">Gemäß EU-Richtlinie 2016/2102, BITV 2.0 und BGG &middot; Stand: ${pruefDatum}</p>

        <h2 style="font-size:1.15rem;margin-top:32px;margin-bottom:10px;">1. Geltungsbereich</h2>
        <p>Diese Erklärung zur Barrierefreiheit gilt für die Website <strong>auxilium-forst.de</strong> (Auxilium – Pflegeberatung Kristina Bronner, Forst (Baden)).</p>

        <h2 style="font-size:1.15rem;margin-top:32px;margin-bottom:10px;">2. Stand der Vereinbarkeit mit den Anforderungen</h2>
        <p>Diese Website ist <strong>teilweise konform</strong> mit den Anforderungen der EU-Richtlinie 2016/2102 und der BITV 2.0 (Barrierefreie-Informationstechnik-Verordnung). Die bekannten Einschränkungen sind nachfolgend aufgeführt.</p>

        <h2 style="font-size:1.15rem;margin-top:32px;margin-bottom:10px;">3. Nicht barrierefreie Inhalte</h2>
        <p>Folgende Inhalte oder Bereiche sind noch nicht vollständig barrierefrei:</p>
        <ul style="margin:10px 0 10px 20px;line-height:1.8;">
          <li>Ältere PDF-Dokumente können möglicherweise keine ausreichenden Alternativtexte enthalten.</li>
          <li>Dynamisch animierte Statistikzahlen (Counter-Effekt) sind für Screenreader als statischer Text hinterlegt – die Animation selbst ist für assistive Technologien nicht wahrnehmbar, der Inhalt bleibt jedoch zugänglich.</li>
          <li>Komplexe Datentabellen in Ratgeber-Artikeln (z. B. Pflegegrad-Übersicht) sind mit <code>scope</code>-Attributen ausgezeichnet; eine vollständige Zugänglichkeit bei allen assistiven Technologien kann nicht in jedem Fall garantiert werden.</li>
        </ul>

        <h2 style="font-size:1.15rem;margin-top:32px;margin-bottom:10px;">4. Umgesetzte Barrierefreiheitsmaßnahmen</h2>
        <ul style="margin:10px 0 10px 20px;line-height:1.8;">
          <li>Semantisches HTML5 mit korrekter Überschriftenhierarchie (H1–H6) auf allen Seiten</li>
          <li>Skip-Link „Zum Hauptinhalt springen" am Seitenstart (sichtbar bei Tastaturfokus)</li>
          <li>ARIA-Landmarks und Rollen: <code>main</code>, <code>nav</code>, <code>footer</code>, <code>region</code>, <code>dialog</code>, <code>alertdialog</code></li>
          <li><code>aria-label</code> für alle Navigations- und Regionsrollen</li>
          <li><code>aria-expanded</code> und <code>aria-controls</code> auf dem mobilen Hamburger-Menü-Button</li>
          <li><code>aria-current="page"</code> im Breadcrumb zur Kennzeichnung der aktuellen Seite</li>
          <li>Akkordeon-FAQs mit <code>aria-expanded</code> und <code>aria-controls</code> für Panel-Verknüpfung</li>
          <li>Statistik-Bereich als <code>dl</code>-Liste (Definitionsliste) mit semantisch verknüpften Begriff-Wert-Paaren</li>
          <li>Feature-Leiste als semantisch korrekte <code>ul</code>/<code>li</code>-Liste statt generischer <code>div</code>-Elemente</li>
          <li>Tabellen in Ratgeber-Artikeln mit <code>scope="col"</code> auf Spaltenüberschriften</li>
          <li>Alle externen Links (<code>target="_blank"</code>) mit <code>rel="noopener noreferrer"</code> und Screen-Reader-Hinweis „öffnet in neuem Tab" (<code>.sr-only</code>)</li>
          <li>Testimonials-Slideshow mit <code>aria-live="polite"</code> und <code>aria-label</code> auf Steuerungselementen</li>
          <li>Tastaturnavigation für alle interaktiven Elemente</li>
          <li>Sichtbare Fokus-Indikatoren für Tastaturnutzer (<code>:focus-visible</code>)</li>
          <li>Alle dekorativen Icons mit <code>aria-hidden="true"</code> markiert</li>
          <li>Alternativtexte für alle inhaltlichen Bilder (Produktfotos, Porträts, Ratgeber-Bilder)</li>
          <li>Sternebewertungen in Testimonials mit <code>aria-label</code> (z. B. „5 von 5 Sternen")</li>
          <li>Ausreichende Farbkontraste gemäß WCAG 2.1 Level AA</li>
          <li>Responsive Design für verschiedene Endgeräte und Zoomstufen bis 200 %</li>
          <li>Sprachattribut <code>lang="de"</code> im HTML-Element</li>
          <li>Modale Dialoge (Cookie-Banner, Info-Banner) mit ARIA-Attributen (<code>role="dialog"</code>, <code>aria-modal</code>, <code>aria-labelledby</code>) und ESC-Taste schließbar</li>
          <li>Schriftgrößen ausschließlich in relativen Einheiten (rem/em) – Browserzooming funktioniert korrekt</li>
          <li><code>.sr-only</code>-Hilfsklasse für visuell versteckten, für Screenreader zugänglichen Text</li>
        </ul>

        <h2 style="font-size:1.15rem;margin-top:32px;margin-bottom:10px;">5. Erstellung dieser Erklärung</h2>
        <p>Diese Erklärung wurde auf Grundlage einer Selbstbewertung erstellt und zuletzt am <strong>${pruefDatum}</strong> überprüft und aktualisiert. Sie wird automatisch bei inhaltlichen Änderungen der Website aktualisiert.</p>

        <h2 style="font-size:1.15rem;margin-top:32px;margin-bottom:10px;">6. Feedback und Kontaktangaben</h2>
        <p>Wenn Sie Mängel in Bezug auf die barrierefreie Gestaltung unserer Website feststellen, nehmen Sie gerne Kontakt mit uns auf:</p>
        <address style="font-style:normal;margin:14px 0 14px 20px;line-height:2;">
          <strong>Auxilium – Kristina Bronner</strong><br>
          c/o Autorenglück #91926<br>
          Albert-Einstein-Str. 47<br>
          02977 Hoyerswerda<br>
          <br>
          <strong>Telefon:</strong> <a href="tel:+4915751559177" style="color:var(--primary);">01575 – 1559177</a><br>
          <strong>E-Mail:</strong> <a href="mailto:auxilium-bronner@web.de" style="color:var(--primary);">auxilium-bronner@web.de</a>
        </address>
        <p>Wir bemühen uns, auf Rückmeldungen innerhalb von 10 Werktagen zu reagieren.</p>

        <h2 style="font-size:1.15rem;margin-top:32px;margin-bottom:10px;">7. Durchsetzungsverfahren</h2>
        <p>Sollten Sie auf Ihre Mitteilung keine zufriedenstellende Antwort erhalten haben, können Sie sich an die zuständige Durchsetzungsstelle wenden:</p>
        <p style="margin-top:10px;">
          <strong>Schlichtungsstelle nach dem Behindertengleichstellungsgesetz (BGG)</strong><br>
          Beauftragter der Bundesregierung für die Belange von Menschen mit Behinderungen<br>
          Mauerstraße 53, 10117 Berlin<br>
          E-Mail: <a href="mailto:info@schlichtungsstelle-bgg.de" style="color:var(--primary);">info@schlichtungsstelle-bgg.de</a><br>
          Web: <a href="https://www.schlichtungsstelle-bgg.de" target="_blank" rel="noopener noreferrer" style="color:var(--primary);">www.schlichtungsstelle-bgg.de</a>
        </p>
      </div>
    </div>
  </main>`
  return c.html(layout('Barrierefreiheit – Auxilium Pflegeberatung Forst', 'Erklärung zur Barrierefreiheit gemäß EU-Richtlinie 2016/2102, BITV 2.0 und BGG für die Website Auxilium Pflegeberatung Forst Baden.', body, S))
})

// ─── Sitemap.xml ──────────────────────────────────────────────
app.get('/sitemap.xml', async (c) => {
  const base = 'https://auxilium-forst.de'
  const now  = new Date().toISOString().split('T')[0]
  const staticUrls = [
    { loc: '/',               changefreq: 'weekly',  priority: '1.0' },
    { loc: '/ueber-auxilium', changefreq: 'monthly', priority: '0.8' },
    { loc: '/leistungen',     changefreq: 'monthly', priority: '0.9' },
    { loc: '/beratung',       changefreq: 'monthly', priority: '0.8' },
    { loc: '/ratgeber',       changefreq: 'weekly',  priority: '0.8' },
    { loc: '/stellenangebote',changefreq: 'weekly',  priority: '0.7' },
    { loc: '/kontakt',        changefreq: 'monthly', priority: '0.8' },
    { loc: '/impressum',      changefreq: 'yearly',  priority: '0.3' },
    { loc: '/datenschutz',    changefreq: 'yearly',  priority: '0.3' },
  ]
  // Statische Ratgeber-Slugs
  const ratgeberSlugs = [
    'verhinderungspflege-richtig-nutzen',
    'pflegegrade-erklaert',
    'pflege-zuhause-statt-pflegeheim',
    'entlastungsbetrag-131-euro-nutzen',
    'pflegende-angehoerige-selbst-schuetzen',
  ]
  let dbSlugs: string[] = []
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT slug FROM ratgeber WHERE active=1'
    ).all<any>()
    dbSlugs = results.map((r: any) => r.slug)
  } catch (_) {}
  const ratgeberUrls = [...ratgeberSlugs, ...dbSlugs].map(slug => ({
    loc: `/ratgeber/${slug}`, changefreq: 'monthly', priority: '0.7'
  }))
  const plzUrls = [
    'forst-76694','bruchsal-76646','hambruecken-76707',
    'karlsdorf-neuthard-76689','oestringen-76684','ubstadt-weiher-76698',
    'bad-schoenborn-76669','kraichtal-76703','kronau-76709',
    'waghausel-68753','philippsburg-76661','graben-neudorf-76676'
  ].map(s => ({ loc: `/pflege/${s}`, changefreq: 'monthly', priority: '0.6' }))
  const all = [...staticUrls, ...ratgeberUrls, ...plzUrls]
  const entries = all.map(u =>
    `  <url>\n    <loc>${base}${u.loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  ).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400' }
  })
})

// ─── robots.txt ───────────────────────────────────────────────
app.get('/robots.txt', (c) => {
  const txt = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://auxilium-forst.de/sitemap.xml\n`
  return new Response(txt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' }
  })
})

// ═══════════════════════════════════════════════════════════════
// RATGEBER / BLOG – 5 statische SEO-Artikel
// ═══════════════════════════════════════════════════════════════

const RATGEBER_ARTICLES: Array<{slug:string;title:string;meta_desc:string;category:string;intro:string;lead?:string;content:string}> = [
  {
    slug: 'verhinderungspflege-richtig-nutzen',
    title: 'Verhinderungspflege richtig nutzen – bis zu 3.386 Euro Anspruch sichern',
    meta_desc: 'Verhinderungspflege 2025: Was ist erlaubt, wie beantragen, wie viel bekomme ich? Auxilium Forst Baden erklärt alle Möglichkeiten und hilft bei der Abrechnung über die Pflegekasse.',
    category: 'Pflegefinanzierung',
    intro: 'Wie Sie bis zu 3.386 Euro jährlich für Ihre Entlastung nutzen – einfach erklärt von Auxilium Forst (Baden).',
    lead: 'Wenn die Hauptpflegeperson krank wird, Urlaub braucht oder einfach eine Pause verdient, greift die Verhinderungspflege – eine gesetzliche Leistung der Pflegekasse, die viele Familien kaum kennen. Ab Pflegegrad 2 und nach sechs Monaten Vorpflegezeit stehen Ihnen bis zu 1.612 Euro pro Jahr zur Verfügung, die sich durch Umwidmung des Kurzzeitpflegebudgets auf bis zu 3.386 Euro aufstocken lassen. Kristina Bronner von Auxilium erklärt Ihnen, welche Voraussetzungen gelten, wie Sie den Antrag stellen und wie Sie das Budget über das Jahr optimal einsetzen.',
    content: `
<figure style="margin:0 0 32px;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.10);">
  <div class="ai-figure-wrap">
    <picture>
      <source srcset="/static/ratgeber-verhinderungspflege.webp" type="image/webp">
      <img src="/static/ratgeber-verhinderungspflege.jpg" alt="Pflegekraft hält Seniorin einfühlsam die Hand – Verhinderungspflege durch Auxilium in Forst Baden" width="820" height="420" loading="lazy" style="width:100%;height:420px;object-fit:cover;display:block;">
    </picture>
    <img src="/static/ai-generated-badge.png" alt="KI-generiertes Bild" class="ai-badge">
  </div>
  <figcaption style="font-size:0.8rem;color:var(--text-light);padding:8px 12px;background:#FBF7F2;">Professionelle Verhinderungspflege: Auxilium übernimmt, wenn die Hauptpflegeperson eine Auszeit braucht.</figcaption>
</figure>

<h2>Was ist Verhinderungspflege? – Definition und gesetzliche Grundlage</h2>
<p>Die <strong>Verhinderungspflege</strong> (§ 39 SGB XI) ist eine Leistung der gesetzlichen Pflegeversicherung, die greift, wenn die Hauptpflegeperson vorübergehend verhindert ist – sei es durch Urlaub, Krankheit, Kur oder andere persönliche Gründe. In diesem Fall übernimmt die Pflegekasse die Kosten einer Ersatzpflegeperson. Für Familien in Forst (Baden) und der Umgebung von Hoyerswerda ist das häufig der erste Schritt, professionelle Pflege durch Auxilium in Anspruch zu nehmen.</p>
<p>Voraussetzung ist ein anerkannter <strong>Pflegegrad ab 2</strong> sowie eine Vorpflegezeit von mindestens <strong>6 Monaten</strong> durch die Hauptpflegeperson. Sobald diese Bedingungen erfüllt sind, steht Ihnen das Budget jährlich zur Verfügung – unabhängig davon, ob Sie es im Vorjahr genutzt haben.</p>

<h2>Wie viel Geld steht mir bei Verhinderungspflege 2025 zu?</h2>
<p>Das Verhinderungspflegebudget beträgt <strong>1.612 Euro pro Kalenderjahr</strong>. Doch viele Familien wissen nicht, dass sie diesen Betrag um das halbe Kurzzeitpflege-Budget aufstocken können:</p>
<div style="background:#FBF7F2;border-radius:12px;padding:24px 28px;margin:24px 0;">
  <h3 style="font-size:1.05rem;margin:0 0 16px;color:var(--primary);">Maximales Verhinderungspflege-Budget 2025</h3>
  <ul style="list-style:none;padding:0;margin:0;display:grid;gap:10px;">
    <li style="display:flex;align-items:center;gap:10px;"><span style="background:var(--accent);color:white;border-radius:6px;padding:3px 10px;font-weight:700;min-width:130px;text-align:center;">1.612 €/Jahr</span><span>Grundbudget Verhinderungspflege (§ 39 SGB XI)</span></li>
    <li style="display:flex;align-items:center;gap:10px;"><span style="background:var(--primary);color:white;border-radius:6px;padding:3px 10px;font-weight:700;min-width:130px;text-align:center;">+ 1.774 €</span><span>Halbes Kurzzeitpflege-Budget übertragbar (§ 42 SGB XI)</span></li>
    <li style="display:flex;align-items:center;gap:10px;border-top:2px solid var(--accent);padding-top:12px;"><span style="background:#2C6E49;color:white;border-radius:6px;padding:3px 10px;font-weight:700;min-width:130px;text-align:center;">= 3.386 €</span><span><strong>Gesamtpotenzial pro Jahr</strong></span></li>
  </ul>
</div>
<p>Diese Kombination ist bei vielen Familien unbekannt. In der <strong>persönlichen Erstberatung</strong> klärt Kristina Bronner von Auxilium genau, welche Beträge Ihnen zustehen und wie Sie diese vollständig ausschöpfen.</p>

<h2>Wer darf Verhinderungspflege durchführen? – Und warum Auxilium?</h2>
<p>Als Ersatzpflegeperson kommen grundsätzlich in Frage:</p>
<ul>
  <li>Ambulante Pflegedienste (Sachleistungs-Budget)</li>
  <li>Nahestehende Personen (Freunde, Bekannte, entfernte Verwandte)</li>
  <li><strong>Selbstständige Pflegepersonen wie Auxilium</strong> – anerkannt und abrechnungsfähig</li>
</ul>
<p>Wichtig: Auxilium ist als <strong>anerkannte Verhinderungspflegeperson</strong> registriert. Das bedeutet, Sie können die professionelle Betreuung durch Kristina Bronner direkt über die Pflegekasse abrechnen lassen – ohne umständliche Bürokratie, die Auxilium für Sie übernimmt.</p>

<h3>Welche Leistungen umfasst Verhinderungspflege durch Auxilium?</h3>
<p>Im Rahmen der Verhinderungspflege durch Auxilium erhalten Pflegebedürftige in Forst Baden und Umgebung folgende Unterstützung:</p>
<ul>
  <li><strong>Körperpflege:</strong> Waschen, Ankleiden, Mundpflege, Rasur</li>
  <li><strong>Mobilisation:</strong> Transfers, Lagerungswechsel, Gehübungen</li>
  <li><strong>Betreuung &amp; kognitive Aktivierung:</strong> Gespräche, Vorlesen, Spiele, Spaziergänge</li>
  <li><strong>Hauswirtschaftliche Versorgung:</strong> Kochen, Einkaufen, Reinigung, Wäsche</li>
  <li><strong>Begleitung:</strong> Arztbesuche, Behördengänge, Freizeitaktivitäten</li>
  <li><strong>Nachtbetreuung</strong> nach individueller Absprache</li>
</ul>

<h2>Wie beantrage ich Verhinderungspflege – Schritt für Schritt?</h2>
<p>Der Antragsprozess ist einfacher als viele denken. Auxilium unterstützt Sie dabei vollständig:</p>
<ol style="padding-left:20px;line-height:2;">
  <li>Formular „Antrag auf Verhinderungspflege" bei Ihrer Pflegekasse anfordern (oder online herunterladen)</li>
  <li>Zeitraum und Art der Verhinderung angeben</li>
  <li>Nachweis der Verhinderung (z.B. Reisebuchung, Krankschreibung) beilegen</li>
  <li>Rechnung der Ersatzpflegeperson (Auxilium) einreichen</li>
  <li>Erstattung erfolgt direkt an die Pflegeperson oder an Sie</li>
</ol>
<p>Auxilium erstellt alle notwendigen Rechnungsunterlagen und begleitet Sie durch den Antragsprozess – so dass Sie sich ganz auf Ihre Auszeit konzentrieren können.</p>

<h2>Häufige Fragen zur Verhinderungspflege</h2>
<h3>Kann ich Verhinderungspflege für mehrstündige Betreuung täglich nutzen?</h3>
<p>Ja. Verhinderungspflege kann stundenweise, tageweise oder für mehrere Wochen in Anspruch genommen werden. Auch eine tägliche Betreuung über einen längeren Zeitraum ist möglich, solange das Budget reicht.</p>
<h3>Darf die Hauptpflegeperson während der Verhinderungspflege im selben Haushalt sein?</h3>
<p>Nein – die Hauptpflegeperson muss tatsächlich verhindert sein. Bei Urlaub oder Krankheit ist dies klar gegeben. Eine gleichzeitige Anwesenheit würde den Anspruch gefährden.</p>
<h3>Was passiert mit nicht genutztem Budget am Jahresende?</h3>
<p>Nicht verbrauchtes Verhinderungspflege-Budget verfällt mit dem Jahresende. Es empfiehlt sich, das Budget über das Jahr verteilt zu nutzen. Im Gegensatz dazu kann der <a href="/ratgeber/entlastungsbetrag-131-euro-nutzen" style="color:var(--accent);">Entlastungsbetrag (131 €/Monat)</a> bis zum 30. Juni des Folgejahres übertragen werden.</p>

<blockquote style="border-left:4px solid var(--primary);padding:16px 24px;background:#FBF7F2;border-radius:0 10px 10px 0;margin:32px 0;">
  <p style="margin:0 0 8px;font-style:italic;font-size:1.05rem;">„Viele unserer Familien wussten beim ersten Gespräch nicht, dass ihnen jährlich über 3.000 Euro zustehen. Dieses Geld gehört Ihnen – wir helfen dabei, es auch zu nutzen."</p>
  <cite style="font-size:0.85rem;color:var(--text-light);display:block;">– Kristina Bronner, Auxilium Pflegeberatung Forst Baden</cite>
</blockquote>

<h2>Verhinderungspflege in Forst (Baden) und Umgebung – Auxilium ist für Sie da</h2>
<p>Auxilium betreut Pflegebedürftige in <strong>Forst (Baden), Bruchsal, Bretten, Karlsruhe</strong> und der gesamten Region. Als zuverlässige und erfahrene Pflegeperson kennt Kristina Bronner die lokalen Pflegekassen und deren Anforderungen genau. Das erleichtert die Abrechnung und sorgt für schnelle Erstattungen.</p>
<p>Vereinbaren Sie jetzt Ihre <strong>persönliche Erstberatung</strong> – wir klären gemeinsam, welche Leistungen Ihnen zustehen und wie Auxilium Ihnen konkret helfen kann.</p>
<p style="margin-top:24px;"><a href="/beratung" style="color:var(--accent);font-weight:700;font-size:1.05rem;">Persönliche Erstberatung vereinbaren →</a></p>`
  },
  {
    slug: 'pflegegrade-erklaert',
    title: 'Pflegegrade 1 bis 5 einfach erklärt – Voraussetzungen, Leistungen und MDK-Begutachtung',
    meta_desc: 'Pflegegrade 1 bis 5 einfach erklärt: Voraussetzungen, Begutachtung durch den MDK, Geldbeträge und Leistungen. Auxilium Forst Baden hilft beim Antrag und beim Widerspruch.',
    category: 'Pflegegrundlagen',
    intro: 'Pflegegrade 1 bis 5 verständlich erklärt – Voraussetzungen, MDK-Begutachtung und Leistungen auf einen Blick.',
    lead: 'Seit der Pflegereform 2017 entscheiden fünf Pflegegrade darüber, welche Leistungen die Pflegekasse übernimmt – von 332 Euro Pflegegeld monatlich bei Pflegegrad 2 bis zu 947 Euro bei Pflegegrad 5. Grundlage ist nicht mehr der körperliche Zeitaufwand, sondern die Selbstständigkeit in sechs Lebensbereichen, die ein Gutachter des Medizinischen Dienstes in einem Hausbesuch bewertet. Was viele nicht wissen: Mit der richtigen Vorbereitung auf den MD-Besuch lässt sich die Einstufung deutlich verbessern – und bei einer zu niedrigen Einstufung können Familien innerhalb von vier Wochen Widerspruch einlegen.',
    content: `
<figure style="margin:0 0 32px;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.10);">
  <div class="ai-figure-wrap">
    <picture>
      <source srcset="/static/ratgeber-pflegegrade.webp" type="image/webp">
      <img src="/static/ratgeber-pflegegrade.jpg" alt="Pflegeberaterin bespricht Pflegegrad-Unterlagen mit älterem Ehepaar – persönliche Erstberatung bei Auxilium Forst Baden" width="820" height="420" loading="lazy" style="width:100%;height:420px;object-fit:cover;display:block;">
    </picture>
    <img src="/static/ai-generated-badge.png" alt="KI-generiertes Bild" class="ai-badge">
  </div>
  <figcaption style="font-size:0.8rem;color:var(--text-light);padding:8px 12px;background:#FBF7F2;">Der richtige Pflegegrad entscheidet über Ihren Leistungsanspruch – Auxilium begleitet Sie durch den gesamten Begutachtungsprozess.</figcaption>
</figure>

<h2>Was sind Pflegegrade? – Das neue System seit 2017</h2>
<p>Seit der Pflegereform 2017 werden Pflegebedürftige nicht mehr in Pflegestufen, sondern in <strong>5 Pflegegrade</strong> eingestuft. Der entscheidende Unterschied zum alten System: Es wird nicht mehr der körperliche Hilfebedarf in Minuten gemessen, sondern die <strong>Selbstständigkeit und Fähigkeiten der Person</strong> in verschiedenen Lebensbereichen bewertet. Das bedeutet: Auch Menschen mit psychischen Erkrankungen, Demenz oder kognitiven Einschränkungen erhalten nun angemessene Leistungen.</p>
<p>Die Einstufung nehmen Gutachter des <strong>Medizinischen Dienstes (MD, früher MDK)</strong> oder von MEDICPROOF (für privat Versicherte) vor. Sie besuchen die pflegebedürftige Person zu Hause und bewerten 6 Lebensbereiche.</p>

<h2>Die 6 Begutachtungsbereiche des Pflegegrads</h2>
<p>Die Gutachter bewerten Selbstständigkeit und Fähigkeiten in diesen Modulen:</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin:20px 0;">
  ${['Mobilität (z.B. Treppensteigen, Fortbewegen)', 'Kognition &amp; Kommunikation (Orientierung, Entscheidungen)', 'Verhaltensweisen &amp; psychische Problemlagen', 'Selbstversorgung (Körperpflege, Essen, Anziehen)', 'Umgang mit krankheitsbedingten Anforderungen', 'Alltagsleben &amp; soziale Kontakte'].map((m,i)=>`<div style="background:#FBF7F2;border-radius:10px;padding:14px 16px;display:flex;gap:10px;align-items:flex-start;"><span style="background:var(--primary);color:white;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;flex-shrink:0;">${i+1}</span><span style="font-size:0.9rem;">${m}</span></div>`).join('')}
</div>
<p>Jedes Modul wird mit einem bestimmten Gewicht in den Gesamtpunktwert eingerechnet. Besonders stark gewichtet sind Selbstversorgung (36 %) und Verhaltensweisen (15 %). Aus dem Gesamtpunktwert ergibt sich dann der Pflegegrad.</p>

<h2>Die 5 Pflegegrade 2025 im Überblick – Leistungen und Beträge</h2>
<table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:0.88rem;box-shadow:0 2px 12px rgba(0,0,0,0.07);border-radius:10px;overflow:hidden;">
  <thead>
    <tr style="background:var(--primary);color:white;">
      <th scope="col" style="padding:12px 14px;text-align:left;">Pflegegrad</th>
      <th scope="col" style="padding:12px 14px;text-align:left;">Punkte</th>
      <th scope="col" style="padding:12px 14px;text-align:left;">Pflegegeld</th>
      <th scope="col" style="padding:12px 14px;text-align:left;">Sachleistung</th>
      <th scope="col" style="padding:12px 14px;text-align:left;">Entlastungsbetrag</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #E8D9C5;">
      <td style="padding:11px 14px;"><strong>PG 1</strong> – Geringe Beeinträcht.</td>
      <td style="padding:11px 14px;">12,5–26,9</td>
      <td style="padding:11px 14px;">–</td>
      <td style="padding:11px 14px;">–</td>
      <td style="padding:11px 14px;color:#2C6E49;font-weight:600;">131 €/Mon.</td>
    </tr>
    <tr style="border-bottom:1px solid #E8D9C5;background:#FBF7F2;">
      <td style="padding:11px 14px;"><strong>PG 2</strong> – Erhebliche Beeintr.</td>
      <td style="padding:11px 14px;">27–47,4</td>
      <td style="padding:11px 14px;font-weight:600;">332 €/Mon.</td>
      <td style="padding:11px 14px;font-weight:600;">761 €/Mon.</td>
      <td style="padding:11px 14px;color:#2C6E49;font-weight:600;">131 €/Mon.</td>
    </tr>
    <tr style="border-bottom:1px solid #E8D9C5;">
      <td style="padding:11px 14px;"><strong>PG 3</strong> – Schwere Beeinträcht.</td>
      <td style="padding:11px 14px;">47,5–69,9</td>
      <td style="padding:11px 14px;font-weight:600;">573 €/Mon.</td>
      <td style="padding:11px 14px;font-weight:600;">1.432 €/Mon.</td>
      <td style="padding:11px 14px;color:#2C6E49;font-weight:600;">131 €/Mon.</td>
    </tr>
    <tr style="border-bottom:1px solid #E8D9C5;background:#FBF7F2;">
      <td style="padding:11px 14px;"><strong>PG 4</strong> – Schwerste Beeintr.</td>
      <td style="padding:11px 14px;">70–89,9</td>
      <td style="padding:11px 14px;font-weight:600;">765 €/Mon.</td>
      <td style="padding:11px 14px;font-weight:600;">1.778 €/Mon.</td>
      <td style="padding:11px 14px;color:#2C6E49;font-weight:600;">131 €/Mon.</td>
    </tr>
    <tr>
      <td style="padding:11px 14px;"><strong>PG 5</strong> – Schwerste + bes. Anforderungen</td>
      <td style="padding:11px 14px;">90–100</td>
      <td style="padding:11px 14px;font-weight:600;">947 €/Mon.</td>
      <td style="padding:11px 14px;font-weight:600;">2.200 €/Mon.</td>
      <td style="padding:11px 14px;color:#2C6E49;font-weight:600;">131 €/Mon.</td>
    </tr>
  </tbody>
</table>
<p style="font-size:0.82rem;color:var(--text-light);">* Beträge gelten ab 2025. Zusätzlich stehen Verhinderungspflege, Kurzzeitpflege und weitere Leistungen zur Verfügung.</p>

<h2>Wie läuft die MDK-Begutachtung ab? – Was Sie erwarten können</h2>
<p>Die Begutachtung findet in der Regel zu Hause statt und dauert etwa 45 bis 90 Minuten. Der Gutachter beobachtet und befragt die pflegebedürftige Person sowie ggf. Angehörige. Wichtig: Sie müssen nicht alles zeigen, was die Person noch kann – sondern was sie <strong>nicht mehr sicher und selbstständig</strong> kann.</p>
<h3>Tipps zur Vorbereitung auf den MDK-Besuch</h3>
<ul>
  <li>Pflegetagebuch führen: Notieren Sie täglich, welche Hilfen benötigt werden (inkl. Zeitaufwand)</li>
  <li>Alle Diagnosen, Medikamente und Arztberichte bereitlegen</li>
  <li>Hilfsmittel sichtbar lassen (Rollator, Haltegriffe etc.)</li>
  <li>An einem schlechten Tag begutachten lassen, wenn möglich</li>
  <li>Angehörige als Unterstützung hinzuziehen</li>
</ul>
<p>Auxilium bereitet Sie und Ihre Angehörigen gezielt auf das Gutachter-Gespräch vor. In der <strong>persönlichen Erstberatung</strong> klären wir gemeinsam, welche Punkte besonders wichtig sind und wie Sie Ihren tatsächlichen Hilfebedarf überzeugend schildern.</p>

<h2>Was tun, wenn der Pflegegrad zu niedrig eingestuft wurde?</h2>
<p>Viele Familien sind mit dem ersten Gutachtensergebnis unzufrieden. Das ist keine Seltenheit: Studien zeigen, dass ein erheblicher Teil der Bescheide nach Widerspruch angehoben wird. Sie haben das Recht, innerhalb von <strong>4 Wochen nach Bescheiddatum</strong> Widerspruch einzulegen.</p>
<p>Auxilium unterstützt Sie beim <strong>Widerspruchsverfahren</strong>: Wir analysieren den Gutachtenbericht, identifizieren nicht berücksichtigte Einschränkungen und formulieren einen fundierten Widerspruch. Unsere Erfahrung zeigt: Mit einer guten Begründung sind höhere Einstufungen deutlich wahrscheinlicher.</p>

<h2>Pflegegrad-Antrag stellen – so geht es konkret</h2>
<ol style="padding-left:20px;line-height:2.2;">
  <li>Antrag bei der Pflegekasse stellen (formlos reicht – per Telefon, Brief oder online)</li>
  <li>Pflegekasse beauftragt den MD/MDK mit der Begutachtung</li>
  <li>Begutachtungstermin vereinbaren (innerhalb von 25 Arbeitstagen)</li>
  <li>Gutachten wird erstellt und an Pflegekasse weitergeleitet</li>
  <li>Bescheid erhalten – bei Bedarf Widerspruch einlegen</li>
</ol>

<blockquote style="border-left:4px solid var(--primary);padding:16px 24px;background:#FBF7F2;border-radius:0 10px 10px 0;margin:32px 0;">
  <p style="margin:0 0 8px;font-style:italic;font-size:1.05rem;">„Der Pflegegrad entscheidet über tausende Euro an Leistungen jährlich. Mit der richtigen Vorbereitung ist eine faire Einstufung erreichbar – dabei begleite ich Sie gerne."</p>
  <cite style="font-size:0.85rem;color:var(--text-light);display:block;">– Kristina Bronner, Auxilium Pflegeberatung Forst Baden</cite>
</blockquote>

<h2>Pflegegrad beantragen in Forst (Baden) – Auxilium begleitet Sie</h2>
<p>Als erfahrene Pflegeberaterin in der Region Forst (Baden), Bruchsal und Karlsruhe kennt Kristina Bronner von Auxilium die lokalen Pflegekassen und deren Begutachtungspraxis. Die <strong>persönliche Erstberatung</strong> gibt Ihnen Klarheit über Ihre Situation und die nächsten konkreten Schritte.</p>
<p style="margin-top:24px;"><a href="/kontakt" style="color:var(--accent);font-weight:700;font-size:1.05rem;">Persönliche Erstberatung zum Pflegegrad anfragen →</a></p>`
  },
  {
    slug: 'pflege-zuhause-statt-pflegeheim',
    title: 'Pflege zu Hause statt Pflegeheim – Was es kostet, was es braucht und wie Auxilium hilft',
    meta_desc: 'Häusliche Pflege statt Pflegeheim: Vorteile, tatsächliche Kosten 2025, Finanzierung über Pflegekasse und wie Auxilium in Forst Baden die professionelle Betreuung zu Hause organisiert.',
    category: 'Häusliche Pflege',
    intro: 'Was häusliche Pflege wirklich kostet, wie sie finanziert wird und wie Auxilium in Forst (Baden) sie professionell organisiert.',
    lead: 'Die eigenen vier Wände zu verlassen ist für die meisten pflegebedürftigen Menschen keine Wahl, sondern ein Verlust. Dabei zeigen Studien: Wer in vertrauter Umgebung gepflegt wird, hat eine höhere Lebensqualität, leidet seltener an Depressionen und entwickelt kognitiv besser. Die häusliche Pflege ist zudem in vielen Fällen günstiger als ein Pflegeheim – denn während stationäre Eigenanteile 2025 oft über 2.400 Euro monatlich liegen, lässt sich die Betreuung durch Auxilium häufig vollständig oder überwiegend über Pflegegeld, Verhinderungspflege und den Entlastungsbetrag finanzieren.',
    content: `
<figure style="margin:0 0 32px;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.10);">
  <div class="ai-figure-wrap">
    <picture>
      <source srcset="/static/ratgeber-pflege-zuhause.webp" type="image/webp">
      <img src="/static/ratgeber-pflege-zuhause.jpg" alt="Senior genießt Tee zu Hause mit Pflegekraft – häusliche Pflege statt Pflegeheim durch Auxilium Forst Baden" width="820" height="420" loading="lazy" style="width:100%;height:420px;object-fit:cover;display:block;">
    </picture>
    <img src="/static/ai-generated-badge.png" alt="KI-generiertes Bild" class="ai-badge">
  </div>
  <figcaption style="font-size:0.8rem;color:var(--text-light);padding:8px 12px;background:#FBF7F2;">Das eigene Zuhause als bester Ort zum Älterwerden – Auxilium macht häusliche Pflege professionell und finanzierbar.</figcaption>
</figure>

<h2>Warum Pflege zu Hause? – Die entscheidenden Vorteile</h2>
<p>Die eigenen vier Wände sind für die meisten Menschen mehr als nur ein Aufenthaltsort – sie sind Identität, Sicherheit und Würde. Zahlreiche Studien belegen: Pflegebedürftige Menschen, die in ihrer gewohnten Umgebung bleiben, weisen bessere kognitive Werte auf, leiden seltener an Depressionen und haben eine höhere Lebensqualität. Das gilt besonders für Menschen mit Demenz oder altersbedingter Vergesslichkeit.</p>
<p>Doch häusliche Pflege erfordert gute Organisation, verlässliche Fachkräfte und eine durchdachte Finanzierung. Genau hier setzt Auxilium an: Als erfahrene Pflegeperson in Forst (Baden) übernimmt Kristina Bronner die Betreuung zu Hause – professionell, herzlich und über die Pflegekasse finanzierbar.</p>

<h2>Was kostet ein Pflegeheim 2025 wirklich? – Der Vergleich lohnt sich</h2>
<p>Viele Familien unterschätzen die tatsächlichen Kosten eines Pflegeheims. Der offizielle Pflegekassen-Anteil klingt zunächst beruhigend – doch die <strong>Eigenanteile sind in den letzten Jahren stark gestiegen</strong>:</p>
<div style="background:#FBF7F2;border-radius:12px;padding:24px 28px;margin:24px 0;">
  <h3 style="font-size:1rem;margin:0 0 16px;color:var(--primary);">Durchschnittliche monatliche Kosten Pflegeheim 2025</h3>
  <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
    <tbody>
      <tr style="border-bottom:1px solid #E8D9C5;"><td style="padding:9px 0;">Unterkunft &amp; Verpflegung</td><td style="padding:9px 0;text-align:right;font-weight:600;">ca. 900–1.100 €</td></tr>
      <tr style="border-bottom:1px solid #E8D9C5;"><td style="padding:9px 0;">Investitionskosten des Heims</td><td style="padding:9px 0;text-align:right;font-weight:600;">ca. 400–700 €</td></tr>
      <tr style="border-bottom:1px solid #E8D9C5;"><td style="padding:9px 0;">Ausbildungsumlage</td><td style="padding:9px 0;text-align:right;font-weight:600;">ca. 150–250 €</td></tr>
      <tr style="border-bottom:1px solid #E8D9C5;"><td style="padding:9px 0;">Eigenanteil Pflege (unabhängig v. Pflegegrad)</td><td style="padding:9px 0;text-align:right;font-weight:600;">ca. 1.000–1.400 €</td></tr>
      <tr style="padding-top:8px;font-weight:700;border-top:2px solid var(--accent);"><td style="padding:12px 0;">Gesamteigenanteil (ohne Pflegekasse)</td><td style="padding:12px 0;text-align:right;color:var(--accent);font-size:1.1rem;">2.400–3.400 €/Monat</td></tr>
    </tbody>
  </table>
</div>
<p>Dem gegenüber steht die häusliche Pflege durch Auxilium, die in vielen Fällen <strong>vollständig oder überwiegend über Pflegekassen-Leistungen</strong> finanziert werden kann – durch die kombinierte Nutzung von Pflegegeld, Verhinderungspflege, Kurzzeitpflege und Entlastungsbetrag.</p>

<h2>Was Auxilium in der häuslichen Pflege leistet</h2>
<p>Auxilium bietet individuelle, auf den Menschen abgestimmte Betreuung in der eigenen Wohnung. Die Leistungen umfassen:</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin:20px 0;">
  ${[['fa-shower','Körperpflege &amp; Hygiene','Waschen, Duschen, Ankleiden, Mundpflege, Rasur, Intimpflege'],['fa-walking','Mobilisation &amp; Bewegung','Transfers, Lagerung, Gehübungen, Spaziergänge, Sturzprävention'],['fa-brain','Kognitive Betreuung','Gespräche, Vorlesen, Gedächtnistraining, soziale Aktivitäten'],['fa-utensils','Hauswirtschaft','Kochen, Einkaufen, Wäsche, Reinigung, Einkaufsplanung'],['fa-car','Begleitung &amp; Fahrdienst','Arztbesuche, Behörden, Apotheke, Freizeitaktivitäten'],['fa-moon','Nachtbetreuung','Individuelle Nachtwachen nach Absprache']].map(([icon,title,text])=>`<div style="background:white;border:1px solid #E8D9C5;border-radius:10px;padding:16px 18px;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><i class="fas ${icon}" style="color:var(--accent);font-size:1.1rem;"></i><strong style="font-size:0.95rem;">${title}</strong></div><p style="font-size:0.85rem;color:var(--text-light);margin:0;">${text}</p></div>`).join('')}
</div>

<h2>Häusliche Pflege finanzieren – die wichtigsten Pflegekassen-Leistungen 2025</h2>
<p>Wer zu Hause gepflegt wird, kann verschiedene Pflegekassen-Leistungen kombinieren:</p>
<ul>
  <li><strong>Pflegegeld (§ 37 SGB XI):</strong> Monatliche Zahlung an die Pflegeperson (332–947 € je nach Pflegegrad)</li>
  <li><strong>Pflegesachleistungen (§ 36 SGB XI):</strong> Budget für ambulante Pflegedienste (761–2.200 €/Monat)</li>
  <li><strong>Verhinderungspflege (§ 39 SGB XI):</strong> Bis zu 1.612 € jährlich für Vertretungspflege</li>
  <li><strong>Kurzzeitpflege (§ 42 SGB XI):</strong> Bis zu 3.548 € jährlich für temporäre stationäre Pflege</li>
  <li><strong>Entlastungsbetrag (§ 45b SGB XI):</strong> 131 € monatlich für häusliche Betreuungsleistungen</li>
  <li><strong>Wohnraumanpassung (§ 40 SGB XI):</strong> Bis zu 4.000 € pro Maßnahme für barrierefreien Umbau</li>
</ul>
<p>Auxilium rechnet als anerkannte Pflegeperson <strong>direkt über Verhinderungspflege, Pflegesachleistungen und den Entlastungsbetrag</strong> ab. In der persönlichen Erstberatung zeigt Kristina Bronner Ihnen, welche Kombination in Ihrer Situation optimal ist.</p>

<h2>Wie läuft die Betreuung durch Auxilium konkret ab?</h2>
<p>Nach dem ersten Gespräch und einer Bedarfsanalyse erstellt Auxilium einen individuellen Betreuungsplan. Dieser legt fest, welche Leistungen zu welchen Zeiten erbracht werden und wie die Abrechnung mit der Pflegekasse erfolgt. Regelmäßige Feedbackgespräche mit Angehörigen sorgen dafür, dass die Pflege stets optimal angepasst wird.</p>
<h3>Service-Gebiet: Wo ist Auxilium aktiv?</h3>
<p>Auxilium betreut Pflegebedürftige in <strong>Forst (Baden), Bruchsal, Kraichtal, Bretten, Bad Schönborn</strong> und der gesamten Region Karlsruhe.</p>

<blockquote style="border-left:4px solid var(--primary);padding:16px 24px;background:#FBF7F2;border-radius:0 10px 10px 0;margin:32px 0;">
  <p style="margin:0 0 8px;font-style:italic;font-size:1.05rem;">„Zuhause zu bleiben ist der sehnlichste Wunsch der meisten pflegebedürftigen Menschen. Mit der richtigen Unterstützung ist das möglich – und oft günstiger als das Pflegeheim."</p>
  <cite style="font-size:0.85rem;color:var(--text-light);display:block;">– Kristina Bronner, Auxilium Pflegeberatung Forst Baden</cite>
</blockquote>
<p style="margin-top:24px;"><a href="/leistungen" style="color:var(--accent);font-weight:700;font-size:1.05rem;">Alle Leistungen von Auxilium ansehen →</a></p>`
  },
  {
    slug: 'entlastungsbetrag-131-euro-nutzen',
    title: 'Entlastungsbetrag 131 Euro monatlich: Wer bekommt ihn und wie nutze ich ihn optimal?',
    meta_desc: 'Der Entlastungsbetrag von 131 Euro monatlich steht allen Pflegebedürftigen ab Pflegegrad 1 zu – auch für Auxilium-Leistungen in Forst Baden. Wie er beantragt und übertragen werden kann.',
    category: 'Pflegefinanzierung',
    intro: 'Den monatlichen Entlastungsbetrag von 131 Euro optimal einsetzen – wer ihn bekommt, wofür er gilt und wie Auxilium bei der Abrechnung hilft.',
    lead: 'Bereits ab Pflegegrad 1 zahlt die gesetzliche Pflegekasse monatlich 131 Euro als sogenannten Entlastungsbetrag – das sind jährlich bis zu 1.572 Euro, die für anerkannte Betreuungs- und Entlastungsleistungen eingesetzt werden können. Auxilium ist als anerkannter Entlastungsdienstleister zugelassen, was bedeutet: Sie können diesen Betrag direkt für die Betreuung durch Kristina Bronner verwenden, ohne selbst in Vorleistung gehen zu müssen. Nicht genutzte Monatsbeiträge können noch bis zum 30. Juni des Folgejahres nachgefordert werden – ein häufig übersehener finanzieller Vorteil.',
    content: `
<figure style="margin:0 0 32px;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.10);">
  <div class="ai-figure-wrap">
    <picture>
      <source srcset="/static/ratgeber-entlastungsbetrag.webp" type="image/webp">
      <img src="/static/ratgeber-entlastungsbetrag.jpg" alt="Glückliche Seniorin mit Kaffeetasse im Garten – Entlastungsbetrag 131 Euro für häusliche Betreuung durch Auxilium" width="820" height="420" loading="lazy" style="width:100%;height:420px;object-fit:cover;display:block;">
    </picture>
    <img src="/static/ai-generated-badge.png" alt="KI-generiertes Bild" class="ai-badge">
  </div>
  </picture>
  <figcaption style="font-size:0.8rem;color:var(--text-light);padding:8px 12px;background:#FBF7F2;">Der Entlastungsbetrag ermöglicht professionelle Betreuung zu Hause – Auxilium rechnet direkt mit der Pflegekasse ab.</figcaption>
</figure>

<h2>Was ist der Entlastungsbetrag? – Definition und gesetzliche Grundlage</h2>
<p>Der <strong>Entlastungsbetrag (§ 45b SGB XI)</strong> ist eine monatliche Geldleistung der Pflegeversicherung in Höhe von <strong>131 Euro</strong>, die allen Pflegebedürftigen <strong>ab Pflegegrad 1</strong> zusteht. Er ist zweckgebunden und darf nur für anerkannte Entlastungsleistungen verwendet werden – darunter fällt auch die Betreuung durch Auxilium als anerkannten Entlastungsdienstleister in Forst (Baden).</p>
<p>Besonders wichtig: Der Entlastungsbetrag ist <strong>zusätzlich</strong> zu Pflegegeld und Pflegesachleistungen nutzbar. Er wird nicht angerechnet und nicht verrechnet – er kommt obendrauf.</p>

<h2>Wer hat Anspruch auf den Entlastungsbetrag?</h2>
<p>Den Entlastungsbetrag erhalten alle Personen mit anerkanntem Pflegebedarf – also ab <strong>Pflegegrad 1</strong>. Damit ist er die einzige Pflegekassen-Leistung, die auch Menschen mit sehr geringen Einschränkungen (Pflegegrad 1) in voller Höhe zusteht.</p>
<div style="background:#FBF7F2;border-radius:12px;padding:20px 24px;margin:20px 0;">
  <h3 style="font-size:1rem;margin:0 0 12px;color:var(--primary);">Anspruch Entlastungsbetrag nach Pflegegrad</h3>
  <table style="width:100%;font-size:0.9rem;">
    <thead><tr style="background:var(--primary);color:white;"><th style="padding:9px 12px;text-align:left;">Pflegegrad</th><th style="padding:9px 12px;">Entlastungsbetrag/Monat</th><th style="padding:9px 12px;">Max. übertragbar/Jahr</th></tr></thead>
    <tbody>
      ${['1','2','3','4','5'].map(g=>`<tr style="border-bottom:1px solid #E8D9C5;"><td style="padding:9px 12px;">Pflegegrad ${g}</td><td style="padding:9px 12px;text-align:center;font-weight:600;">131 €</td><td style="padding:9px 12px;text-align:center;color:#2C6E49;font-weight:600;">3.144 €</td></tr>`).join('')}
    </tbody>
  </table>
</div>

<h2>Wofür darf der Entlastungsbetrag genutzt werden?</h2>
<p>Der Entlastungsbetrag ist zweckgebunden, aber die Verwendungsmöglichkeiten sind vielfältig:</p>
<ul>
  <li><strong>Häusliche Betreuung</strong> durch anerkannte Entlastungsdienstleister – wie Auxilium</li>
  <li>Tages- und Nachtpflege in entsprechenden Einrichtungen</li>
  <li>Kurzzeitpflege in anerkannten Einrichtungen</li>
  <li>Haushaltshilfen von anerkannten Anbietern</li>
  <li>Begleitdienste für Einkauf, Arzt, Freizeitaktivitäten</li>
  <li>Betreuungsgruppen und Angebote zur Tagesstruktur</li>
</ul>
<p><strong>Nicht erlaubt</strong> ist die direkte Auszahlung als Bargeld oder die Verwendung für Leistungen, die nicht anerkannt sind. In der <strong>persönlichen Erstberatung</strong> klärt Auxilium mit Ihnen, welche Leistungen konkret über den Entlastungsbetrag abgerechnet werden können.</p>

<h2>Der Übertragungstrick: Bis zu 3.144 Euro ansparen</h2>
<p>Nicht genutzter Entlastungsbetrag <strong>verfällt nicht sofort</strong>: Er kann bis zum <strong>30. Juni des Folgejahres</strong> übertragen und genutzt werden. Das bedeutet: Wenn Sie in einem Jahr den Betrag nicht oder nicht vollständig nutzen, können Sie in den ersten sechs Monaten des Folgejahres das angesammelte Budget für Auxilium-Leistungen verwenden.</p>
<div style="background:#FBF7F2;border-radius:12px;padding:20px 24px;margin:20px 0;">
  <h3 style="font-size:1rem;margin:0 0 12px;color:#2C6E49;"><i class="fas fa-lightbulb" style="margin-right:8px;"></i>Rechenbeispiel: Maximale Nutzung</h3>
  <p style="margin:0 0 8px;font-size:0.92rem;">Angenommen, Sie nutzen den Entlastungsbetrag in Jahr 1 überhaupt nicht:</p>
  <ul style="font-size:0.92rem;margin:0;padding-left:20px;">
    <li>12 Monate × 131 € = <strong>1.572 € aus Jahr 1</strong></li>
    <li>6 Monate × 131 € (Jan–Jun Jahr 2) = <strong>786 € aus Jahr 2</strong></li>
    <li>Nutzbar bis 30. Juni Jahr 2: <strong>2.358 € in einem Halbjahr</strong></li>
  </ul>
  <p style="margin:12px 0 0;font-size:0.88rem;color:var(--text-light);">Hinweis: Auch das neue Budget ab Juli läuft parallel weiter.</p>
</div>

<h2>Wie kombiniere ich den Entlastungsbetrag mit anderen Pflegeleistungen?</h2>
<p>Der Entlastungsbetrag funktioniert als <strong>Ergänzung</strong> zu allen anderen Pflegeversicherungsleistungen. Besonders effektiv ist die Kombination mit:</p>
<ul>
  <li><strong>Pflegegeld:</strong> Sie erhalten Pflegegeld + 131 € Entlastungsbetrag für Auxilium-Leistungen</li>
  <li><strong>Verhinderungspflege:</strong> Wenn Hauptpflegeperson ausfällt, deckt Verhinderungspflege die Hauptkosten, der Entlastungsbetrag ergänzt</li>
  <li><strong>Pflegesachleistungen:</strong> Verbleibendes Sachleistungsbudget kann teilweise in Entlastungsleistungen umgewandelt werden (bis 40 %)</li>
</ul>
<p>Mit der richtigen Kombination können Familien in vielen Fällen mehrere tausend Euro jährlich an Pflegekassen-Leistungen nutzen – ohne Eigenkosten.</p>

<h2>Wie beantrage ich den Entlastungsbetrag?</h2>
<p>Den Entlastungsbetrag müssen Sie <strong>aktiv bei Ihrer Pflegekasse beantragen</strong> – er wird nicht automatisch ausgezahlt. Bei vielen Kassen reicht ein formloser Antrag. Die Pflegekasse schickt dann eine Liste anerkannter Anbieter in Ihrer Region.</p>
<p>Auxilium ist als <strong>anerkannter Entlastungsdienstleister im Landkreis Karlsruhe</strong> registriert. Nach Anerkennung können Sie Auxilium direkt beauftragen, und Auxilium stellt der Pflegekasse die erbrachten Leistungen direkt in Rechnung.</p>

<blockquote style="border-left:4px solid var(--primary);padding:16px 24px;background:#FBF7F2;border-radius:0 10px 10px 0;margin:32px 0;">
  <p style="margin:0 0 8px;font-style:italic;font-size:1.05rem;">„131 Euro klingen wenig – aber über zwei Jahre angespart und mit anderen Leistungen kombiniert, sprechen wir von einem echten Unterschied für die Pflegequalität zuhause."</p>
  <cite style="font-size:0.85rem;color:var(--text-light);display:block;">– Kristina Bronner, Auxilium Pflegeberatung Forst Baden</cite>
</blockquote>

<h2>Entlastungsbetrag in Forst (Baden) nutzen – Auxilium ist anerkannt</h2>
<p>Als anerkannter Entlastungsdienstleister in der Region Forst (Baden) und Umgebung übernimmt Auxilium die gesamte Abwicklung mit der Pflegekasse. Sie müssen sich um nichts kümmern – Kristina Bronner beantragt, rechnet ab und dokumentiert alle erbrachten Leistungen.</p>
<p>Vereinbaren Sie jetzt Ihre <strong>persönliche Erstberatung</strong> – wir prüfen gemeinsam, welche Pflegekassen-Leistungen Ihnen zustehen und wie Sie diese optimal einsetzen.</p>
<p style="margin-top:24px;"><a href="/beratung" style="color:var(--accent);font-weight:700;font-size:1.05rem;">Persönliche Erstberatung anfragen →</a></p>`
  },
  {
    slug: 'pflegende-angehoerige-selbst-schuetzen',
    title: 'Pflegende Angehörige: Rechte, Auszeiten und Selbstschutz – So hilft Auxilium',
    meta_desc: 'Pflegende Angehörige in Forst Baden: Welche Rechte haben Sie? Wie finanzieren Sie Auszeiten? Auxilium erklärt Pflegeunterstützungsgeld, Verhinderungspflege und Rentenversicherung.',
    category: 'Angehörige',
    intro: 'Rechte, Auszeiten und Entlastungsleistungen für pflegende Angehörige – Auxilium unterstützt Sie in Forst (Baden) und Umgebung.',
    lead: 'Rund 4,1 Millionen Menschen werden in Deutschland zu Hause gepflegt – die meisten von Familienmitgliedern, die täglich mehrere Stunden ihrer eigenen Freizeit, Gesundheit und Berufstätigkeit opfern. Dabei haben pflegende Angehörige gesetzlich verbriefte Rechte: Pflegeunterstützungsgeld für bis zu zehn bezahlte Ausfalltage, Pflegezeit mit Kündigungsschutz für bis zu sechs Monate, und Rentenbeiträge der Pflegekasse ab Pflegegrad 2. Auxilium begleitet Sie in Forst (Baden) und der Region nicht nur bei der Organisation der Vertretungspflege, sondern auch dabei, alle Ihnen zustehenden Leistungen zu beantragen und zu nutzen.',
    content: `
<figure style="margin:0 0 32px;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.10);">
  <div class="ai-figure-wrap">
    <img src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=820&q=80&auto=format&fit=crop" alt="Pflegende Angehörige – Tochter begleitet Mutter, Entlastung durch Auxilium Forst Baden" width="820" height="420" loading="lazy" style="width:100%;height:420px;object-fit:cover;display:block;">
    <img src="/static/ai-generated-badge.png" alt="KI-generiertes Bild" class="ai-badge">
  </div>
  <figcaption style="font-size:0.8rem;color:var(--text-light);padding:8px 12px;background:#FBF7F2;">Pflegende Angehörige tragen enorme Last – Auxilium bietet Entlastung, damit Sie durchhalten können.</figcaption>
</figure>

<h2>Pflegende Angehörige in Deutschland – Zahlen, Fakten, Realität</h2>
<p>In Deutschland werden rund <strong>4,1 Millionen Menschen zu Hause gepflegt</strong> – die überwiegende Mehrheit von Angehörigen: Töchter, Söhne, Ehepartner, manchmal auch Geschwister. Die meisten pflegen <strong>täglich mehrere Stunden</strong>, häufig ohne Pause, ohne Urlaub und ohne angemessene Vergütung. Die Folgen sind alarmierend: Erschöpfung, Isolation, Schlafmangel und psychische Erkrankungen sind bei pflegenden Angehörigen weit häufiger als in der Normalbevölkerung.</p>
<p>Auxilium kennt diese Realität. Kristina Bronner hat in ihrer Arbeit in Forst (Baden) und der Region Karlsruhe unzählige pflegende Angehörige begleitet und weiß: <strong>Es muss nicht so sein.</strong> Es gibt Hilfen, Rechte und finanzierte Entlastungen – man muss nur wissen, wo man sie findet.</p>

<h2>Ihre Rechte als pflegende Person – Das steht Ihnen zu</h2>
<h3>1. Pflegeunterstützungsgeld – 10 Tage bezahlte Auszeit</h3>
<p>Wenn ein naher Angehöriger plötzlich pflegebedürftig wird, können Beschäftigte bis zu <strong>10 Arbeitstage der Arbeit fernbleiben</strong> (§ 2 PflegeZG), um die Pflege zu organisieren. In dieser Zeit zahlt die Pflegekasse das <strong>Pflegeunterstützungsgeld</strong> als Lohnersatz – ähnlich dem Kinderkrankengeld. Der Anspruch besteht pro Pflegefall.</p>

<h3>2. Pflegezeit – bis zu 6 Monate Freistellung</h3>
<p>Nach dem akuten Ausfall können nahe Angehörige für bis zu <strong>6 Monate vollständig oder teilweise von der Arbeit freigestellt</strong> werden (§ 3 PflegeZG), um einen pflegebedürftigen Angehörigen zu pflegen. Der Arbeitgeber darf in dieser Zeit grundsätzlich nicht kündigen. Zur finanziellen Überbrückung steht ein zinsloses Darlehen beim Bundesamt für Familie (BAFzA) zur Verfügung.</p>

<h3>3. Familienpflegezeit – bis zu 24 Monate Teilzeitarbeit</h3>
<p>Wer länger Pflege und Beruf kombinieren möchte, kann die <strong>Familienpflegezeit</strong> nutzen (§ 2 FPfZG): bis zu 24 Monate mit reduzierter Arbeitszeit auf mindestens 15 Wochenstunden. Auch hier gibt es Kündigungsschutz und das zinsloses Darlehen.</p>

<h3>4. Rentenversicherung für pflegende Angehörige</h3>
<p>Wer einen Angehörigen ab <strong>Pflegegrad 2</strong> pflegt und dabei nicht mehr als 30 Stunden wöchentlich erwerbstätig ist, erhält von der Pflegekasse <strong>Rentenbeiträge</strong> gezahlt (§ 44 SGB XI). Die Beiträge richten sich nach dem Pflegegrad und können über die Jahre eine relevante Summe ausmachen – bis zu mehrere tausend Euro an anerkannten Rentenanwartschaften.</p>

<h3>5. Verhinderungspflege – finanzierte Vertretung für Ihre Auszeit</h3>
<p>Die wichtigste Entlastungsleistung für pflegende Angehörige: Die <strong>Verhinderungspflege (§ 39 SGB XI)</strong> stellt bis zu <strong>1.612 Euro jährlich</strong> zur Verfügung, damit Sie Urlaub machen, krank sein oder einfach eine Auszeit nehmen können. Auxilium springt in dieser Zeit als professionelle Vertretungspflegeperson ein – nahtlos und zuverlässig.</p>
<p>→ Ausführliche Informationen: <a href="/ratgeber/verhinderungspflege-richtig-nutzen" style="color:var(--accent);">Verhinderungspflege richtig nutzen – bis zu 3.386 Euro sichern</a></p>

<h2>Anzeichen von Überlastung – Warnsignale ernst nehmen</h2>
<p>Pflegende Angehörige neigen dazu, eigene Bedürfnisse zu ignorieren. Folgende Warnsignale sollten Sie ernst nehmen:</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin:20px 0;">
  ${[['fa-bed','Chronischer Schlafmangel','Ständige Unterbrechungen, keine Nacht durchschlafen'],['fa-sad-tear','Emotionale Erschöpfung','Gereiztheit, Traurigkeit, das Gefühl, nicht mehr zu können'],['fa-user-slash','Sozialer Rückzug','Freundschaften vernachlässigen, kein eigenes Leben mehr'],['fa-heartbeat','Eigene Gesundheit vernachlässigen','Arzttermine absagen, Medikamente vergessen'],['fa-frown','Schuldgefühle','Das Gefühl, nie genug zu tun'],['fa-exclamation-triangle','Aggressionen','Ungewöhnliche Gereiztheit gegenüber der pflegebedürftigen Person']].map(([icon,title,text])=>`<div style="background:#FFF8F0;border:1px solid #F5DFC4;border-radius:10px;padding:14px 16px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><i class="fas ${icon}" style="color:#C0392B;font-size:1rem;"></i><strong style="font-size:0.9rem;">${title}</strong></div><p style="font-size:0.83rem;color:var(--text-light);margin:0;">${text}</p></div>`).join('')}
</div>
<p>Wenn Sie mehrere dieser Punkte erkennen: <strong>Handeln Sie jetzt.</strong> Holen Sie Hilfe – und nutzen Sie die Ihnen zustehenden Leistungen.</p>

<h2>So organisiert Auxilium Ihre Auszeit</h2>
<p>Auxilium übernimmt die Betreuung Ihres Angehörigen während Ihrer Auszeit – professionell, herzlich und vollständig über die Pflegekasse finanzierbar. In der <strong>persönlichen Erstberatung</strong> klären wir:</p>
<ul>
  <li>Welche Leistungen (Verhinderungspflege, Entlastungsbetrag, Sachleistungen) Ihnen zustehen</li>
  <li>Wie der Übergang zur Auxilium-Betreuung nahtlos gelingt</li>
  <li>Welche Tätigkeiten Auxilium konkret übernimmt</li>
  <li>Wie die Abrechnung mit der Pflegekasse funktioniert</li>
</ul>
<p>Auxilium betreut Pflegebedürftige in <strong>Forst (Baden), Bruchsal, Bretten, Kraichtal, Karlsruhe</strong> und der gesamten Region. Auch Einsätze in der Region Hoyerswerda sind möglich.</p>

<h2>Selbstfürsorge für pflegende Angehörige – praktische Tipps</h2>
<ul>
  <li><strong>Regelmäßige Auszeiten einplanen:</strong> Auch kurze Auszeiten täglich (30 Minuten) helfen</li>
  <li><strong>Hilfe annehmen:</strong> Wenn Familie, Freunde oder Auxilium Unterstützung anbieten – annehmen</li>
  <li><strong>Eigene Arzttermine priorisieren:</strong> Nur wer selbst gesund ist, kann pflegen</li>
  <li><strong>Pflegegruppen besuchen:</strong> Austausch mit anderen pflegenden Angehörigen entlastet</li>
  <li><strong>Alle Ansprüche kennen und nutzen:</strong> Pflegekassen-Leistungen aktiv beantragen</li>
</ul>

<blockquote style="border-left:4px solid var(--primary);padding:16px 24px;background:#FBF7F2;border-radius:0 10px 10px 0;margin:32px 0;">
  <p style="margin:0 0 8px;font-style:italic;font-size:1.05rem;">„Ich habe viele pflegende Töchter und Söhne kennengelernt, die sich selbst aufgeopfert haben, bis sie nicht mehr konnten. Das muss nicht sein. Die Pflegekasse zahlt Vertretung – nutzen Sie dieses Recht."</p>
  <cite style="font-size:0.85rem;color:var(--text-light);display:block;">– Kristina Bronner, Auxilium Pflegeberatung Forst Baden</cite>
</blockquote>

<h2>Jetzt Entlastung holen – persönliche Erstberatung mit Auxilium</h2>
<p>Vereinbaren Sie eine <strong>persönliche Erstberatung</strong> mit Kristina Bronner von Auxilium. Gemeinsam analysieren wir Ihre Situation, klären alle Leistungsansprüche und planen Ihre erste Auszeit. Denn eines ist sicher: Wer sich selbst schützt, kann auch besser für andere da sein.</p>
<p style="margin-top:24px;"><a href="/kontakt" style="color:var(--accent);font-weight:700;font-size:1.05rem;">Persönliche Erstberatung jetzt anfragen →</a></p>`
  }
]

// ─── Ratgeber Übersicht ────────────────────────────────────────
app.get('/ratgeber', async (c) => {
  const S = await loadSettings(c.env.DB)
  let dbArticles: any[] = []
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT slug, title, meta_desc, category, intro FROM ratgeber WHERE active=1 ORDER BY sort_order, created_at DESC'
    ).all<any>()
    dbArticles = results
  } catch (_) {}
  const allArticles = [...RATGEBER_ARTICLES, ...dbArticles]
  const cards = allArticles.map(a => `
  <article class="ratgeber-card">
    <div class="ratgeber-card__category">${a.category}</div>
    <h2 class="ratgeber-card__title"><a href="/ratgeber/${a.slug}">${a.title}</a></h2>
    <p class="ratgeber-card__intro">${a.intro || a.meta_desc}</p>
    <a href="/ratgeber/${a.slug}" class="ratgeber-card__link">Artikel lesen <i class="fas fa-arrow-right"></i></a>
  </article>`).join('\n')
  const body = pageHero('Ratgeber &amp; Tipps', 'Pflegewissen für Betroffene und Angehörige', 'Praxisnahe Informationen rund um Pflege, Finanzierung und Pflegekassen-Leistungen – von Auxilium für Sie aufbereitet.', 'Ratgeber') + `
<main id="main-content" tabindex="-1">
<section class="section"><div class="container"><div class="ratgeber-grid">${cards}</div></div></section>
<section class="cta-section-green" aria-labelledby="ratgeber-cta-h">
  <div class="container text-center">
    <h2 id="ratgeber-cta-h" class="cta-section-green__title">Ihre Frage ist nicht dabei?</h2>
    <p class="cta-section-green__text">Auxilium berät Sie pers&ouml;nlich &ndash; individuell und auf Ihre Pflegesituation zugeschnitten.</p>
    <div class="flex justify-center gap-4 flex-wrap">
      <a href="/kontakt" class="btn btn-green-solid"><i class="fas fa-envelope" aria-hidden="true"></i>Pers&ouml;nliche Beratung anfragen</a>
      <a href="/beratung" class="btn btn-green-ghost"><i class="fas fa-info-circle" aria-hidden="true"></i>Beratungsleistungen ansehen</a>
    </div>
  </div>
</section>
</main>`
  return c.html(layout('Ratgeber Pflege &ndash; Auxilium Pflegeberatung Forst', 'Ratgeber-Artikel zu Pflege, Pflegegraden, Finanzierung und Entlastung für Betroffene und Angehörige in Forst Baden.', body, { ...S, _canonical: '/ratgeber' }))
})

// ─── Ratgeber Einzelartikel ────────────────────────────────────
app.get('/ratgeber/:slug', async (c) => {
  const S = await loadSettings(c.env.DB)
  const slug = c.req.param('slug')
  let article: any = RATGEBER_ARTICLES.find(a => a.slug === slug)
  if (!article) {
    try {
      article = await c.env.DB.prepare(
        'SELECT * FROM ratgeber WHERE slug=? AND active=1'
      ).bind(slug).first<any>()
    } catch (_) {}
  }
  if (!article) return c.notFound()
  const others = RATGEBER_ARTICLES.filter(a => a.slug !== slug).slice(0, 3)
  const articleSchema = JSON.stringify({
    "@context": "https://schema.org", "@type": "Article",
    "headline": article.title, "description": article.meta_desc,
    "author": { "@type": "Person", "name": "Kristina Bronner" },
    "publisher": { "@type": "Organization", "name": "Auxilium – Pflegeberatung Forst Baden", "url": "https://auxilium-forst.de" },
    "url": `https://auxilium-forst.de/ratgeber/${slug}`
  })
  const body = pageHero(article.category, article.title, article.intro || article.meta_desc, 'Ratgeber') + `
<main id="main-content" tabindex="-1">
<section class="section">
  <div class="container" style="max-width:820px;">
    <nav class="breadcrumb" aria-label="Breadcrumb" style="margin-bottom:24px;">
      <a href="/">Start</a><span class="sep" aria-hidden="true">&rsaquo;</span>
      <a href="/ratgeber">Ratgeber</a><span class="sep" aria-hidden="true">&rsaquo;</span>
      <span class="current">${article.category}</span>
    </nav>
    <article class="ratgeber-article">
      <div class="ratgeber-article__meta">
        <span class="ratgeber-article__category">${article.category}</span>
        <span class="ratgeber-article__divider">&middot;</span>
        <span class="ratgeber-article__read">ca. 8 Min. Lesezeit</span>
      </div>
      <h1 class="ratgeber-article__title">${article.title}</h1>
      ${(article.lead || article.intro) ? `<p class="ratgeber-article__intro">${article.lead || article.intro}</p>` : ''}
      <div class="ratgeber-article__content">${article.content}</div>
      <div class="ratgeber-article__cta">
        <div class="ratgeber-cta-box">
          <div class="ratgeber-cta-box__icon"><i class="fas fa-hand-holding-heart"></i></div>
          <div>
            <h3 class="ratgeber-cta-box__title">Auxilium hilft Ihnen pers&ouml;nlich</h3>
            <p class="ratgeber-cta-box__text">Sie haben Fragen zu diesem Thema? Kristina Bronner steht Ihnen f&uuml;r eine pers&ouml;nliche Erstberatung zur Verf&uuml;gung.</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:14px;">
              <a href="/kontakt" class="btn btn-accent"><i class="fas fa-envelope" aria-hidden="true"></i>Jetzt anfragen</a>
              <a href="/leistungen" class="btn btn-outline"><i class="fas fa-list" aria-hidden="true"></i>Leistungen ansehen</a>
            </div>
          </div>
        </div>
      </div>
    </article>
    ${others.length > 0 ? `
    <div class="ratgeber-related">
      <h2 style="font-size:1.2rem;margin-bottom:20px;">Weitere Ratgeber-Artikel</h2>
      <div class="ratgeber-related__grid">
        ${others.map(o => `<a href="/ratgeber/${o.slug}" class="ratgeber-related__card">
          <span class="ratgeber-card__category">${o.category}</span>
          <strong>${o.title}</strong>
          <span class="ratgeber-card__link">Lesen <i class="fas fa-arrow-right"></i></span>
        </a>`).join('')}
      </div>
    </div>` : ''}
  </div>
</section>
</main>`
  return c.html(layout(article.title + ' – Auxilium Ratgeber', article.meta_desc, body, { ...S, _canonical: '/ratgeber/' + slug }) + `<script type="application/ld+json">${articleSchema}</script>`)
})

// ═══════════════════════════════════════════════════════════════
// ADMIN: Testimonials
// ═══════════════════════════════════════════════════════════════

app.get('/admin/testimonials', async (c) => {
  const msg = c.req.query('msg')
  const alert = msg === 'saved'   ? `<div class="adm-alert adm-alert--success"><i class="fas fa-check-circle"></i> Gespeichert.</div>`
              : msg === 'deleted' ? `<div class="adm-alert adm-alert--success"><i class="fas fa-check-circle"></i> Gel&ouml;scht.</div>` : ''
  let testimonials: any[] = []
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM testimonials ORDER BY sort_order, created_at').all<any>()
    testimonials = results
  } catch (_) {
    return c.html(adminLayout('Kundenstimmen', `<div class="adm-alert adm-alert--error"><i class="fas fa-exclamation-circle"></i> Tabelle nicht gefunden. Bitte Migration 0012 einspielen.</div>`, 'testimonials'))
  }
  const rows = testimonials.map(t => `
  <tr>
    <td style="padding:10px 12px;">${t.id}</td>
    <td style="padding:10px 12px;font-weight:600;">${t.name}</td>
    <td style="padding:10px 12px;color:var(--text-light);">${t.role||'–'}</td>
    <td style="padding:10px 12px;">${'★'.repeat(t.stars)}</td>
    <td style="padding:10px 12px;max-width:260px;font-size:0.85rem;">${t.text.substring(0,70)}…</td>
    <td style="padding:10px 12px;"><span class="adm-badge ${t.active?'adm-badge--green':'adm-badge--grey'}">${t.active?'Aktiv':'Inaktiv'}</span></td>
    <td style="padding:10px 12px;white-space:nowrap;">
      <a href="/admin/testimonials/edit/${t.id}" class="adm-btn adm-btn--secondary" style="padding:4px 10px;font-size:0.8rem;"><i class="fas fa-edit"></i></a>
      <form method="POST" action="/admin/testimonials/delete/${t.id}" style="display:inline;" onsubmit="return confirm('Wirklich löschen?')">
        <button type="submit" class="adm-btn" style="padding:4px 10px;font-size:0.8rem;background:#fee2e2;color:#991b1b;"><i class="fas fa-trash"></i></button>
      </form>
    </td>
  </tr>`).join('')
  const body = `${alert}
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
  <div><h2 style="font-size:1.25rem;margin-bottom:4px;">Kundenstimmen verwalten</h2><p style="font-size:0.85rem;color:var(--text-light);">Erscheinen auf der Startseite im Slider</p></div>
  <a href="/admin/testimonials/neu" class="adm-btn adm-btn--primary"><i class="fas fa-plus"></i> Neue Kundenstimme</a>
</div>
${testimonials.length === 0 ? `<div class="adm-empty"><p>Noch keine Kundenstimmen vorhanden.</p></div>` : `
<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;background:white;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(44,32,24,0.07);">
  <thead style="background:#F5F0EB;"><tr>
    <th style="padding:10px 12px;text-align:left;font-size:0.8rem;">#</th>
    <th style="padding:10px 12px;text-align:left;font-size:0.8rem;">Name</th>
    <th style="padding:10px 12px;text-align:left;font-size:0.8rem;">Rolle</th>
    <th style="padding:10px 12px;text-align:left;font-size:0.8rem;">Sterne</th>
    <th style="padding:10px 12px;text-align:left;font-size:0.8rem;">Text</th>
    <th style="padding:10px 12px;text-align:left;font-size:0.8rem;">Status</th>
    <th style="padding:10px 12px;text-align:left;font-size:0.8rem;">Aktionen</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table></div>`}
<p style="font-size:0.8rem;color:var(--text-light);margin-top:14px;"><i class="fas fa-info-circle"></i> Keine aktiven Kundenstimmen = Bereich auf Startseite ausgeblendet.</p>`
  return c.html(adminLayout('Kundenstimmen', body, 'testimonials'))
})

app.get('/admin/testimonials/neu', async (c) => {
  const body = `<h2 style="font-size:1.2rem;margin-bottom:20px;">Neue Kundenstimme</h2>
<form method="POST" action="/admin/testimonials/neu">
  <div class="adm-form-group"><label class="adm-label">Name *</label><input type="text" name="name" required class="adm-input" placeholder="z. B. Maria S."><small class="adm-hint">Aus Datenschutzgründen reicht ein abgekürzter Name</small></div>
  <div class="adm-form-group"><label class="adm-label">Rolle / Bezug</label><input type="text" name="role" class="adm-input" placeholder="z. B. Tochter eines Pflegebedürftigen"></div>
  <div class="adm-form-group"><label class="adm-label">Bewertungstext *</label><textarea name="text" rows="4" required class="adm-input adm-textarea"></textarea></div>
  <div class="adm-form-group"><label class="adm-label">Sterne</label><select name="stars" class="adm-input" style="width:auto;"><option value="5" selected>★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select></div>
  <div class="adm-form-group"><label class="adm-label">Sort-Reihenfolge</label><input type="number" name="sort_order" value="0" class="adm-input" style="width:100px;"></div>
  <div class="adm-form-group" style="flex-direction:row;align-items:center;gap:10px;"><input type="checkbox" name="active" value="1" checked id="act" style="width:18px;height:18px;accent-color:var(--accent);"><label for="act" class="adm-label" style="margin:0;">Aktiv</label></div>
  <div style="display:flex;gap:12px;margin-top:20px;"><button type="submit" class="adm-btn adm-btn--primary"><i class="fas fa-save"></i> Speichern</button><a href="/admin/testimonials" class="adm-btn adm-btn--secondary">Abbrechen</a></div>
</form>`
  return c.html(adminLayout('Neue Kundenstimme', body, 'testimonials'))
})

app.post('/admin/testimonials/neu', async (c) => {
  const d = await c.req.parseBody()
  await c.env.DB.prepare(`INSERT INTO testimonials (name,role,text,stars,active,sort_order) VALUES (?,?,?,?,?,?)`)
    .bind((d.name as string)||'',(d.role as string)||'',(d.text as string)||'',parseInt((d.stars as string)||'5',10),d.active==='1'?1:0,parseInt((d.sort_order as string)||'0',10)).run()
  return c.redirect('/admin/testimonials?msg=saved')
})

app.get('/admin/testimonials/edit/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const t = await c.env.DB.prepare('SELECT * FROM testimonials WHERE id=?').bind(id).first<any>()
  if (!t) return c.redirect('/admin/testimonials')
  const body = `<h2 style="font-size:1.2rem;margin-bottom:20px;">Kundenstimme bearbeiten</h2>
<form method="POST" action="/admin/testimonials/edit/${id}">
  <div class="adm-form-group"><label class="adm-label">Name *</label><input type="text" name="name" value="${(t.name||'').replace(/"/g,'&quot;')}" required class="adm-input"></div>
  <div class="adm-form-group"><label class="adm-label">Rolle</label><input type="text" name="role" value="${(t.role||'').replace(/"/g,'&quot;')}" class="adm-input"></div>
  <div class="adm-form-group"><label class="adm-label">Text *</label><textarea name="text" rows="4" required class="adm-input adm-textarea">${(t.text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea></div>
  <div class="adm-form-group"><label class="adm-label">Sterne</label><select name="stars" class="adm-input" style="width:auto;">${[5,4,3,2,1].map(s=>`<option value="${s}"${t.stars===s?' selected':''}>${'★'.repeat(s)}${'☆'.repeat(5-s)}</option>`).join('')}</select></div>
  <div class="adm-form-group"><label class="adm-label">Sort-Reihenfolge</label><input type="number" name="sort_order" value="${t.sort_order||0}" class="adm-input" style="width:100px;"></div>
  <div class="adm-form-group" style="flex-direction:row;align-items:center;gap:10px;"><input type="checkbox" name="active" value="1" ${t.active?'checked':''} id="act" style="width:18px;height:18px;accent-color:var(--accent);"><label for="act" class="adm-label" style="margin:0;">Aktiv</label></div>
  <div style="display:flex;gap:12px;margin-top:20px;"><button type="submit" class="adm-btn adm-btn--primary"><i class="fas fa-save"></i> Speichern</button><a href="/admin/testimonials" class="adm-btn adm-btn--secondary">Abbrechen</a></div>
</form>`
  return c.html(adminLayout('Kundenstimme bearbeiten', body, 'testimonials'))
})

app.post('/admin/testimonials/edit/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const d = await c.req.parseBody()
  await c.env.DB.prepare(`UPDATE testimonials SET name=?,role=?,text=?,stars=?,active=?,sort_order=? WHERE id=?`)
    .bind((d.name as string)||'',(d.role as string)||'',(d.text as string)||'',parseInt((d.stars as string)||'5',10),d.active==='1'?1:0,parseInt((d.sort_order as string)||'0',10),id).run()
  return c.redirect('/admin/testimonials?msg=saved')
})

app.post('/admin/testimonials/delete/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  await c.env.DB.prepare('DELETE FROM testimonials WHERE id=?').bind(id).run()
  return c.redirect('/admin/testimonials?msg=deleted')
})

// ═══════════════════════════════════════════════════════════════
// ADMIN: Ratgeber (DB-verwaltete Zusatz-Artikel)
// ═══════════════════════════════════════════════════════════════

app.get('/admin/ratgeber', async (c) => {
  const msg = c.req.query('msg')
  const alert = msg === 'saved' ? `<div class="adm-alert adm-alert--success"><i class="fas fa-check-circle"></i> Gespeichert.</div>`
    : msg === 'deleted' ? `<div class="adm-alert adm-alert--success"><i class="fas fa-check-circle"></i> Gel&ouml;scht.</div>` : ''
  let articles: any[] = []
  try {
    const { results } = await c.env.DB.prepare('SELECT id,slug,title,category,active,sort_order FROM ratgeber ORDER BY sort_order,created_at DESC').all<any>()
    articles = results
  } catch (_) {
    return c.html(adminLayout('Ratgeber', `<div class="adm-alert adm-alert--error">Tabelle nicht gefunden. Bitte Migration 0013 einspielen.</div>`, 'ratgeber'))
  }
  const rows = articles.map(a => `
  <tr>
    <td style="padding:10px 12px;">${a.id}</td>
    <td style="padding:10px 12px;font-weight:600;max-width:260px;">${a.title}</td>
    <td style="padding:10px 12px;"><code style="font-size:0.78rem;background:#F5F0EB;padding:2px 6px;border-radius:4px;">${a.slug}</code></td>
    <td style="padding:10px 12px;">${a.category}</td>
    <td style="padding:10px 12px;"><span class="adm-badge ${a.active?'adm-badge--green':'adm-badge--grey'}">${a.active?'Aktiv':'Inaktiv'}</span></td>
    <td style="padding:10px 12px;white-space:nowrap;">
      <a href="/admin/ratgeber/edit/${a.id}" class="adm-btn adm-btn--secondary" style="padding:4px 10px;font-size:0.8rem;"><i class="fas fa-edit"></i></a>
      <a href="/ratgeber/${a.slug}" target="_blank" class="adm-btn adm-btn--secondary" style="padding:4px 10px;font-size:0.8rem;"><i class="fas fa-eye"></i></a>
      <form method="POST" action="/admin/ratgeber/delete/${a.id}" style="display:inline;" onsubmit="return confirm('Wirklich löschen?')"><button type="submit" class="adm-btn" style="padding:4px 10px;font-size:0.8rem;background:#fee2e2;color:#991b1b;"><i class="fas fa-trash"></i></button></form>
    </td>
  </tr>`).join('')
  const body = `${alert}
<div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:12px 16px;font-size:0.85rem;color:#1E40AF;margin-bottom:20px;">
  <i class="fas fa-info-circle"></i> <strong>5 statische Artikel</strong> sind fest im Code hinterlegt. Hier verwalten Sie <strong>zusätzliche</strong> DB-Artikel.
</div>
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
  <div><h2 style="font-size:1.25rem;margin-bottom:4px;">Zus&auml;tzliche Ratgeber-Artikel</h2></div>
  <div style="display:flex;gap:8px;"><a href="/admin/ratgeber/neu" class="adm-btn adm-btn--primary"><i class="fas fa-plus"></i> Neuer Artikel</a><a href="/ratgeber" target="_blank" class="adm-btn adm-btn--secondary"><i class="fas fa-eye"></i> Ratgeber ansehen</a></div>
</div>
${articles.length===0?`<div class="adm-empty"><p>Noch keine DB-Artikel vorhanden. Die 5 statischen Artikel sind immer sichtbar.</p></div>`:`
<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;background:white;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(44,32,24,0.07);">
  <thead style="background:#F5F0EB;"><tr>
    <th style="padding:10px 12px;text-align:left;font-size:0.8rem;">#</th>
    <th style="padding:10px 12px;text-align:left;font-size:0.8rem;">Titel</th>
    <th style="padding:10px 12px;text-align:left;font-size:0.8rem;">Slug</th>
    <th style="padding:10px 12px;text-align:left;font-size:0.8rem;">Kategorie</th>
    <th style="padding:10px 12px;text-align:left;font-size:0.8rem;">Status</th>
    <th style="padding:10px 12px;text-align:left;font-size:0.8rem;">Aktionen</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table></div>`}`
  return c.html(adminLayout('Ratgeber', body, 'ratgeber'))
})

app.get('/admin/ratgeber/neu', async (c) => {
  const body = `<h2 style="font-size:1.2rem;margin-bottom:20px;">Neuer Ratgeber-Artikel</h2>
<form method="POST" action="/admin/ratgeber/neu">
  <div class="adm-form-group"><label class="adm-label">Titel *</label><input type="text" name="title" required class="adm-input"></div>
  <div class="adm-form-group"><label class="adm-label">Slug (URL) *</label><input type="text" name="slug" required class="adm-input" placeholder="nur-kleinbuchstaben-und-bindestriche"><small class="adm-hint">Wird zu /ratgeber/[slug]</small></div>
  <div class="adm-form-group"><label class="adm-label">Kategorie</label><input type="text" name="category" class="adm-input" value="Ratgeber"></div>
  <div class="adm-form-group"><label class="adm-label">Meta-Beschreibung</label><textarea name="meta_desc" rows="2" class="adm-input adm-textarea"></textarea></div>
  <div class="adm-form-group"><label class="adm-label">Einleitung</label><textarea name="intro" rows="2" class="adm-input adm-textarea"></textarea></div>
  <div class="adm-form-group"><label class="adm-label">Inhalt (HTML) *</label><textarea name="content" rows="15" required class="adm-input adm-textarea" style="font-family:monospace;font-size:0.85rem;"></textarea><small class="adm-hint">HTML erlaubt: h2, h3, p, ul, ol, li, strong, a, blockquote</small></div>
  <div class="adm-form-group"><label class="adm-label">Sort-Reihenfolge</label><input type="number" name="sort_order" value="10" class="adm-input" style="width:100px;"></div>
  <div class="adm-form-group" style="flex-direction:row;align-items:center;gap:10px;"><input type="checkbox" name="active" value="1" checked id="act" style="width:18px;height:18px;accent-color:var(--accent);"><label for="act" class="adm-label" style="margin:0;">Aktiv</label></div>
  <div style="display:flex;gap:12px;margin-top:20px;"><button type="submit" class="adm-btn adm-btn--primary"><i class="fas fa-save"></i> Speichern</button><a href="/admin/ratgeber" class="adm-btn adm-btn--secondary">Abbrechen</a></div>
</form>`
  return c.html(adminLayout('Neuer Ratgeber-Artikel', body, 'ratgeber'))
})

app.post('/admin/ratgeber/neu', async (c) => {
  const d = await c.req.parseBody()
  await c.env.DB.prepare(`INSERT OR IGNORE INTO ratgeber (slug,title,meta_desc,category,intro,content,active,sort_order) VALUES (?,?,?,?,?,?,?,?)`)
    .bind((d.slug as string)||'',(d.title as string)||'',(d.meta_desc as string)||'',(d.category as string)||'Ratgeber',(d.intro as string)||'',(d.content as string)||'',d.active==='1'?1:0,parseInt((d.sort_order as string)||'10',10)).run()
  return c.redirect('/admin/ratgeber?msg=saved')
})

app.get('/admin/ratgeber/edit/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const a = await c.env.DB.prepare('SELECT * FROM ratgeber WHERE id=?').bind(id).first<any>()
  if (!a) return c.redirect('/admin/ratgeber')
  const esc = (s: string) => (s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const body = `<h2 style="font-size:1.2rem;margin-bottom:20px;">Ratgeber-Artikel bearbeiten</h2>
<form method="POST" action="/admin/ratgeber/edit/${id}">
  <div class="adm-form-group"><label class="adm-label">Titel *</label><input type="text" name="title" value="${esc(a.title)}" required class="adm-input"></div>
  <div class="adm-form-group"><label class="adm-label">Slug</label><input type="text" name="slug" value="${esc(a.slug)}" required class="adm-input"></div>
  <div class="adm-form-group"><label class="adm-label">Kategorie</label><input type="text" name="category" value="${esc(a.category)}" class="adm-input"></div>
  <div class="adm-form-group"><label class="adm-label">Meta-Beschreibung</label><textarea name="meta_desc" rows="2" class="adm-input adm-textarea">${esc(a.meta_desc)}</textarea></div>
  <div class="adm-form-group"><label class="adm-label">Einleitung</label><textarea name="intro" rows="2" class="adm-input adm-textarea">${esc(a.intro)}</textarea></div>
  <div class="adm-form-group"><label class="adm-label">Inhalt (HTML)</label><textarea name="content" rows="15" required class="adm-input adm-textarea" style="font-family:monospace;font-size:0.85rem;">${esc(a.content)}</textarea></div>
  <div class="adm-form-group"><label class="adm-label">Sort-Reihenfolge</label><input type="number" name="sort_order" value="${a.sort_order||0}" class="adm-input" style="width:100px;"></div>
  <div class="adm-form-group" style="flex-direction:row;align-items:center;gap:10px;"><input type="checkbox" name="active" value="1" ${a.active?'checked':''} id="act" style="width:18px;height:18px;accent-color:var(--accent);"><label for="act" class="adm-label" style="margin:0;">Aktiv</label></div>
  <div style="display:flex;gap:12px;margin-top:20px;">
    <button type="submit" class="adm-btn adm-btn--primary"><i class="fas fa-save"></i> Speichern</button>
    <a href="/admin/ratgeber" class="adm-btn adm-btn--secondary">Abbrechen</a>
    <a href="/ratgeber/${a.slug}" target="_blank" class="adm-btn adm-btn--secondary"><i class="fas fa-eye"></i> Vorschau</a>
  </div>
</form>`
  return c.html(adminLayout('Ratgeber bearbeiten', body, 'ratgeber'))
})

app.post('/admin/ratgeber/edit/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const d = await c.req.parseBody()
  await c.env.DB.prepare(`UPDATE ratgeber SET slug=?,title=?,meta_desc=?,category=?,intro=?,content=?,active=?,sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .bind((d.slug as string)||'',(d.title as string)||'',(d.meta_desc as string)||'',(d.category as string)||'Ratgeber',(d.intro as string)||'',(d.content as string)||'',d.active==='1'?1:0,parseInt((d.sort_order as string)||'0',10),id).run()
  return c.redirect('/admin/ratgeber?msg=saved')
})

app.post('/admin/ratgeber/delete/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  await c.env.DB.prepare('DELETE FROM ratgeber WHERE id=?').bind(id).run()
  return c.redirect('/admin/ratgeber?msg=deleted')
})

export default app
