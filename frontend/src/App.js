import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ContractWizard from './pages/ContractWizard';
import AboutPage from './pages/AboutPage';
import ContractsPage from './pages/ContractsPage';
import ContractEditorPage from './pages/ContractEditorPage';
import DashboardPage from './pages/DashboardPage';
import LegalPage from './pages/LegalPage';
import FinalizationPage from './pages/FinalizationPage';
import AuthGuard from './components/AuthGuard';
import { WelcomePopup, MiniSaul } from './components/ui';
import DraftNotification from './components/DraftNotification';
import AuthMigration from './components/AuthMigration';
import { useAuth } from '@clerk/clerk-react';

function App() {
  const { isSignedIn } = useAuth();
  
  return (
    <>
      <WelcomePopup />
      <MiniSaul />
      <AuthMigration />
      {isSignedIn && <DraftNotification />}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="wizard" element={<ContractWizard />} />
          
          <Route 
            path="wizard/finalize/:contractId" 
            element={
              <AuthGuard>
                <FinalizationPage />
              </AuthGuard>
            } 
          />
          
          <Route path="dashboard" element={<DashboardPage />} />
          
          <Route path="temp-dashboard" element={<Navigate to="/dashboard" replace />} />
          
          <Route
            path="contracts"
            element={
              <AuthGuard>
                <ContractsPage />
              </AuthGuard>
            }
          />
          <Route
            path="editor/:contractId"
            element={
              <AuthGuard>
                <ContractEditorPage />
              </AuthGuard>
            }
          />
          
          <Route path="about" element={<AboutPage />} />
          <Route path="legal" element={<LegalPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;