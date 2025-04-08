# Améliorations pour la gestion des données temporaires

Ce document résume les améliorations apportées pour la gestion des données temporaires des utilisateurs non authentifiés dans LexForge.

## Problématique initiale

Les données temporaires des utilisateurs non authentifiés étaient:
- Stockées de manière trop persistante dans localStorage
- Difficiles à nettoyer après utilisation
- Manquaient d'un identifiant clair pour les distinguer des données des utilisateurs authentifiés

## Améliorations implémentées

### 1. Migration vers sessionStorage

La principale amélioration est le passage de localStorage à sessionStorage pour les utilisateurs non authentifiés:

- Les nouveaux IDs anonymes sont désormais stockés uniquement en sessionStorage
- Les anciens IDs dans localStorage sont migrés vers sessionStorage pour assurer la rétrocompatibilité
- Les données sont naturellement effacées à la fermeture du navigateur

### 2. Meilleur nettoyage des données temporaires

Nous avons amélioré les fonctions de nettoyage des données:

- `clearTempBusinessInfo()` nettoie les données mais préserve la session
- `clearAllTempData()` effectue un nettoyage complet incluant l'ID de session
- Le nettoyage est déclenché automatiquement à la déconnexion

### 3. Identification des données temporaires

Nous avons ajouté un identifiant aux données temporaires:

- Ajout d'un drapeau `is_temporary` aux profils des utilisateurs anonymes
- Ajout d'un timestamp de création pour faciliter une future purge de données
- Préfixe `anon_` plus visible dans les IDs des utilisateurs non authentifiés

## Bénéfices

Ces améliorations apportent plusieurs avantages:

1. **Meilleure confidentialité** : Les données temporaires sont effacées naturellement
2. **Distinction claire** : Les données temporaires sont facilement identifiables
3. **Expérience utilisateur préservée** : Les fonctionnalités restent identiques pour l'utilisateur
4. **Compatibilité** : Les modifications sont compatibles avec le code existant

## Fonctionnement actuel

Voici comment fonctionne désormais le système:

1. Lorsqu'un utilisateur non authentifié accède au site:
   - Un ID anonyme temporaire est généré et stocké en sessionStorage
   - Un profil marqué comme temporaire est créé pour cet ID

2. Lorsque l'utilisateur utilise le dashboard:
   - Les données sont associées à son ID anonyme temporaire
   - Ces données sont récupérées pour la prévisualisation du contrat

3. Lorsque l'utilisateur ferme le navigateur:
   - sessionStorage est automatiquement effacé
   - Les profils temporaires restent sur le serveur, mais sont marqués comme temporaires

Le nettoyage des profils temporaires sur le serveur pourrait être implémenté ultérieurement via une tâche planifiée. 