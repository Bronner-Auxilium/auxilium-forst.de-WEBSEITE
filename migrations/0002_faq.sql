-- FAQ-Tabelle für dynamische FAQ-Verwaltung
CREATE TABLE IF NOT EXISTS faqs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active     INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed: Bestehende FAQ-Einträge von der Startseite
INSERT OR IGNORE INTO faqs (question, answer, sort_order, active) VALUES
('Wer kann Auxilium nutzen?',
 'Auxilium richtet sich an Pflegegeldempfänger, Personen die Verhinderungspflege oder den Entlastungsbetrag nutzen wollen, sowie Privatzahler/-innen.',
 1, 1),
('Ist das Erstgespräch wirklich kostenlos?',
 'Ja, das Erstgespräch ist vollständig kostenlos und unverbindlich. Es dient dazu, Ihre Bedürfnisse kennenzulernen und die passende Unterstützung zu finden.',
 2, 1),
('Kann ich Auxilium über die Pflegekasse abrechnen?',
 'Ja! Auxilium kann über Verhinderungspflege und den Entlastungsbetrag abgerechnet werden. Ich zeige Ihnen alle Möglichkeiten und helfe Ihnen dabei.',
 3, 1),
('In welchen Bereichen ist Auxilium tätig?',
 'Auxilium ist in Forst (Baden) und der Umgebung tätig. Die Wegpauschale hängt vom Einsatzort ab und wird vorab transparent kommuniziert.',
 4, 1),
('Wie unterscheidet sich Auxilium von einem ambulanten Pflegedienst?',
 'Auxilium ist günstiger als klassische ambulante Dienste, persönlicher und flexibler. Ich bin Ihr direkter Ansprechpartner – ohne Vermittlung, ohne Umwege.',
 5, 1);

-- Leistungsdaten aus Sandbox-DB (mit bearbeiteten Inhalten) sichern
-- UPSERT: Falls slug schon existiert, aktualisieren
INSERT OR REPLACE INTO leistungen (slug,title,subtitle,icon,description,price_new,price_old,price_note,savings,sort_order,active) VALUES
('grosse-koerperpflege','Große Körperpflege','Baden / Duschen','fa-shower',
 'Unterstützung beim Duschen oder Baden inkl. An- und Auskleiden, Zahnpflege und Mobilisierung im Bad.',
 '35,00 €','42,69 € (Ambulanter Dienst)','Dauer ca 35 Minuten','Sie sparen: 7,69 € pro Einsatz',1,1),
('kleine-koerperpflege','Kleine Körperpflege','„Katzenwäsche"','fa-hands',
 'Körperpflege am Waschbecken morgens und/oder abends: Oberkörper, Rücken, Intimbereich sowie Zahnpflege.',
 '21,00 €','28,55 € (Ambulanter Dienst)','','Sie sparen: 7,55 € pro Einsatz',2,1),
('einkauf','Einkauf','Immer frische Lebensmittel','fa-shopping-bag',
 'Sie haben Schwierigkeiten beim Einkaufen? Lassen Sie uns schauen, was Sie brauchen – und Sie bekommen es!',
 '15,00 €','17,33 € (Ambulanter Dienst)','je angefangene Viertelstunde','Günstiger als ambulanter Dienst',3,1),
('betreuung','Pflegerische Betreuung','Stets gut umsorgt','fa-hands-helping',
 'Gesellschaft beim Essen, Spaziergänge, Tagesausflüsse und vieles mehr. Was wünschen Sie sich?',
 '15,00 €','17,33 € (Ambulanter Dienst)','je angefangene Viertelstunde','Günstiger als ambulanter Dienst',4,1),
('alltagsorganisation','Alltagsorganisation','Im Alltag alles im Griff','fa-calendar-alt',
 'Termine vereinbaren, Arztbesuche, Friseur, Behördengänge – und falls der Alltag im Chaos versinkt: Auxilium hilft.',
 '15,00 €','17,33 € (Ambulanter Dienst)','je angefangene Viertelstunde','Günstiger als ambulanter Dienst',5,1);

-- Test-Eintrag entfernen
DELETE FROM leistungen WHERE slug='test';
