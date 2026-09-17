import React, { useState } from 'react';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  Octagon, 
  LogOut, 
  Database,
  Wifi,
  Bell,
  CheckCircle,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  Shield,
  Siren,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TrafficKpis, SystemNotification } from '../types';

export type DashboardRole = 'EXECUTIVE' | 'FIELD_STAFF' | 'EMERGENCY_RESPONSE';

interface AdminTopBarProps {
  kpis: TrafficKpis;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  notifications?: SystemNotification[];
  activeRole?: DashboardRole;
  onRoleChange?: (role: DashboardRole) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleMobileMenu: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ 
  kpis, 
  activeTab, 
  onSelectTab,
  notifications = [],
  activeRole = 'EXECUTIVE',
  onRoleChange,
  theme,
  onToggleTheme,
  onToggleMobileMenu
}) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifList, setNotifList] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      title: '🚨 CRITICAL COLLISION ON AB ROAD',
      message: 'Multi-axle collision reported near Vijay Nagar Square. Emergency services dispatched.',
      priority: 'CRITICAL',
      type: 'CRITICAL',
      targetTab: 'incidents',
      timestamp: new Date().toISOString(),
      isRead: false,
      audience: 'ALL'
    },
    {
      id: 'notif-2',
      title: '⚠️ HEAVY CONGESTION SURGE',
      message: 'Ring Road East velocity dropped below 15 km/h due to peak-hour volume.',
      priority: 'WARNING',
      type: 'WARNING',
      targetTab: 'predictions',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      isRead: false,
      audience: 'ALL'
    },
    {
      id: 'notif-3',
      title: '🏗️ METRO CONSTRUCTION ADVISORY',
      message: 'Palasia Corridor lane narrowing active from 22:00 to 06:00.',
      priority: 'INFO',
      type: 'CONSTRUCTION',
      targetTab: 'construction',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: true,
      audience: 'ALL'
    }
  ]);

  const unreadCount = notifList.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifList(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (n: SystemNotification) => {
    setNotifList(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
    if (n.targetTab) {
      onSelectTab(n.targetTab);
    }
    setShowNotifications(false);
  };

  return (
    <header className={`${theme === 'dark' ? 'bg-[#0F172A] border-slate-800' : 'bg-slate-900 border-slate-700'} border-b px-3 md:px-4 py-2 flex items-center justify-between select-none shadow-lg z-30 sticky top-0 transition-colors`}>
      {/* Brand & Mobile Menu Button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <img 
            src="/gatiraksha-logo.png" 
            alt="GatiRaksha Logo" 
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-blue-500/40 object-cover shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-xs md:text-sm tracking-wide text-white uppercase font-sans flex items-center gap-1.5">
                <span className="text-blue-400 font-extrabold">GatiRaksha</span> Command
              </h1>
              <span className="hidden sm:flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-beacon"></span>
                <span>LIVE</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Smart Urban Traffic & Public Safety Platform
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Metrics Pill (Desktop) */}
      <div className="hidden xl:flex items-center space-x-4 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800 text-[11px]">
        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
          <Database className="w-3.5 h-3.5" />
          <span>DB</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-800"></div>
        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
          <Wifi className="w-3.5 h-3.5" />
          <span>SOCKET</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-800"></div>
        <div className="flex items-center space-x-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Incidents:</span>
          <span className="font-bold text-amber-400">{kpis.activeIncidents}</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-800"></div>
        <div className="flex items-center space-x-1.5">
          <Octagon className="w-3.5 h-3.5 text-red-400" />
          <span className="text-slate-400">Closures:</span>
          <span className="font-bold text-red-400">{kpis.roadsClosed}</span>
        </div>
      </div>

      {/* Controls: Theme Toggle, Notifications, User */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Dark / Light High Contrast Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-400 transition"
          title={`Switch to ${theme === 'dark' ? 'Light / High Contrast' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
        </button>

        {/* Global Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
            title="Global Notification Center"
          >
            <Bell className="w-4 h-4 text-blue-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Center Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs">
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span className="font-extrabold text-white text-xs">Unified Notification Center</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500/20 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500/30">
                      {unreadCount} UNREAD
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" /> Mark all read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                {notifList.map(n => {
                  let priorityBadge = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                  if (n.priority === 'CRITICAL' || n.type === 'CRITICAL') {
                    priorityBadge = 'bg-red-500/20 text-red-400 border-red-500/30 font-bold';
                  } else if (n.priority === 'WARNING' || n.type === 'WARNING') {
                    priorityBadge = 'bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold';
                  }

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 hover:bg-slate-800/60 cursor-pointer transition flex items-start justify-between space-x-2 ${
                        !n.isRead ? 'bg-blue-950/20' : 'opacity-80'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border ${priorityBadge}`}>
                            {n.priority || n.type}
                          </span>
                          <span className="font-bold text-white text-xs">{n.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{n.message}</p>
                        <span className="text-[9px] text-slate-500 block font-mono">{n.timestamp.slice(11, 19)}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 self-center flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
          <img src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt="Avatar" className="w-6 h-6 rounded-full border border-blue-500/40" />
          <div className="hidden lg:block text-left">
            <p className="text-[11px] font-semibold text-slate-100 leading-tight">{user?.name || 'Administrator'}</p>
            <p className="text-[9px] text-slate-400 leading-tight">{activeRole}</p>
          </div>
          <button 
            onClick={logout} 
            className="text-slate-400 hover:text-red-400 ml-1 p-1 rounded hover:bg-slate-800 transition"
            title="Logout of Command Center"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

