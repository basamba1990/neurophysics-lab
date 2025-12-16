import { createClient } from "npm:@supabase/supabase-js@2.42.0";

Deno.serve(async (req: Request) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { query, context_id } = await req.json();

    const { data: documents, error: docError } = await supabaseClient
      .from("documents")
      .select("content, metadata")
      .limit(3);

    if (docError) throw docError;

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
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message ?? String(error) }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
