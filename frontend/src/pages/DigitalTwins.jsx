import React, { useState } from 'react'
import { 
  Network, 
  Plus, 
  Settings,
  TrendingUp,
  Activity,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Download
} from 'lucide-react'
import TwinConfigurator from '../components/digital-twins/TwinConfigurator'
import OptimizationDashboard from '../components/digital-twins/OptimizationDashboard'
import PerformanceMonitor from '../components/digital-twins/PerformanceMonitor'

const DigitalTwins = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedTwin, setSelectedTwin] = useState(null)

  const digitalTwins = [
    {
      id: 1,
      name: 'Turbine Éolienne Alpha',
      type: 'wind_turbine',
      status: 'active',
      efficiency: 85,
      lastUpdated: '2024-01-15 14:30',
      parameters: {
        rotor_diameter: 120,
        hub_height: 90,
        rated_power: 3000
      }
    },
    {
      id: 2,
      name: 'Échangeur Thermique Beta',
      type: 'heat_exchanger',
      status: 'optimizing',
      efficiency: 72,
      lastUpdated: '2024-01-15 13:45',
      parameters: {
        heat_transfer_area: 150,
        flow_rate: 2.5,
        temperature_difference: 40
      }
    },
    {
      id: 3,
      name: 'Réacteur Chimique Gamma',
      type: 'chemical_reactor',
      status: 'idle',
      efficiency: 68,
      lastUpdated: '2024-01-14 16:20',
      parameters: {
        volume: 500,
        temperature: 250,
        pressure: 15
      }
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'optimizing': return 'text-blue-600 bg-blue-100'
      case 'idle': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'wind_turbine': return '🌬️'
      case 'heat_exchanger': return '🔥'
      case 'chemical_reactor': return '⚗️'
      default: return '📊'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <Network className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Jumeaux Numériques</h1>
              <p className="text-gray-600 mt-2">
                Créez et optimisez des modèles virtuels de vos systèmes physiques
              </p>
            </div>
          </div>
        </div>
        <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Plus className="h-5 w-5 mr-2" />
          Nouveau jumeau
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['dashboard', 'configure', 'optimize', 'monitor'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'dashboard' && 'Tableau de bord'}
                {tab === 'configure' && 'Configuration'}
                {tab === 'optimize' && 'Optimisation'}
                {tab === 'monitor' && 'Monitoring'}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Jumeaux actifs</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
                    </div>
                    <Network className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Efficacité moyenne</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">75%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Optimisations ce mois</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Économies estimées</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">$45K</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Digital Twins List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Jumeaux Numériques</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {digitalTwins.map((twin) => (
                    <div
                      key={twin.id}
                      className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer ${
                        selectedTwin?.id === twin.id
                          ? 'border-purple-500 ring-2 ring-purple-100'
                          : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedTwin(twin)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{getTypeIcon(twin.type)}</span>
                            <h4 className="font-semibold text-gray-900">{twin.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 capitalize">{twin.type.replace('_', ' ')}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(twin.status)}`}>
                          {twin.status}
                        </span>
                      </div>

                      {/* Efficiency Gauge */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Efficacité</span>
                          <span>{twin.efficiency}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              twin.efficiency >= 80 ? 'bg-green-600' :
                              twin.efficiency >= 60 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${twin.efficiency}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Parameters */}
                      <div className="space-y-2">
                        {Object.entries(twin.parameters).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                            <span className="font-medium text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 mt-6">
                        <button className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                          <Play className="h-4 w-4 mr-1" />
                          Démarrer
                        </button>
                        <button className="px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Configuration Tab */}
          {activeTab === 'configure' && (
            <TwinConfigurator
              twin={selectedTwin}
              onSave={(config) => {
                console.log('Saving twin config:', config)
              }}
            />
          )}

          {/* Optimization Tab */}
          {activeTab === 'optimize' && (
            <OptimizationDashboard twin={selectedTwin} />
          )}

          {/* Monitor Tab */}
          {activeTab === 'monitor' && (
            <PerformanceMonitor twin={selectedTwin} />
          )}
        </div>
      </div>
    </div>
  )
}

export default DigitalTwins
