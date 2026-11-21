// Nur diese YouTube-Hostnamen sind erlaubt. Verglichen wird exakt, nie mit startsWith oder includes.
// Andere Anbieter (z. B. TikTok, Medal.tv) sind bewusst nicht erlaubt, siehe CLAUDE.md.
const ALLOWED_HOSTNAMES = new Set([
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "youtu.be",
]);

/**
 * Prüft, ob ein Link ein erlaubter YouTube-Link ist.
 * Erlaubt sind nur https-Links ohne Zugangsdaten, ohne eigenen Port
 * und mit einem Hostnamen aus der Allowlist.
 */
export function isAllowedClipUrl(value: string): boolean {
    let url: URL;
    try {
        url = new URL(value);
    } catch {
        // new URL() wirft einen Fehler, wenn der Text kein gültiger Link ist
        return false;
    }

    if (url.protocol !== "https:") {
        return false;
    }
    if (url.username !== "" || url.password !== "") {
        return false;
    }
    if (url.port !== "") {
        return false;
    }
    return ALLOWED_HOSTNAMES.has(url.hostname);
}

// Eine YouTube-Video-ID besteht aus genau 11 Zeichen: Buchstaben, Ziffern, "-" und "_"
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

// Pfade, bei denen die Video-ID im zweiten Teil steht, z. B. /shorts/ID
const VIDEO_PATH_SECTIONS = new Set(["shorts", "live", "embed"]);

/**
 * Holt die Video-ID aus einem erlaubten YouTube-Link.
 * Gibt null zurück, wenn der Link nicht erlaubt ist oder auf kein einzelnes Video zeigt
 * (z. B. Kanal, Playlist oder Startseite).
 *
 * Erkannte Formate:
 *   https://www.youtube.com/watch?v=ID   (auch youtube.com und m.youtube.com)
 *   https://youtu.be/ID
 *   https://www.youtube.com/shorts/ID    (ebenso /live/ID und /embed/ID)
 */
export function extractYouTubeVideoId(value: string): string | null {
    // Erst die Allowlist: Nur geprüfte Links werden weiter zerlegt
    if (!isAllowedClipUrl(value)) {
        return null;
    }
    const url = new URL(value);

    // "/shorts/ID/" wird zu ["shorts", "ID"]. filter(Boolean) entfernt leere Teile,
    // die durch den Schrägstrich am Anfang oder am Ende entstehen.
    const segments = url.pathname.split("/").filter(Boolean);

    let candidate: string | null = null;
    if (url.hostname === "youtu.be" && segments.length === 1) {
        candidate = segments[0];
    } else if (segments.length === 1 && segments[0] === "watch") {
        candidate = url.searchParams.get("v");
    } else if (segments.length === 2 && VIDEO_PATH_SECTIONS.has(segments[0])) {
        candidate = segments[1];
    }

    if (candidate === null || !VIDEO_ID_PATTERN.test(candidate)) {
        return null;
    }
    return candidate;
}

/**
 * Baut aus einer Video-ID einen sauberen Link im Standardformat.
 * Alle anderen Parameter des ursprünglichen Links fallen dabei weg,
 * z. B. "si=...", über den YouTube nachvollziehen kann, wer den Link geteilt hat.
 */
export function toYouTubeWatchUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
}
