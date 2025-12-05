import React from 'react'
import { Routes, Route } from 'react-router-dom'

import { AuthProvider } from './hooks/useAuth.jsx'
import WorkspaceLayout from './components/layout/WorkspaceLayout' 
// CORRECTION: Ajout de l'extension .jsx à toutes les importations de pages
import Workspace from './pages/Workspace.jsx'
import Projects from './pages/Projects.jsx'
import Simulations from './pages/Simulations.jsx'
import Copilot from './pages/Copilot.jsx'
import DigitalTwins from './pages/DigitalTwins.jsx'
import Team from './pages/Team.jsx'
import UsageDashboard from './pages/UsageDashboard.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
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
