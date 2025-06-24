import fs from "node:fs";
import path from "node:path";
import type { Writable } from "node:stream";
import type { Request, Response } from "express";
import * as fastCsv from "fast-csv";
import type { Transaction } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import sequelize from "../config/database";
import { transformCsvRowToEntities } from "../data-processing/dataTransformer";
import * as Models from "../models/_index";
import type { CsvRow } from "../types/dataProcessing/dataProcessing";
import type {
  CustomFile,
  TransformError,
  TransformResult,
} from "../types/dataProcessing/importProcessingTypes";
import type {
  StationAttributes,
  TerminalAttributes,
} from "../types/models/models";

import {
  initializeConsoleLogStream,
  logImportErrorToFile,
  redirectConsoleOutput,
  restoreConsoleOutput,
} from "../tools/logger";

initializeConsoleLogStream();
redirectConsoleOutput();

console.log("[DEBUG - FILE START] importController.ts chargé.");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "..", "CSVCache");
const BATCH_SIZE = 500;
const ERROR_LOG_DIR = path.join(__dirname, "..", "..", "..", "logs");

if (!fs.existsSync(ERROR_LOG_DIR)) {
  fs.mkdirSync(ERROR_LOG_DIR, { recursive: true });
}

const processedStationsGlobalCache = new Map<string, Models.Station>();

/**
 * Traite un lot de lignes CSV, tente de persister les données dans la base de données
 * et gère les erreurs spécifiques aux transactions de lot.
 * @param {Array<Object>} batch - Le lot de lignes CSV à traiter.
 * @param {Object} errorCounts - Un objet pour compter les différents types d'erreurs.
 * @param {Writable} errorLogStream - Le stream pour écrire les logs d'erreurs spécifiques à l'importation.
 * @returns {Promise<{ success: boolean; count: number }>} Un objet indiquant le succès du lot et le nombre de lignes traitées.
 */

