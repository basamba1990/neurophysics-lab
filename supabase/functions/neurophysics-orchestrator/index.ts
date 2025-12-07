import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Fonction Edge pour l'orchestrateur principal
serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      },
    );

    const { request, context_id } = await req.json();

    // 1. Appel à la fonction vector-context pour récupérer le contexte
    const contextResponse = await supabaseClient.functions.invoke(
      "neurophysics-orchestrator/vector-context",
      { body: { query: request, context_id } },
    );
    const context = contextResponse.data;

    // 2. Logique de décision simplifiée (pour l'exemple)
    let action = "copilot";
    if (request.toLowerCase().includes("pinn") || request.toLowerCase().includes("simulation")) {
      action = "backend_pinn_task";
    }

    let result;
    if (action === "copilot") {
      // 3. Appel à la fonction scientific-copilot
      const copilotResponse = await supabaseClient.functions.invoke(
        "neurophysics-orchestrator/scientific-copilot",
        { body: { request, context } },
      );
      result = copilotResponse.data;
    } else {
      // 3. Simulation d'un appel au backend Python via une API externe
      result = {
        status: "success",
        message: `Requête redirigée vers le backend Python pour la tâche: ${action}`,
        details: { request, context },
      };
    }

    return new Response(JSON.stringify(result), {
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
