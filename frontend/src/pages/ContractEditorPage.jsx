import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, Save, Download, Settings, CheckCircle, AlertCircle, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  ArrowUp, ArrowDown, Maximize, Minimize, MessageCircle, X,
  Moon, Sun, ChevronUp, ChevronRight
} from 'lucide-react';
import { getContractById, getContractElements, updateContract, generatePdf } from '../services/api';

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
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' ou 'settings'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedElementIndex, setSelectedElementIndex] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [fontSize, setFontSize] = useState('normal');
  const [showCommentPanel, setShowCommentPanel] = useState(false);
  const [comments, setComments] = useState([]);
  const [showMobileSections, setShowMobileSections] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
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
  
  const toggleTheme = () => {
    setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
  };
  
  const addComment = (index, text) => {
    // Créer un nouveau commentaire
    const newComment = {
      id: Date.now(), // Utiliser un timestamp comme ID temporaire
      elementIndex: index,
      text: text,
      date: new Date().toISOString(),
      user: "Utilisateur"
    };
    
    // Ajouter le commentaire à la liste
    setComments(prevComments => [...prevComments, newComment]);
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
    const baseClass = currentTheme === 'dark' ? 'text-white ' : 'text-gray-800 ';
    
    switch (styleType) {
      case 'ContractTitle':
        return `${baseClass} text-xl font-bold text-center mb-4`;
      case 'ContractSubtitle':
        return `${baseClass} text-lg font-semibold text-center mb-3`;
      case 'ContractArticle':
        return `${baseClass} text-base font-bold mb-2`;
      case 'ContractSubArticle':
        return `${baseClass} text-base font-semibold mb-2`;
      case 'ContractText':
        return `${baseClass} text-sm mb-2`;
      default:
        return `${baseClass} text-sm mb-2`;
    }
  };
  
  // Rendre un élément du contrat en fonction de son type
  const renderContractElement = (element, index) => {
    if (element.type === 'spacer') {
      return <div key={`spacer-${index}`} style={{ height: element.height }} className="w-full"></div>;
    }
    
    if (element.type === 'paragraph') {
      const className = getElementStyle(element.style);
      const text = editedElements[index] !== undefined ? editedElements[index] : element.text;
      const isSelected = selectedElementIndex === index;
      const hasComment = comments.some(comment => comment.elementIndex === index);
      
      // Classe CSS pour la taille de police
      let fontSizeClass = '';
      if (fontSize === 'small') fontSizeClass = 'text-xs';
      else if (fontSize === 'large') fontSizeClass = 'text-base';
      
      // Rendre un élément éditable avec une apparence similaire au PDF
      return (
        <div 
          key={`paragraph-${index}`}
          className={`relative group ${className} ${fontSizeClass} ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500 pl-2' : ''} hover:bg-gray-50 transition-colors py-1 rounded`}
          onClick={() => handleElementClick(index)}
        >
          <div 
            className={`w-full min-h-[1.5em] ${hasComment ? 'border-r-4 border-yellow-300' : ''}`}
            contentEditable={element.style !== 'ContractTitle'} // Titres non éditables pour cet exemple
            suppressContentEditableWarning={true}
            onBlur={(e) => handleElementChange(index, e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: text }}
          ></div>
          
          {hasComment && (
            <div className="absolute right-0 top-0 text-yellow-500">
              <MessageCircle size={16} />
            </div>
          )}
          
          {isSelected && (
            <div className="absolute right-0 top-0 hidden group-hover:flex bg-white border border-gray-200 rounded-md shadow-sm p-1">
              <button 
                title="Déplacer vers le haut"
                className="p-1 text-gray-500 hover:text-blue-600"
                onClick={(e) => { e.stopPropagation(); moveElement(index, 'up'); }}
              >
                <ArrowUp size={14} />
              </button>
              <button 
                title="Déplacer vers le bas"
                className="p-1 text-gray-500 hover:text-blue-600"
                onClick={(e) => { e.stopPropagation(); moveElement(index, 'down'); }}
              >
                <ArrowDown size={14} />
              </button>
              <button 
                title="Ajouter un commentaire"
                className="p-1 text-gray-500 hover:text-blue-600"
                onClick={(e) => { e.stopPropagation(); addComment(index, text); }}
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
  
  const renderCommentPanel = () => {
    if (!showCommentPanel) return null;
    
    return (
      <div className="bg-white border-l border-gray-200 w-64 md:w-80 p-4 overflow-y-auto h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-800">Commentaires</h3>
          <button onClick={() => setShowCommentPanel(false)} className="p-1 rounded-full hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
        
        {comments.length === 0 ? (
          <div className="text-gray-500 text-sm p-4 text-center">
            Aucun commentaire pour ce contrat
          </div>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment, index) => (
              <li key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">Section {comment.elementIndex + 1}</span>
                  <button 
                    onClick={() => deleteComment(comment.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-gray-700 text-sm">{comment.text}</p>
                <span className="text-gray-400 text-xs mt-2 block">Ajouté le {new Date(comment.date).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
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
    <div className={`min-h-screen bg-gray-50 flex flex-col ${isFullscreen ? 'overflow-hidden' : ''}`} ref={editorRef}>
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
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
              {/* Barre d'outils */}
              <div className="border-b border-gray-200 px-4 py-2 flex justify-between items-center flex-wrap gap-y-2">
                <div className="flex space-x-1 flex-wrap">
                  <button 
                    onClick={() => applyFormatting('bold')}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
                    title="Gras"
                  >
                    <Bold size={16} />
                  </button>
                  <button 
                    onClick={() => applyFormatting('italic')}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
                    title="Italique"
                  >
                    <Italic size={16} />
                  </button>
                  <button 
                    onClick={() => applyFormatting('underline')}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
                    title="Souligné"
                  >
                    <Underline size={16} />
                  </button>
                  <span className="border-r border-gray-200 mx-1"></span>
                  <button 
                    onClick={() => applyFormatting('alignLeft')}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
                    title="Aligner à gauche"
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button 
                    onClick={() => applyFormatting('alignCenter')}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
                    title="Centrer"
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button 
                    onClick={() => applyFormatting('alignRight')}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
                    title="Aligner à droite"
                  >
                    <AlignRight size={16} />
                  </button>
                </div>
                
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
                    onClick={toggleTheme}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
                    title={currentTheme === 'light' ? 'Mode sombre' : 'Mode clair'}
                  >
                    {currentTheme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  </button>
                  
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
                    title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
                  >
                    {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  </button>
                  
                  <button
                    onClick={() => setShowCommentPanel(!showCommentPanel)}
                    className={`p-1.5 rounded-md hover:bg-gray-100 ${showCommentPanel ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                    title="Commentaires"
                  >
                    <MessageCircle size={16} />
                  </button>
                </div>
              </div>
              
              {/* Zone d'édition du contrat */}
              <div className="p-4 sm:p-8">
                {elementsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {contractElements.map((element, index) => renderContractElement(element, index))}
                  </div>
                )}
              </div>
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Thème</label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentTheme('light')}
                          className={`px-3 py-1.5 rounded-md text-sm flex items-center ${currentTheme === 'light' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}
                        >
                          <Sun size={16} className="mr-1.5" />
                          Clair
                        </button>
                        <button
                          onClick={() => setCurrentTheme('dark')}
                          className={`px-3 py-1.5 rounded-md text-sm flex items-center ${currentTheme === 'dark' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}
                        >
                          <Moon size={16} className="mr-1.5" />
                          Sombre
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
        
        {/* Panneau de commentaires */}
        {showCommentPanel && activeTab === 'editor' && (
          <aside className="fixed inset-y-0 right-0 w-full sm:w-80 bg-white border-l border-gray-200 z-40 overflow-y-auto p-4 pt-20 sm:pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Commentaires</h2>
              <button 
                className="p-1.5 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-md"
                onClick={() => setShowCommentPanel(false)}
              >
                <X size={16} />
              </button>
            </div>
            
            {renderCommentPanel()}
          </aside>
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