// User and Authentication
export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  expertise_area?: Record<string, string>
  created_at: string
}

export type UserRole = 'admin' | 'lead' | 'engineer' | 'viewer'

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Physics Models
export interface PhysicsModel {
  id: string
  name: string
  physics_type: PhysicsType
  equations: Record<string, any>
  boundary_conditions: Record<string, any>
  mesh_config?: Record<string, any>
  created_at: string
}

export type PhysicsType = 
  | 'navier_stokes' 
  | 'heat_transfer' 
  | 'structural' 
  | 'turbulence' 
  | 'multiphysics'

// Simulations
export interface Simulation {
  id: string
  name: string
  status: SimulationStatus
  physics_model_id: string
  input_parameters: Record<string, any>
  geometry_data?: Record<string, any>
  pinn_predictions?: Record<string, any>
  convergence_metrics?: Record<string, any>
  execution_time?: number
  created_at: string
  completed_at?: string
}

export type SimulationStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed'

// Scientific Copilot
export interface CodeAnalysisRequest {
  code: string
  language: ProgrammingLanguage
  context?: Record<string, any>
  analysis_type: AnalysisType
}

export interface CodeSuggestion {
  original_code: string
  suggested_code: string
  explanation: string
  confidence_score: number
  boundary_conditions_check?: Record<string, any>
}

export interface CodeAnalysisResponse {
  suggestions: CodeSuggestion[]
  warnings: string[]
  performance_metrics?: Record<string, any>
}

export type ProgrammingLanguage = 
  | 'fortran' 
  | 'python' 
  | 'cpp' 
  | 'matlab'

export type AnalysisType = 
  | 'modernization' 
  | 'debug' 
  | 'optimization' 
  | 'physics_validation'

// Digital Twins
export interface DigitalTwin {
  id: string
  name: string
  system_type: string
  optimization_objectives: Record<string, string>
  constraints: Record<string, any>
  parameters_space: Record<string, any>
  surrogate_model_config: Record<string, any>
  current_performance_metrics: Record<string, any>
  created_at: string
}

export interface OptimizationRequest {
  digital_twin_id: string
  parameters: Record<string, any>
  objectives: string[]
}

// Analytics
export interface UsageMetrics {
  pinn_simulations_this_month: number
  copilot_requests_this_month: number
  storage_used_mb: number
  subscription_usage: Record<string, any>
}

export interface PerformanceAnalytics {
  average_simulation_time: number
  success_rate: number
  most_used_physics_models: string[]
  resource_utilization: Record<string, number>
}

// API Responses
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// Visualization Data
export interface VisualizationData {
  points: number[][]
  fields: Record<string, number[]>
  metadata: Record<string, any>
}

export interface ConvergenceMetrics {
  loss_history: number[]
  initial_loss: number
  final_loss: number
  improvement_ratio: number
  convergence_rate: number
}

// Form Types
export interface SimulationFormData {
  name: string
  physics_model_id: string
  input_parameters: Record<string, any>
  geometry_data?: Record<string, any>
}

export interface CodeAnalysisFormData {
  code: string
  language: ProgrammingLanguage
  context: Record<string, any>
  analysis_type: AnalysisType
}

// WebSocket Events
export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: string
}

export interface SimulationProgressMessage {
  simulation_id: string
  status: SimulationStatus
  progress: number
  current_loss?: number
  system_metrics?: Record<string, any>
}
