import express from "express";
import { body, matchedData, validationResult } from "express-validator";
import { COUNT_LIMITS, GAMES, PLATFORMS, type GenerateRequestResource } from "../Resources.js";
import { generateSuggestions } from "../services/aiService.js";
import { isAllowedClipUrl } from "../services/urlValidation.js";

export const generateRouter = express.Router();

// Hilfsfunktionen für wiederkehrende Regeln.
// isString().bail() steht immer vorne: "bail" bricht bei einem Fehler ab,
// sodass z. B. ein Array statt eines Textes gar nicht erst weiter geprüft wird.
const string500 = (field: string, message: string) =>
    body(field, message).isString().bail().trim().isLength({ min: 1, max: 500 });

const oneOf = (field: string, values: readonly string[], message: string) =>
    body(field, message).isString().bail().isIn(values);

// Ganze Zahl von 1 bis max. Wir prüfen den Typ selbst:
// So kommen weder Texte wie "3" noch Arrays wie [3] durch, nur echte Zahlen.
// Nach "typeof value === 'number'" weiß TypeScript, dass value eine Zahl ist.
const countFrom1To = (field: string, max: number) =>
    body(field, `Bitte gib für ${field} eine ganze Zahl von 1 bis ${max} an.`)
        .custom((value: unknown) => typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= max);

const postGenerateValidators = [
    body("url", "Bitte gib einen gültigen YouTube-Link an.")
        .isString().bail()
        .trim()
        .isLength({ min: 1, max: 2048 }).bail()
        .custom((value: string) => isAllowedClipUrl(value)),
    oneOf("game", GAMES, "Bitte wähle ein unterstütztes Spiel."),

    // platforms: eine Liste mit 1 bis 3 Einträgen, ohne doppelte Einträge ...
    body("platforms", "Bitte wähle mindestens eine Plattform, jede höchstens einmal.")
        .isArray({ min: 1, max: PLATFORMS.length }).bail()
        .custom((values: unknown[]) => new Set(values).size === values.length),
    // ... und jeder einzelne Eintrag (".*") muss eine erlaubte Plattform sein
    oneOf("platforms.*", PLATFORMS, "Bitte wähle nur unterstützte Plattformen."),

    string500("description", "Die Beschreibung muss zwischen 1 und 500 Zeichen lang sein."),

    countFrom1To("counts.hooks", COUNT_LIMITS.hooks),
    countFrom1To("counts.captions", COUNT_LIMITS.captions),
    countFrom1To("counts.hashtags", COUNT_LIMITS.hashtags),
    countFrom1To("counts.titles", COUNT_LIMITS.titles),
];

generateRouter.post("/", postGenerateValidators, async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({ errors: errors.array() });
        return;
    }

    // Nur geprüfte Felder aus dem Body gehen weiter, alles andere wird ignoriert
    const request = matchedData<GenerateRequestResource>(req, { locations: ["body"] });

    try {
        const result = await generateSuggestions(request);
        res.status(200).send(result);
    } catch {
        // Keine internen Details an den Client senden
        res.status(500).send({ errors: [{ msg: "Interner Serverfehler" }] });
    }
});
