import React from 'react';
import { Bug, CheckCircle, GitBranch, BookOpen } from 'lucide-react';

const VersionPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Versions et Corrections</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Suivez l'évolution de LexForge et les améliorations apportées à chaque version.
        </p>
      </div>

      <div className="space-y-8">
        {/* Version actuelle */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <GitBranch className="h-7 w-7 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Version Bêta 1.1</h2>
            <span className="ml-3 text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-md">Actuelle</span>
          </div>
          
          <p className="text-gray-600 mb-6">
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
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Bug className="h-5 w-5 text-amber-600 mr-2" />
              Corrections récentes :
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 pl-6">
              <li>Correction du bug de numérotation des contrats</li>
              <li>Amélioration de la sauvegarde des contrats des utilisateurs non authentifiés puis authentifiés</li>
              <li>Ajout de la fonctionnalité permettant de télécharger le contrat en PDF depuis l'éditeur</li>
              <li>Correction des problèmes d'affichage sur les appareils mobiles</li>
              <li>Correction des erreurs de migration des données utilisateur</li>
              <li>Optimisation des performances de l'éditeur de texte</li>
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
  );
};

export default VersionPage; 
