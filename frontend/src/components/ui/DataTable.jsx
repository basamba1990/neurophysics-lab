// frontend/src/components/ui/DataTable.jsx

import React from 'react';
import PropTypes from 'prop-types';

const DataTable = ({ data, columns, className = '' }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 p-4">Aucune donnée à afficher.</div>;
  }

  return (
    <div className={`overflow-x-auto shadow-xl ring-1 ring-black ring-opacity-5 rounded-2xl ${className}`}>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.node.isRequired,
      render: PropTypes.func, // Fonction optionnelle pour le rendu personnalisé
    })
  ).isRequired,
  className: PropTypes.string,
};

export default DataTable;
