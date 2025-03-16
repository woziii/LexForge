// Options pour les différents types de contrats
export const CONTRACT_TYPES = [
  "Auteur (droits d'auteur)",
  "Image (droit à l'image)"
];

// Options pour le mode de cession
export const CESSION_MODES = [
  "Gratuite",
  "Onéreuse"
];

// Options pour les droits supplémentaires (cession onéreuse uniquement)
export const ADDITIONAL_RIGHTS = [
  "distribution - droit de distribuer l'original ou les copies de l'œuvre au public",
  "usage - droit d'utiliser l'œuvre pour les besoins du cessionnaire",
  "adaptation - droit de modifier, transformer, traduire l'œuvre",
  "pret - droit de mettre l'œuvre à disposition pour un usage temporaire",
  "location - droit de mettre l'œuvre à disposition contre rémunération",
  "suite - droit de percevoir un pourcentage lors de reventes (œuvres graphiques/plastiques uniquement)"
];

// Options pour le type d'auteur
export const AUTHOR_TYPES = [
  "Personne physique",
  "Personne morale"
];

// Options pour la civilité
export const CIVILITY_OPTIONS = [
  "M.",
  "Mme"
];

// Options pour les supports d'exploitation
export const SUPPORTS_OPTIONS = [
  "Réseaux sociaux (Facebook, Instagram, Twitter, etc.)",
  "Applications mobiles",
  "Plateformes de diffusion vidéo (YouTube, Twitch, etc.)",
  "Supports imprimés (catalogues, flyers, affiches)",
  "Présentations lors d'événements",
  "Publicités en ligne",
  "Plateformes tierces (marketplaces, sites partenaires)",
  "Emails et newsletters"
];

// Supports toujours inclus (obligatoires)
export const DEFAULT_SUPPORTS = [
  "site web",
  "Discord"
];

// Informations sur le cessionnaire (Tellers)
export const TELLERS_INFO = {
  "nom": "Tellers",
  "forme_juridique": "société par actions simplifiée unipersonnelle",
  "capital": "1000 €",
  "rcs": "932 553 266 R.C.S. Lyon",
  "siege": "12 RUE DE LA PART-DIEU, 69003 LYON"
}; 