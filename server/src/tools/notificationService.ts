import type { ImportLogAttributes } from "../types/models/models";

export async function sendImportNotification(
  importSummary: ImportLogAttributes,
): Promise<void> {
  const {
    import_id,
    file_name,
    status,
    total_lines_processed,
    successful_lines,
    error_summary,
    import_date,
    error_log_file_path,
    duration_ms,
  } = importSummary;

  let notificationSubject = `[IMPORT CSV] Statut d'importation: ${status} - ${file_name}`;
  let notificationBody = "";

  const formatDuration = (ms: number | null | undefined): string => {
    if (ms === null || ms === undefined) return "N/A";
    const seconds = (ms / 1000).toFixed(2);
    return `${seconds} secondes`;
  };

  switch (status) {
    case "COMPLETED":
      notificationBody += `L'importation du fichier "${file_name}" (ID: ${import_id}) est terminée avec SUCCÈS.\n`;
      notificationBody += `  - Total lignes CSV traitées: ${total_lines_processed}\n`;
      notificationBody += `  - Total stations importées/mises à jour: ${successful_lines}\n`;
      notificationSubject = `✅ Importation réussie: ${file_name}`;
      break;
    case "PARTIAL_SUCCESS":
      notificationBody += `L'importation du fichier "${file_name}" (ID: ${import_id}) est terminée avec SUCCÈS PARTIEL.\n`;
      notificationBody += `  - Total lignes CSV traitées: ${total_lines_processed}\n`;
      notificationBody += `  - Total stations importées/mises à jour: ${successful_lines}\n`;
      notificationBody += `  - Nombre d'erreurs détectées: ${typeof error_summary?.message === "string" ? error_summary.message.split(" ")[0] : "N/A"}\n`;
      notificationBody += `  - Détails des erreurs: ${error_summary?.details || "Aucun détail d'erreur."}\n`;
      notificationBody += `  - Voir le fichier de log pour plus de détails: ${error_log_file_path}\n`;
      notificationSubject = `⚠️ Importation partielle: ${file_name}`;
      break;
    case "FAILED":
      notificationBody += `L'importation du fichier "${file_name}" (ID: ${import_id}) a ÉCHOUÉ.\n`;
      notificationBody += `  - Total lignes CSV traitées: ${total_lines_processed}\n`;
      notificationBody += `  - Stations importées (avant échec): ${successful_lines}\n`;
      notificationBody += `  - Résumé de l'échec: ${error_summary?.message || "Aucun résumé d'erreur."}\n`;
      notificationBody += `  - Détails: ${error_summary?.details || "N/A"}\n`;
      notificationBody += `  - Voir le fichier de log pour plus de détails: ${error_log_file_path || "N/A"}\n`;
      notificationSubject = `❌ Importation échouée: ${file_name}`;
      break;
    case "IN_PROGRESS":
      console.log(
        `[NOTIFICATION SIMULÉE - PROGRESSION] L'importation du fichier "${file_name}" (ID: ${import_id}) est en cours...`,
      );
      return;
    default:
      notificationBody += `L'importation du fichier "${file_name}" (ID: ${import_id}) a un STATUT INCONNU: ${status}.\n`;
      notificationSubject = `❓ Importation statut inconnu: ${file_name}`;
      break;
  }

  notificationBody += `  - Date d'importation: ${new Date(import_date).toLocaleString("fr-FR")}.\n`;
  notificationBody += `  - Durée de l'importation: ${formatDuration(duration_ms)}.\n`;

  console.log(`\n--- Notification d'Importation ---`);
  console.log(`Sujet: ${notificationSubject}`);
  console.log(`Corps:\n${notificationBody}`);
  console.log("----------------------------------\n");
}
