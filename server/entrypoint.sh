#!/bin/sh

set -e

echo "Running database migrations..."
npm run migrate:prod --workspace=server
echo "Migrations finished."

echo "Running database seeders..."
npm run db:seed:prod --workspace=server
echo "Seeders finished."

echo "Starting the application..."

exec "$@"
