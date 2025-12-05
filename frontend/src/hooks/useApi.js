import { useState, useCallback } from 'react'
import apiClient from '../services/api'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const execute = useCallback(async (apiCall, ...args) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall(...args)
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset: () => {
      setError(null)
      setData(null)
    },
  }
}

// Specific hooks for different functionalities
export function usePinnSolver() {
  const { execute, ...state } = useApi()

  const createPhysicsModel = useCallback((modelData) => 
    execute(apiClient.createPhysicsModel, modelData), [execute])

  const createSimulation = useCallback((simulationData) => 
    execute(apiClient.createSimulation, simulationData), [execute])

  const getPhysicsModels = useCallback(() => 
    execute(apiClient.getPhysicsModels), [execute])

  const getSimulations = useCallback(() => 
    execute(apiClient.getSimulations), [execute])

  const getSimulation = useCallback((simulationId) => 
    execute(apiClient.getSimulation, simulationId), [execute])

  return {
    ...state,
    createPhysicsModel,
    createSimulation,
    getPhysicsModels,
    getSimulations,
    getSimulation,
  }
}

export function useCopilot() {
  const { execute, ...state } = useApi()

  const analyzeCode = useCallback((codeData) => 
    execute(apiClient.analyzeCode, codeData), [execute])

  const modernizeFortran = useCallback((codeData) => 
    execute(apiClient.modernizeFortran, codeData), [execute])

  const validatePhysics = useCallback((codeData) => 
    execute(apiClient.validatePhysics, codeData), [execute])

  const getSupportedLanguages = useCallback(() => 
    execute(apiClient.getSupportedLanguages), [execute])

  return {
    ...state,
    analyzeCode,
    modernizeFortran,
    validatePhysics,
    getSupportedLanguages,
  }
}

export function useDigitalTwins() {
  const { execute, ...state } = useApi()

  const createDigitalTwin = useCallback((twinData) => 
    execute(apiClient.createDigitalTwin, twinData), [execute])

  const getDigitalTwins = useCallback(() => 
    execute(apiClient.getDigitalTwins), [execute])

  const runOptimization = useCallback((optimizationData) => 
    execute(apiClient.runOptimization, optimizationData), [execute])

  const getTwinPerformance = useCallback((twinId) => 
    execute(apiClient.getTwinPerformance, twinId), [execute])

  const getOptimizationMethods = useCallback(() => 
    execute(apiClient.getOptimizationMethods), [execute])

  return {
    ...state,
    createDigitalTwin,
    getDigitalTwins,
    runOptimization,
    getTwinPerformance,
    getOptimizationMethods,
  }
}

export function useAnalytics() {
  const { execute, ...state } = useApi()

  const getUsageMetrics = useCallback(() => 
    execute(apiClient.getUsageMetrics), [execute])

  const getPerformanceAnalytics = useCallback(() => 
    execute(apiClient.getPerformanceAnalytics), [execute])

  const getSimulationMetrics = useCallback(() => 
    execute(apiClient.getSimulationMetrics), [execute])

  const getCostAnalytics = useCallback(() => 
    execute(apiClient.getCostAnalytics), [execute])

  return {
    ...state,
    getUsageMetrics,
    getPerformanceAnalytics,
    getSimulationMetrics,
    getCostAnalytics,
  }
}

export function useOrganization() {
  const { execute, ...state } = useApi()

  const getMyOrganization = useCallback(() => 
    execute(apiClient.getMyOrganization), [execute])

  const getTeamMembers = useCallback(() => 
    execute(apiClient.getTeamMembers), [execute])

  const getSubscriptionInfo = useCallback(() => 
    execute(apiClient.getSubscriptionInfo), [execute])

  return {
    ...state,
    getMyOrganization,
    getTeamMembers,
    getSubscriptionInfo,
  }
}
