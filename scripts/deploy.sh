# Fichier: scripts/deploy.sh (Version Corrigée pour Production)
# Script pour automatiser le déploiement complet (migrations, backend, frontend).

#!/bin/bash

# Arrêter l'exécution si une commande échoue
set -e

# 1. Configuration
ENV="production" # Peut être passé en argument

echo "--- Démarrage du Déploiement en Environnement: $ENV ---"

# 2. Exécution des Migrations (CRITIQUE)
echo "Étape 1/3: Exécution des migrations de base de données..."
# Assurez-vous que migrate_db.sh est exécutable et correctement configuré
./scripts/migrate_db.sh

# 3. Déploiement du Backend (Exemple avec Vercel Serverless Functions ou Render)
echo "Étape 2/3: Déploiement du Backend (FastAPI)..."
# Si le backend est déployé sur Vercel via un monorepo
# vercel deploy --prebuilt --prod ./backend

# Si le backend est déployé sur un autre service (Render, Railway)
# Exemple pour Render (nécessite l'API key configurée)
# render-cli deploy --service-id "votre-service-id"

echo "Déploiement du Backend initié. Vérifiez le tableau de bord pour le statut."

# 4. Déploiement du Frontend (Exemple avec Vercel)
echo "Étape 3/3: Déploiement du Frontend (React/Vite) sur Vercel..."
# Vercel détecte automatiquement le frontend et le déploie.
# Cette commande est souvent exécutée par le pipeline CI/CD de Vercel lui-même.
# Si vous exécutez manuellement:
vercel deploy --prod ./frontend

echo "--- Déploiement Terminé ---"
echo "Vérifiez l'état de santé de l'API: curl https://votre-backend-url/health"
echo "Vérifiez le site: https://neurophysics-lab.vercel.app"
