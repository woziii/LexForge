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
  Send,
  AlertCircle
} from 'lucide-react';
import { getUserProfile } from '../services/api';
import ProfileRequiredModal from '../components/ui/ProfileRequiredModal';

const HomePage = () => {
  const [isProfileConfigured, setIsProfileConfigured] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  
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
      {/* Modal pour la configuration du profil */}
      <ProfileRequiredModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
      
      {/* Section principale avec titre central dominant */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-16 sm:py-28">
        <div className="w-full max-w-6xl mx-auto text-center px-4">
          
          {/* Titre principal dominant avec effet de dégradé */}
          <div className="mb-14 sm:mb-16">
            {/* Logo animé au-dessus du titre */}
            <div className="mb-8 sm:mb-10 inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transform transition-all duration-500 hover:rotate-6 hover:scale-110">
              <FileSignature className="h-8 w-8 sm:h-12 sm:w-12 text-white" strokeWidth={1.5} />
            </div>
            
            <h1 className="text-6xl sm:text-9xl font-black mb-8 sm:mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 tracking-tight py-6 px-2 leading-tight drop-shadow-xl animate-gradient-slow bg-gradient-size">
              LexForge
            </h1>
          </div>
          
          {/* Description avec badge */}
          <div className="relative mb-6 sm:mb-8">
            <p className="text-lg sm:text-xl text-gray-700 mb-3 sm:mb-4 px-1">
              Créez des contrats juridiques professionnels en quelques clics
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-5">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 shadow-sm">
                <Sparkles size={12} className="mr-1.5" />
                Simple et rapide
              </div>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
                <Check size={12} className="mr-1.5" />
                Entièrement gratuit
              </div>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 shadow-sm">
                <ShieldCheck size={12} className="mr-1.5" />
                Sans IA générative
              </div>
            </div>
          </div>
          
          {/* Notification technique concernant le délai d'activation du serveur */}
          <div className="max-w-md mx-auto mb-8 flex items-center rounded-xl pl-4 pr-4 py-3.5 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 shadow-sm">
            <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mr-3" />
            <p className="text-xs text-amber-700">
              <span className="font-medium">Information importante :</span> LexForge est actuellement en version bêta. Bien que nous prenions la sécurité au sérieux, nous ne pouvons garantir une protection complète de vos données à ce stade. Nous vous recommandons de ne pas stocker d'informations hautement confidentielles sur la plateforme.
            </p>
          </div>
          
          {/* Notification pour la configuration du profil si nécessaire */}
          {isProfileConfigured === false && (
            <div className="max-w-sm mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between rounded-xl p-3.5 sm:pl-4 sm:pr-3 sm:py-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm">
              <p className="text-xs text-gray-700 mb-3 sm:mb-0">
                <span className="text-blue-600 font-medium">Conseil :</span> Configurez votre profil pour personnaliser vos contrats
              </p>
              <button 
                onClick={() => setShowProfileModal(true)} 
                className="w-full sm:w-auto inline-flex items-center justify-center text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition rounded-md sm:rounded-full px-4 py-2"
              >
                Configurer
                <ArrowRight size={12} className="ml-1.5" />
              </button>
            </div>
          )}
          
          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
            <Link 
              to="/wizard" 
              className="group relative inline-flex items-center px-6 sm:px-8 py-3.5 sm:py-4 border border-transparent text-base font-medium rounded-xl shadow-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden animate-pulse-slow"
            >
              <span className="relative z-10 flex items-center">
                <span className="mr-2">Créer un contrat</span>
                <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-shimmer"></div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),rgba(255,255,255,0))] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
        
        {/* Caractéristiques en badges - Layout amélioré */}
        <div className="mt-14 sm:mt-20 w-full max-w-6xl mx-auto px-4">
          {/* Contrats principaux - première rangée */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 mb-8">
            <div className="flex flex-col items-center p-6 sm:p-7 bg-white rounded-xl shadow border border-gray-100 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1 backdrop-blur-sm bg-white/90">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-4 sm:mb-5 shadow-sm">
                <Scale size={26} className="text-blue-600" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-base sm:text-lg text-gray-800 mb-2 sm:mb-3">Droits d'auteur</span>
              <span className="text-sm text-center text-gray-600">Protection de vos créations intellectuelles et artistiques</span>
            </div>
            
            <div className="flex flex-col items-center p-6 sm:p-7 bg-white rounded-xl shadow border border-gray-100 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1 backdrop-blur-sm bg-white/90">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-4 sm:mb-5 shadow-sm">
                <Camera size={26} className="text-teal-600" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-base sm:text-lg text-gray-800 mb-2 sm:mb-3">Droits à l'image</span>
              <span className="text-sm text-center text-gray-600">Encadrement légal de l'utilisation de votre image ou celle de vos modèles</span>
            </div>
            
            <div className="flex flex-col items-center p-6 sm:p-7 bg-white rounded-xl shadow border border-gray-100 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1 backdrop-blur-sm bg-white/90">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-4 sm:mb-5 shadow-sm">
                <ShieldCheck size={26} className="text-purple-600" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-base sm:text-lg text-gray-800 mb-2 sm:mb-3">Contrats combinés</span>
              <span className="text-sm text-center text-gray-600">Protection complète en combinant les droits d'auteur et les droits à l'image</span>
            </div>
          </div>
          
          {/* Éléments additionnels - deuxième rangée */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 sm:w-4/5 mx-auto">
            {/* Badge de Teasing pour nouveaux contrats */}
            <div className="flex flex-col items-center p-6 sm:p-7 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow border border-amber-200 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 bg-amber-400 text-xs text-white px-3 py-1 rounded-bl-md font-medium">
                Bientôt
              </div>
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mb-4 sm:mb-5 shadow-sm">
                <Star size={26} className="text-amber-500" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-base sm:text-lg text-gray-800 mb-2 sm:mb-3">Nouveaux contrats à venir</span>
              <span className="text-sm text-center text-gray-700">NDA, Cession de PI, Maintenance logiciel, SaaS, et bien plus !</span>
            </div>
            
            {/* Badge pour le feedback */}
            <div onClick={() => setShowFeedbackModal(true)} className="flex flex-col items-center p-6 sm:p-7 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl shadow border border-blue-200 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer backdrop-blur-sm">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-4 sm:mb-5 shadow-sm">
                <MessageSquare size={26} className="text-blue-600" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-base sm:text-lg text-gray-800 mb-2 sm:mb-3">Votre avis compte</span>
              <span className="text-sm text-center text-gray-700">Cliquez ici pour nous dire ce que vous pensez ou suggérer des améliorations</span>
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal de feedback - Amélioration esthétique */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-7 relative animate-fadeIn border border-gray-100">
            <button 
              onClick={() => setShowFeedbackModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition bg-gray-100 p-1.5 rounded-full"
            >
              <X size={18} />
            </button>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Votre feedback</h3>
            <p className="text-gray-600 mb-6">Partagez vos suggestions ou commentaires pour nous aider à améliorer LexForge</p>
            
            <form onSubmit={handleFeedbackSubmit}>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Partagez vos idées, suggestions ou besoins..."
                className="w-full h-32 px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 resize-none mb-5"
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