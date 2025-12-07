-- Migration pour ajouter l'extension pg_vector et les tables nécessaires
-- Date: 2024-01-01 00:00:00

-- 1. Activer l'extension pg_vector pour la recherche vectorielle
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Créer la table pour stocker les documents et leurs embeddings
CREATE TABLE IF NOT EXISTS documents (
    id bigserial PRIMARY KEY,
    content text,
    metadata jsonb,
    embedding vector(1536) -- Taille typique pour OpenAI embeddings
);

-- 3. Créer la table pour l'historique des sessions (contexte)
CREATE TABLE IF NOT EXISTS session_history (
    id bigserial PRIMARY KEY,
    context_id uuid NOT NULL,
    user_id uuid,
    request text NOT NULL,
    result text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Créer un index pour optimiser la recherche par context_id
CREATE INDEX IF NOT EXISTS idx_session_history_context_id ON session_history (context_id);

-- 5. Créer un index HNSW (Hierarchical Navigable Small World) pour la recherche vectorielle rapide
-- (Nécessite un grand nombre de données pour être efficace, mais bonne pratique)
-- CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);
