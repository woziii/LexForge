/**
 * Configuration des routes publiques pour le sitemap
 * Ce fichier centralise les routes qui doivent être indexées par les moteurs de recherche
 */

// Routes publiques accessibles sans authentification
const publicRoutes = [
  {
    path: '/',
    priority: 1.0,
    changefreq: 'weekly'
  },
  {
    path: '/about',
    priority: 0.8,
    changefreq: 'weekly'
  },
  {
    path: '/legal',
    priority: 0.8,
    changefreq: 'weekly'
  },
  {
    path: '/versions',
    priority: 0.8,
    changefreq: 'weekly'
  },
  {
    path: '/wizard',
    priority: 0.8,
    changefreq: 'weekly'
  },
  {
    path: '/plan-site',
    priority: 0.8,
    changefreq: 'weekly'
  }
];

// Routes privées nécessitant une authentification
// Ces routes ne sont pas incluses dans le sitemap
const privateRoutes = [
  '/dashboard',
  '/contracts',
  '/editor/:contractId',
  '/wizard/finalize/:contractId'
];

// Export des configurations
module.exports = {
  publicRoutes,
  privateRoutes,
  baseUrl: 'https://www.lexforge.fr'
}; 