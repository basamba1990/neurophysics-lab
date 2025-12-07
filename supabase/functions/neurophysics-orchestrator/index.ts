import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { OpenAI } from "https://esm.sh/openai@4.20.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// PROMPT FONDATEUR NEUROPHYSICS LAB
const NEUROPHYSICS_ORCHESTRATOR_PROMPT = `Tu es l'IA principale de NeuroPhysics Lab, une plateforme scientifique avancée spécialisée en simulations physiques, analyse neuro-computationale, calcul scientifique et intelligence artificielle.

OBJECTIF : Fournir des résultats ultra fiables, scientifiquement cohérents, rapides, et présentés de manière professionnelle.

MISSION PRINCIPALE :
1. Analyser précisément la question ou les données fournies
2. Identifier le domaine scientifique concerné (physique, mathématiques, neuro-IA, data science, etc.)
3. Fournir une réponse robuste avec raisonnement rigoureux, formules mathématiques correctes, exemples clairs
4. Proposer des améliorations et approfondissements scientifiques
5. Éviter toute approximation non justifiée

FORMAT DE RÉPONSE EN JSON :
{
  "analysis": {
    "domain": string,
    "hypotheses": string[],
    "complexity": "LOW|MEDIUM|HIGH",
    "scientific_context": string
  },
  "execution_plan": {
    "steps": Array<{
      "step_id": string,
      "engine": "PINN_SOLVER|CODE_COPILOT|DIGITAL_TWIN|DATA_ANALYSIS|PHYSICS_VALIDATION",
      "task": string,
      "priority": number,
      "estimated_duration": number,
      "dependencies": string[],
      "parameters": object
    }>
  },
  "scientific_validation": {
    "assumptions_to_verify": string[],
    "potential_errors": string[],
    "validation_methods": string[]
  },
  "expert_recommendations": {
    "optimizations": string[],
    "extensions": string[],
    "professional_advice": string
  }
}`

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, project_id, user_id, context_data, files = [] } = await req.json()

    // Initialisation clients
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_PINNs_KEY') ?? '',
    })

    // ÉTAPE 1 : Récupération du contexte vectoriel
    const context = await retrieveVectorContext(supabase, query, project_id)

    // ÉTAPE 2 : Analyse par le LLM avec le prompt NeuroPhysics
    const aiAnalysis = await analyzeWithNeuroPhysicsAI(openai, {
      query,
      context,
      files
    })

    // ÉTAPE 3 : Exécution parallèle orchestrée
    const executionResults = await executeOrchestratedPlan(
      supabase,
      aiAnalysis.execution_plan,
      {
        query,
        project_id,
        user_id,
        ai_analysis: aiAnalysis
      }
    )

    // ÉTAPE 4 : Synthèse et validation scientifique
    const finalSynthesis = await synthesizeResults(
      openai,
      aiAnalysis,
      executionResults
    )

    // ÉTAPE 5 : Sauvegarde pour traçabilité
    await saveOrchestrationTrace(supabase, {
      project_id,
      user_id,
      original_query: query,
      ai_analysis: aiAnalysis,
      execution_results: executionResults,
      final_synthesis: finalSynthesis
    })

    // Réponse structurée professionnelle
    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        scientific_report: finalSynthesis.scientific_report,
        execution_summary: {
          total_steps: aiAnalysis.execution_plan.steps.length,
          completed_steps: executionResults.filter(r => r.status === 'completed').length,
          estimated_completion_time: finalSynthesis.estimated_completion_time
        },
        next_steps: finalSynthesis.recommended_next_steps,
        data_references: {
          context_id: context.context_id,
          orchestration_id: finalSynthesis.orchestration_id
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Erreur orchestration:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        scientific_advice: "Veuillez reformuler votre requête avec plus de détails scientifiques ou contacter l'équipe de support."
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Fonction : Récupération du contexte vectoriel
async function retrieveVectorContext(supabase: any, query: string, projectId?: string) {
  try {
    // Génération d'embedding pour la recherche sémantique
    const { data: embeddings } = await supabase.functions.invoke('generate-embeddings', {
      body: { text: query }
    })

    // Recherche de contexte similaire
    const { data: similarContexts } = await supabase.rpc('match_project_context', {
      query_embedding: embeddings.embedding,
      match_threshold: 0.7,
      match_count: 5,
      project_id: projectId
    })

    return {
      context_id: `ctx_${Date.now()}`,
      similar_problems: similarContexts || [],
      embedding: embeddings.embedding,
      has_historical_data: (similarContexts?.length || 0) > 0
    }
  } catch (error) {
    console.warn('Erreur récupération contexte:', error)
    return { context_id: `ctx_${Date.now()}`, similar_problems: [], has_historical_data: false }
  }
}

// Fonction : Analyse avec IA NeuroPhysics
async function analyzeWithNeuroPhysicsAI(openai: OpenAI, data: any) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: NEUROPHYSICS_ORCHESTRATOR_PROMPT
      },
      {
        role: "user",
        content: JSON.stringify({
          user_query: data.query,
          available_context: data.context,
          attached_files: data.files,
          available_engines: [
            { name: "PINN_SOLVER", capabilities: ["navier_stokes", "heat_transfer", "structural_analysis"] },
            { name: "CODE_COPILOT", capabilities: ["code_analysis", "modernization", "debugging", "physics_validation"] },
            { name: "DIGITAL_TWIN", capabilities: ["optimization", "performance_monitoring", "scenario_analysis"] },
            { name: "DATA_ANALYSIS", capabilities: ["statistical_analysis", "visualization", "trend_detection"] }
          ]
        })
      }
    ],
    temperature: 0.1, // Faible pour la cohérence scientifique
    max_tokens: 2000,
    response_format: { type: "json_object" }
  })

  const analysis = JSON.parse(completion.choices[0].message.content || '{}')
  
  // Validation de la structure
  if (!analysis.analysis || !analysis.execution_plan) {
    throw new Error("Réponse IA mal formée: structure JSON invalide")
  }

  return analysis
}

