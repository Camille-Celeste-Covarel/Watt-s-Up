import { Router } from "express";
import {
  browseByUser,
  createReservation,
} from "../controllers/reservation.controller";

const router = Router();

// Route pour créer une nouvelle réservation
router.post("/", createReservation);

// Route pour lister les réservations de l'utilisateur connecté
router.get("/me", browseByUser);

export default router;
