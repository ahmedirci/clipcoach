# ClipCoach

ClipCoach hilft Gamern, ihre Clips aus Fortnite, Overwatch und Rocket League erfolgreicher auf TikTok, Instagram und YouTube Shorts zu posten. Man gibt einen Link zum Clip und eine kurze Beschreibung ein und bekommt von einer KI Vorschläge für Hooks, Caption, Hashtags und Titel.

> **Status:** in Entwicklung. Dies ist ein privates Lernprojekt.

## Fahrplan

- [x] 1. Projektstruktur, Git-Repo, `.gitignore`, README-Grundgerüst
- [ ] 2. Backend: Express-Server mit TypeScript, Endpunkt `POST /api/generate` mit Beispieldaten (Demo-Modus)
- [ ] 3. Validierung: URL-Allowlist und Eingabeprüfung mit express-validator, mit Tests
- [ ] 4. KI-Anbindung mit Google Gemini auf Basis der Beschreibung
  - [ ] 4b. Videoanalyse für YouTube-Links mit Fallback auf die Beschreibung
- [ ] 5. Frontend: Formular und Ergebnisanzeige
- [ ] 6. Absicherung: Rate Limiting, helmet, CORS, Fehlerbehandlung
- [ ] 7. Videovorschau per oEmbed
- [ ] 8. README mit Screenshots, Setup-Anleitung und Erklärung der Sicherheitsentscheidungen

## Geplante Funktionen

1. Link zum Clip einfügen (YouTube, TikTok oder Medal.tv)
2. Spiel und Zielplattform wählen und den Clip kurz beschreiben
3. Die KI liefert:
   - Hooks für die ersten 3 Sekunden
   - eine Caption
   - passende Hashtags
   - Titelvorschläge
4. Bei YouTube-Links analysiert die KI zusätzlich das Video selbst (Bild und Ton). Die App zeigt ehrlich an, ob die Vorschläge auf der Videoanalyse oder nur auf der Beschreibung beruhen.

## Tech-Stack

| Bereich  | Technik                                                              |
| -------- | -------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, eigenes CSS                              |
| Backend  | Node.js, TypeScript, Express 5, express-validator                    |
| KI       | Google Gemini API (`@google/genai`), nur im Backend                  |
| Sicherheit | helmet, cors, express-rate-limit                                   |
| Tests    | Vitest, supertest, Testing Library                                   |

## Projektstruktur (geplant)

```
clipcoach/
├── frontend/              React + Vite + TypeScript
│   ├── src/
│   │   ├── components/    React-Komponenten
│   │   ├── api.ts         alle Aufrufe ans Backend an einer Stelle
│   │   └── Resources.ts   gemeinsame Typen (Request/Response)
│   └── tests/
└── backend/               Express + TypeScript
    ├── src/
    │   ├── routes/        Express-Router (HTTP rein/raus, Validierung)
    │   ├── services/      Logik, z. B. KI-Aufruf und URL-Prüfung
    │   ├── app.ts         Express-App ohne listen() (für Tests)
    │   └── index.ts       Serverstart
    └── tests/
        ├── routes/
        ├── services/
        └── validation/
```

## Sicherheitsentscheidungen (Überblick)

- **Keine Datei-Uploads und keine eigenen Video-Downloads.** Clips werden nur per Link angegeben.
- **URL-Allowlist:** Nur `https`-Links zu YouTube, TikTok und Medal.tv sind erlaubt. Der Hostname wird exakt geprüft, damit Tricks wie `youtube.com.boese-seite.de` nicht durchkommen.
- **Validierung im Backend:** Das Backend vertraut dem Frontend nie und prüft alle Eingaben selbst.
- **API-Key nur im Backend:** Der Key steht in `backend/.env`, die nicht ins Repo kommt.
- **Rate Limiting, helmet und CORS** schützen die API.
- **KI-Ausgabe wird als reiner Text angezeigt**, nie als HTML.

Eine ausführliche Erklärung folgt in Schritt 8.

## Setup

Folgt, sobald Backend und Frontend lauffähig sind.

Geplant ist ein **Demo-Modus:** Ohne API-Key liefert das Backend feste Beispieldaten. So kann jeder das Projekt ohne Key und ohne Kosten ausprobieren.

## Lizenz

[MIT](LICENSE)
