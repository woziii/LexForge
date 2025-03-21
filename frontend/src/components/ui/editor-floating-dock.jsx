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
import useDeviceDetect from "../../hooks/useDeviceDetect";

/**
 * Dock flottant pour l'éditeur de contrat
 * Version responsive qui s'adapte automatiquement à la taille de l'écran
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
  // Utiliser notre hook responsive amélioré
  const screen = useDeviceDetect();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [dockPosition, setDockPosition] = useState("bottom-16");
  
  // Détection du clavier virtuel (particulièrement important sur iOS)
  useEffect(() => {
    // Ne configurer la détection du clavier que sur les appareils mobiles avec iOS
    if (screen.isIOS && screen.hasTouchScreen) {
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
          if (screen.isIOS && window.innerHeight < window.outerHeight * 0.8) {
            setKeyboardVisible(true);
            setDockPosition("bottom-80");
          } else if (screen.isIOS) {
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
  }, [screen.isIOS, screen.hasTouchScreen]);
  
  // Obtenir le positionnement selon la taille d'écran et l'état du clavier
  const getDockPosition = () => {
    // Positionnement centré pour tous les appareils
    const basePosition = "fixed left-1/2 transform -translate-x-1/2";
    
    // Ajuster la position en fonction de la présence du clavier
    if (keyboardVisible && (screen.isSmallScreen || screen.isMediumScreen || screen.isLargeScreen)) {
      return `${basePosition} ${dockPosition} z-50`;
    }
    
    // Position par défaut
    return `${basePosition} bottom-16 z-50`;
  };

  // Obtenir la taille des boutons selon la taille d'écran
  const getButtonSize = () => {
    if (screen.isSmallScreen) return "h-7 w-7";             // Très petit écran (<480px)
    if (screen.isMediumScreen) return "h-8 w-8";            // Mobile standard (480px-768px)
    if (screen.isLargeScreen) return "h-9 w-9";             // Tablette (768px-1024px)
    return "h-10 w-10";                                     // Desktop (>1024px)
  };

  // Obtenir la taille des icônes selon la taille d'écran
  const getIconSize = () => {
    if (screen.isSmallScreen) return "h-3.5 w-3.5";         // Très petit écran (<480px)
    if (screen.isMediumScreen) return "h-4 w-4";            // Mobile standard (480px-768px)
    if (screen.isLargeScreen) return "h-4.5 w-4.5";         // Tablette (768px-1024px)
    return "h-5 w-5";                                       // Desktop (>1024px)
  };

  // Outils de l'éditeur
  const basicEditorTools = [
    {
      title: "Gras",
      icon: <Bold className={`${getIconSize()} text-blue-600`} />,
      action: 'bold'
    },
    {
      title: "Italique",
      icon: <Italic className={`${getIconSize()} text-green-600`} />,
      action: 'italic'
    },
    {
      title: "Souligné",
      icon: <Underline className={`${getIconSize()} text-indigo-600`} />,
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
      icon: <AlignLeft className={`${getIconSize()} text-gray-600`} />,
      action: 'alignLeft'
    },
    {
      title: "Centrer",
      icon: <AlignCenter className={`${getIconSize()} text-gray-600`} />,
      action: 'alignCenter'
    },
    {
      title: "Aligner à droite",
      icon: <AlignRight className={`${getIconSize()} text-gray-600`} />,
      action: 'alignRight'
    }
  ];
  
  const specialTools = [
    {
      title: "Ajouter un commentaire",
      icon: <MessageCircle className={`${getIconSize()} text-yellow-600`} />,
      action: 'comment'
    },
    {
      title: showComments ? "Masquer commentaires" : "Voir commentaires",
      icon: <MessagesSquare className={`${getIconSize()} ${showComments ? 'text-blue-600' : 'text-blue-400'}`} />,
      action: 'toggleComments'
    },
    {
      title: showSections ? "Masquer sections" : "Voir sections",
      icon: <List className={`${getIconSize()} ${showSections ? 'text-purple-600' : 'text-purple-400'}`} />,
      action: 'toggleSections'
    },
    {
      title: keyboardVisible ? "Masquer clavier" : "Afficher clavier",
      icon: keyboardVisible ? 
        <Keyboard className={`${getIconSize()} text-gray-600 opacity-50`} /> : 
        <Keyboard className={`${getIconSize()} text-gray-600`} />,
      action: 'toggleKeyboard',
      touchOnly: true // Disponible uniquement sur les appareils tactiles
    },
    {
      title: "Enregistrer",
      icon: <Save className={`${getIconSize()} text-green-600`} />,
      action: 'save'
    }
  ];
  
  // Créer une liste d'outils adaptée à la taille d'écran
  const getToolsForScreenSize = () => {
    let tools = [...basicEditorTools];
    
    // Sur très petit écran (<480px), limiter davantage le nombre d'outils
    if (screen.isSmallScreen) {
      // Inclure les outils essentiels
      tools = [
        basicEditorTools[0], // Gras
        basicEditorTools[1], // Italique
        basicEditorTools[2], // Souligné
        basicEditorTools[3], // Surligner
        specialTools[0],     // Commentaire
        screen.hasTouchScreen ? specialTools[3] : null, // Contrôle du clavier (uniquement si écran tactile)
        specialTools[4],     // Enregistrer
      ].filter(Boolean); // Supprimer les éléments null
    }
    // Sur écran moyen (480px-768px), limiter le nombre d'outils
    else if (screen.isMediumScreen) {
      // Ne pas inclure les alignements
      tools = [
        ...basicEditorTools,
        specialTools[0], // Commentaire
        specialTools[1], // Toggle commentaires
        screen.hasTouchScreen ? specialTools[3] : null, // Contrôle du clavier (uniquement si écran tactile)
        specialTools[4], // Enregistrer
      ].filter(Boolean); // Supprimer les éléments null
    } 
    // Sur grand écran (768px-1024px), inclure presque tous les outils
    else if (screen.isLargeScreen) {
      tools = [
        ...basicEditorTools,
        ...alignmentTools,
        ...specialTools.filter(tool => !tool.touchOnly || screen.hasTouchScreen)
      ];
    }
    // Sur très grand écran (>1024px), inclure tous les outils
    else {
      tools = [
        ...basicEditorTools,
        ...alignmentTools,
        ...specialTools.filter(tool => !tool.touchOnly || screen.hasTouchScreen)
      ];
    }
    
    return tools;
  };
  
  // Gérer les actions des différents outils
  const handleAction = (action) => {
    switch (action) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'highlight':
      case 'alignLeft':
      case 'alignCenter':
      case 'alignRight':
        if (onFormat) onFormat(action);
        break;
      case 'comment':
        if (onAddComment) onAddComment();
        break;
      case 'toggleComments':
        if (onToggleComments) onToggleComments();
        break;
      case 'toggleSections':
        if (onToggleSections) onToggleSections();
        break;
      case 'toggleKeyboard':
        if (onToggleKeyboard) onToggleKeyboard();
        break;
      case 'save':
        if (onSave) onSave();
        break;
      default:
        break;
    }
  };
  
  // Obtenir le style du dock en fonction de la taille d'écran
  const getDockStyle = () => {
    let baseStyle = {
      backgroundColor: "white",
      borderRadius: "9999px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0.5rem"
    };
    
    // Responsively adjust spacing
    if (screen.isSmallScreen) {
      return {
        ...baseStyle,
        padding: "0.25rem",
        gap: "0.25rem"
      };
    } else if (screen.isMediumScreen) {
      return {
        ...baseStyle,
        padding: "0.375rem",
        gap: "0.375rem"
      };
    } else if (screen.isLargeScreen) {
      return {
        ...baseStyle,
        padding: "0.5rem",
        gap: "0.5rem"
      };
    } else {
      return {
        ...baseStyle,
        padding: "0.625rem",
        gap: "0.625rem"
      };
    }
  };
  
  const tools = getToolsForScreenSize();
  
  return (
    <div className={getDockPosition()} style={getDockStyle()}>
      {tools.map((tool, index) => (
        <button
          key={index}
          className={`${getButtonSize()} rounded-full bg-white hover:bg-gray-50 flex items-center justify-center`}
          onClick={() => handleAction(tool.action)}
          title={tool.title}
          id={tool.action === 'save' ? 'floating-dock-save-button' : undefined}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};

export default EditorFloatingDock;