import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Scale, 
  Camera, 
  Sparkles, 
  FileSignature, 
  ShieldCheck 
} from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Section principale */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo animé */}
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transform transition-all duration-500 hover:rotate-6 hover:scale-110">
            <FileSignature className="h-10 w-10 text-white" strokeWidth={1.5} />
          </div>
          
          {/* Titre principal avec effet de dégradé */}
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            LexForge
          </h1>
          
          {/* Description avec badge */}
          <div className="relative mb-8">
            <p className="text-xl text-gray-700 mb-4">
              Créez des contrats juridiques professionnels en quelques clics
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              <Sparkles size={12} className="mr-1" />
              Simple et rapide
            </div>
          </div>
          
          {/* Bouton d'action principal avec animation */}
          <Link 
            to="/wizard" 
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-xl shadow-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            Créer un contrat
            <ArrowRight size={18} className="ml-2 animate-pulse" />
          </Link>
        </div>
        
        {/* Caractéristiques en badges */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Scale size={28} className="text-blue-600" strokeWidth={1.5} />
            </div>
            <span className="font-medium text-lg text-gray-800 mb-2">Droits d'auteur</span>
            <span className="text-sm text-center text-gray-500">Protection de vos créations intellectuelles et artistiques</span>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
              <Camera size={28} className="text-teal-600" strokeWidth={1.5} />
            </div>
            <span className="font-medium text-lg text-gray-800 mb-2">Droits à l'image</span>
            <span className="text-sm text-center text-gray-500">Encadrement légal de l'utilisation de votre image ou celle de vos modèles</span>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <ShieldCheck size={28} className="text-purple-600" strokeWidth={1.5} />
            </div>
            <span className="font-medium text-lg text-gray-800 mb-2">Contrats combinés</span>
            <span className="text-sm text-center text-gray-500">Protection complète en combinant les droits d'auteur et les droits à l'image</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;