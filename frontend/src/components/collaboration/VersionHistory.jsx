// frontend/src/components/collaboration/VersionHistory.jsx

import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';

const VersionHistory = ({ versions, onRestore }) => {
  if (!versions || versions.length === 0) {
    return (
      <div className="p-4 bg-white shadow rounded-lg text-gray-500">
        Aucun historique de version disponible.
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Historique des Versions</h2>

      <ul className="space-y-3">
        {versions.map((version) => (
          <li key={version.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
            <div>
              <p className="font-medium text-indigo-600">Version {version.version_number}</p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{version.author}</span> - {new Date(version.timestamp).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 italic mt-1">{version.description}</p>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => onRestore(version.id)}
            >
              Restaurer
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

VersionHistory.propTypes = {
  versions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      version_number: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  onRestore: PropTypes.func.isRequired,
};

export default VersionHistory;
