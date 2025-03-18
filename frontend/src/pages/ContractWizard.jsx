import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, ArrowLeft, FileText, Sparkles } from 'lucide-react';
import PreviewPanel from '../components/PreviewPanel';
import Step1ProjectDescription from '../components/steps/Step1ProjectDescription';
import Step2CessionMode from '../components/steps/Step2CessionMode';
import Step3AuthorInfo from '../components/steps/Step3AuthorInfo';
import Step4WorkDescription from '../components/steps/Step4WorkDescription';
import Step5Supports from '../components/steps/Step5Supports';
import Step6Finalization from '../components/steps/Step6Finalization';
import { previewContract } from '../services/api';

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
  const [contractData, setContractData] = useState({
    type_contrat: [],
    type_cession: "Gratuite",
    droits_cedes: [],
    exclusivite: false,
    auteur_type: "Personne physique",
    auteur_info: {},
    description_oeuvre: "",
    description_image: "",
    supports: [],
    remuneration: ""
  });
  
  const totalSteps = STEPS.length;
  
  // Calculer la progression
  const progress = (activeStep / totalSteps) * 100;
  
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
        const response = await previewContract(contractData);
        setContractPreview(response.preview);
      } catch (error) {
        console.error('Error fetching preview:', error);
      } finally {
        setIsPreviewLoading(false);
      }
    };
    
    fetchPreview();
  }, [contractData]);
  
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 pb-12">
      {/* En-tête avec progression */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="py-4">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center">
              <FileText className="mr-2 text-blue-600" size={20} />
              Création de contrat
            </h1>
            
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
            
            {/* Boutons de navigation */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={activeStep === 1}
                className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeStep === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                <ArrowLeft size={16} className="mr-1" />
                <span className="hidden xs:inline">Précédent</span>
              </button>
              
              <button
                type="button"
                onClick={handleNextStep}
                disabled={activeStep === totalSteps}
                className={`flex items-center px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeStep === totalSteps
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md hover:scale-105'
                }`}
              >
                <span className="hidden xs:inline">{activeStep === totalSteps ? 'Terminé' : 'Suivant'}</span>
                <span className="xs:hidden">{activeStep === totalSteps ? 'Fin' : 'Suivant'}</span>
                {activeStep !== totalSteps && <ArrowRight size={16} className="ml-1" />}
              </button>
            </div>
          </div>
          
          {/* Prévisualisation - Cachée par défaut sur mobile mais accessible via un bouton */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <PreviewPanel 
              contractPreview={contractPreview} 
              isLoading={isPreviewLoading} 
            />
          </div>
          
          {/* Bouton pour afficher la prévisualisation sur mobile */}
          <div className="lg:hidden mt-4">
            <button
              onClick={() => {
                document.getElementById('mobilePreview').classList.toggle('hidden');
              }}
              className="w-full bg-white py-3 px-4 rounded-xl shadow-sm border border-gray-100 text-center text-blue-600 font-medium flex items-center justify-center"
            >
              <FileText className="mr-2" size={18} />
              Afficher/Masquer l'aperçu
            </button>
            
            <div id="mobilePreview" className="hidden mt-4 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <PreviewPanel 
                contractPreview={contractPreview} 
                isLoading={isPreviewLoading} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractWizard; 