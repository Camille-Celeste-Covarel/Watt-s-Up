# Watts'Up - Documentation Technique Complète

Watts'Up est une application web complète de gestion de bornes de recharge pour véhicules électriques. Elle est conçue comme un monorepo, comprenant un backend Node.js/Express et un frontend React.

Ce document fournit une analyse détaillée de l'architecture, des fonctionnalités, de l'API et du schéma de données du projet.

## 🏛️ Architecture Approfondie

### Backend (`/server`)
Le backend suit une architecture modulaire et orientée services, conçue pour la maintenabilité et la scalabilité.

#### Le Pattern "Actions"
Le projet utilise un pattern de conception où la logique de traitement des requêtes est regroupée par ressource dans des fichiers "Actions" (ex: `userActions.ts`, `stationsActions.ts`) situés dans le dossier `/modules`.
- **Rôle** : Chaque fonction dans un fichier "Action" est un `RequestHandler` d'Express qui agit comme un **contrôleur**. Elle orchestre le flux de la requête : validation, appel aux services, et formatage de la réponse.
- **Avantages** : Ce pattern centralise la logique liée à une ressource, rendant le `router.ts` très lisible et déclaratif.

#### Flux d'un import CSV : de la requête à la base de données
Le système d'import est une des fonctionnalités les plus complexes et robustes du projet.
1.  **Réception (Controller)** : Le `importController` reçoit le fichier via `multer` et le stocke temporairement. Il lance ensuite le traitement en arrière-plan et répond immédiatement au client (202 Accepted) pour ne pas bloquer la requête.
2.  **Streaming & Parsing (Service)** : Le fichier est lu en streaming avec `fast-csv` pour gérer de gros volumes de données sans saturer la mémoire.
3.  **Transformation (Data-Processing)** : Chaque ligne du CSV passe par le `dataTransformer.ts`. C'est le cœur de la logique :
    - **Normalisation** : Les données sont nettoyées, formatées et typées.
    - **Validation** : Les champs critiques (ID, coordonnées) sont vérifiés. Une ligne invalide est rejetée et loguée.
    - **Enrichissement** : Le `importCache` est utilisé pour `findOrCreate` les entités liées (opérateurs, prises, etc.) à la volée, évitant des requêtes BDD redondantes.
4.  **Consolidation & Upsert (Controller)** : Les données transformées sont regroupées par station. Le `importController` effectue ensuite des opérations `findOrCreate` et `update` dans des transactions Sequelize pour garantir l'intégrité des données.
5.  **Feedback en temps réel (WebSocket)** : L'état de l'import (progression, erreurs) est communiqué au client en temps réel via un service de WebSocket (`importNotifier.ts`).

#### Sécurité & Middlewares
- **Authentification** : Le middleware `isConnected` valide le token JWT présent dans le cookie `httpOnly` à chaque requête sur une route protégée.
- **Autorisation** : Le middleware `isAdmin` vérifie le rôle de l'utilisateur pour l'accès aux routes d'administration.
- **Sécurité** : `express-rate-limit` est utilisé pour prévenir les attaques par force brute sur les routes sensibles.

### Frontend (`/client`)
L'application client est une SPA moderne conçue pour être performante et offrir une excellente expérience utilisateur.

#### Gestion de l'état
- **Zustand** : Utilisé pour la gestion de l'état global et partagé (utilisateur authentifié, état WebSocket).
- **État local** : Géré avec les hooks React (`useState`, `useReducer`).

#### Data Fetching & Cache
- **React Query (`@tanstack/react-query`)** : Toute la communication avec l'API est gérée par React Query, qui offre un cache intelligent, des mises à jour en arrière-plan et une gestion simplifiée des mutations.

#### Routing
- **React Router** : Gère la navigation côté client, incluant des routes protégées basées sur l'état d'authentification.

---

## 🗺️ Endpoints de l'API
Voici un aperçu des routes principales de l'API, définies dans `server/src/router.ts`.

