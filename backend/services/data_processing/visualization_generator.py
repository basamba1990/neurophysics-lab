# backend/services/data_processing/visualization_generator.py

from typing import Dict, Any
import matplotlib.pyplot as plt
import numpy as np
import io
import base64
import logging

logger = logging.getLogger(__name__)

class VisualizationGenerator:
    """
    Génère des visualisations (e.g., cartes de chaleur, lignes de courant)
    à partir des données de simulation traitées.
    """

    def __init__(self):
        pass

    def generate_heatmap(self, data: Dict[str, np.ndarray], field_name: str) -> str:
        """
        Génère une carte de chaleur (heatmap) pour un champ scalaire donné.
        Retourne l'image encodée en base64.
        """
        if not all(key in data for key in ["X_coords", "Y_coords", "Field_Grid"]):
            logger.error("Données de visualisation incomplètes.")
            return ""

        X = data["X_coords"]
        Y = data["Y_coords"]
        Z = data["Field_Grid"]

        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Utiliser pcolormesh pour une grille non nécessairement régulière
        # Note: Pour une grille régulière, imshow pourrait être plus simple, mais pcolormesh est plus général.
        # Ici, nous supposons que X et Y sont les coordonnées des bords des cellules.
        # Pour simplifier, nous allons utiliser imshow et supposer que Z est déjà dans le bon format (ny, nx)
        
        # Créer une grille 2D pour les coordonnées si elles ne sont pas déjà en meshgrid
        # Si X et Y sont 1D, nous pouvons utiliser extent pour imshow
        im = ax.imshow(Z, 
                       extent=[X.min(), X.max(), Y.min(), Y.max()], 
                       origin='lower', 
                       aspect='auto', 
                       cmap='viridis')
        
        fig.colorbar(im, ax=ax, label=field_name)
        ax.set_title(f"Carte de Chaleur de {field_name}")
        ax.set_xlabel("Coordonnée X")
        ax.set_ylabel("Coordonnée Y")
        
        # Sauvegarder l'image dans un buffer en mémoire
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        plt.close(fig)
        buf.seek(0)
        
        # Encoder en base64
        image_base64 = base64.b64encode(buf.read()).decode('utf-8')
        logger.info(f"Carte de chaleur pour {field_name} générée et encodée en base64.")
        
        return image_base64

    def generate_quiver_plot(self, data: Dict[str, np.ndarray], u_field: str, v_field: str) -> str:
        """
        Génère un graphique de champ de vecteurs (quiver plot) pour les champs u et v.
        """
        if not all(key in data for key in ["X_coords", "Y_coords", "Field_Grid_U", "Field_Grid_V"]):
            logger.error("Données de visualisation incomplètes pour le champ de vecteurs.")
            return ""

        X = data["X_coords"]
        Y = data["Y_coords"]
        U = data["Field_Grid_U"]
        V = data["Field_Grid_V"]

        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Créer un meshgrid pour les coordonnées
        X_mesh, Y_mesh = np.meshgrid(X, Y)
        
        # Réduire le nombre de flèches pour la clarté
        skip = (slice(None, None, 5), slice(None, None, 5))
        
        ax.quiver(X_mesh[skip], Y_mesh[skip], U[skip], V[skip], 
                  np.sqrt(U[skip]**2 + V[skip]**2), # Couleur basée sur la magnitude
                  cmap='jet', 
                  scale=50, # Ajuster l'échelle pour la taille des flèches
                  headwidth=5)
        
        ax.set_title(f"Champ de Vecteurs ({u_field}, {v_field})")
        ax.set_xlabel("Coordonnée X")
        ax.set_ylabel("Coordonnée Y")
        ax.set_aspect('equal', adjustable='box')
        
        # Sauvegarder l'image dans un buffer en mémoire
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        plt.close(fig)
        buf.seek(0)
        
        # Encoder en base64
        image_base64 = base64.b64encode(buf.read()).decode('utf-8')
        logger.info(f"Champ de vecteurs pour ({u_field}, {v_field}) généré et encodé en base64.")
        
        return image_base64

# Exemple d'utilisation (nécessite ResultsProcessor pour les données)
if __name__ == "__main__":
    # Simuler des données de grille 2D
    nx, ny = 50, 50
    x = np.linspace(0, 1, nx)
    y = np.linspace(0, 1, ny)
    X, Y = np.meshgrid(x, y)
    
    # Champ scalaire (Température)
    T = np.sin(np.pi * X) * np.cos(np.pi * Y)
    heatmap_data = {
        "X_coords": x,
        "Y_coords": y,
        "Field_Grid": T
    }
    
    # Champs vectoriels (Vitesse u, v)
    u = np.sin(np.pi * X) * np.cos(np.pi * Y)
    v = -np.cos(np.pi * X) * np.sin(np.pi * Y)
    quiver_data = {
        "X_coords": x,
        "Y_coords": y,
        "Field_Grid_U": u,
        "Field_Grid_V": v
    }
    
    generator = VisualizationGenerator()
    
    # Test Heatmap
    heatmap_base64 = generator.generate_heatmap(heatmap_data, "Température")
    print(f"Heatmap générée (taille: {len(heatmap_base64)} bytes)")
    
    # Test Quiver Plot
    quiver_base64 = generator.generate_quiver_plot(quiver_data, "u", "v")
    print(f"Quiver Plot généré (taille: {len(quiver_base64)} bytes)")
