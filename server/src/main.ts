import dotenv from "dotenv";
import startServer from "./app";

dotenv.config();

// Import
import { cleanOldLogs } from "./tools/logger";
import { LogLevel } from "./tools/logger";

// Get the port from the environment variables
const port = process.env.PORT;

cleanOldLogs();

// Start the server and listen on the specified port
async function main() {
  try {
    const app = await startServer();
    app.listen(port, () => {
      console.log(
        `⚡️ Serveur Express démarré sur http://localhost:${port}`,
        LogLevel.INFO,
      );
    });
  } catch (error) {
    console.error(
      "Erreur fatale lors du démarrage de l'application:",
      error,
      LogLevel.CRITICAL,
    );
    process.exit(1);
  }
}

main();
