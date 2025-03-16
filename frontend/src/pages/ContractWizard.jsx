import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
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
  { id: 1, name: "Type d'œuvre", description: "Description du projet et type de contrat" },
  { id: 2, name: "Mode de cession", description: "Modalités de cession et droits" },
  { id: 3, name: "Informations auteur", description: "Informations sur l'auteur ou le modèle" },
  { id: 4, name: "Description œuvre", description: "Description détaillée de l'œuvre ou de l'image" },
  { id: 5, name: "Supports", description: "Supports d'exploitation et rémunération" },
  { id: 6, name: "Finalisation", description: "Validation et génération du contrat" },
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
    }
  };
  
  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
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
        return <Step1ProjectDescription 
                 contractData={contractData} 
                 updateContractData={updateContractData} 
               />;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Assistant de création de contrat</h1>
        <p className="mt-2 text-gray-600">
          Cet assistant vous guide pas à pas dans la création d'un contrat adapté à vos besoins spécifiques.
        </p>
      </div>
      
      {/* Indicateur de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progression</span>
          <span className="text-sm font-medium text-gray-700">{activeStep} sur {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Étape {activeStep}</span>
          <span className="text-xs text-gray-500">
            {STEPS.find(step => step.id === activeStep)?.name}
          </span>
        </div>
      </div>
      
      {/* Grille de contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonne de gauche: Formulaire */}
        <div className="bg-white rounded-lg shadow p-6">
          {renderStepContent()}
          
          {/* Boutons de navigation */}
          <div className="mt-8 flex justify-between">
            <button 
              onClick={handlePrevStep}
              disabled={activeStep === 1}
              className={`flex items-center px-4 py-2 rounded-md ${activeStep === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <ArrowLeft size={18} className="mr-2" />
              Précédent
            </button>
            <button 
              onClick={handleNextStep}
              className={`flex items-center px-4 py-2 rounded-md ${activeStep === totalSteps ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              {activeStep === totalSteps ? (
                <>
                  Finaliser
                  <Check size={18} className="ml-2" />
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Colonne de droite: Aperçu */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <PreviewPanel 
            contractPreview={contractPreview} 
            isLoading={isPreviewLoading} 
          />
        </div>
      </div>
    </div>
  );
};

export default ContractWizard; 