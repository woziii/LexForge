"""
Module pour la prévisualisation des contrats avant génération du PDF.
Version améliorée avec un formatage plus clair et une meilleure organisation.
Version corrigée pour l'encodage des caractères accentués et UTF-8.
"""
from contract_templates import ContractTemplates
from utils import ensure_default_supports


def preview_contract(contract_type, is_free, author_type, author_info, 
                   work_description, image_description, supports, 
                   additional_rights, remuneration, is_exclusive):
    """
    Génère un aperçu du contrat sous forme de texte.
    Version améliorée pour une meilleure lisibilité et encodage correct.
    
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
    
    # Ajouter le préambule de façon plus claire
    apercu += "ENTRE LES SOUSSIGNÉS :\n\n"
    
    # Informations sur l'auteur/modèle
    if author_type == "Personne physique":
        gentille = author_info.get("gentille", "M.")
        nom = author_info.get("nom", "")
        prenom = author_info.get("prenom", "")
        date_naissance = author_info.get("date_naissance", "")
        nationalite = author_info.get("nationalite", "")
        adresse = author_info.get("adresse", "")
        contact = author_info.get("contact", "")
        
        apercu += f"{gentille} {prenom} {nom}"
        if date_naissance:
            apercu += f", né(e) le {date_naissance}"
        if nationalite:
            apercu += f", de nationalité {nationalite}"
        apercu += f", domicilié(e) au {adresse}"
        if contact:
            apercu += f", joignable à {contact}"
    else:
        # Personne morale
        nom_societe = author_info.get("nom_societe", "")
        statut = author_info.get("statut", "")
        rcs = author_info.get("rcs", "")
        siege = author_info.get("siege", "")
        contact = author_info.get("contact", "")
        
        apercu += f"La société {nom_societe}, {statut}, immatriculée sous le numéro {rcs} au Registre du Commerce et des Sociétés, dont le siège social est situé {siege}"
        if contact:
            apercu += f", joignable à {contact}"
    
    # Dénomination de l'auteur
    if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
        apercu += ", ci-après dénommé(e) \"l'Auteur et le Modèle\",\n\n"
    elif "Auteur (droits d'auteur)" in contract_type:
        apercu += ", ci-après dénommé(e) \"l'Auteur\",\n\n"
    else:
        apercu += ", ci-après dénommé(e) \"le Modèle\",\n\n"
    
    # Informations sur Tellers (bénéficiaire)
    apercu += "Tellers, société par actions simplifiée unipersonnelle au capital de 1000 €, "
    apercu += "immatriculée sous le numéro 932 553 266 R.C.S. Lyon, et dont le siège social est situé au : "
    apercu += "12 RUE DE LA PART-DIEU, 69003 LYON, représentée par son Président en exercice dûment habilité à l'effet des présentes, "
    apercu += "ci-après dénommée \"le Cessionnaire\",\n\n"
    
    # Introduction
    apercu += "Ci-après dénommées ensemble \"les Parties\" ou individuellement \"la Partie\",\n\n"
    apercu += "CECI EXPOSÉ, IL A ÉTÉ CONVENU CE QUI SUIT :\n\n"
    
    # ARTICLE 1 - OBJET DU CONTRAT
    apercu += "ARTICLE 1 – OBJET DU CONTRAT\n\n"
    
    if "Auteur (droits d'auteur)" in contract_type:
        apercu += "1.1 Œuvre concernée\n\n"
        apercu += f"L'Auteur déclare être le créateur et titulaire exclusif des droits d'auteur sur l'œuvre suivante :\n\n"
        apercu += f"{work_description}\n\n"
    
    if "Image (droit à l'image)" in contract_type:
        apercu += "1.2 Images concernées\n\n"
        apercu += f"Le Modèle autorise l'utilisation de son image telle qu'elle apparaît dans : \n\n"
        apercu += f"{image_description}\n\n"
    
    # ARTICLE 2 - DROITS CÉDÉS
    apercu += "ARTICLE 2 – ÉTENDUE DES DROITS CÉDÉS\n\n"
    
    apercu += "2.1 Nature de la cession\n\n"
    apercu += "L'Auteur cède au Cessionnaire, "
    
    if is_exclusive:
        apercu += "à titre exclusif, "
    else:
        apercu += "à titre non exclusif, "
    
    if is_free:
        apercu += "gratuitement et pour la durée précisée à l'article 4, les droits patrimoniaux suivants :\n\n"
    else:
        apercu += "pour la durée précisée à l'article 4 et moyennant rémunération, les droits suivants :\n\n"
    
    apercu += "2.2 Droits patrimoniaux cédés\n\n"
    apercu += "- Droit de reproduction\n"
    apercu += "- Droit de représentation\n"
    
    if not is_free and additional_rights:
        apercu += "\nDroits supplémentaires inclus :\n"
        for right in additional_rights:
            short_name = right.split(" - ")[0] if " - " in right else right
            apercu += f"- {short_name}\n"
    
    apercu += "\n"
    
    # Article sur l'image si applicable
    if "Image (droit à l'image)" in contract_type:
        article_num = 3
        apercu += f"ARTICLE {article_num} – AUTORISATION D'EXPLOITATION DE L'IMAGE\n\n"
        
        apercu += "Le Modèle autorise expressément le Cessionnaire à exploiter son image "
        
        if is_exclusive:
            apercu += "à titre exclusif"
        else:
            apercu += "à titre non exclusif"
        
        if is_free:
            apercu += " et gratuit"
        
        apercu += " selon les modalités détaillées dans le contrat complet.\n\n"
        
        article_num += 1
    else:
        article_num = 3
    
    # Article DURÉE ET TERRITOIRE
    apercu += f"ARTICLE {article_num} – DURÉE ET TERRITOIRE\n\n"
    apercu += "4.1 Durée\n"
    apercu += "La cession est consentie pour une durée d'un (1) an, renouvelable par tacite reconduction.\n\n"
    
    apercu += "4.2 Territoire\n"
    apercu += "La cession est consentie pour le monde entier.\n\n"
    
    article_num += 1
    
    # Article SUPPORTS D'EXPLOITATION
    apercu += f"ARTICLE {article_num} – SUPPORTS D'EXPLOITATION\n\n"
    apercu += "5.1 Supports autorisés\n"
    apercu += "Les supports d'exploitation autorisés sont :\n"
    
    for support in final_supports:
        apercu += f"- {support}\n"
    
    apercu += "\n"
    article_num += 1
    
    # Article RÉMUNÉRATION
    apercu += f"ARTICLE {article_num} – RÉMUNÉRATION\n\n"
    
    if is_free:
        apercu += "La présente cession est consentie à titre gratuit, sans contrepartie financière.\n\n"
    else:
        apercu += f"En contrepartie de la présente cession, le Cessionnaire versera au Cédant : \n{remuneration}\n\n"
    
    article_num += 1
    
    # Résumé des articles restants
    apercu += f"ARTICLE {article_num} – GARANTIES ET RESPONSABILITÉS\n\n"
    article_num += 1
    apercu += f"ARTICLE {article_num} – RÉSILIATION\n\n"
    article_num += 1
    apercu += f"ARTICLE {article_num} – DISPOSITIONS DIVERSES\n\n"
    article_num += 1
    apercu += f"ARTICLE {article_num} – LOI APPLICABLE ET JURIDICTION COMPÉTENTE\n\n"
    
    # Signature
    apercu += "Fait à ________________, le ________________\n\n"
    apercu += "En deux exemplaires originaux.\n\n"
    
    if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
        apercu += "Pour l'Auteur et Modèle :                                Pour le Cessionnaire :"
    elif "Auteur (droits d'auteur)" in contract_type:
        apercu += "Pour l'Auteur :                                          Pour le Cessionnaire :"
    else:
        apercu += "Pour le Modèle :                                         Pour le Cessionnaire :"
    
    return apercu