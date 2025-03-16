---
title: LexForge
emoji: 🛠️
colorFrom: indigo
colorTo: red
sdk: gradio
sdk_version: 5.20.0
app_file: app.py
pinned: false
---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference


---
# LexForge

LexForge est un assistant intelligent de création de contrats juridiques, conçu pour simplifier la rédaction de documents légaux complexes.

## Structure du projet

Le projet est organisé avec une séparation claire entre le frontend et le backend :

```
LexForge/
├── backend/                  # API backend Flask
│   ├── app.py                # Point d'entrée de l'API
│   ├── config.py             # Configuration et constantes
│   ├── contract_builder.py   # Construction des contrats
│   ├── contract_previewer.py # Prévisualisation des contrats
│   ├── contract_templates.py # Templates des contrats
│   ├── pdf_generator.py      # Génération des PDFs
│   ├── requirements.txt      # Dépendances du backend
│   ├── text_analyzer.py      # Analyse de texte pour suggestions
│   └── utils.py              # Fonctions utilitaires
├── frontend/                 # Application React
│   ├── public/               # Fichiers statiques
│   ├── src/                  # Code source React
│   │   ├── components/       # Composants réutilisables
│   │   │   └── steps/        # Composants pour chaque étape du wizard
│   │   ├── pages/            # Pages de l'application
│   │   ├── services/         # Services pour les appels API
│   │   └── utils/            # Utilitaires et constantes
│   ├── package.json          # Dépendances du frontend
│   └── tailwind.config.js    # Configuration Tailwind CSS
└── README.md                 # Documentation du projet
```

## Installation et démarrage

### Méthode simple (recommandée)

Utilisez le script de lancement automatique qui vérifie les dépendances, les installe si nécessaire, puis lance le backend et le frontend :

```bash
# Rendre le script exécutable (uniquement la première fois)
chmod +x run.py

# Lancer l'application
./run.py
```

Le script va :
1. Vérifier que Python et Node.js sont installés avec les bonnes versions
2. Installer/mettre à jour les dépendances du backend et du frontend
3. Démarrer le serveur backend sur http://localhost:5000
4. Démarrer le serveur frontend sur http://localhost:3000
5. Ouvrir automatiquement votre navigateur

Pour arrêter les serveurs, appuyez simplement sur Ctrl+C dans le terminal où le script s'exécute.

### Méthode manuelle

Si vous préférez lancer les serveurs manuellement :

#### Backend

1. Installer les dépendances du backend :
```bash
cd backend
pip install -r requirements.txt
```

2. Démarrer le serveur backend :
```bash
cd backend
python app.py
```

Le serveur backend sera accessible à l'adresse http://localhost:5000.

#### Frontend

1. Installer les dépendances du frontend :
```bash
cd frontend
npm install
```

2. Démarrer le serveur de développement :
```bash
cd frontend
npm start
```

L'application frontend sera accessible à l'adresse http://localhost:3000.

## Fonctionnalités

- **Interface utilisateur moderne** : Interface React intuitive avec navigation par étapes
- **Analyse intelligente** : Suggestion automatique du type de contrat en fonction de la description du projet
- **Prévisualisation en temps réel** : Aperçu du contrat mis à jour à chaque modification
- **Génération de PDF** : Création de contrats professionnels au format PDF
- **Architecture modulaire** : Facilité d'ajout de nouveaux templates de contrats

## Ajout de nouveaux templates de contrats

Pour ajouter un nouveau template de contrat :

1. Ajouter le nouveau type de contrat dans `frontend/src/utils/constants.js` et `backend/config.py`
2. Créer les clauses correspondantes dans `backend/contract_templates.py`
3. Mettre à jour la logique d'analyse dans `backend/text_analyzer.py` pour détecter le nouveau type de contrat
4. Ajouter la logique de construction dans `backend/contract_builder.py`

## Licence

Tous droits réservés. Ce logiciel est la propriété de Tellers.


---
# Générateur de Contrats de Cession de Droits

