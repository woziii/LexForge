"""
Module pour la prévisualisation des contrats avant génération du PDF.
"""
from contract_templates import ContractTemplates
from utils import ensure_default_supports, sanitize_text


def preview_contract(contract_type, is_free, author_type, author_info, 
                   work_description, image_description, supports, 
                   additional_rights, remuneration, is_exclusive):
    """
    Génère un aperçu du contrat sous forme de texte.
    
    Args:
        contract_type (list): Liste des types de contrats sélectionnés
        is_free (bool): True si la cession est gratuite, False sinon
        author_type (str): Type d'auteur ("Personne physique" ou "Personne morale")
        author_info (dict): Informations sur l'auteur
        work_description (str): Description de l'œuvre
        image_description (str): Description de l'image
        supports (list): Liste des supports sélectionnés
        additional_rights (list): Liste des droits supplémentaires sélectionnés
        remuneration (str): Modalités de rémunération
        is_exclusive (bool): True si la cession est exclusive, False sinon
        
    Returns:
        str: Aperçu du contrat
    """
    is_free = (is_free == "Gratuite")
    
    # Ajouter les supports par défaut
    final_supports = ensure_default_supports(supports)
    
    # Initialiser l'aperçu avec le titre
    apercu = ContractTemplates.get_title(contract_type) + "\n\n"
    
    # Ajouter un extrait du préambule (simplifié pour l'aperçu)
    preamble_parts = ContractTemplates.get_preamble_text(contract_type, author_type, author_info).split("\n\n")
    
    # Première partie du préambule (partie "ENTRE LES SOUSSIGNÉS" et infos parties)
    for i in range(min(6, len(preamble_parts))):
        if preamble_parts[i].strip():
            apercu += preamble_parts[i] + "\n\n"
    
    # Sauter au "CECI EXPOSÉ, IL A ÉTÉ CONVENU CE QUI SUIT :"
    for part in preamble_parts:
        if "CONVENU CE QUI SUIT" in part:
            apercu += part + "\n\n"
            break
    
    # Article 1 - Objet (extrait)
    apercu += "ARTICLE 1 – OBJET DU CONTRAT\n\n"
    
    if "Auteur (droits d'auteur)" in contract_type:
        apercu += "1.1 Œuvre concernée\n\n"
        apercu += f"L'Auteur déclare être le créateur et titulaire exclusif des droits d'auteur sur l'œuvre suivante :\n\n"
        apercu += f"{sanitize_text(work_description)}\n\n"
    
    if "Image (droit à l'image)" in contract_type:
        apercu += "1.2 Images concernées\n\n"
        apercu += f"Le Modèle autorise l'utilisation et l'exploitation de son image telle qu'elle apparaît dans les photographies/vidéos suivantes :\n\n"
        apercu += f"{sanitize_text(image_description)}\n\n"
    
    # Article 2 - Droits cédés (extrait)
    apercu += "ARTICLE 2 – ÉTENDUE DES DROITS CÉDÉS\n\n"
    apercu += "2.1 Nature de la cession\n\n"
    apercu += "L'Auteur cède au Cessionnaire, "
    
    if is_exclusive:
        apercu += "à titre exclusif, "
    else:
        apercu += "à titre non exclusif, "
    
    if is_free:
        apercu += "gratuitement et pour la durée précisée à l'article 4, les droits patrimoniaux suivants.\n\n"
    else:
        apercu += "pour la durée précisée à l'article 4 et moyennant rémunération, les droits patrimoniaux détaillés au contrat.\n\n"
    
    apercu += "2.2 Droits patrimoniaux cédés\n\n"
    apercu += "Droits de base : reproduction et représentation"
    
    if not is_free and additional_rights:
        apercu += "\nDroits supplémentaires inclus :"
        for right in additional_rights:
            right_name = right.split(" - ")[0] if " - " in right else right
            apercu += f"\n- {right_name}"
    
    apercu += "\n\n"
    
    # Pour l'aperçu, ajouter les titres des autres articles
    article_num = 3
    
    if "Image (droit à l'image)" in contract_type:
        apercu += f"ARTICLE {article_num} – AUTORISATION D'EXPLOITATION DE L'IMAGE\n"
        apercu += f"(Les détails complets seront inclus dans le contrat final)\n\n"
        article_num += 1
    
    apercu += f"ARTICLE {article_num} – DURÉE ET TERRITOIRE\n"
    apercu += "Durée : 1 an, renouvelable par tacite reconduction\n"
    apercu += "Territoire : monde entier\n\n"
    article_num += 1
    
    apercu += f"ARTICLE {article_num} – SUPPORTS D'EXPLOITATION\n"
    supports_str = ", ".join(final_supports)
    apercu += f"Supports autorisés : {supports_str}\n\n"
    article_num += 1
    
    apercu += f"ARTICLE {article_num} – RÉMUNÉRATION\n"
    if is_free:
        apercu += "La présente cession est consentie à titre gratuit.\n\n"
    else:
        apercu += f"Rémunération : {sanitize_text(remuneration)}\n\n"
    article_num += 1
    
    # Résumé des articles restants
    apercu += f"ARTICLE {article_num} – GARANTIES ET RESPONSABILITÉS\n"
    article_num += 1
    apercu += f"ARTICLE {article_num} – RÉSILIATION\n"
    article_num += 1
    apercu += f"ARTICLE {article_num} – DISPOSITIONS DIVERSES\n"
    article_num += 1
    apercu += f"ARTICLE {article_num} – LOI APPLICABLE ET JURIDICTION COMPÉTENTE\n\n"
    
    apercu += "Fait à ________________, le ________________\n\n"
    apercu += "En deux exemplaires originaux.\n\n"
    
    if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
        apercu += "Pour l'Auteur et Modèle                                Pour le Cessionnaire"
    elif "Auteur (droits d'auteur)" in contract_type:
        apercu += "Pour l'Auteur                                          Pour le Cessionnaire"
    else:
        apercu += "Pour le Modèle                                         Pour le Cessionnaire"
    
    apercu += "\n\nCet aperçu est une version simplifiée. Le contrat final sera plus détaillé et juridiquement complet."
    
    return apercu