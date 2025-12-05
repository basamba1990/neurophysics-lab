import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FolderPlus, 
  Search, 
  Filter, 
  Folder,
  Users,
  Calendar,
  TrendingUp,
  MoreVertical
} from 'lucide-react'

const Projects = () => {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'Optimisation Turbine Hydrogène',
      description: 'Simulation CFD pour optimisation de turbine à hydrogène',
      status: 'active',
      teamSize: 4,
      lastUpdated: '2024-01-15',
      simulations: 12,
      progress: 75
    },
    {
      id: 2,
      name: 'Transfert Thermique Réacteur',
      description: 'Analyse thermique du réacteur nucléaire de nouvelle génération',
      status: 'active',
      teamSize: 3,
      lastUpdated: '2024-01-14',
      simulations: 8,
      progress: 60
    },
    {
      id: 3,
      name: 'Aérodynamique Avion Régional',
      description: 'Étude aérodynamique pour avion régional à hydrogène',
      status: 'completed',
      teamSize: 6,
      lastUpdated: '2024-01-10',
      simulations: 25,
      progress: 100
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets R&D</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos projets de recherche et développement collaboratifs
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FolderPlus className="h-5 w-5 mr-2" />
          Nouveau projet
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-5 w-5 mr-2" />
              Filtres
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Calendar className="h-5 w-5 mr-2" />
              Trier par date
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Project Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Folder className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              {/* Project Description */}
              <p className="text-gray-600 text-sm mb-6">{project.description}</p>

              {/* Project Stats */}
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progression</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {project.teamSize} membres
                  </div>
                  <div className="flex items-center text-gray-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {project.simulations} simulations
                  </div>
                </div>

                {/* Last Updated */}
                <div className="text-xs text-gray-500">
                  Dernière mise à jour: {project.lastUpdated}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t border-gray-100">
                  <Link
                    to={`/projects/${project.id}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Ouvrir
                  </Link>
                  <button className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
                    Partager
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
          <p className="text-gray-600">
            Créez votre premier projet ou modifiez vos critères de recherche
          </p>
        </div>
      )}
    </div>
  )
}

export default Projects
