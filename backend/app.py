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
            print(f"IMPORTANT - Type détecté: {entreprise_info.get('type')}, prenom présent: {'prenom' in entreprise_info}")
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
        
        # IMPORTANT: Stocker explicitement les informations du cessionnaire dans le contrat
        # pour éviter de les perdre lors de la migration ou du changement de profil
        contract_data['cessionnaire_info'] = cessionnaire_info
        print(f"Sauvegarde explicite des informations du cessionnaire dans les données du contrat: {json.dumps(cessionnaire_info, indent=2)}")
        
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
    contract_id = data.get('contractId')  # ID du contrat s'il s'agit d'un contrat sauvegardé
    
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
    
    # Si on a un ID de contrat et que le contract_data est vide, charger les données du contrat
    contract = None
    if contract_id and not contract_data:
        contract_file = os.path.join(CONTRACTS_DIR, f"{contract_id}.json")
        if os.path.exists(contract_file):
            try:
                with open(contract_file, 'r', encoding='utf-8') as f:
                    contract = json.load(f)
                contract_data = contract.get('data', {})
                print(f"PDF: Données du contrat {contract_id} chargées")
            except Exception as e:
                print(f"PDF: Erreur lors du chargement du contrat {contract_id}: {str(e)}")
    
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
    
    # ⚠️ IMPORTANT: Utiliser en priorité les informations de cessionnaire stockées dans le contrat
    # au lieu de celles du profil utilisateur actuel
    cessionnaire_info = None
    
    # 1. Vérifier d'abord si le contrat contient déjà des infos de cessionnaire
    if 'cessionnaire_info' in contract_data:
        print(f"PDF: Utilisation des infos de cessionnaire stockées dans le contrat")
        cessionnaire_info = contract_data['cessionnaire_info']
        cessionnaire_info = normalize_data(cessionnaire_info)
    # 2. Ensuite, vérifier si entreprise_info est disponible
    elif 'entreprise_info' in contract_data and contract_data['entreprise_info']:
        print(f"PDF: Utilisation de entreprise_info du contrat")
        cessionnaire_info = normalize_data(contract_data['entreprise_info'])
    # 3. Si le contrat existe et a été importé/migré, essayer de récupérer le profil original
    elif contract and contract.get('original_user_id'):
        original_user_id = contract.get('original_user_id')
        original_profile_path = os.path.join(USER_PROFILES_DIR, f'user_profile_{original_user_id}.json')
        
        if os.path.exists(original_profile_path):
            print(f"PDF: Utilisation du profil original: {original_user_id}")
            try:
                with open(original_profile_path, 'r') as f:
                    original_profile = json.load(f)
                
                if original_profile.get('selected_entity_type') == 'physical_person' and original_profile['physical_person']['is_configured']:
                    cessionnaire_info = normalize_data(original_profile['physical_person'])
                elif original_profile.get('selected_entity_type') == 'legal_entity' and original_profile['legal_entity']['is_configured']:
                    cessionnaire_info = normalize_data(original_profile['legal_entity'])
            except Exception as e:
                print(f"PDF: Erreur lors de la lecture du profil original: {e}")
    
    # 4. Si aucune des options ci-dessus n'a fonctionné, utiliser le profil utilisateur actuel
    if not cessionnaire_info:
        # Récupérer les informations du cessionnaire depuis le profil utilisateur spécifique
        USER_PROFILE_FILE_WITH_ID = os.path.join(USER_PROFILES_DIR, f'user_profile_{user_id}.json')
        if os.path.exists(USER_PROFILE_FILE_WITH_ID):
            print(f"PDF: Utilisation du profil utilisateur actuel en dernier recours")
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
    
    # Normaliser également les informations sur l'auteur
    if author_info:
        author_info = normalize_data(author_info)
    
    print(f"PDF: Infos cessionnaire finales: {cessionnaire_info}")
    
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
    
    # S'assurer que les informations du cessionnaire sont présentes dans le contrat
    if not contract_data.get('cessionnaire_info'):
        # Fonction pour normaliser les données
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
        
        # 1. Vérifier si entreprise_info est fourni et l'utiliser
        if contract_data.get('entreprise_info'):
            print(f"save_contract: Utilisation de entreprise_info comme cessionnaire_info")
            contract_data['cessionnaire_info'] = normalize_data(contract_data.get('entreprise_info', {}))
        else:
            # 2. Sinon, chercher dans le profil utilisateur
            USER_PROFILE_FILE_WITH_ID = os.path.join(USER_PROFILES_DIR, f'user_profile_{user_id}.json')
            if os.path.exists(USER_PROFILE_FILE_WITH_ID):
                with open(USER_PROFILE_FILE_WITH_ID, 'r') as f:
                    user_profile = json.load(f)
                
                if user_profile.get('selected_entity_type') == 'physical_person' and user_profile['physical_person']['is_configured']:
                    print(f"save_contract: Utilisation du profil physical_person comme cessionnaire_info")
                    contract_data['cessionnaire_info'] = normalize_data(user_profile['physical_person'])
                elif user_profile.get('selected_entity_type') == 'legal_entity' and user_profile['legal_entity']['is_configured']:
                    print(f"save_contract: Utilisation du profil legal_entity comme cessionnaire_info")
                    contract_data['cessionnaire_info'] = normalize_data(user_profile['legal_entity'])
                else:
                    # 3. Par défaut, utiliser les informations de Tellers
                    print(f"save_contract: Utilisation des informations Tellers par défaut")
                    contract_data['cessionnaire_info'] = TELLERS_INFO
    
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
    Endpoint pour récupérer tous les contrats d'un utilisateur
    """
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID manquant'}), 400
    
    # Extraire l'ID de base (sans suffixe) pour la vérification de l'accès
    base_user_id = user_id
    if '_' in user_id and not user_id.startswith('anon_'):
        # Formater: user_XYZ (2 premières parties de l'ID)
        parts = user_id.split('_')
        if len(parts) >= 2:
            base_user_id = f"{parts[0]}_{parts[1]}"
    
    print(f"DEBUG - get_contracts - ID utilisateur complet: {user_id}")
    print(f"DEBUG - get_contracts - ID utilisateur de base: {base_user_id}")
    
    contracts = []
    for filename in os.listdir(CONTRACTS_DIR):
        if not filename.endswith('.json'):
            continue
        
        contract_path = os.path.join(CONTRACTS_DIR, filename)
        try:
            with open(contract_path, 'r', encoding='utf-8') as f:
                contract = json.load(f)
            
            # Obtenir l'ID utilisateur du contrat
            contract_user_id = contract.get('user_id', '')
            
            # Extraire l'ID de base du contrat si nécessaire
            base_contract_user_id = contract_user_id
            if '_' in contract_user_id and not contract_user_id.startswith('anon_'):
                # Formater: user_XYZ (2 premières parties de l'ID)
                parts = contract_user_id.split('_')
                if len(parts) >= 2:
                    base_contract_user_id = f"{parts[0]}_{parts[1]}"
            
            # Vérifier la correspondance des IDs avec plusieurs combinaisons pour compatibilité
            if (user_id == contract_user_id or  # IDs complets identiques
                base_user_id == base_contract_user_id or  # IDs de base identiques
                user_id == base_contract_user_id or  # ID complet = ID de base du contrat
                base_user_id == contract_user_id):  # ID de base = ID complet du contrat
                contracts.append(contract)
        except Exception as e:
            print(f"Erreur lors de la lecture du contrat {filename}: {e}")
    
    print(f"DEBUG - get_contracts - Trouvé {len(contracts)} contrats pour l'utilisateur {user_id}")
    
    # Trier les contrats par date de création (du plus récent au plus ancien)
    contracts.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    return jsonify({'contracts': contracts})

@app.route('/api/contracts/<contract_id>', methods=['GET'])
def get_contract(contract_id):
    """
    Endpoint pour récupérer un contrat spécifique par son ID.
    Vérifie si l'utilisateur a accès à ce contrat.
    """
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID manquant'}), 400
    
    # Extraire l'ID de base (sans suffixe) pour la vérification de l'accès
    base_user_id = user_id
    if '_' in user_id and not user_id.startswith('anon_'):
        # Formater: user_XYZ (2 premières parties de l'ID)
        parts = user_id.split('_')
        if len(parts) >= 2:
            base_user_id = f"{parts[0]}_{parts[1]}"
    
    print(f"DEBUG - get_contract - ID utilisateur complet: {user_id}")
    print(f"DEBUG - get_contract - ID utilisateur de base: {base_user_id}")
    
    contract_file = os.path.join(CONTRACTS_DIR, f"{contract_id}.json")
    
    if not os.path.exists(contract_file):
        return jsonify({'error': 'Contrat non trouvé'}), 404
    
    with open(contract_file, 'r', encoding='utf-8') as f:
        contract = json.load(f)
    
    # Vérifier si le contrat appartient à l'utilisateur 
    contract_user_id = contract.get('user_id', '')
    
    # Extraire l'ID de base du contrat si nécessaire
    base_contract_user_id = contract_user_id
    if '_' in contract_user_id and not contract_user_id.startswith('anon_'):
        # Formater: user_XYZ (2 premières parties de l'ID)
        parts = contract_user_id.split('_')
        if len(parts) >= 2:
            base_contract_user_id = f"{parts[0]}_{parts[1]}"
    
    # Vérifier la correspondance des IDs (avec plusieurs vérifications pour compatibilité)
    has_access = (
        user_id == contract_user_id or  # IDs complets identiques
        base_user_id == base_contract_user_id or  # IDs de base identiques
        user_id == base_contract_user_id or  # ID complet = ID de base du contrat
        base_user_id == contract_user_id)  # ID de base = ID complet du contrat
    
    print(f"DEBUG - get_contract - Vérification d'accès au contrat {contract_id}:")
    print(f"  - ID utilisateur: {user_id} (base: {base_user_id})")
    print(f"  - ID du contrat: {contract_user_id} (base: {base_contract_user_id})")
    print(f"  - Accès autorisé: {has_access}")
    
    if not has_access:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    return jsonify({'contract': contract})

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
    
    # Extraire l'ID de base (sans suffixe) pour la vérification de l'accès
    base_user_id = user_id
    if '_' in user_id and not user_id.startswith('anon_'):
        # Formater: user_XYZ (2 premières parties de l'ID)
        parts = user_id.split('_')
        if len(parts) >= 2:
            base_user_id = f"{parts[0]}_{parts[1]}"
    
    # Obtenir l'ID utilisateur du contrat
    contract_user_id = contract.get('user_id', '')
    
    # Extraire l'ID de base du contrat si nécessaire
    base_contract_user_id = contract_user_id
    if '_' in contract_user_id and not contract_user_id.startswith('anon_'):
        # Formater: user_XYZ (2 premières parties de l'ID)
        parts = contract_user_id.split('_')
        if len(parts) >= 2:
            base_contract_user_id = f"{parts[0]}_{parts[1]}"
    
    # Vérifier la correspondance des IDs (avec plusieurs vérifications pour compatibilité)
    has_access = (
        user_id == contract_user_id or  # IDs complets identiques
        base_user_id == base_contract_user_id or  # IDs de base identiques
        user_id == base_contract_user_id or  # ID complet = ID de base du contrat
        base_user_id == contract_user_id  # ID de base = ID complet du contrat
    )
    
    print(f"DEBUG - update_contract - Vérification d'accès au contrat {contract_id}:")
    print(f"  - ID utilisateur: {user_id} (base: {base_user_id})")
    print(f"  - ID du contrat: {contract_user_id} (base: {base_contract_user_id})")
    print(f"  - Accès autorisé: {has_access}")
    
    if not has_access:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    data = request.json
    
    # Vérifier si le client a demandé de préserver les données (cas des contrats importés/migrés)
    preserve_data = data.get('preserve_data', False)
    print(f"DEBUG - update_contract - Préservation des données demandée: {preserve_data}")
    
    # ⚠️ Mode de préservation des données (pour les contrats migrés/importés)
    # Si ce mode est activé, on ne modifie que le titre et le statut is_draft
    if preserve_data:
        print(f"DEBUG - update_contract - Mode préservation activé: seuls le titre et is_draft seront modifiés")
        
        # Récupérer uniquement le titre et le statut is_draft
        title = data.get('title')
        is_draft = data.get('is_draft')
        
        # Mettre à jour le titre si fourni
        if title:
            contract['title'] = title
            print(f"DEBUG - update_contract - Titre mis à jour: {title}")
        
        # Mettre à jour le statut de brouillon si fourni
        if is_draft is not None:
            contract['is_draft'] = is_draft
            print(f"DEBUG - update_contract - Statut de brouillon mis à jour: {is_draft}")
        
        # Ajouter un marqueur indiquant que ce contrat est préservé
        if contract.get('original_user_id') and not contract.get('preserved_import'):
            contract['preserved_import'] = True
            print(f"DEBUG - update_contract - Marqueur de préservation ajouté")
        
        # Mettre à jour la date de mise à jour
        contract['updated_at'] = datetime.now().isoformat()
        
    # Mode normal - mise à jour complète
    else:
        title = data.get('title')
        is_draft = data.get('is_draft')
        updated_elements = data.get('updatedElements', {})
        comments = data.get('comments', [])
        updated_data = data.get('data')  # Nouvelles données du contrat
        
        # Mettre à jour le titre si fourni
        if title:
            contract['title'] = title
        
        # Mettre à jour le statut de brouillon si fourni
        if is_draft is not None:
            contract['is_draft'] = is_draft
            print(f"DEBUG - update_contract - Statut de brouillon mis à jour: {is_draft}")
        
        # Mettre à jour les données du contrat si fournies
        if updated_data:
            contract['data'] = updated_data
            print(f"DEBUG - update_contract - Données du contrat mises à jour")
        
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
    
    # Extraire l'ID de base (sans suffixe) pour la vérification de l'accès
    base_user_id = user_id
    if '_' in user_id and not user_id.startswith('anon_'):
        parts = user_id.split('_')
        if len(parts) >= 2:
            base_user_id = f"{parts[0]}_{parts[1]}"
    
    # Obtenir l'ID utilisateur du contrat
    contract_user_id = contract.get('user_id', '')
    
    # Extraire l'ID de base du contrat si nécessaire
    base_contract_user_id = contract_user_id
    if '_' in contract_user_id and not contract_user_id.startswith('anon_'):
        parts = contract_user_id.split('_')
        if len(parts) >= 2:
            base_contract_user_id = f"{parts[0]}_{parts[1]}"
    
    # Vérifier la correspondance des IDs
    has_access = (
        user_id == contract_user_id or  # IDs complets identiques
        base_user_id == base_contract_user_id or  # IDs de base identiques
        user_id == base_contract_user_id or  # ID complet = ID de base du contrat
        base_user_id == contract_user_id  # ID de base = ID complet du contrat
    )
    
    print(f"DEBUG - delete_contract - Vérification d'accès au contrat {contract_id}:")
    print(f"  - ID utilisateur: {user_id} (base: {base_user_id})")
    print(f"  - ID du contrat: {contract_user_id} (base: {base_contract_user_id})")
    print(f"  - Accès autorisé: {has_access}")
    
    if not has_access:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
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
        
        # Récupérer l'ID utilisateur de la requête pour vérifier l'accès
        user_id = request.args.get('user_id', 'anonymous')
        
        # Extraire l'ID de base (sans suffixe) pour la vérification de l'accès
        base_user_id = user_id
        if '_' in user_id and not user_id.startswith('anon_'):
            parts = user_id.split('_')
            if len(parts) >= 2:
                base_user_id = f"{parts[0]}_{parts[1]}"
        
        # Obtenir l'ID utilisateur du contrat
        contract_user_id = contract.get('user_id', '')
        
        # Extraire l'ID de base du contrat si nécessaire
        base_contract_user_id = contract_user_id
        if '_' in contract_user_id and not contract_user_id.startswith('anon_'):
            parts = contract_user_id.split('_')
            if len(parts) >= 2:
                base_contract_user_id = f"{parts[0]}_{parts[1]}"
        
        # Vérifier la correspondance des IDs
        has_access = (
            user_id == contract_user_id or  # IDs complets identiques
            base_user_id == base_contract_user_id or  # IDs de base identiques
            user_id == base_contract_user_id or  # ID complet = ID de base du contrat
            base_user_id == contract_user_id  # ID de base = ID complet du contrat
        )
        
        print(f"DEBUG - get_contract_elements - Vérification d'accès au contrat {contract_id}:")
        print(f"  - ID utilisateur: {user_id} (base: {base_user_id})")
        print(f"  - ID du contrat: {contract_user_id} (base: {base_contract_user_id})")
        print(f"  - Accès autorisé: {has_access}")
        
        if not has_access:
            return jsonify({'error': 'Accès non autorisé'}), 403
        
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
        
        # ⚠️ IMPORTANT: Utiliser en priorité les informations de cessionnaire stockées dans le contrat 
        # au lieu de celles du profil utilisateur actuel
        cessionnaire_info = None
        
        # 1. Vérifier d'abord si le contrat contient déjà des infos de cessionnaire
        if 'cessionnaire_info' in contract_data:
            print(f"DEBUG - get_contract_elements - Utilisation des infos de cessionnaire stockées dans le contrat")
            cessionnaire_info = contract_data['cessionnaire_info']
            cessionnaire_info = normalize_data(cessionnaire_info)
        # 2. Ensuite, vérifier si entreprise_info est disponible
        elif 'entreprise_info' in contract_data and contract_data['entreprise_info']:
            print(f"DEBUG - get_contract_elements - Utilisation de entreprise_info du contrat")
            cessionnaire_info = normalize_data(contract_data['entreprise_info'])
        # 3. Si le contrat a été importé/migré, essayer de récupérer le profil original
        elif contract.get('original_user_id'):
            original_user_id = contract.get('original_user_id')
            original_profile_path = os.path.join(USER_PROFILES_DIR, f'user_profile_{original_user_id}.json')
            
            if os.path.exists(original_profile_path):
                print(f"DEBUG - get_contract_elements - Utilisation du profil original: {original_user_id}")
                try:
                    with open(original_profile_path, 'r') as f:
                        original_profile = json.load(f)
                    
                    if original_profile.get('selected_entity_type') == 'physical_person' and original_profile['physical_person']['is_configured']:
                        cessionnaire_info = normalize_data(original_profile['physical_person'])
                    elif original_profile.get('selected_entity_type') == 'legal_entity' and original_profile['legal_entity']['is_configured']:
                        cessionnaire_info = normalize_data(original_profile['legal_entity'])
                except Exception as e:
                    print(f"DEBUG - get_contract_elements - Erreur lors de la lecture du profil original: {e}")
        
        # 4. Si aucune des options ci-dessus n'a fonctionné, utiliser le profil utilisateur actuel
        if not cessionnaire_info:
            USER_PROFILE_FILE_WITH_ID = os.path.join(USER_PROFILES_DIR, f'user_profile_{contract.get("user_id", "anonymous")}.json')
            if os.path.exists(USER_PROFILE_FILE_WITH_ID):
                print(f"DEBUG - get_contract_elements - Utilisation du profil utilisateur actuel en dernier recours")
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
        
        print(f"DEBUG - get_contract_elements - Infos cessionnaire finales: {cessionnaire_info}")
        
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
        
        # Extraire l'ID de base (sans suffixe) pour la vérification de l'accès
        base_user_id = user_id
        if '_' in user_id and not user_id.startswith('anon_'):
            parts = user_id.split('_')
            if len(parts) >= 2:
                base_user_id = f"{parts[0]}_{parts[1]}"
        
        # Obtenir l'ID utilisateur du contrat
        contract_user_id = contract.get('user_id', '')
        
        # Extraire l'ID de base du contrat si nécessaire
        base_contract_user_id = contract_user_id
        if '_' in contract_user_id and not contract_user_id.startswith('anon_'):
            parts = contract_user_id.split('_')
            if len(parts) >= 2:
                base_contract_user_id = f"{parts[0]}_{parts[1]}"
        
        # Vérifier la correspondance des IDs
        has_access = (
            user_id == contract_user_id or  # IDs complets identiques
            base_user_id == base_contract_user_id or  # IDs de base identiques
            user_id == base_contract_user_id or  # ID complet = ID de base du contrat
            base_user_id == contract_user_id  # ID de base = ID complet du contrat
        )
        
        print(f"DEBUG - access_finalization_step - Vérification d'accès au contrat {contract_id}:")
        print(f"  - ID utilisateur: {user_id} (base: {base_user_id})")
        print(f"  - ID du contrat: {contract_user_id} (base: {base_contract_user_id})")
        print(f"  - Accès autorisé: {has_access}")
        
        if not has_access:
            return jsonify({'error': 'Accès non autorisé'}), 403
        
        # Récupérer les données du formulaire
        form_data = contract.get('form_data', contract.get('data', {}))
        
        # Mettre à jour le statut de "from_step6" à True pour indiquer que ce contrat est passé par l'étape 6
        contract['from_step6'] = True
        contract['updated_at'] = datetime.now().isoformat()
        
        # S'assurer que le user_id est correctement défini dans le contrat
        # Utiliser l'ID utilisateur actuel (avec suffixe) pour assurer la compatibilité avec les requêtes futures
        if not contract.get('user_id') or contract.get('user_id') == 'anonymous':
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
    Peut également migrer un brouillon spécifique identifié par draft_contract_id.
    """
    data = request.json
    anonymous_id = data.get('anonymous_id')
    authenticated_id = data.get('authenticated_id')
    draft_contract_id = data.get('draft_contract_id')
    
    print(f"DEBUG - migrate_user_data - Données reçues: anonymous_id={anonymous_id}, authenticated_id={authenticated_id}, draft_contract_id={draft_contract_id}")
    
    if not authenticated_id:
        print("DEBUG - migrate_user_data - Erreur: ID authentifié manquant")
        return jsonify({'success': False, 'error': 'ID authentifié manquant'}), 400
    
    if not anonymous_id and not draft_contract_id:
        print("DEBUG - migrate_user_data - Erreur: Aucune donnée à migrer")
        return jsonify({'success': False, 'error': 'Aucune donnée à migrer'}), 400
    
    try:
        # ⚠️ IMPORTANT - Formatage de l'ID d'utilisateur
        # NOTE: L'ID reçu est potentiellement sans suffixe, car envoyé directement depuis Clerk
        # Dans notre système, nous avons besoin d'un ID avec suffixe pour l'accès
        # L'ID du contrat sera sauvegardé avec le suffixe pour garantir l'accès ultérieur

        # Construire l'ID avec suffixe pour assurer la cohérence avec le reste du système
        # Par défaut, on utilise le suffixe "_clerk" si aucune info spécifique n'est disponible
        formatted_authenticated_id = f"{authenticated_id}_clerk"
        
        # Vérifier dans les headers ou autres données s'il y a une info sur la méthode d'authentification
        auth_method = request.headers.get('X-Auth-Method', 'clerk').lower()
        if auth_method in ['google', 'github', 'linkedin']:
            formatted_authenticated_id = f"{authenticated_id}_{auth_method}"
        
        print(f"DEBUG - migrate_user_data - ID authentifié formaté: {formatted_authenticated_id}")
        
        migrated_contracts = 0
        
        # Traiter d'abord le brouillon spécifique s'il est fourni
        if draft_contract_id:
            contract_file = os.path.join(CONTRACTS_DIR, f"{draft_contract_id}.json")
            print(f"DEBUG - migrate_user_data - Recherche du fichier de brouillon: {contract_file}")
            
            if os.path.exists(contract_file):
                # ⚠️ IMPORTANT: Utiliser une approche similaire à l'import plutôt qu'une simple modification
                # Cela permet de conserver intégralement les données du contrat sans modification
                
                # 1. Lire le contrat original
                with open(contract_file, 'r', encoding='utf-8') as f:
                    contract = json.load(f)
                
                print(f"DEBUG - migrate_user_data - Contrat trouvé: {contract.get('id')}, user_id actuel: {contract.get('user_id')}")
                
                # 2. Créer une copie du contrat avec seulement les modifications minimales nécessaires
                migrated_contract = contract.copy()
                
                # 3. Stocker l'ID utilisateur d'origine dans un champ spécial pour référence future
                old_user_id = contract.get('user_id')
                migrated_contract['original_user_id'] = old_user_id
                
                # 4. Mettre à jour uniquement l'ID utilisateur et la date de mise à jour
                migrated_contract['user_id'] = formatted_authenticated_id
                migrated_contract['updated_at'] = datetime.now().isoformat()
                
                # 5. S'assurer que le statut de brouillon est préservé
                if 'is_draft' not in migrated_contract:
                    migrated_contract['is_draft'] = True
                
                # 6. Sauvegarder le contrat mis à jour (même ID, mais nouveau propriétaire)
                with open(contract_file, 'w', encoding='utf-8') as f:
                    json.dump(migrated_contract, f, ensure_ascii=False, indent=2)
                
                print(f"DEBUG - migrate_user_data - Brouillon {draft_contract_id} migré comme import: user_id changé de {old_user_id} à {formatted_authenticated_id}")
                print(f"DEBUG - migrate_user_data - Toutes les données du contrat original ont été préservées")
                migrated_contracts += 1
            else:
                print(f"DEBUG - migrate_user_data - Erreur: Brouillon {draft_contract_id} introuvable")
        
        # Migrer d'autres contrats si un ID anonyme est fourni
        if anonymous_id:
            # Code existant pour la migration basée sur l'ID anonyme
            print(f"DEBUG - migrate_user_data - Migration des données basée sur l'ID anonyme: {anonymous_id}")
            
            # Compter les contrats migrés via cette méthode
            anonymous_migrated = 0
            
            for filename in os.listdir(CONTRACTS_DIR):
                if not filename.endswith('.json'):
                    continue
                
                contract_path = os.path.join(CONTRACTS_DIR, filename)
                try:
                    with open(contract_path, 'r', encoding='utf-8') as f:
                        contract = json.load(f)
                    
                    # Vérifier si le contrat appartient à l'utilisateur anonyme
                    if contract.get('user_id') == anonymous_id:
                        # Même approche que pour le brouillon spécifique
                        migrated_contract = contract.copy()
                        old_user_id = contract.get('user_id')
                        migrated_contract['original_user_id'] = old_user_id
                        migrated_contract['user_id'] = formatted_authenticated_id
                        migrated_contract['updated_at'] = datetime.now().isoformat()
                        
                        # Sauvegarder le contrat mis à jour
                        with open(contract_path, 'w', encoding='utf-8') as f:
                            json.dump(migrated_contract, f, ensure_ascii=False, indent=2)
                        
                        print(f"DEBUG - migrate_user_data - Contrat {contract.get('id')} migré comme import: user_id changé de {old_user_id} à {formatted_authenticated_id}")
                        anonymous_migrated += 1
                        migrated_contracts += 1
                except Exception as e:
                    print(f"DEBUG - migrate_user_data - Erreur lors de la migration du contrat {filename}: {e}")
            
            print(f"DEBUG - migrate_user_data - {anonymous_migrated} contrats migrés basés sur l'ID anonyme")
        
        # Vérifier que les migrations ont fonctionné en listant tous les contrats de l'utilisateur
        user_contracts = []
        
        # ⚠️ Pour la vérification, nous devons chercher les contrats avec l'ID formaté ET l'ID de base
        for filename in os.listdir(CONTRACTS_DIR):
            if not filename.endswith('.json'):
                continue
            
            contract_path = os.path.join(CONTRACTS_DIR, filename)
            try:
                with open(contract_path, 'r', encoding='utf-8') as f:
                    contract = json.load(f)
                
                contract_user_id = contract.get('user_id', '')
                
                # Vérifier si le contrat appartient à l'utilisateur (avec ou sans suffixe)
                if (contract_user_id == formatted_authenticated_id or
                    contract_user_id == authenticated_id or
                    (contract_user_id.startswith(authenticated_id + '_'))):
                    user_contracts.append({
                        'id': contract.get('id'),
                        'title': contract.get('title'),
                        'is_draft': contract.get('is_draft', False),
                        'user_id': contract_user_id,  # Inclure l'ID utilisateur pour débogage
                        'was_imported': bool(contract.get('original_user_id')) # Indiquer si c'était un import
                    })
            except Exception as e:
                print(f"DEBUG - migrate_user_data - Erreur lors de la vérification du contrat {filename}: {e}")
        
        print(f"DEBUG - migrate_user_data - L'utilisateur {formatted_authenticated_id} a maintenant {len(user_contracts)} contrats:")
        for contract in user_contracts:
            print(f"  - Contrat {contract['id']}: {contract['title']} (user_id: {contract['user_id']})")
        
        return jsonify({
            'success': True,
            'message': f'Migration réussie: {migrated_contracts} contrats migrés comme imports',
            'migrated_contracts': migrated_contracts,
            'user_contracts': user_contracts,
            'authenticated_id': {
                'base': authenticated_id,
                'formatted': formatted_authenticated_id
            }
        })
    
    except Exception as e:
        print(f"DEBUG - migrate_user_data - Erreur pendant la migration: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Pour le développement local
if __name__ == '__main__':
    app.run(debug=True, port=5001)

# Pour Vercel - nécessaire pour les serverless functions
app = app