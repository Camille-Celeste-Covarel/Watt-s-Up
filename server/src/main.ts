import startServer from "./app";
import { LogLevel, cleanOldLogs } from "./tools/logger";

// Récupérer le port depuis les variables d'environnement
const port = process.env.PORT;

// Vérification cruciale pour s'assurer que le port est défini
if (!port) {
  console.error(
    "ERREUR FATALE : La variable d'environnement PORT n'est pas définie.",
    LogLevel.CRITICAL,
  );
  process.exit(1);
}

cleanOldLogs();

// Fonction principale pour démarrer l'application
async function main() {
  const app = await startServer();

  // On transforme l'appel à app.listen en une promesse pour pouvoir l'attendre.
  // Cela garantit que le script ne se termine pas avant que le serveur ne soit
  // réellement en écoute, et nous permet de capturer les erreurs de démarrage.
  await new Promise<void>((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(
        `⚡️ Serveur Express démarré et écoute sur http://localhost:${port}`,
        LogLevel.INFO,
      );
      // Le serveur est prêt, on peut résoudre la promesse.
      resolve();
    });

    // Gestionnaire pour les erreurs de démarrage du serveur (ex: port déjà utilisé)
    server.on("error", (error) => {
      reject(error);
    });
  });
}

// On exécute la fonction principale et on intercepte les erreurs potentielles
// qui pourraient survenir durant toute la phase de démarrage.
// Ceci résout l'avertissement "Promise returned from main is ignored".
main().catch((error) => {
  console.error(
    "Erreur fatale lors du démarrage de l'application:",
    error,
    LogLevel.CRITICAL,
  );
  process.exit(1);
});
