import type { Response } from "express";
import { Op } from "sequelize";
import sequelize from "../config/database";
import type { AuthRequest } from "../middleware/isConnected";
import { Plug } from "../models/_index";
import { Book, ReservationStatus } from "../models/book.model";
import { Station } from "../models/station.model";
import { Terminal } from "../models/terminal.model";
import { LogLevel } from "../tools/logger";

const ReservationMin = 30;

interface CreateReservationBody {
  stationId: string;
  power: number;
  plugIds: string[];
}

export const createReservation = async (
  req: AuthRequest,
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

    console.log(
      `Réservation ${newReservation.id} créée pour l'utilisateur ${userId}`,
      LogLevel.INFO,
    );
    res.status(201).json(newReservation);
  } catch (error) {
    await transaction.rollback();
    console.error(
      "Erreur lors de la création de la réservation:",
      error,
      LogLevel.CRITICAL,
    );
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

export const browseByUser = async (
  req: AuthRequest,
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
      // On inclut les modèles associés pour enrichir la réponse
      // avec tous les détails nécessaires pour la page "Mes Réservations".
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
    console.error(
      "Erreur lors de la récupération des réservations de l'utilisateur:",
      error,
    );
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
