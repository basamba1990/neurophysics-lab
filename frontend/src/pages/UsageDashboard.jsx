import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Cpu,
  Code2,
  Database,
  Clock,
  Download,
  Calendar,
  Filter,
  AlertTriangle
} from 'lucide-react'
import apiClient from '../services/api'

const UsageDashboard = () => {
  const [timeRange, setTimeRange] = useState('month')
  const [showExportModal, setShowExportModal] = useState(false)

  const { data: usageData, isLoading } = useQuery(
    ['usage', timeRange],
    () => apiClient.getUsageMetrics(),
    { refetchInterval: 60000 } // Refresh every minute
  )

  const { data: performanceData } = useQuery(
    ['performance', timeRange],
    () => apiClient.getPerformanceAnalytics()
  )

  const usageStats = {
    pinnRuns: usageData?.pinn_simulations_this_month || 0,
    copilotRequests: usageData?.copilot_requests_this_month || 0,
    storageUsed: usageData?.storage_used_mb || 0,
    subscriptionUsage: usageData?.subscription_usage || { used: 0, total: 100 }
  }

  const performanceStats = {
    avgSimulationTime: performanceData?.average_simulation_time || 0,
    successRate: performanceData?.success_rate || 0,
    costSavings: 15000 // Estimated monthly savings
  }

  const billingHistory = [
    { date: '2024-01-15', amount: 1250, status: 'paid' },
    { date: '2023-12-15', amount: 1150, status: 'paid' },
    { date: '2023-11-15', amount: 980, status: 'paid' },
    { date: '2023-10-15', amount: 850, status: 'paid' }
  ]

  const resourceUsage = [
    { name: 'PINN Simulations', usage: 65, limit: 100, color: 'bg-blue-500' },
    { name: 'Copilot Requests', usage: 45, limit: 200, color: 'bg-green-500' },
    { name: 'Storage', usage: 25, limit: 100, color: 'bg-purple-500' },
    { name: 'API Calls', usage: 85, limit: 100, color: 'bg-orange-500' }
  ]

  const exportData = () => {
    const data = {
      usageStats,
      performanceStats,
      billingHistory,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `usage-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    setShowExportModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord d'utilisation</h1>
              <p className="text-gray-600 mt-2">
                Surveillez l'utilisation des ressources et les performances
              </p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* PINN Simulations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Cpu className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">+12%</span>
          </div>
          <p className="text-sm text-gray-600">Simulations PINN</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{usageStats.pinnRuns}</p>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Utilisé</span>
              <span>{usageStats.subscriptionUsage.used}/{usageStats.subscriptionUsage.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(usageStats.subscriptionUsage.used / usageStats.subscriptionUsage.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Copilot Requests */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Code2 className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+24%</span>
          </div>
          <p className="text-sm text-gray-600">Requêtes Copilot</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{usageStats.copilotRequests}</p>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Limite</span>
              <span>200/mois</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${(usageStats.copilotRequests / 200) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">+5%</span>
          </div>
          <p className="text-sm text-gray-600">Stockage utilisé</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{usageStats.storageUsed} MB</p>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Total</span>
              <span>1000 MB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${(usageStats.storageUsed / 1000) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Cost Savings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+$2.5K</span>
          </div>
          <p className="text-sm text-gray-600">Économies estimées</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">${performanceStats.costSavings}</p>
          <div className="mt-4">
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>15% d'économies ce mois</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Métriques de performance
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Temps moyen simulation</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{performanceStats.avgSimulationTime}s</p>
              <div className="flex items-center text-sm text-green-600 mt-2">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span>35% plus rapide</span>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Taux de réussite</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{performanceStats.successRate * 100}%</p>
              <div className="flex items-center text-sm text-green-600 mt-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+8% ce mois</span>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Cpu className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Simulations parallèles</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">5</p>
              <div className="text-sm text-gray-600 mt-2">Max simultanées</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Échecs</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <div className="text-sm text-gray-600 mt-2">Ce mois</div>
            </div>
          </div>
        </div>

        {/* Resource Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Utilisation des ressources
          </h3>
          <div className="space-y-4">
            {resourceUsage.map((resource) => (
              <div key={resource.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{resource.name}</span>
                  <span className="font-medium text-gray-900">{resource.usage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${resource.color} h-2 rounded-full`}
                    style={{ width: `${resource.usage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {resource.usage}/{resource.limit} unités
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Historique de facturation</h3>
            <button className="flex items-center text-blue-600 hover:text-blue-700">
              <Calendar className="h-5 w-5 mr-1" />
              Voir tout
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm font-medium text-gray-500 border-b border-gray-200">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Montant</th>
                  <th className="pb-3">Statut</th>
                  <th className="pb-3">Facture</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((bill) => (
                  <tr key={bill.date} className="border-b border-gray-100 last:border-0">
                    <td className="py-4">{bill.date}</td>
                    <td className="py-4 font-medium">${bill.amount}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {bill.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Exporter les données
              </h3>
              <p className="text-gray-600 mb-6">
                Choisissez le format d'exportation pour votre rapport d'utilisation
              </p>
              <div className="space-y-4">
                <button
                  onClick={exportData}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="h-5 w-5 mr-2" />
                  JSON (Données complètes)
                </button>
                <button
                  onClick={exportData}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="h-5 w-5 mr-2" />
                  CSV (Données tabulaires)
                </button>
                <button
                  onClick={exportData}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="h-5 w-5 mr-2" />
                  PDF (Rapport formaté)
                </button>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={exportData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Exporter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsageDashboard
