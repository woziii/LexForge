import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Check, Edit } from 'lucide-react';
import { generatePdf, saveContract } from '../../services/api';

const Step6Finalization = ({ contractData }) => {
  const [filename, setFilename] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [error, setError] = useState('');
  const [savedContractId, setSavedContractId] = useState(null);
  
  const navigate = useNavigate();
  
  const handleFilenameChange = (e) => {
    setFilename(e.target.value);
  };
  
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  
  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setError('');
    setGenerationSuccess(false);
    
    try {
      await generatePdf(contractData, filename || 'contrat');
      setGenerationSuccess(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleAccessEditor = async () => {
    setIsSaving(true);
    setError('');
    
    try {
      // Sauvegarder le contrat avant d'accéder à l'éditeur si ce n'est pas déjà fait
      if (!savedContractId) {
        const result = await saveContract(contractData, title || 'Contrat sans titre');
        setSavedContractId(result.id);
        navigate(`/editor/${result.id}`);
      } else {
        navigate(`/editor/${savedContractId}`);
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      setError('Une erreur est survenue lors de la sauvegarde du contrat. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Vérifier si les données essentielles sont remplies
  const isAuthorInfoComplete = () => {
    const { auteur_info } = contractData;
    
    if (contractData.auteur_type === "Personne physique") {
      return auteur_info.gentille && auteur_info.nom && auteur_info.prenom;
    } else {
      return auteur_info.nom && auteur_info.forme_juridique;
    }
  };
  
  const isWorkDescriptionComplete = () => {
    const needsAuthorRights = contractData.type_contrat.includes("Auteur (droits d'auteur)");
    const needsImageRights = contractData.type_contrat.includes("Image (droit à l'image)");
    
    if (needsAuthorRights && !contractData.description_oeuvre) {
      return false;
    }
    
    if (needsImageRights && !contractData.description_image) {
      return false;
    }
    
    return true;
  };
  
  const isRemunerationComplete = () => {
    return contractData.type_cession !== "Onéreuse" || contractData.remuneration;
  };
  
  const isFormComplete = 
    contractData.type_contrat.length > 0 && 
    isAuthorInfoComplete() && 
    isWorkDescriptionComplete() && 
    isRemunerationComplete();
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Finalisation du contrat</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Vérification des informations</h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className={`flex-shrink-0 h-5 w-5 ${contractData.type_contrat.length > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {contractData.type_contrat.length > 0 ? <Check size={20} /> : '✗'}
            </div>
            <div className="ml-3">
              <span className="text-gray-700">Type de contrat</span>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className={`flex-shrink-0 h-5 w-5 ${isAuthorInfoComplete() ? 'text-green-500' : 'text-red-500'}`}>
              {isAuthorInfoComplete() ? <Check size={20} /> : '✗'}
            </div>
            <div className="ml-3">
              <span className="text-gray-700">Informations sur l'auteur/modèle</span>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className={`flex-shrink-0 h-5 w-5 ${isWorkDescriptionComplete() ? 'text-green-500' : 'text-red-500'}`}>
              {isWorkDescriptionComplete() ? <Check size={20} /> : '✗'}
            </div>
            <div className="ml-3">
              <span className="text-gray-700">Description de l'œuvre/image</span>
            </div>
          </div>
          
          {contractData.type_cession === "Onéreuse" && (
            <div className="flex items-start">
              <div className={`flex-shrink-0 h-5 w-5 ${contractData.remuneration ? 'text-green-500' : 'text-red-500'}`}>
                {contractData.remuneration ? <Check size={20} /> : '✗'}
              </div>
              <div className="ml-3">
                <span className="text-gray-700">Rémunération</span>
              </div>
            </div>
          )}
        </div>
        
        {!isFormComplete && (
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Veuillez compléter toutes les informations requises avant de générer le contrat.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Options de finalisation</h3>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
          <div>
            <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du fichier PDF (optionnel)
            </label>
            <input 
              type="text" 
              id="filename" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ex: Contrat_Cession_Droits_2023"
              value={filename}
              onChange={handleFilenameChange}
            />
            <p className="mt-1 text-sm text-gray-500">
              Si non spécifié, le fichier sera nommé "contrat.pdf"
            </p>
          </div>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre du contrat (pour l'éditeur)
            </label>
            <input 
              type="text" 
              id="title" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ex: Contrat de cession de droits d'auteur"
              value={title}
              onChange={handleTitleChange}
            />
            <p className="mt-1 text-sm text-gray-500">
              Ce titre sera utilisé pour identifier votre contrat dans la liste des contrats.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          className={`flex items-center justify-center py-3 px-4 rounded-md shadow-sm text-white font-medium transition-colors ${
            isFormComplete 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={handleGeneratePdf}
          disabled={!isFormComplete || isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Génération en cours...
            </>
          ) : (
            <>
              <Download size={18} className="mr-2" />
              Télécharger au format PDF
            </>
          )}
        </button>
        
        <button 
          className={`flex items-center justify-center py-3 px-4 rounded-md shadow-sm text-white font-medium transition-colors ${
            isFormComplete 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={handleAccessEditor}
          disabled={!isFormComplete || isSaving}
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Préparation de l'éditeur...
            </>
          ) : (
            <>
              <Edit size={18} className="mr-2" />
              Accéder à l'éditeur
              <span className="ml-2 text-xs bg-yellow-400 text-yellow-800 font-semibold px-1.5 py-0.5 rounded-full">Beta</span>
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {generationSuccess && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Le contrat a été généré avec succès et le téléchargement devrait commencer automatiquement.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Informations importantes</h3>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Note :</strong> Le contrat généré est un document juridique qui peut être utilisé tel quel.
                Cependant, pour les situations complexes ou à enjeux importants, nous vous recommandons de le faire vérifier par un professionnel du droit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6Finalization;