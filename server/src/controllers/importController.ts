import fs from "node:fs";
import path from "node:path";
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

const UPLOAD_DIR = path.join(__dirname, "..", "..", "..", "CSVCache");
const BATCH_SIZE = 2000;
const ERROR_LOG_DIR = path.join(__dirname, "..", "..", "..", "logs");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(ERROR_LOG_DIR)) {
  fs.mkdirSync(ERROR_LOG_DIR, { recursive: true });
}

const processedStationsGlobalCache = new Map<string, Models.Station>();

async function logErrorToFile(
  error: TransformError,
  currentLogFilePath: string,
): Promise<void> {
  const now = new Date();
  const time = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  let affectedColumns = "";
  switch (error.type) {
    case "INVALID_GEOMETRY":
      affectedColumns =
        "coordonneesXY, consolidated_latitude, consolidated_longitude";
      break;
    case "MISSING_TERMINAL_ID":
      affectedColumns = "id_pdc_itinerance";
      break;
    case "DATABASE_BATCH_ERROR":
      affectedColumns = "N/A (Erreur BDD globale du lot)";
      break;
    default:
      if (error.rowData && Object.keys(error.rowData).length > 0) {
        const relevantKeys = [
          "nom_station",
          "id_station_itinerance",
          "id_pdc_itinerance",
          "nom_amenageur",
        ];
        const foundKeys = relevantKeys.filter((key) =>
          Object.prototype.hasOwnProperty.call(error.rowData, key),
        );
        if (foundKeys.length > 0) {
          // Correction du type 'any'
          affectedColumns = foundKeys
            .map((key) => `${key}: "${error.rowData[key as keyof CsvRow]}"`)
            .join(", ");
        } else {
          affectedColumns = "N/A (colonnes non spécifiques)";
        }
      } else {
        affectedColumns = "N/A";
      }
      break;
  }

  const logEntry =
    `${time} : ERREUR - ${error.message} - Ligne N° ${error.rowNumber}` +
    `${affectedColumns && affectedColumns !== "N/A" ? ` - Colonnes: [${affectedColumns}]` : ""}` +
    `${error.details ? ` - Détails: ${error.details instanceof Error ? error.details.message : String(error.details)}` : ""}\n`;

  try {
    await fs.promises.appendFile(currentLogFilePath, logEntry);
  } catch (err: unknown) {
    console.error(
      `ÉCHEC: Impossible d'écrire l'erreur dans le fichier de log à ${currentLogFilePath}: ${(err as Error).message}`,
    );
  }
}

