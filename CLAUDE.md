# ClipCoach – Projektkontext für Claude Code

## Über mich und das Ziel dieses Projekts

Ich bin Student (Medieninformatik) und bewerbe mich als Werkstudent in der Softwareentwicklung. ClipCoach ist mein privates Lernprojekt und soll in meinem GitHub-Profil zeigen, dass ich eine Full-Stack-Web-App sauber und sicher bauen kann.

**Wichtig:** Ich will jede Zeile Code verstehen und im Bewerbungsgespräch erklären können. Deshalb:

- Arbeite in kleinen Schritten, ein Feature pro Aufgabe.
- Erkläre vor größeren Änderungen kurz deinen Plan und warte auf mein OK.
- Erkläre nach jeder Änderung auf Deutsch, was du gemacht hast und warum.
- Halte den Code einfach und gut lesbar. Lieber verständlich als clever.
- Keine unnötigen Bibliotheken. Wenn du eine neue Abhängigkeit vorschlägst, begründe sie.
- Claude schreibt den gesamten Code. Ich lasse mir jede Änderung erklären, damit ich sie verstehe und vertreten kann.
- Schlage nach jedem funktionierenden Schritt einen Git-Commit mit aussagekräftiger Nachricht vor.

## Was ClipCoach macht

Eine Web-App für Gamer (Fortnite, Overwatch, Minecraft, Rocket League, Valorant), die ihre Gaming-Clips erfolgreicher auf TikTok, Instagram und YouTube Shorts posten wollen.

Ablauf:

1. Nutzer fügt einen YouTube-Link zu seinem Clip ein (normales Video oder Short). Andere Anbieter wie TikTok oder Medal.tv werden bewusst nicht unterstützt (siehe „Videoanalyse“).
2. Nutzer wählt das Spiel, eine oder mehrere Zielplattformen und wie viele Vorschläge er pro Kategorie möchte, und beschreibt den Clip kurz.
3. Das Backend prüft die Eingaben und fragt eine KI an.
   - Version 1: Die KI arbeitet mit der Beschreibung des Nutzers.
   - Version 2: Die KI analysiert zusätzlich das YouTube-Video selbst (Bild und Ton), sofern es öffentlich ist.
4. Die KI liefert **pro gewählter Plattform** eigene Vorschläge: Hooks für die ersten 3 Sekunden, Captions, Hashtags und (nur bei YouTube Shorts) Titel. Die Vorschläge sind in derselben Sprache wie die Beschreibung.
5. Das Frontend zeigt die Ergebnisse an, optional mit Videovorschau, und zeigt ehrlich an, ob das Video analysiert wurde oder nur die Beschreibung.

## Tech-Stack (immer aktuelle stabile Versionen, keine Beta-, RC- oder Snapshot-Versionen)

- **Frontend:** React 19 mit TypeScript, aufgesetzt mit Vite
- **Backend:** Node.js mit TypeScript und Express 5 (REST-API)
- **Validierung im Backend:** express-validator für `game`, `platforms`, `description` und `counts`. Die URL-Allowlist ist eine eigene Funktion (`isAllowedClipUrl` in `services/urlValidation.ts`).
- **Tests Backend:** Vitest mit supertest (im Studium Jest, die API ist fast identisch)
- **Tests Frontend:** Vitest mit @testing-library/react und @testing-library/user-event, jsdom. `fetch` wird in Tests mit `vi.spyOn` gemockt.
- **Absicherung:** express-rate-limit, helmet, cors (kenne ich alle aus dem Studium)
- **Konfiguration:** dotenv im Backend, Vite-Umgebungsvariablen (`VITE_...`) im Frontend
- **KI:** Google Gemini API (kostenloser Free Tier über Google AI Studio, ohne Kreditkarte), offizielles SDK `@google/genai`, nur im Backend
- **Styling:** eigenes, einfaches CSS (kein Bootstrap, damit es sich vom Uni-Projekt unterscheidet)
- **Editor:** VS Code, ESLint (wie im Vite-Template), Git und GitHub (öffentliches Repo)

## Projektstruktur