### Routes Publiques
| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Connecte un utilisateur et retourne un cookie `httpOnly` avec le JWT. |
| `POST` | `/auth/register` | Crée un nouvel utilisateur et son véhicule. |
| `POST` | `/auth/forgot-password` | Envoie un email de réinitialisation de mot de passe. |
| `POST` | `/auth/reset-password` | Réinitialise le mot de passe avec un token valide. |
| `GET` | `/stations` | Récupère la liste de toutes les stations. |
| `GET` | `/stations/:id` | Récupère les détails d'une station spécifique. |
| `GET` | `/plugs` | Récupère la liste de tous les types de prises disponibles. |

### Routes Protégées (Authentification requise)
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/auth/check` | Vérifie la validité du token et retourne les informations de l'utilisateur. |
| `POST`| `/auth/logout` | Déconnecte l'utilisateur en supprimant le cookie d'authentification. |
| `GET` | `/users/me` | Récupère le profil complet de l'utilisateur connecté (avec ses véhicules). |
| `PUT` | `/users/me` | Met à jour les informations du profil de l'utilisateur. |
| `PUT` | `/users/me/avatar` | Met à jour l'avatar de l'utilisateur. |
| `PUT` | `/vehicules/:id` | Met à jour les informations d'un véhicule appartenant à l'utilisateur. |
| `POST`| `/contact` | Envoie un message via le formulaire de contact (avec limite de débit). |
| `GET` | `/books` | Récupère l'historique des réservations de l'utilisateur. |
| `POST`| `/reservations` | Crée une nouvelle réservation. |

### Routes Administrateur (Admin requis)
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | Liste tous les utilisateurs. |
| `PUT` | `/users/:id` | Modifie un utilisateur. |
| `DELETE`| `/users/:id` | Supprime un utilisateur. |
| `POST`| `/stations` | Ajoute une nouvelle station. |
| `PUT` | `/stations/:id` | Modifie une station. |
| `DELETE`| `/stations/:id` | Supprime une station. |
| `POST`| `/import/csv` | Lance l'import d'un fichier CSV de stations. |
| `GET` | `/import/history` | Récupère l'historique des 5 derniers imports. |

---

## 🗃️ Schéma de la Base de Données
La persistance des données est gérée par **Sequelize** avec une base de données **PostgreSQL**. Voici les modèles principaux :

- **User**: Stocke les informations des utilisateurs, leurs identifiants, leur mot de passe haché (`bcrypt`) et leur rôle (`is_admin`).
- **Vehicule**: Lié à un `User`, représente un véhicule avec sa plaque, son type de prise, etc.
- **Station**: Contient toutes les informations sur une station de recharge (adresse, coordonnées géographiques, nombre de points de charge...).
- **Terminal**: Représente un point de charge (PDC) spécifique au sein d'une `Station`. Une station a plusieurs terminaux.
- **Plug**: Décrit un type de prise (ex: "Type 2", "Chademo"). Un terminal peut avoir plusieurs types de prises (relation Many-to-Many via la table `TerminalPlug`).
- **Book**: Enregistre une réservation faite par un `User` sur un `Terminal` pour une période donnée.
- **ImportLog**: Trace chaque opération d'import CSV, en enregistrant le statut (`COMPLETED`, `FAILED`), le nombre de lignes traitées, les erreurs, et un UUID vers le fichier de log détaillé.

---

## ✨ Fonctionnalités Clés

- **Carte interactive** avec affichage des stations (MapLibre GL).
- **Système d'authentification complet** (inscription, connexion, JWT, rôles).
- **Gestion de profil utilisateur** avec modification des informations et upload d'avatar.
- **CRUD complet** pour les utilisateurs et les stations (réservé aux administrateurs).
- **Import de données CSV** massif avec traitement asynchrone, validation et feedback en temps réel.
- **Formulaire de contact** avec envoi d'email via `nodemailer`.

---

## 🚀 Technologies

### Backend (Serveur)
- **Framework**: Express.js
- **Langage**: TypeScript (exécuté avec `tsx`)
- **Base de données**: PostgreSQL
- **ORM**: Sequelize (avec `sequelize-cli` pour les migrations)
- **Communication en temps réel**: WebSockets (`ws`)
- **Authentification**: JWT (JSON Web Tokens)
- **Gestion des imports**: `fast-csv` pour le parsing de fichiers CSV

### Frontend (Client)
- **Framework**: React 19
- **Bundler**: Vite
- **Langage**: TypeScript
- **Routing**: React Router
- **Gestion d'état**: Zustand
- **Cartographie**: MapLibre GL
- **Requêtes API**: React Query

### Outils & DevOps
- **Gestionnaire de paquets**: npm Workspaces
- **Qualité de code**: Biome (linter et formateur)
- **Conteneurisation**: Docker & Docker Compose
- **Intégration continue**: GitHub Actions

---

## 🛠️ Installation et Configuration

### Prérequis
- [Node.js](https://nodejs.org/) (v18+ recommandé)
- [Docker](https://www.docker.com/) (pour la base de données PostgreSQL)
- Un client `git`

### 1. Cloner le projet
```bash
git clone <URL_DU_REPO>
cd p3
```

### 2. Installer les dépendances
Cette commande installe les dépendances pour la racine, le client et le serveur en une seule fois grâce aux workspaces npm.
```bash
npm install
```

### 3. Lancer la base de données
Le projet utilise Docker pour lancer une base de données PostgreSQL.
```bash
docker-compose up -d
```

### 4. Configurer l'environnement du serveur
Le serveur nécessite un fichier de configuration d'environnement.

a. Copiez le fichier d'exemple :
```bash
cp server/.env.development.sample server/.env.development.local
```

b. Modifiez `server/.env.development.local` avec vos propres valeurs. Les valeurs par défaut pour la base de données correspondent à celles du `docker-compose.yml`.

```dotenv
# --- .env.development.local ---

