// frontend/src/components/digital-twins/OptimizationDashboard.jsx

import React from 'react';
import PropTypes from 'prop-types';
import DataTable from '../ui/DataTable';

const OptimizationDashboard = ({ optimizationResults }) => {
  if (!optimizationResults || optimizationResults.length === 0) {
    return (
      <div className="p-4 bg-white shadow rounded-lg text-gray-500">
        Aucun résultat d'optimisation à afficher.
      </div>
    );
  }

  const columns = [
    { key: 'optimization_id', header: 'ID' },
    { key: 'status', header: 'Statut' },
    { key: 'optimal_objective_value', header: 'Valeur Optimale', render: (value) => value.toFixed(4) },
    { key: 'method_used', header: 'Méthode' },
    { key: 'optimal_parameters', header: 'Paramètres Optimaux', render: (params) => JSON.stringify(params) },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Tableau de Bord d'Optimisation</h2>
      
      <DataTable data={optimizationResults} columns={columns} />

      {/* Affichage détaillé du dernier résultat */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold text-indigo-600 mb-2">Dernier Rapport Détaillé</h3>
        <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
          {JSON.stringify(optimizationResults[0].optimization_report, null, 2)}
        </pre>
      </div>
    </div>
  );
};

OptimizationDashboard.propTypes = {
  optimizationResults: PropTypes.arrayOf(
    PropTypes.shape({
      optimization_id: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      optimal_objective_value: PropTypes.number.isRequired,
      method_used: PropTypes.string.isRequired,
      optimal_parameters: PropTypes.object.isRequired,
      optimization_report: PropTypes.object,
    })
  ),
};

export default OptimizationDashboard;