// Fonction : Exécution orchestrée du plan
async function executeOrchestratedPlan(supabase: any, plan: any, metadata: any) {
  const results = []
  
  for (const step of plan.steps) {
    try {
      let result
      
      switch (step.engine) {
        case 'PINN_SOLVER':
          result = await supabase.functions.invoke('execute-pinn-task', {
            body: {
              task: step.task,
              parameters: step.parameters,
              metadata: {
                ...metadata,
                step_id: step.step_id
              }
            }
          })
          break
          
        case 'CODE_COPILOT':
          result = await supabase.functions.invoke('scientific-copilot', {
            body: {
              code: step.parameters.code,
              context: step.parameters.context,
              analysis_type: step.parameters.analysis_type || 'comprehensive'
            }
          })
          break
          
        case 'DIGITAL_TWIN':
          result = await supabase.functions.invoke('digital-twin-optimization', {
            body: {
              twin_id: step.parameters.twin_id,
              optimization_type: step.parameters.optimization_type,
              constraints: step.parameters.constraints
            }
          })
          break
          
        default:
          result = { error: `Moteur non supporté: ${step.engine}` }
      }
      
      results.push({
        step_id: step.step_id,
        engine: step.engine,
        status: result.error ? 'failed' : 'completed',
        result: result.data || result.error,
        execution_time: Date.now(),
        dependencies_satisfied: checkDependencies(step.dependencies, results)
      })
      
    } catch (error) {
      results.push({
        step_id: step.step_id,
        engine: step.engine,
        status: 'failed',
        error: error.message,
        execution_time: Date.now()
      })
    }
  }
  
  return results
}

// Fonction : Vérification des dépendances
function checkDependencies(dependencies: string[], results: any[]) {
  if (!dependencies || dependencies.length === 0) return true
  
  return dependencies.every(depId => {
    const depResult = results.find(r => r.step_id === depId)
    return depResult && depResult.status === 'completed'
  })
}

// Fonction : Synthèse des résultats
async function synthesizeResults(openai: OpenAI, analysis: any, executionResults: any[]) {
  const synthesisPrompt = `
En tant qu'expert scientifique NeuroPhysics Lab, synthétisez les résultats suivants en un rapport professionnel:

ANALYSE INITIALE: ${JSON.stringify(analysis.analysis, null, 2)}

RÉSULTATS D'EXÉCUTION: ${JSON.stringify(executionResults, null, 2)}

Fournissez:
1. Un résumé exécutif
2. Les conclusions scientifiques principales
3. Les limitations identifiées
4. Les recommandations pour des recherches futures
5. Les implications pratiques

Format de réponse JSON:
{
  "scientific_report": {
    "executive_summary": string,
    "main_conclusions": string[],
    "scientific_significance": string,
    "limitations": string[],
    "future_research_directions": string[]
  },
  "professional_recommendations": {
    "immediate_actions": string[],
    "long_term_strategies": string[],
    "risk_assessment": string
  },
  "estimated_completion_time": number,
  "recommended_next_steps": string[]
}
`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Expert scientifique spécialisé en synthèse de résultats de recherche" },
      { role: "user", content: synthesisPrompt }
    ],
    temperature: 0.2,
    max_tokens: 1500,
    response_format: { type: "json_object" }
  })

  const synthesis = JSON.parse(completion.choices[0].message.content || '{}')
  
  return {
    ...synthesis,
    orchestration_id: `orch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  }
}

// Fonction : Sauvegarde de la trace d'orchestration
async function saveOrchestrationTrace(supabase: any, data: any) {
  try {
    await supabase.from('neurophysics_orchestrations').insert({
      project_id: data.project_id,
      user_id: data.user_id,
      original_query: data.original_query,
      ai_analysis: data.ai_analysis,
      execution_results: data.execution_results,
      final_synthesis: data.final_synthesis,
      created_at: new Date().toISOString(),
      status: 'completed'
    })
  } catch (error) {
    console.error('Erreur sauvegarde trace:', error)
  }
}
