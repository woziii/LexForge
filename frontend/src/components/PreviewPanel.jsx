import React, { useState } from 'react';
import { Copy, Eye, Download, X } from 'lucide-react';

const PreviewPanel = ({ contractPreview, isLoading }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    if (contractPreview) {
      navigator.clipboard.writeText(contractPreview);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div className="border-b border-gray-200 bg-white px-3 sm:px-4 py-3 flex justify-between items-center rounded-t-lg shadow-sm">
        <h3 className="text-sm sm:text-lg font-medium text-gray-800 flex items-center">
          <Eye size={16} className="mr-1 sm:mr-2 text-blue-500" />
          Aperçu
          <span className="hidden sm:inline ml-1">du contrat</span>
        </h3>
        <div className="flex space-x-1 sm:space-x-2">
          <button 
            className={`p-1 sm:p-1.5 rounded-md transition-colors ${copySuccess ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-600'}`}
            title="Copier le contenu"
            onClick={handleCopy}
          >
            <Copy size={14} className="sm:w-4 sm:h-4" />
            {copySuccess && <span className="absolute -bottom-8 right-0 text-xs bg-green-100 text-green-600 px-2 py-1 rounded shadow-sm">Copié!</span>}
          </button>
          <button 
            className="p-1 sm:p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors" 
            title="Aperçu plein écran"
            onClick={toggleFullscreen}
          >
            <Eye size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button 
            className="p-1 sm:p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors" 
            title="Télécharger"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      <div className={`overflow-y-auto bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50 p-3 sm:p-6' : 'h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] p-3 sm:p-4 rounded-b-lg'}`}>
        {isFullscreen && (
          <button 
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            onClick={toggleFullscreen}
          >
            <X size={20} />
          </button>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500 mb-3 sm:mb-4"></div>
              <p className="text-gray-500 text-sm sm:text-base">Génération de l'aperçu...</p>
            </div>
          </div>
        ) : contractPreview ? (
          <div className="bg-white border border-gray-200 p-4 sm:p-8 rounded-lg shadow-sm max-w-4xl mx-auto whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed">
            <div className="mb-4 sm:mb-6 pb-3 sm:pb-6 border-b border-gray-100">
              <div className="text-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 tracking-tight">CONTRAT DE CESSION DE DROITS</h2>
                <div className="w-12 sm:w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {contractPreview.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-800">{paragraph}</p>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-gray-400">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Eye size={24} className="sm:w-9 sm:h-9 text-blue-300" />
            </div>
            <p className="text-center max-w-xs text-sm sm:text-base">Complétez les informations du formulaire pour visualiser l'aperçu du contrat</p>
          </div>
        )}
      </div>
    </>
  );
};

export default PreviewPanel; 