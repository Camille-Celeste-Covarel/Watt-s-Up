#!/bin/sh

# Arrête le script si une commande échoue
set -e

# Affiche un message pour indiquer que les migrations commencent
echo "Running database migrations..."
npx sequelize-cli db:migrate
echo "Migrations finished."

# Affiche un message pour indiquer que les seeders commencent
echo "Running database seeders..."
npx sequelize-cli db:seed:all
echo "Seeders finished."

# Affiche un message avant de lancer l'application
echo "Starting the application..."

# 'exec "$@"' exécute la commande passée en argument au script.
# Dans notre cas, ce sera la commande pour démarrer le serveur (ex: "npm start").
exec "$@"
