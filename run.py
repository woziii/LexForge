#!/usr/bin/env python3
"""
Script pour lancer LexForge (backend et frontend)
Ce script vérifie les dépendances, les installe si nécessaire, puis lance le backend et le frontend.
"""

import os
import sys
import subprocess
import time
import webbrowser
import platform
import json
from pathlib import Path

# Couleurs pour les messages
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(message):
    """Affiche un message d'en-tête."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}=== {message} ==={Colors.ENDC}\n")

def print_success(message):
    """Affiche un message de succès."""
    print(f"{Colors.GREEN}✓ {message}{Colors.ENDC}")

def print_warning(message):
    """Affiche un message d'avertissement."""
    print(f"{Colors.WARNING}⚠ {message}{Colors.ENDC}")

def print_error(message):
    """Affiche un message d'erreur."""
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")

def print_info(message):
    """Affiche un message d'information."""
    print(f"{Colors.BLUE}ℹ {message}{Colors.ENDC}")

def run_command(command, cwd=None, shell=False):
    """Exécute une commande et retourne le résultat."""
    try:
        if shell:
            result = subprocess.run(command, shell=True, check=True, text=True, capture_output=True, cwd=cwd)
        else:
            result = subprocess.run(command, check=True, text=True, capture_output=True, cwd=cwd)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def check_python_version():
    """Vérifie que la version de Python est suffisante."""
    print_header("Vérification de la version de Python")
    
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print_error(f"Python 3.8+ est requis. Version actuelle: {version.major}.{version.minor}.{version.micro}")
        return False
    
    print_success(f"Python {version.major}.{version.minor}.{version.micro} détecté")
    return True

def check_node_version():
    """Vérifie que Node.js est installé et que la version est suffisante."""
    print_header("Vérification de Node.js")
    
    success, output = run_command(["node", "--version"])
    if not success:
        print_error("Node.js n'est pas installé ou n'est pas dans le PATH")
        print_info("Veuillez installer Node.js depuis https://nodejs.org/ (version 14+ recommandée)")
        return False
    
    # Supprimer le 'v' au début et les espaces
    version = output.strip().lstrip('v')
    major_version = int(version.split('.')[0])
    
    if major_version < 14:
        print_error(f"Node.js 14+ est recommandé. Version actuelle: {version}")
        return False
    
    print_success(f"Node.js {version} détecté")
    return True

def check_npm():
    """Vérifie que npm est installé."""
    print_header("Vérification de npm")
    
    success, output = run_command(["npm", "--version"])
    if not success:
        print_error("npm n'est pas installé ou n'est pas dans le PATH")
        return False
    
    version = output.strip()
    print_success(f"npm {version} détecté")
    return True

