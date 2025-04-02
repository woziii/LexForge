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

# Fonction pour obtenir le fichier de profil utilisateur en fonction de l'ID utilisateur
def get_user_profile_path(user_id=None):
    if user_id:
        return os.path.join(USER_PROFILES_DIR, f'user_profile_{user_id}.json')
    else:
        return os.path.join(USER_PROFILES_DIR, 'user_profile.json')

# Fonction pour obtenir le répertoire des contrats pour un utilisateur spécifique
def get_user_contracts_dir(user_id=None):
    if user_id:
        user_contracts_dir = os.path.join(CONTRACTS_DIR, user_id)
        os.makedirs(user_contracts_dir, exist_ok=True)
        return user_contracts_dir
    else:
        return CONTRACTS_DIR

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
    print(f"Données reçues dans preview: {json.dumps(contract_data, indent=2)}")
    
    try:
        # Récupérer l'ID utilisateur depuis les headers
        user_id = request.headers.get('X-User-Id')
        
        # Si l'utilisateur a un profil configuré, utiliser ces informations
        user_profile = {}
        if user_id and os.path.exists(get_user_profile_path(user_id)):
            with open(get_user_profile_path(user_id), 'r') as f:
                user_profile = json.load(f)
        
        # 1. Vérifier si entreprise_info est fourni dans les données du contrat et l'utiliser en priorité
        entreprise_info = contract_data.get('entreprise_info')
        print(f"entreprise_info trouvé: {json.dumps(entreprise_info, indent=2) if entreprise_info else 'Non'}")
        
        if entreprise_info and isinstance(entreprise_info, dict) and any(entreprise_info.values()):
            # Si entreprise_info contient des données, l'utiliser comme cessionnaire_info
            cessionnaire_info = entreprise_info
            print("Utilisation de entreprise_info comme cessionnaire_info")
            
            # S'assurer que les champs nécessaires pour la prévisualisation sont présents
            if 'prenom' in cessionnaire_info and 'nom' in cessionnaire_info:
                # Pour personne physique
                if not cessionnaire_info.get('adresse') and (cessionnaire_info.get('code_postal') or cessionnaire_info.get('ville')):
                    # Construire une adresse complète si nécessaire
                    address_parts = []
                    if cessionnaire_info.get('code_postal'):
                        address_parts.append(cessionnaire_info.get('code_postal'))
                    if cessionnaire_info.get('ville'):
                        address_parts.append(cessionnaire_info.get('ville'))
                    if address_parts:
                        cessionnaire_info['adresse'] = ', '.join(address_parts)
            else:
                # Pour personne morale
                if not cessionnaire_info.get('siege') and (cessionnaire_info.get('adresse') or cessionnaire_info.get('code_postal') or cessionnaire_info.get('ville')):
                    # Construire un siège social si nécessaire
                    address_parts = []
                    if cessionnaire_info.get('adresse'):
                        address_parts.append(cessionnaire_info.get('adresse'))
                    if cessionnaire_info.get('code_postal'):
                        address_parts.append(cessionnaire_info.get('code_postal'))
                    if cessionnaire_info.get('ville'):
                        address_parts.append(cessionnaire_info.get('ville'))
                    if address_parts:
                        cessionnaire_info['siege'] = ' '.join(address_parts)
        
        # 2. Sinon utiliser le profil utilisateur
        elif user_profile.get('selected_entity_type') == 'physical_person' and user_profile['physical_person']['is_configured']:
            cessionnaire_info = user_profile['physical_person']
            print("Utilisation du profil physical_person comme cessionnaire_info")
        elif user_profile.get('selected_entity_type') == 'legal_entity' and user_profile['legal_entity']['is_configured']:
            cessionnaire_info = user_profile['legal_entity']
            print("Utilisation du profil legal_entity comme cessionnaire_info")
        else:
            # 3. Utiliser les informations par défaut de Tellers
            cessionnaire_info = TELLERS_INFO
            print("Utilisation des informations par défaut Tellers comme cessionnaire_info")
        
        # Ajouter les informations du cessionnaire aux données du contrat
        contract_data['cessionnaire_info'] = cessionnaire_info
        print(f"cessionnaire_info final: {json.dumps(cessionnaire_info, indent=2)}")
        
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
    
    # Récupérer l'ID utilisateur depuis les headers
    user_id = request.headers.get('X-User-Id')
    
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
    
    # Si l'utilisateur a un profil configuré, utiliser ces informations comme cessionnaire
    cessionnaire_info = None
    if user_id and os.path.exists(get_user_profile_path(user_id)):
        with open(get_user_profile_path(user_id), 'r') as f:
            user_profile = json.load(f)
        
        # Utiliser le profil selon le type d'entité sélectionné
        if user_profile.get('selected_entity_type') == 'physical_person' and user_profile['physical_person']['is_configured']:
            cessionnaire_info = user_profile['physical_person']
        elif user_profile.get('selected_entity_type') == 'legal_entity' and user_profile['legal_entity']['is_configured']:
            cessionnaire_info = user_profile['legal_entity']
        else:
            # Fallback aux informations par défaut
            cessionnaire_info = TELLERS_INFO
    else:
        # Utiliser les informations par défaut
        cessionnaire_info = TELLERS_INFO
    
    # Vérifier si des informations d'entreprise sont fournies directement dans les données du contrat
    entreprise_info = contract_data.get('entreprise_info')
    if entreprise_info and isinstance(entreprise_info, dict) and any(entreprise_info.values()):
        cessionnaire_info = entreprise_info
    
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
    
    # Récupérer l'ID utilisateur depuis les headers
    user_id = request.headers.get('X-User-Id')
    
    # Générer un ID unique pour le contrat s'il n'existe pas
    contract_id = data.get('id')
    if not contract_id:
        contract_id = str(uuid.uuid4())
    
    # Créer le contrat avec métadonnées
    contract = {
        'id': contract_id,
        'user_id': user_id,  # Stocker l'ID utilisateur dans le contrat
        'title': title,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
        'data': contract_data,
        'is_draft': is_draft,
        'from_step6': from_step6,
        'form_data': contract_data  # Stockage des données complètes du formulaire
    }
    
    # Chemin du fichier pour sauvegarder le contrat
    contract_file = os.path.join(get_user_contracts_dir(user_id), f"{contract_id}.json")
    
    # Sauvegarder dans un fichier JSON
    with open(contract_file, 'w') as f:
        json.dump(contract, f, indent=2)
    
    return jsonify({
        'id': contract_id,
        'message': 'Contract saved successfully',
        'title': title
    })