```
clipcoach/
├── frontend/              React + Vite + TypeScript
│   ├── src/
│   │   ├── components/    React-Komponenten
│   │   ├── api.ts         alle Aufrufe ans Backend an einer Stelle
│   │   ├── Resources.ts   gemeinsame Typen (Request/Response)
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── tests/components/
├── backend/               Express + TypeScript
│   ├── src/
│   │   ├── routes/        Express-Router (HTTP rein/raus, Validierung)
│   │   ├── services/      Logik, z. B. aiService.ts und urlValidation.ts
│   │   ├── Resources.ts   gemeinsame Typen (Request/Response)
│   │   ├── app.ts         Express-App ohne listen() (für Tests)
│   │   └── index.ts       Serverstart
│   └── tests/
│       ├── routes/
│       ├── services/
│       └── validation/
├── .gitignore
├── CLAUDE.md
└── README.md
```

## Architektur (wie im Studium, Modul Web Engineering 2)

- Schichten getrennt halten: Router → Validierung → Service.
- Router übersetzen nur HTTP-Requests in Service-Aufrufe und Ergebnisse in HTTP-Responses.
- Services enthalten die Logik und wissen nichts von Express.
- `app.ts` und der Serverstart (`index.ts` mit `listen`) sind getrennt, damit Tests die App ohne laufenden Server prüfen können.
- Typen für Request und Response stehen in `Resources.ts` (z. B. `GenerateRequestResource`, `GenerateResultResource`), im Frontend und Backend gleich aufgebaut.
- async/await statt Callbacks. `import` statt `require`.

## Mein Code-Stil (aus meinen Projekten WE2 Blatt 06 und Blatt 10, bitte so beibehalten)

### Backend

- Named Exports, z. B. `export const generateRouter = express.Router();`
- Validatoren als Arrays in Konstanten vor den Routen, z. B. `const postGenerateValidators = [...]`. Wiederkehrende Regeln als kleine Hilfsfunktionen, z. B. `const string500 = (field: string) => body(field).isString().bail().trim().isLength({ min: 1, max: 500 })`.
- Ablauf in jeder Route: `validationResult` prüfen → bei Fehlern `res.status(400).send({ errors: errors.array() })` und `return` → Daten nur über `matchedData(req, { locations: ["body"] })` holen → Service in `try/catch` aufrufen → passenden Statuscode senden.
- Einrückung 4 Leerzeichen, doppelte Anführungszeichen.

### Frontend

- Funktionskomponenten mit typisierten Props: `type XyzProps = { ... }; export function Xyz({ ... }: XyzProps) { ... }`
- Zustand mit `useState`, asynchrone Handler mit `try/catch` und einem Fehlerzustand (z. B. `const [failed, setFailed] = useState(false)`).
- Alle Backend-Aufrufe als async-Funktionen in `api.ts`, Basis-URL aus `import.meta.env.VITE_API_SERVER_URL`. Fehlerbehandlung für `fetch` gebündelt in einer kleinen Hilfsfunktion (eigene Umsetzung, ähnlich wie `fetchWithErrorHandling` im Studium).
- Formulare mit `onSubmit` und `e.preventDefault()`.
- Einrückung 2 Leerzeichen (Vite-Standard).

### Tests

- Testnamen auf Deutsch und beschreibend, im Format `"METHODE /pfad, Fall"`, z. B. `"POST /api/generate, fehlende URL"` oder `"POST /api/generate, Hostname youtube.com.boese-seite.de wird abgelehnt"`.
- Eigene Testdateien für Validierung (`tests/validation/generate.validation.test.ts`), getrennt von den normalen Routen-Tests.
- Viele Negativtests: Bei Validierung geht es vor allem um falsche Eingaben.
- Ein Test, der prüft, dass zusätzliche Properties im Body ignoriert werden (nur `matchedData` geht weiter).

## API

### `POST /api/generate`

Request:

```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "game": "fortnite | overwatch | minecraft | rocket-league | valorant",
  "platforms": ["tiktok | instagram | youtube-shorts", "..."],
  "description": "Kurze Beschreibung des Clips",
  "counts": { "hooks": 3, "captions": 1, "hashtags": 5, "titles": 2 }
}
```

- `platforms`: mindestens eine Plattform, nur feste Werte, keine doppelten Einträge.
- `counts`: Pflichtfeld, gewünschte Anzahl pro Kategorie als ganze Zahl von 1 bis zum Höchstwert. Gilt für jede gewählte Plattform gleich. Das Frontend füllt sinnvolle Standardwerte vor.

