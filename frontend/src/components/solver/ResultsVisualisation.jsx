import React from 'react'
import { BarChart3 } from 'lucide-react'

const ResultsVisualization = ({ simulation }) => {
  if (!simulation) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="text-gray-600 mt-4">Sélectionnez une simulation</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Visualisation des résultats
      </h3>
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Statut</p>
          <p className="text-lg font-semibold capitalize">{simulation.status}</p>
        </div>
        
        {simulation.pinn_predictions && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Données disponibles</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-600">Champ de vitesse</p>
                <p className="text-sm font-medium">✓ Disponible</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-600">Champ de pression</p>
                <p className="text-sm font-medium">✓ Disponible</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsVisualization
