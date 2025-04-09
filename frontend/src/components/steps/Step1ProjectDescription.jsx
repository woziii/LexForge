import React, { useState, useEffect } from 'react';
import { Check, Search, FileText, Image, Sparkles, Info, HelpCircle, Lightbulb, User, Building2 } from 'lucide-react';
import { analyzeProject, getUserProfile } from '../../services/api';

// Importer les constantes depuis un fichier de configuration
const CONTRACT_TYPES = [
  { 
    id: "auteur", 
    label: "Auteur (droits d'auteur)", 
    icon: <FileText size={20} />,
    description: "Protège vos créations intellectuelles et artistiques",
    color: "from-blue-500 to-indigo-600"
  },
  { 
    id: "image", 
    label: "Image (droit à l'image)", 
    icon: <Image size={20} />,
    description: "Encadre l'utilisation de votre image ou celle de vos modèles",
    color: "from-emerald-500 to-teal-600"
  }
];

const Step1ProjectDescription = ({ contractData, updateContractData }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [showTooltip, setShowTooltip] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [selectedEntityType, setSelectedEntityType] = useState(null);
  
  // Charger le profil utilisateur au chargement du composant
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoadingProfile(true);
        const profileData = await getUserProfile();
        setUserProfile(profileData);
        
        // Vérifier s'il existe des données de businessInfo dans sessionStorage (pour les brouillons)
        const storedBusinessInfo = sessionStorage.getItem('businessInfo');
        let businessInfoData = null;
        
        if (storedBusinessInfo) {
          try {
            businessInfoData = JSON.parse(storedBusinessInfo);
            console.log('Données businessInfo récupérées de sessionStorage:', businessInfoData);
          } catch (e) {
            console.error('Erreur lors du parsing des données businessInfo:', e);
          }
        }
        
        // Vérifier si un type d'entité est déjà sélectionné dans les données du contrat
        if (contractData.entreprise_info && contractData.entreprise_info.type) {
          setSelectedEntityType(contractData.entreprise_info.type);
        }
        // Si des données businessInfo sont disponibles dans la session, les utiliser prioritairement
        else if (businessInfoData && businessInfoData.type) {
          setSelectedEntityType(businessInfoData.type);
          
          // Si ce type correspond à un profil configuré, mettre à jour les données du contrat
          if ((businessInfoData.type === 'physical_person' && profileData.physical_person?.is_configured) ||
              (businessInfoData.type === 'legal_entity' && profileData.legal_entity?.is_configured)) {
            
            // Utiliser les données du profil mais préserver le type de l'entité
            updateContractData({
              entreprise_info: {
                ...businessInfoData,
                type: businessInfoData.type
              }
            });
          }
        }
        // Sinon, pré-sélectionner un type d'entité basé sur les données configurées
        else if (profileData.selected_entity_type) {
          setSelectedEntityType(profileData.selected_entity_type);
          // Si des données de contrat existent et qu'un type d'entité est pré-sélectionné,
          // mettre à jour les données du contrat avec ce type
          if (profileData.selected_entity_type && !contractData.entreprise_info?.type) {
            handleEntityTypeSelect(profileData.selected_entity_type);
          }
        } else if (profileData.physical_person?.is_configured && !profileData.legal_entity?.is_configured) {
          setSelectedEntityType('physical_person');
          // Si seul le profil physique est configuré, le sélectionner par défaut
          if (!contractData.entreprise_info?.type) {
            handleEntityTypeSelect('physical_person');
          }
        } else if (!profileData.physical_person?.is_configured && profileData.legal_entity?.is_configured) {
          setSelectedEntityType('legal_entity');
          // Si seul le profil moral est configuré, le sélectionner par défaut
          if (!contractData.entreprise_info?.type) {
            handleEntityTypeSelect('legal_entity');
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    loadUserProfile();
  }, []);
  
  const handleDescriptionChange = (e) => {
    updateContractData({ description_oeuvre: e.target.value });
  };
  
  const handleContractTypeChange = (typeId) => {
    const type = CONTRACT_TYPES.find(t => t.id === typeId)?.label;
    
    let updatedTypes = [...contractData.type_contrat];
    
    if (updatedTypes.includes(type)) {
      updatedTypes = updatedTypes.filter(t => t !== type);
    } else {
      updatedTypes.push(type);
    }
    
    updateContractData({ type_contrat: updatedTypes });
  };
  
  const handleAnalyzeProject = async () => {
    if (!contractData.description_oeuvre.trim()) {
      setSuggestion("Veuillez d'abord saisir une description de votre projet.");
      return;
    }
    
    try {
      setIsAnalyzing(true);
      const result = await analyzeProject(contractData.description_oeuvre);
      
      if (result.suggestion) {
        setSuggestion(result.suggestion);
        
        // Mettre à jour automatiquement les types de contrat si suggérés
        if (result.contract_types && result.contract_types.length > 0) {
          updateContractData({ type_contrat: result.contract_types });
        }
      }
    } catch (error) {
      setSuggestion("Une erreur est survenue lors de l'analyse. Veuillez sélectionner manuellement le type de contrat.");
      console.error("Error analyzing project:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Vérifier si les deux types de profil sont configurés
  const hasBothProfiles = userProfile && 
    userProfile.physical_person?.is_configured && 
    userProfile.legal_entity?.is_configured;
    
  // Vérifier si au moins un profil est configuré
  const hasPhysicalProfile = userProfile && userProfile.physical_person?.is_configured;
  const hasLegalProfile = userProfile && userProfile.legal_entity?.is_configured;
  
  // Fonction pour gérer le changement de type d'entité
  const handleEntityTypeSelect = (type) => {
    if (!userProfile) return;
    
    setSelectedEntityType(type);
    
    // Récupérer les données du profil pour le type sélectionné
    const entityData = userProfile[type];
    
    if (entityData) {
      console.log(`Mise à jour du profil: passage à ${type}`);
      
      // Formatage des données pour le sessionStorage - Crucial pour les brouillons
      const formattedData = {
        type: type,
        ...(type === 'physical_person' ? {
          gentille: entityData.gentille || '',
          nom: entityData.nom || '',
          prenom: entityData.prenom || '',
          adresse: entityData.adresse || '',
          code_postal: entityData.code_postal || '',
          ville: entityData.ville || '',
          email: entityData.email || '',
          telephone: entityData.telephone || '',
          siege: entityData.adresse ? `${entityData.adresse}, ${entityData.code_postal || ''} ${entityData.ville || ''}`.trim() : '',
          date_naissance: entityData.date_naissance || '',
          lieu_naissance: entityData.lieu_naissance || '',
          nationalite: entityData.nationalite || ''
        } : {
          nom: entityData.nom || '',
          forme_juridique: entityData.forme_juridique || '',
          siren: entityData.siren || '',
          adresse: entityData.adresse || '',
          code_postal: entityData.code_postal || '',
          ville: entityData.ville || '',
          email: entityData.email || '',
          telephone: entityData.telephone || '',
          siege: entityData.adresse ? `${entityData.adresse}, ${entityData.code_postal || ''} ${entityData.ville || ''}`.trim() : '',
          capital: entityData.capital || '1000 €',
          representant_civilite: entityData.representant_civilite || 'M.',
          representant_nom: entityData.representant_nom || '',
          representant_prenom: entityData.representant_prenom || '',
          qualite_representant: entityData.qualite_representant || ''
        })
      };
      
      // Stocker les informations dans sessionStorage - essentiel pour les brouillons
      sessionStorage.setItem('businessInfo', JSON.stringify(formattedData));
      
      // Mettre à jour les informations d'entreprise dans les données du contrat
      updateContractData({ 
        entreprise_info: {
          ...entityData,
          type: type
        }
      });
    }
  };
  
  // Si l'utilisateur n'a qu'un seul profil configuré et qu'aucun profil n'est sélectionné,
  // sélectionner automatiquement ce profil
  useEffect(() => {
    if (!selectedEntityType && userProfile) {
      if (hasPhysicalProfile && !hasLegalProfile) {
        handleEntityTypeSelect('physical_person');
      } else if (!hasPhysicalProfile && hasLegalProfile) {
        handleEntityTypeSelect('legal_entity');
      }
    }
  }, [userProfile, hasPhysicalProfile, hasLegalProfile, selectedEntityType]);
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Bandeau d'introduction avec une légère animation */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 transform transition-all hover:shadow-md">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2 flex items-center">
          <Sparkles size={22} className="mr-2 text-blue-500 animate-pulse" />
          Décrivez votre projet
        </h2>
        <p className="text-sm text-gray-600 pl-7">
          Nous allons vous aider à créer le contrat parfait pour votre situation.
        </p>
      </div>
      
      {/* Progression visuelle */}
      <div className="flex items-center mb-6 text-xs text-gray-500">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-sm">1</div>
        <div className="ml-2 h-0.5 flex-grow bg-gray-200">
          <div className="h-0.5 w-1/5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
        </div>
        <span className="ml-2">Étape 1/5 : Type de contrat</span>
      </div>
      
      {/* Sélection de profil si l'utilisateur a les deux types de profil configurés */}
      {hasBothProfiles && (
        <div className="mb-8 bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <label className="text-sm font-medium text-gray-700 mb-4 flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs font-bold shadow-sm">0</div>
            <span className="mr-1">Pour qui générez-vous ce contrat ?</span>
            <div 
              className="text-gray-400 hover:text-blue-500 cursor-help transition-colors relative"
              onMouseEnter={() => setShowTooltip('profileType')}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <HelpCircle size={14} />
              {showTooltip === 'profileType' && (
                <div className="absolute left-full ml-2 top-0 z-10 p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-xs w-52">
                  Choisissez si vous générez ce contrat en tant que personne physique ou en tant qu'entreprise.
                </div>
              )}
            </div>
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option: Personne physique */}
            <button
              type="button"
              onClick={() => handleEntityTypeSelect('physical_person')}
              className={`flex items-center p-4 border ${
                selectedEntityType === 'physical_person' 
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50' 
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              } rounded-lg transition-all duration-300 transform ${
                selectedEntityType === 'physical_person' ? 'scale-[1.02] shadow-md' : 'scale-100'
              } hover:shadow-md`}
            >
              <div className={`flex-shrink-0 mr-3 transition-all duration-300 ${
                selectedEntityType === 'physical_person' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg text-white shadow-sm' 
                  : 'text-gray-500'
              }`}>
                <User size={20} />
              </div>
              <div className="text-left">
                <span className={`font-medium ${selectedEntityType === 'physical_person' ? 'text-blue-700' : 'text-gray-700'}`}>
                  {userProfile?.physical_person?.prenom} {userProfile?.physical_person?.nom}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  Personne physique
                </span>
              </div>
              {selectedEntityType === 'physical_person' && (
                <div className="ml-auto">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                    <Check size={14} className="text-white" />
                  </div>
                </div>
              )}
            </button>
            
            {/* Option: Personne morale */}
            <button
              type="button"
              onClick={() => handleEntityTypeSelect('legal_entity')}
              className={`flex items-center p-4 border ${
                selectedEntityType === 'legal_entity' 
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50' 
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              } rounded-lg transition-all duration-300 transform ${
                selectedEntityType === 'legal_entity' ? 'scale-[1.02] shadow-md' : 'scale-100'
              } hover:shadow-md`}
            >
              <div className={`flex-shrink-0 mr-3 transition-all duration-300 ${
                selectedEntityType === 'legal_entity' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-lg text-white shadow-sm' 
                  : 'text-gray-500'
              }`}>
                <Building2 size={20} />
              </div>
              <div className="text-left">
                <span className={`font-medium ${selectedEntityType === 'legal_entity' ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {userProfile?.legal_entity?.nom}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  {userProfile?.legal_entity?.forme_juridique || 'Entreprise'}
                </span>
              </div>
              {selectedEntityType === 'legal_entity' && (
                <div className="ml-auto">
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-sm">
                    <Check size={14} className="text-white" />
                  </div>
                </div>
              )}
            </button>
          </div>
          
          <div className="flex items-center mt-4">
            <Info size={14} className="text-blue-500 mr-1" />
            <p className="text-xs text-gray-500">
              Ce choix détermine qui sera le cessionnaire des droits dans votre contrat.
            </p>
          </div>
        </div>
      )}
      
      {/* Champ de description avec design amélioré */}
      <div className="mb-8 bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
        <label htmlFor="project-description" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs font-bold shadow-sm">1</div>
          <span className="mr-1">De quel type de contenu s'agit-il ?</span>
          <div 
            className="text-gray-400 hover:text-blue-500 cursor-help transition-colors relative"
            onMouseEnter={() => setShowTooltip('description')}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <HelpCircle size={14} />
            {showTooltip === 'description' && (
              <div className="absolute left-full ml-2 top-0 z-10 p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-xs w-52">
                La description nous permet de comprendre votre besoin et de vous suggérer le type de contrat adapté.
              </div>
            )}
          </div>
        </label>
        <div className="relative mt-1">
          <textarea 
            id="project-description"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            rows="3"
            placeholder="Ex: Une vidéo où je me filme en train de jouer ma composition au piano"
            value={contractData.description_oeuvre}
            onChange={handleDescriptionChange}
          ></textarea>
          <button 
            className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:shadow-md transition-all items-center group hidden md:flex"
            onClick={handleAnalyzeProject}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                <span className="text-xs">Analyse...</span>
              </div>
            ) : (
              <>
                <Search size={14} className="mr-1 group-hover:animate-pulse" />
                <span className="text-xs">Analyser</span>
              </>
            )}
          </button>
        </div>
        
        {/* Bouton d'analyse pour mobile */}
        <button 
          className="mt-3 w-full p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:shadow-md transition-all flex items-center justify-center group md:hidden"
          onClick={handleAnalyzeProject}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <div className="flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
              <span className="text-sm">Analyse en cours...</span>
            </div>
          ) : (
            <>
              <Search size={16} className="mr-2 group-hover:animate-pulse" />
              <span className="text-sm">Analyser mon projet</span>
            </>
          )}
        </button>
        
        <div className="flex items-center mt-2">
          <Lightbulb size={14} className="text-amber-500 mr-1" />
          <p className="text-xs text-gray-500">
            Décrivez brièvement l'œuvre ou le contenu pour lequel vous souhaitez établir un contrat.
          </p>
        </div>
      </div>
      
      {/* Affichage de la suggestion avec un design amélioré */}
      {suggestion && (
        <div className="mb-8 relative">
          <div className="absolute -left-10 top-2 w-6 h-10 flex justify-center">
            <div className="h-full w-0.5 bg-blue-200"></div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 transition-all shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <Lightbulb size={18} className="text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Suggestion intelligente
                </h3>
                <div className="mt-1 text-sm text-gray-700">
                  <p>{suggestion}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Sélection du type de contrat avec un design amélioré */}
      <div className="mb-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
        <label className="text-sm font-medium text-gray-700 mb-4 flex items-center">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs font-bold shadow-sm">2</div>
          <span className="mr-1">Type de contrat nécessaire</span>
          <div 
            className="text-gray-400 hover:text-blue-500 cursor-help transition-colors relative"
            onMouseEnter={() => setShowTooltip('contractType')}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <HelpCircle size={14} />
            {showTooltip === 'contractType' && (
              <div className="absolute left-full ml-2 top-0 z-10 p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-xs w-52">
                Le type de contrat détermine les clauses qui seront incluses et les protections juridiques offertes.
              </div>
            )}
          </div>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTRACT_TYPES.map((type) => {
            const isSelected = contractData.type_contrat.includes(type.label);
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleContractTypeChange(type.id)}
                className={`flex items-center p-4 border ${
                  isSelected 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50' 
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                } rounded-lg transition-all duration-300 transform ${
                  isSelected ? 'scale-[1.02] shadow-md' : 'scale-100'
                } hover:shadow-md`}
              >
                <div className={`flex-shrink-0 mr-3 transition-all duration-300 ${
                  isSelected 
                    ? `bg-gradient-to-r ${type.color} p-2 rounded-lg text-white shadow-sm` 
                    : 'text-gray-500'
                }`}>
                  {type.icon}
                </div>
                <div className="text-left">
                  <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                    {type.label.split(' ')[0]}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {type.description}
                  </span>
                </div>
                {isSelected && (
                  <div className="ml-auto">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                      <Check size={14} className="text-white" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center mt-4">
          <Info size={14} className="text-blue-500 mr-1" />
          <p className="text-xs text-gray-500">
            Vous pouvez sélectionner plusieurs types de contrats si nécessaire. 
            <span className="text-blue-600 ml-1">Vos choix influenceront les clauses de votre contrat.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step1ProjectDescription; 