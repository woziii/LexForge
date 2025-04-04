import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { migrateAnonymousUserData } from '../services/api';

/**
 * Composant qui gère la migration des données après authentification
 * Ce composant ne rend rien, il s'exécute uniquement en arrière-plan
 */
const AuthMigration = () => {
  const { isSignedIn, userId, user } = useAuth();
  
  // Déclencher la migration des données lorsqu'un utilisateur s'authentifie
  useEffect(() => {
    if (isSignedIn && userId) {
      // Log d'informations détaillées sur l'utilisateur authentifié
      console.log('DEBUG - AuthMigration - Utilisateur authentifié:', {
        userId,
        email: user?.primaryEmailAddress?.emailAddress,
        firstName: user?.firstName,
        lastName: user?.lastName,
        // Extraire des informations sur les comptes liés
        externalAccounts: user?.externalAccounts?.map(account => ({
          provider: account.provider,
          id: account.id,
          verified: account.verification?.status === 'verified'
        }))
      });
      
      // Vérifier s'il y a un brouillon à migrer ou des données anonymes
      const draftId = sessionStorage.getItem('draftContractId');
      const anonymousId = localStorage.getItem('anonymousUserId');
      
      // Si on a des données à migrer
      if (draftId || anonymousId) {
        console.log('DEBUG - AuthMigration - Données à migrer détectées:', { draftId, anonymousId });
        
        // Stocker l'ID du brouillon pour référence après migration
        if (draftId) {
          // Utiliser localStorage pour assurer la persistance même après refresh
          localStorage.setItem('lastDraftId', draftId);
          console.log('DEBUG - AuthMigration - ID du brouillon sauvegardé dans localStorage pour référence:', draftId);
        }
        
        // Migrer les données vers l'utilisateur authentifié
        migrateAnonymousUserData(userId)
          .then(result => {
            if (result.success) {
              console.log('DEBUG - AuthMigration - Migration réussie des données:', result);
              console.log('DEBUG - AuthMigration - Veuillez vérifier que le brouillon avec ID', draftId || 'N/A', 'est bien associé à l\'utilisateur', userId);
            } else {
              console.warn('DEBUG - AuthMigration - Échec de la migration:', result.message || result.error);
            }
          })
          .catch(error => {
            console.error('DEBUG - AuthMigration - Erreur lors de la migration des données:', error);
          });
      } else {
        console.log('DEBUG - AuthMigration - Aucune donnée à migrer. Derniers IDs connus:',
          { lastDraftId: localStorage.getItem('lastDraftId') }
        );
      }
    }
  }, [isSignedIn, userId, user]);
  
  // Ce composant ne rend rien, il s'exécute uniquement en arrière-plan
  return null;
};

export default AuthMigration; 