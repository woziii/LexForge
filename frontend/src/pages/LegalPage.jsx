import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationPopup from '../components/ui/NotificationPopup';

const LegalPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  
  // Messages pour Saul
  const legalMessages = [
    {
      id: 1,
      text: "Oh oh ! Je vois qu'on a un petit malin qui vient vérifier si LexForge a bien ses mentions légales à jour ! J'apprécie ta curiosité, vraiment.",
      image: "saul_sourire.jpg",
      read: false
    },
    {
      id: 2,
      text: "Comme tu peux le constater, nos mentions légales sont actuellement en cours de rédaction. Rien de bien compliqué, mais il faut tout de même être précis et rigoureux pour ce genre de document.",
      image: "saul_pensif.jpg",
      read: false
    },
    {
      id: 3,
      text: "Sois assuré que cette page sera méticuleusement complétée avant le lancement de LexForge en version Alpha. Nous ne prenons pas les questions juridiques à la légère, même si j'aime bien faire des blagues à leur sujet.",
      image: "saul_ok.jpg",
      read: false
    },
    {
      id: 4,
      text: "Je pense que tu as mieux à faire que de rester sur une page vide, non ? Laisse-moi te raccompagner vers l'accueil où tu pourras découvrir toutes les fonctionnalités passionnantes de LexForge !",
      image: "saul_motive.jpg",
      read: false
    }
  ];
  
  // Afficher le popup dès le chargement de la page
  useEffect(() => {
    setShowPopup(true);
  }, []);
  
  // Fermer le popup et rediriger vers la page d'accueil
  const handleClosePopup = () => {
    setShowPopup(false);
    // Rediriger vers la page d'accueil après une courte pause
    setTimeout(() => {
      navigate('/');
    }, 300);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {/* Page intentionnellement vide */}
      {showPopup && (
        <NotificationPopup 
          messages={legalMessages} 
          onClose={handleClosePopup} 
        />
      )}
    </div>
  );
};

export default LegalPage; 