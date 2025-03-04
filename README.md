---
title: LexForge
emoji: 🏃
colorFrom: indigo
colorTo: red
sdk: gradio
sdk_version: 5.20.0
app_file: app.py
pinned: false
---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference


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

