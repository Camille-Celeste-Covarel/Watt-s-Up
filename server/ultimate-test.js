const http = require("node:http");

const HOST = "localhost";
const PORT = 4002;

/**
 * Ceci est un commentaire JSDoc. Il indique à l'éditeur de code
 * que 'req' est un objet de type IncomingMessage et 'res' est de type ServerResponse.
 * Cela résout les avertissements "Unresolved function" pour writeHead() et end().
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
const serverCallback = (req, res) => {
  console.log(`[TEST ULTIME] ✅ Requête reçue ! URL: ${req.url}`);
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Si vous voyez ce message, le port 4002 est accessible.");
};

const server = http.createServer(serverCallback);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[TEST ULTIME] ❌ ERREUR FATALE : Le port ${PORT} est déjà utilisé par une autre application.`,
    );
    console.error(
      "[TEST ULTIME] ❌ Veuillez arrêter cette application ou choisir un autre port.",
    );
  } else {
    console.error("[TEST ULTIME] ❌ Une erreur de serveur est survenue:", err);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  // L'avertissement "HTTP links are not secure" est ignoré ici car c'est un test local.
  console.log(
    `[TEST ULTIME] ▶️ Serveur de test démarré. J'écoute sur http://${HOST}:${PORT}`,
  );
  // Correction de "Do not use template literals..." en utilisant des apostrophes simples pour une chaîne statique.
  console.log("[TEST ULTIME] ▶️ Ouvrez cette URL dans votre navigateur.");
});
