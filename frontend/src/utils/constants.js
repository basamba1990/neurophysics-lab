// Constantes de l'application
export const APP_CONSTANTS = {
  APP_NAME: 'R&D Accelerator Platform',
  VERSION: '1.0.0',
  COMPANY: 'R&D Accelerator Inc.',
  SUPPORT_EMAIL: 'support@rd-accelerator.com',
  SUPPORT_PHONE: '+1 (555) 123-4567',
}

// Types de physique supportés
export const PHYSICS_TYPES = {
  NAVIER_STOKES: 'navier_stokes',
  HEAT_TRANSFER: 'heat_transfer',
  STRUCTURAL: 'structural',
  ELECTROMAGNETIC: 'electromagnetic',
  MULTIPHYSICS: 'multiphysics',
  TURBULENCE: 'turbulence',
}

// Statuts de simulation
export const SIMULATION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
}

// Langages de programmation supportés
export const PROGRAMMING_LANGUAGES = {
  FORTRAN: 'fortran',
  CPP: 'cpp',
  PYTHON: 'python',
  MATLAB: 'matlab',
  JULIA: 'julia',
}

// Types de conditions aux limites
export const BOUNDARY_CONDITION_TYPES = {
  DIRICHLET: 'dirichlet',
  NEUMANN: 'neumann',
  PERIODIC: 'periodic',
  SYMMETRY: 'symmetry',
  NO_SLIP: 'no-slip',
  SLIP: 'slip',
}

// Types d'analyse de code
export const CODE_ANALYSIS_TYPES = {
  MODERNIZATION: 'modernization',
  DEBUG: 'debug',
  OPTIMIZATION: 'optimization',
  VALIDATION: 'validation',
  DOCUMENTATION: 'documentation',
}

// Plans d'abonnement
export const SUBSCRIPTION_PLANS = {
  FREEMIUM: {
    name: 'Freemium',
    pinnRuns: 10,
    copilotRequests: 50,
    storage: 100, // MB
    features: ['Scientific Copilot basique', '1 simulation PINN/mois', '100MB stockage'],
    price: 0,
  },
  PROFESSIONAL: {
    name: 'Professional',
    pinnRuns: 100,
    copilotRequests: 500,
    storage: 1000, // MB
    features: ['Toutes les features Freemium', '100 simulations PINN/mois', '1GB stockage', 'Support prioritaire'],
    price: 99,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    pinnRuns: 1000,
    copilotRequests: 5000,
    storage: 10000, // MB
    features: ['Toutes les features Professional', 'Simulations illimitées', '10GB stockage', 'Support 24/7', 'API personnalisée'],
    price: 499,
  },
}

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  WORKSPACE: '/',
  PROJECTS: '/projects',
  SIMULATIONS: '/simulations',
  COPILOT: '/copilot',
  DIGITAL_TWINS: '/digital-twins',
  TEAM: '/team',
  USAGE: '/usage',
  SETTINGS: '/settings',
}

// Couleurs pour les visualisations
export const VISUALIZATION_COLORS = {
  VELOCITY: '#3b82f6', // Blue
  PRESSURE: '#10b981', // Green
  TEMPERATURE: '#f59e0b', // Yellow
  VORTICITY: '#8b5cf6', // Purple
  STRESS: '#ef4444', // Red
  STRAIN: '#06b6d4', // Cyan
}

// Échelles de couleurs disponibles
export const COLOR_SCALES = [
  'Viridis',
  'Plasma',
  'Hot',
  'Jet',
  'Rainbow',
  'Portland',
  'Blackbody',
  'Electric',
  'Bluered',
  'RdBu',
]

// Unités physiques
export const PHYSICAL_UNITS = {
  LENGTH: ['m', 'cm', 'mm', 'in', 'ft'],
  VELOCITY: ['m/s', 'cm/s', 'ft/s', 'km/h', 'mph'],
  PRESSURE: ['Pa', 'kPa', 'MPa', 'bar', 'psi', 'atm'],
  TEMPERATURE: ['K', '°C', '°F'],
  TIME: ['s', 'min', 'h', 'day'],
  DENSITY: ['kg/m³', 'g/cm³', 'lb/ft³'],
  VISCOSITY: ['Pa·s', 'cP', 'lb/(ft·s)'],
}

// Constantes physiques
export const PHYSICAL_CONSTANTS = {
  GRAVITY: 9.80665, // m/s²
  STEFAN_BOLTZMANN: 5.670374419e-8, // W/m²K⁴
  UNIVERSAL_GAS: 8.314462618, // J/mol·K
  AVOGADRO: 6.02214076e23, // mol⁻¹
  BOLTZMANN: 1.380649e-23, // J/K
}

// Erreurs courantes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion réseau. Veuillez vérifier votre connexion.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
  FORBIDDEN: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.',
  NOT_FOUND: 'Ressource non trouvée.',
  VALIDATION_ERROR: 'Données invalides. Veuillez vérifier les champs du formulaire.',
  SIMULATION_ERROR: 'Erreur lors de la simulation. Veuillez vérifier les paramètres.',
  QUOTA_EXCEEDED: 'Quota dépassé. Veuillez mettre à jour votre abonnement.',
}

// Messages de succès
export const SUCCESS_MESSAGES = {
  SIMULATION_STARTED: 'Simulation démarrée avec succès.',
  SIMULATION_COMPLETED: 'Simulation terminée avec succès.',
  CODE_ANALYZED: 'Code analysé avec succès.',
  MODEL_SAVED: 'Modèle sauvegardé avec succès.',
  SETTINGS_UPDATED: 'Paramètres mis à jour avec succès.',
  PROJECT_CREATED: 'Projet créé avec succès.',
  DATA_EXPORTED: 'Données exportées avec succès.',
  PAYMENT_SUCCESSFUL: 'Paiement effectué avec succès.',
}

// Configuration par défaut
export const DEFAULT_CONFIG = {
  PINN: {
    EPOCHS: 1000,
    LEARNING_RATE: 0.001,
    HIDDEN_LAYERS: [50, 50, 50],
    ACTIVATION: 'tanh',
    OPTIMIZER: 'adam',
  },
  VISUALIZATION: {
    RESOLUTION: 100,
    COLOR_SCALE: 'Viridis',
    SHOW_GRID: true,
    SHOW_AXES: true,
    AUTO_SCALE: true,
  },
  COPILOT: {
    MODEL: 'gpt-4',
    TEMPERATURE: 0.1,
    MAX_TOKENS: 2000,
    ANALYSIS_DEPTH: 'detailed',
  },
}
