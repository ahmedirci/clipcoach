import type { GenerateResultResource } from "../Resources.js";

// Feste Beispieldaten für den Demo-Modus (ohne API-Key)
const DEMO_RESULT: GenerateResultResource = {
    hooks: [
        "1 gegen 4 und nur noch 20 HP...",
        "Niemand hat mit diesem Ende gerechnet",
        "Warte auf den letzten Schuss!",
    ],
    caption: "Das war der knappste Sieg meines Lebens 😅 Hättest du gepusht oder gewartet?",
    hashtags: ["#gaming", "#clutch", "#gamingclips", "#fyp"],
    titles: [
        "Der knappste Clutch aller Zeiten",
        "1v4 mit 20 HP: So habe ich gewonnen",
    ],
    source: "description",
};

/**
 * Liefert Vorschläge für Hooks, Caption, Hashtags und Titel.
 * Aktuell immer im Demo-Modus. Die KI-Anbindung folgt in Schritt 4.
 */
export async function generateSuggestions(): Promise<GenerateResultResource> {
    return DEMO_RESULT;
}
