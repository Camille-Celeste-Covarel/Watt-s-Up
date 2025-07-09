// 1. Charger la librairie dotenv
const dotenv = require("dotenv");
const path = require("node:path");

// 2. Déterminer l'environnement actuel. Par défaut, c'est 'development'.
const NODE_ENV = process.env.NODE_ENV || "development";

// 3. Déterminer le chemin du fichier .env à charger.
// En production, on s'attend à ce que les variables soient fournies par le système (ex: GitHub Secrets),
// donc on ne charge pas de fichier .env.
if (NODE_ENV !== "production") {
  const envPath = path.resolve(__dirname, `../.env.${NODE_ENV}.local`);
  console.log(
    `[Config] Chargement de l'environnement de développement/test depuis : ${envPath}`,
  );
  dotenv.config({ path: envPath });
} else {
  console.log(
    "[Config] Environnement de PRODUCTION détecté. Utilisation des variables d'environnement système.",
  );
}

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || "test_db",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