@app.route('/api/contracts', methods=['GET'])
def get_contracts():
    """
    Endpoint pour récupérer la liste des contrats.
    """
    # Récupérer l'ID utilisateur depuis les headers
    user_id = request.headers.get('X-User-Id')
    contracts = []
    
    # Vérifier si le répertoire des contrats de l'utilisateur existe
    user_contracts_dir = get_user_contracts_dir(user_id)
    if not os.path.exists(user_contracts_dir):
        return jsonify({'contracts': []})
    
    # Parcourir les fichiers dans le répertoire des contrats de l'utilisateur
    for filename in os.listdir(user_contracts_dir):
        if filename.endswith('.json'):
            file_path = os.path.join(user_contracts_dir, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    contract = json.load(f)
                    
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
    # Récupérer l'ID utilisateur depuis les headers
    user_id = request.headers.get('X-User-Id')
    
    file_path = os.path.join(get_user_contracts_dir(user_id), f"{contract_id}.json")
    
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
    # Récupérer l'ID utilisateur depuis les headers
    user_id = request.headers.get('X-User-Id')
    
    file_path = os.path.join(get_user_contracts_dir(user_id), f"{contract_id}.json")
    
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
    # Récupérer l'ID utilisateur depuis les headers
    user_id = request.headers.get('X-User-Id')
    
    file_path = os.path.join(get_user_contracts_dir(user_id), f"{contract_id}.json")
    
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
    # Récupérer l'ID utilisateur depuis les headers
    user_id = request.headers.get('X-User-Id')
    
    file_path = os.path.join(get_user_contracts_dir(user_id), f"{contract_id}.json")
    
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
    if os.path.exists(get_user_profile_path(user_id)):
        with open(get_user_profile_path(user_id), 'r') as f:
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
    Retourne le contrat complet dans un format qui préserve toutes les données et le formatage.
    """
    # Récupérer l'ID utilisateur depuis les headers
    user_id = request.headers.get('X-User-Id')
    
    file_path = os.path.join(get_user_contracts_dir(user_id), f"{contract_id}.json")
    
    if not os.path.exists(file_path):
        return jsonify({'error': 'Contract not found'}), 404
    
    # Lire le fichier du contrat
    with open(file_path, 'r', encoding='utf-8') as f:
        contract_data = json.load(f)
    
    # Retourner le contrat sous forme de fichier JSON téléchargeable
    return jsonify(contract_data)

@app.route('/api/contracts/import', methods=['POST'])
def import_contract():
    """
    Importe un contrat à partir d'un fichier JSON.
    """
    # Récupérer l'ID utilisateur depuis les headers
    user_id = request.headers.get('X-User-Id')
    
    # Vérifier si un fichier a été envoyé
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    # Vérifier si le fichier est vide
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400
    
    # Vérifier si le fichier est au format JSON
    if not file.filename.endswith('.json'):
        return jsonify({'error': 'Only JSON files are allowed'}), 400
    
    try:
        # Charger le contenu du fichier JSON
        contract_data = json.loads(file.read().decode('utf-8'))
        
        # Valider le contenu minimal attendu
        if 'id' not in contract_data and 'data' not in contract_data:
            return jsonify({'error': 'Invalid contract format'}), 400
        
        # Générer un nouvel ID pour le contrat importé
        original_id = contract_data.get('id')
        new_id = str(uuid.uuid4())
        
        # Mettre à jour l'ID et ajouter des métadonnées d'importation
        contract_data['original_id'] = original_id
        contract_data['id'] = new_id
        contract_data['user_id'] = user_id
        contract_data['import_info'] = {
            'imported_at': datetime.now().isoformat(),
            'original_id': original_id
        }
        
        # Mettre à jour les timestamps
        contract_data['updated_at'] = datetime.now().isoformat()
        if 'created_at' not in contract_data:
            contract_data['created_at'] = datetime.now().isoformat()
        
        # Sauvegarder le contrat importé
        file_path = os.path.join(get_user_contracts_dir(user_id), f"{new_id}.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(contract_data, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            'success': True,
            'id': new_id,
            'title': contract_data.get('title', 'Contrat importé'),
            'message': 'Contract imported successfully'
        })
        
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON file'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
        # Récupérer l'ID utilisateur depuis les headers
        user_id = request.headers.get('X-User-Id')
        
        # Si le fichier de profil n'existe pas, créer un profil par défaut
        if not os.path.exists(get_user_profile_path(user_id)):
            with open(get_user_profile_path(user_id), 'w') as f:
                json.dump(DEFAULT_PROFILE, f, indent=2)
            return jsonify(DEFAULT_PROFILE)
        
        # Lire et retourner le profil
        with open(get_user_profile_path(user_id), 'r') as f:
            profile = json.load(f)
            return jsonify(profile)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/user-profile', methods=['POST'])
def update_user_profile():
    """Met à jour le profil de l'utilisateur."""
    try:
        # Récupérer l'ID utilisateur depuis les headers
        user_id = request.headers.get('X-User-Id')
        
        # Récupérer les données du profil depuis la requête
        profile_data = request.json
        
        # Valider les données minimales
        if not profile_data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        # Sauvegarder le profil
        with open(get_user_profile_path(user_id), 'w') as f:
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
    # Récupérer l'ID utilisateur depuis les headers
    user_id = request.headers.get('X-User-Id')
    
    # Vérifier si le contrat existe
    contract_file = os.path.join(get_user_contracts_dir(user_id), f"{contract_id}.json")
    if not os.path.exists(contract_file):
        return jsonify({'error': 'Contract not found'}), 404
    
    try:
        with open(contract_file, 'r', encoding='utf-8') as f:
            contract = json.load(f)
        
        # Récupérer les données du formulaire
        form_data = contract.get('form_data', contract.get('data', {}))
        
        # Mettre à jour le statut de "from_step6" à True pour indiquer que ce contrat est passé par l'étape 6
        contract['from_step6'] = True
        contract['updated_at'] = datetime.now().isoformat()
        
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

# Pour le développement local
if __name__ == '__main__':
    app.run(debug=True, port=5001)

# Pour Vercel - nécessaire pour les serverless functions
app = app