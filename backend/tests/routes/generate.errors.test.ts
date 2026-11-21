import { beforeEach, expect, test, vi } from "vitest";
import supertest from "supertest";
import { app } from "../../src/app.js";
import { AiRateLimitError, AiServiceError, AiUnavailableError, generateSuggestions } from "../../src/services/aiService.js";

// Nur generateSuggestions wird ersetzt, die echten Fehlerklassen bleiben erhalten
vi.mock("../../src/services/aiService.js", async (importOriginal) => {
    const original = await importOriginal<typeof import("../../src/services/aiService.js")>();
    return { ...original, generateSuggestions: vi.fn() };
});

const validBody = {
    url: "https://www.youtube.com/watch?v=abc123DEF45",
    game: "fortnite",
    platforms: ["tiktok"],
    description: "1 gegen 4 mit wenig Leben gewonnen",
    counts: { hooks: 3, captions: 1, hashtags: 5, titles: 2 },
};

beforeEach(() => {
    vi.mocked(generateSuggestions).mockReset();
    // Die Fehlerausgabe des Routers im Test unterdrücken (und prüfbar machen)
    vi.spyOn(console, "error").mockImplementation(() => {});
});

function postGenerate() {
    return supertest(app).post("/api/generate").send(validBody);
}

test("POST /api/generate, Gemini-Kontingent erschöpft liefert 503 mit Meldung", async () => {
    vi.mocked(generateSuggestions).mockRejectedValue(new AiRateLimitError("Gemini-Kontingent erschöpft"));

    const response = await postGenerate();

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
        errors: [{ msg: "Nutzungslimit erreicht. Bitte versuche es nach einiger Zeit erneut." }],
    });
});

test("POST /api/generate, KI überlastet liefert 503 mit eigener Meldung", async () => {
    vi.mocked(generateSuggestions).mockRejectedValue(new AiUnavailableError("Gemini ist überlastet"));

    const response = await postGenerate();

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
        errors: [{ msg: "Die KI ist gerade überlastet. Bitte versuche es in ein paar Minuten erneut." }],
    });
});

test("POST /api/generate, Fehler im KI-Service liefert 500 ohne interne Details", async () => {
    vi.mocked(generateSuggestions).mockRejectedValue(
        new AiServiceError("KI-Antwort ist kein gültiges JSON"),
    );

    const response = await postGenerate();

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ errors: [{ msg: "Interner Serverfehler" }] });
    expect(JSON.stringify(response.body)).not.toContain("JSON");
});

test("POST /api/generate, unerwarteter Fehler liefert 500 ohne interne Details", async () => {
    vi.mocked(generateSuggestions).mockRejectedValue(new Error("geheimes internes Detail"));

    const response = await postGenerate();

    expect(response.status).toBe(500);
    expect(JSON.stringify(response.body)).not.toContain("geheim");
});

test("POST /api/generate, Fehler wird im Server-Log ausgegeben", async () => {
    const error = new AiServiceError("Gemini-Anfrage fehlgeschlagen");
    vi.mocked(generateSuggestions).mockRejectedValue(error);

    await postGenerate();

    expect(console.error).toHaveBeenCalledWith("Fehler beim Erzeugen der Vorschläge:", error);
});
