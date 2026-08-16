# Environments – Übersicht

## Zwei Cloudflare-Accounts, zwei Datenbanken

| | Preview (du) | Production (Kunde) |
|---|---|---|
| **Account** | skrenkovic@web.de | info@auxilium-forst.de |
| **Account-ID** | e729413088eda8a33175369d605f848e | 01a55be0f87bb4bc753c62cd8d7a8d82 |
| **D1-DB-ID** | bcab4d11-9f48-4a86-92d1-946581c71e97 | df13dc06-7ed8-4334-bb9a-d683a35dad50 |
| **Pages-Projekt** | auxilium-forst | auxilium-forst (im Kunden-Account) |
| **API-Token** | CLOUDFLARE_API_TOKEN (gesetzt) | Kunden-Token nötig (s.u.) |

---

## Wie du deployest

### → Auf DEINEN Account (testen)
```bash
npm run deploy:preview
```
Schreibt in **deine** D1 (`bcab4d11...`). Erreichbar unter `auxilium.skrenkovic.de`.

### → Auf KUNDEN-Account (beim Kunden live schalten)
```bash
CLOUDFLARE_API_TOKEN=<KUNDEN-TOKEN> npm run deploy:production
```
Schreibt in die **Kunden-D1** (`df13dc06...`). Erreichbar unter `auxilium-forst.de`.

> **Kunden-API-Token holen:**
> Kunde öffnet → https://dash.cloudflare.com/profile/api-tokens
> → „Create Token" → Template „Edit Cloudflare Workers" → Token kopieren

---

## Datenbank-Befehle

### Deine Test-DB direkt abfragen
```bash
npm run db:preview -- --command="SELECT * FROM settings"
```

### Kunden-DB direkt abfragen
```bash
CLOUDFLARE_API_TOKEN=<KUNDEN-TOKEN> npm run db:production -- --command="SELECT * FROM settings"
```

### Migrationen auf Kunden-DB anwenden
```bash
CLOUDFLARE_API_TOKEN=<KUNDEN-TOKEN> npm run db:production:migrations
```

### Sync-Script auf Kunden-DB anwenden
```bash
CLOUDFLARE_API_TOKEN=<KUNDEN-TOKEN> npm run db:production:sync
```

---

## Warum Backend-Änderungen in die falsche DB gehen

Das Backend (Admin-Panel) schreibt immer in die D1-Datenbank, die zum
**deployten Worker** gehört. Das heißt:

- Du öffnest `auxilium.skrenkovic.de/admin` → schreibt in **deine** DB ✅
- Kunde öffnet `auxilium-forst.de/admin` → schreibt in **Kunden-DB** ✅

Solange du auf **deiner** Preview-URL testest, sind beide sauber getrennt.

---

## Workflow für Änderungen

```
1. Lokal entwickeln / testen
        ↓
2. npm run deploy:preview         ← deine Test-URL, deine DB
        ↓
3. Testen auf auxilium.skrenkovic.de
        ↓
4. CLOUDFLARE_API_TOKEN=<KUNDEN-TOKEN> npm run deploy:production
        ↓
5. git push bronner main          ← Code beim Kunden-GitHub sichern
```
