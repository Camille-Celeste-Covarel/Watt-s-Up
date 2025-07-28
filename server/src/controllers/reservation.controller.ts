import type { Response } from "express";
import { Op } from "sequelize";
import sequelize from "../config/database";
import { Plug } from "../models/_index";
import { Book, ReservationStatus } from "../models/book.model";
import { Station } from "../models/station.model";
import { Terminal } from "../models/terminal.model";
import { LogLevel, log } from "../tools/logger";
import type { AuthenticatedRequest } from "../types/auth/auth_type";

const ReservationMin = 30;

// --- Constantes pour la simulation de charge ---
const BATTERY_CAPACITY_KWH = 60;

const DAY_TARGET_PERCENTAGE = 0.8;
const DAY_START_MIN_PERCENTAGE = 0.12;
const DAY_START_MAX_PERCENTAGE = 0.36;

const NIGHT_TARGET_PERCENTAGE = 1.0;
const NIGHT_START_MIN_PERCENTAGE = 0.1;
const NIGHT_START_MAX_PERCENTAGE = 0.34;

const NIGHT_START_HOUR = 22;
const NIGHT_END_HOUR = 6;

// Fonction utilitaire pour un nombre aléatoire
const getRandomFloat = (min: number, max: number) =>
  Math.random() * (max - min) + min;

interface CreateReservationBody {
  stationId: string;
  power: number;
  plugIds: string[];
}