# Configuration de la base de données
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=p3
DB_USER=p3
DB_PASSWORD=You're passwd # Remplacez par votre mot de passe

# Mode Synchronisation Sequelize
SEQSYNC_MODE=alter

# Configuration des logs
LOG_LEVEL=DEBUG

# Configuration du serveur
PORT=3310

# Configuration email (pour l'envoi de mails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=adresse.exemple@gmail.com
EMAIL_PASS=mot-de-passe

# URL du client (pour la configuration CORS)
CLIENT_URL=http://localhost:3000

PROJECT_NAME_SPECIFIC_NAME=Watts'Up
```

### 5. Appliquer les migrations de la base de données
Cette commande initialise le schéma de la base de données.
```bash
npm run db:migrate
```

---

## 🚀 Utilisation

### Lancer l'environnement de développement
Pour lancer le serveur backend et le client frontend simultanément :
```bash
npm run dev
```
- Le client sera accessible sur `http://localhost:3000`.
- Le serveur sera accessible sur `http://localhost:3310`.

### Lancer uniquement le serveur
```bash
npm run dev:server
```

### Lancer uniquement le client
```bash
npm run dev:client
```

---

## 📜 Scripts Disponibles

Voici un résumé des scripts `npm` les plus utiles à la racine du projet :

| Commande | Description |
|---|---|
| `npm run dev` | Lance le client et le serveur en mode développement. |
| `npm run build` | Construit les projets client et serveur pour la production. |
| `npm start` | Démarre uniquement le serveur en mode production. |
| `npm test` | Lance les tests pour les deux workspaces. |
| `npm run db:migrate` | Applique les migrations Sequelize sur la base de données. |
| `npm run db:seed` | Peuple la base de données avec des données de test (si des seeders existent). |
| `npm run check` | Vérifie la qualité du code avec Biome. |
| `npm run check:fix` | Corrige automatiquement les problèmes de formatage et de style. |
| `npm run clean` | Nettoie les modules `node_modules` de tous les workspaces. |
