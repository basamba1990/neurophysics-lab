/**
 * COLORS - Constantes pour les couleurs
 * 
 * Ce fichier définit les couleurs standardisées pour l'application.
 * Il garantit la cohérence visuelle entre tous les composants.
 * 
 * Utilisation :
 * ```jsx
 * import { COLORS } from '@/constants/colors';
 * 
 * <div className={COLORS.primary.bg}>
 *   <p className={COLORS.primary.text}>
 *     Contenu
 *   </p>
 * </div>
 * ```
 */

export const COLORS = {
  /**
   * Couleurs primaires
   */
  primary: {
    50: 'bg-blue-50',
    100: 'bg-blue-100',
    200: 'bg-blue-200',
    300: 'bg-blue-300',
    400: 'bg-blue-400',
    500: 'bg-blue-500',
    600: 'bg-blue-600',
    700: 'bg-blue-700',
    800: 'bg-blue-800',
    900: 'bg-blue-900',
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    hover: 'hover:bg-blue-700',
    border: 'border-blue-600',
    ring: 'ring-blue-600',
    shadow: 'shadow-blue-600',
    dark: 'bg-blue-800',
    light: 'bg-blue-100',
    darkText: 'text-blue-800',
    lightText: 'text-blue-100'
  },
  
  /**
   * Couleurs secondaires
   */
  secondary: {
    50: 'bg-gray-50',
    100: 'bg-gray-100',
    200: 'bg-gray-200',
    300: 'bg-gray-300',
    400: 'bg-gray-400',
    500: 'bg-gray-500',
    600: 'bg-gray-600',
    700: 'bg-gray-700',
    800: 'bg-gray-800',
    900: 'bg-gray-900',
    bg: 'bg-gray-600',
    text: 'text-gray-600',
    hover: 'hover:bg-gray-700',
    border: 'border-gray-600',
    ring: 'ring-gray-600',
    shadow: 'shadow-gray-600',
    dark: 'bg-gray-800',
    light: 'bg-gray-100',
    darkText: 'text-gray-800',
    lightText: 'text-gray-100'
  },
  
  /**
   * Couleurs de succès
   */
  success: {
    50: 'bg-green-50',
    100: 'bg-green-100',
    200: 'bg-green-200',
    300: 'bg-green-300',
    400: 'bg-green-400',
    500: 'bg-green-500',
    600: 'bg-green-600',
    700: 'bg-green-700',
    800: 'bg-green-800',
    900: 'bg-green-900',
    bg: 'bg-green-600',
    text: 'text-green-600',
    hover: 'hover:bg-green-700',
    border: 'border-green-600',
    ring: 'ring-green-600',
    shadow: 'shadow-green-600',
    dark: 'bg-green-800',
    light: 'bg-green-100',
    darkText: 'text-green-800',
    lightText: 'text-green-100'
  },
  
  /**
   * Couleurs d'erreur
   */
  error: {
    50: 'bg-red-50',
    100: 'bg-red-100',
    200: 'bg-red-200',
    300: 'bg-red-300',
    400: 'bg-red-400',
    500: 'bg-red-500',
    600: 'bg-red-600',
    700: 'bg-red-700',
    800: 'bg-red-800',
    900: 'bg-red-900',
    bg: 'bg-red-600',
    text: 'text-red-600',
    hover: 'hover:bg-red-700',
    border: 'border-red-600',
    ring: 'ring-red-600',
    shadow: 'shadow-red-600',
    dark: 'bg-red-800',
    light: 'bg-red-100',
    darkText: 'text-red-800',
    lightText: 'text-red-100'
  },
  
  /**
   * Couleurs d'avertissement
   */
  warning: {
    50: 'bg-yellow-50',
    100: 'bg-yellow-100',
    200: 'bg-yellow-200',
    300: 'bg-yellow-300',
    400: 'bg-yellow-400',
    500: 'bg-yellow-500',
    600: 'bg-yellow-600',
    700: 'bg-yellow-700',
    800: 'bg-yellow-800',
    900: 'bg-yellow-900',
    bg: 'bg-yellow-600',
    text: 'text-yellow-600',
    hover: 'hover:bg-yellow-700',
    border: 'border-yellow-600',
    ring: 'ring-yellow-600',
    shadow: 'shadow-yellow-600',
    dark: 'bg-yellow-800',
    light: 'bg-yellow-100',
    darkText: 'text-yellow-800',
    lightText: 'text-yellow-100'
  },
  
  /**
   * Couleurs d'information
   */
  info: {
    50: 'bg-cyan-50',
    100: 'bg-cyan-100',
    200: 'bg-cyan-200',
    300: 'bg-cyan-300',
    400: 'bg-cyan-400',
    500: 'bg-cyan-500',
    600: 'bg-cyan-600',
    700: 'bg-cyan-700',
    800: 'bg-cyan-800',
    900: 'bg-cyan-900',
    bg: 'bg-cyan-600',
    text: 'text-cyan-600',
    hover: 'hover:bg-cyan-700',
    border: 'border-cyan-600',
    ring: 'ring-cyan-600',
    shadow: 'shadow-cyan-600',
    dark: 'bg-cyan-800',
    light: 'bg-cyan-100',
    darkText: 'text-cyan-800',
    lightText: 'text-cyan-100'
  },
  
  /**
   * Couleurs neutres
   */
  neutral: {
    50: 'bg-gray-50',
    100: 'bg-gray-100',
    200: 'bg-gray-200',
    300: 'bg-gray-300',
    400: 'bg-gray-400',
    500: 'bg-gray-500',
    600: 'bg-gray-600',
    700: 'bg-gray-700',
    800: 'bg-gray-800',
    900: 'bg-gray-900',
    bg: 'bg-gray-600',
    text: 'text-gray-600',
    hover: 'hover:bg-gray-700',
    border: 'border-gray-600',
    ring: 'ring-gray-600',
    shadow: 'shadow-gray-600',
    dark: 'bg-gray-800',
    light: 'bg-gray-100',
    darkText: 'text-gray-800',
    lightText: 'text-gray-100'
  },
  
  /**
   * Couleurs de fond
   */
  background: {
    default: 'bg-white',
    light: 'bg-gray-50',
    dark: 'bg-gray-900',
    primary: 'bg-blue-50',
    secondary: 'bg-gray-50',
    success: 'bg-green-50',
    error: 'bg-red-50',
    warning: 'bg-yellow-50',
    info: 'bg-cyan-50'
  },
  
  /**
   * Couleurs de texte
   */
  text: {
    default: 'text-gray-900',
    light: 'text-gray-600',
    dark: 'text-white',
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-cyan-600'
  },
  
  /**
   * Couleurs de bordure
   */
  border: {
    default: 'border-gray-200',
    light: 'border-gray-300',
    dark: 'border-gray-700',
    primary: 'border-blue-200',
    secondary: 'border-gray-200',
    success: 'border-green-200',
    error: 'border-red-200',
    warning: 'border-yellow-200',
    info: 'border-cyan-200'
  },
  
  /**
   * Couleurs d'ombre
   */
  shadow: {
    default: 'shadow',
    light: 'shadow-sm',
    dark: 'shadow-lg',
    primary: 'shadow-blue-500/50',
    secondary: 'shadow-gray-500/50',
    success: 'shadow-green-500/50',
    error: 'shadow-red-500/50',
    warning: 'shadow-yellow-500/50',
    info: 'shadow-cyan-500/50'
  }
};

