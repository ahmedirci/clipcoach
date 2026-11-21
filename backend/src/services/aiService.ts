import type {
    GenerateRequestResource,
    GenerateResultResource,
    Platform,
    PlatformSuggestionsResource,
} from "../Resources.js";

// Feste Beispieldaten für den Demo-Modus (ohne API-Key).
// Jede Liste hat genau so viele Einträge wie der Höchstwert in COUNT_LIMITS,
// damit wir für jede erlaubte Anzahl genug Beispiele haben.
const DEMO_HOOKS = [
    "1 gegen 4 und nur noch 20 HP...",
    "Niemand hat mit diesem Ende gerechnet",
    "Warte auf den letzten Schuss!",
    "Das hier war eigentlich schon verloren",
    "Schau, was in Sekunde 5 passiert",
];

const DEMO_CAPTIONS = [
    "Das war der knappste Sieg meines Lebens 😅 Hättest du gepusht oder gewartet?",
    "Ich dachte, das war's ... dann kam dieser Moment 🔥",
    "Clutch-Momente wie dieser sind der Grund, warum ich spiele 🎮",
];

const DEMO_HASHTAGS = [
    "#gaming",
    "#clutch",
    "#gamingclips",
    "#fyp",
    "#gamer",
    "#highlights",
    "#epic",
    "#win",
    "#viral",
    "#gameplay",
];

const DEMO_TITLES = [
    "Der knappste Clutch aller Zeiten",
    "1v4 mit 20 HP: So habe ich gewonnen",
    "Dieses Ende glaubt mir keiner",
    "Mein bester Moment in diesem Jahr",
];

// Titel gibt es nur bei YouTube Shorts. TikTok und Instagram haben keinen Videotitel.
function supportsTitles(platform: Platform): boolean {
    return platform === "youtube-shorts";
}

function createDemoResult(request: GenerateRequestResource): GenerateResultResource {
    const { counts } = request;

    // Für jede gewählte Plattform einen Eintrag bauen. slice(0, n) nimmt die ersten n Einträge.
    const results: PlatformSuggestionsResource[] = request.platforms.map((platform) => ({
        platform,
        hooks: DEMO_HOOKS.slice(0, counts.hooks),
        captions: DEMO_CAPTIONS.slice(0, counts.captions),
        hashtags: DEMO_HASHTAGS.slice(0, counts.hashtags),
        titles: supportsTitles(platform) ? DEMO_TITLES.slice(0, counts.titles) : [],
    }));

    return { results, source: "description" };
}

/**
 * Liefert pro gewählter Plattform Vorschläge für Hooks, Captions, Hashtags und Titel.
 * Bekommt nur bereits validierte Daten.
 * Aktuell immer im Demo-Modus. Die Gemini-Anbindung folgt in Schritt 4b.
 */
export async function generateSuggestions(request: GenerateRequestResource): Promise<GenerateResultResource> {
    return createDemoResult(request);
}