Ce projet propose un générateur interactif de contrats de cession de droits d'auteur et de droits à l'image, conçu pour Tellers. L'application génère automatiquement des contrats juridiquement rigoureux adaptés aux besoins spécifiques de chaque situation.

## Structure du projet

Le projet est organisé de manière modulaire pour une meilleure séparation des responsabilités :

- `app.py` - Point d'entrée principal de l'application
- `interface.py` - Définition de l'interface utilisateur Gradio
- `config.py` - Configuration et constantes du projet
- `utils.py` - Fonctions utilitaires
- `contract_templates.py` - Templates des différentes sections de contrats
- `contract_builder.py` - Construction du contrat à partir des templates
- `contract_previewer.py` - Prévisualisation du contrat
- `pdf_generator.py` - Génération du PDF final avec champs interactifs

## Fonctionnalités

- Création de contrats de cession de droits d'auteur
- Création de contrats de droit à l'image
- Génération de contrats combinés (droits d'auteur + droits à l'image)
- Adaptation automatique des clauses selon le type de cession (gratuit/onéreux)
- Gestion des clauses d'exclusivité
- Support pour les auteurs personnes physiques ou morales
- Prévisualisation du contrat avant génération
- Export au format PDF avec champs interactifs pour les signatures et paraphes

## Arbre de décision du formulaire

1. **Type de contrat**
   - Droits d'auteur
   - Droit à l'image
   - Les deux

2. **Mode de cession**
   - Gratuite (limite les droits à la reproduction et représentation)
   - Onéreuse (permet d'étendre les droits et l'exclusivité)

3. **Droits supplémentaires** (si cession onéreuse)
   - Distribution
   - Usage
   - Adaptation
   - Prêt
   - Location
   - Droit de suite (œuvres graphiques et plastiques)

4. **Exclusivité** (si cession onéreuse)
   - Avec exclusivité
   - Sans exclusivité

5. **Informations sur l'auteur/modèle**
   - Personne physique (civilité, nom, prénom, etc.)
   - Personne morale (société, statut juridique, RCS, etc.)

6. **Description de l'œuvre/image**
   - Description précise de l'œuvre (si droits d'auteur)
   - Description précise des images/vidéos (si droit à l'image)

7. **Supports d'exploitation**
   - Multiples options (réseaux sociaux, applications, etc.)
   - Site web et Discord toujours inclus

8. **Rémunération** (si cession onéreuse)
   - Modalités de paiement (montant, échéancier, etc.)

## Déploiement sur Hugging Face Spaces

1. Créez un nouveau Space sur Hugging Face (https://huggingface.co/spaces/new)
2. Sélectionnez "Gradio" comme type d'application
3. Téléchargez tous les fichiers Python (.py) et requirements.txt
4. L'application sera automatiquement déployée et accessible via l'URL de votre Space

## PDF interactifs générés

Les PDF générés par l'application comprennent :
- Des champs de texte pour le lieu et la date de signature
- Des champs pour la mention "Lu et approuvé"
- Des champs de signature pour le cédant et le cessionnaire
- Des champs pour les paraphes sur chaque page

## Notes légales

Les contrats générés par cet outil sont conçus selon les principes juridiques français applicables aux cessions de droits d'auteur (Code de la propriété intellectuelle) et aux droits à l'image. Pour des situations spécifiques ou complexes, il est recommandé de consulter un professionnel du droit.

## Déploiement sur Vercel

LexForge peut être facilement déployé sur Vercel. Pour plus de détails, consultez le fichier [DEPLOY.md](DEPLOY.md) qui contient un guide complet pour déployer :

- Le backend Flask sur Vercel
- Le frontend React sur Vercel
- La configuration des variables d'environnement
- Les problèmes courants et leurs solutions

### Déploiement rapide

Pour un déploiement rapide, vous pouvez utiliser les boutons ci-dessous :

[![Deploy Backend to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvotre-username%2FLexForge%2Ftree%2Fmain%2Fbackend)

[![Deploy Frontend to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvotre-username%2FLexForge%2Ftree%2Fmain%2Ffrontend)

N'oubliez pas de configurer les variables d'environnement appropriées pour que le frontend puisse communiquer avec le backend.

