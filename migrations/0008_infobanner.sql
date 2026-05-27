-- Migration 0008: Info-Banner System
-- Ersetzt den alten Urlaubsmodus durch ein modernes Modal-Banner-System

-- Neue Settings-Einträge für den Info-Banner
INSERT OR IGNORE INTO settings (key, value) VALUES ('banner_active', '0');
INSERT OR IGNORE INTO settings (key, value) VALUES ('banner_title', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('banner_icon', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('banner_text', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('banner_bg_image', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('banner_bg_enabled', '0');
INSERT OR IGNORE INTO settings (key, value) VALUES ('banner_interval_minutes', '60');

-- Alte Urlaubsmodus-Einträge bleiben erhalten (vacation_active, vacation_text)
-- werden aber nicht mehr im Frontend verwendet
