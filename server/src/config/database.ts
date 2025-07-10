import { type Dialect, Sequelize } from "sequelize";
import type { DbConfig, ValidDbConfig } from "./database_types";

/**
 * Valide et transforme la configuration de la base de données.
 * Si la configuration est valide, retourne un objet `ValidDbConfig`.
 * Sinon, lance une erreur détaillée.
 * @param config La configuration brute issue des variables d'environnement.
 * @returns Un objet de configuration validé et typé.
 */
function getValidatedConfig(config: DbConfig): ValidDbConfig {
  // --- GUARD CLAUSES ---
  // On vérifie chaque variable requise. Si une manque, on lance une erreur.
  // TypeScript comprend qu'après chaque ligne, la variable ne peut plus être undefined.
  if (!config.user)
    throw new Error("Variable d'environnement manquante : DB_USER");
  if (!config.password)
    throw new Error("Variable d'environnement manquante : DB_PASSWORD");
  if (!config.database)
    throw new Error("Variable d'environnement manquante : DB_NAME");
  if (!config.host)
    throw new Error("Variable d'environnement manquante : DB_HOST");
  if (!config.port)
    throw new Error("Variable d'environnement manquante : DB_PORT");
  if (!config.dialect)
    throw new Error("Variable d'environnement manquante : DB_DIALECT");

  // --- TRANSFORMATION ---
  // À ce stade, TypeScript sait que config.port est un `string`, pas `string | undefined`.
  // Nous pouvons donc créer notre objet de retour en toute sécurité, sans utiliser "!"
  return {
    user: config.user,
    password: config.password,
    database: config.database,
    host: config.host,
    port: Number(config.port), // Transformation sûre
    dialect: config.dialect as Dialect, // L'assertion 'as' est acceptable ici car on a validé son existence
    nodeEnv: config.nodeEnv,
  };
}

// 1. Récupérer la configuration brute depuis l'environnement
const rawDbConfig: DbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
  nodeEnv: process.env.NODE_ENV,
};

// 2. Valider et transformer la configuration.
// La fonction lancera une erreur si quelque chose ne va pas.
const validConfig = getValidatedConfig(rawDbConfig);

// 3. Utiliser la configuration validée et parfaitement typée.
// Le code est maintenant propre, lisible et sans "!"
const sequelize = new Sequelize(
  validConfig.database,
  validConfig.user,
  validConfig.password,
  {
    host: validConfig.host,
    port: validConfig.port,
    dialect: validConfig.dialect,
    logging: validConfig.nodeEnv === "development" ? console.log : false,
    pool: {
      max: 100,
      min: 0,
      acquire: 120000,
      idle: 10000,
      evict: 1000,
    },
    dialectOptions: {},
    timezone: "+00:00",
  },
);

export default sequelize;
