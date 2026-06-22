import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';
import TestStrategyPage from './pages/TestStrategyPage';
import TestPlanPage from './pages/TestPlanPage';
import RCAPage from './pages/RCAPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="test-strategy" element={<TestStrategyPage />} />
        <Route path="test-plan" element={<TestPlanPage />} />
        <Route path="rca" element={<RCAPage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>
    </Routes>
  );
}
