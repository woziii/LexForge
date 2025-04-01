import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Building2, User, Save, AlertCircle, Check, HelpCircle, Briefcase, Shield, Users } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '../services/api';
import ClientsTab from '../components/clients/ClientsTab';

const UnifiedDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Récupérer le paramètre de redirection
  const redirectTo = new URLSearchParams(location.search).get('redirectTo') || 'wizard';
  
  // État pour stocker les informations d'entreprise
  const [profileData, setProfileData] = useState({
    selected_entity_type: 'legal_entity',
    physical_person: {
      is_configured: false,
      gentille: '',
      nom: '',
      prenom: '',
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
      siren: '',
      adresse: '',
      code_postal: '',
      ville: '',
      email: '',
      telephone: ''
    },
    clients: []
  });

  // Charger les données du profil utilisateur
  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      
      try {
        if (isLoaded && isSignedIn) {
          // Pour les utilisateurs authentifiés, charger le profil depuis le serveur
          const data = await getUserProfile();
          setProfileData(data);
        } else {
          // Pour les utilisateurs non authentifiés, charger depuis sessionStorage
          const savedData = sessionStorage.getItem('tempBusinessInfo');
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Détecter si c'est une personne physique ou morale
            const entityType = parsedData.gentille ? 'physical_person' : 'legal_entity';
            
            if (entityType === 'physical_person') {
              setProfileData(prevData => ({
                ...prevData,
                selected_entity_type: 'physical_person',
                physical_person: {
                  ...prevData.physical_person,
                  ...parsedData,
                  is_configured: true
                }
              }));
            } else {
              setProfileData(prevData => ({
                ...prevData,
                selected_entity_type: 'legal_entity',
                legal_entity: {
                  ...prevData.legal_entity,
                  ...parsedData,
                  is_configured: true
                }
              }));
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setErrorMessage('Impossible de charger vos informations. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isLoaded) {
      loadProfileData();
    }
  }, [isLoaded, isSignedIn]);

  // Gestionnaires d'événements
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

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrorMessage('');
    
    try {
      // Vérifier les champs obligatoires
      if (profileData.selected_entity_type === 'physical_person') {
        if (!profileData.physical_person.gentille || !profileData.physical_person.nom || !profileData.physical_person.prenom) {
          setErrorMessage('Veuillez remplir tous les champs obligatoires pour la personne physique.');
          setIsSaving(false);
          return;
        }
        
        // Marquer comme configuré
        profileData.physical_person.is_configured = true;
      } else if (profileData.selected_entity_type === 'legal_entity') {
        if (!profileData.legal_entity.nom || !profileData.legal_entity.forme_juridique) {
          setErrorMessage('Veuillez remplir tous les champs obligatoires pour la personne morale.');
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
      
      if (isSignedIn) {
        // Pour les utilisateurs authentifiés, enregistrer sur le serveur
        await updateUserProfile(profileData);
      } else {
        // Pour les utilisateurs non authentifiés, enregistrer dans sessionStorage
        const entityType = profileData.selected_entity_type;
        const entityData = profileData[entityType];
        
        // Format spécial pour le sessionStorage afin d'assurer la compatibilité
        // avec la prévisualisation des contrats
        const formattedData = formatBusinessDataForStorage(entityType, entityData);
        sessionStorage.setItem('tempBusinessInfo', JSON.stringify(formattedData));
      }
      
      setSuccessMessage('Vos informations ont été enregistrées avec succès.');
      
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
      console.error('Erreur lors de l\'enregistrement:', error);
      setErrorMessage('Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  // Format les données d'entreprise pour le stockage et la prévisualisation
  const formatBusinessDataForStorage = (entityType, entityData) => {
    // Formater l'adresse complète
    const adresseComplete = formatAddress(entityData);
    
    if (entityType === 'physical_person') {
      // Pour personne physique
      return {
        // Champs standard de l'entité
        nom: entityData.nom || '',
        prenom: entityData.prenom || '',
        gentille: entityData.gentille || '',
        adresse: adresseComplete,
        code_postal: entityData.code_postal || '',
        ville: entityData.ville || '',
        email: entityData.email || '',
        telephone: entityData.telephone || '',
        // Champs spécifiques requis par le module de prévisualisation
        siege: adresseComplete, // Le backend utilise 'siege' pour les personnes morales
      };
    } else {
      // Pour personne morale
      return {
        // Champs standard de l'entité
        nom: entityData.nom || '',
        forme_juridique: entityData.forme_juridique || '',
        siren: entityData.siren || '',
        adresse: entityData.adresse || '',
        code_postal: entityData.code_postal || '',
        ville: entityData.ville || '',
        email: entityData.email || '',
        telephone: entityData.telephone || '',
        // Champs spécifiques requis par le module de prévisualisation
        siege: adresseComplete,
        capital: entityData.capital || '', // Ajout du capital si disponible
      };
    }
  };

  // Formater l'adresse complète
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

  // Rendu du composant
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Bannière pour utilisateurs non authentifiés */}
      {isLoaded && !isSignedIn && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
          <div className="flex items-start md:items-center flex-col md:flex-row md:justify-between">
            <p className="text-blue-700 mb-3 md:mb-0">
              Créez un compte pour sauvegarder vos informations et accéder à toutes les fonctionnalités.
            </p>
            <button 
              onClick={() => navigate('/sign-up')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex-shrink-0"
            >
              Créer un compte
            </button>
          </div>
        </div>
      )}

      {/* Header avec background gradient */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl shadow-sm">
        <div className="flex items-center mb-2">
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm mr-4">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            {isLoaded && isSignedIn ? "Mon profil" : "Information de votre entreprise"}
          </h1>
        </div>
        <p className="text-gray-600 ml-16">
          {isLoaded && isSignedIn 
            ? "Configurez vos informations de cessionnaire pour personnaliser vos contrats" 
            : "Ces informations sont nécessaires pour personnaliser votre contrat"}
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
              Ces informations apparaîtront dans votre contrat en tant que cessionnaire (celui qui reçoit les droits).
              Veuillez choisir si vous souhaitez apparaître en tant que personne physique ou morale.
            </p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        {/* Tabs - uniquement pour les utilisateurs authentifiés */}
        {isLoaded && isSignedIn && (
          <div className="border-b border-gray-200">
            <div className="flex px-6">
              <button
                onClick={() => setActiveTab('company')}
                className={`py-5 text-sm font-medium border-b-2 flex items-center mr-6 ${
                  activeTab === 'company' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Mon entreprise
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`py-5 text-sm font-medium border-b-2 flex items-center ${
                  activeTab === 'clients' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Mes clients
              </button>
            </div>
          </div>
        )}

        {/* Affichage des onglets */}
        {(!isLoaded || !isSignedIn || activeTab === 'company') && (
          <div className="p-6 sm:p-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations personnelles</h2>
              
              <div className="mb-8 text-sm text-gray-600">
                <p className="mb-2">
                  Ces informations sont essentielles pour générer vos contrats. Elles apparaîtront dans tous vos documents en tant que vous (bénéficiaire des droits).
                </p>
              </div>

              {/* Entity Type Selection */}
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
                      </div>
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
                          Utilisez cette option si vous représentez une entreprise
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Formulaire pour personne morale */}
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
                      <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de la société <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="company-name"
                        value={profileData.legal_entity.nom || ""}
                        onChange={(e) => handleInputChange('legal_entity', 'nom', e.target.value)}
                        className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Raison sociale"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="legal-form" className="block text-sm font-medium text-gray-700 mb-1">
                        Forme juridique <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="legal-form"
                        value={profileData.legal_entity.forme_juridique || ""}
                        onChange={(e) => handleInputChange('legal_entity', 'forme_juridique', e.target.value)}
                        className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Ex: SARL, SAS, EURL, etc."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="siren" className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro SIREN
                      </label>
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
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse
                      </label>
                      <input
                        type="text"
                        id="address"
                        value={profileData.legal_entity.adresse || ""}
                        onChange={(e) => handleInputChange('legal_entity', 'adresse', e.target.value)}
                        className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Numéro et rue"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700 mb-1">
                          Code postal
                        </label>
                        <input
                          type="text"
                          id="postal-code"
                          value={profileData.legal_entity.code_postal || ""}
                          onChange={(e) => handleInputChange('legal_entity', 'code_postal', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ex: 75001"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          Ville
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={profileData.legal_entity.ville || ""}
                          onChange={(e) => handleInputChange('legal_entity', 'ville', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ex: Paris"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={profileData.legal_entity.email || ""}
                          onChange={(e) => handleInputChange('legal_entity', 'email', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ex: contact@entreprise.com"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          id="phone"
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

              {/* Formulaire pour personne physique */}
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
                      <label htmlFor="civility" className="block text-sm font-medium text-gray-700 mb-1">
                        Civilité <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="civility"
                        value={profileData.physical_person.gentille || ""}
                        onChange={(e) => handleInputChange('physical_person', 'gentille', e.target.value)}
                        className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Sélectionner</option>
                        <option value="M.">Monsieur</option>
                        <option value="Mme">Madame</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom <span className="text-red-500">*</span>
                        </label>
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
                        <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom <span className="text-red-500">*</span>
                        </label>
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
                      <label htmlFor="address-personal" className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse
                      </label>
                      <input
                        type="text"
                        id="address-personal"
                        value={profileData.physical_person.adresse || ""}
                        onChange={(e) => handleInputChange('physical_person', 'adresse', e.target.value)}
                        className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Numéro et rue"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="postal-code-personal" className="block text-sm font-medium text-gray-700 mb-1">
                          Code postal
                        </label>
                        <input
                          type="text"
                          id="postal-code-personal"
                          value={profileData.physical_person.code_postal || ""}
                          onChange={(e) => handleInputChange('physical_person', 'code_postal', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ex: 75001"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="city-personal" className="block text-sm font-medium text-gray-700 mb-1">
                          Ville
                        </label>
                        <input
                          type="text"
                          id="city-personal"
                          value={profileData.physical_person.ville || ""}
                          onChange={(e) => handleInputChange('physical_person', 'ville', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ex: Paris"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="email-personal" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email-personal"
                          value={profileData.physical_person.email || ""}
                          onChange={(e) => handleInputChange('physical_person', 'email', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ex: prenom.nom@email.com"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone-personal" className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          id="phone-personal"
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

              {/* Bouton de sauvegarde */}
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

        {/* Onglet clients pour utilisateurs authentifiés */}
        {isLoaded && isSignedIn && activeTab === 'clients' && (
          <div className="p-8">
            <ClientsTab />
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedDashboard; 