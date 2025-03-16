#!/usr/bin/env python3
"""
Script pour lancer uniquement le backend de LexForge
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    """Fonction principale pour lancer le backend."""
    print("=== Lancement du backend LexForge ===\n")
    
    # Vérifier si le répertoire backend existe
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print(f"Erreur: Le répertoire {backend_dir} n'existe pas")
        sys.exit(1)
    
    # Vérifier si le fichier app.py existe
    app_file = backend_dir / "app.py"
    if not app_file.exists():
        print(f"Erreur: Le fichier {app_file} n'existe pas")
        sys.exit(1)
    
    # Installer les dépendances si nécessaire
    requirements_file = backend_dir / "requirements.txt"
    if requirements_file.exists():
        print("Installation des dépendances du backend...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)], 
                      check=True, capture_output=True)
        print("Dépendances installées avec succès\n")
    
    # Lancer le backend
    print("Démarrage du serveur backend...")
    os.chdir(str(backend_dir))
    subprocess.run([sys.executable, "app.py"])

if __name__ == "__main__":
    main() 