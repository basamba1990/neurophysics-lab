// Validateurs pour les formulaires et données

/**
 * Valide une adresse email
 * @param {string} email - Email à valider
 * @returns {Object} Résultat de validation
 */
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: 'Email requis' }
  }
  
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Format d\'email invalide' }
  }
  
  return { valid: true, message: '' }
}

/**
 * Valide un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {Object} Résultat de validation
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Mot de passe requis' }
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Minimum 8 caractères' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Au moins une majuscule' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Au moins un chiffre' }
  }
  
  return { valid: true, message: '' }
}

/**
 * Valide un nombre physique (positif)
 * @param {number|string} value - Valeur à valider
 * @param {string} fieldName - Nom du champ
 * @param {Object} options - Options de validation
 * @returns {Object} Résultat de validation
 */
export const validatePhysicsValue = (value, fieldName, options = {}) => {
  const { min = 0, max = Infinity, required = true } = options
  
  if (value === '' || value === null || value === undefined) {
    if (required) {
      return { valid: false, message: `${fieldName} requis` }
    }
    return { valid: true, message: '' }
  }
  
  const numValue = parseFloat(value)
  
  if (isNaN(numValue)) {
    return { valid: false, message: `${fieldName} doit être un nombre` }
  }
  
  if (numValue <= min) {
    return { valid: false, message: `${fieldName} doit être > ${min}` }
  }
  
  if (numValue > max) {
    return { valid: false, message: `${fieldName} doit être ≤ ${max}` }
  }
  
  return { valid: true, message: '' }
}

/**
 * Valide les conditions aux limites
 * @param {Object} boundaryConditions - Conditions aux limites
 * @returns {Object} Résultat de validation
 */
export const validateBoundaryConditions = (boundaryConditions) => {
  if (!boundaryConditions || Object.keys(boundaryConditions).length === 0) {
    return { valid: false, message: 'Au moins une condition aux limites requise' }
  }
  
  const errors = []
  
  Object.entries(boundaryConditions).forEach(([name, condition]) => {
    if (!condition.type) {
      errors.push(`Type manquant pour ${name}`)
    }
    
    if (condition.type === 'dirichlet' && condition.value === undefined) {
      errors.push(`Valeur requise pour ${name} (Dirichlet)`)
    }
    
    if (condition.type === 'neumann' && condition.flux === undefined) {
      errors.push(`Flux requis pour ${name} (Neumann)`)
    }
  })
  
  if (errors.length > 0) {
    return { valid: false, message: errors.join(', ') }
  }
  
  return { valid: true, message: '' }
}

/**
 * Valide un maillage
 * @param {Object} meshConfig - Configuration du maillage
 * @returns {Object} Résultat de validation
 */
export const validateMesh = (meshConfig) => {
  if (!meshConfig) {
    return { valid: false, message: 'Configuration du maillage requise' }
  }
  
  const { nx, ny, nz, length, height, depth } = meshConfig
  
  const errors = []
  
  // Valider les dimensions
  if (nx && (nx < 2 || nx > 1000)) {
    errors.push('nx doit être entre 2 et 1000')
  }
  
  if (ny && (ny < 2 || ny > 1000)) {
    errors.push('ny doit être entre 2 et 1000')
  }
  
  if (nz && (nz < 2 || nz > 1000)) {
    errors.push('nz doit être entre 2 et 1000')
  }
  
  // Valider les tailles
  if (length && length <= 0) {
    errors.push('length doit être positif')
  }
  
  if (height && height <= 0) {
    errors.push('height doit être positif')
  }
  
  if (depth && depth <= 0) {
    errors.push('depth doit être positif')
  }
  
  if (errors.length > 0) {
    return { valid: false, message: errors.join(', ') }
  }
  
  return { valid: true, message: '' }
}

/**
 * Valide un code source
 * @param {string} code - Code source
 * @param {string} language - Langage de programmation
 * @returns {Object} Résultat de validation
 */
