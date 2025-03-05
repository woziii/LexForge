"""
Module pour la génération des contrats en format PDF.
Module optimisé pour une génération plus rapide et efficace.
"""
import io
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


def generate_pdf(contract_type, is_free, author_type, author_info,
                work_description, image_description, supports,
                additional_rights, remuneration, is_exclusive):
    """
    Génère un PDF du contrat avec des champs interactifs.
    Version optimisée pour une génération plus rapide.
    
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
    
    # Générer le contenu du contrat - version simplifiée pour plus de rapidité
    contract_elements = ContractBuilder.build_contract_elements(
        contract_type, is_free_bool, author_type, author_info,
        work_description, image_description, final_supports,
        additional_rights, remuneration, is_exclusive_bool
    )
    
    # Créer un document PDF avec moins d'options pour accélérer la génération
    buffer = io.BytesIO()
    
    # Utiliser des marges plus petites et des réglages plus simples
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4,
        rightMargin=15*mm, 
        leftMargin=15*mm,
        topMargin=15*mm, 
        bottomMargin=15*mm
    )
    
    # Construire le document en une seule passe
    doc.build(contract_elements)
    
    # Ajouter des champs interactifs pour les signatures
    buffer.seek(0)
    
    # Version simplifiée des champs interactifs dans un second fichier
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
    
    form.textfield(name='signature_cedant', tooltip=f'Signature de {cedant_label}',
                  x=70, y=60, width=150, height=30,
                  borderWidth=0, forceBorder=True)
    
    form.textfield(name='signature_cessionnaire', tooltip='Signature du Cessionnaire',
                  x=350, y=60, width=150, height=30,
                  borderWidth=0, forceBorder=True)
    
    # Ne pas essayer d'ajouter des champs de paraphe sur chaque page
    # Cela causait une erreur car SimpleDocTemplate n'a pas d'attribut page_count
    
    # Finaliser et sauvegarder le PDF
    p.save()
    
    # Sauvegarder le PDF dans un fichier
    with open(output_filename, 'wb') as f:
        f.write(buffer.getvalue())
    
    return output_filename


def get_simplified_styles():
    """
    Retourne des styles simplifiés pour une génération plus rapide.
    
    Returns:
        dict: Dictionnaire des styles simplifiés
    """
    styles = getSampleStyleSheet()
    # Utiliser des styles plus simples avec moins d'options
    styles.add(ParagraphStyle(name='ContractTitle', 
                             fontName='Helvetica-Bold', 
                             fontSize=14, 
                             alignment=TA_CENTER,
                             spaceAfter=10))
    styles.add(ParagraphStyle(name='ContractText', 
                             fontName='Helvetica', 
                             fontSize=10, 
                             alignment=TA_JUSTIFY,
                             spaceAfter=5))
    styles.add(ParagraphStyle(name='ContractArticle', 
                             fontName='Helvetica-Bold', 
                             fontSize=11, 
                             spaceAfter=5))
    return styles