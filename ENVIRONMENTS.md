# Environments – Übersicht

## Zwei Cloudflare-Accounts, zwei Datenbanken

| | Mein Account (nur DB-Zugriff) | Production (Kunde) |
|---|---|---|
| **Account** | skrenkovic@web.de | info@auxilium-forst.de |
| **Account-ID** | e729413088eda8a33175369d605f848e | 01a55be0f87bb4bc753c62cd8d7a8d82 |
| **D1-DB-ID** | bcab4d11-9f48-4a86-92d1-946581c71e97 | df13dc06-7ed8-4334-bb9a-d683a35dad50 |
| **Pages-Projekt** | ~~auxilium-forst~~ (nicht mehr genutzt) | auxilium-forst-de-webseite |
| **API-Token** | CLOUDFLARE_API_TOKEN (gesetzt) | CF_TOKEN_KUNDE (in .env.local gesetzt) |

> ⚠️ **Ab sofort wird NUR noch auf den Kunden-Account deployed!**

---

## Deploy

```bash
npm run deploy
```

Das ist der **einzige Deploy-Befehl**. Er deployt immer direkt auf den Kunden-Account (`auxilium-forst-de-webseite`).

- Kunden-Token ist im Script hartcodiert ✅
- Kunden-Account-ID ist im Script hartcodiert ✅
- Kein separater „Preview-Deploy" auf meinen Account mehr

---

## Datenbank-Befehle

### Kunden-DB abfragen
```bash
npm run db:production -- --command="SELECT * FROM settings"
```

### Migrationen auf Kunden-DB anwenden
```bash
npm run db:production:migrations
```

### Sync-Script auf Kunden-DB anwenden
```bash
npm run db:production:sync
```

### Meine Test-DB abfragen (nur für lokale Dev-Zwecke)
```bash
npm run db:preview -- --command="SELECT * FROM settings"
```

---

## Workflow für Änderungen

```
1. Code ändern
       ↓
2. npm run deploy   ← baut + deployed direkt auf auxilium-forst.de
       ↓
3. git push origin main
       ↓
4. git push bronner main
```

---

## Warum kein Preview-Account mehr?

Deploys auf den eigenen Account (`auxilium-forst`) wurden eingestellt,
da alle Änderungen direkt beim Kunden live getestet werden.
Die wrangler.jsonc (mein Account) bleibt für lokale D1-Abfragen erhalten.
