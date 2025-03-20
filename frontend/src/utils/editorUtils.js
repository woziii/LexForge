/**
 * Utilitaires pour l'éditeur de contrats
 */

/**
 * Détermine la classe CSS appropriée en fonction du style de l'élément
 * @param {string} styleType - Type de style (ContractTitle, ContractText, etc.)
 * @returns {string} - Classe CSS correspondante
 */
export const getElementStyle = (styleType) => {
    switch (styleType) {
      case 'ContractTitle':
        return 'pdf-title';
      case 'ContractSubtitle':
        return 'pdf-subtitle';
      case 'ContractArticle':
        return 'pdf-article';
      case 'ContractSubArticle':
        return 'pdf-subarticle';
      case 'ContractText':
        return 'pdf-text';
      default:
        return 'pdf-text';
    }
  };
  
  /**
   * Extrait le texte brut d'un contenu HTML
   * @param {string} html - Contenu HTML
   * @returns {string} - Texte extrait
   */
  export const extractTextFromHTML = (html) => {
    if (!html) return '';
    
    // Créer un élément temporaire
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;
    return tempElement.textContent || tempElement.innerText || '';
  };
  
  /**
   * Tronque un texte à une longueur maximale
   * @param {string} text - Texte à tronquer
   * @param {number} maxLength - Longueur maximale
   * @returns {string} - Texte tronqué
   */
  export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
  };
  
  /**
   * Calcule et retourne les sections d'un document
   * @param {Array} elements - Éléments du contrat
   * @param {Object} editedElements - Éléments modifiés
   * @returns {Array} - Liste des sections
   */
  export const getSections = (elements, editedElements = {}) => {
    if (!elements || !Array.isArray(elements)) return [];
    
    const sections = [];
    elements.forEach((element, index) => {
      if (element.type === 'paragraph' && element.style === 'ContractArticle') {
        const text = editedElements[index] !== undefined ? editedElements[index] : element.text;
        sections.push({
          id: `section-${index}`,
          index,
          text: extractTextFromHTML(text)
        });
      }
    });
    
    return sections;
  };
  
  export default {
    getElementStyle,
    extractTextFromHTML,
    truncateText,
    getSections
  };