import { useQuery } from "@tanstack/react-query";
import type React from "react";
import "./ImportHistory.css";
import type { HistoryEntry } from "../../types/components/componentsTypes.ts";

const fetchImportHistory = async (): Promise<HistoryEntry[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/import/history`,
    {
      credentials: "include",
    },
  );
  if (!response.ok) {
    throw new Error("Impossible de récupérer l'historique des imports.");
  }
  return response.json();
};

const getStatusInfo = (status: HistoryEntry["status"]) => {
  switch (status) {
    case "COMPLETED":
      return { icon: "✅", text: "Réussi" };
    case "PARTIAL_SUCCESS":
      return { icon: "⚠️", text: "Partiellement réussi" };
    case "FAILED":
      return { icon: "❌", text: "Échoué" };
    case "CANCELLED":
      return { icon: "🛑", text: "Annulé" };
    default:
      return { icon: "❓", text: "Inconnu" };
  }
};

const formatDuration = (ms: number | null | undefined) => {
  if (ms === null || ms === undefined) return "N/A";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const ImportHistory: React.FC = () => {
  const { data, isLoading, error } = useQuery<HistoryEntry[], Error>({
    queryKey: ["importHistory"],
    queryFn: fetchImportHistory,
    staleTime: 60 * 1000,
  });

  return (
    <details className="history-accordion">
      <summary>Voir l'historique des 5 derniers imports</summary>
      <div className="history-content">
        {isLoading && <div>Chargement de l'historique...</div>}
        {error && <div className="history-error">Erreur: {error.message}</div>}
        {data && data.length === 0 && (
          <div>Aucun import dans l'historique.</div>
        )}
        {data && data.length > 0 && (
          <div className="history-list">
            {data.map((entry) => {
              const statusInfo = getStatusInfo(entry.status);
              const importDate = new Date(entry.import_date);
              return (
                <details key={entry.import_id} className="history-item-details-accordion">
                  <summary>
                    <div className="history-item-summary">
                      <span className="history-item-status-icon">{statusInfo.icon}</span>
                      <span className="history-item-date-summary">
                        {importDate.toLocaleDateString("fr-FR")} - {importDate.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </summary>
                  <div className="history-item-content">
                    <div className="history-item-group">
                      <div>
                        <strong>Statut:</strong> {statusInfo.text}
                      </div>
                      <div>
                        <strong>Durée:</strong> {formatDuration(entry.duration_ms)}
                      </div>
                    </div>
                    <div className="history-item-group">
                      <div>
                        <strong>Lignes:</strong> {entry.successful_lines?.toLocaleString("fr-FR") ?? 0} / {entry.total_lines_processed?.toLocaleString("fr-FR") ?? 0}
                      </div>
                      <div>
                        <strong>Total:</strong> {entry.total_lines_in_file?.toLocaleString("fr-FR") ?? 0}
                      </div>
                    </div>
                    <div className="history-item-group">
                      <div className="history-item-long-text">
                        <strong>Fichier:</strong> <span>{entry.file_name}</span>
                      </div>
                    </div>
                    {entry.error_summary && (
                      <div className="history-item-group">
                        <div className="history-item-errors history-item-long-text">
                          <strong>Erreurs:</strong> <span>{entry.error_summary.message}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </details>
  );
};

export default ImportHistory;
