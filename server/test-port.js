const dotenv = require("dotenv");
const path = require("node:path");
const envPath = path.resolve(__dirname, "./.env.development.local");
dotenv.config({ path: envPath });

const http = require("node:http");

const PORT = process.env.PORT;

if (!PORT) {
  console.error("ERREUR FATALE : Le port n'est pas défini dans le .env !");
  process.exit(1);
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
const serverCallback = (req, res) => {
  console.log(
    `[Test Server] Requête reçue sur le port ${PORT} ! URL: ${req.url}`,
  );
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Le serveur de test fonctionne !\n");
};

const server = http.createServer(serverCallback);

server.listen(PORT, "localhost", () => {
  console.log(`[Test Server] J'écoute UNIQUEMENT sur http://localhost:${PORT}`);
  console.log("Ouvrez un navigateur à cette adresse pour tester.");
});
