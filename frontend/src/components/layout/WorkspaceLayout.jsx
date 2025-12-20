import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import { LoadingState } from '../ui/LoadingState.jsx'; // Importer le composant LoadingState

const WorkspaceLayout = ({ children }) => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    // Utiliser LoadingState pour le chargement
    return <LoadingState message="Authentification en cours..." fullScreen />;
  }

  if (!user) {
    // Utiliser LoadingState pour la redirection
    return <LoadingState message="Redirection vers la page de connexion..." fullScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          sidebarOpen={sidebarOpen}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default WorkspaceLayout
