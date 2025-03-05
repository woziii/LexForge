"""
Module pour la génération des contrats en format PDF.
Module optimisé pour une génération plus complète et détaillée.
"""
import io
import reportlab
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.pdfbase import pdfform
from reportlab.lib.colors import black, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import getSampleStyleSheet
import time

from config import PDF_CONFIG
from contract_builder import ContractBuilder
from utils import create_temp_file, ensure_default_supports
from contract_templates import ContractTemplates  # Import this to use title generation

pdfmetrics.registerFont(TTFont('Vera', 'Vera.ttf'))
pdfmetrics.registerFont(TTFont('VeraBd', 'VeraBd.ttf'))

def _format_physical_person_details(author_info, contract_type, styles):
    """
    Formate les détails d'une personne physique pour le contrat PDF.
    
    Args:
        author_info (dict): Informations sur l'auteur
        contract_type (list): Types de contrat
        styles (dict): Styles de paragraphe
    
    Returns:
        list: Éléments de paragraphe pour les détails de l'auteur
    """
    elements = []
    gentille = author_info.get("gentille", "M.")
    nom = author_info.get("nom", "")
    prenom = author_info.get("prenom", "")
    date_naissance = author_info.get("date_naissance", "")
    nationalite = author_info.get("nationalite", "")
    adresse = author_info.get("adresse", "")
    contact = author_info.get("contact", "")
    
    # Construire la description de l'auteur
    author_description = f"{gentille} {prenom} {nom}"
    if date_naissance:
        author_description += f", né(e) le {date_naissance}"
    if nationalite:
        author_description += f", de nationalité {nationalite}"
    author_description += f", domicilié(e) au {adresse}"
    if contact:
        author_description += f", joignable à {contact}"
    
    # Ajouter la description
    elements.append(Paragraph(author_description, styles['ContractNormalText']))
    elements.append(Spacer(1, 6))
    
    # Dénomination de l'auteur
    if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
        denomination = "ci-après dénommé(e) \"l'Auteur et le Modèle\","
    elif "Auteur (droits d'auteur)" in contract_type:
        denomination = "ci-après dénommé(e) \"l'Auteur\","
    else:
        denomination = "ci-après dénommé(e) \"le Modèle\","
    
    elements.append(Paragraph(denomination, styles['ContractNormalText']))
    elements.append(Spacer(1, 6))
    
    return elements

def _format_legal_entity_details(author_info, contract_type, styles):
    """
    Formate les détails d'une personne morale pour le contrat PDF.
    
    Args:
        author_info (dict): Informations sur l'entité légale
        contract_type (list): Types de contrat
        styles (dict): Styles de paragraphe
    
    Returns:
        list: Éléments de paragraphe pour les détails de l'entité
    """
    elements = []
    nom_societe = author_info.get("nom_societe", "")
    statut = author_info.get("statut", "")
    rcs = author_info.get("rcs", "")
    siege = author_info.get("siege", "")
    contact = author_info.get("contact", "")
    
    # Construire la description de l'entité
    entity_description = f"La société {nom_societe}, {statut}, immatriculée sous le numéro {rcs} au Registre du Commerce et des Sociétés, dont le siège social est situé {siege}"
    if contact:
        entity_description += f", joignable à {contact}"
    
    # Ajouter la description
    elements.append(Paragraph(entity_description, styles['ContractNormalText']))
    elements.append(Spacer(1, 6))
    
    # Dénomination de l'auteur
    if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
        denomination = "ci-après dénommée \"l'Auteur et le Modèle\","
    elif "Auteur (droits d'auteur)" in contract_type:
        denomination = "ci-après dénommée \"l'Auteur\","
    else:
        denomination = "ci-après dénommée \"le Modèle\","
    
    elements.append(Paragraph(denomination, styles['ContractNormalText']))
    elements.append(Spacer(1, 6))
    
    return elements

