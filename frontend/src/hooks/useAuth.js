import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../services/supabase'
import apiClient from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check active session on load
    const checkSession = async () => {
      try {
        const { data: { session } } = await auth.session
        if (session) {
          setUser(session.user)
          // Store token for API requests
          localStorage.setItem('access_token', session.access_token)
        }
      } catch (err) {
        console.error('Session check failed:', err)
        setError('Failed to check authentication status')
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user)
        localStorage.setItem('access_token', session.access_token)
        setError(null)
      } else {
        setUser(null)
        localStorage.removeItem('access_token')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await auth.signIn(email, password)
      
      if (error) throw error
      
      if (data.session) {
        setUser(data.user)
        localStorage.setItem('access_token', data.session.access_token)
        return data
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.register(userData)
      
      if (response.access_token) {
        setUser(response.user)
        localStorage.setItem('access_token', response.access_token)
      }
      
      return response
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
      setUser(null)
      setError(null)
    } catch (err) {
      console.error('Logout error:', err)
      // Still clear local state even if API call fails
      setUser(null)
      localStorage.removeItem('access_token')
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    error,
    clearError: () => setError(null)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
