import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, User, Save, AlertCircle, Check, HelpCircle, ArrowRight } from 'lucide-react';

const TempDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [businessInfo, setBusinessInfo] = useState({
    type: 'legal_entity', // Par défaut: personne morale
    // Données pour personne morale
    legal_entity: {
      nom: '',
      forme_juridique: '',
      siren: '',
      adresse: '',
      code_postal: '',
      ville: '',
      email: '',
      telephone: ''
    },
    // Données pour personne physique
    physical_person: {
      gentille: '',
      nom: '',
      prenom: '',
      adresse: '',
      code_postal: '',
      ville: '',
      email: '',
      telephone: ''
    }
  });
  
  // Récupérer le paramètre de redirection
  const redirectTo = new URLSearchParams(location.search).get('redirectTo') || 'wizard';
  
  // Gestionnaire de changement d'entrée
  const handleInputChange = (entity, field, value) => {
    setBusinessInfo(prevState => ({
      ...prevState,
      [entity]: {
        ...prevState[entity],
        [field]: value
      }
    }));
  };
  
  // Gestionnaire de changement de type d'entité
  const handleEntityTypeChange = (type) => {
    setBusinessInfo(prevState => ({
      ...prevState,
      type
    }));
  };
  
  // Gestionnaire de soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Vérifier si les champs obligatoires sont remplis
    const entity = businessInfo.type === 'legal_entity' ? businessInfo.legal_entity : businessInfo.physical_person;
    
    if (businessInfo.type === 'legal_entity') {
      if (!entity.nom || !entity.forme_juridique) {
        setErrorMessage('Veuillez remplir tous les champs obligatoires pour la personne morale.');
        return;
      }
    } else {
      if (!entity.gentille || !entity.nom || !entity.prenom) {
        setErrorMessage('Veuillez remplir tous les champs obligatoires pour la personne physique.');
        return;
      }
    }
    
    setIsSaving(true);
    
    // Stocker les données dans sessionStorage pour une utilisation ultérieure
    sessionStorage.setItem('tempBusinessInfo', JSON.stringify(entity));
    
    // Rediriger vers le générateur avec un paramètre indiquant que les informations sont complétées
    setTimeout(() => {
      navigate(`/${redirectTo}?fromDashboard=true`);
    }, 500);
  };
  
  return (
    <div className="max-w-6xl mx-auto py-10 px-6 sm:px-8">
      {/* Header avec background gradient subtil */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl shadow-sm">
        <div className="flex items-center mb-2">
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm mr-4">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Information de votre entreprise</h1>
        </div>
        <p className="text-gray-600 ml-16">
          Ces informations sont nécessaires pour personnaliser votre contrat
        </p>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg flex items-start shadow-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{errorMessage}</p>
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

      {/* Main content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden p-6">
        <form onSubmit={handleSubmit}>
          {/* Type d'entité selection */}
          <div className="mb-8">
            <h3 className="text-base font-medium text-gray-700 mb-3">Type de personne</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option: Personne physique */}
              <label 
                className={`border rounded-xl p-4 flex cursor-pointer transition-all duration-200 ${
                  businessInfo.type === 'physical_person'
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="entity-type"
                  className="sr-only"
                  checked={businessInfo.type === 'physical_person'}
                  onChange={() => handleEntityTypeChange('physical_person')}
                />
                
                <div className="flex items-center w-full relative">
                  <div className="flex-shrink-0 mr-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      businessInfo.type === 'physical_person'
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
                  businessInfo.type === 'legal_entity'
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="entity-type"
                  className="sr-only"
                  checked={businessInfo.type === 'legal_entity'}
                  onChange={() => handleEntityTypeChange('legal_entity')}
                />
                
                <div className="flex items-center w-full relative">
                  <div className="flex-shrink-0 mr-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      businessInfo.type === 'legal_entity'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Building2 size={24} />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-gray-900">Personne morale</h4>
                    <p className="text-sm text-gray-500">
                      Pour les entreprises, associations ou sociétés
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          {/* Formulaire pour personne morale */}
          {businessInfo.type === 'legal_entity' && (
            <div className="space-y-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">Informations de l'entreprise</h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="legal_nom">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    id="legal_nom"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                    value={businessInfo.legal_entity.nom}
                    onChange={(e) => handleInputChange('legal_entity', 'nom', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="legal_forme_juridique">
                    Forme juridique *
                  </label>
                  <select
                    id="legal_forme_juridique"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                    value={businessInfo.legal_entity.forme_juridique}
                    onChange={(e) => handleInputChange('legal_entity', 'forme_juridique', e.target.value)}
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="SARL">SARL</option>
                    <option value="EURL">EURL</option>
                    <option value="SAS">SAS</option>
                    <option value="SASU">SASU</option>
                    <option value="SA">SA</option>
                    <option value="SNC">SNC</option>
                    <option value="SCI">SCI</option>
                    <option value="Association">Association</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="legal_siren">
                  SIREN/SIRET (optionnel)
                </label>
                <input
                  type="text"
                  id="legal_siren"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                  value={businessInfo.legal_entity.siren}
                  onChange={(e) => handleInputChange('legal_entity', 'siren', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="legal_adresse">
                  Adresse (optionnel)
                </label>
                <input
                  type="text"
                  id="legal_adresse"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                  value={businessInfo.legal_entity.adresse}
                  onChange={(e) => handleInputChange('legal_entity', 'adresse', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="legal_code_postal">
                    Code postal (optionnel)
                  </label>
                  <input
                    type="text"
                    id="legal_code_postal"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                    value={businessInfo.legal_entity.code_postal}
                    onChange={(e) => handleInputChange('legal_entity', 'code_postal', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="legal_ville">
                    Ville (optionnel)
                  </label>
                  <input
                    type="text"
                    id="legal_ville"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                    value={businessInfo.legal_entity.ville}
                    onChange={(e) => handleInputChange('legal_entity', 'ville', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="legal_email">
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    id="legal_email"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                    value={businessInfo.legal_entity.email}
                    onChange={(e) => handleInputChange('legal_entity', 'email', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="legal_telephone">
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    id="legal_telephone"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                    value={businessInfo.legal_entity.telephone}
                    onChange={(e) => handleInputChange('legal_entity', 'telephone', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Formulaire pour personne physique */}
          {businessInfo.type === 'physical_person' && (
            <div className="space-y-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="physical_gentille">
                    Civilité *
                  </label>
                  <select
                    id="physical_gentille"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                    value={businessInfo.physical_person.gentille}
                    onChange={(e) => handleInputChange('physical_person', 'gentille', e.target.value)}
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="M.">Monsieur</option>
                    <option value="Mme">Madame</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="physical_nom">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="physical_nom"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                    value={businessInfo.physical_person.nom}
                    onChange={(e) => handleInputChange('physical_person', 'nom', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="physical_prenom">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="physical_prenom"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                    value={businessInfo.physical_person.prenom}
                    onChange={(e) => handleInputChange('physical_person', 'prenom', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="physical_adresse">
                  Adresse (optionnel)
                </label>
                <input
                  type="text"
                  id="physical_adresse"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                  value={businessInfo.physical_person.adresse}
                  onChange={(e) => handleInputChange('physical_person', 'adresse', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="physical_code_postal">
                    Code postal (optionnel)
                  </label>
                  <input
                    type="text"
                    id="physical_code_postal"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                    value={businessInfo.physical_person.code_postal}
                    onChange={(e) => handleInputChange('physical_person', 'code_postal', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="physical_ville">
                    Ville (optionnel)
                  </label>
                  <input
                    type="text"
                    id="physical_ville"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                    value={businessInfo.physical_person.ville}
                    onChange={(e) => handleInputChange('physical_person', 'ville', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="physical_email">
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    id="physical_email"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                    value={businessInfo.physical_person.email}
                    onChange={(e) => handleInputChange('physical_person', 'email', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="physical_telephone">
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    id="physical_telephone"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                    value={businessInfo.physical_person.telephone}
                    onChange={(e) => handleInputChange('physical_person', 'telephone', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Bouton de soumission */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className={`flex items-center justify-center py-3 px-6 rounded-lg shadow-md text-white text-base font-medium transition-colors ${
                isSaving
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  Continuer vers le générateur 
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TempDashboardPage; 