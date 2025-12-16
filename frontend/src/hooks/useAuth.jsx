import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../services/supabase.js'
import apiClient from '../services/api.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier la session active au chargement
    const checkSession = async () => {
      try {
        const { data: { session } } = await auth.getSession()
        if (session) {
          setUser(session.user)
          localStorage.setItem('access_token', session.access_token)
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Écouter les changements d'authentification
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      
      if (session) {
        localStorage.setItem('access_token', session.access_token)
      } else {
        localStorage.removeItem('access_token')
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    try {
      const { data, error } = await auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      // Stocker le token pour les requêtes API
      if (data.session) {
        localStorage.setItem('access_token', data.session.access_token)
        setUser(data.user)
      }
      
      return data
    } catch (error) {
      throw new Error(error.message || 'Erreur de connexion')
    }
  }

  const register = async (userData) => {
    try {
      // Créer l'utilisateur avec Supabase Auth
      const { data: authData, error: authError } = await auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            expertise_area: userData.expertiseArea || {}
          }
        }
      })
      
      if (authError) throw authError
      
      // Enregistrer le profil dans la base de données
      const response = await apiClient.register(userData)
      
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token)
        setUser(response.user)
      }
      
      return response
    } catch (error) {
      throw new Error(error.message || 'Erreur lors de l\'inscription')
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
      await auth.signOut()
      setUser(null)
      localStorage.removeItem('access_token')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
