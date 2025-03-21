# Exemples de modification des popups et tutoriels

Ce document présente des exemples concrets pour modifier ou ajouter des éléments dans les popups et tutoriels de LexForge.

## 1. Modifier les messages de notification

Pour changer le texte des notifications (cloche), modifiez le fichier `src/data/updateData.json` :

```json
{
  "messages": [
    {
      "id": 1,
      "text": "Voici mon nouveau message de notification personnalisé ! 🎉",
      "image": "auto",
      "read": false
    },
    // ... autres messages
  ]
}
```

## 2. Modifier les tutoriels

### Pour l'éditeur

Modifiez le fichier `src/data/editorTutorialData.json` :

```json
{
  "messages": [
    {
      "id": 1,
      "text": "Voici mon message de tutoriel personnalisé pour l'éditeur !",
      "image": "saul_sourire.jpg", // Image spécifique
      "read": false
    }
  ]
}
```

### Pour la page des contrats

Modifiez le fichier `src/data/contractsTutorialData.json` de la même manière.

## 3. Ajouter une nouvelle image de personnage

Pour ajouter une nouvelle expression du personnage Saul :

1. Ajoutez l'image dans `src/assets/images/saul/` (par exemple `saul_surprise.jpg`)

2. Modifiez le fichier `src/utils/logicImageSelector.js` :

```javascript
// Ajouter l'import
import saulSurpriseImg from '../assets/images/saul/saul_surprise.jpg';

// Dans la fonction selectSaulImage, ajouter un nouveau tableau de mots-clés
const surpriseKeywords = ['wow', 'surprise', 'incroyable', 'étonnant', '😮'];

// Ajouter la condition
else if (surpriseKeywords.some(keyword => lowerText.includes(keyword))) {
  return saulSurpriseImg;
}

// Ajouter l'image au mapping dans getMessageImage
const imageMap = {
  'saul_ok.jpg': saulOkImg,
  // ... autres images existantes
  'saul_surprise.jpg': saulSurpriseImg
};
```

## 4. Ajouter un nouveau thème de couleur

Pour ajouter un nouveau thème de couleur (par exemple "purple"), modifiez le fichier `src/components/ui/PopupDialog.jsx` :

```javascript
// Dans le composant PopupDialog, ajoutez un nouvel objet au mapping themeColors
const themeColors = {
  blue: { /* ... */ },
  yellow: { /* ... */ },
  green: { /* ... */ },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    text: 'text-purple-800',
    accent: 'bg-purple-600',
    button: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200',
    shadow: 'rgba(139, 92, 246, 0.3), 0 8px 10px -6px rgba(139, 92, 246, 0.2)'
  }
};
```

Utilisez ensuite ce thème dans vos composants :

```jsx
<PopupDialog
  messages={messages}
  onClose={handleClose}
  theme="purple"
  title="Mon titre violet"
  characterName="SAUL"
/>
```

## 5. Créer un nouveau type de popup spécialisé

Si vous souhaitez créer un nouveau type de popup (par exemple pour des alertes), créez un fichier `src/components/ui/AlertPopup.jsx` :

```jsx
import React from 'react';
import PopupDialog from './PopupDialog';

/**
 * Composant AlertPopup
 * 
 * Affiche un popup d'alerte avec un thème rouge.
 */
const AlertPopup = ({ messages, onClose }) => {
  return (
    <PopupDialog 
      messages={messages}
      onClose={onClose}
      title="Alerte importante"
      theme="red" // Nécessite d'ajouter ce thème dans PopupDialog
      characterName="SAUL"
    />
  );
};

export default AlertPopup;
```

N'oubliez pas d'ajouter ce nouveau composant à l'export dans `src/components/ui/index.js` :

```javascript
export { default as AlertPopup } from './AlertPopup';
```

## 6. Utiliser les composants dans une nouvelle page

Voici comment utiliser les composants dans vos propres pages :

```jsx
import React, { useState } from 'react';
import { TutorialLightbulb, PopupDialog } from '../components/ui';

const MaNouvellePage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  // Messages personnalisés pour cette page
  const messagesPerso = [
    {
      id: 1,
      text: "Voici un message personnalisé pour cette page !",
      image: "auto",
      read: false
    }
  ];
  
  return (
    <div>
      <h1>Ma page</h1>
      
      {/* Tutoriel contextuel */}
      <TutorialLightbulb context="editor" />
      
      {/* Bouton pour ouvrir un popup personnalisé */}
      <button onClick={() => setIsPopupOpen(true)}>
        Ouvrir popup personnalisé
      </button>
      
      {/* Popup personnalisé */}
      {isPopupOpen && (
        <PopupDialog
          messages={messagesPerso}
          onClose={() => setIsPopupOpen(false)}
          title="Mon popup personnalisé"
          theme="green"
          characterName="ASSISTANT"
        />
      )}
    </div>
  );
};

export default MaNouvellePage;
``` 