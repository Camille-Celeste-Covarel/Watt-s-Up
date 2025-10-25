#!/bin/sh

# Arrête le script si une commande échoue
set -e

# Se place dans le répertoire du serveur
cd /app/server

# Affiche un message pour indiquer que les migrations commencent
echo "Running database migrations..."
npm run migrate:prod
echo "Migrations finished."

# Affiche un message pour indiquer que les seeders commencent
echo "Running database seeders..."
npm run db:seed:prod
echo "Seeders finished."

# Affiche un message avant de lancer l'application
echo "Starting the application..."

# 'exec "$@"' exécute la commande passée en argument au script (le CMD du Dockerfile).
exec "$@"
