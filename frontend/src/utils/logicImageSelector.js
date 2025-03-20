/**
 * Analyse le texte d'un message et détermine l'image de Saul la plus appropriée.
 * Retourne le chemin de l'image correspondant au contexte du message.
 * 
 * @param {string} text - Le texte du message à analyser
 * @returns {string} - Le chemin de l'image correspondante
 */
export const selectSaulImage = (text) => {
  // Convertir le texte en minuscules pour une comparaison insensible à la casse
  const lowerText = text.toLowerCase();
  
  // Mots-clés pour Saul souriant (nouveautés, bonnes nouvelles)
  const happyKeywords = ['nouveau', 'nouveauté', 'ajouté', 'fonctionnalité', 'amélioré', 'bienvenue', 'félicitations', '🎉'];
  
  // Mots-clés pour Saul pensif (changements, mises à jour)
  const pensiveKeywords = ['mise à jour', 'changement', 'modification', 'important', 'attention', 'pensez à', 'savais-tu'];
  
  // Mots-clés pour Saul motivé (appels à l'action)
  const motivatedKeywords = ['découvre', 'essaye', 'lance-toi', 'teste', 'explore', 'à toi de jouer', 'c\'est à toi', '🚀'];
  
  // Image par défaut (Saul ok)
  let imagePath = 'https://lexforge.vercel.app/assets/images/saul/saul_ok.jpg';
  
  // Vérifier si le texte contient des mots-clés pour Saul souriant
  if (happyKeywords.some(keyword => lowerText.includes(keyword))) {
    imagePath = 'https://lexforge.vercel.app/assets/images/saul/saul_sourire.jpg';
  }
  // Vérifier si le texte contient des mots-clés pour Saul pensif
  else if (pensiveKeywords.some(keyword => lowerText.includes(keyword))) {
    imagePath = 'https://lexforge.vercel.app/assets/images/saul/saul_pensif.jpg';
  }
  // Vérifier si le texte contient des mots-clés pour Saul motivé
  else if (motivatedKeywords.some(keyword => lowerText.includes(keyword))) {
    imagePath = 'https://lexforge.vercel.app/assets/images/saul/saul_motive.jpg';
  }
  
  return imagePath;
};

/**
 * Traite un message et retourne le chemin de l'image approprié.
 * Si 'image' est 'auto', l'image est déterminée en fonction du contenu du texte.
 * Sinon, utilise l'image spécifiée dans le message.
 * 
 * @param {Object} message - Le message à traiter
 * @returns {string} - Le chemin de l'image à afficher
 */
export const getMessageImage = (message) => {
  if (!message) return 'https://lexforge.vercel.app/assets/images/saul/saul_ok.jpg';
  
  // Si une image spécifique est définie (autre que 'auto'), l'utiliser
  if (message.image && message.image !== 'auto') {
    // Si l'image commence déjà par http, on la retourne telle quelle
    if (message.image.startsWith('http')) {
      return message.image;
    }
    // Sinon, on construit l'URL complète
    return `https://lexforge.vercel.app${message.image}`;
  }
  
  // Sinon, sélectionner l'image en fonction du texte
  return selectSaulImage(message.text);
};

export default { selectSaulImage, getMessageImage }; 