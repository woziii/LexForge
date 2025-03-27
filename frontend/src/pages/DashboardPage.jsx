import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Save, AlertCircle, Check, HelpCircle, Briefcase, Shield } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '../services/api';
import { AUTHOR_TYPES, CIVILITY_OPTIONS } from '../utils/constants';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('company');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileData, setProfileData] = useState({
    physical_person: {
      is_configured: false,
      gentille: '',
      nom: '',
      prenom: '',
      date_naissance: '',
      nationalite: '',
      adresse: '',
    },
    legal_entity: {
      is_configured: false,
      nom: '',
      forme_juridique: '',
      capital: '',
      rcs: '',
      siege: '',
      representant: '',
      qualite_representant: '',
    },
    selected_entity_type: '' // 'physical_person' ou 'legal_entity'
  });

  useEffect(() => {
    // Charger les données du profil utilisateur depuis le backend
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await getUserProfile();
        setProfileData(data);
      } catch (error) {
        setErrorMessage('Impossible de charger votre profil. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

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

  const validatePhysicalPerson = () => {
    const { gentille, nom, prenom, date_naissance, adresse } = profileData.physical_person;
    return gentille && nom && prenom && date_naissance && adresse;
  };

  const validateLegalEntity = () => {
    const { nom, forme_juridique, capital, rcs, siege, representant, qualite_representant } = profileData.legal_entity;
    return nom && forme_juridique && capital && rcs && siege && representant && qualite_representant;
  };

  const handleSaveProfile = async () => {
    // Vérifier que les données requises sont présentes
    let hasError = false;
    let updatedProfileData = { ...profileData };
    
    if (profileData.selected_entity_type === 'physical_person') {
      if (!validatePhysicalPerson()) {
        setErrorMessage('Veuillez remplir tous les champs obligatoires pour la personne physique.');
        hasError = true;
      } else {
        updatedProfileData.physical_person.is_configured = true;
      }
    } else if (profileData.selected_entity_type === 'legal_entity') {
      if (!validateLegalEntity()) {
        setErrorMessage('Veuillez remplir tous les champs obligatoires pour la personne morale.');
        hasError = true;
      } else {
        updatedProfileData.legal_entity.is_configured = true;
      }
    } else {
      setErrorMessage('Veuillez sélectionner un type d\'entité (personne physique ou morale).');
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsSaving(true);
      setErrorMessage('');
      
      await updateUserProfile(updatedProfileData);
      setProfileData(updatedProfileData);
      setSuccessMessage('Vos informations ont été enregistrées avec succès !');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrorMessage('Une erreur est survenue lors de l\'enregistrement de votre profil. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
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

      {/* Main content avec effet de carte */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('company')}
              className={`py-5 text-sm font-medium border-b-2 flex items-center ${activeTab === 'company' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Mon entreprise
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'company' && (
          <div className="p-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations du cessionnaire</h2>
              
              <div className="mb-8 text-sm text-gray-600">
                <p className="mb-2">
                  Ces informations sont essentielles pour générer vos contrats. Elles apparaîtront dans tous vos documents en tant que cessionnaire (bénéficiaire des droits).
                </p>
                
                <div className="flex items-start bg-blue-50 p-4 rounded-xl border border-blue-100 mt-3">
                  <HelpCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-800 font-medium mb-1">Pourquoi ces informations sont-elles importantes ?</p>
                    <p className="text-blue-700">
                      Veuillez choisir si vous souhaitez apparaître en tant que personne physique ou morale dans vos contrats.
                    </p>
                  </div>
                </div>
              </div>

              {/* Entity Type Selection - Style moderne avec cartes */}
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-700 mb-4">Type de cessionnaire</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    type="button"
                    onClick={() => handleEntityTypeSelect('physical_person')}
                    className={`relative flex items-center p-5 border rounded-xl transition-all duration-200 ${
                      profileData.selected_entity_type === 'physical_person' 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className={`flex-shrink-0 mr-4 p-3 rounded-full ${
                      profileData.selected_entity_type === 'physical_person' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <User className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <span className={`block font-medium text-lg ${profileData.selected_entity_type === 'physical_person' ? 'text-blue-700' : 'text-gray-700'}`}>
                        Personne physique
                      </span>
                      <span className="block text-sm text-gray-500 mt-1">
                        Vous agissez en tant qu'individu
                      </span>
                    </div>
                    {profileData.physical_person.is_configured && (
                      <span className="absolute top-3 right-3 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Configuré
                      </span>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleEntityTypeSelect('legal_entity')}
                    className={`relative flex items-center p-5 border rounded-xl transition-all duration-200 ${
                      profileData.selected_entity_type === 'legal_entity' 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className={`flex-shrink-0 mr-4 p-3 rounded-full ${
                      profileData.selected_entity_type === 'legal_entity' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <span className={`block font-medium text-lg ${profileData.selected_entity_type === 'legal_entity' ? 'text-blue-700' : 'text-gray-700'}`}>
                        Personne morale
                      </span>
                      <span className="block text-sm text-gray-500 mt-1">
                        Vous représentez une entreprise ou organisation
                      </span>
                    </div>
                    {profileData.legal_entity.is_configured && (
                      <span className="absolute top-3 right-3 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Configuré
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Formulaire amélioré pour personne physique */}
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
                        className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">Date de naissance <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          id="birthdate"
                          value={profileData.physical_person.date_naissance || ""}
                          onChange={(e) => handleInputChange('physical_person', 'date_naissance', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                        <input
                          type="text"
                          id="nationality"
                          value={profileData.physical_person.nationalite || ""}
                          onChange={(e) => handleInputChange('physical_person', 'nationalite', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ex: Française"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse complète <span className="text-red-500">*</span></label>
                      <textarea
                        id="address"
                        value={profileData.physical_person.adresse || ""}
                        onChange={(e) => handleInputChange('physical_person', 'adresse', e.target.value)}
                        className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        rows="3"
                        placeholder="Numéro, rue, code postal, ville, pays"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulaire amélioré pour personne morale */}
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
                        <label htmlFor="capital" className="block text-sm font-medium text-gray-700 mb-1">Capital social <span className="text-red-500">*</span></label>
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
                      <label htmlFor="rcs" className="block text-sm font-medium text-gray-700 mb-1">Numéro RCS <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        id="rcs"
                        value={profileData.legal_entity.rcs || ""}
                        onChange={(e) => handleInputChange('legal_entity', 'rcs', e.target.value)}
                        className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Ex: 123 456 789 R.C.S. Paris"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="company-address" className="block text-sm font-medium text-gray-700 mb-1">Siège social <span className="text-red-500">*</span></label>
                      <textarea
                        id="company-address"
                        value={profileData.legal_entity.siege || ""}
                        onChange={(e) => handleInputChange('legal_entity', 'siege', e.target.value)}
                        className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        rows="3"
                        placeholder="Adresse complète du siège social"
                      ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="representative" className="block text-sm font-medium text-gray-700 mb-1">Représentant légal <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          id="representative"
                          value={profileData.legal_entity.representant || ""}
                          onChange={(e) => handleInputChange('legal_entity', 'representant', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Nom et prénom du représentant"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="representative-title" className="block text-sm font-medium text-gray-700 mb-1">Qualité du représentant <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          id="representative-title"
                          value={profileData.legal_entity.qualite_representant || ""}
                          onChange={(e) => handleInputChange('legal_entity', 'qualite_representant', e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ex: Gérant, Président, etc."
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
                      Enregistrer mes informations
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 