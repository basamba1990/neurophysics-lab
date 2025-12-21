-- Migration: add vector extension, documents and session_history tables, indexes, and enable RLS + policies
BEGIN;

-- 1. Ensure pg_vector (vector) extension exists
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id bigserial PRIMARY KEY,
  content text,
  metadata jsonb,
  embedding vector(1536)
);

-- 3. Create session_history table
CREATE TABLE IF NOT EXISTS public.session_history (
  id bigserial PRIMARY KEY,
  context_id uuid NOT NULL,
  user_id uuid,
  request text NOT NULL,
  result text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Index on context_id
CREATE INDEX IF NOT EXISTS idx_session_history_context_id ON public.session_history (context_id);

-- 5. (Optional) HNSW index for documents embedding - using vector extension's hnsw
-- Note: creating hnsw index can be heavy; uncomment if desired
-- CREATE INDEX IF NOT EXISTS idx_documents_embedding_hnsw ON public.documents USING hnsw (embedding vector_cosine_ops);

-- 6. Enable RLS on session_history and documents
ALTER TABLE public.session_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 7. Policies: assume protection by user_id for session_history and public read for documents with restricted writes
-- session_history policies: only authenticated users can access their own session rows
CREATE POLICY session_history_select_policy ON public.session_history
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY session_history_insert_policy ON public.session_history
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY session_history_update_policy ON public.session_history
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY session_history_delete_policy ON public.session_history
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- documents policies: allow authenticated users to read documents; only service_role can insert/update/delete by default
CREATE POLICY documents_select_for_authenticated ON public.documents
  FOR SELECT TO authenticated
  USING (true);

-- If you want authenticated users to insert their own documents and tag with user_id in metadata, adapt policy accordingly.

COMMIT;
