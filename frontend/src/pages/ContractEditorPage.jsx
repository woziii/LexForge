import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, Save, CheckCircle, AlertCircle, 
  MessageCircle, X, Type, List, ChevronUp, Keyboard, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, FileUp, Loader, Check, FileText, Lightbulb
} from 'lucide-react';
import { getContractById, getContractElements, updateContract, generatePdf, exportContract, generateEditorPdf } from '../services/api';
import EditorFloatingDock from '../components/ui/editor-floating-dock';
import EditorSectionNavigator from '../components/editor/EditorSectionNavigator';
import EditorCommentPanel from '../components/editor/EditorCommentPanel';
import useDeviceDetect from '../hooks/useDeviceDetect';
import ExportModal from '../components/ExportModal';
import { TutorialLightbulb, TutorialPopup } from '../components/ui';

/**
 * Page d'édition de contrat améliorée
 * Optimisée pour desktop, iPad et iPhone avec fonctionnalités avancées
 */
const ContractEditorPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  
  // Références
  const editorRef = useRef(null);
  const editorContainerRef = useRef(null);
  const elementRefs = useRef({});
  
  // États principaux
  const [contractData, setContractData] = useState(null);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, success, error
  const [errorMessage, setErrorMessage] = useState(null);
  
  // États de l'éditeur
  const [selectedElementIndex, setSelectedElementIndex] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // small, normal, large
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // États des commentaires
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(true);
  
  // États des sections
  const [showSections, setShowSections] = useState(true);
  
  // États du clavier
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // États des popups et modals
  const [isOpen, setIsOpen] = useState(false); // Tutoriel
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); // Modal d'exportation
  const [contractToExport, setContractToExport] = useState(null);
  
  // États principaux
  const [contractElements, setContractElements] = useState([]);
  const [editedElements, setEditedElements] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [elementsLoading, setElementsLoading] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [comments, setComments] = useState([]);
  const [savedNotification, setSavedNotification] = useState(false);
  const [notification, setNotification] = useState(null);
  const [toolbarPosition, setToolbarPosition] = useState({ visible: false, x: 0, y: 0 });
  
  // Utiliser notre hook responsive pour la détection d'écran
  const screen = useDeviceDetect();
  // Variables pour la compatibilité avec le code existant
  const isMobile = screen.isMobile;
  const isTablet = screen.isTablet;
  const isIOS = screen.isIOS;
  
  // Détecter et gérer les événements du clavier sur iOS
  useEffect(() => {
    if (!isIOS) return;
    
    const handleVisualViewportResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        
        // Si la hauteur du viewport est significativement inférieure à celle de la fenêtre, le clavier est probablement visible
        if (viewportHeight < windowHeight * 0.8) {
          setKeyboardVisible(true);
          
          // Faire défiler pour garder l'élément actif visible
          const activeElement = document.activeElement;
          if (activeElement && ['INPUT', 'TEXTAREA', '[contenteditable]'].some(
            selector => activeElement.matches(selector) || activeElement.closest(selector)
          )) {
            setTimeout(() => {
              activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }
        } else {
          setKeyboardVisible(false);
        }
      }
    };
    
    window.addEventListener('resize', handleVisualViewportResize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportResize);
    }
    
    return () => {
      window.removeEventListener('resize', handleVisualViewportResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
      }
    };
  }, [isIOS]);
  
  // Récupérer les informations du contrat
  useEffect(() => {
    const fetchContract = async () => {
      try {
        setIsLoading(true);
        const contractData = await getContractById(contractId);
        setContractData(contractData);
        setTitle(contractData.title);
        setErrorMessage(null);
      } catch (error) {
        console.error('Error fetching contract:', error);
        setErrorMessage('Impossible de récupérer le contrat. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContract();
  }, [contractId]);
  
  // Récupérer les éléments du contrat pour l'éditeur
  useEffect(() => {
    const fetchContractElements = async () => {
      if (!contractData) return;
      
      try {
        setElementsLoading(true);
        const response = await getContractElements(contractId);
        setContractElements(response.elements);
        
        // Charger les commentaires depuis le backend
        if (response.comments && Array.isArray(response.comments)) {
          setComments(response.comments);
        } else {
          setComments([]);
        }
        
        setErrorMessage(null);
      } catch (error) {
        console.error('Error fetching contract elements:', error);
        setErrorMessage('Impossible de récupérer les éléments du contrat. Veuillez réessayer plus tard.');
      } finally {
        setElementsLoading(false);
      }
    };
    
    fetchContractElements();
  }, [contractData, contractId]);
  
  // Observer les sections visibles pour mettre à jour la navigation
  useEffect(() => {
    if (!editorContainerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section-id');
            if (sectionId) {
              setActiveSectionId(sectionId);
            }
          }
        });
      },
      { threshold: 0.3, root: editorContainerRef.current }
    );
    
    // Observer toutes les sections
    document.querySelectorAll('[data-section-id]').forEach(section => {
      observer.observe(section);
    });
    
    return () => observer.disconnect();
  }, [contractElements, elementsLoading]);
  
  // Surveiller les changements de sélection pour afficher la barre d'outils flottante
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      
      if (!selection.rangeCount) {
        setToolbarPosition({ visible: false, x: 0, y: 0 });
        return;
      }
      
      const range = selection.getRangeAt(0);
      
      // Ne rien faire si la sélection est vide
      if (range.collapsed) {
        setToolbarPosition({ visible: false, x: 0, y: 0 });
        return;
      }
      
      // Trouver l'élément éditable parent
      let editableParent = range.commonAncestorContainer;
      while (editableParent && !editableParent.hasAttribute?.('data-element-index')) {
        editableParent = editableParent.parentNode;
      }
      
      if (editableParent) {
        const index = parseInt(editableParent.getAttribute('data-element-index'));
        setSelectedElementIndex(index);
        
        // Sur iPhone et iPad, ne pas afficher la barre flottante (on utilise le dock)
        // if (isMobile || isTablet) return;
        
        // Positionner la barre d'outils au-dessus de la sélection
        const rect = range.getBoundingClientRect();
        setToolbarPosition({
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
      }
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isMobile, isTablet]);
  
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  
  const handleSave = async () => {
    try {
      // Ajouter les commentaires aux données mises à jour
      await updateContract(contractId, { 
        title,
        updatedElements: editedElements,
        comments: comments
      });
      
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 3000);
    } catch (error) {
      console.error('Error saving contract:', error);
      setErrorMessage('Impossible de sauvegarder le contrat. Veuillez réessayer plus tard.');
    }
  };
  
  const handleShareContract = async () => {
    if (!contractId) return;
    
    // Ouvrir le modal d'exportation au lieu de la boîte de dialogue de confirmation
    setIsExportModalOpen(true);
  };
  
  const handleExport = async (customFilename) => {
    try {
      // Afficher une notification de chargement
      setNotification({
        type: 'info',
        message: 'Préparation du contrat pour l\'export...'
      });
      
      // Sauvegarder d'abord pour s'assurer que toutes les modifications sont prises en compte
      await handleSave();
      
      // Exporter le contrat avec le nom de fichier personnalisé
      await exportContract(contractId, customFilename);
      
      // Fermer le modal
      setIsExportModalOpen(false);
      
      // Afficher une notification de succès
      setNotification({
        type: 'success',
        message: 'Contrat exporté avec succès'
      });
      
      // Masquer la notification après 3 secondes
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error exporting contract:', error);
      
      // Afficher une notification d'erreur
      setNotification({
        type: 'error',
        message: 'Erreur lors de l\'exportation du contrat'
      });
    }
  };
  
  const handleDownloadPdf = async () => {
    try {
      setNotification({
        type: 'info',
        message: 'Génération du PDF en cours...'
      });
      
      // Utiliser la nouvelle fonction pour générer un PDF à partir de l'éditeur
      await generateEditorPdf(editorContainerRef, title);
      
      setNotification({
        type: 'success',
        message: 'PDF généré avec succès!'
      });
      
      // Masquer la notification après quelques secondes
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF', error);
      setNotification({
        type: 'error',
        message: "Impossible de générer le PDF du contrat."
      });
      
      // Masquer la notification d'erreur après quelques secondes
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };
  
  const handleGoBack = () => {
    navigate('/contracts');
  };
  
  const handleElementChange = (index, newText) => {
    // Garder une trace des éléments modifiés
    setEditedElements({
      ...editedElements,
      [index]: newText
    });
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (editorRef.current.requestFullscreen) {
        editorRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  const handleElementClick = (index, e) => {
    // Éviter de traiter les clics sur les handles ou les boutons
    if (e && (
      e.target.closest('.drag-handle') || 
      e.target.closest('button') ||
      e.target.tagName === 'BUTTON'
    )) {
      return;
    }
    
    setSelectedElementIndex(index);
  };
  
  // Gérer la navigation vers une section
  const handleNavigateToSection = (sectionId) => {
    const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (sectionElement && editorContainerRef.current) {
      editorContainerRef.current.scrollTo({
        top: sectionElement.offsetTop - 80,
        behavior: 'smooth'
      });
      
      // Mettre en évidence la section temporairement
      sectionElement.classList.add('section-highlight');
      setTimeout(() => {
        sectionElement.classList.remove('section-highlight');
      }, 2000);
      
      // Fermer le panneau des sections sur mobile
      if (isMobile) {
        setShowSections(false);
      }
    }
  };
  
  /**
   * Applique le formatage au texte sélectionné
   */
  const applyFormatting = (format) => {
    if (selectedElementIndex === null) return;
    
    // Récupérer l'élément sélectionné
    const element = contractElements[selectedElementIndex];
    if (element && element.type === 'paragraph') {
      const text = editedElements[selectedElementIndex] || element.text;
      
      let newText = text;
      
      // Obtenir la sélection de texte actuelle
      const selection = window.getSelection();
      
      // Si une partie du texte est sélectionnée
      if (selection && selection.toString().length > 0) {
        const selectedText = selection.toString();
        
        // Appliquer le formatage uniquement au texte sélectionné
        switch (format) {
          case 'bold':
            // Vérifier si le texte est déjà en gras
            if (text.includes(`<strong>${selectedText}</strong>`)) {
              // Enlever le formatage gras
              newText = text.replace(`<strong>${selectedText}</strong>`, selectedText);
            } else {
              // Ajouter le formatage gras
              newText = text.replace(selectedText, `<strong>${selectedText}</strong>`);
            }
            break;
          case 'italic':
            // Vérifier si le texte est déjà en italique
            if (text.includes(`<em>${selectedText}</em>`)) {
              // Enlever le formatage italique
              newText = text.replace(`<em>${selectedText}</em>`, selectedText);
            } else {
              // Ajouter le formatage italique
              newText = text.replace(selectedText, `<em>${selectedText}</em>`);
            }
            break;
          case 'underline':
            // Vérifier si le texte est déjà souligné
            if (text.includes(`<u>${selectedText}</u>`)) {
              // Enlever le soulignement
              newText = text.replace(`<u>${selectedText}</u>`, selectedText);
            } else {
              // Ajouter le soulignement
              newText = text.replace(selectedText, `<u>${selectedText}</u>`);
            }
            break;
          case 'highlight':
            // Vérifier si le texte est déjà surligné
            if (text.includes(`<mark>${selectedText}</mark>`)) {
              // Enlever le surlignage
              newText = text.replace(`<mark>${selectedText}</mark>`, selectedText);
            } else {
              // Ajouter le surlignage
              newText = text.replace(selectedText, `<mark>${selectedText}</mark>`);
            }
            break;
          case 'alignLeft':
            // Ajouter l'alignement à gauche
            newText = `<div style="text-align: left;">${text}</div>`;
            break;
          case 'alignCenter':
            // Ajouter le centrage
            newText = `<div style="text-align: center;">${text}</div>`;
            break;
          case 'alignRight':
            // Ajouter l'alignement à droite
            newText = `<div style="text-align: right;">${text}</div>`;
            break;
          default:
            break;
        }
      }
      
      handleElementChange(selectedElementIndex, newText);
      
      // Masquer la barre d'outils après un court délai
      setTimeout(() => {
        setToolbarPosition({ visible: false, x: 0, y: 0 });
      }, 300);
    }
  };
  
  const moveElement = (index, direction) => {
    if (index === null) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= contractElements.length) return;
    
    // Créer une copie de l'array d'éléments
    const newElements = [...contractElements];
    
    // Échanger les éléments
    [newElements[index], newElements[newIndex]] = [newElements[newIndex], newElements[index]];
    
    // Mettre à jour l'état
    setContractElements(newElements);
    setSelectedElementIndex(newIndex);
  };
  
  const changeFontSize = (size) => {
    setFontSize(size);
    setShowSettings(false);
  };
  
  const updateComment = (commentId, newText) => {
    // Mettre à jour un commentaire existant
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? {...comment, text: newText, date: new Date().toISOString()}
          : comment
      )
    );
  };
  
  const deleteComment = (commentId) => {
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    setComments(updatedComments);
  };
  
  const handleAddComment = () => {
    if (selectedElementIndex === null) return;
    
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    // Créer un nouveau commentaire
    const newComment = {
      id: Date.now().toString(),
      elementIndex: selectedElementIndex,
      text: "",
      date: new Date().toISOString(),
      user: "Utilisateur",
      selectedText: selectedText,
      isEditing: true
    };
    
    setComments([...comments, newComment]);
    setShowComments(true);
  };
  
  // Toggle de l'affichage des commentaires
  const toggleComments = () => {
    setShowComments(!showComments);
    // Fermer les sections si on ouvre les commentaires sur mobile
    if (isMobile && !showComments) {
      setShowSections(false);
    }
  };
  
  // Toggle de l'affichage des sections
  const toggleSections = () => {
    setShowSections(!showSections);
    // Fermer les commentaires si on ouvre les sections sur mobile
    if (isMobile && !showSections) {
      setShowComments(false);
    }
  };
  
  // Toggle du clavier virtuel
  const toggleKeyboard = () => {
    if (isIOS || isMobile) {
      // Sur iOS, nous devons simuler le focus/blur pour ouvrir/fermer le clavier
      const activeElement = document.activeElement;
      
      if (keyboardVisible) {
        // Fermer le clavier en retirant le focus
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      } else {
        // Chercher l'élément actuellement sélectionné ou le premier élément éditable
        const elementToFocus = document.querySelector(`[data-element-index="${selectedElementIndex}"] [contenteditable="true"]`) || 
                             document.querySelector('[contenteditable="true"]');
        
        if (elementToFocus) {
          elementToFocus.focus();
          
          // Positionner le curseur à la fin du texte
          const range = document.createRange();
          const selection = window.getSelection();
          
          range.selectNodeContents(elementToFocus);
          range.collapse(false); // false pour la fin du texte
          
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      
      setKeyboardVisible(!keyboardVisible);
    }
  };
  
  // Obtenir les sections pour la navigation
  const getSections = () => {
    const sections = [];
    contractElements.forEach((element, index) => {
      if (element.type === 'paragraph' && element.style === 'ContractArticle') {
        const text = editedElements[index] || element.text;
        sections.push({
          id: `section-${index}`,
          index,
          text: text
        });
      }
    });
    return sections;
  };
  
  // Vérifier si un élément a des commentaires
  const getElementComments = (index) => {
    return comments.filter(comment => comment.elementIndex === index);
  };
  
  // Déterminer la classe de style pour un élément
  const getElementStyle = (styleType) => {
    switch (styleType) {
      case 'ContractTitle':
        return 'pdf-title';
      case 'ContractSubtitle':
        return 'pdf-subtitle';
      case 'ContractArticle':
        return 'pdf-article';
      case 'ContractSubArticle':
        return 'pdf-subarticle';
      case 'ContractText':
        return 'pdf-text';
      default:
        return 'pdf-text';
    }
  };
  
  // Mise en page optimisée pour le rendu PDF
  const pdfStyles = `
    /* Fonts pour correspondre aux polices du PDF */
    @import url('https://fonts.googleapis.com/css2?family=Bitter:wght@400;700&display=swap');
    
    .pdf-viewer {
      font-family: 'Bitter', serif;
      color: #000;
      line-height: 1.5;
      font-size: 10pt;
      text-align: justify;
      max-width: 210mm; /* Largeur A4 */
      padding: 15mm; /* Marge identique au PDF */
      background-color: white;
      margin: 0 auto;
    }
    
    .pdf-title {
      font-family: 'Bitter', serif;
      font-weight: 700;
      font-size: 14pt;
      text-align: center;
      margin-bottom: 10pt;
    }
    
    .pdf-subtitle {
      font-family: 'Bitter', serif;
      font-weight: 700;
      font-size: 12pt;
      text-align: center;
      margin-bottom: 8pt;
    }
    
    .pdf-article {
      font-family: 'Bitter', serif;
      font-weight: 700;
      font-size: 11pt;
      margin-bottom: 6pt;
    }
    
    .pdf-subarticle {
      font-family: 'Bitter', serif;
      font-weight: 700;
      font-size: 10pt;
      margin-bottom: 5pt;
    }
    
    .pdf-text {
      font-family: 'Bitter', serif;
      font-size: 10pt;
      text-align: justify;
      margin-bottom: 5pt;
    }
    
    /* Styles de surlignage */
    mark {
      background-color: #FFEB3B;
      color: #000;
      padding: 0.1em 0.2em;
      border-radius: 2px;
    }
    
    /* Tailles de texte */
    .font-size-small .pdf-viewer {
      font-size: 9pt;
    }
    
    .font-size-small .pdf-title {
      font-size: 13pt;
    }
    
    .font-size-small .pdf-article {
      font-size: 10pt;
    }
    
    .font-size-large .pdf-viewer {
      font-size: 11pt;
    }
    
    .font-size-large .pdf-title {
      font-size: 15pt;
    }
    
    .font-size-large .pdf-article {
      font-size: 12pt;
    }
    
    /* Effets visuels */
    .contract-element-container {
      position: relative;
      margin-bottom: 0.5rem;
      padding: 0.25rem 0.5rem;
      border-left: 3px solid transparent;
      transition: all 0.2s;
    }
    
    .contract-element-container:hover {
      background-color: rgba(243, 244, 246, 0.5);
    }
    
    .element-selected {
      border-left-color: #3b82f6;
      background-color: rgba(243, 244, 246, 0.5);
    }
    
    .section-highlight {
      animation: section-pulse 2s ease;
    }
    
    @keyframes section-pulse {
      0% { background-color: rgba(59, 130, 246, 0); }
      30% { background-color: rgba(59, 130, 246, 0.2); }
      100% { background-color: rgba(59, 130, 246, 0); }
    }
    
    /* Optimisations pour le touch */
    @media (hover: none) and (pointer: coarse) {
      .contract-element-container {
        padding: 0.5rem 0.75rem;
        margin-bottom: 0.75rem;
      }
    }
    
    /* Optimisations pour iOS avec clavier visible */
    @supports (-webkit-touch-callout: none) {
      .keyboard-visible .pdf-viewer {
        padding-bottom: 40vh; /* Espace supplémentaire en bas pour éviter que le clavier ne cache le texte */
      }
    }
    
    /* Barre d'outils de sélection */
    .selection-toolbar {
      position: fixed;
      display: flex;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 4px;
      z-index: 1000;
      transform: translate(-50%, -100%);
    }
    
    /* Version mobile de la barre d'outils de sélection */
    @media (max-width: 768px) {
      .selection-toolbar {
        padding: 3px;
        max-width: 95vw;
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
        scrollbar-width: none; /* Firefox */
      }
      
      .selection-toolbar::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Edge */
      }
    }
    
    .selection-toolbar button {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      border-radius: 4px;
      margin: 0 1px;
    }
    
    /* Boutons plus petits sur mobile */
    @media (max-width: 768px) {
      .selection-toolbar button {
        width: 24px;
        height: 24px;
        margin: 0;
      }
    }
    
    .selection-toolbar button:hover {
      background-color: #f3f4f6;
    }
    
    /* Transitions pour les panneaux mobiles */
    .mobile-panel-enter {
      transform: translateX(-100%);
    }
    
    .mobile-panel-enter-active {
      transform: translateX(0);
      transition: transform 300ms ease-in-out;
    }
    
    .mobile-panel-exit {
      transform: translateX(0);
    }
    
    .mobile-panel-exit-active {
      transform: translateX(-100%);
      transition: transform 300ms ease-in-out;
    }
    
    .mobile-panel-right-enter {
      transform: translateX(100%);
    }
    
    .mobile-panel-right-enter-active {
      transform: translateX(0);
      transition: transform 300ms ease-in-out;
    }
    
    .mobile-panel-right-exit {
      transform: translateX(0);
    }
    
    .mobile-panel-right-exit-active {
      transform: translateX(100%);
      transition: transform 300ms ease-in-out;
    }
  `;
  
  // Rendu des éléments du contrat
  const renderContractElement = (element, index) => {
    if (element.type === 'spacer') {
      return <div key={`spacer-${index}`} style={{ height: element.height }} className="w-full"></div>;
    }
    
    if (element.type === 'paragraph') {
      const elementStyle = getElementStyle(element.style);
      const text = editedElements[index] !== undefined ? editedElements[index] : element.text;
      const isSelected = selectedElementIndex === index;
      
      // Vérifier si l'élément a des commentaires
      const elementComments = getElementComments(index);
      const hasComments = elementComments.length > 0;
      
      // Déterminer si c'est une section de titre
      const isSection = element.style === 'ContractArticle';
      const sectionId = isSection ? `section-${index}` : null;
      
      return (
        <div 
          id={`contract-element-${index}`}
          ref={el => { elementRefs.current[index] = el; }}
          className={`group relative contract-element-container py-2 pl-6 pr-4 border-l-4 
            ${isSelected ? 'border-l-blue-500 bg-blue-50/10 element-selected' : 'border-l-transparent'} 
            ${hasComments ? 'has-comments' : ''} 
            hover:bg-gray-50/30 transition-colors duration-200 ${elementStyle}`}
          onClick={(e) => handleElementClick(index, e)}
          data-element-index={index}
          data-section-id={sectionId}
          key={index}
        >
          <div 
            className={`w-full min-h-[1.5em] ${hasComments ? 'pr-7' : ''}`}
            contentEditable={element.style !== 'ContractTitle'} // Titres non éditables pour cet exemple
            suppressContentEditableWarning={true}
            onBlur={(e) => handleElementChange(index, e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: text }}
            style={{ outline: 'none' }}
          ></div>
          
          {/* Indicateur de commentaires */}
          {hasComments && (
            <button 
              className="absolute right-0 top-0 flex items-center justify-center h-full px-1 group-hover:bg-gray-100 rounded-r"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(true);
              }}
              title={`${elementComments.length} commentaire${elementComments.length > 1 ? 's' : ''}`}
            >
              <div className="relative">
                <MessageCircle size={16} className="text-yellow-600" />
                {elementComments.length > 1 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {elementComments.length}
                  </span>
                )}
              </div>
            </button>
          )}
          
          {/* Barre d'outils contextuelle sur hover */}
          {isSelected && (
            <div className="absolute -right-1 -top-8 hidden group-hover:flex bg-white border border-gray-200 rounded-lg shadow-sm">
              <button 
                title="Déplacer vers le haut"
                className="p-1.5 text-gray-500 hover:text-blue-600"
                onClick={(e) => { e.stopPropagation(); moveElement(index, 'up'); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
              </button>
              <button 
                title="Déplacer vers le bas"
                className="p-1.5 text-gray-500 hover:text-blue-600"
                onClick={(e) => { e.stopPropagation(); moveElement(index, 'down'); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              <button 
                title="Ajouter un commentaire"
                className="p-1.5 text-gray-500 hover:text-yellow-500"
                onClick={(e) => { 
                  e.stopPropagation();
                  handleAddComment();
                }}
              >
                <MessageCircle size={14} />
              </button>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  // Page de chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Page d'erreur
  if (errorMessage) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="text-red-400 mr-2" size={20} />
            <p className="text-red-700">{errorMessage}</p>
          </div>
        </div>
        <button 
          onClick={handleGoBack}
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          <ChevronLeft size={16} className="mr-1" />
          Retour aux contrats
        </button>
      </div>
    );
  }
  
  // Déterminer la taille de la police sur le body
  const fontSizeClass = `font-size-${fontSize}`;
  
  return (
    <div 
      ref={editorRef}
      className={`min-h-screen bg-gray-50 flex flex-col ${isFullscreen ? 'overflow-hidden' : ''} contract-editor-page relative ${fontSizeClass} ${keyboardVisible ? 'keyboard-visible' : ''}`} 
    >
      <style>{pdfStyles}</style>
      
      {/* En-tête */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex justify-between items-center flex-wrap">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleGoBack}
                className="text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100"
                aria-label="Retour"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Titre du contrat"
                  className="text-lg font-medium text-gray-900 w-full bg-transparent border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
                  style={{ maxWidth: '200px' }}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                id="editor-save-button"
                className="hidden sm:flex items-center justify-center text-xs sm:text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-1.5 px-2 sm:px-3 rounded-lg shadow-sm transition-colors"
                title="Sauvegarder"
              >
                <Save size={16} className="text-green-600" />
              </button>
              
              <button
                onClick={handleDownloadPdf}
                className="hidden sm:flex items-center justify-center text-xs sm:text-sm bg-gray-700 hover:bg-gray-800 text-white py-1.5 px-2 sm:px-3 rounded-lg shadow-sm transition-colors"
                title="Télécharger en PDF"
              >
                <FileText size={16} className="text-white" />
              </button>
              
              <button
                onClick={handleShareContract}
                id="editor-export-button"
                className="hidden sm:flex items-center justify-center text-xs sm:text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-1.5 px-2 sm:px-3 rounded-lg shadow-sm transition-colors"
                title="Exporter le contrat"
              >
                <FileUp size={16} className="text-indigo-600" />
              </button>
              
              {/* Tutoriel */}
              <div className="hidden sm:block">
                <TutorialLightbulb context="editor" id="editor-tutorial-lightbulb" />
              </div>
              
              {/* Menu de réglages */}
              <div className="relative">
                <button 
                  className="flex items-center justify-center text-xs sm:text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-1.5 px-2 sm:px-3 rounded-lg shadow-sm transition-colors"
                  onClick={() => setShowSettings(!showSettings)}
                  title="Réglages de police"
                >
                  <Type size={16} />
                </button>
                
                {showSettings && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-2">
                      <div className="mb-2 text-sm font-medium text-gray-700">Taille du texte</div>
                      <div className="space-y-1">
                        <button 
                          className={`w-full text-left px-3 py-2 text-sm rounded ${fontSize === 'small' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                          onClick={() => changeFontSize('small')}
                        >
                          Petit
                        </button>
                        <button 
                          className={`w-full text-left px-3 py-2 text-sm rounded ${fontSize === 'normal' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                          onClick={() => changeFontSize('normal')}
                        >
                          Normal
                        </button>
                        <button 
                          className={`w-full text-left px-3 py-2 text-sm rounded ${fontSize === 'large' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                          onClick={() => changeFontSize('large')}
                        >
                          Grand
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={toggleFullscreen}
                className="hidden sm:flex items-center justify-center text-xs sm:text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-1.5 px-2 sm:px-3 rounded-lg shadow-sm transition-colors"
                title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
              >
                {isFullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3"></path><path d="M21 8h-3a2 2 0 0 1-2-2V3"></path><path d="M3 16h3a2 2 0 0 1 2 2v3"></path><path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                  </svg>
                )}
              </button>
              
              {/* Boutons pour afficher les commentaires et les sections (bureau) */}
              <button
                onClick={toggleComments}
                className="hidden sm:flex items-center justify-center text-xs sm:text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-1.5 px-2 sm:px-3 rounded-lg shadow-sm transition-colors"
                title={showComments ? "Masquer les commentaires" : "Afficher les commentaires"}
              >
                <MessageCircle size={16} className={showComments ? 'text-yellow-600' : 'text-yellow-400'} />
              </button>
              
              <button
                onClick={toggleSections}
                className="hidden sm:flex items-center justify-center text-xs sm:text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-1.5 px-2 sm:px-3 rounded-lg shadow-sm transition-colors"
                title={showSections ? "Masquer les sections" : "Afficher les sections"}
              >
                <List size={16} className={showSections ? 'text-purple-600' : 'text-purple-400'} />
              </button>
              
              {/* Menu mobile */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden flex items-center text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100"
              >
                {showMobileMenu ? <X size={20} /> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="8" x2="20" y2="8"></line>
                  <line x1="4" y1="16" x2="20" y2="16"></line>
                </svg>}
              </button>
            </div>
          </div>
          
          {/* Menu mobile déplié */}
          {showMobileMenu && (
            <div className="sm:hidden mt-3 border-t border-gray-100 pt-3 space-y-2">
              <button
                onClick={() => { handleSave(); setShowMobileMenu(false); }}
                id="mobile-save-button"
                className="w-full flex items-center text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg transition-colors"
              >
                <Save size={16} className="mr-2 text-green-600" />
                Enregistrer
              </button>
              <button
                onClick={() => { handleDownloadPdf(); setShowMobileMenu(false); }}
                className="w-full flex items-center text-sm bg-gray-50 hover:bg-gray-100 text-gray-800 py-2 px-3 rounded-lg transition-colors"
              >
                <FileText size={16} className="mr-2 text-red-600" />
                Télécharger en PDF
              </button>
              <button
                onClick={() => { handleShareContract(); setShowMobileMenu(false); }}
                id="mobile-export-button"
                className="w-full flex items-center text-sm bg-gray-50 hover:bg-gray-100 text-gray-800 py-2 px-3 rounded-lg transition-colors"
              >
                <FileUp size={16} className="mr-2 text-indigo-600" />
                Exporter le contrat
              </button>
              <button
                onClick={() => { toggleSections(); setShowMobileMenu(false); }}
                className={`w-full flex items-center text-sm ${showSections ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-800'} hover:bg-gray-100 py-2 px-3 rounded-lg transition-colors`}
              >
                <List size={16} className="mr-2 text-purple-600" />
                {showSections ? 'Masquer les sections' : 'Afficher les sections'}
              </button>
              <button
                onClick={() => { toggleComments(); setShowMobileMenu(false); }}
                className={`w-full flex items-center text-sm ${showComments ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-800'} hover:bg-gray-100 py-2 px-3 rounded-lg transition-colors`}
              >
                <MessageCircle size={16} className="mr-2 text-yellow-600" />
                {showComments ? 'Masquer les commentaires' : 'Afficher les commentaires'}
              </button>
              <button
                onClick={() => { toggleKeyboard(); setShowMobileMenu(false); }}
                className="w-full flex items-center text-sm bg-gray-50 hover:bg-gray-100 text-gray-800 py-2 px-3 rounded-lg transition-colors"
              >
                <Keyboard size={16} className="mr-2 text-gray-600" />
                {keyboardVisible ? 'Masquer le clavier' : 'Afficher le clavier'}
              </button>
              <div className="w-full flex items-center text-sm bg-yellow-50 hover:bg-yellow-100 text-yellow-700 py-2 px-3 rounded-lg transition-colors">
                <Lightbulb size={16} className="mr-2 text-yellow-600" />
                <span className="flex-grow">Tutoriel</span>
                <button
                  onClick={() => { setShowMobileMenu(false); setIsOpen(true); }}
                  className="text-yellow-600 font-medium"
                >
                  Voir
                </button>
              </div>
            </div>
          )}
          
          {/* Notification de sauvegarde */}
          {savedNotification && (
            <div className="absolute top-full right-4 mt-2 px-3 py-2 bg-green-50 text-green-700 text-sm rounded-md shadow-sm border border-green-100 flex items-center z-30">
              <CheckCircle size={16} className="mr-2" />
              Modifications enregistrées
            </div>
          )}
          
          {/* Afficher les notifications */}
          {notification && (
            <div className={`absolute top-full right-4 mt-2 px-3 py-2 text-sm rounded-md shadow-sm border flex items-center z-30 ${
              notification.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-100' 
                : notification.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-100'
                : 'bg-blue-50 text-blue-700 border-blue-100'
            }`}>
              {notification.type === 'success' ? (
                <Check size={16} className="mr-2" />
              ) : notification.type === 'error' ? (
                <AlertCircle size={16} className="mr-2" />
              ) : (
                <Loader size={16} className="mr-2 animate-spin" />
              )}
              {notification.message}
            </div>
          )}
        </div>
      </header>
      
      {/* Contenu principal */}
      <main className="flex-1 flex overflow-hidden">
        {/* Navigateur de sections - Optimisé pour mobile */}
        {showSections && (
          <div className={`${isMobile || isTablet ? 'fixed inset-0 z-40 mobile-panel' : 'w-64 flex-shrink-0'}`}>
            <EditorSectionNavigator 
              sections={getSections()}
              activeSectionId={activeSectionId}
              onNavigate={handleNavigateToSection}
              onClose={() => setShowSections(false)}
            />
          </div>
        )}
        
        {/* Contenu principal */}
        <div 
          className="flex-1 overflow-y-auto p-4"
          ref={editorContainerRef}
        >
          <div className={`pdf-container max-w-4xl mx-auto`}>
            {/* Zone d'édition du contrat */}
            <div className="pdf-viewer shadow-md rounded-lg overflow-hidden">
              {elementsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {contractElements.map((element, index) => renderContractElement(element, index))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Panneau de commentaires - Optimisé pour mobile */}
        {showComments && (
          <div className={`${isMobile || isTablet ? 'fixed inset-0 z-40 mobile-panel-right' : 'w-80 flex-shrink-0'}`}>
            <EditorCommentPanel 
              comments={comments}
              selectedElementIndex={selectedElementIndex}
              onDeleteComment={deleteComment}
              onUpdateComment={updateComment}
              onClose={() => setShowComments(false)}
            />
          </div>
        )}
      </main>
      
      {/* Bouton pour retourner en haut sur mobile */}
      <button
        onClick={() => editorContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed right-4 bottom-20 z-30 bg-white shadow-lg rounded-full p-2 border border-gray-200 text-gray-600 hover:bg-gray-50 sm:hidden"
        aria-label="Retour en haut"
      >
        <ChevronUp size={20} />
      </button>
      
      {/* Barre d'outils de sélection flottante pour tous les appareils */}
      {toolbarPosition.visible && (
        <div 
          className="selection-toolbar"
          style={{
            left: `${toolbarPosition.x}px`,
            top: `${toolbarPosition.y}px`,
            zIndex: 40, // S'assurer qu'il est au-dessus des autres éléments
            transform: 'translate(-50%, -100%)'
          }}
        >
          <button onClick={() => applyFormatting('bold')} title="Gras">
            <Bold size={isMobile ? 12 : 14} className="text-blue-600" />
          </button>
          <button onClick={() => applyFormatting('italic')} title="Italique">
            <Italic size={isMobile ? 12 : 14} className="text-green-600" />
          </button>
          <button onClick={() => applyFormatting('underline')} title="Souligné">
            <Underline size={isMobile ? 12 : 14} className="text-indigo-600" />
          </button>
          <button onClick={() => applyFormatting('highlight')} title="Surligner">
            <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? 12 : 14} height={isMobile ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
              <path d="m9 11-6 6v3h9l3-3"></path>
              <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"></path>
            </svg>
          </button>
          <button onClick={() => applyFormatting('alignLeft')} title="Aligner à gauche">
            <AlignLeft size={isMobile ? 12 : 14} className="text-gray-600" />
          </button>
          <button onClick={() => applyFormatting('alignCenter')} title="Centrer">
            <AlignCenter size={isMobile ? 12 : 14} className="text-gray-600" />
          </button>
          <button onClick={() => applyFormatting('alignRight')} title="Aligner à droite">
            <AlignRight size={isMobile ? 12 : 14} className="text-gray-600" />
          </button>
          <button onClick={handleAddComment} title="Ajouter un commentaire">
            <MessageCircle size={isMobile ? 12 : 14} className="text-yellow-600" />
          </button>
        </div>
      )}
      
      {/* Dock flottant pour les outils d'édition */}
      <EditorFloatingDock 
        onFormat={applyFormatting}
        onSave={handleSave}
        onAddComment={handleAddComment}
        onToggleComments={toggleComments}
        onToggleSections={toggleSections}
        onToggleKeyboard={toggleKeyboard}
        showComments={showComments}
        showSections={showSections}
      />
      
      {/* Modal d'exportation */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        contractTitle={title}
        contractId={contractId}
      />
      
      {/* Tutoriel pour mobile */}
      {isOpen && (
        <TutorialPopup 
          context="editor"
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ContractEditorPage;