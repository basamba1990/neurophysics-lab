// frontend/src/components/digital-twins/PerformanceMonitor.jsx

import React from 'react';
import PropTypes from 'prop-types';

const PerformanceMonitor = ({ performanceMetrics }) => {
  if (!performanceMetrics) {
    return (
      <div className="p-4 bg-white shadow rounded-lg text-gray-500">
        Aucune métrique de performance disponible.
      </div>
    );
  }

  const { performance_summary, recent_metrics, recommendations } = performanceMetrics;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Moniteur de Performance du Jumeau</h2>

      {/* Résumé de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Optimisations Totales" value={performance_summary.total_optimizations} />
        <MetricCard title="Temps Moyen de Convergence" value={`${performance_summary.average_convergence_time.toFixed(2)} s`} />
        <MetricCard title="Tendance de Performance" value={performance_summary.performance_trend} color={performance_summary.performance_trend === 'improving' ? 'green' : performance_summary.performance_trend === 'declining' ? 'red' : 'blue'} />
      </div>

      {/* Recommandations */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Recommandations</h3>
        <ul className="list-disc list-inside text-sm text-yellow-700">
          {recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>

      {/* Métriques Récentes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Métriques Récentes</h3>
        <div className="space-y-2">
          {recent_metrics.map((metric, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-md text-sm border">
              <p><span className="font-medium">ID:</span> {metric.optimization_id}</p>
              <p><span className="font-medium">Temps de Convergence:</span> {metric.metrics.convergence_time.toFixed(2)} s</p>
              <p><span className="font-medium">Amélioration:</span> {metric.metrics.objective_improvement.toFixed(4)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
  };

  return (
    <div className={`p-4 rounded-lg shadow ${colorClasses[color]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

PerformanceMonitor.propTypes = {
  performanceMetrics: PropTypes.shape({
    performance_summary: PropTypes.shape({
      total_optimizations: PropTypes.number,
      average_convergence_time: PropTypes.number,
      performance_trend: PropTypes.string,
    }),
    recent_metrics: PropTypes.arrayOf(PropTypes.object),
    recommendations: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default PerformanceMonitor;
