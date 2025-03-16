# Guide de déploiement de LexForge sur Vercel

Ce guide explique comment déployer l'application LexForge (backend et frontend) sur Vercel.

## Prérequis

- Un compte [Vercel](https://vercel.com)
- [Git](https://git-scm.com/) installé sur votre machine
- [Node.js](https://nodejs.org/) (version 14 ou supérieure)
- [npm](https://www.npmjs.com/) (généralement installé avec Node.js)

## Déploiement du backend (API Flask)

1. **Connectez-vous à Vercel** et créez un nouveau projet.

2. **Importez votre dépôt Git** ou téléchargez le dossier `backend`.

3. **Configurez le projet** :
   - Framework Preset : `Other`
   - Root Directory : `backend` (si vous importez tout le dépôt)
   - Build Command : laissez vide
   - Output Directory : laissez vide
   - Install Command : `pip install -r requirements.txt`

4. **Ajoutez les variables d'environnement** si nécessaire.

5. **Déployez** en cliquant sur "Deploy".

6. **Notez l'URL de déploiement** (par exemple, `https://lexforge-api.vercel.app`).

## Déploiement du frontend (React)

1. **Modifiez l'URL de l'API** dans le fichier `.env.production` pour qu'elle pointe vers votre backend déployé :
   ```
   REACT_APP_API_URL=https://votre-backend-url.vercel.app/api
   ```

2. **Connectez-vous à Vercel** et créez un nouveau projet.

3. **Importez votre dépôt Git** ou téléchargez le dossier `frontend`.

4. **Configurez le projet** :
   - Framework Preset : `Create React App`
   - Root Directory : `frontend` (si vous importez tout le dépôt)
   - Build Command : `npm run build`
   - Output Directory : `build`
   - Install Command : `npm install`

5. **Ajoutez les variables d'environnement** :
   - `REACT_APP_API_URL` : l'URL de votre backend déployé (par exemple, `https://lexforge-api.vercel.app/api`)

6. **Déployez** en cliquant sur "Deploy".

## Vérification du déploiement

1. **Accédez à l'URL du frontend** fournie par Vercel.

2. **Testez l'application** en créant un contrat et en vérifiant que toutes les fonctionnalités marchent correctement.

3. **Vérifiez les logs** dans le tableau de bord Vercel si vous rencontrez des problèmes.

## Déploiement automatique

Vercel peut être configuré pour redéployer automatiquement votre application à chaque push sur votre dépôt Git. Cette fonctionnalité est activée par défaut lorsque vous importez un dépôt Git.

## Problèmes courants

- **Erreurs CORS** : Vérifiez que la configuration CORS dans le backend autorise les requêtes depuis votre frontend déployé.
- **Erreurs 404** : Assurez-vous que les routes sont correctement configurées dans le fichier `vercel.json`.
- **Problèmes avec les variables d'environnement** : Vérifiez qu'elles sont correctement définies dans le tableau de bord Vercel. 