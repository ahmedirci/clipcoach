export type Game = "fortnite" | "overwatch" | "rocket-league";

export type Platform = "tiktok" | "instagram" | "youtube-shorts";

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
