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
