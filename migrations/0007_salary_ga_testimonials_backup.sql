-- ============================================================
-- Migration 0007: Gehaltsfeld, Google Analytics, Testimonials-Toggle, Backup-Dump
-- ============================================================

-- ─── Stellenangebote: Gehaltsfeld hinzufügen ─────────────────
ALTER TABLE stellenangebote ADD COLUMN salary TEXT NOT NULL DEFAULT '';

-- ─── Backups: dump_data Feld hinzufügen (JSON-Snapshot) ───────
ALTER TABLE backups ADD COLUMN dump_data TEXT NOT NULL DEFAULT '';

-- ─── Settings: Google Analytics + Testimonials-Toggle ─────────
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('ga_id',              ''),
  ('show_testimonials',  '1');
