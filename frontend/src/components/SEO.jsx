import React from 'react';
import { Helmet } from 'react-helmet';
import logoIcon from '../assets/images/logoIcon.jpeg';

const SEO = ({ title, description, keywords, canonical }) => {
  const defaultTitle = 'LexForge - Générateur de contrats juridiques';
  const defaultDescription = 'Générez des contrats juridiques conformes en quelques clics. Protégez vos créations avec des documents légaux professionnels.';
  const defaultKeywords = 'contrat juridique, générateur de contrat, droit d\'auteur, cession de droits, document légal';
  const logoUrl = `https://www.lexforge.fr${logoIcon}`;

  return (
    <Helmet>
      {/* Balises SEO essentielles */}
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonical || 'https://www.lexforge.fr'} />
      
      {/* Favicons pour différents contextes */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/favicon.ico" />
      <meta name="msapplication-TileImage" content="/favicon.ico" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Open Graph - Essentiel pour LinkedIn et autres partages */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical || 'https://www.lexforge.fr'} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={logoUrl} />
      <meta property="og:site_name" content="LexForge" />
      <meta property="og:locale" content="fr_FR" />
    </Helmet>
  );
};

export default SEO; 