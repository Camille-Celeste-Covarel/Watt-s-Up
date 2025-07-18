import type React from "react";
import { useRef, useState } from "react";
import { useImport } from "../../contexts/ImportContext";
import "./CsvImporter.css";
import ImportHistory from "../ImportHistory/ImportHistory";

const CsvImporter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // On récupère tout l'état et les fonctions depuis le contexte global.

  const {
    isImporting,
    isWsConnected,
    importId,
    progressPercentage,
    logLines,
    errorMessages,
    elapsedTime,
    stats,
    fileName,
    startUpload,
    cancelImport,
  } = useImport();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  // L'upload est maintenant délégué au contexte.
  const handleUpload = () => {
    if (file) {
      startUpload(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Le dashboard est visible si un import est en cours ou vient de se terminer.
  const isDashboardVisible = isImporting || importId;

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
            Parcourir...
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
              onClick={cancelImport}
              className="importer-stop-button"
            >
              Arrêter
            </button>
          )}
        </div>

        {/* Affiche le nom du fichier depuis l'état du contexte (si réhydraté) ou le fichier local */}
        {(file || fileName) && (
          <span className="file-name-display">{fileName || file?.name}</span>
        )}
      </div>

      {isDashboardVisible && (
        <div className="import-dashboard">
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{
                width: `${progressPercentage}%`,
                // La couleur change dynamiquement du rouge (teinte 0) au vert (teinte 120)
                // en passant par le jaune (teinte 60) dans l'espace couleur HSL.
                // On mappe la progression 0-100% sur l'échelle de teinte 0-120.
                backgroundColor: `hsl(${progressPercentage * 1.2}, 70%, 45%)`,
                transition:
                  "width 0.25s ease-out, background-color 0.5s linear",
              }}
            />
            <span className="progress-bar-text">{progressPercentage}%</span>
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
                <strong>{stats.success.toLocaleString("fr-FR")}</strong>{" "}
                réussites
                <br />
                <strong>{stats.errors.toLocaleString("fr-FR")}</strong> erreurs
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
      )}
      <ImportHistory />
    </div>
  );
};

export default CsvImporter;
