-- Migration 0011: Telefonnummer und Straßenadresse für Schema.org + tel:-Links
INSERT OR IGNORE INTO settings (key, value, label) VALUES
  ('contact_phone',  '01575 1559177',              'Telefonnummer (öffentlich)'),
  ('contact_street', 'c/o Autorenglück #91926, Albert-Einstein-Str. 47, 02977 Hoyerswerda', 'Straßenadresse');
