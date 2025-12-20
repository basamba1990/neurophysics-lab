/**
 * SPACING - Constantes pour les espacements
 * 
 * Ce fichier définit les espacements standardisés pour l'application.
 * Il garantit la cohérence visuelle entre tous les composants.
 * 
 * Utilisation :
 * ```jsx
 * import { SPACING } from '@/constants/spacing';
 * 
 * <div className={SPACING.space.lg}>
 *   <div className={SPACING.lg}>
 *     <div className={SPACING.gap.md}>
 *       {/* Contenu */}
 *     </div>
 *   </div>
 * </div>
 * ```
 */

export const SPACING = {
  /**
   * Espacements de padding
   */
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  
  /**
   * Espacements de margin
   */
  mxs: 'm-2',
  msm: 'm-3',
  mmd: 'm-4',
  mlg: 'm-6',
  mxl: 'm-8',
  
  /**
   * Espacements de gap (pour les grilles et flex)
   */
  gap: {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  },
  
  /**
   * Espacements de space (pour les listes verticales)
   */
  space: {
    xs: 'space-y-2',
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8'
  },
  
  /**
   * Espacements de space horizontal
   */
  spaceX: {
    xs: 'space-x-2',
    sm: 'space-x-3',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8'
  },
  
  /**
   * Espacements de border
   */
  border: {
    xs: 'border',
    sm: 'border-2',
    md: 'border-4',
    lg: 'border-8'
  },
  
  /**
   * Espacements de radius (bordures arrondies)
   */
  radius: {
    none: 'rounded-none',
    xs: 'rounded-sm',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  },
  
  /**
   * Espacements de shadow (ombres)
   */
  shadow: {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  },
  
  /**
   * Espacements de width
   */
  width: {
    xs: 'w-16',
    sm: 'w-24',
    md: 'w-32',
    lg: 'w-48',
    xl: 'w-64',
    full: 'w-full',
    screen: 'w-screen'
  },
  
  /**
   * Espacements de height
   */
  height: {
    xs: 'h-16',
    sm: 'h-24',
    md: 'h-32',
    lg: 'h-48',
    xl: 'h-64',
    full: 'h-full',
    screen: 'h-screen'
  },
  
  /**
   * Espacements de max-width
   */
  maxWidth: {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
    screen: 'max-w-screen'
  },
  
  /**
   * Espacements de max-height
   */
  maxHeight: {
    xs: 'max-h-xs',
    sm: 'max-h-sm',
    md: 'max-h-md',
    lg: 'max-h-lg',
    xl: 'max-h-xl',
    full: 'max-h-full',
    screen: 'max-h-screen'
  },
  
  /**
   * Espacements de min-width
   */
  minWidth: {
    xs: 'min-w-xs',
    sm: 'min-w-sm',
    md: 'min-w-md',
    lg: 'min-w-lg',
    xl: 'min-w-xl',
    full: 'min-w-full',
    screen: 'min-w-screen'
  },
  
  /**
   * Espacements de min-height
   */
  minHeight: {
    xs: 'min-h-xs',
    sm: 'min-h-sm',
    md: 'min-h-md',
    lg: 'min-h-lg',
    xl: 'min-h-xl',
    full: 'min-h-full',
    screen: 'min-h-screen'
  }
};

/**
 * Récupère un espacement de padding
 * 
 * @param {string} size - Taille de l'espacement ('xs', 'sm', 'md', 'lg', 'xl')
 * @returns {string} Classe CSS pour le padding
 */
export const getPadding = (size) => {
  return SPACING[size] || SPACING.md;
};

/**
 * Récupère un espacement de margin
 * 
 * @param {string} size - Taille de l'espacement ('xs', 'sm', 'md', 'lg', 'xl')
 * @returns {string} Classe CSS pour le margin
 */
export const getMargin = (size) => {
  return SPACING[`m${size}`] || SPACING.mmd;
};

/**
 * Récupère un espacement de gap
 * 
 * @param {string} size - Taille de l'espacement ('xs', 'sm', 'md', 'lg', 'xl')
 * @returns {string} Classe CSS pour le gap
 */
export const getGap = (size) => {
  return SPACING.gap[size] || SPACING.gap.md;
};

/**
 * Récupère un espacement de space
 * 
 * @param {string} size - Taille de l'espacement ('xs', 'sm', 'md', 'lg', 'xl')
 * @returns {string} Classe CSS pour le space
 */
export const getSpace = (size) => {
  return SPACING.space[size] || SPACING.space.md;
};

/**
 * Récupère un espacement de space horizontal
 * 
 * @param {string} size - Taille de l'espacement ('xs', 'sm', 'md', 'lg', 'xl')
 * @returns {string} Classe CSS pour le space horizontal
 */
export const getSpaceX = (size) => {
  return SPACING.spaceX[size] || SPACING.spaceX.md;
};

/**
 * Récupère un espacement de border
 * 
 * @param {string} size - Taille de l'espacement ('xs', 'sm', 'md', 'lg')
 * @returns {string} Classe CSS pour le border
 */
export const getBorder = (size) => {
  return SPACING.border[size] || SPACING.border.sm;
};

/**
 * Récupère un espacement de radius
 * 
 * @param {string} size - Taille de l'espacement ('none', 'xs', 'sm', 'md', 'lg', 'xl', 'full')
 * @returns {string} Classe CSS pour le radius
 */
export const getRadius = (size) => {
  return SPACING.radius[size] || SPACING.radius.md;
};

/**
 * Récupère un espacement de shadow
 * 
 * @param {string} size - Taille de l'espacement ('none', 'sm', 'md', 'lg', 'xl')
 * @returns {string} Classe CSS pour le shadow
 */
export const getShadow = (size) => {
  return SPACING.shadow[size] || SPACING.shadow.md;
};

/**
 * Récupère un espacement de width
 * 
 * @param {string} size - Taille de l'espacement ('xs', 'sm', 'md', 'lg', 'xl', 'full', 'screen')
 * @returns {string} Classe CSS pour la width
 */
export const getWidth = (size) => {
  return SPACING.width[size] || SPACING.width.full;
};

/**
 * Récupère un espacement de height
 * 
 * @param {string} size - Taille de l'espacement ('xs', 'sm', 'md', 'lg', 'xl', 'full', 'screen')
 * @returns {string} Classe CSS pour la height
 */
export const getHeight = (size) => {
  return SPACING.height[size] || SPACING.height.full;
};

/**
 * Récupère un espacement de max-width
 * 
 * @param {string} size - Taille de l'espacement ('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full', 'screen')
 * @returns {string} Classe CSS pour le max-width
 */
export const getMaxWidth = (size) => {
  return SPACING.maxWidth[size] || SPACING.maxWidth.full;
};

/**
 * Récupère un espacement de max-height
 * 
 * @param {string} size - Taille de l'espacement ('xs', 'sm', 'md', 'lg', 'xl', 'full', 'screen')
 * @returns {string} Classe CSS pour le max-height
 */
export const getMaxHeight = (size) => {
  return SPACING.maxHeight[size] || SPACING.maxHeight.full;
};

/**
 * Récupère un espacement de min-width
 * 
 * @param {string} size - Taille de l'espacement ('xs', 'sm', 'md', 'lg', 'xl', 'full', 'screen')
 * @returns {string} Classe CSS pour le min-width
 */
export const getMinWidth = (size) => {
  return SPACING.minWidth[size] || SPACING.minWidth.full;
};

/**
 * Récupère un espacement de min-height
 * 
 * @param {string} size - Taille de l'espacement ('xs', 'sm', 'md', 'lg', 'xl', 'full', 'screen')
 * @returns {string} Classe CSS pour le min-height
 */
export const getMinHeight = (size) => {
  return SPACING.minHeight[size] || SPACING.minHeight.full;
};