def get_enriched_styles():
    """
    Retourne des styles enrichis pour la génération du PDF.
    
    Returns:
        dict: Dictionnaire des styles enrichis
    """
    styles = getSampleStyleSheet()
    
    # Style pour le titre du contrat
    styles.add(ParagraphStyle(
        name='ContractTitle', 
        fontName='VeraBd', 
        fontSize=16, 
        alignment=TA_CENTER,
        spaceAfter=12,
        textColor=black
    ))
    
    # Style pour les titres de section
    styles.add(ParagraphStyle(
        name='ContractSectionHeader', 
        fontName='VeraBd', 
        fontSize=12, 
        alignment=TA_LEFT,
        spaceAfter=6,
        textColor=black
    ))
    
    # Style pour les articles principaux
    styles.add(ParagraphStyle(
        name='ContractArticle', 
        fontName='VeraBd', 
        fontSize=12, 
        alignment=TA_LEFT,
        spaceAfter=6,
        textColor=black
    ))
    
    # Style pour les sous-articles
    styles.add(ParagraphStyle(
        name='ContractSubArticle', 
        fontName='VeraBd', 
        fontSize=11, 
        alignment=TA_LEFT,
        spaceAfter=6,
        textColor=black
    ))
    
    # Style pour le texte normal du contrat
    styles.add(ParagraphStyle(
        name='ContractNormalText', 
        fontName='Vera', 
        fontSize=10, 
        alignment=TA_JUSTIFY,
        spaceAfter=6,
        textColor=black
    ))
    
    # Style pour les éléments de liste
    styles.add(ParagraphStyle(
        name='ContractListItem', 
        fontName='Vera', 
        fontSize=10, 
        alignment=TA_LEFT,
        spaceAfter=3,
        textColor=black,
        leftIndent=20
    ))
    
    return styles

