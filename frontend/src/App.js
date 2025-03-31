import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ContractWizard from './pages/ContractWizard';
import AboutPage from './pages/AboutPage';
import ContractsPage from './pages/ContractsPage';
import ContractEditorPage from './pages/ContractEditorPage';
import DashboardPage from './pages/DashboardPage';
import LegalPage from './pages/LegalPage';
import AuthGuard from './components/AuthGuard';
import { WelcomePopup, MiniSaul } from './components/ui';

function App() {
  return (
    <>
      <WelcomePopup />
      <MiniSaul />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="wizard" element={<ContractWizard />} />
          
          {/* Routes protégées qui nécessitent une authentification */}
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
          <Route
            path="dashboard"
            element={
              <AuthGuard>
                <DashboardPage />
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