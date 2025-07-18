import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface ImportStats {
  total: number;
  success: number;
  errors: number;
}

interface ImportState {
  isImporting: boolean;
  isWsConnected: boolean;
  importId: string | null;
  progressPercentage: number;
  logLines: string[];
  errorMessages: string[];
  elapsedTime: number;
  stats: ImportStats;
  fileName: string | null;
}

interface ImportContextType extends ImportState {
  startUpload: (file: File) => Promise<void>;
  cancelImport: () => void;
  clearImportState: () => void;
}

const ImportContext = createContext<ImportContextType | undefined>(undefined);

const initialState: ImportState = {
  isImporting: false,
  isWsConnected: false,
  importId: null,
  progressPercentage: 0,
  logLines: [],
  errorMessages: [],
  elapsedTime: 0,
  stats: { total: 0, success: 0, errors: 0 },
  fileName: null,
};

export const ImportProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<ImportState>(initialState);
  const websocket = useRef<WebSocket | null>(null);
  const timerRef = useRef<number | null>(null);

  const formatLogLine = useCallback((message: string): string => {
    const time = new Date().toLocaleTimeString("fr-FR");
    return `${time} - ${message.trim()}`;
  }, []);

  const clearImportState = useCallback(() => {
    setState(initialState);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Gère le cycle de vie du chronomètre en se basant sur l'état d'importation
  useEffect(() => {
    // Si l'importation n'est pas en cours, on s'assure que le timer est arrêté.
    if (!state.isImporting) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Démarre un timer qui incrémente le temps écoulé chaque seconde
    timerRef.current = window.setInterval(() => {
      setState((s) => ({ ...s, elapsedTime: s.elapsedTime + 1 }));
    }, 1000);

    // Fonction de nettoyage pour s'assurer que le timer est détruit si l'état change
    // ou si le composant est démonté
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isImporting]);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_API_URL.replace(/^http/, "ws");
    websocket.current = new WebSocket(wsUrl);

    websocket.current.onopen = () => {
      setState((s) => ({ ...s, isWsConnected: true }));
    };

    websocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setState((s) => {
        switch (data.type) {
          case "start":
            return {
              ...s,
              isImporting: true,
              importId: data.importId,
              logLines: [formatLogLine(data.message)],
              errorMessages: [],
              elapsedTime: data.elapsedTime ?? 0, // Utilise le temps du serveur ou 0
              progressPercentage: 0,
              stats: { total: 0, success: 0, errors: 0 },
            };

          case "progress":
            return {
              ...s,
              logLines: [...s.logLines, formatLogLine(data.message)].slice(-10),
              progressPercentage: data.percentage ?? s.progressPercentage,
              stats: {
                ...s.stats,
                success: data.stats?.success ?? s.stats.success,
              },
            };

          case "complete":
            return {
              ...s,
              isImporting: false, // Le useEffect va automatiquement arrêter le timer
              progressPercentage: 100,
              logLines: [...s.logLines, formatLogLine(data.message)].slice(-10),
              stats: data.stats,
              errorMessages: data.error_summary?.details
                ? [data.error_summary.details]
                : [],
            };

          default:
            return s;
        }
      });
    };

    websocket.current.onclose = () => {
      setState((s) => ({ ...s, isWsConnected: false, isImporting: false }));
    };

    return () => {
      websocket.current?.close();
    };
  }, [formatLogLine]);

  const startUpload = useCallback(
    async (file: File) => {
      if (!file || state.isImporting) return;

      clearImportState();
      setState((s) => ({
        ...s,
        isImporting: true,
        fileName: file.name,
        logLines: [formatLogLine("Envoi du fichier au serveur...")],
      }));

      const formData = new FormData();
      formData.append("csvfile", file);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/import/csv`,
          { method: "POST", body: formData, credentials: "include" },
        );

        if (!response.ok) {
          const errorResult = await response.json().catch(() => ({
            message: "Erreur du serveur lors de l'acceptation de la tâche.",
          }));
          setState((s) => ({
            ...s,
            isImporting: false,
            errorMessages: [errorResult.message],
            logLines: [
              ...s.logLines,
              formatLogLine(`❌ ${errorResult.message}`),
            ],
          }));
          return;
        }

        const result = await response.json();
        setState((s) => ({
          ...s,
          logLines: [...s.logLines, formatLogLine(result.message)],
        }));
      } catch (err) {
        setState((s) => ({
          ...s,
          isImporting: false,
          errorMessages: ["Erreur de connexion."],
        }));
      }
    },
    [state.isImporting, clearImportState, formatLogLine],
  );

  const cancelImport = useCallback(() => {
    if (websocket.current && state.importId) {
      websocket.current.send(
        JSON.stringify({ type: "stop_import", importId: state.importId }),
      );
      setState((s) => ({
        ...s,
        logLines: [
          ...s.logLines,
          formatLogLine("🛑 Demande d'arrêt envoyée..."),
        ],
      }));
    }
  }, [state.importId, formatLogLine]);

  return (
    <ImportContext.Provider
      value={{ ...state, startUpload, cancelImport, clearImportState }}
    >
      {children}
    </ImportContext.Provider>
  );
};

export const useImport = (): ImportContextType => {
  const context = useContext(ImportContext);
  if (context === undefined) {
    throw new Error("useImport must be used within an ImportProvider");
  }
  return context;
};
