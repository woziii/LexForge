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
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="editor/:contractId" element={<ContractEditorPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="legal" element={<LegalPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;