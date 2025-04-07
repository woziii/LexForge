import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Book, Info, Camera, Scale, ShieldCheck, Home } from 'lucide-react';

const SitemapPage = () => {
  const pages = [
    { 
      path: '/', 
      title: 'Accueil', 
      icon: <Home size={20} className="text-blue-500 mr-2" />,
      description: 'Page d\'accueil de LexForge, générateur de contrats juridiques en ligne' 
    },
    { 
      path: '/wizard', 
      title: 'Création de contrat', 
      icon: <FileText size={20} className="text-green-500 mr-2" />,
      description: 'Assistant pas à pas pour la création de contrats personnalisés' 
    },
    { 
      path: '/about', 
      title: 'À propos', 
      icon: <Info size={20} className="text-purple-500 mr-2" />,
      description: 'Découvrez LexForge, notre mission et notre équipe' 
    },
    { 
      path: '/legal', 
      title: 'Mentions légales', 
      icon: <Book size={20} className="text-gray-500 mr-2" />,
      description: 'Informations légales concernant LexForge' 
    },
    { 
      path: '/versions', 
      title: 'Versions', 
      icon: <Book size={20} className="text-indigo-500 mr-2" />,
      description: 'Historique des versions et mises à jour de LexForge' 
    }
  ];

  const contractTypes = [
    {
      title: 'Droits d\'auteur',
      icon: <Scale size={20} className="text-blue-500 mr-2" />,
      description: 'Protégez vos créations intellectuelles et artistiques'
    },
    {
      title: 'Droits à l\'image',
      icon: <Camera size={20} className="text-teal-500 mr-2" />,
      description: 'Encadrement légal de l\'utilisation d\'images de personnes'
    },
    {
      title: 'Contrats combinés',
      icon: <ShieldCheck size={20} className="text-purple-500 mr-2" />,
      description: 'Protection complète combinant droits d\'auteur et droits à l\'image'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Plan du site</h1>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Pages principales</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {pages.map((page) => (
            <Link 
              key={page.path} 
              to={page.path}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-start"
            >
              <div className="mt-0.5">{page.icon}</div>
              <div>
                <div className="font-medium text-gray-900">{page.title}</div>
                <div className="text-sm text-gray-600 mt-1">{page.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Types de contrats disponibles</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {contractTypes.map((type, index) => (
            <div 
              key={index}
              className="p-4 border border-gray-200 rounded-lg flex items-start"
            >
              <div className="mt-0.5">{type.icon}</div>
              <div>
                <div className="font-medium text-gray-900">{type.title}</div>
                <div className="text-sm text-gray-600 mt-1">{type.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SitemapPage; 