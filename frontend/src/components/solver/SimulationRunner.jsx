import React, { useState } from 'react'
import { Play } from 'lucide-react'

const SimulationRunner = ({ onRunSimulation }) => {
  const [name, setName] = useState('')
  const [reynolds, setReynolds] = useState('1000')
  const [density, setDensity] = useState('1.0')
  const [viscosity, setViscosity] = useState('0.01')
  const [isRunning, setIsRunning] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    
    setIsRunning(true)
    
    const simulationData = {
      name,
      input_parameters: {
        reynolds: parseFloat(reynolds),
        density: parseFloat(density),
        viscosity: parseFloat(viscosity),
        nx: 50,
        ny: 50
      }
    }
    
    try {
      await onRunSimulation(simulationData)
      setName('')
      setReynolds('1000')
      setDensity('1.0')
      setViscosity('0.01')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Play className="h-5 w-5 text-green-600 mr-2" />
        <h3 className="text-lg font-semibold">Nouvelle simulation</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de la simulation *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Cavité entraînée - Re=1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de Reynolds
            </label>
            <input
              type="number"
              step="0.1"
              value={reynolds}
              onChange={(e) => setReynolds(e.target.value)}
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
              value={density}
              onChange={(e) => setDensity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Viscosité
            </label>
            <input
              type="number"
              step="0.001"
              value={viscosity}
              onChange={(e) => setViscosity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points X (nx)
            </label>
            <input
              type="number"
              value="50"
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isRunning || !name.trim()}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Lancement...' : 'Lancer la simulation'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SimulationRunner
