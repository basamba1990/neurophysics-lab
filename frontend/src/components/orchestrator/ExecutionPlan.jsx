import React from 'react';
import { useOrchestrator } from '../../hooks/useOrchestrator';
import { logger } from '../../utils/logger';

const ExecutionPlan = () => {
  const { latestPlan } = useOrchestrator();

  if (!latestPlan) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-lg h-full flex items-center justify-center">
        <p className="text-gray-500">Aucun plan d'exécution récent.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Visualisation du Plan d'Exécution</h2>
      
      <div className="mb-4 p-3 border rounded-md bg-blue-50">
        <p className="font-medium text-blue-800">Plan: {latestPlan.description}</p>
        <p className="text-sm text-blue-700">Statut global: <span className={`font-bold ${latestPlan.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{latestPlan.status.toUpperCase()}</span></p>
      </div>

      <div className="space-y-4">
        {latestPlan.steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${getStatusColor(step.status || 'default')}`}>
              {index + 1}
            </div>
            <div className="flex-grow p-3 border rounded-lg shadow-sm bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-700">{step.task_type}</p>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(step.status || 'default')}`}>
                  {step.status ? step.status.toUpperCase() : 'EN ATTENTE'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {step.output ? step.output : `Paramètres: ${JSON.stringify(step.params)}`}
              </p>
              {step.error && (
                <p className="text-xs text-red-500 mt-1">Erreur: {step.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutionPlan;
