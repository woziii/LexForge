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
        
        Returns:
            dict: Dictionnaire des styles
        """
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='Titre', 
                                 fontName='Helvetica-Bold', 
                                 fontSize=14, 
                                 alignment=TA_CENTER,
                                 spaceAfter=12))
        styles.add(ParagraphStyle(name='Sous-titre', 
                                 fontName='Helvetica-Bold', 
                                 fontSize=12, 
                                 spaceAfter=10))
        styles.add(ParagraphStyle(name='Normal', 
                                 fontName='Helvetica', 
                                 fontSize=10, 
                                 alignment=TA_JUSTIFY,
                                 spaceAfter=6))
        styles.add(ParagraphStyle(name='Article', 
                                 fontName='Helvetica-Bold', 
                                 fontSize=11, 
                                 spaceAfter=8))
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
        elements.append(Paragraph(title, styles['Titre']))
        elements.append(Spacer(1, 10))
        
        # 2. Préambule
        preamble_text = ContractTemplates.get_preamble_text(contract_type, author_type, author_info)
        for paragraph in preamble_text.split('\n\n'):
            if paragraph.strip():
                elements.append(Paragraph(paragraph, styles['Normal']))
                elements.append(Spacer(1, 6))
        
        # 3. Article 1 - Objet
        object_clause = ContractTemplates.get_object_clause(
            contract_type, 
            sanitize_text(work_description), 
            sanitize_text(image_description)
        )
        elements.append(Paragraph(object_clause, styles['Article']))
        elements.append(Spacer(1, 10))
        
        # Compteur d'articles
        article_num = 2
        
        # 4. Article 2 - Droits cédés (pour contrat droits d'auteur)
        if "Auteur (droits d'auteur)" in contract_type:
            rights_clause = ContractTemplates.get_author_rights_clause(is_free, is_exclusive, additional_rights)
            for paragraph in rights_clause.split('\n\n'):
                if paragraph.strip():
                    elements.append(Paragraph(paragraph, styles['Normal']))
                    elements.append(Spacer(1, 6))
            article_num += 1
        
        # 5. Article sur les droits à l'image (pour contrat droit à l'image)
        if "Image (droit à l'image)" in contract_type:
            image_rights_article_num = article_num if "Auteur (droits d'auteur)" not in contract_type else article_num
            image_clause = ContractTemplates.get_image_rights_clause(is_free, is_exclusive)
            image_clause = image_clause.replace("Article 2", f"Article {image_rights_article_num}")
            for paragraph in image_clause.split('\n\n'):
                if paragraph.strip():
                    elements.append(Paragraph(paragraph, styles['Normal']))
                    elements.append(Spacer(1, 6))
            article_num += 1
        
        # 6. Article - Durée et territoire
        duration_clause = ContractTemplates.get_duration_territory_clause(article_num)
        for paragraph in duration_clause.split('\n\n'):
            if paragraph.strip():
                elements.append(Paragraph(paragraph, styles['Normal']))
                elements.append(Spacer(1, 6))
        article_num += 1
        
        # 7. Article - Supports d'exploitation
        final_supports = ensure_default_supports(supports)
        supports_clause = ContractTemplates.get_supports_clause(article_num, final_supports)
        for paragraph in supports_clause.split('\n\n'):
            if paragraph.strip():
                elements.append(Paragraph(paragraph, styles['Normal']))
                elements.append(Spacer(1, 6))
        article_num += 1
        
        # 8. Article - Rémunération
        remuneration_clause = ContractTemplates.get_remuneration_clause(article_num, is_free, sanitize_text(remuneration))
        for paragraph in remuneration_clause.split('\n\n'):
            if paragraph.strip():
                elements.append(Paragraph(paragraph, styles['Normal']))
                elements.append(Spacer(1, 6))
        article_num += 1
        
        # 9. Article - Garanties
        warranties_clause = ContractTemplates.get_warranties_clause(article_num, contract_type)
        for paragraph in warranties_clause.split('\n\n'):
            if paragraph.strip():
                elements.append(Paragraph(paragraph, styles['Normal']))
                elements.append(Spacer(1, 6))
        article_num += 1
        
        # 10. Article - Résiliation
        termination_clause = ContractTemplates.get_termination_clause(article_num)
        for paragraph in termination_clause.split('\n\n'):
            if paragraph.strip():
                elements.append(Paragraph(paragraph, styles['Normal']))
                elements.append(Spacer(1, 6))
        article_num += 1
        
        # 11. Article - Loi applicable
        law_clause = ContractTemplates.get_applicable_law_clause(article_num)
        for paragraph in law_clause.split('\n\n'):
            if paragraph.strip():
                elements.append(Paragraph(paragraph, styles['Normal']))
                elements.append(Spacer(1, 6))
        
        # 12. Signatures
        elements.append(Spacer(1, 20))
        signatures = ContractTemplates.get_signatures_template(contract_type)
        for paragraph in signatures.split('\n\n'):
            if paragraph.strip():
                elements.append(Paragraph(paragraph, styles['Normal']))
                elements.append(Spacer(1, 8))
        
        return elements
