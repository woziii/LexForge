import React, { useState } from 'react';
import { Edit2, X } from 'lucide-react';
import { updateContract, getCurrentUserId } from '../services/api';

const DraftRenameModal = ({ isOpen, onClose, onRename, initialTitle, contractId }) => {
  const [title, setTitle] = useState(initialTitle || '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Le titre ne peut pas être vide');
      return;
    }

    try {
      setIsSaving(true);
      console.log('Finalisation du brouillon (sans modification des données):', contractId);
      
      // ⚠️ IMPORTANT: Ne modifier que le titre et le statut is_draft, sans toucher aux données
      // Cela garantit que les informations du contrat sont préservées telles quelles
      const response = await updateContract(contractId, { 
        title, // Nouveau titre
        is_draft: false, // Marquer comme finalisé (non brouillon)
        preserve_data: true // Indicateur spécial pour signaler qu'il ne faut pas toucher aux données
      });

      setIsSaving(false);
      
      if (response) {
        // Informer le parent du succès pour mettre à jour l'interface
        onRename(title);
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de la finalisation du brouillon:', error);
      setError('Une erreur est survenue lors de la finalisation du brouillon.');
      setIsSaving(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
              <Edit2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Valider le contrat
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Donnez un nom à votre contrat pour le sauvegarder. Toutes les informations du contrat seront conservées.
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-5">
            <div>
              <label htmlFor="contract-title" className="block text-sm font-medium text-gray-700">
                Titre du contrat
              </label>
              <input
                type="text"
                id="contract-title"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Contrat de cession de droits - Projet XYZ"
                required
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
            
            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {isSaving ? 'Finalisation...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DraftRenameModal; 