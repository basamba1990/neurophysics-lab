import React, { useState, useEffect } from 'react'
import { 
  Play, Pause, CheckCircle, XCircle, Clock, AlertCircle,
  ChevronRight, ChevronDown, BarChart3, Cpu, Code2, Network
} from 'lucide-react'

const ExecutionPlan = ({ plan, executionId, onStepClick, onExecuteStep }) => {
  const [expandedSteps, setExpandedSteps] = useState([])
  const [executionStatus, setExecutionStatus] = useState({})
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Simuler le suivi d'exécution (à remplacer par WebSocket)
  useEffect(() => {
    if (!executionId || !autoRefresh) return

    const interval = setInterval(() => {
      // Ici, on appellerait l'API pour le statut
      // Pour l'exemple, on simule des mises à jour
      updateSimulatedStatus()
    }, 3000)

    return () => clearInterval(interval)
  }, [executionId, autoRefresh])

  const updateSimulatedStatus = () => {
    // Simulation d'avancement
    setExecutionStatus(prev => {
      const newStatus = { ...prev }
      
      if (plan?.steps) {
        plan.steps.forEach(step => {
          if (!newStatus[step.step_id]) {
            // Initialisation aléatoire du statut
            const statuses = ['pending', 'running', 'completed', 'failed']
            const weights = [0.3, 0.2, 0.4, 0.1]
            const random = Math.random()
            let cumulative = 0
            let status = 'pending'
            
            for (let i = 0; i < statuses.length; i++) {
              cumulative += weights[i]
              if (random <= cumulative) {
                status = statuses[i]
                break
              }
            }
            
            newStatus[step.step_id] = {
              status,
              progress: status === 'running' ? Math.floor(Math.random() * 100) : 
                       status === 'completed' ? 100 : 0,
              startTime: new Date().toISOString(),
              duration: Math.floor(Math.random() * 300) // secondes
            }
          } else if (newStatus[step.step_id].status === 'running') {
            // Avancement de la progression
            const currentProgress = newStatus[step.step_id].progress
            if (currentProgress < 100) {
              newStatus[step.step_id].progress = Math.min(currentProgress + 5, 100)
              
              // Passage à completed si 100%
              if (newStatus[step.step_id].progress === 100) {
                newStatus[step.step_id].status = 'completed'
                newStatus[step.step_id].endTime = new Date().toISOString()
              }
            }
          }
        })
      }
      
      return newStatus
    })
  }

  const toggleStepExpand = (stepId) => {
    setExpandedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  const getStepIcon = (engine) => {
    switch (engine) {
      case 'PINN_SOLVER':
        return Cpu
      case 'CODE_COPILOT':
        return Code2
      case 'DIGITAL_TWIN':
        return Network
      case 'DATA_ANALYSIS':
        return BarChart3
      default:
        return BarChart3
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'running': return 'text-blue-600 bg-blue-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'running': return Play
      case 'failed': return XCircle
      case 'pending': return Clock
      default: return AlertCircle
    }
  }

  const calculatePlanMetrics = () => {
    if (!plan?.steps) return {}
    
    const steps = plan.steps
    const totalSteps = steps.length
    
    const statusCounts = steps.reduce((acc, step) => {
      const status = executionStatus[step.step_id]?.status || 'pending'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
    
    const totalEstimatedTime = steps.reduce((acc, step) => 
      acc + (step.estimated_duration || 0), 0
    )
    
    const completedTime = steps.reduce((acc, step) => {
      const status = executionStatus[step.step_id]
      if (status?.status === 'completed' && status.duration) {
        return acc + status.duration
      }
      return acc
    }, 0)
    
    const remainingTime = steps.reduce((acc, step) => {
      const status = executionStatus[step.step_id]
      if (status?.status !== 'completed') {
        return acc + (step.estimated_duration || 0)
      }
      return acc
    }, 0)
    
    return {
      totalSteps,
      statusCounts,
      totalEstimatedTime,
      completedTime,
      remainingTime,
      completionPercentage: totalSteps > 0 
        ? Math.round((statusCounts.completed || 0) / totalSteps * 100)
        : 0
    }
  }

  const metrics = calculatePlanMetrics()

  const renderStepDetails = (step) => {
    const status = executionStatus[step.step_id]
    const StatusIcon = getStatusIcon(status?.status || 'pending')
    
    return (
      <div className="ml-8 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500">Statut</div>
            <div className={`inline-flex items-center px-2 py-1 rounded text-sm ${getStatusColor(status?.status || 'pending')}`}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {status?.status || 'pending'}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Priorité</div>
            <div className="font-medium">{step.priority || 5}/10</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Durée estimée</div>
            <div className="font-medium">{step.estimated_duration || 0}s</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Durée réelle</div>
            <div className="font-medium">{status?.duration || '-'}s</div>
          </div>
        </div>
        
        {/* Barre de progression */}
        {status && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progression</span>
              <span className="font-medium">{status.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  status.status === 'completed' ? 'bg-green-600' :
                  status.status === 'running' ? 'bg-blue-600' :
                  status.status === 'failed' ? 'bg-red-600' :
                  'bg-gray-400'
                }`}
                style={{ width: `${status.progress || 0}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Détails des paramètres */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Paramètres</div>
          <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-auto max-h-40">
            {JSON.stringify(step.parameters || {}, null, 2)}
          </pre>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => onStepClick && onStepClick(step)}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Détails
          </button>
          
          {status?.status !== 'completed' && status?.status !== 'running' && (
            <button
              onClick={() => onExecuteStep && onExecuteStep(step)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Exécuter
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderDependencyGraph = () => {
    if (!plan?.steps || plan.steps.length === 0) return null
    
    // Construction du graphe de dépendances simplifié
    const nodes = plan.steps.map(step => ({
      id: step.step_id,
      name: step.step_id.split('_')[1] || step.step_id,
      engine: step.engine,
      status: executionStatus[step.step_id]?.status || 'pending'
    }))
    
    const edges = []
    plan.steps.forEach(step => {
      step.dependencies?.forEach(depId => {
        edges.push({ from: depId, to: step.step_id })
      })
    })
    
    // Graphique simple horizontal
    return (
      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Graphe de dépendances</h4>
        
        <div className="flex items-center justify-center overflow-x-auto py-4">
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  node.status === 'completed' ? 'bg-green-100 border-2 border-green-500' :
                  node.status === 'running' ? 'bg-blue-100 border-2 border-blue-500' :
                  node.status === 'failed' ? 'bg-red-100 border-2 border-red-500' :
                  'bg-gray-100 border-2 border-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="mt-2 text-xs text-gray-600">{node.engine}</div>
              </div>
              
              {index < nodes.length - 1 && (
                <div className="w-16 h-0.5 bg-gray-300 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="text-xs text-gray-500 mt-3 text-center">
          {edges.length} dépendance(s) entre {nodes.length} étape(s)
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* En-tête avec métriques */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {plan?.metadata?.name || 'Plan d\'exécution'}
            </h3>
            <p className="text-sm text-gray-600">
              {plan?.metadata?.description || 'Workflow scientifique orchestré'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-sm">
              <span className="text-gray-500">Auto-refresh:</span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`ml-2 relative inline-flex h-6 w-11 items-center rounded-full ${
                  autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Exporter PDF
            </button>
          </div>
        </div>
        
        {/* Métriques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-700 font-medium">Étapes totales</div>
            <div className="text-2xl font-bold text-blue-900">{metrics.totalSteps}</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-700 font-medium">Terminées</div>
            <div className="text-2xl font-bold text-green-900">
              {metrics.statusCounts.completed || 0}
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-700 font-medium">En cours</div>
            <div className="text-2xl font-bold text-yellow-900">
              {metrics.statusCounts.running || 0}
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-700 font-medium">Progression</div>
            <div className="text-2xl font-bold text-purple-900">
              {metrics.completionPercentage}%
            </div>
          </div>
        </div>
        
        {/* Barre de progression globale */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Avancement global</span>
            <span className="font-medium">
              {metrics.completedTime}s / {metrics.totalEstimatedTime}s
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${metrics.completionPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Temps restant estimé: {Math.round(metrics.remainingTime / 60)} minutes
          </div>
        </div>
      </div>
      
      {/* Liste des étapes */}
      <div className="p-6">
        <h4 className="font-medium text-gray-900 mb-4">Étapes du workflow</h4>
        
        <div className="space-y-3">
          {plan?.steps?.map((step, index) => {
            const StepIcon = getStepIcon(step.engine)
            const status = executionStatus[step.step_id]
            const StatusIcon = getStatusIcon(status?.status || 'pending')
            const isExpanded = expandedSteps.includes(step.step_id)
            
            return (
              <div key={step.step_id} className="border border-gray-200 rounded-lg">
                {/* En-tête de l'étape */}
                <div 
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleStepExpand(step.step_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <StepIcon className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">
                            {step.task || `Étape ${index + 1}`}
                          </span>
                          <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {step.engine.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mt-1">
                          {step.estimated_duration || 0}s • Priorité: {step.priority || 5}/10
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(status?.status || 'pending')}`}>
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {status?.status || 'pending'}
                      </div>
                      
                      <div className="text-gray-400">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Détails de l'étape (expandable) */}
                {isExpanded && renderStepDetails(step)}
              </div>
            )
          })}
        </div>
        
        {/* Graphe de dépendances */}
        {renderDependencyGraph()}
        
        {/* Légende */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h5 className="font-medium text-gray-900 mb-3">Légende</h5>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded-full mr-2" />
              <span className="text-sm text-gray-600">Terminé</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded-full mr-2" />
              <span className="text-sm text-gray-600">En cours</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded-full mr-2" />
              <span className="text-sm text-gray-600">Échec</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded-full mr-2" />
              <span className="text-sm text-gray-600">En attente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExecutionPlan
