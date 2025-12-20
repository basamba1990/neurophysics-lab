import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

/**
 * ToastProvider - Système de notifications toast pour toute l'application
 * 
 * Ce composant gère l'affichage de notifications temporaires (toast) qui apparaissent
 * en bas à droite de l'écran et disparaissent automatiquement après un délai.
 * 
 * Utilisation :
 * 1. Envelopper l'application avec <ToastProvider>
 * 2. Utiliser le hook useToast() dans les composants pour afficher des notifications
 * 
 * Exemple d'utilisation :
 * ```jsx
 * const { showToast } = useToast();
 * showToast('success', 'Simulation lancée avec succès', 5000);
 * ```
 */

const ToastContext = React.createContext();

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Affiche une notification toast
   * @param {string} type - Type de notification ('success', 'error', 'warning', 'info')
   * @param {string} message - Message à afficher
   * @param {number} duration - Durée d'affichage en millisecondes (par défaut: 3000)
   */
  const showToast = (type, message, duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message, duration }]);
    
    // Supprimer automatiquement le toast après la durée spécifiée
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  /**
   * Ferme un toast spécifique
   * @param {number} id - ID du toast à fermer
   */
  const closeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  /**
   * Ferme tous les toasts
   */
  const closeAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ showToast, closeToast, closeAllToasts }}>
      {children}
      
      {/* Overlay des toasts */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom ${
              toast.type === 'success' ? 'bg-green-600 text-white' :
              toast.type === 'error' ? 'bg-red-600 text-white' :
              toast.type === 'warning' ? 'bg-yellow-600 text-white' :
              'bg-blue-600 text-white'
            }`}
            style={{ animationDuration: '0.3s' }}
          >
            {/* Icône */}
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
              {toast.type === 'error' && <XCircle className="h-5 w-5" />}
              {toast.type === 'warning' && <AlertCircle className="h-5 w-5" />}
              {toast.type === 'info' && <AlertCircle className="h-5 w-5" />}
            </div>
            
            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            
            {/* Bouton de fermeture */}
            <button
              onClick={() => closeToast(toast.id)}
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
              aria-label="Fermer la notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Hook utilitaire pour afficher des notifications de succès
 * @param {string} message - Message à afficher
 * @param {number} duration - Durée d'affichage en millisecondes
 */
export const useSuccessToast = (message, duration = 3000) => {
  const { showToast } = useToast();
  return () => showToast('success', message, duration);
};

/**
 * Hook utilitaire pour afficher des notifications d'erreur
 * @param {string} message - Message à afficher
 * @param {number} duration - Durée d'affichage en millisecondes
 */
export const useErrorToast = (message, duration = 3000) => {
  const { showToast } = useToast();
  return () => showToast('error', message, duration);
};

/**
 * Hook utilitaire pour afficher des notifications d'avertissement
 * @param {string} message - Message à afficher
 * @param {number} duration - Durée d'affichage en millisecondes
 */
export const useWarningToast = (message, duration = 3000) => {
  const { showToast } = useToast();
  return () => showToast('warning', message, duration);
};
