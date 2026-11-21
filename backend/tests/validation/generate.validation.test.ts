import { beforeEach, expect, test, vi } from "vitest";
import supertest from "supertest";
import { app } from "../../src/app.js";
import { COUNT_LIMITS, GAMES, PLATFORMS } from "../../src/Resources.js";
import { generateSuggestions } from "../../src/services/aiService.js";

// Der Service wird durch eine Attrappe ersetzt. So testen wir nur die Validierung
// und können prüfen, ob und womit der Service aufgerufen wurde.
// vi.mock wird von Vitest automatisch an den Anfang der Datei verschoben,
// also bevor app.ts den echten Service importiert.
vi.mock("../../src/services/aiService.js", () => ({
    generateSuggestions: vi.fn(),
}));

const validBody = {
    url: "https://www.youtube.com/watch?v=abc123",
    game: "fortnite",
    platforms: ["tiktok"],
    description: "1 gegen 4 mit wenig Leben gewonnen",
    counts: { hooks: 3, captions: 1, hashtags: 5, titles: 2 },
};

beforeEach(() => {
    vi.mocked(generateSuggestions).mockReset();
    vi.mocked(generateSuggestions).mockResolvedValue({
        results: [{ platform: "tiktok", hooks: ["Hook"], captions: ["Caption"], hashtags: ["#gaming"], titles: [] }],
        source: "description",
    });
});

function postGenerate(body: object) {
    return supertest(app).post("/api/generate").send(body);
}

// Prüft eine Ablehnung: Status 400, ein Fehler für genau dieses Feld,
// und der Service wurde gar nicht erst aufgerufen.
function expectRejected(response: supertest.Response, field: string) {
    expect(response.status).toBe(400);
    const fields = response.body.errors.map((error: { path: string }) => error.path);
    expect(fields).toContain(field);
    expect(generateSuggestions).not.toHaveBeenCalled();
}

// ---------- gültige Eingaben ----------

test("POST /api/generate, gültige Eingaben werden angenommen", async () => {
    const response = await postGenerate(validBody);

    expect(response.status).toBe(200);
    expect(generateSuggestions).toHaveBeenCalledWith(validBody);
});

test("POST /api/generate, zusätzliche Properties im Body werden ignoriert", async () => {
    const response = await postGenerate({
        ...validBody,
        isAdmin: true,
        apiKey: "geheim",
        counts: { ...validBody.counts, extra: 99 },
    });

    expect(response.status).toBe(200);
    // toHaveBeenCalledWith vergleicht exakt: Zusätzliche Felder würden den Test scheitern lassen.
    // Das gilt auch für das zusätzliche Feld innerhalb von counts.
    expect(generateSuggestions).toHaveBeenCalledWith(validBody);
});

test("POST /api/generate, Leerzeichen um Link und Beschreibung werden entfernt", async () => {
    const response = await postGenerate({
        ...validBody,
        url: "  https://www.youtube.com/watch?v=abc123  ",
        description: "  1 gegen 4 mit wenig Leben gewonnen  ",
    });

    expect(response.status).toBe(200);
    expect(generateSuggestions).toHaveBeenCalledWith(validBody);
});

test("POST /api/generate, ungültige Eingabe liefert Fehler ohne interne Details", async () => {
    const response = await postGenerate({ ...validBody, url: "https://boese-seite.de" });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe("Bitte gib einen gültigen YouTube-Link an.");
    expect(JSON.stringify(response.body)).not.toContain("stack");
});

test("POST /api/generate, leerer Body wird mit Fehlern für alle Felder abgelehnt", async () => {
    const response = await postGenerate({});

    expect(response.status).toBe(400);
    const fields = response.body.errors.map((error: { path: string }) => error.path);
    expect(fields).toEqual([
        "url",
        "game",
        "platforms",
        "description",
        "counts.hooks",
        "counts.captions",
        "counts.hashtags",
        "counts.titles",
    ]);
    expect(generateSuggestions).not.toHaveBeenCalled();
});

// ---------- url ----------
// Die vielen Hostname-Tricks testen wir ausführlich in tests/services/urlValidation.test.ts.
// Hier prüfen wir, dass die Route die Allowlist wirklich benutzt, und die Typ-Prüfungen.

test("POST /api/generate, fehlende URL", async () => {
    // undefined-Werte lässt JSON.stringify weg, das Feld fehlt also im Request
    expectRejected(await postGenerate({ ...validBody, url: undefined }), "url");
});

test.each([
    ["eine Zahl", 123],
    ["ein Array", ["https://www.youtube.com/watch?v=abc123"]],
    ["ein Objekt", { href: "https://www.youtube.com/watch?v=abc123" }],
    ["null", null],
    ["ein leerer Text", ""],
    ["nur Leerzeichen", "   "],
])("POST /api/generate, URL ist %s", async (_name, url) => {
    expectRejected(await postGenerate({ ...validBody, url }), "url");
});

test("POST /api/generate, URL länger als 2048 Zeichen", async () => {
    const url = "https://www.youtube.com/watch?v=" + "a".repeat(2048);
    expectRejected(await postGenerate({ ...validBody, url }), "url");
});

test.each([
    "http://www.youtube.com/watch?v=abc123",
    "javascript:alert(1)",
    "https://youtube.com.boese-seite.de/watch?v=abc123",
    "https://youtube.com@boese-seite.de/watch?v=abc123",
    "https://nutzer:passwort@www.youtube.com/watch?v=abc123",
    "https://boese-seite.de/youtube.com",
    "https://www.tiktok.com/@spieler/video/1234567890",
    "https://medal.tv/games/fortnite/clips/abc123",
])("POST /api/generate, Link %s wird abgelehnt", async (url) => {
    expectRejected(await postGenerate({ ...validBody, url }), "url");
});

