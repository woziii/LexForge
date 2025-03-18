import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, Download, ChevronLeft, CheckCircle, AlertCircle, Settings, Eye, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  ArrowUp, ArrowDown, Maximize, Minimize, MessageCircle, X,
  Moon, Sun
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
    if (!contract) return;
    
    try {
      await generatePdf(contract.data, title);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Impossible de générer le PDF. Veuillez réessayer plus tard.');
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
  
  const addComment = () => {
    if (selectedElementIndex === null) return;
    
    const newComment = {
      id: `comment-${Date.now()}`,
      elementIndex: selectedElementIndex,
      author: 'Vous',
      date: new Date().toISOString(),
      text: 'Nouveau commentaire'
    };
    
    setComments([...comments, newComment]);
    setShowCommentPanel(true);
  };
  
  const updateComment = (commentId, newText) => {
    const updatedComments = comments.map(comment => 
      comment.id === commentId ? {...comment, text: newText} : comment
    );
    setComments(updatedComments);
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
                onClick={(e) => { e.stopPropagation(); addComment(); }}
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
    
    const relevantComments = selectedElementIndex !== null
      ? comments.filter(comment => comment.elementIndex === selectedElementIndex)
      : comments;
    
    return (
      <div className="bg-white border-l border-gray-200 w-80 p-4 overflow-y-auto h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-800">Commentaires</h3>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowCommentPanel(false)}
          >
            <X size={18} />
          </button>
        </div>
        
        {relevantComments.length === 0 ? (
          <p className="text-gray-500 text-center">Aucun commentaire</p>
        ) : (
          <div className="space-y-4">
            {relevantComments.map(comment => (
              <div key={comment.id} className="bg-yellow-50 border-l-4 border-yellow-300 p-3 rounded">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{comment.author}</span>
                  <span>{new Date(comment.date).toLocaleDateString()}</span>
                </div>
                <div 
                  className="text-sm"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateComment(comment.id, e.target.innerText)}
                  dangerouslySetInnerHTML={{ __html: comment.text }}
                ></div>
                <div className="flex justify-end mt-2">
                  <button 
                    className="text-xs text-red-500 hover:text-red-700"
                    onClick={() => deleteComment(comment.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const renderEditorToolbar = () => {
    return (
      <div className="bg-white border-b border-gray-200 p-2 flex items-center space-x-1">
        <div className="flex space-x-1 mr-4">
          <button 
            title="Gras"
            className="p-1.5 rounded hover:bg-gray-100"
            onClick={() => applyFormatting('bold')}
          >
            <Bold size={16} />
          </button>
          <button 
            title="Italique"
            className="p-1.5 rounded hover:bg-gray-100"
            onClick={() => applyFormatting('italic')}
          >
            <Italic size={16} />
          </button>
          <button 
            title="Souligné"
            className="p-1.5 rounded hover:bg-gray-100"
            onClick={() => applyFormatting('underline')}
          >
            <Underline size={16} />
          </button>
        </div>
        
        <div className="flex space-x-1 mr-4">
          <button 
            title="Aligner à gauche"
            className="p-1.5 rounded hover:bg-gray-100"
          >
            <AlignLeft size={16} />
          </button>
          <button 
            title="Centrer"
            className="p-1.5 rounded hover:bg-gray-100"
          >
            <AlignCenter size={16} />
          </button>
          <button 
            title="Aligner à droite"
            className="p-1.5 rounded hover:bg-gray-100"
          >
            <AlignRight size={16} />
          </button>
        </div>
        
        <div className="flex space-x-1 mr-4">
          <select 
            className="text-sm border border-gray-200 rounded p-1"
            value={fontSize}
            onChange={(e) => changeFontSize(e.target.value)}
          >
            <option value="small">Petit</option>
            <option value="normal">Normal</option>
            <option value="large">Grand</option>
          </select>
        </div>
        
        <div className="flex space-x-1 mr-4">
          <button 
            title="Ajouter un commentaire"
            className={`p-1.5 rounded ${selectedElementIndex !== null ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
            onClick={addComment}
            disabled={selectedElementIndex === null}
          >
            <MessageCircle size={16} />
          </button>
        </div>
        
        <div className="flex space-x-1">
          <button 
            title={isFullscreen ? "Quitter le mode plein écran" : "Mode plein écran"}
            className="p-1.5 rounded hover:bg-gray-100"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
          <button 
            title={`Passer au thème ${currentTheme === 'light' ? 'sombre' : 'clair'}`}
            className="p-1.5 rounded hover:bg-gray-100"
            onClick={toggleTheme}
          >
            {currentTheme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    );
  };
  
  const renderSectionList = () => {
    const sections = getSections();
    
    return (
      <div className="bg-white border-r border-gray-200 w-60 p-4 overflow-y-auto h-full">
        <h3 className="font-medium text-gray-800 mb-4">Sections du contrat</h3>
        <ul className="space-y-2">
          {sections.map((section) => (
            <li 
              key={section.index}
              className={`p-2 text-sm rounded cursor-pointer transition-colors ${selectedSection === section.index ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
              onClick={() => {
                setSelectedSection(section.index);
                setSelectedElementIndex(section.index);
                
                // Faire défiler jusqu'à cette section
                const element = document.getElementById(`element-${section.index}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              {section.text.substring(0, 40)}...
            </li>
          ))}
        </ul>
      </div>
    );
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
      className={`min-h-screen ${currentTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}
      ref={editorRef}
    >
      <div className={`shadow-sm border-b ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={handleGoBack}
                className={`mr-4 ${currentTheme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <ChevronLeft size={20} />
              </button>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className={`font-medium text-lg border-none focus:ring-0 focus:outline-none p-0 ${
                  currentTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-transparent text-gray-800'
                }`}
                placeholder="Titre du contrat"
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex space-x-1 ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} p-1 rounded-md`}>
                <button 
                  className={`px-3 py-1 rounded-md ${
                    activeTab === 'editor' 
                      ? (currentTheme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white shadow-sm') 
                      : (currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600')
                  }`}
                  onClick={() => setActiveTab('editor')}
                >
                  <Eye size={16} className="inline mr-1" />
                  Éditeur
                </button>
                <button 
                  className={`px-3 py-1 rounded-md ${
                    activeTab === 'settings' 
                      ? (currentTheme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white shadow-sm') 
                      : (currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600')
                  }`}
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings size={16} className="inline mr-1" />
                  Paramètres
                </button>
              </div>
              <button 
                onClick={handleSave}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition duration-300"
              >
                <Save size={16} className="mr-1" />
                Enregistrer
              </button>
              <button 
                onClick={handleDownloadPdf}
                className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition duration-300"
              >
                <Download size={16} className="mr-1" />
                Télécharger PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {savedMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md flex items-center z-50">
          <CheckCircle size={16} className="mr-2" />
          Modifications sauvegardées
        </div>
      )}
      
      {activeTab === 'editor' ? (
        <div className="flex">
          {/* Navigation des sections */}
          {renderSectionList()}
          
          <div className="flex-grow">
            {/* Barre d'outils d'édition */}
            {renderEditorToolbar()}
            
            {/* Contenu du contrat */}
            <div className={`p-8 overflow-y-auto ${isFullscreen ? 'h-[calc(100vh-6rem)]' : 'h-[calc(100vh-12rem)]'}`}>
              <div className={`max-w-4xl mx-auto ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg shadow-sm p-8 overflow-hidden`}>
                {elementsLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${currentTheme === 'dark' ? 'border-blue-400' : 'border-blue-500'}`}></div>
                  </div>
                ) : (
                  <div className={`contract-editor ${currentTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {contractElements.map((element, index) => (
                      <div id={`element-${index}`} key={index}>
                        {renderContractElement(element, index)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Panneau de commentaires */}
          {renderCommentPanel()}
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className={`${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-8`}>
            <h2 className={`text-xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-800'} mb-6`}>
              Paramètres du contrat
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="mb-6">
                  <label className={`block text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Titre du contrat
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    className={`w-full ${
                      currentTheme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-md shadow-sm p-2`}
                    placeholder="Titre du contrat"
                  />
                </div>
                
                <div className="mb-6">
                  <h3 className={`text-lg font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Apparence
                  </h3>
                  <div className={`mb-4 ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-md p-4`}>
                    <div className="flex justify-between items-center mb-4">
                      <label className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Thème
                      </label>
                      <div className={`flex p-1 ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full`}>
                        <button 
                          className={`px-3 py-1 rounded-full text-sm ${currentTheme === 'light' ? 'bg-white shadow' : ''}`}
                          onClick={() => setCurrentTheme('light')}
                        >
                          Clair
                        </button>
                        <button 
                          className={`px-3 py-1 rounded-full text-sm ${currentTheme === 'dark' ? 'bg-gray-800 shadow' : ''}`}
                          onClick={() => setCurrentTheme('dark')}
                        >
                          Sombre
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Taille du texte
                      </label>
                      <div className={`flex p-1 ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full`}>
                        <button 
                          className={`px-3 py-1 rounded-full text-sm ${fontSize === 'small' ? (currentTheme === 'dark' ? 'bg-gray-800 shadow' : 'bg-white shadow') : ''}`}
                          onClick={() => changeFontSize('small')}
                        >
                          Petit
                        </button>
                        <button 
                          className={`px-3 py-1 rounded-full text-sm ${fontSize === 'normal' ? (currentTheme === 'dark' ? 'bg-gray-800 shadow' : 'bg-white shadow') : ''}`}
                          onClick={() => changeFontSize('normal')}
                        >
                          Normal
                        </button>
                        <button 
                          className={`px-3 py-1 rounded-full text-sm ${fontSize === 'large' ? (currentTheme === 'dark' ? 'bg-gray-800 shadow' : 'bg-white shadow') : ''}`}
                          onClick={() => changeFontSize('large')}
                        >
                          Grand
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="mb-6">
                  <h3 className={`text-lg font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Options de sécurité
                  </h3>
                  <div className={`${currentTheme === 'dark' ? 'bg-gray-700 border-blue-800' : 'bg-blue-50 border-blue-400'} border-l-4 p-4 mb-4`}>
                    <p className={`text-sm ${currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                      <strong>Note :</strong> L'éditeur de contrat est protégé contre le copier-coller. Les utilisateurs ne peuvent pas sélectionner ou copier le texte du contrat.
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className={`text-lg font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Téléchargement du contrat
                  </h3>
                  <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Vous pouvez télécharger votre contrat au format PDF pour l'imprimer ou le partager.
                  </p>
                  <button 
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition duration-300"
                  >
                    <Download size={16} className="mr-2" />
                    Télécharger au format PDF
                  </button>
                </div>
                
                <div className="mb-6">
                  <h3 className={`text-lg font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Commentaires et annotations
                  </h3>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setShowCommentPanel(!showCommentPanel)}
                      className={`inline-flex items-center px-4 py-2 ${
                        currentTheme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      } rounded-md transition duration-300`}
                    >
                      <MessageCircle size={16} className="mr-2" />
                      {showCommentPanel ? 'Masquer les commentaires' : 'Afficher les commentaires'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractEditorPage;