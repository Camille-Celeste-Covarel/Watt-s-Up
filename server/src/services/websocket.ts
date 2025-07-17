import { type Server as HttpServer, createServer } from "node:http";
import type { Express } from "express";
import { type WebSocket, WebSocketServer } from "ws";
import { requestStop } from "./importStateManager";

let wss: WebSocketServer;

export const createWebSocketServer = (app: Express): HttpServer => {
  const server = createServer(app);

  wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("✅ WebSocket client connected");

    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "stop_import" && data.importId) {
          console.log(`Demande d'arrêt reçue pour l'import: ${data.importId}`);
          requestStop(data.importId);
        }
      } catch (e) {
        console.error("Erreur lors du parsing du message WebSocket:", e);
      }
    });

    ws.on("close", () => {
      console.log("❌ WebSocket client disconnected");
    });

    ws.on("error", console.error);
  });

  console.log("🚀 WebSocket server is ready.");
  return server;
};

// Exporte une fonction pour récupérer l'instance du serveur WebSocket.
export const getWss = (): WebSocketServer => {
  if (!wss) {
    throw new Error("WebSocket server has not been initialized.");
  }
  return wss;
};
