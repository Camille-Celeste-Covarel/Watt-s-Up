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
} from "../types/models/models";

import {
  notifyCompletion,
  notifyProgress,
  notifyStart,
} from "../services/importNotifier";
import {
  isStopRequested,
  registerImport,
  unregisterImport,
} from "../services/importStateManager";
import {
  LogLevel,
  logImportErrorToFile,
  logWithProgress,
  redirectConsoleOutput,
  restoreConsoleOutput,
} from "../tools/logger";

const console = {
  log: logWithProgress,
  error: logWithProgress,
  warn: logWithProgress,
};

console.log("importController.ts chargé.", LogLevel.INFO);

const UPLOAD_DIR = path.join(__dirname, "..", "..", "CSVCache");
console.log(`DEBUG: UPLOAD_DIR calculated as: ${UPLOAD_DIR}`, LogLevel.INFO);
const FLUSH_THRESHOLD_LINES = 5000;
const ERROR_LOG_DIR = path.join(__dirname, "..", "..", "logs");
const PROGRESS_LOG_LINES_INTERVAL = 1000;

const FLUSH_STRATEGY_PERCENTAGE_TO_FLUSH = 1.0;

if (!fs.existsSync(ERROR_LOG_DIR)) {
  fs.mkdirSync(ERROR_LOG_DIR, { recursive: true });
}

