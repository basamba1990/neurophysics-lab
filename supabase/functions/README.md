# Supabase Edge Functions pour NeuroPhysics R&D Accelerator

Ce répertoire contient les fonctions Edge déployées sur Supabase pour gérer les opérations critiques et à faible latence.

## Fonctions

1.  **neurophysics-orchestrator** (`neurophysics-orchestrator/index.ts`)
    *   **Rôle:** Point d'entrée principal pour l'orchestration IA. Il reçoit les requêtes utilisateur, gère la logique de décision et distribue les appels aux autres fonctions Edge ou au backend Python.

2.  **scientific-copilot** (`neurophysics-orchestrator/scientific-copilot/index.ts`)
    *   **Rôle:** Fournit des capacités de Copilot basées sur un modèle de langage (LLM). Il est utilisé pour la génération de code, la synthèse de données et les réponses contextuelles.

3.  **vector-context** (`neurophysics-orchestrator/vector-context/index.ts`)
    *   **Rôle:** Gère l'accès à la base de données vectorielle (via `pg_vector` dans PostgreSQL/Supabase) pour récupérer le contexte pertinent (documents, historique de session) nécessaire à l'orchestrateur.

## Déploiement

Ces fonctions sont déployées via l'outil CLI de Supabase. La configuration est définie dans `supabase/functions/supabase/config.toml`.

## Dépendances

Les fonctions utilisent Deno et les dépendances sont gérées via un fichier `import_map.json` (non inclus ici mais nécessaire pour un déploiement réel).
Elles nécessitent également les variables d'environnement `SUPABASE_URL`, `SUPABASE_ANON_KEY`, et `SUPABASE_SERVICE_ROLE_KEY`.
