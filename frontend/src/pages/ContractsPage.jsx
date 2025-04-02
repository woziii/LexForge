import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Edit, Trash2, Plus, Clock, Calendar, FileUp, FileCheck } from 'lucide-react';
import { getContracts, deleteContract, exportContract } from '../services/api';
import ContractSharePanel from '../components/ContractSharePanel';
import ExportModal from '../components/ExportModal';
import { TutorialLightbulb } from '../components/ui';

const ContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [contractToExport, setContractToExport] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchContracts();
  }, []);
  
  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const data = await getContracts();
      setContracts(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setError('Impossible de récupérer vos contrats. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEdit = (contractId) => {
    navigate(`/editor/${contractId}`);
  };
  
  const handleFinalize = (contractId) => {
    navigate(`/wizard/finalize/${contractId}`);
  };
  
  const confirmDelete = (contract) => {
    setContractToDelete(contract);
    setShowDeleteModal(true);
  };
  
  const handleDelete = async () => {
    if (!contractToDelete) return;
    
    try {
      await deleteContract(contractToDelete.id);
      setContracts(contracts.filter(c => c.id !== contractToDelete.id));
      setShowDeleteModal(false);
      setContractToDelete(null);
    } catch (error) {
      console.error('Error deleting contract:', error);
      setError('Impossible de supprimer le contrat. Veuillez réessayer plus tard.');
    }
  };
  
  const handleImportSuccess = (contractId) => {
    // Rafraîchir la liste des contrats après une importation réussie
    fetchContracts();
    
    // Optionnel: rediriger vers l'éditeur du contrat nouvellement importé
    navigate(`/editor/${contractId}`);
  };
  
  const handleExportClick = (contract, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Mémoriser le contrat à exporter et ouvrir le modal
    setContractToExport(contract);
    setIsExportModalOpen(true);
  };
  
  const handleExport = async (customFilename) => {
    try {
      await exportContract(contractToExport.id, customFilename);
      
      // Fermer le modal
      setIsExportModalOpen(false);
      
      // Notification temporaire de succès
      const notif = document.createElement('div');
      notif.className = 'fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50';
      notif.textContent = 'Contrat exporté avec succès';
      document.body.appendChild(notif);
      setTimeout(() => {
        notif.remove();
      }, 3000);
    } catch (error) {
      console.error('Error exporting contract:', error);
      // Notification temporaire d'erreur
      const notif = document.createElement('div');
      notif.className = 'fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50';
      notif.textContent = 'Erreur lors de l\'exportation';
      document.body.appendChild(notif);
      setTimeout(() => {
        notif.remove();
      }, 3000);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date courte (pour mobile)
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  };
  
  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200">
            <div className="flex items-center mb-4 sm:mb-0">
              <FileText className="text-blue-600 mr-3" size={24} />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Mes Contrats</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link 
                to="/wizard" 
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center sm:justify-start"
              >
                <Plus className="mr-2 -ml-1" size={16} />
                Créer un nouveau contrat
              </Link>
              <TutorialLightbulb context="contracts" id="contracts-tutorial-lightbulb" />
            </div>
          </div>
          
          <div className="hidden sm:block mb-6">
            <div className="p-4" id="contract-import-zone">
              <h3 className="text-base font-medium text-gray-800 mb-3">Importer un contrat</h3>
              <ContractSharePanel 
                variant="import_only" 
                onImportSuccess={handleImportSuccess} 
              />
            </div>
          </div>

          <div className="sm:hidden mb-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4" id="contract-import-zone-mobile">
              <h3 className="text-base font-medium text-gray-800 mb-3">Importer un contrat</h3>
              <ContractSharePanel 
                variant="import_only" 
                onImportSuccess={handleImportSuccess} 
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4 sm:m-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun contrat</h3>
              <p className="mt-1 text-sm text-gray-500 text-center">
                Vous n'avez pas encore créé de contrat. Créez un nouveau contrat ou importez-en un existant.
              </p>
              <div className="mt-6 w-full max-w-md">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/wizard"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="mr-2 -ml-1" size={16} />
                    Créer un contrat
                  </Link>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ou importez un contrat existant:</h4>
                  <ContractSharePanel 
                    variant="import_only"
                    onImportSuccess={handleImportSuccess} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Vue mobile (cartes) */}
              <div className="sm:hidden">
                <div className="px-4 py-2 space-y-3">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <div className="flex items-center mb-3">
                        <FileText className="flex-shrink-0 h-5 w-5 text-blue-500" />
                        <div className="ml-2 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">{contract.title}</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-1 flex items-center">
                        <Calendar size={14} className="mr-1" /> Création: {formatShortDate(contract.created_at)}
                      </div>
                      <div className="text-xs text-gray-500 mb-3 flex items-center">
                        <Clock size={14} className="mr-1" /> Dernière modif.: {formatShortDate(contract.updated_at)}
                      </div>
                      
                      <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => handleEdit(contract.id)}
                          className="flex items-center text-xs text-blue-600 hover:text-blue-900"
                          title="Modifier dans l'éditeur"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                        </button>
                        
                        {contract.from_step6 && (
                          <button
                            onClick={() => handleFinalize(contract.id)}
                            className="flex items-center text-xs text-green-600 hover:text-green-900"
                            title="Finaliser le contrat"
                          >
                            <FileCheck className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => handleExportClick(contract, e)}
                          className="flex items-center text-xs text-indigo-600 hover:text-indigo-800"
                          title="Exporter le contrat"
                        >
                          <FileUp className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => confirmDelete(contract)}
                          className="flex items-center text-xs text-red-600 hover:text-red-900"
                          title="Supprimer le contrat"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Vue desktop (tableau) */}
              <div className="hidden sm:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Titre
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Création
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dernière modification
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {contracts.map((contract) => (
                        <tr key={contract.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FileText className="flex-shrink-0 h-5 w-5 text-blue-500 mr-3" />
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {contract.title}
                                {contract.is_draft && (
                                  <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    Brouillon
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(contract.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(contract.updated_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => handleEdit(contract.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Modifier dans l'éditeur"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              
                              {contract.from_step6 && (
                                <button
                                  onClick={() => handleFinalize(contract.id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Finaliser le contrat"
                                >
                                  <FileCheck className="h-5 w-5" />
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => handleExportClick(contract, e)}
                                className="text-indigo-600 hover:text-indigo-800"
                                title="Exporter le contrat"
                              >
                                <FileUp className="h-5 w-5" />
                              </button>
                              
                              <button
                                onClick={() => confirmDelete(contract)}
                                className="text-red-600 hover:text-red-900"
                                title="Supprimer le contrat"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Supprimer le contrat
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer le contrat "{contractToDelete?.title}" ? Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal d'exportation */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        contractTitle={contractToExport?.title}
        contractId={contractToExport?.id}
      />
    </div>
  );
};

export default ContractsPage;