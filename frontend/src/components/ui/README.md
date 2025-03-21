# Composants UI pour LexForge

Ce dossier contient les composants d'interface utilisateur réutilisables pour l'application LexForge.

## Structure des composants de dialogue

### 1. PopupDialog.jsx

Un composant de base générique pour créer des dialogues popup avec des messages qui s'affichent de manière progressive.

**Caractéristiques principales :**
- Animation de frappe de texte
- Thèmes de couleur personnalisables ('blue', 'yellow', 'green')
- Support pour titre optionnel
- Nom de personnage personnalisable

**Utilisation :**
```jsx
<PopupDialog 
  messages={messagesArray}
  onClose={handleClose}
  title="Titre optionnel" // Optionnel
  theme="blue" // Optionnel: 'blue' (défaut), 'yellow', 'green'
  characterName="SAUL" // Optionnel: 'SAUL' par défaut
/>
```

### 2. TutorialPopup.jsx

Un composant spécialisé basé sur le concept de PopupDialog mais adapté aux tutoriels contextuels.

**Caractéristiques principales :**
- Thème jaune (ampoule)
- Titre adapté au contexte (éditeur ou page de contrats)
- Indicateur de progression
- Adaptable à différents contextes
- Mise en évidence des éléments d'interface (highlight)

**Utilisation :**
```jsx
<TutorialPopup
  context="editor" // ou "contracts"
  onClose={handleClose}
/>
```

### 3. NotificationPopup.jsx

Un composant spécialisé pour afficher les notifications système.

**Caractéristiques principales :**
- Thème bleu
- Titre "Nouvelles fonctionnalités"
- Utilise PopupDialog en interne

**Utilisation :**
```jsx
<NotificationPopup
  messages={notificationsArray}
  onClose={handleClose}
/>
```

## Système de mise en évidence (Highlight)

### 1. MaskOverlay.jsx

Composant qui crée un masque interactif pour mettre en évidence un élément spécifique de l'interface.

**Caractéristiques principales :**
- Masque semi-transparent sur toute l'interface sauf sur l'élément ciblé
- Animation de bordure pulsante pour attirer l'attention
- Recalcul automatique de la position lors des changements de taille

**Utilisation :**
```jsx
<MaskOverlay
  targetId="id-de-element-a-mettre-en-evidence"
  active={true} // contrôle l'affichage du masque
/>
```

### Fonctionnement avec les tutoriels

Le composant TutorialPopup utilise MaskOverlay pour mettre en évidence les éléments mentionnés dans chaque étape du tutoriel. Cela fonctionne via le champ `highlight` dans les données de tutoriel.

### Maintenance et modification

Pour ajouter ou modifier les éléments mis en évidence dans les tutoriels :

1. **Ajouter un ID à l'élément d'interface** que vous souhaitez mettre en évidence :
   ```jsx
   <button id="mon-element-id">Mon bouton</button>
   ```

2. **Mettre à jour les fichiers de données** dans `src/data/` pour référencer cet ID :
   ```json
   {
     "id": 3,
     "text": "Cliquez sur ce bouton pour effectuer une action.",
     "image": "saul_pensif.jpg",
     "read": false,
     "highlight": "mon-element-id"
   }
   ```

3. **Personnaliser l'apparence du highlight** en modifiant le composant `MaskOverlay.jsx` :
   - Modifier la couleur de l'overlay (`rgba(0, 0, 0, 0.5)`)
   - Changer la couleur ou l'épaisseur de la bordure (`border: '2px solid rgba(255, 193, 7, 0.8)'`)
   - Ajuster l'animation de pulsation dans la section `@keyframes pulse-border`

## Boutons de déclenchement

### 1. NotificationBell.jsx

Affiche une cloche de notification avec gestion des messages non lus.

**Utilisation :**
```jsx
<NotificationBell />
```

### 2. TutorialLightbulb.jsx

Affiche une ampoule qui ouvre un tutoriel contextuel.

**Utilisation :**
```jsx
<TutorialLightbulb 
  context="editor" // ou context="contracts"
  id="element-id" // Optionnel: pour le référencer dans les highlights
/>
```

## Format des données

Les messages pour les dialogues doivent suivre ce format :

```json
[
  {
    "id": 1,
    "text": "Texte du message",
    "image": "auto", // ou nom spécifique d'image
    "read": false, // état de lecture
    "highlight": "element-id" // ID de l'élément à mettre en évidence, null si aucun
  }
]
```

## Fichiers de données

- `editorTutorialData.json` - Messages pour le tutoriel de l'éditeur
- `contractsTutorialData.json` - Messages pour le tutoriel de la page des contrats
- `updateData.json` - Messages pour les notifications système

## Personnalisation

Pour personnaliser les messages :
1. Modifiez les fichiers JSON correspondants dans le dossier `src/data/`
2. Pour ajouter une nouvelle image, importez-la dans `logicImageSelector.js`

Pour modifier l'apparence :
1. Les thèmes de couleur sont définis dans `PopupDialog.jsx`
2. Vous pouvez ajouter de nouveaux thèmes si nécessaire 