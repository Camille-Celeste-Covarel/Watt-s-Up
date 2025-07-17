import express, { type Request, type Response } from "express";
import upload from "./config/multer";
import { importCsv } from "./controllers/importController";
import isAdmin from "./middleware/isAdmin"; // Importer le middleware isAdmin
import authenticateToken from "./middleware/isConnected";
import requestActions from "./modules/requestActions";
import stationsActions from "./modules/stationsActions";
import userActions from "./modules/userActions";
import vehiculeActions from "./modules/vehiculeActions";
import bookRoutes from "./routes/book.routes";
import reservationRoutes from "./routes/reservation.routes";
import { startCronJobs } from "./tools/cron.service";

// On définit une interface pour les requêtes qui ont passé le middleware d'authentification.
// Cela nous permet d'éviter `any` et de bénéficier de l'autocomplétion et de la sécurité des types.
interface AuthenticatedRequest extends Request {
  user?: {
    isAdmin: boolean;
    firstName: string;
  };
}

const router = express.Router();

/* ************************************************************************* */
// 🌍 Routes PUBLIQUES (accessibles à tous)
/* ************************************************************************* */

// Routes d'authentification
router.post("/auth/login", userActions.login);
router.post("/auth/register", userActions.register);
router.post("/auth/logout", userActions.logout);
router.get(
  "/auth/check",
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    // Par sécurité, on vérifie que le middleware a bien attaché l'objet user
    if (!req.user) {
      res.status(401).json({ error: "Token invalide ou manquant." });
      return; // On utilise un `return` seul pour quitter la fonction sans retourner de valeur
    }

    // Renvoyer les infos de l'utilisateur pour que le front puisse adapter l'UI
    res.json({
      authenticated: true,
      user: { isAdmin: req.user.isAdmin, firstName: req.user.firstName },
    });
  },
);

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

// Réservations
router.use("/books", bookRoutes);

// Route pour la création de réservation
router.use("/reservations", reservationRoutes);

// Route pour récupérer son propre profil (exemple)
// router.get("/users/me", userActions.readSelf); // Il faudra créer cette action

/* ************************************************************************* */
// 👑 Wall d'administration - Tout ce qui suit nécessite d'être Admin
/* ************************************************************************* */

router.use(isAdmin);

/* ************************************************************************* */
// 🔑 Routes ADMIN (connecté ET admin requis)
/* ************************************************************************* */

// Routes utilisateurs
router.get("/users", userActions.browse);
router.get("/users/:id", userActions.read);
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

// Démarrage des tâches de fond (cron jobs)
startCronJobs();

export default router;
