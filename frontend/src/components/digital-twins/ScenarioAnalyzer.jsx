// frontend/src/components/digital-twins/ScenarioAnalyzer.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ScenarioAnalyzer = ({ onAnalyze }) => {
  const [scenarioName, setScenarioName] = useState('');
  const [parameterChanges, setParameterChanges] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scenarioName.trim() || !parameterChanges.trim()) return;

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      // Simuler l'appel à la fonction d'analyse
      const result = await onAnalyze(scenarioName, parameterChanges);
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult({
        status: 'error',
        message: `Erreur lors de l'analyse de scénario: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Analyse de Scénario "What-If"</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="scenarioName" className="block text-sm font-medium text-gray-700 mb-1">
            Nom du Scénario
          </label>
          <Input 
            id="scenarioName" 
            value={scenarioName} 
            onChange={(e) => setScenarioName(e.target.value)} 
            placeholder="Ex: Augmentation de la Viscosité de 10%"
            required
          />
        </div>

        <div>
          <label htmlFor="parameterChanges" className="block text-sm font-medium text-gray-700 mb-1">
            Changements de Paramètres (JSON ou Texte Libre)
          </label>
          <textarea
            id="parameterChanges"
            rows="4"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={parameterChanges}
            onChange={(e) => setParameterChanges(e.target.value)}
            placeholder="Ex: { 'viscosity': 1.1e-6, 'inlet_velocity': 0.5 }"
            required
          />
        </div>
        
        <Button type="submit" disabled={isLoading || !scenarioName.trim() || !parameterChanges.trim()}>
          {isLoading ? 'Analyse en cours...' : 'Lancer l\'Analyse de Scénario'}
        </Button>
      </form>

      {analysisResult && (
        <div className={`mt-4 p-4 rounded-lg ${analysisResult.status === 'error' ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400'} border`}>
          <h3 className="font-semibold text-lg mb-2">Résultat de l'Analyse:</h3>
          <p className="whitespace-pre-wrap text-sm">{analysisResult.message || JSON.stringify(analysisResult, null, 2)}</p>
        </div>
      )}
    </div>
  );
};

ScenarioAnalyzer.propTypes = {
  onAnalyze: PropTypes.func.isRequired,
};

export default ScenarioAnalyzer;
