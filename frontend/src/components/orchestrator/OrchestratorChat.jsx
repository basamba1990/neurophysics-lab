import React, { useState, useRef, useEffect } from 'react'
import { Send, Brain, Cpu, Code2, Network, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { useOrchestrator } from '../../hooks/useOrchestrator'
import { useVectorContext } from '../../hooks/useVectorContext'

const OrchestratorChat = ({ projectId, initialContext }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [executionPlan, setExecutionPlan] = useState(null)
  const [executionStatus, setExecutionStatus] = useState(null)
  
  const { analyzeScientificProblem, executePlan, getStatus } = useOrchestrator()
  const { getSimilarProblems, saveContext } = useVectorContext()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isAnalyzing) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsAnalyzing(true)

    try {
      // Recherche de contexte similaire
      const similarProblems = await getSimilarProblems(input, projectId)

      // Analyse scientifique avec l'orchestrateur
      const analysis = await analyzeScientificProblem({
        query: input,
        project_id: projectId,
        context: {
          ...initialContext,
          similar_problems: similarProblems.slice(0, 3)
        }
      })

      // Message d'analyse
      const analysisMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        type: 'analysis',
        content: analysis.scientific_analysis,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, analysisMessage])
      setExecutionPlan(analysis.execution_plan)

      // Option: Exécution automatique du plan
      if (analysis.execution_plan?.steps?.length > 0) {
        await executeScientificPlan(analysis.execution_plan)
      }

    } catch (error) {
      const errorMessage = {
        id: Date.now() + 2,
        role: 'assistant',
        type: 'error',
        content: `Erreur d'analyse: ${error.message}`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const executeScientificPlan = async (plan) => {
    setExecutionStatus({ status: 'starting', progress: 0 })

    try {
      const execution = await executePlan(plan, projectId)
      
      setExecutionStatus({
        status: 'executing',
        progress: 10,
        execution_id: execution.execution_id
      })

      // Polling pour le statut d'exécution
      const interval = setInterval(async () => {
        const status = await getStatus(execution.execution_id)
        
        setExecutionStatus(prev => ({
          ...prev,
          ...status,
          progress: status.progress || prev.progress
        }))

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval)
          
          // Ajout du message de résultats
          const resultsMessage = {
            id: Date.now() + 3,
            role: 'assistant',
            type: 'results',
            content: status.results || {},
            timestamp: new Date().toISOString()
          }
          
          setMessages(prev => [...prev, resultsMessage])
        }
      }, 2000)

    } catch (error) {
      setExecutionStatus({
        status: 'failed',
        error: error.message,
        progress: 0
      })
    }
  }

  const renderMessage = (message) => {
    switch (message.type) {
      case 'analysis':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <Brain className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-800">Analyse Scientifique</h4>
            </div>
            <div className="space-y-2">
              <p><strong>Domaine:</strong> {message.content.domain}</p>
              <p><strong>Complexité:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  message.content.complexity === 'HIGH' ? 'bg-red-100 text-red-800' :
                  message.content.complexity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {message.content.complexity}
                </span>
              </p>
              <div>
                <strong>Hypothèses:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  {message.content.hypotheses?.map((h, idx) => (
                    <li key={idx} className="text-sm text-gray-600">{h}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )

      case 'results':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">Résultats Scientifiques</h4>
            </div>
            {/* Affichage des résultats */}
          </div>
        )

      case 'error':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <h4 className="font-semibold text-red-800">Erreur Scientifique</h4>
            </div>
            <p className="text-red-700">{message.content}</p>
          </div>
        )

      default:
        return (
          <div className={`p-3 rounded-lg mb-3 ${
            message.role === 'user' 
              ? 'bg-blue-100 ml-auto max-w-[80%]' 
              : 'bg-gray-100 max-w-[80%]'
          }`}>
            <p className="text-gray-800">{message.content}</p>
            <span className="text-xs text-gray-500 block mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )
    }
  }

  const renderExecutionPlan = (plan) => {
    if (!plan?.steps) return null

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center mb-4">
          <Cpu className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Plan d'Exécution Scientifique</h3>
        </div>
        
        <div className="space-y-3">
          {plan.steps.map((step, index) => (
            <div key={step.step_id} className="flex items-start p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-semibold text-purple-600">{index + 1}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{step.task}</h4>
                    <div className="flex items-center mt-1">
                      {step.engine === 'PINN_SOLVER' && (
                        <Cpu className="h-4 w-4 text-blue-500 mr-1" />
                      )}
                      {step.engine === 'CODE_COPILOT' && (
                        <Code2 className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      {step.engine === 'DIGITAL_TWIN' && (
                        <Network className="h-4 w-4 text-orange-500 mr-1" />
                      )}
                      <span className="text-sm text-gray-600">{step.engine.replace('_', ' ')}</span>
                      <span className="mx-2">•</span>
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">{step.estimated_duration}s</span>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded text-xs ${
                    step.priority >= 8 ? 'bg-red-100 text-red-800' :
                    step.priority >= 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    Priorité: {step.priority}/10
                  </span>
                </div>
                
                {step.dependencies?.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Dépend de: {step.dependencies.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total estimé:</span>
            <span className="font-semibold text-gray-900">
              {plan.total_estimated_duration} secondes
            </span>
          </div>
        </div>
      </div>
    )
  }

  const renderExecutionStatus = () => {
    if (!executionStatus) return null

    const statusConfig = {
      starting: { color: 'bg-blue-500', text: 'Démarrage...' },
      executing: { color: 'bg-yellow-500', text: 'Exécution en cours' },
      completed: { color: 'bg-green-500', text: 'Terminé' },
      failed: { color: 'bg-red-500', text: 'Échec' }
    }

    const config = statusConfig[executionStatus.status] || statusConfig.starting

    return (
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Exécution Scientifique</h4>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${config.color} mr-2`}></div>
            <span className="text-sm text-gray-600">{config.text}</span>
          </div>
        </div>
        
        {executionStatus.progress > 0 && (
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progression</span>
              <span className="font-medium text-gray-900">{executionStatus.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${executionStatus.progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {executionStatus.error && (
          <p className="text-sm text-red-600 mt-2">{executionStatus.error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">NeuroPhysics AI</h2>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Orchestrateur Scientifique
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Posez votre problème scientifique pour une analyse et exécution orchestrée
        </p>
      </div>

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(message => (
          <div key={message.id} className={
            message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
          }>
            {renderMessage(message)}
          </div>
        ))}
        
        {executionPlan && renderExecutionPlan(executionPlan)}
        
        {isAnalyzing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
              <div className="flex items-center">
                <div className="animate-pulse mr-3">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-700">Analyse scientifique en cours...</p>
                  <p className="text-sm text-gray-500 mt-1">
                    L'IA NeuroPhysics analyse votre problème
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Décrivez votre problème scientifique (CFD, thermique, code...)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isAnalyzing}
          />
          <button
            type="submit"
            disabled={isAnalyzing || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="h-5 w-5 mr-2" />
            {isAnalyzing ? 'Analyse...' : 'Analyser'}
          </button>
        </form>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Exemples:</span>
          <button
            onClick={() => setInput("Optimisez le design de cette éolienne avec simulation CFD")}
            className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
          >
            CFD
          </button>
          <button
            onClick={() => setInput("Analysez ce code Fortran de simulation thermique")}
            className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
          >
            Code scientifique
          </button>
          <button
            onClick={() => setInput("Créez un jumeau numérique pour ce réacteur chimique")}
            className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
          >
            Digital Twin
          </button>
        </div>
      </div>

      {renderExecutionStatus()}
    </div>
  )
}

export default OrchestratorChat
