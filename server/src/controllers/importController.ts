import fs from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import * as fastCsv from "fast-csv";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import sequelize from "../config/database";
import { transformCsvRowToEntities } from "../data-processing/dataTransformer";
import * as Models from "../models/_index";
import type { CsvRow } from "../types/dataProcessing/dataProcessing";
import type {
  CustomFile,
  StagedStationContent,
  TransformError,
} from "../types/dataProcessing/importProcessingTypes";
import type {
  ImportLogAttributes,
  ImportLogCreationAttributes,
  StationAttributes,
  TerminalAttributes,
  TerminalPlugAttributes,
} from "../types/models/models";

import {
  LogLevel,
  initializeConsoleLogStream,
  logImportErrorToFile,
  redirectConsoleOutput,
  restoreConsoleOutput,
} from "../tools/logger";
import { sendImportNotification } from "../tools/notificationService";

initializeConsoleLogStream();
redirectConsoleOutput();

console.log("importController.ts chargé.", LogLevel.DEBUG);

const UPLOAD_DIR = path.join(__dirname, "..", "..", "CSVCache");
console.log("DEBUG: UPLOAD_DIR calculated as:", UPLOAD_DIR, LogLevel.DEBUG);
const FLUSH_THRESHOLD_LINES = 5000;
const ERROR_LOG_DIR = path.join(__dirname, "..", "..", "logs");
const PROGRESS_LOG_LINES_INTERVAL = 1000;

// NOUVEAU: Constante pour contrôler la stratégie de vidage du tampon
// Définit le pourcentage des stations accumulées à "flusher" (traiter et retirer du tampon)
// 1.0 (100%) -> Vidange complète du tampon (préférable pour la RAM)
// 0.8 (80%)  -> Garde 20% des stations les plus récentes en mémoire
const FLUSH_STRATEGY_PERCENTAGE_TO_FLUSH = 1.0; // Par défaut, vider tout pour une meilleure gestion RAM

if (!fs.existsSync(ERROR_LOG_DIR)) {
  fs.mkdirSync(ERROR_LOG_DIR, { recursive: true });
}

const stagedStationData = new Map<string, StagedStationContent>();
const processedStationsGlobalCache = new Map<string, Models.Station>();

/**
 * Génère une couleur ANSI 24 bits (True Color) interpolée entre le rouge et le vert.
 * @param percentage Le pourcentage de progression (0 à 100).
 * @returns {string} Le code d'échappement ANSI pour la couleur.
 */
function getProgressBarColor(percentage: number): string {
  const red = Math.round(255 * (1 - percentage / 100));
  const green = Math.round(255 * (percentage / 100));
  return `\x1b[38;2;${red};${green};0m`;
}

const ANSI_RESET_COLOR = "\x1b[0m";

function getStationCompositeId(
  stationData: Partial<StationAttributes>,
): string {
  if (
    stationData.id_station_itinerance &&
    stationData.id_station_itinerance.trim() !== ""
  ) {
    return `ITINERANCE_${stationData.id_station_itinerance.trim().toLowerCase()}`;
  }
  const name = (stationData.nom_station || "UNKNOWN_NAME").trim().toLowerCase();
  const lat = stationData.consolidated_latitude?.toFixed(6) || "NO_LAT";
  const lon = stationData.consolidated_longitude?.toFixed(6) || "NO_LON";
  return `COMPOSITE_${name}_${lat}_${lon}`;
}

