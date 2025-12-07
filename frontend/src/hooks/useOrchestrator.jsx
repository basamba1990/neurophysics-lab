import { useState, useCallback } from 'react'
import apiClient from '../services/api'
import { useWebSocket } from './useWebSocket'

export function useOrchestrator() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { connect, disconnect, sendMessage, status } = useWebSocket()
  
  const analyzeScientificProblem = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.post('/orchestrator/analyze', data)
      
      // Connexion WebSocket pour le suivi en temps réel
      if (response.execution_plan) {
        connect(`ws://localhost:8000/ws/orchestrator/${response.orchestration_id}`)
      }
      
      return response
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [connect])
  
  const executePlan = useCallback(async (plan, projectId) => {
    setLoading(true)
    
    try {
      const response = await apiClient.post('/orchestrator/execute-plan', {
        plan,
        project_id: projectId
      })
      
      return response
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  const getStatus = useCallback(async (executionId) => {
    try {
      const response = await apiClient.get(`/orchestrator/status/${executionId}`)
      return response
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
      throw err
    }
  }, [])
  
  const getResults = useCallback(async (orchestrationId) => {
    setLoading(true)
    
    try {
      const response = await apiClient.get(`/orchestrator/results/${orchestrationId}`)
      return response
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  const provideFeedback = useCallback(async (orchestrationId, feedback) => {
    try {
      const response = await apiClient.post(
        `/orchestrator/feedback/${orchestrationId}`,
        feedback
      )
      return response
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
      throw err
    }
  }, [])
  
  return {
    loading,
    error,
    analyzeScientificProblem,
    executePlan,
    getStatus,
    getResults,
    provideFeedback,
    websocketStatus: status
  }
}
