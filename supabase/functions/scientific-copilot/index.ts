import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { OpenAI } from "https://esm.sh/openai@4.20.1"

const SCIENTIFIC_COPILOT_PROMPT = `Tu es le Scientific Copilot de NeuroPhysics Lab, expert en code scientifique et validation physique.

DOMAINES D'EXPERTISE:
1. CFD (Navier-Stokes, turbulence, transfert thermique)
2. Mécanique des structures
3. Électromagnétisme
4. Simulation numérique
5. Analyse de données scientifiques

POUR CHAQUE ANALYSE:
1. Valider la cohérence physique du code
2. Vérifier les conditions aux limites
3. Analyser la stabilité numérique
4. Proposer des optimisations de performance
5. Moderniser le code si nécessaire

FORMAT DE SORTIE:
{
  "analysis": {
    "physics_validation": {
      "conservation_laws": string[],
      "boundary_conditions": string[],
      "dimensional_analysis": string
    },
    "code_quality": {
      "score": number,
      "issues": string[],
      "improvements": string[]
    },
    "performance_analysis": {
      "bottlenecks": string[],
      "optimization_opportunities": string[]
    }
  },
  "modernization": {
    "suggested_code": string,
    "explanation": string,
    "confidence": number
  },
  "scientific_recommendations": {
    "validation_tests": string[],
    "alternative_methods": string[],
    "references": string[]
  }
}`

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, language = 'python', context = {}, analysis_type = 'comprehensive' } = await req.json()
    
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_PINNs_KEY') ?? '',
    })

    // Analyse scientifique approfondie
    const analysis = await analyzeScientificCode(openai, code, language, context, analysis_type)

    // Validation physique
    const physicsValidation = await validatePhysics(openai, code, context)

    // Suggestions de modernisation
    const modernization = await suggestModernization(openai, code, language, context)

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          ...analysis,
          physics_validation: physicsValidation
        },
        modernization,
        metadata: {
          language,
          analysis_type,
          timestamp: new Date().toISOString(),
          code_length: code.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        scientific_advice: "Vérifiez la syntaxe du code et fournissez plus de contexte physique si nécessaire."
      }),
      {
        headers: corsHeaders,
        status: 500
      }
    )
  }
})

async function analyzeScientificCode(openai: OpenAI, code: string, language: string, context: any, analysisType: string) {
  const prompt = `${SCIENTIFIC_COPILOT_PROMPT}

CODE À ANALYSER (${language}):
\`\`\`${language}
${code}
\`\`\`

CONTEXTE PHYSIQUE: ${JSON.stringify(context, null, 2)}

TYPE D'ANALYSE: ${analysisType}

Fournissez une analyse complète selon le format spécifié.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: SCIENTIFIC_COPILOT_PROMPT },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 2000,
    response_format: { type: "json_object" }
  })

  return JSON.parse(completion.choices[0].message.content || '{}')
}

async function validatePhysics(openai: OpenAI, code: string, context: any) {
  const validationPrompt = `En tant que physicien computationnel, validez la cohérence physique de ce code:

CODE:
${code}

CONTEXTE:
${JSON.stringify(context, null, 2)}

Vérifiez:
1. Conservation de la masse, énergie, quantité de mouvement
2. Respect des conditions aux limites
3. Cohérence des unités
4. Stabilité numérique
5. Exactitude des schémas de discrétisation`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Expert en validation physique computationnelle" },
      { role: "user", content: validationPrompt }
    ],
    temperature: 0.1,
    max_tokens: 1000
  })

  return completion.choices[0].message.content
}

async function suggestModernization(openai: OpenAI, code: string, language: string, context: any) {
  const modernizationPrompt = `Modernisez ce code ${language} scientifique:

CODE ORIGINAL:
${code}

CONTEXTE:
${JSON.stringify(context, null, 2)}

OBJECTIFS DE MODERNISATION:
1. Utiliser des bibliothèques modernes (NumPy, SciPy, TensorFlow/PyTorch)
2. Vectoriser les opérations
3. Améliorer la lisibilité
4. Ajouter la documentation
5. Optimiser les performances`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Expert en modernisation de code scientifique" },
      { role: "user", content: modernizationPrompt }
    ],
    temperature: 0.2,
    max_tokens: 1500
  })

  return {
    suggested_code: completion.choices[0].message.content,
    explanation: "Code modernisé avec best practices scientifiques",
    confidence: 0.85
  }
}
