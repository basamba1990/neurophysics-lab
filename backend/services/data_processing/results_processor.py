# backend/services/data_processing/results_processor.py

from typing import Dict, Any, List
import numpy as np
import pandas as pd
import logging

logger = logging.getLogger(__name__)

class ResultsProcessor:
    """
    Traite les résultats bruts des simulations PINN (champs de données)
    pour les rendre exploitables pour la visualisation et l'analyse.
    """

    def __init__(self, simulation_id: str):
        self.simulation_id = simulation_id
        self.raw_results: Dict[str, np.ndarray] = {}
        self.processed_data: pd.DataFrame = pd.DataFrame()

    def load_raw_results(self, results: Dict[str, np.ndarray]):
        """
        Charge les résultats bruts de la simulation (e.g., coordonnées, u, v, p, T).
        """
        self.raw_results = results
        logger.info(f"Résultats bruts chargés pour la simulation {self.simulation_id}.")

    def process_fields(self) -> pd.DataFrame:
        """
        Convertit les champs de données bruts en un DataFrame structuré
        et calcule des quantités dérivées (e.g., vitesse, tourbillon).
        """
        if not self.raw_results:
            logger.warning("Aucun résultat brut à traiter.")
            return pd.DataFrame()

        # Assurez-vous que les coordonnées X et Y existent
        if 'X' not in self.raw_results or 'Y' not in self.raw_results:
            logger.error("Les coordonnées X et Y sont manquantes dans les résultats bruts.")
            return pd.DataFrame()

        data = {
            'X': self.raw_results['X'].flatten(),
            'Y': self.raw_results['Y'].flatten(),
        }

        # Ajouter les champs de solution (u, v, p, T, etc.)
        for key, array in self.raw_results.items():
            if key not in ['X', 'Y']:
                data[key] = array.flatten()

        self.processed_data = pd.DataFrame(data)
        
        # Exemple de calcul de quantité dérivée: Vitesse (pour Navier-Stokes)
        if 'u' in self.processed_data.columns and 'v' in self.processed_data.columns:
            self.processed_data['Velocity_Magnitude'] = np.sqrt(
                self.processed_data['u']**2 + self.processed_data['v']**2
            )
            logger.info("Magnitude de la vitesse calculée.")

        logger.info(f"Traitement des résultats terminé. DataFrame de taille {self.processed_data.shape}.")
        return self.processed_data

    def get_data_for_visualization(self, field_name: str) -> Dict[str, np.ndarray]:
        """
        Prépare les données pour une visualisation 2D (grille).
        (Nécessite de connaître la structure de la grille originale, ici simplifiée)
        """
        if self.processed_data.empty:
            logger.warning("Le DataFrame traité est vide.")
            return {}

        # Supposons que la grille était régulière (comme dans MeshHandler)
        unique_x = self.processed_data['X'].unique()
        unique_y = self.processed_data['Y'].unique()
        
        nx = len(unique_x)
        ny = len(unique_y)
        
        if field_name not in self.processed_data.columns:
            logger.error(f"Champ '{field_name}' non trouvé dans les données traitées.")
            return {}

        # Reconstruire la grille 2D
        field_grid = self.processed_data[field_name].values.reshape((ny, nx))
        
        return {
            "X_coords": unique_x,
            "Y_coords": unique_y,
            "Field_Grid": field_grid
        }

# Exemple d'utilisation
if __name__ == "__main__":
    # Simuler des résultats bruts
    x = np.linspace(0, 1, 10)
    y = np.linspace(0, 1, 10)
    X, Y = np.meshgrid(x, y)
    
    u = np.sin(np.pi * X) * np.cos(np.pi * Y)
    v = -np.cos(np.pi * X) * np.sin(np.pi * Y)
    p = X**2 + Y**2
    
    raw_data = {
        'X': X.flatten()[:, None],
        'Y': Y.flatten()[:, None],
        'u': u.flatten()[:, None],
        'v': v.flatten()[:, None],
        'p': p.flatten()[:, None],
    }
    
    processor = ResultsProcessor("sim_001")
    processor.load_raw_results(raw_data)
    df = processor.process_fields()
    
    vis_data = processor.get_data_for_visualization("Velocity_Magnitude")
    print(f"Données de visualisation pour la Magnitude de la Vitesse: {vis_data['Field_Grid'].shape}")
