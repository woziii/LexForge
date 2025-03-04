"""
Module pour la génération des contrats en format PDF.
"""
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate
from reportlab.pdfbase import pdfform
from reportlab.lib.colors import black

from config import PDF_CONFIG
from contract_builder import ContractBuilder
from utils import create_temp_file, ensure_default_supports


def generate_pdf(contract_type, is_free, author_type, author_info,
                work_description, image_description, supports,
                additional_rights, remuneration, is_exclusive):
    """
    Génère un PDF du contrat avec des champs interactifs.
    
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
    
    # Générer le contenu du contrat
    contract_elements = ContractBuilder.build_contract_elements(
        contract_type, is_free_bool, author_type, author_info,
        work_description, image_description, final_supports,
        additional_rights, remuneration, is_exclusive_bool
    )
    
    # Créer un document PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                           rightMargin=PDF_CONFIG['margin_right']*mm, 
                           leftMargin=PDF_CONFIG['margin_left']*mm,
                           topMargin=PDF_CONFIG['margin_top']*mm, 
                           bottomMargin=PDF_CONFIG['margin_bottom']*mm)
    
    # Construire le document avec tous les éléments
    doc.build(contract_elements)
    
    # Ajouter des champs interactifs pour les signatures
    buffer.seek(0)
    buffer_champs = io.BytesIO()
    
    p = canvas.Canvas(buffer_champs, pagesize=A4)
    form = p.acroForm
    
    # Déterminer le nom du cédant en fonction du type de contrat
    if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
        cedant_label = "l'Auteur et Modèle"
    elif "Auteur (droits d'auteur)" in contract_type:
        cedant_label = "l'Auteur"
    else:
        cedant_label = "le Modèle"
    
    # Champ pour le lieu (position sur dernière page)
    form.textfield(name='lieu', tooltip='Lieu de signature',
                  x=80, y=140, width=100, height=15,
                  borderWidth=0, forceBorder=True)
    
    # Champ pour la date
    form.textfield(name='date', tooltip='Date de signature',
                  x=230, y=140, width=100, height=15, 
                  borderWidth=0, forceBorder=True)
    
    # Champ pour la mention "Lu et approuvé" du cédant
    form.textfield(name='mention_cedant', tooltip='Mention "Lu et approuvé"',
                  x=70, y=95, width=150, height=15,
                  borderWidth=0, forceBorder=True)
    
    # Champ pour la mention "Lu et approuvé" du cessionnaire
    form.textfield(name='mention_cessionnaire', tooltip='Mention "Lu et approuvé"',
                  x=350, y=95, width=150, height=15,
                  borderWidth=0, forceBorder=True)
    
    # Champs pour les signatures
    form.textfield(name='signature_cedant', tooltip=f'Signature de {cedant_label}',
                  x=70, y=60, width=150, height=30,
                  borderWidth=0, forceBorder=True)
    
    form.textfield(name='signature_cessionnaire', tooltip='Signature du Cessionnaire',
                  x=350, y=60, width=150, height=30,
                  borderWidth=0, forceBorder=True)
    
    # Ajouter des champs pour le paraphe sur chaque page
    # Ces champs sont placés en bas de chaque page pour permettre le paraphe
    page_count = doc.page_count
    for page in range(1, page_count):
        p.showPage()  # Aller à la page suivante
        form.textfield(name=f'paraphe_cedant_{page}', tooltip=f'Paraphe {cedant_label} - page {page}',
                      x=70, y=30, width=50, height=20,
                      borderWidth=0, forceBorder=True)
        form.textfield(name=f'paraphe_cessionnaire_{page}', tooltip=f'Paraphe Cessionnaire - page {page}',
                      x=350, y=30, width=50, height=20,
                      borderWidth=0, forceBorder=True)
    
    # Finaliser et sauvegarder le PDF
    p.save()
    
    # Sauvegarder le PDF dans un fichier temporaire
    with open(output_filename, 'wb') as f:
        f.write(buffer.getvalue())
        f.write(buffer_champs.getvalue())
    
    return output_filename


def add_interactive_fields(pdf_path, contract_type):
    """
    Ajoute des champs interactifs à un PDF existant.
    
    Args:
        pdf_path (str): Chemin vers le PDF
        contract_type (list): Liste des types de contrats sélectionnés
        
    Returns:
        str: Chemin vers le PDF avec champs interactifs
    """
    # Ce code peut être utilisé si on veut ajouter des champs à un PDF existant
    # plutôt que de les créer en même temps
    output_filename = create_temp_file(prefix="contrat_interactif_", suffix=".pdf")
    
    p = canvas.Canvas(output_filename, pagesize=A4)
    form = p.acroForm
    
    # Déterminer le nom du cédant en fonction du type de contrat
    if "Auteur (droits d'auteur)" in contract_type and "Image (droit à l'image)" in contract_type:
        cedant_label = "l'Auteur et Modèle"
    elif "Auteur (droits d'auteur)" in contract_type:
        cedant_label = "l'Auteur"
    else:
        cedant_label = "le Modèle"
    
    # Ajouter des champs similaires à ceux de la fonction generate_pdf
    # Ici, on assume que le PDF a une structure similaire
    
    # Sauvegarder le PDF
    p.save()
    
    return output_filename