import type { ImportLogAttributes } from "../types/models/models";

export async function sendImportNotification(
  importSummary: ImportLogAttributes,
): Promise<void> {
  const {
    import_id,
    file_name,
    total_lines_processed,
    successful_lines,
    status,
    import_date,
    error_summary,
  } = importSummary;

  let subject: string;
  let message: string;

  switch (status) {
    case "COMPLETED":
      subject = `[Importation Réussie] Fichier ${file_name} (ID: ${import_id})`;
      message = `L'importation du fichier "${file_name}" (ID: ${import_id}) démarrée le ${import_date.toLocaleString()} s'est terminée avec SUCCÈS.\\n`;
      message += `Total de lignes traitées: ${total_lines_processed}.\\n`;
      message += `Lignes importées avec succès: ${successful_lines}.`;
      break;
    case "PARTIAL_SUCCESS":
      subject = `[Importation Partiellement Réussie] Fichier ${file_name} (ID: ${import_id})`;
      message = `L'importation du fichier "${file_name}" (ID: ${import_id}) démarrée le ${import_date.toLocaleString()} s'est terminée avec un SUCCÈS PARTIEL.\\n`;
      message += `Total de lignes traitées: ${total_lines_processed}.\\n`;
      message += `Lignes importées avec succès: ${successful_lines}.\\n`;
      message += `Nombre d'erreurs détectées: ${total_lines_processed - successful_lines}.\\n`;
      message += `Résumé des erreurs: ${JSON.stringify(error_summary, null, 2)}`;
      break;
    case "FAILED":
      subject = `[Importation Échouée] Fichier ${file_name} (ID: ${import_id})`;
      message = `L'importation du fichier "${file_name}" (ID: ${import_id}) démarrée le ${import_date.toLocaleString()} a ÉCHOUÉ.\\n`;
      message += `Total de lignes traitées avant échec: ${total_lines_processed}.\\n`;
      message += `Résumé de l'échec: ${JSON.stringify(error_summary, null, 2)}`;
      break;
    default:
      subject = `[Importation Statut Inconnu] Fichier ${file_name} (ID: ${import_id})`;
      message = `Le statut d'importation pour le fichier "${file_name}" (ID: ${import_id}) est inconnu: ${status}.`;
      break;
  }

  console.log(`--- NOTIFICATION D'IMPORTATION ---`, "INFO");
  console.log(`Sujet: ${subject}`, "INFO");
  console.log(`Message:\\n${message}`, "INFO");
  console.log("---------------------------------", "INFO");
}
