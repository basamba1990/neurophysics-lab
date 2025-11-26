import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Simulation, PhysicsModel, DigitalTwin, AuthState } from '@/types'
import { apiClient } from './api'

interface AppState {
  // Auth state
  auth: AuthState
  user: User | null
  token: string | null
  
  // Data state
  physicsModels: PhysicsModel[]
  simulations: Simulation[]
  digitalTwins: DigitalTwin[]
  
  // UI state
  sidebarOpen: boolean
  currentView: string
  loading: boolean
  error: string | null
  
  // Actions
  setAuth: (user: User | null, token: string | null) => void
  logout: () => void
  setSidebarOpen: (open: boolean) => void
  setCurrentView: (view: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Data actions
  setPhysicsModels: (models: PhysicsModel[]) => void
  setSimulations: (simulations: Simulation[]) => void
  setDigitalTwins: (twins: DigitalTwin[]) => void
  addSimulation: (simulation: Simulation) => void
  updateSimulation: (id: string, updates: Partial<Simulation>) => void
  
  // Async actions
  initializeAuth: () => Promise<void>
  loadPhysicsModels: () => Promise<void>
  loadSimulations: () => Promise<void>
  loadDigitalTwins: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
      },
      user: null,
      token: null,
      physicsModels: [],
      simulations: [],
      digitalTwins: [],
      sidebarOpen: true,
      currentView: 'dashboard',
      loading: false,
      error: null,

      // Sync actions
      setAuth: (user, token) => {
        set({
          user,
          token,
          auth: {
            user,
            token,
            isAuthenticated: !!user && !!token,
            isLoading: false,
          },
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          auth: {
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          },
          physicsModels: [],
          simulations: [],
          digitalTwins: [],
        })
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open })
      },

      setCurrentView: (view) => {
        set({ currentView: view })
      },

      setLoading: (loading) => {
        set({ loading })
      },

      setError: (error) => {
        set({ error })
      },

      setPhysicsModels: (models) => {
        set({ physicsModels: models })
      },

      setSimulations: (simulations) => {
        set({ simulations })
      },

      setDigitalTwins: (twins) => {
        set({ digitalTwins: twins })
      },

      addSimulation: (simulation) => {
        set((state) => ({
          simulations: [...state.simulations, simulation],
        }))
      },

      updateSimulation: (id, updates) => {
        set((state) => ({
          simulations: state.simulations.map((sim) =>
            sim.id === id ? { ...sim, ...updates } : sim
          ),
        }))
      },

      // Async actions
      initializeAuth: async () => {
        try {
          const token = localStorage.getItem('auth_token')
          const userStr = localStorage.getItem('user')

          if (token && userStr) {
            const user = JSON.parse(userStr)
            set({
              user,
              token,
              auth: {
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
              },
            })
          } else {
            set({
              auth: {
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
              },
            })
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          set({
            auth: {
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            },
          })
        }
      },

      loadPhysicsModels: async () => {
        try {
          set({ loading: true, error: null })
          const models = await apiClient.getPhysicsModels()
          set({ physicsModels: models, loading: false })
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to load physics models',
            loading: false 
          })
        }
      },

      loadSimulations: async () => {
        try {
          set({ loading: true, error: null })
          const simulations = await apiClient.getSimulations()
          set({ simulations, loading: false })
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to load simulations',
            loading: false 
          })
        }
      },

      loadDigitalTwins: async () => {
        try {
          set({ loading: true, error: null })
          const twins = await apiClient.getDigitalTwins()
          set({ digitalTwins: twins, loading: false })
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to load digital twins',
            loading: false 
          })
        }
      },
    }),
    {
      name: 'rd-accelerator-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        sidebarOpen: state.sidebarOpen,
        currentView: state.currentView,
      }),
    }
  )
)

// Selector hooks for better performance
export const useAuth = () => useAppStore((state) => state.auth)
export const useUser = () => useAppStore((state) => state.user)
export const usePhysicsModels = () => useAppStore((state) => state.physicsModels)
export const useSimulations = () => useAppStore((state) => state.simulations)
export const useDigitalTwins = () => useAppStore((state) => state.digitalTwins)
export const useSidebar = () => useAppStore((state) => state.sidebarOpen)
export const useLoading = () => useAppStore((state) => state.loading)
export const useError = () => useAppStore((state) => state.error)
