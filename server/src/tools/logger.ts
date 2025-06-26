import fs from "node:fs";
import path from "node:path";
import type { Writable } from "node:stream";
import { DatabaseError } from "sequelize";
import type { TransformError } from "../types/dataProcessing/importProcessingTypes";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

const LOG_LEVEL_NAMES: { [key: string]: LogLevel } = {
  DEBUG: LogLevel.DEBUG,
  INFO: LogLevel.INFO,
  WARN: LogLevel.WARN,
  ERROR: LogLevel.ERROR,
  CRITICAL: LogLevel.CRITICAL,
};

const LOG_LEVEL_VALUES: Set<number> = new Set(
  Object.values(LogLevel).filter((v) => typeof v === "number") as number[],
);

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

let logStream: Writable | null = null;
let minLogLevel: LogLevel = LogLevel.INFO;

const LOG_DIR = process.env.LOG_DIR || "./logs";
const MAX_LOG_AGE_DAYS = 7;

/**
 * Initialise un stream de log pour la console globale.
 * Redirige les sorties de console.log et console.error vers ce stream
 * et une sortie fichier.
 */
export function initializeConsoleLogStream() {
  const logFilePath = path.join(LOG_DIR, "console.log");

  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    // Log via originalConsoleLog car la redirection n'est peut-être pas encore en place
    originalConsoleLog(`Répertoire de logs créé: ${LOG_DIR}`, LogLevel.DEBUG);
  }

  if (logStream) {
    originalConsoleLog(
      "Fermeture du stream de log existant avant de le réinitialiser.",
      LogLevel.DEBUG,
    );
    logStream.end();
  }

  logStream = fs.createWriteStream(logFilePath, { flags: "a" });

  logStream.on("error", (err) => {
    originalConsoleError(
      `ERREUR CRITIQUE du stream de log vers le fichier (${logFilePath}) : ${err.message}. Le log fichier est désactivé.`,
      LogLevel.CRITICAL,
      err,
    );
    logStream = null;
  });
  originalConsoleLog(
    `Stream de log de la console initialisé vers ${logFilePath}`,
    LogLevel.DEBUG,
  );
}

/**
 * Redirige les méthodes console.log et console.error
 * pour inclure des timestamps et des niveaux de log,
 * et écrire dans un fichier si un stream est configuré.
 */
export function redirectConsoleOutput() {
  const configuredLevel = process.env.LOG_LEVEL?.toUpperCase();
  minLogLevel =
    configuredLevel && LOG_LEVEL_NAMES[configuredLevel] !== undefined
      ? LOG_LEVEL_NAMES[configuredLevel]
      : LogLevel.INFO;

  console.log = (message?: unknown, ...optionalParams: unknown[]) => {
    let level: LogLevel = LogLevel.INFO;
    let filteredParams: unknown[] = optionalParams;

    if (optionalParams.length > 0) {
      const firstParam = optionalParams[0];
      if (typeof firstParam === "number" && LOG_LEVEL_VALUES.has(firstParam)) {
        level = firstParam;
        filteredParams = optionalParams.slice(1);
      } else if (
        typeof firstParam === "string" &&
        LOG_LEVEL_NAMES[firstParam.toUpperCase()] !== undefined
      ) {
        level = LOG_LEVEL_NAMES[firstParam.toUpperCase()];
        filteredParams = optionalParams.slice(1);
      }
    }

    if (level >= minLogLevel) {
      const time = new Date().toLocaleTimeString("fr-FR");
      const logMessage = `${time} : ${LogLevel[level]} - ${message} ${filteredParams.map((p) => String(p)).join(" ")}`;
      originalConsoleLog(logMessage);

      if (logStream) {
        logStream.write(`${logMessage}\n`);
      }
    }
  };

  console.error = (message?: unknown, ...optionalParams: unknown[]) => {
    let level: LogLevel = LogLevel.ERROR;
    let filteredParams: unknown[] = optionalParams;

    if (optionalParams.length > 0) {
      const firstParam = optionalParams[0];
      if (typeof firstParam === "number" && LOG_LEVEL_VALUES.has(firstParam)) {
        level = firstParam;
        filteredParams = optionalParams.slice(1);
      } else if (
        typeof firstParam === "string" &&
        LOG_LEVEL_NAMES[firstParam.toUpperCase()] !== undefined
      ) {
        level = LOG_LEVEL_NAMES[firstParam.toUpperCase()];
        filteredParams = optionalParams.slice(1);
      }
    }

    if (level >= minLogLevel) {
      const time = new Date().toLocaleTimeString("fr-FR");
      const logMessage = `${time} : ${LogLevel[level]} - ${message} ${filteredParams.map((p) => String(p)).join(" ")}`;
      originalConsoleError(logMessage); // Toujours logguer sur la console originale

      if (logStream) {
        // N'écrit sur le stream fichier que s'il est actif
        logStream.write(`${logMessage}\n`);
      }
    }
  };
}

