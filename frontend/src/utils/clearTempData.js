/**
 * Utilitaire pour effacer les données temporaires du dashboard
 * utilisées pour les utilisateurs non authentifiés
 */

export const clearTempBusinessInfo = () => {
  // Supprimer les données temporaires mais pas l'ID anonyme
  const toRemove = [
    'tempBusinessInfo',
    'tempContractData',
    'draftContractId',
    'authRedirectAction'
  ];
  
  // Nettoyer sessionStorage
  toRemove.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  // Pour l'anonymousUserId, on le laisse dans sessionStorage pour la session en cours
  // mais on ne le garde pas dans localStorage pour les futures sessions
  
  console.log('✅ Données temporaires du dashboard effacées avec succès');
  return true;
};

/**
 * Efface complètement toutes les données temporaires, y compris l'ID anonyme
 * À utiliser lors d'une déconnexion complète ou pour résoudre des problèmes
 */
export const clearAllTempData = () => {
  // Supprimer toutes les données temporaires y compris l'ID
  const toRemove = [
    'tempBusinessInfo',
    'tempContractData',
    'draftContractId',
    'authRedirectAction'
  ];
  
  // Nettoyer sessionStorage
  toRemove.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  // Supprimer l'ID anonyme (uniquement si l'utilisateur n'est pas authentifié)
  const clerkId = localStorage.getItem('clerkUserId');
  if (!clerkId || clerkId.startsWith('anon_')) {
    sessionStorage.removeItem('anonymousUserId');
    console.log('🔄 ID anonyme temporaire supprimé');
  }
  
  console.log('🧹 Toutes les données temporaires ont été complètement effacées');
  return true;
};

export const checkTempBusinessInfo = () => {
  const data = sessionStorage.getItem('tempBusinessInfo');
  if (data) {
    console.log('📊 Données temporaires trouvées:', JSON.parse(data));
    return JSON.parse(data);
  } else {
    console.log('❌ Aucune donnée temporaire trouvée');
    return null;
  }
}; 