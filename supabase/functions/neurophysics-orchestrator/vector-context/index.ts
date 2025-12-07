import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Fonction Edge pour la gestion du contexte vectoriel
serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", // Utilisation du rôle service pour l'accès à la DB
    );

    const { query, context_id } = await req.json();

    // 1. Simulation de la recherche vectorielle dans la table 'documents'
    // Dans un cas réel, on utiliserait pg_vector et match_documents
    const { data: documents, error: docError } = await supabaseClient
      .from("documents")
      .select("content, metadata")
      .limit(3);

    if (docError) throw docError;

    // 2. Simulation de la récupération des résultats précédents
    const { data: history, error: histError } = await supabaseClient
      .from("session_history")
      .select("request, result")
      .eq("context_id", context_id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (histError) throw histError;

    const context = {
      relevant_documents: documents || [],
      previous_results: history || [],
      context_id: context_id,
      query: query,
    };

    return new Response(JSON.stringify(context), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
