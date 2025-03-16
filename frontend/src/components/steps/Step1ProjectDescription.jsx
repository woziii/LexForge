import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { analyzeProject } from '../../services/api';

// Importer les constantes depuis un fichier de configuration
const CONTRACT_TYPES = [
  "Auteur (droits d'auteur)",
  "Image (droit à l'image)"
];

const Step1ProjectDescription = ({ contractData, updateContractData }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  
  const handleDescriptionChange = (e) => {
    updateContractData({ description_oeuvre: e.target.value });
  };
  
  const handleContractTypeChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;
    
    let updatedTypes = [...contractData.type_contrat];
    
    if (isChecked) {
      updatedTypes.push(value);
    } else {
      updatedTypes = updatedTypes.filter(type => type !== value);
    }
    
    updateContractData({ type_contrat: updatedTypes });
  };
  
  const handleAnalyzeProject = async () => {
    if (!contractData.description_oeuvre.trim()) {
      setSuggestion("Veuillez d'abord saisir une description de votre projet.");
      return;
    }
    
    try {
      setIsAnalyzing(true);
      const result = await analyzeProject(contractData.description_oeuvre);
      
      if (result.suggestion) {
        setSuggestion(result.suggestion);
        
        // Mettre à jour automatiquement les types de contrat si suggérés
        if (result.contract_types && result.contract_types.length > 0) {
          updateContractData({ type_contrat: result.contract_types });
        }
      }
    } catch (error) {
      setSuggestion("Une erreur est survenue lors de l'analyse. Veuillez sélectionner manuellement le type de contrat.");
      console.error("Error analyzing project:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Décrivez votre projet</h2>
      <p className="text-gray-600 mb-6">
        Décrivez en quelques mots l'œuvre ou le contenu pour lequel vous souhaitez établir un contrat.
        Exemples: "Une chanson que j'ai composée", "Des photos de mannequins", "Un logo pour une entreprise", etc.
      </p>
      
      <div className="mb-6">
        <textarea 
          className="input"
          rows="3"
          placeholder="Ex: Une vidéo où je me filme en train de jouer ma composition au piano"
          value={contractData.description_oeuvre}
          onChange={handleDescriptionChange}
        ></textarea>
      </div>
      
      <button 
        className="btn btn-secondary mb-6"
        onClick={handleAnalyzeProject}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? 'Analyse en cours...' : 'Analyser mon projet'}
      </button>
      
      {suggestion && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Suggestion basée sur votre description</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>{suggestion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Type de contrat nécessaire</h3>
        
        <div className="space-y-3">
          {CONTRACT_TYPES.map((type) => (
            <div key={type} className="flex items-start">
              <input 
                type="checkbox" 
                id={`contract-type-${type}`}
                value={type}
                checked={contractData.type_contrat.includes(type)}
                onChange={handleContractTypeChange}
                className="mt-1 mr-2"
              />
              <label htmlFor={`contract-type-${type}`} className="text-gray-700">{type}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step1ProjectDescription; 