/**
 * Récupère une couleur de fond
 * 
 * @param {string} color - Nom de la couleur ('primary', 'secondary', 'success', 'error', 'warning', 'info', 'neutral')
 * @param {string} shade - Nuance de la couleur ('50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'bg', 'dark', 'light')
 * @returns {string} Classe CSS pour la couleur de fond
 */
export const getBgColor = (color, shade = 'bg') => {
  return COLORS[color]?.[shade] || COLORS.primary.bg;
};

/**
 * Récupère une couleur de texte
 * 
 * @param {string} color - Nom de la couleur ('primary', 'secondary', 'success', 'error', 'warning', 'info', 'neutral')
 * @param {string} shade - Nuance de la couleur ('50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'text', 'dark', 'light')
 * @returns {string} Classe CSS pour la couleur de texte
 */
export const getTextColor = (color, shade = 'text') => {
  return COLORS[color]?.[shade] || COLORS.primary.text;
};

/**
 * Récupère une couleur de bordure
 * 
 * @param {string} color - Nom de la couleur ('primary', 'secondary', 'success', 'error', 'warning', 'info', 'neutral')
 * @param {string} shade - Nuance de la couleur ('50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'border', 'dark', 'light')
 * @returns {string} Classe CSS pour la couleur de bordure
 */
