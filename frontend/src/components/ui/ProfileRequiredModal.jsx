import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../services/api';
import { X, AlertCircle, User, Building2, ChevronRight } from 'lucide-react';

const ProfileRequiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserProfile();
        setProfileData(data);
      } catch (error) {
        setError('Impossible de charger vos informations de profil');
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [isOpen]);

  const handleDashboardRedirect = () => {
    navigate('/dashboard');
    onClose();
  };

  const handleContinue = () => {
    onClose();
  };

  if (!isOpen) return null;
  
  const hasPhysicalPerson = profileData?.physical_person?.is_configured;
  const hasLegalEntity = profileData?.legal_entity?.is_configured;
  const hasAnyEntity = hasPhysicalPerson || hasLegalEntity;
  const hasBothEntities = hasPhysicalPerson && hasLegalEntity;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl mx-4">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">Configuration requise</h2>
          <p className="text-sm text-gray-600 mt-1">
            Pour générer un contrat, nous avons besoin de certaines informations sur vous.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md border border-red-200 flex items-start mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        ) : !hasAnyEntity ? (
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
            <p className="text-sm text-yellow-800">
              Vous devez d'abord configurer vos informations dans votre tableau de bord avant de créer un contrat.
            </p>
          </div>
        ) : (
          <>
            {hasBothEntities && (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
                <p className="text-sm text-blue-800">
                  Vous avez configuré plusieurs types d'entités. Veuillez choisir celle que vous souhaitez utiliser pour ce contrat.
                </p>
              </div>
            )}

            <div className="space-y-3 mb-4">
              {hasPhysicalPerson && (
                <button
                  onClick={handleContinue}
                  className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="ml-3 text-left">
                      <span className="text-sm font-medium text-gray-800">
                        {profileData.physical_person.prenom} {profileData.physical_person.nom}
                      </span>
                      <span className="block text-xs text-gray-500">
                        Personne physique
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              )}

              {hasLegalEntity && (
                <button
                  onClick={handleContinue}
                  className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="bg-indigo-100 rounded-full p-2">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="ml-3 text-left">
                      <span className="text-sm font-medium text-gray-800">
                        {profileData.legal_entity.nom}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {profileData.legal_entity.forme_juridique}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </>
        )}

        <div className="mt-6 flex flex-col">
          <button
            onClick={handleDashboardRedirect}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            {!hasAnyEntity ? "Configurer mon profil" : "Modifier mes informations"}
          </button>
          
          {hasAnyEntity && (
            <button
              onClick={onClose}
              className="w-full mt-2 py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileRequiredModal; 