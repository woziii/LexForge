import React from 'react';
import { Shield, Book, HelpCircle } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">À propos de LexForge</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          LexForge est un assistant intelligent de création de contrats juridiques, conçu pour simplifier la rédaction de documents légaux complexes.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre mission</h2>
        <p className="text-gray-600 mb-4">
          LexForge a été créé avec une mission claire : démocratiser l'accès aux outils juridiques professionnels. 
          Nous croyons que chacun devrait pouvoir protéger ses droits et ses créations sans avoir à engager des frais juridiques considérables.
        </p>
        <p className="text-gray-600 mb-4">
          Notre plateforme permet aux créateurs, entrepreneurs et particuliers de générer des contrats juridiquement solides, 
          adaptés à leurs besoins spécifiques, grâce à une interface intuitive et un processus guidé pas à pas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Sécurité et confidentialité</h3>
          <p className="text-gray-600">
            Nous accordons la plus haute importance à la protection de vos données. 
            Toutes les informations que vous saisissez sont traitées avec la plus stricte confidentialité et ne sont jamais partagées avec des tiers.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Book className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Expertise juridique</h3>
          <p className="text-gray-600">
            Nos modèles de contrats sont élaborés par des juristes spécialisés et régulièrement mis à jour 
            pour refléter les évolutions législatives et réglementaires.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <HelpCircle className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Support utilisateur</h3>
          <p className="text-gray-600">
            Notre équipe est disponible pour répondre à vos questions et vous accompagner dans l'utilisation de notre plateforme. 
            N'hésitez pas à nous contacter pour toute demande d'assistance.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mentions légales</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Éditeur</h3>
            <p className="text-gray-600">
              
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Hébergement</h3>
            <p className="text-gray-600">
              Ce site est hébergé par Hugging Face Spaces, un service d'hébergement d'applications web.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Propriété intellectuelle</h3>
            <p className="text-gray-600">
              L'ensemble des éléments constituant ce site (textes, graphismes, logiciels, images, etc.) 
              est la propriété exclusive de Tellers et est protégé par les lois françaises et internationales 
              relatives à la propriété intellectuelle.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Limitation de responsabilité</h3>
            <p className="text-gray-600">
              Les contrats générés par LexForge sont fournis à titre informatif et ne remplacent pas les conseils 
              d'un professionnel du droit. Nous recommandons de faire vérifier tout contrat par un avocat avant 
              signature, particulièrement pour les situations complexes ou à enjeux importants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 