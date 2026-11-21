// Die erlaubten Werte stehen nur hier. Der Validator nutzt die Arrays,
// TypeScript leitet daraus die Typen ab. "as const" macht aus dem Array
// eine feste Liste genau dieser Texte (statt nur "string[]").
// ClipCoach ist bewusst nur für Valorant, deshalb gibt es keine Spielauswahl.
export const PLATFORMS = ["tiktok", "instagram", "youtube-shorts"] as const;
export type Platform = (typeof PLATFORMS)[number];

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
};

// Vorschläge für genau eine Plattform
export type PlatformSuggestionsResource = {
    platform: Platform;
    hooks: string[];
    captions: string[];
    hashtags: string[];
    // Nur bei YouTube Shorts gefüllt, sonst immer eine leere Liste
    titles: string[];
};

export type GenerateResultResource = {
    // Ein Eintrag pro gewählter Plattform, in derselben Reihenfolge wie im Request
    results: PlatformSuggestionsResource[];
    source: ResultSource;
};
