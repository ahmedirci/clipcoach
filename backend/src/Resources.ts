// Die erlaubten Werte stehen nur hier. Der Validator nutzt die Arrays,
// TypeScript leitet daraus die Typen ab. "as const" macht aus dem Array
// eine feste Liste genau dieser Texte (statt nur "string[]").
// ClipCoach ist bewusst nur für Valorant, deshalb gibt es keine Spielauswahl.
export const PLATFORMS = ["tiktok", "instagram", "youtube-shorts"] as const;
export type Platform = (typeof PLATFORMS)[number];

// Alle Valorant-Agents, Schreibweise wie auf playvalorant.com/de-de/agents (Stand 21.11.2026).
// Die Liste muss bei neuen Agents ergänzt werden. Das KI-Modell muss einen Agent
// nicht kennen: Der Name wird als Text an die KI geschickt.
export const AGENTS = [
    "Astra", "Breach", "Brimstone", "Chamber", "Clove", "Cypher", "Deadlock", "Fade",
    "Gekko", "Harbor", "Hush", "Iso", "Jett", "KAY/O", "Killjoy", "Miks", "Neon", "Omen",
    "Phoenix", "Raze", "Reyna", "Sage", "Skye", "Sova", "Tejo", "Veto", "Viper", "Vyse",
    "Waylay", "Yoru",
] as const;
export type Agent = (typeof AGENTS)[number];

// Valorant-Ränge vom niedrigsten zum höchsten (ohne Stufen wie "Gold 2")
export const RANKS = [
    "Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant",
] as const;
export type Rank = (typeof RANKS)[number];

// Valorant-Maps laut playvalorant.com/de-de/maps (Stand 21.11.2026), alphabetisch.
// Der Typ heißt GameMap statt Map, weil Map in JavaScript schon eine eingebaute Klasse ist.
export const MAPS = [
    "Abyss", "Ascent", "Bind", "Breeze", "Corrode", "Fracture", "Haven",
    "Icebox", "Lotus", "Pearl", "Split", "Summit", "Sunset",
] as const;
export type GameMap = (typeof MAPS)[number];

// Höchstwerte für die gewünschte Anzahl an Vorschlägen pro Kategorie
export const COUNT_LIMITS = {
    hooks: 5,
    captions: 3,
    hashtags: 10,
    titles: 4,
} as const;

// Gewünschte Anzahl pro Kategorie, jeweils von 1 bis zum Höchstwert in COUNT_LIMITS
export type SuggestionCounts = {
    hooks: number;
    captions: number;
    hashtags: number;
    titles: number;
};

// Worauf die Vorschläge beruhen: nur auf der Beschreibung oder zusätzlich auf der Videoanalyse
export type ResultSource = "description" | "video";

export type GenerateRequestResource = {
    url: string;
    platforms: Platform[];
    description: string;
    counts: SuggestionCounts;
    // Optional: der Agent, den der Nutzer im Clip spielt. Fehlt er, wird kein Agent genannt.
    agent?: Agent;
    // Optional: der Rank des Nutzers. Fehlt er, wird kein Rank genannt.
    rank?: Rank;
    // Optional: die Map des Clips. Fehlt sie, wird nur eine Map aus der Beschreibung genannt.
    map?: GameMap;
};

// Vorschläge für genau eine Plattform
export type PlatformSuggestionsResource = {
    platform: Platform;
    hooks: string[];
    captions: string[];
    hashtags: string[];
    // Nur bei YouTube Shorts gefüllt, sonst immer eine leere Liste
    titles: string[];
    // Unsichtbare Such-Tags für YouTube (ohne "#", zusammen höchstens 500 Zeichen).
    // Nur bei YouTube Shorts gefüllt, sonst immer eine leere Liste.
    tags: string[];
};

export type GenerateResultResource = {
    // Ein Eintrag pro gewählter Plattform, in derselben Reihenfolge wie im Request
    results: PlatformSuggestionsResource[];
    source: ResultSource;
};
