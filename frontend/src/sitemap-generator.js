const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
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
  const sitemap = new SitemapStream({ hostname });
  const writeStream = createWriteStream(resolve('./public/sitemap.xml'));
  
  // Ajout des routes au sitemap
  routes.forEach(route => {
    sitemap.write({
      url: route,
      changefreq: 'weekly',
      priority: route === '/' ? 1.0 : 0.8
    });
  });
  
  sitemap.end();
  
  // Redirection du flux vers le fichier
  sitemap.pipe(writeStream);
  
  console.log('Sitemap généré avec succès dans /public/sitemap.xml');
}

generateSitemap().catch(error => {
  console.error('Erreur lors de la génération du sitemap:', error);
}); 