// ---------- game ----------

test.each(GAMES)("POST /api/generate, Spiel %s wird angenommen", async (game) => {
    const response = await postGenerate({ ...validBody, game });
    expect(response.status).toBe(200);
});

test("POST /api/generate, fehlendes Spiel", async () => {
    expectRejected(await postGenerate({ ...validBody, game: undefined }), "game");
});

test.each([
    ["ein unbekanntes Spiel", "fifa"],
    ["großgeschrieben", "Fortnite"],
    ["ein leerer Text", ""],
    ["ein Array", ["fortnite"]],
    ["eine Zahl", 1],
])("POST /api/generate, Spiel ist %s", async (_name, game) => {
    expectRejected(await postGenerate({ ...validBody, game }), "game");
});

// ---------- platforms ----------

test.each(PLATFORMS)("POST /api/generate, Plattform %s allein wird angenommen", async (platform) => {
    const response = await postGenerate({ ...validBody, platforms: [platform] });
    expect(response.status).toBe(200);
});

test("POST /api/generate, alle drei Plattformen zusammen werden angenommen", async () => {
    const platforms = ["tiktok", "instagram", "youtube-shorts"];
    const response = await postGenerate({ ...validBody, platforms });

    expect(response.status).toBe(200);
    expect(generateSuggestions).toHaveBeenCalledWith({ ...validBody, platforms });
});

test("POST /api/generate, fehlende Plattformen", async () => {
    expectRejected(await postGenerate({ ...validBody, platforms: undefined }), "platforms");
});

// Fehler, die die Liste als Ganzes betreffen (Pfad "platforms")
test.each([
    ["eine leere Liste", []],
    ["ein Text statt einer Liste", "tiktok"],
    ["eine Zahl", 1],
    ["null", null],
    ["ein Objekt", { 0: "tiktok" }],
    ["eine Liste mit doppeltem Eintrag", ["tiktok", "tiktok"]],
    ["eine Liste mit mehr als drei Einträgen", ["tiktok", "instagram", "youtube-shorts", "tiktok"]],
])("POST /api/generate, Plattformen sind %s", async (_name, platforms) => {
    expectRejected(await postGenerate({ ...validBody, platforms }), "platforms");
});

// Fehler in einem einzelnen Eintrag (Pfad "platforms[1]", also der zweite Eintrag)
test.each([
    ["eine unbekannte Plattform", "facebook"],
    ["großgeschrieben", "TikTok"],
    ["ein leerer Text", ""],
    ["ein verschachteltes Array", ["instagram"]],
    ["eine Zahl", 1],
])("POST /api/generate, zweiter Plattform-Eintrag ist %s", async (_name, secondEntry) => {
    expectRejected(await postGenerate({ ...validBody, platforms: ["tiktok", secondEntry] }), "platforms[1]");
});

// ---------- description ----------

test("POST /api/generate, Beschreibung mit genau 500 Zeichen wird angenommen", async () => {
    const response = await postGenerate({ ...validBody, description: "a".repeat(500) });
    expect(response.status).toBe(200);
});

test("POST /api/generate, fehlende Beschreibung", async () => {
    expectRejected(await postGenerate({ ...validBody, description: undefined }), "description");
});

test.each([
    ["ein leerer Text", ""],
    ["nur Leerzeichen", "     "],
    ["501 Zeichen lang", "a".repeat(501)],
    ["eine Zahl", 123],
    ["ein Array", ["Beschreibung"]],
])("POST /api/generate, Beschreibung ist %s", async (_name, description) => {
    expectRejected(await postGenerate({ ...validBody, description }), "description");
});

// ---------- counts ----------

test("POST /api/generate, Anzahl 1 in jeder Kategorie wird angenommen", async () => {
    const counts = { hooks: 1, captions: 1, hashtags: 1, titles: 1 };
    const response = await postGenerate({ ...validBody, counts });
    expect(response.status).toBe(200);
});

test("POST /api/generate, Höchstwerte in jeder Kategorie werden angenommen", async () => {
    const response = await postGenerate({ ...validBody, counts: COUNT_LIMITS });
    expect(response.status).toBe(200);
});

test("POST /api/generate, fehlende Anzahl", async () => {
    const response = await postGenerate({ ...validBody, counts: undefined });

    expectRejected(response, "counts.hooks");
    expectRejected(response, "counts.captions");
    expectRejected(response, "counts.hashtags");
    expectRejected(response, "counts.titles");
});

test("POST /api/generate, Anzahl ist kein Objekt", async () => {
    expectRejected(await postGenerate({ ...validBody, counts: 5 }), "counts.hooks");
});

// Jede Kategorie mit jedem ungültigen Wert testen.
// flatMap baut daraus eine Liste aller Kombinationen, z. B. ["hooks", "0", 0].
const countFields = ["hooks", "captions", "hashtags", "titles"] as const;
const invalidCountCases = countFields.flatMap((field) => [
    [field, "0", 0],
    [field, "der Höchstwert + 1", COUNT_LIMITS[field] + 1],
    [field, "negativ", -1],
    [field, "eine Kommazahl", 1.5],
    [field, "ein Text", "1"],
    [field, "ein Array", [1]],
    [field, "null", null],
    [field, "ein Wahrheitswert", true],
    [field, "nicht vorhanden", undefined],
] as const);

test.each(invalidCountCases)("POST /api/generate, Anzahl %s ist %s", async (field, _name, value) => {
    const counts = { ...validBody.counts, [field]: value };
    expectRejected(await postGenerate({ ...validBody, counts }), `counts.${field}`);
});
