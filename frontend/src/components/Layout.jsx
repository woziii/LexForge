import React, { useState } from 'react';
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
import { useAuth, UserButton, SignInButton } from '@clerk/clerk-react';

const Layout = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();
  
  // Détermine si un lien est actif
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
              className={`flex items-center ${isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Home size={18} className="mr-1" strokeWidth={2} />
              <span>Accueil</span>
            </Link>
            <Link
              to="/wizard"
              className={`flex items-center ${isActive('/wizard') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FilePlus2 size={18} className="mr-1" strokeWidth={2} />
              <span>Générateur</span>
            </Link>
            
            {/* Liens conditionnels pour les utilisateurs authentifiés */}
            {isLoaded && isSignedIn && (
              <>
                <Link
                  to="/contracts"
                  className={`flex items-center ${isActive('/contracts') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <FolderKanban size={18} className="mr-1" strokeWidth={2} />
                  <span>Contrats</span>
                </Link>
                <Link
                  to="/dashboard"
                  className={`flex items-center ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <LayoutDashboard size={18} className="mr-1" strokeWidth={2} />
                  <span>Dashboard</span>
                </Link>
              </>
            )}
            
            <Link
              to="/about"
              className={`flex items-center ${isActive('/about') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <InfoIcon size={18} className="mr-1" strokeWidth={2} />
              <span>À propos</span>
            </Link>
            
            {/* Bouton de connexion/avatar utilisateur */}
            {isLoaded && (
              <div className="ml-4">
                {isSignedIn ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <SignInButton mode="modal">
                    <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                      Connexion
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
                      <UserButton afterSignOutUrl="/" />
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