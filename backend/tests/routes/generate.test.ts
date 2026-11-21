import { expect, test } from "vitest";
import supertest from "supertest";
import { app } from "../../src/app.js";

test("POST /api/generate, liefert Demo-Daten pro Plattform im richtigen Format", async () => {
    const response = await supertest(app)
        .post("/api/generate")
        .send({
            url: "https://www.youtube.com/watch?v=abc123DEF45",
            game: "fortnite",
            platforms: ["tiktok", "youtube-shorts"],
            description: "1 gegen 4 mit wenig Leben gewonnen",
            counts: { hooks: 3, captions: 1, hashtags: 5, titles: 2 },
        });

    expect(response.status).toBe(200);
    expect(response.body.source).toBe("description");

    // Ein Eintrag pro Plattform, in der Reihenfolge des Requests
    const [tiktok, shorts] = response.body.results;
    expect(response.body.results).toHaveLength(2);

    expect(tiktok.platform).toBe("tiktok");
    expect(tiktok.hooks).toHaveLength(3);
    expect(tiktok.captions).toHaveLength(1);
    expect(tiktok.hashtags).toHaveLength(5);
    expect(tiktok.titles).toEqual([]);

    expect(shorts.platform).toBe("youtube-shorts");
    expect(shorts.titles).toHaveLength(2);
});
