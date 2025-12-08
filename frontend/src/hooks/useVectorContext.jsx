// frontend/src/hooks/useVectorContext.jsx

import React, { createContext, useState, useCallback, useContext } from 'react';
import vectorContextService from '../services/vectorContext';
import { logger } from '../utils/logger';

// Création du context
export const VectorContext = createContext();

// Provider à utiliser dans ton app
export const VectorProvider = ({ children }) => {
  const [contextId, setContextId] = useState('session_default_123'); 
  const [contextData, setContextData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchContext = useCallback(
    async (query) => {
      setIsLoading(true);
      try {
        const response = await vectorContextService.search(query, contextId);
        logger.info('Résultats de la recherche vectorielle:', response.results);
        setContextData(response.results);
        return response.results;
      } catch (error) {
        logger.error('Erreur lors de la recherche de contexte:', error);
        setContextData([]);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [contextId]
  );

  const updateContext = useCallback(
    async (data) => {
      try {
        const response = await vectorContextService.updateContext(contextId, data);
        logger.info('Mise à jour du contexte réussie:', response);
        return response;
      } catch (error) {
        logger.error('Erreur lors de la mise à jour du contexte:', error);
      }
    },
    [contextId]
  );

  return (
    <VectorContext.Provider
      value={{
        contextId,
        setContextId,
        contextData,
        searchContext,
        updateContext,
        isLoading
      }}
    >
      {children}
    </VectorContext.Provider>
  );
};

// Hook pour utiliser le context facilement
export const useVectorContext = () => useContext(VectorContext);


