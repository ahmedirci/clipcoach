import { expect, test } from "vitest";
import { COUNT_LIMITS, type GenerateRequestResource } from "../../src/Resources.js";
import { generateSuggestions } from "../../src/services/aiService.js";

const request: GenerateRequestResource = {
    url: "https://www.youtube.com/watch?v=abc123DEF45",
    game: "fortnite",
    platforms: ["tiktok"],
    description: "1 gegen 4 mit wenig Leben gewonnen",
    counts: { hooks: 1, captions: 1, hashtags: 1, titles: 1 },
};

test("generateSuggestions, Demo-Modus liefert genau die gewünschte Anzahl", async () => {
    const result = await generateSuggestions({
        ...request,
        platforms: ["youtube-shorts"],
        counts: { hooks: 2, captions: 3, hashtags: 7, titles: 4 },
    });

    const [shorts] = result.results;
    expect(shorts.hooks).toHaveLength(2);
    expect(shorts.captions).toHaveLength(3);
    expect(shorts.hashtags).toHaveLength(7);
    expect(shorts.titles).toHaveLength(4);
});

test("generateSuggestions, Demo-Modus hat genug Beispiele für die Höchstwerte", async () => {
    const result = await generateSuggestions({
        ...request,
        platforms: ["youtube-shorts"],
        counts: { ...COUNT_LIMITS },
    });

    const [shorts] = result.results;
    expect(shorts.hooks).toHaveLength(COUNT_LIMITS.hooks);
    expect(shorts.captions).toHaveLength(COUNT_LIMITS.captions);
    expect(shorts.hashtags).toHaveLength(COUNT_LIMITS.hashtags);
    expect(shorts.titles).toHaveLength(COUNT_LIMITS.titles);
});

test("generateSuggestions, Titel nur bei YouTube Shorts", async () => {
    const result = await generateSuggestions({
        ...request,
        platforms: ["tiktok", "instagram", "youtube-shorts"],
        counts: { hooks: 1, captions: 1, hashtags: 1, titles: 3 },
    });

    const titlesPerPlatform = result.results.map((entry) => [entry.platform, entry.titles.length]);
    expect(titlesPerPlatform).toEqual([
        ["tiktok", 0],
        ["instagram", 0],
        ["youtube-shorts", 3],
    ]);
});

test("generateSuggestions, Reihenfolge der Plattformen wie im Request", async () => {
    const result = await generateSuggestions({
        ...request,
        platforms: ["youtube-shorts", "tiktok"],
    });

    expect(result.results.map((entry) => entry.platform)).toEqual(["youtube-shorts", "tiktok"]);
});

test("generateSuggestions, Demo-Modus kennzeichnet die Quelle als Beschreibung", async () => {
    const result = await generateSuggestions(request);
    expect(result.source).toBe("description");
});
