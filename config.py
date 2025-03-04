"""
Fichier de configuration contenant les constantes et paramètres utilisés dans l'application.
"""

# Informations sur le cessionnaire (Tellers)
TELLERS_INFO = {
    "nom": "Tellers",
    "forme_juridique": "société par actions simplifiée unipersonnelle",
    "capital": "1000 €",
    "rcs": "932 553 266 R.C.S. Lyon",
    "siege": "12 RUE DE LA PART-DIEU, 69003 LYON"
}

# Options pour les différents types de contrats
CONTRACT_TYPES = [
    "Auteur (droits d'auteur)",
    "Image (droit à l'image)"
]

# Options pour le mode de cession
CESSION_MODES = [
    "Gratuite",
    "Onéreuse"
]

# Options pour les droits supplémentaires (cession onéreuse uniquement)
ADDITIONAL_RIGHTS = [
    "distribution - droit de distribuer l'original ou les copies de l'œuvre au public",
    "usage - droit d'utiliser l'œuvre pour les besoins du cessionnaire",
    "adaptation - droit de modifier, transformer, traduire l'œuvre",
    "pret - droit de mettre l'œuvre à disposition pour un usage temporaire",
    "location - droit de mettre l'œuvre à disposition contre rémunération",
    "suite - droit de percevoir un pourcentage lors de reventes (œuvres graphiques/plastiques uniquement)"
]

# Options pour le type d'auteur
AUTHOR_TYPES = [
    "Personne physique",
    "Personne morale"
]

# Options pour la civilité
CIVILITY_OPTIONS = [
    "M.",
    "Mme"
]

# Options pour les supports d'exploitation
SUPPORTS_OPTIONS = [
    "Réseaux sociaux (Facebook, Instagram, Twitter, etc.)",
    "Applications mobiles",
    "Plateformes de diffusion vidéo (YouTube, Twitch, etc.)",
    "Supports imprimés (catalogues, flyers, affiches)",
    "Présentations lors d'événements",
    "Publicités en ligne",
    "Plateformes tierces (marketplaces, sites partenaires)",
    "Emails et newsletters"
]

# Supports toujours inclus (obligatoires)
DEFAULT_SUPPORTS = [
    "site web",
    "Discord"
]

# Paramètres PDF
PDF_CONFIG = {
    "page_size": "A4",
    "margin_right": 25,  # mm
    "margin_left": 25,   # mm
    "margin_top": 20,    # mm
    "margin_bottom": 20, # mm
    "font_main": "Helvetica",
    "font_bold": "Helvetica-Bold",
    "font_size_title": 14,
    "font_size_subtitle": 12,
    "font_size_normal": 10,
    "font_size_article": 11
}

# Durée et territoire par défaut
DEFAULT_DURATION = "un (1) an"
DEFAULT_RENEWAL = "renouvellement par tacite reconduction pour des périodes successives d'un (1) an"
DEFAULT_TERRITORY = "monde entier"
