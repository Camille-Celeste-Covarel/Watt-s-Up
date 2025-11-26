#!/bin/sh

# Arrête le script si une commande échoue
set -e

cd /app/server

echo "--- Debugging /app/public/uploads directory ---"

if [ -d "/app/public/uploads" ]; then
  echo "/app/public/uploads exists."
  ls -ld /app/public/uploads
else
  echo "/app/public/uploads DOES NOT exist. Attempting to create it..."
  mkdir -p /app/public/uploads
  ls -ld /app/public/uploads
fi

if [ -d "/app/public/uploads/avatars" ]; then
  echo "/app/public/uploads/avatars exists."
  ls -ld /app/public/uploads/avatars
else
  echo "/app/public/uploads/avatars DOES NOT exist. Attempting to create it..."
  mkdir -p /app/public/uploads/avatars
  ls -ld /app/public/uploads/avatars
fi

echo "Testing write permissions in /app/public/uploads/avatars..."
touch /app/public/uploads/avatars/test_write_permission.txt
if [ -f "/app/public/uploads/avatars/test_write_permission.txt" ]; then
  echo "Write permission OK in /app/public/uploads/avatars."
  rm /app/public/uploads/avatars/test_write_permission.txt
else
  echo "Write permission FAILED in /app/public/uploads/avatars."
fi

echo "--- End Debugging /app/public/uploads directory ---"

echo "Running database migrations..."
npm run migrate:prod
echo "Migrations finished."

echo "Running database seeders..."
npm run db:seed:prod
echo "Seeders finished."

echo "Starting the application..."

exec "$@"
