import React, { useState, useRef } from 'react';
import { FileDown, UploadCloud, Check, AlertCircle, ArrowRight, Loader } from 'lucide-react';
import { exportContract, importContract } from '../services/api';
import ExportModal from './ExportModal';

/**
 * Composant de partage de contrat qui permet d'exporter et d'importer des contrats.
 * Peut être utilisé dans différentes parties de l'application
 */
const ContractSharePanel = ({ contractId = null, onImportSuccess = null, variant = 'full', contractTitle = '' }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Référence pour la zone de glisser-déposer
  const dropZoneRef = useRef(null);

  // Fonction pour ouvrir le modal d'exportation
  const handleExportClick = () => {
    if (!contractId) return;
    setIsExportModalOpen(true);
  };

  // Fonction pour déclencher l'exportation d'un contrat
  const handleExport = async (customFilename) => {
    if (!contractId) return;
    
    try {
      setIsExporting(true);
      await exportContract(contractId, customFilename);
      
      // Fermer le modal
      setIsExportModalOpen(false);
      
      // Afficher une notification de succès
      setNotification({
        type: 'success',
        message: 'Contrat exporté avec succès'
      });
      
      // Masquer la notification après 3 secondes
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error exporting contract:', error);
      
      // Afficher une notification d'erreur
      setNotification({
        type: 'error',
        message: 'Erreur lors de l\'exportation du contrat'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Fonction pour déclencher l'importation d'un contrat
  const handleImport = async () => {
    if (!importFile) return;
    
    try {
      setIsImporting(true);
      
      const result = await importContract(importFile);
      
      // Réinitialiser le fichier sélectionné
      setImportFile(null);
      fileInputRef.current.value = null;
      
      // Afficher une notification de succès
      setNotification({
        type: 'success',
        message: 'Contrat importé avec succès'
      });
      
      // Appeler le callback si fourni
      if (onImportSuccess && result.contractId) {
        onImportSuccess(result.contractId);
      }
    } catch (error) {
      console.error('Error importing contract:', error);
      
      // Afficher une notification d'erreur
      setNotification({
        type: 'error',
        message: 'Erreur lors de l\'importation du contrat'
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current.classList.add('border-blue-500', 'bg-blue-50');
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current.classList.remove('border-blue-500', 'bg-blue-50');
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setImportFile(file);
      } else {
        setNotification({
          type: 'error',
          message: 'Le fichier doit être au format JSON'
        });
      }
    }
  };
  
  // Mode import uniquement
  if (variant === 'import_only') {
    return (
      <div className="flex flex-col">
        {notification && (
          <div className={`p-3 rounded-lg ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 
            'bg-red-100 text-red-800'
          } flex items-center mb-4`}>
            {notification.type === 'success' ? <Check size={18} className="mr-2" /> : 
            <AlertCircle size={18} className="mr-2" />}
            <span>{notification.message}</span>
          </div>
        )}
        
        <div 
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="h-24 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-300 transition-colors flex flex-col items-center justify-center cursor-pointer mb-3"
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <UploadCloud size={24} className="text-blue-600 mb-2" />
          <p className="text-sm text-center text-gray-500">
            {importFile ? importFile.name : "Importe ici un contrat optimisé par Lucas"}
          </p>
        </div>
        
        <button
          onClick={handleImport}
          disabled={!importFile || isImporting}
          className={`w-full flex items-center justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-colors ${
            !importFile
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isImporting ? (
            <div className="flex items-center">
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Importation en cours...</span>
            </div>
          ) : (
            <>
              <ArrowRight size={16} className="mr-2" />
              <span>{importFile ? 'Importer le contrat' : 'Sélectionner un fichier'}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Version mini pour l'utilisation dans la barre latérale
  if (variant === 'mini') {
    return (
      <div className="flex flex-col space-y-4">
        {notification && (
          <div className={`p-3 rounded-lg ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 
            'bg-red-100 text-red-800'
          } flex items-center mb-4`}>
            {notification.type === 'success' ? <Check size={18} className="mr-2" /> : 
             <AlertCircle size={18} className="mr-2" />}
            <span>{notification.message}</span>
          </div>
        )}
        
        {contractId && (
          <button
            onClick={handleExportClick}
            disabled={isExporting}
            className="flex items-center justify-center py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
          >
            {isExporting ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>Exportation...</span>
              </div>
            ) : (
              <>
                <FileDown size={16} className="mr-2 text-indigo-600" />
                <span>Envoyer à Lucas</span>
              </>
            )}
          </button>
        )}
        
        {/* Modal d'exportation */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExport}
          contractTitle={contractTitle}
          contractId={contractId}
        />
      </div>
    );
  }

  // Version complète par défaut
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="text-lg font-medium text-gray-800">
          Partager et importer des contrats
        </h3>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Section d'exportation */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="text-base font-medium text-blue-800 mb-2 flex items-center">
              <FileDown size={18} className="mr-2 text-indigo-600" />
              Exporter un contrat
            </h4>
            <p className="text-sm text-blue-600 mb-4">
              Envoie ton contrat directement à Lucas MAURICI pour un conseil juridique sans prise de tête ! Un simple clic et ton expert juridique perso s'occupe de tout. ✨
            </p>
            
            <button
              className={`w-full flex items-center justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-colors ${
                !contractId || isExporting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              onClick={handleExportClick}
              disabled={!contractId || isExporting}
            >
              {isExporting ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Exportation en cours...</span>
                </div>
              ) : (
                <>
                  <FileDown size={16} className="mr-2" />
                  <span>{contractId ? 'Envoyer à Lucas pour avis' : 'Aucun contrat sélectionné'}</span>
                </>
              )}
            </button>
          </div>
          
          {/* Section d'importation */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-base font-medium text-gray-800 mb-2 flex items-center">
              <UploadCloud size={18} className="mr-2 text-blue-600" />
              Importer un contrat
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Reprends facilement un contrat optimisé par Lucas ! Finis les allers-retours par email - importe le contrat en un clin d'œil et continue à travailler avec l'expertise juridique intégrée. 🚀
            </p>
            
            <div 
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="h-24 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-300 transition-colors flex flex-col items-center justify-center cursor-pointer mb-3"
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <UploadCloud size={24} className="text-blue-600 mb-2" />
              <p className="text-sm text-center text-gray-500">
                {importFile ? importFile.name : "Cliquez ou glissez un fichier ici"}
              </p>
            </div>
            
            <button
              onClick={handleImport}
              disabled={!importFile || isImporting}
              className={`w-full flex items-center justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-colors ${
                !importFile
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isImporting ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Importation en cours...</span>
                </div>
              ) : (
                <>
                  <ArrowRight size={16} className="mr-2" />
                  <span>{importFile ? 'Importer le contrat' : 'Sélectionner un fichier'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Notification de statut */}
      {notification && (
        <div className={`m-4 p-3 rounded-md flex items-start ${
          notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {notification.type === 'success' ? (
            <Check size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-medium">{notification.type === 'success' ? 'Succès' : 'Erreur'}</p>
            <p className="text-sm mt-1">{notification.message}</p>
          </div>
        </div>
      )}
      
      {/* Modal d'exportation */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        contractTitle={contractTitle}
        contractId={contractId}
      />
    </div>
  );
};

export default ContractSharePanel;