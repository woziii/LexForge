import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour détecter les dimensions de l'écran et adapter l'interface
 * Une approche responsive qui ne dépend plus de la détection d'appareils spécifiques
 * @returns {Object} Informations sur les dimensions et caractéristiques de l'écran
 */
const useDeviceDetect = () => {
  const [screen, setScreen] = useState({
    // Propriétés basées sur des breakpoints responsive
    isSmallScreen: false,    // < 480px (petit mobile)
    isMediumScreen: false,   // 480px-768px (mobile standard)
    isLargeScreen: false,    // 768px-1024px (tablette)
    isExtraLargeScreen: false, // > 1024px (desktop)
    
    // Propriétés utiles pour l'expérience utilisateur
    hasTouchScreen: false,
    hasHoverCapability: false,
    
    // Pour compatibilité avec le code existant (à supprimer progressivement)
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isIOS: false,
    
    // Dimensions actuelles
    width: 0,
    height: 0
  });

  useEffect(() => {
    // Fonction de détection basée sur les dimensions
    const detectScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Déterminer les propriétés responsive basées sur des breakpoints
      const isSmallScreen = width < 480;
      const isMediumScreen = width >= 480 && width < 768;
      const isLargeScreen = width >= 768 && width < 1024;
      const isExtraLargeScreen = width >= 1024;
      
      // Propriétés d'expérience utilisateur
      const hasTouchScreen = ('ontouchstart' in window) || 
                           (navigator.maxTouchPoints > 0) || 
                           (navigator.msMaxTouchPoints > 0);
      const hasHoverCapability = window.matchMedia('(hover: hover)').matches;
      
      // Pour compatibilité avec le code existant
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      setScreen({
        isSmallScreen,
        isMediumScreen,
        isLargeScreen,
        isExtraLargeScreen,
        hasTouchScreen,
        hasHoverCapability,
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        width,
        height
      });
    };
    
    // Détection initiale
    detectScreenSize();
    
    // Réagir aux changements de taille d'écran
    window.addEventListener('resize', detectScreenSize);
    
    // Nettoyage
    return () => {
      window.removeEventListener('resize', detectScreenSize);
    };
  }, []);

  return screen;
};

export default useDeviceDetect;