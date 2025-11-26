import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { usePinnSolver } from '../../hooks/useApi'
import { Play, Square, Download, RefreshCw, Settings } from 'lucide-react'

const SimulationRunner = ({ physicsModel, onSimulationComplete }) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm()
  const { createSimulation, loading, error } = usePinnSolver()

  const [simulationStatus, setSimulationStatus] = useState('idle') // idle, running, completed, failed
  const [currentSimulation, setCurrentSimulation] = useState(null)
  const [progress, setProgress] = useState(0)
  const [advancedConfig, setAdvancedConfig] = useState(false)

  // Default parameters based on physics type
  const defaultParameters = {
    navier_stokes: {
      reynolds: 1000,
      density: 1.0,
      viscosity: 0.001,
      nx: 50,
      ny: 50,
      epochs: 1000
    },
    heat_transfer: {
      thermal_conductivity: 1.0,
      specific_heat: 1.0,
      density: 1.0,
      nx: 50,
      ny: 50,
      epochs: 1000
    },
    structural: {
      young_modulus: 2e9,
      poisson_ratio: 0.3,
      density: 7800,
      nx: 50,
      ny: 50,
      epochs: 1000
    }
  }

  useEffect(() => {
    if (physicsModel) {
      const defaults = defaultParameters[physicsModel.physics_type] || defaultParameters.navier_stokes
      Object.entries(defaults).forEach(([key, value]) => {
        setValue(key, value)
      })
    }
  }, [physicsModel, setValue])

  const runSimulation = async (data) => {
    if (!physicsModel) {
      alert('Veuillez sélectionner un modèle physique')
      return
    }

    try {
      setSimulationStatus('running')
      setProgress(0)

      const simulationData = {
        physics_model_id: physicsModel.id,
        name: data.name || `Simulation ${new Date().toLocaleString()}`,
        input_parameters: {
          ...data,
          epochs: parseInt(data.epochs),
          nx: parseInt(data.nx),
          ny: parseInt(data.ny)
        }
      }

      const result = await createSimulation(simulationData)
      setCurrentSimulation(result)

      // Simulate progress (in real app, this would come from WebSocket)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + Math.random() * 10
        })
      }, 500)

      // Simulate completion
      setTimeout(() => {
        clearInterval(progressInterval)
        setProgress(100)
        setSimulationStatus('completed')
        onSimulationComplete?.(result)
      }, 10000)

    } catch (err) {
      setSimulationStatus('failed')
      setProgress(0)
      console.error('Simulation error:', err)
    }
  }

  const stopSimulation = () => {
    setSimulationStatus('idle')
    setProgress(0)
    // In real app, this would call an API to stop the simulation
  }

  const downloadResults = () => {
    if (currentSimulation) {
      // In real app, this would download actual results
      const dataStr = JSON.stringify(currentSimulation, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `simulation_${currentSimulation.id}.json`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const resetSimulation = () => {
    setSimulationStatus('idle')
    setCurrentSimulation(null)
    setProgress(0)
  }

  const isRunning = simulationStatus === 'running'
  const isCompleted = simulationStatus === 'completed'

  if (!physicsModel) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-center">
        <div className="text-gray-500 mb-4">
          <Settings className="h-12 w-12 mx-auto mb-3" />
          <p className="text-lg font-medium">Aucun modèle physique sélectionné</p>
          <p className="text-sm">Veuillez créer ou sélectionner un modèle physique pour lancer une simulation</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Lancement de Simulation</h3>
          <p className="text-sm text-gray-600 mt-1">
            Modèle: <span className="font-medium">{physicsModel.name}</span> • 
            Type: <span className="font-medium">{physicsModel.physics_type}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdvancedConfig(!advancedConfig)}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <Settings className="h-4 w-4 mr-2" />
          {advancedConfig ? 'Simple' : 'Avancé'}
        </button>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progression de la simulation</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Simulation Form */}
      {!isRunning && (
        <form onSubmit={handleSubmit(runSimulation)} className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1
