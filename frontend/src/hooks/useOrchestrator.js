import React, { createContext, useContext, useState, useCallback } from 'react';
import orchestratorService from '../services/orchestrator';
import { logger } from '../../utils/logger';

const OrchestratorContext = createContext();

export const OrchestratorProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [latestPlan, setLatestPlan] = useState(null);
  const [latestResult, setLatestResult] = useState(null);

  const sendMessage = useCallback(async (request, contextId) => {
    if (isLoading) return;

    const userMessage = { sender: 'user', text: request };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await orchestratorService.processRequest(request, contextId);
      logger.info('Réponse de l\'orchestrateur:', response);

      const orchestratorMessage = {
        sender: 'orchestrator',
        text: response.result,
        plan: response.plan,
        status: response.status,
      };

      setMessages(prev => [...prev, orchestratorMessage]);
      setLatestPlan(response.plan);
      setLatestResult(response);

    } catch (error) {
      logger.error('Erreur lors de l\'envoi à l\'orchestrateur:', error);
      const errorMessage = {
        sender: 'orchestrator',
        text: `Erreur: Impossible de traiter la requête. ${error.response?.data?.detail || error.message}`,
        status: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <OrchestratorContext.Provider value={{ messages, sendMessage, isLoading, latestPlan, latestResult }}>
      {children}
    </OrchestratorContext.Provider>
  );
};

export const useOrchestrator = () => {
  const context = useContext(OrchestratorContext);
  if (!context) {
    throw new Error('useOrchestrator doit être utilisé à l\'intérieur d\'un OrchestratorProvider');
  }
  return context;
};
