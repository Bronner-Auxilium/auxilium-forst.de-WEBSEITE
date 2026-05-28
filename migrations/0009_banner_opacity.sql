-- Migration 0009: Info-Banner Hintergrundbild-Transparenz
INSERT OR IGNORE INTO settings (key, value) VALUES ('banner_bg_opacity', '50');
-- bg_enabled entfernen (wird nicht mehr benötigt - Bild ist immer aktiv wenn vorhanden)
-- Wir lassen den alten Eintrag stehen, er wird im Code ignoriert
