import React from 'react';
import { useOrchestrator } from '../../hooks/useOrchestrator';
import { logger } from '../../utils/logger';

const ResultsSynthesizer = () => {
  const { latestResult } = useOrchestrator();

  if (!latestResult) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-lg h-full flex items-center justify-center">
        <p className="text-gray-500">Aucun résultat à synthétiser.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Synthèse des Résultats</h2>
      
      <div className="space-y-4">
        <div className="p-3 border rounded-md bg-green-50">
          <p className="font-medium text-green-800">Requête Utilisateur:</p>
          <p className="text-sm text-green-700 italic">"{latestResult.request}"</p>
        </div>

        <div className="p-3 border rounded-md bg-blue-50">
          <p className="font-medium text-blue-800">Synthèse Finale:</p>
          <p className="text-gray-700 mt-1">{latestResult.result}</p>
        </div>

        <div className="p-3 border rounded-md bg-yellow-50">
          <p className="font-medium text-yellow-800">Détails du Plan:</p>
          <p className="text-sm text-gray-700 mt-1">{latestResult.plan.description}</p>
          <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
            {latestResult.plan.steps.map((step, index) => (
              <li key={index}>
                <strong>{step.task_type}:</strong> {step.output || "En attente de résultat"}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResultsSynthesizer;
