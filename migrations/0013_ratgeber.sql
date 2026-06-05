-- Migration 0013: Ratgeber / Blog Tabelle
CREATE TABLE IF NOT EXISTS ratgeber (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL UNIQUE,
  title       TEXT    NOT NULL,
  meta_desc   TEXT    DEFAULT '',
  category    TEXT    DEFAULT 'Ratgeber',
  intro       TEXT    DEFAULT '',
  content     TEXT    NOT NULL,
  active      INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
