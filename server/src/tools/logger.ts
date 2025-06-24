// src/tools/logger.ts
import fs from "node:fs";
import path from "node:path";
import type { Writable } from "node:stream";
import {
  DatabaseError,
  ForeignKeyConstraintError,
  UniqueConstraintError,
} from "sequelize";
import type { CsvRow } from "../types/dataProcessing/dataProcessing";
import type { TransformError } from "../types/dataProcessing/importProcessingTypes";

// Sauvegarder les fonctions originales de console dès le début du module logger
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

const LOGS_DIR = path.join(__dirname, "..", "..", "..", "logs");

// S'assurer que le dossier logs existe
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Définir le chemin du fichier de log de la console
const CONSOLE_OUTPUT_FILE = path.join(
  LOGS_DIR,
  `console_output_${new Date().toISOString().replace(/:/g, "-")}.log`,
);
let consoleLogStream: Writable;

/**
 * Initialise ou réinitialise le stream de sortie de la console vers un fichier.
 * Cela devrait idéalement être appelé une seule fois au démarrage de l'application.
 * @returns {Writable} Le stream de fichier pour les logs de console.
 */
export const initializeConsoleLogStream = (): Writable => {
  if (consoleLogStream && !consoleLogStream.writableEnded) {
    // Si le stream existe et n'est pas fermé, le fermer avant de le recréer
    try {
      consoleLogStream.end();
      originalConsoleLog("[DEBUG - logger.ts] Ancien stream de console fermé.");
    } catch (e) {
      originalConsoleError(
        `[ERROR - logger.ts] Erreur lors de la fermeture de l'ancien stream de console: ${(e as Error).message}`,
      );
    }
  }
  consoleLogStream = fs.createWriteStream(CONSOLE_OUTPUT_FILE, { flags: "a" });
  consoleLogStream.on("error", (err) => {
    originalConsoleError(
      `[ERROR - ConsoleLogStream Listener] Erreur sur le stream de console: ${err.message}`,
    );
  });
  originalConsoleLog(
    `[DEBUG - logger.ts] Nouveau stream de console initialisé vers: ${CONSOLE_OUTPUT_FILE}`,
  );
  return consoleLogStream;
};

// Initialiser le stream au chargement du module
initializeConsoleLogStream();

/**
 * Redirige les sorties console.log et console.error vers le fichier de log configuré,
 * tout en les affichant également dans la console originale.
 */
