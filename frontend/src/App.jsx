import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import WorkspaceLayout from './components/layout/WorkspaceLayout'
import Workspace from './pages/Workspace'
import Copilot from './pages/Copilot'
// Importez d'autres pages ici

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WorkspaceLayout />}>
          <Route index element={<Workspace />} />
          <Route path="copilot" element={<Copilot />} />
          {/* Ajoutez d'autres routes ici */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App
