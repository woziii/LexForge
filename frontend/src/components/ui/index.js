/**
 * Export centralisé des composants UI
 * 
 * Ce fichier permet d'importer facilement plusieurs composants UI à la fois
 * avec une syntaxe simplifiée, comme par exemple:
 * import { NotificationBell, TutorialLightbulb } from '../components/ui';
 */

// Composants de notification et tutoriels
export { default as NotificationBell } from './NotificationBell';
export { default as NotificationPopup } from './NotificationPopup';
export { default as TutorialLightbulb } from './TutorialLightbulb';
export { default as TutorialPopup } from './TutorialPopup';
export { default as MaskOverlay } from './MaskOverlay';

// Composant générique de dialogue
export { default as PopupDialog } from './PopupDialog';

// Autres composants UI
// Vous pouvez ajouter ici d'autres composants du dossier ui
// export { default as MonComposant } from './MonComposant'; 