from typing import Dict, Any, List, Optional
import numpy as np
from datetime import datetime, timedelta

from supabase import create_client
import openai

from core.config import get_settings
from models.pydantic_models import VectorContext, ScientificDomain
from utils.logger import context_logger

settings = get_settings()

class VectorContextManager:
    """Gestionnaire du contexte vectoriel pour NeuroPhysics Lab"""
    
    def __init__(self):
        self.supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        self.openai = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        # Cache pour améliorer les performances
        self.context_cache = {}
        self.cache_ttl = 300  # 5 minutes
    
    async def store_context(self, context: VectorContext) -> Dict[str, Any]:
        """Stocke un contexte dans la base vectorielle"""
        
        try:
            # Génération de l'embedding
            embedding = await self._generate_embedding(context.content)
            
            # Extraction des métadonnées scientifiques
            metadata = await self._extract_scientific_metadata(context.content)
            
            # Préparation des données
            context_data = {
                "project_id": context.project_id,
                "content_type": context.content_type,
                "content": context.content,
                "metadata": {**context.metadata, **metadata},
                "embedding": embedding,
                "scientific_domain": metadata.get("domain", "unknown"),
                "physics_type": metadata.get("physics_type", "unknown"),
                "complexity_score": metadata.get("complexity_score", 5),
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Insertion dans la base
            response = await self.supabase.table("vector_contexts").insert(context_data).execute()
            
            if response.data:
                context_id = response.data[0]["id"]
                context_logger.info(f"Contexte stocké: {context_id}")
                
                # Mise à jour du cache
                self.context_cache[context_id] = {
                    "data": context_data,
                    "timestamp": datetime.utcnow()
                }
                
                return {
                    "success": True,
                    "context_id": context_id,
                    "embedding_dimensions": len(embedding),
                    "scientific_classification": metadata
                }
            else:
                raise ValueError("Échec de l'insertion dans la base")
                
        except Exception as e:
            context_logger.error(f"Erreur stockage contexte: {e}")
            raise
    
    async def search_similar_contexts(self, query: str, filters: Dict[str, Any] = None, 
                                    project_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Recherche des contextes similaires"""
        
        try:
            # Génération de l'embedding pour la requête
            query_embedding = await self._generate_embedding(query)
            
            # Construction des paramètres de recherche
            search_params = {
                "query_embedding": query_embedding,
                "match_threshold": filters.get("similarity_threshold", 0.7) if filters else 0.7,
                "match_count": limit,
                "project_id": project_id
            }
            
            # Recherche via fonction RPC
            response = await self.supabase.rpc("match_project_context", search_params).execute()
            
            if response.data:
                # Enrichissement des résultats
                enriched_results = await self._enrich_search_results(response.data, query)
                
                context_logger.info(f"Recherche trouvée: {len(enriched_results)} résultats")
                return enriched_results
            else:
                return []
                
        except Exception as e:
            context_logger.error(f"Erreur recherche contextes: {e}")
            return []
    
    async def get_project_context_summary(self, project_id: str) -> Dict[str, Any]:
        """Récupère un résumé du contexte d'un projet"""
        
        try:
            # Récupération des contextes du projet
            response = await self.supabase.table("vector_contexts") \
                .select("*") \
                .eq("project_id", project_id) \
                .order("created_at", desc=True) \
                .limit(100) \
                .execute()
            
            if not response.data:
                return {
                    "project_id": project_id,
                    "total_contexts": 0,
                    "summary": "Aucun contexte disponible"
                }
            
            context_logger.info(f"Récupération contexte projet {project_id}: {len(response.data)} éléments")
            
            # Génération d'un résumé IA
            summary = await self._generate_project_summary(response.data)
            
            # Statistiques
            stats = self._calculate_context_statistics(response.data)
            
            return {
                "project_id": project_id,
                "total_contexts": len(response.data),
                "summary": summary,
                "statistics": stats,
                "recent_contexts": response.data[:5]  # 5 plus récents
            }
            
        except Exception as e:
            context_logger.error(f"Erreur récupération contexte projet: {e}")
            raise
    
    async def cleanup_old_contexts(self, days_old: int = 90) -> Dict[str, Any]:
        """Nettoie les contextes trop anciens"""
        
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_old)
            
            # Récupération des anciens contextes
            old_contexts = await self.supabase.table("vector_contexts") \
                .select("id, content_type, created_at") \
                .lt("created_at", cutoff_date.isoformat()) \
                .execute()
            
            if not old_contexts.data:
                return {
                    "cleaned": 0,
                    "message": f"Aucun contexte plus vieux que {days_old} jours"
                }
            
            # Suppression
            await self.supabase.table("vector_contexts") \
                .delete() \
                .lt("created_at", cutoff_date.isoformat()) \
                .execute()
            
            # Statistiques
            stats = {}
            for ctx in old_contexts.data:
                ctx_type = ctx["content_type"]
                stats[ctx_type] = stats.get(ctx_type, 0) + 1
            
            context_logger.info(f"Nettoyage contextes: {len(old_contexts.data)} supprimés")
            
            return {
                "cleaned": len(old_contexts.data),
                "cutoff_date": cutoff_date.isoformat(),
                "statistics": stats
            }
            
        except Exception as e:
            context_logger.error(f"Erreur nettoyage contextes: {e}")
            raise
    
    async def generate_context_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Génère des embeddings pour une liste de textes"""
        
        try:
            embeddings = []
            
            # Batch processing pour optimiser les appels API
            batch_size = 20
            for i in range(0, len(texts), batch_size):
                batch = texts[i:i + batch_size]
                
                response = await self.openai.embeddings.create(
                    model="text-embedding-3-small",
                    input=batch,
                    encoding_format="float"
                )
                
                batch_embeddings = [data.embedding for data in response.data]
                embeddings.extend(batch_embeddings)
                
                # Petite pause pour éviter les rate limits
                import asyncio
                await asyncio.sleep(0.1)
            
            context_logger.info(f"Embeddings générés: {len(embeddings)} vecteurs")
            return embeddings
            
        except Exception as e:
            context_logger.error(f"Erreur génération embeddings: {e}")
            raise
    
    async def analyze_context_semantics(self, context_id: str) -> Dict[str, Any]:
        """Analyse sémantique approfondie d'un contexte"""
        
        try:
            # Récupération du contexte
            context = await self.supabase.table("vector_contexts") \
                .select("*") \
                .eq("id", context_id) \
                .single() \
                .execute()
            
            if not context.data:
                raise ValueError(f"Contexte {context_id} non trouvé")
            
            context_data = context.data
            
            # Analyse avec GPT
            analysis_prompt = f"""
            Analyse ce contenu scientifique en détail:
            
            TYPE: {context_data['content_type']}
            DOMAINE: {context_data.get('scientific_domain', 'inconnu')}
            
            CONTENU:
            {context_data['content'][:3000]}...
            
            Fournis une analyse structurée avec:
            1. Concepts scientifiques principaux
            2. Méthodologies identifiées
            3. Résultats clés
            4. Limitations potentielles
            5. Applications possibles
            
            Format JSON.
            """
            
            response = await self.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {"role": "system", "content": "Analyste scientifique spécialisé"},
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature: 0.2,
                max_tokens: 1500,
                response_format: {"type": "json_object"}
            })
            
            analysis = response.choices[0].message.content
            
            # Mise à jour du contexte avec l'analyse
            await self.supabase.table("vector_contexts") \
                .update({
                    "metadata": {
                        **context_data.get("metadata", {}),
                        "semantic_analysis": analysis,
                        "analysis_date": datetime.utcnow().isoformat()
                    }
                }) \
                .eq("id", context_id) \
                .execute()
            
            return {
                "context_id": context_id,
                "analysis": analysis,
                "content_preview": context_data["content"][:500] + "...",
                "analyzed_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            context_logger.error(f"Erreur analyse sémantique: {e}")
            raise
    
    async def find_context_patterns(self, project_id: str) -> Dict[str, Any]:
        """Détecte des patterns dans les contextes d'un projet"""
        
        try:
            # Récupération de tous les contextes du projet
            contexts = await self.supabase.table("vector_contexts") \
                .select("*") \
                .eq("project_id", project_id) \
                .order("created_at", desc=True) \
                .limit(500) \
                .execute()
            
            if not contexts.data or len(contexts.data) < 5:
                return {
                    "project_id": project_id,
                    "patterns_found": 0,
                    "message": "Insuffisamment de données pour l'analyse de patterns"
                }
            
            # Analyse des patterns avec GPT
            patterns_prompt = f"""
            Analyse ces contextes scientifiques pour identifier des patterns:
            
            NOMBRE DE CONTEXTES: {len(contexts.data)}
            TYPES: {', '.join(set([c['content_type'] for c in contexts.data]))}
            
            CONTEXTES (extraits):
            {self._prepare_patterns_data(contexts.data)}
            
            Identifie:
            1. Thèmes récurrents
            2. Évolution dans le temps
            3. Gaps de connaissance
            4. Opportunités de recherche
            5. Recommandations pour la suite
            
            Format JSON.
            """
            
            response = await self.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {"role": "system", "content": "Expert en analyse de patterns scientifiques"},
                    {"role": "user", content: patterns_prompt}
                ],
                temperature: 0.3,
                max_tokens: 2000,
                response_format: {"type": "json_object"}
            })
            
            patterns = json.loads(response.choices[0].message.content)
            
            context_logger.info(f"Patterns détectés pour projet {project_id}")
            
            return {
                "project_id": project_id,
                "total_contexts_analyzed": len(contexts.data),
                "patterns": patterns,
                "analysis_date": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            context_logger.error(f"Erreur détection patterns: {e}")
            raise
    
    async def export_context_data(self, project_id: Optional[str] = None, 
                                format: str = "json") -> Dict[str, Any]:
        """Exporte les données de contexte"""
        
        try:
            # Construction de la requête
            query = self.supabase.table("vector_contexts").select("*")
            
            if project_id:
                query = query.eq("project_id", project_id)
            
            query = query.order("created_at", desc=True)
            
            contexts = await query.execute()
            
            if not contexts.data:
                return {
                    "exported": 0,
                    "message": "Aucune donnée à exporter"
                }
            
            # Préparation des données selon le format
            if format == "json":
                export_data = contexts.data
            elif format == "csv":
                export_data = self._convert_to_csv(contexts.data)
            else:
                raise ValueError(f"Format non supporté: {format}")
            
            context_logger.info(f"Export données contexte: {len(contexts.data)} éléments")
            
            return {
                "exported": len(contexts.data),
                "format": format,
                "data": export_data,
                "export_date": datetime.utcnow().isoformat(),
                "project_id": project_id or "all"
            }
            
        except Exception as e:
            context_logger.error(f"Erreur export données: {e}")
            raise
    
    async def _generate_embedding(self, text: str) -> List[float]:
        """Génère un embedding pour un texte"""
        
        # Vérification du cache
        cache_key = f"embedding_{hash(text[:1000])}"
        if cache_key in self.context_cache:
            cached = self.context_cache[cache_key]
            if (datetime.utcnow() - cached["timestamp"]).total_seconds() < self.cache_ttl:
                return cached["data"]
        
        # Génération via OpenAI
        response = await self.openai.embeddings.create(
            model="text-embedding-3-small",
            input=text[:8000],  # Limite de tokens
            encoding_format="float"
        )
        
        embedding = response.data[0].embedding
        
        # Mise en cache
        self.context_cache[cache_key] = {
            "data": embedding,
            "timestamp": datetime.utcnow()
        }
        
        return embedding
    
    async def _extract_scientific_metadata(self, content: str) -> Dict[str, Any]:
        """Extrait les métadonnées scientifiques d'un contenu"""
        
        metadata_prompt = f"""
        Analyse ce contenu scientifique et extrais les métadonnées:
        
        CONTENU: {content[:1500]}...
        
        Réponds en JSON avec:
        {{
            "domain": "cfd|heat_transfer|structural|electromagnetism|multiphysics|data_science|code",
            "physics_type": "navier_stokes|heat_equation|structural_mechanics|etc",
            "complexity_score": 1-10,
            "key_concepts": ["concept1", "concept2"],
            "scientific_quality": "high|medium|low",
            "requires_validation": true|false
        }}
        """
        
        try:
            response = await self.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {"role": "system", "content": "Extracteur de métadonnées scientifiques"},
                    {"role": "user", "content": metadata_prompt}
                ],
                temperature: 0.1,
                max_tokens: 500,
                response_format: {"type": "json_object"}
            })
            
            metadata = json.loads(response.choices[0].message.content)
            return metadata
            
        except Exception as e:
            context_logger.warning(f"Erreur extraction métadonnées: {e}")
            return {
                "domain": "unknown",
                "physics_type": "unknown",
                "complexity_score": 5,
                "key_concepts": [],
                "scientific_quality": "medium",
                "requires_validation": True
            }
    
    async def _enrich_search_results(self, results: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
        """Enrichit les résultats de recherche avec des insights IA"""
        
        if not results:
            return []
        
        enrichment_prompt = f"""
        Pour cette recherche scientifique: "{query}"
        
        Voici les résultats trouvés:
        {json.dumps(results[:3], indent=2)}
        
        Fournis pour chaque résultat:
        1. Pertinence par rapport à la requête
        2. Insights scientifiques clés
        3. Suggestions pour approfondir
        
        Format JSON.
        """
        
        try:
            response = await self.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {"role": "system", "content": "Expert en enrichissement de résultats scientifiques"},
                    {"role": "user", "content": enrichment_prompt}
                ],
                temperature: 0.2,
                max_tokens: 1000,
                response_format: {"type": "json_object"}
            })
            
            enrichments = json.loads(response.choices[0].message.content)
            
            # Fusion avec les résultats originaux
            enriched_results = []
            for i, result in enumerate(results):
                enrichment = enrichments.get(f"result_{i + 1}", {}) if isinstance(enrichments, dict) else {}
                
                enriched_results.append({
                    **result,
                    "ai_insights": enrichment,
                    "relevance_explained": enrichment.get("relevance", "Pertinence identifiée"),
                    "suggested_next_steps": enrichment.get("suggestions", [])
                })
            
            return enriched_results
            
        except Exception as e:
            context_logger.warning(f"Erreur enrichissement résultats: {e}")
            return results
    
    async def _generate_project_summary(self, contexts: List[Dict[str, Any]]) -> str:
        """Génère un résumé IA des contextes d'un projet"""
        
        summary_prompt = f"""
        Synthétise l'état d'avancement de ce projet scientifique basé sur ces contextes:
        
        NOMBRE DE CONTEXTES: {len(contexts)}
        
        CONTEXTES (types et extraits):
        {self._prepare_summary_data(contexts)}
        
        Crée un résumé structuré avec:
        1. Objectifs du projet
        2. Méthodologies utilisées
        3. Résultats obtenus
        4. Défis rencontrés
        5. Prochaines étapes recommandées
        
        Maximum 500 mots.
        """
        
        try:
            response = await self.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {"role": "system", "content": "Expert en synthèse de projets scientifiques"},
                    {"role": "user", "content": summary_prompt}
                ],
                temperature: 0.3,
                max_tokens: 1000
            })
            
            return response.choices[0].message.content
            
        except Exception as e:
            context_logger.warning(f"Erreur génération résumé: {e}")
            return "Résumé non disponible pour le moment."
    
    def _calculate_context_statistics(self, contexts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calcule des statistiques sur les contextes"""
        
        if not contexts:
            return {}
        
        stats = {
            "total": len(contexts),
            "by_type": {},
            "by_domain": {},
            "timeline": {},
            "complexity_distribution": {},
            "quality_distribution": {}
        }
        
        for context in contexts:
            # Par type
            ctx_type = context.get("content_type", "unknown")
            stats["by_type"][ctx_type] = stats["by_type"].get(ctx_type, 0) + 1
            
            # Par domaine scientifique
            domain = context.get("scientific_domain", "unknown")
            stats["by_domain"][domain] = stats["by_domain"].get(domain, 0) + 1
            
            # Par date (mois)
            created_at = context.get("created_at")
            if created_at:
                month = created_at[:7]  # YYYY-MM
                stats["timeline"][month] = stats["timeline"].get(month, 0) + 1
            
            # Distribution de complexité
            complexity = context.get("complexity_score", 5)
            complexity_range = f"{(complexity // 2) * 2}-{((complexity // 2) * 2) + 2}"
            stats["complexity_distribution"][complexity_range] = \
                stats["complexity_distribution"].get(complexity_range, 0) + 1
        
        return stats
    
    def _prepare_patterns_data(self, contexts: List[Dict[str, Any]]) -> str:
        """Prépare les données pour l'analyse de patterns"""
        
        grouped = {}
        for context in contexts[:20]:  # Limiter pour le prompt
            ctx_type = context.get("content_type", "unknown")
            if ctx_type not in grouped:
                grouped[ctx_type] = []
            
            grouped[ctx_type].append({
                "preview": context["content"][:200] + "...",
                "date": context.get("created_at", ""),
                "domain": context.get("scientific_domain", "unknown")
            })
        
        return json.dumps(grouped, indent=2)
    
    def _prepare_summary_data(self, contexts: List[Dict[str, Any]]) -> str:
        """Prépare les données pour le résumé"""
        
        samples = []
        for context in contexts[:15]:  # Échantillon représentatif
            samples.append({
                "type": context.get("content_type", "unknown"),
                "domain": context.get("scientific_domain", "unknown"),
                "date": context.get("created_at", ""),
                "preview": context["content"][:150] + "..."
            })
        
        return json.dumps(samples, indent=2)
    
    def _convert_to_csv(self, data: List[Dict[str, Any]]) -> str:
        """Convertit les données en format CSV"""
        
        if not data:
            return ""
        
        # Extraction des colonnes
        columns = set()
        for item in data:
            columns.update(item.keys())
        
        columns = sorted(columns)
        
        # Construction du CSV
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=columns)
        
        writer.writeheader()
        for item in data:
            # Nettoyage des valeurs
            cleaned_item = {}
            for key in columns:
                value = item.get(key)
                if isinstance(value, (dict, list)):
                    value = json.dumps(value)
                cleaned_item[key] = value
            
            writer.writerow(cleaned_item)
        
        return output.getvalue()
