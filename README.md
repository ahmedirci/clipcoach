# ClipCoach

**Für Valorant.** ClipCoach hilft Valorant-Spielern, ihre Clips erfolgreicher auf TikTok, Instagram und YouTube Shorts zu posten. Man gibt einen YouTube-Link zum Clip und eine kurze Beschreibung ein und bekommt von einer KI Vorschläge für Hooks, Captions, Hashtags und Titel.

> **Status:** in Entwicklung. Dies ist ein privates Lernprojekt.

## Fahrplan

- [x] 1. Projektstruktur, Git-Repo, `.gitignore`, README-Grundgerüst
- [x] 2. Backend: Express-Server mit TypeScript, Endpunkt `POST /api/generate` mit Beispieldaten (Demo-Modus)
- [x] 3. Validierung: URL-Allowlist und Eingabeprüfung mit express-validator, mit Tests
- [ ] 4. KI-Anbindung
  - [x] 4a. Mehrere Plattformen und einstellbare Anzahl der Vorschläge (Demo-Modus)
  - [x] 4b. Anbindung an Google Gemini auf Basis der Beschreibung
  - [x] 4c. Videoanalyse für YouTube-Links mit Fallback auf die Beschreibung
  - [x] 4d. Fokus auf Valorant und genauere Erkennung von Agent, Waffen und Highlights
  - [x] 4e. Valorant-Kontext (typische Highlights), Hashtag-Strategie und YouTube-Tags
- [ ] 5. Frontend: Formular und Ergebnisanzeige
- [ ] 6. Absicherung: Rate Limiting, helmet, CORS, Fehlerbehandlung
- [ ] 7. Videovorschau per oEmbed
- [ ] 8. README mit Screenshots, Setup-Anleitung und Erklärung der Sicherheitsentscheidungen

## Geplante Funktionen

1. YouTube-Link zum Clip einfügen (Video oder Short)
2. Eine oder mehrere Zielplattformen wählen, die gewünschte Anzahl an Vorschlägen einstellen, optional den gespielten Agent, den eigenen Rank und die Map auswählen und den Clip kurz beschreiben
3. Die KI liefert pro Plattform, in der Sprache der Beschreibung:
   - bis zu 5 Hooks für die ersten 3 Sekunden, aufgebaut um das stärkste Highlight (z. B. Ace, 1vX-Clutch, Defuse in letzter Sekunde)
   - bis zu 3 Captions
   - bis zu 10 passende Hashtags: feste Basis (`#valorant`, `#fyp`, Plattform-Hashtag, Agent, Rank) plus clipbezogene
   - bis zu 4 Titelvorschläge und bis zu 15 Such-Tags (nur bei YouTube Shorts, da TikTok und Instagram keine Videotitel haben)
4. Ist das Video öffentlich, analysiert die KI zusätzlich das Video selbst (Bild und Ton): Waffen, Kills, Spike und den besten Moment. Den eigenen Agent und die Map übernimmt sie nur aus den Angaben des Nutzers, weil die Bilderkennung dabei in Messungen unzuverlässig war. Die App zeigt ehrlich an, ob die Vorschläge auf der Videoanalyse oder nur auf der Beschreibung beruhen.

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
- **URL-Allowlist:** Nur `https`-Links zu YouTube sind erlaubt. Der Hostname wird exakt geprüft, damit Tricks wie `youtube.com.boese-seite.de` nicht durchkommen.
- **Bewusst nur YouTube:** Nur YouTube-Videos kann die KI direkt per Link analysieren. Andere Anbieter würden eigene Video-Downloads erfordern.
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

## Hinweis zu Riot Games

ClipCoach ist ein privates Fan- und Lernprojekt und steht in keiner Verbindung zu Riot Games. Riot Games unterstützt oder sponsert dieses Projekt nicht. Valorant ist eine Marke von Riot Games, Inc.
