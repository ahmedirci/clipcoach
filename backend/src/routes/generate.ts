import express from "express";
import { generateSuggestions } from "../services/aiService.js";

export const generateRouter = express.Router();

// Hinweis: Der Request-Body wird hier bewusst noch nicht gelesen.
// Erst in Schritt 3 kommt die Validierung dazu, dann geht nur matchedData an den Service.
generateRouter.post("/", async (_req, res) => {
    try {
        const result = await generateSuggestions();
        res.status(200).send(result);
    } catch {
        // Keine internen Details an den Client senden
        res.status(500).send({ errors: [{ msg: "Interner Serverfehler" }] });
    }
});
