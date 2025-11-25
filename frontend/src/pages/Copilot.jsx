import React, { useState } from 'react'
import CodeEditor from '../components/copilot/CodeEditor'

const Copilot = () => {
  const [code, setCode] = useState('def solve_equation(a, b, c):\n    # Votre code scientifique ici\n    return 0')

  const handleRun = () => {
    console.log('Exécution du code:', code)
    // Logique d'exécution du code via l'API backend
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Scientific Copilot</h1>
      <p className="text-gray-600">
        Analysez, modernisez et exécutez votre code scientifique avec l'aide de l'IA.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CodeEditor 
            code={code} 
            onCodeChange={setCode} 
            language="python"
            onRun={handleRun}
          />
        </div>
        <div className="lg:col-span-1">
          {/* Placeholder pour AISuggestionsPanel et PhysicsContextSidebar */}
          <div className="bg-white rounded-lg shadow p-4 h-full">
            <h3 className="font-semibold mb-3">Suggestions IA & Contexte Physique</h3>
            <p className="text-sm text-gray-500">
              Le panneau de suggestions et le contexte physique seront implémentés ici.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Copilot
