"""
Module de génération de texte pour les contrats.
Fournit des fonctions pour générer le texte complet d'un contrat.
"""

def generate_contract_text(contract_data):
    """
    Génère le texte complet d'un contrat basé sur les données fournies.
    
    Args:
        contract_data (dict): Données du contrat incluant le type, les informations sur l'auteur, etc.
        
    Returns:
        str: Texte du contrat généré
    """
    # Extraire les données du contrat
    contract_type = contract_data.get('type_contrat', [])
    is_free = contract_data.get('type_cession', 'Gratuite') == 'Gratuite'
    author_type = contract_data.get('auteur_type', 'Personne physique')
    author_info = contract_data.get('auteur_info', {})
    work_description = contract_data.get('description_oeuvre', '')
    image_description = contract_data.get('description_image', '')
    supports = contract_data.get('supports', [])
    additional_rights = contract_data.get('droits_cedes', [])
    remuneration = contract_data.get('remuneration', '')
    is_exclusive = contract_data.get('exclusivite', False)
    cessionnaire_info = contract_data.get('cessionnaire_info', {})
    
    # Construction du texte du contrat selon le type
    if 'Auteur (droits d\'auteur)' in contract_type:
        return _generate_author_contract(
            is_free, author_type, author_info, work_description, 
            supports, additional_rights, remuneration, is_exclusive, cessionnaire_info
        )
    elif 'Image (droit à l\'image)' in contract_type:
        return _generate_image_contract(
            is_free, author_type, author_info, image_description, 
            supports, additional_rights, remuneration, is_exclusive, cessionnaire_info
        )
    else:
        # Contrat combiné (droits d'auteur + image)
        return _generate_combined_contract(
            is_free, author_type, author_info, work_description, image_description,
            supports, additional_rights, remuneration, is_exclusive, cessionnaire_info
        )

