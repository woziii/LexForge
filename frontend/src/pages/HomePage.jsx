import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  AlertCircle,
  Info,
  UserCheck,
  ExternalLink
} from 'lucide-react';
import { getUserProfile } from '../services/api';
import ProfileRequiredModal from '../components/ui/ProfileRequiredModal';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import SEO from '../components/SEO';

const HomePage = () => {
  const [isProfileConfigured, setIsProfileConfigured] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  
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

  const redirectToSignIn = () => {
    // Rediriger vers la page de connexion de Clerk
    window.location.href = "/sign-in";
  };
  
  return (
    <>
      <SEO 
        title="Accueil" 
        description="Créez vos contrats juridiques en ligne, gratuitement de manière sécurisée avec LexForge : simples, rapides, conformes au droit français et sans IA générative. LexForge est un outil français de génération de contrats juridiques, conçu pour les créateurs, développeurs et entrepreneurs."
        keywords="contrat juridique en ligne, générateur CGU, droit à l'image, contrat juridique, droit français, cession de droits, NDA, maintenance logiciel, SaaS, contrat de partenariat, Data Processing Agreement"
        canonical="https://www.lexforge.fr"
      />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-indigo-50">
        {/* Modal pour la configuration du profil */}
        <ProfileRequiredModal 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)} 
        />
        
        {/* Section principale avec titre central dominant */}
        <main className="flex-grow flex flex-col items-center justify-center px-3 py-6 sm:py-16">
          <div className="w-full max-w-6xl mx-auto text-center px-3">
            
            {/* Titre principal dominant avec effet de dégradé */}
            <div className="mb-4 sm:mb-14">
              {/* Logo animé au-dessus du titre */}
              <div className="mb-1.5 sm:mb-8 inline-flex items-center justify-center w-14 h-14 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transform transition-all duration-500 hover:rotate-6 hover:scale-110">
                <FileSignature className="h-7 w-7 sm:h-12 sm:w-12 text-white" strokeWidth={1.5} />
              </div>
              
              <h1 className="text-6xl sm:text-9xl font-black mb-2 sm:mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 tracking-tight py-1 sm:py-4 px-2 leading-tight drop-shadow-xl animate-gradient-slow bg-gradient-size">
                LexForge
              </h1>
            </div>
            
            {/* Description avec badge */}
            <div className="relative mb-3 sm:mb-6">
              <p className="text-lg sm:text-xl text-gray-700 mb-2.5 sm:mb-3 px-1">
                Créez des contrats juridiques professionnels en quelques clics
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-2 mb-2 sm:mb-4">
                <div className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 shadow-sm">
                  <Sparkles size={10} className="mr-1 sm:mr-1.5" />
                  Simple et rapide
                </div>
                <div className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
                  <Check size={10} className="mr-1 sm:mr-1.5" />
                  Entièrement gratuit
                </div>
                <div className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 shadow-sm">
                  <ShieldCheck size={10} className="mr-1 sm:mr-1.5" />
                  Sans IA générative
                </div>
              </div>
            </div>
            
            {/* Mobile: Interface compacte pour téléphone */}
            <div className="sm:hidden flex flex-col items-center gap-2.5 max-w-sm mx-auto">
              {/* Bouton principal pour créer un contrat */}
              <Link 
                to="/wizard" 
                className="w-full inline-flex items-center justify-center px-5 py-3.5 border border-transparent text-base font-medium rounded-xl shadow-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <span className="mr-2">Créer un contrat</span>
                <ArrowRight size={16} />
              </Link>
              
              {/* Boutons secondaires groupés horizontalement pour économiser l'espace */}
              <div className="flex w-full gap-2.5">
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-md hover:bg-amber-100 transition shadow-sm"
                >
                  <AlertCircle size={12} className="text-amber-500" />
                  Info importante
                </button>
                
                {isLoaded && !isSignedIn && (
                  <SignInButton mode="modal">
                    <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition rounded-md shadow-sm">
                      <UserCheck size={12} className="text-white" />
                      Se connecter
                    </button>
                  </SignInButton>
                )}
              </div>
              
              {/* Notification pour la configuration du profil si nécessaire (mobile) */}
              {isProfileConfigured === false && (
                <div className="w-full flex items-center justify-between py-2 px-3.5 rounded-lg bg-blue-50/70 border border-blue-100 mt-2">
                  <p className="text-xs text-gray-700">
                    <span className="text-blue-600 font-medium">Conseil :</span> Configurez votre profil
                  </p>
                  <button 
                    onClick={() => setShowProfileModal(true)} 
                    className="inline-flex items-center justify-center text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition rounded-full px-3 py-1"
                  >
                    Configurer
                    <ArrowRight size={10} className="ml-1.5" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Desktop: Structure originale */}
            <div className="hidden sm:flex sm:flex-col items-center gap-3 sm:gap-4 mb-6 max-w-md mx-auto">
              {/* Bouton principal pour créer un contrat */}
              <Link 
                to="/wizard" 
                className="w-full group relative inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 border border-transparent text-base font-medium rounded-xl shadow-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden animate-pulse-slow"
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
              
              {/* Bouton Informations importantes */}
              <button
                onClick={() => setShowInfoModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-full hover:bg-amber-100 transition shadow-sm"
              >
                <AlertCircle size={14} className="text-amber-500" />
                Informations importantes
              </button>
              
              {/* Conseil de SAUL - visible uniquement pour les utilisateurs non authentifiés */}
              {isLoaded && !isSignedIn && (
                <div className="w-full rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition duration-300 shadow-sm mt-1 overflow-hidden">
                  <div className="flex items-center gap-3 py-2.5 px-4">
                    <div className="flex-shrink-0 w-11 h-14 rounded-lg overflow-hidden shadow-md border-2 border-indigo-300 relative glow-indigo-subtle">
                      <img 
                        src={require('../assets/images/saul/saul_sourire.jpg')}
                        alt="Saul" 
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234F46E5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3C/svg%3E";
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-indigo-600/30 to-transparent"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-indigo-800 mb-0.5">Conseil de SAUL</h3>
                      <p className="text-xs text-gray-700">
                        Connectez-vous pour sauvegarder automatiquement vos contrats et simplifier votre parcours
                      </p>
                    </div>
                    <SignInButton mode="modal">
                      <button className="whitespace-nowrap px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium shadow-sm transition-colors flex items-center">
                        <span>Se connecter</span>
                        <ArrowRight size={14} className="ml-1" />
                      </button>
                    </SignInButton>
                  </div>
                </div>
              )}
              
              {/* Notification pour la configuration du profil si nécessaire (desktop) */}
              {isProfileConfigured === false && (
                <div className="w-full flex items-center justify-between py-2 px-4 rounded-lg bg-blue-50/70 border border-blue-100 mt-1">
                  <p className="text-sm text-gray-700">
                    <span className="text-blue-600 font-medium">Conseil :</span> Configurez votre profil
                  </p>
                  <button 
                    onClick={() => setShowProfileModal(true)} 
                    className="inline-flex items-center justify-center text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition rounded-full px-3 py-1"
                  >
                    Configurer
                    <ArrowRight size={12} className="ml-1.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Ajouter une règle CSS globale pour l'effet de lueur */}
          <style jsx global>{`
            .glow-indigo-subtle {
              box-shadow: 0 0 10px 2px rgba(79, 70, 229, 0.15);
            }
          `}</style>
          
          {/* Caractéristiques en badges - Layout amélioré */}
          <div className="mt-10 sm:mt-14 w-full max-w-6xl mx-auto px-4">
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
        
        {/* Modal d'informations importantes */}
        {showInfoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-7 relative animate-fadeIn border border-gray-100">
              <button 
                onClick={() => setShowInfoModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition bg-gray-100 p-1.5 rounded-full"
              >
                <X size={18} />
              </button>
              
              <div className="flex items-center mb-4">
                <AlertCircle size={24} className="text-amber-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Informations importantes</h3>
              </div>
              
              <p className="text-gray-700 mb-6">
                LexForge est en constante évolution. Bien que nos serveurs soient désormais opérationnels en permanence pour une meilleure expérience utilisateur, nous tenons à souligner que notre plateforme est toujours en phase bêta. En tant qu'utilisateur, vous devez être conscient que la sécurité de vos données n'est pas encore garantie à 100%. Nous vous recommandons donc de faire preuve de prudence et d'éviter de partager des informations personnelles ou confidentielles jusqu'à la sortie de notre version stable.
              </p>
              
              <button 
                onClick={() => setShowInfoModal(false)}
                className="w-full flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition"
              >
                J'ai compris
              </button>
            </div>
          </div>
        )}
        
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
    </>
  );
};

export default HomePage;