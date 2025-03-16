import axios from 'axios';

// Déterminer l'URL de l'API en fonction de l'environnement
const API_URL = process.env.REACT_APP_API_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? '/api' 
                  : 'http://localhost:5001/api');

console.log('Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Corriger l'avertissement ESLint en créant une variable pour l'export par défaut
const apiService = {
  analyzeProject,
  previewContract,
  generatePdf,
};

export default apiService; 