def _generate_author_contract(is_free, author_type, author_info, work_description, 
                              supports, additional_rights, remuneration, is_exclusive, cessionnaire_info):
    """Génère un contrat de cession de droits d'auteur."""
    
    # Formatage des informations de l'auteur
    author_display_name = _format_author_name(author_type, author_info)
    author_details = _format_author_details(author_type, author_info)
    
    # Formatage des informations du cessionnaire
    cessionnaire_display = _format_cessionnaire(cessionnaire_info)
    
    # En-tête du contrat
    header = f"CONTRAT DE CESSION DE DROITS D'AUTEUR\n\n"
    
    # Parties du contrat
    parties = (
        f"ENTRE LES SOUSSIGNÉ(E)S :\n\n"
        f"{author_display_name}, {author_details}\n\n"
        f"Ci-après dénommé(e) « L'AUTEUR »,\n\n"
        f"ET\n\n"
        f"{cessionnaire_display}\n\n"
        f"Ci-après dénommé « LE CESSIONNAIRE »,\n\n"
        f"Il a été convenu ce qui suit :\n\n"
    )
    
    # Préambule
    preamble = (
        f"PRÉAMBULE :\n\n"
        f"L'AUTEUR a créé {work_description}, ci-après dénommée « l'ŒUVRE ».\n\n"
        f"Le CESSIONNAIRE souhaite obtenir certains droits d'exploitation sur cette ŒUVRE.\n\n"
        f"Les parties se sont rapprochées pour en fixer les modalités.\n\n"
    )
    
    # Article 1 : Objet du contrat
    article1 = (
        f"ARTICLE 1 - OBJET DU CONTRAT\n\n"
        f"L'AUTEUR cède au CESSIONNAIRE, selon les modalités et dans les limites ci-après définies, "
        f"les droits d'auteur dont il est titulaire sur l'ŒUVRE.\n\n"
    )
    
    # Article 2 : Étendue de la cession
    exclusivity = "à titre exclusif" if is_exclusive else "à titre non exclusif"
    article2 = (
        f"ARTICLE 2 - ÉTENDUE DE LA CESSION\n\n"
        f"L'AUTEUR cède au CESSIONNAIRE {exclusivity} les droits suivants :\n\n"
        f"- Droit de reproduction : le droit de reproduire ou faire reproduire tout ou partie de l'ŒUVRE "
        f"sur tout support connu ou inconnu à ce jour, notamment :\n"
    )
    
    # Supports
    supports_text = ""
    for support in supports:
        supports_text += f"   • {support}\n"
    
    article2 += supports_text + "\n"
    
    # Autres droits
    if additional_rights and not is_free:
        article2 += "- Droits additionnels :\n"
        for right in additional_rights:
            article2 += f"   • {right}\n"
        article2 += "\n"
    
    # Article 3 : Rémunération
    article3 = "ARTICLE 3 - RÉMUNÉRATION\n\n"
    if is_free:
        article3 += "La présente cession est consentie à titre gratuit.\n\n"
    else:
        article3 += f"En contrepartie de la présente cession, le CESSIONNAIRE versera à l'AUTEUR la somme de {remuneration}.\n\n"
    
    # Article 4 : Durée et territoire
    article4 = (
        f"ARTICLE 4 - DURÉE ET TERRITOIRE\n\n"
        f"La présente cession est consentie pour toute la durée légale de protection des droits d'auteur "
        f"et pour le monde entier.\n\n"
    )
    
    # Article 5 : Garanties
    article5 = (
        f"ARTICLE 5 - GARANTIES\n\n"
        f"L'AUTEUR garantit au CESSIONNAIRE la jouissance paisible des droits cédés contre tous troubles, "
        f"revendications et évictions quelconques.\n\n"
        f"L'AUTEUR garantit notamment qu'il est bien titulaire des droits cédés et que l'ŒUVRE ne contient "
        f"rien qui puisse tomber sous le coup des lois et règlements relatifs notamment à la contrefaçon, "
        f"la diffamation, le droit à l'image et la vie privée.\n\n"
    )
    
    # Article 6 : Droit moral
    article6 = (
        f"ARTICLE 6 - DROIT MORAL\n\n"
        f"Le CESSIONNAIRE s'engage à respecter le droit moral de l'AUTEUR sur son ŒUVRE, notamment en citant "
        f"systématiquement son nom lors de toute exploitation de l'ŒUVRE.\n\n"
    )
    
    # Assemblage du contrat complet
    contract_text = header + parties + preamble + article1 + article2 + article3 + article4 + article5 + article6
    
    # Article 7 : Loi applicable et juridiction
    article7 = (
        f"ARTICLE 7 - LOI APPLICABLE ET JURIDICTION\n\n"
        f"Le présent contrat est soumis à la loi française.\n"
        f"Tout litige relatif à son interprétation ou son exécution relèvera des tribunaux compétents.\n\n"
    )
    
    # Signatures
    signatures = (
        f"Fait à ____________, le ____________\n\n"
        f"En deux exemplaires originaux.\n\n\n"
        f"L'AUTEUR                                        LE CESSIONNAIRE\n"
        f"[Signature]                                    [Signature]"
    )
    
    # Contrat complet
    return contract_text + article7 + signatures

