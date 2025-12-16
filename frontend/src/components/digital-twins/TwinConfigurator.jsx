// frontend/src/components/digital-twins/TwinConfigurator.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';
import Input from '../ui/Input';

const TwinConfigurator = ({ initialConfig, onSave }) => {
  const [config, setConfig] = useState(initialConfig || {
    name: '',
    system_type: 'Fluid Dynamics',
    optimization_objectives: [],
    constraints: [],
    parameters_space: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleObjectiveChange = (index, field, value) => {
    const newObjectives = [...config.optimization_objectives];
    newObjectives[index] = { ...newObjectives[index], [field]: value };
    setConfig(prev => ({ ...prev, optimization_objectives: newObjectives }));
  };

  const addObjective = () => {
    setConfig(prev => ({
      ...prev,
      optimization_objectives: [...prev.optimization_objectives, { name: '', target: 'minimize', weight: 1.0 }]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Configuration du Jumeau Numérique</h2>

      {/* Nom et Type de Système */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom du Jumeau</label>
          <Input id="name" name="name" value={config.name} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="system_type" className="block text-sm font-medium text-gray-700">Type de Système</label>
          <select id="system_type" name="system_type" value={config.system_type} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option>Fluid Dynamics</option>
            <option>Heat Transfer</option>
            <option>Structural Mechanics</option>
          </select>
        </div>
      </div>

      {/* Objectifs d'Optimisation */}
      <div>
        <h3 className="text-lg font-semibold text-indigo-600 mb-2">Objectifs d'Optimisation</h3>
        {config.optimization_objectives.map((obj, index) => (
          <div key={index} className="flex space-x-2 mb-2 p-2 border rounded-md">
            <Input 
              placeholder="Nom de l'objectif (e.g., Minimiser la Perte)" 
              value={obj.name} 
              onChange={(e) => handleObjectiveChange(index, 'name', e.target.value)} 
              required
            />
            <select 
              value={obj.target} 
              onChange={(e) => handleObjectiveChange(index, 'target', e.target.value)}
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="minimize">Minimiser</option>
              <option value="maximize">Maximiser</option>
            </select>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={addObjective}>Ajouter un Objectif</Button>
      </div>

      {/* Les sections pour les Contraintes et l'Espace des Paramètres seraient ajoutées ici */}
      {/* ... (Simplifié pour l'exemple) */}

      <div className="flex justify-end">
        <Button type="submit">Sauvegarder la Configuration</Button>
      </div>
    </form>
  );
};

TwinConfigurator.propTypes = {
  initialConfig: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export default TwinConfigurator;
