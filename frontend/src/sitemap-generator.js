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

async function generateSitemap() {
  try {
    const sitemapStream = new SitemapStream({ hostname });

    routes.forEach(route => {
      sitemapStream.write({
        url: route,
        changefreq: 'weekly',
        priority: route === '/' ? 1.0 : 0.8
      });
    });

    sitemapStream.end();

    const xmlData = await streamToPromise(sitemapStream);

    // Plus d'en-tête redondant ici !
    fs.writeFileSync(resolve('./public/sitemap.xml'), xmlData.toString(), { encoding: 'utf8' });

    console.log('✅ Sitemap XML propre généré dans /public/sitemap.xml');
  } catch (error) {
    console.error('❌ Erreur lors de la génération du sitemap :', error);
  }
}

generateSitemap();