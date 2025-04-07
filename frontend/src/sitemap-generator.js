const { SitemapStream, streamToPromise } = require('sitemap');
const fs = require('fs');
const { resolve } = require('path');

// Routes publiques extraites de App.js
const routes = [
  '/',
  '/about',
  '/legal',
  '/versions',
  '/wizard',
  '/plan-site'
];

// URL de base du site
const hostname = 'https://www.lexforge.fr';

// Création du sitemap
async function generateSitemap() {
  try {
    // Création du stream pour le sitemap
    const sitemapStream = new SitemapStream({ hostname });
    
    // Ajout des routes au sitemap
    routes.forEach(route => {
      sitemapStream.write({
        url: route,
        changefreq: 'weekly',
        priority: route === '/' ? 1.0 : 0.8
      });
    });
    
    // Fin de l'écriture dans le stream
    sitemapStream.end();
    
    // Conversion du stream en XML
    const sitemap = await streamToPromise(sitemapStream);
    
    // Écriture du XML dans le fichier
    fs.writeFileSync(resolve('./public/sitemap.xml'), sitemap.toString());
    
    console.log('✅ Sitemap généré au format XML valide dans /public/sitemap.xml');
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
  }
}

generateSitemap(); 