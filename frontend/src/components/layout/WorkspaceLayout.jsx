import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

const WorkspaceLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user } = useAuth()

  if (!user) {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    window.location.href = '/login'
    return null
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
          // Le bouton de menu est géré dans Header.jsx maintenant
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default WorkspaceLayout
