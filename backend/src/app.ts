import express from "express";
import { generateRouter } from "./routes/generate.js";

// Die App wird hier nur zusammengebaut, aber nicht gestartet (kein listen()).
// So können die Tests sie mit supertest direkt prüfen.
export const app = express();

// JSON-Bodys einlesen, maximal 10 KB groß
app.use(express.json({ limit: "10kb" }));

app.use("/api/generate", generateRouter);
