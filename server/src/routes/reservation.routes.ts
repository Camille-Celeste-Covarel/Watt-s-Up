import { Router } from "express";
import { createReservation } from "../controllers/reservation.controller";
import { isAuthenticatedForReservation } from "../middleware/reservationAuth";

const router = Router();

router.post("/", isAuthenticatedForReservation, createReservation);

export default router;
