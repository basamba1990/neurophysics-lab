from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from orchestration.context_manager import ContextManager
from utils.logger import logger

router = APIRouter(
    prefix="/vector_db",
    tags=["Vector Database"],
    responses={404: {"description": "Not found"}},
)

# Utilisation du ContextManager pour simuler l'accès à la base vectorielle
context_manager = ContextManager()

@router.post("/search")
async def search_vector_db(search_data: Dict[str, Any]):
    """
    Endpoint pour effectuer une recherche vectorielle.
    """
    query = search_data.get("query")
    context_id = search_data.get("context_id")
    
    if not query:
        raise HTTPException(status_code=400, detail="Le champ 'query' est obligatoire.")

    logger.info(f"Recherche vectorielle pour: {query}")
    
    try:
        # Le ContextManager simule la recherche
        results = await context_manager.retrieve_context(query, context_id)
        
        # On ne retourne que les documents pertinents pour simuler une recherche
        return {"query": query, "results": results.get("relevant_documents", [])}
        
    except Exception as e:
        logger.error(f"Erreur lors de la recherche vectorielle: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la recherche: {e}")

@router.post("/update_context")
async def update_vector_context(update_data: Dict[str, Any]):
    """
    Endpoint pour mettre à jour le contexte vectoriel (ajouter de nouveaux documents/résultats).
    """
    context_id = update_data.get("context_id")
    new_data = update_data.get("data")
    
    if not context_id or not new_data:
        raise HTTPException(status_code=400, detail="Les champs 'context_id' et 'data' sont obligatoires.")

    logger.info(f"Mise à jour du contexte vectoriel pour ID: {context_id}")
    
    try:
        # Le ContextManager simule la mise à jour
        await context_manager.update_context(context_id, new_data)
        return {"status": "success", "message": f"Contexte {context_id} mis à jour (simulé)."}
        
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du contexte: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la mise à jour: {e}")
