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
# S'assurer que le chemin correspond à celui défini dans render.yaml
TMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tmp')
if not os.path.exists(TMP_DIR):
    os.makedirs(TMP_DIR)
    
# Définir le répertoire de stockage des contrats
# S'assurer que le chemin correspond à celui défini dans render.yaml
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
CONTRACTS_DIR = os.path.join(DATA_DIR, 'contracts')
USER_PROFILES_DIR = os.path.join(DATA_DIR, 'user_profiles')

# Créer les dossiers s'ils n'existent pas
os.makedirs(CONTRACTS_DIR, exist_ok=True)
os.makedirs(USER_PROFILES_DIR, exist_ok=True)

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
    "selected_entity_type": "",
    "user_id": ""  # Nouvel attribut pour stocker l'ID utilisateur
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
    print(f"Données reçues dans preview: {json.dumps(contract_data, indent=2)}")
    
    try:
        # Récupérer l'ID utilisateur
        user_id = contract_data.get('user_id', 'anonymous')
        
        # Si l'utilisateur a un profil configuré, utiliser ces informations
        user_profile = {}
        USER_PROFILE_FILE_WITH_ID = os.path.join(USER_PROFILES_DIR, f'user_profile_{user_id}.json')
        if os.path.exists(USER_PROFILE_FILE_WITH_ID):
            with open(USER_PROFILE_FILE_WITH_ID, 'r') as f:
                user_profile = json.load(f)
        
        # Fonction pour normaliser les données entre l'étape 3 et le dashboard
        def normalize_data(data):
            normalized = data.copy() if data else {}
            
            # Mapping entre les noms de champs potentiellement différents
            field_mappings = {
                'rcs': 'siren',
                'siege': 'adresse',
                'representant': 'representant_nom',
            }
            
            # Appliquer les mappings
            for old_field, new_field in field_mappings.items():
                if old_field in normalized and not normalized.get(new_field):
                    normalized[new_field] = normalized[old_field]
                    
            # Assurer que l'adresse complète est extraite des composants si nécessaire
            if 'adresse' in normalized and 'code_postal' in normalized and 'ville' in normalized:
                address_parts = []
                if normalized.get('adresse'):
                    address_parts.append(normalized['adresse'])
                
                city_part = ''
                if normalized.get('code_postal'):
                    city_part += normalized['code_postal'] 
                if normalized.get('ville'):
                    if city_part:
                        city_part += ' '
                    city_part += normalized['ville']
                
                if city_part:
                    address_parts.append(city_part)
                
                if address_parts:
                    normalized['adresse_complete'] = ', '.join(address_parts)
            
            return normalized
        
        # 1. Vérifier si entreprise_info est fourni dans les données du contrat et l'utiliser en priorité
        entreprise_info = contract_data.get('entreprise_info')
        if entreprise_info:
            entreprise_info = normalize_data(entreprise_info)
            print(f"entreprise_info trouvé et normalisé: {json.dumps(entreprise_info, indent=2)}")
            cessionnaire_info = entreprise_info
        elif user_profile.get('selected_entity_type') == 'physical_person' and user_profile['physical_person']['is_configured']:
            cessionnaire_info = user_profile['physical_person']
            print("Utilisation du profil physical_person comme cessionnaire_info")
            cessionnaire_info = normalize_data(cessionnaire_info)
        elif user_profile.get('selected_entity_type') == 'legal_entity' and user_profile['legal_entity']['is_configured']:
            cessionnaire_info = user_profile['legal_entity']
            print("Utilisation du profil legal_entity comme cessionnaire_info")
            cessionnaire_info = normalize_data(cessionnaire_info)
        else:
            # 3. Utiliser les informations par défaut de Tellers
            cessionnaire_info = TELLERS_INFO
            print("Utilisation des informations par défaut Tellers comme cessionnaire_info")
        
        # Ajouter les informations du cessionnaire aux données du contrat
        contract_data['cessionnaire_info'] = cessionnaire_info
        print(f"cessionnaire_info final: {json.dumps(cessionnaire_info, indent=2)}")
        
        # Faire la même chose pour les informations de l'auteur si présentes
        if 'auteur_info' in contract_data:
            contract_data['auteur_info'] = normalize_data(contract_data['auteur_info'])
        
        # Utiliser la nouvelle fonction generate_contract_preview
        preview_text = generate_contract_preview(contract_data)
        return jsonify({'preview': preview_text})
    except Exception as e:
        print(f"Erreur lors de la génération de l'aperçu: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'preview': "Une erreur est survenue lors de la génération de l'aperçu.", 'error': str(e)})

@app.route('/api/generate-pdf', methods=['POST'])
def create_pdf():
    """
    Endpoint pour générer le PDF du contrat.
    """
    data = request.json
    contract_data = data.get('contractData', {})
    filename = data.get('filename', 'contrat')
    user_id = data.get('user_id', 'anonymous')  # Récupérer l'ID utilisateur
    
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
    
    # Récupérer les informations du cessionnaire depuis le profil utilisateur spécifique
    cessionnaire_info = None
    USER_PROFILE_FILE_WITH_ID = os.path.join(USER_PROFILES_DIR, f'user_profile_{user_id}.json')
    if os.path.exists(USER_PROFILE_FILE_WITH_ID):
        with open(USER_PROFILE_FILE_WITH_ID, 'r') as f:
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
    is_draft = data.get('isDraft', False)  # Nouveau champ pour indiquer si c'est un brouillon
    from_step6 = data.get('fromStep6', False)  # Nouveau champ pour indiquer si ça vient de l'étape 6
    user_id = data.get('user_id', 'anonymous')  # Récupérer l'ID utilisateur, utiliser 'anonymous' par défaut
    
    # Générer un ID unique pour le contrat s'il n'existe pas
    contract_id = data.get('id')
    if not contract_id:
        contract_id = str(uuid.uuid4())
    
    # Créer le contrat avec métadonnées
    contract = {
        'id': contract_id,
        'title': title,
        'data': contract_data,
        'is_draft': is_draft,
        'from_step6': from_step6,
        'user_id': user_id,  # Ajouter l'ID utilisateur au contrat
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    # Sauvegarder le contrat
    with open(os.path.join(CONTRACTS_DIR, f"{contract_id}.json"), 'w', encoding='utf-8') as f:
        json.dump(contract, f, ensure_ascii=False, indent=2)
    
    return jsonify({
        'id': contract_id,
        'title': title
    })

@app.route('/api/contracts', methods=['GET'])
def get_contracts():
    """
    Endpoint pour récupérer la liste des contrats.
    """
    # Récupérer l'ID utilisateur de la requête
    user_id = request.args.get('user_id', 'anonymous')
    
    contracts = []
    
    # Parcourir les fichiers dans le répertoire des contrats
    for filename in os.listdir(CONTRACTS_DIR):
        if filename.endswith('.json'):
            file_path = os.path.join(CONTRACTS_DIR, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    contract = json.load(f)
                    
                    # Ne renvoyer que les contrats de l'utilisateur actuel
                    if contract.get('user_id', 'anonymous') == user_id:
                        # Filtrer les informations à renvoyer
                        contract_info = {
                            'id': contract.get('id'),
                            'title': contract.get('title', 'Contrat sans titre'),
                            'created_at': contract.get('created_at'),
                            'updated_at': contract.get('updated_at'),
                            'is_draft': contract.get('is_draft', False),  # Inclure le statut de brouillon
                            'from_step6': contract.get('from_step6', False)  # Inclure l'info si vient de l'étape 6
                        }
                        contracts.append(contract_info)
            except Exception as e:
                print(f"Error reading contract file {filename}: {e}")
    
    # Trier les contrats par date de mise à jour (du plus récent au plus ancien)
    contracts.sort(key=lambda x: x.get('updated_at', ''), reverse=True)
    
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
    
    # Récupérer l'ID utilisateur de la requête
    user_id = request.args.get('user_id', 'anonymous')
    
    # Vérifier que l'utilisateur a accès à ce contrat
    if contract.get('user_id', 'anonymous') != user_id and user_id != 'anonymous':
        return jsonify({'error': 'Unauthorized access to contract'}), 403
    
    return jsonify(contract)

@app.route('/api/contracts/<contract_id>', methods=['PUT'])
def update_contract(contract_id):
    """
    Endpoint pour mettre à jour un contrat.
    """
    file_path = os.path.join(CONTRACTS_DIR, f"{contract_id}.json")
    
    if not os.path.exists(file_path):
        return jsonify({'error': 'Contract not found'}), 404
    
    # Charger le contrat existant
    with open(file_path, 'r', encoding='utf-8') as f:
        contract = json.load(f)
    
    # Récupérer l'ID utilisateur de la requête
    user_id = request.json.get('user_id', 'anonymous')
    
    # Vérifier que l'utilisateur a accès à ce contrat
    if contract.get('user_id', 'anonymous') != user_id and user_id != 'anonymous':
        return jsonify({'error': 'Unauthorized access to contract'}), 403
    
    data = request.json
    title = data.get('title')
    updated_elements = data.get('updatedElements', {})
    comments = data.get('comments', [])
    
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
    
    # Charger le contrat pour vérifier l'accès
    with open(file_path, 'r', encoding='utf-8') as f:
        contract = json.load(f)
    
    # Récupérer l'ID utilisateur de la requête
    user_id = request.args.get('user_id', 'anonymous')
    
    # Vérifier que l'utilisateur a accès à ce contrat
    if contract.get('user_id', 'anonymous') != user_id and user_id != 'anonymous':
        return jsonify({'error': 'Unauthorized access to contract'}), 403
    
    # Supprimer le fichier
    os.remove(file_path)
    
    return jsonify({'success': True})

@app.route('/api/contracts/<contract_id>/elements', methods=['GET'])
def get_contract_elements(contract_id):
    """
    Endpoint pour récupérer les éléments d'un contrat.
    """
    try:
        # Vérifier si le contrat existe
        file_path = os.path.join(CONTRACTS_DIR, f"{contract_id}.json")
        if not os.path.exists(file_path):
            return jsonify({'error': 'Contract not found'}), 404
        
        # Récupérer les données du contrat
        with open(file_path, 'r', encoding='utf-8') as f:
            contract = json.load(f)
        
        # Fonction pour normaliser les données entre l'étape 3 et le dashboard
        def normalize_data(data):
            normalized = data.copy() if data else {}
            
            # Mapping entre les noms de champs potentiellement différents
            field_mappings = {
                'rcs': 'siren',
                'siege': 'adresse',
                'representant': 'representant_nom',
            }
            
            # Appliquer les mappings
            for old_field, new_field in field_mappings.items():
                if old_field in normalized and not normalized.get(new_field):
                    normalized[new_field] = normalized[old_field]
                    
            # Assurer que l'adresse complète est extraite des composants si nécessaire
            if 'adresse' in normalized and 'code_postal' in normalized and 'ville' in normalized:
                address_parts = []
                if normalized.get('adresse'):
                    address_parts.append(normalized['adresse'])
                
                city_part = ''
                if normalized.get('code_postal'):
                    city_part += normalized['code_postal'] 
                if normalized.get('ville'):
                    if city_part:
                        city_part += ' '
                    city_part += normalized['ville']
                
                if city_part:
                    address_parts.append(city_part)
                
                if address_parts:
                    normalized['adresse_complete'] = ', '.join(address_parts)
            
            return normalized
        
        # Récupérer l'ID utilisateur de la requête pour vérifier l'accès
        user_id = request.args.get('user_id', 'anonymous')
        
        # Vérifier que l'utilisateur a accès à ce contrat
        if contract.get('user_id', 'anonymous') != user_id and user_id != 'anonymous':
            return jsonify({'error': 'Unauthorized access to contract'}), 403
        
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
        USER_PROFILE_FILE_WITH_ID = os.path.join(USER_PROFILES_DIR, f'user_profile_{contract.get("user_id", "anonymous")}.json')
        if os.path.exists(USER_PROFILE_FILE_WITH_ID):
            with open(USER_PROFILE_FILE_WITH_ID, 'r') as f:
                user_profile = json.load(f)
            
            # Si un type d'entité est sélectionné, utiliser ses informations comme cessionnaire
            if user_profile.get('selected_entity_type') == 'physical_person' and user_profile['physical_person']['is_configured']:
                cessionnaire_info = user_profile['physical_person']
                cessionnaire_info = normalize_data(cessionnaire_info)
            elif user_profile.get('selected_entity_type') == 'legal_entity' and user_profile['legal_entity']['is_configured']:
                cessionnaire_info = user_profile['legal_entity']
                cessionnaire_info = normalize_data(cessionnaire_info)
            else:
                # Utiliser les informations par défaut de Tellers
                cessionnaire_info = TELLERS_INFO
        else:
            cessionnaire_info = TELLERS_INFO
        
        # Normaliser également les informations sur l'auteur si présentes
        if author_info:
            author_info = normalize_data(author_info)
        
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
    except Exception as e:
        print(f"Error accessing contract elements: {e}")
        return jsonify({'error': str(e)}), 500

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
    
    # Récupérer l'ID utilisateur de la requête
    user_id = request.args.get('user_id', 'anonymous')
    
    # Vérifier que l'utilisateur a accès à ce contrat
    if contract.get('user_id', 'anonymous') != user_id and user_id != 'anonymous':
        return jsonify({'error': 'Unauthorized access to contract'}), 403
    
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
    
    # Récupérer l'ID utilisateur à partir des données de formulaire
    user_id = request.form.get('user_id', 'anonymous')
    
    try:
        # Lire le contenu du fichier JSON
        contract_data = json.loads(file.read().decode('utf-8'))
        
        # Validation basique pour vérifier qu'il s'agit bien d'un fichier de contrat LexForge
        if 'id' not in contract_data or 'data' not in contract_data or 'title' not in contract_data:
            return jsonify({'error': 'Invalid contract format'}), 400
        
        # Générer un nouvel ID pour éviter les doublons
        new_id = str(uuid.uuid4())
        contract_data['id'] = new_id
        
        # Mettre à jour les dates de création et de modification
        contract_data['created_at'] = datetime.now().isoformat()
        contract_data['updated_at'] = datetime.now().isoformat()
        
        # Associer le contrat à l'utilisateur actuel
        contract_data['user_id'] = user_id
        
        # Sauvegarder le contrat
        file_path = os.path.join(CONTRACTS_DIR, f"{new_id}.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(contract_data, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            'success': True,
            'message': 'Contract imported successfully',
            'id': new_id,
            'title': contract_data.get('title', 'Imported Contract')
        })
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON format'}), 400
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
        # Récupérer l'ID utilisateur de la requête
        user_id = request.args.get('user_id', 'anonymous')
        
        # Créer un fichier de profil spécifique à l'utilisateur
        USER_PROFILE_FILE_WITH_ID = os.path.join(USER_PROFILES_DIR, f'user_profile_{user_id}.json')
        
        # Si le fichier de profil n'existe pas, créer un profil par défaut
        if not os.path.exists(USER_PROFILE_FILE_WITH_ID):
            default_profile = DEFAULT_PROFILE.copy()
            default_profile['user_id'] = user_id
            
            # Ajouter un indicateur de données temporaires pour les utilisateurs anonymes
            if user_id.startswith('anon_'):
                default_profile['is_temporary'] = True
                default_profile['created_at'] = datetime.now().isoformat()
            
            with open(USER_PROFILE_FILE_WITH_ID, 'w') as f:
                json.dump(default_profile, f, indent=2)
            return jsonify(default_profile)
        
        # Lire et retourner le profil
        with open(USER_PROFILE_FILE_WITH_ID, 'r') as f:
            profile = json.load(f)
            
            # Assurer que le flag de données temporaires est présent pour les utilisateurs anonymes
            if user_id.startswith('anon_') and not profile.get('is_temporary'):
                profile['is_temporary'] = True
                profile['updated_at'] = datetime.now().isoformat()
                # Sauvegarder le profil mis à jour
                with open(USER_PROFILE_FILE_WITH_ID, 'w') as f:
                    json.dump(profile, f, indent=2)
            
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
        
        # Récupérer l'ID utilisateur
        user_id = profile_data.get('user_id', 'anonymous')
        
        # Créer un fichier de profil spécifique à l'utilisateur
        USER_PROFILE_FILE_WITH_ID = os.path.join(USER_PROFILES_DIR, f'user_profile_{user_id}.json')
        
        # Sauvegarder le profil
        with open(USER_PROFILE_FILE_WITH_ID, 'w') as f:
            json.dump(profile_data, f, indent=2)
        
        return jsonify({'success': True, 'message': 'Profil mis à jour avec succès'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/contracts/<contract_id>/finalize', methods=['GET'])
def access_finalization_step(contract_id):
    """
    Endpoint pour accéder à l'étape de finalisation (étape 6) d'un contrat existant.
    Renvoie les données du formulaire du contrat qui sont nécessaires pour l'étape 6.
    """
    # Récupérer l'ID utilisateur de la requête
    user_id = request.args.get('user_id', 'anonymous')
    
    # Vérifier si le contrat existe
    contract_file = os.path.join(CONTRACTS_DIR, f"{contract_id}.json")
    if not os.path.exists(contract_file):
        return jsonify({'error': 'Contract not found'}), 404
    
    try:
        with open(contract_file, 'r', encoding='utf-8') as f:
            contract = json.load(f)
        
        # Vérifier que l'utilisateur a accès à ce contrat
        if contract.get('user_id', 'anonymous') != user_id and user_id != 'anonymous':
            return jsonify({'error': 'Unauthorized access to contract'}), 403
        
        # Récupérer les données du formulaire
        form_data = contract.get('form_data', contract.get('data', {}))
        
        # Mettre à jour le statut de "from_step6" à True pour indiquer que ce contrat est passé par l'étape 6
        contract['from_step6'] = True
        contract['updated_at'] = datetime.now().isoformat()
        
        # S'assurer que le user_id est correctement défini dans le contrat
        if contract.get('user_id') != user_id and user_id != 'anonymous':
            contract['user_id'] = user_id
        
        # Sauvegarder les modifications
        with open(contract_file, 'w', encoding='utf-8') as f:
            json.dump(contract, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            'form_data': form_data,
            'title': contract.get('title', 'Contrat sans titre'),
            'id': contract_id,
            'message': 'Successfully retrieved form data for finalization step'
        })
    
    except Exception as e:
        print(f"Error accessing finalization step for contract {contract_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/migrate-user-data', methods=['POST'])
def migrate_user_data():
    """
    Endpoint pour migrer les données d'un utilisateur anonyme vers un utilisateur authentifié.
    """
    data = request.json
    anonymous_id = data.get('anonymous_id')
    authenticated_id = data.get('authenticated_id')
    
    if not anonymous_id or not authenticated_id:
        return jsonify({'success': False, 'error': 'IDs manquants'}), 400
    
    if not anonymous_id.startswith('anon_'):
        return jsonify({'success': False, 'error': 'ID anonyme invalide'}), 400
    
    try:
        migrated_contracts = 0
        
        # 1. Récupérer le profil anonyme s'il existe
        anonymous_profile_path = os.path.join(USER_PROFILES_DIR, f'user_profile_{anonymous_id}.json')
        authenticated_profile_path = os.path.join(USER_PROFILES_DIR, f'user_profile_{authenticated_id}.json')
        
        anonymous_profile = None
        if os.path.exists(anonymous_profile_path):
            with open(anonymous_profile_path, 'r', encoding='utf-8') as f:
                anonymous_profile = json.load(f)
        
        # 2. Créer ou mettre à jour le profil authentifié
        if anonymous_profile:
            # Si le profil authentifié existe déjà, le charger
            authenticated_profile = DEFAULT_PROFILE.copy()
            if os.path.exists(authenticated_profile_path):
                with open(authenticated_profile_path, 'r', encoding='utf-8') as f:
                    authenticated_profile = json.load(f)
            
            # Mise à jour du profil authentifié avec les données du profil anonyme
            # On ne remplace que si le profil authentifié n'est pas déjà configuré
            if anonymous_profile.get('selected_entity_type') and not authenticated_profile.get('selected_entity_type'):
                authenticated_profile['selected_entity_type'] = anonymous_profile['selected_entity_type']
            
            entity_type = anonymous_profile.get('selected_entity_type')
            if entity_type in ['physical_person', 'legal_entity']:
                if anonymous_profile[entity_type]['is_configured'] and not authenticated_profile[entity_type]['is_configured']:
                    authenticated_profile[entity_type] = anonymous_profile[entity_type]
            
            # Mise à jour de l'ID utilisateur
            authenticated_profile['user_id'] = authenticated_id
            
            # Sauvegarde du profil authentifié
            with open(authenticated_profile_path, 'w', encoding='utf-8') as f:
                json.dump(authenticated_profile, f, ensure_ascii=False, indent=2)
        
        # 3. Mettre à jour les contrats associés à l'utilisateur anonyme
        for filename in os.listdir(CONTRACTS_DIR):
            if not filename.endswith('.json'):
                continue
            
            contract_path = os.path.join(CONTRACTS_DIR, filename)
            try:
                with open(contract_path, 'r', encoding='utf-8') as f:
                    contract = json.load(f)
                
                # Vérifier si le contrat appartient à l'utilisateur anonyme
                if contract.get('user_id') == anonymous_id:
                    # Mettre à jour l'ID utilisateur
                    contract['user_id'] = authenticated_id
                    contract['updated_at'] = datetime.now().isoformat()
                    
                    # Sauvegarder le contrat mis à jour
                    with open(contract_path, 'w', encoding='utf-8') as f:
                        json.dump(contract, f, ensure_ascii=False, indent=2)
                    
                    migrated_contracts += 1
            except Exception as e:
                print(f"Erreur lors de la migration du contrat {filename}: {e}")
        
        # 4. Supprimer le profil anonyme après migration
        if os.path.exists(anonymous_profile_path):
            os.remove(anonymous_profile_path)
        
        return jsonify({
            'success': True,
            'message': f'Migration réussie: {migrated_contracts} contrats migrés',
            'migrated_contracts': migrated_contracts
        })
    
    except Exception as e:
        print(f"Error during user data migration: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Pour le développement local
if __name__ == '__main__':
    app.run(debug=True, port=5001)

# Pour Vercel - nécessaire pour les serverless functions
app = app