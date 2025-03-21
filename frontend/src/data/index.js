/**
 * Export centralisé des données
 * 
 * Ce fichier permet d'importer facilement plusieurs données à la fois
 * avec une syntaxe simplifiée, comme par exemple:
 * import { updateData, editorTutorialData } from '../data';
 */

// Données de notifications et tutoriels
export { default as updateData } from './updateData.json';
export { default as editorTutorialData } from './editorTutorialData.json';
export { default as contractsTutorialData } from './contractsTutorialData.json';

// Vous pouvez ajouter ici d'autres imports de données
// export { default as autresDonnees } from './autresDonnees.json'; 