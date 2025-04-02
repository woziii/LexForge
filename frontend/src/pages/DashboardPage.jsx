import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Building2, User, Save, AlertCircle, Check, HelpCircle, Briefcase, Shield, Users, RotateCcw } from 'lucide-react';
import { getUserProfile, updateUserProfile, getCurrentUserId } from '../services/api';
import { AUTHOR_TYPES, CIVILITY_OPTIONS } from '../utils/constants';
import { clearTempBusinessInfo } from '../utils/clearTempData';
import ClientsTab from '../components/clients/ClientsTab';

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const initialProfileData = {
    physical_person: {
      is_configured: false,
      gentille: '',
      nom: '',
      prenom: '',
      date_naissance: '',
      nationalite: '',
      adresse: '',
      code_postal: '',
      ville: '',
      email: '',
      telephone: ''
    },
    legal_entity: {
      is_configured: false,
      nom: '',
      forme_juridique: '',
      capital: '',
      siren: '',
      siege: '',
      adresse: '',
      code_postal: '',
      ville: '',
      email: '',
      telephone: '',
      representant: '',
      qualite_representant: '',
    },
    selected_entity_type: '', // 'physical_person' ou 'legal_entity'
    clients: [], // Tableau de clients
    user_id: getCurrentUserId() // Inclure l'ID utilisateur
  };
  const [profileData, setProfileData] = useState(initialProfileData);

  // Récupérer le paramètre de redirection
  const redirectTo = new URLSearchParams(location.search).get('redirectTo') || '';
  const [currentUserId, setCurrentUserId] = useState(getCurrentUserId());

  useEffect(() => {
    // Si l'utilisateur n'est pas authentifié, vérifier s'il y a des données temporaires en sessionStorage
    if (authLoaded && !isSignedIn) {
      const tempData = sessionStorage.getItem('tempDashboardData');
      if (tempData) {
        try {
          // Charger les données temporaires
          const parsedData = JSON.parse(tempData);
          console.log('Données temporaires chargées depuis sessionStorage');
          setProfileData({
            ...parsedData,
            user_id: getCurrentUserId()
          });
        } catch (error) {
          console.error('Erreur lors du chargement des données temporaires:', error);
        }
      }
    }
  }, [authLoaded, isSignedIn]);

  // Effet pour gérer les changements d'authentification
  useEffect(() => {
    // Surveiller les changements d'ID utilisateur (connexion/déconnexion)
    const checkUserId = () => {
      const newId = getCurrentUserId();
      if (newId !== currentUserId) {
        console.log('ID utilisateur modifié, rechargement du profil...');
        setCurrentUserId(newId);
        
        // Si le nouvel ID est anonyme, réinitialiser le profil et effacer les données temporaires
        if (newId.startsWith('anon_')) {
          console.log('Utilisateur non authentifié détecté, réinitialisation du profil');
          sessionStorage.removeItem('tempDashboardData');
          setProfileData({
            ...initialProfileData,
            user_id: newId
          });
        } else {
          // Pour un utilisateur authentifié, charger son profil depuis le serveur
          loadProfile(newId);
        }
      }
    };
    
    // Vérifier périodiquement l'ID utilisateur
    const interval = setInterval(checkUserId, 1000);
    
    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(interval);
  }, [currentUserId]);

  useEffect(() => {
    // Charger les données du profil utilisateur
    const initializeProfile = async () => {
      if (authLoaded) {
        if (isSignedIn) {
          // Utilisateur authentifié: charger depuis le backend
          await loadProfile(currentUserId);
        } else {
          // Utilisateur non authentifié: vérifier si déjà des données en session
          if (!sessionStorage.getItem('tempDashboardData')) {
            // Si pas de données en session, initialiser avec les valeurs par défaut
            setProfileData({
              ...initialProfileData,
              user_id: currentUserId
            });
          }
        }
      }
    };
    
    initializeProfile();
  }, [authLoaded, isSignedIn]);

  // Fonction de chargement du profil extraite pour pouvoir être appelée plusieurs fois
  const loadProfile = async (userId) => {
    try {
      setIsLoading(true);
      // Charger le profil depuis le backend uniquement pour les utilisateurs authentifiés
      if (!userId.startsWith('anon_')) {
        const data = await getUserProfile();
        // S'assurer que l'ID utilisateur est toujours inclus
        setProfileData({
          ...data,
          user_id: userId
        });
      }
    } catch (error) {
      setErrorMessage('Impossible de charger votre profil. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Formater l'adresse complète pour la prévisualisation
  const formatAddress = (data) => {
    const parts = [];
    
    if (data.adresse) {
      parts.push(data.adresse);
    }
    
    let cityPart = '';
    if (data.code_postal) cityPart += data.code_postal;
    if (data.ville) {
      if (cityPart) cityPart += ' ';
      cityPart += data.ville;
    }
    
    if (cityPart) parts.push(cityPart);
    
    return parts.length > 0 ? parts.join(', ') : '';
  };

  const handleInputChange = (entityType, field, value) => {
    setProfileData(prevData => ({
      ...prevData,
      [entityType]: {
        ...prevData[entityType],
        [field]: value
      }
    }));
  };

  const handleEntityTypeSelect = (type) => {
    setProfileData(prevData => ({
      ...prevData,
      selected_entity_type: type
    }));
  };

  // Formatage des données pour la prévisualisation
  const formatBusinessDataForStorage = (entityType, entityData) => {
    // Formater l'adresse complète
    const adresseComplete = formatAddress(entityData);
    
    if (entityType === 'physical_person') {
      return {
        type: 'physical_person',
        gentille: entityData.gentille || '',
        nom: entityData.nom || '',
        prenom: entityData.prenom || '',
        adresse: entityData.adresse || '',
        code_postal: entityData.code_postal || '',
        ville: entityData.ville || '',
        email: entityData.email || '',
        telephone: entityData.telephone || '',
        siege: adresseComplete,
        capital: '',
        forme_juridique: 'Entreprise individuelle'
      };
    } else {
      return {
        type: 'legal_entity',
        nom: entityData.nom || '',
        forme_juridique: entityData.forme_juridique || '',
        siren: entityData.siren || '',
        adresse: entityData.adresse || '',
        code_postal: entityData.code_postal || '',
        ville: entityData.ville || '',
        email: entityData.email || '',
        telephone: entityData.telephone || '',
        siege: adresseComplete,
        capital: entityData.capital || '1000 €'
      };
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setErrorMessage('');
      
      // Vérifier les données obligatoires selon le type d'entité
      if (profileData.selected_entity_type === 'physical_person') {
        if (!profileData.physical_person.gentille || !profileData.physical_person.nom || !profileData.physical_person.prenom) {
          setErrorMessage('Veuillez remplir tous les champs obligatoires.');
          setIsSaving(false);
          return;
        }
        
        // Marquer comme configuré
        profileData.physical_person.is_configured = true;
      } else if (profileData.selected_entity_type === 'legal_entity') {
        if (!profileData.legal_entity.nom || !profileData.legal_entity.forme_juridique) {
          setErrorMessage('Veuillez remplir tous les champs obligatoires.');
          setIsSaving(false);
          return;
        }
        
        // Marquer comme configuré
        profileData.legal_entity.is_configured = true;
      } else {
        setErrorMessage('Veuillez sélectionner un type de cessionnaire.');
        setIsSaving(false);
        return;
      }
      
      // Sauvegarder les données formatées pour le sessionStorage (prévisualisation)
      const entityType = profileData.selected_entity_type;
      const entityData = profileData[entityType];
      const formattedData = formatBusinessDataForStorage(entityType, entityData);
      
      // Pour les utilisateurs non authentifiés, stocker dans sessionStorage
      if (currentUserId.startsWith('anon_')) {
        // Stocker les données complètes dans sessionStorage pour le dashboard
        sessionStorage.setItem('tempDashboardData', JSON.stringify(profileData));
        
        // Stocker aussi dans tempBusinessInfo pour la prévisualisation (utilisé par d'autres composants)
        sessionStorage.setItem('tempBusinessInfo', JSON.stringify(formattedData));
        
        setSuccessMessage('Vos informations ont été enregistrées temporairement pour cette session.');
      } else {
        // Pour les utilisateurs authentifiés, sauvegarder dans la base de données
        const dataToSave = {
          ...profileData,
          user_id: getCurrentUserId()
        };
        
        await updateUserProfile(dataToSave);
        setSuccessMessage('Vos informations ont été enregistrées avec succès.');
      }
      
      // Rediriger si nécessaire
      if (redirectTo) {
        setTimeout(() => {
          navigate(`/${redirectTo}?fromDashboard=true`);
        }, 1500);
      } else {
        // Masquer le message de succès après 3 secondes
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrorMessage('Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour réinitialiser les données du formulaire
  const resetProfileData = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser toutes les informations du formulaire ?")) {
      // Conserver seulement l'onglet actif et le type d'entité sélectionné
      const currentEntityType = profileData.selected_entity_type;
      
      setProfileData({
        ...initialProfileData,
        selected_entity_type: currentEntityType,
        clients: profileData.clients // Conserver la liste des clients
      });
      
      // Afficher un message de confirmation
      setSuccessMessage('Les informations ont été réinitialisées.');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 pb-12">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Tableau de bord
            </h1>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={resetProfileData}
                className="flex items-center px-3 py-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors border border-gray-300 hover:border-blue-300 rounded-md"
                disabled={isLoading || isSaving}
              >
                <RotateCcw size={16} className="mr-1.5" />
                Réinitialiser
              </button>
              
              <button
                onClick={handleSaveProfile}
                disabled={isLoading || isSaving}
                className="flex items-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto py-10 px-6 sm:px-8">
        {/* Header avec background gradient subtil */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm mr-4">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
          </div>
          <p className="text-gray-600 ml-16">
            Configurez vos informations de cessionnaire pour personnaliser vos contrats
          </p>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg flex items-start shadow-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg flex items-start shadow-sm animate-fadeIn">
            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Information d'aide */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <HelpCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-800 font-medium mb-1">Pourquoi ces informations sont-elles importantes ?</p>
              <p className="text-blue-700">
                Veuillez choisir si vous souhaitez apparaître en tant que personne physique ou morale dans vos contrats.
              </p>
            </div>
          </div>
        </div>

        {/* Main content avec effet de carte */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex px-6">
              <button
                onClick={() => setActiveTab('company')}
                className={`py-5 text-sm font-medium border-b-2 flex items-center mr-6 ${activeTab === 'company' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Mon entreprise
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`py-5 text-sm font-medium border-b-2 flex items-center ${activeTab === 'clients' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <Users className="w-4 h-4 mr-2" />
                Mes clients
              </button>
            </div>
          </div>

          {/* Tab content */}
          {activeTab === 'company' && (
            <div className="p-8">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations personnelles</h2>
                
                <div className="mb-8 text-sm text-gray-600">
                  <p className="mb-2">
                    Ces informations sont essentielles pour générer vos contrats. Elles apparaîtront dans tous vos documents en tant que vous (bénéficiaire des droits).
                  </p>
                </div>

                {/* Entity Type Selection - Style moderne avec cartes */}
                <div className="mb-8">
                  <h3 className="text-base font-medium text-gray-700 mb-3">Type de personne</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option: Personne physique */}
                    <label 
                      className={`border rounded-xl p-4 flex cursor-pointer transition-all duration-200 ${
                        profileData.selected_entity_type === 'physical_person' 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="entity-type"
                        className="sr-only"
                        checked={profileData.selected_entity_type === 'physical_person'}
                        onChange={() => handleEntityTypeSelect('physical_person')}
                      />
                      
                      <div className="flex items-center w-full relative">
                        <div className="flex-shrink-0 mr-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            profileData.selected_entity_type === 'physical_person'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <User size={24} />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-gray-900">Personne physique</h4>
                          <p className="text-sm text-gray-500">
                            Utilisez cette option si vous agissez en tant qu'individu
                          </p>
                          
                          {profileData.physical_person.is_configured && (
                            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check size={12} className="mr-1" />
                              Configuré
                            </div>
                          )}
                        </div>
                        
                        {profileData.selected_entity_type === 'physical_person' && (
                          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border-2 border-white">
                            Sélectionné
                          </div>
                        )}
                      </div>
                    </label>
                    
                    {/* Option: Personne morale */}
                    <label 
                      className={`border rounded-xl p-4 flex cursor-pointer transition-all duration-200 ${
                        profileData.selected_entity_type === 'legal_entity' 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="entity-type"
                        className="sr-only"
                        checked={profileData.selected_entity_type === 'legal_entity'}
                        onChange={() => handleEntityTypeSelect('legal_entity')}
                      />
                      
                      <div className="flex items-center w-full relative">
                        <div className="flex-shrink-0 mr-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            profileData.selected_entity_type === 'legal_entity'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <Building2 size={24} />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-gray-900">Personne morale</h4>
                          <p className="text-sm text-gray-500">
                            Utilisez cette option si vous agissez au nom d'une société
                          </p>
                          
                          {profileData.legal_entity.is_configured && (
                            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check size={12} className="mr-1" />
                              Configuré
                            </div>
                          )}
                        </div>
                        
                        {profileData.selected_entity_type === 'legal_entity' && (
                          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border-2 border-white">
                            Sélectionné
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Formulaire pour la personne physique */}
                {profileData.selected_entity_type === 'physical_person' && (
                  <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-5">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800">
                        Informations personnelles
                      </h3>
                    </div>
                    
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="civility" className="block text-sm font-medium text-gray-700 mb-1">Civilité <span className="text-red-500">*</span></label>
                        <select
                          id="civility"
                          value={profileData.physical_person.gentille || ""}
                          onChange={(e) => handleInputChange('physical_person', 'gentille', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        >
                          <option value="">Sélectionnez une civilité</option>
                          {CIVILITY_OPTIONS.map((civility) => (
                            <option key={civility} value={civility}>{civility}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            id="lastname"
                            value={profileData.physical_person.nom || ""}
                            onChange={(e) => handleInputChange('physical_person', 'nom', e.target.value)}
                            className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Nom de famille"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            id="firstname"
                            value={profileData.physical_person.prenom || ""}
                            onChange={(e) => handleInputChange('physical_person', 'prenom', e.target.value)}
                            className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Prénom"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                        <input
                          type="text"
                          id="address"
                          value={profileData.physical_person.adresse || ""}
                          onChange={(e) => handleInputChange('physical_person', 'adresse', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Numéro et rue"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                          <input
                            type="text"
                            id="postal_code"
                            value={profileData.physical_person.code_postal || ""}
                            onChange={(e) => handleInputChange('physical_person', 'code_postal', e.target.value)}
                            className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ex: 75001"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                          <input
                            type="text"
                            id="city"
                            value={profileData.physical_person.ville || ""}
                            onChange={(e) => handleInputChange('physical_person', 'ville', e.target.value)}
                            className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ex: Paris"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            id="email"
                            value={profileData.physical_person.email || ""}
                            onChange={(e) => handleInputChange('physical_person', 'email', e.target.value)}
                            className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ex: nom@exemple.com"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                          <input
                            type="tel"
                            id="telephone"
                            value={profileData.physical_person.telephone || ""}
                            onChange={(e) => handleInputChange('physical_person', 'telephone', e.target.value)}
                            className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ex: 06 12 34 56 78"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Formulaire pour la personne morale */}
                {profileData.selected_entity_type === 'legal_entity' && (
                  <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-5">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800">
                        Informations de la société
                      </h3>
                    </div>
                    
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">Nom de la société <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          id="company-name"
                          value={profileData.legal_entity.nom || ""}
                          onChange={(e) => handleInputChange('legal_entity', 'nom', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Raison sociale"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="legal-form" className="block text-sm font-medium text-gray-700 mb-1">Forme juridique <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            id="legal-form"
                            value={profileData.legal_entity.forme_juridique || ""}
                            onChange={(e) => handleInputChange('legal_entity', 'forme_juridique', e.target.value)}
                            className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ex: SARL, SAS, SA, etc."
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="capital" className="block text-sm font-medium text-gray-700 mb-1">Capital social</label>
                          <input
                            type="text"
                            id="capital"
                            value={profileData.legal_entity.capital || ""}
                            onChange={(e) => handleInputChange('legal_entity', 'capital', e.target.value)}
                            className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ex: 10 000 €"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="siren" className="block text-sm font-medium text-gray-700 mb-1">SIREN/SIRET</label>
                        <input
                          type="text"
                          id="siren"
                          value={profileData.legal_entity.siren || ""}
                          onChange={(e) => handleInputChange('legal_entity', 'siren', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ex: 123 456 789"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address-company" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                        <input
                          type="text"
                          id="address-company"
                          value={profileData.legal_entity.adresse || ""}
                          onChange={(e) => handleInputChange('legal_entity', 'adresse', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Numéro et rue"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="postal-code-company" className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                          <input
                            type="text"
                            id="postal-code-company"
                            value={profileData.legal_entity.code_postal || ""}
                            onChange={(e) => handleInputChange('legal_entity', 'code_postal', e.target.value)}
                            className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ex: 75001"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="city-company" className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                          <input
                            type="text"
                            id="city-company"
                            value={profileData.legal_entity.ville || ""}
                            onChange={(e) => handleInputChange('legal_entity', 'ville', e.target.value)}
                            className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ex: Paris"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="email-company" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            id="email-company"
                            value={profileData.legal_entity.email || ""}
                            onChange={(e) => handleInputChange('legal_entity', 'email', e.target.value)}
                            className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ex: contact@entreprise.com"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="telephone-company" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                          <input
                            type="tel"
                            id="telephone-company"
                            value={profileData.legal_entity.telephone || ""}
                            onChange={(e) => handleInputChange('legal_entity', 'telephone', e.target.value)}
                            className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ex: 01 23 45 67 89"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-10 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving || !profileData.selected_entity_type}
                    className={`flex items-center px-6 py-3 rounded-lg text-white ${
                      isSaving || !profileData.selected_entity_type
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                    } transition-all duration-200`}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        {redirectTo ? "Enregistrer et continuer" : "Enregistrer mes informations"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="p-8">
              <ClientsTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 