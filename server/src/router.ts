import express from "express";
import upload from "./config/multer";
import { importCsv } from "./controllers/importController";
import authenticateToken from "./middleware/isConnected";
import bookActions from "./modules/bookActions";
import requestActions from "./modules/requestActions";
import stationsActions from "./modules/stationsActions";
import userActions from "./modules/userActions";
import vehiculeActions from "./modules/vehiculeActions";

const router = express.Router();

/* ************************************************************************* */
// 🌍 Routes PUBLIQUES (accessibles à tous)
/* ************************************************************************* */

// Routes d'authentification
router.post("/api/auth/login", userActions.login);
router.post("/api/auth/register", userActions.register);
router.post("/api/auth/logout", userActions.logout);

// Routes pour la map/stations (landing page)
router.get("/api/stations", stationsActions.browse);
router.get("/api/stations/visible", stationsActions.browseVisible);
router.get("/api/stations/:id", stationsActions.read);

/* ************************************************************************* */
// 🛡️ Wall d'autorisation - Tout ce qui suit nécessite d'être connecté
/* ************************************************************************* */

router.use(authenticateToken);

/* ************************************************************************* */
// 🔒 Routes PROTÉGÉES (utilisateur connecté requis)
/* ************************************************************************* */

router.post("/api/import/csv", upload.single("csvFile"), importCsv);

// Routes utilisateurs (admin seulement)
router.get("/api/users", userActions.browse);
router.get("/api/users/:id", userActions.read);
router.post("/api/users", userActions.add);
router.put("/api/users/:id", userActions.edit);
router.delete("/api/users/:id", userActions.destroy);

// Routes reservations
router.get("/api/books", bookActions.browse);
router.get("/api/books/:id", bookActions.read);
router.post("/api/books", bookActions.add);
router.put("/api/books/:id", bookActions.edit);
router.delete("/api/books/:id", bookActions.destroy);

// Routes demandes
router.get("/api/requests", requestActions.browse);
router.get("/api/requests/:id", requestActions.read);
router.post("/api/requests", requestActions.add);
router.put("/api/requests/:id", requestActions.edit);
router.delete("/api/requests/:id", requestActions.destroy);

// Routes véhicules
router.get("/api/vehicules", vehiculeActions.browse);
router.get("/api/vehicules/:id", vehiculeActions.read);
router.post("/api/vehicules", vehiculeActions.add);
router.put("/api/vehicules/:id", vehiculeActions.edit);
router.delete("/api/vehicules/:id", vehiculeActions.destroy);

// Routes stations protégées (modification, ajout, suppression)
router.post("/api/stations", stationsActions.add);
router.put("/api/stations/:id", stationsActions.edit);
router.delete("/api/stations/:id", stationsActions.destroy);

export default router;
