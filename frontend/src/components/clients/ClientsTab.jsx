import React, { useState } from 'react';
import { UserPlus, Users, RefreshCw } from 'lucide-react';
import ClientsList from './ClientsList';
import ClientForm from './ClientForm';

const ClientsTab = () => {
  const [view, setView] = useState('list'); // 'list', 'add', 'edit'
  const [selectedClient, setSelectedClient] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddClick = () => {
    setSelectedClient(null);
    setView('add');
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setView('edit');
  };

  const handleClientSaved = () => {
    // Attendre un peu pour s'assurer que le backend a bien enregistré
    setTimeout(() => {
      setRefreshKey(prevKey => prevKey + 1);
      setView('list');
    }, 500);
  };

  const handleCancelForm = () => {
    setView('list');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Mes clients</h2>
          <p className="text-gray-600 text-sm mt-1">
            Gérez votre carnet d'adresses pour faciliter la création de contrats
          </p>
        </div>

        {view === 'list' ? (
          <div className="flex space-x-2">
            <button
              onClick={() => setRefreshKey(prevKey => prevKey + 1)}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={16} className="mr-1" />
              <span>Actualiser</span>
            </button>
            <button
              onClick={handleAddClick}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={16} className="mr-1" />
              <span>Ajouter un client</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center text-sm text-blue-600">
            <Users size={16} className="mr-1" />
            <span>Gestion des clients</span>
          </div>
        )}
      </div>

      {view === 'list' && (
        <ClientsList 
          key={refreshKey}
          onEditClient={handleEditClient}
        />
      )}

      {(view === 'add' || view === 'edit') && (
        <ClientForm
          client={selectedClient}
          onSaved={handleClientSaved}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
};

export default ClientsTab; 