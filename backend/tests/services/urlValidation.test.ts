import { expect, test } from "vitest";
import { extractYouTubeVideoId, isAllowedClipUrl, toYouTubeWatchUrl } from "../../src/services/urlValidation.js";

// test.each führt denselben Test für jeden Eintrag der Liste aus.
// %s im Testnamen wird durch den jeweiligen Link ersetzt.

test.each([
    "https://youtube.com/watch?v=abc123",
    "https://www.youtube.com/watch?v=abc123",
    "https://www.youtube.com/shorts/abc123",
    "https://m.youtube.com/watch?v=abc123",
    "https://youtu.be/abc123",
])("isAllowedClipUrl, %s wird erlaubt", (url) => {
    expect(isAllowedClipUrl(url)).toBe(true);
});

test.each([
    "https://tiktok.com/@spieler/video/1234567890",
    "https://www.tiktok.com/@spieler/video/1234567890",
    "https://vm.tiktok.com/ZMabc123/",
    "https://vt.tiktok.com/ZSabc123/",
    "https://medal.tv/games/fortnite/clips/abc123",
    "https://www.medal.tv/games/fortnite/clips/abc123",
])("isAllowedClipUrl, anderer Anbieter %s wird abgelehnt", (url) => {
    expect(isAllowedClipUrl(url)).toBe(false);
});

test("isAllowedClipUrl, Großbuchstaben im Hostnamen werden erlaubt", () => {
    // Der URL-Parser wandelt den Hostnamen automatisch in Kleinbuchstaben um
    expect(isAllowedClipUrl("https://WWW.YouTube.COM/watch?v=abc123")).toBe(true);
});

test("isAllowedClipUrl, ausdrücklicher Standard-Port 443 wird erlaubt", () => {
    // Der URL-Parser entfernt den Standard-Port, url.port ist dann leer
    expect(isAllowedClipUrl("https://www.youtube.com:443/watch?v=abc123")).toBe(true);
});

test.each([
    "",
    "kein link",
    "www.youtube.com/watch?v=abc123",
    "//www.youtube.com/watch?v=abc123",
])("isAllowedClipUrl, ungültiger Link %s wird abgelehnt", (url) => {
    expect(isAllowedClipUrl(url)).toBe(false);
});

test.each([
    "http://www.youtube.com/watch?v=abc123",
    "ftp://www.youtube.com/watch?v=abc123",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///C:/Windows/win.ini",
])("isAllowedClipUrl, falsches Protokoll %s wird abgelehnt", (url) => {
    expect(isAllowedClipUrl(url)).toBe(false);
});

test.each([
    "https://youtube.com.boese-seite.de/watch?v=abc123",
    "https://youtube.com@boese-seite.de/watch?v=abc123",
    "https://boese-seite.de/youtube.com",
    "https://boese-seite.de/?link=https://www.youtube.com",
    "https://boese-youtube.com/watch?v=abc123",
    "https://evil.youtube.com/watch?v=abc123",
    "https://www.youtube.de/watch?v=abc123",
    "https://youtube.com./watch?v=abc123",
    "https://142.250.185.78/watch?v=abc123",
    "https://localhost/watch?v=abc123",
])("isAllowedClipUrl, Hostname in %s wird abgelehnt", (url) => {
    expect(isAllowedClipUrl(url)).toBe(false);
});

test("isAllowedClipUrl, ähnlich aussehende Unicode-Zeichen im Hostnamen werden abgelehnt", () => {
    // Das "о" in "yоutube" ist ein kyrillischer Buchstabe, kein lateinisches "o".
    // Der Parser wandelt den Namen in Punycode um (xn--...), der nicht in der Liste steht.
    expect(isAllowedClipUrl("https://yоutube.com/watch?v=abc123")).toBe(false);
});

test.each([
    "https://nutzer:passwort@www.youtube.com/watch?v=abc123",
    "https://nutzer@www.youtube.com/watch?v=abc123",
    "https://:passwort@www.youtube.com/watch?v=abc123",
])("isAllowedClipUrl, Zugangsdaten in %s werden abgelehnt", (url) => {
    expect(isAllowedClipUrl(url)).toBe(false);
});

test("isAllowedClipUrl, anderer Port als 443 wird abgelehnt", () => {
    expect(isAllowedClipUrl("https://www.youtube.com:8443/watch?v=abc123")).toBe(false);
});

// ---------- Video-ID aus dem Link holen ----------

test.each([
    "https://www.youtube.com/watch?v=abc123DEF45",
    "https://youtube.com/watch?v=abc123DEF45",
    "https://m.youtube.com/watch?v=abc123DEF45",
    "https://www.youtube.com/watch?v=abc123DEF45&t=30s",
    "https://www.youtube.com/watch?v=abc123DEF45&list=PLabcdefghijklmnop",
    "https://youtu.be/abc123DEF45",
    "https://youtu.be/abc123DEF45?si=GeteiltVonJemandem",
    "https://www.youtube.com/shorts/abc123DEF45",
    "https://www.youtube.com/shorts/abc123DEF45/",
    "https://www.youtube.com/shorts/abc123DEF45?si=GeteiltVonJemandem",
    "https://www.youtube.com/live/abc123DEF45",
    "https://www.youtube.com/embed/abc123DEF45",
])("extractYouTubeVideoId, %s ergibt die Video-ID", (url) => {
    expect(extractYouTubeVideoId(url)).toBe("abc123DEF45");
});

test("extractYouTubeVideoId, Bindestrich und Unterstrich gehören zur ID", () => {
    expect(extractYouTubeVideoId("https://youtu.be/a-b_c-d_e-f")).toBe("a-b_c-d_e-f");
});

test.each([
    // kein einzelnes Video
    "https://www.youtube.com/",
    "https://www.youtube.com/@kanalname",
    "https://www.youtube.com/channel/UCabcdefghijklmnopqrstuv",
    "https://www.youtube.com/playlist?list=PLabcdefghijklmnop",
    "https://www.youtube.com/watch",
    "https://www.youtube.com/watch?list=PLabcdefghijklmnop",
    "https://www.youtube.com/shorts/",
    "https://youtu.be/",
    // ID hat das falsche Format
    "https://www.youtube.com/watch?v=abc123",
    "https://www.youtube.com/watch?v=abc123DEF456",
    "https://www.youtube.com/watch?v=abc123DEF4!",
    "https://youtu.be/abc123DEF45/extra",
    "https://www.youtube.com/shorts/abc123DEF45/extra",
    // ID an falscher Stelle
    "https://youtu.be/watch?v=abc123DEF45",
    "https://www.youtube.com/abc123DEF45",
    // nicht erlaubte Links, auch wenn eine ID darin steht
    "http://www.youtube.com/watch?v=abc123DEF45",
    "https://boese-seite.de/watch?v=abc123DEF45",
    "https://youtube.com.boese-seite.de/watch?v=abc123DEF45",
    "kein link",
])("extractYouTubeVideoId, %s ergibt keine Video-ID", (url) => {
    expect(extractYouTubeVideoId(url)).toBeNull();
});

test("toYouTubeWatchUrl, baut einen sauberen Link im Standardformat", () => {
    expect(toYouTubeWatchUrl("abc123DEF45")).toBe("https://www.youtube.com/watch?v=abc123DEF45");
});
