import React, { useState } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import useDeviceDetect from '../../hooks/useDeviceDetect';

/**
 * Navigateur de sections pour l'éditeur de contrat
 * Version responsive qui s'adapte à toutes les tailles d'écran
 */
const EditorSectionNavigator = ({ sections, activeSectionId, onNavigate, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Utiliser notre hook responsive
  const screen = useDeviceDetect();
  // Pour la compatibilité avec le code existant
  const isMobile = screen.isSmallScreen || screen.isMediumScreen;
  
  // Filtrer les sections selon la recherche
  const filteredSections = sections.filter(section => 
    !searchTerm || section.text.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Tronquer le texte pour l'affichage
  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Nettoyer le texte HTML pour l'affichage
  const cleanHtml = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };
  
  // Définir la taille des éléments selon la taille d'écran
  const getElementSize = () => {
    if (screen.isSmallScreen) return {
      fontSize: 'text-xs',
      padding: 'p-3',
      iconSize: 14
    };
    if (screen.isMediumScreen) return {
      fontSize: 'text-sm',
      padding: 'p-3',
      iconSize: 16
    };
    if (screen.isLargeScreen) return {
      fontSize: 'text-sm sm:text-base',
      padding: 'p-4',
      iconSize: 18
    };
    return {
      fontSize: 'text-base',
      padding: 'p-4',
      iconSize: 20
    };
  };
  
  const { fontSize, padding, iconSize } = getElementSize();
  
  return (
    <div className="bg-white h-full flex flex-col overflow-hidden border-r border-gray-200">
      <div className={`${padding} border-b border-gray-200`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className={`font-medium text-gray-800 ${fontSize}`}>Sections</h3>
          {isMobile && (
            <button 
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              aria-label="Fermer"
            >
              <X size={iconSize} />
            </button>
          )}
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={iconSize - 2} className="text-gray-400" />
          </div>
          <input
            type="text"
            className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${fontSize}`}
            placeholder="Rechercher une section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setSearchTerm('')}
              aria-label="Effacer la recherche"
            >
              <X size={iconSize - 2} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredSections.length > 0 ? (
          <div className="py-2">
            {filteredSections.map((section) => (
              <button
                key={section.id || section.index}
                className={`w-full text-left px-4 py-2.5 flex justify-between items-center hover:bg-gray-50 transition-colors ${
                  activeSectionId === section.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                } ${fontSize}`}
                onClick={() => {
                  onNavigate(section.id || `section-${section.index}`);
                  if (isMobile) onClose();
                }}
              >
                <span className="block truncate flex-1 pr-2">
                  {truncateText(cleanHtml(section.text), screen.isSmallScreen ? 30 : 40)}
                </span>
                <ChevronRight size={iconSize - 2} className="text-gray-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className={`py-8 px-4 text-center text-gray-500 ${fontSize}`}>
            {searchTerm ? 'Aucun résultat trouvé' : 'Aucune section disponible'}
          </div>
        )}
      </div>
      
      {isMobile && (
        <div className={`${padding} border-t border-gray-200`}>
          <button
            onClick={onClose}
            className={`w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md ${fontSize} transition-colors`}
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
};

export default EditorSectionNavigator;