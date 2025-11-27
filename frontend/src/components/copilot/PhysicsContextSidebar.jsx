// frontend/src/components/copilot/PhysicsContextSidebar.jsx

import React from 'react';
import PropTypes from 'prop-types';

const PhysicsContextSidebar = ({ context }) => {
  if (!context) {
    return (
      <div className="p-4 bg-white shadow rounded-lg text-gray-500">
        Aucun contexte physique chargé.
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Contexte Physique</h2>
      
      <div className="space-y-4">
        {/* Type de Modèle */}
        <div>
          <h3 className="text-md font-semibold text-indigo-600">Type de Modèle</h3>
          <p className="text-gray-700">{context.model_type || 'Non spécifié'}</p>
        </div>

        {/* Paramètres Physiques */}
        <div>
          <h3 className="text-md font-semibold text-indigo-600">Paramètres Physiques</h3>
          {context.physics_parameters ? (
            <ul className="list-disc list-inside ml-2 text-sm text-gray-700">
              {Object.entries(context.physics_parameters).map(([key, value]) => (
                <li key={key}>
                  <span className="font-medium">{key}:</span> {value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Aucun paramètre défini.</p>
          )}
        </div>

        {/* Conditions aux Limites */}
        <div>
          <h3 className="text-md font-semibold text-indigo-600">Conditions aux Limites</h3>
          {context.boundary_conditions ? (
            <ul className="list-disc list-inside ml-2 text-sm text-gray-700">
              {Object.entries(context.boundary_conditions).map(([key, value]) => (
                <li key={key}>
                  <span className="font-medium">{key}:</span> {value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Aucune condition définie.</p>
          )}
        </div>

        {/* Autres informations contextuelles */}
        {context.mesh_config && (
          <div>
            <h3 className="text-md font-semibold text-indigo-600">Configuration du Maillage</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(context.mesh_config, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

PhysicsContextSidebar.propTypes = {
  context: PropTypes.shape({
    model_type: PropTypes.string,
    physics_parameters: PropTypes.object,
    boundary_conditions: PropTypes.object,
    mesh_config: PropTypes.object,
  }),
};

export default PhysicsContextSidebar;
