import React from 'react';
import { SUPPORTS_OPTIONS, DEFAULT_SUPPORTS } from '../../utils/constants';

const Step5Supports = ({ contractData, updateContractData }) => {
  const handleSupportChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;
    
    let updatedSupports = [...contractData.supports];
    
    if (isChecked) {
      updatedSupports.push(value);
    } else {
      updatedSupports = updatedSupports.filter(support => support !== value);
    }
    
    updateContractData({ supports: updatedSupports });
  };
  
  const handleRemunerationChange = (e) => {
    updateContractData({ remuneration: e.target.value });
  };
  
  const isOnerous = contractData.type_cession === "Onéreuse";
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Supports d'exploitation et rémunération</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Supports d'exploitation</h3>
        <p className="text-gray-600 mb-4">
          Sélectionnez les supports sur lesquels l'œuvre ou l'image pourra être exploitée.
          Le site web et Discord sont inclus par défaut.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Supports inclus par défaut :</strong> {DEFAULT_SUPPORTS.join(', ')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {SUPPORTS_OPTIONS.map((support) => (
            <div key={support} className="flex items-start">
              <input 
                type="checkbox" 
                id={`support-${support.split(' ')[0]}`}
                value={support}
                checked={contractData.supports.includes(support)}
                onChange={handleSupportChange}
                className="mt-1 mr-2"
              />
              <label htmlFor={`support-${support.split(' ')[0]}`} className="text-gray-700">{support}</label>
            </div>
          ))}
        </div>
      </div>
      
      {isOnerous && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Rémunération</h3>
          <p className="text-gray-600 mb-4">
            Précisez les modalités de rémunération pour cette cession onéreuse.
            Indiquez le montant, les conditions de paiement, etc.
          </p>
          
          <textarea
            className="input"
            rows="4"
            placeholder="Ex: La somme forfaitaire de 500 € HT, payable à la signature du contrat par virement bancaire."
            value={contractData.remuneration}
            onChange={handleRemunerationChange}
          ></textarea>
        </div>
      )}
    </div>
  );
};

export default Step5Supports; 