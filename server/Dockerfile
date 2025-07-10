# --- Étape 1 : Builder l'application ---
# Utilise une image Node.js avec les outils nécessaires pour la compilation
FROM node:20-alpine AS builder

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie le package.json et package-lock.json (ou yarn.lock)
# pour installer les dépendances en premier. Cela optimise la mise en cache de Docker.
COPY package*.json ./

# AJOUTEZ CETTE LIGNE POUR METTRE À JOUR NPM
# Cela garantira que la version de npm utilisée pour installer les dépendances est la plus récente.
RUN npm install -g npm@latest

# Installe les dépendances
# Utilisez 'npm ci' pour des builds reproductibles si vous avez un package-lock.json
RUN npm install

# Copie le reste du code source
# Comme c'est un monorepo, assurez-vous que les chemins sont corrects si d'autres packages sont nécessaires.
# Pour l'instant, je suppose que tout ce qui est nécessaire pour 'server' est dans ce dossier.
COPY . .

# Copier le reste des fichiers de l'application
COPY . .

# Copier et rendre notre script d'entrée exécutable DANS le conteneur
# C'est une bonne pratique pour s'assurer des permissions

# Si vous avez des fichiers TypeScript à compiler en JavaScript statique
# avant le runtime, c'est ici qu'on le ferait.
# Votre script 'start' utilise 'tsx', qui compile à la volée, donc pas besoin de 'npm run build' ici.
# Si 'tsx' est une dépendance de dev, assurez-vous qu'elle est bien installée et disponible.
# RUN npm run build # Uncomment and adapt if you decide to have a separate build step for TS compilation

# --- Étape 2 : Créer l'image finale de production ---
# Utilise une image Node.js plus petite pour l'exécution en production
FROM node:20-alpine AS runner

# Définit le répertoire de travail
WORKDIR /app

# Copie uniquement les dépendances de production et le code de l'application buildé depuis l'étape 'builder'
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Expose le port sur lequel votre application Express écoute.
# D'après votre .env, c'est le port 3310.
EXPOSE 3310

COPY --from=builder /app/entrypoint.sh .
RUN chmod +x ./entrypoint.sh

# Définit le point d'entrée et la commande par défaut
ENTRYPOINT ["./entrypoint.sh"]

# Commande pour démarrer l'application
# 'tsx ./src/app.ts' est votre script de démarrage défini dans package.json
CMD ["npm", "start"]

# Note sur les variables d'environnement :
# Les variables de votre fichier .env ne sont PAS copiées directement dans l'image.
# Elles seront fournies au conteneur au moment de son exécution, généralement via Docker Compose
# ou votre pipeline CI/CD pour la production.