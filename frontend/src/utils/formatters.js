// Formateurs de données pour l'application

/**
 * Formate un nombre avec unités
 * @param {number} value - Valeur à formater
 * @param {string} unit - Unité (optionnel)
 * @param {number} decimals - Nombre de décimales
 * @returns {string} Valeur formatée
 */
export const formatNumber = (value, unit = '', decimals = 2) => {
  if (value === null || value === undefined) return 'N/A'
  
  let formattedValue = value
  let suffix = ''

  // Formatage scientifique pour très grands/très petits nombres
  if (Math.abs(value) >= 1e6 || (Math.abs(value) < 1e-3 && value !== 0)) {
    return value.toExponential(decimals) + (unit ? ' ' + unit : '')
  }

  // Formatage avec séparateurs de milliers
  if (Math.abs(value) >= 1000) {
    formattedValue = value.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  } else {
    formattedValue = value.toFixed(decimals)
  }

  return formattedValue + (unit ? ' ' + unit : '')
}

/**
 * Formate une durée en secondes vers un format lisible
 * @param {number} seconds - Durée en secondes
 * @returns {string} Durée formatée
 */
export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return 'N/A'
  
  if (seconds < 1) {
    return (seconds * 1000).toFixed(0) + ' ms'
  }
  
  if (seconds < 60) {
    return seconds.toFixed(1) + ' s'
  }
  
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs.toFixed(0)}s`
  }
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

/**
 * Formate une taille en octets vers un format lisible
 * @param {number} bytes - Taille en octets
 * @returns {string} Taille formatée
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Formate une date
 * @param {string|Date} date - Date à formater
 * @param {boolean} includeTime - Inclure l'heure
 * @returns {string} Date formatée
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return 'N/A'
  
  const dateObj = new Date(date)
  
  if (isNaN(dateObj.getTime())) return 'Date invalide'
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }
  
  return dateObj.toLocaleDateString('fr-FR', options)
}

/**
 * Formate un pourcentage
 * @param {number} value - Valeur entre 0 et 1
 * @param {number} decimals - Nombre de décimales
 * @returns {string} Pourcentage formaté
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return 'N/A'
  return (value * 100).toFixed(decimals) + '%'
}

/**
 * Formate un nombre de simulation
 * @param {number} count - Nombre de simulations
 * @returns {string} Nombre formaté
 */
export const formatSimulationCount = (count) => {
  if (count === null || count === undefined) return 'N/A'
  
  if (count === 0) return 'Aucune simulation'
  if (count === 1) return '1 simulation'
  return `${count.toLocaleString('fr-FR')} simulations`
}

/**
 * Formate une erreur physique
 * @param {number} error - Erreur numérique
 * @returns {string} Erreur formatée
 */
export const formatPhysicsError = (error) => {
  if (error === null || error === undefined) return 'N/A'
  
  if (error === 0) return '0'
  if (error < 1e-6) return error.toExponential(3)
  if (error < 0.01) return error.toFixed(6)
  if (error < 1) return error.toFixed(4)
  return error.toFixed(2)
}

/**
 * Formate un code de langage de programmation
 * @param {string} code - Code source
 * @param {string} language - Langage
 * @returns {string} Code formaté pour affichage
 */
export const formatCodeForDisplay = (code, language = 'python') => {
  if (!code) return ''
  
  // Échapper les caractères HTML
  const escapedCode = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
  
  // Ajouter la coloration syntaxique basique
  const lines = escapedCode.split('\n')
  const formattedLines = lines.map((line, index) => {
    const lineNumber = (index + 1).toString().padStart(4, ' ')
    return `<span class="line-number">${lineNumber}</span> ${line}`
  })
  
  return `<pre class="language-${language}">${formattedLines.join('\n')}</pre>`
}

/**
 * Formate une matrice pour l'affichage
 * @param {Array} matrix - Matrice 2D
 * @param {number} maxRows - Nombre maximum de lignes à afficher
 * @param {number} maxCols - Nombre maximum de colonnes à afficher
 * @returns {string} Matrice formatée
 */
export const formatMatrix = (matrix, maxRows = 5, maxCols = 5) => {
  if (!matrix || !Array.isArray(matrix)) return '[]'
  
  const rows = Math.min(matrix.length, maxRows)
  const result = []
  
  for (let i = 0; i < rows; i++) {
    const row = matrix[i]
    if (!Array.isArray(row)) continue
    
    const cols = Math.min(row.length, maxCols)
    const formattedRow = row.slice(0, cols).map(val => {
      if (typeof val === 'number') {
        return val.toFixed(3)
      }
      return String(val)
    }).join(', ')
    
    const suffix = row.length > maxCols ? ', ...' : ''
    result.push(`[${formattedRow}${suffix}]`)
  }
  
  const suffix = matrix.length > maxRows ? '\n...' : ''
  return `[\n  ${result.join(',\n  ')}\n]${suffix}`
}

/**
 * Formate un objet JSON pour l'affichage
 * @param {Object} data - Données JSON
 * @param {number} indent - Indentation
 * @returns {string} JSON formaté
 */
export const formatJSON = (data, indent = 2) => {
  try {
    return JSON.stringify(data, null, indent)
  } catch {
    return String(data)
  }
}

/**
 * Formate une plage de valeurs
 * @param {number} min - Valeur minimale
 * @param {number} max - Valeur maximale
 * @param {string} unit - Unité
 * @returns {string} Plage formatée
 */
export const formatRange = (min, max, unit = '') => {
  if (min === null || max === null) return 'N/A'
  return `${formatNumber(min, unit)} - ${formatNumber(max, unit)}`
}

/**
 * Formate un statut de simulation
 * @param {string} status - Statut
 * @returns {Object} Icône et couleur pour le statut
 */
export const formatSimulationStatus = (status) => {
  const statusMap = {
    pending: { icon: '⏳', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    running: { icon: '⚡', color: 'text-blue-600', bg: 'bg-blue-100' },
    completed: { icon: '✅', color: 'text-green-600', bg: 'bg-green-100' },
    failed: { icon: '❌', color: 'text-red-600', bg: 'bg-red-100' },
    cancelled: { icon: '⏹️', color: 'text-gray-600', bg: 'bg-gray-100' },
  }
  
  return statusMap[status] || { icon: '❓', color: 'text-gray-600', bg: 'bg-gray-100' }
}
