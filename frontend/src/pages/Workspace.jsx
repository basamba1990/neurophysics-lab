import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Cpu, 
  Code2, 
  Network, 
  BarChart3,
  Play,
  Zap,
  CheckCircle
} from 'lucide-react'
import { Breadcrumb } from '../ui/Breadcrumb.jsx'; // Importer le composant Breadcrumb
import Button from '../ui/Button.jsx'; // Importer le composant Button

const Workspace = () => {
  const quickActions = [
    {
      title: 'Nouvelle Simulation PINN',
      description: 'Lancer une simulation physique accélérée par IA',
      icon: Cpu,
      link: '/simulations',
      color: 'bg-blue-500'
    },
    {
      title: 'Scientific Copilot',
      description: 'Analyser et moderniser du code scientifique',
      icon: Code2,
      link: '/copilot',
      color: 'bg-green-500'
    },
    {
      title: 'Digital Twins',
      description: 'Créer et optimiser des jumeaux numériques',
      icon: Network,
      link: '/digital-twins',
      color: 'bg-purple-500'
    },
    {
      title: 'Analytics',
      description: 'Voir les métriques et performances',
      icon: BarChart3,
      link: '/usage',
      color: 'bg-orange-500'
    }
  ]

  const recentSimulations = [
    { id: 1, name: 'Cavité entraînée - Re=1000', status: 'completed', date: '2024-01-15' },
    { id: 2, name: 'Échangeur thermique', status: 'running', date: '2024-01-15' },
    { id: 3, name: 'Profil aérodynamique', status: 'pending', date: '2024-01-14' }
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={["Espace de Travail R&D"]} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Espace de Travail R&D</h1>
        <p className="text-gray-600 mt-2">
          Plateforme d'Ingénierie Accélérée par IA - Optimisez vos workflows de R&D
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.title}
                to={action.link}
                className="block p-6 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Simulations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Simulations Récentes
            </h3>
            <Link 
              to="/simulations" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Voir tout
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentSimulations.map((sim) => (
              <div key={sim.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{sim.name}</p>
                  <p className="text-sm text-gray-500">{sim.date}</p>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    sim.status === 'completed' ? 'bg-green-100 text-green-800' :
                    sim.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sim.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {sim.status === 'running' && <Play className="h-3 w-3 mr-1" />}
                    {sim.status === 'pending' && <Zap className="h-3 w-3 mr-1" />}
                    {sim.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Métriques de Performance
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Simulations ce mois</span>
              <span className="font-semibold text-gray-900">15</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Temps moyen de calcul</span>
              <span className="font-semibold text-gray-900">45s</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taux de réussite</span>
              <span className="font-semibold text-green-600">92%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Économie de temps</span>
              <span className="font-semibold text-blue-600">85%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Workspace
