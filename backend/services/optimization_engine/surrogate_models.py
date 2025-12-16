# backend/services/optimization_engine/surrogate_models.py

from typing import Dict, Any, List
import numpy as np
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel
from sklearn.ensemble import RandomForestRegressor
import logging

logger = logging.getLogger(__name__)

class SurrogateModel:
    """
    Classe de base pour les modèles de substitution (Surrogate Models)
    utilisés pour accélérer l'optimisation et l'analyse de sensibilité.
    """
    def __init__(self, model_type: str = 'gpr'):
        self.model_type = model_type
        self.model = self._initialize_model(model_type)
        logger.info(f"Modèle de substitution de type '{model_type}' initialisé.")

    def _initialize_model(self, model_type: str):
        """Initialise le modèle sklearn approprié."""
        if model_type == 'gpr':
            # Gaussian Process Regressor
            kernel = ConstantKernel(1.0, (1e-3, 1e3)) * RBF(1.0, (1e-2, 1e2))
            return GaussianProcessRegressor(kernel=kernel, n_restarts_optimizer=9)
        elif model_type == 'random_forest':
            return RandomForestRegressor(n_estimators=100, random_state=42)
        else:
            raise ValueError(f"Type de modèle de substitution non supporté: {model_type}")

    def train(self, X: np.ndarray, y: np.ndarray):
        """Entraîne le modèle avec les données d'entrée X et les résultats y."""
        if X.shape[0] != y.shape[0]:
            raise ValueError("Le nombre d'échantillons dans X et y doit être identique.")
        
        logger.info(f"Entraînement du modèle {self.model_type} avec {X.shape[0]} échantillons.")
        self.model.fit(X, y)
        logger.info("Entraînement terminé.")

    def predict(self, X_new: np.ndarray) -> np.ndarray:
        """Fait une prédiction pour de nouvelles données d'entrée."""
        if self.model_type == 'gpr':
            # GPR retourne la moyenne et l'écart-type
            y_mean, y_std = self.model.predict(X_new, return_std=True)
            return y_mean
        else:
            return self.model.predict(X_new)

    def get_uncertainty(self, X_new: np.ndarray) -> np.ndarray:
        """Retourne l'incertitude de la prédiction (principalement pour GPR)."""
        if self.model_type == 'gpr':
            _, y_std = self.model.predict(X_new, return_std=True)
            return y_std
        else:
            logger.warning(f"L'incertitude n'est pas directement disponible pour le modèle {self.model_type}.")
            return np.zeros(X_new.shape[0])

# Exemple d'utilisation
if __name__ == "__main__":
    # Données d'exemple (fonction sin(x) bruitée)
    X_train = np.linspace(0, 10, 20)[:, None]
    y_train = np.sin(X_train).ravel() + np.random.normal(0, 0.1, X_train.shape[0])
    
    X_test = np.linspace(0, 10, 100)[:, None]
    
    # Modèle GPR
    gpr_model = SurrogateModel(model_type='gpr')
    gpr_model.train(X_train, y_train)
    y_pred_gpr = gpr_model.predict(X_test)
    y_std_gpr = gpr_model.get_uncertainty(X_test)
    
    print(f"Prédictions GPR: {y_pred_gpr[:5].ravel()}")
    print(f"Incertitude GPR: {y_std_gpr[:5].ravel()}")
    
    # Modèle Random Forest
    rf_model = SurrogateModel(model_type='random_forest')
    rf_model.train(X_train, y_train)
    y_pred_rf = rf_model.predict(X_test)
    
    print(f"Prédictions Random Forest: {y_pred_rf[:5].ravel()}")
