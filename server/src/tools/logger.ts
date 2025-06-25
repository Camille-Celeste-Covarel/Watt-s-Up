import fs from "node:fs";
import type { Writable } from "node:stream";
import { DatabaseError } from "sequelize"; // Importer DatabaseError de Sequelize
import type { TransformError } from "../types/dataProcessing/importProcessingTypes";

// Définition des niveaux de log
enum LogLevel {
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

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

let logStream: Writable | null = null;
let minLogLevel: LogLevel = LogLevel.INFO; // Niveau de log par défaut

/**
 * Initialise un stream de log pour la console globale.
 * Redirige les sorties de console.log et console.error vers ce stream
 * et une sortie fichier.
 */
export function initializeConsoleLogStream() {
  const logFilePath = process.env.LOG_FILE_PATH || "./logs/console.log";
  const logDir = process.env.LOG_DIR || "./logs";

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  logStream = fs.createWriteStream(logFilePath, { flags: "a" });

  logStream.on("error", (err) => {
    // Si le stream de log échoue, revenir à console.error par défaut
    originalConsoleError(`ERREUR CRITIQUE du stream de log : ${err.message}`);
    logStream = null; // Désactiver le log via stream
  });
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

  // Typage plus précis des arguments pour console.log
  console.log = (message?: unknown, ...optionalParams: unknown[]) => {
    const level: LogLevel =
      typeof optionalParams[0] === "string" &&
      LOG_LEVEL_NAMES[optionalParams[0].toUpperCase()] !== undefined
        ? LOG_LEVEL_NAMES[optionalParams[0].toUpperCase()]
        : LogLevel.INFO;
    const filteredParams = optionalParams.filter(
      (_, index) =>
        index !== 0 ||
        typeof optionalParams[0] !== "string" ||
        LOG_LEVEL_NAMES[optionalParams[0].toUpperCase()] === undefined,
    );

    if (level >= minLogLevel) {
      const time = new Date().toLocaleTimeString("fr-FR");
      const logMessage = `${time} : ${LogLevel[level]} - ${message} ${filteredParams.join(" ")}`;
      originalConsoleLog(logMessage); // Log dans la console habituelle

      if (logStream) {
        logStream.write(`${logMessage}\n`);
      }
    }
  };

  // Typage plus précis des arguments pour console.error
  console.error = (message?: unknown, ...optionalParams: unknown[]) => {
    const level: LogLevel =
      typeof optionalParams[0] === "string" &&
      LOG_LEVEL_NAMES[optionalParams[0].toUpperCase()] !== undefined
        ? LOG_LEVEL_NAMES[optionalParams[0].toUpperCase()]
        : LogLevel.ERROR;
    const filteredParams = optionalParams.filter(
      (_, index) =>
        index !== 0 ||
        typeof optionalParams[0] !== "string" ||
        LOG_LEVEL_NAMES[optionalParams[0].toUpperCase()] === undefined,
    );

    if (level >= minLogLevel) {
      const time = new Date().toLocaleTimeString("fr-FR");
      const logMessage = `${time} : ${LogLevel[level]} - ${message} ${filteredParams.join(" ")}`;
      originalConsoleError(logMessage);

      if (logStream) {
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
    // Sequelize's DatabaseError often has a 'column' property on the original error (e.g., PostgreSQL driver error)
    // We can access it directly if we know the type, or safely cast.
    // Given the previous error, we might need a slightly more robust check
    const dbError = error.originalError as DatabaseError & { column?: string }; // Cast pour inclure 'column' si présent
    if (dbError.column) {
      affectedColumns = dbError.column;
    }
    // Vous pouvez également inspecter error.originalError.parent pour des détails plus bas niveau de la DB
  }

  // Autres types d'erreurs
  if (
    error.originalError &&
    typeof error.originalError === "object" &&
    "message" in error.originalError &&
    typeof (error.originalError as { message?: unknown }).message === "string"
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
