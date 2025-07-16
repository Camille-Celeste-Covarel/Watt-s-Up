import cron from "node-cron";
import { Op } from "sequelize";
import sequelize from "../config/database";
import { Book, ReservationStatus } from "../models/book.model";
import { Terminal } from "../models/terminal.model";
import { LogLevel, log } from "./logger";

/**
 * Cherche et expire les réservations qui ont dépassé leur date d'expiration.
 * Cette fonction est conçue pour être appelée périodiquement par une tâche cron.
 */
const expireReservations = async (): Promise<void> => {
  log("Cron job: Vérification des réservations expirées...", LogLevel.INFO);

  const transaction = await sequelize.transaction();

  try {
    // 1. Trouver toutes les réservations actives dont la date d'expiration est passée
    const expiredBookings = await Book.findAll({
      where: {
        status: ReservationStatus.ACTIVE,
        expires_at: {
          [Op.lt]: new Date(), // [Op.lt] signifie "less than" (inférieur à)
        },
      },
      transaction,
    });

    if (expiredBookings.length === 0) {
      log("Cron job: Aucune réservation à expirer.", LogLevel.INFO);
      await transaction.commit();
      return;
    }

    const expiredBookingIds = expiredBookings.map((b) => b.id);
    const terminalIdsToRelease = expiredBookings.map((b) => b.id_terminal);

    // 2. Mettre à jour le statut des réservations en 'EXPIRED'
    await Book.update(
      { status: ReservationStatus.EXPIRED },
      { where: { id: { [Op.in]: expiredBookingIds } }, transaction },
    );

    // 3. Libérer les bornes correspondantes
    await Terminal.update(
      { is_booked: false },
      { where: { id: { [Op.in]: terminalIdsToRelease } }, transaction },
    );

    await transaction.commit();
    log(
      `Cron job: ${expiredBookings.length} réservation(s) expirée(s) et borne(s) libérée(s).`,
      LogLevel.SUCCESS,
    );
  } catch (error) {
    await transaction.rollback();
    log(
      "Cron job: Erreur lors de l'expiration des réservations.",
      LogLevel.ERROR,
      error,
    );
  }
};

/**
 * Cherche et complète les sessions de charge qui sont terminées.
 * Libère la borne et met le statut à COMPLETED.
 */
const completeChargeSessions = async (): Promise<void> => {
  log(
    "Cron job: Vérification des sessions de charge terminées...",
    LogLevel.INFO,
  );

  const transaction = await sequelize.transaction();
  try {
    const completedSessions = await Book.findAll({
      where: {
        status: ReservationStatus.IN_USE,
        session_ends_at: {
          [Op.ne]: null, // On s'assure que la date de fin n'est pas nulle
          [Op.lt]: new Date(),
        },
      },
      transaction,
    });

    if (completedSessions.length === 0) {
      await transaction.commit();
      return;
    }

    const completedBookingIds = completedSessions.map((s) => s.id);
    const terminalIdsToRelease = completedSessions.map((s) => s.id_terminal);

    await Book.update(
      { status: ReservationStatus.COMPLETED },
      { where: { id: { [Op.in]: completedBookingIds } }, transaction },
    );

    await Terminal.update(
      { is_booked: false },
      { where: { id: { [Op.in]: terminalIdsToRelease } }, transaction },
    );

    await transaction.commit();
    log(
      `Cron job: ${completedSessions.length} session(s) de charge terminée(s) et borne(s) libérée(s).`,
      LogLevel.SUCCESS,
    );
  } catch (error) {
    await transaction.rollback();
    log(
      "Cron job: Erreur lors de la complétion des sessions.",
      LogLevel.ERROR,
      error,
    );
  }
};

/**
 * Démarre toutes les tâches planifiées de l'application.
 */
export const startCronJobs = (): void => {
  // S'exécute toutes les minutes ('* * * * *')
  cron.schedule("* * * * *", () => void expireReservations());
  cron.schedule("* * * * *", () => void completeChargeSessions());
  log(
    "Tâches Cron démarrées. La vérification des réservations est active.",
    LogLevel.INFO,
  );
};
