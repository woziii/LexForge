import React from 'react';
import { Copy, Eye, Download } from 'lucide-react';

const PreviewPanel = ({ contractPreview, isLoading }) => {
  return (
    <>
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800">Aperçu en temps réel</h3>
        <div className="flex space-x-2">
          <button 
            className="p-1 rounded-md hover:bg-gray-200" 
            title="Copier"
            onClick={() => {
              if (contractPreview) {
                navigator.clipboard.writeText(contractPreview);
              }
            }}
          >
            <Copy size={16} />
          </button>
          <button className="p-1 rounded-md hover:bg-gray-200" title="Aperçu plein écran">
            <Eye size={16} />
          </button>
          <button className="p-1 rounded-md hover:bg-gray-200" title="Télécharger">
            <Download size={16} />
          </button>
        </div>
      </div>
      <div className="p-4 overflow-y-auto h-[600px] bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : contractPreview ? (
          <div className="bg-white border border-gray-200 p-6 rounded-md whitespace-pre-wrap font-mono text-sm">
            {contractPreview}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-gray-500">
            <Eye size={48} className="mb-4 opacity-20" />
            <p>Complétez les informations du formulaire pour voir l'aperçu du contrat</p>
          </div>
        )}
      </div>
    </>
  );
};

export default PreviewPanel; 