async function processBatch(
  batch: {
    rowData: CsvRow;
    transformedResult: TransformResult;
    rowNumber: number;
  }[],
  errorCounts: Record<string, number>,
  currentLogFilePath: string,
) {
  let transactionInstance: Transaction | undefined;
  try {
    transactionInstance = await sequelize.transaction();

    for (const item of batch) {
      const { transformedResult } = item;

      if (transformedResult.success) {
        const { stationData, terminalData, plugAssociations } =
          transformedResult.data;

        const stationKey = `${stationData.nom_station}-${stationData.consolidated_latitude}-${stationData.consolidated_longitude}`;
        let station: Models.Station | null =
          processedStationsGlobalCache.get(stationKey) || null;

        if (!station) {
          station = await Models.Station.findOne({
            where: {
              nom_station: stationData.nom_station,
              consolidated_latitude: stationData.consolidated_latitude,
              consolidated_longitude: stationData.consolidated_longitude,
            },
            transaction: transactionInstance,
          });

          if (!station) {
            station = await Models.Station.create(
              stationData as StationAttributes,
              { transaction: transactionInstance },
            );
          }
          processedStationsGlobalCache.set(stationKey, station);
        }

        const terminalCreateData: Partial<TerminalAttributes> = {
          ...terminalData,
          idStation: station.id,
        };

        let terminal = await Models.Terminal.findOne({
          where: { id_pdc_itinerance: terminalCreateData.id_pdc_itinerance },
          transaction: transactionInstance,
        });

        if (terminal) {
          await terminal.update(terminalCreateData as TerminalAttributes, {
            transaction: transactionInstance,
          });
        } else {
          terminal = await Models.Terminal.create(
            terminalCreateData as TerminalAttributes,
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
      } else {
        const error = (
          item.transformedResult as { success: false; error: TransformError }
        ).error;
        await logErrorToFile(error, currentLogFilePath);
        errorCounts[error.type] = (errorCounts[error.type] || 0) + 1;
      }
    }
    await transactionInstance.commit();
    return { success: true, count: batch.length };
  } catch (batchError: unknown) {
    if (transactionInstance) {
      await transactionInstance.rollback();
    }
    const errorType = "DATABASE_BATCH_ERROR";
    const errorMessage = `Erreur lors du traitement d'un lot de données: ${(batchError as Error).message}`;
    await logErrorToFile(
      {
        type: errorType,
        message: errorMessage,
        rowData: batch[0]?.rowData || ({} as CsvRow),
        rowNumber: batch[0]?.rowNumber || -1,
        details: batchError,
      },
      currentLogFilePath,
    );
    errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    return { success: false, count: batch.length };
  }
}

export const importCsv = async (req: Request, res: Response): Promise<void> => {
  processedStationsGlobalCache.clear();

  const importUuid = uuidv4();
  const currentErrorLogFile = path.join(
    ERROR_LOG_DIR,
    `import_errors_${importUuid}.log`,
  );

  // Correction de l'avertissement 'Variable initializer is redundant'
  let importCompleted: boolean;
  importCompleted = false;

  if (!fs.existsSync(ERROR_LOG_DIR)) {
    fs.mkdirSync(ERROR_LOG_DIR, { recursive: true });
  }

  if (!req.file) {
    res.status(400).json({
      message: "Aucun fichier CSV fourni.",
      importId: importUuid,
      errorLogFile: currentErrorLogFile,
    });
    return;
  }

  const filePath = (req.file as CustomFile).path;
  const errorCounts: Record<string, number> = {};
  let totalProcessedLines = 0;
  let currentBatch: {
    rowData: CsvRow;
    transformedResult: TransformResult;
    rowNumber: number;
  }[] = [];

  const csvStream = fs
    .createReadStream(filePath)
    .pipe(fastCsv.parse({ headers: true }))
    .on("data", async (row: CsvRow) => {
      totalProcessedLines++;
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
        csvStream.pause();
        await processBatch(currentBatch, errorCounts, currentErrorLogFile);
        currentBatch = [];
        csvStream.resume();
      }
    })
    .on("end", async () => {
      if (currentBatch.length > 0) {
        await processBatch(currentBatch, errorCounts, currentErrorLogFile);
      }
      importCompleted = true;
      fs.unlink(filePath, (err) => {
        if (err)
          console.error(
            "Erreur lors de la suppression du fichier temporaire:",
            err,
          );
      });

      const totalErrors = Object.values(errorCounts).reduce(
        (sum, count) => sum + count,
        0,
      );
      res.status(200).json({
        message: "Importation CSV terminée.",
        importId: importUuid,
        totalLinesProcessed: totalProcessedLines,
        successfulLines: totalProcessedLines - totalErrors,
        errorSummary: errorCounts,
        errorLogFile: currentErrorLogFile,
      });
    })
    .on("error", async (streamError: unknown) => {
      console.error("Erreur de lecture du stream CSV:", streamError);
      if (!importCompleted) {
        fs.unlink(filePath, (err) => {
          if (err)
            console.error(
              "Erreur lors de la suppression du fichier temporaire:",
              err,
            );
        });
        res.status(500).json({
          message: "Erreur lors de la lecture du fichier CSV.",
          error: (streamError as Error).message,
          importId: importUuid,
          errorLogFile: currentErrorLogFile,
        });
      }
    });
};
