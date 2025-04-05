"""
Templates des différentes sections de contrats.
Ce module contient tous les textes de base pour les différentes sections des contrats,
avec une attention particulière à la rigueur juridique et à l'exhaustivité.
"""

from config import TELLERS_INFO, DEFAULT_DURATION, DEFAULT_RENEWAL, DEFAULT_TERRITORY


class ContractTemplates:
    """Classe contenant tous les templates pour la génération des contrats professionnels."""
    
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
    def get_preamble_text(contract_type, author_type, author_info, cessionnaire_info=None):
        """
        Retourne le texte du préambule du contrat.
        
        Args:
            contract_type (list): Liste des types de contrats sélectionnés
            author_type (str): Type d'auteur ("Personne physique" ou "Personne morale")
            author_info (dict): Informations sur l'auteur
            cessionnaire_info (dict, optional): Informations sur le cessionnaire
            
        Returns:
            str: Texte du préambule
        """
        # Partie commune à tous les contrats
        preamble = "ENTRE LES SOUSSIGNÉS :\n\n"
        
        # Informations sur l'auteur/modèle
        if author_type == "Personne physique":
            gentille = author_info.get("gentille", "M.")
            nom = author_info.get("nom", "").upper()
            prenom = author_info.get("prenom", "")
            date_naissance = author_info.get("date_naissance", "")
            lieu_naissance = author_info.get("lieu_naissance", "")
            nationalite = author_info.get("nationalite", "")
            adresse = author_info.get("adresse", "")
            code_postal = author_info.get("code_postal", "")
            ville = author_info.get("ville", "")
            contact = author_info.get("contact", "")
            
            preamble += f"{gentille} {nom} {prenom}"
            
            if date_naissance:
                preamble += f", né(e) le {date_naissance}"
                if lieu_naissance:
                    preamble += f" à {lieu_naissance}"
                    
            if nationalite:
                preamble += f", de nationalité {nationalite}"
                
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
                preamble += f", domicilié(e) au {adresse_complete}"
                
            if contact:
                preamble += f", joignable à {contact}"
        else:
            # Personne morale
            nom = author_info.get("nom_societe", "") or author_info.get("nom", "")
            forme_juridique = author_info.get("statut", "") or author_info.get("forme_juridique", "")
            capital = author_info.get("capital", "")
            siren = author_info.get("siren", "")
            if not siren:
                siren = author_info.get("rcs", "")
            rcs_ville = author_info.get("rcs_ville", "")
            adresse = author_info.get("adresse", "") or author_info.get("siege", "")
            code_postal = author_info.get("code_postal", "")
            ville = author_info.get("ville", "")
            representant_civilite = author_info.get("representant_civilite", "M.")
            representant_nom = author_info.get("representant_nom", "").upper() or author_info.get("representant", "").upper()
            representant_prenom = author_info.get("representant_prenom", "")
            qualite_representant = author_info.get("qualite_representant", "")
            contact = author_info.get("contact", "")
            
            preamble += f"La société {nom}"
            
            if forme_juridique:
                preamble += f", {forme_juridique}"
                
            if capital:
                preamble += f", au capital de {capital}"
                
            if siren:
                if rcs_ville:
                    preamble += f", immatriculée sous le numéro {siren} R.C.S {rcs_ville}"
                else:
                    preamble += f", immatriculée sous le numéro {siren} au Registre du Commerce et des Sociétés"
            
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
                preamble += f", dont le siège social est situé au {adresse_complete}"
                
            # Ajouter les informations du représentant si disponibles
            if (representant_nom or representant_prenom) and qualite_representant:
                representant = f"{representant_civilite} {representant_nom} {representant_prenom}".strip()
                preamble += f", représentée par {representant}, en sa qualité de {qualite_representant}"
                
            if contact:
                preamble += f", joignable à {contact}"
        
        # Dénomination en fonction du type de contrat
        if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
            preamble += ", ci-après dénommé(e) \"l'Auteur et le Modèle\",\n\n"
        elif "Auteur (droits d'auteur)" in contract_type:
            preamble += ", ci-après dénommé(e) \"l'Auteur\",\n\n"
        else:
            preamble += ", ci-après dénommé(e) \"le Modèle\",\n\n"
        
        # Informations sur le cessionnaire (personnalisé si disponible, sinon Tellers par défaut)
        if cessionnaire_info and isinstance(cessionnaire_info, dict) and cessionnaire_info.get('nom'):
            # Pour une personne physique
            if 'prenom' in cessionnaire_info:
                civilite = cessionnaire_info.get('gentille', 'M.')
                prenom = cessionnaire_info.get('prenom', '')
                nom = cessionnaire_info.get('nom', '').upper()
                date_naissance = cessionnaire_info.get('date_naissance', '')
                lieu_naissance = cessionnaire_info.get('lieu_naissance', '')
                nationalite = cessionnaire_info.get('nationalite', '')
                adresse = cessionnaire_info.get('adresse', '')
                code_postal = cessionnaire_info.get('code_postal', '')
                ville = cessionnaire_info.get('ville', '')
                
                preamble += f"{civilite} {nom} {prenom}"
                
                if date_naissance:
                    preamble += f", né(e) le {date_naissance}"
                
                if lieu_naissance:
                    preamble += f" à {lieu_naissance}"
                
                if nationalite:
                    preamble += f" de nationalité {nationalite}"
                
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
                    preamble += f", domicilié(e) au {adresse_complete}"
            # Pour une personne morale
            else:
                nom = cessionnaire_info.get('nom', '')
                forme_juridique = cessionnaire_info.get('forme_juridique', '')
                capital = cessionnaire_info.get('capital', '')
                siren = cessionnaire_info.get('siren', '')  # Utiliser siren d'abord s'il existe
                if not siren:
                    siren = cessionnaire_info.get('rcs', '')
                
                adresse = cessionnaire_info.get('adresse', '')
                code_postal = cessionnaire_info.get('code_postal', '')
                ville = cessionnaire_info.get('ville', '')
                representant_civilite = cessionnaire_info.get('representant_civilite', 'M.')
                representant_nom = cessionnaire_info.get('representant_nom', '').upper()
                representant_prenom = cessionnaire_info.get('representant_prenom', '')
                qualite_representant = cessionnaire_info.get('qualite_representant', '')
                
                preamble += f"{nom}"
                
                if forme_juridique:
                    preamble += f", {forme_juridique}"
                
                if capital:
                    preamble += f" au capital de {capital}"
                
                if siren:
                    # Ajouter la ville où est situé le RCS si disponible
                    rcs_ville = cessionnaire_info.get('rcs_ville', ville)
                    if rcs_ville:
                        preamble += f", immatriculé sous le numéro {siren} R.C.S {rcs_ville}"
                    else:
                        preamble += f", immatriculé sous le numéro {siren}"
                
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
                    preamble += f", dont le siège social est situé au {adresse_complete}"
                
                # Ajouter les informations du représentant si disponibles
                if (representant_nom or representant_prenom) and qualite_representant:
                    representant = f"{representant_civilite} {representant_nom} {representant_prenom}".strip()
                    preamble += f", représentée par {representant}, en sa qualité de {qualite_representant}"
        else:
            # Utiliser les informations par défaut de Tellers
            preamble += f"{TELLERS_INFO['nom']}, {TELLERS_INFO['forme_juridique']} au capital de {TELLERS_INFO['capital']}, "
            preamble += f"immatriculée sous le numéro {TELLERS_INFO['rcs']}, et dont le siège social est situé au : "
            preamble += f"{TELLERS_INFO['siege']}, représentée par son Président en exercice dûment habilité à l'effet des présentes"
            
        preamble += ", ci-après dénommée \"le Cessionnaire\",\n\n"
        
        # Introduction commune
        preamble += "Ci-après dénommées ensemble \"les Parties\" ou individuellement \"la Partie\",\n\n"
        
        # Préambule explicatif (contextualisation)
        preamble += "PRÉAMBULE\n\n"
        
        if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
            preamble += "L'Auteur a créé une œuvre originale et est titulaire des droits d'auteur sur cette œuvre. "
            preamble += "Il figure également en tant que Modèle dans des images ou vidéos qu'il souhaite inclure dans la présente cession. "
            preamble += "Le Cessionnaire souhaite obtenir certains droits sur cette œuvre et sur l'image de l'Auteur/Modèle "
            preamble += "afin de l'exploiter dans le cadre de ses activités.\n\n"
        elif "Auteur (droits d'auteur)" in contract_type:
            preamble += "L'Auteur a créé une œuvre originale et est titulaire exclusif des droits d'auteur sur cette œuvre. "
            preamble += "Le Cessionnaire souhaite obtenir certains droits sur cette œuvre afin de l'exploiter dans le cadre de ses activités.\n\n"
        else:
            preamble += "Le Modèle dispose de droits exclusifs sur son image et son apparence. "
            preamble += "Le Cessionnaire souhaite obtenir l'autorisation d'utiliser et d'exploiter l'image du Modèle "
            preamble += "dans le cadre de ses activités.\n\n"
        
        preamble += "Après s'être présenté et avoir échangé sur les conditions de leur collaboration, "
        preamble += "les Parties ont convenu ce qui suit.\n\n"
        
        preamble += "CECI EXPOSÉ, IL A ÉTÉ CONVENU CE QUI SUIT :\n\n"
        
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
        object_clause = "ARTICLE 1 – OBJET DU CONTRAT\n\n"
        
        if "Auteur (droits d'auteur)" in contract_type:
            object_clause += "1.1 Œuvre concernée\n\n"
            object_clause += f"L'Auteur déclare être le créateur et titulaire exclusif des droits d'auteur sur l'œuvre suivante (ci-après \"l'Œuvre\") :\n\n"
            object_clause += f"{work_description}\n\n"
            object_clause += "L'Auteur garantit que l'Œuvre présente un caractère original au sens de la législation sur le droit d'auteur et qu'il détient l'intégralité des droits nécessaires pour conclure le présent contrat.\n\n"
        
        if "Image (droit à l'image)" in contract_type:
            object_clause += "1.2 Images concernées\n\n"
            object_clause += f"Le Modèle autorise expressément l'utilisation et l'exploitation de son image telle qu'elle apparaît dans les photographies, vidéos ou autres supports visuels suivants (ci-après \"les Images\") :\n\n"
            object_clause += f"{image_description}\n\n"
            object_clause += "Le Modèle déclare être pleinement informé des implications de la présente autorisation et l'accorde en toute connaissance de cause.\n\n"
        
        object_clause += "1.3 Objet de la cession\n\n"
        
        if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
            object_clause += "Par le présent contrat :\n"
            object_clause += "- L'Auteur cède au Cessionnaire certains droits d'exploitation sur l'Œuvre ;\n"
            object_clause += "- Le Modèle autorise le Cessionnaire à exploiter son image ;\n"
            object_clause += "Le tout dans les conditions et limites définies ci-après.\n\n"
        elif "Auteur (droits d'auteur)" in contract_type:
            object_clause += "Par le présent contrat, l'Auteur cède au Cessionnaire certains droits d'exploitation sur l'Œuvre, dans les conditions et limites définies ci-après.\n\n"
        else:
            object_clause += "Par le présent contrat, le Modèle autorise le Cessionnaire à exploiter son image, dans les conditions et limites définies ci-après.\n\n"
        
        object_clause += "Le présent contrat définit les modalités de cette cession, notamment en termes de droits cédés, de durée, d'étendue territoriale, de supports d'exploitation, ainsi que les obligations réciproques des Parties."
        
        return object_clause
    
    @staticmethod
    def get_author_rights_clause(is_free, is_exclusive, additional_rights):
        """
        Retourne la clause des droits cédés pour le droit d'auteur.
        
        Args:
            is_free (bool): True si la cession est gratuite, False sinon
            is_exclusive (bool): True si la cession est exclusive (ignoré si is_free est True)
            additional_rights (list): Liste des droits supplémentaires sélectionnés
        """
        # Si la cession est gratuite, forcer non-exclusif et pas de droits supplémentaires
        if is_free:
            is_exclusive = False
            additional_rights = []

        # Début de la clause standard
        rights_clause = "ARTICLE 2 – ÉTENDUE DES DROITS CÉDÉS\n\n"
        
        # Nature de la cession
        rights_clause += "2.1 Nature de la cession\n\n"
        rights_clause += f"L'Auteur cède au Cessionnaire, à titre {'exclusif' if is_exclusive else 'non exclusif'}, "
        rights_clause += "pour la durée précisée à l'article 4 et "
        rights_clause += "gratuitement" if is_free else "moyennant la rémunération précisée à l'article 6"
        rights_clause += ", les droits patrimoniaux détaillés ci-après.\n\n"

        # Droits patrimoniaux de base
        rights_clause += "2.2 Droits patrimoniaux cédés\n\n"
        rights_clause += "2.2.1 Droits de base\n\n"
        
        # Droit de reproduction
        rights_clause += "a) Droit de reproduction\n\n"
        rights_clause += "L'Auteur cède au Cessionnaire le droit de reproduction qui s'entend comme le droit de reproduire ou de faire reproduire l'Œuvre :\n"
        rights_clause += "- Par tous procédés techniques connus ou inconnus à ce jour, notamment par impression, numérisation, enregistrement magnétique, optique, numérique ou électronique ;\n"
        rights_clause += "- Sur tous supports connus ou inconnus à ce jour, notamment papier, électronique, magnétique, optique, numérique, CD-ROM, DVD, disques durs, serveurs informatiques, réseaux, cloud ;\n"
        rights_clause += "- En tous formats ;\n"
        rights_clause += "- En autant d'exemplaires que le Cessionnaire le souhaitera, selon les besoins de son activité et les finalités précisées au présent contrat.\n\n"
        
        # Droit de représentation
        rights_clause += "b) Droit de représentation\n\n"
        rights_clause += "L'Auteur cède au Cessionnaire le droit de représentation qui s'entend comme le droit de communiquer l'Œuvre au public :\n"
        rights_clause += "- Par tous moyens de diffusion connus ou inconnus à ce jour, notamment exposition, projection publique, transmission dans un lieu public de l'Œuvre télédiffusée, présentation au public sur écran accessible en ligne ;\n"
        rights_clause += "- Par tous procédés connus ou inconnus à ce jour, notamment par diffusion numérique en ligne sur Internet (sites web, réseaux sociaux, blogs, plateformes de partage, applications mobiles), diffusion par satellite, câble, réseaux informatiques, etc. ;\n"
        rights_clause += "- À destination de tout public, restreint ou non.\n\n"
        
        # Droits supplémentaires uniquement pour les cessions onéreuses
        if not is_free and additional_rights:
            rights_clause += "2.2.2 Droits supplémentaires\n\n"
            
            # Utiliser un dictionnaire pour mapper les clés aux noms complets
            rights_mapping = {
                "distribution": "distribution - droit de distribuer l'original ou les copies de l'œuvre au public",
                "usage": "usage - droit d'utiliser l'œuvre pour les besoins du cessionnaire",
                "adaptation": "adaptation - droit de modifier, transformer, traduire l'œuvre",
                "pret": "pret - droit de mettre l'œuvre à disposition pour un usage temporaire",
                "location": "location - droit de mettre l'œuvre à disposition contre rémunération",
                "suite": "suite - droit de percevoir un pourcentage lors de reventes"
            }
            
            # Traiter chaque droit supplémentaire
            for i, right in enumerate(additional_rights, start=3):
                right_key = next((k for k in rights_mapping.keys() if k in right.lower()), None)
                if right_key:
                    letter = chr(ord('c') + i - 3)  # Commence à 'c'
                    rights_clause += f"{letter}) {rights_mapping[right_key]}\n\n"
                    # Ajouter le contenu détaillé de chaque droit comme dans le code existant
                    if right_key == "distribution":
                        rights_clause += "L'Auteur cède au Cessionnaire le droit de distribution qui s'entend comme le droit de mettre à disposition du public l'original de l'Œuvre ou ses copies, par la vente, la location, le prêt ou tout autre mode de mise à disposition. Ce droit comprend notamment :\n"
                        rights_clause += "- Le droit de vendre ou faire vendre, d'offrir à la vente tout ou partie de l'Œuvre ;\n"
                        rights_clause += "- Le droit de diffuser et de faire diffuser tout ou partie de l'Œuvre par tous moyens et sur tous supports ;\n"
                        rights_clause += "- Le droit de distribuer l'Œuvre à des fins commerciales ou non commerciales.\n\n"
                    elif right_key == "usage":
                        rights_clause += "L'Auteur cède au Cessionnaire le droit d'usage qui s'entend comme le droit d'utiliser l'Œuvre pour les besoins propres du Cessionnaire, notamment :\n"
                        rights_clause += "- Dans le cadre de ses activités professionnelles, commerciales ou promotionnelles ;\n"
                        rights_clause += "- À des fins d'illustration de ses services ou produits ;\n"
                        rights_clause += "- Pour toute communication interne ou externe en lien avec son activité ;\n"
                        rights_clause += "- Pour l'intégration dans ses outils, bases de données ou systèmes d'information.\n\n"
                    elif right_key == "adaptation":
                        rights_clause += "L'Auteur cède au Cessionnaire le droit d'adaptation qui s'entend comme le droit de modifier, transformer, arranger, traduire l'Œuvre ou de l'incorporer dans toute autre œuvre ou création, notamment :\n"
                        rights_clause += "- Le droit de traduire tout ou partie de l'Œuvre en toutes langues ;\n"
                        rights_clause += "- Le droit d'adapter tout ou partie de l'Œuvre pour tous types de supports et formats ;\n"
                        rights_clause += "- Le droit de modifier le format, les couleurs, les dimensions de l'Œuvre ;\n"
                        rights_clause += "- Le droit d'intégrer tout ou partie de l'Œuvre au sein d'une œuvre composite ou collective ;\n"
                        rights_clause += "- Le droit de modifier tout ou partie de l'Œuvre nécessaire à des fins d'exploitation techniques.\n\n"
                        rights_clause += "Ces adaptations seront réalisées dans le respect du droit moral de l'Auteur.\n\n"
                    elif right_key == "pret":
                        rights_clause += "L'Auteur cède au Cessionnaire le droit de prêt qui s'entend comme le droit de mettre l'Œuvre à disposition des utilisateurs pour un usage temporaire et non commercial :\n"
                        rights_clause += "- Le droit de prêter l'Œuvre ou ses reproductions à des tiers, à titre gratuit ;\n"
                        rights_clause += "- Le droit d'autoriser le prêt public de l'Œuvre ou de ses reproductions.\n\n"
                    elif right_key == "location":
                        rights_clause += "L'Auteur cède au Cessionnaire le droit de location qui s'entend comme le droit de mettre l'Œuvre à disposition des utilisateurs pour un usage temporaire et moyennant une contrepartie économique directe ou indirecte :\n"
                        rights_clause += "- Le droit de louer l'Œuvre ou ses reproductions à des tiers, à titre onéreux ;\n"
                        rights_clause += "- Le droit d'autoriser la location de l'Œuvre ou de ses reproductions.\n\n"
                    elif right_key == "suite":
                        rights_clause += "Les parties reconnaissent l'existence du droit de suite, qui s'applique aux œuvres graphiques et plastiques. "
                        rights_clause += "Conformément aux articles L. 122-8 et R. 122-1 à R. 122-12 du Code de la propriété intellectuelle, ce droit inaliénable permet à l'auteur d'une œuvre graphique ou plastique de percevoir un pourcentage sur le prix de revente de son œuvre lorsque intervient un professionnel du marché de l'art. "
                        rights_clause += "Les parties s'engagent à respecter les dispositions légales en vigueur concernant le droit de suite.\n\n"

        rights_clause += "2.3 Droits réservés\n\n"
        rights_clause += "Tous les droits non expressément cédés par le présent contrat demeurent la propriété exclusive de l'Auteur. "
        rights_clause += "Toute exploitation non prévue au présent contrat devra faire l'objet d'un accord complémentaire entre les Parties.\n\n"
        
        rights_clause += "2.4 Modalités d'exploitation\n\n"
        
        # Clause d'exclusivité ou non-exclusivité
        if is_exclusive:
            rights_clause += "La présente cession est consentie à titre exclusif. En conséquence, pendant toute la durée du présent contrat :\n"
            rights_clause += "- L'Auteur s'interdit de céder à un tiers l'un quelconque des droits faisant l'objet de la présente cession ;\n"
            rights_clause += "- L'Auteur s'interdit d'exploiter lui-même l'Œuvre selon les modalités cédées au Cessionnaire.\n\n"
            rights_clause += "Cette exclusivité constitue un élément essentiel du présent contrat, sans lequel le Cessionnaire n'aurait pas contracté.\n\n"
        else:
            rights_clause += "La présente cession est consentie à titre non exclusif. En conséquence :\n"
            rights_clause += "- L'Auteur conserve le droit d'exploiter lui-même l'Œuvre et d'en autoriser l'exploitation par des tiers ;\n"
            rights_clause += "- L'Auteur s'engage toutefois à ne pas céder ces droits selon des modalités susceptibles de concurrencer directement et significativement l'exploitation par le Cessionnaire.\n\n"
        
        return rights_clause
    
    @staticmethod
    def get_image_rights_clause(is_free, is_exclusive, article_num=3):
        """
        Retourne la clause des droits cédés pour le droit à l'image.
        
        Args:
            is_free (bool): True si la cession est gratuite, False sinon
            is_exclusive (bool): True si la cession est exclusive, False sinon
            article_num (int, optional): Numéro de l'article, par défaut 3
            
        Returns:
            str: Clause des droits à l'image
        """
        image_clause = f"ARTICLE {article_num} – AUTORISATION D'EXPLOITATION DE L'IMAGE\n\n"
        
        image_clause += f"{article_num}.1 Objet de l'autorisation\n\n"
        image_clause += "Le Modèle autorise expressément le Cessionnaire à fixer, reproduire, diffuser et exploiter son image telle qu'elle figure dans les supports visuels décrits à l'article 1.2.\n\n"
        
        image_clause += "Cette autorisation comprend notamment :\n"
        image_clause += "- Le droit de reproduire et faire reproduire les Images par tous procédés techniques connus ou inconnus à ce jour (photographie, imprimerie, numérisation, etc.) sur tous supports (papier, tissu, plastique, céramique, supports électroniques, optiques, magnétiques, numériques, etc.) et en tous formats ;\n"
        image_clause += "- Le droit de représenter et faire représenter publiquement les Images par tous moyens de diffusion et de communication connus ou inconnus à ce jour, notamment exposition, télédiffusion, cinéma, Internet (sites web, réseaux sociaux, applications mobiles), affichage, projection publique, présentation au public, etc.\n\n"
        
        image_clause += f"{article_num}.2 Conditions de l'autorisation\n\n"
        image_clause += "La présente autorisation est consentie "
        
        if is_exclusive:
            image_clause += "à titre exclusif, "
        else:
            image_clause += "à titre non exclusif, "
        
        if is_free:
            image_clause += "gratuitement, "
        else:
            image_clause += "moyennant la rémunération précisée à l'article 6, "
        
        image_clause += f"pour la durée et sur le territoire mentionnés à l'article 4.\n\n"
        
        image_clause += f"{article_num}.3 Restrictions et engagements\n\n"
        
        # Restrictions d'utilisation pour le droit à l'image
        image_clause += "Le Cessionnaire s'engage expressément à :\n"
        image_clause += "- Ne pas porter atteinte à la dignité, à l'honneur ou à la réputation du Modèle ;\n"
        image_clause += "- Ne pas utiliser les Images dans un contexte diffamatoire, pornographique, injurieux ou contraire aux bonnes mœurs ;\n"
        image_clause += "- Ne pas associer les Images à des opinions politiques, religieuses ou idéologiques sans l'accord préalable et écrit du Modèle ;\n"
        image_clause += "- Informer le Modèle, sur simple demande, des utilisations faites de son image.\n\n"
        
        image_clause += "Les parties s'engagent mutuellement à ne pas tenir de propos dénigrants l'une envers l'autre, que ce soit en public ou en privé, notamment sur les réseaux sociaux ou dans les médias.\n\n"
        
        # Clause d'exclusivité pour le droit à l'image
        if is_exclusive:
            image_clause += f"{article_num}.4 Exclusivité\n\n"
            image_clause += "Compte tenu du caractère exclusif de la présente autorisation, le Modèle s'engage, pendant toute la durée du présent contrat :\n"
            image_clause += "- À ne pas autoriser l'exploitation de son image telle que décrite à l'article 1.2 à des tiers ;\n"
            image_clause += "- À ne pas utiliser ou exploiter lui-même son image dans des conditions similaires à celles autorisées au Cessionnaire.\n\n"
            image_clause += "Cette exclusivité constitue un élément essentiel du présent contrat, sans lequel le Cessionnaire n'aurait pas contracté.\n\n"
        else:
            image_clause += f"{article_num}.4 Non-exclusivité\n\n"
            image_clause += "La présente autorisation étant non exclusive, le Modèle conserve le droit d'autoriser l'exploitation de son image à des tiers, "
            image_clause += "sous réserve que cela ne nuise pas directement aux intérêts légitimes du Cessionnaire.\n\n"
        
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
        duration_clause = f"ARTICLE {article_num} – DURÉE ET TERRITOIRE\n\n"
        
        duration_clause += f"{article_num}.1 Durée\n\n"
        duration_clause += f"La présente cession est consentie pour une durée initiale de {DEFAULT_DURATION} à compter de la date de signature du présent contrat.\n\n"
        duration_clause += f"Elle se renouvellera ensuite automatiquement par {DEFAULT_RENEWAL}, "
        duration_clause += "sauf dénonciation par l'une ou l'autre des Parties par lettre recommandée avec accusé de réception, "
        duration_clause += "adressée à l'autre Partie au moins trois (3) mois avant l'expiration de la période en cours.\n\n"
        
        duration_clause += f"{article_num}.2 Territoire\n\n"
        duration_clause += f"La présente cession est consentie pour le {DEFAULT_TERRITORY}, sans restriction géographique. "
        duration_clause += "Cette étendue territoriale se justifie par la nature numérique et dématérialisée des services fournis par le Cessionnaire, "
        duration_clause += "susceptibles d'être accessibles depuis n'importe quel point du globe, sans possibilité technique de limitation géographique efficace.\n\n"
        
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
        supports_clause = f"ARTICLE {article_num} – SUPPORTS D'EXPLOITATION\n\n"
        
        supports_clause += f"{article_num}.1 Supports autorisés\n\n"
        supports_clause += "Le Cessionnaire est autorisé à exploiter l'œuvre et/ou l'image sur les supports suivants :\n\n"
        
        # Création d'une liste détaillée des supports
        for support in supports:
            supports_clause += f"- {support}\n"
        
        supports_clause += f"\n{article_num}.2 Nature des exploitations\n\n"
        supports_clause += "Le Cessionnaire pourra notamment, sans que cette liste soit limitative :\n"
        supports_clause += "- Publier l'œuvre et/ou l'image sur son site web et ses plateformes numériques ;\n"
        supports_clause += "- Inclure l'œuvre et/ou l'image dans des communications internes ou externes ;\n"
        supports_clause += "- Utiliser l'œuvre et/ou l'image à des fins promotionnelles ou publicitaires ;\n"
        supports_clause += "- Intégrer l'œuvre et/ou l'image dans des créations dérivées en lien avec son activité ;\n"
        supports_clause += "- Partager l'œuvre et/ou l'image sur les réseaux sociaux et plateformes de partage.\n\n"
        
        supports_clause += f"{article_num}.3 Limitation d'usage\n\n"
        supports_clause += "Cette liste est limitative et le Cessionnaire s'engage à ne pas utiliser l'œuvre et/ou l'image sur d'autres supports "
        supports_clause += "sans l'autorisation préalable et écrite du Cédant.\n\n"
        
        supports_clause += "Le Cessionnaire s'interdit expressément toute exploitation susceptible de porter atteinte à la dignité humaine, "
        supports_clause += "à l'ordre public ou aux bonnes mœurs.\n\n"
        
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
        remuneration_clause = f"ARTICLE {article_num} – RÉMUNÉRATION\n\n"
        
        if is_free:
            remuneration_clause += f"{article_num}.1 Cession à titre gratuit\n\n"
            remuneration_clause += "La présente cession est consentie à titre gratuit, sans contrepartie financière. "
            remuneration_clause += "Le Cédant déclare expressément renoncer à toute rémunération au titre de la présente cession et être pleinement informé "
            remuneration_clause += "de la portée de cette gratuité.\n\n"
            
            remuneration_clause += f"{article_num}.2 Motivation de la gratuité\n\n"
            remuneration_clause += "Les Parties reconnaissent que cette gratuité se justifie par :\n"
            remuneration_clause += "- L'intérêt réciproque des Parties à cette collaboration ;\n"
            remuneration_clause += "- La visibilité et la promotion apportées par le Cessionnaire à l'œuvre et/ou à l'image du Cédant ;\n"
            remuneration_clause += "- Le caractère non lucratif de certaines exploitations envisagées.\n\n"
            
            remuneration_clause += "Le Cédant reconnaît avoir été pleinement informé de son droit à rémunération et y renoncer librement.\n\n"
        else:
            remuneration_clause += f"{article_num}.1 Rémunération\n\n"
            remuneration_clause += f"En contrepartie de la présente cession, le Cessionnaire versera au Cédant la rémunération suivante :\n\n{remuneration}\n\n"
            
            remuneration_clause += f"{article_num}.2 Modalités de paiement\n\n"
            if "forfaitaire" in remuneration.lower() or "€" in remuneration or "euros" in remuneration.lower():
                remuneration_clause += "Cette rémunération forfaitaire est réputée définitive, forfaitaire et non révisable. "
                remuneration_clause += "Elle inclut tout montant dû au titre de l'ensemble des droits cédés, tels que définis dans le présent contrat.\n\n"
                
                remuneration_clause += "Le paiement sera effectué par virement bancaire sur le compte du Cédant, dont les coordonnées seront "
                remuneration_clause += "communiquées séparément, dans un délai de trente (30) jours suivant la signature du présent contrat "
                remuneration_clause += "et réception d'une facture ou note d'honoraires conforme.\n\n"
            elif "proportionnelle" in remuneration.lower() or "%" in remuneration:
                remuneration_clause += "Cette rémunération proportionnelle sera calculée et versée selon les termes indiqués ci-dessus. "
                remuneration_clause += "Le Cessionnaire s'engage à tenir une comptabilité précise des exploitations donnant lieu à rémunération "
                remuneration_clause += "et à fournir au Cédant, sur simple demande, un état récapitulatif des exploitations réalisées.\n\n"
                
                remuneration_clause += "Les versements seront effectués par virement bancaire sur le compte du Cédant, dont les coordonnées seront "
                remuneration_clause += "communiquées séparément, selon la périodicité indiquée ci-dessus et sur présentation d'une facture "
                remuneration_clause += "ou note d'honoraires conforme.\n\n"
            else:
                remuneration_clause += "Le paiement sera effectué selon les modalités indiquées ci-dessus. "
                remuneration_clause += "Le Cessionnaire s'engage à respecter strictement ces conditions de rémunération, qui constituent "
                remuneration_clause += "un élément essentiel du consentement du Cédant.\n\n"
            
            remuneration_clause += f"{article_num}.3 Justification de la rémunération\n\n"
            remuneration_clause += "Les Parties reconnaissent que cette rémunération est équitable et proportionnée aux exploitations prévues. "
            remuneration_clause += "Elle a été déterminée en tenant compte notamment de l'étendue des droits cédés, de la durée de la cession, "
            remuneration_clause += "du territoire concerné et des investissements nécessaires à l'exploitation de l'œuvre/image.\n\n"
        
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
        warranties_clause = f"ARTICLE {article_num} – GARANTIES ET RESPONSABILITÉS\n\n"
        
        if "Auteur (droits d'auteur)" in contract_type:
            warranties_clause += f"{article_num}.1 Garanties de l'Auteur\n\n"
            warranties_clause += "L'Auteur garantit au Cessionnaire :\n"
            warranties_clause += "- Qu'il est bien l'auteur de l'œuvre et le titulaire exclusif des droits de propriété intellectuelle sur celle-ci ;\n"
            warranties_clause += "- Que l'œuvre est originale et ne constitue pas une contrefaçon d'une œuvre préexistante ;\n"
            warranties_clause += "- Qu'il n'a préalablement consenti aucune cession ou licence de droits à un tiers qui serait incompatible avec la présente cession ;\n"
            warranties_clause += "- Que l'œuvre ne contient aucun élément susceptible de tomber sous le coup des lois et règlements relatifs à la diffamation, "
            warranties_clause += "l'injure, la protection de la vie privée, le droit à l'image, les droits de la personnalité ou la contrefaçon ;\n"
            warranties_clause += "- Qu'il n'existe aucune restriction légale ou contractuelle qui pourrait limiter ou interdire l'exploitation de l'œuvre "
            warranties_clause += "dans les conditions prévues au présent contrat.\n\n"
            
            warranties_clause += "En conséquence, l'Auteur garantit le Cessionnaire contre toute éviction, revendication ou action de tiers, "
            warranties_clause += "fondée sur la propriété intellectuelle ou tout autre fondement, qui troublerait l'exploitation paisible des droits cédés. "
            warranties_clause += "Il s'engage à indemniser le Cessionnaire de tous frais et indemnités qui pourraient résulter de telles actions.\n\n"
        
        if "Image (droit à l'image)" in contract_type:
            section_num = 2 if "Auteur (droits d'auteur)" in contract_type else 1
            warranties_clause += f"{article_num}.{section_num} Garanties du Modèle\n\n"
            warranties_clause += "Le Modèle garantit au Cessionnaire :\n"
            warranties_clause += "- Qu'il est libre de consentir à la présente autorisation et dispose de la pleine capacité juridique à cet effet ;\n"
            warranties_clause += "- Que son image n'est pas liée à d'autres engagements exclusifs incompatibles avec le présent contrat ;\n"
            warranties_clause += "- Qu'aucun tiers ne détient de droits sur son image susceptibles d'entraver l'exploitation prévue par le présent contrat.\n\n"
            
            warranties_clause += "En conséquence, le Modèle garantit le Cessionnaire contre tout recours ou action émanant de tiers qui allégueraient "
            warranties_clause += "disposer de droits sur l'image du Modèle. Il s'engage à indemniser le Cessionnaire de tous frais et indemnités "
            warranties_clause += "qui pourraient résulter de telles actions.\n\n"
        
        section_num = 3 if 'Image (droit à l\'image)' in contract_type and 'Auteur (droits d\'auteur)' in contract_type else 2
        warranties_clause += f"{article_num}.{section_num} Obligations du Cessionnaire\n\n"
        warranties_clause += "Le Cessionnaire s'engage à :\n"
        warranties_clause += "- Respecter l'intégrité de l'œuvre et/ou de l'image dans le cadre des exploitations autorisées ;\n"
        
        if "Auteur (droits d'auteur)" in contract_type:
            warranties_clause += "- Mentionner le nom de l'Auteur lors de toute exploitation de l'œuvre, sauf lorsque cela est techniquement impossible "
            warranties_clause += "ou inapproprié compte tenu du support d'exploitation ;\n"
        
        warranties_clause += "- N'effectuer aucune modification substantielle de l'œuvre et/ou de l'image sans l'accord préalable du Cédant, "
        warranties_clause += "à l'exception des adaptations techniques nécessaires à l'exploitation ;\n"
        warranties_clause += "- Exploiter l'œuvre et/ou l'image conformément aux usages professionnels et aux dispositions du présent contrat.\n\n"
        
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
        termination_clause = f"ARTICLE {article_num} – RÉSILIATION\n\n"
        
        termination_clause += f"{article_num}.1 Résiliation pour inexécution\n\n"
        termination_clause += "Le présent contrat pourra être résilié de plein droit par l'une des parties en cas d'inexécution "
        termination_clause += "par l'autre partie de l'une quelconque de ses obligations contractuelles. "
        termination_clause += "Cette résiliation deviendra effective trois (3) mois après l'envoi par la partie plaignante "
        termination_clause += "d'une lettre recommandée avec accusé de réception exposant les motifs de la plainte, "
        termination_clause += "à moins que, dans ce délai, la partie défaillante n'ait satisfait à ses obligations ou "
        termination_clause += "n'ait apporté la preuve d'un empêchement consécutif à un cas de force majeure.\n\n"
        
        termination_clause += f"{article_num}.2 Résiliation anticipée\n\n"
        termination_clause += "Chacune des parties pourra également mettre fin au présent contrat avant son terme, "
        termination_clause += "moyennant un préavis de trois (3) mois notifié par lettre recommandée avec accusé de réception. "
        termination_clause += "Dans ce cas, la résiliation ne prendra effet qu'à l'expiration du préavis.\n\n"
        
        termination_clause += f"{article_num}.3 Conséquences de la résiliation\n\n"
        termination_clause += "En cas de résiliation du contrat, pour quelque cause que ce soit :\n"
        termination_clause += "- Le Cessionnaire devra cesser toute nouvelle exploitation de l'œuvre et/ou de l'image ;\n"
        termination_clause += "- Le Cessionnaire sera néanmoins autorisé à écouler les stocks existants pendant une période maximale de trois (3) mois ;\n"
        termination_clause += "- Les exploitations déjà réalisées demeureront acquises au Cessionnaire, qui n'aura pas à les retirer ;\n"
        termination_clause += "- Les sommes déjà versées resteront définitivement acquises au Cédant ;\n"
        termination_clause += "- Les sommes encore dues au titre d'exploitations déjà réalisées devront être versées au Cédant.\n\n"
        
        termination_clause += "L'exercice de cette faculté de résiliation ne dispense pas la partie défaillante de remplir "
        termination_clause += "les obligations contractées jusqu'à la date de prise d'effet de la résiliation et ce, "
        termination_clause += "sous réserve des dommages éventuellement subis par la partie plaignante du fait de la résiliation anticipée du contrat.\n\n"
        
        return termination_clause
    
    @staticmethod
    def get_other_clauses(article_num, contract_type):
        """
        Retourne les clauses diverses.
        
        Args:
            article_num (int): Numéro de l'article
            contract_type (list): Liste des types de contrats sélectionnés
            
        Returns:
            str: Clauses diverses
        """
        other_clauses = f"ARTICLE {article_num} – DISPOSITIONS DIVERSES\n\n"
        
        other_clauses += f"{article_num}.1 Clause de non-dénigrement\n\n"
        other_clauses += "Les Parties s'engagent mutuellement à ne pas tenir de propos négatifs ou diffamatoires l'une envers l'autre, "
        other_clauses += "que ce soit en privé ou en public, notamment sur les réseaux sociaux, dans les médias ou auprès de partenaires commerciaux. "
        other_clauses += "Cette obligation survivra à la fin du présent contrat pour une durée de deux (2) ans.\n\n"
        
        other_clauses += f"{article_num}.2 Intuitu personae\n\n"
        other_clauses += "Le présent contrat est conclu intuitu personae. Les droits et obligations en résultant ne pourront être cédés ou transférés "
        other_clauses += "par l'une des Parties sans l'accord préalable et écrit de l'autre Partie.\n\n"
        
        other_clauses += "Toutefois, en cas de cession ou de transfert de son activité à un tiers, le Cessionnaire pourra transférer le bénéfice "
        other_clauses += "du présent contrat à ce tiers, à condition d'en informer préalablement le Cédant par écrit.\n\n"
        
        other_clauses += f"{article_num}.3 Intégralité de l'accord\n\n"
        other_clauses += "Le présent contrat et ses éventuelles annexes constituent l'intégralité de l'accord entre les Parties relativement à son objet. "
        other_clauses += "Il remplace et annule tout engagement oral ou écrit antérieur relatif à l'objet des présentes.\n\n"
        
        other_clauses += f"{article_num}.4 Nullité partielle\n\n"
        other_clauses += "Si l'une quelconque des stipulations du présent contrat était déclarée nulle au regard d'une règle de droit en vigueur "
        other_clauses += "ou d'une décision judiciaire devenue définitive, elle serait alors réputée non écrite, sans pour autant entraîner la nullité "
        other_clauses += "du contrat ni altérer la validité de ses autres dispositions.\n\n"
        
        other_clauses += f"{article_num}.5 Modification du contrat\n\n"
        other_clauses += "Toute modification du présent contrat ne pourra résulter que d'un document écrit et signé par les Parties. "
        other_clauses += "Aucune modification ne pourra être déduite de la passivité de l'une des Parties.\n\n"
        
        return other_clauses
    
    @staticmethod
    def get_applicable_law_clause(article_num):
        """
        Retourne la clause de loi applicable.
        
        Args:
            article_num (int): Numéro de l'article
            
        Returns:
            str: Clause de loi applicable
        """
        law_clause = f"ARTICLE {article_num} – LOI APPLICABLE ET JURIDICTION COMPÉTENTE\n\n"
        
        law_clause += f"{article_num}.1 Loi applicable\n\n"
        law_clause += "Le présent contrat est soumis au droit français.\n\n"
        
        law_clause += f"{article_num}.2 Résolution amiable des litiges\n\n"
        law_clause += "En cas de différend entre les Parties relatif à l'interprétation, l'exécution ou la résiliation du présent contrat, "
        law_clause += "les Parties s'efforceront de résoudre leur différend à l'amiable.\n\n"
        
        law_clause += "À cet effet, la Partie la plus diligente adressera à l'autre Partie une notification précisant la nature et l'étendue du différend. "
        law_clause += "Les Parties s'engagent à se réunir dans les trente (30) jours suivant cette notification pour tenter de résoudre le litige.\n\n"
        
        law_clause += f"{article_num}.3 Attribution de juridiction\n\n"
        law_clause += "À défaut d'accord amiable dans un délai de soixante (60) jours à compter de la notification du différend, "
        law_clause += "tout litige relatif à l'existence, la validité, l'interprétation, l'exécution ou la résiliation du présent contrat "
        law_clause += "sera soumis à la compétence exclusive des tribunaux de Lyon, y compris en cas de référé, d'appel en garantie "
        law_clause += "ou de pluralité de défendeurs.\n\n"
        
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
        signatures += "En deux exemplaires originaux, dont un pour chaque Partie.\n\n"
        
        # Adapter la signature en fonction du type de contrat
        if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
            signatures += "Pour l'Auteur et Modèle :                                Pour le Cessionnaire :\n"
            signatures += "[Nom, Prénom]                                            [Nom, Prénom et qualité]\n"
            signatures += "Signature précédée de la mention                         Signature précédée de la mention\n"
            signatures += "« Lu et approuvé »                                       « Lu et approuvé »\n"
        elif "Auteur (droits d'auteur)" in contract_type:
            signatures += "Pour l'Auteur :                                          Pour le Cessionnaire :\n"
            signatures += "[Nom, Prénom]                                            [Nom, Prénom et qualité]\n"
            signatures += "Signature précédée de la mention                         Signature précédée de la mention\n"
            signatures += "« Lu et approuvé »                                       « Lu et approuvé »\n"
        else:
            signatures += "Pour le Modèle :                                         Pour le Cessionnaire :\n"
            signatures += "[Nom, Prénom]                                            [Nom, Prénom et qualité]\n"
            signatures += "Signature précédée de la mention                         Signature précédée de la mention\n"
            signatures += "« Lu et approuvé »                                       « Lu et approuvé »\n"
        
        return signatures