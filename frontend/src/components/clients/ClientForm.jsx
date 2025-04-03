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
    lieu_naissance: '',
    nationalite: '',
    adresse: '',
    code_postal: '',
    ville: '',
    forme_juridique: '',
    capital: '',
    siren: '',
    rcs_ville: '',
    representant_civilite: 'M.',
    representant_nom: '',
    representant_prenom: '',
    qualite_representant: '',
  });

  useEffect(() => {
    if (client) {
      // Convertir les anciennes données vers le nouveau format si nécessaire
      const updatedData = { ...client };
      
      // Pour la personne morale, convertir les anciens champs
      if (client.type === 'legal_entity') {
        if (client.representant && !client.representant_nom) {
          updatedData.representant_nom = client.representant;
        }
        if (client.rcs && !client.siren) {
          updatedData.siren = client.rcs;
        }
        if (client.siege) {
          // Tenter de diviser l'adresse complète si elle existe
          if (!client.adresse) {
            const parts = client.siege.split(',');
            if (parts.length > 0) updatedData.adresse = parts[0].trim();
            if (parts.length > 1) {
              const cityParts = parts[1].trim().split(' ');
              if (cityParts.length > 0 && /^\d+$/.test(cityParts[0])) {
                updatedData.code_postal = cityParts[0];
                updatedData.ville = cityParts.slice(1).join(' ');
              } else {
                updatedData.ville = parts[1].trim();
              }
            }
          }
        }
      }
      
      setClientData(updatedData);
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label htmlFor="birthplace" className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
                <input
                  type="text"
                  id="birthplace"
                  value={clientData.lieu_naissance || ""}
                  onChange={(e) => handleInputChange('lieu_naissance', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Paris"
                />
              </div>
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
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                type="text"
                id="address"
                value={clientData.adresse || ""}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Numéro et rue"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                <input
                  type="text"
                  id="postalCode"
                  value={clientData.code_postal || ""}
                  onChange={(e) => handleInputChange('code_postal', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 75001"
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  id="city"
                  value={clientData.ville || ""}
                  onChange={(e) => handleInputChange('ville', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Paris"
                />
              </div>
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
                  placeholder="Ex: SAS, SARL, etc."
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
                  placeholder="Ex: 1000 €"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="siren" className="block text-sm font-medium text-gray-700 mb-1">SIREN/SIRET</label>
                <input
                  type="text"
                  id="siren"
                  value={clientData.siren || ""}
                  onChange={(e) => handleInputChange('siren', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 123456789"
                />
              </div>
              
              <div>
                <label htmlFor="rcs-city" className="block text-sm font-medium text-gray-700 mb-1">Ville du RCS</label>
                <input
                  type="text"
                  id="rcs-city"
                  value={clientData.rcs_ville || ""}
                  onChange={(e) => handleInputChange('rcs_ville', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Paris"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="address-company" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                type="text"
                id="address-company"
                value={clientData.adresse || ""}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Numéro et rue"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="postal-code-company" className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                <input
                  type="text"
                  id="postal-code-company"
                  value={clientData.code_postal || ""}
                  onChange={(e) => handleInputChange('code_postal', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 75001"
                />
              </div>
              
              <div>
                <label htmlFor="city-company" className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  id="city-company"
                  value={clientData.ville || ""}
                  onChange={(e) => handleInputChange('ville', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Paris"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Représentant légal</label>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="rep-civility" className="block text-sm font-medium text-gray-700 mb-1">Civilité</label>
                  <select
                    id="rep-civility"
                    value={clientData.representant_civilite || "M."}
                    onChange={(e) => handleInputChange('representant_civilite', e.target.value)}
                    className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {CIVILITY_OPTIONS.map((civility) => (
                      <option key={civility} value={civility}>{civility}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="rep-lastname" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      id="rep-lastname"
                      value={clientData.representant_nom || ""}
                      onChange={(e) => handleInputChange('representant_nom', e.target.value)}
                      className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nom du représentant"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="rep-firstname" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      id="rep-firstname"
                      value={clientData.representant_prenom || ""}
                      onChange={(e) => handleInputChange('representant_prenom', e.target.value)}
                      className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Prénom du représentant"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="rep-quality" className="block text-sm font-medium text-gray-700 mb-1">Qualité</label>
                  <input
                    type="text"
                    id="rep-quality"
                    value={clientData.qualite_representant || ""}
                    onChange={(e) => handleInputChange('qualite_representant', e.target.value)}
                    className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Directeur Général, Gérant..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={isSaving}
          >
            Annuler
          </button>
          
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm; 