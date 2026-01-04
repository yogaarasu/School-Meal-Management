
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthState, UserRole } from './types';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import OrganizerLayout from './components/OrganizerLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import OrganizerManagement from './pages/Admin/OrganizerManagement';
import PricingConfiguration from './pages/Admin/PricingConfiguration';
import OrganizerDashboard from './pages/Organizer/OrganizerDashboard';
import DailyMealReport from './pages/Organizer/DailyMealReport';
import SubmissionList from './pages/Organizer/SubmissionList';
import StockManagement from './pages/Organizer/StockManagement';
import MonthlyReport from './pages/Organizer/MonthlyReport';
import { INITIAL_MEALS } from './constants';
import { getMeals, saveMeals } from './storage';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ user: null });

  useEffect(() => {
    const existing = getMeals();
    if (existing.length === 0) {
      saveMeals(INITIAL_MEALS);
    }

    const savedSession = localStorage.getItem('tn_nmo_session');
    if (savedSession) {
      setAuth({ user: JSON.parse(savedSession) });
    }
  }, []);

  const handleLogin = (user: AuthState['user']) => {
    setAuth({ user });
    localStorage.setItem('tn_nmo_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuth({ user: null });
    localStorage.removeItem('tn_nmo_session');
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/login" element={auth.user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
            {auth.user?.role === UserRole.ADMIN ? (
              <Route element={<AdminLayout onLogout={handleLogout} user={auth.user} />}>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/organizers" element={<OrganizerManagement />} />
                <Route path="/pricing" element={<PricingConfiguration />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            ) : auth.user?.role === UserRole.ORGANIZER ? (
              <Route element={<OrganizerLayout onLogout={handleLogout} user={auth.user} />}>
                <Route path="/" element={<OrganizerDashboard user={auth.user} />} />
                <Route path="/daily-report" element={<DailyMealReport user={auth.user} />} />
                <Route path="/submissions" element={<SubmissionList user={auth.user} />} />
                <Route path="/stock" element={<StockManagement user={auth.user} />} />
                <Route path="/monthly-report" element={<MonthlyReport user={auth.user} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
