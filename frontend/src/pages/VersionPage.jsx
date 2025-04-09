import React, { useState } from 'react';
import { Bug, CheckCircle, GitBranch, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';

const VersionPage = () => {
  const [openVersions, setOpenVersions] = useState({});

  const toggleVersion = (version) => {
    setOpenVersions(prev => ({
      ...prev,
      [version]: !prev[version]
    }));
  };

  return (
    <>
      <SEO 
        title="Versions et Corrections"
        description="Historique des versions de LexForge : mises à jour, corrections et évolutions du générateur de contrats. Suivez les améliorations apportées à notre plateforme juridique."
        keywords="versions, corrections, mises à jour, lexforge, évolution, changelog, historique des versions, améliorations"
        canonical="https://www.lexforge.fr/versions"
      />
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Versions et Corrections</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Suivez l'évolution de LexForge et les améliorations apportées à chaque version.
          </p>
        </div>

        <div className="space-y-8">
          {/* Versions précédentes (chronologiques) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button 
              onClick={() => toggleVersion('1.0')}
              className="w-full flex items-center justify-between p-6 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <GitBranch className="h-6 w-6 text-gray-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-800">Version Bêta 1.0</h2>
                <span className="ml-3 text-xs bg-gray-200 text-gray-700 py-1 px-2 rounded-md">Initiale</span>
              </div>
              {openVersions['1.0'] ? <ChevronDown className="h-5 w-5 text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
            </button>
            
            {openVersions['1.0'] && (
              <div className="p-6 bg-white border-t border-gray-200 animate-fadeIn">
                <p className="text-gray-600 mb-4">
                  Version initiale de LexForge, premiers tests internes.
                </p>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Fonctionnalités initiales
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 pl-6">
                    <li>Générateur de contrats basique</li>
                    <li>Interface utilisateur minimaliste</li>
                    <li>Système d'authentification simple</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button 
              onClick={() => toggleVersion('1.1')}
              className="w-full flex items-center justify-between p-6 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <GitBranch className="h-6 w-6 text-gray-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-800">Version Bêta 1.1</h2>
                <span className="ml-3 text-xs bg-gray-200 text-gray-700 py-1 px-2 rounded-md">Précédente</span>
              </div>
              {openVersions['1.1'] ? <ChevronDown className="h-5 w-5 text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
            </button>
            
            {openVersions['1.1'] && (
              <div className="p-6 bg-white border-t border-gray-200 animate-fadeIn">
                <p className="text-gray-600 mb-4">
                  Première version publique de LexForge, permettant la création de contrats personnalisés.
                </p>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Fonctionnalités principales
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 pl-6">
                    <li>Générateur de contrats avec formulaire guidé</li>
                    <li>Authentification utilisateur</li>
                    <li>Sauvegarde et gestion des contrats</li>
                    <li>Interface d'édition de contrats</li>
                    <li>Dashboard pour suivre l'activité</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Version actuelle */}
          <div className="bg-white rounded-lg shadow-md p-8 border-2 border-blue-200">
            <div className="flex items-center mb-6">
              <GitBranch className="h-7 w-7 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Version Bêta 1.1.1</h2>
              <span className="ml-3 text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-md">Actuelle</span>
            </div>
            
            <p className="text-gray-600 mb-6">
              Version stabilisée de LexForge avec améliorations ergonomiques majeures.
            </p>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Fonctionnalités principales
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1 pl-6">
                <li>Générateur de contrats avec formulaire guidé</li>
                <li>Authentification utilisateur</li>
                <li>Sauvegarde et gestion des contrats</li>
                <li>Interface d'édition de contrats</li>
                <li>Dashboard pour suivre l'activité</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Bug className="h-5 w-5 text-amber-600 mr-2" />
                Corrections récentes :
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1 pl-6">
                <li>Amélioration de la sélection des profils dans le dashboard et à l'étape 1 du générateur</li>
                <li>Ajout de la possibilité de revenir à l'étape 5 depuis l'étape 6 quand des informations sont manquantes</li>
              </ul>
            </div>
          </div>
          
          {/* À venir */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <div className="flex items-center mb-6">
              <GitBranch className="h-7 w-7 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Version Bêta 1.2</h2>
              <span className="ml-3 text-sm bg-indigo-100 text-indigo-800 py-1 px-2 rounded-md">À venir</span>
            </div>
            
            <p className="text-gray-600 mb-6">
              Prochaine mise à jour prévue avec de nouvelles fonctionnalités et améliorations.
            </p>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Améliorations prévues</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1 pl-6">
                <li>Nouveaux modèles de contrats</li>
                <li>Système de feedback client</li>
                <li>Amélioration de l'interface utilisateur</li>
                <li>Fonctionnalités de partage avancées</li>
                <li>Système de support utilisateur</li>
                <li>Renforcement de la sécurité des données</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VersionPage; 
