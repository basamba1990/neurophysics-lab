import React from 'react'
import { Routes, Route } from 'react-router-dom'

import { AuthProvider } from './hooks/useAuth.jsx'
// CORRECTION: Remplacer l'importation de 'Layout' qui n'existe pas
// par l'importation de 'WorkspaceLayout' qui est le composant réel.
import WorkspaceLayout from './components/layout/WorkspaceLayout' 
import Workspace from './pages/Workspace'
import Projects from './pages/Projects'
import Simulations from './pages/Simulations'
import Copilot from './pages/Copilot'
import DigitalTwins from './pages/DigitalTwins'
import Team from './pages/Team'
import UsageDashboard from './pages/UsageDashboard'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          // CORRECTION: Utiliser WorkspaceLayout à la place de Layout
          <WorkspaceLayout>
            <Routes>
              <Route path="/" element={<Workspace />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/simulations" element={<Simulations />} />
              <Route path="/copilot" element={<Copilot />} />
              <Route path="/digital-twins" element={<DigitalTwins />} />
              <Route path="/team" element={<Team />} />
              <Route path="/usage" element={<UsageDashboard />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </WorkspaceLayout>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App
