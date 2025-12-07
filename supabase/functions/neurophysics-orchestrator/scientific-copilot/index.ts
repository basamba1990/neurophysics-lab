import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.38.5/mod.ts";

// Fonction Edge pour le Scientific Copilot
serve(async (req) => {
  try {
    const { request, context } = await req.json();
    
    // Initialisation du client OpenAI (utilise la clé d'environnement)
    const openai = new OpenAI();

    const systemPrompt = `
      Vous êtes le Scientific Copilot, un assistant expert en neurophysique et en simulation PINN.
      Analysez la requête de l'utilisateur et le contexte fourni pour générer une réponse concise et technique.
      Contexte: ${JSON.stringify(context)}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modèle rapide pour les fonctions Edge
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: request },
      ],
      max_tokens: 512,
    });

    const result = {
      status: "success",
      response: completion.choices[0].message.content,
      model: "gpt-4o-mini",
    };

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
