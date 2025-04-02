/**
 * Utilitaire pour effacer les données temporaires du dashboard
 * utilisées pour les utilisateurs non authentifiés
 */

export const clearTempBusinessInfo = () => {
  sessionStorage.removeItem('tempBusinessInfo');
  console.log('✅ Données temporaires du dashboard effacées avec succès');
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