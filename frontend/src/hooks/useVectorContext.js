import React, { createContext, useContext, useState, useCallback } from 'react';
import vectorContextService from '../services/vectorContext';
import { logger } from '../../utils/logger';

const VectorContext = createContext();

export const VectorContextProvider = ({ children }) => {
  const [contextId, setContextId] = useState('session_default_123'); // ID de session par défaut
  const [contextData, setContextData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchContext = useCallback(async (query) => {
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
  }, [contextId]);

  const updateContext = useCallback(async (data) => {
    try {
      const response = await vectorContextService.updateContext(contextId, data);
      logger.info('Mise à jour du contexte réussie:', response);
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du contexte:', error);
    }
  }, [contextId]);

  return (
    <VectorContext.Provider value={{ contextId, setContextId, contextData, searchContext, updateContext, isLoading }}>
      {children}
    </VectorContext.Provider>
  );
};

export const useVectorContext = () => {
  const context = useContext(VectorContext);
  if (!context) {
    throw new Error('useVectorContext doit être utilisé à l\'intérieur d\'un VectorContextProvider');
  }
  return context;
};
