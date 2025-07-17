import type { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import type { ImportLogAttributes } from "../types/models/models";
import { getWss } from "./websocket";

/**
 * Fonction de base pour diffuser un message à tous les clients WebSocket.
 * @param data L'objet de données à envoyer.
 */
function broadcast(data: object) {
  try {
    const wss: WebSocketServer = getWss();
    const message = JSON.stringify(data);

    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  } catch (error) {
    // Ignore silencieusement si le serveur WebSocket n'est pas prêt.
  }
}

/**
 * Notifie les clients d'une progression en cours.
 * Appelé par le "logger espion".
 * @param message Le message de log brut.
 * @param percentage Le pourcentage de progression extrait.
 */
export function notifyProgress(message: string, percentage: number | null) {
  broadcast({ type: "progress", message, percentage });
}

/**
 * Notifie les clients d'une erreur survenue pendant le processus.
 * Appelé par le "logger espion" pour un feedback en temps réel.
 * @param message Le message d'erreur.
 */
export function notifyError(message: string) {
  broadcast({ type: "error", message });
}

/**
 * Notifie les clients de la fin de l'importation avec un résumé complet.
 * Utilise la logique de votre `notificationService` original.
 * @param importSummary Le résumé final de l'importation.
 */
export function notifyCompletion(importSummary: ImportLogAttributes) {
  const {
    status,
    file_name,
    total_lines_processed,
    successful_lines,
    error_summary,
  } = importSummary;

  // ✅ Initialisation redondante supprimée, type ajouté.
  let finalMessage: string;

  switch (status) {
    case "COMPLETED":
      finalMessage = `✅ Importation réussie: ${file_name}\n- Lignes CSV traitées: ${total_lines_processed}\n- Stations importées/mises à jour: ${successful_lines}`;
      break;
    // ✅ Bloc de portée ajouté pour isoler la déclaration de `errorCount`.
    case "PARTIAL_SUCCESS": {
      const errorCount =
        typeof error_summary?.message === "string"
          ? error_summary.message.split(" ")[0]
          : "N/A";
      finalMessage = `⚠️ Importation partielle: ${file_name}\n- Lignes CSV traitées: ${total_lines_processed}\n- Stations réussies: ${successful_lines}\n- Erreurs: ${errorCount}`;
      break;
    }
    case "FAILED":
      finalMessage = `❌ Importation échouée: ${file_name}\n- Raison: ${error_summary?.message || "Inconnue"}`;
      break;
    default:
      finalMessage = `❓ Statut d'importation inconnu: ${status} pour le fichier ${file_name}.`;
      break;
  }

  broadcast({
    type: "complete",
    message: finalMessage,
    stats: {
      total: total_lines_processed,
      success: successful_lines,
      errors: (total_lines_processed ?? 0) - (successful_lines ?? 0),
    },
  });
}
