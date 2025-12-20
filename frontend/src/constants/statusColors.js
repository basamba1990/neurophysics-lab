/**
 * STATUS_COLORS - Constantes pour les couleurs de statut
 * 
 * Ce fichier définit les couleurs standardisées pour chaque statut dans l'application.
 * Il garantit la cohérence visuelle entre tous les composants.
 * 
 * Utilisation :
 * ```jsx
 * import { STATUS_COLORS } from '@/constants/statusColors';
 * import { getStatusClasses } from '@/constants/statusColors';
 * 
 * const classes = getStatusClasses('completed');
 * ```
 */

export const STATUS_COLORS = {
  /**
   * Statut "completed" - Simulation ou action terminée avec succès
   */
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: 'text-green-600',
    label: 'Terminé',
    iconClass: 'CheckCircle',
    color: 'green'
  },
  
  /**
   * Statut "running" - Simulation ou action en cours d'exécution
   */
  running: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    label: 'En cours',
    iconClass: 'RefreshCw',
    color: 'blue'
  },
  
  /**
   * Statut "pending" - Simulation ou action en attente de traitement
   */
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    label: 'En attente',
    iconClass: 'Clock',
    color: 'yellow'
  },
  
  /**
   * Statut "failed" - Simulation ou action échouée
   */
  failed: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: 'text-red-600',
    label: 'Échoué',
    iconClass: 'XCircle',
    color: 'red'
  },
  
  /**
   * Statut "active" - Ressource ou composant actif
   */
  active: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: 'text-green-600',
    label: 'Actif',
    iconClass: 'CheckCircle',
    color: 'green'
  },
  
  /**
   * Statut "optimizing" - Optimisation en cours
   */
  optimizing: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    label: 'Optimisation',
    iconClass: 'RefreshCw',
    color: 'blue'
  },
  
  /**
   * Statut "idle" - Ressource ou composant inactif
   */
  idle: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    icon: 'text-gray-600',
    label: 'Inactif',
    iconClass: 'Pause',
    color: 'gray'
  },
  
  /**
   * Statut "warning" - Avertissement ou attention requise
   */
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    label: 'Avertissement',
    iconClass: 'AlertTriangle',
    color: 'yellow'
  },
  
  /**
   * Statut "info" - Information générale
   */
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    label: 'Information',
    iconClass: 'Info',
    color: 'blue'
  }
};

/**
 * Récupère les classes CSS pour un statut donné
 * 
 * @param {string} status - Le statut (ex: 'completed', 'running', 'pending')
 * @returns {Object} Les classes CSS pour ce statut
 */
export const getStatusClasses = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS.pending;
};

/**
 * Récupère l'icône correspondante à un statut
 * 
 * @param {string} status - Le statut
 * @returns {string} Le nom de l'icône Lucide
 */
export const getStatusIcon = (status) => {
  const iconClass = getStatusClasses(status).iconClass;
  return iconClass;
};

/**
 * Récupère le label textuel pour un statut
 * 
 * @param {string} status - Le statut
 * @returns {string} Le label textuel
 */
export const getStatusLabel = (status) => {
  return getStatusClasses(status).label;
};

/**
 * Récupère la couleur principale pour un statut
 * 
 * @param {string} status - Le statut
 * @returns {string} Le nom de la couleur
 */
export const getStatusColor = (status) => {
  return getStatusClasses(status).color;
};

/**
 * Vérifie si un statut est dans une liste de statuts
 * 
 * @param {string} status - Le statut à vérifier
 * @param {Array} statusList - Liste des statuts à comparer
 * @returns {boolean} true si le statut est dans la liste
 */
export const isStatusIn = (status, statusList) => {
  return statusList.includes(status);
};

/**
 * Récupère tous les statuts actifs (running, optimizing, pending)
 * 
 * @returns {Array} Liste des statuts actifs
 */
export const getActiveStatuses = () => {
  return ['running', 'optimizing', 'pending'];
};

/**
 * Récupère tous les statuts terminés (completed, failed, idle)
 * 
 * @returns {Array} Liste des statuts terminés
 */
export const getCompletedStatuses = () => {
  return ['completed', 'failed', 'idle'];
};

/**
 * Récupère tous les statuts d'erreur (failed)
 * 
 * @returns {Array} Liste des statuts d'erreur
 */
export const getErrorStatuses = () => {
  return ['failed'];
};

/**
 * Récupère tous les statuts de succès (completed, active)
 * 
 * @returns {Array} Liste des statuts de succès
 */
export const getSuccessStatuses = () => {
  return ['completed', 'active'];
};

/**
 * Récupère tous les statuts d'avertissement (warning, pending)
 * 
 * @returns {Array} Liste des statuts d'avertissement
 */
export const getWarningStatuses = () => {
  return ['warning', 'pending'];
};
