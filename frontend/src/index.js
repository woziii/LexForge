import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Clé publique Clerk
const PUBLISHABLE_KEY = 'pk_test_cHJpbWFyeS1kb2ctMS5jbGVyay5hY2NvdW50cy5kZXYk';

if (!PUBLISHABLE_KEY) {
  throw new Error("Clé publique Clerk manquante");
}

// Écouteur pour nettoyer les données temporaires lors de la fermeture de la page
// Note: cet événement n'est pas toujours déclenché de manière fiable dans tous les navigateurs
window.addEventListener('beforeunload', () => {
  // Si l'utilisateur n'est pas connecté (pas d'ID Clerk en localStorage), on nettoie la session
  const clerkId = localStorage.getItem('clerkUserId');
  if (!clerkId || clerkId.startsWith('anon_')) {
    console.log('Nettoyage des données temporaires de l\'utilisateur non authentifié');
    
    // Nettoyer réellement les données temporaires
    sessionStorage.removeItem('anonymousUserId');
    sessionStorage.removeItem('tempBusinessInfo');
    sessionStorage.removeItem('tempContractData');
    sessionStorage.removeItem('draftContractId');
    sessionStorage.removeItem('authRedirectAction');
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 