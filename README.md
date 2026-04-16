# Auxilium – Moderne Pflegeberatung Website

## Projektübersicht
- **Name**: Auxilium – Ihre Stütze in der Pflege
- **Betreiberin**: Kristina Bronner, Forst (Lausitz)
- **Ziel**: Moderne, professionelle Webpräsenz für ambulante Pflegeberatung und -leistungen
- **Tech-Stack**: Hono + TypeScript + Vanilla CSS + Cloudflare Pages

## Features

### ✅ Implementierte Funktionen
- **Startseite (/)**: Hero-Bereich, Leistungsvorschau, Statistiken, Finanzierungsbox, CTA-Banner
- **Über Auxilium (/ueber-auxilium)**: Über Kristina Bronner, Leitbild, Philosophie, Arbeitsprozess
- **Leistungen & Kosten (/leistungen)**: Alle Pflegeleistungen mit Preisvergleich (Ambulanter Dienst vs. Auxilium)
- **Beratung (/beratung)**: Vollständige Übersicht über Pflegeversicherungsleistungen
- **Kontakt (/kontakt)**: Kontaktformular + FAQ-Akkordeon
- **Impressum & Datenschutz**: Einfache rechtliche Seiten
- **404-Seite**: Freundliche Fehlerseite

### 🎨 Design-Highlights
- Modernes, responsives Design mit Orangeakzenten (Markenfarbe #E87722)
- Playfair Display (Headings) + Inter (Body) Schriftpair
- Animierte Hero-Section mit schwebendem Mockup
- Scroll-triggered Animationen (Intersection Observer)
- Sticky Navigation mit Scroll-Effekt
- Mobile-first responsive Layouts
- Barrierefreiheit: ARIA-Labels, semantisches HTML

## Seitenstruktur

| Seite | URL | Beschreibung |
|-------|-----|--------------|
| Start | `/` | Hauptseite mit Hero, Features, Leistungsvorschau |
| Über Auxilium | `/ueber-auxilium` | Über Kristina Bronner & das Unternehmen |
| Leistungen | `/leistungen` | Alle Leistungen mit transparenten Preisen |
| Beratung | `/beratung` | Pflegeversicherungsleistungen im Detail |
| Kontakt | `/kontakt` | Kontaktformular + FAQ |
| Impressum | `/impressum` | Rechtliche Angaben |
| Datenschutz | `/datenschutz` | Datenschutzerklärung |

## Technische Details

### Stack
- **Backend**: Hono v4 (Cloudflare Workers)
- **Build**: Vite + @hono/vite-build
- **CSS**: Custom CSS mit CSS Custom Properties (kein Framework)
- **JS**: Vanilla JavaScript (kein Framework)
- **Fonts**: Google Fonts (Inter + Playfair Display)
- **Icons**: Font Awesome 6

### Lokale Entwicklung
```bash
npm run build     # Produktions-Build
pm2 start ecosystem.config.cjs  # Server starten
curl http://localhost:3000       # Testen
```

### Deployment (Cloudflare Pages)
```bash
npm run build
npx wrangler pages deploy dist --project-name auxilium-forst
```

## Deployment
- **Platform**: Cloudflare Pages
- **Port**: 3000 (lokal)
- **Status**: ✅ Lokal aktiv

## Nächste Schritte
- [ ] Echte Kontaktdaten (Telefon, Adresse) eintragen
- [ ] Kontaktformular mit Backend verbinden (E-Mail-Versand via Resend/SendGrid)
- [ ] Echter Cloudflare Pages Deployment
- [ ] SEO-Optimierung (Meta-Tags, Sitemap)
- [ ] Google Maps / Kartenintegration auf Kontaktseite
- [ ] Ggf. Blog/Neuigkeiten-Sektion

---
*Erstellt April 2026 – Auxilium Pflegeberatung Forst*