/**
 * Restaure les méthodes console.log et console.error à leurs implémentations originales.
 * Ferme également le stream de log si configuré.
 */
export function restoreConsoleOutput() {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  if (logStream) {
    logStream.end();
    logStream = null;
  }
  originalConsoleLog(
    "Console output restored and log stream closed.",
    LogLevel.DEBUG,
  );
}

/**
 * Log une erreur d'importation dans un fichier d'erreur spécifique.
 * @param error L'objet d'erreur de transformation.
 * @param errorLogStream Le stream d'écriture du fichier de log d'erreur.
 */
export function logImportErrorToFile(
  error: TransformError,
  errorLogStream: Writable,
) {
  const time = new Date().toLocaleTimeString("fr-FR");
  let detailsString = "";
  let affectedColumns = "";

  if (
    error.type === "TRANSFORMATION_ERROR" &&
    error.originalError instanceof Error
  ) {
    detailsString = `Erreur interne: ${error.originalError.message}`;
  } else if (error.originalError instanceof DatabaseError) {
    detailsString = `Erreur BDD: ${error.originalError.message}`;
    const dbError = error.originalError as DatabaseError & { column?: string };
    if (dbError.column) {
      affectedColumns = dbError.column;
    }
  }

  if (
    error.originalError instanceof Error &&
    error.originalError.message.includes("value too long") &&
    error.columnName
  ) {
    detailsString = `Valeur trop longue pour la colonne "${error.columnName}".`;
  } else if (
    error.originalError &&
    typeof error.originalError === "object" &&
    "message" in error.originalError
  ) {
    if (
      (error.originalError as { message: string }).message.includes(
        "value too long",
      ) &&
      error.columnName
    ) {
      detailsString = `Valeur trop longue pour la colonne "${error.columnName}".`;
    }
  }

  const logEntry =
    `${time} | Ligne ${error.rowNumber} | Type: ${error.type} | Message: ${error.message}` +
    `${affectedColumns ? ` | Colonne(s) affectée(s): ${affectedColumns}` : ""}` +
    `${error.columnName ? ` | Colonne CSV: ${error.columnName}` : ""}` +
    `${error.culpritValue ? ` | Valeur: "${error.culpritValue}"` : ""}` +
    `${detailsString ? ` | Détails: ${detailsString}` : ""}\n`;

  errorLogStream.write(logEntry);
}

/**
 * Supprime les fichiers de log plus anciens que MAX_LOG_AGE_DAYS.
 */
export function cleanOldLogs() {
  originalConsoleLog(
    `Début du nettoyage des logs anciens dans ${LOG_DIR}.`,
    LogLevel.DEBUG,
  );
  const now = new Date();
  const cutoffTime = now.setDate(now.getDate() - MAX_LOG_AGE_DAYS);

  fs.readdir(LOG_DIR, (err, files) => {
    if (err) {
      originalConsoleError(
        `Impossible de lire le répertoire de logs: ${err.message}`,
        LogLevel.ERROR,
      );
      return;
    }

    for (const file of files) {
      const filePath = path.join(LOG_DIR, file);
      fs.stat(filePath, (statErr, stats) => {
        if (statErr) {
          originalConsoleError(
            `Impossible d'obtenir les statistiques du fichier ${file}: ${statErr.message}`,
            LogLevel.ERROR,
          );
          return;
        }

        const isConsoleLog = file === "console.log";
        const isImportErrorLog =
          file.startsWith("import_errors_") && file.endsWith(".log");

        if (
          (isConsoleLog || isImportErrorLog) &&
          stats.mtime.getTime() < cutoffTime
        ) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              originalConsoleError(
                `Impossible de supprimer le fichier ${file}: ${unlinkErr.message}`,
                LogLevel.ERROR,
              );
            } else {
              originalConsoleLog(
                `Fichier de log ancien supprimé: ${file}`,
                LogLevel.INFO,
              );
            }
          });
        }
      });
    }
    originalConsoleLog("Nettoyage des logs anciens terminé.", LogLevel.DEBUG);
  });
}
