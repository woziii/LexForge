import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Check, ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6">
      {/* Section Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Créez des contrats juridiques professionnels en quelques minutes
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          LexForge vous guide pas à pas dans la création de contrats de cession de droits d'auteur et de droits à l'image adaptés à vos besoins spécifiques.
        </p>
        <Link 
          to="/wizard" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Commencer maintenant
          <ArrowRight size={20} className="ml-2" />
        </Link>
      </div>

      {/* Section Fonctionnalités */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Pourquoi choisir LexForge ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Simple et intuitif</h3>
            <p className="text-gray-600">
              Interface guidée pas à pas qui vous accompagne tout au long du processus de création de contrat.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Juridiquement fiable</h3>
            <p className="text-gray-600">
              Contrats rédigés selon les normes juridiques en vigueur pour garantir la protection de vos droits.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Personnalisable</h3>
            <p className="text-gray-600">
              Adaptez chaque clause selon vos besoins spécifiques et visualisez les modifications en temps réel.
            </p>
          </div>
        </div>
      </div>

      {/* Section Types de contrats */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Types de contrats disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold">Contrat de cession de droits d'auteur</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Protégez vos créations intellectuelles et définissez précisément les conditions de leur utilisation par des tiers.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Cession gratuite ou onéreuse</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Options d'exclusivité</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Définition précise des supports d'exploitation</span>
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold">Contrat de cession de droits à l'image</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Encadrez l'utilisation de votre image ou celle de vos modèles dans un cadre légal clair et sécurisé.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Protection de la vie privée</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Limitation des usages autorisés</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Définition de la durée et du territoire</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Prêt à créer votre contrat ?
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Notre assistant vous guide étape par étape pour créer un contrat parfaitement adapté à vos besoins.
        </p>
        <Link 
          to="/wizard" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Commencer maintenant
          <ArrowRight size={20} className="ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default HomePage; 