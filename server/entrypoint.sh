#!/bin/sh

set -e

cd /app/server

echo "Running database migrations..."
npm run migrate:prod
echo "Migrations finished."

echo "Running database seeders..."
npm run db:seed:prod
echo "Seeders finished."

echo "Starting the application..."

exec "$@"
