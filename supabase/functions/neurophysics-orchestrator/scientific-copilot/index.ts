import OpenAI from "npm:openai@4.8.0";

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json();
    const request = body.request;
    const context = body.context;

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not set in environment");
    }

    const client = new OpenAI({ apiKey: openaiKey });

    const systemPrompt = `
Vous êtes le Scientific Copilot, un assistant expert en neurophysique et en simulation PINN.
Analysez la requête de l'utilisateur et le contexte fourni pour générer une réponse concise et technique.
Contexte: ${JSON.stringify(context)}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: String(request) },
      ],
      max_tokens: 512,
    });

    const message = completion.choices?.[0]?.message?.content ?? "";

    const result = {
      status: "success",
      response: message,
      model: "gpt-4o-mini",
    };

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
