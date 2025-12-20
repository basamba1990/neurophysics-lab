import OpenAI from "npm:openai@4.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Implémentation du Prompt Tuning Simulé (Spécialisation par l'entrée)
const getSpecializedSystemPrompt = (request: string, context: any): string => {
    let basePrompt = `
    Vous êtes le Scientific Copilot, un assistant expert en neurophysique et en simulation PINN.
    Votre objectif est de fournir une réponse concise, technique et factuelle basée sur la requête et le contexte.
    `;

    // Détection de la tâche pour la spécialisation (simulant le soft prompt)
    const lowerRequest = request.toLowerCase();

    if (lowerRequest.includes("analyse") || lowerRequest.includes("code")) {
        basePrompt = `
        Vous êtes un auditeur de code scientifique. Votre seule tâche est d'analyser la robustesse, la performance et la conformité aux normes scientifiques du code fourni. Répondez uniquement avec une liste numérotée des faiblesses et des améliorations concrètes.
        `;
    } else if (lowerRequest.includes("valide") || lowerRequest.includes("physique") || lowerRequest.includes("equation")) {
        basePrompt = `
        Vous êtes un physicien théoricien. Votre seule tâche est de valider la cohérence des équations et des conditions aux limites fournies par l'utilisateur. Répondez uniquement par OUI/NON et une justification concise de la validité physique.
        `;
    } else if (lowerRequest.includes("modernise") || lowerRequest.includes("fortran")) {
        basePrompt = `
        Vous êtes un expert en modernisation de code Fortran vers Python. Votre tâche est de fournir la meilleure pratique de conversion ou d'expliquer la difficulté de la modernisation demandée.
        `;
    }

    return `${basePrompt}
Contexte: ${JSON.stringify(context)}
`;
};

Deno.serve(async (req: Request) => {
  console.log("Copilot: Requête reçue.");
  
  // GESTION CORS OBLIGATOIRE
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 204 })
  }

  try {
    const body = await req.json();
    console.log("Copilot: Body JSON validé.");
    
    // Validation stricte (minimaliste)
    if (!body.request || !body.context) {
        throw new Error("Validation Error: 'request' or 'context' field is missing.");
    }
    
    const request = body.request;
    const context = body.context;

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not set in environment");
    }

    const client = new OpenAI({ apiKey: openaiKey });

    // Utilisation du prompt spécialisé (Prompt Tuning Simulé)
    const systemPrompt = getSpecializedSystemPrompt(request, context);
    
    console.log("Copilot: Appel de l'API OpenAI.");
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: String(request) },
      ],
      max_tokens: 512,
    });
    
    const message = completion.choices?.[0]?.message?.content ?? "";
    console.log("Copilot: Réponse OpenAI reçue.");

    const result = {
      status: "success",
      response: message,
      model: "gpt-4o-mini",
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error(`Copilot: Erreur critique: ${error?.message ?? String(error)}`);
    return new Response(JSON.stringify({ error: error?.message ?? String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
