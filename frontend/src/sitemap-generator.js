// Import des dépendances nécessaires
require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: ['@babel/plugin-transform-modules-commonjs']
});

const fs = require('fs');
const path = require('path');
const { publicRoutes, baseUrl } = require('./routes-config');

// Fonction pour générer le sitemap
const generateSitemap = () => {
  try {
    // Création du contenu XML du sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${publicRoutes.map(route => `  <url>
  <loc>${baseUrl}${route.path}</loc>
  <changefreq>${route.changefreq}</changefreq>
  <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    // Écriture du fichier sitemap.xml dans le dossier public
    const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');

    console.log('✅ Sitemap généré avec succès :', sitemapPath);
  } catch (error) {
    console.error('❌ Erreur lors de la génération du sitemap :', error);
  }
};

// Exécution de la génération
generateSitemap(); 