async function processConsolidatedStations(
  stationsToProcess: StagedStationContent[],
): Promise<{ successfulStations: number; errors: TransformError[] }> {
  let successfulStations = 0;
  const errors: TransformError[] = [];

  for (const stagedStation of stationsToProcess) {
    const compositeId = getStationCompositeId(stagedStation.stationData);
    console.log(
      `Début de traitement pour la station: ${compositeId}`,
      LogLevel.DEBUG,
    );

    const stationTransaction = await sequelize.transaction();
    console.log(
      `Transaction démarrée pour la station: ${compositeId}`,
      LogLevel.DEBUG,
    );

    try {
      const { stationData, terminals } = stagedStation;

      let station: Models.Station | null = null;
      let createdStation = false;

      if (stationData.id_station_itinerance) {
        console.log(
          `Cherche/Crée Station par id_station_itinerance: ${stationData.id_station_itinerance}`,
          LogLevel.DEBUG,
        );
        [station, createdStation] = await Models.Station.findOrCreate({
          where: { id_station_itinerance: stationData.id_station_itinerance },
          defaults: stationData as StationAttributes,
          transaction: stationTransaction,
        });
      } else {
        console.log(
          `Cherche/Crée Station par nom/coords: ${stationData.nom_station}, ${stationData.consolidated_latitude}, ${stationData.consolidated_longitude}`,
          LogLevel.DEBUG,
        );
        [station, createdStation] = await Models.Station.findOrCreate({
          where: {
            nom_station: stationData.nom_station,
            consolidated_latitude: stationData.consolidated_latitude,
            consolidated_longitude: stationData.consolidated_longitude,
            id_station_itinerance: null,
          },
          defaults: stationData as StationAttributes,
          transaction: stationTransaction,
        });
      }

      if (!station) {
        console.error(
          `La station n'a pas pu être trouvée ou créée pour l'ID composite: ${compositeId}.`,
          LogLevel.ERROR,
          "Station object is null after findOrCreate.",
        );
        errors.push({
          type: "DB_STATION_UPSERT_FAILED",
          message: `La station n'a pas pu être trouvée ou créée pour l'ID composite: ${compositeId}.`,
          rowData: stagedStation.stationData as CsvRow,
          rowNumber: stagedStation.lastModifiedRow,
          details: "Station object is null after findOrCreate.",
        });
        await stationTransaction.rollback();
        console.log(
          `Transaction ROLLBACK pour la station: ${compositeId} (création/trouvée échouée)`,
          LogLevel.DEBUG,
        );
        continue;
      }

      if (!createdStation) {
        console.log(
          `Mise à jour de la station existante: ${station.id}`,
          LogLevel.DEBUG,
        );
        await station.update(stationData as StationAttributes, {
          transaction: stationTransaction,
        });
      } else {
        console.log(`Station créée avec succès: ${station.id}`, LogLevel.DEBUG);
      }

      let pdcCount = 0;
      for (const terminalContent of terminals) {
        const { terminalData, plugAssociations } = terminalContent;
        console.log(
          `Traitement du terminal: ${terminalData.id_pdc_itinerance}`,
          LogLevel.DEBUG,
        );

        const [terminal, terminalCreated] = await Models.Terminal.findOrCreate({
          where: { id_pdc_itinerance: terminalData.id_pdc_itinerance },
          defaults: {
            ...terminalData,
            id_station: station.id,
          } as TerminalAttributes,
          transaction: stationTransaction,
        });

        if (!terminal) {
          console.error(
            `Le terminal n'a pas pu être trouvé ou créé: ${terminalData.id_pdc_itinerance}`,
            LogLevel.ERROR,
            "Terminal object is null after findOrCreate.",
          );
          errors.push({
            type: "DB_TERMINAL_UPSERT_FAILED",
            message: `Le terminal ${terminalData.id_pdc_itinerance} n'a pas pu être trouvé ou créé.`,
            rowData: stagedStation.stationData as CsvRow,
            rowNumber: stagedStation.lastModifiedRow,
            details: "Terminal object is null after findOrCreate.",
          });
          continue;
        }

        if (!terminalCreated) {
          console.log(
            `Mise à jour du terminal existant: ${terminal.id}`,
            LogLevel.DEBUG,
          );
          await terminal.update(
            { ...terminalData, id_station: station.id } as TerminalAttributes,
            {
              transaction: stationTransaction,
            },
          );
        } else {
          console.log(
            `Terminal créé avec succès: ${terminal.id}`,
            LogLevel.DEBUG,
          );
        }

        console.log(
          `Gestion des plugs pour terminal: ${terminal.id}`,
          LogLevel.DEBUG,
        );
        const existingPlugs = await Models.TerminalPlug.findAll({
          where: { idTerminal: terminal.id },
          transaction: stationTransaction,
        });

        const existingPlugIds = new Set(existingPlugs.map((p) => p.idPlug));
        const newPlugIds = new Set(plugAssociations.map((pa) => pa.id_plug));

        const plugsToCreate = plugAssociations.filter(
          (pa) => !existingPlugIds.has(pa.id_plug),
        );
        const plugsToDelete = existingPlugs.filter(
          (p) => !newPlugIds.has(p.idPlug),
        );

        if (plugsToDelete.length > 0) {
          console.log(
            `Suppression de ${plugsToDelete.length} plugs anciennes pour terminal: ${terminal.id}`,
            LogLevel.DEBUG,
          );
          await Models.TerminalPlug.destroy({
            where: { id: { [Op.in]: plugsToDelete.map((p) => p.id) } },
            transaction: stationTransaction,
          });
        }

        if (plugsToCreate.length > 0) {
          console.log(
            `Création de ${plugsToCreate.length} nouvelles plugs pour terminal: ${terminal.id}`,
            LogLevel.DEBUG,
          );
          await Models.TerminalPlug.bulkCreate(
            plugsToCreate.map((pa) => ({
              idTerminal: terminal.id,
              idPlug: pa.id_plug,
            })),
            { transaction: stationTransaction },
          );
        }

        pdcCount++;
      }

      console.log(
        `Mise à jour nbre_pdc de la station ${station.id} à ${pdcCount}`,
        LogLevel.DEBUG,
      );
      await station.update(
        { nbre_pdc: pdcCount },
        { transaction: stationTransaction },
      );

      await stationTransaction.commit();
      console.log(
        `Transaction COMMIT pour la station: ${compositeId}`,
        LogLevel.DEBUG,
      );
      successfulStations++;
      console.log(
        `Traitement de la station ${compositeId} terminé avec succès.`,
        LogLevel.DEBUG,
      );
    } catch (stationProcessError: unknown) {
      await stationTransaction.rollback();
      console.log(
        `Transaction ROLLBACK pour la station: ${compositeId}`,
        LogLevel.DEBUG,
      );
      console.error(
        `Erreur lors du traitement de la station ${compositeId}:`,
        LogLevel.ERROR,
        stationProcessError,
      );

      let errorMessage = "An unknown error occurred during station processing.";
      if (stationProcessError instanceof Error) {
        errorMessage = stationProcessError.message;
      } else if (
        typeof stationProcessError === "object" &&
        stationProcessError !== null &&
        "message" in stationProcessError
      ) {
        errorMessage = (stationProcessError as { message: string }).message;
      }

      errors.push({
        type: "STATION_PROCESSING_ERROR",
        message: `Échec du traitement de la station: ${errorMessage}`,
        rowData: stagedStation.stationData as CsvRow,
        rowNumber: stagedStation.lastModifiedRow,
        details: stationProcessError,
      });
    }
  }
  return { successfulStations, errors };
}

