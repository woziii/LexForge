import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { migrateAnonymousUserData, getCurrentUserId, associateFingerprintWithDraft } from '../services/api';

/**
 * Composant qui gère la migration des données après authentification
 * Ce composant ne rend rien, il s'exécute uniquement en arrière-plan
 * 
 * Fonctionnement du processus de migration des contrats:
 * 1. Le contrat est créé en mode non-authentifié et stocké avec un user_id anonyme
 * 2. L'utilisateur s'authentifie, ce qui déclenche ce composant
 * 3. La migration fonctionne comme un import: le contrat est copié avec son contenu intact
 * 4. Seul l'ID utilisateur est modifié, les données du contrat sont préservées
 * 5. Le statut brouillon est conservé pour permettre la validation ultérieure
 * 6. Lors de la validation du brouillon, le flag preserve_data garantit que les données
 *    du contrat ne sont pas altérées et restent identiques à celles d'origine
 * 7. Une vérification de sécurité basée sur l'empreinte du navigateur est effectuée
 *    pour s'assurer que la personne qui migre est bien celle qui a créé le brouillon
 */
const AuthMigration = () => {
  const { isSignedIn, userId, user } = useAuth();
  
  // Déclencher la migration des données lorsqu'un utilisateur s'authentifie
  useEffect(() => {
    if (isSignedIn && userId) {
      // Log d'informations détaillées sur l'utilisateur authentifié
      console.log('DEBUG - AuthMigration - Utilisateur authentifié:', {
        userId, // ID brut de Clerk sans suffixe
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
      
      // ⚠️ IMPORTANT: Pour la migration, on utilise l'ID brut sans suffixe
      // Cela garantit que le backend associe correctement le contrat à l'utilisateur
      // indépendamment de la méthode d'authentification
      const baseUserId = userId; // ID brut sans suffixe, directement de Clerk
      
      // Pour la cohérence des logs, on affiche aussi l'ID avec suffixe
      const compositeUserId = getCurrentUserId(); // ID avec suffixe (_google, etc.)
      
      console.log('DEBUG - AuthMigration - IDs utilisés pour migration:', {
        baseUserId,
        compositeUserId
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
        
        // Migrer les données vers l'utilisateur authentifié en utilisant l'ID DE BASE (sans suffixe)
        // C'est crucial pour que la migration fonctionne correctement
        migrateAnonymousUserData(baseUserId)
          .then(result => {
            if (result.success) {
              console.log('DEBUG - AuthMigration - Migration réussie des données:', result);
              console.log('DEBUG - AuthMigration - Brouillon migré vers ID utilisateur de base:', baseUserId);
              
              // Ajouter des détails supplémentaires sur la preservation des données
              console.log('DEBUG - AuthMigration - Les contrats ont été migrés comme des imports, leurs données sont préservées');
              console.log('DEBUG - AuthMigration - Lors de la validation du brouillon, seul le statut sera modifié');
              
              // Vérifier le résultat de la vérification de sécurité
              if (result.security_verified === false) {
                console.warn('DEBUG - AuthMigration - ALERTE: La vérification de sécurité a échoué');
                
                // Marquer le brouillon comme suspect dans localStorage pour que la page des contrats puisse le détecter
                localStorage.setItem(`security_alert_${draftId}`, 'true');
                
                // Afficher un avertissement à l'utilisateur
                const notif = document.createElement('div');
                notif.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50';
                notif.innerHTML = `
                  <div class="flex items-start">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium">
                        Alerte de sécurité: Une vérification de votre navigateur a échoué.
                        Si vous n'avez pas créé ce brouillon, contactez le support.
                      </p>
                    </div>
                  </div>
                `;
                document.body.appendChild(notif);
                
                // Supprimer la notification après 10 secondes
                setTimeout(() => {
                  notif.remove();
                }, 10000);
                
                // Supprimer le draftContractId de sessionStorage pour éviter d'afficher le contrat
                // potentiellement compromis
                sessionStorage.removeItem('draftContractId');
              }
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