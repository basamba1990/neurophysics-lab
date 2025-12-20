import { createClient } from "npm:@supabase/supabase-js@2.42.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  console.log("VectorContext: Requête reçue.");
  
  // GESTION CORS OBLIGATOIRE
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 204 })
  }

  try {
    // Utilisation du Service Role Key pour garantir l'accès aux tables
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    console.log("VectorContext: Client Supabase initialisé avec Service Role Key.");

    const body = await req.json();
    console.log("VectorContext: Body JSON validé.");
    
    // Validation stricte (minimaliste)
    if (!body.query || !body.context_id) {
        throw new Error("Validation Error: 'query' or 'context_id' field is missing.");
    }
    
    const { query, context_id } = body;

    // 1. Recherche de documents (simulée ici sans embedding)
    console.log("VectorContext: Recherche de documents pertinents.");
    const { data: documents, error: docError } = await supabaseClient
      .from("documents")
      .select("content, metadata")
      .limit(3);

    if (docError) {
        console.error(`VectorContext: Erreur DB documents: ${docError.message}`);
        throw docError;
    }

    // 2. Recherche d'historique de session
    console.log(`VectorContext: Recherche d'historique pour context_id: ${context_id}`);
    const { data: history, error: histError } = await supabaseClient
      .from("session_history")
      .select("request, result")
      .eq("context_id", context_id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (histError) {
        console.error(`VectorContext: Erreur DB historique: ${histError.message}`);
        throw histError;
    }

    const context = {
      relevant_documents: documents || [],
      previous_results: history || [],
      context_id: context_id,
      query: query,
    };
    
    console.log("VectorContext: Contexte compilé et envoyé.");

    return new Response(JSON.stringify(context), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error(`VectorContext: Erreur critique: ${error?.message ?? String(error)}`);
    return new Response(JSON.stringify({ error: error?.message ?? String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
