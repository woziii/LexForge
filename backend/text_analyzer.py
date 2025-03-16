"""
Module d'analyse de texte pour détecter automatiquement le type de contrat nécessaire.
"""

def analyze_work_description(description):
    """
    Analyse la description fournie par l'utilisateur pour déterminer le type de contrat approprié.
    
    Args:
        description (str): Description fournie par l'utilisateur
        
    Returns:
        list: Liste des types de contrats nécessaires ["Auteur (droits d'auteur)", "Image (droit à l'image)"]
    """
    # Normaliser le texte pour l'analyse
    texte = description.lower()
    
    # Initialiser les scores
    score_auteur = 0
    score_image = 0
    
    # DROITS D'AUTEUR - Mots-clés par catégorie
    mots_textuels = ["livre", "roman", "nouvelle", "poème", "article", "essai", "mémoire", "thèse", "scénario", 
                     "manuscrit", "rédaction", "texte", "écriture", "publication", "écrit", "éditorial", "blog",
                     "ouvrage", "brochure", "journal", "magazine", "recueil", "rédactionnel"]
    
    mots_musicaux = ["musique", "composition", "partition", "chanson", "mélodie", "arrangement", "œuvre musicale", 
                     "symphonie", "album", "single", "son", "enregistrement", "morceau", "opus", "instrumental",
                     "concert", "orchestration", "chant", "lyrics", "paroles", "refrain", "harmonie", "acoustique",
                     "piano", "guitare", "violon", "batterie", "chanter", "interprétation musicale"]
    
    mots_graphiques = ["peinture", "dessin", "illustration", "graphisme", "logo", "infographie", "design", 
                       "tableau", "esquisse", "croquis", "fresque", "œuvre plastique", "affiche", "aquarelle", 
                       "sculpture", "gravure", "sérigraphie", "street art", "graffiti", "photographie artistique",
                       "collage", "estampe", "lithographie", "pochette", "couverture"]
    
    mots_numeriques = ["logiciel", "site web", "application", "code", "programme", "script", "algorithme", 
                       "jeu vidéo", "développement", "appli", "interface", "plateforme", "solution digitale",
                       "nft", "token", "crypto", "blockchain", "web3", "intelligence artificielle", "ia",
                       "données", "base de données", "système", "api", "plugin", "extension", "widget"]
    
    mots_architecturaux = ["plan", "maquette", "conception architecturale", "design d'espace", "modélisation 3D",
                          "architecture", "structure", "bâtiment", "édifice", "monument", "urbanisme",
                          "aménagement", "paysagisme", "intérieur", "déco", "décoration"]
    
    mots_autres_auteur = ["concept", "idée", "invention", "savoir-faire", "méthode", "formule", "base de données", 
                          "compilation", "collection", "œuvre", "création", "synthèse", "travail", "production",
                          "droit d'auteur", "propriété intellectuelle", "copyright", "brevet"]
    
    # DROITS À L'IMAGE - Mots-clés par catégorie
    mots_image_personne = ["photographie", "portrait", "silhouette", "apparence", "visage", "corps", "identité visuelle", 
                           "selfie", "avatar", "photo d'identité", "figure", "physionomie", "traits", "mannequin",
                           "modèle photo", "acteur", "actrice", "comédien", "comédienne", "figurant", "témoignage vidéo"]
    
    mots_image_contexte = ["pose", "séance photo", "shooting", "mannequin", "modèle", "figurant", "mise en scène", 
                           "studio photo", "apparition", "photoshoot", "objectif", "capturer", "appareil photo",
                           "caméra", "filmer", "enregistrer", "photographier", "filmer", "enregistrer"]
    
    mots_image_visibilité = ["identifiable", "reconnaissable", "apparaître", "figurer", "posant", "visible", 
                             "présent", "participation", "exposé", "exhibé", "montré", "droit à l'image", 
                             "consentement", "image", "vidéo"]
    
    mots_image_supports = ["photo", "image", "pellicule", "cliché", "instantané", "polaroid", "négatif", 
                           "diapositive", "tirage", "impression photographique", "portrait", "photomaton"]
    
    # COMBINAISON DROITS D'AUTEUR + DROITS À L'IMAGE
    mots_videos = ["vidéo", "film", "court-métrage", "clip", "documentaire", "reportage", "captation", "tournage", 
                   "filmé", "filmage", "enregistrement vidéo", "séquence", "rushes", "montage vidéo", "movie",
                   "cinéma", "réalisation", "vidéaste", "youtubeur", "youtubeuse", "influenceur", "influenceuse",
                   "vlog", "tiktok", "instagram", "content creator", "créateur de contenu"]
    
    mots_performances = ["performance", "spectacle", "concert", "prestation", "apparition", "interprétation", 
                         "récital", "show", "émission", "interview", "représentation", "apparition publique",
                         "scène", "plateaux", "théâtre", "danse", "chorégraphie", "ballet", "opéra", "music-hall",
                         "one man show", "stand-up", "humoriste", "conférence", "conférencier"]
    
    mots_digital_personnel = ["stream", "livestream", "webinaire", "podcast vidéo", "tutoriel vidéo", "cours filmé", 
                             "formation vidéo", "diffusion en direct", "chaîne youtube", "vlog", "direct",
                             "twitch", "live", "enregistrement zoom", "vidéoconférence", "stories", "reels"]
    
    mots_œuvres_mixtes = ["œuvre audiovisuelle", "multimédia", "installation artistique interactive", 
                         "réalité virtuelle", "réalité augmentée", "performance audiovisuelle", "mapping vidéo",
                         "projection", "hologramme", "expo interactive", "jeu immersif"]
    
    # Vérifier les correspondances pour les droits d'auteur
    for mot in mots_textuels + mots_musicaux + mots_graphiques + mots_numeriques + mots_architecturaux + mots_autres_auteur:
        if mot in texte or any(m in texte for m in mot.split()):
            score_auteur += 1
    
    # Vérifier les correspondances pour les droits à l'image
    for mot in mots_image_personne + mots_image_contexte + mots_image_visibilité + mots_image_supports:
        if mot in texte or any(m in texte for m in mot.split()):
            score_image += 1
    
    # Vérifier les correspondances pour la combinaison (augmente les deux scores)
    for mot in mots_videos + mots_performances + mots_digital_personnel + mots_œuvres_mixtes:
        if mot in texte or any(m in texte for m in mot.split()):
            score_auteur += 1
            score_image += 1
    
    # Cas spéciaux nécessitant une analyse plus contextuelle
    if "chant" in texte or "chante" in texte or "chanson" in texte:
        score_auteur += 1
        if any(mot in texte for mot in ["vidéo", "film", "enregistrement vidéo", "youtube", "clip"]):
            score_image += 1
    
    if "exposit" in texte:  # exposition/expositions
        score_auteur += 1
        if any(mot in texte for mot in ["photo", "portrait", "modèle", "personne"]):
            score_image += 1
    
    # Analyser les combinaisons courantes
    if "voix" in texte:
        score_auteur += 1
        if "visage" in texte or "image" in texte or "vidéo" in texte:
            score_image += 1
    
    # Déterminer le type de contrat
    types_contrat = []
    if score_auteur > 0:
        types_contrat.append("Auteur (droits d'auteur)")
    if score_image > 0:
        types_contrat.append("Image (droit à l'image)")
    
    # Si aucun type détecté, suggérer les deux par sécurité
    if not types_contrat:
        return ["Auteur (droits d'auteur)", "Image (droit à l'image)"]
    
    return types_contrat


