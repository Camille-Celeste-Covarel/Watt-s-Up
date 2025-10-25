#!/bin/sh

# Arrête le script si une commande échoue
set -e

# Affiche un message pour indiquer que les migrations commencent
echo "Running database migrations..."
# Utilise le script npm du workspace pour s'assurer du bon contexte
npm run migrate:prod --workspace=server
echo "Migrations finished."

# Affiche un message pour indiquer que les seeders commencent
echo "Running database seeders..."
# Utilise le script npm du workspace pour s'assurer du bon contexte
npm run db:seed:prod --workspace=server
echo "Seeders finished."

# Affiche un message avant de lancer l'application
echo "Starting the application..."

# 'exec "$@"' exécute la commande passée en argument au script (CMD du Dockerfile).
exec "$@"
