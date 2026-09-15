import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { ForbiddenPage } from './components/ForbiddenPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CivilianApp } from './components/CivilianApp';
import { ApiService } from './services/api';
import { RoadSegment, Incident, SystemNotification } from './types';

const MainView: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [roads, setRoads] = useState<RoadSegment[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [manualAdminAttempt, setManualAdminAttempt] = useState(false);

  // Check URL hash or path for direct /admin attempts
  useEffect(() => {
    const handleUrlCheck = () => {
      if (window.location.hash.includes('admin') || window.location.pathname.includes('admin')) {
        setManualAdminAttempt(true);
      }
    };
    handleUrlCheck();
    window.addEventListener('hashchange', handleUrlCheck);
    return () => window.removeEventListener('hashchange', handleUrlCheck);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    ApiService.getLiveTraffic()
      .then(data => {
        setRoads(data.roads || []);
        setIncidents(data.incidents || []);
      })
      .catch(console.error);

    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data.notifications || []))
      .catch(console.error);
  }, [isAuthenticated]);

  // If not logged in, force Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Strict RBAC: If CIVILIAN tries to access Admin (or path has /admin)
  if (user?.role === 'CIVILIAN') {
    if (manualAdminAttempt) {
      return (
        <ForbiddenPage
          onReturnToCivilian={() => {
            setManualAdminAttempt(false);
            window.location.hash = '';
          }}
        />
      );
    }

    return (
      <CivilianApp
        roads={roads}
        incidents={incidents}
        notifications={notifications}
      />
    );
  }

  // Admin / Police / Road Dept / Emergency roles load Command Center
  return <AdminDashboard />;
};

export function App() {
  return (
    <AuthProvider>
      <MainView />
    </AuthProvider>
  );
}

export default App;

