import api from './api';

/**
 * Service pour interagir avec l'API de l'Orchestrateur.
 */
const orchestratorService = {
  /**
   * Soumet une requête à l'orchestrateur pour traitement.
   * @param {string} request - La requête utilisateur.
   * @param {string} [contextId] - L'ID du contexte vectoriel.
   * @returns {Promise<object>} Le résultat de l'orchestration.
   */
  processRequest: async (request, contextId) => {
    const payload = {
      request: request,
      context_id: contextId,
    };
    const response = await api.post('/orchestrator/process', payload);
    return response.data;
  },

  /**
   * Récupère le statut d'une session d'orchestration.
   * @param {string} contextId - L'ID du contexte.
   * @returns {Promise<object>} Le statut de la session.
   */
  getStatus: async (contextId) => {
    const response = await api.get(`/orchestrator/status/${contextId}`);
    return response.data;
  },
};

export default orchestratorService;
