import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingState - Composant d'état de chargement
 * 
 * Ce composant affiche un indicateur de chargement avec un message explicatif.
 * Il peut être utilisé pour indiquer le chargement de données, d'authentification,
 * ou toute autre opération asynchrone.
 * 
 * Utilisation :
 * ```jsx
 * <LoadingState message="Chargement des simulations..." />
 * ```
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} [props.message] - Message à afficher (par défaut: "Chargement en cours...")
 * @param {string} [props.className] - Classes CSS additionnelles
 * @param {boolean} [props.fullScreen] - Afficher en plein écran (par défaut: false)
 */

export const LoadingState = ({ 
  message = "Chargement en cours...", 
  className = '',
  fullScreen = false
}) => {
  const baseClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white z-50'
    : 'flex items-center justify-center h-64';

  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Animation de chargement */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        
        {/* Message */}
        <p className="text-gray-600 text-center max-w-md">
          {message}
        </p>
      </div>
    </div>
  );
};

/**
 * Skeleton - Composant skeleton loader
 * 
 * Ce composant affiche un skeleton loader pour simuler le contenu avant le chargement.
 * Il peut être utilisé pour créer une expérience de chargement fluide.
 * 
 * Utilisation :
 * ```jsx
 * <Skeleton className="h-4 w-3/4" />
 * ```
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export const Skeleton = ({ className = '' }) => {
  return (
    <div 
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      style={{ animationDuration: '1s' }}
    />
  );
};

/**
 * SkeletonCard - Composant skeleton pour une carte
 * 
 * Utilisation :
 * ```jsx
 * <SkeletonCard />
 * ```
 */
export const SkeletonCard = () => {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
  );
};

/**
 * SkeletonList - Composant skeleton pour une liste
 * 
 * Utilisation :
 * ```jsx
 * <SkeletonList count={5} />
 * ```
 * 
 * @param {Object} props - Propriétés du composant
 * @param {number} [props.count] - Nombre d'éléments à afficher (par défaut: 3)
 */
export const SkeletonList = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
};

/**
 * SkeletonButton - Composant skeleton pour un bouton
 * 
 * Utilisation :
 * ```jsx
 * <SkeletonButton />
 * ```
 */
export const SkeletonButton = () => {
  return (
    <div className="animate-pulse rounded-lg bg-gray-200 h-10 w-32"></div>
  );
};

/**
 * SkeletonAvatar - Composant skeleton pour un avatar
 * 
 * Utilisation :
 * ```jsx
 * <SkeletonAvatar size="md" />
 * ```
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} [props.size] - Taille de l'avatar ('sm', 'md', 'lg')
 */
export const SkeletonAvatar = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={`animate-pulse rounded-full bg-gray-200 ${sizeClasses[size]}`}>
      <div className={`h-full w-full rounded-full bg-gray-300`}></div>
    </div>
  );
};
