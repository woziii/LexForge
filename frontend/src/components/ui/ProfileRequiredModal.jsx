import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../services/api';
import { X, AlertCircle, User, Building2, ChevronRight, LightbulbIcon, Shield, Check } from 'lucide-react';
import TutorialPopup from './TutorialPopup';
import { profileTutorialData } from '../../data';

const ProfileRequiredModal = ({ isOpen, onClose, onContinue }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserProfile();
        setProfileData(data);
      } catch (error) {
        setError('Impossible de charger vos informations');
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [isOpen]);
  
  // L'auto-démarrage du tutoriel a été désactivé
  // Le tutoriel ne s'affiche plus automatiquement
  
  const handleDashboardRedirect = () => {
    navigate('/dashboard');
    onClose();
  };

  const handleContinue = () => {
    onClose();
    if (hasBothEntities || hasPhysicalPerson || hasLegalEntity) {
      // Si au moins un profil est configuré, permettre de continuer
      if (onContinue) onContinue();
    } else {
      // Sinon, rediriger vers le dashboard pour configurer un profil
      navigate('/dashboard?redirectTo=wizard');
    }
  };

  const toggleTutorial = () => {
    setShowTutorial(!showTutorial);
    setHasSeenTutorial(true);
  };

  if (!isOpen) return null;
  
  const hasPhysicalPerson = profileData?.physical_person?.is_configured;
  const hasLegalEntity = profileData?.legal_entity?.is_configured;
  const hasAnyEntity = hasPhysicalPerson || hasLegalEntity;
  const hasBothEntities = hasPhysicalPerson && hasLegalEntity;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-15 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-full max-w-sm bg-white rounded-lg shadow-md mx-4 overflow-hidden animate-fadeIn">
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base font-medium text-gray-800">
            {!hasAnyEntity ? "Configuration du profil requise" : "Sélection du profil"}
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTutorial}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 transition-colors"
              aria-label="Tutoriel d'aide"
            >
              <LightbulbIcon size={16} className="text-yellow-500" />
              <span className="text-xs font-medium">Aide</span>
            </button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm mb-4">
              {error}
            </div>
          ) : !hasAnyEntity ? (
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Configuration requise
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Veuillez configurer au moins un profil pour continuer. 
                Ces informations sont nécessaires pour personnaliser votre contrat.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Le cessionnaire est la personne ou l'entité qui reçoit les droits cédés dans le contrat. Cette information est essentielle pour la validité juridique de vos documents.
              </p>
            </div>
          ) : (
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Votre profil est configuré
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Vous pouvez continuer la création de votre contrat.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Vous pourrez choisir le profil à utiliser lors de la première étape de création de contrat.
              </p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleDashboardRedirect}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              {!hasAnyEntity ? "Configurer mon profil" : "Modifier"}
            </button>
            
            {hasAnyEntity && (
              <button
                onClick={onClose}
                className="flex-1 py-2 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Popup de tutoriel */}
      {showTutorial && (
        <TutorialPopup
          context="profile"
          onClose={() => setShowTutorial(false)}
          tutorialData={profileTutorialData}
        />
      )}
    </div>
  );
};

export default ProfileRequiredModal; 