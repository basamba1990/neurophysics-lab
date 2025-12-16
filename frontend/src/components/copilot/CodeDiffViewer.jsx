// frontend/src/components/copilot/CodeDiffViewer.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { diffLines } from 'diff';

// Composant utilitaire pour afficher une ligne de diff
const DiffLine = ({ line }) => {
  let className = 'px-2 py-0.5 whitespace-pre-wrap';
  let prefix = ' ';

  if (line.startsWith('+')) {
    className += ' bg-green-100 text-green-800';
    prefix = '+';
  } else if (line.startsWith('-')) {
    className += ' bg-red-100 text-red-800';
    prefix = '-';
  }

  return (
    <div className={className}>
      <span className="inline-block w-4 font-bold">{prefix}</span>
      {line.substring(1)}
    </div>
  );
};

DiffLine.propTypes = {
  line: PropTypes.string.isRequired,
};

const CodeDiffViewer = ({ originalCode, suggestedCode }) => {
  const [diff, setDiff] = useState([]);

  useEffect(() => {
    if (originalCode && suggestedCode) {
      const changes = diffLines(originalCode, suggestedCode);
      const formattedDiff = changes.flatMap(part => {
        const lines = part.value.split('\n').filter(line => line.length > 0);
        if (part.added) {
          return lines.map(line => `+${line}`);
        } else if (part.removed) {
          return lines.map(line => `-${line}`);
        } else {
          return lines.map(line => ` ${line}`);
        }
      });
      setDiff(formattedDiff);
    } else {
      setDiff([]);
    }
  }, [originalCode, suggestedCode]);

  if (diff.length === 0) {
    return <div className="p-4 text-gray-500 bg-gray-50 rounded-lg">Aucune différence détectée.</div>;
  }

  return (
    <div className="font-mono text-sm bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-2 bg-gray-100 border-b font-semibold text-gray-700">Aperçu des Modifications</div>
      <div className="max-h-96 overflow-y-auto">
        {diff.map((line, index) => (
          <DiffLine key={index} line={line} />
        ))}
      </div>
    </div>
  );
};

CodeDiffViewer.propTypes = {
  originalCode: PropTypes.string.isRequired,
  suggestedCode: PropTypes.string.isRequired,
};

export default CodeDiffViewer;
