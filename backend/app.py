"""
Point d'entrée principal de l'API backend.
Fournit les endpoints pour l'analyse de projet, la prévisualisation et la génération de PDF.
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys
import json
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from config import TELLERS_INFO

# Import des modules locaux
from text_analyzer import analyze_work_description, get_explanation
from contract_previewer import preview_contract, generate_contract_preview
from pdf_generator import generate_pdf
from utils import collect_author_info, ensure_default_supports
from contract_builder import ContractBuilder
from contract_generator import generate_contract_text
from contract_analyzer import analyze_project_description

app = Flask(__name__)

# Configuration CORS complètement permissive
CORS(app, 
     origins="*", 
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     supports_credentials=True,
     max_age=3600)

# Définir le répertoire temporaire pour les fichiers PDF
if not os.path.exists('tmp'):
    os.makedirs('tmp')
    
# Définir le répertoire de stockage des contrats
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
CONTRACTS_DIR = os.path.join(DATA_DIR, 'contracts')
USER_PROFILES_DIR = os.path.join(DATA_DIR, 'user_profiles')

# Créer les dossiers s'ils n'existent pas
os.makedirs(CONTRACTS_DIR, exist_ok=True)
os.makedirs(USER_PROFILES_DIR, exist_ok=True)

# Chemin du fichier de profil utilisateur (pour simplifier, un seul utilisateur)
USER_PROFILE_FILE = os.path.join(USER_PROFILES_DIR, 'user_profile.json')

# Structure par défaut pour un nouveau profil
DEFAULT_PROFILE = {
    "physical_person": {
        "is_configured": False,
        "gentille": "",
        "nom": "",
        "prenom": "",
        "date_naissance": "",
        "nationalite": "",
        "adresse": ""
    },
    "legal_entity": {
        "is_configured": False,
        "nom": "",
        "forme_juridique": "",
        "capital": "",
        "rcs": "",
        "siege": "",
        "representant": "",
        "qualite_representant": ""
    },
    "selected_entity_type": ""
}

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
    contract_data = request.json
    
    try:
        # Si l'utilisateur a un profil configuré, utiliser ces informations
        user_profile = {}
        if os.path.exists(USER_PROFILE_FILE):
            with open(USER_PROFILE_FILE, 'r') as f:
                user_profile = json.load(f)
        
        # Si un type d'entité est sélectionné, utiliser ses informations comme cessionnaire
        if user_profile.get('selected_entity_type') == 'physical_person' and user_profile['physical_person']['is_configured']:
            cessionnaire_info = user_profile['physical_person']
        elif user_profile.get('selected_entity_type') == 'legal_entity' and user_profile['legal_entity']['is_configured']:
            cessionnaire_info = user_profile['legal_entity']
        else:
            # Utiliser les informations par défaut de Tellers
            cessionnaire_info = TELLERS_INFO
        
        # Ajouter les informations du cessionnaire aux données du contrat
        contract_data['cessionnaire_info'] = cessionnaire_info
        
        # Utiliser la nouvelle fonction generate_contract_preview
        preview_text = generate_contract_preview(contract_data)
        return jsonify({'preview': preview_text})
    except Exception as e:
        print(f"Erreur lors de la génération de l'aperçu: {str(e)}")
        return jsonify({'preview': "Une erreur est survenue lors de la génération de l'aperçu.", 'error': str(e)})

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
    
    # Récupérer les informations du cessionnaire depuis le profil utilisateur
    cessionnaire_info = None
    if os.path.exists(USER_PROFILE_FILE):
        with open(USER_PROFILE_FILE, 'r') as f:
            user_profile = json.load(f)
        
        # Si un type d'entité est sélectionné, utiliser ses informations comme cessionnaire
        if user_profile.get('selected_entity_type') == 'physical_person' and user_profile['physical_person']['is_configured']:
            cessionnaire_info = user_profile['physical_person']
        elif user_profile.get('selected_entity_type') == 'legal_entity' and user_profile['legal_entity']['is_configured']:
            cessionnaire_info = user_profile['legal_entity']
        else:
            # Utiliser les informations par défaut de Tellers
            cessionnaire_info = TELLERS_INFO
    else:
        cessionnaire_info = TELLERS_INFO
    
    # Générer le PDF
    pdf_path = generate_pdf(
        contract_type, is_free, author_type, author_info,
        work_description, image_description, supports,
        additional_rights, remuneration, is_exclusive,
        cessionnaire_info=cessionnaire_info
    )
    
    # Envoyer le fichier PDF
    return send_file(pdf_path, as_attachment=True, download_name=f"{filename}.pdf")

# Routes pour la gestion des contrats sauvegardés
@app.route('/api/contracts', methods=['POST'])
def save_contract():
    """
    Endpoint pour sauvegarder un contrat.
    """
    data = request.json
    contract_data = data.get('contractData', {})
    title = data.get('title', 'Contrat sans titre')
    
    # Générer un ID unique pour le contrat s'il n'existe pas
    contract_id = data.get('id')
    if not contract_id:
        contract_id = str(uuid.uuid4())
    
    # Créer le contrat avec métadonnées
    contract = {
        'id': contract_id,
        'title': title,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
        'data': contract_data
    }
    
    # Sauvegarder le contrat dans un fichier JSON
    file_path = os.path.join(CONTRACTS_DIR, f"{contract_id}.json")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(contract, f, ensure_ascii=False, indent=2)
    
    return jsonify({'id': contract_id, 'title': title})

@app.route('/api/contracts', methods=['GET'])
def get_contracts():
    """
    Endpoint pour récupérer la liste des contrats.
    """
    contracts = []
    
    # Parcourir tous les fichiers dans le répertoire des contrats
    for filename in os.listdir(CONTRACTS_DIR):
        if filename.endswith('.json'):
            file_path = os.path.join(CONTRACTS_DIR, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                contract = json.load(f)
                # Ne renvoyer que les métadonnées, pas les données complètes
                contracts.append({
                    'id': contract['id'],
                    'title': contract['title'],
                    'created_at': contract['created_at'],
                    'updated_at': contract['updated_at']
                })
    
    # Trier les contrats par date de mise à jour (plus récent d'abord)
    contracts.sort(key=lambda x: x['updated_at'], reverse=True)
    
    return jsonify({'contracts': contracts})

@app.route('/api/contracts/<contract_id>', methods=['GET'])
def get_contract(contract_id):
    """
    Endpoint pour récupérer un contrat spécifique.
    """
    file_path = os.path.join(CONTRACTS_DIR, f"{contract_id}.json")
    
    if not os.path.exists(file_path):
        return jsonify({'error': 'Contract not found'}), 404
    
    with open(file_path, 'r', encoding='utf-8') as f:
        contract = json.load(f)
    
    return jsonify(contract)

@app.route('/api/contracts/<contract_id>', methods=['PUT'])
def update_contract(contract_id):
    """
    Endpoint pour mettre à jour un contrat.
    """
    file_path = os.path.join(CONTRACTS_DIR, f"{contract_id}.json")
    
    if not os.path.exists(file_path):
        return jsonify({'error': 'Contract not found'}), 404
    
    data = request.json
    title = data.get('title')
    updated_elements = data.get('updatedElements', {})
    comments = data.get('comments', [])
    
    # Charger le contrat existant
    with open(file_path, 'r', encoding='utf-8') as f:
        contract = json.load(f)
    
    # Mettre à jour le titre si fourni
    if title:
        contract['title'] = title
    
    # Mettre à jour les éléments modifiés si fournis
    if updated_elements and 'elements' in contract:
        for index, content in updated_elements.items():
            index = int(index)
            if index < len(contract['elements']):
                if 'text' in contract['elements'][index]:
                    contract['elements'][index]['text'] = content
    
    # Mettre à jour ou ajouter les commentaires si fournis
    if comments is not None:
        contract['comments'] = comments
    
    # Mettre à jour la date de mise à jour
    contract['updated_at'] = datetime.now().isoformat()
    
    # Sauvegarder le contrat mis à jour
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(contract, f, ensure_ascii=False, indent=2)
    
    return jsonify({'id': contract_id, 'title': contract['title']})

@app.route('/api/contracts/<contract_id>', methods=['DELETE'])
def delete_contract(contract_id):
    """
    Endpoint pour supprimer un contrat.
    """
    file_path = os.path.join(CONTRACTS_DIR, f"{contract_id}.json")
    
    if not os.path.exists(file_path):
        return jsonify({'error': 'Contract not found'}), 404
    
    # Supprimer le fichier
    os.remove(file_path)
    
    return jsonify({'success': True})

@app.route('/api/contracts/<contract_id>/elements', methods=['GET'])
def get_contract_elements(contract_id):
    """
    Endpoint pour récupérer les éléments du contrat pour l'éditeur.
    """
    file_path = os.path.join(CONTRACTS_DIR, f"{contract_id}.json")
    
    if not os.path.exists(file_path):
        return jsonify({'error': 'Contract not found'}), 404
    
    with open(file_path, 'r', encoding='utf-8') as f:
        contract = json.load(f)
    
    # Vérifier si le contrat a déjà des éléments stockés
    if 'elements' in contract:
        return jsonify({'elements': contract['elements'], 'comments': contract.get('comments', [])})
    
    # Si non, générer les éléments à partir des données du contrat
    # Récupérer les données du contrat
    contract_data = contract['data']
    
    # Extraire les paramètres pour le ContractBuilder
    contract_type = contract_data.get('type_contrat', [])
    is_free = contract_data.get('type_cession', 'Gratuite') == 'Gratuite'
    author_type = contract_data.get('auteur_type', 'Personne physique')
    author_info = contract_data.get('auteur_info', {})
    work_description = contract_data.get('description_oeuvre', '')
    image_description = contract_data.get('description_image', '')
    supports = contract_data.get('supports', [])
    additional_rights = contract_data.get('droits_cedes', [])
    remuneration = contract_data.get('remuneration', '')
    is_exclusive = contract_data.get('exclusivite', False)
    
    # Récupérer les informations du cessionnaire depuis le profil utilisateur
    cessionnaire_info = None
    if os.path.exists(USER_PROFILE_FILE):
        with open(USER_PROFILE_FILE, 'r') as f:
            user_profile = json.load(f)
        
        # Si un type d'entité est sélectionné, utiliser ses informations comme cessionnaire
        if user_profile.get('selected_entity_type') == 'physical_person' and user_profile['physical_person']['is_configured']:
            cessionnaire_info = user_profile['physical_person']
        elif user_profile.get('selected_entity_type') == 'legal_entity' and user_profile['legal_entity']['is_configured']:
            cessionnaire_info = user_profile['legal_entity']
        else:
            # Utiliser les informations par défaut de Tellers
            cessionnaire_info = TELLERS_INFO
    else:
        cessionnaire_info = TELLERS_INFO
    
    # Générer les éléments du contrat avec le ContractBuilder
    elements = ContractBuilder.build_contract_elements(
        contract_type, is_free, author_type, author_info,
        work_description, image_description, supports,
        additional_rights, remuneration, is_exclusive,
        cessionnaire_info=cessionnaire_info  # Ajouter les informations du cessionnaire
    )
    
    # Convertir les éléments en format pour l'éditeur
    editor_elements = []
    
    for element in elements:
        if hasattr(element, 'text'):
            # Si c'est un élément Paragraph
            style_name = str(element.style.name) if hasattr(element, 'style') and hasattr(element.style, 'name') else 'ContractText'
            editor_elements.append({
                'type': 'paragraph',
                'style': style_name,
                'text': element.text
            })
        elif hasattr(element, 'height'):
            # Si c'est un élément Spacer
            editor_elements.append({
                'type': 'spacer',
                'height': element.height
            })
    
    # Stocker les éléments générés dans le contrat pour référence future
    contract['elements'] = editor_elements
    contract['comments'] = []
    
    # Sauvegarder le contrat avec les éléments
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(contract, f, ensure_ascii=False, indent=2)
    
    return jsonify({'elements': editor_elements, 'comments': []})

@app.route('/api/contracts/export/<contract_id>', methods=['GET'])
def export_contract(contract_id):
    """
    Endpoint pour exporter un contrat au format JSON.
    Retourne le contrat complet dans un format qui préserve toutes les données et le formatage.
    """
    file_path = os.path.join(CONTRACTS_DIR, f"{contract_id}.json")
    
    if not os.path.exists(file_path):
        return jsonify({'error': 'Contract not found'}), 404
    
    # Lire le contrat complet depuis le fichier
    with open(file_path, 'r', encoding='utf-8') as f:
        contract = json.load(f)
    
    # Ajouter des métadonnées d'exportation
    contract['export_info'] = {
        'exported_at': datetime.now().isoformat(),
        'version': '1.0',
        'application': 'LexForge'
    }
    
    # Définir les en-têtes pour le téléchargement du fichier
    response = jsonify(contract)
    response.headers.set('Content-Disposition', f'attachment; filename=lexforge_contract_{contract_id}.json')
    return response

@app.route('/api/contracts/import', methods=['POST'])
def import_contract():
    """
    Endpoint pour importer un contrat au format JSON.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.json'):
        return jsonify({'error': 'File must be a JSON file'}), 400
    
    try:
        # Lire le contenu du fichier JSON
        contract_data = json.loads(file.read().decode('utf-8'))
        
        # Validation basique pour vérifier qu'il s'agit bien d'un fichier de contrat LexForge
        if 'id' not in contract_data or 'data' not in contract_data or 'title' not in contract_data:
            return jsonify({'error': 'Invalid contract format'}), 400
        
        # Générer un nouvel ID pour éviter les doublons
        new_id = str(uuid.uuid4())
        contract_data['id'] = new_id
        
        # Mettre à jour les dates
        current_time = datetime.now().isoformat()
        contract_data['created_at'] = current_time
        contract_data['updated_at'] = current_time
        
        # Sauvegarder le contrat importé
        file_path = os.path.join(CONTRACTS_DIR, f"{new_id}.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(contract_data, f, ensure_ascii=False, indent=2)
        
        # Retourner l'ID du nouveau contrat et son titre
        return jsonify({
            'id': new_id,
            'title': contract_data['title'],
            'message': 'Contract imported successfully'
        })
    
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON file'}), 400
    except Exception as e:
        return jsonify({'error': f'Error importing contract: {str(e)}'}), 500

@app.route('/api/cors-test', methods=['GET', 'POST', 'OPTIONS'])
def cors_test():
    """
    Endpoint simple pour tester la configuration CORS.
    """
    if request.method == 'OPTIONS':
        # Handle OPTIONS request explicitly
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
        
    return jsonify({
        'status': 'success',
        'message': 'CORS test successful',
        'method': request.method,
        'headers': dict(request.headers),
        'remote_addr': request.remote_addr
    })

@app.route('/api/user-profile', methods=['GET'])
def get_user_profile():
    """Récupère le profil de l'utilisateur."""
    try:
        # Si le fichier de profil n'existe pas, créer un profil par défaut
        if not os.path.exists(USER_PROFILE_FILE):
            with open(USER_PROFILE_FILE, 'w') as f:
                json.dump(DEFAULT_PROFILE, f, indent=2)
            return jsonify(DEFAULT_PROFILE)
        
        # Lire et retourner le profil
        with open(USER_PROFILE_FILE, 'r') as f:
            profile = json.load(f)
            return jsonify(profile)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/user-profile', methods=['POST'])
def update_user_profile():
    """Met à jour le profil de l'utilisateur."""
    try:
        # Récupérer les données du profil depuis la requête
        profile_data = request.json
        
        # Valider les données minimales
        if not profile_data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        # Sauvegarder le profil
        with open(USER_PROFILE_FILE, 'w') as f:
            json.dump(profile_data, f, indent=2)
        
        return jsonify({'success': True, 'message': 'Profil mis à jour avec succès'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Pour le développement local
if __name__ == '__main__':
    app.run(debug=True, port=5001)

# Pour Vercel - nécessaire pour les serverless functions
app = app