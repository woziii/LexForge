"""
Templates des différentes sections de contrats.
Ce module contient tous les textes de base pour les différentes sections des contrats.
"""

from config import TELLERS_INFO, DEFAULT_DURATION, DEFAULT_RENEWAL, DEFAULT_TERRITORY


class ContractTemplates:
    """Classe contenant tous les templates pour la génération des contrats."""
    
    @staticmethod
    def get_title(contract_type):
        """
        Retourne le titre du contrat en fonction du type.
        
        Args:
            contract_type (list): Liste des types de contrats sélectionnés
            
        Returns:
            str: Titre du contrat
        """
        if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
            return "CONTRAT DE CESSION DE DROITS D'AUTEUR ET DE DROITS À L'IMAGE"
        elif "Auteur (droits d'auteur)" in contract_type:
            return "CONTRAT DE CESSION DE DROITS D'AUTEUR"
        else:
            return "CONTRAT DE CESSION DE DROITS À L'IMAGE"
    
    @staticmethod
    def get_preamble_text(contract_type, author_type, author_info):
        """
        Retourne le texte du préambule du contrat.
        
        Args:
            contract_type (list): Liste des types de contrats sélectionnés
            author_type (str): Type d'auteur ("Personne physique" ou "Personne morale")
            author_info (dict): Informations sur l'auteur
            
        Returns:
            str: Texte du préambule
        """
        # Partie commune à tous les contrats
        preamble = "ENTRE LES SOUSSIGNÉS :\n\n"
        
        # Informations sur l'auteur/modèle
        if author_type == "Personne physique":
            gentille = author_info.get("gentille", "M.")
            nom = author_info.get("nom", "")
            prenom = author_info.get("prenom", "")
            date_naissance = author_info.get("date_naissance", "")
            nationalite = author_info.get("nationalite", "")
            adresse = author_info.get("adresse", "")
            contact = author_info.get("contact", "")
            
            preamble += f"{gentille} {prenom} {nom}"
            if date_naissance:
                preamble += f", né(e) le {date_naissance}"
            if nationalite:
                preamble += f", de nationalité {nationalite}"
            preamble += f", domicilié(e) au {adresse}"
            if contact:
                preamble += f", joignable à {contact}"
        else:
            # Personne morale
            nom_societe = author_info.get("nom_societe", "")
            statut = author_info.get("statut", "")
            rcs = author_info.get("rcs", "")
            siege = author_info.get("siege", "")
            contact = author_info.get("contact", "")
            
            preamble += f"La société {nom_societe}, {statut}, immatriculée sous le numéro {rcs}, dont le siège social est situé {siege}"
            if contact:
                preamble += f", joignable à {contact}"
        
        # Dénomination en fonction du type de contrat
        if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
            preamble += ", ci-après dénommé(e) \"l'Auteur et le Modèle\"\n\n"
        elif "Auteur (droits d'auteur)" in contract_type:
            preamble += ", ci-après dénommé(e) \"l'Auteur\"\n\n"
        else:
            preamble += ", ci-après dénommé(e) \"le Modèle\"\n\n"
        
        # Informations sur Tellers (bénéficiaire)
        preamble += f"{TELLERS_INFO['nom']}, {TELLERS_INFO['forme_juridique']} au capital de {TELLERS_INFO['capital']}, "
        preamble += f"immatriculée sous le numéro {TELLERS_INFO['rcs']}, et dont le siège social est situé au : "
        preamble += f"{TELLERS_INFO['siege']}, ci-après dénommée \"le Cessionnaire\"\n\n"
        
        # Introduction commune
        preamble += "IL A ÉTÉ CONVENU CE QUI SUIT :\n\n"
        
        return preamble
    
    @staticmethod
    def get_object_clause(contract_type, work_description, image_description):
        """
        Retourne la clause d'objet du contrat.
        
        Args:
            contract_type (list): Liste des types de contrats sélectionnés
            work_description (str): Description de l'œuvre
            image_description (str): Description de l'image
            
        Returns:
            str: Clause d'objet
        """
        object_clause = "Article 1 – OBJET\n\n"
        
        if "Auteur (droits d'auteur)" in contract_type:
            object_clause += f"L'Auteur déclare être le créateur et titulaire exclusif des droits d'auteur sur l'œuvre suivante : {work_description}. "
        
        if "Image (droit à l'image)" in contract_type:
            object_clause += f"Le Modèle autorise l'utilisation et l'exploitation de son image telle qu'elle apparaît dans les photographies/vidéos suivantes : {image_description}. "
        
        object_clause += "\nPar le présent contrat, "
        
        if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
            object_clause += "l'Auteur cède au Cessionnaire certains droits sur son œuvre, et le Modèle autorise l'exploitation de son image, dans les conditions définies ci-après."
        elif "Auteur (droits d'auteur)" in contract_type:
            object_clause += "l'Auteur cède au Cessionnaire certains droits sur son œuvre dans les conditions définies ci-après."
        else:
            object_clause += "le Modèle autorise l'exploitation de son image dans les conditions définies ci-après."
        
        return object_clause
    
    @staticmethod
    def get_author_rights_clause(is_free, is_exclusive, additional_rights):
        """
        Retourne la clause des droits cédés pour le droit d'auteur.
        
        Args:
            is_free (bool): True si la cession est gratuite, False sinon
            is_exclusive (bool): True si la cession est exclusive, False sinon
            additional_rights (list): Liste des droits supplémentaires sélectionnés
            
        Returns:
            str: Clause des droits cédés
        """
        rights_clause = "Article 2 – ÉTENDUE DES DROITS CÉDÉS\n\n"
        
        # Texte de base pour tous les contrats de droits d'auteur
        rights_clause += "L'Auteur cède au Cessionnaire, "
        
        if is_exclusive:
            rights_clause += "à titre exclusif, "
        else:
            rights_clause += "à titre non exclusif, "
        
        if is_free:
            rights_clause += f"gratuitement et pour la durée précisée à l'article 3, les droits patrimoniaux suivants :\n\n"
            
            # Droits limités pour cession gratuite
            rights_clause += "- Le droit de reproduction : l'Auteur autorise le Cessionnaire à reproduire ou faire reproduire l'œuvre "
            rights_clause += "par tous procédés techniques connus ou inconnus à ce jour, sur tous supports et en tous formats.\n\n"
            
            rights_clause += "- Le droit de représentation : l'Auteur autorise le Cessionnaire à communiquer l'œuvre au public "
            rights_clause += "par tous procédés connus ou inconnus à ce jour, notamment par diffusion en ligne sur Internet, "
            rights_clause += "présentation publique, projection, ou tout autre moyen."
        else:
            rights_clause += f"pour la durée précisée à l'article 3 et moyennant la rémunération précisée à l'article approprié, les droits patrimoniaux suivants :\n\n"
            
            # Droits de base (toujours présents)
            rights_clause += "- Le droit de reproduction : l'Auteur autorise le Cessionnaire à reproduire ou faire reproduire l'œuvre "
            rights_clause += "par tous procédés techniques connus ou inconnus à ce jour, sur tous supports et en tous formats.\n\n"
            
            rights_clause += "- Le droit de représentation : l'Auteur autorise le Cessionnaire à communiquer l'œuvre au public "
            rights_clause += "par tous procédés connus ou inconnus à ce jour, notamment par diffusion en ligne sur Internet, "
            rights_clause += "présentation publique, projection, ou tout autre moyen.\n\n"
            
            # Droits supplémentaires pour les cessions onéreuses
            if "distribution" in additional_rights:
                rights_clause += "- Le droit de distribution : l'Auteur autorise le Cessionnaire à distribuer l'original de l'œuvre "
                rights_clause += "ou ses copies au public par la vente ou tout autre transfert de propriété.\n\n"
            
            if "usage" in additional_rights:
                rights_clause += "- Le droit d'usage : l'Auteur autorise le Cessionnaire à utiliser l'œuvre pour les besoins "
                rights_clause += "propres du Cessionnaire ou de ses clients, dans un cadre correspondant à l'objet du présent contrat.\n\n"
            
            if "adaptation" in additional_rights:
                rights_clause += "- Le droit d'adaptation : l'Auteur autorise le Cessionnaire à modifier, transformer, arranger, "
                rights_clause += "traduire l'œuvre ou à l'incorporer à d'autres œuvres, dans le respect du droit moral de l'Auteur.\n\n"
            
            if "pret" in additional_rights:
                rights_clause += "- Le droit de prêt : l'Auteur autorise le Cessionnaire à mettre l'œuvre à disposition pour un "
                rights_clause += "usage déterminé et pour une durée limitée, sans contrepartie financière directe.\n\n"
            
            if "location" in additional_rights:
                rights_clause += "- Le droit de location : l'Auteur autorise le Cessionnaire à mettre à disposition l'œuvre pour "
                rights_clause += "un usage temporaire et en échange d'une contrepartie économique.\n\n"
            
            if "suite" in additional_rights:
                rights_clause += "- Le droit de suite (pour œuvres graphiques et plastiques uniquement) : l'Auteur et le Cessionnaire "
                rights_clause += "reconnaissent l'existence du droit de suite permettant à l'auteur de percevoir un pourcentage sur le "
                rights_clause += "produit de toute revente de l'œuvre, conformément aux dispositions légales en vigueur.\n\n"
        
        # Clause d'exclusivité ou non-exclusivité
        if is_exclusive:
            rights_clause += "Pendant la durée de la présente cession, l'Auteur s'engage à ne pas céder les mêmes droits à des tiers "
            rights_clause += "et à ne pas exploiter lui-même l'œuvre selon les modalités cédées au Cessionnaire. Cette exclusivité "
            rights_clause += "constitue un élément substantiel du présent contrat, sans lequel le Cessionnaire n'aurait pas contracté."
        else:
            rights_clause += "La présente cession étant non exclusive, l'Auteur conserve le droit d'exploiter l'œuvre et de céder "
            rights_clause += "les mêmes droits à des tiers, sous réserve de ne pas nuire à l'exploitation des droits cédés au Cessionnaire."
        
        return rights_clause
    
    @staticmethod
    def get_image_rights_clause(is_free, is_exclusive):
        """
        Retourne la clause des droits cédés pour le droit à l'image.
        
        Args:
            is_free (bool): True si la cession est gratuite, False sinon
            is_exclusive (bool): True si la cession est exclusive, False sinon
            
        Returns:
            str: Clause des droits à l'image
        """
        image_clause = "Article 2 – AUTORISATION D'EXPLOITATION DE L'IMAGE\n\n"
        
        image_clause += "Le Modèle autorise expressément le Cessionnaire à fixer, reproduire et communiquer au public son image telle que décrite à l'article 1. "
        image_clause += "Cette autorisation comprend le droit de reproduire et de représenter l'image sur tous supports et par tous moyens, connus ou inconnus à ce jour. "
        image_clause += "Cette autorisation est consentie "
        
        if is_exclusive:
            image_clause += "à titre exclusif, "
        else:
            image_clause += "à titre non exclusif, "
        
        if is_free:
            image_clause += "gratuitement, "
        else:
            image_clause += "moyennant la rémunération précisée à l'article approprié, "
        
        image_clause += f"pour la durée et sur le territoire mentionnés ci-après.\n\n"
        
        # Restrictions d'utilisation pour le droit à l'image
        image_clause += "Le Cessionnaire s'engage expressément à ne pas porter atteinte à la dignité, à l'honneur ou à la réputation du Modèle. "
        image_clause += "Les images ne pourront pas être utilisées dans un contexte diffamatoire, pornographique, ou contraire aux bonnes mœurs. "
        image_clause += "Les parties s'engagent mutuellement à ne pas tenir de propos dénigrants l'une envers l'autre.\n\n"
        
        # Clause d'exclusivité pour le droit à l'image
        if is_exclusive:
            image_clause += "Le Modèle s'engage à ne pas autoriser l'exploitation de son image, telle que décrite à l'article 1, "
            image_clause += "à des tiers pendant la durée du présent contrat. Cette exclusivité constitue un élément substantiel du "
            image_clause += "présent contrat, sans lequel le Cessionnaire n'aurait pas contracté."
        else:
            image_clause += "La présente autorisation étant non exclusive, le Modèle conserve le droit d'autoriser l'exploitation "
            image_clause += "de son image à des tiers, sous réserve de ne pas nuire à l'exploitation des droits autorisés au Cessionnaire."
        
        return image_clause
    
    @staticmethod
    def get_duration_territory_clause(article_num):
        """
        Retourne la clause de durée et territoire.
        
        Args:
            article_num (int): Numéro de l'article
            
        Returns:
            str: Clause de durée et territoire
        """
        duration_clause = f"Article {article_num} – DURÉE ET TERRITOIRE\n\n"
        
        duration_clause += f"La présente cession est consentie pour une durée de {DEFAULT_DURATION} à compter de la date de signature du présent contrat. "
        duration_clause += f"Elle se renouvellera automatiquement par {DEFAULT_RENEWAL}, "
        duration_clause += "sauf dénonciation par l'une des parties par lettre recommandée avec accusé de réception au moins trois (3) mois avant l'expiration de la période en cours.\n\n"
        duration_clause += f"La cession est consentie pour le {DEFAULT_TERRITORY}, compte tenu de la nature numérique des services fournis par le Cessionnaire, "
        duration_clause += "susceptibles d'être accessibles à l'échelle mondiale."
        
        return duration_clause
    
    @staticmethod
    def get_supports_clause(article_num, supports):
        """
        Retourne la clause des supports d'exploitation.
        
        Args:
            article_num (int): Numéro de l'article
            supports (list): Liste des supports sélectionnés
            
        Returns:
            str: Clause des supports
        """
        supports_clause = f"Article {article_num} – SUPPORTS D'EXPLOITATION\n\n"
        
        # Formatage de la liste des supports
        supports_str = ", ".join(supports)
        
        supports_clause += f"Le Cessionnaire est autorisé à exploiter l'œuvre et/ou l'image sur les supports suivants : {supports_str}.\n\n"
        supports_clause += "Cette liste est limitative et le Cessionnaire s'engage à ne pas utiliser l'œuvre et/ou l'image sur d'autres supports "
        supports_clause += "sans l'autorisation préalable et écrite du Cédant."
        
        return supports_clause
    
    @staticmethod
    def get_remuneration_clause(article_num, is_free, remuneration):
        """
        Retourne la clause de rémunération.
        
        Args:
            article_num (int): Numéro de l'article
            is_free (bool): True si la cession est gratuite, False sinon
            remuneration (str): Modalités de rémunération
            
        Returns:
            str: Clause de rémunération
        """
        remuneration_clause = f"Article {article_num} – RÉMUNÉRATION\n\n"
        
        if is_free:
            remuneration_clause += "La présente cession est consentie à titre gratuit. "
            remuneration_clause += "Aucune rémunération n'est due par le Cessionnaire. "
            remuneration_clause += "Le Cédant déclare être pleinement informé de la portée de cette gratuité et y consentir expressément."
        else:
            remuneration_clause += f"En contrepartie de la présente cession, le Cessionnaire versera au Cédant la rémunération suivante : {remuneration}.\n\n"
            remuneration_clause += "Cette rémunération inclut tout montant dû au titre de l'ensemble des droits cédés, tels que définis dans le présent contrat. "
            remuneration_clause += "Le Cédant reconnaît que cette rémunération est conforme aux usages de la profession et proportionnée à l'exploitation prévue de l'œuvre."
        
        return remuneration_clause
    
    @staticmethod
    def get_warranties_clause(article_num, contract_type):
        """
        Retourne la clause de garanties.
        
        Args:
            article_num (int): Numéro de l'article
            contract_type (list): Liste des types de contrats sélectionnés
            
        Returns:
            str: Clause de garanties
        """
        warranties_clause = f"Article {article_num} – GARANTIES\n\n"
        
        if "Auteur (droits d'auteur)" in contract_type:
            warranties_clause += "L'Auteur garantit au Cessionnaire qu'il est bien titulaire des droits cédés et que l'œuvre n'enfreint pas les droits de tiers. "
            warranties_clause += "L'Auteur garantit notamment que l'œuvre est originale et qu'il détient l'intégralité des droits de propriété intellectuelle sur celle-ci. "
            warranties_clause += "Il garantit le Cessionnaire contre toute revendication, recours ou action que pourrait former toute personne physique ou morale "
            warranties_clause += "estimant avoir des droits sur l'œuvre ou sur tout élément de celle-ci.\n\n"
        
        if "Image (droit à l'image)" in contract_type:
            warranties_clause += "Le Modèle garantit qu'il est libre de consentir à la présente autorisation et que son image n'est pas liée "
            warranties_clause += "à d'autres engagements exclusifs incompatibles avec le présent contrat. "
            warranties_clause += "Le Modèle garantit le Cessionnaire contre tout recours ou action que pourraient former des tiers à cet égard.\n\n"
        
        warranties_clause += "Le Cessionnaire s'engage à mentionner le nom de l'Auteur lors de toute exploitation de l'œuvre, "
        warranties_clause += "sauf lorsque cela est techniquement impossible ou inapproprié compte tenu du support d'exploitation."
        
        return warranties_clause
    
    @staticmethod
    def get_termination_clause(article_num):
        """
        Retourne la clause de résiliation.
        
        Args:
            article_num (int): Numéro de l'article
            
        Returns:
            str: Clause de résiliation
        """
        termination_clause = f"Article {article_num} – RÉSILIATION\n\n"
        
        termination_clause += "Le présent contrat pourra être résilié de plein droit par l'une des parties en cas d'inexécution "
        termination_clause += "par l'autre partie de l'une de ses obligations. "
        termination_clause += "Cette résiliation ne deviendra effective que trois mois après l'envoi par la partie plaignante "
        termination_clause += "d'une lettre recommandée avec accusé de réception, exposant les motifs de la plainte, "
        termination_clause += "à moins que, dans ce délai, la partie défaillante n'ait satisfait à ses obligations ou "
        termination_clause += "n'ait apporté la preuve d'un empêchement consécutif à un cas de force majeure.\n\n"
        
        termination_clause += "L'exercice de cette faculté de résiliation ne dispense pas la partie défaillante de remplir "
        termination_clause += "les obligations contractées jusqu'à la date de prise d'effet de la résiliation et ce, "
        termination_clause += "sous réserve des dommages éventuellement subis par la partie plaignante du fait de la résiliation anticipée du contrat."
        
        return termination_clause
    
    @staticmethod
    def get_applicable_law_clause(article_num):
        """
        Retourne la clause de loi applicable.
        
        Args:
            article_num (int): Numéro de l'article
            
        Returns:
            str: Clause de loi applicable
        """
        law_clause = f"Article {article_num} – LOI APPLICABLE ET JURIDICTION COMPÉTENTE\n\n"
        
        law_clause += "Le présent contrat est soumis à la loi française.\n\n"
        law_clause += "En cas de litige sur l'interprétation ou l'exécution du présent contrat, les parties s'efforceront de résoudre leur différend à l'amiable. "
        law_clause += "À défaut d'accord amiable dans un délai de trente (30) jours à compter de la notification du différend par l'une des parties à l'autre, "
        law_clause += "tout litige sera soumis aux tribunaux compétents de Lyon, auxquels il est fait expressément attribution de compétence, "
        law_clause += "y compris en cas de référé, d'appel en garantie ou de pluralité de défendeurs."
        
        return law_clause
    
    @staticmethod
    def get_signatures_template(contract_type):
        """
        Retourne le template des signatures.
        
        Args:
            contract_type (list): Liste des types de contrats sélectionnés
            
        Returns:
            str: Template des signatures
        """
        signatures = "\n\nFait à ________________, le ________________\n\n"
        
        # Adapter la signature en fonction du type de contrat
        if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
            signatures += "L'Auteur et Modèle                                     Le Cessionnaire"
        elif "Auteur (droits d'auteur)" in contract_type:
            signatures += "L'Auteur                                                   Le Cessionnaire"
        else:
            signatures += "Le Modèle                                                Le Cessionnaire"
        
        signatures += "\n\n(Signature précédée de la mention « Lu et approuvé »)"
        
        return signatures
