import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import "./CsvImporter.css";

// Définit la structure des messages attendus du serveur WebSocket
interface ProgressMessage {
  type: "start" | "progress" | "complete" | "error";
  message?: string;
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
  const [processedCount, setProcessedCount] = useState<number | null>(null);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [progressPercentage, setProgressPercentage] = useState<number | null>(
    null,
  );

  // --- Nouveaux états pour le design amélioré ---
  const [logLines, setLogLines] = useState<string[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const websocket = useRef<WebSocket | null>(null);
  const timerRef = useRef<number | null>(null);

  // --- Fonction utilitaire pour formater les lignes de log (stabilisée avec useCallback) ---
  const formatLogLine = useCallback((message: string): string => {
    const time = new Date().toLocaleTimeString("fr-FR");
    // On nettoie le message de tout espace non désiré et on ajoute l'heure.
    return `${time} - ${message.trim()}`;
  }, []); // Vide, car elle n'a pas de dépendances externes.

  // ✅ On stabilise la fonction avec useCallback pour pouvoir l'utiliser
  //    sans danger comme dépendance d'un useEffect.
  const startImportDisplay = useCallback(
    (initialMessage = "Initialisation...") => {
      setIsImporting(true);
      // Réinitialisation complète de l'état
      setProcessedCount(null);
      setSuccessCount(0);
      setErrorMessages([]);
      setProgressPercentage(0);
      setLogLines([formatLogLine(initialMessage)]);
      setElapsedTime(0);

      // Démarrage du chronomètre
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setElapsedTime((t) => t + 1);
      }, 1000);
    },
    [formatLogLine], // ✅ On ajoute la dépendance maintenant qu'elle est stable.
  );

  useEffect(() => {
    // Construit l'URL WebSocket (ws:// ou wss://) à partir de l'URL de l'API HTTP
    const wsUrl = import.meta.env.VITE_API_URL.replace(/^http/, "ws");

    // Initialise la connexion WebSocket
    websocket.current = new WebSocket(wsUrl);

    websocket.current.onopen = () => {
      console.log("WebSocket Connected");
    };

    // C'est ici que la magie opère : on écoute les messages du serveur
    websocket.current.onmessage = (event) => {
      const data: ProgressMessage = JSON.parse(event.data);

      switch (data.type) {
        case "start": {
          startImportDisplay(data.message);
          break;
        }
        case "progress": {
          // Ajoute une nouvelle ligne de log, en gardant seulement les 10 dernières
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
          if (timerRef.current) clearInterval(timerRef.current); // Arrêt du chrono
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
          // Ajoute l'erreur à la liste des erreurs
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
    };

    // Fonction de nettoyage pour fermer la connexion quand le composant est détruit
    return () => {
      websocket.current?.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startImportDisplay, formatLogLine]); // ✅ On ajoute TOUTES les dépendances stables.

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || isImporting) return;

    // On bascule l'UI en mode importation IMMÉDIATEMENT pour une meilleure réactivité
    // et pour désactiver le bouton avant toute opération asynchrone.
    startImportDisplay("Téléversement du fichier en cours...");

    const formData = new FormData();
    formData.append("csvFile", file);

    try {
      // On envoie le fichier au serveur.
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/import/csv`,
        {
          method: "POST",
          body: formData,
          credentials: "include", // Crucial pour envoyer le cookie d'authentification
        },
      );

      // Si la réponse n'est pas "OK" (ex: erreur 400, 500), l'importation ne démarrera pas côté serveur.
      // On doit donc arrêter l'état "importation en cours" tout en gardant le dashboard visible pour l'erreur.
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({
          message: "Erreur de communication avec le serveur.",
        }));
        const message =
          errorResult.message || "Échec du téléversement du fichier.";

        // On met à jour l'UI pour afficher l'échec et on arrête le processus.
        setErrorMessages([message]);
        setLogLines((prev) => [...prev, formatLogLine(`❌ ${message}`)]);
        if (timerRef.current) clearInterval(timerRef.current);
        setIsImporting(false);
        setProcessedCount(0); // Assure que le dashboard reste visible pour montrer l'erreur.
        return; // On arrête l'exécution ici.
      }

      // ✅ SUCCÈS ! Le serveur a accepté le fichier.
      // On met à jour le log et on attend les messages WebSocket qui vont suivre.
      setLogLines((prev) => [
        ...prev,
        formatLogLine("Fichier accepté, l'importation commence..."),
      ]);
    } catch (err: unknown) {
      // Erreur de connexion, le serveur n'a probablement jamais reçu la requête.
      // On arrête aussi le processus côté client et on affiche l'erreur.
      let message = "Une erreur de connexion est survenue.";
      if (err instanceof Error) {
        message = err.message;
      }
      setErrorMessages([message]);
      setLogLines((prev) => [...prev, formatLogLine(`❌ ${message}`)]);
      if (timerRef.current) clearInterval(timerRef.current);
      setIsImporting(false);
      setProcessedCount(0); // Assure que le dashboard reste visible pour montrer l'erreur.
    }
  };

  // --- Fonctions d'aide pour l'affichage ---

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
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isImporting}
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={isImporting || !file}
        >
          {isImporting ? "Importation..." : "Lancer l'importation"}
        </button>
      </div>

      {isImporting || processedCount !== null ? (
        <div className="import-dashboard">
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{
                width: `${progressPercentage ?? 0}%`,
                // Dégradé de rouge à vert basé sur le pourcentage
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
                  // Le dégradé d'opacité
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
