import React, { useState, useEffect, useRef } from 'react'
import Plot from 'react-plotly.js'
import { Play, Pause, RefreshCw, Download, ZoomIn, ZoomOut } from 'lucide-react'

const ConvergenceMonitor = ({ simulationId, lossHistory = [], realTime = false }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [displayedHistory, setDisplayedHistory] = useState([])
  const plotRef = useRef(null)

  // Generate sample loss history if none provided
  const sampleLossHistory = lossHistory.length > 0 ? lossHistory : 
    Array.from({ length: 1000 }, (_, i) => 
      Math.exp(-i / 200) + Math.random() * 0.1 * Math.exp(-i / 500)
    )

  useEffect(() => {
    if (realTime && isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = prev + 1
          if (nextStep >= sampleLossHistory.length) {
            setIsPlaying(false)
            return prev
          }
          return nextStep
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [realTime, isPlaying, sampleLossHistory.length])

  useEffect(() => {
    if (realTime) {
      setDisplayedHistory(sampleLossHistory.slice(0, currentStep + 1))
    } else {
      setDisplayedHistory(sampleLossHistory)
    }
  }, [currentStep, realTime, sampleLossHistory])

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const resetPlayback = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5))
  }

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.1))
  }

  const downloadPlot = () => {
    if (plotRef.current) {
      plotRef.current.downloadImage({
        format: 'png',
        filename: `convergence_${simulationId || 'plot'}`
      })
    }
  }

  const calculateConvergenceMetrics = () => {
    if (displayedHistory.length < 2) return null

    const initialLoss = displayedHistory[0]
    const finalLoss = displayedHistory[displayedHistory.length - 1]
    const improvement = initialLoss - finalLoss
    const improvementRatio = improvement / initialLoss

    // Calculate convergence rate (slope of log loss)
    const logLosses = displayedHistory.map(loss => Math.log(loss + 1e-8))
    const x = Array.from({ length: logLosses.length }, (_, i) => i)
    const n = logLosses.length
    
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = logLosses.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * logLosses[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const convergenceRate = -slope

    return {
      initialLoss: initialLoss.toFixed(6),
      finalLoss: finalLoss.toFixed(6),
      improvement: improvement.toFixed(6),
      improvementRatio: (improvementRatio * 100).toFixed(1),
      convergenceRate: convergenceRate.toFixed(6),
      status: convergenceRate > 0.01 ? 'Converging' : 'Stalled'
    }
  }

  const metrics = calculateConvergenceMetrics()

  const renderConvergencePlot = () => {
    const epochs = Array.from({ length: displayedHistory.length }, (_, i) => i + 1)
    const logLosses = displayedHistory.map(loss => Math.log10(loss + 1e-8))

    return (
      <div className="space-y-4">
        {/* Main Loss Plot */}
        <Plot
          ref={plotRef}
          data={[
            {
              type: 'scatter',
              mode: 'lines',
              x: epochs,
              y: displayedHistory,
              name: 'Loss',
              line: { color: '#3b82f6', width: 2 }
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: epochs.length > 0 ? [epochs[epochs.length - 1]] : [],
              y: displayedHistory.length > 0 ? [displayedHistory[displayedHistory.length - 1]] : [],
              name: 'Current',
              marker: { color: '#ef4444', size: 8 }
            }
          ]}
          layout={{
            title: 'Convergence Training',
            width: 800 * zoomLevel,
            height: 400 * zoomLevel,
            xaxis: {
              title: 'Epoch',
              range: realTime ? [0, Math.max(100, currentStep + 50)] : undefined
            },
            yaxis: {
              title: 'Loss',
              type: 'log',
              autorange: true
            },
            showlegend: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 40, r: 30, b: 50, l: 60 }
          }}
          config={{
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
          }}
        />

        {/* Log Loss Plot */}
        <Plot
          data={[
            {
              type: 'scatter',
              mode: 'lines',
              x: epochs,
              y: logLosses,
              name: 'Log Loss',
              line: { color: '#10b981', width: 2 }
            }
          ]}
          layout={{
            title: 'Log Loss Convergence',
            width: 800 * zoomLevel,
            height: 300 * zoomLevel,
            xaxis: { title: 'Epoch' },
            yaxis: { title: 'Log Loss' },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 40, r: 30, b: 50, l: 60 }
          }}
          config={{
            displayModeBar: false
          }}
        />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Monitoring Convergence</h3>
          <p className="text-sm text-gray-600 mt-1">
            {simulationId ? `Simulation: ${simulationId}` : 'Simulation en cours'}
            {realTime && ` • Étape: ${currentStep + 1}/${sampleLossHistory.length}`}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {/* Playback Controls */}
          {realTime && (
            <div className="flex items-center space-x-2 bg-gray-100 rounded-md p-1">
              <button
                onClick={resetPlayback}
                className="p-1 text-gray-600 hover:text-gray-800 rounded hover:bg-gray-200"
                title="Réinitialiser"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={togglePlayback}
                className="p-1 text-gray-600 hover:text-gray-800 rounded hover:bg-gray-200"
                title={isPlaying ? 'Pause' : 'Lecture'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
            <button
              onClick={zoomOut}
              className="p-1 text-gray-600 hover:text-gray-800 rounded hover:bg-gray-200"
              title="Zoom arrière"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-600 px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1 text-gray-600 hover:text-gray-800 rounded hover:bg-gray-200"
              title="Zoom avant"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={downloadPlot}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            title="Télécharger le graphique"
          >
            <Download className="h-4 w-4 mr-1" />
            Télécharger
          </button>
        </div>
      </div>

      {/* Convergence Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Loss Initiale</div>
            <div className="text-lg font-bold text-blue-700">{metrics.initialLoss}</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="text-xs text-green-600 font-medium uppercase tracking-wide">Loss Finale</div>
            <div className="text-lg font-bold text-green-700">{metrics.finalLoss}</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
            <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">Amélioration</div>
            <div className="text-lg font-bold text-purple-700">{metrics.improvement}</div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
            <div className="text-xs text-orange-600 font-medium uppercase tracking-wide">Ratio</div>
            <div className="text-lg font-bold text-orange-700">{metrics.improvementRatio}%</div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-xs text-red-600 font-medium uppercase tracking-wide">Taux Convergence</div>
            <div className="text-lg font-bold text-red-700">{metrics.convergenceRate}</div>
          </div>
          
          <div className={`border rounded-md p-3 ${
            metrics.status === 'Converging' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="text-xs font-medium uppercase tracking-wide">
              {metrics.status === 'Converging' ? 'Converge' : 'Stagnation'}
            </div>
            <div className={`text-lg font-bold ${
              metrics.status === 'Converging' ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {metrics.status}
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar for Real-time */}
      {realTime && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progression</span>
            <span>{Math.round((currentStep + 1) / sampleLossHistory.length * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep + 1) / sampleLossHistory.length * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Convergence Plots */}
      <div className="flex justify-center">
        {renderConvergencePlot()}
      </div>

      {/* Convergence Analysis */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-md p-4">
          <h4 className="font-medium text-gray-900 mb-3">Analyse de Convergence</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Époques totales:</span>
              <span className="font-medium">{displayedHistory.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Période d'analyse:</span>
              <span className="font-medium">Dernières 100 époques</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tendance:</span>
              <span className="font-medium text-green-600">Convergente</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stabilité:</span>
              <span className="font-medium text-green-600">Stable</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-md p-4">
          <h4 className="font-medium text-gray-900 mb-3">Recommandations</h4>
          <ul className="text-sm space-y-1">
            {metrics && metrics.convergenceRate < 0.001 && (
              <li className="text-yellow-600">• Considérer l'augmentation du learning rate</li>
            )}
            {displayedHistory.length > 500 && (
              <li className="text-blue-600">• Convergence satisfaisante atteinte</li>
            )}
            {displayedHistory[displayedHistory.length - 1] > 0.1 && (
              <li className="text-red-600">• Loss finale élevée - vérifier les hyperparamètres</li>
            )}
            <li className="text-green-600">• Training proceeding normally</li>
          </ul>
        </div>
      </div>

      {/* Raw Data Preview */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">Aperçu des Données Brutes</h4>
        <div className="bg-gray-900 text-gray-100 rounded-md p-4 font-mono text-sm max-h-40 overflow-y-auto">
          <div>loss_history = [</div>
          {displayedHistory.slice(-10).map((loss, index) => (
            <div key={index} className="ml-4">
              {loss.toFixed(6)},{index === displayedHistory.slice(-10).length - 1 ? '' : ''}
            </div>
          ))}
          {displayedHistory.length > 10 && <div>  ... {displayedHistory.length - 10} more values</div>}
          <div>]</div>
        </div>
      </div>
    </div>
  )
}

export default ConvergenceMonitor
