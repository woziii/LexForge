import React, { useState, useEffect } from 'react';
import { AUTHOR_TYPES, CIVILITY_OPTIONS } from '../../utils/constants';
import { getClients } from '../../services/api';
import { User, Building2, PlusCircle, CheckCircle, Search } from 'lucide-react';

const Step3AuthorInfo = ({ contractData, updateContractData }) => {
  const [clientsList, setClientsList] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientSelect, setShowClientSelect] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveToClients, setSaveToClients] = useState(false);

  useEffect(() => {
    // Charger la liste des clients si on affiche le sélecteur
    if (showClientSelect) {
      loadClients();
    }
  }, [showClientSelect]);

  const loadClients = async () => {
    try {
      setIsLoadingClients(true);
      const clients = await getClients();
      setClientsList(clients || []);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const handleAuthorTypeChange = (e) => {
    const value = e.target.value;
    
    // Réinitialiser les informations de l'auteur lors du changement de type
    updateContractData({
      auteur_type: value,
      auteur_info: {}
    });
    
    // Réinitialiser les états du composant
    setSelectedClient(null);
    setSaveToClients(false);
  };
  
  const handleAuthorInfoChange = (e) => {
    const { name, value } = e.target;
    
    updateContractData({
      auteur_info: {
        ...contractData.auteur_info,
        [name]: value,
        // Ajouter le flag pour sauvegarder en tant que client si activé
        saveToClients: saveToClients
      }
    });
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setShowClientSelect(false);
    
    // Adapter le type d'auteur en fonction du type de client
    const auteurType = client.type === 'physical_person' ? 'Personne physique' : 'Personne morale';
    
    // Transférer les données du client vers le formulaire d'auteur
    updateContractData({
      auteur_type: auteurType,
      auteur_info: {
        ...client,
        // Adapter la clé gentille/civilite si nécessaire
        gentille: client.gentille || client.civilite || '',
      }
    });
  };

  const toggleClientSelect = () => {
    setShowClientSelect(!showClientSelect);
  };

  const toggleSaveToClients = () => {
    const newValue = !saveToClients;
    setSaveToClients(newValue);
    
    // Mettre à jour le flag dans les données du contrat
    updateContractData({
      auteur_info: {
        ...contractData.auteur_info,
        saveToClients: newValue
      }
    });
  };

  const filteredClients = searchTerm 
    ? clientsList.filter(client => 
        (client.type === 'physical_person' && 
          (`${client.prenom} ${client.nom}`.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (client.type === 'legal_entity' && 
          client.nom.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : clientsList;
  
  const isPhysicalPerson = contractData.auteur_type === "Personne physique";
  
  return (
    <div className="space-y-5">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Informations sur l'auteur/modèle</h2>
      
      {/* Action pour sélectionner un client existant */}
      <div className="mb-6">
        <button
          type="button"
          onClick={toggleClientSelect}
          className="flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <User className="w-4 h-4 mr-2" />
          <span>Sélectionner un client existant</span>
        </button>
        
        {/* Afficher le client sélectionné */}
        {selectedClient && (
          <div className="mt-2 flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700 font-medium">
              {selectedClient.type === 'physical_person' 
                ? `${selectedClient.gentille} ${selectedClient.prenom} ${selectedClient.nom}` 
                : selectedClient.nom}
            </span>
          </div>
        )}
        
        {/* Modal de sélection de client */}
        {showClientSelect && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full p-6 shadow-xl max-h-[90vh] overflow-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sélectionner un client</h3>
              
              {/* Barre de recherche */}
              <div className="relative mb-4">
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
              
              {isLoadingClients ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "Aucun client ne correspond à votre recherche." : "Aucun client n'a été ajouté pour le moment."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {filteredClients.map((client) => (
                    <div 
                      key={client.id} 
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="flex items-center">
                        {client.type === 'physical_person' ? (
                          <User className="h-5 w-5 text-blue-500 mr-2" />
                        ) : (
                          <Building2 className="h-5 w-5 text-indigo-500 mr-2" />
                        )}
                        <div>
                          {client.type === 'physical_person' ? (
                            <div className="font-medium">
                              {client.gentille} {client.prenom} {client.nom}
                            </div>
                          ) : (
                            <>
                              <div className="font-medium">{client.nom}</div>
                              <div className="text-xs text-gray-500">{client.forme_juridique}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowClientSelect(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">Type d'auteur/modèle</h3>
        
        <div className="grid grid-cols-1 gap-2">
          {AUTHOR_TYPES.map((type) => (
            <label 
              key={type} 
              htmlFor={`author-type-${type}`}
              className={`flex items-center p-3 rounded-md border ${
                contractData.auteur_type === type 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              } cursor-pointer transition-colors duration-150 ease-in-out`}
            >
              <input 
                type="radio" 
                id={`author-type-${type}`}
                name="author-type"
                value={type}
                checked={contractData.auteur_type === type}
                onChange={handleAuthorTypeChange}
                className="w-4 h-4 mr-3 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 text-sm sm:text-base flex-1">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100">
        <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-3">
          Informations {isPhysicalPerson ? "personnelles" : "de la société"}
        </h3>
        
        {isPhysicalPerson ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="civility" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Civilité</label>
              <select
                id="civility"
                name="gentille"
                value={contractData.auteur_info.gentille || ""}
                onChange={handleAuthorInfoChange}
                className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Sélectionnez une civilité</option>
                {CIVILITY_OPTIONS.map((civility) => (
                  <option key={civility} value={civility}>{civility}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="lastname" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  id="lastname"
                  name="nom"
                  value={contractData.auteur_info.nom || ""}
                  onChange={handleAuthorInfoChange}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom de famille"
                />
              </div>
              
              <div>
                <label htmlFor="firstname" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  id="firstname"
                  name="prenom"
                  value={contractData.auteur_info.prenom || ""}
                  onChange={handleAuthorInfoChange}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Prénom"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="birthdate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input
                type="date"
                id="birthdate"
                name="date_naissance"
                value={contractData.auteur_info.date_naissance || ""}
                onChange={handleAuthorInfoChange}
                className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="nationality" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nationalité</label>
              <input
                type="text"
                id="nationality"
                name="nationalite"
                value={contractData.auteur_info.nationalite || ""}
                onChange={handleAuthorInfoChange}
                className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Française"
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Adresse complète</label>
              <textarea
                id="address"
                name="adresse"
                value={contractData.auteur_info.adresse || ""}
                onChange={handleAuthorInfoChange}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Numéro, rue, code postal, ville, pays"
              ></textarea>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="company-name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nom de la société</label>
              <input
                type="text"
                id="company-name"
                name="nom"
                value={contractData.auteur_info.nom || ""}
                onChange={handleAuthorInfoChange}
                className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Raison sociale"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="legal-form" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Forme juridique</label>
                <input
                  type="text"
                  id="legal-form"
                  name="forme_juridique"
                  value={contractData.auteur_info.forme_juridique || ""}
                  onChange={handleAuthorInfoChange}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: SARL, SAS, SA, etc."
                />
              </div>
              
              <div>
                <label htmlFor="capital" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Capital social</label>
                <input
                  type="text"
                  id="capital"
                  name="capital"
                  value={contractData.auteur_info.capital || ""}
                  onChange={handleAuthorInfoChange}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 10 000 €"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="rcs" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Numéro RCS</label>
              <input
                type="text"
                id="rcs"
                name="rcs"
                value={contractData.auteur_info.rcs || ""}
                onChange={handleAuthorInfoChange}
                className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 123 456 789 R.C.S. Paris"
              />
            </div>
            
            <div>
              <label htmlFor="company-address" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Siège social</label>
              <textarea
                id="company-address"
                name="siege"
                value={contractData.auteur_info.siege || ""}
                onChange={handleAuthorInfoChange}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Adresse complète du siège social"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="representative" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Représentant légal</label>
                <input
                  type="text"
                  id="representative"
                  name="representant"
                  value={contractData.auteur_info.representant || ""}
                  onChange={handleAuthorInfoChange}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom et prénom du représentant"
                />
              </div>
              
              <div>
                <label htmlFor="representative-title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Qualité du représentant</label>
                <input
                  type="text"
                  id="representative-title"
                  name="qualite_representant"
                  value={contractData.auteur_info.qualite_representant || ""}
                  onChange={handleAuthorInfoChange}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Gérant, Président, etc."
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Option pour sauvegarder dans les clients */}
        <div className="mt-6 flex items-center">
          <input
            type="checkbox"
            id="save-to-clients"
            checked={saveToClients}
            onChange={toggleSaveToClients}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
          />
          <label htmlFor="save-to-clients" className="ml-2 text-sm text-gray-700">
            Ajouter ce contact à mes clients pour de prochains contrats
          </label>
        </div>
      </div>
    </div>
  );
};

export default Step3AuthorInfo; 