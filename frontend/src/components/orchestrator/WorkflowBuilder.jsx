import React, { useState, useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { 
  Plus, Trash2, Settings, Play, Save, Upload, Download,
  Cpu, Code2, Network, BarChart3, Link, Unlink
} from 'lucide-react'

import  Button  from '../ui/Button'
import  Input  from '../ui/Input'
import { logger } from '../../utils/logger'

const WorkflowBuilder = ({ onSave, onExecute, initialWorkflow }) => {
  const [workflow, setWorkflow] = useState(initialWorkflow || {
    name: 'Nouveau Workflow',
    description: '',
    steps: [],
    connections: []
  })
  
  const [selectedStep, setSelectedStep] = useState(null)
  const [isDraggingConnection, setIsDraggingConnection] = useState(false)
  const [dragSource, setDragSource] = useState(null)

  const stepTypes = [
    { id: 'pinn', name: 'Simulation PINN', icon: Cpu, color: 'bg-blue-500' },
    { id: 'copilot', name: 'Analyse de Code', icon: Code2, color: 'bg-green-500' },
    { id: 'twin', name: 'Digital Twin', icon: Network, color: 'bg-purple-500' },
    { id: 'analysis', name: 'Analyse de Données', icon: BarChart3, color: 'bg-orange-500' }
  ]

  const addStep = (stepType) => {
    const newStep = {
      id: `step_${Date.now()}`,
      type: stepType.id,
      name: `${stepType.name} ${workflow.steps.filter(s => s.type === stepType.id).length + 1}`,
      position: { x: 100, y: 100 + workflow.steps.length * 120 },
      config: getDefaultConfig(stepType.id),
      status: 'pending'
    }
    
    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
  }

  const updateStep = (stepId, updates) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }))
  }

  const deleteStep = (stepId) => {
    const newConnections = workflow.connections.filter(
      conn => conn.source !== stepId && conn.target !== stepId
    )
    
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId),
      connections: newConnections
    }))
    
    if (selectedStep === stepId) {
      setSelectedStep(null)
    }
  }

  const startConnection = (stepId, isOutput) => {
    setIsDraggingConnection(true)
    setDragSource({ stepId, isOutput })
  }

  const endConnection = (stepId, isOutput) => {
    if (isDraggingConnection && dragSource) {
      if (dragSource.stepId !== stepId) {
        const connectionExists = workflow.connections.some(
          conn => conn.source === dragSource.stepId && conn.target === stepId
        )
        
        if (!connectionExists) {
          const newConnection = {
            id: `conn_${Date.now()}`,
            source: dragSource.stepId,
            target: stepId,
            sourcePort: dragSource.isOutput ? 'output' : 'input',
            targetPort: isOutput ? 'output' : 'input'
          }
          
          setWorkflow(prev => ({
            ...prev,
            connections: [...prev.connections, newConnection]
          }))
        }
      }
    }
    
    setIsDraggingConnection(false)
    setDragSource(null)
  }

  const deleteConnection = (connectionId) => {
    setWorkflow(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId)
    }))
  }

  const getDefaultConfig = (stepType) => {
    const defaults = {
      pinn: {
        physics_type: 'navier_stokes',
        reynolds: 1000,
        mesh_resolution: 'medium',
        epochs: 1000
      },
      copilot: {
        analysis_type: 'comprehensive',
        language: 'python',
        validate_physics: true
      },
      twin: {
        optimization_type: 'single_objective',
        algorithm: 'genetic',
        generations: 100
      },
      analysis: {
        analysis_type: 'statistical',
        visualization: true
      }
    }
    
    return defaults[stepType] || {}
  }

  const renderStepConfig = (step) => {
    switch (step.type) {
      case 'pinn':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de physique
              </label>
              <select
                value={step.config.physics_type}
                onChange={(e) => updateStep(step.id, { 
                  config: { ...step.config, physics_type: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="navier_stokes">Navier-Stokes</option>
                <option value="heat_transfer">Transfert thermique</option>
                <option value="structural">Mécanique des structures</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Reynolds
                </label>
                <input
                  type="number"
                  value={step.config.reynolds}
                  onChange={(e) => updateStep(step.id, {
                    config: { ...step.config, reynolds: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Résolution maillage
                </label>
                <select
                  value={step.config.mesh_resolution}
                  onChange={(e) => updateStep(step.id, {
                    config: { ...step.config, mesh_resolution: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="coarse">Grossière</option>
                  <option value="medium">Moyenne</option>
                  <option value="fine">Fine</option>
                </select>
              </div>
            </div>
          </div>
        )
        
      case 'copilot':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'analyse
              </label>
              <select
                value={step.config.analysis_type}
                onChange={(e) => updateStep(step.id, {
                  config: { ...step.config, analysis_type: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="comprehensive">Complète</option>
                <option value="physics_validation">Validation physique</option>
                <option value="modernization">Modernisation</option>
                <option value="performance">Analyse performance</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="validatePhysics"
                checked={step.config.validate_physics}
                onChange={(e) => updateStep(step.id, {
                  config: { ...step.config, validate_physics: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="validatePhysics" className="ml-2 text-sm text-gray-700">
                Validation physique automatique
              </label>
            </div>
          </div>
        )
        
      default:
        return (
          <div className="text-gray-500 text-sm">
            Configuration spécifique pour {step.type}
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Bibliothèque d'étapes</h3>
        <div className="space-y-2">
          {stepTypes.map(stepType => (
            <button
              key={stepType.id}
              onClick={() => addStep(stepType)}
              className="flex items-center w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${stepType.color} mr-3`}>
                <stepType.icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">{stepType.name}</div>
                <div className="text-xs text-gray-500">Cliquer pour ajouter</div>
              </div>
            </button>
          ))}
        </div>
        
        {/* Actions globales */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Actions</h4>
          <div className="space-y-2">
            <button
              onClick={() => onSave && onSave(workflow)}
              className="flex items-center w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="h-5 w-5 mr-2" />
              Sauvegarder Workflow
            </button>
            
            <button
              onClick={() => onExecute && onExecute(workflow)}
              className="flex items-center w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Play className="h-5 w-5 mr-2" />
              Exécuter Workflow
            </button>
            
            <button className="flex items-center w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="h-5 w-5 mr-2 text-gray-600" />
              Importer Workflow
            </button>
            
            <button className="flex items-center w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-5 w-5 mr-2 text-gray-600" />
              Exporter Workflow
            </button>
          </div>
        </div>
      </div>
      
      {/* Workspace */}
      <div className="flex-1 relative overflow-auto">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, #f3f4f6 1px, transparent 1px),
              linear-gradient(to bottom, #f3f4f6 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
          
          {/* Connections */}
          <svg className="absolute inset-0 pointer-events-none">
            {workflow.connections.map(conn => {
              const sourceStep = workflow.steps.find(s => s.id === conn.source)
              const targetStep = workflow.steps.find(s => s.id === conn.target)
              
              if (!sourceStep || !targetStep) return null
              
              const sourceX = sourceStep.position.x + 200
              const sourceY = sourceStep.position.y + 40
              const targetX = targetStep.position.x
              const targetY = targetStep.position.y + 40
              
              return (
                <g key={conn.id}>
                  <path
                    d={`M ${sourceX} ${sourceY} C ${sourceX + 100} ${sourceY}, ${targetX - 100} ${targetY}, ${targetX} ${targetY}`}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                  <circle
                    cx={(sourceX + targetX) / 2}
                    cy={(sourceY + targetY) / 2}
                    r="8"
                    fill="white"
                    stroke="#ef4444"
                    strokeWidth="1"
                    className="cursor-pointer pointer-events-auto"
                    onClick={() => deleteConnection(conn.id)}
                  />
                  <text
                    x={(sourceX + targetX) / 2}
                    y={(sourceY + targetY) / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-xs font-bold fill-red-600 pointer-events-none"
                  >
                    ×
                  </text>
                </g>
              )
            })}
            
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
              </marker>
            </defs>
          </svg>
          
          {/* Steps */}
          {workflow.steps.map(step => {
            const StepIcon = stepTypes.find(t => t.id === step.type)?.icon || Cpu
            const stepColor = stepTypes.find(t => t.id === step.type)?.color || 'bg-blue-500'
            
            return (
              <div
                key={step.id}
                className={`absolute w-64 bg-white border-2 ${selectedStep === step.id ? 'border-blue-500' : 'border-gray-300'} rounded-lg shadow-lg`}
                style={{
                  left: step.position.x,
                  top: step.position.y,
                  transform: 'translate(0, 0)'
                }}
              >
                <div className={`${stepColor} text-white p-4 rounded-t-lg flex justify-between items-center`}>
                  <div className="flex items-center">
                    <StepIcon className="h-5 w-5 mr-2" />
                    <div>
                      <div className="font-semibold">{step.name}</div>
                      <div className="text-xs opacity-90 capitalize">{step.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteStep(step.id)}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  {selectedStep === step.id ? (
                    renderStepConfig(step)
                  ) : (
                    <div className="text-sm text-gray-600">
                      Cliquez sur ⚙️ pour configurer
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Entrées</div>
                      <button
                        onMouseDown={() => startConnection(step.id, false)}
                        onMouseUp={() => endConnection(step.id, false)}
                        className="w-6 h-6 bg-green-500 rounded-full hover:bg-green-600"
                        title="Connecter une entrée"
                      >
                        <Plus className="h-4 w-4 mx-auto text-white" />
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Sorties</div>
                      <button
                        onMouseDown={() => startConnection(step.id, true)}
                        onMouseUp={() => endConnection(step.id, true)}
                        className="w-6 h-6 bg-blue-500 rounded-full hover:bg-blue-600"
                        title="Connecter une sortie"
                      >
                        <Plus className="h-4 w-4 mx-auto text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className={`px-4 py-2 text-xs font-medium rounded-b-lg ${
                  step.status === 'completed' ? 'bg-green-100 text-green-800' :
                  step.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  step.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {step.status === 'completed' && '✓ Terminé'}
                  {step.status === 'running' && '⚡ En cours...'}
                  {step.status === 'failed' && '✗ Échec'}
                  {step.status === 'pending' && '⏳ En attente'}
                </div>
              </div>
            )
          })}
        </div>
        
        {isDraggingConnection && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="fixed inset-0 bg-black/5" />
          </div>
        )}
      </div>
      
      {selectedStep && (
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-auto">
          <h3 className="font-semibold text-gray-900 mb-4">Configuration de l'étape</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'étape
              </label>
              <Input
                type="text"
                value={workflow.steps.find(s => s.id === selectedStep)?.name || ''}
                onChange={(e) => updateStep(selectedStep, { name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Décrivez le rôle de cette étape dans le workflow..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={workflow.steps.find(s => s.id === selectedStep)?.description || ''}
                onChange={(e) => updateStep(selectedStep, { description: e.target.value })}
              />
            </div>

            {renderStepConfig(workflow.steps.find(s => s.id === selectedStep))}

            {/* Dépendances */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Dépendances</h4>
              <div className="space-y-2">
                {workflow.connections
                  .filter(conn => conn.target === selectedStep)
                  .map(conn => {
                    const sourceStep = workflow.steps.find(s => s.id === conn.source)
                    return sourceStep ? (
                      <div key={conn.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{sourceStep.name}</span>
                        <button
                          onClick={() => deleteConnection(conn.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Unlink className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null
                  })}

                {workflow.connections.filter(conn => conn.target === selectedStep).length === 0 && (
                  <p className="text-sm text-gray-500">Aucune dépendance</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkflowBuilder
