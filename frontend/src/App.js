import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ContractWizard from './pages/ContractWizard';
import AboutPage from './pages/AboutPage';
import ContractsPage from './pages/ContractsPage';
import ContractEditorPage from './pages/ContractEditorPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="wizard" element={<ContractWizard />} />
        <Route path="about" element={<AboutPage />} />
        
        {/* Routes protégées */}
        <Route
          path="contracts"
          element={
            <ProtectedRoute>
              <ContractsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="editor/:contractId"
          element={
            <ProtectedRoute>
              <ContractEditorPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;