export const validateCode = (code, language) => {
  if (!code || code.trim().length === 0) {
    return { valid: false, message: 'Code source requis' }
  }
  
  if (code.length > 100000) {
    return { valid: false, message: 'Code trop long (max 100K caractères)' }
  }
  
  // Validations spécifiques par langage
  if (language === 'fortran') {
    if (!code.toLowerCase().includes('program') && !code.toLowerCase().includes('subroutine')) {
      return { valid: false, message: 'Code Fortran invalide: structure program/subroutine manquante' }
    }
  }
  
  if (language === 'python') {
    try {
      // Vérification syntaxique basique Python
      const lines = code.split('\n')
      let indentLevel = 0
      let inMultilineString = false
      
      for (const line of lines) {
        const trimmed = line.trim()
        
        // Vérifier les guillemets non fermés
        const quoteCount = (line.match(/["']/g) || []).length
        if (quoteCount % 2 !== 0) {
          inMultilineString = !inMultilineString
        }
        
        // Vérifier l'indentation
        if (!inMultilineString && trimmed) {
          const leadingSpaces = line.match(/^ */)[0].length
          const expectedSpaces = indentLevel * 2
          
          if (leadingSpaces < expectedSpaces) {
            return { valid: false, message: 'Problème d\'indentation Python détecté' }
          }
          
          // Mettre à jour le niveau d'indentation pour la prochaine ligne
          if (trimmed.endsWith(':')) {
            indentLevel++
          } else if (trimmed === 'pass' || trimmed === 'return' || /^[a-zA-Z_]/.test(trimmed)) {
            // Réduire l'indentation après certaines instructions
            if (indentLevel > 0) {
              indentLevel--
            }
          }
        }
      }
    } catch (error) {
      // Si la validation échoue, on accepte quand même le code
      console.warn('Erreur de validation Python:', error)
    }
  }
  
  return { valid: true, message: '' }
}

/**
 * Valide les paramètres d'une simulation
 * @param {Object} parameters - Paramètres de simulation
 * @returns {Object} Résultat de validation
 */
export const validateSimulationParameters = (parameters) => {
  if (!parameters) {
    return { valid: false, message: 'Paramètres requis' }
  }
  
  const errors = []
  
  // Vérifier le nombre de Reynolds
  if (parameters.reynolds !== undefined) {
    const re = parseFloat(parameters.reynolds)
    if (isNaN(re) || re <= 0) {
      errors.push('Nombre de Reynolds doit être positif')
    }
    if (re > 1e6) {
      errors.push('Nombre de Reynolds trop élevé')
    }
  }
  
  // Vérifier le pas de temps
  if (parameters.timestep !== undefined) {
    const dt = parseFloat(parameters.timestep)
    if (isNaN(dt) || dt <= 0) {
      errors.push('Pas de temps doit être positif')
    }
  }
  
  // Vérifier la convergence
  if (parameters.tolerance !== undefined) {
    const tol = parseFloat(parameters.tolerance)
    if (isNaN(tol) || tol <= 0 || tol >= 1) {
      errors.push('Tolérance doit être entre 0 et 1')
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, message: errors.join(', ') }
  }
  
  return { valid: true, message: '' }
}

/**
 * Valide un fichier uploadé
 * @param {File} file - Fichier à valider
 * @param {Object} options - Options de validation
 * @returns {Object} Résultat de validation
 */
export const validateFile = (file, options = {}) => {
  const { 
    maxSize = 10 * 1024 * 1024, // 10MB par défaut
    allowedTypes = ['.f', '.f90', '.f95', '.for', '.cpp', '.cxx', '.cc', '.py', '.json', '.csv'],
    required = true
  } = options
  
  if (!file) {
    if (required) {
      return { valid: false, message: 'Fichier requis' }
    }
    return { valid: true, message: '' }
  }
  
  // Vérifier la taille
  if (file.size > maxSize) {
    return { valid: false, message: `Fichier trop volumineux (max ${maxSize / (1024*1024)}MB)` }
  }
  
  // Vérifier l'extension
  const fileName = file.name.toLowerCase()
  const hasValidExtension = allowedTypes.some(ext => fileName.endsWith(ext))
  
  if (!hasValidExtension) {
    return { 
      valid: false, 
      message: `Type de fichier non supporté. Extensions autorisées: ${allowedTypes.join(', ')}` 
    }
  }
  
  return { valid: true, message: '' }
}

/**
 * Valide un objet JSON
 * @param {string} jsonString - Chaîne JSON à valider
 * @returns {Object} Résultat de validation
 */
export const validateJSON = (jsonString) => {
  if (!jsonString) {
    return { valid: true, message: '' }
  }
  
  try {
    JSON.parse(jsonString)
    return { valid: true, message: '' }
  } catch (error) {
    return { valid: false, message: 'JSON invalide' }
  }
}

/**
 * Valide une URL
 * @param {string} url - URL à valider
 * @returns {Object} Résultat de validation
 */
export const validateURL = (url) => {
  if (!url) {
    return { valid: false, message: 'URL requise' }
  }
  
  try {
    new URL(url)
    return { valid: true, message: '' }
  } catch {
    return { valid: false, message: 'URL invalide' }
  }
}

/**
 * Valide un numéro de téléphone
 * @param {string} phone - Numéro de téléphone
 * @returns {Object} Résultat de validation
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { valid: false, message: 'Numéro de téléphone requis' }
  }
  
  // Format international simplifié
  const phoneRegex = /^[\+]?[1-9][\d\s\-\.\(\)]{8,}$/
  
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Format de téléphone invalide' }
  }
  
  return { valid: true, message: '' }
}

/**
 * Valide une date
 * @param {string} dateString - Date à valider
 * @param {boolean} futureOnly - Doit être dans le futur
 * @returns {Object} Résultat de validation
 */
export const validateDate = (dateString, futureOnly = false) => {
  if (!dateString) {
    return { valid: false, message: 'Date requise' }
  }
  
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return { valid: false, message: 'Date invalide' }
  }
  
  if (futureOnly && date < new Date()) {
    return { valid: false, message: 'Date doit être dans le futur' }
  }
  
  return { valid: true, message: '' }
}

/**
 * Valide un nombre entier
 * @param {number|string} value - Valeur à valider
 * @param {string} fieldName - Nom du champ
 * @param {Object} options - Options de validation
 * @returns {Object} Résultat de validation
 */
export const validateInteger = (value, fieldName, options = {}) => {
  const { min = 0, max = Infinity, required = true } = options
  
  if (value === '' || value === null || value === undefined) {
    if (required) {
      return { valid: false, message: `${fieldName} requis` }
    }
    return { valid: true, message: '' }
  }
  
  const intValue = parseInt(value, 10)
  
  if (isNaN(intValue)) {
    return { valid: false, message: `${fieldName} doit être un entier` }
  }
  
  if (intValue < min) {
    return { valid: false, message: `${fieldName} doit être ≥ ${min}` }
  }
  
  if (intValue > max) {
    return { valid: false, message: `${fieldName} doit être ≤ ${max}` }
  }
  
  return { valid: true, message: '' }
}

/**
 * Valide une plage de valeurs
 * @param {number} min - Valeur minimale
 * @param {number} max - Valeur maximale
 * @param {string} fieldName - Nom du champ
 * @returns {Object} Résultat de validation
 */
export const validateRange = (min, max, fieldName) => {
  if (min === undefined || max === undefined) {
    return { valid: true, message: '' }
  }
  
  const minNum = parseFloat(min)
  const maxNum = parseFloat(max)
  
  if (isNaN(minNum) || isNaN(maxNum)) {
    return { valid: false, message: `${fieldName}: valeurs invalides` }
  }
  
  if (minNum >= maxNum) {
    return { valid: false, message: `${fieldName}: min doit être < max` }
  }
  
  return { valid: true, message: '' }
}
