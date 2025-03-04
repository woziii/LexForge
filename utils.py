"""
Fonctions utilitaires utilisées dans l'application.
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
    
    Args:
        text (str): Texte à nettoyer
        
    Returns:
        str: Texte nettoyé
    """
    if not text:
        return ""
    
    # Remplace les caractères spéciaux qui pourraient poser problème
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    
    # Limite la longueur des lignes pour éviter les débordements
    text = '\n'.join(line if len(line) < 80 else line[:77] + '...' 
                     for line in text.split('\n'))
    
    return text


def create_temp_file(prefix="contrat_", suffix=".pdf"):
    """
    Crée un fichier temporaire.
    
    Args:
        prefix (str): Préfixe du nom du fichier
        suffix (str): Suffixe du nom du fichier
        
    Returns:
        str: Chemin vers le fichier temporaire
    """
    temp_dir = tempfile.gettempdir()
    filename = f"{prefix}{tempfile.NamedTemporaryFile().name}{suffix}"
    return os.path.join(temp_dir, os.path.basename(filename))


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
