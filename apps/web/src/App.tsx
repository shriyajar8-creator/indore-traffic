import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CivilianApp } from './components/CivilianApp';
import { ApiService } from './services/api';
import { RoadSegment, Incident, SystemNotification } from './types';

const MainView: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'LANDING' | 'ADMIN' | 'CIVILIAN'>('LANDING');
  const [roads, setRoads] = useState<RoadSegment[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  useEffect(() => {
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
  }, []);

  // Sync role changes to view
  useEffect(() => {
    if (user?.role === 'CIVILIAN') {
      setCurrentView('CIVILIAN');
    } else if (user) {
      setCurrentView('ADMIN');
    }
  }, [user]);

  if (currentView === 'ADMIN') {
    return <AdminDashboard />;
  }

  if (currentView === 'CIVILIAN') {
    return (
      <CivilianApp
        roads={roads}
        incidents={incidents}
        notifications={notifications}
      />
    );
  }

  return (
    <LandingPage
      onOpenCommandCenter={() => setCurrentView('ADMIN')}
      onOpenCivilianApp={() => setCurrentView('CIVILIAN')}
    />
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainView />
    </AuthProvider>
  );
}

export default App;
