-- ============================================================
-- Migration 0006: Stellenangebote, Testimonials, Urlaubsmodus, Backups
-- ============================================================

-- ─── Stellenangebote ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stellenangebote (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  subtitle     TEXT NOT NULL DEFAULT '',
  employment_type TEXT NOT NULL DEFAULT 'Vollzeit',
  location     TEXT NOT NULL DEFAULT 'Forst (Baden)',
  content      TEXT NOT NULL DEFAULT '',
  active       INTEGER NOT NULL DEFAULT 1,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── Testimonials / Kundenstimmen ────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT '',
  text         TEXT NOT NULL,
  stars        INTEGER NOT NULL DEFAULT 5,
  active       INTEGER NOT NULL DEFAULT 1,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed: Beispiel-Testimonials
INSERT OR IGNORE INTO testimonials (name, role, text, stars, active, sort_order) VALUES
  ('Familie M.', 'Angehörige, Forst Baden', 'Auxilium hat uns in einer sehr schwierigen Zeit wirklich geholfen. Kristina ist immer da, wenn man sie braucht – professionell und mit echtem Herz.', 5, 1, 1),
  ('Elisabeth W.', 'Kundin, Pflegegrad 2', 'Ich fühle mich bei Kristina wirklich gut aufgehoben. Die Beratung war sehr hilfreich und ich wusste gar nicht, auf wie viel Unterstützung ich Anspruch habe.', 5, 1, 2),
  ('Thomas R.', 'Angehöriger', 'Dank Auxilium konnte meine Mutter länger zuhause bleiben als wir gedacht hätten. Die individuelle Betreuung macht den Unterschied.', 5, 1, 3);

-- ─── Urlaubsmodus Settings ────────────────────────────────────
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('vacation_active', '0'),
  ('vacation_text', 'Ich bin vom {von} bis {bis} im Urlaub und nicht erreichbar. In dringenden Fällen wenden Sie sich bitte an Ihren Hausarzt. Ab {bis} bin ich wieder für Sie da!');

-- ─── Backups Tabelle ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS backups (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  size_bytes   INTEGER NOT NULL DEFAULT 0,
  type         TEXT NOT NULL DEFAULT 'manual',  -- 'manual' | 'auto'
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
