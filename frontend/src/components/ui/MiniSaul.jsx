import React, { useState, useEffect } from 'react';
import WelcomePopup from './WelcomePopup';
import { Bell } from 'lucide-react';
import { updateData } from '../../data';

/**
 * Composant MiniSaul
 * 
 * Affiche une cloche qui, au clic, montre le popup de bienvenue avec Saul.
 */
const MiniSaul = () => {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [hasVisitedBefore, setHasVisitedBefore] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  // Ajouter le style d'animation au montage du composant
  useEffect(() => {
    const styleId = 'mini-saul-style';
    
    // Vérifier si le style existe déjà
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        @keyframes shake-bell {
          0%, 100% { transform: rotate(0); }
          20% { transform: rotate(8deg); }
          40% { transform: rotate(-8deg); }
          60% { transform: rotate(4deg); }
          80% { transform: rotate(-4deg); }
        }
        .animate-shake {
          animation: shake-bell 1.2s ease-in-out infinite;
        }
        
        .bell-shadow {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {};
  }, []);
  
  // Charger les données et vérifier la visite
  useEffect(() => {
    // Vérifier s'il y a des notifications non lues (pour l'indicateur visuel)
    const hasUnreadMessages = updateData.messages.some(msg => !msg.read);
    setHasUnread(hasUnreadMessages);
    
    // Vérifier si l'utilisateur a déjà vu le popup de bienvenue
    const visited = localStorage.getItem('hasVisitedLexForge');
    setHasVisitedBefore(!!visited);
    
    // Afficher la cloche après un court délai
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Au clic sur la cloche, ouvrir le popup de bienvenue
  const handleClick = () => {
    setShowWelcomePopup(true);
    setHasUnread(false); // On marque comme lu quand même
  };
  
  // Fermer le popup de bienvenue
  const handleCloseWelcome = () => {
    setShowWelcomePopup(false);
  };
  
  // Ne pas afficher si on n'a pas encore visité et que la cloche n'est pas visible
  if (!isVisible && !hasVisitedBefore) {
    return null;
  }
  
  return (
    <>
      {/* Cloche de notification flottante dans le coin inférieur droit */}
      <button
        onClick={handleClick}
        className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-white to-blue-50 shadow-lg flex items-center justify-center overflow-hidden hover:scale-110 transition-transform duration-200 border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        style={{
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15), 0 2px 4px rgba(37, 99, 235, 0.1)',
        }}
        title="Revoir la présentation de LexForge par Saul"
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Cloche avec effet 3D */}
          <div className={`relative z-10 ${hasUnread ? 'animate-shake' : ''}`}>
            <div className="absolute top-0 left-0 w-full h-full bell-shadow">
              <Bell size={26} strokeWidth={1.5} className="text-blue-400" />
            </div>
            <Bell 
              size={26} 
              strokeWidth={hasUnread ? 2 : 1.5} 
              className={`${hasUnread ? 'text-blue-600' : 'text-blue-500'}`} 
              style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))' }}
            />
          </div>
          
          {/* Pastille rouge si notification non lue */}
          {hasUnread && (
            <span className="absolute top-1 right-1.5 h-4 w-4 rounded-full bg-red-500 border-2 border-white animate-pulse shadow-sm" 
                  style={{ transform: 'translate(25%, -25%)' }}
            />
          )}
          
          {/* Effet de lueur et reflet 3D */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 via-white to-blue-100 opacity-50"></div>
          <div className="absolute inset-0 rounded-full animate-ping-slow bg-blue-100 opacity-30"></div>
          <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full bg-gradient-to-b from-white to-transparent opacity-80"></div>
        </div>
      </button>
      
      {/* Popup de bienvenue au clic sur la cloche */}
      {showWelcomePopup && (
        <WelcomePopup 
          forceShow={true} 
          onClose={handleCloseWelcome} 
        />
      )}
    </>
  );
};

export default MiniSaul; 