| Kategorie | Höchstwert |
| --- | --- |
| `hooks` | 5 |
| `captions` | 3 |
| `hashtags` | 10 |
| `titles` | 4 |

Response:

```json
{
  "results": [
    {
      "platform": "tiktok",
      "hooks": ["..."],
      "captions": ["..."],
      "hashtags": ["..."],
      "titles": []
    },
    {
      "platform": "youtube-shorts",
      "hooks": ["..."],
      "captions": ["..."],
      "hashtags": ["..."],
      "titles": ["..."]
    }
  ],
  "source": "description | video"
}
```

- `results` enthält pro gewählter Plattform einen Eintrag, in derselben Reihenfolge wie im Request.
- **Titel gibt es nur bei YouTube Shorts.** Bei TikTok und Instagram gibt es keinen Videotitel (dort ist die Caption der Text zum Video), deshalb ist `titles` dort immer eine leere Liste.
- `source` zeigt, worauf die Vorschläge beruhen: nur auf der Beschreibung oder zusätzlich auf der Videoanalyse (ab Version 2). `source` setzt unser Code, nie die KI.

Statuscodes:

- **400** bei ungültigen Eingaben, mit Body `{ "errors": [...] }` (Format von express-validator), ohne interne Details.
- **503**, wenn das Gemini-Kontingent erschöpft ist (Gemini antwortet mit 429), mit der Meldung „Nutzungslimit erreicht. Bitte versuche es nach einiger Zeit erneut.“ 429 ist für unser eigenes Rate Limiting (Schritt 6) reserviert, damit das Frontend beide Fälle unterscheiden kann. Später möglich: die genaue Wartezeit anzeigen (Gemini liefert oft `retryDelay` mit).
- **503**, wenn Gemini überlastet ist oder nicht rechtzeitig antwortet (Gemini antwortet mit 503 oder 504, oder unser Timeout läuft ab), mit der Meldung „Die KI ist gerade überlastet. Bitte versuche es in ein paar Minuten erneut.“ Bei uns ist dann nichts kaputt, deshalb kein 500.
- **500** bei allen anderen Fehlern, mit allgemeiner Meldung.

## KI-Anbindung

- Der gesamte KI-Aufruf steckt in genau einer Datei: `backend/src/services/aiService.ts`. Der Rest des Backends kennt den Anbieter nicht. So lässt sich der Anbieter später wechseln, ohne anderen Code anzufassen.
- **Demo-Modus:** Wenn in `backend/.env` kein `GEMINI_API_KEY` gesetzt ist, liefert `aiService.ts` feste Beispieldaten im selben JSON-Format. So kann jeder das Repo klonen und starten, ohne Key und ohne Kosten.
- **Modell:** Standard ist `gemini-3.5-flash-lite` (stabil, von Google für neue Projekte empfohlen). Im Test am 21.11.2026 antwortete es in knapp 2 Sekunden, während `gemini-3.8-flash` im Free Tier wiederholt überlastet war (503) bzw. die 30 Sekunden überschritt (504). Für die Videoanalyse (4c) gezielt prüfen, ob ein stärkeres Modell nötig ist. Über `GEMINI_MODEL` in der `.env` austauschbar, ohne den Code anzufassen, da Google Modelle regelmäßig umbenennt und abschaltet. Nur stabile Modelle verwenden, keine Preview- oder Experimental-Modelle.
- **SDK-Aufruf:** `ai.models.generateContent` mit `systemInstruction`, `responseMimeType: "application/json"` und `responseJsonSchema`. Timeout 30 Sekunden. Genau eine Gemini-Anfrage pro Nutzeranfrage:
  - keine automatischen Wiederholungen (`retryOptions` bewusst nicht gesetzt), damit ein 429 sofort als 503 beim Client ankommt
  - `automaticContinuation: false`, sonst schickt das SDK bei unfertigen Antworten selbstständig weitere Anfragen (jede mit eigenem Timeout und eigener Abrechnung)
  - `thinkingConfig: { thinkingLevel: LOW }`: Für Captions und Hashtags reicht kurzes Nachdenken; schneller und spart Kontingent. Mit Standard-Denktiefe hat `gemini-3.8-flash` im Test die 30 Sekunden überschritten.
