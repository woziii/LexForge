"""
Point d'entrée principal de l'API backend.
Fournit les endpoints pour l'analyse de projet, la prévisualisation et la génération de PDF.
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys

# Import des modules locaux
from text_analyzer import analyze_work_description, get_explanation
from contract_previewer import preview_contract
from pdf_generator import generate_pdf
from utils import collect_author_info, ensure_default_supports

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Configuration CORS plus permissive pour le déploiement

# Définir le répertoire temporaire pour les fichiers PDF
if not os.path.exists('tmp'):
    os.makedirs('tmp')

@app.route('/api', methods=['GET'])
def index():
    """
    Route racine pour vérifier que l'API est en ligne.
    """
    return jsonify({
        'status': 'online',
        'message': 'LexForge API is running'
    })

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    Endpoint pour analyser la description du projet et suggérer des types de contrat.
    """
    data = request.json
    description = data.get('description', '')
    
    if not description:
        return jsonify({'error': 'Description is required'}), 400
    
    # Analyser la description et obtenir les suggestions
    contract_types = analyze_work_description(description)
    explanation = get_explanation(contract_types)
    
    return jsonify({
        'contract_types': contract_types,
        'suggestion': explanation
    })

@app.route('/api/preview', methods=['POST'])
def preview():
    """
    Endpoint pour prévisualiser le contrat.
    """
    data = request.json
    
    # Extraire les données du contrat
    contract_type = data.get('type_contrat', [])
    is_free = data.get('type_cession', 'Gratuite')
    author_type = data.get('auteur_type', 'Personne physique')
    author_info = data.get('auteur_info', {})
    work_description = data.get('description_oeuvre', '')
    image_description = data.get('description_image', '')
    supports = data.get('supports', [])
    additional_rights = data.get('droits_cedes', [])
    remuneration = data.get('remuneration', '')
    is_exclusive = data.get('exclusivite', False)
    
    # Générer l'aperçu du contrat
    preview_text = preview_contract(
        contract_type, is_free, author_type, author_info,
        work_description, image_description, supports,
        additional_rights, remuneration, is_exclusive
    )
    
    return jsonify({'preview': preview_text})

@app.route('/api/generate-pdf', methods=['POST'])
def create_pdf():
    """
    Endpoint pour générer le PDF du contrat.
    """
    data = request.json
    contract_data = data.get('contractData', {})
    filename = data.get('filename', 'contrat')
    
    # Extraire les données du contrat
    contract_type = contract_data.get('type_contrat', [])
    is_free = contract_data.get('type_cession', 'Gratuite')
    author_type = contract_data.get('auteur_type', 'Personne physique')
    author_info = contract_data.get('auteur_info', {})
    work_description = contract_data.get('description_oeuvre', '')
    image_description = contract_data.get('description_image', '')
    supports = contract_data.get('supports', [])
    additional_rights = contract_data.get('droits_cedes', [])
    remuneration = contract_data.get('remuneration', '')
    is_exclusive = contract_data.get('exclusivite', False)
    
    # Générer le PDF
    pdf_path = generate_pdf(
        contract_type, is_free, author_type, author_info,
        work_description, image_description, supports,
        additional_rights, remuneration, is_exclusive
    )
    
    # Envoyer le fichier PDF
    return send_file(pdf_path, as_attachment=True, download_name=f"{filename}.pdf")

# Pour le développement local
if __name__ == '__main__':
    app.run(debug=True, port=5001)

# Pour Vercel - nécessaire pour les serverless functions
app = app 