def _generate_image_contract(is_free, model_type, model_info, image_description, 
                             supports, additional_rights, remuneration, is_exclusive, cessionnaire_info):
    """Génère un contrat de cession de droits à l'image."""
    
    # Formatage des informations du modèle
    model_display_name = _format_author_name(model_type, model_info)
    model_details = _format_author_details(model_type, model_info)
    
    # Formatage des informations du cessionnaire
    cessionnaire_display = _format_cessionnaire(cessionnaire_info)
    
    # En-tête du contrat
    header = f"AUTORISATION D'EXPLOITATION DU DROIT À L'IMAGE\n\n"
    
    # Parties du contrat
    parties = (
        f"ENTRE LES SOUSSIGNÉ(E)S :\n\n"
        f"{model_display_name}, {model_details}\n\n"
        f"Ci-après dénommé(e) « LE MODÈLE »,\n\n"
        f"ET\n\n"
        f"{cessionnaire_display}\n\n"
        f"Ci-après dénommé « LE BÉNÉFICIAIRE »,\n\n"
        f"Il a été convenu ce qui suit :\n\n"
    )
    
    # Préambule
    preamble = (
        f"PRÉAMBULE :\n\n"
        f"Le MODÈLE a participé à une séance de prise de vue où a été capturé(e) {image_description}, "
        f"ci-après dénommée « l'IMAGE ».\n\n"
        f"Le BÉNÉFICIAIRE souhaite obtenir l'autorisation d'exploiter cette IMAGE.\n\n"
        f"Les parties se sont rapprochées pour en fixer les modalités.\n\n"
    )
    
    # Article 1 : Objet du contrat
    article1 = (
        f"ARTICLE 1 - OBJET DE L'AUTORISATION\n\n"
        f"Le MODÈLE autorise le BÉNÉFICIAIRE à fixer, reproduire et communiquer au public son image telle que capturée "
        f"dans l'IMAGE, selon les modalités et dans les limites ci-après définies.\n\n"
    )
    
    # Article 2 : Étendue de l'autorisation
    exclusivity = "à titre exclusif" if is_exclusive else "à titre non exclusif"
    article2 = (
        f"ARTICLE 2 - ÉTENDUE DE L'AUTORISATION\n\n"
        f"Le MODÈLE autorise le BÉNÉFICIAIRE {exclusivity} à exploiter son image sur tout support "
        f"connu ou inconnu à ce jour, notamment :\n"
    )
    
    # Supports
    supports_text = ""
    for support in supports:
        supports_text += f"   • {support}\n"
    
    article2 += supports_text + "\n"
    
    # Autres droits
    if additional_rights and not is_free:
        article2 += "- Utilisations additionnelles :\n"
        for right in additional_rights:
            article2 += f"   • {right}\n"
        article2 += "\n"
    
    # Article 3 : Rémunération
    article3 = "ARTICLE 3 - RÉMUNÉRATION\n\n"
    if is_free:
        article3 += "La présente autorisation est consentie à titre gratuit.\n\n"
    else:
        article3 += f"En contrepartie de la présente autorisation, le BÉNÉFICIAIRE versera au MODÈLE la somme de {remuneration}.\n\n"
    
    # Article 4 : Durée et territoire
    article4 = (
        f"ARTICLE 4 - DURÉE ET TERRITOIRE\n\n"
        f"La présente autorisation est consentie pour une durée de 5 ans à compter de la signature "
        f"du présent contrat et pour le monde entier.\n\n"
    )
    
    # Article 5 : Garanties et limitations
    article5 = (
        f"ARTICLE 5 - GARANTIES ET LIMITATIONS\n\n"
        f"Le BÉNÉFICIAIRE s'engage à ne pas utiliser l'IMAGE à des fins susceptibles de porter atteinte "
        f"à la dignité, à la réputation ou à la vie privée du MODÈLE.\n\n"
        f"Le BÉNÉFICIAIRE s'engage notamment à ne pas associer l'IMAGE à des contenus à caractère pornographique, "
        f"violent, discriminatoire ou diffamatoire.\n\n"
    )
    
    # Article 6 : Révocation
    article6 = (
        f"ARTICLE 6 - RÉVOCATION\n\n"
        f"Le MODÈLE pourra révoquer la présente autorisation par lettre recommandée avec accusé de réception, "
        f"pour l'avenir uniquement, sous réserve d'un préavis de trois mois et pour motif légitime.\n\n"
        f"En cas de révocation, le BÉNÉFICIAIRE cessera toute nouvelle exploitation de l'IMAGE mais pourra "
        f"continuer à exploiter les supports déjà réalisés.\n\n"
    )
    
    # Article 7 : Loi applicable et juridiction
    article7 = (
        f"ARTICLE 7 - LOI APPLICABLE ET JURIDICTION\n\n"
        f"Le présent contrat est soumis à la loi française.\n"
        f"Tout litige relatif à son interprétation ou son exécution relèvera des tribunaux compétents.\n\n"
    )
    
    # Signatures
    signatures = (
        f"Fait à ____________, le ____________\n\n"
        f"En deux exemplaires originaux.\n\n\n"
        f"LE MODÈLE                                       LE BÉNÉFICIAIRE\n"
        f"[Signature]                                    [Signature]"
    )
    
    # Contrat complet
    return header + parties + preamble + article1 + article2 + article3 + article4 + article5 + article6 + article7 + signatures

