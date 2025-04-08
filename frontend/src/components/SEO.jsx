import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ title, description, keywords, canonical }) => {
  const defaultTitle = 'LexForge - Générateur de contrats juridiques';
  const defaultDescription = 'Générez des contrats juridiques conformes en quelques clics. Protégez vos créations avec des documents légaux professionnels.';
  const defaultKeywords = 'contrat juridique, générateur de contrat, droit d\'auteur, cession de droits, document légal';

  return (
    <Helmet>
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <link rel="canonical" href={canonical || 'https://www.lexforge.fr'} />
      
      {/* Favicon - Multiple formats pour assurer la compatibilité maximale */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/favicon.ico" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#3B82F6" /> {/* Couleur bleue de l'interface LexForge */}
      <meta name="msapplication-TileImage" content="/favicon.ico" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical || 'https://www.lexforge.fr'} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content="/favicon.ico" /> {/* Utiliser favicon comme image par défaut */}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical || 'https://www.lexforge.fr'} />
      <meta property="twitter:title" content={title || defaultTitle} />
      <meta property="twitter:description" content={description || defaultDescription} />
      <meta property="twitter:image" content="/favicon.ico" /> {/* Utiliser favicon comme image par défaut */}
    </Helmet>
  );
};

export default SEO; 