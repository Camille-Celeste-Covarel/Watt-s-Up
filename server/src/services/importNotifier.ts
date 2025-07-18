import type { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import type { ImportLogAttributes } from "../types/models/models";
import { getWss } from "./websocket";

/**
 * Sends a message to a specific, open WebSocket client.
 * @param ws The target WebSocket client.
 * @param data The stringified data to send.
 */
function send(ws: WebSocket, data: string) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(data);
  }
}

/**
 * Fonction de base pour diffuser un message à tous les clients WebSocket.
 * @param message La chaîne de caractères du message à envoyer.
 */
function broadcast(message: string) {
  try {
    const wss: WebSocketServer = getWss();
    for (const client of wss.clients) {
      send(client, message);
    }
  } catch (error) {
    // Ignore silencieusement si le serveur WebSocket n'est pas prêt.
  }
}

/**
 * Notifie les clients que l'importation a démarré et leur fournit l'ID.
 * @param importId L'UUID de l'importation.
 * @param ws
 * @param message
 * @param elapsedTime
 */
export function notifyStart(
  importId: string,
  ws?: WebSocket,
  message?: string,
  elapsedTime?: number,
) {
  const payload = {
    type: "start",
    message: message || "Importation démarrée...",
    importId,
    elapsedTime,
  };
  const data = JSON.stringify(payload);
  if (ws) {
    send(ws, data);
  } else {
    broadcast(data);
  }
}

/**
 * Notifie les clients d'une progression en cours.
 * Si `ws` est fourni, le message n'est envoyé qu'à ce client (pour la réhydratation).
 */
export function notifyProgress(
  importId: string,
  percentage: number,
  message: string,
  successful_lines: number,
  ws?: WebSocket,
  elapsedTimeInSeconds?: number,
) {
  const payload = {
    type: "progress",
    message,
    percentage,
    importId,
    stats: { success: successful_lines },
  };
  const data = JSON.stringify(payload);
  if (ws) {
    send(ws, data);
  } else {
    broadcast(data);
  }
}

/**
 * Notifie les clients d'une erreur survenue pendant le processus en temps réel.
 * @param message Le message d'erreur.
 */
export function notifyError(message: string) {
  const payload = { type: "error", message };
  broadcast(JSON.stringify(payload));
}

/**
 * Notifie les clients de la fin de l'importation avec un résumé complet.
 * @param importSummary Le résumé final de l'importation.
 */
export function notifyCompletion(importSummary: ImportLogAttributes) {
  const { status, file_name, total_lines_processed, successful_lines } =
    importSummary;

  const totalErrorEntries =
    (total_lines_processed ?? 0) - (successful_lines ?? 0);
  let finalMessage: string;

  switch (status) {
    case "COMPLETED":
      finalMessage = `✅ Importation de ${file_name} terminée avec succès.`;
      break;
    case "PARTIAL_SUCCESS": {
      finalMessage = `⚠️ Importation de ${file_name} terminée avec des erreurs.`;
      break;
    }
    case "CANCELLED": {
      finalMessage = `🛑 Importation de ${file_name} annulée par l'utilisateur.`;
      break;
    }
    case "FAILED":
      finalMessage = `❌ Échec de l'importation de ${file_name}.`;
      break;
    default:
      finalMessage = `❓ Statut d'importation inconnu: ${status} pour le fichier ${file_name}.`;
      break;
  }

  const payload = {
    type: "complete",
    message: finalMessage,
    importId: importSummary.import_id,
    stats: {
      total: total_lines_processed,
      success: successful_lines,
      errors: totalErrorEntries,
    },
  };
  broadcast(JSON.stringify(payload));
}
