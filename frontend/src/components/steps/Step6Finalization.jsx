import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Check, Edit, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { generatePdf, saveContract, saveClient } from '../../services/api';
import { useAuth, useSignIn } from '@clerk/clerk-react';

const Step6Finalization = ({ contractData, updateContractData }) => {
  const [filename, setFilename] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [error, setError] = useState('');
  const [savedContractId, setSavedContractId] = useState(null);
  const [clientSaved, setClientSaved] = useState(false);
  const [clientError, setClientError] = useState('');
  const [tempContractData, setTempContractData] = useState(null);
  const [authRedirectAction, setAuthRedirectAction] = useState(null);
  
  const navigate = useNavigate();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useSignIn();
  
  // Récupérer les données temporaires après authentification
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      const savedData = sessionStorage.getItem('tempContractData');
      const savedAction = sessionStorage.getItem('authRedirectAction');
      
      if (savedData && savedAction) {
        const parsedData = JSON.parse(savedData);
        
        // Mettre à jour les données du contrat
        updateContractData(parsedData);
        
        // Effectuer l'action appropriée après l'authentification
        if (savedAction === 'downloadPdf') {
          handleGeneratePdf(false);
        } else if (savedAction === 'accessEditor') {
          handleAccessEditor(false);
        }
        
        // Nettoyer le stockage temporaire
        sessionStorage.removeItem('tempContractData');
        sessionStorage.removeItem('authRedirectAction');
      }
    }
  }, [authLoaded, isSignedIn]);
  
  const handleFilenameChange = (e) => {
    setFilename(e.target.value);
  };
  
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  
  // Fonction pour sauvegarder temporairement les données avant authentification
  const sauvegarderTemporairement = (data, action) => {
    sessionStorage.setItem('tempContractData', JSON.stringify(data));
    sessionStorage.setItem('authRedirectAction', action);
    setTempContractData(data);
    setAuthRedirectAction(action);
  };
  
  const handleGeneratePdf = async (checkAuth = true) => {
    // Si vérification d'authentification requise et utilisateur non authentifié
    if (checkAuth && authLoaded && !isSignedIn) {
      // Sauvegarder les données et rediriger vers l'authentification
      sauvegarderTemporairement(contractData, 'downloadPdf');
      openSignIn({
        redirectUrl: window.location.href, // Rediriger vers la même page
      });
      return;
    }
    
    setIsGenerating(true);
    setError('');
    setGenerationSuccess(false);
    
    try {
      await generatePdf(contractData, filename || 'contrat');
      
      // Si le client doit être sauvegardé (checkbox dans Step3)
      if (contractData.auteur_info.saveToClients && !contractData.auteur_info.id) {
        await saveAuthorAsClient();
      }
      
      setGenerationSuccess(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleAccessEditor = async (checkAuth = true) => {
    // Si vérification d'authentification requise et utilisateur non authentifié
    if (checkAuth && authLoaded && !isSignedIn) {
      // Sauvegarder les données et rediriger vers l'authentification
      sauvegarderTemporairement(contractData, 'accessEditor');
      openSignIn({
        redirectUrl: window.location.href, // Rediriger vers la même page
      });
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      // Si le client doit être sauvegardé (checkbox dans Step3)
      if (contractData.auteur_info.saveToClients && !contractData.auteur_info.id) {
        await saveAuthorAsClient();
      }
      
      // Préparer un titre pour le contrat
      const contractTitle = title || `Contrat ${Date.now()}`;
      
      // Sauvegarder le contrat en brouillon
      const savedContract = await saveContract(contractData, contractTitle);
      
      // Rediriger vers l'éditeur avec l'ID du contrat
      if (savedContract && savedContract.id) {
        navigate(`/editor/${savedContract.id}`);
      }
    } catch (error) {
      console.error('Error preparing editor:', error);
      setError('Une erreur est survenue lors de la préparation de l\'éditeur. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const saveAuthorAsClient = async () => {
    try {
      setClientError('');
      
      const clientData = {
        ...contractData.auteur_info,
        type: contractData.auteur_type === "Personne physique" ? "physical_person" : "legal_entity"
      };
      
      // Supprimer la propriété saveToClients avant d'envoyer
      delete clientData.saveToClients;
      
      await saveClient(clientData);
      setClientSaved(true);
      
      // Masquer le message après 5 secondes
      setTimeout(() => setClientSaved(false), 5000);
    } catch (error) {
      console.error('Error saving client:', error);
      setClientError('Impossible de sauvegarder ce contact dans vos clients.');
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
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">Finalisation du contrat</h2>
      
      {!isSignedIn && (
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-md flex items-start">
          <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-blue-700">
            Pour télécharger votre contrat ou accéder à l'éditeur, vous devrez vous connecter ou créer un compte. 
            Vos données seront sauvegardées pendant le processus d'authentification.
          </p>
        </div>
      )}
      
      {clientSaved && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-md flex items-start">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-green-700">Le contact a été ajouté à vos clients avec succès.</p>
        </div>
      )}
      
      {clientError && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{clientError}</p>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-1">
        <p className="font-medium text-blue-800">Résumé du contrat</p>
        <p className="text-sm text-blue-600">
          <span className="font-medium">Type de contrat :</span> {contractData.type_contrat.join(", ")}
        </p>
        <p className="text-sm text-blue-600">
          <span className="font-medium">Mode de cession :</span> {contractData.type_cession}
          {contractData.exclusivite && " (exclusive)"}
        </p>
        <p className="text-sm text-blue-600">
          <span className="font-medium">Auteur/Modèle :</span> {contractData.auteur_type}
          {contractData.auteur_type === "Personne physique" && contractData.auteur_info.prenom && (
            <span> - {contractData.auteur_info.gentille} {contractData.auteur_info.prenom} {contractData.auteur_info.nom}</span>
          )}
          {contractData.auteur_type === "Personne morale" && contractData.auteur_info.nom && (
            <span> - {contractData.auteur_info.nom}</span>
          )}
        </p>
      </div>
      
      <div className="p-4 border border-gray-200 rounded-lg">
        <label htmlFor="contract-title" className="block text-sm font-medium text-gray-700 mb-2">
          Titre du contrat (optionnel)
        </label>
        <input
          type="text"
          id="contract-title"
          className="w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Contrat de cession de droits - Projet XYZ"
          value={title}
          onChange={handleTitleChange}
        />
        <p className="mt-1 text-xs text-gray-500">
          Ce titre sera utilisé pour identifier votre contrat dans votre liste de contrats.
        </p>
      </div>
      
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="text-base font-medium text-gray-700 mb-2">Validation finale</h3>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-start">
            <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${
              contractData.type_contrat.length > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {contractData.type_contrat.length > 0 ? '✓' : '✗'}
            </div>
            <span className="ml-2">Type de contrat sélectionné</span>
          </div>
          
          <div className="flex items-start">
            <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${
              isAuthorInfoComplete() ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {isAuthorInfoComplete() ? '✓' : '✗'}
            </div>
            <span className="ml-2">Informations de l'auteur/modèle complètes</span>
          </div>
          
          <div className="flex items-start">
            <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${
              isWorkDescriptionComplete() ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {isWorkDescriptionComplete() ? '✓' : '✗'}
            </div>
            <span className="ml-2">Description de l'œuvre/image complète</span>
          </div>
          
          <div className="flex items-start">
            <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${
              isRemunerationComplete() ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {isRemunerationComplete() ? '✓' : '✗'}
            </div>
            <span className="ml-2">Rémunération correctement configurée</span>
          </div>
        </div>
        
        {!isFormComplete && (
          <div className="p-3 bg-amber-50 border-l-4 border-amber-400 text-amber-700 text-sm">
            Veuillez compléter toutes les informations obligatoires avant de générer votre contrat.
          </div>
        )}
      </div>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          className={`flex items-center justify-center py-3 px-4 rounded-md shadow-sm text-white font-medium transition-colors ${
            isFormComplete 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={() => handleGeneratePdf()}
          disabled={!isFormComplete || isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <Download size={18} className="mr-2" />
              <span>Télécharger le PDF</span>
            </>
          )}
        </button>
        
        <button 
          className={`flex items-center justify-center py-3 px-4 rounded-md shadow-sm font-medium transition-colors ${
            isFormComplete 
              ? 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50' 
              : 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed'
          }`}
          onClick={() => handleAccessEditor()}
          disabled={!isFormComplete || isSaving}
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Préparation de l'éditeur...</span>
            </>
          ) : (
            <>
              <Edit size={18} className="mr-2" />
              <span>Accéder à l'éditeur</span>
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {generationSuccess && (
        <div className="p-3 bg-green-50 border-l-4 border-green-400 text-green-700 text-sm flex items-center">
          <Check size={18} className="mr-2 text-green-500" />
          <span>Le PDF a été généré avec succès !</span>
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