const stagedStationData = new Map<string, StagedStationContent>();

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
  importId: string,
): Promise<{ successfulStations: number; errors: TransformError[] }> {
  let successfulStations = 0;
  const errors: TransformError[] = [];

  for (const stagedStation of stationsToProcess) {
    if (isStopRequested(importId)) {
      break;
    }

    const compositeId = getStationCompositeId(stagedStation.stationData);
    console.log(
      `Début de traitement pour la station: ${compositeId} (Ligne CSV: ${stagedStation.lastModifiedRow})`,
      LogLevel.DEBUG,
    );
    console.log(
      ` Station ${compositeId} a ${stagedStation.terminals.length} terminaux à traiter.`,
      LogLevel.DEBUG,
    );

    const stationTransaction = await sequelize.transaction();
    console.log(
      `Transaction démarrée pour la station: ${compositeId}`,
      LogLevel.DEBUG,
    );

    let transactionHandled = false;

    try {
      const { stationData, terminals } = stagedStation;
      let station: Models.Station | null = null;
      let createdStation = false;

      // --- Traitement de la station ---
      try {
        console.log(
          `StationData pour upsert (ligne ${stagedStation.lastModifiedRow}): ${JSON.stringify(stationData)}`,
          LogLevel.DEBUG,
        );

        let stationWhereClause: Partial<StationAttributes>;
        if (stationData.id_station_itinerance) {
          stationWhereClause = {
            id_station_itinerance: stationData.id_station_itinerance,
          };
          console.log(
            `Cherche/Crée Station par id_station_itinerance. WHERE: ${JSON.stringify(stationWhereClause)}`,
            LogLevel.DEBUG,
          );
          [station, createdStation] = await Models.Station.findOrCreate({
            where: stationWhereClause,
            defaults: stationData as StationAttributes,
            transaction: stationTransaction,
          });
        } else {
          stationWhereClause = {
            nom_station: stationData.nom_station,
            consolidated_latitude: stationData.consolidated_latitude,
            consolidated_longitude: stationData.consolidated_longitude,
            id_station_itinerance: null,
          };
          console.log(
            `Cherche/Crée Station par nom/coords. WHERE: ${JSON.stringify(stationWhereClause)}`,
            LogLevel.DEBUG,
          );
          [station, createdStation] = await Models.Station.findOrCreate({
            where: stationWhereClause,
            defaults: stationData as StationAttributes,
            transaction: stationTransaction,
          });
        }

        console.log(
          `Résultat findOrCreate Station: instance=${station ? station.id : "null"}, created=${createdStation} (Ligne CSV: ${stagedStation.lastModifiedRow})`,
          LogLevel.DEBUG,
        );

        if (!station) {
          const errorMessage = `Station object is null after findOrCreate for compositeId: ${compositeId}. This indicates a potential issue where Sequelize did not create or find the station without throwing an explicit error. Data: ${JSON.stringify(stationData)}`;
          console.error(`[ERROR CAPTURED] ${errorMessage}`, LogLevel.ERROR);
          errors.push({
            type: "DB_STATION_NULL_INSTANCE",
            message: errorMessage,
            rowData: stagedStation.originalCsvRow,
            rowNumber: stagedStation.lastModifiedRow,
            originalError: new Error(errorMessage),
          });
          await stationTransaction.rollback();
          transactionHandled = true;
          console.log(
            `Transaction ROLLBACK pour la station: ${compositeId} (instance null)`,
            LogLevel.DEBUG,
          );
          continue;
        }

        if (!createdStation) {
          console.log(
            `Mise à jour de la station existante: ${station.id} (Ligne CSV: ${
              stagedStation.lastModifiedRow
            })`,
            LogLevel.DEBUG,
          );
          await station.update(stationData as StationAttributes, {
            transaction: stationTransaction,
          });
        } else {
          console.log(
            `Station créée avec succès: ${station.id} (Ligne CSV: ${
              stagedStation.lastModifiedRow
            })`,
            LogLevel.DEBUG,
          );
        }
      } catch (stationUpsertError: unknown) {
        const errorMessage = `Échec de l'upsert/findOrCreate de la station '${compositeId}' (Ligne CSV: ${stagedStation.lastModifiedRow}): ${
          stationUpsertError instanceof Error
            ? stationUpsertError.message
            : String(stationUpsertError)
        }`;
        console.error(
          `[ERROR CAPTURED] Erreur BDD station (processConsolidatedStations): ${errorMessage}`,
          LogLevel.ERROR,
          stationUpsertError,
        );
        errors.push({
          type: "DB_STATION_UPSERT_FAILED",
          message: errorMessage,
          rowData: stagedStation.originalCsvRow,
          rowNumber: stagedStation.lastModifiedRow,
          originalError: stationUpsertError,
        });
        console.log(
          `[ERROR PUSHED] Erreur station ajoutée au tableau 'errors'. Taille: ${errors.length}`,
          LogLevel.DEBUG,
        );
        await stationTransaction.rollback();
        transactionHandled = true;
        console.log(
          `Transaction ROLLBACK pour la station: ${compositeId} (upsert échoué)`,
          LogLevel.DEBUG,
        );
        continue;
      }

      let pdcCount = 0;
      for (const terminalContent of terminals) {
        const { terminalData, plugAssociations } = terminalContent;
        console.log(
          `Traitement du terminal: ${terminalData.id_pdc_itinerance || terminalData.id_pdc_local} (Ligne CSV: ${stagedStation.lastModifiedRow})`,
          LogLevel.DEBUG,
        );
        console.log(
          `TerminalData pour upsert (ligne ${
            stagedStation.lastModifiedRow
          }): ${JSON.stringify(terminalData)}`,
          LogLevel.DEBUG,
        );

        let terminal: Models.Terminal | null = null;
        let terminalCreated = false;

        // --- Traitement du terminal ---
        if (!terminalData.id_pdc_itinerance && !terminalData.id_pdc_local) {
          const errorMessage = `Terminal manquant d'identifiant critique (id_pdc_itinerance et id_pdc_local sont vides) pour station ${compositeId}.`;
          console.error(
            `[ERROR - SKIPPED] ${errorMessage} Données: ${JSON.stringify(terminalData)} (Ligne CSV: ${stagedStation.lastModifiedRow})`,
            LogLevel.ERROR,
          );
          errors.push({
            type: "SKIPPED_TERMINAL_MISSING_ID",
            message: errorMessage,
            rowData: stagedStation.originalCsvRow,
            rowNumber: stagedStation.lastModifiedRow,
            originalError: new Error(errorMessage),
          });
          continue;
        }

        try {
          const terminalWhereClause = {
            id_pdc_itinerance: terminalData.id_pdc_itinerance,
          };
          console.log(
            `Cherche/Crée Terminal. WHERE: ${JSON.stringify(terminalWhereClause)}`,
            LogLevel.DEBUG,
          );
          [terminal, terminalCreated] = await Models.Terminal.findOrCreate({
            where: terminalWhereClause,
            defaults: {
              ...terminalData,
              id_station: station.id,
            } as TerminalAttributes,
            transaction: stationTransaction,
          });

          console.log(
            `Résultat findOrCreate Terminal: instance=${terminal ? terminal.id : "null"}, created=${terminalCreated} (Ligne CSV: ${
              stagedStation.lastModifiedRow
            })`,
            LogLevel.DEBUG,
          );

          if (!terminal) {
            const errorMessage = `Terminal object is null after findOrCreate for station ${compositeId}, terminal ID: ${terminalData.id_pdc_itinerance || terminalData.id_pdc_local}. This indicates a potential issue where Sequelize did not create or find the terminal without throwing an explicit error. Data: ${JSON.stringify(terminalData)}`;
            console.error(
              `[ERROR CAPTURED] ${errorMessage} (Ligne CSV: ${stagedStation.lastModifiedRow})`,
              LogLevel.ERROR,
            );
            errors.push({
              type: "DB_TERMINAL_NULL_INSTANCE",
              message: errorMessage,
              rowData: stagedStation.originalCsvRow,
              rowNumber: stagedStation.lastModifiedRow,
              originalError: new Error(errorMessage),
            });
            continue;
          }

          if (!terminalCreated) {
            console.log(
              `Mise à jour du terminal existant: ${terminal.id} (Ligne CSV: ${
                stagedStation.lastModifiedRow
              })`,
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
              `Terminal créé avec succès: ${terminal.id} (Ligne CSV: ${
                stagedStation.lastModifiedRow
              })`,
              LogLevel.DEBUG,
            );
          }
        } catch (terminalUpsertError: unknown) {
          const errorMessage = `Échec de l'upsert/findOrCreate du terminal '${terminalData.id_pdc_itinerance || terminalData.id_pdc_local}' pour station '${compositeId}' (Ligne CSV: ${stagedStation.lastModifiedRow}): ${
            terminalUpsertError instanceof Error
              ? terminalUpsertError.message
              : String(terminalUpsertError)
          }`;
          console.error(
            `[ERROR CAPTURED] Erreur BDD terminal (processConsolidatedStations): ${errorMessage}`,
            LogLevel.ERROR,
            terminalUpsertError,
          );
          errors.push({
            type: "DB_TERMINAL_UPSERT_FAILED",
            message: errorMessage,
            rowData: stagedStation.originalCsvRow,
            rowNumber: stagedStation.lastModifiedRow,
            originalError: terminalUpsertError,
          });
          console.log(
            `[ERROR PUSHED] Erreur terminal ajoutée au tableau 'errors'. Taille: ${errors.length}`,
            LogLevel.DEBUG,
          );
          await stationTransaction.rollback();
          transactionHandled = true;
          console.log(
            `Transaction ROLLBACK pour la station: ${compositeId} (terminal échoué)`,
            LogLevel.DEBUG,
          );
          break;
        }

        // --- Association Plug-Terminal ---
        console.log(
          `Gestion des plugs pour terminal: ${terminal.id} (Ligne CSV: ${stagedStation.lastModifiedRow})`,
          LogLevel.DEBUG,
        );
        try {
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
              `Suppression de ${plugsToDelete.length} plugs anciennes pour terminal: ${terminal.id} (Ligne CSV: ${
                stagedStation.lastModifiedRow
              })`,
              LogLevel.DEBUG,
            );
            await Models.TerminalPlug.destroy({
              where: { id: { [Op.in]: plugsToDelete.map((p) => p.id) } },
              transaction: stationTransaction,
            });
          }

          if (plugsToCreate.length > 0) {
            console.log(
              `Création de ${plugsToCreate.length} nouvelles plugs pour terminal: ${terminal.id} (Ligne CSV: ${
                stagedStation.lastModifiedRow
              })`,
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
        } catch (plugProcessError: unknown) {
          const errorMessage = `Échec de la gestion des plugs pour le terminal '${terminal.id}' de la station '${compositeId}' (Ligne CSV: ${stagedStation.lastModifiedRow}): ${
            plugProcessError instanceof Error
              ? plugProcessError.message
              : String(plugProcessError)
          }`;
          console.error(
            `[ERROR CAPTURED] Erreur BDD plug (processConsolidatedStations): ${errorMessage}`,
            LogLevel.ERROR,
            plugProcessError,
          );
          errors.push({
            type: "DB_PLUG_ASSOCIATION_FAILED",
            message: errorMessage,
            rowData: stagedStation.originalCsvRow,
            rowNumber: stagedStation.lastModifiedRow,
            originalError: plugProcessError,
          });
          console.log(
            `[ERROR PUSHED] Erreur plug ajoutée au tableau 'errors'. Taille: ${errors.length}`,
            LogLevel.DEBUG,
          );
          await stationTransaction.rollback();
          transactionHandled = true;
          console.log(
            `Transaction ROLLBACK pour la station: ${compositeId} (plug échoué)`,
            LogLevel.DEBUG,
          );
          break;
        }

        pdcCount++;
      }

      console.log(
        `Mise à jour nbre_pdc de la station ${station.id} à ${pdcCount} (avant update) (Ligne CSV: ${stagedStation.lastModifiedRow})`,
        LogLevel.DEBUG,
      );
      await station.update(
        { nbre_pdc: pdcCount },
        { transaction: stationTransaction },
      );

      await stationTransaction.commit();
      transactionHandled = true;
      console.log(
        `Transaction COMMIT pour la station: ${compositeId} (Ligne CSV: ${stagedStation.lastModifiedRow})`,
        LogLevel.DEBUG,
      );
      successfulStations++;
      console.log(
        `Traitement de la station ${compositeId} terminé avec succès. (Ligne CSV: ${stagedStation.lastModifiedRow})`,
        LogLevel.DEBUG,
      );
    } catch (generalProcessError: unknown) {
      if (!transactionHandled) {
        await stationTransaction.rollback();
        transactionHandled = true;
        console.log(
          `Transaction ROLLBACK pour la station: ${compositeId} (erreur générale inattendue) (Ligne CSV: ${stagedStation.lastModifiedRow})`,
          LogLevel.DEBUG,
        );
      }

      const errorMessage = `Une erreur inconnue s'est produite lors du traitement de la station: ${
        generalProcessError instanceof Error
          ? generalProcessError.message
          : String(generalProcessError)
      }`;
      console.error(
        `[ERROR CAPTURED] Erreur générale lors du traitement de la station ${compositeId} (processConsolidatedStations) (Ligne CSV: ${stagedStation.lastModifiedRow}): ${errorMessage}`,
        LogLevel.CRITICAL,
        generalProcessError,
      );

      if (
        !errors.some(
          (err) =>
            err.rowNumber === stagedStation.lastModifiedRow &&
            err.originalError === generalProcessError,
        )
      ) {
        errors.push({
          type: "STATION_PROCESSING_GENERAL_ERROR",
          message: errorMessage,
          rowData: stagedStation.originalCsvRow,
          rowNumber: stagedStation.lastModifiedRow,
          originalError: generalProcessError,
        });
        console.log(
          `[ERROR PUSHED] Erreur générale ajoutée au tableau 'errors'. Taille: ${errors.length}`,
          LogLevel.DEBUG,
        );
      }
    }
  }
  console.log(
    `processConsolidatedStations terminé. Total erreurs collectées: ${errors.length}`,
    LogLevel.DEBUG,
  );
  return { successfulStations, errors };
}

