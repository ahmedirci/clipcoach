// Die erlaubten Werte stehen nur hier. Der Validator nutzt die Arrays,
// TypeScript leitet daraus die Typen ab. "as const" macht aus dem Array
// eine feste Liste genau dieser Texte (statt nur "string[]").
export const GAMES = ["fortnite", "overwatch", "minecraft", "rocket-league", "valorant"] as const;
export type Game = (typeof GAMES)[number];

export const PLATFORMS = ["tiktok", "instagram", "youtube-shorts"] as const;
export type Platform = (typeof PLATFORMS)[number];

// Worauf die Vorschläge beruhen: nur auf der Beschreibung oder zusätzlich auf der Videoanalyse
export type ResultSource = "description" | "video";

export type GenerateRequestResource = {
    url: string;
    game: Game;
    platform: Platform;
    description: string;
};

export type GenerateResultResource = {
    hooks: string[];
    caption: string;
    hashtags: string[];
    titles: string[];
    source: ResultSource;
};