export const getBorderColor = (color, shade = 'border') => {
  return COLORS[color]?.[shade] || COLORS.primary.border;
};

/**
 * Récupère une couleur d'ombre
 * 
 * @param {string} color - Nom de la couleur ('primary', 'secondary', 'success', 'error', 'warning', 'info', 'neutral')
 * @param {string} shade - Nuance de la couleur ('50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'shadow', 'dark', 'light')
 * @returns {string} Classe CSS pour la couleur d'ombre
 */
export const getShadowColor = (color, shade = 'shadow') => {
  return COLORS[color]?.[shade] || COLORS.primary.shadow;
};

/**
 * Récupère une couleur de hover
 * 
 * @param {string} color - Nom de la couleur ('primary', 'secondary', 'success', 'error', 'warning', 'info', 'neutral')
 * @param {string} shade - Nuance de la couleur ('50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'hover', 'dark', 'light')
 * @returns {string} Classe CSS pour la couleur de hover
 */
export const getHoverColor = (color, shade = 'hover') => {
  return COLORS[color]?.[shade] || COLORS.primary.hover;
};

/**
 * Récupère une couleur de ring
 * 
 * @param {string} color - Nom de la couleur ('primary', 'secondary', 'success', 'error', 'warning', 'info', 'neutral')
 * @param {string} shade - Nuance de la couleur ('50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'ring', 'dark', 'light')
 * @returns {string} Classe CSS pour la couleur de ring
 */
export const getRingColor = (color, shade = 'ring') => {
  return COLORS[color]?.[shade] || COLORS.primary.ring;
};

/**
 * Récupère une couleur de fond de texte
 * 
 * @param {string} color - Nom de la couleur ('default', 'light', 'dark', 'primary', 'secondary', 'success', 'error', 'warning', 'info')
 * @returns {string} Classe CSS pour la couleur de fond de texte
 */
export const getBackgroundColor = (color) => {
  return COLORS.background[color] || COLORS.background.default;
};

/**
 * Récupère une couleur de texte
 * 
 * @param {string} color - Nom de la couleur ('default', 'light', 'dark', 'primary', 'secondary', 'success', 'error', 'warning', 'info')
 * @returns {string} Classe CSS pour la couleur de texte
 */
export const getTextDefaultColor = (color) => {
  return COLORS.text[color] || COLORS.text.default;
};

/**
 * Récupère une couleur de bordure
 * 
 * @param {string} color - Nom de la couleur ('default', 'light', 'dark', 'primary', 'secondary', 'success', 'error', 'warning', 'info')
 * @returns {string} Classe CSS pour la couleur de bordure
 */
export const getBorderDefaultColor = (color) => {
  return COLORS.border[color] || COLORS.border.default;
};

/**
 * Récupère une couleur d'ombre
 * 
 * @param {string} color - Nom de la couleur ('default', 'light', 'dark', 'primary', 'secondary', 'success', 'error', 'warning', 'info')
 * @returns {string} Classe CSS pour la couleur d'ombre
 */
export const getShadowDefaultColor = (color) => {
  return COLORS.shadow[color] || COLORS.shadow.default;
};