/**
 * Gère le traitement du fichier CSV en arrière-plan, de manière asynchrone,
 * sans bloquer la réponse HTTP.
 */
async function processCsvInBackground(
  importUuid: string,
  filePath: string,
  originalFileName: string,
  totalLinesFromMetadata: number,
) {
  const startTime = new Date();
  // Restaurer le logger personnalisé pour cette tâche de fond.
  redirectConsoleOutput();

  stagedStationData.clear();

  // Enregistrement de l'import pour permettre l'annulation
  registerImport(importUuid);
  // [GRAFANA]: Métrique - Incrémenter le compteur 'imports_started_total'
  // [GRAFANA]: Métrique - Incrémenter la jauge 'imports_in_progress'

  const currentErrorLogFile = path.join(
    ERROR_LOG_DIR,
    `import_errors_${importUuid}.log`,
  );

  let importCompleted = false;
  let totalProcessedCsvLines = 0;
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
    importCompleted = true;
  });
  errorLogStream.on("open", () => {
    console.log(
      `Stream de log d'erreur ouvert avec succès: ${currentErrorLogFile}`,
      LogLevel.INFO,
    );
  });
  errorLogStream.on("close", () => {
    console.log(
      `Stream de log d'erreur fermé: ${currentErrorLogFile}`,
      LogLevel.INFO,
    );
  });
  console.log(
    `Stream de log d'erreur créé (en attente d'ouverture): ${currentErrorLogFile}`,
    LogLevel.INFO,
  );

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  try {
    initialImportLogEntry = await Models.ImportLog.create({
      import_id: importUuid,
      file_name: originalFileName,
      total_lines_in_file: totalLinesFromMetadata,
      total_lines_processed: 0,
      successful_lines: 0,
      error_summary: { message: "Importation en cours..." },
      error_log_file_path: currentErrorLogFile,
      status: "IN_PROGRESS",
      import_date: new Date(),
    });
    console.log("Entrée ImportLog IN_PROGRESS créée en BDD.", LogLevel.DEBUG);

    // Notifie le client que le processus a démarré, en envoyant l'ID d'import
    notifyStart(importUuid);

    const csvStream = fs
      .createReadStream(filePath)
      .pipe(fastCsv.parse({ headers: true }));

    let lastProgressPercentage = -1;
    let linesProcessedSinceLastFlush = 0;
    let wasInterrupted = false;

    for await (const row of csvStream as AsyncIterable<CsvRow>) {
      if (importCompleted || isStopRequested(importUuid)) {
        wasInterrupted = true;
        console.log(
          "Arrêt de l'importation demandé. Interruption de la lecture du fichier CSV.",
          LogLevel.INFO,
        );
        // Explicitement détruire le stream pour s'assurer que la lecture du fichier s'arrête
        // et libère les ressources, empêchant le script de continuer en arrière-plan.
        if (!csvStream.destroyed) {
          csvStream.destroy();
        }
        break;
      }

      totalProcessedCsvLines++;
      // [GRAFANA]: Métrique - Incrémenter le compteur 'csv_lines_processed_total'
      linesProcessedSinceLastFlush++;
      const currentProgressPercentage = Math.floor(
        (totalProcessedCsvLines / totalLinesFromMetadata) * 100,
      );

      if (
        currentProgressPercentage > lastProgressPercentage ||
        (totalProcessedCsvLines % PROGRESS_LOG_LINES_INTERVAL === 0 &&
          totalProcessedCsvLines > 0)
      ) {
        console.log(
          `Traitement en cours : ${currentProgressPercentage}% des lignes CSV traitées.`,
          LogLevel.INFO,
        );
        notifyProgress(
          importUuid,
          currentProgressPercentage,
          `Traitement en cours : ${currentProgressPercentage}% des lignes CSV traitées.`,
          totalSuccessfulStations,
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

        // Début de la consolidation de la ligne CSV
        console.log(
          `Consolidation de la ligne CSV #${totalProcessedCsvLines} pour station ${compositeId}.`,
          LogLevel.DEBUG,
        );

        if (!stagedStationData.has(compositeId)) {
          stagedStationData.set(compositeId, {
            stationData: stationData,
            terminals: [],
            lastModifiedRow: totalProcessedCsvLines,
            originalCsvRow: row,
          });
        }
        const stationEntry = stagedStationData.get(compositeId);
        if (stationEntry) {
          stationEntry.terminals.push({ terminalData, plugAssociations });
          stationEntry.lastModifiedRow = totalProcessedCsvLines;
        }
      } else {
        totalErrorEntries++;
        // [GRAFANA]: Métrique - Incrémenter le compteur 'transformation_errors_total'
        console.log(
          `Erreur de transformation détectée pour la ligne ${totalProcessedCsvLines}. Appel de logImportErrorToFile.`,
          LogLevel.DEBUG,
        );
        logImportErrorToFile(transformedResult.error, errorLogStream);
        console.error(
          `[CONSOLE ERROR] Erreur de transformation ligne ${totalProcessedCsvLines}: Type=${transformedResult.error.type}, Message=${transformedResult.error.message}, Colonne=${transformedResult.error.columnName || "N/A"}, Valeur=${transformedResult.error.culpritValue || "N/A"}`,
          LogLevel.ERROR,
          transformedResult.error.originalError ||
            transformedResult.error.details,
        );
      }

      if (
        linesProcessedSinceLastFlush >= FLUSH_THRESHOLD_LINES ||
        stagedStationData.size > 2000
      ) {
        console.log(
          `Seuil de flush atteint. ${stagedStationData.size} stations accumulées.`,
          LogLevel.DEBUG,
        );

        if (stagedStationData.size > 0) {
          const sortedStagedStations = Array.from(
            stagedStationData.entries(),
          ).sort(([, a], [, b]) => a.lastModifiedRow - b.lastModifiedRow);

          const numberToFlush = Math.max(
            1,
            Math.floor(
              sortedStagedStations.length * FLUSH_STRATEGY_PERCENTAGE_TO_FLUSH,
            ),
          );
          const stationsToFlush: StagedStationContent[] = [];

          for (let i = 0; i < numberToFlush; i++) {
            if (sortedStagedStations[i]) {
              const [compositeId, stationContent] = sortedStagedStations[i];
              stationsToFlush.push(stationContent);
              stagedStationData.delete(compositeId);
            } else {
              console.log(
                `Tentative d'accès à un index inexistant lors du flush: ${i}. numberToFlush: ${numberToFlush}, sortedStagedStations.length: ${sortedStagedStations.length}`,
                LogLevel.WARN,
              );
              break;
            }
          }

          if (stationsToFlush.length > 0) {
            console.log(
              `Début du flush de ${stationsToFlush.length} stations. Taille du tampon avant flush: ${stagedStationData.size + stationsToFlush.length}.`,
              LogLevel.INFO,
            );
            const { successfulStations, errors: processErrors } =
              await processConsolidatedStations(stationsToFlush, importUuid);
            totalSuccessfulStations += successfulStations;
            // [GRAFANA]: Métrique - Ajouter 'successfulStations' au compteur 'stations_processed_total'
            totalErrorEntries += processErrors.length;
            console.log(
              `processConsolidatedStations a retourné ${processErrors.length} erreurs pour ce flush. Écriture dans le log d'erreur.`,
              LogLevel.INFO,
            );
            for (const err of processErrors) {
              logImportErrorToFile(err, errorLogStream);
            }
            console.log(
              `${successfulStations} stations traitées, ${processErrors.length} erreurs dans ce flush.`,
              LogLevel.INFO,
            );
            console.log(
              `Taille du tampon après flush: ${stagedStationData.size}.`,
              LogLevel.INFO,
            );
          }
        }
        linesProcessedSinceLastFlush = 0;
      }
    }

    if (!wasInterrupted) {
      console.log(
        `Fin du stream CSV. Traitement du dernier lot (${stagedStationData.size} stations restantes dans le tampon).`,
        LogLevel.INFO,
      );
    }
    if (!isStopRequested(importUuid) && stagedStationData.size > 0) {
      const stationsToFlush = Array.from(stagedStationData.values());
      stagedStationData.clear();

      console.log(
        `Début du flush final de ${stationsToFlush.length} stations.`,
        LogLevel.DEBUG,
      );
      const { successfulStations, errors: processErrors } =
        await processConsolidatedStations(stationsToFlush, importUuid);
      totalSuccessfulStations += successfulStations;
      totalErrorEntries += processErrors.length;
      console.log(
        `processConsolidatedStations a retourné ${processErrors.length} erreurs pour le flush final. Écriture dans le log d'erreur.`,
        LogLevel.DEBUG,
      );
      for (const err of processErrors) {
        logImportErrorToFile(err, errorLogStream);
      }
      console.log(
        `${successfulStations} stations traitées, ${processErrors.length} erreurs dans le flush final.`,
        LogLevel.INFO,
      );
    }

    importCompleted = true;
    await fs.promises.unlink(filePath);
    console.log("Fichier temporaire supprimé.", LogLevel.DEBUG);

    await new Promise<void>((resolve) => {
      // L'événement 'finish' garantit que toutes les données ont été écrites.
      errorLogStream.on("finish", () => {
        console.log(
          "Stream de log d'erreur 'finish' event reçu.",
          LogLevel.DEBUG,
        );
        resolve();
      });
      errorLogStream.end();
    });

    const endTime = new Date();
    const duration_ms = endTime.getTime() - startTime.getTime();
    console.log(
      "Fin du script d'importation, préparation du statut final.",
      LogLevel.DEBUG,
    );

    // La vérification de l'annulation doit avoir la priorité sur les autres statuts.
    const finalStatus: ImportLogAttributes["status"] = isStopRequested(
      importUuid,
    )
      ? "CANCELLED"
      : totalSuccessfulStations === 0
        ? "FAILED"
        : totalErrorEntries === 0
          ? "COMPLETED"
          : "PARTIAL_SUCCESS";

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
      total_lines_in_file: totalLinesFromMetadata,
      total_lines_processed: totalProcessedCsvLines,
      successful_lines: totalSuccessfulStations,
      error_summary: finalErrorSummary,
      error_log_file_path: currentErrorLogFile,
      status: finalStatus,
      import_date: new Date(),
      duration_ms: duration_ms,
    };

    // [GRFANA]: Métrique - Décrémenter la jauge 'imports_in_progress'
    // [GRFANA]: Métrique - Incrémenter le compteur 'imports_completed_total{status="..."}' avec le statut final

    let finalDataForNotification: ImportLogAttributes;

    if (initialImportLogEntry) {
      // On s'assure que l'entrée existe avant de l'updater
      const entry = await Models.ImportLog.findByPk(initialImportLogEntry.id);
      // On met à jour la BDD et on récupère la version la plus fraîche pour la notification
      if (entry) {
        const updatedEntry = await entry.update(importSummary);
        finalDataForNotification = updatedEntry.get();
        console.log("Entrée ImportLog mise à jour en BDD.", LogLevel.DEBUG);
      } else {
        const newEntry = await Models.ImportLog.create(importSummary);
        finalDataForNotification = newEntry.get();
      }
    } else {
      const newEntry = await Models.ImportLog.create(importSummary);
      finalDataForNotification = newEntry.get();
    }

    console.log(
      `Envoi de la notification de complétion. Statut: ${finalDataForNotification.status}`,
      LogLevel.INFO,
    );
    // On notifie le client via WebSocket
    notifyCompletion(finalDataForNotification);
    console.log(
      "Notification de complétion envoyée avec succès.",
      LogLevel.INFO,
    );
  } catch (generalError: unknown) {
    console.error(
      "[CONSOLE ERROR] Erreur de lecture du stream CSV ou de traitement (catch principal):",
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
      await new Promise<void>((resolve) => {
        errorLogStream.on("finish", () => {
          console.log(
            "Stream de log d'erreur 'finish' event reçu (catch block).",
            LogLevel.DEBUG,
          );
          resolve();
        });
        errorLogStream.end();
      });

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
      // [GRAFANA]: Métrique - Décrémenter la jauge 'imports_in_progress'
      // [GRAFANA]: Métrique - Incrémenter le compteur 'imports_completed_total{status="FAILED"}'
      const status: ImportLogAttributes["status"] = "FAILED";
      const importSummary: ImportLogCreationAttributes = {
        import_id: importUuid,
        file_name: originalFileName || "N/A (Stream Error)",
        total_lines_in_file: totalLinesFromMetadata,
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

      let finalDataForNotification: ImportLogAttributes;

      try {
        if (initialImportLogEntry) {
          const updatedEntry =
            await initialImportLogEntry.update(importSummary);
          finalDataForNotification = updatedEntry.get();
          console.log(
            "Entrée ImportLog FAILED mise à jour en BDD.",
            LogLevel.DEBUG,
          );
        } else {
          const newEntry = await Models.ImportLog.create(importSummary);
          finalDataForNotification = newEntry.get();
        }
        console.log(
          "Envoi de la notification de complétion (catch block).",
          LogLevel.INFO,
        );
        notifyCompletion(finalDataForNotification);
        console.log(
          "Notification de complétion envoyée (catch block).",
          LogLevel.INFO,
        );
      } catch (logError) {
        console.error(
          "Erreur lors de la mise à jour/création de l'entrée de log d'échec ou de l'envoi de notification :",
          LogLevel.CRITICAL,
          logError,
        );
      }
    }
  } finally {
    unregisterImport(importUuid);
    restoreConsoleOutput();
  }
}

