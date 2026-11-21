import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        env: {
            // Tests sollen nie echte Gemini-Anfragen schicken (kostet Kontingent,
            // ist langsam und unzuverlässig). Ohne Key läuft der Demo-Modus.
            // Einzelne Tests setzen bei Bedarf einen Fake-Key mit vi.stubEnv.
            GEMINI_API_KEY: "",
            GEMINI_MODEL: "",
        },
    },
});
