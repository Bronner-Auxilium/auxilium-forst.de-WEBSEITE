-- Auxilium D1 Datenbank-Export (lokal)
-- Exportiert am: 2026-08-16 09:07:48
-- Datenbank: auxilium-production
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
BEGIN TRANSACTION;
CREATE TABLE _cf_METADATA (
        key INTEGER PRIMARY KEY,
        value BLOB
      );
INSERT INTO "_cf_METADATA" VALUES(2,1417);
CREATE TABLE admin_sessions (
  token      TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "admin_sessions" VALUES('379bc570-14ee-4605-a293-1fca42cb502b','2026-04-26 15:13:07');
INSERT INTO "admin_sessions" VALUES('80fe533e-2e6c-4929-8b04-7904d4ed45cd','2026-05-25 10:42:07');
INSERT INTO "admin_sessions" VALUES('c54964e5-e0e2-406f-818c-2e96544ecef2','2026-05-27 11:30:34');
INSERT INTO "admin_sessions" VALUES('4ed5adce-b203-4f4c-a0b0-d1bfbffaf0fb','2026-07-30 16:11:08');
CREATE TABLE backups (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  size_bytes   INTEGER NOT NULL DEFAULT 0,
  type         TEXT NOT NULL DEFAULT 'manual',  
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
, dump_data TEXT NOT NULL DEFAULT '');
CREATE TABLE contact_submissions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name  TEXT    NOT NULL,
  last_name   TEXT    NOT NULL,
  city        TEXT,
  phone       TEXT,
  email       TEXT    NOT NULL,
  subject     TEXT,
  message     TEXT    NOT NULL,
  privacy     INTEGER NOT NULL DEFAULT 1,
  mail_sent   INTEGER NOT NULL DEFAULT 0,  
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "contact_submissions" VALUES(1,'Maria','Muster','Forst',NULL,'maria@beispiel.de','Pflegeberatung','Bitte um Rückruf.',1,0,'2026-08-07 13:25:51');
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" VALUES(1,'0001_initial.sql','2026-05-17 18:07:25');
INSERT INTO "d1_migrations" VALUES(2,'0002_faq.sql','2026-05-17 18:07:25');
INSERT INTO "d1_migrations" VALUES(3,'0003_settings.sql','2026-05-17 18:07:26');
INSERT INTO "d1_migrations" VALUES(4,'0004_form_settings.sql','2026-05-17 18:07:26');
INSERT INTO "d1_migrations" VALUES(5,'0005_kategorien.sql','2026-05-18 12:28:04');
INSERT INTO "d1_migrations" VALUES(6,'0006_features.sql','2026-05-19 12:35:46');
INSERT INTO "d1_migrations" VALUES(7,'0007_salary_ga_testimonials_backup.sql','2026-05-20 12:45:04');
INSERT INTO "d1_migrations" VALUES(8,'0008_infobanner.sql','2026-05-27 11:24:44');
INSERT INTO "d1_migrations" VALUES(9,'0009_banner_opacity.sql','2026-05-28 11:21:06');
INSERT INTO "d1_migrations" VALUES(10,'0010_banner_bg_ts.sql','2026-06-05 11:07:34');
INSERT INTO "d1_migrations" VALUES(11,'0011_contact_phone.sql','2026-08-07 13:22:23');
INSERT INTO "d1_migrations" VALUES(12,'0012_testimonials.sql','2026-08-07 13:22:23');
INSERT INTO "d1_migrations" VALUES(13,'0013_ratgeber.sql','2026-08-07 13:22:23');
INSERT INTO "d1_migrations" VALUES(14,'0014_contact_submissions.sql','2026-08-07 13:22:24');
CREATE TABLE faqs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active     INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "faqs" VALUES(6,'Wer kann Auxilium nutzen?','Auxilium richtet sich an Pflegegeldempfänger, Personen die Verhinderungspflege oder den Entlastungsbetrag nutzen wollen, sowie Privatzahler/-innen.',1,1,'2026-04-26 13:24:15','2026-04-26 13:24:15');
INSERT INTO "faqs" VALUES(7,'Ist das Erstgespräch wirklich kostenlos?','Ja, das Erstgespräch ist vollständig kostenlos und unverbindlich. Es dient dazu, Ihre Bedürfnisse kennenzulernen und die passende Unterstützung zu finden.',2,1,'2026-04-26 13:24:15','2026-04-26 13:24:15');
INSERT INTO "faqs" VALUES(8,'Kann ich Auxilium über die Pflegekasse abrechnen?','Ja! Auxilium kann über Verhinderungspflege und den Entlastungsbetrag abgerechnet werden. Ich zeige Ihnen alle Möglichkeiten und helfe Ihnen dabei.',3,1,'2026-04-26 13:24:15','2026-04-26 13:24:15');
INSERT INTO "faqs" VALUES(9,'In welchen Bereichen ist Auxilium tätig?','Auxilium ist in Forst (Baden) und der Umgebung tätig. Die Wegpauschale hängt vom Einsatzort ab und wird vorab transparent kommuniziert.',4,1,'2026-04-26 13:24:15','2026-04-26 13:24:15');
INSERT INTO "faqs" VALUES(10,'Wie unterscheidet sich Auxilium von einem ambulanten Pflegedienst?','Auxilium ist günstiger als klassische ambulante Dienste, persönlicher und flexibler. Ich bin Ihr direkter Ansprechpartner – ohne Vermittlung, ohne Umwege.',5,1,'2026-04-26 13:24:15','2026-04-26 13:24:15');
INSERT INTO "faqs" VALUES(11,'Wer kann Auxilium nutzen?','Auxilium richtet sich an Pflegegeldempfänger, Personen die Verhinderungspflege oder den Entlastungsbetrag nutzen wollen, sowie Privatzahler/-innen.',1,1,'2026-05-17 18:07:25','2026-05-17 18:07:25');
INSERT INTO "faqs" VALUES(12,'Ist das Erstgespräch wirklich kostenlos?','Ja, das Erstgespräch ist vollständig kostenlos und unverbindlich. Es dient dazu, Ihre Bedürfnisse kennenzulernen und die passende Unterstützung zu finden.',2,1,'2026-05-17 18:07:25','2026-05-17 18:07:25');
INSERT INTO "faqs" VALUES(13,'Kann ich Auxilium über die Pflegekasse abrechnen?','Ja! Auxilium kann über Verhinderungspflege und den Entlastungsbetrag abgerechnet werden. Ich zeige Ihnen alle Möglichkeiten und helfe Ihnen dabei.',3,1,'2026-05-17 18:07:25','2026-05-17 18:07:25');
INSERT INTO "faqs" VALUES(14,'In welchen Bereichen ist Auxilium tätig?','Auxilium ist in Forst (Baden) und der Umgebung tätig. Die Wegpauschale hängt vom Einsatzort ab und wird vorab transparent kommuniziert.',4,1,'2026-05-17 18:07:25','2026-05-17 18:07:25');
INSERT INTO "faqs" VALUES(15,'Wie unterscheidet sich Auxilium von einem ambulanten Pflegedienst?','Auxilium ist günstiger als klassische ambulante Dienste, persönlicher und flexibler. Ich bin Ihr direkter Ansprechpartner – ohne Vermittlung, ohne Umwege.',5,1,'2026-05-17 18:07:25','2026-05-17 18:07:25');
CREATE TABLE kategorien (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT 'fa-folder',
  description TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "kategorien" VALUES(1,'koerperpflege','Körperpflege','fa-shower','Unterstützung bei der täglichen Körperhygiene und Mobilisation',1,1,'2026-05-18 12:28:04');
INSERT INTO "kategorien" VALUES(2,'betreuung','Betreuung & Gesellschaft','fa-hands-helping','Pflegerische Betreuung, Gesellschaft und soziale Aktivitäten',2,1,'2026-05-18 12:28:04');
INSERT INTO "kategorien" VALUES(3,'hauswirtschaft','Hauswirtschaft','fa-broom','Einkauf, Haushaltshilfe und Alltagsorganisation',3,1,'2026-05-18 12:28:04');
INSERT INTO "kategorien" VALUES(4,'pflegeberatung','Pflegeberatung','fa-graduation-cap','Beratung zu Pflegeansprüchen, Pflegeversicherung und Finanzierung',4,1,'2026-05-18 12:28:04');
INSERT INTO "kategorien" VALUES(5,'verhinderungspflege','Verhinderungspflege','fa-calendar-alt','Vertretung der Hauptpflegeperson – für Urlaub, Krankheit oder Erholung',5,1,'2026-05-18 12:28:04');
INSERT INTO "kategorien" VALUES(6,'sonstiges','Sonstige Leistungen','fa-ellipsis-h','Weitere individuelle Leistungen nach Absprache',6,1,'2026-05-18 12:28:04');
CREATE TABLE leistungen (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  subtitle    TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT 'fa-star',
  description TEXT NOT NULL DEFAULT '',
  price_new   TEXT NOT NULL DEFAULT '',
  price_old   TEXT NOT NULL DEFAULT '',
  price_note  TEXT NOT NULL DEFAULT '',
  savings     TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
, kategorie_slug TEXT NOT NULL DEFAULT '');
INSERT INTO "leistungen" VALUES(21,'grosse-koerperpflege','Große Körperpflege','Baden / Duschen','fa-shower','Unterstützung beim Duschen oder Baden inkl. An- und Auskleiden, Zahnpflege und Mobilisierung im Bad.','35,00 €','42,69 € (Ambulanter Dienst)','Dauer ca 35 Minuten','Sie sparen: 7,69 € pro Einsatz',1,1,'2026-05-17 18:07:25','2026-05-17 18:07:25','koerperpflege');
INSERT INTO "leistungen" VALUES(22,'kleine-koerperpflege','Kleine Körperpflege','„Katzenwäsche"','fa-hands','Körperpflege am Waschbecken morgens und/oder abends: Oberkörper, Rücken, Intimbereich sowie Zahnpflege.','21,00 €','28,55 € (Ambulanter Dienst)','','Sie sparen: 7,55 € pro Einsatz',2,1,'2026-05-17 18:07:25','2026-05-17 18:07:25','koerperpflege');
INSERT INTO "leistungen" VALUES(23,'einkauf','Einkauf','Immer frische Lebensmittel','fa-shopping-bag','Sie haben Schwierigkeiten beim Einkaufen? Lassen Sie uns schauen, was Sie brauchen – und Sie bekommen es!','15,00 €','17,33 € (Ambulanter Dienst)','je angefangene Viertelstunde','Günstiger als ambulanter Dienst',3,1,'2026-05-17 18:07:25','2026-05-17 18:07:25','hauswirtschaft');
INSERT INTO "leistungen" VALUES(24,'betreuung','Pflegerische Betreuung','Stets gut umsorgt','fa-hands-helping','Gesellschaft beim Essen, Spaziergänge, Tagesausflüsse und vieles mehr. Was wünschen Sie sich?','15,00 €','17,33 € (Ambulanter Dienst)','je angefangene Viertelstunde','Günstiger als ambulanter Dienst',4,1,'2026-05-17 18:07:25','2026-05-17 18:07:25','betreuung');
INSERT INTO "leistungen" VALUES(25,'alltagsorganisation','Alltagsorganisation','Im Alltag alles im Griff','fa-calendar-alt','Termine vereinbaren, Arztbesuche, Friseur, Behördengänge – und falls der Alltag im Chaos versinkt: Auxilium hilft.','15,00 €','17,33 € (Ambulanter Dienst)','je angefangene Viertelstunde','Günstiger als ambulanter Dienst',5,1,'2026-05-17 18:07:25','2026-05-17 18:07:25','hauswirtschaft');
CREATE TABLE page_content (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  page_key   TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "page_content" VALUES(3,'impressum','Impressum','<h2>Angaben gemäß § 5 <s style="color: rgb(230, 0, 0);"><u>TMG</u></s></h2><p><strong>Kristina Bronner</strong></p><p>Auxilium – Pflegeberatung &amp; Pflegeleistungen</p><p>Forst (Baden)</p><p>Deutschland</p><h3>Kontakt</h3><p>E-Mail: <a href="mailto:info@auxilium-forst.com" rel="noopener noreferrer" target="_blank">info@auxilium-forst.com</a></p>','2026-04-26 13:24:15');
INSERT INTO "page_content" VALUES(4,'datenschutz','Datenschutzerklärung','<h2>Datenschutz <strong><u>Testseite</u></strong></h2><p>Die Betreiberin dieser Website nimmt den Schutz Ihrer persönlichen Daten ernst. Wir behandeln Ihre Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften.</p><h3>Kontaktformular</h3><p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben zwecks Bearbeitung gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p><h3>Verantwortliche Stelle</h3><p>Kristina Bronner, Auxilium, Forst (Baden) – <a href="mailto:info@auxilium-forst.com" rel="noopener noreferrer" target="_blank">info@auxilium-forst.com</a></p>','2026-04-26 13:24:15');
CREATE TABLE ratgeber (
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
CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "settings" VALUES('funding_title','VERHINDERUNGSPFLEGE + KURZZEITPFLEGE','Funding-Box: Überschrift','2026-04-26 15:08:41');
INSERT INTO "settings" VALUES('funding_amount','3.539 €','Funding-Box: Betrag','2026-04-26 15:08:41');
INSERT INTO "settings" VALUES('funding_label','Jährlicher Anspruch pro Person','Funding-Box: Beschriftung','2026-04-26 15:08:41');
INSERT INTO "settings" VALUES('funding_note','Dieser Betrag ist zweckgebunden und kann vollständig für Auxilium-Leistungen genutzt werden.','Funding-Box: Hinweistext','2026-04-26 15:08:41');
INSERT INTO "settings" VALUES('contact_location','Forst (Baden) & Umgebung','Kontakt: Standort','2026-04-26 15:08:41');
INSERT INTO "settings" VALUES('contact_email','info@auxilium-forst.com','Kontakt: E-Mail','2026-04-26 15:08:41');
INSERT INTO "settings" VALUES('contact_hours','Mo–Fr · 8:00 – 18:00 Uhr','Kontakt: Öffnungszeiten','2026-04-26 15:08:41');
INSERT INTO "settings" VALUES('form_recipient_email','info@auxilium-forst.com','Formular: Empfänger-E-Mail','2026-05-17 18:01:37');
INSERT INTO "settings" VALUES('form_recipient_name','Auxilium – Kristina Bronner','Formular: Empfänger-Name','2026-05-17 18:01:37');
INSERT INTO "settings" VALUES('recaptcha_site_key','','reCAPTCHA: Site Key (öffentlich)','2026-05-17 18:01:37');
INSERT INTO "settings" VALUES('recaptcha_secret_key','','reCAPTCHA: Secret Key (geheim)','2026-05-17 18:01:37');
INSERT INTO "settings" VALUES('form_subjects','Kostenloses Erstgespräch
Pflegeberatung
Frage zu Leistungen & Preisen
Verhinderungspflege
Allgemeines','Formular: Betreff-Optionen (eine pro Zeile)','2026-05-17 18:01:37');
INSERT INTO "settings" VALUES('vacation_active','0','','2026-05-19 12:35:46');
INSERT INTO "settings" VALUES('vacation_text','Ich bin vom {von} bis {bis} im Urlaub und nicht erreichbar. In dringenden Fällen wenden Sie sich bitte an Ihren Hausarzt. Ab {bis} bin ich wieder für Sie da!','','2026-05-19 12:35:46');
INSERT INTO "settings" VALUES('ga_id','','','2026-05-20 12:45:04');
INSERT INTO "settings" VALUES('show_testimonials','1','','2026-05-20 12:45:04');
INSERT INTO "settings" VALUES('banner_active','0','','2026-05-27 11:24:44');
INSERT INTO "settings" VALUES('banner_title','','','2026-05-27 11:24:44');
INSERT INTO "settings" VALUES('banner_icon','','','2026-05-27 11:24:44');
INSERT INTO "settings" VALUES('banner_text','','','2026-05-27 11:24:44');
INSERT INTO "settings" VALUES('banner_bg_image','','','2026-05-27 11:24:44');
INSERT INTO "settings" VALUES('banner_bg_enabled','0','','2026-05-27 11:24:44');
INSERT INTO "settings" VALUES('banner_interval_minutes','60','','2026-05-27 11:24:44');
INSERT INTO "settings" VALUES('banner_bg_opacity','50','','2026-05-28 11:21:06');
INSERT INTO "settings" VALUES('banner_bg_ts','','','2026-06-05 11:07:34');
INSERT INTO "settings" VALUES('contact_phone','01575 1559177','Telefonnummer (öffentlich)','2026-06-05 11:08:31');
INSERT INTO "settings" VALUES('contact_street','c/o Autorenglück #91926, Albert-Einstein-Str. 47, 02977 Hoyerswerda','Straßenadresse','2026-06-05 11:08:31');
CREATE TABLE stellenangebote (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  subtitle     TEXT NOT NULL DEFAULT '',
  employment_type TEXT NOT NULL DEFAULT 'Vollzeit',
  location     TEXT NOT NULL DEFAULT 'Forst (Baden)',
  content      TEXT NOT NULL DEFAULT '',
  active       INTEGER NOT NULL DEFAULT 1,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
, salary TEXT NOT NULL DEFAULT '');
CREATE TABLE testimonials (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT '',
  text         TEXT NOT NULL,
  stars        INTEGER NOT NULL DEFAULT 5,
  active       INTEGER NOT NULL DEFAULT 1,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "testimonials" VALUES(1,'Familie M.','Angehörige, Forst Baden','Auxilium hat uns in einer sehr schwierigen Zeit wirklich geholfen. Kristina ist immer da, wenn man sie braucht – professionell und mit echtem Herz.',5,1,1,'2026-05-19 12:35:46');
INSERT INTO "testimonials" VALUES(2,'Elisabeth W.','Kundin, Pflegegrad 2','Ich fühle mich bei Kristina wirklich gut aufgehoben. Die Beratung war sehr hilfreich und ich wusste gar nicht, auf wie viel Unterstützung ich Anspruch habe.',5,1,2,'2026-05-19 12:35:46');
INSERT INTO "testimonials" VALUES(3,'Thomas R.','Angehöriger','Dank Auxilium konnte meine Mutter länger zuhause bleiben als wir gedacht hätten. Die individuelle Betreuung macht den Unterschied.',5,1,3,'2026-05-19 12:35:46');
INSERT INTO "testimonials" VALUES(4,'Maria S.','Tochter eines Pflegebedürftigen','Auxilium hat uns in einer sehr schwierigen Zeit wirklich geholfen. Frau Bronner ist unglaublich einfühlsam und kompetent. Wir fühlen uns bei ihr in den besten Händen.',5,1,1,'2026-06-05 11:08:33');
INSERT INTO "testimonials" VALUES(5,'Hans K.','Pflegebedürftiger','Die Betreuung ist herzlich und professionell zugleich. Endlich kann ich zu Hause bleiben und erhalte trotzdem die Hilfe, die ich brauche. Vielen Dank!',5,1,2,'2026-06-05 11:08:33');
INSERT INTO "testimonials" VALUES(6,'Renate M.','Pflegende Angehörige','Frau Bronner hat mich über alle Pflegekassen-Leistungen informiert, die ich nie für möglich gehalten hätte. Die Verhinderungspflege entlastet mich als pflegende Tochter enorm.',5,1,3,'2026-06-05 11:08:33');
INSERT INTO "testimonials" VALUES(7,'Maria S.','Tochter eines Pflegebedürftigen','Auxilium hat uns in einer sehr schwierigen Zeit wirklich geholfen. Frau Bronner ist unglaublich einfühlsam und kompetent. Wir fühlen uns bei ihr in den besten Händen.',5,1,1,'2026-08-07 13:22:23');
INSERT INTO "testimonials" VALUES(8,'Hans K.','Pflegebedürftiger','Die Betreuung ist herzlich und professionell zugleich. Endlich kann ich zu Hause bleiben und erhalte trotzdem die Hilfe, die ich brauche. Vielen Dank!',5,1,2,'2026-08-07 13:22:23');
INSERT INTO "testimonials" VALUES(9,'Renate M.','Pflegende Angehörige','Frau Bronner hat mich über alle Pflegekassen-Leistungen informiert, die ich nie für möglich gehalten hätte. Die Verhinderungspflege entlastet mich als pflegende Tochter enorm.',5,1,3,'2026-08-07 13:22:23');
CREATE INDEX idx_contact_submissions_created
  ON contact_submissions(created_at DESC);
DELETE FROM "sqlite_sequence";
INSERT INTO "sqlite_sequence" VALUES('leistungen',25);
INSERT INTO "sqlite_sequence" VALUES('page_content',6);
INSERT INTO "sqlite_sequence" VALUES('faqs',15);
INSERT INTO "sqlite_sequence" VALUES('d1_migrations',14);
INSERT INTO "sqlite_sequence" VALUES('kategorien',6);
INSERT INTO "sqlite_sequence" VALUES('testimonials',9);
INSERT INTO "sqlite_sequence" VALUES('contact_submissions',1);
COMMIT;

COMMIT;
