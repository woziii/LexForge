import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Edit2, Trash2, ArrowRight } from 'lucide-react';

/**
 * Panneau de commentaires pour l'éditeur de contrat
 * Optimisé pour desktop, iPad et iPhone
 */
const EditorCommentPanel = ({ comments, selectedElementIndex, onDeleteComment, onUpdateComment, onClose }) => {
  const [commentsBySection, setCommentsBySection] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const textareaRef = useRef(null);
  
  // Détecter le type d'appareil pour l'affichage
  const isMobile = window.innerWidth <= 768 || 
                 /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Organiser les commentaires par section
  useEffect(() => {
    const grouped = {};
    
    comments.forEach(comment => {
      const sectionId = comment.elementIndex;
      if (!grouped[sectionId]) {
        grouped[sectionId] = [];
      }
      grouped[sectionId].push(comment);
    });
    
    setCommentsBySection(grouped);
    
    // Développer automatiquement la section sélectionnée
    if (selectedElementIndex !== null) {
      setExpandedSections(prev => ({
        ...prev,
        [selectedElementIndex]: true
      }));
    }
    
    // Si un commentaire est en mode édition, se concentrer sur lui
    const emptyComment = comments.find(c => c.isEditing && !c.text.trim());
    if (emptyComment) {
      setEditingCommentId(emptyComment.id);
      setEditedText('');
    }
  }, [comments, selectedElementIndex]);
  
  // Focus sur le textarea quand on commence à éditer
  useEffect(() => {
    if (editingCommentId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editingCommentId]);
  
  // Toggle d'expansion des sections
  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Commencer l'édition d'un commentaire
  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditedText(comment.text);
  };
  
  // Sauvegarder un commentaire
  const saveComment = (commentId) => {
    if (!editedText.trim()) {
      onDeleteComment(commentId);
    } else {
      onUpdateComment(commentId, editedText);
    }
    
    setEditingCommentId(null);
    setEditedText('');
  };
  
  // Annuler l'édition
  const cancelEditing = (comment) => {
    if (!comment.text.trim() && comment.isEditing) {
      onDeleteComment(comment.id);
    }
    
    setEditingCommentId(null);
    setEditedText('');
  };
  
  // Formatter la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Obtenir un aperçu du contexte
  const getContextPreview = (elementIndex) => {
    const element = document.querySelector(`[data-element-index="${elementIndex}"]`);
    if (!element) return '';
    
    const text = element.textContent || '';
    return text.slice(0, 50) + (text.length > 50 ? '...' : '');
  };
  
  // Naviguer vers l'élément associé
  const navigateToElement = (elementIndex) => {
    const element = document.querySelector(`[data-element-index="${elementIndex}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight
      element.classList.add('highlight-element');
      setTimeout(() => {
        element.classList.remove('highlight-element');
      }, 2000);
      
      // Fermer sur mobile
      if (isMobile) onClose();
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <MessageCircle size={18} className="text-yellow-500 mr-2" />
          <h3 className="font-medium text-gray-800 text-sm sm:text-base">
            Commentaires ({comments.length})
          </h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="py-12 px-4 text-center text-gray-500 flex flex-col items-center">
            <MessageCircle size={32} className="text-gray-300 mb-3" />
            <p className="text-sm sm:text-base">Aucun commentaire</p>
            <p className="text-xs text-gray-400 mt-1">
              Sélectionnez du texte et utilisez l'outil commentaire
            </p>
          </div>
        ) : (
          <div className="py-2">
            {Object.entries(commentsBySection).map(([sectionIndex, sectionComments]) => (
              <div key={sectionIndex} className="mb-4">
                <button
                  className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-gray-50"
                  onClick={() => toggleSection(sectionIndex)}
                >
                  <div>
                    <span className="block text-xs font-medium text-blue-600">Section {parseInt(sectionIndex) + 1}</span>
                    <span className="block text-xs text-gray-500">{getContextPreview(sectionIndex)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 mr-2">
                      {sectionComments.length}
                    </span>
                    <ArrowRight size={14} 
                      className={`text-gray-400 transform transition-transform duration-200 ${
                        expandedSections[sectionIndex] ? 'rotate-90' : ''
                      }`} 
                    />
                  </div>
                </button>
                
                {expandedSections[sectionIndex] && (
                  <div className="px-4 py-2 space-y-3">
                    {sectionComments.map(comment => (
                      <div 
                        key={comment.id} 
                        className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                      >
                        {editingCommentId === comment.id ? (
                          <div>
                            {comment.selectedText && (
                              <div className="bg-yellow-50 p-2 rounded-t-md border border-yellow-100 mb-2">
                                <span className="block text-xs text-yellow-700 font-medium mb-1">Texte sélectionné :</span>
                                <span className="text-xs text-yellow-800 italic">"{comment.selectedText}"</span>
                              </div>
                            )}
                            
                            <textarea
                              ref={textareaRef}
                              value={editedText}
                              onChange={(e) => setEditedText(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                              rows={3}
                              placeholder="Votre commentaire..."
                            />
                            
                            <div className="flex justify-end mt-2 space-x-2">
                              <button
                                onClick={() => cancelEditing(comment)}
                                className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={() => saveComment(comment.id)}
                                className="px-3 py-1 text-xs bg-blue-600 rounded-md text-white hover:bg-blue-700"
                              >
                                Enregistrer
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.date)}
                              </span>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => startEditing(comment)}
                                  className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                  title="Modifier"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => onDeleteComment(comment.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                                  title="Supprimer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            
                            {comment.selectedText && (
                              <div className="bg-yellow-50 p-2 rounded-md border border-yellow-100 mb-2">
                                <span className="block text-xs text-yellow-700 font-medium mb-1">Texte sélectionné :</span>
                                <span className="text-xs text-yellow-800 italic">"{comment.selectedText}"</span>
                              </div>
                            )}
                            
                            <div className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
                              {comment.text}
                            </div>
                            
                            <button
                              onClick={() => navigateToElement(comment.elementIndex)}
                              className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                            >
                              Voir dans le document
                              <ArrowRight size={12} className="ml-1" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {isMobile && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
          >
            Fermer
          </button>
        </div>
      )}
      
      <style jsx>{`
        .highlight-element {
          animation: highlight-pulse 2s ease;
        }
        
        @keyframes highlight-pulse {
          0% { background-color: rgba(59, 130, 246, 0); }
          30% { background-color: rgba(59, 130, 246, 0.2); }
          100% { background-color: rgba(59, 130, 246, 0); }
        }
      `}</style>
    </div>
  );
};

export default EditorCommentPanel;