import React, { useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MessageCircle,
  MessagesSquare,
  Save,
  List,
  Highlighter,
  Keyboard
} from "lucide-react";

/**
 * Dock flottant pour l'éditeur de contrat
 * Version unifiée et adaptative pour tous les appareils
 */
const EditorFloatingDock = ({ 
  onFormat, 
  onSave, 
  onAddComment,
  onToggleComments,
  onToggleSections,
  showComments,
  showSections,
  onToggleKeyboard
}) => {
  // Détection de périphérique manuelle pour garantir la compatibilité
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false); // Pour les très petits écrans comme iPhone SE
  const [isTablet, setIsTablet] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [dockPosition, setDockPosition] = useState("bottom-16");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  // Détecter le type d'appareil et le système d'exploitation
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      const isMobileDevice = width <= 768 || /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallMobileDevice = width <= 375; // iPhone SE, petit iPhone
      const isTabletDevice = (width > 768 && width <= 1024) || 
                           (/iPad/i.test(navigator.userAgent) || 
                           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && !window.MSStream));
      const isIOSDevice = /iPad|iPhone|iPod/i.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      setIsMobile(isMobileDevice);
      setIsSmallMobile(isSmallMobileDevice);
      setIsTablet(isTabletDevice);
      setIsIOS(isIOSDevice);
    };
    
    detectDevice();
    window.addEventListener('resize', detectDevice);
    
    // Détecter les événements du clavier sur iOS
    if (isIOS) {
      // Utiliser visualViewport pour une meilleure détection du clavier sur iOS
      if (window.visualViewport) {
        const handleVisualViewportResize = () => {
          const viewportHeight = window.visualViewport.height;
          const windowHeight = window.innerHeight;
          
          // Si la hauteur du viewport est significativement inférieure à celle de la fenêtre
          if (viewportHeight < windowHeight * 0.8) {
            setKeyboardVisible(true);
            setDockPosition("bottom-80"); // Position plus élevée pour éviter le clavier
          } else {
            setKeyboardVisible(false);
            setDockPosition("bottom-16");
          }
        };
        
        window.visualViewport.addEventListener('resize', handleVisualViewportResize);
        
        return () => {
          window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
        };
      } else {
        // Fallback pour les anciens navigateurs
        window.addEventListener('focusin', () => {
          setKeyboardVisible(true);
          setDockPosition("bottom-80");
        });
        
        window.addEventListener('focusout', () => {
          setTimeout(() => {
            if (!document.activeElement || !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
              setKeyboardVisible(false);
              setDockPosition("bottom-16");
            }
          }, 100);
        });
        
        // Solution alternative pour détecter le clavier sur iOS
        const detectIOSKeyboard = () => {
          if (isIOS && window.innerHeight < window.outerHeight * 0.8) {
            setKeyboardVisible(true);
            setDockPosition("bottom-80");
          } else if (isIOS) {
            setKeyboardVisible(false);
            setDockPosition("bottom-16");
          }
        };
        
        window.addEventListener('resize', detectIOSKeyboard);
        
        return () => {
          window.removeEventListener('focusin', () => {});
          window.removeEventListener('focusout', () => {});
          window.removeEventListener('resize', detectIOSKeyboard);
        };
      }
    }
    
    return () => {
      window.removeEventListener('resize', detectDevice);
    };
  }, [isIOS]);
  
  // Obtenir le positionnement selon l'appareil et l'état du clavier
  const getDockPosition = () => {
    // Positionnement centré pour tous les appareils
    const basePosition = "fixed left-1/2 transform -translate-x-1/2";
    
    // Ajuster la position en fonction de la présence du clavier
    if (keyboardVisible && (isMobile || isTablet)) {
      return `${basePosition} ${dockPosition} z-50`;
    }
    
    // Position par défaut
    return `${basePosition} bottom-16 z-50`;
  };

  // Obtenir la taille des boutons selon le type d'appareil
  const getButtonSize = () => {
    if (isSmallMobile) return "h-7 w-7"; // Très petit écran (iPhone SE)
    if (isMobile) return "h-8 w-8";      // Mobile standard
    if (isTablet) return "h-9 w-9";      // Tablette
    return "h-10 w-10";                  // Desktop
  };

  // Obtenir la taille des icônes selon le type d'appareil
  const getIconSize = () => {
    if (isSmallMobile) return "h-3.5 w-3.5"; // Très petit écran
    if (isMobile) return "h-4 w-4";          // Mobile standard
    if (isTablet) return "h-4.5 w-4.5";      // Tablette
    return "h-5 w-5";                        // Desktop
  };

  // Outils de l'éditeur
  const basicEditorTools = [
    {
      title: "Gras",
      icon: <Bold className={`${getIconSize()} text-neutral-600`} />,
      action: 'bold'
    },
    {
      title: "Italique",
      icon: <Italic className={`${getIconSize()} text-neutral-600`} />,
      action: 'italic'
    },
    {
      title: "Souligné",
      icon: <Underline className={`${getIconSize()} text-neutral-600`} />,
      action: 'underline'
    },
    {
      title: "Surligner",
      icon: <Highlighter className={`${getIconSize()} text-amber-500`} />,
      action: 'highlight'
    }
  ];
  
  const alignmentTools = [
    {
      title: "Aligner à gauche",
      icon: <AlignLeft className={`${getIconSize()} text-neutral-600`} />,
      action: 'alignLeft'
    },
    {
      title: "Centrer",
      icon: <AlignCenter className={`${getIconSize()} text-neutral-600`} />,
      action: 'alignCenter'
    },
    {
      title: "Aligner à droite",
      icon: <AlignRight className={`${getIconSize()} text-neutral-600`} />,
      action: 'alignRight'
    }
  ];
  
  const specialTools = [
    {
      title: "Ajouter un commentaire",
      icon: <MessageCircle className={`${getIconSize()} text-yellow-500`} />,
      action: 'comment'
    },
    {
      title: showComments ? "Masquer commentaires" : "Voir commentaires",
      icon: <MessagesSquare className={`${getIconSize()} ${showComments ? 'text-blue-500' : 'text-blue-400'}`} />,
      action: 'toggleComments'
    },
    {
      title: showSections ? "Masquer sections" : "Voir sections",
      icon: <List className={`${getIconSize()} ${showSections ? 'text-blue-500' : 'text-neutral-600'}`} />,
      action: 'toggleSections'
    },
    {
      title: keyboardVisible ? "Masquer clavier" : "Afficher clavier",
      icon: keyboardVisible ? 
        <Keyboard className={`${getIconSize()} text-neutral-600 opacity-50`} /> : 
        <Keyboard className={`${getIconSize()} text-neutral-600`} />,
      action: 'toggleKeyboard',
      mobileOnly: true
    },
    {
      title: "Enregistrer",
      icon: <Save className={`${getIconSize()} text-green-600`} />,
      action: 'save'
    }
  ];
  
  // Créer une liste d'outils adaptée à l'appareil
  const getToolsForDevice = () => {
    let tools = [...basicEditorTools];
    
    // Sur très petit écran, limiter davantage le nombre d'outils mais inclure le surlignage
    if (isSmallMobile) {
      // Inclure les outils essentiels
      tools = [
        basicEditorTools[0], // Gras
        basicEditorTools[1], // Italique
        basicEditorTools[2], // Souligné
        basicEditorTools[3], // Surligner (ajouté pour tous les appareils)
        specialTools[0],     // Commentaire
        specialTools[3],     // Contrôle du clavier (ajouté pour tous les appareils)
        specialTools[4],     // Enregistrer
      ];
    }
    // Sur petit écran, limiter le nombre d'outils
    else if (isMobile && !isTablet) {
      // Ne pas inclure les alignements sur mobile standard mais garder le surlignage
      tools = [
        ...basicEditorTools, // Inclut maintenant le surlignage
        specialTools[0],     // Commentaire
        specialTools[1],     // Toggle commentaires
        specialTools[2],     // Toggle sections
        specialTools[3],     // Toggle clavier
        specialTools[4],     // Enregistrer
      ];
    }
    // Sur tablette et desktop, inclure tous les outils
    else {
      tools = [
        ...basicEditorTools,
        ...alignmentTools,
        ...specialTools.filter(tool => !tool.mobileOnly || (tool.mobileOnly && (isMobile || isTablet)))
      ];
    }
    
    return tools;
  };
  
  // Gérer les actions sur le dock
  const handleAction = (action) => {
    switch (action) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'highlight':
      case 'alignLeft':
      case 'alignCenter':
      case 'alignRight':
        onFormat(action);
        break;
      case 'comment':
        onAddComment();
        break;
      case 'toggleComments':
        onToggleComments();
        break;
      case 'toggleSections':
        onToggleSections();
        break;
      case 'toggleKeyboard':
        onToggleKeyboard();
        setKeyboardVisible(!keyboardVisible);
        break;
      case 'save':
        onSave();
        break;
      default:
        break;
    }
  };

  // Ajuster la taille et le style du dock en fonction de l'appareil
  const getDockStyle = () => {
    if (isSmallMobile) {
      // Style compact pour les très petits écrans
      return "shadow-lg border border-gray-200 bg-white/95 backdrop-blur-sm rounded-full p-0.5 flex items-center space-x-0.5";
    }
    if (isMobile) {
      // Style standard pour mobile
      return "shadow-lg border border-gray-200 bg-white/95 backdrop-blur-sm rounded-full p-1 flex items-center space-x-0.5";
    }
    // Style pour tablette et desktop
    return "shadow-lg border border-gray-200 bg-white/90 backdrop-blur-sm rounded-full p-1 flex items-center space-x-1";
  };

  return (
    <div className={`${getDockPosition()} ${getDockStyle()}`}>
      {getToolsForDevice().map((tool, index) => (
        <button
          key={index}
          className={`${getButtonSize()} flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors`}
          onClick={() => handleAction(tool.action)}
          title={tool.title}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};

export default EditorFloatingDock;