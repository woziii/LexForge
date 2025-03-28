import React, { useState, useEffect } from 'react';
import { CLIENT_TYPES, CIVILITY_OPTIONS } from '../../utils/constants';
import { saveClient, updateClient } from '../../services/api';
import { User, Building2, Save, AlertCircle, CheckCircle } from 'lucide-react';

const ClientForm = ({ client, onSaved, onCancel }) => {
  const [isPhysicalPerson, setIsPhysicalPerson] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [clientData, setClientData] = useState({
    type: 'physical_person',
    gentille: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    nationalite: '',
    adresse: '',
    forme_juridique: '',
    capital: '',
    rcs: '',
    siege: '',
    representant: '',
    qualite_representant: '',
  });

  useEffect(() => {
    if (client) {
      setClientData(client);
      setIsPhysicalPerson(client.type === 'physical_person');
    }
  }, [client]);

  const handleClientTypeChange = (type) => {
    setIsPhysicalPerson(type === 'physical_person');
    setClientData(prevData => ({
      ...prevData,
      type
    }));
  };

  const handleInputChange = (field, value) => {
    setClientData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validation de base
    if (isPhysicalPerson) {
      if (!clientData.gentille || !clientData.nom || !clientData.prenom) {
        setErrorMessage('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      // S'assurer que le type est bien défini
      clientData.type = 'physical_person';
    } else {
      if (!clientData.nom || !clientData.forme_juridique) {
        setErrorMessage('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      // S'assurer que le type est bien défini
      clientData.type = 'legal_entity';
    }

    try {
      setIsSaving(true);
      
      if (client && client.id) {
        // Mise à jour d'un client existant
        await updateClient(client.id, clientData);
        setSuccessMessage('Client mis à jour avec succès.');
      } else {
        // Création d'un nouveau client
        await saveClient(clientData);
        setSuccessMessage('Client ajouté avec succès.');
      }
      
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error('Error saving client:', error);
      setErrorMessage('Une erreur est survenue lors de l\'enregistrement du client.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        {client && client.id ? 'Modifier un client' : 'Ajouter un client'}
      </h3>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 flex items-start rounded">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 text-green-700 flex items-start rounded">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{successMessage}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Type de client */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Type de client</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CLIENT_TYPES.map((type, index) => (
              <label 
                key={type} 
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  (isPhysicalPerson && index === 0) || (!isPhysicalPerson && index === 1)
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <input 
                  type="radio" 
                  className="sr-only" 
                  checked={(isPhysicalPerson && index === 0) || (!isPhysicalPerson && index === 1)}
                  onChange={() => handleClientTypeChange(index === 0 ? 'physical_person' : 'legal_entity')}
                />
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mr-3">
                  {index === 0 ? <User size={20} /> : <Building2 size={20} />}
                </span>
                <div className="flex-1">
                  <span className="block font-medium text-gray-900">{type}</span>
                  <span className="block text-sm text-gray-500">
                    {index === 0 
                      ? 'Individu, artiste, freelance...' 
                      : 'Entreprise, association...'}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        {/* Formulaire pour personne physique */}
        {isPhysicalPerson ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="civility" className="block text-sm font-medium text-gray-700 mb-1">Civilité <span className="text-red-500">*</span></label>
              <select
                id="civility"
                value={clientData.gentille || ""}
                onChange={(e) => handleInputChange('gentille', e.target.value)}
                className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="">Sélectionnez une civilité</option>
                {CIVILITY_OPTIONS.map((civility) => (
                  <option key={civility} value={civility}>{civility}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="lastname"
                  value={clientData.nom || ""}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom de famille"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="firstname"
                  value={clientData.prenom || ""}
                  onChange={(e) => handleInputChange('prenom', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Prénom"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input
                type="date"
                id="birthdate"
                value={clientData.date_naissance || ""}
                onChange={(e) => handleInputChange('date_naissance', e.target.value)}
                className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
              <input
                type="text"
                id="nationality"
                value={clientData.nationalite || ""}
                onChange={(e) => handleInputChange('nationalite', e.target.value)}
                className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Française"
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse complète</label>
              <textarea
                id="address"
                value={clientData.adresse || ""}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Numéro, rue, code postal, ville, pays"
              ></textarea>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">Nom de la société <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="company-name"
                value={clientData.nom || ""}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Raison sociale"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="legal-form" className="block text-sm font-medium text-gray-700 mb-1">Forme juridique <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="legal-form"
                  value={clientData.forme_juridique || ""}
                  onChange={(e) => handleInputChange('forme_juridique', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: SARL, SAS, SA, etc."
                  required
                />
              </div>
              
              <div>
                <label htmlFor="capital" className="block text-sm font-medium text-gray-700 mb-1">Capital social</label>
                <input
                  type="text"
                  id="capital"
                  value={clientData.capital || ""}
                  onChange={(e) => handleInputChange('capital', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 10 000 €"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="rcs" className="block text-sm font-medium text-gray-700 mb-1">Numéro RCS</label>
              <input
                type="text"
                id="rcs"
                value={clientData.rcs || ""}
                onChange={(e) => handleInputChange('rcs', e.target.value)}
                className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 123 456 789 R.C.S. Paris"
              />
            </div>
            
            <div>
              <label htmlFor="company-address" className="block text-sm font-medium text-gray-700 mb-1">Siège social</label>
              <textarea
                id="company-address"
                value={clientData.siege || ""}
                onChange={(e) => handleInputChange('siege', e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Adresse complète du siège social"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="representative" className="block text-sm font-medium text-gray-700 mb-1">Représentant légal</label>
                <input
                  type="text"
                  id="representative"
                  value={clientData.representant || ""}
                  onChange={(e) => handleInputChange('representant', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom et prénom du représentant"
                />
              </div>
              
              <div>
                <label htmlFor="representative-title" className="block text-sm font-medium text-gray-700 mb-1">Qualité du représentant</label>
                <input
                  type="text"
                  id="representative-title"
                  value={clientData.qualite_representant || ""}
                  onChange={(e) => handleInputChange('qualite_representant', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Gérant, Président, etc."
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
              isSaving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm; 