import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { getMessageImage } from '../../utils/logicImageSelector';
import { editorTutorialData, contractsTutorialData } from '../../data';
import MaskOverlay from './MaskOverlay';

/**
 * Composant TutorialPopup
 * 
 * Affiche un popup de tutoriel avec l'image de Saul et du texte
 * qui s'affiche progressivement, adapté au contexte spécifique.
 * De plus, met en évidence les éléments de l'interface mentionnés.
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.context - Le contexte du tutoriel ('editor' ou 'contracts')
 * @param {Function} props.onClose - Fonction appelée lors de la fermeture du dialogue
 */
const TutorialPopup = ({ context, onClose }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const dialogRef = useRef(null);
  
  // Sélection des messages en fonction du contexte
  const messages = context === 'editor' ? editorTutorialData.messages : contractsTutorialData.messages;
  
  const currentMessage = messages[currentMessageIndex];
  const messagePath = getMessageImage(currentMessage);
  
  // Récupérer l'ID de l'élément à mettre en évidence
  const highlightId = currentMessage?.highlight || null;
  
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
  
  // Titre du tutoriel en fonction du contexte
  const tutorialTitle = context === 'editor' 
    ? "Tutoriel de l'éditeur"
    : "Tutoriel des contrats";
  
  return (
    <>
      {/* Masque interactif qui met en évidence l'élément ciblé */}
      <MaskOverlay targetId={highlightId} active={isTypingComplete} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div 
          ref={dialogRef}
          className="relative max-w-md w-full mx-4 bg-white rounded-lg overflow-hidden transform transition-all animate-fadeIn"
          style={{
            boxShadow: '0 10px 25px -5px rgba(255, 193, 7, 0.3), 0 8px 10px -6px rgba(255, 193, 7, 0.2)'
          }}
        >
          {/* En-tête avec titre */}
          <div className="px-5 py-3 bg-yellow-50 border-b border-yellow-100">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-yellow-800">{tutorialTitle}</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Corps du dialogue - design minimaliste */}
          <div className="p-5">
            <div className="flex items-start">
              {/* Image de Saul avec nom en style RPG */}
              <div className="flex flex-col items-center flex-shrink-0 mr-4 w-20">
                <img 
                  src={messagePath} 
                  alt="Saul" 
                  className="w-20 h-20 object-contain mb-1" 
                />
                {/* Nom sous l'image */}
                <div className="px-2 py-0.5 bg-yellow-600 text-white text-xs font-semibold rounded-sm w-full text-center">
                  SAUL
                </div>
              </div>
              
              {/* Contenu */}
              <div className="flex-grow">
                {/* Bulle de texte */}
                <div 
                  className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 cursor-pointer mb-3"
                  onClick={handleSpeedUpText}
                >
                  <p className="text-gray-800 leading-relaxed min-h-[3rem]">
                    {displayedText}
                    {!isTypingComplete && <span className="animate-pulse ml-0.5">▌</span>}
                  </p>
                </div>
                
                {/* Indicateur de progression */}
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    {messages.map((_, index) => (
                      <div 
                        key={index}
                        className={`h-1.5 w-5 rounded-full ${
                          index === currentMessageIndex 
                            ? 'bg-yellow-500' 
                            : index < currentMessageIndex 
                              ? 'bg-yellow-300' 
                              : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Bouton de navigation */}
                  <button
                    onClick={handleNextMessage}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                      isTypingComplete 
                        ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    }`}
                    disabled={!isTypingComplete}
                  >
                    {currentMessageIndex < messages.length - 1 ? 'Suite' : 'Terminer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorialPopup; 