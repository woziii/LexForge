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
    const sitemapStream = new SitemapStream({ 
      hostname,
      pretty: true // Ajout de l'option pretty pour la mise en forme
    });

    routes.forEach(route => {
      sitemapStream.write({
        url: route,
        changefreq: 'weekly',
        priority: route === '/' ? 1.0 : 0.8
      });
    });

    sitemapStream.end();

    const xmlData = await streamToPromise(sitemapStream);
    
    // Ajout d'un saut de ligne après la déclaration XML
    const formattedXml = xmlData.toString()
      .replace('<?xml version="1.0" encoding="UTF-8"?>', '<?xml version="1.0" encoding="UTF-8"?>\n')
      .replace(/></g, '>\n  <');

    fs.writeFileSync(resolve('./public/sitemap.xml'), formattedXml, { encoding: 'utf8' });

    console.log('✅ Sitemap XML propre généré dans /public/sitemap.xml');
  } catch (error) {
    console.error('❌ Erreur lors de la génération du sitemap :', error);
  }
}

generateSitemap();