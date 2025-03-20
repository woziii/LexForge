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
  
  // Import des images (chemin relatif à partir de src)
  const saulOkImage = require('../assets/images/saul/saul_ok.jpg');
  const saulSourireImage = require('../assets/images/saul/saul_sourire.jpg');
  const saulPensifImage = require('../assets/images/saul/saul_pensif.jpg');
  const saulMotiveImage = require('../assets/images/saul/saul_motive.jpg');
  
  // Image par défaut (Saul ok)
  let imagePath = saulOkImage;
  
  // Vérifier si le texte contient des mots-clés pour Saul souriant
  if (happyKeywords.some(keyword => lowerText.includes(keyword))) {
    imagePath = saulSourireImage;
  }
  // Vérifier si le texte contient des mots-clés pour Saul pensif
  else if (pensiveKeywords.some(keyword => lowerText.includes(keyword))) {
    imagePath = saulPensifImage;
  }
  // Vérifier si le texte contient des mots-clés pour Saul motivé
  else if (motivatedKeywords.some(keyword => lowerText.includes(keyword))) {
    imagePath = saulMotiveImage;
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
  // Import de l'image par défaut
  const defaultImage = require('../assets/images/saul/saul_ok.jpg');
  
  if (!message) return defaultImage;
  
  // Si une image spécifique est définie (autre que 'auto'), l'utiliser
  if (message.image && message.image !== 'auto') {
    try {
      return require(`..${message.image}`);
    } catch (error) {
      console.error(`Impossible de charger l'image: ${message.image}`);
      return defaultImage;
    }
  }
  
  // Sinon, sélectionner l'image en fonction du texte
  return selectSaulImage(message.text);
};

export default { selectSaulImage, getMessageImage }; 