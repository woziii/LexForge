import React, { useState, useEffect } from 'react';

/**
 * Composant qui crée un masque sur toute l'interface sauf sur l'élément ciblé
 * 
 * @param {string} targetId - ID de l'élément à mettre en évidence
 * @param {boolean} active - Si le masque est actif
 */
const MaskOverlay = ({ targetId, active }) => {
  const [cutout, setCutout] = useState(null);

  useEffect(() => {
    if (!active || !targetId) return;

    const calculateCutout = () => {
      const element = document.getElementById(targetId);
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      setCutout({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    };

    calculateCutout();
    
    // Recalculer si la fenêtre change de taille
    window.addEventListener('resize', calculateCutout);
    
    // Recalculer périodiquement pour s'adapter aux changements de position
    const interval = setInterval(calculateCutout, 1000);
    
    return () => {
      window.removeEventListener('resize', calculateCutout);
      clearInterval(interval);
    };
  }, [targetId, active]);

  if (!active || !cutout) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div 
        className="absolute transition-all duration-300 ease-in-out"
        style={{
          top: `${cutout.top - 5}px`,
          left: `${cutout.left - 5}px`,
          width: `${cutout.width + 10}px`,
          height: `${cutout.height + 10}px`,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 193, 7, 0.8)',
          borderRadius: '4px',
          animation: 'pulse-border 1.5s infinite'
        }}
      >
        <style jsx>{`
          @keyframes pulse-border {
            0% { border-color: rgba(255, 193, 7, 0.8); }
            50% { border-color: rgba(255, 193, 7, 0.4); }
            100% { border-color: rgba(255, 193, 7, 0.8); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default MaskOverlay; 