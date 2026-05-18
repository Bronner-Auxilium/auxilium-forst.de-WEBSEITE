-- Kategorien-Tabelle für Leistungen
CREATE TABLE IF NOT EXISTS kategorien (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT 'fa-folder',
  description TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Kategorie-Spalte zu leistungen hinzufügen
ALTER TABLE leistungen ADD COLUMN kategorie_slug TEXT NOT NULL DEFAULT '';

-- Standard-Kategorien für Frau Bronner
INSERT OR IGNORE INTO kategorien (slug, name, icon, description, sort_order) VALUES
  ('koerperpflege',       'Körperpflege',             'fa-shower',         'Unterstützung bei der täglichen Körperhygiene und Mobilisation', 1),
  ('betreuung',           'Betreuung & Gesellschaft', 'fa-hands-helping',  'Pflegerische Betreuung, Gesellschaft und soziale Aktivitäten', 2),
  ('hauswirtschaft',      'Hauswirtschaft',            'fa-broom',          'Einkauf, Haushaltshilfe und Alltagsorganisation', 3),
  ('pflegeberatung',      'Pflegeberatung',            'fa-graduation-cap', 'Beratung zu Pflegeansprüchen, Pflegeversicherung und Finanzierung', 4),
  ('verhinderungspflege', 'Verhinderungspflege',       'fa-calendar-alt',   'Vertretung der Hauptpflegeperson – für Urlaub, Krankheit oder Erholung', 5),
  ('sonstiges',           'Sonstige Leistungen',       'fa-ellipsis-h',     'Weitere individuelle Leistungen nach Absprache', 6);

-- Bestehende Leistungen den passenden Kategorien zuordnen
UPDATE leistungen SET kategorie_slug = 'koerperpflege'  WHERE slug IN ('grosse-koerperpflege', 'kleine-koerperpflege');
UPDATE leistungen SET kategorie_slug = 'hauswirtschaft' WHERE slug IN ('einkauf', 'alltagsorganisation');
UPDATE leistungen SET kategorie_slug = 'betreuung'      WHERE slug = 'betreuung';
