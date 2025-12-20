import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Code2,
  Play,
  Copy,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Sparkles
} from 'lucide-react'
import apiClient from '../services/api'
import CodeEditor from '../components/copilot/CodeEditor'
import AISuggestionsPanel from '../components/copilot/AISuggestionsPanel'
import PhysicsContextSidebar from '../components/copilot/PhysicsContextSidebar'
import { useToast } from '../ui/ToastProvider.jsx'; // Importer le hook useToast

const Copilot = () => {
  const [code, setCode] = useState(`program heat_transfer
  implicit none
  real :: T(100,100), dx, dy, k, dt
  integer :: i, j, n
  
  ! Initialize temperature
  T = 20.0
  
  ! Boundary conditions
  T(:,1) = 100.0  ! Left wall
  T(:,100) = 20.0 ! Right wall
  
  ! Simulation parameters
  dx = 0.01
  dy = 0.01
  k = 0.6
  dt = 0.1
  
  ! Time stepping
  do n = 1, 1000
    do j = 2, 99
      do i = 2, 99
        T(i,j) = T(i,j) + k*dt*((T(i+1,j)-2*T(i,j)+T(i-1,j))/dx**2 + &
                                (T(i,j+1)-2*T(i,j)+T(i,j-1))/dy**2)
      end do
    end do
  end do
  
  print *, "Simulation completed"
end program heat_transfer`)

  const [language, setLanguage] = useState('fortran')
  const [suggestions, setSuggestions] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [physicsContext, setPhysicsContext] = useState({
    physics_type: 'heat_transfer',
    equations: ['Fourier law'],
    boundary_conditions: {
      left: 'dirichlet_100c',
      right: 'dirichlet_20c'
    }
  })

  const { handleSubmit, register } = useForm()
  const { showToast } = useToast(); // Utiliser le hook useToast

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const result = await apiClient.analyzeCode({
        code,
        language,
        context: { physics_context: physicsContext },
        analysis_type: 'modernization'
      })
      setSuggestions(result.suggestions || [])
      showToast('success', 'Analyse terminée avec succès'); // Afficher une notification
    } catch (error) {
      console.error('Analysis failed:', error)
      showToast('error', 'Échec de l\'analyse du code'); // Afficher une notification d'erreur
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleModernize = async () => {
    setIsAnalyzing(true)
    try {
      const result = await apiClient.modernizeFortran({
        code,
        context: { physics_context: physicsContext }
      })
      setCode(result.modern_python || code)
      showToast('success', 'Code modernisé avec succès'); // Afficher une notification
    } catch (error) {
      console.error('Modernization failed:', error)
      showToast('error', 'Échec de la modernisation du code'); // Afficher une notification d'erreur
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleContextUpdate = (newContext) => {
    setPhysicsContext(newContext)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setCode(e.target.result)
      reader.readAsText(file)
      showToast('info', 'Fichier importé avec succès'); // Afficher une notification
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <Code2 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scientific Copilot</h1>
              <p className="text-gray-600 mt-2">
                Assistant IA pour la modernisation et validation de code scientifique
              </p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                <span>Analyse en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                <span>Analyser le code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Physics Context */}
        <div className="lg:col-span-1">
          <PhysicsContextSidebar
            context={physicsContext}
            onUpdate={handleContextUpdate}
          />
        </div>

        {/* Center - Code Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Code Editor */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fortran">Fortran</option>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                  </select>
                  <div className="text-sm text-gray-600">
                    {code.split('\n').length} lignes
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center px-3 py-1 border border-gray-300 rounded text-sm cursor-pointer hover:bg-gray-50">
                    <Upload className="h-4 w-4 mr-1" />
                    <span>Importer</span>
                    <input
                      type="file"
                      accept=".f,.for,.f90,.f95,.f03,.cpp,.cxx,.cc,.py"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleModernize}
                    disabled={isAnalyzing}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    <span>Moderniser</span>
                  </button>
                </div>
              </div>
            </div>
            <CodeEditor
              code={code}
              onCodeChange={setCode}
              language={language}
              onRun={handleAnalyze}
            />
          </div>

          {/* Actions Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Sparkles className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium">Analyser</span>
              </button>
              <button
                onClick={handleModernize}
                disabled={isAnalyzing}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-sm font-medium">Moderniser</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code)
                  showToast('success', 'Code copié dans le presse-papiers'); // Afficher une notification
                }}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Copy className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Copier</span>
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([code], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `code.${language}`
                  a.click()
                  showToast('success', 'Code téléchargé avec succès'); // Afficher une notification
                }}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Download className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Télécharger</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - AI Suggestions */}
        <div className="lg:col-span-1">
          <AISuggestionsPanel
            suggestions={suggestions}
            isLoading={isAnalyzing}
            onApplySuggestion={(suggestion) => {
              setCode(suggestion.suggested_code)
              showToast('success', 'Suggestion appliquée avec succès'); // Afficher une notification
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Copilot
