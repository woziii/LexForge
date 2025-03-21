import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import TutorialPopup from './TutorialPopup';

/**
 * Composant TutorialLightbulb
 * 
 * Affiche une icône d'ampoule qui, lorsqu'on clique dessus,
 * ouvre un tutoriel adapté à un contexte spécifique.
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.context - Le contexte du tutoriel ('editor' ou 'contracts')
 * @param {string} props.className - Classes CSS supplémentaires
 * @param {string} props.id - Identifiant HTML optionnel pour référencement
 */
const TutorialLightbulb = ({ context, className = '', id = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Ouvre le popup de tutoriel
  const handleClick = () => {
    setIsOpen(true);
  };
  
  // Ferme le popup de tutoriel
  const handleClose = () => {
    setIsOpen(false);
  };

  // Classe de base pour le bouton
  const buttonBaseClass = "relative rounded-full p-2.5 text-yellow-600 hover:text-yellow-500 hover:bg-yellow-50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300";
  
  // Combine la classe de base avec les classes personnalisées
  const buttonClass = `${buttonBaseClass} ${className}`;
  
  return (
    <div className="relative">
      {/* Bouton ampoule */}
      <button
        id={id}
        onClick={handleClick}
        className={buttonClass}
        aria-label="Tutoriel"
        title="Aide & Tutoriel"
      >
        <Lightbulb size={20} strokeWidth={1.75} />
      </button>
      
      {/* Popup de tutoriel */}
      {isOpen && (
        <TutorialPopup 
          context={context}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default TutorialLightbulb; 