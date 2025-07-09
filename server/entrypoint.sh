#!/bin/sh

# Arrête le script si une commande échoue
set -e

# Affiche un message pour indiquer que les migrations commencent
echo "Running database migrations..."

# Exécute la commande de migration de Sequelize
# 'npx' est utilisé pour exécuter le binaire de sequelize-cli installé dans node_modules
npx sequelize-cli db:migrate

# Affiche un message avant de lancer l'application
echo "Migrations finished. Starting the application..."

# 'exec "$@"' exécute la commande passée en argument au script.
# Dans notre cas, ce sera la commande pour démarrer le serveur (ex: "npm start").
exec "$@"