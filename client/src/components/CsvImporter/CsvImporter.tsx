import type React from "react";
import { useRef, useState } from "react";
import { useImport } from "../../contexts/ImportContext";
import "./CsvImporter.css";
import ImportHistory from "../ImportHistory/ImportHistory";

const CsvImporter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const interpolateRgb = (
    color1: number[],
    color2: number[],
    factor: number,
  ) => {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
    }
    return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
  };

  const getProgressBarGradient = (percentage: number) => {
    const red = "#d32f2f";
    const yellow = "#fbc02d";

    const redRgb = [211, 47, 47];
    const yellowRgb = [251, 192, 45];
    const greenRgb = [56, 142, 60];

    if (percentage <= 50) {
      // From 0 to 50%, we build a simple gradient from red to the interpolated color.
      const factor = percentage / 50;
      const currentColor = interpolateRgb(redRgb, yellowRgb, factor);
      return `linear-gradient(to right, ${red}, ${currentColor})`;
    }
    // Above 50%, the gradient goes from red to green, with a stop at yellow.
    const yellowStopPosition = (50 / percentage) * 100;
    const factor = (percentage - 50) / 50;
    const currentColor = interpolateRgb(yellowRgb, greenRgb, factor);
    return `linear-gradient(to right, ${red}, ${yellow} ${yellowStopPosition}%, ${currentColor})`;
  };

  const isDashboardVisible = isImporting || importId;

  return (
    <details className="importer-accordion">
      <summary>Importer des Données depuis un CSV</summary>
      <div className="importer-container">
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
                  backgroundImage: getProgressBarGradient(progressPercentage),
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
    </details>
  );
};

export default CsvImporter;
