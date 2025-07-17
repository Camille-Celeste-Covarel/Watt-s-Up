import fs from "node:fs";
import path from "node:path";
import type { Writable } from "node:stream";
import { DatabaseError } from "sequelize";
import { notifyError } from "../services/importNotifier";
import type { TransformError } from "../types/dataProcessing/importProcessingTypes";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
  CRITICAL = 5,
}

const LOG_LEVEL_NAMES: { [key: string]: LogLevel } = {
  DEBUG: LogLevel.DEBUG,
  INFO: LogLevel.INFO,
  SUCCESS: LogLevel.SUCCESS,
  WARN: LogLevel.WARN,
  ERROR: LogLevel.ERROR,
  CRITICAL: LogLevel.CRITICAL,
};

const LOG_LEVEL_VALUES: Set<number> = new Set(
  Object.values(LogLevel).filter((v) => typeof v === "number") as number[],
);

function getProgressBarColor(percentage: number): string {
  const red = Math.round(255 * (1 - percentage / 100));
  const green = Math.round(255 * (percentage / 100));
  return `\x1b[38;2;${red};${green};0m`;
}

const ANSI_RESET_COLOR = "\x1b[0m";

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
 * Crée un gestionnaire de log personnalisé.
 * Factorise la logique commune entre console.log et console.error.
 * @param defaultLevel Le niveau de log à utiliser si aucun n'est fourni.
 * @param logFunction La fonction de console originale à appeler (ex: originalConsoleLog).
 * @returns Une fonction de log qui peut remplacer console.log ou console.error.
 */
function createLogHandler(
  defaultLevel: LogLevel,
  logFunction: (...args: unknown[]) => void,
) {
  return (message?: unknown, ...optionalParams: unknown[]) => {
    let level = defaultLevel;
    let filteredParams = optionalParams;

    // Logique pour extraire le niveau de log des paramètres
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
      let finalMessageForConsole = message;

      // Si c'est un message de progression, on le colore pour la console
      if (typeof message === "string") {
        const progressMatch = message.match(/Traitement en cours : (\d+)%/);
        if (progressMatch?.[1]) {
          const percentage = Number.parseInt(progressMatch[1], 10);
          const color = getProgressBarColor(percentage);
          finalMessageForConsole = `${color}${message}${ANSI_RESET_COLOR}`;
        }
      }

      const logMessage = `${time} : ${LogLevel[level]} - ${finalMessageForConsole} ${filteredParams.map((p) => String(p)).join(" ")}`;
      // On utilise logFunction (originalConsoleLog/Error) pour afficher dans le terminal
      logFunction(logMessage.trim());

      if (logStream) {
        logStream.write(`${logMessage}\n`);
      }
    }
  };
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

  console.log = createLogHandler(LogLevel.INFO, originalConsoleLog);
  console.error = createLogHandler(LogLevel.ERROR, originalConsoleError);
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

  originalConsoleLog(
    `[DEBUG - logger.ts] Tentative d'écriture dans le log d'erreur pour la ligne ${error.rowNumber}. Stream writable: ${errorLogStream.writable}`,
    LogLevel.DEBUG,
  );
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

/**
 * @param message Le message à logger.
 * @param level Le niveau de log.
 * @param optionalParams Paramètres additionnels.
 */
export function log(
  message: unknown,
  level: LogLevel,
  ...optionalParams: unknown[]
) {
  if (level >= LogLevel.ERROR) {
    console.error(message, level, ...optionalParams);
  } else {
    console.log(message, level, ...optionalParams);
  }
}

/**
 * Version "overrided" de la fonction de log qui redirige les erreurs vers `notifyError`.
 */
export function logWithProgress(
  message: unknown,
  level: LogLevel,
  ...optionalParams: unknown[]
) {
  log(message, level, ...optionalParams); // Continue le logging normal
  if (level >= LogLevel.ERROR && typeof message === "string") {
    notifyError(message);
  }
}
