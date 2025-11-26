import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { 
  User, 
  PhysicsModel, 
  Simulation, 
  CodeAnalysisResponse,
  DigitalTwin,
  UsageMetrics,
  PerformanceAnalytics,
  ApiResponse 
} from '@/types'

class ApiClient {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized()
        }
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  private handleUnauthorized() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  }

  // Auth API
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = 
      await this.client.post('/api/v1/auth/login', { email, password })
    
    if (response.data.data) {
      const { user, token } = response.data.data
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
      return { user, token }
    }
    
    throw new Error(response.data.error || 'Login failed')
  }

  async register(userData: {
    email: string
    password: string
    full_name: string
    expertise_area?: Record<string, string>
  }): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = 
      await this.client.post('/api/v1/auth/register', userData)
    
    if (response.data.data) {
      const { user, token } = response.data.data
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
      return { user, token }
    }
    
    throw new Error(response.data.error || 'Registration failed')
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/v1/auth/logout')
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      }
    }
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = 
      await this.client.get('/api/v1/auth/me')
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to get user')
  }

  // Physics Models API
  async getPhysicsModels(): Promise<PhysicsModel[]> {
    const response: AxiosResponse<ApiResponse<PhysicsModel[]>> = 
      await this.client.get('/api/v1/pinn/physics-models')
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to fetch physics models')
  }

  async createPhysicsModel(modelData: {
    name: string
    physics_type: string
    equations: Record<string, any>
    boundary_conditions: Record<string, any>
    mesh_config?: Record<string, any>
  }): Promise<PhysicsModel> {
    const response: AxiosResponse<ApiResponse<PhysicsModel>> = 
      await this.client.post('/api/v1/pinn/physics-models', modelData)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to create physics model')
  }

  // Simulations API
  async getSimulations(): Promise<Simulation[]> {
    const response: AxiosResponse<ApiResponse<Simulation[]>> = 
      await this.client.get('/api/v1/pinn/simulations')
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to fetch simulations')
  }

  async getSimulation(id: string): Promise<Simulation> {
    const response: AxiosResponse<ApiResponse<Simulation>> = 
      await this.client.get(`/api/v1/pinn/simulations/${id}`)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to fetch simulation')
  }

  async createSimulation(simulationData: {
    physics_model_id: string
    name: string
    input_parameters: Record<string, any>
    geometry_data?: Record<string, any>
  }): Promise<Simulation> {
    const response: AxiosResponse<ApiResponse<Simulation>> = 
      await this.client.post('/api/v1/pinn/simulations', simulationData)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to create simulation')
  }

  // Scientific Copilot API
  async analyzeCode(request: {
    code: string
    language: string
    context?: Record<string, any>
    analysis_type: string
  }): Promise<CodeAnalysisResponse> {
    const response: AxiosResponse<ApiResponse<CodeAnalysisResponse>> = 
      await this.client.post('/api/v1/copilot/analyze-code', request)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to analyze code')
  }

  async modernizeFortranCode(code: string, context?: Record<string, any>): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.client.post('/api/v1/copilot/modernize-fortran', {
        code,
        context,
        language: 'fortran',
        analysis_type: 'modernization'
      })
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to modernize code')
  }

  async validatePhysicsConstraints(code: string, context?: Record<string, any>): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.client.post('/api/v1/copilot/validate-physics', {
        code,
        context,
        language: 'python',
        analysis_type: 'physics_validation'
      })
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to validate physics')
  }

  // Digital Twins API
  async getDigitalTwins(): Promise<DigitalTwin[]> {
    const response: AxiosResponse<ApiResponse<DigitalTwin[]>> = 
      await this.client.get('/api/v1/digital-twins/digital-twins')
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to fetch digital twins')
  }

  async createDigitalTwin(twinData: {
    name: string
    system_type: string
    optimization_objectives: Record<string, string>
    constraints: Record<string, any>
    parameters_space: Record<string, any>
  }): Promise<DigitalTwin> {
    const response: AxiosResponse<ApiResponse<DigitalTwin>> = 
      await this.client.post('/api/v1/digital-twins/digital-twins', twinData)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to create digital twin')
  }

  async runOptimization(request: {
    digital_twin_id: string
    parameters: Record<string, any>
    objectives: string[]
  }): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.client.post('/api/v1/digital-twins/optimize', request)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to run optimization')
  }

  // Analytics API
  async getUsageMetrics(): Promise<UsageMetrics> {
    const response: AxiosResponse<ApiResponse<UsageMetrics>> = 
      await this.client.get('/api/v1/analytics/usage-metrics')
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to fetch usage metrics')
  }

  async getPerformanceAnalytics(): Promise<PerformanceAnalytics> {
    const response: AxiosResponse<ApiResponse<PerformanceAnalytics>> = 
      await this.client.get('/api/v1/analytics/performance-analytics')
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to fetch performance analytics')
  }

  // File Upload
  async uploadFile(file: File, endpoint: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    const response: AxiosResponse<ApiResponse<any>> = 
      await this.client.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'File upload failed')
  }

  // WebSocket connection for real-time updates
  getWebSocketUrl(): string {
    const baseUrl = this.baseURL.replace('http', 'ws')
    return `${baseUrl}/ws`
  }
}

export const apiClient = new ApiClient()
