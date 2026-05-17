-- Kontaktformular-Einstellungen
INSERT OR IGNORE INTO settings (key, label, value) VALUES
  -- E-Mail-Empfänger
  ('form_recipient_email', 'Formular: Empfänger-E-Mail', 'info@auxilium-forst.com'),
  ('form_recipient_name',  'Formular: Empfänger-Name',   'Auxilium – Kristina Bronner'),
  -- reCAPTCHA v3
  ('recaptcha_site_key',   'reCAPTCHA: Site Key (öffentlich)',  ''),
  ('recaptcha_secret_key', 'reCAPTCHA: Secret Key (geheim)',    ''),
  -- Betreff-Optionen (| getrennt)
  ('form_subjects', 'Formular: Betreff-Optionen (eine pro Zeile)',
   'Kostenloses Erstgespräch
Pflegeberatung
Frage zu Leistungen & Preisen
Verhinderungspflege
Allgemeines');
