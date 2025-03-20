import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import updateData from '../../data/updateData.json';
import PopupDialog from './PopupDialog';

/**
 * Composant NotificationBell
 * 
 * Affiche une cloche de notification avec une pastille indiquant
 * la présence de messages non lus. Lorsqu'on clique sur la cloche,
 * un dialogue pop-up s'affiche avec les messages.
 */
const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  
  // Charger les notifications au montage du composant
  useEffect(() => {
    setNotifications(updateData.messages);
    
    // Vérifier s'il y a des notifications non lues
    const hasUnreadMessages = updateData.messages.some(msg => !msg.read);
    setHasUnread(hasUnreadMessages);
  }, []);
  
  // Gérer le clic sur la cloche
  const handleBellClick = () => {
    setIsOpen(true);
  };
  
  // Fermer le popup et marquer toutes les notifications comme lues
  const handleClose = () => {
    setIsOpen(false);
    
    // Marquer toutes les notifications comme lues
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    setNotifications(updatedNotifications);
    setHasUnread(false);
  };
  
  return (
    <div className="relative">
      {/* Bouton de cloche */}
      <button
        onClick={handleBellClick}
        className="relative rounded-full p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label="Notifications"
      >
        <Bell size={20} strokeWidth={1.75} />
        
        {/* Pastille rouge proche de la cloche */}
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 h-3 w-3 rounded-full bg-red-500 ring-1 ring-white" />
        )}
      </button>
      
      {/* Dialogue popup avec les notifications */}
      {isOpen && (
        <PopupDialog 
          messages={notifications} 
          onClose={handleClose} 
        />
      )}
    </div>
  );
};

export default NotificationBell; 