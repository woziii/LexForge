# Guide de déploiement de LexForge sur Vercel

Ce guide explique comment déployer l'application LexForge (backend et frontend ensemble) sur Vercel.

## Prérequis

- Un compte [Vercel](https://vercel.com)
- [Git](https://git-scm.com/) installé sur votre machine
- [Node.js](https://nodejs.org/) (version 14 ou supérieure)
- [npm](https://www.npmjs.com/) (généralement installé avec Node.js)

## Déploiement monolithique (backend + frontend)

LexForge est configuré pour être déployé comme une application monolithique sur Vercel, avec le backend Flask et le frontend React dans le même déploiement.

### Étapes de déploiement

1. **Connectez-vous à Vercel** et créez un nouveau projet.

2. **Importez votre dépôt Git** depuis GitHub (https://github.com/woziii/LexForge).

3. **Configurez le projet** :
   - Framework Preset : `Other`
   - Root Directory : `.` (répertoire racine)
   - Build Command : `cd frontend && npm install && npm run build`
   - Output Directory : `frontend/build`
   - Install Command : `pip install -r backend/requirements.txt && cd frontend && npm install`

4. **Déployez** en cliquant sur "Deploy".

### Comment ça fonctionne

Le fichier `vercel.json` à la racine du projet configure Vercel pour :

1. Installer les dépendances Python et Node.js
2. Construire l'application React
3. Servir l'API Flask sur le chemin `/api/*`
4. Servir l'application React sur tous les autres chemins

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/build",
  "installCommand": "pip install -r backend/requirements.txt && cd frontend && npm install",
  "builds": [
    {
      "src": "backend/app.py",
      "use": "@vercel/python"
    },
    {
      "src": "frontend/build/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/app.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/build/$1"
    }
  ]
}
```

## Vérification du déploiement

1. **Accédez à l'URL** fournie par Vercel après le déploiement.

2. **Testez l'application** en créant un contrat et en vérifiant que toutes les fonctionnalités marchent correctement.

3. **Vérifiez les logs** dans le tableau de bord Vercel si vous rencontrez des problèmes.

## Déploiement automatique

Vercel peut être configuré pour redéployer automatiquement votre application à chaque push sur votre dépôt Git. Cette fonctionnalité est activée par défaut lorsque vous importez un dépôt Git.

## Problèmes courants

- **Erreurs 404 pour les routes API** : Vérifiez que toutes les routes API commencent bien par `/api/` dans le fichier `backend/app.py`.
- **Erreurs lors de la génération de PDF** : Vérifiez que le dossier `tmp` est correctement créé et accessible en écriture.
- **Problèmes de CORS** : Vérifiez la configuration CORS dans `backend/app.py`. 