def _generate_combined_contract(is_free, person_type, person_info, work_description, image_description,
                             supports, additional_rights, remuneration, is_exclusive, cessionnaire_info):
    """Génère un contrat combiné (droits d'auteur + image)."""
    
    # Formatage des informations de la personne
    person_display_name = _format_author_name(person_type, person_info)
    person_details = _format_author_details(person_type, person_info)
    
    # Formatage des informations du cessionnaire
    cessionnaire_display = _format_cessionnaire(cessionnaire_info)
    
    # En-tête du contrat
    header = f"CONTRAT DE CESSION DE DROITS D'AUTEUR ET AUTORISATION D'EXPLOITATION DU DROIT À L'IMAGE\n\n"
    
    # Parties du contrat
    parties = (
        f"ENTRE LES SOUSSIGNÉ(E)S :\n\n"
        f"{person_display_name}, {person_details}\n\n"
        f"Ci-après dénommé(e) « LE CÉDANT »,\n\n"
        f"ET\n\n"
        f"{cessionnaire_display}\n\n"
        f"Ci-après dénommé « LE CESSIONNAIRE »,\n\n"
        f"Il a été convenu ce qui suit :\n\n"
    )
    
    # Préambule
    preamble = (
        f"PRÉAMBULE :\n\n"
        f"LE CÉDANT a créé {work_description}, ci-après dénommée « l'ŒUVRE ».\n\n"
        f"LE CÉDANT a également participé à une séance de prise de vue où a été capturé(e) {image_description}, "
        f"ci-après dénommée « l'IMAGE ».\n\n"
        f"LE CESSIONNAIRE souhaite obtenir certains droits d'exploitation sur cette ŒUVRE et cette IMAGE.\n\n"
        f"Les parties se sont rapprochées pour en fixer les modalités.\n\n"
    )
    
    # Article 1 : Objet du contrat
    article1 = (
        f"ARTICLE 1 - OBJET DU CONTRAT\n\n"
        f"LE CÉDANT cède au CESSIONNAIRE, selon les modalités et dans les limites ci-après définies, "
        f"les droits d'auteur dont il est titulaire sur l'ŒUVRE.\n\n"
        f"LE CÉDANT autorise également le CESSIONNAIRE à fixer, reproduire et communiquer au public son image "
        f"telle que capturée dans l'IMAGE, selon les modalités et dans les limites ci-après définies.\n\n"
    )
    
    # Article 2 : Étendue de la cession
    exclusivity = "à titre exclusif" if is_exclusive else "à titre non exclusif"
    article2 = (
        f"ARTICLE 2 - ÉTENDUE DE LA CESSION ET DE L'AUTORISATION\n\n"
        f"LE CÉDANT cède au CESSIONNAIRE {exclusivity} les droits suivants :\n\n"
        f"- Droit de reproduction : le droit de reproduire ou faire reproduire tout ou partie de l'ŒUVRE "
        f"et de l'IMAGE sur tout support connu ou inconnu à ce jour, notamment :\n"
    )
    
    # Supports
    supports_text = ""
    for support in supports:
        supports_text += f"   • {support}\n"
    
    article2 += supports_text + "\n"
    
    # Autres droits
    if additional_rights and not is_free:
        article2 += "- Droits additionnels :\n"
        for right in additional_rights:
            article2 += f"   • {right}\n"
        article2 += "\n"
    
    # Article 3 : Rémunération
    article3 = "ARTICLE 3 - RÉMUNÉRATION\n\n"
    if is_free:
        article3 += "La présente cession et autorisation sont consenties à titre gratuit.\n\n"
    else:
        article3 += f"En contrepartie de la présente cession et autorisation, le CESSIONNAIRE versera au CÉDANT la somme de {remuneration}.\n\n"
    
    # Article 4 : Durée et territoire
    article4 = (
        f"ARTICLE 4 - DURÉE ET TERRITOIRE\n\n"
        f"La présente cession des droits d'auteur est consentie pour toute la durée légale de protection des droits d'auteur.\n\n"
        f"L'autorisation d'exploitation du droit à l'image est consentie pour une durée de 5 ans à compter de la signature "
        f"du présent contrat.\n\n"
        f"Ces droits sont cédés pour le monde entier.\n\n"
    )
    
    # Article 5 : Garanties et limitations
    article5 = (
        f"ARTICLE 5 - GARANTIES ET LIMITATIONS\n\n"
        f"LE CÉDANT garantit au CESSIONNAIRE la jouissance paisible des droits cédés contre tous troubles, "
        f"revendications et évictions quelconques.\n\n"
        f"LE CÉDANT garantit notamment qu'il est bien titulaire des droits cédés et que l'ŒUVRE ne contient "
        f"rien qui puisse tomber sous le coup des lois et règlements relatifs notamment à la contrefaçon, "
        f"la diffamation, le droit à l'image et la vie privée.\n\n"
        f"LE CESSIONNAIRE s'engage à ne pas utiliser l'IMAGE à des fins susceptibles de porter atteinte "
        f"à la dignité, à la réputation ou à la vie privée du CÉDANT.\n\n"
    )
    
    # Article 6 : Droit moral et Révocation
    article6 = (
        f"ARTICLE 6 - DROIT MORAL ET RÉVOCATION\n\n"
        f"LE CESSIONNAIRE s'engage à respecter le droit moral du CÉDANT sur son ŒUVRE, notamment en citant "
        f"systématiquement son nom lors de toute exploitation de l'ŒUVRE.\n\n"
        f"Concernant l'exploitation de l'IMAGE, LE CÉDANT pourra révoquer son autorisation par lettre recommandée "
        f"avec accusé de réception, pour l'avenir uniquement, sous réserve d'un préavis de trois mois et pour motif légitime.\n\n"
        f"En cas de révocation, LE CESSIONNAIRE cessera toute nouvelle exploitation de l'IMAGE mais pourra "
        f"continuer à exploiter les supports déjà réalisés.\n\n"
    )
    
    # Article 7 : Loi applicable et juridiction
    article7 = (
        f"ARTICLE 7 - LOI APPLICABLE ET JURIDICTION\n\n"
        f"Le présent contrat est soumis à la loi française.\n"
        f"Tout litige relatif à son interprétation ou son exécution relèvera des tribunaux compétents.\n\n"
    )
    
    # Signatures
    signatures = (
        f"Fait à ____________, le ____________\n\n"
        f"En deux exemplaires originaux.\n\n\n"
        f"LE CÉDANT                                       LE CESSIONNAIRE\n"
        f"[Signature]                                    [Signature]"
    )
    
    # Contrat complet
    return header + parties + preamble + article1 + article2 + article3 + article4 + article5 + article6 + article7 + signatures

