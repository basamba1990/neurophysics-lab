import React, { useState, useCallback, useContext, createContext } from 'react';
import apiClient from '../services/api';
import { useWebSocket } from './useWebSocket';

// 1. Créer le Contexte
const OrchestratorContext = createContext(null);

// 2. Créer le Hook personnalisé
export function useOrchestrator() {
  const context = useContext(OrchestratorContext);
  if (!context) {
    throw new Error('useOrchestrator must be used within an OrchestratorProvider');
  }
  return context;
}

// 3. Créer le Provider
export function OrchestratorProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { connect, disconnect, sendMessage, status } = useWebSocket();

  // Analyse d’un problème scientifique
  const analyzeScientificProblem = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post('/orchestrator/analyze', data);

        // Connexion WebSocket pour le suivi en temps réel
        if (response.execution_plan) {
          connect(
            `ws://localhost:8000/ws/orchestrator/${response.orchestration_id}`
          );
        }

        return response;
      } catch (err) {
        setError(err.response?.data?.detail || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connect]
  );

  // Exécution d’un plan
  const executePlan = useCallback(async (plan, projectId) => {
    setLoading(true);

    try {
      const response = await apiClient.post('/orchestrator/execute-plan', {
        plan,
        project_id: projectId,
      });

      return response;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupération du statut d’une exécution
  const getStatus = useCallback(async (executionId) => {
    try {
      const response = await apiClient.get(`/orchestrator/status/${executionId}`);
      return response;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    }
  }, []);

  // Récupération des résultats
  const getResults = useCallback(async (orchestrationId) => {
    setLoading(true);

    try {
      const response = await apiClient.get(`/orchestrator/results/${orchestrationId}`);
      return response;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fournir un feedback
  const provideFeedback = useCallback(async (orchestrationId, feedback) => {
    try {
      const response = await apiClient.post(
        `/orchestrator/feedback/${orchestrationId}`,
        feedback
      );
      return response;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    }
  }, []);

  const value = {
    loading,
    error,
    analyzeScientificProblem,
    executePlan,
    getStatus,
    getResults,
    provideFeedback,
    websocketStatus: status,
    connect,
    disconnect,
    sendMessage,
  };

  return (
    <OrchestratorContext.Provider value={value}>
      {children}
    </OrchestratorContext.Provider>
  );
}