- **Fehlerklassen:** Der Service übersetzt Gemini-Fehler in eigene Klassen; der Router kennt nur diese, nicht Gemini:
  - `AiRateLimitError`: Gemini antwortet mit 429 (Free-Tier-Limit erreicht) → 503 „Nutzungslimit erreicht …“
  - `AiUnavailableError`: Gemini antwortet mit 503 (überlastet) oder 504, oder unser Timeout läuft ab (`AbortError`) → 503 „Die KI ist gerade überlastet …“
  - `AiServiceError`: alles andere (Netzwerk, 400, 500, ungültige KI-Antwort) → 500
  - Der ursprüngliche Fehler hängt als `cause` dran und landet nur im Server-Log, nie beim Client.
- **Prompt Injection:** Die festen Regeln stehen in der System-Anweisung, getrennt von den Nutzerdaten. Die Beschreibung wird mit `JSON.stringify` als abgegrenzter Textwert eingefügt, und die KI wird angewiesen, Anweisungen darin zu ignorieren. Selbst wenn das nicht greift, schützen uns das JSON-Schema, die eigene Prüfung der Antwort und die Darstellung als reiner Text im Frontend.
- **Ein Aufruf für alle Plattformen:** Gemini wird pro Request nur einmal gefragt, auch wenn mehrere Plattformen gewählt sind. Das spart Kontingent.
- **Sprache:** Die Vorschläge kommen in derselben Sprache wie die Beschreibung.
- **KI-Antwort nicht blind vertrauen:** Gemini bekommt ein JSON-Schema vorgegeben. Die Antwort wird trotzdem im Backend geprüft (Typen, Anzahl, Plattformen), bevor sie an den Client geht. Reihenfolge und Plattformen bestimmt der Request, nicht die KI; zu viele Einträge werden gekürzt, Titel bei TikTok und Instagram verworfen.
- **Tests schicken nie echte KI-Anfragen:** `vitest.config.ts` leert `GEMINI_API_KEY` für alle Tests. Tests für die Gemini-Anbindung ersetzen das SDK mit `vi.mock("@google/genai")` und setzen einen Fake-Key mit `vi.stubEnv`.
- Im Free Tier kann Google Eingaben zum Training nutzen. Deshalb werden nur Spiel, Plattformen, gewünschte Anzahl, Clip-Beschreibung und (ab Version 2) der bereinigte YouTube-Link an die KI geschickt, keine personenbezogenen Daten.

## Videoanalyse (Version 2, Schritt 4c)

- Gemini kann YouTube-Videos direkt über den Link analysieren (Bild und Ton). Unser Server lädt dabei nichts herunter, Google holt das Video selbst. Das Video geht als eigener Teil (`fileData.fileUri`) mit, nicht im Prompt-Text.
- **Welche Videos funktionieren:** Laut Google-Doku nur öffentliche. Im Test am 21.11.2026 funktionierte auch ein nicht gelistetes Video; darauf verlassen wir uns nicht (Funktion ist bei Google „Preview“). Ein nicht existierendes Video ergab `403 PERMISSION_DENIED`.
- **Bereinigter Link:** `extractYouTubeVideoId` (in `urlValidation.ts`) holt die 11-stellige Video-ID aus `watch?v=`, `youtu.be/`, `/shorts/`, `/live/` und `/embed/`. An Gemini geht nur `https://www.youtube.com/watch?v=ID`. Alle anderen Parameter fallen weg, insbesondere `si=...`, über den YouTube nachvollziehen kann, wer den Link geteilt hat.
- **Ablauf mit Fallback** (alles im Service, Router und API-Format unverändert):
  1. Versuch mit Video und Beschreibung → `source: "video"`.
  2. Schlägt er fehl (privates Video, Timeout, Überlastung, ungültige Antwort …) → Hinweis im Server-Log (`console.warn`), dann 2. Versuch nur mit der Beschreibung → `source: "description"`.
  - Ausnahme: Bei erschöpftem Kontingent (429) gibt es keinen 2. Versuch, er würde ebenfalls scheitern.
  - Scheitern beide Versuche, kommt der Fehler des 2. Versuchs beim Router an. Schlimmster Fall: 2 × 30 Sekunden.
  - `source: "video"` setzt unser Code nur, wenn die Videoanalyse wirklich geklappt hat.
