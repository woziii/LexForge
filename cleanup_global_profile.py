#!/usr/bin/env python3
"""
Script de nettoyage des fichiers qui pourraient compromettre l'isolation des données.
"""

import os
import json
import shutil
from datetime import datetime

# Chemins des répertoires
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
DATA_DIR = os.path.join(BACKEND_DIR, 'data')
USER_PROFILES_DIR = os.path.join(DATA_DIR, 'user_profiles')
CONTRACTS_DIR = os.path.join(DATA_DIR, 'contracts')

# Fichier de profil global à supprimer
GLOBAL_PROFILE = os.path.join(USER_PROFILES_DIR, 'user_profile.json')

# Créer un dossier de backup
BACKUP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data_backup')
os.makedirs(BACKUP_DIR, exist_ok=True)
backup_time = datetime.now().strftime('%Y%m%d_%H%M%S')

print("=== Nettoyage des données qui compromettent l'isolation ===")

# 1. Sauvegarder les données actuelles
print("1. Sauvegarde des données actuelles...")
if os.path.exists(DATA_DIR):
    shutil.copytree(DATA_DIR, os.path.join(BACKUP_DIR, f'data_backup_{backup_time}'))
    print(f"   ✅ Données sauvegardées dans {os.path.join(BACKUP_DIR, f'data_backup_{backup_time}')}")

# 2. Suppression du fichier de profil global s'il existe
if os.path.exists(GLOBAL_PROFILE):
    print(f"2. Suppression du fichier de profil global {GLOBAL_PROFILE}...")
    os.remove(GLOBAL_PROFILE)
    print(f"   ✅ Fichier supprimé")
else:
    print("2. Aucun fichier de profil global trouvé. Tout est en ordre.")

# 3. Vérification des fichiers de contrats pour s'assurer qu'ils ont tous un user_id
print("3. Vérification des contrats...")
contracts_fixed = 0
for filename in os.listdir(CONTRACTS_DIR):
    if filename.endswith('.json'):
        file_path = os.path.join(CONTRACTS_DIR, filename)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                contract = json.load(f)
            
            # Si le contrat n'a pas de user_id, ajouter 'anonymous'
            if 'user_id' not in contract:
                contract['user_id'] = 'anonymous'
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(contract, f, ensure_ascii=False, indent=2)
                contracts_fixed += 1
                print(f"   ⚠️ Contrat {filename} corrigé - ajout du user_id 'anonymous'")
        except Exception as e:
            print(f"   ❌ Erreur lors de la vérification du contrat {filename}: {e}")

if contracts_fixed == 0:
    print("   ✅ Tous les contrats ont déjà un user_id")
else:
    print(f"   ✅ {contracts_fixed} contrats corrigés")

# 4. Vérification des profils utilisateurs avec IDs simples (potentiellement dupliqués)
print("4. Vérification des profils utilisateurs...")
simple_ids = []
composite_ids = []

for filename in os.listdir(USER_PROFILES_DIR):
    if filename.startswith('user_profile_') and filename.endswith('.json'):
        # Extraire l'ID utilisateur du nom de fichier
        user_id = filename.replace('user_profile_', '').replace('.json', '')
        
        # Vérifier si c'est un ID simple (sans méthode d'authentification)
        if '_' not in user_id and not user_id.startswith('anon_'):
            simple_ids.append((user_id, filename))
        elif '_' in user_id:
            # C'est déjà un ID composite
            composite_ids.append(user_id.split('_')[0])  # Extraire l'ID de base

if simple_ids:
    print(f"   ⚠️ Trouvé {len(simple_ids)} profils avec des IDs simples qui pourraient causer des problèmes:")
    for base_id, filename in simple_ids:
        # Vérifier si cet ID de base existe aussi comme partie d'un ID composite
        if base_id in composite_ids:
            print(f"      - {filename} (ID simple) a aussi un profil avec ID composite")
    print("   ℹ️ Conseil: Supprimez ces fichiers de profil pour éviter tout problème.")
else:
    print("   ✅ Aucun profil avec ID simple trouvé")

print("=== Nettoyage terminé ===") 