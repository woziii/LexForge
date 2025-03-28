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
  InfoIcon,
  Check,
  Star,
  MessageSquare,
  X,
  Send
} from 'lucide-react';
import { getUserProfile } from '../services/api';

const HomePage = () => {
  const [isProfileConfigured, setIsProfileConfigured] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
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

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    // Pour l'instant, on affiche juste un message de confirmation
    alert("Merci pour votre retour !");
    setFeedbackText('');
    setShowFeedbackModal(false);
    // Plus tard, nous implémenterons la partie pour envoyer ce feedback
  };
  
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
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                <Sparkles size={12} className="mr-1" />
                Simple et rapide
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Check size={12} className="mr-1" />
                Entièrement gratuit
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                <ShieldCheck size={12} className="mr-1" />
                Sans IA générative
              </div>
            </div>
          </div>
          
          {/* Notification pour la configuration du profil si nécessaire */}
          {isProfileConfigured === false && (
            <div className="max-w-sm mx-auto mb-8 flex items-center justify-between rounded-full pl-4 pr-2 py-1.5 bg-white/70 border border-blue-100 shadow-sm">
              <p className="text-xs text-gray-600">
                <span className="text-blue-600 font-medium">Conseil :</span> Configurez votre profil pour personnaliser vos contrats
              </p>
              <Link 
                to="/dashboard" 
                className="ml-2 inline-flex items-center text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition rounded-full px-3 py-1"
              >
                Configurer
                <ArrowRight size={10} className="ml-1" />
              </Link>
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
          </div>
        </div>
        
        {/* Caractéristiques en badges - Layout amélioré */}
        <div className="mt-12 sm:mt-20 w-full max-w-6xl mx-auto px-4">
          {/* Contrats principaux - première rangée */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
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
            
            <div className="flex flex-col items-center p-5 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-100 flex items-center justify-center mb-3 sm:mb-4">
                <ShieldCheck size={24} sm={28} className="text-purple-600" strokeWidth={1.5} />
              </div>
              <span className="font-medium text-base sm:text-lg text-gray-800 mb-1 sm:mb-2">Contrats combinés</span>
              <span className="text-sm text-center text-gray-500">Protection complète en combinant les droits d'auteur et les droits à l'image</span>
            </div>
          </div>
          
          {/* Éléments additionnels - deuxième rangée */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 sm:w-4/5 mx-auto">
            {/* Badge de Teasing pour nouveaux contrats */}
            <div className="flex flex-col items-center p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl shadow-sm border border-amber-200 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-400 text-xs text-white px-2 py-0.5 rounded-bl-md font-medium">
                Bientôt
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center mb-3 sm:mb-4">
                <Star size={24} sm={28} className="text-amber-500" strokeWidth={1.5} />
              </div>
              <span className="font-medium text-base sm:text-lg text-gray-800 mb-1 sm:mb-2">Nouveaux contrats à venir</span>
              <span className="text-sm text-center text-gray-600">NDA, Cession de PI, Maintenance logiciel, SaaS, et bien plus !</span>
            </div>
            
            {/* Badge pour le feedback */}
            <div onClick={() => setShowFeedbackModal(true)} className="flex flex-col items-center p-5 sm:p-6 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3 sm:mb-4">
                <MessageSquare size={24} sm={28} className="text-blue-600" strokeWidth={1.5} />
              </div>
              <span className="font-medium text-base sm:text-lg text-gray-800 mb-1 sm:mb-2">Votre avis compte</span>
              <span className="text-sm text-center text-gray-600">Cliquez ici pour nous dire ce que vous pensez ou suggérer des améliorations</span>
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal de feedback */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-fadeIn">
            <button 
              onClick={() => setShowFeedbackModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Votre feedback</h3>
            <p className="text-gray-600 mb-6">Partagez vos suggestions ou commentaires pour nous aider à améliorer LexForge</p>
            
            <form onSubmit={handleFeedbackSubmit}>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Partagez vos idées, suggestions ou besoins..."
                className="w-full h-32 px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 resize-none mb-4"
                required
              />
              
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition"
              >
                <Send size={16} />
                Envoyer mon feedback
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;