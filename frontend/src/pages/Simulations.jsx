import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import {
  Play,
  Pause,
  RefreshCw,
  Filter,
  Download,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import apiClient from '../services/api'
import ResultsVisualization from '../components/solver/ResultsVisualization'
import SimulationRunner from '../components/solver/SimulationRunner'

const Simulations = () => {
  const [selectedSimulation, setSelectedSimulation] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: simulations = [], isLoading, refetch } = useQuery(
    'simulations',
    () => apiClient.getSimulations(),
    {
      refetchInterval: 5000 // Poll every 5 seconds for updates
    }
  )

  const filteredSimulations = simulations.filter(sim => {
    if (filter !== 'all' && sim.status !== filter) return false
    if (searchTerm && !sim.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleRunSimulation = async (simulationData) => {
    try {
      await apiClient.createSimulation(simulationData)
      refetch()
    } catch (error) {
      console.error('Failed to run simulation:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Simulations PINN</h1>
          <p className="text-gray-600 mt-2">
            Gérez et exécutez vos simulations accélérées par IA
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refetch}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Simulation List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher une simulation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="running">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="failed">Échoué</option>
                </select>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="h-5 w-5 mr-2" />
                  Filtres
                </button>
              </div>
            </div>
          </div>

          {/* Simulation Runner */}
          <div className="bg-white rounded-lg shadow">
            <SimulationRunner onRunSimulation={handleRunSimulation} />
          </div>

          {/* Simulations List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulations Récentes</h3>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-600 mt-2">Chargement des simulations...</p>
                </div>
              ) : filteredSimulations.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-gray-600 mt-2">Aucune simulation trouvée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSimulations.map((simulation) => (
                    <div
                      key={simulation.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSimulation?.id === simulation.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSimulation(simulation)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{simulation.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Modèle: {simulation.physics_model_id}
                          </p>
                          <div className="flex items-center mt-2">
                            <Clock className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500">
                              {new Date(simulation.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(simulation.status)}`}>
                            {getStatusIcon(simulation.status)}
                            <span className="ml-1">{simulation.status}</span>
                          </span>
                          {simulation.status === 'completed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle download
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Details and Visualization */}
        <div className="space-y-6">
          {/* Simulation Details */}
          {selectedSimulation ? (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Détails de la simulation
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nom</label>
                    <p className="mt-1 text-gray-900">{selectedSimulation.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Statut</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSimulation.status)}`}>
                        {getStatusIcon(selectedSimulation.status)}
                        <span className="ml-1">{selectedSimulation.status}</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Paramètres</label>
                    <pre className="mt-1 p-3 bg-gray-50 rounded text-sm overflow-auto">
                      {JSON.stringify(selectedSimulation.input_parameters, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Results Visualization */}
              <div className="bg-white rounded-lg shadow">
                <ResultsVisualization simulation={selectedSimulation} />
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Sélectionnez une simulation
                </h3>
                <p className="mt-2 text-gray-600">
                  Cliquez sur une simulation dans la liste pour voir ses détails et résultats
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Simulations
