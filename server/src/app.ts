import fs from "node:fs";
import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import sequelize from "./config/database";
import { Access } from "./models/access.model";
import { Book } from "./models/book.model";
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

initializeConsoleLogStream();
redirectConsoleOutput();

async function startServer() {
  const app = express();

  const allowedOrigins = [process.env.CLIENT_URL].filter(Boolean) as string[];

  console.log("[CORS] Origines autorisées:", allowedOrigins, LogLevel.DEBUG);

  const corsOptions: cors.CorsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
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
    credentials: true,
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  try {
    const serverRoot = path.join(__dirname, "..");
    const publicUploadsDir = path.join(serverRoot, "public", "uploads");
    const avatarsDir = path.join(publicUploadsDir, "avatars");
    const csvCacheDir = path.join(serverRoot, "CSVCache");

    fs.mkdirSync(avatarsDir, { recursive: true });
    console.log(
      "✅ Le dossier pour les uploads d'avatars est prêt.",
      LogLevel.INFO,
    );

    fs.mkdirSync(csvCacheDir, { recursive: true });
    console.log("✅ Le dossier pour le cache CSV est prêt.", LogLevel.INFO);
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création du dossier d'uploads :",
      error,
      LogLevel.CRITICAL,
    );
  }

  app.use("/api/uploads", express.static(path.join(__dirname, "..", "public", "uploads")));

  app.use("/api", router);

  const clientBuildPath = path.join(__dirname, "../../client/dist");
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get("*", (_req, res) => {
      res.sendFile("index.html", { root: clientBuildPath });
    });
  }

  const logErrors: ErrorRequestHandler = (err, req, _res, next) => {
    console.error(err, LogLevel.ERROR);
    console.error("on req:", req.method, req.path, LogLevel.ERROR);
    next(err);
  };

  const apiErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
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

  async function cleanupStaleImports() {
    try {
      const [count] = await ImportLog.update(
        {
          status: "FAILED",
          error_summary: {
            message:
              "Importation interrompue par un redémarrage ou un arrêt inattendu du serveur.",
          },
        },
        {
          where: {
            status: "IN_PROGRESS",
          },
        },
      );

      if (count > 0) {
        console.log(
          `Nettoyage : ${count} importation(s) 'zombie' ont été marquées comme FAILED.`,
          LogLevel.WARN,
        );
      } else {
        console.log(
          "Nettoyage : Aucune importation 'zombie' à nettoyer.",
          LogLevel.INFO,
        );
      }
    } catch (error) {
      console.error(
        "Erreur critique lors du nettoyage des importations 'zombie'.",
        LogLevel.CRITICAL,
        error,
      );
    }
  }

  try {
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

    User.initialize(sequelize);
    Access.initialize(sequelize);
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

    Book.initialize(sequelize);
    request.initialize(sequelize);
    TerminalPlug.initialize(sequelize);

    User.associate(sequelize);
    Access.associate(sequelize);
    Compagny.associate(sequelize);
    Operator.associate(sequelize);
    Plug.associate(sequelize);
    Power.associate(sequelize);
    Provider.associate(sequelize);
    ImportLog.associate();
    Station.associate(sequelize);
    Vehicule.associate(sequelize);
    Terminal.associate(sequelize);
    Observation.associate(sequelize);
    Book.associate(sequelize);
    request.associate(sequelize);
    TerminalPlug.associate(sequelize);

    console.log("sequelize.sync est géré par les migrations.", LogLevel.INFO);

    await cleanupStaleImports();

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
