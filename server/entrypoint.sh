#!/bin/sh

set -e

cd /app

echo "Running database migrations..."
npm run migrate:prod --workspace=@js-monorepo/server
echo "Migrations finished."

echo "Running database seeders..."
npm run db:seed:prod --workspace=@js-monorepo/server
echo "Seeders finished."

echo "Starting the application..."

exec "$@"