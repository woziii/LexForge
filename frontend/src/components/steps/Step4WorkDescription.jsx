import React from 'react';
import { FileText, Image, AlertTriangle } from 'lucide-react';

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
    <div className="space-y-5">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Description détaillée</h2>
      
      {needsAuthorRights && (
        <div className="p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <FileText size={16} className="text-blue-600" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-700">Description de l'œuvre</h3>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-600 mb-3 pl-11">
            Décrivez précisément l'œuvre concernée par la cession de droits d'auteur.
            Plus la description sera précise, plus le contrat sera juridiquement solide.
          </p>
          
          <div className="relative mt-1 rounded-md shadow-sm">
            <textarea
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base py-2.5"
              rows="4"
              placeholder="Ex: Série de 10 photographies numériques en couleur représentant des paysages urbains de Paris, prises en juin 2023, format RAW et JPEG, résolution 24 mégapixels."
              value={contractData.description_oeuvre}
              onChange={handleWorkDescriptionChange}
            ></textarea>
          </div>
          
          <div className="mt-2 flex items-start">
            <div className="text-xs text-gray-500 pl-2 flex-1">
              <p>Utilisez des détails comme: format, dimensions, titre, technique, date de création, etc.</p>
              <div className="mt-1 flex items-center">
                <div className="w-1 h-1 bg-blue-400 rounded-full mr-1"></div>
                <span>Soyez précis sur la nature de l'œuvre</span>
              </div>
              <div className="mt-1 flex items-center">
                <div className="w-1 h-1 bg-blue-400 rounded-full mr-1"></div>
                <span>Inclure toutes les caractéristiques techniques</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {needsImageRights && (
        <div className="p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
              <Image size={16} className="text-indigo-600" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-700">Description des images/vidéos</h3>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-600 mb-3 pl-11">
            Décrivez précisément les images ou vidéos concernées par la cession de droits à l'image.
            Indiquez le contexte, la date, le lieu, etc.
          </p>
          
          <div className="relative mt-1 rounded-md shadow-sm">
            <textarea
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base py-2.5"
              rows="4"
              placeholder="Ex: Séance photo réalisée le 15 juin 2023 dans les locaux de l'entreprise XYZ, comprenant 20 portraits individuels et 5 photos de groupe des employés, en tenue professionnelle, sur fond blanc."
              value={contractData.description_image}
              onChange={handleImageDescriptionChange}
            ></textarea>
          </div>
          
          <div className="mt-2 flex items-start">
            <div className="text-xs text-gray-500 pl-2 flex-1">
              <p>Précisez le type d'images, le nombre, la date de prise de vue, le lieu, et l'utilisation prévue.</p>
              <div className="mt-1 flex items-center">
                <div className="w-1 h-1 bg-indigo-400 rounded-full mr-1"></div>
                <span>Indiquez le contexte de la prise de vue</span>
              </div>
              <div className="mt-1 flex items-center">
                <div className="w-1 h-1 bg-indigo-400 rounded-full mr-1"></div>
                <span>Identifiez clairement les personnes concernées</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!needsAuthorRights && !needsImageRights && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md shadow-sm">
          <div className="flex items-start">
            <AlertTriangle size={20} className="text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-700">
                Veuillez retourner à l'étape 1 et sélectionner au moins un type de contrat.
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                La description détaillée du contrat dépend du type de cession choisi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4WorkDescription; 