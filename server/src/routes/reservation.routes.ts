import { Router } from "express";
import {
  browseByUser,
  cancelReservation,
  createReservation,
  startCharge,
  stopCharge,
} from "../controllers/reservation.controller";

const router = Router();

// Route pour créer une nouvelle réservation
router.post("/", createReservation);

// Route pour lister les réservations de l'utilisateur connecté
router.get("/me", browseByUser);

// Route pour annuler une réservation
router.delete("/me/:id", cancelReservation);

// Route pour démarrer une charge
router.post("/me/:id/start", startCharge);

// Route pour arrêter une charge manuellement
router.post("/me/:id/stop", stopCharge);

export default router;
