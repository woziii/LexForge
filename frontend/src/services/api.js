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

// Fonction pour récupérer l'ID utilisateur actuel
export const getCurrentUserId = () => {
  // Si l'utilisateur est connecté avec Clerk, récupérer son ID depuis le localStorage
  let userId = localStorage.getItem('clerkUserId');
  
  // Si nous avons un ID Clerk stocké, le retourner
  if (userId && !userId.startsWith('anon_')) {
    return userId;
  }
  
  // Vérifier si l'objet window.Clerk est disponible (utilisateur connecté)
  try {
    if (window.Clerk && window.Clerk.user) {
      const clerkId = window.Clerk.user.id;
      // Stocker l'ID Clerk dans localStorage pour référence future
      localStorage.setItem('clerkUserId', clerkId);
      return clerkId;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID utilisateur depuis Clerk:', error);
  }
  
  // Pour les utilisateurs non authentifiés, priorité à sessionStorage, puis fallback sur localStorage
  // pour assurer la compatibilité avec les données existantes
  let anonymousId = sessionStorage.getItem('anonymousUserId');
  
  // Si on n'a pas d'ID en sessionStorage, vérifier en localStorage (pour rétrocompatibilité)
  if (!anonymousId) {
    anonymousId = localStorage.getItem('anonymousUserId');
    
    // Si on a trouvé un ID en localStorage, le copier en sessionStorage et le garder en localStorage
    // pour cette session uniquement (compatibilité avec données existantes)
    if (anonymousId) {
      sessionStorage.setItem('anonymousUserId', anonymousId);
      console.log('ID anonyme migré de localStorage vers sessionStorage');
    } else {
      // Générer un nouvel ID si aucun n'existe
      anonymousId = 'anon_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
      sessionStorage.setItem('anonymousUserId', anonymousId);
      // On ne stocke plus dans localStorage pour les nouveaux utilisateurs
    }
  }
  
  return anonymousId;
};

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
    // Ajouter l'ID utilisateur aux données du contrat
    const dataWithUserId = {
      ...contractData,
      user_id: getCurrentUserId()
    };
    
    console.log('Sending preview request with data:', JSON.stringify(dataWithUserId));
    const response = await api.post('/preview', dataWithUserId);
    console.log('Preview response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error previewing contract:', error);
    throw error;
  }
};

