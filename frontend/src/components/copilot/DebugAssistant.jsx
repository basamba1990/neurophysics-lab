// frontend/src/components/copilot/DebugAssistant.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';
import Input from '../ui/Input';

const DebugAssistant = ({ onDebugRequest }) => {
  const [errorLog, setErrorLog] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugReport, setDebugReport] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!errorLog.trim()) return;

    setIsLoading(true);
    setDebugReport(null);

    try {
      // Simuler l'appel à la fonction de débogage fournie par le parent
      const report = await onDebugRequest(errorLog);
      setDebugReport(report);
    } catch (error) {
      setDebugReport({
        status: 'error',
        message: `Erreur lors de la requête de débogage: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Assistant de Débogage</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="errorLog" className="block text-sm font-medium text-gray-700 mb-1">
            Collez votre journal d'erreurs ou votre traceback ici:
          </label>
          <textarea
            id="errorLog"
            rows="6"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={errorLog}
            onChange={(e) => setErrorLog(e.target.value)}
            placeholder="Ex: Traceback (most recent call last): ..."
          />
        </div>
        
        <Button type="submit" disabled={isLoading || !errorLog.trim()}>
          {isLoading ? 'Analyse en cours...' : 'Analyser l\'Erreur avec l\'IA'}
        </Button>
      </form>

      {debugReport && (
        <div className={`mt-4 p-4 rounded-lg ${debugReport.status === 'error' ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400'} border`}>
          <h3 className="font-semibold text-lg mb-2">Rapport de Débogage:</h3>
          <p className="whitespace-pre-wrap text-sm">{debugReport.message || JSON.stringify(debugReport, null, 2)}</p>
        </div>
      )}
    </div>
  );
};

DebugAssistant.propTypes = {
  onDebugRequest: PropTypes.func.isRequired,
};

export default DebugAssistant;
