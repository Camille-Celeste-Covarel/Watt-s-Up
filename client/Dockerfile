# P3/client/Dockerfile

# --- Étape 1 : Builder l'application React ---
FROM node:20-alpine AS builder

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie les fichiers package.json et package-lock.json du frontend
# Le contexte est maintenant la racine P3, donc on doit spécifier le chemin relatif au contexte.
COPY client/package*.json ./client/

# Copie le dossier des types partagés depuis le backend
# C'est la clé pour résoudre l'erreur TS2307
COPY server/src/types/models ./server/src/types/models

# Installe les dépendances du frontend
# Change le répertoire de travail pour installer les dépendances du frontend
WORKDIR /app/client
RUN npm install

# Copie le reste du code source du frontend
# (le . ici fait référence à /app/client)
COPY client/. ./

# Exécute le script de build de Vite
# Maintenant, les types du backend sont accessibles sous /app/server/src/types
RUN npm run build

# --- Étape 2 : Servir l'application avec Nginx ---
FROM nginx:alpine AS runner

# Copie les fichiers buildés de l'étape 'builder' vers le répertoire de service de Nginx
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Expose le port par défaut de Nginx (80)
EXPOSE 80

# La commande par défaut de Nginx est de démarrer le serveur
CMD ["nginx", "-g", "daemon off;"]