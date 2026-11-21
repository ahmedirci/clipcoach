import { expect, test } from "vitest";
import {
    finalizeHashtags,
    finalizeYouTubeTags,
    MAX_YOUTUBE_TAGS,
    MAX_YOUTUBE_TAGS_CHARS,
    normalizeHashtag,
} from "../../src/services/hashtags.js";

// ---------- normalizeHashtag ----------

test.each([
    ["#Valorant", "#valorant"],
    ["valorant", "#valorant"],
    ["#KAY/O", "#kayo"],
    ["Quick Scope", "#quickscope"],
    ["##ace!!", "#ace"],
    ["#Größter_Clutch", "#größter_clutch"],
    ["#4k", "#4k"],
])("normalizeHashtag, %s wird zu %s", (input, expected) => {
    expect(normalizeHashtag(input)).toBe(expected);
});

test.each(["", "#", "  ", "!!!"])("normalizeHashtag, %j ergibt keinen Hashtag", (input) => {
    expect(normalizeHashtag(input)).toBeNull();
});

// ---------- finalizeHashtags ----------

test("finalizeHashtags, TikTok: #valorant und #fyp stehen vorne", () => {
    expect(finalizeHashtags(["#valo", "#ace"], "tiktok", {}, 4)).toEqual(["#valorant", "#fyp", "#valo", "#ace"]);
});

test("finalizeHashtags, Instagram: #reels steht nach #valorant", () => {
    expect(finalizeHashtags(["#valo"], "instagram", {}, 4)).toEqual(["#valorant", "#reels", "#fyp", "#valo"]);
});

test("finalizeHashtags, YouTube Shorts: #shorts steht nach #valorant", () => {
    expect(finalizeHashtags(["#valo"], "youtube-shorts", {}, 4)).toEqual(["#valorant", "#shorts", "#fyp", "#valo"]);
});

test("finalizeHashtags, Agent und Rank kommen nach den festen Hashtags", () => {
    expect(finalizeHashtags(["#valo"], "tiktok", { agent: "Neon", rank: "Gold" }, 5))
        .toEqual(["#valorant", "#fyp", "#neon", "#gold", "#valo"]);
});

test("finalizeHashtags, ohne Agent und Rank gibt es keine Lücken", () => {
    expect(finalizeHashtags(["#valo", "#ace"], "tiktok", {}, 10)).toEqual(["#valorant", "#fyp", "#valo", "#ace"]);
});

test("finalizeHashtags, wird auf die gewünschte Anzahl gekürzt", () => {
    expect(finalizeHashtags(["#valo", "#ace", "#clip"], "youtube-shorts", { agent: "Neon" }, 2))
        .toEqual(["#valorant", "#shorts"]);
});

test("finalizeHashtags, doppelte Hashtags der KI fallen weg (ohne Groß-/Kleinschreibung)", () => {
    expect(finalizeHashtags(["#Valorant", "#FYP", "#ace", "#ACE", "ace"], "tiktok", {}, 10))
        .toEqual(["#valorant", "#fyp", "#ace"]);
});

test("finalizeHashtags, Hashtags der KI werden bereinigt", () => {
    expect(finalizeHashtags(["Quick Scope", "#High IQ!"], "tiktok", {}, 10))
        .toEqual(["#valorant", "#fyp", "#quickscope", "#highiq"]);
});

test("finalizeHashtags, leere Hashtags der KI fallen weg", () => {
    expect(finalizeHashtags(["#", "!!!", "#ace"], "tiktok", {}, 10)).toEqual(["#valorant", "#fyp", "#ace"]);
});

// ---------- finalizeYouTubeTags ----------

test("finalizeYouTubeTags, valorant steht vorne, danach Agent, Rank und Tags der KI", () => {
    expect(finalizeYouTubeTags(["valorant ace", "phantom"], { agent: "KAY/O", rank: "Radiant" }))
        .toEqual(["valorant", "KAY/O", "Radiant", "valorant ace", "phantom"]);
});

test("finalizeYouTubeTags, # am Anfang, Kommas und spitze Klammern werden entfernt", () => {
    expect(finalizeYouTubeTags(["#ace", "1v3, clutch", "<b>flick</b>"], {}))
        .toEqual(["valorant", "ace", "1v3 clutch", "bflick/b"]);
});

test("finalizeYouTubeTags, doppelte und leere Tags fallen weg", () => {
    expect(finalizeYouTubeTags(["Valorant", "ace", "ACE", "  ", "#"], {})).toEqual(["valorant", "ace"]);
});

test("finalizeYouTubeTags, höchstens 15 Tags", () => {
    const many = Array.from({ length: 30 }, (_, i) => `tag${i}`);
    expect(finalizeYouTubeTags(many, {})).toHaveLength(MAX_YOUTUBE_TAGS);
});

test("finalizeYouTubeTags, zusammen höchstens 500 Zeichen inklusive Kommas", () => {
    const longTags = Array.from({ length: 10 }, (_, i) => `${i}`.padEnd(60, "x"));

    const tags = finalizeYouTubeTags(longTags, {});

    const totalChars = tags.join(",").length;
    expect(totalChars).toBeLessThanOrEqual(MAX_YOUTUBE_TAGS_CHARS);
    // "valorant" (8) + 8 Tags à 60 Zeichen + 8 Kommas = 496, ein 9. Tag passt nicht mehr
    expect(tags).toHaveLength(9);
});

test("finalizeHashtags, mehrere Hashtags in einem Eintrag der KI werden aufgeteilt statt zusammengeklebt", () => {
    // So kam es in einer echten Messung vor
    expect(finalizeHashtags(["#clip #gaming #highlight", "#ace,#peak"], "tiktok", {}, 10))
        .toEqual(["#valorant", "#fyp", "#clip", "#gaming", "#highlight", "#ace", "#peak"]);
});

test("finalizeHashtags, ein Hashtag mit Leerzeichen ohne weiteres # bleibt ein Hashtag", () => {
    expect(finalizeHashtags(["Quick Scope", "#High IQ"], "tiktok", {}, 10))
        .toEqual(["#valorant", "#fyp", "#quickscope", "#highiq"]);
});

test("finalizeHashtags, Hashtags mit mehr als 30 Zeichen werden verworfen", () => {
    // So ein Hashtag kam in einer echten Messung heraus, als die KI mehrere Wörter zusammengeschrieben hat
    const monster = "#clipgaminghighlightgameplaypeakfasthighiq4kinsaneprimevamos";
    expect(finalizeHashtags([monster, "#ace"], "tiktok", {}, 10)).toEqual(["#valorant", "#fyp", "#ace"]);
});

test("finalizeHashtags, ein Hashtag mit genau 30 Zeichen bleibt erhalten", () => {
    const tag = "#" + "a".repeat(29);
    expect(finalizeHashtags([tag], "tiktok", {}, 10)).toEqual(["#valorant", "#fyp", tag]);
});