export const importCsv = async (req: Request, res: Response): Promise<void> => {
  console.log("Requête HTTP pour importCsv reçue.", LogLevel.INFO);

  if (!req.file) {
    res.status(400).json({ message: "Aucun fichier CSV fourni." });
    return;
  }

  const importUuid = uuidv4();
  const filePath = (req.file as CustomFile).path;
  const originalFileName = (req.file as CustomFile).originalname;
  const totalLinesFromMetadata = 140000;

  // On répond IMMÉDIATEMENT au client pour ne pas le faire attendre.
  res.status(202).json({
    message:
      "La demande d'importation a été acceptée et est en cours de traitement.",
    importId: importUuid,
  });

  console.log(
    `Réponse 202 envoyée pour l'import ${importUuid}. Lancement du traitement en arrière-plan.`,
    LogLevel.INFO,
  );

  // On lance le traitement en arrière-plan SANS l'attendre.
  processCsvInBackground(
    importUuid,
    filePath,
    originalFileName,
    totalLinesFromMetadata,
  ).catch((err) => {
    // On s'assure de capturer toute erreur non gérée dans la tâche de fond pour éviter un crash serveur.
    console.error(
      `Erreur non gérée dans le traitement de fond pour l'import ${importUuid}:`,
      LogLevel.CRITICAL,
      err,
    );
  });
};

/**
 * Récupère les 5 dernières entrées de l'historique d'importation.
 */
export const getImportHistory = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const history = await Models.ImportLog.findAll({
      limit: 5,
      order: [["import_date", "DESC"]],
      attributes: [
        "import_id",
        "status",
        "import_date",
        "successful_lines",
        "total_lines_processed",
        "duration_ms",
      ],
    });
    res.status(200).json(history);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'historique des imports:",
      LogLevel.ERROR,
      error,
    );
    res.status(500).json({
      message: "Erreur serveur lors de la récupération de l'historique.",
    });
  }
};
