import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { getMessageImage } from '../../utils/logicImageSelector';
import { editorTutorialData, contractsTutorialData, profileTutorialData } from '../../data';
import MaskOverlay from './MaskOverlay';

/**
 * Composant TutorialPopup
 * 
 * Affiche un popup de tutoriel avec l'image de Saul et du texte
 * qui s'affiche progressivement, adapté au contexte spécifique.
 * De plus, met en évidence les éléments de l'interface mentionnés.
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.context - Le contexte du tutoriel ('editor', 'contracts' ou 'profile')
 * @param {Function} props.onClose - Fonction appelée lors de la fermeture du dialogue
 * @param {Object} [props.tutorialData] - Données de tutoriel personnalisées (optionnel)
 */
const TutorialPopup = ({ context, onClose, tutorialData }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dialogRef = useRef(null);
  
  // Sélection des messages en fonction du contexte ou utilisation des données fournies
  let messages;
  if (tutorialData) {
    messages = tutorialData.messages;
  } else {
    // Fallback sur les données par défaut selon le contexte
    if (context === 'editor') {
      messages = editorTutorialData.messages;
    } else if (context === 'contracts') {
      messages = contractsTutorialData.messages;
    } else if (context === 'profile') {
      messages = profileTutorialData.messages;
    } else {
      messages = [];
    }
  }

  // Animation d'entrée
  useEffect(() => {
    // Délai pour permettre au DOM de charger
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);
  
  const currentMessage = messages?.[currentMessageIndex] || null;
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
    : context === 'contracts' 
      ? "Tutoriel des contrats"
      : "Tutoriel du profil";
  
  return (
    <>
      {/* Masque interactif qui met en évidence l'élément ciblé */}
      <MaskOverlay targetId={highlightId} active={isTypingComplete} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div 
          ref={dialogRef}
          className={`relative max-w-xl w-full mx-4 bg-white rounded-xl overflow-hidden transform transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          style={{
            boxShadow: '0 15px 35px -5px rgba(255, 193, 7, 0.4), 0 10px 15px -6px rgba(255, 193, 7, 0.3)'
          }}
        >
          {/* En-tête avec titre stylisé */}
          <div className="px-6 py-4 bg-gradient-to-r from-yellow-100 to-yellow-50 border-b border-yellow-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-yellow-500 p-1.5 rounded-md">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-yellow-800">{tutorialTitle}</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Corps du dialogue - design amélioré */}
          <div className="p-6">
            <div className="flex items-start gap-6">
              {/* Image de Saul avec effet de carte */}
              <div className="flex flex-col items-center flex-shrink-0 w-28 bg-yellow-50 p-2 rounded-lg border border-yellow-100 shadow-sm">
                <img 
                  src={messagePath} 
                  alt="Saul" 
                  className="w-24 h-24 object-contain mb-2" 
                />
                {/* Badge du personnage */}
                <div className="px-3 py-1 bg-yellow-600 text-white text-xs font-semibold rounded-md w-full text-center shadow-sm transform -translate-y-1">
                  SAUL
                </div>
              </div>
              
              {/* Contenu */}
              <div className="flex-grow">
                {/* Bulle de texte */}
                <div 
                  className="bg-yellow-50 px-5 py-4 rounded-xl border-2 border-yellow-100 cursor-pointer mb-4 shadow-sm"
                  onClick={handleSpeedUpText}
                >
                  <p className="text-gray-800 text-base leading-relaxed min-h-[4.5rem]">
                    {displayedText}
                    {!isTypingComplete && <span className="animate-pulse ml-0.5 h-5 w-2 bg-yellow-500 inline-block rounded-sm">▌</span>}
                  </p>
                </div>
                
                {/* Indicateur de progression */}
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1.5">
                    {messages.map((_, index) => (
                      <div 
                        key={index}
                        className={`h-2 w-7 rounded-full transition-all duration-300 ${
                          index === currentMessageIndex 
                            ? 'bg-yellow-500 scale-110' 
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
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                      isTypingComplete 
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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