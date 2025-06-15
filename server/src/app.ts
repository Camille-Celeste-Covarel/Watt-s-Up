import express from "express";
import sequelize from './config/database';

// import models
import { Station } from './models/station.model';
import { Access } from './models/access.model';
import { Book } from './models/book.model';
import { Power } from './models/power.model';
import { Provider } from './models/provider.model';
import { User } from './models/user.model';
import { Terminal } from './models/terminal.model';
import { Plug } from './models/plug.model';
import { Vehicule } from './models/vehicule.model';
import { BookTerminal } from './models/book_terminal.model';
import { TerminalPlug } from './models/terminal_plug.model';
import { Compagny } from './models/compagny.model';
import { Observation } from './models/observation.model';
import { Operator } from './models/operator.model';
import { Request } from './models/request.model';


async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('🎉 Connexion à la base de données PostgreSQL établie avec succès !');

    User.initialize(sequelize);
    Access.initialize(sequelize);
    Compagny.initialize(sequelize);
    Operator.initialize(sequelize);
    Plug.initialize(sequelize);
    Power.initialize(sequelize);
    Provider.initialize(sequelize);
    Observation.initialize(sequelize);

    Station.initialize(sequelize);
    Terminal.initialize(sequelize);
    Book.initialize(sequelize);
    BookTerminal.initialize(sequelize);
    Request.initialize(sequelize);

    TerminalPlug.initialize(sequelize);
    Vehicule.initialize(sequelize);


    User.associate();
    Access.associate();
    Book.associate();
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
    BookTerminal.associate();

    console.log('Modèle Station initialisé et prêt.');
    console.log('Modèle Access initialisé et prêt.');
    console.log('Modèle Book initialisé et prêt.');
    console.log('Modèle Power initialisé et prêt.');
    console.log('Modèle Provider initialisé et prêt.');
    console.log('Modèle User initialisé et prêt.');
    console.log('Modèle Terminal initialisé et prêt.');
    console.log('Modèle Plug initialisé et prêt.');
    console.log('Modèle Vehicule initialisé et prêt.');
    console.log('Modèle BookTerminal initialisé et prêt.');
    console.log('Modèle TerminalPlug initialisé et prêt.');
    console.log('Modèle Compagny initialisé et prêt.');
    console.log('Modèle Observation initialisé et prêt.');
    console.log('Modèle Operator initialisé et prêt.');
    console.log('Modèle Request initialisé et prêt.');

    console.log('Base de données prête à l\'emploi.');

    await sequelize.sync({ alter: true });
    console.log('🚀 Base de données synchronisée avec les modèles !');

    // --- NOUVEAU CODE : Création d'un utilisateur ---
    console.log('\n--- Tentative de création d\'un nouvel utilisateur ---');
    const [user, created] = await User.findOrCreate({
      where: { email: 'test.user@example.com' },
      defaults: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@example.com',
        password: 'securepassword123',
        birthdate: new Date('1990-01-01'),
        address: '123 Main St',
        city: 'Anytown',
        postcode: '12345',
        country: 'FR',
        isAdmin: false,
      },
    });

    if (created) {
      console.log(`✅ Utilisateur créé avec succès : ID ${user.id}, Email : ${user.email}`);
    } else {
      console.log(`ℹ️ L'utilisateur avec l'email ${user.email} existe déjà (ID: ${user.id}).`);
    }

  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données :', error);
  }
}

testDatabaseConnection();



const app = express();

import cors from "cors";

if (process.env.CLIENT_URL != null) {
  app.use(cors({ origin: [process.env.CLIENT_URL] }));
}

// Request Parsing: Understanding the purpose of this part

// Request parsing is necessary to extract data sent by the client in an HTTP request.
// For example to access the body of a POST request.
// The current code contains different parsing options as comments to demonstrate different ways of extracting data.

// 1. `express.json()`: Parses requests with JSON data.
// 2. `express.urlencoded()`: Parses requests with URL-encoded data.
// 3. `express.text()`: Parses requests with raw text data.
// 4. `express.raw()`: Parses requests with raw binary data.

// Uncomment one or more of these options depending on the format of the data sent by your client:

// app.use(express.json());
// app.use(express.urlencoded());
// app.use(express.text());
// app.use(express.raw());

/* ************************************************************************* */

// Import the API router
import router from "./router";

// Mount the API router under the "/api" endpoint
app.use(router);

/* ************************************************************************* */

// Production-ready setup: What is it for?

// The code includes sections to set up a production environment where the client and server are executed from the same processus.

// What it's for:
// - Serving client static files from the server, which is useful when building a single-page application with React.
// - Redirecting unhandled requests (e.g., all requests not matching a defined API route) to the client's index.html. This allows the client to handle client-side routing.

import fs from "node:fs";
import path from "node:path";

// Serve server resources

const publicFolderPath = path.join(__dirname, "../../server/public");

if (fs.existsSync(publicFolderPath)) {
  app.use(express.static(publicFolderPath));
}

// Serve client resources

const clientBuildPath = path.join(__dirname, "../../client/dist");

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  // Redirect unhandled requests to the client index file

  app.get("*", (_, res) => {
    res.sendFile("index.html", { root: clientBuildPath });
  });
}

/* ************************************************************************* */

// Middleware for Error Logging
// Important: Error-handling middleware should be defined last, after other app.use() and routes calls.

import type { ErrorRequestHandler } from "express";

// Define a middleware function to log errors
const logErrors: ErrorRequestHandler = (err, req, res, next) => {
  // Log the error to the console for debugging purposes
  console.error(err);
  console.error("on req:", req.method, req.path);

  // Pass the error to the next middleware in the stack
  next(err);
};

// Mount the logErrors middleware globally
app.use(logErrors);

/* ************************************************************************* */

export default app;