def _format_author_name(author_type, author_info):
    """Formate le nom de l'auteur selon son type."""
    if author_type == "Personne physique":
        civility = author_info.get('gentille', '')
        first_name = author_info.get('prenom', '')
        last_name = author_info.get('nom', '').upper()
        return f"{civility} {last_name} {first_name}".strip()
    else:  # Personne morale
        company_name = author_info.get('nom', '')
        return f"{company_name}".strip()

def _format_author_details(author_type, author_info):
    """Formate les détails de l'auteur selon son type."""
    if author_type == "Personne physique":
        nationality = author_info.get('nationalite', '')
        birthdate = author_info.get('date_naissance', '')
        birthplace = author_info.get('lieu_naissance', '')
        adresse = author_info.get('adresse', '')
        code_postal = author_info.get('code_postal', '')
        ville = author_info.get('ville', '')
        
        details = []
        
        # Date et lieu de naissance
        birth_info = ""
        if birthdate:
            birth_info = f"né(e) le {birthdate}"
            if birthplace:
                birth_info += f" à {birthplace}"
            details.append(birth_info)
        
        # Nationalité
        if nationality:
            details.append(f"de nationalité {nationality}")
        
        # Adresse complète
        adresse_complete = adresse
        if code_postal or ville:
            if adresse_complete:
                adresse_complete += ", "
            if code_postal:
                adresse_complete += f"{code_postal}"
            if ville:
                if code_postal:
                    adresse_complete += f" {ville}"
                else:
                    adresse_complete += ville
                    
        if adresse_complete:
            details.append(f"domicilié(e) au {adresse_complete}")
        
        return ", ".join(details)
    else:  # Personne morale
        legal_form = author_info.get('forme_juridique', '')
        capital = author_info.get('capital', '')
        siren = author_info.get('siren', '')
        if not siren:
            siren = author_info.get('rcs', '')
        rcs_ville = author_info.get('rcs_ville', '')
        adresse = author_info.get('adresse', '')
        code_postal = author_info.get('code_postal', '')
        ville = author_info.get('ville', '')
        representant_civilite = author_info.get('representant_civilite', 'M.')
        representant_nom = author_info.get('representant_nom', '').upper()
        representant_prenom = author_info.get('representant_prenom', '')
        qualite_representant = author_info.get('qualite_representant', '')
        
        details = []
        if legal_form:
            details.append(legal_form)
        
        if capital:
            details.append(f"au capital de {capital}")
        
        if siren:
            if rcs_ville:
                details.append(f"immatriculé sous le numéro {siren} R.C.S {rcs_ville}")
            else:
                details.append(f"immatriculé sous le numéro {siren}")
        
        # Adresse complète
        adresse_complete = adresse
        if code_postal or ville:
            if adresse_complete:
                adresse_complete += ", "
            if code_postal:
                adresse_complete += f"{code_postal}"
            if ville:
                if code_postal:
                    adresse_complete += f" {ville}"
                else:
                    adresse_complete += ville
                    
        if adresse_complete:
            details.append(f"dont le siège social est situé au {adresse_complete}")
        
        # Représentant légal
        if (representant_nom or representant_prenom) and qualite_representant:
            representant = f"{representant_civilite} {representant_nom} {representant_prenom}".strip()
            details.append(f"représentée par {representant}, en sa qualité de {qualite_representant}")
        
        return ", ".join(details)