- **Kontingent sparen:** nur die ersten 3 Minuten (`videoMetadata.endOffset: "180s"`, Shorts sind maximal 3 Minuten lang) in niedriger Auflösung (`mediaResolution: MEDIA_RESOLUTION_LOW`). Gemessen: etwa 89 Tokens pro Sekunde Video, ein 35-Sekunden-Clip also rund 3.100 Tokens. Free Tier: höchstens 8 Stunden YouTube-Video pro Tag.
- **Schutz vor Trollen** (Beschreibung oder Spiel passen nicht zum Video):
  - Zusätzliche System-Anweisung im Video-Modus: Das Video ist die einzige Wahrheit über den Inhalt, Beschreibung und Spiel sind nur Hinweise und können absichtlich irreführend sein. Aus der Beschreibung wird nur die Sprache übernommen.
  - Das JSON-Schema bekommt im Video-Modus das Feld `videoContent`, das die KI per `propertyOrdering` **zuerst** ausfüllen muss (was ist im Video zu sehen?). Erst danach schreibt sie die Vorschläge. `videoContent` wird nur intern genutzt und nicht an den Client geschickt.
  - Gemessen am 21.11.2026 (Overwatch-Clip mit Minecraft-Beschreibung): nur mit Anweisung 2 von 3 Durchläufen richtig, mit `videoContent` 3 von 3.
- Nur Links, die die Allowlist bestanden haben und eine Video-ID enthalten, werden an Gemini übergeben.
- **Warum nur YouTube-Links erlaubt sind (TikTok und Medal.tv bewusst nicht):**
  - Gemini kann nur YouTube-Links direkt analysieren. Für andere Anbieter müsste der Server Clips herunterladen und hochladen. Das widerspricht der Sicherheitsentscheidung „keine Uploads, keine eigenen Video-Downloads“ und ist bei TikTok auch rechtlich heikel.
  - Ohne Videoanalyse würden die Vorschläge nur auf der Beschreibung beruhen. Nutzer könnten dann beliebige fremde Clips mit unpassenden Beschreibungen kombinieren und Vorschau und Ergebnisse zum Trollen missbrauchen.
- Videoanalyse verbraucht deutlich mehr vom kostenlosen Kontingent als Text. Rate Limiting ist hier besonders wichtig.

## Sicherheitsregeln (immer einhalten)

- **Keine Datei-Uploads und keine eigenen Video-Downloads.** Bewusste Entscheidung, um Schadsoftware, zu große Dateien und unzulässige Inhalte zu vermeiden. Clips werden nur per Link angegeben.
- **URL-Allowlist:** Links werden mit `new URL()` geparst. Erlaubt sind nur:
  - Protokoll `https:`
  - keine Zugangsdaten in der URL (`username` und `password` müssen leer sein)
  - kein eigener Port (`port` muss leer sein; der Standard-Port 443 wird vom Parser entfernt)
  - Hostname exakt in dieser Liste: `youtube.com`, `www.youtube.com`, `m.youtube.com`, `youtu.be`
  - der Link muss auf ein **einzelnes Video** zeigen (Video-ID mit genau 11 Zeichen aus Buchstaben, Ziffern, `-` und `_`). Kanäle, Playlists und die Startseite werden mit eigener Meldung abgelehnt: „Bitte gib einen Link zu einem einzelnen YouTube-Video an, nicht zu einem Kanal oder einer Playlist.“
