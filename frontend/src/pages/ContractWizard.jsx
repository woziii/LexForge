import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, ArrowLeft, FileText, Sparkles, RotateCcw } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PreviewPanel from '../components/PreviewPanel';
import Step1ProjectDescription from '../components/steps/Step1ProjectDescription';
import Step2CessionMode from '../components/steps/Step2CessionMode';
import Step3AuthorInfo from '../components/steps/Step3AuthorInfo';
import Step4WorkDescription from '../components/steps/Step4WorkDescription';
import Step5Supports from '../components/steps/Step5Supports';
import Step6Finalization from '../components/steps/Step6Finalization';
import ProfileRequiredModal from '../components/ui/ProfileRequiredModal';
import { previewContract, getUserProfile } from '../services/api';

// Définition des étapes
const STEPS = [
  { id: 1, name: "Type de contrat", description: "Description du projet" },
  { id: 2, name: "Mode de cession", description: "Modalités et droits" },
  { id: 3, name: "Informations", description: "Auteur ou modèle" },
  { id: 4, name: "Description", description: "Détails de l'œuvre" },
  { id: 5, name: "Supports", description: "Exploitation et rémunération" },
  { id: 6, name: "Finalisation", description: "Génération du contrat" },
];

const ContractWizard = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [contractPreview, setContractPreview] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [businessInfoRequired, setBusinessInfoRequired] = useState(false);
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const initialContractData = {
    type_contrat: [],
    type_cession: "Gratuite",
    droits_cedes: [],
    exclusivite: false,
    auteur_type: "Personne physique",
    auteur_info: {},
    description_oeuvre: "",
    description_image: "",
    supports: [],
    remuneration: "",
    entreprise_info: {}
  };
  
  const [contractData, setContractData] = useState(initialContractData);
  
  const totalSteps = STEPS.length;
  
  // Vérifier si l'utilisateur est authentifié et a un profil configuré
  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        setIsCheckingProfile(true);
        
        // Vérifier si l'utilisateur vient du Dashboard après avoir rempli ses informations
        const fromDashboard = new URLSearchParams(location.search).get('fromDashboard') === 'true';
        
        // Si l'utilisateur ne vient pas du Dashboard, le rediriger pour remplir ses informations
        if (!fromDashboard) {
          setBusinessInfoRequired(true);
          navigate('/dashboard?redirectTo=wizard', { replace: true });
          return;
        }
        
        // Pour les utilisateurs authentifiés uniquement, récupérer leurs informations de profil
        if (authLoaded && isSignedIn) {
          // Pour utilisateur authentifié
          const profile = await getUserProfile();
          
          const hasPhysicalPerson = profile?.physical_person?.is_configured;
          const hasLegalEntity = profile?.legal_entity?.is_configured;
          
          if (!hasPhysicalPerson && !hasLegalEntity) {
            setShowProfileModal(true);
          } else {
            // Préremplir les informations d'entreprise depuis le profil de l'utilisateur
            if (hasLegalEntity && profile.legal_entity) {
              setContractData(prevData => ({
                ...prevData,
                entreprise_info: {
                  nom: profile.legal_entity.nom || '',
                  forme_juridique: profile.legal_entity.forme_juridique || '',
                  siren: profile.legal_entity.siren || '',
                  adresse: profile.legal_entity.adresse || '',
                  code_postal: profile.legal_entity.code_postal || '',
                  ville: profile.legal_entity.ville || '',
                  email: profile.legal_entity.email || '',
                  telephone: profile.legal_entity.telephone || ''
                }
              }));
            } else if (hasPhysicalPerson && profile.physical_person) {
              setContractData(prevData => ({
                ...prevData,
                entreprise_info: {
                  nom: `${profile.physical_person.prenom || ''} ${profile.physical_person.nom || ''}`,
                  forme_juridique: 'Entreprise individuelle',
                  adresse: profile.physical_person.adresse || '',
                  code_postal: profile.physical_person.code_postal || '',
                  ville: profile.physical_person.ville || '',
                  email: profile.physical_person.email || '',
                  telephone: profile.physical_person.telephone || ''
                }
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        if (authLoaded && isSignedIn) {
          setShowProfileModal(true);
        }
      } finally {
        setIsCheckingProfile(false);
      }
    };
    
    checkUserProfile();
  }, [authLoaded, isSignedIn, navigate, location.search]);
  
  // Calculer la progression
  const progress = ((activeStep - 1) / (totalSteps - 1)) * 100;
  
  // Navigation
  const handleNextStep = () => {
    if (activeStep < totalSteps) {
      setActiveStep(activeStep + 1);
      // Scroll to top when changing steps
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      // Scroll to top when changing steps
      window.scrollTo(0, 0);
    }
  };
  
  // Mise à jour des données du contrat
  const updateContractData = (newData) => {
    setContractData(prevData => ({
      ...prevData,
      ...newData
    }));
  };
  
  // Prévisualisation du contrat
  useEffect(() => {
    const fetchPreview = async () => {
      // Ne pas prévisualiser si les données essentielles ne sont pas remplies
      if (contractData.type_contrat.length === 0) {
        return;
      }

      try {
        setIsPreviewLoading(true);
        
        // S'assurer que entreprise_info est correctement formaté pour la prévisualisation
        const entrepriseInfo = contractData.entreprise_info;
        if (entrepriseInfo && Object.keys(entrepriseInfo).length > 0) {
          // Vérifier que tous les champs essentiels existent
          const previewData = {...contractData};
          
          // Pour une personne physique (identifiée par la présence de prenom)
          if (entrepriseInfo.prenom && entrepriseInfo.nom) {
            previewData.entreprise_info = {
              ...entrepriseInfo,
              adresse: entrepriseInfo.adresse || formatAddress(entrepriseInfo),
              siege: entrepriseInfo.siege || formatAddress(entrepriseInfo),
              type: 'physical_person',
              capital: entrepriseInfo.capital || '',
              forme_juridique: entrepriseInfo.forme_juridique || 'Entreprise individuelle'
            };
          } 
          // Pour une personne morale
          else if (entrepriseInfo.nom && entrepriseInfo.forme_juridique) {
            previewData.entreprise_info = {
              ...entrepriseInfo,
              siege: entrepriseInfo.siege || formatAddress(entrepriseInfo),
              type: 'legal_entity',
              capital: entrepriseInfo.capital || '1000 €'
            };
          }
          
          console.log("Données envoyées pour prévisualisation:", JSON.stringify(previewData));
          const response = await previewContract(previewData);
          setContractPreview(response.preview);
        } else {
          console.log("Données envoyées pour prévisualisation:", JSON.stringify(contractData));
          const response = await previewContract(contractData);
          setContractPreview(response.preview);
        }
      } catch (error) {
        console.error('Error fetching preview:', error);
      } finally {
        setIsPreviewLoading(false);
      }
    };
    
    fetchPreview();
  }, [contractData]);
  
  // Fonction utilitaire pour formater l'adresse
  const formatAddress = (data) => {
    const parts = [];
    
    if (data.adresse) {
      parts.push(data.adresse);
    }
    
    let cityPart = '';
    if (data.code_postal) cityPart += data.code_postal;
    if (data.ville) {
      if (cityPart) cityPart += ' ';
      cityPart += data.ville;
    }
    
    if (cityPart) parts.push(cityPart);
    
    return parts.length > 0 ? parts.join(', ') : '';
  };
  
  // Fonction pour réinitialiser les données du contrat
  const resetContractData = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser toutes les informations du contrat ?")) {
      setContractData(initialContractData);
      setActiveStep(1);
      window.scrollTo(0, 0);
    }
  };
  
  // Sélectionner le composant à afficher en fonction de l'étape active
  const renderStepContent = () => {
    switch(activeStep) {
      case 1:
        return <Step1ProjectDescription 
                 contractData={contractData} 
                 updateContractData={updateContractData} 
               />;
      case 2:
        return <Step2CessionMode 
                 contractData={contractData} 
                 updateContractData={updateContractData} 
               />;
      case 3:
        return <Step3AuthorInfo 
                 contractData={contractData} 
                 updateContractData={updateContractData} 
               />;
      case 4:
        return <Step4WorkDescription 
                 contractData={contractData} 
                 updateContractData={updateContractData} 
               />;
      case 5:
        return <Step5Supports 
                 contractData={contractData} 
                 updateContractData={updateContractData} 
               />;
      case 6:
        return <Step6Finalization 
                 contractData={contractData} 
                 updateContractData={updateContractData} 
               />;
      default:
        return null;
    }
  };
  
  // Afficher un indicateur de chargement pendant la vérification du profil
  if (isCheckingProfile || businessInfoRequired) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 pb-12">
      {/* Modal pour la configuration du profil */}
      <ProfileRequiredModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
      
      {/* En-tête avec progression */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center">
                <FileText className="mr-2 text-blue-600" size={20} />
                Création de contrat
              </h1>
              
              <button
                onClick={resetContractData}
                className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <RotateCcw size={16} className="mr-1" />
                Réinitialiser
              </button>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-4 relative">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              {/* Étapes - Optimisé pour mobile */}
              <div className="flex justify-between mt-2">
                {STEPS.map((step) => (
                  <div 
                    key={step.id} 
                    className={`flex flex-col items-center relative ${
                      step.id < activeStep ? 'text-blue-600' : 
                      step.id === activeStep ? 'text-gray-900' : 'text-gray-400'
                    }`}
                    style={{ width: `${100/totalSteps}%` }}
                  >
                    <div 
                      className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                        step.id < activeStep ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm' : 
                        step.id === activeStep ? 'border-2 border-blue-600 text-blue-600 scale-110' : 
                        'border border-gray-300 bg-white'
                      }`}
                    >
                      {step.id < activeStep ? <Check size={14} /> : step.id}
                    </div>
                    <span className="hidden sm:block text-xs mt-1 font-medium">{step.name}</span>
                    {step.id === activeStep && (
                      <span className="block sm:hidden text-xs mt-1 font-medium">{step.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-6 flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Sparkles size={16} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {STEPS[activeStep-1].name}
                </h2>
                <p className="text-sm text-gray-500">
                  {STEPS[activeStep-1].description}
                </p>
              </div>
            </div>
            
            <div className="mb-8">
              {renderStepContent()}
            </div>
            
            {/* Boutons de navigation - Ne pas afficher pour l'étape 6 */}
            {activeStep !== 6 && (
              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={handlePrevStep}
                  className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 flex items-center ${
                    activeStep > 1 ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'
                  }`}
                  disabled={activeStep <= 1}
                >
                  <ArrowLeft size={16} className="mr-1" />
                  <span>Précédent</span>
                </button>
                
                <button
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                >
                  <span>Suivant</span>
                  <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            )}
          </div>
          
          {/* Prévisualisation */}
          <div className="lg:block">
            <PreviewPanel 
              preview={contractPreview}
              isLoading={isPreviewLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractWizard; 