#!/bin/sh

set -e

# Change le répertoire de travail vers le dossier du serveur
cd /app/server

echo "Running database migrations..."
npx sequelize-cli db:migrate
echo "Migrations finished."

echo "Running database seeders..."
npx sequelize-cli db:seed:all
echo "Seeders finished."

echo "Starting the application..."

exec "$@"
