/**
 * Module de sélection d'images pour les dialogues
 * 
 * Ce module permet de déterminer quelle image de Saul afficher en fonction
 * du contenu textuel d'un message ou d'une configuration explicite.
 * 
 * GUIDE DE PERSONNALISATION :
 * ---------------------------
 * 1. Pour ajouter une nouvelle image:
 *    - Importez l'image en haut du fichier
 *    - Ajoutez-la au mapping d'images dans getMessageImage()
 *    - Optionnellement, ajoutez des mots-clés associés dans les tableaux ci-dessous
 * 
 * 2. Pour modifier les règles de sélection:
 *    - Modifiez les tableaux de mots-clés ci-dessous
 *    - Adaptez la logique dans selectSaulImage() si nécessaire
 */

// Importation statique des images
import saulOkImg from '../assets/images/saul/saul_ok.jpg';
import saulSourireImg from '../assets/images/saul/saul_sourire.jpg';
import saulPensifImg from '../assets/images/saul/saul_pensif.jpg';
import saulMotiveImg from '../assets/images/saul/saul_motive.jpg';

// Pour ajouter une nouvelle image, importez-la ici:
// import saulNouvelleExpressionImg from '../assets/images/saul/saul_nouvelle_expression.jpg';

/**
 * Analyse le texte d'un message et détermine l'image de Saul la plus appropriée.
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
  
  // Pour ajouter un nouveau type d'expression, créez un nouveau tableau de mots-clés:
  // const newExpressionKeywords = ['mot1', 'mot2', ...];
  
  // Vérifier si le texte contient des mots-clés pour Saul souriant
  if (happyKeywords.some(keyword => lowerText.includes(keyword))) {
    return saulSourireImg;
  }
  // Vérifier si le texte contient des mots-clés pour Saul pensif
  else if (pensiveKeywords.some(keyword => lowerText.includes(keyword))) {
    return saulPensifImg;
  }
  // Vérifier si le texte contient des mots-clés pour Saul motivé
  else if (motivatedKeywords.some(keyword => lowerText.includes(keyword))) {
    return saulMotiveImg;
  }
  
  // Pour ajouter une nouvelle expression, ajoutez une condition similaire:
  // else if (newExpressionKeywords.some(keyword => lowerText.includes(keyword))) {
  //   return saulNouvelleExpressionImg;
  // }
  
  // Image par défaut (Saul ok)
  return saulOkImg;
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
    return saulOkImg;
  }
  
  // Si une image spécifique est définie (autre que 'auto'), l'utiliser
  if (message.image && message.image !== 'auto') {
    // Mapping d'images pour éviter les imports dynamiques
    // Pour ajouter une nouvelle image, ajoutez-la à ce mapping
    const imageMap = {
      'saul_ok.jpg': saulOkImg,
      'saul_sourire.jpg': saulSourireImg,
      'saul_pensif.jpg': saulPensifImg,
      'saul_motive.jpg': saulMotiveImg
      // 'saul_nouvelle_expression.jpg': saulNouvelleExpressionImg
    };
    
    // Si c'est juste un nom de fichier sans chemin
    if (!message.image.includes('/')) {
      return imageMap[message.image] || saulOkImg;
    }
    
    // Pour les autres cas, revenir à l'image par défaut
    return saulOkImg;
  }
  
  // Sinon, sélectionner l'image en fonction du texte
  return selectSaulImage(message.text);
};

export default { selectSaulImage, getMessageImage }; 