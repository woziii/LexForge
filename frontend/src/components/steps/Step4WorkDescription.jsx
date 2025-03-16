import React from 'react';

const Step4WorkDescription = ({ contractData, updateContractData }) => {
  const handleWorkDescriptionChange = (e) => {
    updateContractData({ description_oeuvre: e.target.value });
  };
  
  const handleImageDescriptionChange = (e) => {
    updateContractData({ description_image: e.target.value });
  };
  
  const needsAuthorRights = contractData.type_contrat.includes("Auteur (droits d'auteur)");
  const needsImageRights = contractData.type_contrat.includes("Image (droit à l'image)");
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Description détaillée</h2>
      
      {needsAuthorRights && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Description de l'œuvre</h3>
          <p className="text-gray-600 mb-4">
            Décrivez précisément l'œuvre concernée par la cession de droits d'auteur.
            Plus la description sera précise, plus le contrat sera juridiquement solide.
          </p>
          
          <textarea
            className="input"
            rows="5"
            placeholder="Ex: Série de 10 photographies numériques en couleur représentant des paysages urbains de Paris, prises en juin 2023, format RAW et JPEG, résolution 24 mégapixels."
            value={contractData.description_oeuvre}
            onChange={handleWorkDescriptionChange}
          ></textarea>
        </div>
      )}
      
      {needsImageRights && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Description des images/vidéos</h3>
          <p className="text-gray-600 mb-4">
            Décrivez précisément les images ou vidéos concernées par la cession de droits à l'image.
            Indiquez le contexte, la date, le lieu, etc.
          </p>
          
          <textarea
            className="input"
            rows="5"
            placeholder="Ex: Séance photo réalisée le 15 juin 2023 dans les locaux de l'entreprise XYZ, comprenant 20 portraits individuels et 5 photos de groupe des employés, en tenue professionnelle, sur fond blanc."
            value={contractData.description_image}
            onChange={handleImageDescriptionChange}
          ></textarea>
        </div>
      )}
      
      {!needsAuthorRights && !needsImageRights && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Veuillez retourner à l'étape 1 et sélectionner au moins un type de contrat.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4WorkDescription; 