def check_backend_dependencies():
    """Vérifie et installe les dépendances du backend."""
    print_header("Vérification des dépendances du backend")
    
    backend_dir = Path("backend")
    requirements_file = backend_dir / "requirements.txt"
    
    if not requirements_file.exists():
        print_error(f"Le fichier {requirements_file} n'existe pas")
        return False
    
    # Vérifier si pip est à jour
    print_info("Mise à jour de pip...")
    success, _ = run_command([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
    if not success:
        print_warning("Impossible de mettre à jour pip, mais on continue...")
    
    # Installer les dépendances
    print_info("Installation des dépendances du backend...")
    success, output = run_command([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)])
    
    if not success:
        print_error("Erreur lors de l'installation des dépendances du backend")
        print_error(output)
        return False
    
    print_success("Dépendances du backend installées avec succès")
    return True

def check_frontend_dependencies():
    """Vérifie et installe les dépendances du frontend."""
    print_header("Vérification des dépendances du frontend")
    
    frontend_dir = Path("frontend")
    package_json = frontend_dir / "package.json"
    
    if not package_json.exists():
        print_error(f"Le fichier {package_json} n'existe pas")
        return False
    
    # Vérifier si node_modules existe
    node_modules = frontend_dir / "node_modules"
    if not node_modules.exists() or not any(node_modules.iterdir()):
        print_info("Installation des dépendances du frontend...")
        success, output = run_command(["npm", "install"], cwd=str(frontend_dir))
        
        if not success:
            print_error("Erreur lors de l'installation des dépendances du frontend")
            print_error(output)
            return False
    else:
        print_info("Vérification des mises à jour des dépendances du frontend...")
        success, output = run_command(["npm", "outdated"], cwd=str(frontend_dir))
        
        if not success:
            print_warning("Impossible de vérifier les mises à jour, mais on continue...")
        else:
            if output.strip():
                print_info("Mise à jour des dépendances du frontend...")
                success, _ = run_command(["npm", "update"], cwd=str(frontend_dir))
                if not success:
                    print_warning("Impossible de mettre à jour certaines dépendances, mais on continue...")
    
    print_success("Dépendances du frontend vérifiées avec succès")
    return True

def start_backend():
    """Démarre le serveur backend."""
    print_header("Démarrage du backend")
    
    backend_dir = Path("backend")
    app_file = backend_dir / "app.py"
    
    if not app_file.exists():
        print_error(f"Le fichier {app_file} n'existe pas")
        return None
    
    print_info("Démarrage du serveur backend...")
    
    # Utiliser subprocess.Popen pour démarrer le processus en arrière-plan
    if platform.system() == "Windows":
        process = subprocess.Popen([sys.executable, str(app_file)], cwd=str(backend_dir), 
                                  creationflags=subprocess.CREATE_NEW_CONSOLE)
    else:
        # Exécuter le script directement depuis le répertoire backend
        process = subprocess.Popen([sys.executable, "app.py"], cwd=str(backend_dir))
    
    # Attendre un peu pour que le serveur démarre
    time.sleep(2)
    
    print_success("Serveur backend démarré sur http://localhost:5001")
    return process

def start_frontend():
    """Démarre le serveur frontend."""
    print_header("Démarrage du frontend")
    
    frontend_dir = Path("frontend")
    
    if not frontend_dir.exists():
        print_error(f"Le répertoire {frontend_dir} n'existe pas")
        return None
    
    print_info("Démarrage du serveur de développement frontend...")
    
    # Utiliser subprocess.Popen pour démarrer le processus en arrière-plan
    if platform.system() == "Windows":
        process = subprocess.Popen(["npm", "start"], cwd=str(frontend_dir), 
                                  creationflags=subprocess.CREATE_NEW_CONSOLE)
    else:
        process = subprocess.Popen(["npm", "start"], cwd=str(frontend_dir))
    
    # Attendre un peu pour que le serveur démarre
    time.sleep(5)
    
    print_success("Serveur frontend démarré sur http://localhost:3000")
    return process

def open_browser():
    """Ouvre le navigateur à l'URL du frontend."""
    print_header("Ouverture du navigateur")
    
    url = "http://localhost:3000"
    print_info(f"Ouverture de {url} dans le navigateur par défaut...")
    
    # Ouvrir le navigateur
    webbrowser.open(url)
    
    print_success("Navigateur ouvert")

def main():
    """Fonction principale."""
    print_header("LexForge - Script de lancement")
    
    # Vérifier les prérequis
    if not check_python_version():
        sys.exit(1)
    
    if not check_node_version():
        sys.exit(1)
    
    if not check_npm():
        sys.exit(1)
    
    # Vérifier et installer les dépendances
    if not check_backend_dependencies():
        sys.exit(1)
    
    if not check_frontend_dependencies():
        sys.exit(1)
    
    # Démarrer les serveurs
    backend_process = start_backend()
    if not backend_process:
        sys.exit(1)
    
    frontend_process = start_frontend()
    if not frontend_process:
        backend_process.terminate()
        sys.exit(1)
    
    # Ouvrir le navigateur
    open_browser()
    
    print_header("LexForge est en cours d'exécution")
    print_info("Appuyez sur Ctrl+C pour arrêter les serveurs")
    
    try:
        # Attendre que l'utilisateur appuie sur Ctrl+C
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print_info("\nArrêt des serveurs...")
        
        # Arrêter les serveurs
        if backend_process:
            backend_process.terminate()
        
        if frontend_process:
            frontend_process.terminate()
        
        print_success("Serveurs arrêtés")

if __name__ == "__main__":
    main() 