- Niemals `startsWith` oder `includes` auf den ganzen Link anwenden, da Tricks wie `youtube.com.boese-seite.de` oder `youtube.com@boese-seite.de` sonst durchkommen.
- **Validierung doppelt:** Im Frontend für die Nutzerfreundlichkeit, im Backend als eigentliche Sicherheitsschicht. Das Backend vertraut dem Frontend nie. Nur validierte Daten (`matchedData`) gehen an die Services.
- **Eingaben begrenzen:** `game` und `platforms` nur aus festen Werten (`platforms` ohne Duplikate), `counts` nur ganze Zahlen von 1 bis zum Höchstwert, `description` mit Länge 1 bis 500 Zeichen, Request-Body-Größe in Express begrenzen (`express.json({ limit: ... })`).
- **API-Key schützen:** Der KI-API-Key steht nur in `backend/.env`. Die `.env` steht in der `.gitignore` und wird nie committet. Lege eine `backend/.env.example` ohne echten Key an. Der Key wird niemals im Frontend verwendet.
- **Rate Limiting** auf `/api/generate` mit express-rate-limit, damit niemand das kostenlose Kontingent aufbraucht.
- **helmet** für sichere HTTP-Header.
- **Fehlerbehandlung:** Keine Stacktraces oder internen Fehlermeldungen an den Client senden.
- **CORS** nur für die eigene Frontend-Adresse erlauben.
- **KI-Ausgabe** als reinen Text behandeln und im Frontend nicht als HTML rendern (kein `dangerouslySetInnerHTML`).

## Videovorschau

Für die Vorschau keine Videos selbst laden oder speichern, sondern die oEmbed-Schnittstelle von YouTube nutzen (Titel und Thumbnail).

## Fahrplan

1. Projektstruktur, Git-Repo, `.gitignore`, README-Grundgerüst
2. Backend: Express-Server mit TypeScript, Endpunkt `POST /api/generate` mit Dummy-Antwort (Demo-Modus)
3. Validierung: URL-Allowlist und Eingabeprüfung mit express-validator, mit Tests in Vitest
   - → **Ziel für die Bewerbung: Schritte 1 bis 3 auf GitHub**
4. KI-Anbindung, aufgeteilt in drei Teile:
   - 4a. Neues Request-/Response-Format (mehrere Plattformen, `counts`, `captions`, Titel nur bei YouTube Shorts) mit Validierung und Tests, zunächst im Demo-Modus
   - 4b. Gemini-Anbindung in `aiService.ts` auf Basis der Beschreibung: Prompt, JSON-Schema, Prüfung der KI-Antwort, eigene Fehlerklassen, 503 bei erschöpftem Kontingent
   - 4c. Videoanalyse für YouTube-Links mit Fallback auf die Beschreibung
5. Frontend: Formular und Ergebnisanzeige (inkl. Hinweis, ob das Video analysiert wurde). Formulare in React habe ich im Studium noch nicht vertieft (Blatt 11 war optional). Hier besonders gründlich erklären.
6. Absicherung: Rate Limiting, helmet, CORS, Fehlerbehandlung
7. Videovorschau per oEmbed
8. README mit Beschreibung, Screenshots, Setup-Anleitung und Erklärung der Sicherheitsentscheidungen (inkl. warum nur YouTube-Links erlaubt sind)

## Design

Modern und dunkel, passend zu Gaming und Social Media, gut lesbar und auch auf dem Handy nutzbar (Responsive Design mit Media Queries, kenne ich aus Web Engineering 1). Einfaches eigenes CSS, kein UI-Framework.

## Mein Vorwissen

Aus dem Studium (Web Engineering 1 und 2, BHT Berlin, WE2 bis einschließlich Blatt 10): TypeScript, Tests mit Jest und Vitest, testgetriebene Entwicklung, async/await, DOM, CSS-Layouts und Responsive Design, Express-Backend mit Routern, Services und express-validator, Tests mit supertest, JWT-Login mit Cookies, CORS, helmet, express-rate-limit, Logging mit winston, React mit Vite, React Router, fetch, Context, Error Boundaries, Komponententests mit Testing Library.

Noch nicht vertieft: Formulare in React (Blatt 11 nicht bearbeitet).

## Git-Regeln

- Keine Commits zurückdatieren. Die Historie zeigt ehrlich, wann was entstanden ist.
- Code aus Uni-Vorlagen oder vom Dozenten wird nicht ins Repo kopiert (z. B. `supertestWithAuth.ts`, `mockFetch`, `testdata.ts`, testConfig-Dateien, vorgegebene Tests, Dev-Container-Dateien, Abgabe-Skripte wie ziplocalgit/copilothistory, CI-Konfiguration). Studienprojekte dienen nur als Vorbild für Stil und Struktur. Alles in ClipCoach wird neu geschrieben.
