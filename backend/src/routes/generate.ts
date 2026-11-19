import express from "express";
import { body, matchedData, validationResult } from "express-validator";
import { GAMES, PLATFORMS, type GenerateRequestResource } from "../Resources.js";
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

const postGenerateValidators = [
    body("url", "Bitte gib einen gültigen YouTube-Link an.")
        .isString().bail()
        .trim()
        .isLength({ min: 1, max: 2048 }).bail()
        .custom((value: string) => isAllowedClipUrl(value)),
    oneOf("game", GAMES, "Bitte wähle ein unterstütztes Spiel."),
    oneOf("platform", PLATFORMS, "Bitte wähle eine unterstützte Plattform."),
    string500("description", "Die Beschreibung muss zwischen 1 und 500 Zeichen lang sein."),
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
