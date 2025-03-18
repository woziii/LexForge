import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, FileText, Settings, User } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  
  // Détermine si un lien est actif
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-700">LexForge</Link>
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-md">Beta</span>
          </div>
          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center ${isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Home size={18} className="mr-1" />
              <span>Accueil</span>
            </Link>
            <Link
              to="/wizard"
              className={`flex items-center ${isActive('/wizard') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FileText size={18} className="mr-1" />
              <span>Générateur</span>
            </Link>
            <Link
              to="/contracts"
              className={`flex items-center ${isActive('/contracts') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FileText size={18} className="mr-1" />
              <span>Contrats</span>
            </Link>
            <Link
              to="/about"
              className={`flex items-center ${isActive('/about') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Settings size={18} className="mr-1" />
              <span>À propos</span>
            </Link>
            <a href="#" className="text-gray-500 hover:text-gray-700 flex items-center">
              <User size={18} />
            </a>
          </nav>
        </div>
      </header>
      
      {/* Contenu principal */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* Pied de page */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <div className="text-xl font-bold text-white">LexForge</div>
                <span className="ml-2 text-xs bg-gray-700 text-gray-300 py-1 px-2 rounded-md">Beta</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Assistant de création de contrats juridiques</p>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} LexForge - Tous droits réservés
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;