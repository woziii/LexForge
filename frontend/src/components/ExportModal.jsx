import React, { useState, useEffect } from 'react';
import { X, FileDown } from 'lucide-react';

const ExportModal = ({ isOpen, onClose, onExport, contractTitle, contractId }) => {
  const [filename, setFilename] = useState('');
  
  useEffect(() => {
    // Si le titre est disponible, l'utiliser comme nom de fichier par défaut
    // Sinon, utiliser le format lexforge_contract_ID
    if (isOpen) {
      const defaultName = contractTitle 
        ? contractTitle.trim().replace(/\s+/g, '_').toLowerCase() 
        : `lexforge_contract_${contractId}`;
      
      setFilename(defaultName);
    }
  }, [isOpen, contractTitle, contractId]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalFilename = filename.trim() || `lexforge_contract_${contractId}`;
    onExport(finalFilename);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">Exporter votre contrat</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="export-filename-input" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du fichier
            </label>
            <div className="flex items-center">
              <input
                type="text"
                id="export-filename-input"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                autoFocus
              />
              <span className="ml-2 text-gray-500">.json</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Choisissez un nom significatif pour retrouver facilement votre contrat.
            </p>
          </div>

          <div id="export-format-options" className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Format d'exportation</label>
            <div className="flex space-x-2">
              <button
                type="button"
                className="flex-1 py-2 px-3 bg-indigo-100 text-indigo-700 font-medium rounded-md border border-indigo-200"
              >
                JSON
              </button>
              <button
                type="button"
                className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 font-medium rounded-md border border-gray-200"
                disabled
              >
                PDF (bientôt)
              </button>
            </div>
            <p className="mt-1 text-xs text-indigo-600">
              Le format JSON permet de partager facilement ton contrat avec Lucas MAURICI pour un conseil juridique adapté.
            </p>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FileDown className="mr-2" size={16} />
              Exporter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportModal; 