"""
Module pour la génération des contrats en format PDF.
Module optimisé pour une génération plus complète et détaillée.
"""
import io
import reportlab
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.pdfbase import pdfform
from reportlab.lib.colors import black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import time

from config import PDF_CONFIG
from contract_builder import ContractBuilder
from utils import create_temp_file, ensure_default_supports
from contract_templates import ContractTemplates

pdfmetrics.registerFont(TTFont('Vera', 'Vera.ttf'))
pdfmetrics.registerFont(TTFont('VeraBd', 'VeraBd.ttf'))

def get_simplified_styles():
    """
    Retourne des styles simplifiés pour la génération du PDF.
    
    Returns:
        dict: Dictionnaire des styles simplifiés
    """
    styles = getSampleStyleSheet()
    # Utiliser des styles plus simples avec moins d'options
    styles.add(ParagraphStyle(name='ContractTitle', 
                             fontName='VeraBd', 
                             fontSize=14, 
                             alignment=TA_CENTER,
                             spaceAfter=10))
    styles.add(ParagraphStyle(name='ContractText', 
                             fontName='Vera', 
                             fontSize=10, 
                             alignment=TA_JUSTIFY,
                             spaceAfter=5))
    styles.add(ParagraphStyle(name='ContractArticle', 
                             fontName='VeraBd', 
                             fontSize=11, 
                             spaceAfter=5))
    return styles