def generate_pdf(contract_type, is_free, author_type, author_info,
                work_description, image_description, supports,
                additional_rights, remuneration, is_exclusive):
    """
    Génère un PDF du contrat avec des champs interactifs et tous les détails.
    
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
        str: Chemin vers le fichier PDF généré
    """
    # Conversion des paramètres
    is_free_bool = (is_free == "Gratuite")
    is_exclusive_bool = bool(is_exclusive)
    
    # Ajouter les supports par défaut
    final_supports = ensure_default_supports(supports)
    
    # Créer un nom de fichier temporaire pour le PDF
    output_filename = create_temp_file(prefix="contrat_cession_", suffix=".pdf")
    
    # Préparer les styles
    styles = get_enriched_styles()
    
    # Créer un buffer pour le PDF
    buffer = io.BytesIO()
    
    # Créer le document PDF avec des marges adaptées
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4,
        rightMargin=25*mm, 
        leftMargin=25*mm,
        topMargin=20*mm, 
        bottomMargin=20*mm
    )
    
    # Liste pour stocker les éléments du document
    elements = []
    
    # Titre du contrat
    title = Paragraph(ContractTemplates.get_title(contract_type), styles['ContractTitle'])
    elements.append(title)
    elements.append(Spacer(1, 12))
    
    # Ajouter le préambule
    elements.append(Paragraph("ENTRE LES SOUSSIGNÉS :", styles['ContractSectionHeader']))
    elements.append(Spacer(1, 6))
    
    # Informations sur l'auteur/modèle
    if author_type == "Personne physique":
        author_details = _format_physical_person_details(author_info, contract_type, styles)
        elements.extend(author_details)
    else:
        author_details = _format_legal_entity_details(author_info, contract_type, styles)
        elements.extend(author_details)
    
    # Informations sur Tellers
    elements.append(Paragraph("Tellers, société par actions simplifiée unipersonnelle au capital de 1000 €, " +
                             "immatriculée sous le numéro 932 553 266 R.C.S. Lyon, et dont le siège social est situé au : " +
                             "12 RUE DE LA PART-DIEU, 69003 LYON, représentée par son Président en exercice dûment habilité à l'effet des présentes, " +
                             "ci-après dénommée \"le Cessionnaire\",", styles['ContractNormalText']))
    elements.append(Spacer(1, 6))
    
    # Introduction
    elements.append(Paragraph("Ci-après dénommées ensemble \"les Parties\" ou individuellement \"la Partie\",", styles['ContractNormalText']))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("CECI EXPOSÉ, IL A ÉTÉ CONVENU CE QUI SUIT :", styles['ContractSectionHeader']))
    elements.append(Spacer(1, 12))
    
    # ARTICLE 1 - OBJET DU CONTRAT
    elements.append(Paragraph("ARTICLE 1 – OBJET DU CONTRAT", styles['ContractArticle']))
    elements.append(Spacer(1, 6))
    
    # Œuvre concernée si droits d'auteur
    if "Auteur (droits d'auteur)" in contract_type:
        elements.append(Paragraph("1.1 Œuvre concernée", styles['ContractSubArticle']))
        elements.append(Paragraph("L'Auteur déclare être le créateur et titulaire exclusif des droits d'auteur sur l'œuvre suivante :", 
                                   styles['ContractNormalText']))
        elements.append(Paragraph(work_description, styles['ContractNormalText']))
        elements.append(Spacer(1, 6))
    
    # Image concernée si droit à l'image
    if "Image (droit à l'image)" in contract_type:
        elements.append(Paragraph("1.2 Images concernées", styles['ContractSubArticle']))
        elements.append(Paragraph("Le Modèle autorise l'utilisation de son image telle qu'elle apparaît dans :", 
                                   styles['ContractNormalText']))
        elements.append(Paragraph(image_description, styles['ContractNormalText']))
        elements.append(Spacer(1, 6))
    
    # ARTICLE 2 - DROITS CÉDÉS
    elements.append(Paragraph("ARTICLE 2 – ÉTENDUE DES DROITS CÉDÉS", styles['ContractArticle']))
    elements.append(Spacer(1, 6))
    
    elements.append(Paragraph("2.1 Nature de la cession", styles['ContractSubArticle']))
    
    # Détails de la cession
    cession_details = "L'Auteur cède au Cessionnaire, "
    cession_details += "à titre exclusif, " if is_exclusive_bool else "à titre non exclusif, "
    cession_details += "gratuitement et pour la durée précisée à l'article 4, les droits patrimoniaux suivants :" if is_free_bool else "pour la durée précisée à l'article 4 et moyennant rémunération, les droits suivants :"
    
    elements.append(Paragraph(cession_details, styles['ContractNormalText']))
    elements.append(Spacer(1, 6))
    
    elements.append(Paragraph("2.2 Droits patrimoniaux cédés", styles['ContractSubArticle']))
    
    # Droits de base
    elements.append(Paragraph("- Droit de reproduction", styles['ContractListItem']))
    elements.append(Paragraph("- Droit de représentation", styles['ContractListItem']))
    
    # Droits supplémentaires
    if not is_free_bool and additional_rights:
        elements.append(Paragraph("Droits supplémentaires inclus :", styles['ContractNormalText']))
        for right in additional_rights:
            short_name = right.split(" - ")[0] if " - " in right else right
            elements.append(Paragraph(f"- {short_name}", styles['ContractListItem']))
    
    elements.append(Spacer(1, 6))
    
    # Article sur l'image si applicable
    article_num = 3
    if "Image (droit à l'image)" in contract_type:
        elements.append(Paragraph(f"ARTICLE {article_num} – AUTORISATION D'EXPLOITATION DE L'IMAGE", styles['ContractArticle']))
        elements.append(Spacer(1, 6))
        
        image_rights_details = "Le Modèle autorise expressément le Cessionnaire à exploiter son image "
        image_rights_details += "à titre exclusif" if is_exclusive_bool else "à titre non exclusif"
        image_rights_details += " et gratuit" if is_free_bool else ""
        image_rights_details += " selon les modalités détaillées dans le contrat complet."
        
        elements.append(Paragraph(image_rights_details, styles['ContractNormalText']))
        elements.append(Spacer(1, 6))
        
        article_num += 1
    
    # Article DURÉE ET TERRITOIRE
    elements.append(Paragraph(f"ARTICLE {article_num} – DURÉE ET TERRITOIRE", styles['ContractArticle']))
    elements.append(Spacer(1, 6))
    
    elements.append(Paragraph("4.1 Durée", styles['ContractSubArticle']))
    elements.append(Paragraph("La cession est consentie pour une durée d'un (1) an, renouvelable par tacite reconduction.", 
                               styles['ContractNormalText']))
    elements.append(Spacer(1, 6))
    
    elements.append(Paragraph("4.2 Territoire", styles['ContractSubArticle']))
    elements.append(Paragraph("La cession est consentie pour le monde entier.", styles['ContractNormalText']))
    elements.append(Spacer(1, 6))
    
    article_num += 1
    
    # Article SUPPORTS D'EXPLOITATION
    elements.append(Paragraph(f"ARTICLE {article_num} – SUPPORTS D'EXPLOITATION", styles['ContractArticle']))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("5.1 Supports autorisés", styles['ContractSubArticle']))
    elements.append(Paragraph("Les supports d'exploitation autorisés sont :", styles['ContractNormalText']))
    
    for support in final_supports:
        elements.append(Paragraph(f"- {support}", styles['ContractListItem']))
    
    elements.append(Spacer(1, 6))
    article_num += 1
    
    # Article RÉMUNÉRATION
    elements.append(Paragraph(f"ARTICLE {article_num} – RÉMUNÉRATION", styles['ContractArticle']))
    elements.append(Spacer(1, 6))
    
    if is_free_bool:
        elements.append(Paragraph("La présente cession est consentie à titre gratuit, sans contrepartie financière.", 
                                   styles['ContractNormalText']))
    else:
        elements.append(Paragraph("En contrepartie de la présente cession, le Cessionnaire versera au Cédant :", 
                                   styles['ContractNormalText']))
        elements.append(Paragraph(remuneration, styles['ContractNormalText']))
    
    elements.append(Spacer(1, 6))
    article_num += 1
    
    # Articles supplémentaires (résumés)
    articles_complementaires = [
        "GARANTIES ET RESPONSABILITÉS",
        "RÉSILIATION",
        "DISPOSITIONS DIVERSES",
        "LOI APPLICABLE ET JURIDICTION COMPÉTENTE"
    ]
    
    for art in articles_complementaires:
        elements.append(Paragraph(f"ARTICLE {article_num} – {art}", styles['ContractArticle']))
        elements.append(Spacer(1, 6))
        article_num += 1
    
    # Signature
    elements.append(Paragraph("Fait à ________________, le ________________", styles['ContractNormalText']))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("En deux exemplaires originaux.", styles['ContractNormalText']))
    elements.append(Spacer(1, 12))
    
    # Lignes de signature
    signature_text = ""
    if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
        signature_text = "Pour l'Auteur et Modèle :                                Pour le Cessionnaire :"
    elif "Auteur (droits d'auteur)" in contract_type:
        signature_text = "Pour l'Auteur :                                          Pour le Cessionnaire :"
    else:
        signature_text = "Pour le Modèle :                                         Pour le Cessionnaire :"
    
    elements.append(Paragraph(signature_text, styles['ContractNormalText']))
    
    # Construire le document
    doc.build(elements)
    
    # Sauvegarder le PDF
    with open(output_filename, 'wb') as f:
        f.write(buffer.getvalue())
    
    # Ajouter des champs interactifs pour les signatures
    p = canvas.Canvas(output_filename, pagesize=A4)
    form = p.acroForm
    
    # Déterminer le nom du cédant en fonction du type de contrat
    if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
        cedant_label = "l'Auteur et Modèle"
    elif "Auteur (droits d'auteur)" in contract_type:
        cedant_label = "l'Auteur"
    else:
        cedant_label = "le Modèle"
    
    # Ajouter seulement les champs essentiels
    form.textfield(name='lieu', tooltip='Lieu de signature',
                  x=80, y=120, width=100, height=15,
                  borderWidth=0, forceBorder=True)
    
    form.textfield(name='date', tooltip='Date de signature',
                  x=230, y=120, width=100, height=15, 
                  borderWidth=0, forceBorder=True)
    
    form.textfield(name='mention_cedant', tooltip='Mention "Lu et approuvé"',
                  x=70, y=95, width=150, height=15,
                  borderWidth=0, forceBorder=True)
    
    form.textfield(name='mention_cessionnaire', tooltip='Mention "Lu et approuvé"',
                  x=350, y=95, width=150, height=15,
                  borderWidth=0, forceBorder=True)