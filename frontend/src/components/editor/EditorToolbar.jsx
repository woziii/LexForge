import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List, 
  ListOrdered,
  Type, 
  Maximize, 
  Minimize,
  CheckSquare,
  Table,
  Link,
  Image
} from 'lucide-react';
import useDeviceDetect from '../../hooks/useDeviceDetect';

/**
 * Barre d'outils avancée pour l'éditeur de contrat
 * Fournit des options de formatage et d'insertion
 */
const EditorToolbar = ({
  onFormat,
  onInsert,
  onFontSizeChange,
  onToggleFullscreen,
  fontSize = 'normal',
  isFullscreen = false,
  elementStyle = 'text'
}) => {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const device = useDeviceDetect();
  
  // Options de formatage de base
  const formatOptions = [
    { icon: <Bold size={16} />, action: 'bold', label: 'Gras' },
    { icon: <Italic size={16} />, action: 'italic', label: 'Italique' },
    { icon: <Underline size={16} />, action: 'underline', label: 'Souligné' },
  ];
  
  // Options d'alignement
  const alignOptions = [
    { icon: <AlignLeft size={16} />, action: 'alignLeft', label: 'Aligner à gauche' },
    { icon: <AlignCenter size={16} />, action: 'alignCenter', label: 'Centrer' },
    { icon: <AlignRight size={16} />, action: 'alignRight', label: 'Aligner à droite' },
  ];
  
  // Options d'insertion (avancées)
  const insertOptions = [
    { icon: <List size={16} />, action: 'insertUnorderedList', label: 'Liste à puces' },
    { icon: <ListOrdered size={16} />, action: 'insertOrderedList', label: 'Liste numérotée' },
    { icon: <CheckSquare size={16} />, action: 'insertCheckList', label: 'Liste à cocher' },
    { icon: <Table size={16} />, action: 'insertTable', label: 'Tableau' },
    { icon: <Link size={16} />, action: 'insertLink', label: 'Lien' },
    { icon: <Image size={16} />, action: 'insertImage', label: 'Image' },
  ];
  
  // Options de taille de police
  const fontSizeOptions = [
    { value: 'small', label: 'Petit' },
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Grand' },
  ];
  
  // Gérer l'action de format
  const handleFormat = (action) => {
    onFormat(action);
  };
  
  // Gérer l'action d'insertion
  const handleInsert = (action) => {
    onInsert(action);
    setShowMoreOptions(false);
  };
  
  // Version mobile simplifiée
  if (device.isMobile) {
    return (
      <div className="editor-toolbar-mobile">
        <div className="toolbar-section">
          {formatOptions.map((option) => (
            <button
              key={option.action}
              className="toolbar-button"
              onClick={() => handleFormat(option.action)}
              title={option.label}
            >
              {option.icon}
            </button>
          ))}
        </div>
        
        <div className="toolbar-section">
          {alignOptions.map((option) => (
            <button
              key={option.action}
              className="toolbar-button"
              onClick={() => handleFormat(option.action)}
              title={option.label}
            >
              {option.icon}
            </button>
          ))}
        </div>
        
        <div className="toolbar-section">
          <button
            className="toolbar-button more-button"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            title="Plus d'options"
          >
            <span className="more-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          
          {showMoreOptions && (
            <div className="more-options-dropdown">
              {insertOptions.map((option) => (
                <button
                  key={option.action}
                  className="dropdown-item"
                  onClick={() => handleInsert(option.action)}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Version complète pour desktop et tablette
  return (
    <div className="editor-toolbar">
      <div className="toolbar-group format-group">
        {formatOptions.map((option) => (
          <button
            key={option.action}
            className="toolbar-button"
            onClick={() => handleFormat(option.action)}
            title={option.label}
          >
            {option.icon}
          </button>
        ))}
        
        <div className="toolbar-separator"></div>
        
        {alignOptions.map((option) => (
          <button
            key={option.action}
            className="toolbar-button"
            onClick={() => handleFormat(option.action)}
            title={option.label}
          >
            {option.icon}
          </button>
        ))}
      </div>
      
      <div className="toolbar-group insert-group">
        <div className="toolbar-dropdown">
          <button
            className="toolbar-button dropdown-toggle"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
          >
            Insérer
            <span className="dropdown-arrow"></span>
          </button>
          
          {showMoreOptions && (
            <div className="dropdown-menu">
              {insertOptions.map((option) => (
                <button
                  key={option.action}
                  className="dropdown-item"
                  onClick={() => handleInsert(option.action)}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="toolbar-group right-group">
        <div className="font-size-selector">
          <button className="toolbar-button font-size-button">
            <Type size={16} />
            <span>Taille</span>
          </button>
          
          <div className="font-size-dropdown">
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                className={`font-size-option ${fontSize === option.value ? 'active' : ''}`}
                onClick={() => onFontSizeChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <button
          className="toolbar-button fullscreen-button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </div>
      
      <style jsx>{`
        .editor-toolbar,
        .editor-toolbar-mobile {
          display: flex;
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          z-index: 10;
        }
        
        .editor-toolbar {
          padding: 0.25rem 0.5rem;
          justify-content: space-between;
        }
        
        .editor-toolbar-mobile {
          padding: 0.25rem;
          justify-content: space-between;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .toolbar-group {
          display: flex;
          align-items: center;
        }
        
        .toolbar-section {
          display: flex;
        }
        
        .toolbar-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.375rem;
          border-radius: 0.25rem;
          background: transparent;
          color: #4b5563;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          margin: 0 1px;
        }
        
        .toolbar-button:hover {
          background-color: #f3f4f6;
          color: #1f2937;
        }
        
        .toolbar-button span {
          margin-left: 0.25rem;
          font-size: 0.875rem;
        }
        
        .toolbar-separator {
          width: 1px;
          height: 1.5rem;
          background-color: #e5e7eb;
          margin: 0 0.5rem;
        }
        
        /* Dropdown styles */
        .toolbar-dropdown {
          position: relative;
        }
        
        .dropdown-toggle {
          padding: 0.375rem 0.5rem;
        }
        
        .dropdown-arrow {
          margin-left: 0.25rem;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 4px solid currentColor;
          display: inline-block;
          vertical-align: middle;
        }
        
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background-color: white;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          min-width: 10rem;
          z-index: 20;
          padding: 0.25rem;
        }
        
        .dropdown-item {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          width: 100%;
          border: none;
          background-color: transparent;
          cursor: pointer;
          color: #4b5563;
          font-size: 0.875rem;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }
        
        .dropdown-item:hover {
          background-color: #f3f4f6;
          color: #1f2937;
        }
        
        .dropdown-item span {
          margin-left: 0.5rem;
        }
        
        /* Font size selector styles */
        .font-size-selector {
          position: relative;
          margin-right: 0.5rem;
        }
        
        .font-size-button {
          padding: 0.375rem 0.5rem;
        }
        
        .font-size-dropdown {
          display: none;
          position: absolute;
          top: 100%;
          right: 0;
          background-color: white;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          min-width: 8rem;
          z-index: 20;
          padding: 0.25rem;
        }
        
        .font-size-selector:hover .font-size-dropdown {
          display: block;
        }
        
        .font-size-option {
          padding: 0.5rem 0.75rem;
          width: 100%;
          border: none;
          background-color: transparent;
          cursor: pointer;
          color: #4b5563;
          font-size: 0.875rem;
          text-align: left;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }
        
        .font-size-option:hover {
          background-color: #f3f4f6;
          color: #1f2937;
        }
        
        .font-size-option.active {
          background-color: #e0f2fe;
          color: #3b82f6;
        }
        
        /* Mobile more button */
        .more-button {
          position: relative;
        }
        
        .more-dots {
          display: flex;
          justify-content: space-between;
          width: 16px;
        }
        
        .more-dots span {
          width: 4px;
          height: 4px;
          background-color: currentColor;
          border-radius: 50%;
        }
        
        .more-options-dropdown {
          position: absolute;
          bottom: 100%;
          right: 0;
          background-color: white;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          min-width: 10rem;
          z-index: 20;
          padding: 0.25rem;
          margin-bottom: 0.5rem;
        }
        
        /* Touch optimizations */
        @media (hover: none) and (pointer: coarse) {
          .toolbar-button {
            padding: 0.5rem;
            min-height: 40px;
            min-width: 40px;
          }
          
          .dropdown-item {
            padding: 0.625rem 0.75rem;
            min-height: 44px;
          }
          
          .font-size-option {
            padding: 0.625rem 0.75rem;
            min-height: 44px;
          }
          
          .font-size-selector:active .font-size-dropdown {
            display: block;
          }
        }
        
        /* iPad optimizations */
        @media (min-width: 768px) and (max-width: 1024px) and (pointer: coarse) {
          .editor-toolbar {
            padding: 0.375rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EditorToolbar;