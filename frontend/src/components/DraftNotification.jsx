import React, { useState, useEffect } from 'react';
import { FileText, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const DraftNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Vérifier si un ID de brouillon est présent dans la session
    const draftId = sessionStorage.getItem('draftContractId');
    
    if (draftId) {
      console.log('Brouillon détecté, affichage de la notification:', draftId);
      setShowNotification(true);
      
      // Ne pas supprimer l'ID automatiquement, il sera supprimé dans ContractsPage
      // Masquer seulement la notification après un certain temps
      const timeout = setTimeout(() => {
        setShowNotification(false);
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, []);

  // Surveiller les changements de chemin pour masquer la notification si on va sur /contracts
  useEffect(() => {
    if (location.pathname === '/contracts' && showNotification) {
      console.log('Accès à la page contracts, masquage de la notification');
      setShowNotification(false);
    }
  }, [location.pathname, showNotification]);
  
  if (!showNotification) return null;
  
  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white border border-amber-200 rounded-lg shadow-lg p-4 z-50 animate-fadeIn">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FileText className="h-5 w-5 text-amber-500" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">
            Un contrat en brouillon vous attend
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Vous pouvez le retrouver dans votre espace "Mes Contrats".
          </p>
          <div className="mt-2">
            <Link
              to="/contracts"
              className="text-sm font-medium text-amber-600 hover:text-amber-500"
            >
              Voir mes contrats
            </Link>
          </div>
        </div>
        <button
          type="button"
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-500"
          onClick={() => setShowNotification(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default DraftNotification; 