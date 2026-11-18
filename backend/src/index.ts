import "dotenv/config";
import { app } from "./app.js";

const port = Number(process.env.PORT) || 3000;

app.listen(port, (error) => {
    if (error) {
        console.error("Server konnte nicht gestartet werden:", error.message);
        process.exit(1);
    }
    console.log(`ClipCoach-Backend läuft auf http://localhost:${port}`);
});
