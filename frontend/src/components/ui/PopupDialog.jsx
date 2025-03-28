import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, MessageSquare } from 'lucide-react';
import { getMessageImage } from '../../utils/logicImageSelector';

/**
 * Composant PopupDialog
 * 
 * Affiche une boîte de dialogue moderne avec un design épuré
 * et le texte qui s'affiche progressivement.
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.messages - Liste des messages à afficher
 * @param {Function} props.onClose - Fonction appelée lors de la fermeture du dialogue
 * @param {string} [props.title] - Titre optionnel du popup
 * @param {string} [props.theme] - Thème de couleur ('blue', 'yellow', etc.) - par défaut 'blue'
 * @param {string} [props.characterName] - Nom du personnage - par défaut 'SAUL'
 */
const PopupDialog = ({ messages, onClose, title, theme = 'blue', characterName = 'SAUL' }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const dialogRef = useRef(null);
  
  const currentMessage = messages[currentMessageIndex];
  const messagePath = getMessageImage(currentMessage);
  
  // Mapping des couleurs en fonction du thème
  const themeColors = {
    blue: {
      primary: 'bg-blue-600',
      lighter: 'bg-blue-50',
      lighterHover: 'hover:bg-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-800',
      accent: 'text-blue-600',
      shadow: 'rgba(37, 99, 235, 0.15)'
    },
    yellow: {
      primary: 'bg-amber-500',
      lighter: 'bg-amber-50',
      lighterHover: 'hover:bg-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-800',
      accent: 'text-amber-600',
      shadow: 'rgba(245, 158, 11, 0.15)'
    },
    green: {
      primary: 'bg-emerald-600',
      lighter: 'bg-emerald-50',
      lighterHover: 'hover:bg-emerald-100',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      accent: 'text-emerald-600',
      shadow: 'rgba(5, 150, 105, 0.15)'
    }
  };
  
  // Utiliser les couleurs du thème ou bleu par défaut
  const colors = themeColors[theme] || themeColors.blue;
  
  // Fermer le popup avec une animation de transition
  const handleClose = () => {
    setIsFadingOut(true);
    // Attendre la fin de l'animation avant de fermer
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  // Effet pour gérer le clic en dehors du dialogue
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        handleClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Effet pour l'animation de typing du texte
  useEffect(() => {
    if (!currentMessage) return;
    
    setDisplayedText('');
    setIsTypingComplete(false);
    
    let index = 0;
    const text = currentMessage.text;
    
    // Vitesse d'écriture en ms
    const typingSpeed = 25;
    
    const typingInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, typingSpeed);
    
    return () => clearInterval(typingInterval);
  }, [currentMessage]);
  
  // Passer au message suivant
  const handleNextMessage = () => {
    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  };
  
  // Accélérer l'affichage du texte en cas de clic
  const handleSpeedUpText = () => {
    if (!isTypingComplete) {
      setDisplayedText(currentMessage.text);
      setIsTypingComplete(true);
    } else {
      handleNextMessage();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity duration-300 ease-in-out">
      <div 
        ref={dialogRef}
        className={`relative w-full max-w-xl bg-white rounded-xl overflow-hidden shadow-xl transform transition-all duration-300 ${
          isFadingOut ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
        style={{
          boxShadow: `0 10px 25px -5px ${colors.shadow}, 0 8px 10px -6px ${colors.shadow}`,
          maxHeight: '90vh'
        }}
      >
        {/* En-tête avec titre (si fourni) */}
        {title && (
          <div className={`px-4 sm:px-6 py-3 sm:py-4 ${colors.lighter} border-b ${colors.border} flex justify-between items-center`}>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
              <MessageSquare className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${colors.accent}`} />
              {title}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        )}
        
        {/* Corps du dialogue - design moderne */}
        <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: title ? 'calc(90vh - 56px)' : '90vh' }}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-5">
            {/* Image avec effet de carte */}
            <div className="relative flex-shrink-0 w-20 sm:w-24 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-3 shadow-sm border border-gray-200 mb-2 sm:mb-0">
              <img 
                src={messagePath} 
                alt={characterName} 
                className="w-full h-auto object-contain mb-2" 
              />
              {/* Badge du personnage */}
              <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 ${colors.primary} text-white text-xs font-medium rounded-full whitespace-nowrap`}>
                {characterName}
              </div>
            </div>
            
            {/* Contenu */}
            <div className="flex-grow w-full">
              {/* Bouton fermer (si pas de titre) */}
              {!title && (
                <div className="flex justify-end mb-2">
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    aria-label="Fermer"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              
              {/* Bulle de texte */}
              <div 
                className={`${colors.lighter} p-3 sm:p-4 rounded-lg ${colors.border} cursor-pointer mb-3 sm:mb-4 border shadow-sm`}
                onClick={handleSpeedUpText}
              >
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed min-h-[4rem]">
                  {displayedText}
                  {!isTypingComplete && (
                    <span className="inline-block w-2 h-4 ml-0.5 bg-gray-400 opacity-75 animate-blink"></span>
                  )}
                </p>
              </div>
              
              {/* Navigation et progression */}
              <div className="flex justify-between items-center">
                {/* Indicateur de progression */}
                <div className="flex space-x-1">
                  {messages.map((_, index) => (
                    <div 
                      key={index}
                      className={`h-1.5 w-4 sm:w-8 rounded-full transition-colors duration-300 ${
                        index === currentMessageIndex 
                          ? colors.primary
                          : index < currentMessageIndex 
                            ? 'bg-gray-300' 
                            : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Bouton de navigation */}
                <button
                  onClick={handleNextMessage}
                  disabled={!isTypingComplete}
                  className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none ${
                    isTypingComplete 
                      ? `${colors.primary} text-white hover:opacity-90 shadow-sm`
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {currentMessageIndex < messages.length - 1 ? (
                    <>
                      Suivant
                      <ChevronRight size={16} className="ml-1" />
                    </>
                  ) : (
                    'Terminer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupDialog; 