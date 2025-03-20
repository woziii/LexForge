import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import useDeviceDetect from '../../hooks/useDeviceDetect';

/**
 * Dock flottant amélioré optimisé pour desktop, iPad et iPhone
 * Version adaptée et spécialisée pour l'éditeur de contrat
 */
const EnhancedFloatingDock = ({
  items,
  onItemClick,
  className = '',
  position = 'bottom', // 'bottom', 'left', 'right'
  appearance = 'auto' // 'auto', 'light', 'dark'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [orientation, setOrientation] = useState('horizontal');
  const dockRef = useRef(null);
  const device = useDeviceDetect();
  
  // État pour suivre la position du pointer
  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);
  
  // Effet de ressort fluide
  const springConfig = { mass: 0.1, stiffness: 150, damping: 12 };
  
  // Détecter l'orientation de l'écran
  useEffect(() => {
    const handleResize = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      
      // Adapter l'orientation selon le device et la position
      if (device.isMobile) {
        setOrientation(position === 'bottom' ? 'horizontal' : 'vertical');
      } else if (device.isTablet) {
        setOrientation(isPortrait && position !== 'bottom' ? 'vertical' : 'horizontal');
      } else {
        setOrientation('horizontal'); // Toujours horizontal sur desktop
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [position, device]);
  
  // Gérer le mouvement du pointeur
  const handlePointerMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };
  
  // Réinitialiser lorsque le pointeur quitte la zone
  const handlePointerLeave = () => {
    mouseX.set(Infinity);
    mouseY.set(Infinity);
  };
  
  // Calculer le thème en fonction de l'apparence demandée
  const getThemeClass = () => {
    if (appearance === 'light') return 'dock-light';
    if (appearance === 'dark') return 'dock-dark';
    
    // Mode auto - détecter à partir du media query prefers-color-scheme
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dock-dark' : 'dock-light';
  };
  
  // Positionnement du dock
  const getDockPositionClass = () => {
    if (position === 'left') return 'dock-left';
    if (position === 'right') return 'dock-right';
    return 'dock-bottom';
  };
  
  // Rendu mobile différent (bouton + panel)
  if (device.isMobile) {
    return (
      <div className={`floating-dock mobile ${getDockPositionClass()} ${getThemeClass()} ${className}`}>
        {isOpen ? (
          <motion.div
            className="dock-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="dock-items">
              {items.map((item, idx) => (
                <motion.button
                  key={item.id || idx}
                  className="dock-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: idx * 0.05 }
                  }}
                  onClick={() => {
                    onItemClick?.(item.action);
                    if (item.closeOnClick) setIsOpen(false);
                  }}
                  title={item.label}
                >
                  {item.icon}
                </motion.button>
              ))}
            </div>
            
            <motion.button
              className="dock-close"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setIsOpen(false)}
            >
              <CloseIcon />
            </motion.button>
          </motion.div>
        ) : (
          <motion.button
            className="dock-toggle"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            <MenuIcon />
          </motion.button>
        )}
      </div>
    );
  }
  
  // Version iPad/Desktop avec effet de hover
  return (
    <motion.div
      ref={dockRef}
      className={`floating-dock ${orientation} ${getDockPositionClass()} ${getThemeClass()} ${className}`}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      {items.map((item, idx) => (
        <DockIcon
          key={item.id || idx}
          item={item}
          mouseX={mouseX}
          mouseY={mouseY}
          orientation={orientation}
          springConfig={springConfig}
          onClick={() => onItemClick?.(item.action)}
        />
      ))}
    </motion.div>
  );
};

// Composant pour un icône individuel dans le dock
const DockIcon = ({ item, mouseX, mouseY, orientation, springConfig, onClick }) => {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculer la distance par rapport à la souris
  const distance = useTransform(orientation === 'horizontal' ? mouseX : mouseY, (val) => {
    if (!ref.current) return 0;
    const rect = ref.current.getBoundingClientRect();
    const center = orientation === 'horizontal' 
      ? rect.left + rect.width / 2
      : rect.top + rect.height / 2;
    return val - center;
  });
  
  // Transformation de taille basée sur la distance
  const widthTransform = useTransform(
    distance, 
    [-100, 0, 100], 
    orientation === 'horizontal' ? [40, 60, 40] : [40, 40, 40]
  );
  
  const heightTransform = useTransform(
    distance, 
    [-100, 0, 100], 
    orientation === 'horizontal' ? [40, 60, 40] : [40, 60, 40]
  );
  
  // Appliquer un effet de ressort pour une animation fluide
  const width = useSpring(widthTransform, springConfig);
  const height = useSpring(heightTransform, springConfig);
  
  // Transformation des icônes
  const iconScale = useTransform(
    distance,
    [-100, 0, 100],
    [0.8, 1.2, 0.8]
  );
  
  const iconSpring = useSpring(iconScale, springConfig);
  
  return (
    <motion.button
      ref={ref}
      className="dock-item"
      style={{ 
        width: width,
        height: height
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      title={item.label}
    >
      <motion.div 
        className="icon-container"
        style={{ scale: iconSpring }}
      >
        {item.icon}
      </motion.div>
      
      {/* Tooltip */}
      {isHovered && (
        <motion.div
          className="dock-tooltip"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {item.label}
        </motion.div>
      )}
    </motion.button>
  );
};

// Icônes d'UI
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="8" x2="20" y2="8"></line>
    <line x1="4" y1="16" x2="20" y2="16"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default EnhancedFloatingDock;