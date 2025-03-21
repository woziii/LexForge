import React, { useState, useRef } from 'react';
import { FileDown, UploadCloud, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { exportContract, importContract } from '../services/api';

/**
 * Composant de partage et d'importation de contrats
 * Peut être utilisé dans différentes parties de l'application
 */
const ContractSharePanel = ({ contractId = null, onImportSuccess = null, variant = 'full' }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  // Référence pour la zone de glisser-déposer
  const dropZoneRef = useRef(null);

  // Fonction pour déclencher l'exportation d'un contrat
  const handleExport = async () => {
    if (!contractId) return;
    
    try {
      setIsExporting(true);
      await exportContract(contractId);
      
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
      const response = await importContract(importFile);
      
      // Réinitialiser le fichier sélectionné
      setImportFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Afficher une notification de succès
      setNotification({
        type: 'success',
        message: 'Contrat importé avec succès'
      });
      
      // Appeler la fonction de callback si définie
      if (onImportSuccess && response.id) {
        onImportSuccess(response.id);
      }
    } catch (error) {
      console.error('Error importing contract:', error);
      
      // Afficher une notification d'erreur
      setNotification({
        type: 'error',
        message: error.response?.data?.error || 'Erreur lors de l\'importation du contrat'
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Fonction pour gérer le changement de fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
    }
  };

  // Fonctions pour le glisser-déposer
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current.classList.add('bg-blue-50', 'border-blue-300');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current.classList.remove('bg-blue-50', 'border-blue-300');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current.classList.remove('bg-blue-50', 'border-blue-300');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Vérifier qu'il s'agit bien d'un fichier JSON
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setImportFile(file);
      } else {
        setNotification({
          type: 'error',
          message: 'Veuillez sélectionner un fichier JSON'
        });
      }
    }
  };

  // Rendre une version compacte si variant='compact'
  if (variant === 'compact') {
    return (
      <div className="flex flex-col space-y-3 mb-3">
        {contractId && (
          <button
            onClick={handleExport}
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
                <span>Exporter le contrat</span>
              </>
            )}
          </button>
        )}
        
        <div 
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="p-3 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-300 transition-colors cursor-pointer text-center"
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <UploadCloud size={20} className="mx-auto text-blue-600 mb-2" />
          <p className="text-sm text-center text-gray-500 mb-2">
            {importFile ? importFile.name : "Glissez un fichier JSON ici ou cliquez pour parcourir"}
          </p>
        </div>
        
        {importFile && (
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full flex items-center justify-center py-2 px-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-md transition-colors"
          >
            {isImporting ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-green-500 border-t-transparent rounded-full"></div>
                <span>Importation en cours...</span>
              </div>
            ) : (
              <>
                <ArrowRight size={16} className="mr-2" />
                <span>Importer ce contrat</span>
              </>
            )}
          </button>
        )}
        
        {notification && (
          <div className={`p-2 rounded-md ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} flex items-center`}>
            {notification.type === 'success' ? <Check size={16} className="mr-2" /> : <AlertCircle size={16} className="mr-2" />}
            <span className="text-sm">{notification.message}</span>
          </div>
        )}
      </div>
    );
  }

  // Mode import uniquement
  if (variant === 'import_only') {
    return (
      <div className="flex flex-col space-y-3 mb-3">
        <div 
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="p-3 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-300 transition-colors cursor-pointer text-center"
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <UploadCloud size={20} className="mx-auto text-blue-600 mb-2" />
          <p className="text-sm text-center text-gray-500 mb-2">
            {importFile ? importFile.name : "Glissez un fichier JSON ici ou cliquez pour parcourir"}
          </p>
        </div>
        
        {importFile && (
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full flex items-center justify-center py-2 px-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-md transition-colors"
          >
            {isImporting ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-green-500 border-t-transparent rounded-full"></div>
                <span>Importation en cours...</span>
              </div>
            ) : (
              <>
                <ArrowRight size={16} className="mr-2" />
                <span>Importer ce contrat</span>
              </>
            )}
          </button>
        )}
        
        {notification && (
          <div className={`p-2 rounded-md ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} flex items-center`}>
            {notification.type === 'success' ? <Check size={16} className="mr-2" /> : <AlertCircle size={16} className="mr-2" />}
            <span className="text-sm">{notification.message}</span>
          </div>
        )}
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
              Téléchargez votre contrat actuel pour le partager ou le sauvegarder. Le fichier JSON exporté préserve toutes les données et le formatage.
            </p>
            
            <button
              onClick={handleExport}
              disabled={!contractId || isExporting}
              className={`w-full flex items-center justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-colors ${
                !contractId
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isExporting ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Exportation en cours...</span>
                </div>
              ) : (
                <>
                  <FileDown size={16} className="mr-2 text-indigo-600" />
                  <span>{contractId ? 'Exporter ce contrat' : 'Aucun contrat sélectionné'}</span>
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
              Importez un contrat préalablement exporté au format JSON. Le contrat sera ajouté à votre bibliothèque.
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
    </div>
  );
};

export default ContractSharePanel;