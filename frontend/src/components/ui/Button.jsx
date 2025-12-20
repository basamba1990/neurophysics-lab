import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button - Composant de bouton amélioré avec feedback utilisateur
 * 
 * Ce composant étend le bouton HTML standard avec des fonctionnalités UX améliorées :
 * - États de chargement avec animation
 - Feedback visuel clair
 - Accessibilité améliorée
 * 
 * Utilisation :
 * ```jsx
 * <Button
 *   onClick={handleClick}
 *   isLoading={isSubmitting}
 *   disabled={isSubmitting}
 *   variant="primary"
 *   size="md"
 * >
 *   Soumettre
 * </Button>
 * ```
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onClick - Fonction appelée au clic
 * @param {boolean} [props.isLoading] - Indique si le bouton est en état de chargement
 * @param {boolean} [props.disabled] - Indique si le bouton est désactivé
 * @param {string} [props.variant] - Variante du bouton ('primary', 'secondary', 'success', 'error', 'warning', 'info', 'outline')
 * @param {string} [props.size] - Taille du bouton ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {React.ReactNode} props.children - Contenu du bouton
 * @param {string} [props.className] - Classes CSS additionnelles
 * @param {string} [props.iconLeft] - Icône à afficher à gauche
 * @param {string} [props.iconRight] - Icône à afficher à droite
 * @param {boolean} [props.fullWidth] - Bouton en largeur complète
 * @param {string} [props.type] - Type du bouton ('button', 'submit', 'reset')
 */

const Button = ({
  onClick,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  iconLeft,
  iconRight,
  fullWidth = false,
  type = 'button',
  ...props
}) => {
  // Définir les classes CSS pour chaque variante
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    error: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    info: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700'
  };

  // Définir les classes CSS pour chaque taille
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  // Définir les classes CSS pour la largeur complète
  const widthClass = fullWidth ? 'w-full' : '';

  // Définir les classes CSS pour l'état désactivé
  const disabledClass = (isLoading || disabled) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';

  // Assembler toutes les classes
  const buttonClasses = `${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;

  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={buttonClasses}
      type={type}
      {...props}
    >
      {isLoading ? (
        // État de chargement
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>Chargement...</span>
        </div>
      ) : (
        // État normal
        <div className="flex items-center justify-center gap-2">
          {iconLeft && <span className="flex-shrink-0">{iconLeft}</span>}
          <span>{children}</span>
          {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
        </div>
      )}
    </button>
  );
};

/**
 * ButtonGroup - Composant pour grouper plusieurs boutons
 * 
 * Utilisation :
 * ```jsx
 * <ButtonGroup>
 *   <Button variant="outline">Annuler</Button>
 *   <Button variant="primary">Soumettre</Button>
 * </ButtonGroup>
 * ```
 * 
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Boutons à grouper
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export const ButtonGroup = ({ children, className = '' }) => {
  const buttonChildren = React.Children.toArray(children);

  return (
    <div className={`flex ${className}`}>
      {buttonChildren.map((child, index) => {
        const isFirst = index === 0;
        const isLast = index === buttonChildren.length - 1;

        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${
            !isFirst ? 'rounded-l-none' : ''
          } ${!isLast ? 'rounded-r-none' : ''}`
        });
      })}
    </div>
  );
};

/**
 * IconButton - Composant pour un bouton avec une seule icône
 * 
 * Utilisation :
 * ```jsx
 * <IconButton
 *   onClick={handleClick}
 *   icon={<Plus className="h-5 w-5" />}
 *   variant="primary"
 *   size="md"
 *   aria-label="Ajouter"
 * />
 * ```
 * 
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.icon - Icône à afficher
 * @param {string} [props.variant] - Variante du bouton
 * @param {string} [props.size] - Taille du bouton
 * @param {string} [props.className] - Classes CSS additionnelles
 * @param {string} [props.ariaLabel] - Label ARIA pour l'accessibilité
 */
export const IconButton = ({
  icon,
  variant = 'primary',
  size = 'md',
  className = '',
  ariaLabel,
  ...props
}) => {
  const sizeClasses = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${sizeClasses[size]} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </Button>
  );
};

/**
 * ButtonLink - Composant pour un bouton qui ressemble à un lien
 * 
 * Utilisation :
 * ```jsx
 * <ButtonLink href="/login">Se connecter</ButtonLink>
 * ```
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.href - URL de destination
 * @param {React.ReactNode} props.children - Contenu du bouton
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export const ButtonLink = ({ href, children, className = '' }) => {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 ${className}`}
    >
      {children}
    </a>
  );
};

export default Button;
