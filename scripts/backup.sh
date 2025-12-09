# Fichier: scripts/backup.sh (Version Corrigée pour Production)
# Script pour effectuer une sauvegarde de la base de données.
# Doit être exécuté régulièrement (e.g., via Cron Job ou GitHub Actions).

#!/bin/bash

# Arrêter l'exécution si une commande échoue
set -e

# 1. Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Assurez-vous que les variables d'environnement de connexion à la DB sont définies
if [ -z "$SUPABASE_URL" ]; then
    echo "Erreur: SUPABASE_URL n'est pas défini."
    exit 1
fi

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p "$BACKUP_DIR"

echo "--- Démarrage de la Sauvegarde de la Base de Données ---"

# 2. Exécution de la sauvegarde (utilisation de pg_dump pour PostgreSQL)
# La variable SUPABASE_URL doit contenir l'URL de connexion complète (y compris le mot de passe).
# Exemple: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]

# Utilisation de pg_dump via Docker ou directement si installé
if command -v pg_dump &> /dev/null
then
    echo "Utilisation de pg_dump local..."
    pg_dump "$SUPABASE_URL" > "$BACKUP_FILE"
elif command -v docker &> /dev/null
then
    echo "Utilisation de pg_dump via Docker..."
    docker run --rm -e PGPASSWORD="$DB_PASSWORD" postgres:latest pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"
else
    echo "Avertissement: pg_dump non trouvé. Utilisation de Supabase CLI pour un dump de schéma uniquement."
    supabase db dump --schema-only > "$BACKUP_DIR/db_schema_$TIMESTAMP.sql"
    echo "Sauvegarde du schéma uniquement terminée."
    exit 0
fi

# 3. Vérification et Nettoyage
if [ -f "$BACKUP_FILE" ]; then
    echo "Sauvegarde réussie: $BACKUP_FILE (Taille: $(du -h "$BACKUP_FILE" | awk '{print $1}'))"
    
    # Optionnel: Télécharger la sauvegarde vers un stockage distant (S3, GCS, etc.)
    # aws s3 cp "$BACKUP_FILE" "s3://votre-bucket-sauvegarde/"
    
    # Optionnel: Supprimer les anciennes sauvegardes (e.g., garder les 7 derniers jours)
    # find "$BACKUP_DIR" -type f -mtime +7 -delete
else
    echo "Erreur: La sauvegarde a échoué."
    exit 1
fi

echo "--- Sauvegarde Terminée ---"
