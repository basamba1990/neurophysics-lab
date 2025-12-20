import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

/**
 * Breadcrumb - Fil d'Ariane pour indiquer la position dans l'application
 * 
 * Ce composant affiche le chemin parcouru par l'utilisateur dans l'application,
 * permettant de comprendre sa position actuelle et de naviguer facilement.
 * 
 * Utilisation :
 * ```jsx
 * <Breadcrumb items={["Tableau de bord", "Simulations"]} />
 * ```
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.items - Liste des éléments du fil d'Ariane
 * @param {string} [props.className] - Classes CSS additionnelles
 */

export const Breadcrumb = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {/* Lien vers la page d'accueil */}
      <a 
        href="/"
        className="flex items-center hover:text-blue-600 transition-colors"
        aria-label="Accueil"
      >
        <Home className="h-4 w-4 mr-1" aria-hidden="true" />
        <span className="text-gray-600 hover:text-blue-600 transition-colors">Accueil</span>
      </a>
      
      {/* Séparateurs et éléments */}
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {/* Séparateur */}
          <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
          
          {/* Dernier élément (élément actuel) */}
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium" aria-current="page">
              {item}
            </span>
          ) : (
            <span className="text-gray-600 hover:text-blue-600 transition-colors">
              {item}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

/**
 * BreadcrumbItem - Composant pour un élément individuel du fil d'Ariane
 * 
 * Utilisation :
 * ```jsx
 * <Breadcrumb>
 *   <BreadcrumbItem href="/dashboard">Tableau de bord</BreadcrumbItem>
 *   <BreadcrumbItem href="/simulations">Simulations</BreadcrumbItem>
 *   <BreadcrumbItem isCurrent>Simulation 1</BreadcrumbItem>
 * </Breadcrumb>
 * ```
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.children - Contenu de l'élément
 * @param {string} [props.href] - URL de destination (optionnel)
 * @param {boolean} [props.isCurrent] - Indique si c'est l'élément actuel
 */
export const BreadcrumbItem = ({ children, href, isCurrent = false }) => {
  const baseClasses = 'text-sm transition-colors';
  const linkClasses = 'text-gray-600 hover:text-blue-600';
  const currentClasses = 'text-gray-900 font-medium';

  if (isCurrent) {
    return (
      <span className={`${baseClasses} ${currentClasses}`} aria-current="page">
        {children}
      </span>
    );
  }

  return (
    <a 
      href={href} 
      className={`${baseClasses} ${linkClasses}`}
    >
      {children}
    </a>
  );
};

/**
 * BreadcrumbSeparator - Composant pour le séparateur entre les éléments
 * 
 * Utilisation :
 * ```jsx
 * <BreadcrumbSeparator />
 * ```
 */
export const BreadcrumbSeparator = () => {
  return (
    <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
  );
};

/**
 * BreadcrumbList - Composant pour la liste complète du fil d'Ariane
 * 
 * Utilisation :
 * ```jsx
 * <BreadcrumbList>
 *   <BreadcrumbItem href="/">Accueil</BreadcrumbItem>
 *   <BreadcrumbSeparator />
 *   <BreadcrumbItem href="/dashboard">Tableau de bord</BreadcrumbItem>
 *   <BreadcrumbSeparator />
 *   <BreadcrumbItem isCurrent>Simulations</BreadcrumbItem>
 * </BreadcrumbList>
 * ```
 */
export const BreadcrumbList = ({ children }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      {children}
    </nav>
  );
};