export const generatePdf = async (contractData, filename) => {
  try {
    // Ajouter l'ID utilisateur
    const userId = getCurrentUserId();
    
    const response = await api.post('/generate-pdf', {
      contractData,
      filename,
      user_id: userId
    }, {
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

export const saveContract = async (contractData, title, id = null, isDraft = false, fromStep6 = false) => {
  try {
    const userId = getCurrentUserId();
    const response = await api.post('/contracts', { 
      contractData, 
      title, 
      id,
      isDraft,
      fromStep6,
      user_id: userId
    });
    return response.data;
  } catch (error) {
    console.error('Error saving contract:', error);
    throw error;
  }
};

export const getContracts = async () => {
  try {
    const userId = getCurrentUserId();
    const response = await api.get('/contracts', {
      params: { user_id: userId }
    });
    return response.data.contracts;
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }
};

export const getContractById = async (contractId) => {
  try {
    const userId = getCurrentUserId();
    const response = await api.get(`/contracts/${contractId}`, {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching contract:', error);
    throw error;
  }
};

export const getContractElements = async (contractId) => {
  try {
    const userId = getCurrentUserId();
    const response = await api.get(`/contracts/${contractId}/elements`, {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching contract elements:', error);
    throw error;
  }
};

export const updateContract = async (contractId, updates) => {
  try {
    const userId = getCurrentUserId();
    const response = await api.put(`/contracts/${contractId}`, {
      ...updates,
      user_id: userId
    });
    return response.data;
  } catch (error) {
    console.error('Error updating contract:', error);
    throw error;
  }
};

export const deleteContract = async (contractId) => {
  try {
    const userId = getCurrentUserId();
    const response = await api.delete(`/contracts/${contractId}`, {
      params: { user_id: userId }
    });
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
    
    // Ajouter l'ID utilisateur
    const userId = getCurrentUserId();
    formData.append('user_id', userId);
    
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

export const getUserProfile = async () => {
  try {
    const userId = getCurrentUserId();
    
    // Pour les utilisateurs non authentifiés, vérifier d'abord si nous avons des données en sessionStorage
    if (userId.startsWith('anon_')) {
      // Essayer de récupérer depuis sessionStorage d'abord
      const tempData = sessionStorage.getItem('tempDashboardData');
      if (tempData) {
        try {
          const parsedData = JSON.parse(tempData);
          console.log('Profil temporaire chargé depuis sessionStorage');
          return parsedData;
        } catch (error) {
          console.error('Erreur de parsing des données temporaires:', error);
          // Continuer avec l'appel API si le parsing échoue
        }
      }
    }
    
    // Si aucune donnée temporaire n'est trouvée ou pour les utilisateurs authentifiés
    const response = await api.get('/user-profile', {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const userId = getCurrentUserId();
    const response = await api.post('/user-profile', {
      ...profileData,
      user_id: userId
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Fonctions pour la gestion des clients
export const getClients = async () => {
  try {
    // Récupérer les clients depuis le profil utilisateur
    const profileData = await getUserProfile();
    return profileData.clients || [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

export const saveClient = async (clientData) => {
  try {
    // Récupérer le profil complet
    const profileData = await getUserProfile();
    
    // S'assurer que la propriété clients existe
    if (!profileData.clients) {
      profileData.clients = [];
    }
    
    // Générer un ID pour le nouveau client
    const newClient = {
      ...clientData,
      id: Date.now().toString()
    };
    
    // Ajouter le client à la liste
    profileData.clients.push(newClient);
    
    // Mettre à jour le profil complet
    await updateUserProfile(profileData);
    
    return newClient;
  } catch (error) {
    console.error('Error saving client:', error);
    throw error;
  }
};

export const updateClient = async (clientId, clientData) => {
  try {
    // Récupérer le profil complet
    const profileData = await getUserProfile();
    
    // S'assurer que la propriété clients existe
    if (!profileData.clients || !profileData.clients.length) {
      throw new Error('Client not found');
    }
    
    // Trouver l'index du client à mettre à jour
    const clientIndex = profileData.clients.findIndex(client => client.id === clientId);
    
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }
    
    // Mettre à jour le client
    profileData.clients[clientIndex] = {
      ...profileData.clients[clientIndex],
      ...clientData,
      id: clientId // Conserver l'ID original
    };
    
    // Mettre à jour le profil complet
    await updateUserProfile(profileData);
    
    return profileData.clients[clientIndex];
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

export const deleteClient = async (clientId) => {
  try {
    // Récupérer le profil complet
    const profileData = await getUserProfile();
    
    // S'assurer que la propriété clients existe
    if (!profileData.clients || !profileData.clients.length) {
      throw new Error('Client not found');
    }
    
    // Filtrer le client à supprimer
    profileData.clients = profileData.clients.filter(client => client.id !== clientId);
    
    // Mettre à jour le profil complet
    await updateUserProfile(profileData);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

export const accessFinalizationStep = async (contractId) => {
  try {
    const response = await api.get(`/contracts/${contractId}/finalize`);
    return response.data;
  } catch (error) {
    console.error('Error accessing finalization step:', error);
    throw error;
  }
};

/**
 * Fonction pour migrer les données d'un utilisateur anonyme vers un compte authentifié
 * À appeler lorsqu'un utilisateur s'authentifie après avoir utilisé l'application en anonyme
 */
export const migrateAnonymousUserData = async (newUserId) => {
  try {
    // Récupérer l'ID anonyme de l'utilisateur avant qu'il ne se connecte
    const anonymousId = localStorage.getItem('anonymousUserId');
    
    if (!anonymousId) {
      console.log('Aucun ID anonyme trouvé, rien à migrer.');
      return { success: false, message: 'Aucune donnée anonyme à migrer' };
    }
    
    // Envoyer une requête pour migrer les données
    const response = await api.post('/migrate-user-data', {
      anonymous_id: anonymousId,
      authenticated_id: newUserId
    });
    
    // Si la migration réussit, supprimer l'ID anonyme
    if (response.data.success) {
      localStorage.removeItem('anonymousUserId');
      console.log('Migration des données réussie, ID anonyme supprimé.');
    }
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la migration des données:', error);
    return { success: false, error: error.message };
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
  getUserProfile,
  updateUserProfile,
  testCors,
  getClients,
  saveClient,
  updateClient,
  deleteClient,
  accessFinalizationStep,
  migrateAnonymousUserData
};

export default apiService;