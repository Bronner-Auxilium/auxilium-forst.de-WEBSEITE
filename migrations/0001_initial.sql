-- Leistungen Tabelle
CREATE TABLE IF NOT EXISTS leistungen (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  subtitle    TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT 'fa-star',
  description TEXT NOT NULL DEFAULT '',
  price_new   TEXT NOT NULL DEFAULT '',
  price_old   TEXT NOT NULL DEFAULT '',
  price_note  TEXT NOT NULL DEFAULT '',
  savings     TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seiteninhalte (Impressum, Datenschutz)
CREATE TABLE IF NOT EXISTS page_content (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  page_key   TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin-Session (einfacher Token-Store)
CREATE TABLE IF NOT EXISTS admin_sessions (
  token      TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed: Leistungen
INSERT OR IGNORE INTO leistungen (slug, title, subtitle, icon, description, price_new, price_old, price_note, savings, sort_order) VALUES
('grosse-koerperpflege', 'Große Körperpflege', 'Baden / Duschen · ca. 35 Min', 'fa-shower',
 'Unterstützung beim Duschen oder Baden inkl. An- und Auskleiden, Zahnpflege und Mobilisierung im Bad.',
 '35,00 €', '42,69 €', 'Ambulanter Dienst', 'Sie sparen: 7,69 € pro Einsatz', 1),

('kleine-koerperpflege', 'Kleine Körperpflege', '„Katzenwäsche" · ca. 20 Min', 'fa-hands',
 'Körperpflege am Waschbecken morgens und/oder abends: Oberkörper, Rücken, Intimbereich sowie Zahnpflege.',
 '21,00 €', '28,55 €', 'Ambulanter Dienst', 'Sie sparen: 7,55 € pro Einsatz', 2),

('einkauf', 'Einkauf', 'Immer frische Lebensmittel', 'fa-shopping-bag',
 'Sie haben Schwierigkeiten beim Einkaufen? Lassen Sie uns schauen, was Sie brauchen – und Sie bekommen es!',
 '15,00 €', '17,33 €', 'je angef. Viertelstunde (amb. Dienst)', 'Günstiger als ambulanter Dienst', 3),

('betreuung', 'Pflegerische Betreuung', 'Stets gut umsorgt', 'fa-hands-helping',
 'Gesellschaft beim Essen, Spaziergänge, Tagesausflüsse und vieles mehr. Was wünschen Sie sich?',
 '15,00 €', '17,33 €', 'je angef. Viertelstunde (amb. Dienst)', 'Günstiger als ambulanter Dienst', 4),

('alltagsorganisation', 'Alltagsorganisation', 'Im Alltag alles im Griff', 'fa-calendar-alt',
 'Termine vereinbaren, Arztbesuche, Friseur, Behördengänge – und falls der Alltag im Chaos versinkt: Auxilium hilft.',
 '15,00 €', '17,33 €', 'je angef. Viertelstunde (amb. Dienst)', 'Günstiger als ambulanter Dienst', 5);

-- Seed: Seiteninhalte
INSERT OR IGNORE INTO page_content (page_key, title, content) VALUES
('impressum', 'Impressum', '<h2>Angaben gemäß § 5 TMG</h2>
<p><strong>Kristina Bronner</strong></p>
<p>Auxilium – Pflegeberatung &amp; Pflegeleistungen</p>
<p>Forst (Baden)</p>
<p>Deutschland</p>
<h3>Kontakt</h3>
<p>E-Mail: <a href="mailto:info@auxilium-forst.com">info@auxilium-forst.com</a></p>'),

('datenschutz', 'Datenschutzerklärung', '<h2>Datenschutz auf einen Blick</h2>
<p>Die Betreiberin dieser Website nimmt den Schutz Ihrer persönlichen Daten ernst. Wir behandeln Ihre Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften.</p>
<h3>Kontaktformular</h3>
<p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben zwecks Bearbeitung gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
<h3>Verantwortliche Stelle</h3>
<p>Kristina Bronner, Auxilium, Forst (Baden) – <a href="mailto:info@auxilium-forst.com">info@auxilium-forst.com</a></p>');
