import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, Save, Download, Settings, CheckCircle, AlertCircle, 
  ArrowUp, ArrowDown, Maximize, Minimize, MessageCircle, X, GripVertical,
  ChevronUp, ChevronRight
} from 'lucide-react';
import { getContractById, getContractElements, updateContract, generatePdf } from '../services/api';
import EditorFloatingDock from '../components/ui/editor-floating-dock';

// Styles pour le document avec police similaire au PDF
const pdfStyles = `
  /* Fonts pour correspondre aux polices du PDF */
  @import url('https://fonts.googleapis.com/css2?family=Bitter:wght@400;700&display=swap');
  
  .pdf-viewer {
    font-family: 'Bitter', serif; /* Équivalent proche de Vera */
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
    font-family: 'Bitter', serif; /* Équivalent proche de VeraBd */
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

  /* Styles pour les espacements */
  .pdf-viewer p {
    margin-bottom: 5pt;
  }
  
  /* Styles pour simuler l'espacement des paragraphes dans un PDF */
  .pdf-viewer .contract-element-container {
    margin-bottom: 2mm;
  }
  
  /* Remplacer les bordures bleues par des effets plus subtils lors de la sélection */
  .pdf-viewer .contract-element-container.element-selected {
    background-color: rgba(59, 130, 246, 0.05) !important;
    border-left-color: #1e40af !important;
  }

  /* Définir une apparence de fond de document PDF */
  .pdf-container {
    background-color: #f9f9f9;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 210mm; /* Largeur A4 */
    margin: 0 auto;
    border-radius: 2px;
    overflow: hidden;
  }
  
  /* Styles pour les éléments interactifs tout en gardant l'apparence PDF */
  .pdf-viewer div[contenteditable="true"] {
    min-height: 1.5em;
    outline: none;
    border-radius: 0;
  }
  
  .pdf-viewer div[contenteditable="true"]:focus {
    background-color: rgba(59, 130, 246, 0.05);
    box-shadow: none;
    border-color: transparent;
  }
`;