async function processBatch(
  batch: {
    rowData: CsvRow;
    transformedResult: TransformResult;
    rowNumber: number;
  }[],
  errorCounts: Record<string, number>,
  errorLogStream: Writable,
): Promise<{ success: boolean; count: number }> {
  let transactionInstance: Transaction | undefined;
  let stationLookupCriteria: { [key: string]: unknown } = {};
  let stationIdentifier = "";
  try {
    console.log(
      `[DEBUG - Batch] Début du traitement du lot de ${batch.length} lignes (de ${batch[0]?.rowNumber} à ${batch[batch.length - 1]?.rowNumber}).`,
    );
    transactionInstance = await sequelize.transaction();
    console.log(
      `[DEBUG - Batch] Lot ${batch[0]?.rowNumber}-${batch[batch.length - 1]?.rowNumber}: Transaction démarrée.`,
    );

    for (const item of batch) {
      const { transformedResult } = item;

      if (!transformedResult.success) {
        const error = (
          item.transformedResult as { success: false; error: TransformError }
        ).error;
        errorCounts[error.type] = (errorCounts[error.type] || 0) + 1;
        console.error(
          `[DEBUG - Batch] Ligne ${item.rowNumber}: Erreur détectée par le transformateur: ${error.type} - ${error.message}.`,
        );
        await logImportErrorToFile(
          {
            type: error.type,
            message: error.message,
            rowData: item.rowData,
            rowNumber: item.rowNumber,
            details: error.details,
          },
          errorLogStream,
        );
        continue;
      }
      const { stationData, terminalData, plugAssociations } =
        transformedResult.data;
      let station: Models.Station | null = null;

      stationIdentifier =
        stationData.id_station_itinerance &&
        stationData.id_station_itinerance.trim() !== ""
          ? stationData.id_station_itinerance.trim().toLowerCase()
          : `${stationData.nom_station}-${stationData.consolidated_latitude}-${stationData.consolidated_longitude}`
              .trim()
              .toLowerCase();

      station = processedStationsGlobalCache.get(stationIdentifier) || null;

      try {
        if (!station) {
          stationLookupCriteria = {};

          let foundOrCreatedStation: Models.Station;
          let created: boolean;

          if (
            stationData.id_station_itinerance &&
            stationData.id_station_itinerance.trim() !== ""
          ) {
            stationLookupCriteria.id_station_itinerance =
              stationData.id_station_itinerance.trim();
            console.log(
              `[DEBUG - Station] Ligne ${item.rowNumber}: Recherche station par id_station_itinerance: ${stationData.id_station_itinerance}`,
            );
            [foundOrCreatedStation, created] =
              await Models.Station.findOrCreate({
                where: stationLookupCriteria,
                defaults: stationData as StationAttributes,
                transaction: transactionInstance,
              });
          } else {
            stationLookupCriteria.nom_station = stationData.nom_station;
            stationLookupCriteria.consolidated_latitude =
              stationData.consolidated_latitude;
            stationLookupCriteria.consolidated_longitude =
              stationData.consolidated_longitude;
            console.log(
              `[DEBUG - Station] Ligne ${item.rowNumber}: Recherche station par nom/coords: ${stationData.nom_station}, ${stationData.consolidated_latitude}, ${stationData.consolidated_longitude}`,
            );
            [foundOrCreatedStation, created] =
              await Models.Station.findOrCreate({
                where: stationLookupCriteria,
                defaults: stationData as StationAttributes,
                transaction: transactionInstance,
              });
          }

          station = foundOrCreatedStation;
          console.log(
            `[DEBUG - Station] Ligne ${item.rowNumber}: Station ${created ? "créée" : "trouvée"} avec ID ${station.id}. ID_Station_Itinerance: ${station.id_station_itinerance || "N/A"}.`,
          );

          if (!created) {
            console.log(
              `[DEBUG - Station] Ligne ${item.rowNumber}: Station existante avec ID ${station.id}, tentative de mise à jour.`,
            );
            const {
              createdAt: stationCreatedAt,
              updatedAt: stationUpdatedAt,
              ...updateData
            } = stationData;
            await station.update(updateData as StationAttributes, {
              transaction: transactionInstance,
            });
            console.log(
              `[DEBUG - Station] Ligne ${item.rowNumber}: Station mise à jour.`,
            );
          }
          processedStationsGlobalCache.set(stationIdentifier, station);
        } else {
        }
      } catch (stationError: unknown) {
        console.error(
          `[ERROR - Station] Ligne ${item.rowNumber}: Échec lors de la création/mise à jour de la station. ` +
            `Identifiant utilisé pour le cache: "${stationIdentifier}". ` +
            `Critères de recherche potentiels: ${JSON.stringify(stationLookupCriteria)}. ` +
            `Données de la station: ${JSON.stringify(stationData)}. ` +
            `Erreur: ${(stationError as Error).message}.`,
        );

        errorCounts.STATION_UPSERT_FAILED =
          (errorCounts.STATION_UPSERT_FAILED || 0) + 1;
        await logImportErrorToFile(
          {
            type: "STATION_UPSERT_FAILED",
            message: `Échec persistance station: ${(stationError as Error).message}`,
            rowData: item.rowData,
            rowNumber: item.rowNumber,
            details: stationError as Error,
          },
          errorLogStream,
        );
        continue;
      }

      if (!station || !station.id) {
        console.error(
          `[ERROR - Terminal] Ligne ${item.rowNumber}: Station non disponible pour la liaison du terminal. Le terminal ne sera PAS inséré.`,
        );
        errorCounts.MISSING_PARENT_STATION =
          (errorCounts.MISSING_PARENT_STATION || 0) + 1;
        await logImportErrorToFile(
          {
            type: "MISSING_PARENT_STATION",
            message:
              "Impossible d'insérer le terminal car la station parente n'a pas été trouvée ou créée.",
            rowData: item.rowData,
            rowNumber: item.rowNumber,
            details:
              "La logique de création/mise à jour de la station a échoué pour une raison non identifiée ou la station n'est pas disponible.",
          },
          errorLogStream,
        );
        continue;
      }

      const terminalCreateData: Partial<TerminalAttributes> = {
        ...terminalData,
        idStation: station.id,
      };

      const {
        createdAt: terminalCreatedAt,
        updatedAt: terminalUpdatedAt,
        ...filteredTerminalCreateData
      } = terminalCreateData;

      let terminal = await Models.Terminal.findOne({
        where: {
          id_pdc_itinerance: filteredTerminalCreateData.id_pdc_itinerance,
        },
        transaction: transactionInstance,
      });

      if (terminal) {
        await terminal.update(
          filteredTerminalCreateData as TerminalAttributes,
          {
            transaction: transactionInstance,
          },
        );
      } else {
        terminal = await Models.Terminal.create(
          filteredTerminalCreateData as TerminalAttributes,
          { transaction: transactionInstance },
        );
      }

      await Models.TerminalPlug.destroy({
        where: { idTerminal: terminal.id },
        transaction: transactionInstance,
      });

      if (plugAssociations.length > 0) {
        const terminalPlugsToCreate = plugAssociations.map(
          (pa: { idPlug: number }) => ({
            idTerminal: terminal.id,
            idPlug: pa.idPlug,
          }),
        );
        await Models.TerminalPlug.bulkCreate(terminalPlugsToCreate, {
          transaction: transactionInstance,
        });
      }
    }
    console.log(
      `[DEBUG - Batch] Lot ${batch[0]?.rowNumber}-${batch[batch.length - 1]?.rowNumber}: Toutes les lignes du lot traitées. Tentative de commit.`,
    );
    await transactionInstance.commit();
    console.log(
      `[DEBUG - Batch] Lot ${batch[0]?.rowNumber}-${batch[batch.length - 1]?.rowNumber}: Transaction commitée avec succès.`,
    );
    return { success: true, count: batch.length };
  } catch (batchError: unknown) {
    if (transactionInstance) {
      console.log(
        `[DEBUG - Batch] Lot ${batch[0]?.rowNumber}-${batch[batch.length - 1]?.rowNumber}: Erreur de lot. Tentative de rollback.`,
      );
      await transactionInstance.rollback();
      console.log(
        `[DEBUG - Batch] Lot ${batch[0]?.rowNumber}-${batch[batch.length - 1]?.rowNumber}: Rollback effectué.`,
      );
    }
    let errorType = "DATABASE_BATCH_ERROR";
    let errorMessage = `Erreur lors du traitement d'un lot de données: ${(batchError as Error).message}`;
    let errorDetails: unknown = batchError;

    if (batchError instanceof Error) {
      if (
        batchError.message.includes(
          "valeur trop longue pour le type character varying",
        )
      ) {
        errorType = "VALUE_TOO_LONG";
        const match = batchError.message.match(/column "(\w+)"/);
        const columnName = match ? match[1] : "Unknown Column";
        errorMessage = `Valeur trop longue pour la colonne "${columnName}".`;
        errorDetails = {
          message: batchError.message,
          column: columnName,
          originalError: batchError,
        };
        console.error(
          `[DEBUG - Batch] Erreur de valeur trop longue: ${errorMessage}`,
        );
      } else if (batchError.message.includes("violates unique constraint")) {
        errorType = "DATABASE_UNIQUE_CONSTRAINT_VIOLATION";
        errorMessage = `Violation de contrainte unique: ${batchError.message}`;
        errorDetails = {
          message: batchError.message,
          originalError: batchError,
        };
        console.error(
          `[DEBUG - Batch] Erreur de contrainte unique: ${errorMessage}`,
        );
      } else if (
        batchError.message.includes("violates foreign key constraint")
      ) {
        errorType = "DATABASE_FOREIGN_KEY_VIOLATION";
        errorMessage = `Violation de contrainte de clé étrangère: ${batchError.message}`;
        errorDetails = {
          message: batchError.message,
          originalError: batchError,
        };
        console.error(
          `[DEBUG - Batch] Erreur de clé étrangère: ${errorMessage}`,
        );
      } else if (
        batchError.message.includes("n'a pas de champs « updatedat »")
      ) {
        errorType = "MISSING_UPDATED_AT";
        const entityMatch = batchError.message.match(/table « (\w+) »/);
        const entityName = entityMatch ? entityMatch[1] : "Unknown Entity";
        errorMessage = `L'enregistrement "${entityName}" n'a pas de champ "updatedat".`;
        errorDetails = {
          message: batchError.message,
          entity: entityName,
          originalError: batchError,
        };
        console.error(
          `[DEBUG - Batch] Erreur 'updatedat' manquant: ${errorMessage}`,
        );
      } else {
        errorDetails = batchError;
        console.error(
          `[DEBUG - Batch] Erreur inattendue dans le lot: ${errorMessage}`,
          batchError,
        );
      }
    }

    errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    console.error(`[DEBUG - Batch] Erreur critique du lot: ${errorMessage}`);
    await logImportErrorToFile(
      {
        type: errorType,
        message: errorMessage,
        rowData: batch.length > 0 ? batch[0].rowData : ({} as CsvRow),
        rowNumber: batch.length > 0 ? batch[0].rowNumber : -1,
        details: errorDetails,
      },
      errorLogStream,
    );
    return { success: false, count: batch.length };
  }
}

