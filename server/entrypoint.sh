#!/bin/sh

# Arrête le script si une commande échoue
set -e

# Se place dans le répertoire du serveur
cd /app/server

# --- DEBUGGING UPLOADS DIRECTORY ---
echo "--- Debugging /app/public/uploads directory ---"

# Check if /app/public/uploads exists
if [ -d "/app/public/uploads" ]; then
  echo "/app/public/uploads exists."
  ls -ld /app/public/uploads
else
  echo "/app/public/uploads DOES NOT exist. Attempting to create it..."
  mkdir -p /app/public/uploads
  ls -ld /app/public/uploads
fi

# Check if /app/public/uploads/avatars exists
if [ -d "/app/public/uploads/avatars" ]; then
  echo "/app/public/uploads/avatars exists."
  ls -ld /app/public/uploads/avatars
else
  echo "/app/public/uploads/avatars DOES NOT exist. Attempting to create it..."
  mkdir -p /app/public/uploads/avatars
  ls -ld /app/public/uploads/avatars
fi

# Test write permissions in /app/public/uploads/avatars
echo "Testing write permissions in /app/public/uploads/avatars..."
touch /app/public/uploads/avatars/test_write_permission.txt
if [ -f "/app/public/uploads/avatars/test_write_permission.txt" ]; then
  echo "Write permission OK in /app/public/uploads/avatars."
  rm /app/public/uploads/avatars/test_write_permission.txt
else
  echo "Write permission FAILED in /app/public/uploads/avatars."
fi

echo "--- End Debugging /app/public/uploads directory ---"
# --- END DEBUGGING ---

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
