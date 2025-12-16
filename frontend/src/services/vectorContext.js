import api from './api';

/**
 * Service pour interagir avec l'API de la base de données vectorielle.
 */
const vectorContextService = {
  /**
   * Effectue une recherche vectorielle.
   * @param {string} query - La requête de recherche.
   * @param {string} [contextId] - L'ID du contexte.
   * @returns {Promise<object>} Les résultats de la recherche.
   */
  search: async (query, contextId) => {
    const payload = {
      query: query,
      context_id: contextId,
    };
    const response = await api.post('/vector_db/search', payload);
    return response.data;
  },

  /**
   * Met à jour le contexte vectoriel.
   * @param {string} contextId - L'ID du contexte à mettre à jour.
   * @param {object} data - Les nouvelles données à ajouter.
   * @returns {Promise<object>} Le statut de la mise à jour.
   */
  updateContext: async (contextId, data) => {
    const payload = {
      context_id: contextId,
      data: data,
    };
    const response = await api.post('/vector_db/update_context', payload);
    return response.data;
  },
};

export default vectorContextService;
