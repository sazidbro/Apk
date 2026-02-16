
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import BudgetTracker from './components/BudgetTracker';
import GoalTracker from './components/GoalTracker';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import SecurityOverlay from './components/SecurityOverlay';

const AppContent: React.FC = () => {
  const { state } = useApp();

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  if (state.isLocked) {
    return <SecurityOverlay />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="budget" element={<BudgetTracker />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="goals" element={<GoalTracker />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </HashRouter>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
