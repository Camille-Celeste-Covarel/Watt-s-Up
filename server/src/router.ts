import express from "express";
import upload from "./config/multer";
import { importCsv } from "./controllers/importController";
import authenticateToken from "./middleware/isConnected";
import requestActions from "./modules/requestActions";
import stationsActions from "./modules/stationsActions";
import userActions from "./modules/userActions";
import vehiculeActions from "./modules/vehiculeActions";
import bookRoutes from "./routes/book.routes";
import reservationRoutes from "./routes/reservation.routes";
import { startCronJobs } from "./tools/cron.service";

const router = express.Router();

/* ************************************************************************* */
// 🌍 Routes PUBLIQUES (accessibles à tous)
/* ************************************************************************* */

// Routes d'authentification
router.post("/auth/login", userActions.login);
router.post("/auth/register", userActions.register);
router.post("/auth/logout", userActions.logout);
router.get("/auth/check", authenticateToken, (req, res) => {
  res.json({ authenticated: true });
});

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

// Routes utilisateurs
router.get("/users", userActions.browse);
router.get("/users/:id", userActions.read);
router.post("/users", userActions.add);
router.put("/users/:id", userActions.edit);
router.delete("/users/:id", userActions.destroy);

// Réservations
router.use("/books", bookRoutes);

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

// Routes stations protégées
router.post("/stations", stationsActions.add);
router.put("/stations/:id", stationsActions.edit);
router.delete("/stations/:id", stationsActions.destroy);

// Route pour la création de réservation
router.use("/reservations", reservationRoutes);

// Route pour import des données CSV
router.post("/import/csv", upload.single("csvFile"), importCsv);

// Démarrage des tâches de fond (cron jobs)
startCronJobs();

export default router;
