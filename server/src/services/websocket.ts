import { type Server as HttpServer, createServer } from "node:http";
import type { Express } from "express";
import { type WebSocket, WebSocketServer } from "ws";

let wss: WebSocketServer;

export const createWebSocketServer = (app: Express): HttpServer => {
  // 1. On crée un serveur HTTP standard à partir de notre application Express.
  const server = createServer(app);

  // 2. On crée une instance de WebSocketServer et on l'attache au serveur HTTP.
  wss = new WebSocketServer({ server });

  // 3. On définit ce qui se passe quand un client se connecte.
  wss.on("connection", (ws: WebSocket) => {
    console.log("✅ WebSocket client connected");

    ws.on("close", () => {
      console.log("❌ WebSocket client disconnected");
    });

    ws.on("error", console.error);
  });

  console.log("🚀 WebSocket server is ready.");
  return server;
};

// 4. On exporte une fonction pour récupérer l'instance du serveur WebSocket.
//    Cela permettra à notre contrôleur d'import d'y accéder pour envoyer des messages.
export const getWss = (): WebSocketServer => {
  if (!wss) {
    throw new Error("WebSocket server has not been initialized.");
  }
  return wss;
};
