import axios from 'axios';

// Déterminer l'URL de l'API en fonction de l'environnement
const API_URL = process.env.REACT_APP_API_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://lexforge-backend.onrender.com/api' 
                  : 'http://localhost:5001/api');

console.log('Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Désactiver withCredentials pour tester si c'est la source du problème
  withCredentials: false,
});

export const analyzeProject = async (description) => {
  try {
    const response = await api.post('/analyze', { description });
    return response.data;
  } catch (error) {
    console.error('Error analyzing project:', error);
    throw error;
  }
};

export const previewContract = async (contractData) => {
  try {
    const response = await api.post('/preview', contractData);
    return response.data;
  } catch (error) {
    console.error('Error previewing contract:', error);
    throw error;
  }
};

export const generatePdf = async (contractData, filename) => {
  try {
    const response = await api.post('/generate-pdf', { contractData, filename }, {
      responseType: 'blob',
    });
    
    // Créer un URL pour le blob et déclencher le téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename || 'contrat'}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Nouvelles fonctions pour la gestion des contrats

export const saveContract = async (contractData, title, id = null) => {
  try {
    const response = await api.post('/contracts', { contractData, title, id });
    return response.data;
  } catch (error) {
    console.error('Error saving contract:', error);
    throw error;
  }
};

export const getContracts = async () => {
  try {
    const response = await api.get('/contracts');
    return response.data.contracts;
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }
};

export const getContractById = async (contractId) => {
  try {
    const response = await api.get(`/contracts/${contractId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contract:', error);
    throw error;
  }
};

export const getContractElements = async (contractId) => {
  try {
    const response = await api.get(`/contracts/${contractId}/elements`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contract elements:', error);
    throw error;
  }
};

export const updateContract = async (contractId, updates) => {
  try {
    const response = await api.put(`/contracts/${contractId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating contract:', error);
    throw error;
  }
};

export const deleteContract = async (contractId) => {
  try {
    const response = await api.delete(`/contracts/${contractId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting contract:', error);
    throw error;
  }
};

export const exportContract = async (contractId, filename = null) => {
  try {
    const response = await api.get(`/contracts/export/${contractId}`, {
      responseType: 'blob',
    });
    
    // Créer un URL pour le blob et déclencher le téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Utiliser le nom de fichier personnalisé s'il est fourni, sinon utiliser le nom par défaut
    const downloadFilename = filename || `lexforge_contract_${contractId}`;
    // S'assurer que le nom se termine par .json
    const finalFilename = downloadFilename.endsWith('.json') 
      ? downloadFilename 
      : `${downloadFilename}.json`;
      
    link.setAttribute('download', finalFilename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  } catch (error) {
    console.error('Error exporting contract:', error);
    throw error;
  }
};

export const importContract = async (file) => {
  try {
    // Créer un FormData pour envoyer le fichier
    const formData = new FormData();
    formData.append('file', file);
    
    // Configuration spécifique pour envoyer un fichier
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await api.post('/contracts/import', formData, config);
    return response.data;
  } catch (error) {
    console.error('Error importing contract:', error);
    throw error;
  }
};

export const testCors = async () => {
  try {
    console.log('Testing CORS with API URL:', API_URL);
    const response = await axios.get(`${API_URL}/cors-test`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
    });
    console.log('CORS test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('CORS test failed:', error);
    throw error;
  }
};

// Corriger l'avertissement ESLint en créant une variable pour l'export par défaut
const apiService = {
  analyzeProject,
  previewContract,
  generatePdf,
  saveContract,
  getContracts,
  getContractById,
  getContractElements,
  updateContract,
  deleteContract,
  exportContract,
  importContract,
  testCors
};

export default apiService;