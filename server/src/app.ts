import express from "express";
import { Sequelize } from "sequelize";
import sequelize from "./config/database";
import router from "./router";

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
import { Request } from "./models/request.model";
import { Station } from "./models/station.model";
import { Terminal } from "./models/terminal.model";
import { TerminalPlug } from "./models/terminal_plug.model";
import { User } from "./models/user.model";
import { Vehicule } from "./models/vehicule.model";

import {
  LogLevel,
  initializeConsoleLogStream,
  redirectConsoleOutput,
} from "./tools/logger";

initializeConsoleLogStream();
redirectConsoleOutput();

const app = express();
console.log(
  "DEBUG: process.env.PORT before definition:",
  process.env.PORT,
  LogLevel.DEBUG,
);
const PORT = process.env.PORT || 3000;
console.log("DEBUG: PORT variable after definition:", PORT, LogLevel.DEBUG);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log(
      "🎉 Connexion à la base de données PostgreSQL établie avec succès !",
      LogLevel.INFO,
    );

    // --- INITIALISATION DES MODÈLES PAR ORDRE DE DÉPENDANCE ---
    // Phase 1 : Modèles sans dépendances circulaires entre eux (tables de référence, User, etc.)
    User.initialize(sequelize);
    Access.initialize(sequelize);
    Book.initialize(sequelize);
    Compagny.initialize(sequelize);
    Operator.initialize(sequelize);
    Plug.initialize(sequelize);
    Power.initialize(sequelize);
    Provider.initialize(sequelize);
    ImportLog.initialize(sequelize); // Aucune dépendance externe connue ici

    // Phase 2 : Modèles dépendant des modèles de la Phase 1
    Station.initialize(sequelize); // Dépend de Access, Provider, Book, Operator, Compagny, Power
    Vehicule.initialize(sequelize); // Dépend de Plug, User

    // Phase 3 : Modèles dépendant des modèles de la Phase 1 et 2
    Terminal.initialize(sequelize); // Dépend de Station, Power
    Observation.initialize(sequelize); // Dépend de Station, User (Maintenant Station est initialisé)
    Request.initialize(sequelize); // Dépend de User, Terminal

    // Phase 4 : Tables de jonction et autres modèles avec des dépendances complexes (souvent les dernières)
    BookTerminal.initialize(sequelize); // Dépend de Book, Terminal
    TerminalPlug.initialize(sequelize); // Dépend de Plug, Terminal

    console.log(
      "Tous les modèles ont été initialisés avec l'instance Sequelize.",
      LogLevel.DEBUG,
    );

    // Définition des associations (doit se faire APRES que TOUS les modèles soient initialisés)
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
    Request.associate();
    Station.associate();
    Terminal.associate();
    TerminalPlug.associate();
    Vehicule.associate();
    ImportLog.associate();

    console.log(
      "Toutes les associations de modèles ont été définies.",
      LogLevel.DEBUG,
    );

    // --- DEBUGGING : VÉRIFICATION DE L'INSTANCE SEQUELIZE AVANT SYNCHRONISATION ---
    console.log("--- DÉBOGAGE INSTANCE SEQUELIZE ---", LogLevel.DEBUG);
    console.log("Type de sequelize:", typeof sequelize, LogLevel.DEBUG);
    console.log(
      "Est une instance de Sequelize:",
      sequelize instanceof Sequelize,
      LogLevel.DEBUG,
    );
    console.log(
      "Valeur de sequelize (tronquée si grande):",
      sequelize ? Object.keys(sequelize).slice(0, 5) : sequelize,
      LogLevel.DEBUG,
    );
    console.log(
      "Type de sequelize.getQueryInterface:",
      typeof sequelize?.getQueryInterface,
      LogLevel.DEBUG,
    );
    console.log("--- FIN DÉBOGAGE INSTANCE SEQUELIZE ---", LogLevel.DEBUG);

    // Perform database synchronization
    console.log(
      "Tentative de synchronisation de la base de données...",
      LogLevel.INFO,
    );
    // REMINDER: Use { force: true } once in development to clean up conflicting indexes
    // Then switch back to { alter: true } or your migration process
    await sequelize.sync({ force: true }); // Gardez ceci en `force: true` pour le moment

    console.log(
      "🚀 Base de données synchronisée avec les modèles !",
      LogLevel.INFO,
    );

    // --- Création d'un utilisateur de test ---
    console.log(
      "\n--- Tentative de création d'un nouvel utilisateur ---",
      LogLevel.INFO,
    );
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
        `✅ Utilisateur créé avec succès : ID ${user.id}, Email : ${user.email}`,
        LogLevel.INFO,
      );
    } else {
      console.log(
        `ℹ️ L'utilisateur avec l'email ${user.email} existe déjà (ID: ${user.id}).`,
        LogLevel.INFO,
      );
    }

    app.get("/", (req, res) => {
      res.status(200).send("API backend P3.");
    });
  } catch (error) {
    console.error(
      "❌ Impossible de se connecter à la base de données :",
      error,
      LogLevel.CRITICAL,
    );
    if (error instanceof Error) {
      console.error("Détails de l'erreur:", error.message, LogLevel.CRITICAL);
      if (error.stack) {
        console.error("Stack trace:", error.stack, LogLevel.CRITICAL);
      }
    }
  }
}

startServer();

import cors from "cors";

if (process.env.CLIENT_URL != null) {
  app.use(cors({ origin: process.env.CLIENT_URL }));
}

import fs from "node:fs";
import path from "node:path";

const publicFolderPath = path.join(__dirname, "../../server/public");
if (fs.existsSync(publicFolderPath)) {
  app.use(express.static(publicFolderPath));
}

const clientBuildPath = path.join(__dirname, "../../client/dist");
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get("*", (_, res) => {
    res.sendFile("index.html", { root: clientBuildPath });
  });
}

import { log } from "node:console";
import type { ErrorRequestHandler } from "express";
import { Pool } from "pg";
const logErrors: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err, LogLevel.ERROR);
  console.error("on req:", req.method, req.path, LogLevel.ERROR);
  next(err);
};
app.use(logErrors);

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get("*", (_, res) => {
    res.sendFile("index.html", { root: clientBuildPath });
  });
}

export default app;
