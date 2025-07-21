import { type Server as HttpServer, createServer } from "node:http";
import type { Express } from "express";
import { type WebSocket, WebSocketServer } from "ws";
import * as Models from "../models/_index";
import { LogLevel } from "../tools/logger";
import { notifyProgress, notifyStart } from "./importNotifier";
import { requestStop } from "./importStateManager";

let wss: WebSocketServer;

export const createWebSocketServer = (app: Express): HttpServer => {
  const server = createServer(app);
  wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: WebSocket) => {
    console.log("✅ WebSocket client connected", LogLevel.INFO);

    // --- Logique de Réhydratation ---
    // Quand un client se connecte, on vérifie s'il y a une importation en cours.
    try {
      const ongoingImport = await Models.ImportLog.findOne({
        where: { status: "IN_PROGRESS" },
      });

      // Si une importation est en cours, on envoie son état au nouveau client
      // pour qu'il puisse "rattraper" l'affichage.
      if (ongoingImport) {
        console.log(
          `Ongoing import found: ${ongoingImport.import_id}. Rehydrating new client.`,
          LogLevel.INFO,
        );
        const percentage =
          ongoingImport.total_lines_in_file > 0
            ? Math.floor(
                (ongoingImport.total_lines_processed /
                  ongoingImport.total_lines_in_file) *
                  100,
              )
            : 0;
        const elapsedTimeInSeconds = Math.round(
          (new Date().getTime() - ongoingImport.import_date.getTime()) / 1000,
        );

        // On simule les messages de démarrage et de progression pour reconstruire l'UI client.
        notifyStart(
          ongoingImport.import_id,
          ws,
          "Reconnexion à une importation en cours...",
          elapsedTimeInSeconds,
        );
        notifyProgress(
          ongoingImport.import_id,
          percentage,
          `Progression actuelle: ${percentage}%`,
          ongoingImport.successful_lines,
          ws,
        );
      }
    } catch (error) {
      console.error(
        "Erreur durant la réhydratation du client WebSocket:",
        LogLevel.ERROR,
        error,
      );
    }

    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "stop_import" && data.importId) {
          console.log(
            `Demande d'arrêt reçue pour l'import: ${data.importId}`,
            LogLevel.INFO,
          );
          requestStop(data.importId);
        }
      } catch (e) {
        console.error(
          "Erreur lors du parsing du message WebSocket:",
          LogLevel.ERROR,
          e,
        );
      }
    });

    ws.on("close", () => {
      console.log("❌ WebSocket client disconnected", LogLevel.INFO);
    });

    ws.on("error", (error) => {
      console.error("Erreur WebSocket:", LogLevel.ERROR, error);
    });
  });

  console.log("🚀 WebSocket server is ready.", LogLevel.INFO);
  return server;
};

export const getWss = (): WebSocketServer => {
  if (!wss) {
    throw new Error("WebSocket server has not been initialized.");
  }
  return wss;
};
