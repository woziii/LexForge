"""
Point d'entrée principal pour le déploiement Vercel.
Ce fichier sert de proxy pour rediriger les requêtes vers le backend.
"""

from flask import Flask, request, jsonify, send_file, redirect
from flask_cors import CORS
import os
import sys

# Ajouter le répertoire backend au chemin Python
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Import des modules du backend
from backend.text_analyzer import analyze_work_description, get_explanation
from backend.contract_previewer import preview_contract
from backend.pdf_generator import generate_pdf
from backend.utils import collect_author_info, ensure_default_supports

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Définir le répertoire temporaire pour les fichiers PDF
if not os.path.exists('tmp'):
    os.makedirs('tmp')

@app.route('/', methods=['GET'])
def root():
    """
    Route racine qui redirige vers le frontend statique.
    Cette route ne sera normalement pas utilisée car Vercel servira directement les fichiers statiques.
    """
    return "LexForge API is running. Frontend should be served by Vercel."

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