def _format_cessionnaire(cessionnaire_info):
    """Formate les informations du cessionnaire."""
    
    # Pour une personne physique (détection basée sur la présence de 'prenom')
    if 'prenom' in cessionnaire_info:
        civilite = cessionnaire_info.get('gentille', 'M.')
        nom = cessionnaire_info.get('nom', '').upper()
        prenom = cessionnaire_info.get('prenom', '')
        date_naissance = cessionnaire_info.get('date_naissance', '')
        lieu_naissance = cessionnaire_info.get('lieu_naissance', '')
        nationalite = cessionnaire_info.get('nationalite', '')
        adresse = cessionnaire_info.get('adresse', '')
        code_postal = cessionnaire_info.get('code_postal', '')
        ville = cessionnaire_info.get('ville', '')
        
        result = f"{civilite} {nom} {prenom}"
        
        if date_naissance:
            result += f", né(e) le {date_naissance}"
            
        if lieu_naissance:
            result += f" à {lieu_naissance}"
            
        if nationalite:
            result += f" de nationalité {nationalite}"
            
        # Construire l'adresse complète
        adresse_complete = adresse
        if code_postal or ville:
            if adresse_complete:
                adresse_complete += ", "
            if code_postal:
                adresse_complete += f"{code_postal}"
            if ville:
                if code_postal:
                    adresse_complete += f" {ville}"
                else:
                    adresse_complete += ville
                    
        if adresse_complete:
            result += f", domicilié(e) au {adresse_complete}"
            
        return result.strip()
    
    # Pour une personne morale
    nom = cessionnaire_info.get('nom', '')
    forme_juridique = cessionnaire_info.get('forme_juridique', '')
    capital = cessionnaire_info.get('capital', '')
    siren = cessionnaire_info.get('siren', '')
    if not siren:
        siren = cessionnaire_info.get('rcs', '')
    
    adresse = cessionnaire_info.get('adresse', '')
    code_postal = cessionnaire_info.get('code_postal', '')
    ville = cessionnaire_info.get('ville', '')
    representant_civilite = cessionnaire_info.get('representant_civilite', 'M.')
    representant_nom = cessionnaire_info.get('representant_nom', '').upper()
    representant_prenom = cessionnaire_info.get('representant_prenom', '')
    qualite_representant = cessionnaire_info.get('qualite_representant', '')
    
    result = f"{nom}"
    
    if forme_juridique:
        result += f", {forme_juridique}"
    
    if capital:
        result += f" au capital de {capital}"
    
    if siren:
        # Ajouter la ville où est situé le RCS si disponible
        rcs_ville = cessionnaire_info.get('rcs_ville', ville)
        if rcs_ville:
            result += f", immatriculé sous le numéro {siren} R.C.S {rcs_ville}"
        else:
            result += f", immatriculé sous le numéro {siren}"
    
    # Construire l'adresse complète
    adresse_complete = adresse
    if code_postal or ville:
        if adresse_complete:
            adresse_complete += ", "
        if code_postal:
            adresse_complete += f"{code_postal}"
        if ville:
            if code_postal:
                adresse_complete += f" {ville}"
            else:
                adresse_complete += ville
    
    if adresse_complete:
        result += f", dont le siège social est situé au {adresse_complete}"
    
    # Ajouter les informations du représentant si disponibles
    if (representant_nom or representant_prenom) and qualite_representant:
        representant = f"{representant_civilite} {representant_nom} {representant_prenom}".strip()
        result += f", représentée par {representant}, en sa qualité de {qualite_representant}"
    
    return result 