"""
Fonctions utilitaires utilisées dans l'application.
Version corrigée pour gérer correctement les caractères accentués et UTF-8.
"""
import os
import tempfile
import re
from config import DEFAULT_SUPPORTS


def collect_author_info(is_physical_person, data):
    """
    Collecte les informations sur l'auteur/modèle selon son type.
    
    Args:
        is_physical_person (bool): True si l'auteur est une personne physique, False sinon
        data (dict): Dictionnaire contenant les données du formulaire
        
    Returns:
        dict: Les informations formatées sur l'auteur/modèle
    """
    author_info = {}
    
    if is_physical_person:
        # Personne physique
        author_info = {
            "gentille": data.get("gentille", "M."),
            "nom": data.get("nom", ""),
            "prenom": data.get("prenom", ""),
            "date_naissance": data.get("date_naissance", ""),
            "nationalite": data.get("nationalite", ""),
            "adresse": data.get("adresse", ""),
            "contact": data.get("contact_physique", "")
        }
    else:
        # Personne morale
        author_info = {
            "nom_societe": data.get("nom_societe", ""),
            "statut": data.get("statut", ""),
            "rcs": data.get("rcs", ""),
            "siege": data.get("siege", ""),
            "contact": data.get("contact_morale", "")
        }
    
    return author_info


def ensure_default_supports(selected_supports):
    """
    S'assure que les supports par défaut sont inclus dans la liste des supports sélectionnés.
    
    Args:
        selected_supports (list): Liste des supports sélectionnés par l'utilisateur
        
    Returns:
        list: Liste des supports incluant les supports par défaut
    """
    # Création d'une copie de la liste pour ne pas modifier l'original
    supports = selected_supports.copy() if selected_supports else []
    
    # Vérification que les supports par défaut sont inclus
    for default_support in DEFAULT_SUPPORTS:
        # Vérification que le support n'est pas déjà présent sous une forme quelconque
        if not any(default_support.lower() in support.lower() for support in supports):
            supports.append(default_support)
    
    return supports


def sanitize_text(text):
    """
    Nettoie le texte pour éviter les problèmes d'affichage dans le PDF.
    Version corrigée pour préserver les caractères accentués et UTF-8.
    
    Args:
        text (str): Texte à nettoyer
        
    Returns:
        str: Texte nettoyé
    """
    if not text:
        return ""
    
    # Limiter la longueur des lignes pour éviter les débordements
    # tout en préservant les caractères Unicode/accentués
    lines = []
    for line in text.split('\n'):
        if len(line) < 2500:
            lines.append(line)
        else:
            lines.append(line[:77] + '...')
    
    return '\n'.join(lines)


def create_temp_file(prefix="", suffix=""):
    """
    Crée un fichier temporaire avec un timestamp unique.
    
    Args:
        prefix (str, optional): Préfixe du nom de fichier. Par défaut "".
        suffix (str, optional): Suffixe du nom de fichier. Par défaut "".
    
    Returns:
        str: Chemin complet vers le fichier temporaire créé.
    """
    import time
    import os
    
    # Générer un timestamp unique
    timestamp = str(int(time.time()))
    
    # Chemin du répertoire tmp, cohérent avec app.py
    TMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tmp')
    
    # Créer le répertoire tmp s'il n'existe pas
    if not os.path.exists(TMP_DIR):
        os.makedirs(TMP_DIR)
    
    # Créer le fichier temporaire
    filename = os.path.join(TMP_DIR, f"{prefix}{timestamp}{suffix}")
    
    return filename


def format_supports_list(supports):
    """
    Formate la liste des supports pour l'affichage dans le contrat.
    
    Args:
        supports (list): Liste des supports
        
    Returns:
        str: Liste des supports formatée
    """
    if not supports:
        return "site web et Discord de Tellers"
    
    # Formate la liste des supports en une chaîne lisible
    return ", ".join(supports)