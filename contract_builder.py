"""
Module pour la construction des contrats à partir des templates.
"""
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.platypus import Paragraph, Spacer

from contract_templates import ContractTemplates
from utils import ensure_default_supports, sanitize_text


class ContractBuilder:
    """
    Classe responsable de la construction des contrats complets à partir des templates.
    """
    
    @staticmethod
    def get_styles():
        """
        Retourne les styles pour le document PDF.
        Version corrigée pour utiliser les polices Vera.
        
        Returns:
            dict: Dictionnaire des styles
        """
        styles = getSampleStyleSheet()
        
        # Ajouter un style personnalisé pour le titre
        styles.add(ParagraphStyle(name='ContractTitle', 
                                 fontName='VeraBd', 
                                 fontSize=14, 
                                 alignment=TA_CENTER,
                                 spaceAfter=12))
        
        # Ajouter un style personnalisé pour les sous-titres
        styles.add(ParagraphStyle(name='ContractSubtitle', 
                                 fontName='VeraBd', 
                                 fontSize=12, 
                                 spaceAfter=10,
                                 alignment=TA_CENTER))
        
        # Ajouter un style personnalisé pour le texte normal
        styles.add(ParagraphStyle(name='ContractText', 
                                 fontName='Vera', 
                                 fontSize=10, 
                                 alignment=TA_JUSTIFY,
                                 spaceAfter=6))
        
        # Ajouter un style personnalisé pour les articles
        styles.add(ParagraphStyle(name='ContractArticle', 
                                 fontName='VeraBd', 
                                 fontSize=11, 
                                 spaceAfter=8))
        
        # Ajouter un style personnalisé pour les sous-articles
        styles.add(ParagraphStyle(name='ContractSubArticle', 
                                 fontName='VeraBd', 
                                 fontSize=10, 
                                 spaceAfter=6))
        
        return styles
    
    @staticmethod
    def build_contract_elements(contract_type, is_free, author_type, author_info, 
                               work_description, image_description, supports, 
                               additional_rights, remuneration, is_exclusive):
        """
        Construit tous les éléments du contrat.
        
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
            list: Liste des éléments du contrat pour ReportLab
        """
        # Obtenir les styles
        styles = ContractBuilder.get_styles()
        
        # Initialiser la liste des éléments
        elements = []
        
        # 1. Titre du contrat
        title = ContractTemplates.get_title(contract_type)
        elements.append(Paragraph(title, styles['ContractTitle']))
        elements.append(Spacer(1, 15))
        
        # 2. Préambule
        preamble_text = ContractTemplates.get_preamble_text(contract_type, author_type, author_info)
        paragraphs = preamble_text.split('\n\n')
        for i, paragraph in enumerate(paragraphs):
            if paragraph.strip():
                # Si c'est un titre comme "PRÉAMBULE" ou "ENTRE LES SOUSSIGNÉS"
                if paragraph.isupper() and len(paragraph) < 50:
                    elements.append(Paragraph(paragraph, styles['ContractSubtitle']))
                else:
                    elements.append(Paragraph(paragraph, styles['ContractText']))
                
                # Ajouter un espace plus grand après les titres
                if paragraph.isupper() and len(paragraph) < 50:
                    elements.append(Spacer(1, 10))
                else:
                    elements.append(Spacer(1, 6))
        
        # 3. Article 1 - Objet
        object_clause = ContractTemplates.get_object_clause(
            contract_type, 
            sanitize_text(work_description), 
            sanitize_text(image_description)
        )
        
        # Traitement de l'article objet
        paragraphs = object_clause.split('\n\n')
        for i, paragraph in enumerate(paragraphs):
            if paragraph.strip():
                # Si c'est un titre d'article (commence par "ARTICLE")
                if paragraph.startswith("ARTICLE"):
                    elements.append(Paragraph(paragraph, styles['ContractArticle']))
                # Si c'est un sous-titre (comme "1.1 Œuvre concernée")
                elif paragraph.strip().startswith("1.") and len(paragraph.split("\n")[0]) < 50:
                    elements.append(Paragraph(paragraph, styles['ContractSubArticle']))
                else:
                    elements.append(Paragraph(paragraph, styles['ContractText']))
                elements.append(Spacer(1, 6))
        
        # Compteur d'articles
        article_num = 2
        
        # 4. Article 2 - Droits cédés (pour contrat droits d'auteur)
        if "Auteur (droits d'auteur)" in contract_type:
            rights_clause = ContractTemplates.get_author_rights_clause(is_free, is_exclusive, additional_rights)
            paragraphs = rights_clause.split('\n\n')
            for paragraph in paragraphs:
                if paragraph.strip():
                    # Si c'est un titre d'article (commence par "ARTICLE")
                    if paragraph.startswith("ARTICLE"):
                        elements.append(Paragraph(paragraph, styles['ContractArticle']))
                    # Si c'est un sous-titre (comme "2.1 Nature de la cession")
                    elif paragraph.strip().startswith("2.") and len(paragraph.split("\n")[0]) < 50:
                        elements.append(Paragraph(paragraph, styles['ContractSubArticle']))
                    else:
                        elements.append(Paragraph(paragraph, styles['ContractText']))
                    elements.append(Spacer(1, 6))
            article_num += 1
        
        # 5. Article sur les droits à l'image (pour contrat droit à l'image)
        if "Image (droit à l'image)" in contract_type:
            image_rights_article_num = article_num if "Auteur (droits d'auteur)" not in contract_type else article_num
            image_clause = ContractTemplates.get_image_rights_clause(is_free, is_exclusive)
            # Remplacer le numéro d'article si nécessaire
            if image_rights_article_num != 3:
                image_clause = image_clause.replace("ARTICLE 3", f"ARTICLE {image_rights_article_num}")
                # Aussi remplacer les sous-titres 3.x par le bon numéro
                image_clause = image_clause.replace("3.1", f"{image_rights_article_num}.1")
                image_clause = image_clause.replace("3.2", f"{image_rights_article_num}.2")
                image_clause = image_clause.replace("3.3", f"{image_rights_article_num}.3")
                image_clause = image_clause.replace("3.4", f"{image_rights_article_num}.4")
            
            paragraphs = image_clause.split('\n\n')
            for paragraph in paragraphs:
                if paragraph.strip():
                    # Si c'est un titre d'article (commence par "ARTICLE")
                    if paragraph.startswith("ARTICLE"):
                        elements.append(Paragraph(paragraph, styles['ContractArticle']))
                    # Si c'est un sous-titre (comme "3.1 Objet de l'autorisation")
                    elif paragraph.strip()[0].isdigit() and "." in paragraph.strip()[:3] and len(paragraph.split("\n")[0]) < 50:
                        elements.append(Paragraph(paragraph, styles['ContractSubArticle']))
                    else:
                        elements.append(Paragraph(paragraph, styles['ContractText']))
                    elements.append(Spacer(1, 6))
            article_num += 1
        
        # 6. Article - Durée et territoire
        duration_clause = ContractTemplates.get_duration_territory_clause(article_num)
        paragraphs = duration_clause.split('\n\n')
        for paragraph in paragraphs:
            if paragraph.strip():
                # Si c'est un titre d'article (commence par "ARTICLE")
                if paragraph.startswith("ARTICLE"):
                    elements.append(Paragraph(paragraph, styles['ContractArticle']))
                # Si c'est un sous-titre (comme "4.1 Durée")
                elif paragraph.strip()[0].isdigit() and "." in paragraph.strip()[:3] and len(paragraph.split("\n")[0]) < 50:
                    elements.append(Paragraph(paragraph, styles['ContractSubArticle']))
                else:
                    elements.append(Paragraph(paragraph, styles['ContractText']))
                elements.append(Spacer(1, 6))
        article_num += 1
        
        # 7. Article - Supports d'exploitation
        final_supports = ensure_default_supports(supports)
        supports_clause = ContractTemplates.get_supports_clause(article_num, final_supports)
        paragraphs = supports_clause.split('\n\n')
        for paragraph in paragraphs:
            if paragraph.strip():
                # Si c'est un titre d'article (commence par "ARTICLE")
                if paragraph.startswith("ARTICLE"):
                    elements.append(Paragraph(paragraph, styles['ContractArticle']))
                # Si c'est un sous-titre (comme "5.1 Supports autorisés")
                elif paragraph.strip()[0].isdigit() and "." in paragraph.strip()[:3] and len(paragraph.split("\n")[0]) < 50:
                    elements.append(Paragraph(paragraph, styles['ContractSubArticle']))
                else:
                    elements.append(Paragraph(paragraph, styles['ContractText']))
                elements.append(Spacer(1, 6))
        article_num += 1
        
        # 8. Article - Rémunération
        remuneration_clause = ContractTemplates.get_remuneration_clause(article_num, is_free, sanitize_text(remuneration))
        paragraphs = remuneration_clause.split('\n\n')
        for paragraph in paragraphs:
            if paragraph.strip():
                # Si c'est un titre d'article (commence par "ARTICLE")
                if paragraph.startswith("ARTICLE"):
                    elements.append(Paragraph(paragraph, styles['ContractArticle']))
                # Si c'est un sous-titre (comme "6.1 Cession à titre gratuit")
                elif paragraph.strip()[0].isdigit() and "." in paragraph.strip()[:3] and len(paragraph.split("\n")[0]) < 50:
                    elements.append(Paragraph(paragraph, styles['ContractSubArticle']))
                else:
                    elements.append(Paragraph(paragraph, styles['ContractText']))
                elements.append(Spacer(1, 6))
        article_num += 1
        
        # 9. Article - Garanties
        warranties_clause = ContractTemplates.get_warranties_clause(article_num, contract_type)
        paragraphs = warranties_clause.split('\n\n')
        for paragraph in paragraphs:
            if paragraph.strip():
                # Si c'est un titre d'article (commence par "ARTICLE")
                if paragraph.startswith("ARTICLE"):
                    elements.append(Paragraph(paragraph, styles['ContractArticle']))
                # Si c'est un sous-titre (comme "7.1 Garanties de l'Auteur")
                elif paragraph.strip()[0].isdigit() and "." in paragraph.strip()[:3] and len(paragraph.split("\n")[0]) < 50:
                    elements.append(Paragraph(paragraph, styles['ContractSubArticle']))
                else:
                    elements.append(Paragraph(paragraph, styles['ContractText']))
                elements.append(Spacer(1, 6))
        article_num += 1
        
        # 10. Article - Résiliation
        termination_clause = ContractTemplates.get_termination_clause(article_num)
        paragraphs = termination_clause.split('\n\n')
        for paragraph in paragraphs:
            if paragraph.strip():
                # Si c'est un titre d'article (commence par "ARTICLE")
                if paragraph.startswith("ARTICLE"):
                    elements.append(Paragraph(paragraph, styles['ContractArticle']))
                # Si c'est un sous-titre (comme "8.1 Résiliation pour inexécution")
                elif paragraph.strip()[0].isdigit() and "." in paragraph.strip()[:3] and len(paragraph.split("\n")[0]) < 50:
                    elements.append(Paragraph(paragraph, styles['ContractSubArticle']))
                else:
                    elements.append(Paragraph(paragraph, styles['ContractText']))
                elements.append(Spacer(1, 6))
        article_num += 1
        
        # 11. Article - Dispositions diverses
        other_clauses = ContractTemplates.get_other_clauses(article_num, contract_type)
        paragraphs = other_clauses.split('\n\n')
        for paragraph in paragraphs:
            if paragraph.strip():
                # Si c'est un titre d'article (commence par "ARTICLE")
                if paragraph.startswith("ARTICLE"):
                    elements.append(Paragraph(paragraph, styles['ContractArticle']))
                # Si c'est un sous-titre (comme "9.1 Clause de non-dénigrement")
                elif paragraph.strip()[0].isdigit() and "." in paragraph.strip()[:3] and len(paragraph.split("\n")[0]) < 50:
                    elements.append(Paragraph(paragraph, styles['ContractSubArticle']))
                else:
                    elements.append(Paragraph(paragraph, styles['ContractText']))
                elements.append(Spacer(1, 6))
        article_num += 1
        
        # 12. Article - Loi applicable
        law_clause = ContractTemplates.get_applicable_law_clause(article_num)
        paragraphs = law_clause.split('\n\n')
        for paragraph in paragraphs:
            if paragraph.strip():
                # Si c'est un titre d'article (commence par "ARTICLE")
                if paragraph.startswith("ARTICLE"):
                    elements.append(Paragraph(paragraph, styles['ContractArticle']))
                # Si c'est un sous-titre (comme "10.1 Loi applicable")
                elif paragraph.strip()[0].isdigit() and "." in paragraph.strip()[:3] and len(paragraph.split("\n")[0]) < 50:
                    elements.append(Paragraph(paragraph, styles['ContractSubArticle']))
                else:
                    elements.append(Paragraph(paragraph, styles['ContractText']))
                elements.append(Spacer(1, 6))
        
        # 13. Signatures
        elements.append(Spacer(1, 30))
        signatures = ContractTemplates.get_signatures_template(contract_type)
        paragraphs = signatures.split('\n\n')
        for paragraph in paragraphs:
            if paragraph.strip():
                elements.append(Paragraph(paragraph, styles['ContractText']))
                elements.append(Spacer(1, 8))
        
        return elements