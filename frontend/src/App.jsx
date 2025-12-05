import React from 'react'
import { Routes, Route } from 'react-router-dom'

import { AuthProvider } from './hooks/useAuth.jsx'
import Layout from './components/layout/Layout'
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
          <Layout>
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
          </Layout>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App
