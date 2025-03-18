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
      {/* Section principale avec titre et cartes */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 relative">
        <div className="w-full max-w-6xl mx-auto px-4 flex flex-col items-center">
          
          {/* Logo animé au-dessus du titre */}
          <div className="mb-6 sm:mb-8 inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transform transition-all duration-500 hover:rotate-6 hover:scale-110">
            <FileSignature className="h-8 w-8 sm:h-10 sm:w-10 text-white" strokeWidth={1.5} />
          </div>
          
          {/* Titre principal avec effet de dégradé */}
          <h1 className="text-7xl sm:text-9xl font-black mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 tracking-tight py-4 leading-tight drop-shadow-xl animate-gradient-slow bg-gradient-size text-center">
            LexForge
          </h1>
          
          {/* Badges de fonctionnalités autour du bouton */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 max-w-4xl mx-auto">
            <div className="group relative flex items-center bg-white/80 backdrop-blur-sm px-4 py-3 rounded-full shadow-md border border-blue-100 transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-white/90 hover:border-blue-200 cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-3 shadow-sm">
                <Scale size={16} sm={20} className="text-white" strokeWidth={1.5} />
              </div>
              <span className="font-medium text-blue-800">Droits d'auteur</span>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-3 border border-blue-100 w-48 sm:w-56 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-2">
                      <Scale size={12} className="text-white" strokeWidth={1.5} />
                    </div>
                    <span className="font-bold text-blue-800">Droits d'auteur</span>
                  </div>
                  <p className="text-xs text-blue-700">Protection de vos créations intellectuelles et artistiques. Idéal pour les œuvres, textes et designs.</p>
                </div>
              </div>
            </div>
            
            <div className="group relative flex items-center bg-white/80 backdrop-blur-sm px-4 py-3 rounded-full shadow-md border border-blue-100 transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-white/90 hover:border-blue-200 cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mr-3 shadow-sm">
                <Camera size={16} sm={20} className="text-white" strokeWidth={1.5} />
              </div>
              <span className="font-medium text-blue-800">Droits à l'image</span>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-3 border border-blue-100 w-48 sm:w-56 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mr-2">
                      <Camera size={12} className="text-white" strokeWidth={1.5} />
                    </div>
                    <span className="font-bold text-blue-800">Droits à l'image</span>
                  </div>
                  <p className="text-xs text-blue-700">Encadrement légal de l'utilisation de votre image ou celle de vos modèles pour photos et vidéos.</p>
                </div>
              </div>
            </div>
            
            <div className="group relative flex items-center bg-white/80 backdrop-blur-sm px-4 py-3 rounded-full shadow-md border border-blue-100 transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-white/90 hover:border-blue-200 cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center mr-3 shadow-sm">
                <ShieldCheck size={16} sm={20} className="text-white" strokeWidth={1.5} />
              </div>
              <span className="font-medium text-blue-800">Contrats combinés</span>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-3 border border-blue-100 w-48 sm:w-56 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center mr-2">
                      <ShieldCheck size={12} className="text-white" strokeWidth={1.5} />
                    </div>
                    <span className="font-bold text-blue-800">Contrats combinés</span>
                  </div>
                  <p className="text-xs text-blue-700">Protection complète en combinant les droits d'auteur et les droits à l'image pour une sécurité maximale.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Badge et bouton */}
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-sm mb-6">
              <Sparkles size={14} className="mr-2" />
              Simple et rapide
            </div>
            
            {/* Bouton d'action principal avec animation */}
            <Link 
              to="/wizard" 
              className="inline-flex items-center px-8 sm:px-10 py-4 sm:py-5 border border-transparent text-lg font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Créer un contrat
              <ArrowRight size={22} className="ml-3 animate-pulse" />
            </Link>
            
            {/* Description en-dessous du bouton */}
            <p className="text-sm sm:text-base text-blue-700 mt-6 font-medium text-center max-w-2xl">
              Créez des contrats juridiques professionnels en quelques clics
            </p>
          </div>
        </div>
        
        {/* Arrière-plan de cercles flottants pour les écrans moyens et grands */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
          <div className="absolute top-1/4 -left-10 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-cyan-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 -right-16 w-72 h-72 bg-gradient-to-br from-indigo-100/30 to-blue-100/30 rounded-full blur-3xl"></div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;