import React from 'react';
import PopupDialog from './PopupDialog';

/**
 * Composant NotificationPopup
 * 
 * Affiche un popup de notification en utilisant le PopupDialog
 * avec un thème bleu pour les notifications système.
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.messages - Liste des messages à afficher
 * @param {Function} props.onClose - Fonction appelée lors de la fermeture du dialogue
 */
const NotificationPopup = ({ messages, onClose }) => {
  return (
    <PopupDialog 
      messages={messages}
      onClose={onClose}
      title="Nouvelles fonctionnalités"
      theme="blue"
      characterName="SAUL"
    />
  );
};

export default NotificationPopup; 