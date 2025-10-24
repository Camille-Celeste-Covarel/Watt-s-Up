const dotenv = require("dotenv");
const path = require("node:path");

const NODE_ENV = process.env.NODE_ENV || "development";

if (NODE_ENV !== "production") {
  const envFile = `.env.${NODE_ENV}.local`;
  const envPath = path.resolve(__dirname, `./${envFile}`);

  console.log(`[EnvLoader] Chargement de l'environnement depuis : ${envPath}`);

  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error(
      `[EnvLoader] ERREUR: Impossible de charger le fichier .env depuis ${envPath}`,
      result.error,
    );
  }
} else {
  console.log(
    "[EnvLoader] Environnement de PRODUCTION détecté. Utilisation des variables d'environnement système.",
  );
}
