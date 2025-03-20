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
  
  // Noms des fichiers d'images
  const saulOkImage = 'saul_ok.jpg';
  const saulSourireImage = 'saul_sourire.jpg';
  const saulPensifImage = 'saul_pensif.jpg';
  const saulMotiveImage = 'saul_motive.jpg';
  
  // Image par défaut (Saul ok)
  let imageName = saulOkImage;
  
  // Vérifier si le texte contient des mots-clés pour Saul souriant
  if (happyKeywords.some(keyword => lowerText.includes(keyword))) {
    imageName = saulSourireImage;
  }
  // Vérifier si le texte contient des mots-clés pour Saul pensif
  else if (pensiveKeywords.some(keyword => lowerText.includes(keyword))) {
    imageName = saulPensifImage;
  }
  // Vérifier si le texte contient des mots-clés pour Saul motivé
  else if (motivatedKeywords.some(keyword => lowerText.includes(keyword))) {
    imageName = saulMotiveImage;
  }
  
  // Utiliser require pour charger l'image dynamiquement
  try {
    return require(`../assets/images/saul/${imageName}`);
  } catch (error) {
    console.error(`Erreur lors du chargement de l'image: ${imageName}`, error);
    return require('../assets/images/saul/saul_ok.jpg');
  }
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
  if (!message) {
    return require('../assets/images/saul/saul_ok.jpg');
  }
  
  // Si une image spécifique est définie (autre que 'auto'), l'utiliser
  if (message.image && message.image !== 'auto') {
    try {
      // Si c'est juste un nom de fichier sans chemin
      if (!message.image.includes('/')) {
        return require(`../assets/images/saul/${message.image}`);
      }
      
      // Si c'est un chemin relatif qui commence par ../
      if (message.image.startsWith('../')) {
        return require(message.image);
      }
      
      // Sinon, on essaie de construire le chemin complet
      return require(`..${message.image}`);
    } catch (error) {
      console.error(`Erreur lors du chargement de l'image: ${message.image}`, error);
      return require('../assets/images/saul/saul_ok.jpg');
    }
  }
  
  // Sinon, sélectionner l'image en fonction du texte
  return selectSaulImage(message.text);
};

export default { selectSaulImage, getMessageImage }; 