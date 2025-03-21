import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { getMessageImage } from '../../utils/logicImageSelector';

/**
 * Composant PopupDialog
 * 
 * Affiche une boîte de dialogue minimaliste avec l'image de Saul
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
  const dialogRef = useRef(null);
  
  const currentMessage = messages[currentMessageIndex];
  // L'image est maintenant importée dynamiquement via require()
  const messagePath = getMessageImage(currentMessage);
  
  // Mapping des couleurs en fonction du thème
  const themeColors = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-100', 
      text: 'text-blue-800',
      accent: 'bg-blue-600',
      button: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
      shadow: 'rgba(59, 130, 246, 0.3), 0 8px 10px -6px rgba(59, 130, 246, 0.2)'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-100',
      text: 'text-yellow-800',
      accent: 'bg-yellow-600',
      button: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-200',
      shadow: 'rgba(255, 193, 7, 0.3), 0 8px 10px -6px rgba(255, 193, 7, 0.2)'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-800',
      accent: 'bg-green-600',
      button: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200',
      shadow: 'rgba(16, 185, 129, 0.3), 0 8px 10px -6px rgba(16, 185, 129, 0.2)'
    }
  };
  
  // Utiliser les couleurs du thème ou bleu par défaut
  const colors = themeColors[theme] || themeColors.blue;
  
  // Effet pour gérer le clic en dehors du dialogue
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
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
      onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div 
        ref={dialogRef}
        className="relative max-w-md w-full mx-4 bg-white rounded-lg overflow-hidden transform transition-all animate-fadeIn"
        style={{
          boxShadow: `0 10px 25px -5px ${colors.shadow}`
        }}
      >
        {/* En-tête avec titre (si fourni) */}
        {title && (
          <div className={`px-5 py-3 ${colors.bg} border-b ${colors.border}`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-sm font-semibold ${colors.text}`}>{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
        
        {/* Corps du dialogue - design minimaliste */}
        <div className="p-5">
          <div className="flex items-start">
            {/* Image de Saul avec nom en style RPG */}
            <div className="flex flex-col items-center flex-shrink-0 mr-4 w-20">
              <img 
                src={messagePath} 
                alt={characterName} 
                className="w-20 h-20 object-contain mb-1" 
              />
              {/* Nom sous l'image */}
              <div className={`px-2 py-0.5 ${colors.accent} text-white text-xs font-semibold rounded-sm w-full text-center`}>
                {characterName}
              </div>
            </div>
            
            {/* Contenu */}
            <div className="flex-grow">
              {/* Bouton fermer (si pas de titre) */}
              {!title && (
                <div className="flex justify-end mb-1">
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Fermer"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              
              {/* Bulle de texte */}
              <div 
                className={`${colors.bg} p-4 rounded-lg border ${colors.border} cursor-pointer mb-3`}
                onClick={handleSpeedUpText}
              >
                <p className="text-gray-800 leading-relaxed min-h-[3rem]">
                  {displayedText}
                  {!isTypingComplete && <span className="animate-pulse ml-0.5">▌</span>}
                </p>
              </div>
              
              {/* Indicateur de progression (facultatif) */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-1">
                  {messages.map((_, index) => (
                    <div 
                      key={index}
                      className={`h-1.5 w-5 rounded-full ${
                        index === currentMessageIndex 
                          ? colors.accent 
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
                  className={`px-3 py-1.5 text-sm rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme}-500 ${
                    isTypingComplete 
                      ? colors.button
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  }`}
                  disabled={!isTypingComplete}
                >
                  {currentMessageIndex < messages.length - 1 ? 'Suite' : 'Fermer'}
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