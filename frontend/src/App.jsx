import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from './hooks/useAuth.jsx';
import { VectorProvider } from './hooks/useVectorContext.jsx';
import { OrchestratorProvider } from './hooks/useOrchestrator.jsx';
import { ToastProvider } from './components/ui/ToastProvider.jsx'; // Importer le ToastProvider

import WorkspaceLayout from './components/layout/WorkspaceLayout.jsx';

import Workspace from './pages/Workspace.jsx';
import Projects from './pages/Projects.jsx';
import Simulations from './pages/Simulations.jsx';
import Copilot from './pages/Copilot.jsx';
import DigitalTwins from './pages/DigitalTwins.jsx';
import Team from './pages/Team.jsx';
import UsageDashboard from './pages/UsageDashboard.jsx';
import Settings from './pages/Settings.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NeuroPhysicsAI from './pages/NeuroPhysicsAI.jsx';

function App() {
  return (
    <AuthProvider>
      <VectorProvider>
        <OrchestratorProvider>
          <ToastProvider> {/* Envelopper l'application avec ToastProvider */}
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/*"
                element={
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
                      <Route path="/neurophysics-ai" element={<NeuroPhysicsAI />} />
                    </Routes>
                  </WorkspaceLayout>
                }
              />
            </Routes>
          </ToastProvider>
        </OrchestratorProvider>
      </VectorProvider>
    </AuthProvider>
  );
}

export default App;