def get_explanation(detected_types):
    """
    Génère une explication claire des types de contrats détectés.
    
    Args:
        detected_types (list): Types de contrats détectés
        
    Returns:
        str: Explication pour l'utilisateur
    """
    if len(detected_types) == 2:
        return """
        J'ai détecté que vous avez besoin d'un **contrat combiné de cession de droits d'auteur et de droits à l'image**.
        
        Ce type de contrat est adapté lorsque:
        - L'œuvre est protégée par le droit d'auteur (texte, musique, design, etc.)
        - ET l'image d'une personne est visible et exploitée (vidéo, photo, etc.)
        
        Vous pouvez modifier cette sélection si nécessaire.
        """
    
    elif "Auteur (droits d'auteur)" in detected_types:
        return """
        J'ai détecté que vous avez besoin d'un **contrat de cession de droits d'auteur** uniquement.
        
        Ce type de contrat est adapté pour les œuvres protégées comme:
        - Textes, livres, articles
        - Musiques, compositions
        - Dessins, peintures, designs
        - Logiciels, sites web
        - Et autres créations originales
        
        Si votre projet implique également l'image reconnaissable d'une personne, vous pourriez aussi avoir besoin d'un contrat de droits à l'image.
        """
    
    elif "Image (droit à l'image)" in detected_types:
        return """
        J'ai détecté que vous avez besoin d'un **contrat de cession de droits à l'image** uniquement.
        
        Ce type de contrat est adapté lorsque:
        - L'image ou la vidéo d'une personne est utilisée
        - La personne est identifiable ou reconnaissable
        - Il n'y a pas d'œuvre originale protégée par le droit d'auteur
        
        Si votre projet implique également une œuvre originale, vous pourriez aussi avoir besoin d'un contrat de cession de droits d'auteur.
        """
    
    else:
        return """
        Je n'ai pas pu déterminer automatiquement le type de contrat nécessaire.
        
        Veuillez sélectionner manuellement:
        - Contrat de droits d'auteur: pour les œuvres originales (textes, musiques, designs, etc.)
        - Contrat de droits à l'image: pour l'utilisation de l'image d'une personne
        - Les deux: si les deux aspects sont présents
        """
