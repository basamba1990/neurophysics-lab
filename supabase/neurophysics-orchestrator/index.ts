import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// --- Configuration ---
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("Missing required environment variables.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Fonctions Utilitaires ---

/**
 * Appelle l'API OpenAI pour déterminer l'intention et les paramètres.
 * @param systemPrompt Le prompt système (le rôle de l'architecte IA).
 * @param userData Les données utilisateur (la requête).
 * @returns L'objet de décision de l'IA.
 */
async function callOpenAI(systemPrompt: string, userData: object): Promise<{ intent: string, params: object }> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "gpt-4", // Utilisation de gpt-4 pour une meilleure fiabilité d'orchestration
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(userData) }
      ],
      temperature: 0.1, // Faible température pour la cohérence scientifique et la prise de décision
      response_format: { type: "json_object" } // Demande de réponse JSON structurée
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    // L'IA doit retourner un objet JSON de la forme { intent: "...", params: { ... } }
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse OpenAI response as JSON:", content);
    throw new Error("Invalid JSON response from AI model.");
  }
}

// --- Prompt Système pour l'Orchestrateur ---
// Ce prompt est une version condensée et orientée action du prompt fourni par l'utilisateur.
const ORCHESTRATOR_SYSTEM_PROMPT = `
Tu es l'Architecte IA du NeuroPhysics Lab. Ton rôle est d'analyser la requête utilisateur et de décider de l'action la plus appropriée à exécuter.
Tu dois retourner un objet JSON strict avec deux clés : "intent" (l'action à prendre) et "params" (les paramètres nécessaires à cette action).

**Intents possibles :**
1. "PINN_SIMULATION": L'utilisateur demande une simulation physique ou une résolution d'équation différentielle nécessitant un calcul intensif.
2. "CODE_ANALYSIS": L'utilisateur demande une analyse, une correction ou une génération de code.
3. "GENERAL_QUERY": L'utilisateur pose une question théorique ou générale ne nécessitant pas de calcul intensif ou d'analyse de code.

**Format de sortie JSON strict :**
{
  "intent": "PINN_SIMULATION" | "CODE_ANALYSIS" | "GENERAL_QUERY",
  "params": { /* Les paramètres pertinents pour l'intent */ }
}

**Règles de décision :**
- Si la requête mentionne "simulation", "résoudre équation", "modélisation", ou des termes de physique/ingénierie nécessitant un calcul lourd, utilise "PINN_SIMULATION" et extrait les paramètres de simulation (ex: 'model_type', 'boundary_conditions', 'iterations').
- Si la requête contient du code ou demande une "correction de bug", "optimisation de code", "génération de fonction", utilise "CODE_ANALYSIS" et inclus le code ou la description du code dans les paramètres.
- Sinon, utilise "GENERAL_QUERY".

**Exemple pour PINN_SIMULATION :**
Requête: "Lancez une simulation de Navier-Stokes pour un écoulement laminaire avec 1000 itérations."
JSON: { "intent": "PINN_SIMULATION", "params": { "model_type": "NavierStokes", "flow_type": "laminar", "iterations": 1000 } }
`;

// --- Gestionnaire de Requêtes (Edge Function) ---
serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { user_query, user_data } = await req.json();
    
    if (!user_query) {
      return new Response(JSON.stringify({ error: "Missing 'user_query' in request body." }), { status: 400 });
    }

    // 1. Appel à l'IA pour l'orchestration
    const orchestration_decision = await callOpenAI(ORCHESTRATOR_SYSTEM_PROMPT, { query: user_query, data: user_data });
    const { intent, params } = orchestration_decision;

    // 2. Traitement basé sur l'intention
    switch (intent) {
      case "PINN_SIMULATION": {
        // Générer un ID unique pour le suivi
        const orchestration_id = crypto.randomUUID();
        
        // Insérer la tâche dans la table de la base de données (Celery va la lire)
        // NOTE: Ceci suppose que vous avez configuré un mécanisme pour que Celery lise cette table
        // ou que vous utilisiez une file d'attente de messages (Redis/RabbitMQ) que Celery écoute.
        // Pour la simplicité de l'exemple Supabase, nous utilisons une table.
        const { error } = await supabase.from('orchestration_queue').insert({
          orchestration_id: orchestration_id,
          task_type: 'pinn.tasks.start_simulation', // Nom de la tâche Celery
          task_params: params,
          status: 'QUEUED',
          created_at: new Date().toISOString()
        });

        if (error) throw error;

        return new Response(JSON.stringify({ 
          status: "TASK_QUEUED", 
          orchestration_id: orchestration_id,
          message: "Simulation de calcul intensif mise en file d'attente pour traitement asynchrone."
        }), { status: 202, headers: { "Content-Type": "application/json" } });
      }

      case "CODE_ANALYSIS": {
        // Pour l'analyse de code, nous pouvons faire un appel direct à l'IA pour une réponse rapide
        // ou le mettre en file d'attente si l'analyse est très longue.
        // Ici, nous faisons un appel direct pour une réponse rapide.
        const CODE_ANALYSIS_PROMPT = `En tant qu'expert en code scientifique, analyse le code fourni dans les 'params' et retourne une version corrigée, optimisée et commentée, sans aucune explication supplémentaire.`;
        const result = await callOpenAI(CODE_ANALYSIS_PROMPT, params);
        
        return new Response(JSON.stringify({ 
          status: "COMPLETED", 
          result: result.intent, // Le résultat de l'analyse est dans le champ 'intent' de la réponse de l'IA
          message: "Analyse de code complétée."
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      case "GENERAL_QUERY":
      default: {
        // Pour les requêtes générales, nous faisons un appel direct à l'IA pour une réponse immédiate.
        const GENERAL_PROMPT = `En tant qu'IA principale de NeuroPhysics Lab, réponds à la requête utilisateur avec une rigueur scientifique absolue, en utilisant des formules, des concepts clairs et un ton professionnel.`;
        const result = await callOpenAI(GENERAL_PROMPT, params);
        
        return new Response(JSON.stringify({ 
          status: "COMPLETED", 
          result: result.intent, // Le résultat de la requête est dans le champ 'intent' de la réponse de l'IA
          message: "Réponse scientifique fournie."
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
    }
  } catch (error) {
    console.error("Orchestrator Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
