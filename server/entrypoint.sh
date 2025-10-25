#!/bin/sh

# Arrête le script si une commande échoue
set -e

# Se place dans le répertoire du serveur pour que les commandes comme sequelize-cli trouvent leurs fichiers de configuration
cd /app/server

echo "Running database migrations..."
# Exécute les migrations pour l'environnement de production
# On définit directement la variable d'environnement NODE_ENV sans passer par cross-env
NODE_ENV=production npx sequelize-cli db:migrate
echo "Migrations finished."

echo "Running database seeders..."
# Exécute les seeders pour l'environnement de production
NODE_ENV=production npx sequelize-cli db:seed:all
echo "Seeders finished."

echo "Starting the application..."
# Exécute la commande de démarrage de l'application pour la production
# On remplace la commande `npm run start` qui utilisait cross-env
exec env NODE_ENV=production npx tsx ./src/main.ts
