import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../services/api';
import { X, AlertCircle, User, Building2, ChevronRight, LightbulbIcon } from 'lucide-react';
import TutorialPopup from './TutorialPopup';
import { profileTutorialData } from '../../data';

const ProfileRequiredModal = ({ isOpen, onClose }) => {
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
  
  // Auto-démarrage du tutoriel si pas encore vu
  useEffect(() => {
    if (!isLoading && !hasSeenTutorial && isOpen) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
        setHasSeenTutorial(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, hasSeenTutorial, isOpen]);

  const handleDashboardRedirect = () => {
    navigate('/dashboard');
    onClose();
  };

  const handleContinue = () => {
    onClose();
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
            <div className="mb-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg mb-4 border border-blue-100">
                <div className="text-blue-500 flex-shrink-0 mt-0.5">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-700 mb-1 font-medium">
                    Informations juridiques manquantes
                  </p>
                  <p className="text-xs text-gray-600">
                    Pour générer des contrats légalement valides, nous avons besoin de vos informations de cessionnaire. Ces données apparaîtront dans le préambule de vos contrats.
                  </p>
                </div>
              </div>

              {/* Notification tutoriel */}
              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-md border border-yellow-100 mb-4 animate-pulse-slow">
                <LightbulbIcon size={16} className="text-yellow-500 flex-shrink-0" />
                <p className="text-xs text-yellow-700">
                  <span className="font-medium">Conseil :</span> Cliquez sur le bouton <span className="font-medium">Aide</span> pour découvrir pourquoi cette configuration est importante.
                </p>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Le cessionnaire est la personne ou l'entité qui reçoit les droits cédés dans le contrat. Cette information est essentielle pour la validité juridique de vos documents.
              </p>
            </div>
          ) : (
            <>
              {hasBothEntities && (
                <p className="text-sm text-gray-700 mb-3">
                  Veuillez choisir le profil à utiliser pour ce contrat :
                </p>
              )}

              <div className="space-y-2 mb-4">
                {hasPhysicalPerson && (
                  <button
                    onClick={handleContinue}
                    className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium text-gray-800">
                          {profileData.physical_person.prenom} {profileData.physical_person.nom}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}

                {hasLegalEntity && (
                  <button
                    onClick={handleContinue}
                    className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center">
                      <div className="bg-indigo-100 rounded-full p-1.5 mr-2">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium text-gray-800">
                          {profileData.legal_entity.nom}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </>
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