// Améliorons encore les styles CSS pour des animations plus dynamiques
const dragStyles = `
  .drop-target-top {
    border-top: 2px solid #3b82f6 !important;
    padding-top: 2px !important;
    position: relative;
    transform: translateY(-4px);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 5;
  }
  .drop-target-top::before {
    content: "";
    position: absolute;
    left: 0;
    top: -2px;
    height: 2px;
    width: 100%;
    background-color: #3b82f6;
    z-index: 10;
    animation: pulse-horizontal 1.5s infinite;
  }
  .drop-target-bottom {
    border-bottom: 2px solid #3b82f6 !important;
    padding-bottom: 2px !important;
    position: relative;
    transform: translateY(4px);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 5;
  }
  .drop-target-bottom::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    height: 2px;
    width: 100%;
    background-color: #3b82f6;
    z-index: 10;
    animation: pulse-horizontal 1.5s infinite;
  }
  @keyframes pulse-horizontal {
    0% { opacity: 0.6; height: 2px; }
    50% { opacity: 1; height: 3px; }
    100% { opacity: 0.6; height: 2px; }
  }
  .dragging-active {
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
    opacity: 0.95;
    border: 1.5px dashed #3b82f6;
    background-color: rgba(59, 130, 246, 0.08);
    z-index: 50;
    position: relative;
    transform: scale(1.03) translateY(-8px) rotate(-0.5deg);
    transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: float 3s infinite ease-in-out;
  }
  @keyframes float {
    0% { transform: scale(1.03) translateY(-8px) rotate(-0.5deg); }
    50% { transform: scale(1.03) translateY(-12px) rotate(0.5deg); }
    100% { transform: scale(1.03) translateY(-8px) rotate(-0.5deg); }
  }
  .drag-handle {
    cursor: grab;
    border-radius: 50%;
    opacity: 0;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: absolute;
    left: 2px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background-color: rgba(0, 0, 0, 0.03);
  }
  .contract-element-container:hover .drag-handle {
    opacity: 0.5;
    transform: translateY(-50%) scale(1.1);
  }
  .contract-element-container.element-selected .drag-handle {
    opacity: 0.8;
    transform: translateY(-50%) scale(1.2);
  }
  .drag-handle:hover {
    opacity: 1 !important;
    background-color: rgba(59, 130, 246, 0.2);
    transform: translateY(-50%) scale(1.3) !important;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
  }
  .drag-handle:active {
    cursor: grabbing;
    background-color: rgba(59, 130, 246, 0.3);
    transform: translateY(-50%) scale(1.1) !important;
  }
  .dragging-cursor {
    cursor: grabbing !important;
  }
  .contract-element-container {
    transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
    position: relative;
    will-change: transform, opacity, margin, box-shadow;
  }
  .contract-element-container.element-selected {
    transform: scale(1.01);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
    z-index: 10;
  }
  /* Animation pour les autres paragraphes pendant le glisser-déposer avec rebond */
  .contract-element-container.element-pushed-down {
    transform: translateY(14px);
    margin-top: 6px;
    opacity: 0.8;
    transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .contract-element-container.element-pushed-up {
    transform: translateY(-14px);
    margin-bottom: 6px;
    opacity: 0.8;
    transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  /* Effet de pulsation lors de la sélection */
  @keyframes pulse-selection {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }
  .element-pulse {
    animation: pulse-selection 0.8s ease-out;
  }
  /* Effet de succès après le déplacement avec bounce */
  @keyframes drop-success {
    0% { transform: scale(1); background-color: rgba(59, 130, 246, 0); }
    40% { transform: scale(1.03); background-color: rgba(59, 130, 246, 0.2); }
    60% { transform: scale(0.98); background-color: rgba(59, 130, 246, 0.15); }
    80% { transform: scale(1.01); background-color: rgba(59, 130, 246, 0.05); }
    100% { transform: scale(1); background-color: transparent; }
  }
  .drop-success {
    animation: drop-success 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  /* Effet de glissement quand l'élément est déplacé */
  @keyframes slide-in-right {
    0% { transform: translateX(-30px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  @keyframes slide-in-left {
    0% { transform: translateX(30px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  .slide-in-right {
    animation: slide-in-right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
  .slide-in-left {
    animation: slide-in-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
  /* Styles mobiles spécifiques */
  @media (max-width: 768px) {
    .drag-handle {
      width: 22px;
      height: 22px;
      opacity: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.05);
    }
    .contract-element-container.element-selected .drag-handle {
      opacity: 0.6;
    }
    .contract-element-container {
      padding-left: 22px !important;
    }
    .contract-element-container.element-selected {
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
    }
    .dragging-active {
      transform: scale(1.02) translateY(-4px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      animation: float-mobile 3s infinite ease-in-out;
    }
    @keyframes float-mobile {
      0% { transform: scale(1.02) translateY(-4px) rotate(-0.2deg); }
      50% { transform: scale(1.02) translateY(-6px) rotate(0.2deg); }
      100% { transform: scale(1.02) translateY(-4px) rotate(-0.2deg); }
    }
    .element-pushed-down {
      transform: translateY(8px);
      margin-top: 3px;
    }
    .element-pushed-up {
      transform: translateY(-8px);
      margin-bottom: 3px;
    }
  }
`;

const ContractEditorPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  
  const [contract, setContract] = useState(null);
  const [contractElements, setContractElements] = useState([]);
  const [editedElements, setEditedElements] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [elementsLoading, setElementsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedMessage, setSavedMessage] = useState(false);
  const [title, setTitle] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedElementIndex, setSelectedElementIndex] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [fontSize, setFontSize] = useState('normal');
  const [showCommentPanel, setShowCommentPanel] = useState(false);
  const [comments, setComments] = useState([]);
  const [showMobileSections, setShowMobileSections] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragIndexRef = useRef(null);
  const dragPositionY = useRef(0);
  
  // Récupérer les informations du contrat
  useEffect(() => {
    const fetchContract = async () => {
      try {
        setIsLoading(true);
        const contractData = await getContractById(contractId);
        setContract(contractData);
        setTitle(contractData.title);
        setError(null);
      } catch (error) {
        console.error('Error fetching contract:', error);
        setError('Impossible de récupérer le contrat. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContract();
  }, [contractId]);
  
  // Récupérer les éléments du contrat pour l'éditeur
  useEffect(() => {
    const fetchContractElements = async () => {
      if (!contract) return;
      
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
        
        setError(null);
      } catch (error) {
        console.error('Error fetching contract elements:', error);
        setError('Impossible de récupérer les éléments du contrat. Veuillez réessayer plus tard.');
      } finally {
        setElementsLoading(false);
      }
    };
    
    fetchContractElements();
  }, [contract, contractId]);
  
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
      
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (error) {
      console.error('Error saving contract:', error);
      setError('Impossible de sauvegarder le contrat. Veuillez réessayer plus tard.');
    }
  };
  
  const handleDownloadPdf = async () => {
    try {
      setIsPdfGenerating(true);
      const response = await generatePdf(contractId);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title || 'contrat'}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF', error);
      setError("Impossible de générer le PDF du contrat.");
    } finally {
      setIsPdfGenerating(false);
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
  
  const handleElementClick = (index) => {
    setSelectedElementIndex(index);
    
    // Ajouter un effet visuel de pulsation lors de la sélection
    const element = document.getElementById(`contract-element-${index}`);
    if (element) {
      element.classList.add('element-pulse');
      // Retirer la classe après l'animation
      setTimeout(() => {
        element.classList.remove('element-pulse');
      }, 800);
    }
  };
  
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
            // Vérifier si le texte est déjà en gras (entouré de balises <strong>)
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
        case 'alignLeft':
            // Vérifier si le texte est déjà aligné à gauche
            if (text.includes('<p style="text-align: left;">')) {
              // Enlever l'alignement à gauche
              newText = text.replace('<p style="text-align: left;">', '<p>');
            } else {
              // Ajouter l'alignement à gauche
              newText = '<p style="text-align: left;">' + text + '</p>';
            }
          break;
        case 'alignCenter':
            // Vérifier si le texte est déjà centré
            if (text.includes('<p style="text-align: center;">')) {
              // Enlever le centrage
              newText = text.replace('<p style="text-align: center;">', '<p>');
            } else {
              // Ajouter le centrage
              newText = '<p style="text-align: center;">' + text + '</p>';
            }
          break;
        case 'alignRight':
            // Vérifier si le texte est déjà aligné à droite
            if (text.includes('<p style="text-align: right;">')) {
              // Enlever l'alignement à droite
              newText = text.replace('<p style="text-align: right;">', '<p>');
            } else {
              // Ajouter l'alignement à droite
              newText = '<p style="text-align: right;">' + text + '</p>';
            }
          break;
        default:
          break;
        }
      } else {
        // Si aucun texte n'est sélectionné, ne rien faire
        return;
      }
      
      handleElementChange(selectedElementIndex, newText);
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
  };
  
  // eslint-disable-next-line no-unused-vars
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

  // Identifier les sections du contrat
  const getSections = () => {
    const sections = [];
    contractElements.forEach((element, index) => {
      if (element.type === 'paragraph' && element.style === 'ContractArticle') {
        sections.push({
          index,
          text: element.text
        });
      }
    });
    return sections;
  };
  
  // Prépare la classe et les propriétés de style pour un élément en fonction de son style
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
  
  // Modifions la fonction handleDragStart pour inclure des animations plus expressives
  const handleDragStart = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Sélectionner l'élément au début du drag
    handleElementClick(index);
    
    // Stockons l'élément et l'index
    const element = document.getElementById(`contract-element-${index}`);
    if (!element) return;
    
    // Effet visuel au début du drag
    element.animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.05)', opacity: 0.9 },
      { transform: 'scale(1.03)', opacity: 0.95 }
    ], {
      duration: 300,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      fill: 'forwards'
    });
    
    setDraggingIndex(index);
    
    // Ajouter une classe pour l'effet visuel
    setTimeout(() => {
      element.classList.add('dragging-active');
    }, 50);
    
    // Ajouter une classe sur le body pour changer le curseur
    document.body.classList.add('dragging-cursor');
    
    // Position initiale pour mobile
    const isTouchEvent = e.type.includes('touch');
    const startY = isTouchEvent ? e.touches[0].clientY : e.clientY;
    
    // Fonction pour gérer le déplacement
    const handleMove = (moveEvent) => {
      moveEvent.preventDefault();
      
      // Vérifier si c'est un événement tactile et empêcher le scroll
      if (moveEvent.touches) {
        moveEvent.stopPropagation();
      }
      
      const currentY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);
      
      // Nettoyer les anciens indicateurs
      document.querySelectorAll('.drop-target-top, .drop-target-bottom, .element-pushed-up, .element-pushed-down').forEach(el => {
        el.classList.remove('drop-target-top', 'drop-target-bottom', 'element-pushed-up', 'element-pushed-down');
      });
      
      // Trouver tous les paragraphes
      const paragraphs = Array.from(document.querySelectorAll('[id^="contract-element-"]'));
      
      // Trouver l'élément le plus proche du curseur/doigt
      let closestElement = null;
      let closestDistance = Infinity;
      let isBelow = false;
      
      paragraphs.forEach(paragraph => {
        if (paragraph.id === `contract-element-${index}`) return;
        
        const rect = paragraph.getBoundingClientRect();
        const paragraphMiddle = rect.top + rect.height / 2;
        const distance = Math.abs(currentY - paragraphMiddle);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestElement = paragraph;
          isBelow = currentY > paragraphMiddle;
        }
      });
      
      // Ajouter l'indicateur visuel et animer les paragraphes autour
      if (closestElement) {
        // Effet d'apparition avec animation
        if (isBelow) {
          closestElement.classList.add('drop-target-bottom');
        } else {
          closestElement.classList.add('drop-target-top');
        }
        
        // Index du paragraphe le plus proche
        const closestIndex = parseInt(closestElement.id.replace('contract-element-', ''), 10);
        
        // Animation "push" pour les éléments voisins avec effet de cascade
        paragraphs.forEach(p => {
          const pIndex = parseInt(p.id.replace('contract-element-', ''), 10);
          if (p.id === `contract-element-${index}`) return;
          
          // Détermine si l'élément doit être poussé et calcule le délai pour l'effet cascade
          if (isBelow) {
            if (pIndex > closestIndex && pIndex <= closestIndex + 3) {
              // Calcul du délai pour effet cascade (plus loin = plus tard)
              const delay = (pIndex - closestIndex) * 40;  // 40ms de délai entre chaque élément
              setTimeout(() => {
                p.classList.add('element-pushed-down');
              }, delay);
            }
          } else {
            if (pIndex < closestIndex && pIndex >= closestIndex - 3) {
              // Calcul du délai pour effet cascade inverse
              const delay = (closestIndex - pIndex) * 40;
              setTimeout(() => {
                p.classList.add('element-pushed-up');
              }, delay);
            }
          }
        });
      }
    };
    
    // Attacher les écouteurs d'événements en fonction du type d'événement
    if (isTouchEvent) {
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      document.addEventListener('touchcancel', handleEnd);
    } else {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    }
    
    // Fonction pour gérer la fin du glisser-déposer
    function handleEnd(endEvent) {
      // Retirer les écouteurs d'événements
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
      
      // Retirer l'effet visuel de l'élément qu'on déplace
      element.classList.remove('dragging-active');
      
      // Animation de retour à la normale
      element.animate([
        { transform: 'scale(1.03) translateY(-8px)', opacity: 0.95 },
        { transform: 'scale(1)', opacity: 1 }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        fill: 'forwards'
      });
      
      // Retirer la classe du curseur
      document.body.classList.remove('dragging-cursor');
      
      // Trouver l'élément cible
      const targetTop = document.querySelector('.drop-target-top');
      const targetBottom = document.querySelector('.drop-target-bottom');
      
      // Si on a une cible
      if (targetTop || targetBottom) {
        // Extraire l'index de l'élément cible
        const targetElement = targetTop || targetBottom;
        const targetId = targetElement.id;
        const targetIndex = parseInt(targetId.replace('contract-element-', ''), 10);
        
        // Déterminer la position (avant ou après)
        let newIndex;
        if (targetTop) {
          newIndex = targetIndex;
        } else {
          newIndex = targetIndex + 1;
        }
        
        // Ajuster si on déplace vers le bas
        if (index < newIndex) {
          newIndex--;
        }
        
        // Seulement si l'index a changé
        if (newIndex !== index && newIndex >= 0) {
          // Créer une nouvelle liste avec l'élément déplacé
          const newElements = [...contractElements];
          const [movedItem] = newElements.splice(index, 1);
          newElements.splice(newIndex, 0, movedItem);
          
          // Ajouter un effet de direction pour l'animation
          const direction = index < newIndex ? 'right' : 'left';
          
          // Mettre à jour l'état
          setContractElements(newElements);
          setSelectedElementIndex(newIndex);
          
          // Marquer que les éléments ont été modifiés
          setEditedElements({
            ...editedElements,
            _structure: Date.now() // Marquer que la structure a changé
          });
          
          // Ajouter une animation de succès après le déplacement
          setTimeout(() => {
            const movedElement = document.getElementById(`contract-element-${newIndex}`);
            if (movedElement) {
              movedElement.classList.add('drop-success');
              movedElement.classList.add(`slide-in-${direction}`);
              
              // Retirer les classes d'animation après quelles soient terminées
              setTimeout(() => {
                movedElement.classList.remove('drop-success', `slide-in-${direction}`);
              }, 800);
            }
          }, 50);
        }
      }
      
      // Nettoyer les indicateurs visuels et les effets d'animation
      document.querySelectorAll('.drop-target-top, .drop-target-bottom, .element-pushed-up, .element-pushed-down').forEach(el => {
        el.classList.remove('drop-target-top', 'drop-target-bottom', 'element-pushed-up', 'element-pushed-down');
      });
      
      // Réinitialiser l'index de l'élément glissé
      setDraggingIndex(null);
    }
  };
  
  // Mise à jour de la fonction renderContractElement pour reproduire l'apparence PDF
  const renderContractElement = (element, index) => {
    if (element.type === 'spacer') {
      return <div key={`spacer-${index}`} style={{ height: element.height }} className="w-full"></div>;
    }
    
    if (element.type === 'paragraph') {
      const elementStyle = getElementStyle(element.style);
      const text = editedElements[index] !== undefined ? editedElements[index] : element.text;
      const isSelected = selectedElementIndex === index;
      
      // Vérifier si l'élément a des commentaires et combien
      const elementComments = comments.filter(comment => comment.elementIndex === index);
      const hasComments = elementComments.length > 0;
      const commentCount = elementComments.length;
      
      // Styles pour le glisser-déposer
      const isDraggable = element.style !== 'ContractTitle';
      const isBeingDragged = draggingIndex === index;
      
      // Rendre un élément éditable avec une apparence similaire au PDF et support du drag and drop
      return (
        <div 
          id={`contract-element-${index}`}
          className={`group relative contract-element-container py-2 pl-6 pr-4 border-l-4 
            ${isSelected ? 'border-l-blue-500 bg-blue-50/10 element-selected' : 'border-l-transparent'} 
            ${isBeingDragged ? 'opacity-50' : ''} 
            ${commentCount > 0 ? 'has-comments' : ''} 
            hover:bg-gray-50/30 transition-colors duration-200 ${elementStyle}`}
          onClick={() => handleElementClick(index)}
          data-paragraph-index={index}
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
          
          {/* Indicateur de commentaires amélioré avec l'icône cercle */}
          {hasComments && (
            <button 
              className="absolute right-0 top-0 flex items-center justify-center h-full px-1 group-hover:bg-gray-100 rounded-r"
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentPanel(true);
                // Faire défiler jusqu'au commentaire dans le panneau si possible
              }}
              title={`${commentCount} commentaire${commentCount > 1 ? 's' : ''}`}
            >
              <div className="relative">
                <MessageCircle size={16} className="text-yellow-500" />
                {commentCount > 1 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {commentCount}
                  </span>
                )}
            </div>
            </button>
          )}
          
          {/* Poignée de glisser-déposer (plus discrète) */}
          {isDraggable && (
            <div 
              className="drag-handle"
              onMouseDown={(e) => handleDragStart(e, index)}
              onTouchStart={(e) => handleDragStart(e, index)}
              onClick={(e) => e.stopPropagation()}
              title="Glisser pour déplacer"
            >
              <GripVertical size={14} className="text-gray-400" />
            </div>
          )}
          
          {/* Barre d'outils contextuelle sur hover */}
          {isSelected && !isBeingDragged && (
            <div className="absolute -right-1 -top-8 hidden group-hover:flex bg-white border border-gray-200 rounded-lg shadow-sm">
              <button 
                title="Déplacer vers le haut"
                className="p-1.5 text-gray-500 hover:text-blue-600"
                onClick={(e) => { e.stopPropagation(); moveElement(index, 'up'); }}
              >
                <ArrowUp size={14} />
              </button>
              <button 
                title="Déplacer vers le bas"
                className="p-1.5 text-gray-500 hover:text-blue-600"
                onClick={(e) => { e.stopPropagation(); moveElement(index, 'down'); }}
              >
                <ArrowDown size={14} />
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
  
  // Améliorer le rendu des commentaires pour un meilleur visuel
  const renderCommentPanel = () => {
    // Trier les commentaires par section pour un affichage plus organisé
    const commentsBySection = {};
    
    comments.forEach(comment => {
      if (!commentsBySection[comment.elementIndex]) {
        commentsBySection[comment.elementIndex] = [];
      }
      commentsBySection[comment.elementIndex].push(comment);
    });
    
    return (
      <div className="bg-white h-full overflow-y-auto">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-white border-b border-gray-200">
          <h3 className="font-medium text-gray-800">Commentaires ({comments.length})</h3>
          <button 
            onClick={() => setShowCommentPanel(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Fermer les commentaires"
          >
            <X size={16} />
          </button>
        </div>
        
        {comments.length === 0 ? (
          <div className="text-gray-500 text-sm p-8 text-center flex flex-col items-center">
            <MessageCircle size={24} className="mb-2 opacity-50" />
            <p>Aucun commentaire</p>
            <p className="text-xs mt-1">Sélectionnez du texte et utilisez l'outil de commentaire</p>
          </div>
        ) : (
          <div className="p-4">
            {Object.keys(commentsBySection).map(sectionIndex => (
              <div key={sectionIndex} className="mb-6">
                <div 
                  className="text-xs font-medium text-blue-600 mb-2 flex items-center cursor-pointer"
                  onClick={() => handleElementClick(parseInt(sectionIndex))}
                >
                  <span className="mr-1">Section {parseInt(sectionIndex) + 1}</span>
                  <ChevronRight size={14} />
                </div>
                
                <div className="space-y-3">
                  {commentsBySection[sectionIndex].map(comment => (
                    <div 
                      key={comment.id} 
                      className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-blue-200 transition-colors"
                    >
                      {comment.isEditing ? (
                        <div>
                          {comment.selectedText && (
                            <div className="bg-yellow-50 p-2 rounded-t border border-yellow-200 text-gray-700 text-sm font-medium mb-0 overflow-hidden">
                              <span className="block text-xs text-yellow-600 font-medium mb-1">Texte sélectionné :</span>
                              "{comment.selectedText}"
                            </div>
                          )}
                          
                          <textarea
                            className={`w-full px-3 py-2 text-sm border border-gray-300 ${comment.selectedText ? 'rounded-b border-t-0' : 'rounded'} bg-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            value={comment.text}
                            onChange={(e) => {
                              const updatedComments = comments.map(c => 
                                c.id === comment.id ? {...c, text: e.target.value} : c
                              );
                              setComments(updatedComments);
                            }}
                            placeholder="Ajoutez votre commentaire ici..."
                            rows={3}
                            autoFocus
                          />
                          
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                // Si c'est un nouveau commentaire sans texte, on le supprime lors de l'annulation
                                if (!comment.text.trim()) {
                                  setComments(comments.filter(c => c.id !== comment.id));
                                } else {
                                  const updatedComments = comments.map(c => 
                                    c.id === comment.id ? {...c, isEditing: false} : c
                                  );
                                  setComments(updatedComments);
                                }
                              }}
                            >
                              Annuler
                            </button>
                            
                            <button
                              className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                              onClick={() => {
                                // Si le commentaire est vide, on le supprime
                                if (!comment.text.trim()) {
                                  setComments(comments.filter(c => c.id !== comment.id));
                                } else {
                                  const updatedComments = comments.map(c => 
                                    c.id === comment.id ? {...c, isEditing: false, date: new Date().toISOString()} : c
                                  );
                                  setComments(updatedComments);
                                }
                              }}
                            >
                              Enregistrer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                <div className="flex justify-between items-start">
                            <span className="text-xs text-gray-500">
                              {new Date(comment.date).toLocaleString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  const updatedComments = comments.map(c => 
                                    c.id === comment.id ? {...c, isEditing: true} : c
                                  );
                                  setComments(updatedComments);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Modifier"
                              >
                                <span className="sr-only">Modifier</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                </svg>
                              </button>
                              
                  <button 
                    onClick={() => deleteComment(comment.id)}
                                className="p-1 text-gray-400 hover:text-red-500"
                                title="Supprimer"
                  >
                                <span className="sr-only">Supprimer</span>
                    <X size={14} />
                  </button>
                </div>
                          </div>
                          
                          {comment.selectedText && (
                            <div className="bg-yellow-50 p-2 rounded-t border border-yellow-200 text-gray-700 text-sm font-medium mb-0 overflow-hidden">
                              <span className="block text-xs text-yellow-600 font-medium mb-1">Texte sélectionné :</span>
                              "{comment.selectedText}"
                            </div>
                          )}
                          
                          <div className={`bg-white p-2 rounded-b border border-gray-200 text-gray-700 text-sm mb-1 ${comment.selectedText ? 'border-t-0 mt-0' : 'rounded-t'}`}>
                            <p className="whitespace-pre-wrap">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  
  // Modifier la fonction handleAddComment pour créer un format plus clair
  const handleAddComment = () => {
    // Vérifier si un élément est sélectionné
    if (selectedElementIndex !== null) {
      // Créer un nouveau commentaire
      const selection = window.getSelection();
      const selectedText = selection && selection.toString() 
        ? selection.toString() 
        : '';
      
      // Créer un nouveau commentaire avec une meilleure séparation visuelle
      const newComment = {
        id: Date.now().toString(),
        elementIndex: selectedElementIndex,
        text: "", // Le texte sera ajouté par l'utilisateur
        date: new Date().toISOString(),
        user: "Utilisateur",
        selectedText: selectedText,
        isEditing: true
      };
      
      // Ajouter le commentaire et afficher le panneau
      setComments([...comments, newComment]);
      setShowCommentPanel(true);
      
      // Animation subtile pour indiquer que le commentaire a été ajouté
      setSelectedElementIndex(selectedElementIndex);
    } else {
      // Informer l'utilisateur qu'il doit sélectionner un élément
      setError("Veuillez sélectionner un élément du contrat pour ajouter un commentaire.");
      setTimeout(() => setError(null), 3000);
    }
  };
  
  // Fonction pour afficher/masquer les commentaires
  const toggleComments = () => {
    setShowCommentPanel(!showCommentPanel);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="text-red-400 mr-2" size={20} />
            <p className="text-red-700">{error}</p>
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
  
  return (
    <div 
      className={`min-h-screen bg-gray-50 flex flex-col ${isFullscreen ? 'overflow-hidden' : ''} contract-editor-page relative`} 
      ref={editorRef}
    >
      <style>{dragStyles}</style>
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
                className="hidden sm:flex items-center text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-2 sm:px-3 rounded-lg shadow-sm transition-colors"
                disabled={isLoading}
              >
                <Save size={16} className="mr-1" />
                <span className="hidden sm:inline">Enregistrer</span>
              </button>
              
              <button
                onClick={handleDownloadPdf}
                className="hidden sm:flex items-center text-xs sm:text-sm bg-gray-700 hover:bg-gray-800 text-white py-1.5 px-2 sm:px-3 rounded-lg shadow-sm transition-colors"
                disabled={isLoading || isPdfGenerating}
              >
                <Download size={16} className="mr-1" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              
              <button
                onClick={() => setActiveTab(activeTab === 'editor' ? 'settings' : 'editor')}
                className="hidden sm:flex items-center text-xs sm:text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-1.5 px-2 sm:px-3 rounded-lg shadow-sm transition-colors"
              >
                <Settings size={16} className="mr-1" />
                <span className="hidden sm:inline">{activeTab === 'editor' ? 'Réglages' : 'Éditeur'}</span>
              </button>

              {/* Menu mobile */}
              <button
                onClick={toggleMobileMenu}
                className="sm:hidden flex items-center text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100"
              >
                {showMobileMenu ? <X size={20} /> : <Settings size={20} />}
              </button>
            </div>
          </div>

          {/* Barre d'actions mobile */}
          {showMobileMenu && (
            <div className="sm:hidden py-2 mt-2 border-t border-gray-100 flex justify-between">
              <button
                onClick={handleSave}
                className="flex items-center text-xs bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg shadow-sm transition-colors"
              >
                <Save size={14} className="mr-1" />
                Enregistrer
              </button>
              
              <button
                onClick={handleDownloadPdf}
                className="flex items-center text-xs bg-gray-700 hover:bg-gray-800 text-white py-1.5 px-3 rounded-lg shadow-sm transition-colors"
              >
                <Download size={14} className="mr-1" />
                PDF
              </button>
              
              <button
                onClick={() => setActiveTab(activeTab === 'editor' ? 'settings' : 'editor')}
                className="flex items-center text-xs border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-1.5 px-3 rounded-lg shadow-sm transition-colors"
              >
                <Settings size={14} className="mr-1" />
                {activeTab === 'editor' ? 'Réglages' : 'Éditeur'}
              </button>
            </div>
          )}
          
          {savedMessage && (
            <div className="absolute top-full right-0 mt-2 mr-4 px-3 py-2 bg-green-50 text-green-700 text-sm rounded-md shadow-sm border border-green-100 flex items-center">
              <CheckCircle size={16} className="mr-2" />
              Modifications enregistrées
            </div>
          )}
        </div>
      </header>
      
      {/* Corps de l'application */}
      <main className="flex-1 flex">
        {/* Sidebar - Masquée sur mobile sauf si on clique sur le bouton dédié */}
        <aside className={`bg-white border-r border-gray-200 ${
          activeTab === 'editor' ? 'w-64 flex-shrink-0' : 'hidden'
        } ${
          !showMobileSections ? 'hidden md:block' : 'fixed inset-0 z-40 md:relative md:z-0 pt-20'
        }`}>
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Sections</h2>
              <button 
                className="md:hidden p-1.5 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-md"
                onClick={() => setShowMobileSections(false)}
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Liste des sections */}
            <nav className="space-y-1">
              {getSections().map((section, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSection(section.index)}
                  className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center justify-between ${
                    selectedSection === section.index 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{section.text.substring(0, 40)}...</span>
                  {selectedSection === section.index && <ChevronRight size={16} />}
                </button>
              ))}
            </nav>
          </div>
        </aside>
        
        {/* Bouton pour afficher les sections sur mobile */}
        <button
          className="md:hidden fixed bottom-4 left-4 z-30 bg-white shadow-lg rounded-full p-3 text-blue-600 border border-gray-200"
          onClick={() => setShowMobileSections(true)}
          style={{ display: showMobileSections ? 'none' : activeTab === 'editor' ? 'block' : 'none' }}
        >
          <ChevronUp size={20} />
        </button>
        
        {/* Contenu principal */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'editor' ? (
            <div className="pdf-container">
              {/* En-tête minimaliste avec options essentielles uniquement */}
              <div className="border-b border-gray-200 px-4 py-2 flex justify-end items-center bg-white">
                <div className="flex items-center space-x-2">
                  <select 
                    className="text-sm border border-gray-300 rounded-md py-1 pl-2 pr-6 bg-white"
                    onChange={(e) => changeFontSize(e.target.value)}
                    value={fontSize}
                  >
                    <option value="small">Petit</option>
                    <option value="normal">Normal</option>
                    <option value="large">Grand</option>
                  </select>
                  
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
                    title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
                  >
                    {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  </button>
                </div>
              </div>
              
              {/* Zone d'édition du contrat */}
              <div className={`pdf-viewer ${fontSize === 'small' ? 'text-[9pt]' : fontSize === 'large' ? 'text-[11pt]' : 'text-[10pt]'}`}>
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
              
              {/* Ajouter le EditorFloatingDock pour les contrôles flottants */}
              <EditorFloatingDock 
                onFormat={applyFormatting}
                onSave={handleSave}
                onAddComment={handleAddComment}
                onToggleComments={toggleComments}
                showComments={showCommentPanel}
              />
            </div>
          ) : (
            // Afficher les paramètres ici
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Paramètres du document</h2>
              
              {/* Paramètres à implémenter ici */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium text-gray-800 mb-3">Apparence</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Taille du texte</label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => changeFontSize('small')}
                          className={`px-3 py-1.5 rounded-md text-sm ${fontSize === 'small' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}
                        >
                          Petit
                        </button>
                        <button
                          onClick={() => changeFontSize('normal')}
                          className={`px-3 py-1.5 rounded-md text-sm ${fontSize === 'normal' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}
                        >
                          Normal
                        </button>
                        <button
                          onClick={() => changeFontSize('large')}
                          className={`px-3 py-1.5 rounded-md text-sm ${fontSize === 'large' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}
                        >
                          Grand
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium text-gray-800 mb-3">Métadonnées</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="document-title" className="block text-sm font-medium text-gray-700 mb-1">
                        Titre du document
                      </label>
                      <input
                        type="text"
                        id="document-title"
                        value={title}
                        onChange={handleTitleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Panneau de commentaires - version améliorée */}
        {showCommentPanel && activeTab === 'editor' && (
          <aside className="w-0 md:w-80 flex-shrink-0 border-l border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-hidden">
            {renderCommentPanel()}
          </aside>
        )}
        
        {/* Panneau de commentaires mobile */}
        {showCommentPanel && activeTab === 'editor' && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-end">
            <div className="w-full max-w-xs bg-white h-full animate-slideIn">
              {renderCommentPanel()}
            </div>
          </div>
        )}
      </main>
      
      {/* Message d'erreur */}
      {error && (
        <div className="fixed bottom-4 right-4 px-4 py-3 bg-red-50 text-red-700 rounded-md shadow-lg border border-red-100 flex items-center">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <p>{error}</p>
          <button 
            className="ml-3 p-1 text-red-500 hover:text-red-700"
            onClick={() => setError(null)}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ContractEditorPage;