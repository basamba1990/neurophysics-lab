import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react'

const BoundaryConditions = ({ 
  boundaryConditions = {}, 
  onChange,
  physicsType = 'navier_stokes'
}) => {
  const [conditions, setConditions] = useState(boundaryConditions)
  const [editingCondition, setEditingCondition] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  const boundaryTypes = [
    { value: 'dirichlet', label: 'Dirichlet (valeur fixe)', example: '{"type": "dirichlet", "value": 1.0}' },
    { value: 'neumann', label: 'Neumann (flux)', example: '{"type": "neumann", "flux": 0.0}' },
    { value: 'periodic', label: 'Périodique', example: '{"type": "periodic"}' },
    { value: 'symmetry', label: 'Symétrie', example: '{"type": "symmetry"}' },
    { value: 'no-slip', label: 'No-Slip', example: '{"type": "no-slip"}' }
  ]

  const defaultConditions = {
    navier_stokes: {
      'inlet': { type: 'dirichlet', value: 1.0 },
      'outlet': { type: 'dirichlet', value: 0.0 },
      'walls': { type: 'no-slip' }
    },
    heat_transfer: {
      'hot_wall': { type: 'dirichlet', value: 100.0 },
      'cold_wall': { type: 'dirichlet', value: 0.0 },
      'insulated': { type: 'neumann', flux: 0.0 }
    },
    structural: {
      'fixed': { type: 'dirichlet', value: 0.0 },
      'load': { type: 'neumann', flux: 1000.0 }
    }
  }

  useEffect(() => {
    if (Object.keys(conditions).length === 0) {
      setConditions(defaultConditions[physicsType] || {})
    }
  }, [physicsType])

  useEffect(() => {
    onChange?.(conditions)
  }, [conditions, onChange])

  const addCondition = () => {
    setIsAdding(true)
    setEditingCondition({
      id: `condition_${Date.now()}`,
      name: '',
      type: 'dirichlet',
      value: 0.0
    })
  }

  const saveCondition = () => {
    if (editingCondition && editingCondition.name) {
      setConditions(prev => ({
        ...prev,
        [editingCondition.name]: {
          type: editingCondition.type,
          ...(editingCondition.type === 'dirichlet' && { value: parseFloat(editingCondition.value) || 0.0 }),
          ...(editingCondition.type === 'neumann' && { flux: parseFloat(editingCondition.flux) || 0.0 })
        }
      }))
    }
    setEditingCondition(null)
    setIsAdding(false)
  }

  const removeCondition = (conditionName) => {
    setConditions(prev => {
      const newConditions = { ...prev }
      delete newConditions[conditionName]
      return newConditions
    })
  }

  const startEdit = (name, condition) => {
    setEditingCondition({
      id: name,
      name,
      type: condition.type,
      value: condition.value,
      flux: condition.flux
    })
  }

  const cancelEdit = () => {
    setEditingCondition(null)
    setIsAdding(false)
  }

  const getConditionDescription = (condition) => {
    switch (condition.type) {
      case 'dirichlet':
        return `Valeur fixe: ${condition.value}`
      case 'neumann':
        return `Flux: ${condition.flux}`
      case 'periodic':
        return 'Condition périodique'
      case 'symmetry':
        return 'Symétrie'
      case 'no-slip':
        return 'Paroi fixe (no-slip)'
      default:
        return condition.type
    }
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Conditions aux Limites</h3>
        <button
          onClick={addCondition}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une Condition
        </button>
      </div>

      {/* Editing/Adding Form */}
      {(editingCondition || isAdding) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la condition *
              </label>
              <input
                type="text"
                value={editingCondition?.name || ''}
                onChange={(e) => setEditingCondition(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: inlet, wall, symmetry"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de condition *
              </label>
              <select
                value={editingCondition?.type || 'dirichlet'}
                onChange={(e) => setEditingCondition(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {boundaryTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {editingCondition?.type === 'dirichlet' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valeur
              </label>
              <input
                type="number"
                step="0.1"
                value={editingCondition?.value || 0}
                onChange={(e) => setEditingCondition(prev => ({ ...prev, value: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {editingCondition?.type === 'neumann' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flux
              </label>
              <input
                type="number"
                step="0.1"
                value={editingCondition?.flux || 0}
                onChange={(e) => setEditingCondition(prev => ({ ...prev, flux: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={cancelEdit}
              className="flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <X className="h-4 w-4 mr-1" />
              Annuler
            </button>
            <button
              onClick={saveCondition}
              disabled={!editingCondition?.name}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-1" />
              {isAdding ? 'Ajouter' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      )}

      {/* Conditions List */}
      <div className="space-y-3">
        {Object.entries(conditions).map(([name, condition]) => (
          <div key={name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{name}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  condition.type === 'dirichlet' ? 'bg-blue-100 text-blue-800' :
                  condition.type === 'neumann' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {condition.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {getConditionDescription(condition)}
              </p>
            </div>
            
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => startEdit(name, condition)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
              >
                <Edit3 className="h-
