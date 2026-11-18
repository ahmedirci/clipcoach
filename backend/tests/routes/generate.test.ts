import { expect, test } from "vitest";
import supertest from "supertest";
import { app } from "../../src/app.js";

test("POST /api/generate, liefert Demo-Daten im richtigen Format", async () => {
    const response = await supertest(app)
        .post("/api/generate")
        .send({
            url: "https://www.youtube.com/watch?v=abc123",
            game: "fortnite",
            platform: "tiktok",
            description: "1 gegen 4 mit wenig Leben gewonnen",
        });

    expect(response.status).toBe(200);
    expect(response.body.hooks.length).toBeGreaterThan(0);
    expect(typeof response.body.caption).toBe("string");
    expect(response.body.hashtags.length).toBeGreaterThan(0);
    expect(response.body.titles.length).toBeGreaterThan(0);
    expect(response.body.source).toBe("description");
});
