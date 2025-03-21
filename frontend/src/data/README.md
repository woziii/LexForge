# Fichiers de données pour LexForge

Ce dossier contient les fichiers de données utilisés pour alimenter les dialogues et notifications dans l'application LexForge.

## Structure des fichiers

### 1. updateData.json

Contient les messages de notification pour les mises à jour du système, affichés via la cloche de notification.

```json
{
  "messages": [
    {
      "id": 1,
      "text": "Texte de la notification",
      "image": "auto",
      "read": false
    },
    // ... autres messages
  ],
  "lastUpdated": "2024-04-08T12:00:00Z",
  "prompts": {
    // paramètres pour l'affichage et le formatage
  }
}
```

### 2. editorTutorialData.json

Contient les messages du tutoriel spécifique à l'éditeur de contrats.

```json
{
  "messages": [
    {
      "id": 1,
      "text": "Message de tutoriel pour l'éditeur",
      "image": "auto",
      "read": false
    },
    // ... autres messages
  ]
}
```

### 3. contractsTutorialData.json

Contient les messages du tutoriel spécifique à la page de gestion des contrats.

```json
{
  "messages": [
    {
      "id": 1,
      "text": "Message de tutoriel pour la page des contrats",
      "image": "auto",
      "read": false
    },
    // ... autres messages
  ]
}
```

## Format des messages

Chaque message doit contenir les propriétés suivantes :

- `id` (number) : Identifiant unique du message
- `text` (string) : Contenu textuel du message
- `image` (string) : 
  - `"auto"` : L'image est sélectionnée automatiquement en fonction du contenu du texte
  - `"saul_sourire.jpg"` : Utilise spécifiquement cette image
  - `"saul_pensif.jpg"` : Utilise spécifiquement cette image
  - `"saul_motive.jpg"` : Utilise spécifiquement cette image
  - `"saul_ok.jpg"` : Image par défaut
- `read` (boolean) : État de lecture du message (important pour les notifications)

## Sélection automatique des images

Le système sélectionne automatiquement les images en fonction des mots-clés présents dans le texte :

### Images Saul Sourire (heureux)
Mots-clés : "nouveau", "nouveauté", "ajouté", "fonctionnalité", "amélioré", "bienvenue", "🎉"

### Images Saul Pensif (réfléchi)
Mots-clés : "mise à jour", "changement", "modification", "important", "attention", "savais-tu"

### Images Saul Motivé (enthousiaste)
Mots-clés : "découvre", "essaye", "lance-toi", "teste", "explore", "à toi de jouer", "🚀"

## Comment modifier les messages

1. Ouvrez le fichier JSON correspondant au type de message que vous souhaitez modifier
2. Modifiez le texte ou l'image selon vos besoins
3. Pour ajouter un nouveau message, créez un nouvel objet avec un ID unique
4. Pour supprimer un message, retirez l'objet correspondant

## Conseils pour la rédaction des messages

1. Gardez les messages courts et concis (2 lignes maximum pour les notifications)
2. Utilisez le tutoiement et un ton amical
3. Incluez des émojis avec parcimonie pour les points importants
4. Pour les tutoriels, structurez les messages de manière progressive
5. Évitez les détails techniques complexes dans les notifications 