import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Check, Edit, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { generatePdf, saveContract, saveClient, accessFinalizationStep } from '../../services/api';
import { useAuth, useClerk } from '@clerk/clerk-react';

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
  const [showRecoveryMessage, setShowRecoveryMessage] = useState(false);
  
  const navigate = useNavigate();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();
  
  // Fonction pour sauvegarder temporairement les données avant authentification
  const sauvegarderTemporairement = async (data, action) => {
    console.log('DEBUG - Step6Finalization - Sauvegarde temporaire des données, action:', action);
    
    try {
      // Sauvegarder le contrat comme brouillon dans la base de données
      const defaultTitle = `Brouillon - ${new Date().toLocaleString()}`;
      console.log('DEBUG - Step6Finalization - Titre par défaut du brouillon:', defaultTitle);
      console.log('DEBUG - Step6Finalization - Titre fourni:', title);
      
      const savedContract = await saveContract(
        data,
        title || defaultTitle,
        null,  // id
        true,  // isDraft
        true   // fromStep6
      );
      
      // Sauvegarder l'ID du contrat et l'action dans sessionStorage
      sessionStorage.setItem('draftContractId', savedContract.id);
      sessionStorage.setItem('authRedirectAction', action);
      
      // Également stocker dans localStorage pour assurer la persistance
      localStorage.setItem('lastDraftContractId', savedContract.id);
      localStorage.setItem('lastAuthRedirectAction', action);
      
      console.log('DEBUG - Step6Finalization - Contrat sauvegardé comme brouillon avec ID:', savedContract.id);
      console.log('DEBUG - Step6Finalization - Données stockées dans sessionStorage et localStorage pour persistance');
      
      // Mémoriser l'ID et l'action en état local également
      setSavedContractId(savedContract.id);
      setAuthRedirectAction(action);
      
    } catch (error) {
      console.error('DEBUG - Step6Finalization - Erreur lors de la sauvegarde temporaire:', error);
      // En cas d'erreur, utiliser l'ancien mécanisme de sauvegarde dans sessionStorage
      sessionStorage.setItem('tempContractData', JSON.stringify(data));
      sessionStorage.setItem('authRedirectAction', action);
      setTempContractData(data);
      setAuthRedirectAction(action);
    }
  };
  
  // Récupérer les données temporaires après authentification
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      console.log('Authentification complète, vérification des données sauvegardées');
      
      const draftContractId = sessionStorage.getItem('draftContractId');
      const savedAction = sessionStorage.getItem('authRedirectAction');
      const savedData = sessionStorage.getItem('tempContractData');
      
      console.log('ID du contrat brouillon:', draftContractId);
      console.log('Action trouvée dans sessionStorage:', savedAction);
      
      // Vérifier les paramètres d'URL pour l'action de redirection
      const urlParams = new URLSearchParams(window.location.search);
      const redirectAction = urlParams.get('redirectAction');
      console.log('Action trouvée dans les paramètres d\'URL:', redirectAction);
      
      // Si des données à récupérer existent, montrer le message de récupération
      if ((draftContractId && (savedAction || redirectAction)) || 
          (savedData && (savedAction || redirectAction))) {
        setShowRecoveryMessage(true);
        // Cacher le message après 5 secondes
        setTimeout(() => setShowRecoveryMessage(false), 5000);
      }
      
      // Privilégier la récupération depuis le brouillon enregistré
      if (draftContractId && (savedAction || redirectAction)) {
        // Récupérer les données du contrat brouillon
        accessFinalizationStep(draftContractId)
          .then(response => {
            console.log('Données récupérées du brouillon:', response.form_data);
            
            // Mettre à jour les données du contrat
            updateContractData(response.form_data);
            
            // Effectuer l'action appropriée après l'authentification
            const actionToPerform = redirectAction || savedAction;
            
            if (actionToPerform === 'downloadPdf') {
              handleGeneratePdf(false);
            } else if (actionToPerform === 'accessEditor') {
              handleAccessEditor(false, draftContractId);
            }
            
            // Nettoyer le stockage temporaire
            sessionStorage.removeItem('draftContractId');
            sessionStorage.removeItem('authRedirectAction');
            
            // Nettoyer tous les paramètres d'URL spécifiques à la redirection
            if (urlParams.has('redirectAction') || urlParams.has('fromDashboard')) {
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('redirectAction');
              newUrl.searchParams.delete('fromDashboard');
              window.history.replaceState({}, '', newUrl.toString());
            }
          })
          .catch(error => {
            console.error('Erreur lors de la récupération du brouillon:', error);
            // En cas d'erreur, essayer de récupérer depuis le sessionStorage
            handleFallbackRestore();
          });
      } 
      // Fallback vers l'ancien mécanisme
      else if (savedData && (savedAction || redirectAction)) {
        handleFallbackRestore();
      }
    }
    
    // Fonction pour gérer la restauration via l'ancien mécanisme
    const handleFallbackRestore = () => {
      const savedData = sessionStorage.getItem('tempContractData');
      const savedAction = sessionStorage.getItem('authRedirectAction');
      const urlParams = new URLSearchParams(window.location.search);
      const redirectAction = urlParams.get('redirectAction');
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('Données parsées depuis sessionStorage:', parsedData);
        
        // Mettre à jour les données du contrat
        updateContractData(parsedData);
        
        // Effectuer l'action appropriée après l'authentification
        const actionToPerform = redirectAction || savedAction;
        
        if (actionToPerform === 'downloadPdf') {
          handleGeneratePdf(false);
        } else if (actionToPerform === 'accessEditor') {
          handleAccessEditor(false);
        }
        
        // Nettoyer le stockage temporaire
        sessionStorage.removeItem('tempContractData');
        sessionStorage.removeItem('authRedirectAction');
        
        // Nettoyer tous les paramètres d'URL spécifiques à la redirection
        if (urlParams.has('redirectAction') || urlParams.has('fromDashboard')) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('redirectAction');
          newUrl.searchParams.delete('fromDashboard');
          window.history.replaceState({}, '', newUrl.toString());
        }
      }
    };
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded, isSignedIn, updateContractData]);
  
  const handleFilenameChange = (e) => {
    setFilename(e.target.value);
  };
  
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  
  const handleGeneratePdf = async (checkAuth = true) => {
    // Si vérification d'authentification requise et utilisateur non authentifié
    if (checkAuth && authLoaded && !isSignedIn) {
      // Sauvegarder les données et rediriger vers l'authentification
      sauvegarderTemporairement(contractData, 'downloadPdf');
      
      // Utiliser une URL absolue avec window.location.origin
      const currentUrl = new URL(window.location.href);
      // Préserver tous les paramètres d'URL existants
      currentUrl.searchParams.set('redirectAction', 'downloadPdf');
      currentUrl.searchParams.set('fromDashboard', 'true');
      
      clerk.openSignIn({
        redirectUrl: currentUrl.toString()
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
  
  const handleAccessEditor = async (checkAuth = true, draftContractId = null) => {
    // Si vérification d'authentification requise et utilisateur non authentifié
    if (checkAuth && authLoaded && !isSignedIn) {
      // Sauvegarder les données et rediriger vers l'authentification
      sauvegarderTemporairement(contractData, 'accessEditor');
      
      // Utiliser une URL absolue avec window.location.origin
      const currentUrl = new URL(window.location.href);
      // Préserver tous les paramètres d'URL existants
      currentUrl.searchParams.set('redirectAction', 'accessEditor');
      currentUrl.searchParams.set('fromDashboard', 'true');
      
      clerk.openSignIn({
        redirectUrl: currentUrl.toString()
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
      
      // Si un ID de brouillon est fourni, utiliser cet ID pour la mise à jour
      let savedContract;
      if (draftContractId) {
        savedContract = await saveContract(
          contractData,
          contractTitle,
          draftContractId,
          false, // Marquer comme non brouillon
          true   // Marquer comme venant de l'étape 6
        );
      } else {
        // Sauvegarder comme nouveau contrat
        savedContract = await saveContract(
          contractData,
          contractTitle,
          null,
          false, // Marquer comme non brouillon
          true   // Marquer comme venant de l'étape 6
        );
      }
      
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
      
      {showRecoveryMessage && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-md flex items-start animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-green-700">
            Votre travail a été récupéré avec succès ! Vous pouvez maintenant continuer où vous vous étiez arrêté.
          </p>
        </div>
      )}
      
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
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 py-0.5 px-1.5 rounded-md">Beta</span>
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