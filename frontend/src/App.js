import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ContractWizard from './pages/ContractWizard';
import AboutPage from './pages/AboutPage';
import ContractsPage from './pages/ContractsPage';
import ContractEditorPage from './pages/ContractEditorPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="wizard" element={<ContractWizard />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="editor/:contractId" element={<ContractEditorPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
    </Routes>
  );
}

export default App;