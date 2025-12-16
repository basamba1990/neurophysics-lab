// frontend/src/components/copilot/AISuggestionsPanel.jsx

import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';

const AISuggestionsPanel = ({ suggestions, onApplySuggestion }) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="p-4 bg-white shadow rounded-lg text-gray-500">
        Aucune suggestion de l'IA pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <div key={index} className="p-4 bg-white shadow rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-indigo-600 mb-2">Suggestion #{index + 1}</h3>
          
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700">Explication:</p>
            <p className="text-gray-600 text-sm italic">{suggestion.explanation}</p>
          </div>

          {suggestion.suggested_code_diff && (
            <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-100 overflow-x-auto text-xs font-mono">
              <p className="text-sm font-medium text-gray-700 mb-1">Diff de Code Suggéré:</p>
              <pre className="whitespace-pre-wrap">{suggestion.suggested_code_diff}</pre>
            </div>
          )}

          {suggestion.validation_report && (
            <div className="mb-3 p-3 bg-yellow-50 rounded-md border border-yellow-200 text-xs">
              <p className="text-sm font-medium text-yellow-800 mb-1">Rapport de Validation:</p>
              <pre className="whitespace-pre-wrap text-yellow-700">{JSON.stringify(suggestion.validation_report, null, 2)}</pre>
            </div>
          )}

          <div className="flex justify-end mt-3">
            <Button 
              size="sm" 
              onClick={() => onApplySuggestion(suggestion)}
              disabled={!suggestion.suggested_code_diff}
            >
              Appliquer la Suggestion
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

AISuggestionsPanel.propTypes = {
  suggestions: PropTypes.arrayOf(
    PropTypes.shape({
      explanation: PropTypes.string.isRequired,
      suggested_code_diff: PropTypes.string,
      validation_report: PropTypes.object,
    })
  ),
  onApplySuggestion: PropTypes.func.isRequired,
};

export default AISuggestionsPanel;
