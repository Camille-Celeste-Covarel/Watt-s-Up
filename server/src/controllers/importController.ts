import fs from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import * as fastCsv from "fast-csv";
import type { Transaction } from "sequelize";
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

const UPLOAD_DIR = "uploads/csv/";
const BATCH_SIZE = 2000;
const ERROR_LOG_DIR = "logs";
const ERROR_LOG_FILE = path.join(ERROR_LOG_DIR, "import_errors.log");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(ERROR_LOG_DIR)) {
  fs.mkdirSync(ERROR_LOG_DIR, { recursive: true });
}

const processedStationsGlobalCache = new Map<string, Models.Station>();

async function logErrorToFile(error: TransformError): Promise<void> {
  const logEntry = `${JSON.stringify({
    timestamp: new Date().toISOString(),
    type: error.type,
    message: error.message,
    rowNumber: error.rowNumber,
    rowData: error.rowData,
    details: error.details
      ? error.details instanceof Error
        ? error.details.message
        : String(error.details)
      : undefined,
  })}\n`;
  try {
    await fs.promises.appendFile(ERROR_LOG_FILE, logEntry);
  } catch (err: unknown) {
    console.error(
      `Failed to write error to log file: ${(err as Error).message}`,
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
        await logErrorToFile(error);
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
    await logErrorToFile({
      type: errorType,
      message: errorMessage,
      rowData: batch[0]?.rowData || ({} as CsvRow),
      rowNumber: batch[0]?.rowNumber || -1,
      details: batchError,
    });
    errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    return { success: false, count: batch.length };
  }
}

export const importCsv = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: "Aucun fichier CSV fourni." });
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
  let importCompleted = false;

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
        await processBatch(currentBatch, errorCounts);
        currentBatch = [];
        csvStream.resume();
      }
    })
    .on("end", async () => {
      if (currentBatch.length > 0) {
        await processBatch(currentBatch, errorCounts);
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
        totalLinesProcessed: totalProcessedLines,
        successfulLines: totalProcessedLines - totalErrors,
        errorSummary: errorCounts,
        errorLogFile: ERROR_LOG_FILE,
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
        });
      }
    });
};
