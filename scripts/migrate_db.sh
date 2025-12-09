# Fichier: scripts/migrate_db.sh (Version Corrigée pour Production)
# Script pour exécuter les migrations de base de données de manière atomique.
# Ce script doit être exécuté dans le pipeline CI/CD AVANT le déploiement de l'API.

#!/bin/bash

# Arrêter l'exécution si une commande échoue
set -e

echo "--- Démarrage des Migrations de Base de Données ---"

# 1. Vérifier la présence de l'outil de migration (ex: Supabase CLI ou un outil Python)
if ! command -v supabase &> /dev/null
then
    echo "Erreur: Supabase CLI n'est pas installé. Veuillez l'installer ou utiliser l'outil de migration Python du projet."
    exit 1
fi

# 2. Définir le chemin vers le répertoire des migrations
MIGRATIONS_DIR="./supabase/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "Erreur: Répertoire des migrations non trouvé à $MIGRATIONS_DIR"
    exit 1
fi

# 3. Exécuter les migrations
# Utilisation de 'supabase db diff' ou 'supabase db push' selon l'outil.
# Ici, nous supposons l'utilisation de l'outil de migration Python du projet ou Supabase CLI.

# Option 1: Utilisation de l'outil de migration Python (si le projet en a un)
# echo "Exécution des migrations via l'outil Python..."
# python -m database.migrations up

# Option 2: Utilisation de Supabase CLI (pour les projets Supabase)
echo "Exécution des migrations via Supabase CLI..."
# Assurez-vous que les variables d'environnement (SUPABASE_URL, SUPABASE_SERVICE_KEY) sont définies
# dans l'environnement d'exécution du CI/CD.
supabase db push --db-url "$SUPABASE_URL" --migrations-path "$MIGRATIONS_DIR"

echo "--- Migrations de Base de Données Terminées avec Succès ---"
