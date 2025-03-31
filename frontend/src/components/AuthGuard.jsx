import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const AuthGuard = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  
  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Rediriger vers la page d'accueil si l'utilisateur n'est pas connecté
  if (!isSignedIn) {
    // Stocker l'emplacement actuel pour rediriger l'utilisateur après l'authentification
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // Rendre les enfants si l'utilisateur est authentifié
  return children;
};

export default AuthGuard; 