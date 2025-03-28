import React, { useState, useEffect } from 'react';
import { Edit, Trash2, User, Building2, Search, AlertCircle } from 'lucide-react';
import { getClients, deleteClient } from '../../services/api';

const ClientsList = ({ onEditClient, onSelectClient }) => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const clientsData = await getClients();
      setClients(clientsData || []);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Impossible de charger la liste des clients.');
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (clientId) => {
    setDeleteConfirmation(clientId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;
    
    try {
      await deleteClient(deleteConfirmation);
      setClients(clients.filter(client => client.id !== deleteConfirmation));
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting client:', error);
      setErrorMessage('Impossible de supprimer ce client.');
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleSelect = (client) => {
    if (onSelectClient) {
      onSelectClient(client);
    }
  };

  const filteredClients = searchTerm 
    ? clients.filter(client => 
        (client.type === 'physical_person' && 
          (`${client.prenom} ${client.nom}`.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (client.type === 'legal_entity' && 
          client.nom.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : clients;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Liste des clients</h3>
        <p className="text-sm text-gray-600">
          Gérez vos clients réguliers pour les sélectionner facilement lors de la création de contrats.
        </p>
      </div>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 flex items-start rounded">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}
      
      {/* Barre de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un client..."
          className="pl-10 w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? "Aucun client ne correspond à votre recherche." : "Aucun client n'a été ajouté pour le moment."}
        </div>
      ) : (
        <div>
          {/* Version mobile - affichage en cartes */}
          <div className="md:hidden space-y-3 mt-4">
            {filteredClients.map((client) => (
              <div 
                key={client.id} 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelect(client)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    {client.type === 'physical_person' ? (
                      <User className="h-5 w-5 text-blue-500 mr-2" />
                    ) : (
                      <Building2 className="h-5 w-5 text-indigo-500 mr-2" />
                    )}
                    <div>
                      {client.type === 'physical_person' ? (
                        <div className="font-medium text-gray-900">
                          {client.gentille} {client.prenom} {client.nom}
                        </div>
                      ) : (
                        <div className="font-medium text-gray-900">{client.nom}</div>
                      )}
                      <div className="text-xs text-gray-500">
                        {client.type === 'physical_person' ? 'Personne physique' : `${client.forme_juridique || 'Personne morale'}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClient(client);
                      }}
                      className="text-blue-600 hover:text-blue-900 transition-colors p-1.5 bg-blue-50 rounded-full"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(client.id);
                      }}
                      className="text-red-600 hover:text-red-900 transition-colors p-1.5 bg-red-50 rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500 break-words">
                  {client.type === 'physical_person' ? client.adresse : client.siege}
                </div>
              </div>
            ))}
          </div>
          
          {/* Version desktop - tableau standard */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom / Entité
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coordonnées
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr 
                    key={client.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelect(client)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {client.type === 'physical_person' ? (
                          <User className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Building2 className="h-5 w-5 text-indigo-500" />
                        )}
                        <span className="ml-2 text-sm text-gray-600">
                          {client.type === 'physical_person' ? 'Personne physique' : 'Personne morale'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.type === 'physical_person' ? (
                        <div className="text-sm font-medium text-gray-900">
                          {client.gentille} {client.prenom} {client.nom}
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.nom}</div>
                          <div className="text-xs text-gray-500">{client.forme_juridique}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {client.type === 'physical_person' ? client.adresse : client.siege}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClient(client);
                        }}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(client.id);
                        }}
                        className="text-red-600 hover:text-red-900 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Modal de confirmation de suppression */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action ne peut pas être annulée.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsList; 