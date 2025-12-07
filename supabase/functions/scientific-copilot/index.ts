import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SCIENTIFIC_COPILOT_PROMPT = `Tu es un expert en ingénierie scientifique avec expertise en:
1. Analyse de code Fortran/C++/Python pour la simulation numérique
2. Vérification de cohérence physique des équations discrétisées
3. Modernisation de code legacy vers Python/TensorFlow
4. Validation des conditions aux limites et stabilité numérique
5. Optimisation de performance pour le calcul scientifique

DIRECTIVES:
- TOUJOURS vérifier la conservation de la masse, énergie, quantité de mouvement
- Identifier les erreurs de discrétisation et stabilité
- Proposer des améliorations basées sur les bonnes pratiques modernes
- Fournir des équations correctes et des validations`

serve(async (req: Request) => {
  const { code, context, analysis_type = 'physics_validation' } = await req.json()

  const analysis = await analyzeCodeScientifically(code, context, analysis_type)

  return new Response(
    JSON.stringify({
      analysis_type,
      timestamp: new Date().toISOString(),
      code_metrics: analysis.metrics,
      physics_validation: analysis.physics,
      suggestions: analysis.suggestions,
      modernized_code: analysis.modernized,
      confidence_score: analysis.confidence
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})

async function analyzeCodeScientifically(code: string, context: any, type: string): Promise<any> {
  // Appel à l'API OpenAI avec contexte scientifique
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: SCIENTIFIC_COPILOT_PROMPT + '\n\nContexte: ' + JSON.stringify(context)
        },
        {
          role: 'user',
          content: `Analyse ce code ${type}:\n\`\`\`\n${code}\n\`\`\``
        }
      ],
      temperature: 0.1,
      max_tokens: 3000
    })
  })

  const data = await response.json()
  const analysisText = data.choices[0].message.content

  // Parsing structuré de l'analyse
  return {
    metrics: extractCodeMetrics(code),
    physics: extractPhysicsValidation(analysisText),
    suggestions: extractSuggestions(analysisText),
    modernized: extractModernizedCode(analysisText),
    confidence: calculateConfidenceScore(analysisText)
  }
}

function extractCodeMetrics(code: string): any {
  // Analyse basique du code
  const lines = code.split('\n')
  const fortranPatterns = [/program/i, /subroutine/i, /function/i, /common/i, /goto/i]
  const cppPatterns = [/#include/, /class/, /namespace/, /template/]
  const pythonPatterns = [/import numpy/, /def /, /class /, /@tf\.function/]

  let language = 'unknown'
  if (fortranPatterns.some(p => p.test(code))) language = 'fortran'
  else if (cppPatterns.some(p => p.test(code))) language = 'cpp'
  else if (pythonPatterns.some(p => p.test(code))) language = 'python'

  return {
    language,
    lines_of_code: lines.length,
    complexity_indicators: {
      has_loops: /do\s+|for\s+|while\s+/.test(code),
      has_conditionals: /if\s+|else\s+/.test(code),
      has_goto: /goto\s+/i.test(code),
      has_parallel_code: /!\$acc|\!omp|#pragma/.test(code)
    }
  }
}

function extractPhysicsValidation(analysis: string): any {
  // Extraction des validations physiques
  const validations = {
    mass_conservation: analysis.includes('conservation de masse') || analysis.includes('mass conservation'),
    energy_conservation: analysis.includes('conservation d\'énergie') || analysis.includes('energy conservation'),
    momentum_conservation: analysis.includes('conservation de quantité') || analysis.includes('momentum conservation'),
    boundary_conditions_valid: !analysis.includes('condition aux limites incorrecte'),
    stability_criteria: analysis.match(/CFL|Courant|stabilité/g) || [],
    warnings: extractWarnings(analysis)
  }

  return validations
}

function extractWarnings(analysis: string): string[] {
  const warnings = []
  const warningPatterns = [
    /attention.*?:([^\n]+)/gi,
    /warning.*?:([^\n]+)/gi,
    /risque.*?:([^\n]+)/gi,
    /problème.*?:([^\n]+)/gi
  ]

  warningPatterns.forEach(pattern => {
    const matches = analysis.match(pattern)
    if (matches) warnings.push(...matches)
  })

  return warnings.slice(0, 5) // Limiter à 5 warnings principaux
}

function extractSuggestions(analysis: string): string[] {
  const suggestions = []
  const suggestionPatterns = [
    /suggestion.*?:([^\n]+)/gi,
    /recommandation.*?:([^\n]+)/gi,
    /amélioration.*?:([^\n]+)/gi,
    /considérer.*?:([^\n]+)/gi
  ]

  suggestionPatterns.forEach(pattern => {
    const matches = analysis.match(pattern)
    if (matches) suggestions.push(...matches)
  })

  return suggestions.slice(0, 10) // Limiter à 10 suggestions
}

function extractModernizedCode(analysis: string): string {
  // Extraction du code modernisé des blocs de code
  const codeBlocks = analysis.match(/```(?:python)?\n([\s\S]*?)```/g)
  if (codeBlocks && codeBlocks.length > 0) {
    return codeBlocks[0].replace(/```(?:python)?\n/, '').replace(/```/, '')
  }
  return ''
}

function calculateConfidenceScore(analysis: string): number {
  // Score de confiance basé sur la précision de l'analyse
  let score = 0.7 // Base

  // Bonus pour détails spécifiques
  if (analysis.includes('équation') && analysis.includes('discrétisation')) score += 0.1
  if (analysis.includes('condition CFL') || analysis.includes('stabilité numérique')) score += 0.1
  if (analysis.includes('validation') && analysis.includes('résultat')) score += 0.1
  if (analysis.includes('code optimisé') || analysis.includes('performance')) score += 0.1

  return Math.min(score, 1.0)
}
