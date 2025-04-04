import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { getContractById, updateContract } from '../services/api';

/**
 * Composant outil pour aider à diagnostiquer et réparer les problèmes de brouillons
 * Ce composant peut être temporairement ajouté à la page des contrats pour aider à récupérer
 * les brouillons perdus.
 */
const ContractFixTool = () => {
  const [draftId, setDraftId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { userId } = useAuth();
  const navigate = useNavigate();
  
  // Au chargement, chercher l'ID du dernier brouillon dans localStorage
  useEffect(() => {
    const lastDraftId = localStorage.getItem('lastDraftContractId');
    if (lastDraftId) {
      setDraftId(lastDraftId);
      console.log('DEBUG - ContractFixTool - Dernier ID de brouillon trouvé:', lastDraftId);
    }
  }, []);
  
  // Fonction pour vérifier et réparer un brouillon
  const checkAndFixDraft = async () => {
    if (!draftId) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('DEBUG - ContractFixTool - Vérification du brouillon:', draftId);
      
      // Tenter de récupérer le contrat directement par son ID
      // Note: Ceci va générer une erreur 403 si l'utilisateur n'a pas accès au contrat
      const contractDetails = await getContractById(draftId);
      
      console.log('DEBUG - ContractFixTool - Contrat trouvé:', contractDetails);
      
      // Le contrat existe et est accessible à l'utilisateur
      setResult({
        success: true,
        message: `Le contrat ${draftId} est accessible. User ID: ${contractDetails.user_id}`,
        isDraft: contractDetails.is_draft,
        currentUserId: userId
      });
      
    } catch (error) {
      console.error('DEBUG - ContractFixTool - Erreur lors de la récupération du contrat:', error);
      
      // Si on a reçu une erreur 403, cela signifie que le contrat existe mais n'est pas accessible
      const is403 = error.response && error.response.status === 403;
      
      setResult({
        success: false,
        message: is403 
          ? `Le contrat ${draftId} existe mais n'est pas associé à votre compte.` 
          : `Erreur lors de la récupération du contrat: ${error.message}`,
        is403,
        currentUserId: userId
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour forcer l'association du brouillon à l'utilisateur actuel
  const forceAssociateDraft = async () => {
    if (!draftId || !result) return;
    
    setIsLoading(true);
    
    try {
      console.log('DEBUG - ContractFixTool - Tentative de forcer l\'association du contrat', draftId, 'à l\'utilisateur', userId);
      
      // Cette requête va échouer si elle est envoyée directement au serveur sans modification
      // Pour les besoins de diagnostic, nous allons plutôt afficher un message explicatif
      setResult({
        ...result,
        success: false,
        message: `Pour associer ce contrat à votre compte, un administrateur doit modifier manuellement le fichier du contrat dans le backend pour définir user_id=${userId}.`
      });
      
    } catch (error) {
      console.error('DEBUG - ContractFixTool - Erreur lors de l\'association forcée:', error);
      setResult({
        ...result,
        success: false,
        message: `Erreur lors de l'association forcée: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-4 border border-amber-300 rounded-lg mt-4 bg-amber-50">
      <h3 className="text-lg font-medium text-amber-800">Outil de diagnostic et récupération de brouillon</h3>
      <p className="text-sm text-amber-700 mb-3">
        Cet outil vous aide à diagnostiquer des problèmes avec les brouillons non visibles.
      </p>
      
      <div className="mb-4">
        <label htmlFor="draft-id" className="block text-sm font-medium text-amber-700">
          ID du brouillon à vérifier
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="draft-id"
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-amber-300 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            placeholder="ID du brouillon (UUID)"
            value={draftId}
            onChange={(e) => setDraftId(e.target.value)}
          />
          <button
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            onClick={checkAndFixDraft}
            disabled={isLoading || !draftId}
          >
            {isLoading ? 'Vérification...' : 'Vérifier'}
          </button>
        </div>
        <p className="mt-1 text-xs text-amber-500">
          Conseil: Vérifiez les logs de la console pour trouver l'ID du dernier brouillon créé.
        </p>
      </div>
      
      {result && (
        <div className={`mt-4 p-3 rounded-md ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <p className="text-sm font-medium">{result.message}</p>
          
          {!result.success && result.is403 && (
            <div className="mt-3">
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                onClick={forceAssociateDraft}
                disabled={isLoading}
              >
                {isLoading ? 'Association...' : 'Associer à mon compte (diagnostic uniquement)'}
              </button>
              <p className="mt-1 text-xs">
                Votre ID utilisateur: {userId || 'Non connecté'}
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 text-xs text-amber-600">
        <p className="font-semibold">Informations de débogage:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>ID utilisateur actuel: {userId || 'Non connecté'}</li>
          <li>Dernier ID brouillon connu: {localStorage.getItem('lastDraftContractId') || 'Aucun'}</li>
          <li>Session ID brouillon: {sessionStorage.getItem('draftContractId') || 'Aucun'}</li>
        </ul>
      </div>
    </div>
  );
};

export default ContractFixTool; 