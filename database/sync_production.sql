-- ============================================================
-- Produktions-Sync: FAQs + Testimonials aktualisieren
-- Erstellt: 2026-08-16
-- ============================================================

-- -------------------------------------------------------
-- FAQs: Veraltete Texte durch aktuelle ersetzen
-- -------------------------------------------------------
DELETE FROM faqs;

INSERT INTO faqs (id, question, answer, sort_order, active, created_at, updated_at) VALUES
(11, 'Wer kann Auxilium nutzen?',
 'Auxilium richtet sich an Pflegegeldempfänger, Personen die Verhinderungspflege oder den Entlastungsbetrag nutzen wollen, sowie Privatzahler/-innen.',
 1, 1, '2026-05-17 18:07:25', '2026-05-17 18:07:25'),

(12, 'Ist das Erstgespräch wirklich kostenlos?',
 'Ja, das Erstgespräch ist vollständig kostenlos und unverbindlich. Es dient dazu, Ihre Bedürfnisse kennenzulernen und die passende Unterstützung zu finden.',
 2, 1, '2026-05-17 18:07:25', '2026-05-17 18:07:25'),

(13, 'Kann ich Auxilium über die Pflegekasse abrechnen?',
 'Ja! Auxilium kann über Verhinderungspflege und den Entlastungsbetrag abgerechnet werden. Ich zeige Ihnen alle Möglichkeiten und helfe Ihnen dabei.',
 3, 1, '2026-05-17 18:07:25', '2026-05-17 18:07:25'),

(14, 'In welchen Bereichen ist Auxilium tätig?',
 'Auxilium ist in Forst (Baden) und der Umgebung tätig. Die Wegpauschale hängt vom Einsatzort ab und wird vorab transparent kommuniziert.',
 4, 1, '2026-05-17 18:07:25', '2026-05-17 18:07:25'),

(15, 'Wie unterscheidet sich Auxilium von einem ambulanten Pflegedienst?',
 'Auxilium ist günstiger als klassische ambulante Dienste, persönlicher und flexibler. Ich bin Ihr direkter Ansprechpartner – ohne Vermittlung, ohne Umwege.',
 5, 1, '2026-05-17 18:07:25', '2026-05-17 18:07:25');

-- sqlite_sequence für faqs aktualisieren
UPDATE sqlite_sequence SET seq = 15 WHERE name = 'faqs';

-- -------------------------------------------------------
-- Testimonials: Auf neueste Texte bringen
-- -------------------------------------------------------
DELETE FROM testimonials;

INSERT INTO testimonials (id, name, role, text, stars, active, sort_order, created_at) VALUES
(7, 'Maria S.', 'Tochter eines Pflegebedürftigen',
 'Auxilium hat uns in einer sehr schwierigen Zeit wirklich geholfen. Frau Bronner ist unglaublich einfühlsam und kompetent. Wir fühlen uns bei ihr in den besten Händen.',
 5, 1, 1, '2026-08-07 13:22:23'),

(8, 'Hans K.', 'Pflegebedürftiger',
 'Die Betreuung ist herzlich und professionell zugleich. Endlich kann ich zu Hause bleiben und erhalte trotzdem die Hilfe, die ich brauche. Vielen Dank!',
 5, 1, 2, '2026-08-07 13:22:23'),

(9, 'Renate M.', 'Pflegende Angehörige',
 'Frau Bronner hat mich über alle Pflegekassen-Leistungen informiert, die ich nie für möglich gehalten hätte. Die Verhinderungspflege entlastet mich als pflegende Tochter enorm.',
 5, 1, 3, '2026-08-07 13:22:23');

-- sqlite_sequence für testimonials aktualisieren
UPDATE sqlite_sequence SET seq = 9 WHERE name = 'testimonials';
