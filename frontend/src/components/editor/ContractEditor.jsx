import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Save, Download, MessageCircle, Bold, Italic, Underline, 
  AlignLeft, AlignCenter, AlignRight,
  X, Plus, Copy, Check, Type
} from 'lucide-react';
import EditorToolbar from './EditorToolbar';
import EditorFloatingDock from '../ui/editor-floating-dock';
import EditorCommentPanel from './EditorCommentPanel';
import EditorSectionNavigator from './EditorSectionNavigator';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { getElementStyle } from '../../utils/editorUtils';
import { generateEditorPdf } from '../../services/api';

// Styles pour reproduire la mise en page du PDF
import './ContractEditor.css';

const ContractEditor = ({ 
  contractData, 
  contractElements, 
  onSave, 
  onElementChange, 
  onDownload, 
  onUpdateStructure,
  isLoading = false,
  error = null
}) => {
  const [editedElements, setEditedElements] = useState({});
  const [selectedElementIndex, setSelectedElementIndex] = useState(null);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [showSections, setShowSections] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ visible: false, x: 0, y: 0 });
  const [touchSelection, setTouchSelection] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const [savedNotification, setSavedNotification] = useState(false);
  const [clipboard, setClipboard] = useState(null);
  const [touchStartInfo, setTouchStartInfo] = useState(null);
  const [visibleSections, setVisibleSections] = useState([]);
  const [touchScrollEnabled, setTouchScrollEnabled] = useState(true);
  const [notificationText, setNotificationText] = useState('');
  
  const editorRef = useRef(null);
  const editorContainerRef = useRef(null);
  const elementRefs = useRef({});
  const lastTapRef = useRef(0);
  const device = useDeviceDetect();
  
  // Traquer les sections visibles pour la navigation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const id = entry.target.getAttribute('data-section-id');
          if (entry.isIntersecting) {
            setVisibleSections(prev => [...prev, id].filter(Boolean));
          } else {
            setVisibleSections(prev => prev.filter(sectionId => sectionId !== id));
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const editorContainer = editorContainerRef.current;
    if (editorContainer) {
      const sectionElements = editorContainer.querySelectorAll('[data-section-id]');
      sectionElements.forEach(el => observer.observe(el));
    }
    
    return () => observer.disconnect();
  }, [contractElements]);
  
  // Définir la section active basée sur la visibilité
  useEffect(() => {
    if (visibleSections.length > 0) {
      setActiveSectionId(visibleSections[0]);
    }
  }, [visibleSections]);
  
  // Synchroniser les changements d'édition avec le parent
  useEffect(() => {
    if (Object.keys(editedElements).length > 0) {
      onElementChange(editedElements);
    }
  }, [editedElements, onElementChange]);
  
  // Fonction pour gérer les modifications dans un élément
  const handleElementEdit = (index, content) => {
    setEditedElements(prev => ({
      ...prev,
      [index]: content
    }));
  };
  
  // Sélectionner un élément pour l'édition
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
    
    // Sur mobile, si on est en édition active, afficher la barre d'outils de formatage
    if (device.isMobile || device.isTablet) {
      const element = elementRefs.current[index];
      if (element) {
        setTouchSelection(true);
      }
    }
  };
  
  // Double-tap detection pour le focus sur mobile/tablette
  const handleElementTouchStart = (index, e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap détecté
      e.preventDefault();
      handleElementClick(index, e);
      
      // Positionner le curseur à la position du tap
      const element = elementRefs.current[index];
      if (element) {
        // Focus et sélection précise
        const selection = window.getSelection();
        const range = document.createRange();
        
        if (e.target.childNodes.length > 0) {
          // Calcul de la position précise du curseur basé sur les coordonnées du touch
          try {
            const textNode = e.target.childNodes[0];
            const textRect = e.target.getBoundingClientRect();
            const offsetX = e.touches[0].clientX - textRect.left;
            const offsetY = e.touches[0].clientY - textRect.top;
            
            // Déterminer la position dans le texte
            const tempElement = document.createElement('span');
            tempElement.style.position = 'absolute';
            tempElement.style.visibility = 'hidden';
            e.target.appendChild(tempElement);
            
            let charIndex = 0;
            let found = false;
            
            // Parcourir le texte pour trouver la position exacte
            while (charIndex < textNode.textContent.length && !found) {
              tempElement.textContent = textNode.textContent.substr(0, charIndex + 1);
              if (tempElement.getBoundingClientRect().left + tempElement.getBoundingClientRect().width >= offsetX) {
                found = true;
              } else {
                charIndex++;
              }
            }
            
            e.target.removeChild(tempElement);
            
            range.setStart(textNode, charIndex);
            range.setEnd(textNode, charIndex);
          } catch (err) {
            // Fallback: placer le curseur au début du nœud
            range.selectNodeContents(e.target);
            range.collapse(true);
          }
        } else {
          // S'il n'y a pas de nœud enfant, sélectionner tout l'élément
          range.selectNodeContents(e.target);
          range.collapse(true);
        }
        
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Afficher la barre d'outils de formatage à une position appropriée
        const rect = e.target.getBoundingClientRect();
        setToolbarPosition({
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 50, // Au-dessus de l'élément
        });
      }
    } else {
      // Enregistrer le départ du toucher pour la gestion du scroll vs édition
      setTouchStartInfo({
        index,
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: now
      });
    }
    
    lastTapRef.current = now;
  };
  
  // Gestion du toucher en mouvement pour distinguer scroll vs édition
  const handleElementTouchMove = (e) => {
    if (!touchStartInfo) return;
    
    const deltaX = Math.abs(e.touches[0].clientX - touchStartInfo.x);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartInfo.y);
    
    // Si le mouvement est significatif, c'est probablement un scroll
    if (deltaX > 10 || deltaY > 10) {
      setTouchScrollEnabled(true);
    }
  };
  
  // Gestion de la fin du toucher
  const handleElementTouchEnd = () => {
    setTouchStartInfo(null);
    // Réactiver le scroll après un court délai pour éviter les faux déclenchements
    setTimeout(() => {
      setTouchScrollEnabled(true);
    }, 300);
  };
  
  // Naviguer vers une section
  const handleNavigateToSection = (sectionId) => {
    const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (sectionElement && editorContainerRef.current) {
      editorContainerRef.current.scrollTo({
        top: sectionElement.offsetTop - 80,
        behavior: 'smooth'
      });
      
      // Mettre à jour la section active
      setActiveSectionId(sectionId);
      
      // Fermer le menu de sections sur mobile
      if (device.isMobile) {
        setShowSections(false);
      }
      
      // Animation de highlight pour indiquer la section
      sectionElement.classList.add('section-highlight');
      setTimeout(() => {
        sectionElement.classList.remove('section-highlight');
      }, 1000);
    }
  };
  
  // Appliquer le formatage au texte sélectionné
  const applyFormatting = (format) => {
    if (selectedElementIndex === null) return;
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const element = elementRefs.current[selectedElementIndex];
    if (!element) return;
    
    const range = selection.getRangeAt(0);
    
    // Vérifier si la sélection est dans l'élément éditable sélectionné
    if (!element.contains(range.commonAncestorContainer)) return;
    
    const selectedText = selection.toString();
    if (!selectedText) return;
    
    // Application du formatage
    let newHtml;
    const currentHtml = element.innerHTML;
    
    switch (format) {
      case 'bold':
        document.execCommand('bold', false, null);
        break;
      case 'italic':
        document.execCommand('italic', false, null);
        break;
      case 'underline':
        document.execCommand('underline', false, null);
        break;
      case 'alignLeft':
        document.execCommand('justifyLeft', false, null);
        break;
      case 'alignCenter':
        document.execCommand('justifyCenter', false, null);
        break;
      case 'alignRight':
        document.execCommand('justifyRight', false, null);
        break;
      default:
        break;
    }
    
    // Capturer le nouveau HTML après la commande
    newHtml = element.innerHTML;
    
    // Mettre à jour le contenu édité si changé
    if (newHtml !== currentHtml) {
      handleElementEdit(selectedElementIndex, newHtml);
    }
    
    // Masquer la barre d'outils flottante après un court délai
    setTimeout(() => {
      setToolbarPosition({ visible: false, x: 0, y: 0 });
    }, 500);
  };
  
  // Gérer la sélection de texte pour afficher la barre d'outils
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    
    if (!selection.rangeCount) {
      setToolbarPosition({ visible: false, x: 0, y: 0 });
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    // Ne rien faire si la sélection est vide
    if (range.collapsed) {
      if (!touchSelection) {
        setToolbarPosition({ visible: false, x: 0, y: 0 });
      }
      return;
    }
    
    // Trouver l'élément éditable parent pour identifier l'index
    let editableParent = range.commonAncestorContainer;
    while (editableParent && !editableParent.hasAttribute?.('data-element-index')) {
      editableParent = editableParent.parentNode;
    }
    
    if (editableParent) {
      const index = parseInt(editableParent.getAttribute('data-element-index'));
      setSelectedElementIndex(index);
      
      // Positionner la barre d'outils au-dessus de la sélection
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 50, // Au-dessus du texte sélectionné
      });
    }
  }, [touchSelection]);
  
  // Observer les changements de sélection
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);
  
  // Gérer l'ajout de commentaires
  const handleAddComment = () => {
    if (selectedElementIndex === null) return;
    
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    // Créer un nouveau commentaire
    const newComment = {
      id: Date.now().toString(),
      elementIndex: selectedElementIndex,
      text: '',
      date: new Date().toISOString(),
      user: 'Utilisateur',
      selectedText: selectedText,
      isEditing: true
    };
    
    setComments([...comments, newComment]);
    setShowComments(true);
  };
  
  // Supprimer un commentaire
  const handleDeleteComment = (commentId) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };
  
  // Mise à jour d'un commentaire
  const handleUpdateComment = (commentId, newText) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? {...comment, text: newText, date: new Date().toISOString(), isEditing: false}
        : comment
    ));
  };
  
  // Gérer le clic sur l'élément indiquant un commentaire
  const handleCommentIndicatorClick = (index) => {
    setSelectedElementIndex(index);
    setShowComments(true);
    
    // Faire défiler jusqu'aux commentaires de cet élément
    const commentElement = document.querySelector(`[data-comment-element-index="${index}"]`);
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      commentElement.classList.add('comment-highlight');
      setTimeout(() => {
        commentElement.classList.remove('comment-highlight');
      }, 1000);
    }
  };
  
  // Toggle de l'affichage des commentaires
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  // Toggle du mode plein écran
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      editorRef.current.requestFullscreen().catch(err => {
        console.error('Erreur lors du passage en plein écran:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // Gérer le changement de taille de police
  const handleFontSizeChange = (size) => {
    setFontSize(size);
  };
  
  // Fonctions de sauvegarde et notification
  const handleSave = () => {
    onSave();
    showNotification('Document enregistré');
  };
  
  // Fonction pour afficher une notification
  const showNotification = (message, duration = 3000) => {
    setSavedNotification(true);
    setNotificationText(message);
    setTimeout(() => {
      setSavedNotification(false);
      setNotificationText('');
    }, duration);
  };
  
  // Gérer le téléchargement en PDF
  const handleDownload = async () => {
    try {
      // Afficher une notification de chargement
      showNotification('Génération du PDF...', 60000); // Long timeout car la génération peut prendre du temps
      
      // Utiliser notre nouvelle fonction pour générer le PDF
      await generateEditorPdf(editorRef, contractData?.title || 'contrat');
      
      // Afficher une notification de succès
      showNotification('PDF téléchargé avec succès!');
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      
      // Afficher une notification d'erreur
      showNotification('Erreur lors de la génération du PDF', 5000);
    }
  };
  
  // Calculer les sections pour la navigation
  const getSections = () => {
    const sections = [];
    contractElements.forEach((element, index) => {
      if (element.type === 'paragraph' && element.style === 'ContractArticle') {
        sections.push({
          id: `section-${index}`,
          index,
          text: editedElements[index] || element.text
        });
      }
    });
    return sections;
  };
  
  // Vérifier si un élément a des commentaires
  const getElementComments = (index) => {
    return comments.filter(comment => comment.elementIndex === index);
  };
  
  // Fonctions pour copier/coller/déplacer
  const handleCopyElement = (index) => {
    const elementToCopy = contractElements[index];
    const content = editedElements[index] || elementToCopy.text;
    setClipboard({ type: elementToCopy.type, style: elementToCopy.style, content });
    setContextMenuPosition(null);
    
    // Notification
    showNotification("Élément copié");
  };
  
  const handlePasteElement = (index) => {
    if (!clipboard) return;
    
    // Créer une nouvelle liste avec l'élément collé
    const newElements = [...contractElements];
    newElements.splice(index + 1, 0, {
      type: clipboard.type,
      style: clipboard.style,
      text: clipboard.content
    });
    
    onUpdateStructure(newElements);
    setContextMenuPosition(null);
    
    // Notification
    showNotification("Élément collé");
  };
  
  const handleMoveElement = (index, direction) => {
    if (index === null) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= contractElements.length) return;
    
    // Créer une copie de l'array d'éléments
    const newElements = [...contractElements];
    
    // Échanger les éléments
    [newElements[index], newElements[newIndex]] = [newElements[newIndex], newElements[index]];
    
    // Mettre à jour l'état
    onUpdateStructure(newElements);
    setSelectedElementIndex(newIndex);
    setContextMenuPosition(null);
  };
  
  // Gérer le menu contextuel
  const handleContextMenu = (e, index) => {
    e.preventDefault();
    
    // Position du menu contextuel
    const x = e.clientX;
    const y = e.clientY;
    
    setSelectedElementIndex(index);
    setContextMenuPosition({ x, y, index });
  };
  
  // Fermer le menu contextuel sur clic ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuPosition(null);
    };
    
    if (contextMenuPosition) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenuPosition]);
  
  // Composant de menu contextuel
  const ContextMenu = ({ position }) => {
    if (!position) return null;
    
    const { x, y, index } = position;
    
    return createPortal(
      <div 
        className="editor-context-menu"
        style={{ 
          top: `${y}px`, 
          left: `${x}px`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={() => handleCopyElement(index)}>
          <Copy size={14} className="mr-2" />
          Copier
        </button>
        {clipboard && (
          <button onClick={() => handlePasteElement(index)}>
            <Plus size={14} className="mr-2" />
            Coller après
          </button>
        )}
        <button onClick={() => handleMoveElement(index, 'up')}>
          <ChevronUp size={14} className="mr-2" />
          Déplacer vers le haut
        </button>
        <button onClick={() => handleMoveElement(index, 'down')}>
          <ChevronDown size={14} className="mr-2" />
          Déplacer vers le bas
        </button>
        <button onClick={() => handleAddComment()}>
          <MessageCircle size={14} className="mr-2" />
          Ajouter un commentaire
        </button>
      </div>,
      document.body
    );
  };
  
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
          className={`group relative contract-element ${elementStyle} 
            ${isSelected ? 'element-selected' : ''} 
            ${hasComments ? 'has-comments' : ''}`}
          onClick={(e) => handleElementClick(index, e)}
          onContextMenu={(e) => handleContextMenu(e, index)}
          data-element-index={index}
          data-section-id={sectionId}
          key={index}
        >
          <div 
            className={`element-content ${elementStyle}-content`}
            contentEditable={element.style !== 'ContractTitle'} // Titres non éditables
            suppressContentEditableWarning={true}
            onBlur={(e) => handleElementEdit(index, e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: text }}
            data-element-index={index}
            onTouchStart={(e) => handleElementTouchStart(index, e)}
            onTouchMove={handleElementTouchMove}
            onTouchEnd={handleElementTouchEnd}
            style={{ 
              touchAction: touchScrollEnabled ? 'auto' : 'none',
              userSelect: 'text',
              WebkitUserSelect: 'text'
            }}
          ></div>
          
          {/* Indicateur de commentaires */}
          {hasComments && (
            <button 
              className="comment-indicator"
              onClick={(e) => {
                e.stopPropagation();
                handleCommentIndicatorClick(index);
              }}
              title={`${elementComments.length} commentaire${elementComments.length > 1 ? 's' : ''}`}
            >
              <MessageCircle size={16} className="text-yellow-500" />
              {elementComments.length > 1 && (
                <span className="comment-count">{elementComments.length}</span>
              )}
            </button>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  // Déterminer si l'utilisateur est sur mobile/iPad
  const isMobileOrTablet = device.isMobile || device.isTablet;
  const isIPad = device.isTablet && device.isIOS;
  
  return (
    <div 
      ref={editorRef}
      className={`contract-editor ${isFullscreen ? 'fullscreen' : ''} ${fontSize}`}
    >
      {/* Barre d'outils principale */}
      <div className="editor-toolbar">
        <div className="editor-toolbar-left">
          <button 
            className="toolbar-button" 
            onClick={handleSave}
            title="Enregistrer"
          >
            <Save size={18} />
            <span className="button-text">Enregistrer</span>
          </button>
          
          <button 
            className="toolbar-button" 
            onClick={handleDownload}
            title="Télécharger en PDF"
          >
            <Download size={18} />
            <span className="button-text">PDF</span>
          </button>
          
          <button 
            className="toolbar-button" 
            onClick={toggleComments}
            title="Commentaires"
          >
            <MessageCircle size={18} className={showComments ? 'text-yellow-500' : ''} />
            <span className="button-text">Commentaires</span>
          </button>
        </div>
        
        <div className="editor-toolbar-right">
          <div className="font-size-selector">
            <button className="font-size-button" title="Taille de texte">
              <Type size={18} />
            </button>
            <div className="font-size-dropdown">
              <button 
                className={`font-size-option ${fontSize === 'small' ? 'active' : ''}`} 
                onClick={() => handleFontSizeChange('small')}
              >
                Petit
              </button>
              <button 
                className={`font-size-option ${fontSize === 'normal' ? 'active' : ''}`} 
                onClick={() => handleFontSizeChange('normal')}
              >
                Normal
              </button>
              <button 
                className={`font-size-option ${fontSize === 'large' ? 'active' : ''}`} 
                onClick={() => handleFontSizeChange('large')}
              >
                Grand
              </button>
            </div>
          </div>
          
          <button 
            className="toolbar-button" 
            onClick={toggleFullscreen}
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? <MinimizeIcon size={18} /> : <MaximizeIcon size={18} />}
          </button>
          
          {/* Bouton pour afficher/masquer les sections sur mobile/tablette */}
          {isMobileOrTablet && (
            <button 
              className="toolbar-button section-toggle"
              onClick={() => setShowSections(!showSections)}
            >
              {showSections ? <X size={18} /> : <List size={18} />}
              <span className="button-text">Sections</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Notification de sauvegarde */}
      {savedNotification && (
        <div className="save-notification">
          <Check size={16} className="text-green-500" />
          <span>{notificationText || 'Document enregistré'}</span>
        </div>
      )}
      
      {/* Conteneur principal avec panneau de navigation et éditeur */}
      <div className="editor-container">
        {/* Navigation des sections (visible uniquement sur desktop ou quand activé sur mobile) */}
        <div className={`section-navigator ${
          (showSections && isMobileOrTablet) ? 'section-navigator-mobile-visible' : 
          (!isMobileOrTablet) ? '' : 'section-navigator-mobile-hidden'
        }`}>
          <EditorSectionNavigator 
            sections={getSections()}
            activeSectionId={activeSectionId}
            onNavigate={handleNavigateToSection}
            onClose={() => setShowSections(false)}
          />
        </div>
        
        {/* Contenu principal de l'éditeur */}
        <div 
          className="editor-content-container"
          ref={editorContainerRef}
        >
          {isLoading ? (
            <div className="editor-loading">
              <div className="spinner"></div>
              <p>Chargement du document...</p>
            </div>
          ) : error ? (
            <div className="editor-error">
              <AlertCircle size={24} className="text-red-500" />
              <p>{error}</p>
            </div>
          ) : (
            <div className={`editor-document ${fontSize}`}>
              {contractElements.map((element, index) => renderContractElement(element, index))}
            </div>
          )}
        </div>
        
                  {/* Panneau de commentaires */}
        {showComments && (
          <div className="comments-panel">
            <EditorCommentPanel 
              comments={comments}
              selectedElementIndex={selectedElementIndex}
              onDeleteComment={handleDeleteComment}
              onUpdateComment={handleUpdateComment}
              onClose={() => setShowComments(false)}
            />
          </div>
        )}
      </div>
      
      {/* Barre d'outils flottante pour la sélection de texte */}
      {toolbarPosition.visible && (
        <div 
          className="floating-toolbar"
          style={{
            left: `${toolbarPosition.x}px`,
            top: `${toolbarPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <button onClick={() => applyFormatting('bold')} title="Gras">
            <Bold size={16} />
          </button>
          <button onClick={() => applyFormatting('italic')} title="Italique">
            <Italic size={16} />
          </button>
          <button onClick={() => applyFormatting('underline')} title="Souligné">
            <Underline size={16} />
          </button>
          <button onClick={() => applyFormatting('alignLeft')} title="Aligner à gauche">
            <AlignLeft size={16} />
          </button>
          <button onClick={() => applyFormatting('alignCenter')} title="Centrer">
            <AlignCenter size={16} />
          </button>
          <button onClick={() => applyFormatting('alignRight')} title="Aligner à droite">
            <AlignRight size={16} />
          </button>
          <button onClick={handleAddComment} title="Ajouter un commentaire">
            <MessageCircle size={16} className="text-yellow-500" />
          </button>
        </div>
      )}
      
      {/* Dock flottant pour tous les appareils */}
      <EditorFloatingDock 
        onFormat={applyFormatting}
        onSave={handleSave}
        onAddComment={handleAddComment}
        onToggleComments={toggleComments}
        onToggleSections={toggleSections}
        showComments={showComments}
        showSections={showSections}
        onToggleKeyboard={() => setTouchScrollEnabled(!touchScrollEnabled)}
      />
      
      {/* Menu contextuel */}
      <ContextMenu position={contextMenuPosition} />
    </div>
  );
};

// Icônes pour le plein écran
const MaximizeIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
  </svg>
);

const MinimizeIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
  </svg>
);

const ChevronUp = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const ChevronDown = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const List = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const AlertCircle = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export default ContractEditor;