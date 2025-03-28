"""
Module d'analyse de description de projet pour déterminer le type de contrat adapté.
"""

def analyze_project_description(description):
    """
    Analyse la description d'un projet pour suggérer le type de contrat le plus adapté.
    
    Args:
        description (str): Description textuelle du projet
        
    Returns:
        dict: Résultat de l'analyse avec suggestion de type de contrat et explication
    """
    description = description.lower()
    
    # Mots-clés pour les droits d'auteur
    author_keywords = [
        'création', 'créé', 'œuvre', 'oeuvre', 'texte', 'article', 'livre', 'roman', 'poème',
        'musique', 'composition', 'chanson', 'mélodie', 'partition', 'arrangement',
        'dessin', 'peinture', 'illustration', 'graphique', 'logo', 'design',
        'photographie', 'photo', 'photographe', 'cliché',
        'logiciel', 'programme', 'code', 'application', 'développement',
        'sculpture', 'architecture', 'chorégraphie', 'danse',
        'réalisation', 'film', 'vidéo', 'documentaire', 'court-métrage', 'cinéma',
        'droit d\'auteur', 'propriété intellectuelle', 'droits d\'auteur',
        'écrit', 'composé', 'réalisé', 'produit', 'créateur', 'auteur'
    ]
    
    # Mots-clés pour les droits à l'image
    image_keywords = [
        'modèle', 'mannequin', 'portrait', 'apparence', 'visage', 'corps',
        'poser', 'pose', 'photo de moi', 'ma photo', 'mon image', 'mon portrait',
        'séance photo', 'shooting', 'prise de vue', 'photographié',
        'droit à l\'image', 'autorisation image', 'apparaître', 'apparition',
        'image', 'vidéo de moi', 'ma vidéo', 'je suis filmé', 'je suis photographié',
        'utiliser mon image', 'exploitation image', 'diffuser mon image',
        'instagram', 'réseaux sociaux', 'campagne publicitaire', 'publicité',
        'influenceur', 'influenceuse', 'témoignage', 'ambassadeur', 'ambassadrice',
        'me représente', 'me montre', 'me met en scène'
    ]
    
    # Compter les occurrences de mots-clés
    author_score = sum(1 for keyword in author_keywords if keyword in description)
    image_score = sum(1 for keyword in image_keywords if keyword in description)
    
    # Déterminer le type de contrat en fonction des scores
    contract_types = []
    explanation = ""
    
    if author_score > 0 and image_score > 0:
        # Les deux types sont détectés
        contract_types = ["Auteur (droits d'auteur)", "Image (droit à l'image)"]
        explanation = "Votre projet implique à la fois une création intellectuelle et l'utilisation de votre image. Un contrat combinant les droits d'auteur et le droit à l'image est recommandé."
    elif author_score > image_score:
        contract_types = ["Auteur (droits d'auteur)"]
        explanation = "Votre projet porte principalement sur une création intellectuelle. Un contrat de cession de droits d'auteur est adapté pour protéger votre œuvre."
    elif image_score > author_score:
        contract_types = ["Image (droit à l'image)"]
        explanation = "Votre projet concerne principalement l'utilisation de votre image. Une autorisation d'exploitation du droit à l'image est recommandée."
    else:
        # Cas par défaut si aucun score significatif
        contract_types = ["Auteur (droits d'auteur)"]
        explanation = "D'après votre description, un contrat de cession de droits d'auteur semble adapté, mais n'hésitez pas à sélectionner le type de contrat qui correspond le mieux à votre situation."
    
    return {
        "contract_types": contract_types,
        "explanation": explanation,
        "author_score": author_score,
        "image_score": image_score
    } 