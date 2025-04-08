/**
 * Configuration des données schema.org pour LexForge
 * Ce fichier centralise toutes les données structurées utilisées dans l'application
 */

const baseUrl = 'https://www.lexforge.fr';

// Configuration de l'organisation
export const organizationData = {
  name: 'LexForge',
  legalName: 'LexForge',
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  description: 'Plateforme française de génération de contrats juridiques pour créateurs et entrepreneurs',
  foundingDate: '2024',
  founders: [
    {
      "@type": "Person",
      "name": "Lucas MAURICI",
      "jobTitle": "Fondateur"
    }
  ],
  address: {
    "@type": "PostalAddress",
    "addressCountry": "FR"
  }
};

// Configuration des services juridiques
export const legalServices = [
  {
    name: "Contrat de cession de droits d'auteur",
    description: "Générez un contrat de cession de droits d'auteur personnalisé et conforme au droit français",
    category: "Propriété intellectuelle"
  },
  {
    name: "Contrat de droit à l'image",
    description: "Créez un contrat de droit à l'image adapté à vos besoins",
    category: "Droit à l'image"
  }
];

// Configuration de l'application
export const applicationFeatures = {
  mainFeatures: [
    "Génération automatisée de contrats juridiques",
    "Interface utilisateur intuitive",
    "Personnalisation des clauses",
    "Export PDF",
    "Sauvegarde sécurisée",
    "Conformité au droit français"
  ],
  technicalFeatures: [
    "Sans IA générative",
    "Hébergement sécurisé",
    "Protection des données",
    "Interface responsive"
  ]
};

// Configuration des pages principales
export const pageConfigs = {
  home: {
    title: "LexForge - Générateur de contrats juridiques",
    description: "Créez des contrats juridiques professionnels en quelques clics. Solution française gratuite pour la génération de documents légaux.",
    keywords: "contrat juridique, générateur contrat, droit auteur, droit image, document légal"
  },
  about: {
    title: "À propos de LexForge",
    description: "Découvrez LexForge, votre solution pour la création de contrats juridiques sur mesure. Une plateforme française dédiée à la protection de vos droits.",
    keywords: "à propos lexforge, service juridique, contrats légaux, protection droits"
  },
  wizard: {
    title: "Créer un contrat - Assistant LexForge",
    description: "Assistant intelligent pour la création de contrats juridiques personnalisés. Générez votre contrat étape par étape.",
    keywords: "création contrat, assistant juridique, générateur document, contrat personnalisé"
  }
};

// Configuration des breadcrumbs
export const breadcrumbsConfig = {
  about: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "À propos",
        "item": `${baseUrl}/about`
      }
    ]
  },
  wizard: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Créer un contrat",
        "item": `${baseUrl}/wizard`
      }
    ]
  }
};

// Configuration des FAQ
export const faqConfig = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "LexForge est-il gratuit ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, LexForge est entièrement gratuit. Vous pouvez générer autant de contrats que vous le souhaitez sans frais."
      }
    },
    {
      "@type": "Question",
      "name": "Les contrats générés sont-ils juridiquement valables ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Les contrats générés par LexForge sont conformes au droit français. Cependant, pour les situations complexes, nous recommandons toujours de faire vérifier les contrats par un professionnel du droit."
      }
    },
    {
      "@type": "Question",
      "name": "Utilisez-vous l'IA générative ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Non, LexForge n'utilise pas d'IA générative. Nos contrats sont basés sur des modèles juridiques prédéfinis et validés."
      }
    }
  ]
};

export default {
  baseUrl,
  organizationData,
  legalServices,
  applicationFeatures,
  pageConfigs,
  breadcrumbsConfig,
  faqConfig
}; 