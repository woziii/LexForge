import { useState, useEffect } from 'react';

/**
 * Hook personnalisé simplifié pour détecter le type d'appareil
 * @returns {Object} Informations sur l'appareil
 */
const useDeviceDetect = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isIOS: false,
    hasTouchScreen: false
  });

  useEffect(() => {
    // Fonction de détection
    const detectDevice = () => {
      // Détection de base basée sur la largeur d'écran
      const width = window.innerWidth;
      const isMobile = width <= 768;
      const isTablet = width > 768 && width <= 1024;
      const isDesktop = width > 1024;
      
      // Détection améliorée avec User-Agent
      const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTabletUA = /iPad/i.test(navigator.userAgent) || 
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && !window.MSStream);
      
      // Combiner les approches pour une détection plus fiable
      const isMobileDevice = isMobile || (isMobileUA && !isTabletUA);
      const isTabletDevice = isTablet || isTabletUA;
      const isDesktopDevice = isDesktop && !isMobileUA && !isTabletUA;
      
      // Détection de iOS
      const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // Détection d'écran tactile
      const hasTouchScreen = ('ontouchstart' in window) || 
                           (navigator.maxTouchPoints > 0) || 
                           (navigator.msMaxTouchPoints > 0);
      
      setDevice({
        isMobile: isMobileDevice,
        isTablet: isTabletDevice,
        isDesktop: isDesktopDevice,
        isIOS: isIOS,
        hasTouchScreen: hasTouchScreen
      });
    };
    
    // Détection initiale
    detectDevice();
    
    // Réagir aux changements de taille d'écran
    window.addEventListener('resize', detectDevice);
    
    // Nettoyage
    return () => {
      window.removeEventListener('resize', detectDevice);
    };
  }, []);

  return device;
};

export default useDeviceDetect;