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
  AlertCircle,
  Folder,
  Zap
} from 'lucide-react'
import apiClient from '../services/api'
import SimulationRunner from '../components/solver/SimulationRunner'
import { useToast } from '../ui/ToastProvider.jsx'; // Importer le hook useToast

// Composant de visualisation simplifié (remplace ResultsVisualization temporairement)
const SimpleResultsVisualization = ({ simulation }) => {
  if (!simulation || simulation.status !== 'completed') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {!simulation 
              ? "Sélectionnez une simulation" 
              : "Visualisation disponible après complétion"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Résultats de simulation
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Statut</p>
            <p className="text-lg font-semibold text-green-600">Terminé</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Temps d'exécution</p>
            <p className="text-lg font-semibold text-gray-900">
              {simulation.execution_time || "N/A"}s
            </p>
          </div>
        </div>
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-2">Données disponibles</h4>
          <ul className="space-y-2">
            <li className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Champ de vitesse
            </li>
            <li className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Champ de pression
            </li>
            <li className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Métriques de convergence
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

const Simulations = () => {
  const [selectedSimulation, setSelectedSimulation] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { showToast } = useToast(); // Utiliser le hook useToast

  // Données de simulation mockées (en attendant l'API)
  const [simulations, setSimulations] = useState([
    {
      id: 'sim-001',
      name: 'Cavité entraînée - Re=1000',
      status: 'completed',
      physics_model_id: 'navier-stokes-1',
      created_at: '2024-01-15T10:30:00Z',
      input_parameters: { reynolds: 1000, nx: 50, ny: 50 },
      execution_time: 45.2
    },
    {
      id: 'sim-002',
      name: 'Transfert thermique - Plaque chaude',
      status: 'running',
      physics_model_id: 'heat-transfer-1',
      created_at: '2024-01-15T11:15:00Z',
      input_parameters: { temperature: 300, nx: 40, ny: 40 },
      execution_time: 120.5
    },
    {
      id: 'sim-003',
      name: 'Écoulement laminaire - Tube',
      status: 'pending',
      physics_model_id: 'navier-stokes-2',
      created_at: '2024-01-14T14:20:00Z',
      input_parameters: { reynolds: 500, nx: 60, ny: 30 },
      execution_time: null
    }
  ])

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
      // Simulation de création
      const newSim = {
        id: `sim-${Date.now()}`,
        name: simulationData.name,
        status: 'pending',
        physics_model_id: simulationData.physics_model_id || 'default',
        created_at: new Date().toISOString(),
        input_parameters: simulationData.input_parameters || {},
        execution_time: null
      }
      
      setSimulations(prev => [newSim, ...prev])
      showToast('info', 'Simulation créée avec succès'); // Afficher une notification
      
      // Simuler le lancement
      setTimeout(() => {
        setSimulations(prev => 
          prev.map(sim => 
            sim.id === newSim.id 
              ? { ...sim, status: 'running' } 
              : sim
          )
        )
        showToast('info', 'Simulation en cours d\'exécution'); // Afficher une notification
        
        // Simuler la complétion après 5 secondes
        setTimeout(() => {
          setSimulations(prev => 
            prev.map(sim => 
              sim.id === newSim.id 
                ? { 
                    ...sim, 
                    status: 'completed', 
                    execution_time: 42.5,
                    pinn_predictions: { velocity_field: [], pressure_field: [] }
                  } 
                : sim
            )
          )
          showToast('success', 'Simulation terminée avec succès'); // Afficher une notification
        }, 5000)
      }, 1000)
      
    } catch (error) {
      console.error('Failed to run simulation:', error)
      showToast('error', 'Échec du lancement de la simulation'); // Afficher une notification d'erreur
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
            onClick={() => window.location.reload()}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Simulations Récentes
              </h3>
              
              {filteredSimulations.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                          <h4 className="font-medium text-gray-900">
                            {simulation.name}
                          </h4>
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
                            <span className="ml-1 capitalize">{simulation.status}</span>
                          </span>
                          {simulation.status === 'completed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showToast('success', 'Simulation téléchargée avec succès'); // Afficher une notification
                              }}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                              aria-label="Télécharger"
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

        {/* Right Panel - Results Visualization */}
        <div className="lg:col-span-1">
          <SimpleResultsVisualization simulation={selectedSimulation} />
        </div>
      </div>
    </div>
  )
}

export default Simulations
