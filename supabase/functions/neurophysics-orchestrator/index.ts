import { createClient } from "npm:@supabase/supabase-js@2.42.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  console.log("Orchestrator: Requête reçue.");
  
  // GESTION CORS OBLIGATOIRE
  if (req.method === 'OPTIONS') {
    console.log("Orchestrator: Réponse OPTIONS (CORS Preflight).");
    return new Response('ok', { headers: corsHeaders, status: 204 })
  }
  
  try {
    // Utilisation du Service Role Key pour les appels internes entre fonctions Edge
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const payload = await req.json();
    console.log("Orchestrator: Body JSON validé.");
    
    // Validation stricte (minimaliste)
    if (!payload.request || typeof payload.request !== 'string') {
        throw new Error("Validation Error: 'request' field is missing or invalid.");
    }
    
    const request = payload.request;
    const context_id = payload.context_id;

    // 1. Récupération du contexte via Edge Function
    console.log("Orchestrator: Appel de 'vector-context'.");
    const contextResponse = await supabaseClient.functions.invoke(
      "neurophysics-orchestrator-vector-context",
      { body: { query: request, context_id } },
    );
    const context = contextResponse.data;
    console.log("Orchestrator: Contexte récupéré.");

    // 2. Moteur de décision (simplifié)
    let action = "copilot";
    if (typeof request === "string" && (request.toLowerCase().includes("pinn") || request.toLowerCase().includes("simulation"))) {
      action = "backend_pinn_task";
    }
    console.log(`Orchestrator: Action décidée: ${action}`);

    // 3. Exécution de la tâche
    let result;
    if (action === "copilot") {
      console.log("Orchestrator: Appel de 'scientific-copilot'.");
      const copilotResponse = await supabaseClient.functions.invoke(
        "neurophysics-orchestrator-scientific-copilot",
        { body: { request, context } },
      );
      result = copilotResponse.data;
      console.log("Orchestrator: Réponse de 'scientific-copilot' reçue.");
    } else {
      result = {
        status: "success",
        message: `Requête redirigée vers le backend Python pour la tâche: ${action}`,
        details: { request, context },
      };
    }

    console.log("Orchestrator: Réponse finale envoyée.");
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error(`Orchestrator: Erreur critique: ${error?.message ?? String(error)}`);
    return new Response(JSON.stringify({ error: error?.message ?? String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
