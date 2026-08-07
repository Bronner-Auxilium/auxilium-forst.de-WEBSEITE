-- Migration 0014: Kontaktanfragen in D1 speichern (Fallback für MailChannels)
CREATE TABLE IF NOT EXISTS contact_submissions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name  TEXT    NOT NULL,
  last_name   TEXT    NOT NULL,
  city        TEXT,
  phone       TEXT,
  email       TEXT    NOT NULL,
  subject     TEXT,
  message     TEXT    NOT NULL,
  privacy     INTEGER NOT NULL DEFAULT 1,
  mail_sent   INTEGER NOT NULL DEFAULT 0,  -- 1 = MailChannels erfolgreich
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created
  ON contact_submissions(created_at DESC);