export const redirectConsoleOutput = (): void => {
  console.log = (...args: unknown[]): void => {
    const now = new Date();
    const timePrefix = `${String(now.getHours()).padStart(2, "0")};${String(now.getMinutes()).padStart(2, "0")};${String(now.getSeconds()).padStart(2, "0")} | `;
    const logMessage = args.map((arg) => String(arg)).join(" ");

    originalConsoleLog.apply(console, args); // Afficher aussi dans la console standard
    try {
      if (consoleLogStream && !consoleLogStream.writableEnded) {
        // Vérifier si le stream est toujours ouvert
        consoleLogStream.write(`${timePrefix}${logMessage}\n`);
      }
    } catch (e) {
      originalConsoleError(
        `[ERROR - ConsoleLogStream Wrapper] Échec d'écriture dans le log de console: ${(e as Error).message}`,
      );
    }
  };

  console.error = (...args: unknown[]): void => {
    const now = new Date();
    const timePrefix = `${String(now.getHours()).padStart(2, "0")};${String(now.getMinutes()).padStart(2, "0")};${String(now.getSeconds()).padStart(2, "0")} | `;

    originalConsoleError.apply(console, args);
    try {
      if (consoleLogStream && !consoleLogStream.writableEnded) {
        // Ajout d'une logique pour formater les erreurs Sequelize plus précisément
        const formattedArgs = args.map((arg) => {
          if (arg instanceof ForeignKeyConstraintError) {
            const error = arg as ForeignKeyConstraintError;
            return `[SequelizeForeignKeyConstraintError] Nom: ${error.name}, Message: ${error.message}, Code: ${(error.parent as { code?: string; detail?: string })?.code || "N/A"}, Détail: ${(error.parent as { detail?: string })?.detail || "N/A"}, Contrainte: ${(error as { constraint?: string }).constraint || "N/A"}, Table: ${(error as { table?: string }).table || "N/A"}, SQL: ${(error as { sql?: string }).sql || "N/A"}`;
          }
          if (arg instanceof UniqueConstraintError) {
            const error = arg as UniqueConstraintError;
            return `[SequelizeUniqueConstraintError] Nom: ${error.name}, Message: ${error.message}, Code: ${(error.parent as { code?: string; detail?: string })?.code || "N/A"}, Détail: ${(error.parent as { detail?: string })?.detail || "N/A"}, Contrainte: ${(error as { constraint?: string }).constraint || "N/A"}, Table: ${(error as { table?: string }).table || "N/A"}, Champs: ${JSON.stringify((error as { fields?: unknown }).fields)}`;
          }
          if (arg instanceof DatabaseError) {
            const error = arg as DatabaseError;
            return `[SequelizeDatabaseError] Nom: ${error.name}, Message: ${error.message}, Code: ${(error.parent as { code?: string; detail?: string })?.code || "N/A"}, Détail: ${(error.parent as { detail?: string })?.detail || "N/A"}, SQL: ${(error as { sql?: string }).sql || "N/A"}`;
          }
          if (arg instanceof Error) {
            return `[Erreur] Nom: ${arg.name}, Message: ${arg.message}, Stack: ${arg.stack || "N/A"}`;
          }
          if (typeof arg === "object" && arg !== null) {
            const seen = new WeakSet<object>();
            try {
              return JSON.stringify(arg, (key, value) => {
                if (typeof value === "object" && value !== null) {
                  if (seen.has(value)) {
                    return;
                  }
                  seen.add(value);
                }
                return value;
              });
            } catch (e) {
              return `[Object] (Erreur de sérialisation: ${(e as Error).message})`;
            }
          }
          return String(arg);
        });
        consoleLogStream.write(
          `${timePrefix}[ERROR] ${formattedArgs.join(" ")}\n`,
        );
      }
    } catch (e) {
      originalConsoleError(
        `[ERROR - ConsoleLogStream Wrapper] Échec d'écriture dans le log de console (erreur): ${(e as Error).message}`,
      );
    }
  };
};

/**
 * Rétablit les fonctions console.log et console.error à leurs comportements originaux
 * et ferme le stream de log de console.
 */
export const restoreConsoleOutput = (): void => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  if (consoleLogStream && !consoleLogStream.writableEnded) {
    try {
      consoleLogStream.end(); // Fermer le stream quand on restreint les fonctions
      originalConsoleLog(
        "[DEBUG - logger.ts] Stream de console fermé et fonctions restaurées.",
      );
    } catch (e) {
      originalConsoleError(
        `[ERROR - logger.ts] Erreur lors de la fermeture du stream de console à la restauration: ${(e as Error).message}`,
      );
    }
  }
};

/**
 * Log les erreurs spécifiques d'importation dans un fichier dédié (import_errors_[UUID].log).
 * @param {TransformError} error - L'objet erreur transformé.
 * @param {Writable} errorLogStream - Le stream d'écriture pour le fichier d'erreurs d'importation.
 */
