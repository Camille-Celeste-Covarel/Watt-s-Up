import fs from "node:fs";
import path from "node:path";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import sequelize from "./config/database";
import { Access } from "./models/access.model";
import { Book } from "./models/book.model";
import { BookTerminal } from "./models/book_terminal.model";
import { Compagny } from "./models/compagny.model";
import { ImportLog } from "./models/importlog.model";
import { Observation } from "./models/observation.model";
import { Operator } from "./models/operator.model";
import { Plug } from "./models/plug.model";
import { Power } from "./models/power.model";
import { Provider } from "./models/provider.model";
import { request } from "./models/request.model";
import { Station } from "./models/station.model";
import { Terminal } from "./models/terminal.model";
import { TerminalPlug } from "./models/terminal_plug.model";
import { User } from "./models/user.model";
import { Vehicule } from "./models/vehicule.model";
import router from "./router";
import {
  LogLevel,
  initializeConsoleLogStream,
  redirectConsoleOutput,
} from "./tools/logger";

// On garde uniquement l'initialisation des logs au niveau global
initializeConsoleLogStream();
redirectConsoleOutput();

async function startServer() {
  const app = express();

  // Ce middleware s'exécutera pour CHAQUE requête, avant toute autre chose.
  app.use((req, _res, next) => {
    console.log(
      `--- NOUVELLE REQUÊTE REÇUE --- METHODE: ${req.method}, URL: ${req.originalUrl}`,
      LogLevel.DEBUG,
    );
    next();
  });

  // --- 1. MIDDLEWARES DE BASE ET CONFIGURATION CORS ---
  const allowedOrigins = [process.env.CLIENT_URL].filter(Boolean) as string[];

  console.log("[CORS] Origines autorisées:", allowedOrigins, LogLevel.DEBUG);

  const corsOptions: cors.CorsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Log à l'intérieur de la fonction CORS ---
      console.log(`[CORS] Origine de la requête: ${origin}`, LogLevel.DEBUG);

      if (!origin || allowedOrigins.includes(origin)) {
        console.log("[CORS] Résultat: Autorisé", LogLevel.DEBUG);
        callback(null, true);
      } else {
        console.error(
          `[CORS] Résultat: Refusé. L'origine ${origin} n'est pas dans la liste blanche.`,
          LogLevel.CRITICAL,
        );
        callback(new Error("This origin is not allowed by CORS"));
      }
    },
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- 2. ROUTEUR DE L'API ---
  // Toutes les requêtes commençant par /api sont gérées par notre routeur.
  app.use("/api", router);

  // --- 3. GESTION DES FICHIERS STATIQUES (CLIENT) ---
  // Ce code ne s'exécute que si la requête n'a pas été interceptée par le routeur API.
  const clientBuildPath = path.join(__dirname, "../../client/dist");
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    // Le "catch-all" qui renvoie l'app React pour la navigation côté client
    app.get("*", (_req, res) => {
      res.sendFile("index.html", { root: clientBuildPath });
    });
  }

  // --- 4. GESTIONNAIRES D'ERREURS (TOUJOURS À LA FIN) ---
  const logErrors: ErrorRequestHandler = (err, req, _res, next) => {
    console.error(err, LogLevel.ERROR);
    console.error("on req:", req.method, req.path, LogLevel.ERROR);
    next(err);
  };

  const apiErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    // On ne gère que les erreurs sur les routes API
    if (req.originalUrl.startsWith("/api")) {
      console.error("API Error:", err);
      res.status(500).json({
        error: "Une erreur interne du serveur est survenue.",
        details: err.message,
      });
      return;
    }
    next(err);
  };

  app.use(logErrors);
  app.use(apiErrorHandler);

  try {
    // --- 5. CONNEXION BDD ET INITIALISATION ---
    await sequelize.authenticate();
    console.log(
      "🎉 Connexion à la base de données PostgreSQL établie avec succès !",
      LogLevel.INFO,
    );

    console.log(
      "Tentative d'activation de l'extension PostGIS...",
      LogLevel.INFO,
    );
    await sequelize.query("CREATE EXTENSION IF NOT EXISTS postgis;");
    console.log(
      "✅ Extension PostGIS activée ou déjà présente !",
      LogLevel.INFO,
    );

    // --- INITIALISATION DES MODÈLES ---
    User.initialize(sequelize);
    Access.initialize(sequelize);
    Book.initialize(sequelize);
    Compagny.initialize(sequelize);
    Operator.initialize(sequelize);
    Plug.initialize(sequelize);
    Power.initialize(sequelize);
    Provider.initialize(sequelize);
    ImportLog.initialize(sequelize);
    Station.initialize(sequelize);
    Vehicule.initialize(sequelize);
    Terminal.initialize(sequelize);
    Observation.initialize(sequelize);
    request.initialize(sequelize);
    BookTerminal.initialize(sequelize);
    TerminalPlug.initialize(sequelize);
    console.log("Tous les modèles ont été initialisés.", LogLevel.DEBUG);

    // --- DÉFINITION DES ASSOCIATIONS ---
    User.associate();
    Access.associate();
    Book.associate();
    BookTerminal.associate();
    Compagny.associate();
    Observation.associate();
    Operator.associate();
    Plug.associate();
    Power.associate();
    Provider.associate();
    request.associate();
    Station.associate();
    Terminal.associate();
    TerminalPlug.associate();
    Vehicule.associate();
    ImportLog.associate();
    console.log("Toutes les associations ont été définies.", LogLevel.DEBUG);

    console.log("🚀 sequelize.sync remplacé par les migrations", LogLevel.INFO);

    // --- Création d'un utilisateur de test ---
    const [user, created] = await User.findOrCreate({
      where: { email: "test.user@example.com" },
      defaults: {
        first_name: "Test",
        last_name: "User",
        email: "test.user@example.com",
        password: "securepassword123",
        birthdate: new Date("1990-01-01"),
        address: "123 Main St",
        city: "Anytown",
        postcode: "12345",
        country: "FR",
        is_admin: false,
      },
    });

    if (created) {
      console.log(
        `✅ Utilisateur créé avec succès : ID ${user.id}`,
        LogLevel.INFO,
      );
    } else {
      console.log(
        `ℹ️ L'utilisateur avec l'email ${user.email} existe déjà (ID: ${user.id}).`,
        LogLevel.INFO,
      );
    }

    return app;
  } catch (error) {
    console.error(
      "❌ Impossible de se connecter à la base de données :",
      error,
      LogLevel.CRITICAL,
    );
    if (error instanceof Error) {
      console.error("Détails de l'erreur:", error.message, LogLevel.CRITICAL);
    }
    process.exit(1);
  }
}

export default startServer;
