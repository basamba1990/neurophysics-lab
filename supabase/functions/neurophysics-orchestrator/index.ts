import { createClient } from "npm:@supabase/supabase-js@2.42.0";

Deno.serve(async (req: Request) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
      },
    );

    const payload = await req.json();
    const request = payload.request;
    const context_id = payload.context_id;

    const contextResponse = await supabaseClient.functions.invoke(
      "neurophysics-orchestrator-vector-context",
      { body: { query: request, context_id } },
    );
    const context = contextResponse.data;

    let action = "copilot";
    if (typeof request === "string" && (request.toLowerCase().includes("pinn") || request.toLowerCase().includes("simulation"))) {
      action = "backend_pinn_task";
    }

    let result;
    if (action === "copilot") {
      const copilotResponse = await supabaseClient.functions.invoke(
        "neurophysics-orchestrator-scientific-copilot",
        { body: { request, context } },
      );
      result = copilotResponse.data;
    } else {
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
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message ?? String(error) }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
