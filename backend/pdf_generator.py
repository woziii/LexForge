"""
Module pour la génération des contrats en format PDF.
Module optimisé pour une génération plus complète et détaillée.
"""
import io
import os
import reportlab
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.pdfbase import pdfform
from reportlab.lib.colors import black, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import getSampleStyleSheet
import time
import uuid
from datetime import datetime

from config import PDF_CONFIG
from contract_builder import ContractBuilder
from utils import ensure_default_supports
from contract_templates import ContractTemplates  # Import this to use title generation

# Vérifier si les polices sont disponibles, sinon utiliser des polices par défaut
try:
    pdfmetrics.registerFont(TTFont('Vera', 'Vera.ttf'))
    pdfmetrics.registerFont(TTFont('VeraBd', 'VeraBd.ttf'))
except:
    # Utiliser des polices par défaut si les polices personnalisées ne sont pas disponibles
    pass

# Définir le chemin du répertoire temporaire
TMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tmp')

def create_temp_file(prefix="", suffix=""):
    """
    Crée un fichier temporaire compatible avec Vercel.
    """
    # Créer le répertoire tmp s'il n'existe pas
    if not os.path.exists(TMP_DIR):
        os.makedirs(TMP_DIR)
    
    # Générer un nom de fichier unique
    filename = os.path.join(TMP_DIR, f"{prefix}{uuid.uuid4().hex}{suffix}")
    return filename

def generate_pdf(contract_type, is_free, author_type, author_info,
                work_description, image_description, supports,
                additional_rights, remuneration, is_exclusive, cessionnaire_info=None):
    """
    Génère un PDF du contrat avec des champs interactifs.
    
    Args:
        contract_type (list): Liste des types de contrats sélectionnés
        is_free (str): Type de cession ("Gratuite" ou "Onéreuse")
        author_type (str): Type d'auteur ("Personne physique" ou "Personne morale")
        author_info (dict): Informations sur l'auteur
        work_description (str): Description de l'œuvre
        image_description (str): Description de l'image
        supports (list): Liste des supports sélectionnés
        additional_rights (list): Liste des droits supplémentaires sélectionnés
        remuneration (str): Modalités de rémunération
        is_exclusive (bool): True si la cession est exclusive, False sinon
        cessionnaire_info (dict, optional): Informations sur le cessionnaire
        
    Returns:
        str: Chemin vers le fichier PDF généré
    """
    # Conversion des paramètres
    is_free_bool = (is_free == "Gratuite")
    # L'exclusivité n'est possible que si la cession est onéreuse
    is_exclusive_bool = bool(is_exclusive) and not is_free_bool
    
    # Filtrer les droits supplémentaires si la cession est gratuite
    final_additional_rights = [] if is_free_bool else additional_rights
    
    # Ajouter les supports par défaut
    final_supports = ensure_default_supports(supports)
    
    # Créer un nom de fichier temporaire pour le PDF
    output_filename = create_temp_file(prefix="contrat_cession_", suffix=".pdf")
    
    # Générer le contenu du contrat avec les paramètres mis à jour
    contract_elements = ContractBuilder.build_contract_elements(
        contract_type, is_free_bool, author_type, author_info,
        work_description, image_description, final_supports,
        final_additional_rights, remuneration, is_exclusive_bool,
        cessionnaire_info=cessionnaire_info
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