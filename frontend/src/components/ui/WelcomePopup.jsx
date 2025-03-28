import React, { useEffect, useState } from 'react';
import NotificationPopup from './NotificationPopup';

/**
 * Composant WelcomePopup
 * 
 * Affiche un popup de bienvenue qui présente LexForge et ses fonctionnalités
 * aux utilisateurs lors de leur première visite sur le site.
 * Utilise localStorage pour ne l'afficher qu'une seule fois.
 */
const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Messages de bienvenue
  const welcomeMessages = [
    {
      id: 1,
      text: "Bienvenue sur LexForge ! Je m'appelle Saul, votre compagnon juridique à la cravate impeccable. Je ne suis pas un vrai avocat, mais j'ai un humour de juriste et une passion pour les contrats bien ficelés !",
      image: "saul_sourire.jpg",
      read: false
    },
    {
      id: 2,
      text: "LexForge est actuellement en version Beta. Comme un brouillon de contrat, nous peaufinons encore quelques clauses avec des mises à jour régulières. Soyez indulgent, même les meilleurs avocats font des fautes de frappe !",
      image: "saul_pensif.jpg",
      read: false
    },
    {
      id: 3,
      text: "La Beta, c'est comme un contrat en cours de négociation : quelques bugs pourraient s'y glisser ! Si vous en repérez, dites-le nous - je n'ai pas encore mon diplôme en debugging juridique !",
      image: "saul_motive.jpg",
      read: false
    },
    {
      id: 4,
      text: "Pour l'instant, notre cabinet propose deux spécialités : cession de droits d'auteur et contrat de prestation. D'autres modèles de contrats sont en cours de rédaction par nos stagiaires virtuels !",
      image: "saul_pensif.jpg",
      read: false
    },
    {
      id: 5,
      text: "LexForge vous permet de créer des contrats aussi solides qu'un argumentaire en Cour Suprême, mais sans le jargon incompréhensible. Allez, entrez dans mon cabinet virtuel et créons du droit ensemble !",
      image: "saul_motive.jpg",
      read: false
    }
  ];

  useEffect(() => {
    // Vérifier si c'est la première visite de l'utilisateur
    const hasVisitedBefore = localStorage.getItem('hasVisitedLexForge');
    
    // Si c'est la première visite, afficher le popup de bienvenue
    if (!hasVisitedBefore) {
      setIsOpen(true);
    }
  }, []);

  // Fonction pour fermer le popup et enregistrer que l'utilisateur a déjà visité le site
  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasVisitedLexForge', 'true');
  };

  if (!isOpen) return null;

  return (
    <NotificationPopup 
      messages={welcomeMessages} 
      onClose={handleClose} 
    />
  );
};

export default WelcomePopup; 