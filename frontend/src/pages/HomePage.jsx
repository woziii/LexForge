import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Scale, 
  Camera, 
  Sparkles, 
  FileSignature, 
  ShieldCheck,
  LayoutDashboard,
  InfoIcon
} from 'lucide-react';
import { getUserProfile } from '../services/api';

const HomePage = () => {
  const [isProfileConfigured, setIsProfileConfigured] = useState(null);
  
  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        
        const hasPhysicalPerson = profile?.physical_person?.is_configured;
        const hasLegalEntity = profile?.legal_entity?.is_configured;
        
        setIsProfileConfigured(hasPhysicalPerson || hasLegalEntity);
      } catch (error) {
        console.error('Error checking user profile:', error);
        setIsProfileConfigured(false);
      }
    };
    
    checkUserProfile();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Section principale avec titre central dominant */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-16 sm:py-28">
        <div className="w-full max-w-6xl mx-auto text-center px-4">
          
          {/* Titre principal dominant avec effet de dégradé */}
          <div className="mb-16 sm:mb-20">
            {/* Logo animé au-dessus du titre */}
            <div className="mb-8 sm:mb-10 inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transform transition-all duration-500 hover:rotate-6 hover:scale-110">
              <FileSignature className="h-8 w-8 sm:h-12 sm:w-12 text-white" strokeWidth={1.5} />
            </div>
            
            <h1 className="text-7xl sm:text-9xl font-black mb-10 sm:mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 tracking-tight py-6 px-2 leading-tight drop-shadow-xl animate-gradient-slow bg-gradient-size">
              LexForge
            </h1>
          </div>
          
          {/* Description avec badge */}
          <div className="relative mb-6 sm:mb-8">
            <p className="text-lg sm:text-xl text-gray-700 mb-3 sm:mb-4 px-1">
              Créez des contrats juridiques professionnels en quelques clics
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              <Sparkles size={12} className="mr-1" />
              Simple et rapide
            </div>
          </div>
          
          {/* Notification pour la configuration du profil si nécessaire */}
          {isProfileConfigured === false && (
            <div className="max-w-lg mx-auto mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-start">
              <InfoIcon size={16} className="mr-2 flex-shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p>Pour créer des contrats personnalisés, veuillez d'abord configurer vos informations de profil.</p>
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center mt-2 text-amber-800 font-medium hover:text-amber-900"
                >
                  Configurer mon profil
                  <ArrowRight size={14} className="ml-1" />
                </Link>
              </div>
            </div>
          )}
          
          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link 
              to="/wizard" 
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-base font-medium rounded-xl shadow-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Créer un contrat
              <ArrowRight size={18} className="ml-2 animate-pulse" />
            </Link>
            
            <Link 
              to="/dashboard" 
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border border-gray-300 text-base font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 transform transition-all duration-200 hover:shadow-md"
            >
              <LayoutDashboard size={18} className="mr-2" />
              Tableau de bord
            </Link>
          </div>
        </div>
        
        {/* Caractéristiques en badges */}
        <div className="mt-12 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 w-full max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center p-5 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3 sm:mb-4">
              <Scale size={24} sm={28} className="text-blue-600" strokeWidth={1.5} />
            </div>
            <span className="font-medium text-base sm:text-lg text-gray-800 mb-1 sm:mb-2">Droits d'auteur</span>
            <span className="text-sm text-center text-gray-500">Protection de vos créations intellectuelles et artistiques</span>
          </div>
          
          <div className="flex flex-col items-center p-5 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-teal-100 flex items-center justify-center mb-3 sm:mb-4">
              <Camera size={24} sm={28} className="text-teal-600" strokeWidth={1.5} />
            </div>
            <span className="font-medium text-base sm:text-lg text-gray-800 mb-1 sm:mb-2">Droits à l'image</span>
            <span className="text-sm text-center text-gray-500">Encadrement légal de l'utilisation de votre image ou celle de vos modèles</span>
          </div>
          
          <div className="flex flex-col items-center p-5 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1 sm:col-span-2 lg:col-span-1 sm:col-start-1 sm:col-end-3 lg:col-start-auto lg:col-end-auto sm:max-w-md sm:mx-auto lg:max-w-none lg:mx-0 w-full">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-100 flex items-center justify-center mb-3 sm:mb-4">
              <ShieldCheck size={24} sm={28} className="text-purple-600" strokeWidth={1.5} />
            </div>
            <span className="font-medium text-base sm:text-lg text-gray-800 mb-1 sm:mb-2">Contrats combinés</span>
            <span className="text-sm text-center text-gray-500">Protection complète en combinant les droits d'auteur et les droits à l'image</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;