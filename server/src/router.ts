import path from "node:path";
import express from "express";
import upload from "./config/multer";
import { getImportHistory, importCsv } from "./controllers/importController";
import isAdmin from "./middleware/isAdmin";
import authenticateToken from "./middleware/isConnected";
import uploadAvatar from "./middleware/uploadAvatar";
import plugActions from "./modules/plugActions";
import requestActions from "./modules/requestActions";
import stationsActions from "./modules/stationsActions";
import userActions from "./modules/userActions";
import vehiculeActions from "./modules/vehiculeActions";
import bookRoutes from "./routes/book.routes";
import reservationRoutes from "./routes/reservation.routes";
import { startCronJobs } from "./tools/cron.service";

const router = express.Router();
router.use(express.static(path.join(__dirname, "..", "public")));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "avatar") {
      cb(null, "uploads/avatars/");
    } else if (file.fieldname === "vehicle_photo") {
      cb(null, "uploads/vehicle_photos/");
    } else {
      cb(null, "uploads/");
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });
const multiUpload = multer({ storage });

/* ************************************************************************* */
// 🌍 Routes PUBLIQUES (accessibles à tous)
/* ************************************************************************* */

// Routes d'authentification
router.post("/auth/login", userActions.login);
router.post(
  "/auth/register",
  uploadAvatar.single("avatar"),
  userActions.register,
);

router.post("/auth/logout", userActions.logout);
router.get("/auth/check", authenticateToken, userActions.check);
router.post("/auth/forgot-password", userActions.forgotPassword);
router.post("/auth/reset-password", userActions.resetPassword);

// Routes pour la map/stations (landing page)
router.get("/stations", stationsActions.browse);
router.get("/stations/visible", stationsActions.browseVisible);
router.get("/stations/:id", stationsActions.read);

// Routes pour les plugs
router.get("/plugs", plugActions.browse);

/* ************************************************************************* */
// 🛡️ Wall d'autorisation - Tout ce qui suit nécessite d'être connecté
/* ************************************************************************* */

router.use(authenticateToken);

/* ************************************************************************* */
// 🔒 Routes PROTÉGÉES (utilisateur connecté requis)
/* ************************************************************************* */

// Réservations
router.use("/books", bookRoutes);

// Route pour la création de réservation
router.use("/reservations", reservationRoutes);

// Route pour récupérer son propre profil (exemple)

/* ************************************************************************* */
// 👑 Wall d'administration - Tout ce qui suit nécessite d'être Admin
/* ************************************************************************* */

router.use(isAdmin);

/* ************************************************************************* */
// 🔑 Routes ADMIN (connecté ET admin requis)
/* ************************************************************************* */

// Routes utilisateurs
router.get("/users/me", userActions.getMe);
router.get("/users/:id", userActions.read);
router.get("/users", userActions.browse);
router.post("/users", userActions.add);
router.put("/users/:id", userActions.edit);
router.delete("/users/:id", userActions.destroy);

// Routes demandes
router.get("/requests", requestActions.browse);
router.get("/requests/:id", requestActions.read);
router.post("/requests", requestActions.add);
router.delete("/requests/:id", requestActions.destroy);

// Routes véhicules
router.get("/vehicules", vehiculeActions.browse);

// Routes stations protégées
router.post("/stations", stationsActions.add);
router.put("/stations/:id", stationsActions.edit);
router.delete("/stations/:id", stationsActions.destroy);

// Route pour import des données CSV
router.post("/import/csv", upload.single("csvfile"), importCsv);
router.get("/import/history", getImportHistory);

// Démarrage des tâches de fond (cron jobs)
startCronJobs();

export default router;
