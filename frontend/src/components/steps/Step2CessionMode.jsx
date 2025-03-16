import React from 'react';
import { CESSION_MODES, ADDITIONAL_RIGHTS } from '../../utils/constants';

const Step2CessionMode = ({ contractData, updateContractData }) => {
  const handleCessionModeChange = (e) => {
    const value = e.target.value;
    
    // Si on passe de onéreuse à gratuite, on réinitialise les droits cédés et l'exclusivité
    if (value === "Gratuite") {
      updateContractData({
        type_cession: value,
        droits_cedes: [],
        exclusivite: false
      });
    } else {
      updateContractData({ type_cession: value });
    }
  };
  
  const handleRightChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;
    
    let updatedRights = [...contractData.droits_cedes];
    
    if (isChecked) {
      updatedRights.push(value);
    } else {
      updatedRights = updatedRights.filter(right => right !== value);
    }
    
    updateContractData({ droits_cedes: updatedRights });
  };
  
  const handleExclusivityChange = (e) => {
    updateContractData({ exclusivite: e.target.checked });
  };
  
  const isOnerous = contractData.type_cession === "Onéreuse";
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Mode de cession et droits</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Mode de cession</h3>
        <p className="text-gray-600 mb-4">
          La cession peut se faire à titre gratuit ou onéreux (moyennant rémunération).
          Une cession gratuite limite les droits cédés aux droits de base (reproduction et représentation).
        </p>
        
        <div className="space-y-3">
          {CESSION_MODES.map((mode) => (
            <div key={mode} className="flex items-start">
              <input 
                type="radio" 
                id={`cession-mode-${mode}`}
                name="cession-mode"
                value={mode}
                checked={contractData.type_cession === mode}
                onChange={handleCessionModeChange}
                className="mt-1 mr-2"
              />
              <label htmlFor={`cession-mode-${mode}`} className="text-gray-700">{mode}</label>
            </div>
          ))}
        </div>
      </div>
      
      {isOnerous && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Droits supplémentaires</h3>
            <p className="text-gray-600 mb-4">
              En plus des droits de reproduction et de représentation (inclus par défaut),
              vous pouvez céder des droits supplémentaires.
            </p>
            
            <div className="space-y-3">
              {ADDITIONAL_RIGHTS.map((right) => (
                <div key={right} className="flex items-start">
                  <input 
                    type="checkbox" 
                    id={`right-${right.split(' ')[0]}`}
                    value={right}
                    checked={contractData.droits_cedes.includes(right)}
                    onChange={handleRightChange}
                    className="mt-1 mr-2"
                  />
                  <label htmlFor={`right-${right.split(' ')[0]}`} className="text-gray-700">{right}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Exclusivité</h3>
            <p className="text-gray-600 mb-4">
              L'exclusivité signifie que l'auteur s'engage à ne pas céder les mêmes droits à un tiers.
            </p>
            
            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="exclusivity"
                checked={contractData.exclusivite}
                onChange={handleExclusivityChange}
                className="mt-1 mr-2"
              />
              <label htmlFor="exclusivity" className="text-gray-700">
                Cession exclusive (l'auteur ne pourra pas céder les mêmes droits à un tiers)
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Step2CessionMode; 