import React from 'react';
import { AUTHOR_TYPES, CIVILITY_OPTIONS } from '../../utils/constants';

const Step3AuthorInfo = ({ contractData, updateContractData }) => {
  const handleAuthorTypeChange = (e) => {
    const value = e.target.value;
    
    // Réinitialiser les informations de l'auteur lors du changement de type
    updateContractData({
      auteur_type: value,
      auteur_info: {}
    });
  };
  
  const handleAuthorInfoChange = (e) => {
    const { name, value } = e.target;
    
    updateContractData({
      auteur_info: {
        ...contractData.auteur_info,
        [name]: value
      }
    });
  };
  
  const isPhysicalPerson = contractData.auteur_type === "Personne physique";
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Informations sur l'auteur/modèle</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Type d'auteur/modèle</h3>
        
        <div className="space-y-3">
          {AUTHOR_TYPES.map((type) => (
            <div key={type} className="flex items-start">
              <input 
                type="radio" 
                id={`author-type-${type}`}
                name="author-type"
                value={type}
                checked={contractData.auteur_type === type}
                onChange={handleAuthorTypeChange}
                className="mt-1 mr-2"
              />
              <label htmlFor={`author-type-${type}`} className="text-gray-700">{type}</label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">
          Informations {isPhysicalPerson ? "personnelles" : "de la société"}
        </h3>
        
        {isPhysicalPerson ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="civility" className="block text-sm font-medium text-gray-700 mb-1">Civilité</label>
              <select
                id="civility"
                name="gentille"
                value={contractData.auteur_info.gentille || ""}
                onChange={handleAuthorInfoChange}
                className="input"
              >
                <option value="">Sélectionnez une civilité</option>
                {CIVILITY_OPTIONS.map((civility) => (
                  <option key={civility} value={civility}>{civility}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  id="lastname"
                  name="nom"
                  value={contractData.auteur_info.nom || ""}
                  onChange={handleAuthorInfoChange}
                  className="input"
                  placeholder="Nom de famille"
                />
              </div>
              
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  id="firstname"
                  name="prenom"
                  value={contractData.auteur_info.prenom || ""}
                  onChange={handleAuthorInfoChange}
                  className="input"
                  placeholder="Prénom"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input
                type="date"
                id="birthdate"
                name="date_naissance"
                value={contractData.auteur_info.date_naissance || ""}
                onChange={handleAuthorInfoChange}
                className="input"
              />
            </div>
            
            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
              <input
                type="text"
                id="nationality"
                name="nationalite"
                value={contractData.auteur_info.nationalite || ""}
                onChange={handleAuthorInfoChange}
                className="input"
                placeholder="Ex: Française"
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse complète</label>
              <textarea
                id="address"
                name="adresse"
                value={contractData.auteur_info.adresse || ""}
                onChange={handleAuthorInfoChange}
                className="input"
                rows="3"
                placeholder="Numéro, rue, code postal, ville, pays"
              ></textarea>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">Nom de la société</label>
              <input
                type="text"
                id="company-name"
                name="nom"
                value={contractData.auteur_info.nom || ""}
                onChange={handleAuthorInfoChange}
                className="input"
                placeholder="Raison sociale"
              />
            </div>
            
            <div>
              <label htmlFor="legal-form" className="block text-sm font-medium text-gray-700 mb-1">Forme juridique</label>
              <input
                type="text"
                id="legal-form"
                name="forme_juridique"
                value={contractData.auteur_info.forme_juridique || ""}
                onChange={handleAuthorInfoChange}
                className="input"
                placeholder="Ex: SARL, SAS, SA, etc."
              />
            </div>
            
            <div>
              <label htmlFor="capital" className="block text-sm font-medium text-gray-700 mb-1">Capital social</label>
              <input
                type="text"
                id="capital"
                name="capital"
                value={contractData.auteur_info.capital || ""}
                onChange={handleAuthorInfoChange}
                className="input"
                placeholder="Ex: 10 000 €"
              />
            </div>
            
            <div>
              <label htmlFor="rcs" className="block text-sm font-medium text-gray-700 mb-1">Numéro RCS</label>
              <input
                type="text"
                id="rcs"
                name="rcs"
                value={contractData.auteur_info.rcs || ""}
                onChange={handleAuthorInfoChange}
                className="input"
                placeholder="Ex: 123 456 789 R.C.S. Paris"
              />
            </div>
            
            <div>
              <label htmlFor="company-address" className="block text-sm font-medium text-gray-700 mb-1">Siège social</label>
              <textarea
                id="company-address"
                name="siege"
                value={contractData.auteur_info.siege || ""}
                onChange={handleAuthorInfoChange}
                className="input"
                rows="3"
                placeholder="Adresse complète du siège social"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="representative" className="block text-sm font-medium text-gray-700 mb-1">Représentant légal</label>
              <input
                type="text"
                id="representative"
                name="representant"
                value={contractData.auteur_info.representant || ""}
                onChange={handleAuthorInfoChange}
                className="input"
                placeholder="Nom et prénom du représentant légal"
              />
            </div>
            
            <div>
              <label htmlFor="representative-title" className="block text-sm font-medium text-gray-700 mb-1">Qualité du représentant</label>
              <input
                type="text"
                id="representative-title"
                name="qualite_representant"
                value={contractData.auteur_info.qualite_representant || ""}
                onChange={handleAuthorInfoChange}
                className="input"
                placeholder="Ex: Gérant, Président, Directeur Général, etc."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step3AuthorInfo; 