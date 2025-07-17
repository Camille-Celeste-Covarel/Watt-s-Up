import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import "./CsvImporter.css";

// Définit la structure des messages attendus du serveur WebSocket
interface ProgressMessage {
  type: "start" | "progress" | "complete" | "error";
  message?: string;
  importId?: string;
  percentage?: number | null;
  stats?: {
    total?: number;
    success?: number;
    errors?: number;
  };
}

const CsvImporter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [importId, setImportId] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState<number | null>(null);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [progressPercentage, setProgressPercentage] = useState<number | null>(
    null,
  );

  const [logLines, setLogLines] = useState<string[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const websocket = useRef<WebSocket | null>(null);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatLogLine = useCallback((message: string): string => {
    const time = new Date().toLocaleTimeString("fr-FR");
    return `${time} - ${message.trim()}`;
  }, []);

  // Cette fonction prépare le tableau de bord pour l'affichage.
  const startImportDisplay = useCallback(
    (initialMessage = "Initialisation...") => {
      // On ne modifie PAS isImporting ou importId ici.
      // On se contente de préparer l'UI.
      setProcessedCount(null);
      setSuccessCount(0);
      setErrorMessages([]);
      setProgressPercentage(0);
      setLogLines([formatLogLine(initialMessage)]);
      setElapsedTime(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setElapsedTime((t) => t + 1);
      }, 1000);
    },
    [formatLogLine],
  );

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_API_URL.replace(/^http/, "ws");
    websocket.current = new WebSocket(wsUrl);

    websocket.current.onopen = () => {
      console.log("WebSocket Connected");
      setIsWsConnected(true);
    };

    websocket.current.onmessage = (event) => {
      const data: ProgressMessage = JSON.parse(event.data);

      switch (data.type) {
        case "start": {
          // C'est SEULEMENT maintenant qu'on affiche le dashboard.
          if (data.importId) {
            setImportId(data.importId);
          }
          startImportDisplay(data.message || "L'importation a commencé.");
          break;
        }
        case "progress": {
          const { message } = data;
          if (message) {
            setLogLines((prevLines) =>
              [...prevLines, formatLogLine(message)].slice(-10),
            );
          }
          setProgressPercentage(
            (prevPercentage) => data.percentage ?? prevPercentage,
          );
          break;
        }
        case "complete": {
          setIsImporting(false);
          if (timerRef.current) clearInterval(timerRef.current);
          setLogLines((prevLines) =>
            [
              ...prevLines,
              formatLogLine(data.message || "Importation terminée !"),
            ].slice(-10),
          );
          setProgressPercentage(100);
          setProcessedCount(data.stats?.total ?? 0);
          setSuccessCount(data.stats?.success ?? 0);
          break;
        }
        case "error": {
          const { message } = data;
          if (message) {
            setErrorMessages((prevErrors) => [...prevErrors, message]);
            setLogLines((prevLines) =>
              [...prevLines, formatLogLine(`❌ ERREUR: ${message}`)].slice(-10),
            );
          }
          break;
        }
        default:
          break;
      }
    };

    websocket.current.onclose = () => {
      console.log("WebSocket Disconnected");
      setIsWsConnected(false);
    };

    return () => {
      websocket.current?.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startImportDisplay, formatLogLine]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleStop = () => {
    if (websocket.current && importId) {
      websocket.current.send(JSON.stringify({ type: "stop_import", importId }));
      setLogLines((prev) => [
        ...prev,
        formatLogLine("🛑 Demande d'arrêt envoyée..."),
      ]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file || isImporting) return;

    setIsImporting(true);
    setLogLines([formatLogLine("Envoi du fichier au serveur...")]);
    setErrorMessages([]);
    setProcessedCount(null);
    setImportId(null);

    const formData = new FormData();
    formData.append("csvfile", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/import/csv`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({
          message: "Erreur de communication avec le serveur.",
        }));
        const message =
          errorResult.message || "Échec du téléversement du fichier.";

        setErrorMessages([message]);
        setLogLines((prev) => [...prev, formatLogLine(`❌ ${message}`)]);
        setIsImporting(false);
        setProcessedCount(0);
        return;
      }

      setLogLines((prev) => [
        ...prev,
        formatLogLine("Fichier accepté, en attente du démarrage..."),
      ]);
    } catch (err: unknown) {
      let message = "Une erreur de connexion est survenue.";
      if (err instanceof Error) {
        message = err.message;
      }
      setErrorMessages([message]);
      setLogLines((prev) => [...prev, formatLogLine(`❌ ${message}`)]);
      setIsImporting(false);
      setProcessedCount(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="importer-container">
      <h3>Importer des Données depuis un CSV</h3>
      <div className="importer-controls">
        <div className="importer-button-group">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isImporting}
            ref={fileInputRef}
            style={{ display: "none" }}
          />

          <button
            type="button"
            onClick={handleBrowseClick}
            disabled={isImporting}
            className="importer-browse-button"
          >
            Importez votre fichier CSV
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={isImporting || !file || !isWsConnected}
          >
            {isImporting
              ? "Importation..."
              : !isWsConnected
                ? "Connexion..."
                : "Lancer l'importation"}
          </button>
          {isImporting && (
            <button
              type="button"
              onClick={handleStop}
              className="importer-stop-button"
            >
              Arrêter
            </button>
          )}
        </div>

        {file && <span className="file-name-display">{file.name}</span>}
      </div>

      {isImporting || processedCount !== null ? (
        <div className="import-dashboard">
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{
                width: `${progressPercentage ?? 0}%`,
                backgroundImage: `linear-gradient(to right, #f77979, #f77979 ${
                  100 - (progressPercentage ?? 0)
                }%, #69b779)`,
              }}
            />
            <span className="progress-bar-text">
              {progressPercentage !== null ? `${progressPercentage}%` : ""}
            </span>
          </div>

          <div className="status-row">
            <div className="log-console">
              {logLines.map((line, index) => (
                <div
                  key={`${index}-${line}`}
                  className="log-line"
                  style={{ opacity: (index + 1) / logLines.length }}
                >
                  {line}
                </div>
              ))}
            </div>
            <div className="timer-and-stats">
              <div className="timer">
                <span>Temps écoulé</span>
                <strong>{formatTime(elapsedTime)}</strong>
              </div>
              <div className="stats-recap">
                <strong>{successCount.toLocaleString("fr-FR")}</strong>{" "}
                réussites
                <br />
                <strong>{errorMessages.length}</strong> erreurs
              </div>
            </div>
          </div>

          {errorMessages.length > 0 && (
            <details className="error-accordion">
              <summary>Détail des erreurs ({errorMessages.length})</summary>
              <div className="error-details">
                {errorMessages.map((msg, index) => (
                  <div key={`${index}-${msg}`}>{msg}</div>
                ))}
              </div>
            </details>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default CsvImporter;
