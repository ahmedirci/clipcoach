import type { Agent, Platform, Rank } from "../Resources.js";

// Was der Nutzer selbst angegeben hat (beides optional)
export type PlayerInfo = {
    agent?: Agent;
    rank?: Rank;
};

// Plattform-Hashtag, den unser Code selbst setzt. TikTok hat keinen eigenen, dort reicht #fyp.
// Record<Platform, ...> sorgt dafür, dass TypeScript meckert, wenn eine Plattform fehlt.
const PLATFORM_HASHTAGS: Record<Platform, string | null> = {
    "tiktok": null,
    "instagram": "#reels",
    "youtube-shorts": "#shorts",
};

// Längere "Hashtags" sind fast immer Fehler der KI (z. B. mehrere zusammengeklebte Wörter)
export const MAX_HASHTAG_LENGTH = 30;

// YouTube erlaubt für die unsichtbaren Tags insgesamt 500 Zeichen
export const MAX_YOUTUBE_TAGS = 15;
export const MAX_YOUTUBE_TAGS_CHARS = 500;

/**
 * Macht aus einem beliebigen Text einen sauberen Hashtag:
 * "#KAY/O" → "#kayo", "Quick Scope" → "#quickscope".
 * Gibt null zurück, wenn kein Zeichen übrig bleibt.
 */
export function normalizeHashtag(text: string): string | null {
    // \p{L} = jeder Buchstabe (auch ä, ö, ü), \p{N} = jede Ziffer. Alles andere fällt weg,
    // auch das "#" selbst, das danach wieder vorne angefügt wird.
    const word = text.toLowerCase().replace(/[^\p{L}\p{N}_]/gu, "");
    return word === "" ? null : `#${word}`;
}

/** Entfernt doppelte Einträge ohne Rücksicht auf Groß- und Kleinschreibung. Die Reihenfolge bleibt erhalten. */
function unique(items: string[]): string[] {
    const seen = new Set<string>();
    return items.filter((item) => {
        const key = item.toLowerCase();
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

/**
 * Baut die endgültige Hashtag-Liste für eine Plattform.
 *
 * Was sich sicher festlegen lässt, setzt unser Code selbst nach vorne, statt es der KI zu überlassen:
 * #valorant, den Plattform-Hashtag, #fyp und (falls angegeben) Agent und Rank.
 * Danach folgen die clipbezogenen Hashtags der KI. Doppelte fallen weg, gekürzt wird auf "count".
 */
export function finalizeHashtags(aiHashtags: string[], platform: Platform, player: PlayerInfo, count: number): string[] {
    const fixed = ["#valorant", PLATFORM_HASHTAGS[platform], "#fyp", player.agent, player.rank]
        .filter((tag): tag is string => typeof tag === "string");

    // Die KI schreibt manchmal mehrere Hashtags in einen Eintrag ("#clip #gaming").
    // Deshalb an Kommas und vor jedem weiteren "#" aufteilen, sonst würde normalizeHashtag
    // sie zu einem langen Wort zusammenkleben (in einer Messung passiert).
    // "(?=#)" heißt: Leerzeichen, auf die ein "#" folgt. So bleibt "Quick Scope" ein Hashtag.
    const fromAi = aiHashtags.flatMap((entry) => entry.split(/,|\s+(?=#)/));

    const all = [...fixed, ...fromAi]
        .map(normalizeHashtag)
        .filter((tag): tag is string => tag !== null && tag.length <= MAX_HASHTAG_LENGTH);

    return unique(all).slice(0, count);
}

/**
 * Baut die unsichtbaren Such-Tags für YouTube.
 * Vorne stehen "valorant" und (falls angegeben) Agent und Rank, danach die Tags der KI.
 * Tags dürfen Leerzeichen enthalten. Entfernt werden ein "#" am Anfang, Kommas
 * (YouTube trennt Tags mit Kommas) und spitze Klammern (bei YouTube nicht erlaubt).
 * Es kommen höchstens MAX_YOUTUBE_TAGS Tags mit zusammen höchstens MAX_YOUTUBE_TAGS_CHARS Zeichen heraus.
 */
export function finalizeYouTubeTags(aiTags: string[], player: PlayerInfo): string[] {
    const candidates = ["valorant", player.agent, player.rank, ...aiTags]
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.replace(/^#+/, "").replace(/[,<>]/g, "").replace(/\s+/g, " ").trim())
        .filter((tag) => tag.length > 0);

    const result: string[] = [];
    let usedChars = 0;
    for (const tag of unique(candidates)) {
        // Beim Eintragen steht zwischen zwei Tags ein Komma, das zählen wir mit
        const needed = tag.length + (result.length > 0 ? 1 : 0);
        if (result.length === MAX_YOUTUBE_TAGS || usedChars + needed > MAX_YOUTUBE_TAGS_CHARS) {
            break;
        }
        result.push(tag);
        usedChars += needed;
    }
    return result;
}
