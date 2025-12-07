import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { OpenAI } from "https://esm.sh/openai@4.20.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VectorContextRequest {
  text: string
  project_id?: string
  content_type?: 'code' | 'simulation' | 'documentation' | 'result'
  metadata?: Record<string, any>
}

interface ContextSearchRequest {
  query: string
  filters?: {
    content_type?: string
    scientific_domain?: string
    physics_type?: string
    date_range?: { start: string; end: string }
  }
  project_id?: string
  limit?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_PINNs_KEY') ?? '',
    })

    switch (path) {
      case 'store':
        return await storeVectorContext(req, supabase, openai)
      case 'search':
        return await searchVectorContext(req, supabase, openai)
      case 'similar':
        return await findSimilarContext(req, supabase, openai)
      case 'project-context':
        return await getProjectContext(req, supabase)
      default:
        return await handleDefaultRequest(req, supabase, openai)
    }

  } catch (error) {
    console.error('Vector context error:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        suggestion: 'Vérifiez les paramètres de votre requête'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

async function storeVectorContext(req: Request, supabase: any, openai: OpenAI) {
  const { text, project_id, content_type = 'documentation', metadata = {} }: VectorContextRequest = await req.json()

  // Génération de l'embedding avec OpenAI
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float"
  })

  const embedding = embeddingResponse.data[0].embedding

  // Extraction des métadonnées scientifiques automatiques
  const scientificMetadata = await extractScientificMetadata(openai, text)

  // Insertion dans la base vectorielle
  const { data, error } = await supabase
    .from('vector_contexts')
    .insert({
      project_id,
      content_type,
      content: text,
      metadata: { ...metadata, ...scientificMetadata },
      embedding,
      scientific_domain: scientificMetadata.domain,
      physics_type: scientificMetadata.physics_type,
      complexity_score: scientificMetadata.complexity_score,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({
      success: true,
      context_id: data.id,
      vector_dimensions: embedding.length,
      stored_at: new Date().toISOString(),
      scientific_classification: scientificMetadata
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function searchVectorContext(req: Request, supabase: any, openai: OpenAI) {
  const { query, filters = {}, project_id, limit = 10 }: ContextSearchRequest = await req.json()

  // Génération de l'embedding pour la recherche
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
    encoding_format: "float"
  })

  const queryEmbedding = embeddingResponse.data[0].embedding

  // Construction de la requête RPC
  const { data: results, error } = await supabase.rpc('search_scientific_context', {
    query_text: query,
    query_embedding: queryEmbedding,
    filters: JSON.stringify(filters),
    project_id,
    limit_count: limit
  })

  if (error) throw error

  // Enrichissement des résultats avec l'IA
  const enrichedResults = await enrichSearchResults(openai, query, results)

  return new Response(
    JSON.stringify({
      success: true,
      query,
      filters,
      results: enrichedResults,
      count: results.length,
      search_performed_at: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function findSimilarContext(req: Request, supabase: any, openai: OpenAI) {
  const { text, threshold = 0.7, limit = 5, project_id } = await req.json()

  // Génération de l'embedding
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float"
  })

  const embedding = embeddingResponse.data[0].embedding

  // Recherche de similarité
  const { data: similarContexts, error } = await supabase.rpc('match_project_context', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
    project_id
  })

  if (error) throw error

  return new Response(
    JSON.stringify({
      success: true,
      input_text: text.substring(0, 200) + '...',
      similar_contexts_found: similarContexts.length,
      contexts: similarContexts.map((ctx: any) => ({
        id: ctx.id,
        content_preview: ctx.content.substring(0, 150) + '...',
        content_type: ctx.content_type,
        similarity: ctx.similarity,
        metadata: ctx.metadata
      })),
      search_parameters: {
        threshold,
        limit,
        project_id
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getProjectContext(req: Request, supabase: any) {
  const { project_id, content_types, limit = 20 } = await req.json()

  let query = supabase
    .from('vector_contexts')
    .select('*')
    .eq('project_id', project_id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (content_types && content_types.length > 0) {
    query = query.in('content_type', content_types)
  }

  const { data: contexts, error } = await query

  if (error) throw error

  // Regroupement par type
  const groupedByType = contexts.reduce((acc: any, ctx: any) => {
    const type = ctx.content_type
    if (!acc[type]) acc[type] = []
    acc[type].push({
      id: ctx.id,
      content_preview: ctx.content.substring(0, 100) + '...',
      created_at: ctx.created_at,
      metadata: ctx.metadata
    })
    return acc
  }, {})

  return new Response(
    JSON.stringify({
      success: true,
      project_id,
      total_contexts: contexts.length,
      contexts_by_type: groupedByType,
      summary: {
        codes: contexts.filter((c: any) => c.content_type === 'code').length,
        simulations: contexts.filter((c: any) => c.content_type === 'simulation').length,
        results: contexts.filter((c: any) => c.content_type === 'result').length,
        documentation: contexts.filter((c: any) => c.content_type === 'documentation').length
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDefaultRequest(req: Request, supabase: any, openai: OpenAI) {
  const { action, ...params } = await req.json()

  switch (action) {
    case 'summarize-context':
      return await summarizeContext(supabase, params.contextId, openai)
    case 'cleanup-old-contexts':
      return await cleanupOldContexts(supabase, params.days)
    case 'export-contexts':
      return await exportContexts(supabase, params.projectId)
    default:
      return new Response(
        JSON.stringify({
          error: 'Action non reconnue',
          available_actions: [
            'store', 'search', 'similar', 'project-context',
            'summarize-context', 'cleanup-old-contexts', 'export-contexts'
          ]
        }),
        { headers: corsHeaders, status: 400 }
      )
  }
}

async function extractScientificMetadata(openai: OpenAI, text: string) {
  const prompt = `
  Analyse ce contenu scientifique et extrais les métadonnées suivantes:
  
  CONTENU: ${text.substring(0, 1000)}...

  Réponds en JSON avec:
  {
    "domain": "cfd|heat_transfer|structural|electromagnetism|multiphysics|data_science|code",
    "physics_type": "navier_stokes|heat_equation|structural_mechanics|etc",
    "complexity_score": 1-10,
    "key_concepts": ["concept1", "concept2"],
    "scientific_quality": "high|medium|low"
  }
  `

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Extracteur de métadonnées scientifiques" },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" }
    })

    return JSON.parse(response.choices[0].message.content || '{}')
  } catch (error) {
    console.warn('Erreur extraction métadonnées:', error)
    return {
      domain: 'unknown',
      physics_type: 'unknown',
      complexity_score: 5,
      key_concepts: [],
      scientific_quality: 'medium'
    }
  }
}

async function enrichSearchResults(openai: OpenAI, query: string, results: any[]) {
  if (results.length === 0) return results

  const prompt = `
  Analyse ces résultats de recherche scientifique et fournis des insights:
  
  QUESTION: ${query}
  
  RÉSULTATS: ${JSON.stringify(results.slice(0, 3), null, 2)}

  Fournis:
  1. Thèmes principaux identifiés
  2. Gaps de connaissance potentiels
  3. Suggestions pour affiner la recherche

  Format JSON.
  `

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Analyste de recherche scientifique" },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: "json_object" }
    })

    const insights = JSON.parse(response.choices[0].message.content || '{}')

    return results.map((result, index) => ({
      ...result,
      insights: index < 3 ? insights[`result_${index + 1}`] : null,
      relevance_explanation: `Correspondance trouvée dans ${result.content_type}`
    }))
  } catch (error) {
    console.warn('Erreur enrichissement résultats:', error)
    return results
  }
}

async function summarizeContext(supabase: any, contextId: string, openai: OpenAI) {
  const { data: context, error } = await supabase
    .from('vector_contexts')
    .select('*')
    .eq('id', contextId)
    .single()

  if (error) throw error

  const prompt = `
  Résume ce contenu scientifique pour un chercheur:
  
  TYPE: ${context.content_type}
  CONTENU: ${context.content.substring(0, 2000)}...

  Crée un résumé structuré avec:
  - Points clés
  - Méthodologie utilisée
  - Résultats importants
  - Limitations identifiées
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Expert en résumé scientifique" },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 1000
  })

  const summary = response.choices[0].message.content

  // Stockage du résumé
  await supabase
    .from('vector_contexts')
    .update({ 
      metadata: {
        ...context.metadata,
        ai_summary: summary,
        summary_generated_at: new Date().toISOString()
      }
    })
    .eq('id', contextId)

  return new Response(
    JSON.stringify({
      success: true,
      context_id: contextId,
      summary,
      original_length: context.content.length,
      summary_length: summary?.length,
      generated_at: new Date().toISOString()
    }),
    { headers: corsHeaders }
  )
}

async function cleanupOldContexts(supabase: any, days: number = 90) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const { data: oldContexts, error: selectError } = await supabase
    .from('vector_contexts')
    .select('id, content_type, created_at')
    .lt('created_at', cutoffDate.toISOString())

  if (selectError) throw selectError

  if (oldContexts.length === 0) {
    return new Response(
      JSON.stringify({
        success: true,
        message: `Aucun contexte plus vieux que ${days} jours`,
        deleted_count: 0
      }),
      { headers: corsHeaders }
    )
  }

  // Suppression
  const { error: deleteError } = await supabase
    .from('vector_contexts')
    .delete()
    .lt('created_at', cutoffDate.toISOString())

  if (deleteError) throw deleteError

  // Statistiques
  const stats = oldContexts.reduce((acc: any, ctx: any) => {
    acc[ctx.content_type] = (acc[ctx.content_type] || 0) + 1
    return acc
  }, {})

  return new Response(
    JSON.stringify({
      success: true,
      message: `Nettoyage terminé`,
      deleted_count: oldContexts.length,
      statistics: stats,
      cutoff_date: cutoffDate.toISOString()
    }),
    { headers: corsHeaders }
  )
}

async function exportContexts(supabase: any, projectId?: string) {
  let query = supabase
    .from('vector_contexts')
    .select('*')
    .order('created_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data: contexts, error } = await query

  if (error) throw error

  // Format pour export
  const exportData = contexts.map((ctx: any) => ({
    id: ctx.id,
    project_id: ctx.project_id,
    content_type: ctx.content_type,
    content_preview: ctx.content.substring(0, 200),
    metadata: ctx.metadata,
    scientific_domain: ctx.scientific_domain,
    created_at: ctx.created_at
  }))

  return new Response(
    JSON.stringify({
      success: true,
      export_date: new Date().toISOString(),
      total_contexts: contexts.length,
      contexts: exportData,
      formats_available: ['json', 'csv']
    }),
    { headers: corsHeaders }
  )
}
