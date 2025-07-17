import { useQuery } from "@tanstack/react-query";
import type React from "react";
import "./ImportHistory.css";

interface HistoryEntry {
  import_id: string;
  status: "COMPLETED" | "PARTIAL_SUCCESS" | "FAILED" | "CANCELLED";
  import_date: string;
  successful_lines: number;
  total_lines_processed: number;
}

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

const getStatusIcon = (status: HistoryEntry["status"]) => {
  switch (status) {
    case "COMPLETED":
      return <span title="Réussi">✅</span>;
    case "PARTIAL_SUCCESS":
      return <span title="Partiellement réussi">⚠️</span>;
    case "FAILED":
      return <span title="Échoué">❌</span>;
    case "CANCELLED":
      return <span title="Annulé">🛑</span>;
    default:
      return <span title="Inconnu">❓</span>;
  }
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
          <ul>
            {data.map((entry) => (
              <li key={entry.import_id}>
                <div className="history-item-status">
                  {getStatusIcon(entry.status)}
                </div>
                <div className="history-item-date">
                  {new Date(entry.import_date).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
                <div className="history-item-stats">
                  {entry.successful_lines?.toLocaleString("fr-FR") ?? 0} /{" "}
                  {entry.total_lines_processed?.toLocaleString("fr-FR") ?? 0}{" "}
                  lignes
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
};

export default ImportHistory;
