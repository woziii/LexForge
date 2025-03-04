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
    
    # Ajouter le préambule
    apercu += ContractTemplates.get_preamble_text(contract_type, author_type, author_info)
    
    # Article 1 - Objet
    apercu += "Article 1 – OBJET\n"
    if "Auteur (droits d'auteur)" in contract_type:
        apercu += f"L'Auteur déclare être le créateur et titulaire exclusif des droits d'auteur sur l'œuvre suivante : {sanitize_text(work_description)}.\n"
    
    if "Image (droit à l'image)" in contract_type:
        apercu += f"Le Modèle autorise l'utilisation et l'exploitation de son image telle qu'elle apparaît dans les photographies/vidéos suivantes : {sanitize_text(image_description)}.\n"
    
    apercu += "Par le présent contrat, "
    if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
        apercu += "l'Auteur cède au Cessionnaire certains droits sur son œuvre, et le Modèle autorise l'exploitation de son image, dans les conditions définies ci-après.\n\n"
    elif "Auteur (droits d'auteur)" in contract_type:
        apercu += "l'Auteur cède au Cessionnaire certains droits sur son œuvre dans les conditions définies ci-après.\n\n"
    else:
        apercu += "le Modèle autorise l'exploitation de son image dans les conditions définies ci-après.\n\n"
    
    # Compteur d'articles
    article_num = 2
    
    # Article 2 - Droits cédés pour l'Auteur
    if "Auteur (droits d'auteur)" in contract_type:
        apercu += "Article 2 – ÉTENDUE DES DROITS CÉDÉS\n"
        apercu += "L'Auteur cède au Cessionnaire, "
        
        if is_exclusive:
            apercu += "à titre exclusif, "
        else:
            apercu += "à titre non exclusif, "
        
        if is_free:
            apercu += "gratuitement et pour la durée précisée à l'article 3, les droits patrimoniaux suivants :\n\n"
            apercu += "- Le droit de reproduction\n"
            apercu += "- Le droit de représentation\n\n"
        else:
            apercu += "pour la durée précisée à l'article 3 et moyennant la rémunération précisée à l'article approprié, les droits patrimoniaux suivants :\n\n"
            
            # Droits de base
            apercu += "- Le droit de reproduction\n"
            apercu += "- Le droit de représentation\n"
            
            # Droits supplémentaires pour les cessions onéreuses
            if "distribution" in additional_rights:
                apercu += "- Le droit de distribution\n"
            
            if "usage" in additional_rights:
                apercu += "- Le droit d'usage\n"
            
            if "adaptation" in additional_rights:
                apercu += "- Le droit d'adaptation\n"
            
            if "pret" in additional_rights:
                apercu += "- Le droit de prêt\n"
            
            if "location" in additional_rights:
                apercu += "- Le droit de location\n"
            
            if "suite" in additional_rights:
                apercu += "- Le droit de suite (pour œuvres graphiques et plastiques)\n"
            
            apercu += "\n"
        
        # Clause d'exclusivité
        if is_exclusive:
            apercu += "Pendant la durée de la présente cession, l'Auteur s'engage à ne pas céder les mêmes droits à des tiers et à ne pas exploiter lui-même l'œuvre selon les modalités cédées au Cessionnaire.\n\n"
        else:
            apercu += "La présente cession étant non exclusive, l'Auteur conserve le droit d'exploiter l'œuvre et de céder les mêmes droits à des tiers.\n\n"
        
        article_num += 1
    
    # Article pour les droits à l'image
    if "Image (droit à l'image)" in contract_type:
        image_article_num = article_num if "Auteur (droits d'auteur)" in contract_type else 2
        apercu += f"Article {image_article_num} – AUTORISATION D'EXPLOITATION DE L'IMAGE\n"
        
        apercu += "Le Modèle autorise le Cessionnaire à fixer, reproduire et communiquer au public son image. "
        apercu += "Cette autorisation est consentie "
        
        if is_exclusive:
            apercu += "à titre exclusif, "
        else:
            apercu += "à titre non exclusif, "
        
        if is_free:
            apercu += "gratuitement, "
        else:
            apercu += "moyennant la rémunération précisée à l'article approprié, "
        
        apercu += "pour la durée et sur le territoire mentionnés ci-après.\n\n"
        
        apercu += "Le Cessionnaire s'engage expressément à ne pas porter atteinte à la dignité, à l'honneur ou à la réputation du Modèle. "
        apercu += "Les parties s'engagent mutuellement à ne pas tenir de propos dénigrants l'une envers l'autre.\n\n"
        
        if is_exclusive:
            apercu += "Le Modèle s'engage à ne pas autoriser l'exploitation de son image à des tiers pendant la durée du présent contrat.\n\n"
        else:
            apercu += "La présente autorisation étant non exclusive, le Modèle conserve le droit d'autoriser l'exploitation de son image à des tiers.\n\n"
        
        article_num += 1
    
    # Suite des articles (résumés pour l'aperçu)
    apercu += f"Article {article_num} – DURÉE ET TERRITOIRE\n"
    apercu += "Durée : 1 an, renouvelable par tacite reconduction\n"
    apercu += "Territoire : monde entier\n\n"
    
    article_num += 1
    apercu += f"Article {article_num} – SUPPORTS D'EXPLOITATION\n"
    supports_str = ", ".join(final_supports)
    apercu += f"Supports autorisés : {supports_str}\n\n"
    
    article_num += 1
    apercu += f"Article {article_num} – RÉMUNÉRATION\n"
    if is_free:
        apercu += "La présente cession est consentie à titre gratuit.\n\n"
    else:
        apercu += f"Rémunération : {sanitize_text(remuneration)}\n\n"
    
    # Aperçu des articles restants
    article_num += 1
    apercu += f"Article {article_num} – GARANTIES\n"
    article_num += 1
    apercu += f"Article {article_num} – RÉSILIATION\n"
    article_num += 1
    apercu += f"Article {article_num} – LOI APPLICABLE ET JURIDICTION COMPÉTENTE\n\n"
    
    apercu += "Fait à ________________, le ________________\n\n"
    
    if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
        apercu += "L'Auteur et Modèle                                     Le Cessionnaire"
    elif "Auteur (droits d'auteur)" in contract_type:
        apercu += "L'Auteur                                                   Le Cessionnaire"
    else:
        apercu += "Le Modèle                                                Le Cessionnaire"
    
    return apercu
