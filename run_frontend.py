#!/usr/bin/env python3
"""
Script pour lancer uniquement le frontend de LexForge
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    """Fonction principale pour lancer le frontend."""
    print("=== Lancement du frontend LexForge ===\n")
    
    # Vérifier si le répertoire frontend existe
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print(f"Erreur: Le répertoire {frontend_dir} n'existe pas")
        sys.exit(1)
    
    # Vérifier si le fichier package.json existe
    package_json = frontend_dir / "package.json"
    if not package_json.exists():
        print(f"Erreur: Le fichier {package_json} n'existe pas")
        sys.exit(1)
    
    # Installer les dépendances si nécessaire
    node_modules = frontend_dir / "node_modules"
    if not node_modules.exists() or not any(node_modules.iterdir()):
        print("Installation des dépendances du frontend...")
        os.chdir(str(frontend_dir))
        subprocess.run(["npm", "install"], check=True)
        print("Dépendances installées avec succès\n")
    
    # Lancer le frontend
    print("Démarrage du serveur frontend...")
    os.chdir(str(frontend_dir))
    subprocess.run(["npm", "start"])

if __name__ == "__main__":
    main() 