def generate_pdf(contract_type, is_free, author_type, author_info,
                work_description, image_description, supports,
                additional_rights, remuneration, is_exclusive):
    """
    Génère un PDF du contrat avec des champs interactifs.
    Version optimisée pour une génération plus rapide et détaillée.
    
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
    styles = get_simplified_styles()
    
    # Créer un buffer pour le PDF
    buffer = io.BytesIO()
    
    # Créer le document PDF avec des marges adaptées
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4,
        rightMargin=15*mm, 
        leftMargin=15*mm,
        topMargin=15*mm, 
        bottomMargin=15*mm
    )
    
    # Liste pour stocker les éléments du document
    elements = []
    
    # Titre du contrat
    elements.append(Paragraph(ContractTemplates.get_title(contract_type), styles['ContractTitle']))
    
    # Préambule
    elements.append(Paragraph("ENTRE LES SOUSSIGNÉS :", styles['ContractArticle']))
    
    # Informations sur l'auteur/modèle (Section inspirée du fichier preview)
    if author_type == "Personne physique":
        gentille = author_info.get("gentille", "M.")
        nom = author_info.get("nom", "")
        prenom = author_info.get("prenom", "")
        date_naissance = author_info.get("date_naissance", "")
        nationalite = author_info.get("nationalite", "")
        adresse = author_info.get("adresse", "")
        contact = author_info.get("contact", "")
        
        author_description = f"{gentille} {prenom} {nom}"
        if date_naissance:
            author_description += f", né(e) le {date_naissance}"
        if nationalite:
            author_description += f", de nationalité {nationalite}"
        author_description += f", domicilié(e) au {adresse}"
        if contact:
            author_description += f", joignable à {contact}"
        
        elements.append(Paragraph(author_description, styles['ContractText']))
    else:
        # Personne morale
        nom_societe = author_info.get("nom_societe", "")
        statut = author_info.get("statut", "")
        rcs = author_info.get("rcs", "")
        siege = author_info.get("siege", "")
        contact = author_info.get("contact", "")
        
        entity_description = f"La société {nom_societe}, {statut}, immatriculée sous le numéro {rcs} au Registre du Commerce et des Sociétés, dont le siège social est situé {siege}"
        if contact:
            entity_description += f", joignable à {contact}"
        
        elements.append(Paragraph(entity_description, styles['ContractText']))
    
    # Dénomination de l'auteur
    if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
        denomination = "ci-après dénommé(e) \"l'Auteur et le Modèle\","
    elif "Auteur (droits d'auteur)" in contract_type:
        denomination = "ci-après dénommé(e) \"l'Auteur\","
    else:
        denomination = "ci-après dénommé(e) \"le Modèle\","
    
    elements.append(Paragraph(denomination, styles['ContractText']))
    
    # Informations sur Tellers
    elements.append(Paragraph("Tellers, société par actions simplifiée unipersonnelle au capital de 1000 €, " +
                             "immatriculée sous le numéro 932 553 266 R.C.S. Lyon, et dont le siège social est situé au : " +
                             "12 RUE DE LA PART-DIEU, 69003 LYON, représentée par son Président en exercice dûment habilité à l'effet des présentes, " +
                             "ci-après dénommée \"le Cessionnaire\",", styles['ContractText']))
    
    # Introduction
    elements.append(Paragraph("Ci-après dénommées ensemble \"les Parties\" ou individuellement \"la Partie\",", styles['ContractText']))
    elements.append(Paragraph("CECI EXPOSÉ, IL A ÉTÉ CONVENU CE QUI SUIT :", styles['ContractArticle']))
    
    # ARTICLE 1 - OBJET DU CONTRAT
    elements.append(Paragraph("ARTICLE 1 – OBJET DU CONTRAT", styles['ContractArticle']))
    
    # Œuvre concernée si droits d'auteur
    if "Auteur (droits d'auteur)" in contract_type:
        elements.append(Paragraph("1.1 Œuvre concernée", styles['ContractText']))
        elements.append(Paragraph("L'Auteur déclare être le créateur et titulaire exclusif des droits d'auteur sur l'œuvre suivante :", 
                                   styles['ContractText']))
        elements.append(Paragraph(work_description, styles['ContractText']))
    
    # Image concernée si droit à l'image
    if "Image (droit à l'image)" in contract_type:
        elements.append(Paragraph("1.2 Images concernées", styles['ContractText']))
        elements.append(Paragraph("Le Modèle autorise l'utilisation de son image telle qu'elle apparaît dans :", 
                                   styles['ContractText']))
        elements.append(Paragraph(image_description, styles['ContractText']))
    
    # ARTICLE 2 - DROITS CÉDÉS
    elements.append(Paragraph("ARTICLE 2 – ÉTENDUE DES DROITS CÉDÉS", styles['ContractArticle']))
    
    # Détails de la cession
    cession_details = "L'Auteur cède au Cessionnaire, "
    cession_details += "à titre exclusif, " if is_exclusive_bool else "à titre non exclusif, "
    cession_details += "gratuitement et pour la durée précisée à l'article 4, les droits patrimoniaux suivants :" if is_free_bool else "pour la durée précisée à l'article 4 et moyennant rémunération, les droits suivants :"
    
    elements.append(Paragraph(cession_details, styles['ContractText']))
    
    # Droits patrimoniaux
    elements.append(Paragraph("- Droit de reproduction", styles['ContractText']))
    elements.append(Paragraph("- Droit de représentation", styles['ContractText']))
    
    # Droits supplémentaires
    if not is_free_bool and additional_rights:
        elements.append(Paragraph("Droits supplémentaires inclus :", styles['ContractText']))
        for right in additional_rights:
            short_name = right.split(" - ")[0] if " - " in right else right
            elements.append(Paragraph(f"- {short_name}", styles['ContractText']))
    
    # Générer le reste du document avec les articles standards
    # (durée, territoire, supports, rémunération, etc.)
    remaining_articles = [
        ("Durée et Territoire", "La cession est consentie pour une durée d'un (1) an, renouvelable par tacite reconduction. Elle est valable pour le monde entier."),
        ("Supports d'Exploitation", "Les supports sont : " + ", ".join(final_supports)),
        ("Rémunération", remuneration if not is_free_bool else "La cession est consentie à titre gratuit.")
    ]
    
    for i, (title, content) in enumerate(remaining_articles, start=3):
        elements.append(Paragraph(f"ARTICLE {i} – {title.upper()}", styles['ContractArticle']))
        elements.append(Paragraph(content, styles['ContractText']))
    
    # Signature
    elements.append(Paragraph("Fait à ________________, le ________________", styles['ContractText']))
    elements.append(Paragraph("En deux exemplaires originaux.", styles['ContractText']))
    
    # Lignes de signature
    if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
        signature_text = "Pour l'Auteur et Modèle :                                Pour le Cessionnaire :"
    elif "Auteur (droits d'auteur)" in contract_type:
        signature_text = "Pour l'Auteur :                                          Pour le Cessionnaire :"
    else:
        signature_text = "Pour le Modèle :                                         Pour le Cessionnaire :"
    
    elements.append(Paragraph(signature_text, styles['ContractText']))
    
    # Construire le document
    doc.build(elements)
    
    # Sauvegarder le PDF
    with open(output_filename, 'wb') as f:
        f.write(buffer.getvalue())
    
    # Ajouter des champs interactifs pour les signatures
    p = canvas.Canvas(output_filename, pagesize=A4)
    form = p.acroForm
    
    # Champs de signature interactifs
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
    
    # Sauvegarder les modifications
    p.save()
    
    return output_filename