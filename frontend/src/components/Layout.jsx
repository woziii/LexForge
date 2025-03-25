import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FolderKanban, 
  FilePlus2, 
  InfoIcon, 
  UserCircle,
  Menu,
  X
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import NotificationBell from './ui/NotificationBell';

const Layout = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
              className={`flex items-center space-x-1 text-sm font-medium ${
                isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home size={18} />
              <span>Accueil</span>
            </Link>

            <Link
              to="/wizard"
              className={`flex items-center space-x-1 text-sm font-medium ${
                isActive('/wizard') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FilePlus2 size={18} />
              <span>Nouveau Contrat</span>
            </Link>

            <SignedIn>
              <Link
                to="/contracts"
                className={`flex items-center space-x-1 text-sm font-medium ${
                  isActive('/contracts') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FolderKanban size={18} />
                <span>Mes Contrats</span>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center space-x-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                  <UserCircle size={18} />
                  <span>Se connecter</span>
                </button>
              </SignInButton>
            </SignedOut>

            <Link
              to="/about"
              className={`flex items-center space-x-1 text-sm font-medium ${
                isActive('/about') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <InfoIcon size={18} />
              <span>À propos</span>
            </Link>
          </nav>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>

              <Link
                to="/wizard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/wizard') ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Nouveau Contrat
              </Link>

              <SignedIn>
                <Link
                  to="/contracts"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/contracts') ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mes Contrats
                </Link>
                <div className="px-3 py-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Se connecter
                  </button>
                </SignInButton>
              </SignedOut>

              <Link
                to="/about"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/about') ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>
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
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Assistant de création de contrats juridiques</p>
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              © {new Date().getFullYear()} LexForge - Tous droits réservés
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;