export async function logImportErrorToFile(
  error: TransformError,
  errorLogStream: Writable,
): Promise<void> {
  const now = new Date();
  const time = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  let affectedColumns: string | undefined = "";
  switch (error.type) {
    case "INVALID_GEOMETRY":
      affectedColumns =
        "coordonneesXY, consolidated_latitude, consolidated_longitude";
      break;
    case "MISSING_TERMINAL_ID":
      affectedColumns = "id_pdc_itinerance";
      break;
    case "DATABASE_BATCH_ERROR":
    case "DATABASE_UNIQUE_CONSTRAINT_VIOLATION":
    case "DATABASE_FOREIGN_KEY_VIOLATION":
    case "STATION_UPSERT_FAILED":
    case "MISSING_PARENT_STATION":
      affectedColumns = "N/A (Erreur BDD globale du lot)";
      break;
    case "VALUE_TOO_LONG": {
      let columnName: string | undefined = "Unknown Column";
      if (
        error.details &&
        typeof error.details === "object" &&
        "original" in error.details &&
        (error.details as { original?: { column?: string } }).original?.column
      ) {
        columnName = (error.details as { original?: { column?: string } })
          .original?.column;
      } else if (
        error.details &&
        typeof error.details === "object" &&
        "column" in error.details
      ) {
        columnName =
          (error.details as { column?: string }).column || "Unknown Column";
      } else if (
        error.details instanceof Error &&
        typeof (error.details as Error).message === "string"
      ) {
        const match = error.details.message.match(/column "(\w+)"/);
        if (match?.[1]) {
          columnName = match[1];
        }
      }
      affectedColumns = columnName;
      break;
    }
    case "MISSING_UPDATED_AT":
      affectedColumns =
        error.details &&
        typeof error.details === "object" &&
        "entity" in error.details
          ? `Entité: ${String((error.details as { entity?: string }).entity)}`
          : "N/A";
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
          affectedColumns = foundKeys
            .map((key) => {
              const value = (error.rowData as CsvRow)[key];
              return `${key}: "${value !== undefined && value !== null ? String(value) : "N/A"}"`;
            })
            .join(", ");
        } else {
          affectedColumns = "N/A (colonnes non spécifiques)";
        }
      } else {
        affectedColumns = "N/A";
      }
      break;
  }

  let detailsString = "";
  if (error.details) {
    if (error.details instanceof Error) {
      detailsString = error.details.message;
    } else if (typeof error.details === "object") {
      try {
        const seen = new WeakSet();
        detailsString = JSON.stringify(error.details, (key, value) => {
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
              return;
            }
            seen.add(value);
          }
          return value;
        });
      } catch (e) {
        detailsString = `[Object] (Erreur de sérialisation: ${(e as Error).message})`;
      }
    } else {
      detailsString = String(error.details);
    }
  }

  const logEntry =
    `${time} : ERREUR - ${error.message} - Ligne N° ${error.rowNumber}` +
    `${affectedColumns && affectedColumns !== "N/A" ? ` - Colonnes: [${affectedColumns}]` : ""}` +
    `${detailsString ? ` - Détails: ${detailsString}` : ""}\n`;

  const canWrite = errorLogStream.writable;
  if (!canWrite) {
    originalConsoleError(
      `[DEBUG - LOG WRITE] Stream de log d'erreur n'est PAS en écriture pour l'erreur: ${logEntry.trim()}`,
    );
    originalConsoleError(
      `[DEBUG - LOG WRITE] État du stream: writableEnded=${errorLogStream.writableEnded}, writableFinished=${errorLogStream.writableFinished}, writableCorked=${errorLogStream.writableCorked}`,
    );
    return;
  }

  try {
    errorLogStream.write(logEntry, (err) => {
      if (err) {
        originalConsoleError(
          `[DEBUG - LOG WRITE] ERREUR LORS DE L'ÉCRITURE DANS LE STREAM DE LOG D'ERREUR: ${err.message}. Log à écrire: ${logEntry.trim()}`,
        );
      }
    });
  } catch (err: unknown) {
    originalConsoleError(
      `[DEBUG - LOG WRITE] ERREUR CRITIQUE PENDANT errorLogStream.write(): ${(err as Error).message}. Log: ${logEntry.trim()}`,
    );
  }
}
