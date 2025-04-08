import React from 'react';
import { Helmet } from 'react-helmet';
import schemaConfig from '../config/schema.config';

const SchemaOrg = ({ path }) => {
  const {
    baseUrl,
    organizationData,
    applicationFeatures,
    pageConfigs,
    breadcrumbsConfig,
    faqConfig
  } = schemaConfig;

  // Schéma de base pour l'organisation
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    ...organizationData
  };

  // Schéma pour le site web
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    "url": baseUrl,
    "name": organizationData.name,
    "description": organizationData.description,
    "publisher": {
      "@id": `${baseUrl}/#organization`
    }
  };

  // Schéma pour l'application logicielle
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${baseUrl}/#software`,
    "name": organizationData.name,
    "applicationCategory": "LegalSoftware",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "featureList": applicationFeatures.mainFeatures,
    "provider": {
      "@id": `${baseUrl}/#organization`
    }
  };

  // Schéma pour les services juridiques
  const legalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${baseUrl}/#service`,
    "name": "Services juridiques LexForge",
    "serviceType": "Legal Document Generation",
    "provider": {
      "@id": `${baseUrl}/#organization`
    },
    "areaServed": "FR",
    "availableLanguage": "fr",
    "description": organizationData.description,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    }
  };

  // Fonction pour obtenir le schéma de page en fonction du chemin
  const getPageSchema = () => {
    const pageConfig = {
      '/': pageConfigs.home,
      '/about': pageConfigs.about,
      '/wizard': pageConfigs.wizard
    }[path];

    if (!pageConfig) return null;

    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${baseUrl}${path}#webpage`,
      "url": `${baseUrl}${path}`,
      "name": pageConfig.title,
      "description": pageConfig.description,
      "isPartOf": {
        "@id": `${baseUrl}/#website`
      },
      "about": {
        "@id": `${baseUrl}/#organization`
      },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    };
  };

  // Obtenir le schéma de breadcrumb si disponible
  const getBreadcrumbSchema = () => {
    const pathKey = path.substring(1) || 'home';
    return breadcrumbsConfig[pathKey];
  };

  // Obtenir le schéma FAQ pour la page d'accueil
  const getFaqSchema = () => {
    return path === '/' ? faqConfig : null;
  };

  const pageSchema = getPageSchema();
  const breadcrumbSchema = getBreadcrumbSchema();
  const faqSchema = getFaqSchema();

  return (
    <Helmet>
      {/* Schémas de base toujours présents */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(softwareApplicationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(legalServiceSchema)}
      </script>

      {/* Schéma spécifique à la page si disponible */}
      {pageSchema && (
        <script type="application/ld+json">
          {JSON.stringify(pageSchema)}
        </script>
      )}

      {/* Schéma de breadcrumb si disponible */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Schéma FAQ si sur la page d'accueil */}
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SchemaOrg; 