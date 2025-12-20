import { supabase } from './supabase'

// Le nom de la fonction Edge principale (l'orchestrateur)
const ORCHESTRATOR_FUNCTION_NAME = 'neurophysics-orchestrator'

class ApiClient {
  // Scientific Copilot endpoints
  async analyzeCode(codeData) {
    // Transformation du body du frontend pour correspondre à l'attente de l'orchestrateur: { request, context_id }
    const requestPayload = {
      request: `Analyse le code suivant: ${codeData.code} en ${codeData.language}. Contexte physique: ${JSON.stringify(codeData.context.physics_context)}`,
      context_id: codeData.context_id || 'default-copilot-context', 
    }
    
    const { data, error } = await supabase.functions.invoke(ORCHESTRATOR_FUNCTION_NAME, {
      body: requestPayload,
      method: 'POST',
    })

    if (error) throw error
    return data
  }

  async modernizeFortran(codeData) {
    const requestPayload = {
      request: `Modernise le code Fortran suivant en Python: ${codeData.code}. Contexte physique: ${JSON.stringify(codeData.context.physics_context)}`,
      context_id: codeData.context_id || 'default-copilot-context',
    }
    
    const { data, error } = await supabase.functions.invoke(ORCHESTRATOR_FUNCTION_NAME, {
      body: requestPayload,
      method: 'POST',
    })

    if (error) throw error
    return data
  }
  
  // Stubs pour éviter les erreurs dans le reste de l'application (les autres endpoints utilisaient axios)
  async login() { return { success: true } }
  async register() { return { success: true } }
  async logout() { return { success: true } }
  async getCurrentUser() { return { user: 'stub_user' } }
  async createPhysicsModel() { return { id: 1 } }
  async getPhysicsModels() { return [] }
  async createSimulation() { return { id: 1 } }
  async getSimulation() { return {} }
  async getSimulations() { return [] }
  async validatePhysics() { return {} }
  async getSupportedLanguages() { return ['fortran', 'cpp', 'python'] }
  async createDigitalTwin() { return { id: 1 } }
  async getDigitalTwins() { return [] }
  async runOptimization() { return {} }
  async getTwinPerformance() { return {} }
  async getOptimizationMethods() { return [] }
  async getUsageMetrics() { return {} }
  async getPerformanceAnalytics() { return {} }
  async getSimulationMetrics() { return {} }
  async getCostAnalytics() { return {} }
  async getMyOrganization() { return {} }
  async getTeamMembers() { return [] }
  async getSubscriptionInfo() { return {} }
  async healthCheck() { return { status: 'ok' } }
  async apiStatus() { return { status: 'ok' } }
}

export default new ApiClient()