export const importCsv = async (req: Request, res: Response): Promise<void> => {
  console.log("[DEBUG - IMPORT_CSV START] Fonction importCsv appelée.");

  processedStationsGlobalCache.clear();

  const importUuid = uuidv4();
  const currentErrorLogFile = path.join(
    ERROR_LOG_DIR,
    `import_errors_${importUuid}.log`,
  );

  let importCompleted: boolean;
  importCompleted = false;
  let totalProcessedLines = 0;
  const totalLinesFromMetadata = 135913;
  const batchPromises: Promise<{ success: boolean; count: number }>[] = [];

  const errorLogStream = fs.createWriteStream(currentErrorLogFile, {
    flags: "a",
  });
  errorLogStream.on("error", (err) => {
    console.error(
      `ERREUR CRITIQUE du stream de log d'erreur: Impossible d'écrire dans ${currentErrorLogFile}: ${err.message}`,
    );
  });

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  if (!req.file) {
    console.log(
      "[DEBUG - IMPORT_CSV] Aucun fichier fourni, renvoi erreur 400.",
    );
    errorLogStream.end();
    res.status(400).json({
      message: "Aucun fichier CSV fourni.",
      importId: importUuid,
      errorLogFile: currentErrorLogFile,
    });
    return;
  }

  const filePath = (req.file as CustomFile).path;
  const errorCounts: Record<string, number> = {};
  let currentBatch: {
    rowData: CsvRow;
    transformedResult: TransformResult;
    rowNumber: number;
  }[] = [];

  try {
    const csvStream = fs
      .createReadStream(filePath)
      .pipe(fastCsv.parse({ headers: true }));

    let lastProgressPercentage = -1;
    for await (const row of csvStream as AsyncIterable<CsvRow>) {
      totalProcessedLines++;

      const currentProgressPercentage = Math.floor(
        (totalProcessedLines / totalLinesFromMetadata) * 100,
      );
      if (currentProgressPercentage > lastProgressPercentage) {
        console.log(
          `[PROGRESS] Traitement en cours : ${currentProgressPercentage}% des lignes traitées.`,
        );
        lastProgressPercentage = currentProgressPercentage;
      }

      const transformedResult = await transformCsvRowToEntities(
        row,
        totalProcessedLines,
      );
      currentBatch.push({
        rowData: row,
        transformedResult,
        rowNumber: totalProcessedLines,
      });

      if (currentBatch.length >= BATCH_SIZE) {
        batchPromises.push(
          processBatch(currentBatch, errorCounts, errorLogStream),
        );
        console.log(
          `[DEBUG - CSV STREAM] Lot de ${currentBatch.length} lignes traité, promesse ajoutée. Taille batchPromises: ${batchPromises.length}`,
        );
        currentBatch = [];
      }
    }

    console.log(
      `[DEBUG - CSV STREAM] Fin du stream CSV. Traitement du dernier lot (${currentBatch.length} lignes restantes).`,
    );
    if (currentBatch.length > 0) {
      batchPromises.push(
        processBatch(currentBatch, errorCounts, errorLogStream),
      );
      console.log(
        `[DEBUG - CSV STREAM] Promesse du dernier lot ajoutée. Taille batchPromises: ${batchPromises.length}`,
      );
    }

    console.log(
      `[DEBUG - CSV STREAM] Attente de la résolution de toutes les promesses de lots (batchPromises contient ${batchPromises.length} lots au total) en SÉQUENTIEL.`,
    );
    for (const promise of batchPromises) {
      await promise;
    }
    console.log(
      "[DEBUG - CSV STREAM] Toutes les promesses de lots résolues SÉQUENTIELLEMENT.",
    );

    importCompleted = true;
    await fs.promises.unlink(filePath);
    console.log("[DEBUG - CSV STREAM] Fichier temporaire supprimé.");

    errorLogStream.end();
    console.log(
      "[DEBUG - LOG STREAM] Commande de fermeture du stream de log d'erreur envoyée.",
    );

    console.log(
      "[DEBUG - LOG STREAM] Commande de fermeture du stream global de console envoyée.",
    );

    const totalErrors = Object.values(errorCounts).reduce(
      (sum, count) => sum + count,
      0,
    );
    const status =
      totalErrors === 0
        ? "SUCCESS"
        : totalErrors < totalProcessedLines
          ? "PARTIAL_SUCCESS"
          : "FAILED";

    await Models.ImportLog.create({
      importId: importUuid,
      fileName: (req.file as CustomFile).originalname,
      totalLinesProcessed: totalProcessedLines,
      successfulLines: totalProcessedLines - totalErrors,
      errorSummary: errorCounts,
      errorLogFilePath: currentErrorLogFile,
      status: status,
      importDate: new Date(),
    });
    console.log("[DEBUG - IMPORT_LOG] Entrée ImportLog créée en BDD.");

    res.status(200).json({
      message: "Importation CSV terminée.",
      importId: importUuid,
      totalLinesProcessed: totalProcessedLines,
      successfulLines: totalProcessedLines - totalErrors,
      errorSummary: errorCounts,
      errorLogFile: currentErrorLogFile,
      status: status,
    });
  } catch (streamError: unknown) {
    console.error(
      `[DEBUG - CSV STREAM] Erreur de lecture du stream CSV ou de traitement (catch principal): ${streamError}`,
    );
    if (!importCompleted) {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log(
          "[DEBUG - CSV STREAM] Fichier temporaire supprimé après erreur.",
        );
      }
      errorLogStream.end();

      console.error(
        "[DEBUG - LOG STREAM] Commande de fermeture du stream global de console envoyée suite à une erreur.",
      );

      const status = "FAILED";
      await Models.ImportLog.create({
        importId: importUuid,
        fileName:
          (req.file as CustomFile)?.originalname || "N/A (Stream Error)",
        totalLinesProcessed: totalProcessedLines,
        successfulLines: 0,
        errorSummary: {
          message: `Erreur lors de la lecture du stream CSV: ${(streamError as Error).message}`,
        },
        errorLogFilePath: currentErrorLogFile,
        status: status,
        importDate: new Date(),
      });
      console.log("[DEBUG - IMPORT_LOG] Entrée ImportLog FAILED créée en BDD.");

      res.status(500).json({
        message: "Erreur lors de la lecture du fichier CSV.",
        error: (streamError as Error).message,
        importId: importUuid,
        errorLogFile: currentErrorLogFile,
        status: status,
      });
    }
  } finally {
    restoreConsoleOutput();
  }
};