export const importCsv = async (req: Request, res: Response): Promise<void> => {
  console.log("Fonction importCsv appelée.", LogLevel.DEBUG);

  const startTime = new Date();

  stagedStationData.clear();
  processedStationsGlobalCache.clear();

  const importUuid = uuidv4();
  const currentErrorLogFile = path.join(
    ERROR_LOG_DIR,
    `import_errors_${importUuid}.log`,
  );

  let importCompleted = false;
  let totalProcessedCsvLines = 0;
  const totalLinesFromMetadata = 135913;
  let totalSuccessfulStations = 0;
  let totalErrorEntries = 0;

  if (!fs.existsSync(ERROR_LOG_DIR)) {
    fs.mkdirSync(ERROR_LOG_DIR, { recursive: true });
  }

  let initialImportLogEntry: Models.ImportLog | null = null;

  const errorLogStream = fs.createWriteStream(currentErrorLogFile, {
    flags: "a",
  });
  errorLogStream.on("error", (err) => {
    console.error(
      `ERREUR CRITIQUE du stream de log d'erreur: Impossible d'écrire dans ${currentErrorLogFile}: ${err.message}`,
      LogLevel.CRITICAL,
    );
  });

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  if (!req.file) {
    console.log("Aucun fichier CSV fourni, renvoi erreur 400.", LogLevel.DEBUG);
    errorLogStream.end();
    const duration_ms = new Date().getTime() - startTime.getTime();
    res.status(400).json({
      message: "Aucun fichier CSV fourni.",
      importId: importUuid,
      errorLogFile: currentErrorLogFile,
      status: "FAILED",
      duration_ms: duration_ms,
    });
    return;
  }

  const filePath = (req.file as CustomFile).path;
  const originalFileName = (req.file as CustomFile).originalname;

  try {
    initialImportLogEntry = await Models.ImportLog.create({
      import_id: importUuid,
      file_name: originalFileName,
      total_lines_processed: 0,
      successful_lines: 0,
      error_summary: { message: "Importation en cours..." },
      error_log_file_path: currentErrorLogFile,
      status: "IN_PROGRESS",
      import_date: new Date(),
    });
    console.log("Entrée ImportLog IN_PROGRESS créée en BDD.", LogLevel.DEBUG);

    const csvStream = fs
      .createReadStream(filePath)
      .pipe(fastCsv.parse({ headers: true }));

    let lastProgressPercentage = -1;
    let linesProcessedSinceLastFlush = 0;

    for await (const row of csvStream as AsyncIterable<CsvRow>) {
      if (importCompleted) {
        console.log(
          "Arrêt du traitement en raison d'une erreur de stream précédente.",
          LogLevel.DEBUG,
        );
        break;
      }

      totalProcessedCsvLines++;
      linesProcessedSinceLastFlush++;

      const currentProgressPercentage = Math.floor(
        (totalProcessedCsvLines / totalLinesFromMetadata) * 100,
      );

      if (
        currentProgressPercentage > lastProgressPercentage ||
        (totalProcessedCsvLines % PROGRESS_LOG_LINES_INTERVAL === 0 &&
          totalProcessedCsvLines > 0)
      ) {
        const color = getProgressBarColor(currentProgressPercentage);
        console.log(
          `${color}Traitement en cours : ${currentProgressPercentage}% des lignes CSV traitées.${ANSI_RESET_COLOR}`,
          LogLevel.INFO,
        );
        lastProgressPercentage = currentProgressPercentage;
      }

      const transformedResult = await transformCsvRowToEntities(
        row,
        totalProcessedCsvLines,
      );

      if (transformedResult.success) {
        const { stationData, terminalData, plugAssociations } =
          transformedResult.data;
        const compositeId = getStationCompositeId(stationData);

        if (!stagedStationData.has(compositeId)) {
          stagedStationData.set(compositeId, {
            stationData: stationData,
            terminals: [],
            lastModifiedRow: totalProcessedCsvLines,
            originalCsvRow: row, // Ajout du champ manquant pour satisfaire StagedStationContent
          });
        }
        const stationEntry = stagedStationData.get(compositeId);
        if (stationEntry) {
          stationEntry.terminals.push({ terminalData, plugAssociations });
          stationEntry.lastModifiedRow = totalProcessedCsvLines;
        }
      } else {
        totalErrorEntries++;
        logImportErrorToFile(transformedResult.error, errorLogStream);
      }

      // MODIFICATION ICI: Vidange du tampon selon FLUSH_STRATEGY_PERCENTAGE_TO_FLUSH
      if (
        linesProcessedSinceLastFlush >= FLUSH_THRESHOLD_LINES ||
        stagedStationData.size > 2000
      ) {
        console.log(
          `Seuil de flush atteint. ${stagedStationData.size} stations accumulées.`,
          LogLevel.DEBUG,
        );

        const sortedStagedStations = Array.from(
          stagedStationData.entries(),
        ).sort(([, a], [, b]) => a.lastModifiedRow - b.lastModifiedRow);

        // Calculer le nombre de stations à vider en fonction du pourcentage
        const numberToFlush = Math.max(
          1,
          Math.floor(
            sortedStagedStations.length * FLUSH_STRATEGY_PERCENTAGE_TO_FLUSH,
          ),
        );
        const stationsToFlush: StagedStationContent[] = [];

        // Ajouter les stations à vider et les retirer du tampon
        for (let i = 0; i < numberToFlush; i++) {
          const [compositeId, stationContent] = sortedStagedStations[i];
          stationsToFlush.push(stationContent);
          stagedStationData.delete(compositeId); // Supprimer de la map
        }

        if (stationsToFlush.length > 0) {
          console.log(
            `Traitement de ${stationsToFlush.length} stations les plus anciennes.`,
            LogLevel.DEBUG,
          );
          const { successfulStations, errors: processErrors } =
            await processConsolidatedStations(stationsToFlush);
          totalSuccessfulStations += successfulStations;
          totalErrorEntries += processErrors.length;
          for (const err of processErrors) {
            logImportErrorToFile(err, errorLogStream);
          }
          console.log(
            `${successfulStations} stations traitées, ${processErrors.length} erreurs dans ce flush.`,
            LogLevel.DEBUG,
          );
        }
        linesProcessedSinceLastFlush = 0;
      }
    }

    console.log(
      `Fin du stream CSV. Traitement du dernier lot (${stagedStationData.size} stations restantes dans le tampon).`,
      LogLevel.DEBUG,
    );
    if (stagedStationData.size > 0) {
      const stationsToFlush = Array.from(stagedStationData.values());
      stagedStationData.clear();

      const { successfulStations, errors: processErrors } =
        await processConsolidatedStations(stationsToFlush);
      totalSuccessfulStations += successfulStations;
      totalErrorEntries += processErrors.length;
      for (const err of processErrors) {
        logImportErrorToFile(err, errorLogStream);
      }
      console.log(
        `${successfulStations} stations traitées, ${processErrors.length} erreurs dans le flush final.`,
        LogLevel.DEBUG,
      );
    }

    importCompleted = true;
    await fs.promises.unlink(filePath);
    console.log("Fichier temporaire supprimé.", LogLevel.DEBUG);

    errorLogStream.end();
    console.log(
      "Commande de fermeture du stream de log d'erreur envoyée.",
      LogLevel.DEBUG,
    );

    const endTime = new Date();
    const duration_ms = endTime.getTime() - startTime.getTime();

    const finalStatus: ImportLogAttributes["status"] =
      totalErrorEntries === 0 && totalSuccessfulStations > 0
        ? "COMPLETED"
        : totalSuccessfulStations > 0
          ? "PARTIAL_SUCCESS"
          : "FAILED";

    const finalErrorSummary =
      totalErrorEntries > 0
        ? {
            message: `${totalErrorEntries} erreurs rencontrées.`,
            details: `Importation de ${totalSuccessfulStations} stations réussie sur un total de ${totalProcessedCsvLines} lignes CSV.`,
          }
        : null;

    const importSummary: ImportLogCreationAttributes = {
      import_id: importUuid,
      file_name: originalFileName,
      total_lines_processed: totalProcessedCsvLines,
      successful_lines: totalSuccessfulStations,
      error_summary: finalErrorSummary,
      error_log_file_path: currentErrorLogFile,
      status: finalStatus,
      import_date: new Date(),
      duration_ms: duration_ms,
    };

    if (initialImportLogEntry) {
      await initialImportLogEntry.update(importSummary);
      console.log("Entrée ImportLog mise à jour en BDD.", LogLevel.DEBUG);
    } else {
      await Models.ImportLog.create(importSummary);
      console.log(
        "Entrée ImportLog finale créée en BDD suite à une initialisation manquée.",
        LogLevel.DEBUG,
      );
    }

    await sendImportNotification(
      initialImportLogEntry ||
        ({
          import_id: importUuid,
          file_name: originalFileName,
          total_lines_processed: totalProcessedCsvLines,
          successful_lines: totalSuccessfulStations,
          error_summary: finalErrorSummary,
          error_log_file_path: currentErrorLogFile,
          status: finalStatus,
          import_date: new Date(),
          duration_ms: duration_ms,
        } as ImportLogAttributes),
    );

    res.status(200).json({
      message: "Importation CSV terminée.",
      importId: importUuid,
      totalLinesProcessed: totalProcessedCsvLines,
      successfulStations: totalSuccessfulStations,
      errorCount: totalErrorEntries,
      errorSummary: finalErrorSummary,
      errorLogFile: currentErrorLogFile,
      status: finalStatus,
      duration_ms: duration_ms,
    });
  } catch (generalError: unknown) {
    console.error(
      "Erreur de lecture du stream CSV ou de traitement (catch principal):",
      LogLevel.ERROR,
      generalError,
    );
    if (!importCompleted) {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log(
          "Fichier temporaire supprimé après erreur.",
          LogLevel.DEBUG,
        );
      }
      errorLogStream.end();

      console.error(
        "Commande de fermeture du stream global de console envoyée suite à une erreur.",
        LogLevel.ERROR,
      );

      let errorMessage = "An unknown error occurred during import.";
      if (generalError instanceof Error) {
        errorMessage = generalError.message;
      } else if (
        typeof generalError === "object" &&
        generalError !== null &&
        "message" in generalError
      ) {
        errorMessage = (generalError as { message: string }).message;
      }

      const duration_ms = new Date().getTime() - startTime.getTime();
      const status: ImportLogAttributes["status"] = "FAILED";
      const importSummary: ImportLogCreationAttributes = {
        import_id: importUuid,
        file_name: originalFileName || "N/A (Stream Error)",
        total_lines_processed: totalProcessedCsvLines,
        successful_lines: 0,
        error_summary: {
          message: `Erreur lors de la lecture du stream CSV: ${errorMessage}`,
        },
        error_log_file_path: currentErrorLogFile,
        status: status,
        import_date: new Date(),
        duration_ms: duration_ms,
      };

      try {
        if (initialImportLogEntry) {
          await initialImportLogEntry.update(importSummary);
          console.log(
            "Entrée ImportLog FAILED mise à jour en BDD.",
            LogLevel.DEBUG,
          );
        } else {
          await Models.ImportLog.create(importSummary);
          console.log(
            "Entrée ImportLog FAILED créée en BDD (nouvelle entrée).",
            LogLevel.DEBUG,
          );
        }
        await sendImportNotification(
          initialImportLogEntry || (importSummary as ImportLogAttributes),
        );
      } catch (logError) {
        console.error(
          "Erreur lors de la mise à jour/création de l'entrée de log d'échec ou de l'envoi de notification :",
          LogLevel.CRITICAL,
          logError,
        );
      }

      res.status(500).json({
        message: "Erreur lors de la lecture du fichier CSV.",
        error: errorMessage,
        importId: importUuid,
        errorLogFile: currentErrorLogFile,
        status: status,
        duration_ms: duration_ms,
      });
    }
  } finally {
    restoreConsoleOutput();
  }
};
