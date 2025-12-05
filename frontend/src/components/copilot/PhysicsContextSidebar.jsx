import React, { useState } from 'react'
import {
  Settings,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Zap,
  Thermometer,
  Wind,
  Gauge,
  Droplets
} from 'lucide-react'

const PhysicsContextSidebar = ({ context, onUpdate }) => {
  const [editing, setEditing] = useState(false)
  const [tempContext, setTempContext] = useState(context)

  const physicsTypes = [
    { value: 'navier_stokes', label: 'Navier-Stokes', icon: '🌊' },
    { value: 'heat_transfer', label: 'Transfert thermique', icon: '🔥' },
    { value: 'structural', label: 'Mécanique des structures', icon: '🏗️' },
    { value: 'electromagnetic', label: 'Électromagnétisme', icon: '⚡' },
    { value: 'multiphysics', label: 'Multiphysique', icon: '🧩' },
    { value: 'turbulence', label: 'Turbulence', icon: '🌀' }
  ]

  const materialTypes = [
    { value: 'air', label: 'Air', properties: { density: 1.225, viscosity: 1.789e-5 } },
    { value: 'water', label: 'Eau', properties: { density: 997, viscosity: 0.001 } },
    { value: 'steel', label: 'Acier', properties: { density: 7850, youngs_modulus: 200e9 } },
    { value: 'aluminum', label: 'Aluminium', properties: { density: 2700, youngs_modulus: 69e9 } },
    { value: 'custom', label: 'Personnalisé', properties: {} }
  ]

  const handleSave = () => {
    onUpdate(tempContext)
    setEditing(false)
  }

  const handleAddEquation = () => {
    const newEquation = prompt('Entrez une nouvelle équation:')
    if (newEquation) {
      setTempContext(prev => ({
        ...prev,
        equations: [...(prev.equations || []), newEquation]
      }))
    }
  }

  const handleAddParameter = () => {
    const name = prompt('Nom du paramètre:')
    const value = prompt('Valeur:')
    if (name && value) {
      setTempContext(prev => ({
        ...prev,
        parameters: { ...prev.parameters, [name]: parseFloat(value) }
      }))
    }
  }

  const handleMaterialChange = (materialType) => {
    const material = materialTypes.find(m => m.value === materialType)
    if (material) {
      setTempContext(prev => ({
        ...prev,
        material: materialType,
        parameters: { ...prev.parameters, ...material.properties }
      }))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Contexte Physique</h3>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          {editing ? <Save className="h-4 w-4 mr-1" /> : <Settings className="h-4 w-4 mr-1" />}
          {editing ? 'Sauvegarder' : 'Éditer'}
        </button>
      </div>

      {/* Type de physique */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de physique
        </label>
        <div className="grid grid-cols-2 gap-2">
          {physicsTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setTempContext(prev => ({ ...prev, physics_type: type.value }))}
              className={`p-3 rounded-lg border text-left transition-colors ${
                tempContext.physics_type === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <span className="text-xl mr-2">{type.icon}</span>
                <span className="text-sm font-medium">{type.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Matériau */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Matériau
        </label>
        <div className="space-y-2">
          {materialTypes.map(material => (
            <div
              key={material.value}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                tempContext.material === material.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleMaterialChange(material.value)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{material.label}</span>
                {material.value !== 'custom' && (
                  <span className="text-xs text-gray-500">
                    ρ={material.properties.density || '?'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Équations */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Équations
          </label>
          {editing && (
            <button
              onClick={handleAddEquation}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-3 w-3 inline mr-1" />
              Ajouter
            </button>
          )}
        </div>
        <div className="space-y-2">
          {(tempContext.equations || []).map((equation, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <code className="text-sm font-mono">{equation}</code>
                {editing && (
                  <button
                    onClick={() => {
                      const newEquations = [...tempContext.equations]
                      newEquations.splice(index, 1)
                      setTempContext(prev => ({ ...prev, equations: newEquations }))
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {(!tempContext.equations || tempContext.equations.length === 0) && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Aucune équation définie
            </div>
          )}
        </div>
      </div>

      {/* Paramètres */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Paramètres
          </label>
          {editing && (
            <button
              onClick={handleAddParameter}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-3 w-3 inline mr-1" />
              Ajouter
            </button>
          )}
        </div>
        <div className="space-y-2">
          {tempContext.parameters && Object.entries(tempContext.parameters).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-gray-900">{key}</span>
                {editing && (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setTempContext(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, [key]: parseFloat(e.target.value) }
                    }))}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm w-24"
                  />
                )}
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">{typeof value === 'number' ? value.toExponential(3) : value}</span>
                {editing && (
                  <button
                    onClick={() => {
                      const newParams = { ...tempContext.parameters }
                      delete newParams[key]
                      setTempContext(prev => ({ ...prev, parameters: newParams }))
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {(!tempContext.parameters || Object.keys(tempContext.parameters).length === 0) && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Aucun paramètre défini
            </div>
          )}
        </div>
      </div>

      {/* Conditions aux limites */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Conditions aux limites
        </label>
        <div className="space-y-2">
          {tempContext.boundary_conditions && Object.entries(tempContext.boundary_conditions).map(([name, condition]) => (
            <div key={name} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{name}</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {condition.type}
                </span>
              </div>
              {condition.value && (
                <div className="text-sm text-gray-600">
                  Valeur: {condition.value}
                </div>
              )}
            </div>
          ))}
          {(!tempContext.boundary_conditions || Object.keys(tempContext.boundary_conditions).length === 0) && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Aucune condition définie
            </div>
          )}
        </div>
      </div>

      {/* Validation */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          Validation du contexte
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li className="flex items-center">
            {tempContext.physics_type ? '✓' : '✗'}
            <span className="ml-2">Type de physique défini</span>
          </li>
          <li className="flex items-center">
            {(tempContext.equations || []).length > 0 ? '✓' : '✗'}
            <span className="ml-2">Équations définies</span>
          </li>
          <li className="flex items-center">
            {tempContext.parameters && Object.keys(tempContext.parameters).length > 0 ? '✓' : '✗'}
            <span className="ml-2">Paramètres définis</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default PhysicsContextSidebar
