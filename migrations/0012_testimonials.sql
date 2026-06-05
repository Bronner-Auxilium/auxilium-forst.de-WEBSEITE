-- Migration 0012: Testimonials / Kundenstimmen Tabelle
CREATE TABLE IF NOT EXISTS testimonials (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  role        TEXT    DEFAULT '',
  text        TEXT    NOT NULL,
  stars       INTEGER NOT NULL DEFAULT 5,
  active      INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- show_testimonials Setting
INSERT OR IGNORE INTO settings (key, value, label) VALUES
  ('show_testimonials', '1', 'Kundenstimmen auf Startseite anzeigen');

-- Beispiel-Testimonials
INSERT OR IGNORE INTO testimonials (name, role, text, stars, active, sort_order) VALUES
  ('Maria S.',   'Tochter eines Pflegebedürftigen',
   'Auxilium hat uns in einer sehr schwierigen Zeit wirklich geholfen. Frau Bronner ist unglaublich einfühlsam und kompetent. Wir fühlen uns bei ihr in den besten Händen.',
   5, 1, 1),
  ('Hans K.',    'Pflegebedürftiger',
   'Die Betreuung ist herzlich und professionell zugleich. Endlich kann ich zu Hause bleiben und erhalte trotzdem die Hilfe, die ich brauche. Vielen Dank!',
   5, 1, 2),
  ('Renate M.',  'Pflegende Angehörige',
   'Frau Bronner hat mich über alle Pflegekassen-Leistungen informiert, die ich nie für möglich gehalten hätte. Die Verhinderungspflege entlastet mich als pflegende Tochter enorm.',
   5, 1, 3);
