import React from 'react';
import { Edit, X } from 'lucide-react';

const DraftActionsModal = ({ isOpen, onClose, onOpenEditor, contractTitle }) => {
  if (!isOpen) return null;
  
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
            <div className="flex-shrink-0 p-2 mx-auto bg-green-100 rounded-full sm:mx-0">
              <div className="w-8 h-8 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Contrat finalisé avec succès !
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Votre contrat <span className="font-semibold">{contractTitle}</span> est maintenant disponible dans votre espace.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Il est désormais sauvegardé comme un contrat standard et non plus comme un brouillon.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-5">
            <div className="rounded-md bg-gray-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">Que souhaitez-vous faire maintenant ?</h3>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-4 flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={onOpenEditor}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto"
            >
              <Edit className="mr-2 -ml-1 h-4 w-4" />
              Ouvrir dans l'éditeur
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center items-center px-4 py-2 mt-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftActionsModal; 