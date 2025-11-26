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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la simulation *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Le nom est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: Cavité Re=1000 - Run 1"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre d'époques
              </label>
              <input
                type="number"
                {...register('epochs', { 
                  required: 'Requis',
                  min: { value: 100, message: 'Minimum 100 époques' },
                  max: { value: 10000, message: 'Maximum 10000 époques' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.epochs && (
                <p className="text-red-500 text-sm mt-1">{errors.epochs.message}</p>
              )}
            </div>
          </div>

          {/* Physics Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {physicsModel.physics_type === 'navier_stokes' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Reynolds
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('reynolds', { 
                      required: 'Requis',
                      min: { value: 0.1, message: 'Doit être positif' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Densité
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('density', { 
                      required: 'Requis',
                      min: { value: 0.1, message: 'Doit être positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Viscosité
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    {...register('viscosity', { 
                      required: 'Requis',
                      min: { value: 0.001, message: 'Doit être positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {physicsModel.physics_type === 'heat_transfer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conductivité Thermique
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('thermal_conductivity', { 
                      required: 'Requis',
                      min: { value: 0.1, message: 'Doit être positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chaleur Spécifique
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('specific_heat', { 
                      required: 'Requis',
                      min: { value: 0.1, message: 'Doit être positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Densité
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('density', { 
                      required: 'Requis',
                      min: { value: 0.1, message: 'Doit être positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Advanced Configuration */}
          {advancedConfig && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points X (nx)
                </label>
                <input
                  type="number"
                  {...register('nx', { 
                    required: 'Requis',
                    min: { value: 10, message: 'Minimum 10 points' },
                    max: { value: 500, message: 'Maximum 500 points' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points Y (ny)
                </label>
                <input
                  type="number"
                  {...register('ny', { 
                    required: 'Requis',
                    min: { value: 10, message: 'Minimum 10 points' },
                    max: { value: 500, message: 'Maximum 500 points' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              <Play className="h-5 w-5 mr-2" />
              {loading ? 'Lancement...' : 'Lancer la Simulation'}
            </button>
          </div>
        </form>
      )}

      {/* Running Simulation Controls */}
      {isRunning && (
        <div className="flex justify-center space-x-4 pt-4">
          <button
            onClick={stopSimulation}
            className="flex items-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Square className="h-5 w-5 mr-2" />
            Arrêter
          </button>
        </div>
      )}

      {/* Completed Simulation */}
      {isCompleted && currentSimulation && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-green-800">Simulation Terminée!</h4>
            <div className="flex space-x-2">
              <button
                onClick={downloadResults}
                className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-1" />
                Télécharger
              </button>
              <button
                onClick={resetSimulation}
                className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Nouvelle
              </button>
            </div>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>ID:</strong> {currentSimulation.id}</p>
            <p><strong>Statut:</strong> Terminé avec succès</p>
            <p><strong>Durée:</strong> Environ 10 secondes</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimulationRunner
