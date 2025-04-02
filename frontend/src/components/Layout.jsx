import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FolderKanban, 
  FilePlus2, 
  InfoIcon, 
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { useAuth, UserButton, SignInButton, useClerk } from '@clerk/clerk-react';
import { migrateAnonymousUserData } from '../services/api';
import { clearAllTempData } from '../utils/clearTempData';

const Layout = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { signOut } = useClerk();
  
  // Effet pour gérer la migration des données lors de la connexion
  useEffect(() => {
    // Vérifier si l'utilisateur vient de se connecter et a un ID anonyme stocké
    const handleUserAuthentication = async () => {
      if (isLoaded && isSignedIn && userId) {
        const anonymousId = localStorage.getItem('anonymousUserId');
        
        if (anonymousId) {
          console.log('Utilisateur connecté avec des données anonymes, tentative de migration...');
          try {
            // Migrer les données de l'utilisateur anonyme vers l'utilisateur authentifié
            const result = await migrateAnonymousUserData(userId);
            if (result.success) {
              console.log('Migration des données réussie:', result.message);
            } else {
              console.warn('Échec de la migration des données:', result.message || result.error);
            }
          } catch (error) {
            console.error('Erreur lors de la migration des données:', error);
          }
        }
      }
    };
    
    handleUserAuthentication();
  }, [isLoaded, isSignedIn, userId]);
  
  // Détermine si un lien est actif
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Gestionnaire de déconnexion personnalisé
  const handleSignOut = async () => {
    // Supprimer toutes les données temporaires lors de la déconnexion
    clearAllTempData();
    await signOut();
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl sm:text-2xl font-black text-blue-700">LexForge</Link>
            <span className="ml-2 text-xs sm:text-sm bg-blue-100 text-blue-800 py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-md">Beta</span>
          </div>

          {/* Menu Hamburger pour mobile */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-gray-500 hover:text-gray-700 focus:outline-none p-1"
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center group ${isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Home size={18} className="mr-1 strokeWidth={2} transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
              <span className="relative">
                Accueil
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            <Link
              to="/wizard"
              className={`flex items-center group ${isActive('/wizard') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FilePlus2 size={18} className="mr-1 strokeWidth={2} transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
              <span className="relative">
                Générateur
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            
            {/* Liens conditionnels pour les utilisateurs authentifiés */}
            {isLoaded && isSignedIn && (
              <>
                <Link
                  to="/contracts"
                  className={`flex items-center group ${isActive('/contracts') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <FolderKanban size={18} className="mr-1 strokeWidth={2} transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                  <span className="relative">
                    Contrats
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
                <Link
                  to="/dashboard"
                  className={`flex items-center group ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <LayoutDashboard size={18} className="mr-1 strokeWidth={2} transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                  <span className="relative">
                    Dashboard
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
              </>
            )}
            
            <Link
              to="/about"
              className={`flex items-center group ${isActive('/about') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <InfoIcon size={18} className="mr-1 strokeWidth={2} transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
              <span className="relative">
                À propos
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            
            {/* Bouton de connexion/avatar utilisateur */}
            {isLoaded && (
              <div className="ml-4">
                {isSignedIn ? (
                  <UserButton 
                    afterSignOutUrl="/"
                    signOutCallback={handleSignOut}
                  />
                ) : (
                  <SignInButton mode="modal">
                    <button className="group relative px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden animate-pulse-slow">
                      <span className="relative z-10 flex items-center">
                        <span className="mr-2">Connexion</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-shimmer"></div>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </button>
                  </SignInButton>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* Menu mobile - Redesigné */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2 shadow-md animate-fadeIn">
            <div className="flex flex-col px-4 space-y-2">
              <Link
                to="/"
                className={`flex items-center py-2.5 px-3 rounded-lg ${isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={18} className="mr-3" strokeWidth={2} />
                <span className="font-medium">Accueil</span>
              </Link>
              <Link
                to="/wizard"
                className={`flex items-center py-2.5 px-3 rounded-lg ${isActive('/wizard') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FilePlus2 size={18} className="mr-3" strokeWidth={2} />
                <span className="font-medium">Générateur</span>
              </Link>
              
              {/* Liens conditionnels pour les utilisateurs authentifiés (mobile) */}
              {isLoaded && isSignedIn && (
                <>
                  <Link
                    to="/contracts"
                    className={`flex items-center py-2.5 px-3 rounded-lg ${isActive('/contracts') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FolderKanban size={18} className="mr-3" strokeWidth={2} />
                    <span className="font-medium">Contrats</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className={`flex items-center py-2.5 px-3 rounded-lg ${isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} className="mr-3" strokeWidth={2} />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </>
              )}
              
              <Link
                to="/about"
                className={`flex items-center py-2.5 px-3 rounded-lg ${isActive('/about') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <InfoIcon size={18} className="mr-3" strokeWidth={2} />
                <span className="font-medium">À propos</span>
              </Link>
              
              <div className="border-t border-gray-100 pt-2 mt-1">
                <div className="flex items-center justify-between py-2.5 px-3">
                  {/* Bouton de connexion/avatar utilisateur (mobile) */}
                  {isLoaded && (
                    isSignedIn ? (
                      <UserButton 
                        afterSignOutUrl="/"
                        signOutCallback={handleSignOut}
                      />
                    ) : (
                      <SignInButton mode="modal">
                        <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                          Connexion
                        </button>
                      </SignInButton>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Contenu principal */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* Pied de page */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:py-6 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <div className="text-lg sm:text-xl font-black text-white">LexForge</div>
                <span className="ml-2 text-xs bg-gray-700 text-gray-300 py-0.5 px-2 rounded-md">Beta</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Votre collaborateur juridique virtuel pour des contrats qui déchirent</p>
            </div>
            <div className="flex flex-col items-center text-xs sm:text-sm text-gray-400">
              <div>© {new Date().getFullYear()} LexForge - Tous droits réservés</div>
              <Link to="/legal" className="hover:text-blue-300 mt-1">Mentions légales</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;