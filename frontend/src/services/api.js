import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    })

    this.setupInterceptors()
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.client.post('/api/v1/auth/login', {
      email,
      password,
    })
    return response.data
  }

  async register(userData) {
    const response = await this.client.post('/api/v1/auth/register', userData)
    return response.data
  }

  async logout() {
    const response = await this.client.post('/api/v1/auth/logout')
    localStorage.removeItem('access_token')
    return response.data
  }

  async getCurrentUser() {
    const response = await this.client.get('/api/v1/auth/me')
    return response.data
  }

  // PINN Solver endpoints
  async createPhysicsModel(modelData) {
    const response = await this.client.post('/api/v1/pinn/physics-models', modelData)
    return response.data
  }

  async getPhysicsModels() {
    const response = await this.client.get('/api/v1/pinn/physics-models')
    return response.data
  }

  async createSimulation(simulationData) {
    const response = await this.client.post('/api/v1/pinn/simulations', simulationData)
    return response.data
  }

  async getSimulation(simulationId) {
    const response = await this.client.get(`/api/v1/pinn/simulations/${simulationId}`)
    return response.data
  }

  async getSimulations() {
    const response = await this.client.get('/api/v1/pinn/simulations')
    return response.data
  }

  // Scientific Copilot endpoints
  async analyzeCode(codeData) {
    const response = await this.client.post('/api/v1/copilot/analyze-code', codeData)
    return response.data
  }

  async modernizeFortran(codeData) {
    const response = await this.client.post('/api/v1/copilot/modernize-fortran', codeData)
    return response.data
  }

  async validatePhysics(codeData) {
    const response = await this.client.post('/api/v1/copilot/validate-physics', codeData)
    return response.data
  }

  async getSupportedLanguages() {
    const response = await this.client.get('/api/v1/copilot/supported-languages')
    return response.data
  }

  // Digital Twins endpoints
  async createDigitalTwin(twinData) {
    const response = await this.client.post('/api/v1/digital-twins/digital-twins', twinData)
    return response.data
  }

  async getDigitalTwins() {
    const response = await this.client.get('/api/v1/digital-twins/digital-twins')
    return response.data
  }

  async runOptimization(optimizationData) {
    const response = await this.client.post('/api/v1/digital-twins/optimize', optimizationData)
    return response.data
  }

  async getTwinPerformance(twinId) {
    const response = await this.client.get(`/api/v1/digital-twins/digital-twins/${twinId}/performance`)
    return response.data
  }

  async getOptimizationMethods() {
    const response = await this.client.get('/api/v1/digital-twins/optimization-methods')
    return response.data
  }

  // Analytics endpoints
  async getUsageMetrics() {
    const response = await this.client.get('/api/v1/analytics/usage-metrics')
    return response.data
  }

  async getPerformanceAnalytics() {
    const response = await this.client.get('/api/v1/analytics/performance-analytics')
    return response.data
  }

  async getSimulationMetrics() {
    const response = await this.client.get('/api/v1/analytics/simulation-metrics')
    return response.data
  }

  async getCostAnalytics() {
    const response = await this.client.get('/api/v1/analytics/cost-analytics')
    return response.data
  }

  // Organization endpoints
  async getMyOrganization() {
    const response = await this.client.get('/api/v1/org/my-organization')
    return response.data
  }

  async getTeamMembers() {
    const response = await this.client.get('/api/v1/org/team-members')
    return response.data
  }

  async getSubscriptionInfo() {
    const response = await this.client.get('/api/v1/org/subscription')
    return response.data
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get('/health')
    return response.data
  }

  async apiStatus() {
    const response = await this.client.get('/api/v1/status')
    return response.data
  }
}

export default new ApiClient()
