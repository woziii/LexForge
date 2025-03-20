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
 */
const PopupDialog = ({ messages, onClose }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dialogRef = useRef(null);
  
  const currentMessage = messages[currentMessageIndex];
  const messagePath = getMessageImage(currentMessage);
  
  // Réinitialiser l'état d'erreur d'image à chaque changement de message
  useEffect(() => {
    setImageError(false);
  }, [currentMessageIndex]);
  
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
  
  // Gestion des erreurs de chargement d'image
  const handleImageError = () => {
    console.error(`Erreur de chargement de l'image: ${messagePath}`);
    setImageError(true);
  };
  
  // Chemin absolu de l'image en cas d'erreur
  const getAbsoluteImagePath = () => {
    const baseFileName = messagePath.split('/').pop();
    const baseUrl = window.location.origin;
    return `${baseUrl}/assets/images/saul/${baseFileName}`;
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div 
        ref={dialogRef}
        className="relative max-w-md w-full mx-4 bg-white rounded-lg overflow-hidden transform transition-all animate-fadeIn"
        style={{
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3), 0 8px 10px -6px rgba(59, 130, 246, 0.2)'
        }}
      >
        {/* Corps du dialogue - design minimaliste */}
        <div className="p-5">
          <div className="flex items-start">
            {/* Image de Saul avec nom en style RPG */}
            <div className="flex flex-col items-center flex-shrink-0 mr-4 w-20">
              {!imageError ? (
                <img 
                  src={messagePath}
                  alt="Saul" 
                  className="w-20 h-20 object-contain mb-1" 
                  onError={handleImageError}
                />
              ) : (
                <img 
                  src={getAbsoluteImagePath()}
                  alt="Saul" 
                  className="w-20 h-20 object-contain mb-1"
                  onError={() => console.error("Impossible de charger l'image même avec le chemin absolu")}
                />
              )}
              {/* Nom sous l'image */}
              <div className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-sm w-full text-center">
                SAUL
              </div>
            </div>
            
            {/* Contenu */}
            <div className="flex-grow">
              {/* Bouton fermer */}
              <div className="flex justify-end mb-1">
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Bulle de texte */}
              <div 
                className="bg-gray-50 p-4 rounded-lg border border-gray-100 cursor-pointer mb-3"
                onClick={handleSpeedUpText}
              >
                <p className="text-gray-800 leading-relaxed min-h-[3rem]">
                  {displayedText}
                  {!isTypingComplete && <span className="animate-pulse ml-0.5">▌</span>}
                </p>
              </div>
              
              {/* Bouton de navigation */}
              <div className="flex justify-end">
                <button
                  onClick={handleNextMessage}
                  className={`px-3 py-1.5 text-sm rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isTypingComplete 
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200' 
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