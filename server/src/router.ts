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
router.post("/auth/login", userActions.login);
router.post("/auth/register", userActions.register);
router.post("/auth/logout", userActions.logout);

// Routes pour la map/stations (landing page)
router.get("/stations", stationsActions.browse);
router.get("/stations/visible", stationsActions.browseVisible);
router.get("/stations/:id", stationsActions.read);

/* ************************************************************************* */
// 🛡️ Wall d'autorisation - Tout ce qui suit nécessite d'être connecté
/* ************************************************************************* */

router.use(authenticateToken);

/* ************************************************************************* */
// 🔒 Routes PROTÉGÉES (utilisateur connecté requis)
/* ************************************************************************* */

router.post("/import/csv", upload.single("csvFile"), importCsv);

// Routes utilisateurs (admin seulement)
router.get("/users", userActions.browse);
router.get("/users/:id", userActions.read);
router.post("/users", userActions.add);
router.put("/users/:id", userActions.edit);
router.delete("/users/:id", userActions.destroy);

// Routes reservations
router.get("/books", bookActions.browse);
router.get("/books/:id", bookActions.read);
router.post("/books", bookActions.add);
router.put("/books/:id", bookActions.edit);
router.delete("/books/:id", bookActions.destroy);

// Routes demandes
router.get("/requests", requestActions.browse);
router.get("/requests/:id", requestActions.read);
router.post("/requests", requestActions.add);
router.put("/requests/:id", requestActions.edit);
router.delete("/requests/:id", requestActions.destroy);

// Routes véhicules
router.get("/vehicules", vehiculeActions.browse);
router.get("/vehicules/:id", vehiculeActions.read);
router.post("/vehicules", vehiculeActions.add);
router.put("/vehicules/:id", vehiculeActions.edit);
router.delete("/vehicules/:id", vehiculeActions.destroy);

// Routes stations protégées (modification, ajout, suppression)
router.post("/stations", stationsActions.add);
router.put("/stations/:id", stationsActions.edit);
router.delete("/stations/:id", stationsActions.destroy);

export default router;