export const createReservation = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id;
  const { stationId, power, plugIds } = req.body as CreateReservationBody;

  if (!userId) {
    res.status(401).json({ message: "Utilisateur non identifié." });
    return;
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Vérifier si l'utilisateur a déjà une réservation active
    const existingReservation = await Book.findOne({
      where: {
        id_user: userId,
        status: {
          [Op.in]: [ReservationStatus.ACTIVE, ReservationStatus.IN_USE],
        },
      },
      transaction,
    });

    if (existingReservation) {
      await transaction.rollback();
      res
        .status(409)
        .json({ message: "Vous avez déjà une réservation en cours." });
      return;
    }

    // 2. Trouver une borne disponible correspondant aux critères
    const availableTerminal = await Terminal.findOne({
      where: {
        id_station: stationId,
        puissance_nominale: power,
        is_booked: false,
        [Op.and]: [
          sequelize.literal(
            `(SELECT COUNT(DISTINCT "id_plug") FROM "terminal_plug" WHERE "terminal_plug"."id_terminal" = "Terminal"."id") = ${plugIds.length}`,
          ),
          sequelize.literal(
            `(SELECT COUNT(DISTINCT "id_plug") FROM "terminal_plug" WHERE "terminal_plug"."id_terminal" = "Terminal"."id" AND "terminal_plug"."id_plug" IN ('${plugIds.join(
              "','",
            )}')) = ${plugIds.length}`,
          ),
        ],
      },
      order: [["createdAt", "ASC"]],
      transaction,
    });

    if (!availableTerminal) {
      await transaction.rollback();
      res
        .status(409)
        .json({ message: "Aucune borne de ce type n'est disponible." });
      return;
    }

    // 3. Mettre à jour la borne et créer la réservation
    await availableTerminal.update({ is_booked: true }, { transaction });

    const expires_at = new Date(Date.now() + ReservationMin * 60 * 1000);

    const newReservation = await Book.create(
      { id_user: userId, id_terminal: availableTerminal.id, expires_at },
      { transaction },
    );

    await transaction.commit();

    log(
      `Réservation ${newReservation.id} créée pour l'utilisateur ${userId}`,
      LogLevel.INFO,
    );
    res.status(201).json(newReservation);
  } catch (error) {
    await transaction.rollback();
    log(
      "Erreur lors de la création de la réservation:",
      LogLevel.CRITICAL,
      error,
    );
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

export const cancelReservation = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id;
  const { id: reservationId } = req.params;

  if (!userId) {
    res.status(401).json({ message: "Utilisateur non identifié." });
    return;
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Trouver la réservation à annuler
    const reservation = await Book.findOne({
      where: {
        id: reservationId,
        id_user: userId,
      },
      transaction,
    });

    // 2. Vérifier si la réservation existe et peut être annulée
    if (!reservation) {
      await transaction.rollback();
      res.status(404).json({ message: "Réservation non trouvée." });
      return;
    }

    if (reservation.status !== ReservationStatus.ACTIVE) {
      await transaction.rollback();
      res.status(409).json({
        message: `Cette réservation ne peut pas être annulée (statut: ${reservation.status}).`,
      });
      return;
    }

    // 3. Mettre à jour le statut de la réservation
    await reservation.update(
      { status: ReservationStatus.CANCELLED },
      { transaction },
    );

    // 4. Libérer la borne associée
    await Terminal.update(
      { is_booked: false },
      { where: { id: reservation.id_terminal }, transaction },
    );

    await transaction.commit();

    log(
      `Réservation ${reservation.id} annulée par l'utilisateur ${userId}.`,
      LogLevel.INFO,
    );
    res.status(200).json({ message: "Réservation annulée avec succès." });
  } catch (error) {
    await transaction.rollback();
    log(
      "Erreur lors de l'annulation de la réservation:",
      LogLevel.CRITICAL,
      error,
    );
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

export const startCharge = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id;
  const { id: reservationId } = req.params;

  if (!userId) {
    res.status(401).json({ message: "Utilisateur non identifié." });
    return;
  }

  const transaction = await sequelize.transaction();

  try {
    const reservation = await Book.findOne({
      where: {
        id: reservationId,
        id_user: userId,
      },
      include: [
        { model: Terminal, as: "terminal", attributes: ["puissance_nominale"] },
      ],
      transaction,
    });

    if (!reservation) {
      await transaction.rollback();
      res.status(404).json({ message: "Réservation non trouvée." });
      return;
    }

    if (reservation.status !== ReservationStatus.ACTIVE) {
      await transaction.rollback();
      res.status(409).json({
        message: `La charge ne peut pas être démarrée pour cette réservation (statut: ${reservation.status}).`,
      });
      return;
    }

    // --- Logique de simulation de charge ---
    const now = new Date();
    const currentHour = now.getHours();
    const isNight =
      currentHour >= NIGHT_START_HOUR || currentHour < NIGHT_END_HOUR;

    const startPercentage = isNight
      ? getRandomFloat(NIGHT_START_MIN_PERCENTAGE, NIGHT_START_MAX_PERCENTAGE)
      : getRandomFloat(DAY_START_MIN_PERCENTAGE, DAY_START_MAX_PERCENTAGE);

    const targetPercentage = isNight
      ? NIGHT_TARGET_PERCENTAGE
      : DAY_TARGET_PERCENTAGE;

    const percentageToCharge = targetPercentage - startPercentage;
    const energyToChargeKwh = BATTERY_CAPACITY_KWH * percentageToCharge;

    if (!reservation.terminal) {
      await transaction.rollback();
      log("Terminal details not found for reservation.", LogLevel.ERROR, {
        reservationId,
      });
      res.status(500).json({ message: "Détails de la borne introuvables." });
      return;
    }
    const powerKw = reservation.terminal.puissance_nominale;
    const chargeDurationHours = powerKw > 0 ? energyToChargeKwh / powerKw : 0;
    const chargeDurationMs = chargeDurationHours * 60 * 60 * 1000;

    const session_ends_at = new Date(now.getTime() + chargeDurationMs);

    await reservation.update(
      {
        status: ReservationStatus.IN_USE,
        charge_started_at: now,
        session_ends_at,
      },
      { transaction },
    );

    await transaction.commit();

    log(
      `Charge démarrée pour la réservation ${reservation.id} par l'utilisateur ${userId}.`,
      LogLevel.INFO,
    );
    // On recharge la réservation pour avoir toutes les données à jour
    const updatedReservation = await Book.findByPk(reservationId);
    res.status(200).json(updatedReservation);
  } catch (error) {
    await transaction.rollback();
    log("Erreur lors du démarrage de la charge:", LogLevel.CRITICAL, error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

export const stopCharge = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id;
  const { id: reservationId } = req.params;

  if (!userId) {
    res.status(401).json({ message: "Utilisateur non identifié." });
    return;
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Trouver la réservation à arrêter
    const reservation = await Book.findOne({
      where: {
        id: reservationId,
        id_user: userId,
      },
      transaction,
    });

    // 2. Vérifier si la réservation existe et peut être arrêtée
    if (!reservation) {
      await transaction.rollback();
      res.status(404).json({ message: "Réservation non trouvée." });
      return;
    }

    if (reservation.status !== ReservationStatus.IN_USE) {
      await transaction.rollback();
      res.status(409).json({
        message: `Cette charge ne peut pas être arrêtée (statut: ${reservation.status}).`,
      });
      return;
    }

    // 3. Mettre à jour le statut et libérer la borne
    await reservation.update(
      { status: ReservationStatus.COMPLETED },
      { transaction },
    );
    await Terminal.update(
      { is_booked: false },
      { where: { id: reservation.id_terminal }, transaction },
    );

    await transaction.commit();

    log(
      `Charge pour la réservation ${reservation.id} arrêtée par l'utilisateur ${userId}.`,
      LogLevel.INFO,
    );
    res.status(200).json({ message: "Charge arrêtée avec succès." });
  } catch (error) {
    await transaction.rollback();
    log("Erreur lors de l'arrêt de la charge:", LogLevel.CRITICAL, error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

export const browseByUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    // Sécurité supplémentaire
    res.status(401).json({ message: "Utilisateur non identifié." });
    return;
  }

  try {
    const reservations = await Book.findAll({
      where: { id_user: userId },
      include: [
        {
          model: Terminal,
          as: "terminal",
          attributes: ["id", "puissance_nominale", "num_pdc"],
          include: [
            {
              model: Station,
              as: "station",
              attributes: ["id", "nom_station", "adresse_station"],
            },
            {
              model: Plug,
              as: "plugs",
              attributes: ["name"],
              through: { attributes: [] },
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(reservations);
  } catch (error) {
    log(
      "Erreur lors de la récupération des réservations de l'utilisateur:",
      LogLevel.ERROR,
      error,
    );
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
