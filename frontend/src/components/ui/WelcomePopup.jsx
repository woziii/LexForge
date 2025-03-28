import React, { useEffect, useState } from 'react';
import NotificationPopup from './NotificationPopup';

/**
 * Composant WelcomePopup
 * 
 * Affiche un popup de bienvenue qui présente LexForge et ses fonctionnalités
 * aux utilisateurs lors de leur première visite sur le site.
 * Utilise localStorage pour ne l'afficher qu'une seule fois.
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {boolean} props.forceShow - Force l'affichage du popup même si l'utilisateur l'a déjà vu
 * @param {Function} props.onClose - Fonction pour fermer le popup depuis l'extérieur
 */
const WelcomePopup = ({ forceShow = false, onClose: externalOnClose }) => {
  const [isOpen, setIsOpen] = useState(forceShow);
  
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
      text: "LexForge est actuellement en version Beta. Nous ajoutons régulièrement de nouvelles fonctionnalités et améliorons celles existantes. Vos retours sont essentiels pour nous aider à perfectionner la plateforme.",
      image: "saul_pensif.jpg",
      read: false
    },
    {
      id: 3,
      text: "Notre plateforme vous permet de générer des contrats juridiquement solides en quelques clics. Tous nos modèles sont conçus par un juriste et régulièrement mis à jour.",
      image: "saul_ok.jpg",
      read: false
    },
    {
      id: 4,
      text: "Actuellement, vous pouvez créer deux types de contrats : cession de droits d'auteur et droit à l'image. Chaque contrat est entièrement personnalisable selon vos besoins spécifiques ( ⚠️ Attention ! LexForge ne propose que des contrats types, pour répondre à des besoins simple ne nécéssitant pas d'accompagnement particulier… LexForge ne se substitue pas à un juriste ou un avocat).",
      image: "saul_pensif.jpg",
      read: false
    },
    {
      id: 5,
      text: "⚠️ Information technique : Le serveur de LexForge s'éteint après une période d'inactivité pour économiser des ressources. À votre arrivée, il peut nécessiter environ 50 secondes pour se réactiver. Pendant ce temps, certaines fonctionnalités utilisant le backend peuvent être temporairement indisponibles. Merci de votre patience !",
      image: "saul_pensif.jpg",
      read: false
    },
    {
      id: 6,
      text: "Explorez notre éditeur avancé pour personnaliser vos contrats, enregistrez plusieurs versions, et exportez-les en PDF prêts à l'emploi. Si vous avez besoin d'aide, cherchez l'icone 💡, et hop 💨 j'apparaitrai comme le génie d'Aladin !",
      image: "saul_motive.jpg",
      read: false
    }
  ];

  useEffect(() => {
    // Si l'affichage est forcé, ne pas vérifier localStorage
    if (forceShow) {
      setIsOpen(true);
      return;
    }
    
    // Vérifier si c'est la première visite de l'utilisateur
    const hasVisitedBefore = localStorage.getItem('hasVisitedLexForge');
    
    // Si c'est la première visite, afficher le popup de bienvenue
    if (!hasVisitedBefore) {
      setIsOpen(true);
    }
  }, [forceShow]);

  // Fonction pour fermer le popup et enregistrer que l'utilisateur a déjà visité le site
  const handleClose = () => {
    setIsOpen(false);
    
    // N'enregistrer la visite que lors de la première fois
    if (!localStorage.getItem('hasVisitedLexForge')) {
      localStorage.setItem('hasVisitedLexForge', 'true');
    }
    
    // Si une fonction de fermeture externe est fournie, l'appeler
    if (externalOnClose) {
      externalOnClose();
    }
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