import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import Step6Finalization from '../components/steps/Step6Finalization';
import { accessFinalizationStep } from '../services/api';

const FinalizationPage = () => {
  const { contractId } = useParams();
  const [contractData, setContractData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contractTitle, setContractTitle] = useState('');

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await accessFinalizationStep(contractId);
        
        if (response && response.form_data) {
          setContractData(response.form_data);
          setContractTitle(response.title || 'Contrat sans titre');
        } else {
          setError('Impossible de récupérer les données du contrat.');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setError('Une erreur est survenue lors de la récupération des données du contrat.');
      } finally {
        setIsLoading(false);
      }
    };

    if (contractId) {
      fetchContractData();
    }
  }, [contractId]);

  // Fonction pour mettre à jour les données du contrat (pour Step6Finalization)
  const updateContractData = (newData) => {
    setContractData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <Link 
              to="/contracts" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour à mes contrats
            </Link>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Finalisation du contrat: {contractTitle}
          </h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-600">Chargement des données...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <p className="text-sm text-red-700 mt-2">
                    <Link to="/contracts" className="font-medium underline">
                      Retourner à la liste des contrats
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          ) : contractData ? (
            <Step6Finalization 
              contractData={contractData} 
              updateContractData={updateContractData} 
            />
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm text-yellow-700">
                Aucune donnée trouvée pour ce contrat.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalizationPage; 