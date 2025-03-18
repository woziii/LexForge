import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Edit, Trash2, Plus, Clock, Calendar } from 'lucide-react';
import { getContracts, deleteContract } from '../services/api';

const ContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  
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
            <Link 
              to="/wizard" 
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center sm:justify-start"
            >
              <Plus className="mr-2 -ml-1" size={16} />
              Créer un nouveau contrat
            </Link>
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
                Vous n'avez pas encore créé de contrat. Commencez par en créer un.
              </p>
              <div className="mt-6">
                <Link
                  to="/wizard"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="mr-2 -ml-1" size={16} />
                  Créer un contrat
                </Link>
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
                        >
                          <Edit className="h-4 w-4 mr-1" /> Éditer
                        </button>
                        <button
                          onClick={() => confirmDelete(contract)}
                          className="flex items-center text-xs text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Vue desktop (tableau) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titre
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de création
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernière modification
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="flex-shrink-0 h-5 w-5 text-gray-400" />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{contract.title}</div>
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
                          <button
                            onClick={() => handleEdit(contract.id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <Edit className="inline h-5 w-5 mr-1" /> Éditer
                          </button>
                          <button
                            onClick={() => confirmDelete(contract)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="inline h-5 w-5 mr-1" /> Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
    </div>
  );
};

export default ContractsPage;