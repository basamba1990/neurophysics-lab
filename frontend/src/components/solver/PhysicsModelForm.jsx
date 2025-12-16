import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { usePinnSolver } from '../../hooks/useApi'
import { Plus, FileText, Settings } from 'lucide-react'

const PhysicsModelForm = ({ onSubmit, initialData = {} }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: initialData
  })
  const { createPhysicsModel, loading, error } = usePinnSolver()

  const [physicsType, setPhysicsType] = useState(initialData.physics_type || 'navier_stokes')
  const [advancedConfig, setAdvancedConfig] = useState(false)

  const physicsConfigs = {
    navier_stokes: {
      equations: [
        "Continuity: ∇·u = 0",
        "Momentum: ∂u/∂t + (u·∇)u = -∇p/ρ + ν∇²u"
      ],
      parameters: ['reynolds', 'density', 'viscosity'],
      defaultBoundaryConditions: {
        "inlet": { "type": "dirichlet", "value": 1.0 },
        "outlet": { "type": "dirichlet", "value": 0.0 },
        "walls": { "type": "no-slip", "value": 0.0 }
      }
    },
    heat_transfer: {
      equations: [
        "Energy: ρc_p(∂T/∂t + u·∇T) = ∇·(k∇T) + Q"
      ],
      parameters: ['thermal_conductivity', 'specific_heat', 'density'],
      defaultBoundaryConditions: {
        "hot_wall": { "type": "dirichlet", "value": 100.0 },
        "cold_wall": { "type": "dirichlet", "value": 0.0 },
        "insulated": { "type": "neumann", "flux": 0.0 }
      }
    },
    structural: {
      equations: [
        "Equilibrium: ∇·σ + f = 0",
        "Constitutive: σ = C:ε"
      ],
      parameters: ['young_modulus', 'poisson_ratio', 'density'],
      defaultBoundaryConditions: {
        "fixed": { "type": "dirichlet", "value": 0.0 },
        "load": { "type": "neumann", "flux": 1000.0 }
      }
    }
  }

  const onFormSubmit = async (data) => {
    try {
      const modelData = {
        name: data.name,
        physics_type: physicsType,
        equations: physicsConfigs[physicsType].equations,
        boundary_conditions: JSON.parse(data.boundary_conditions || JSON.stringify(physicsConfigs[physicsType].defaultBoundaryConditions)),
        mesh_config: JSON.parse(data.mesh_config || '{"nx": 50, "ny": 50, "length": 1.0, "height": 1.0}')
      }
      
      const result = await createPhysicsModel(modelData)
      onSubmit?.(result)
    } catch (error) {
      console.error('Error creating physics model:', error)
    }
  }

  const currentConfig = physicsConfigs[physicsType]

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Nouveau Modèle Physique</h3>
        </div>
        <button
          type="button"
          onClick={() => setAdvancedConfig(!advancedConfig)}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <Settings className="h-4 w-4 mr-2" />
          {advancedConfig ? 'Configuration Simple' : 'Configuration Avancée'}
        </button>
      </div>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du modèle *
            </label>
            <input
              type="text"
              {...register('name', { 
                required: 'Le nom est requis',
                minLength: { value: 3, message: 'Minimum 3 caractères' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ex: Écoulement Cavité Re=1000"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de physique *
            </label>
            <select
              value={physicsType}
              onChange={(e) => setPhysicsType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="navier_stokes">Dynamique des Fluides - Navier-Stokes</option>
              <option value="heat_transfer">Transfert Thermique</option>
              <option value="structural">Mécanique des Structures</option>
              <option value="turbulence">Turbulence</option>
              <option value="multiphysics">Multiphysique</option>
            </select>
          </div>
        </div>

        {/* Physics Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description du problème
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Décrivez le problème physique à résoudre..."
          />
        </div>

        {/* Equations */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="font-medium text-blue-900 mb-2">Équations Physiques</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {currentConfig.equations.map((eq, index) => (
              <li key={index} className="font-mono">• {eq}</li>
            ))}
          </ul>
        </div>

        {/* Advanced Configuration */}
        {advancedConfig && (
          <>
            {/* Boundary Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conditions aux limites (JSON)
              </label>
              <textarea
                {...register('boundary_conditions')}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder={JSON.stringify(currentConfig.defaultBoundaryConditions, null, 2)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format JSON avec les types: dirichlet, neumann, periodic, symmetry
              </p>
            </div>

            {/* Mesh Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuration du maillage (JSON)
              </label>
              <textarea
                {...register('mesh_config')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder='{"nx": 50, "ny": 50, "length": 1.0, "height": 1.0, "mesh_type": "rectangular"}'
              />
            </div>

            {/* Model Parameters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paramètres du modèle (JSON)
              </label>
              <textarea
                {...register('model_parameters')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder='{"hidden_layers": [64, 64, 64], "activation": "tanh", "learning_rate": 0.001}'
              />
            </div>
          </>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'Création...' : 'Créer le Modèle'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PhysicsModelForm
