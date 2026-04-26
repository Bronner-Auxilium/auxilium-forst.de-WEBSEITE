-- Seiteneinstellungen (key-value)
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Funding-Box (Startseite + Leistungsseite)
INSERT OR IGNORE INTO settings (key, label, value) VALUES
  ('funding_title',  'Funding-Box: Überschrift',  'VERHINDERUNGSPFLEGE + KURZZEITPFLEGE'),
  ('funding_amount', 'Funding-Box: Betrag',        '3.539 €'),
  ('funding_label',  'Funding-Box: Beschriftung',  'Jährlicher Anspruch pro Person'),
  ('funding_note',   'Funding-Box: Hinweistext',   'Dieser Betrag ist zweckgebunden und kann vollständig für Auxilium-Leistungen genutzt werden.');

-- Kontaktdaten (Footer + Kontaktseite)
INSERT OR IGNORE INTO settings (key, label, value) VALUES
  ('contact_location', 'Kontakt: Standort',        'Forst (Baden) & Umgebung'),
  ('contact_email',    'Kontakt: E-Mail',           'info@auxilium-forst.com'),
  ('contact_hours',    'Kontakt: Öffnungszeiten',   'Mo–Fr · 8:00 – 18:00 Uhr');
