import { Router } from "express";
import {
  browseByUser,
  cancelReservation,
  createReservation,
} from "../controllers/reservation.controller";

const router = Router();

// Route pour créer une nouvelle réservation
router.post("/", createReservation);

// Route pour lister les réservations de l'utilisateur connecté
router.get("/me", browseByUser);

// Route pour annuler une réservation
router.delete("/me/:id", cancelReservation);

export default router;
