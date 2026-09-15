import React from 'react';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  Octagon, 
  Flame, 
  Siren, 
  LogOut, 
  ShieldCheck, 
  Database,
  Wifi
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TrafficKpis } from '../types';

interface AdminTopBarProps {
  kpis: TrafficKpis;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ kpis, activeTab, onSelectTab }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-[#0F172A] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between select-none shadow-lg z-30 sticky top-0">
      {/* Brand & Live Telemetry Indicator */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shadow-inner">
            <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-sm md:text-base tracking-wide text-white uppercase font-sans">
                Indore Traffic Command Center
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-beacon"></span>
                <span>SYSTEM LIVE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Department of Urban Traffic & Public Safety • MP Govt
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Metrics Pill */}
      <div className="hidden lg:flex items-center space-x-5 bg-slate-900/90 px-4 py-1.5 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-[11px]">
          <Database className="w-3.5 h-3.5" />
          <span>DB: CONNECTED</span>
        </div>
        <div className="h-4 w-[1px] bg-slate-800"></div>
        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-[11px]">
          <Wifi className="w-3.5 h-3.5" />
          <span>SOCKET: CONNECTED</span>
        </div>
        <div className="h-4 w-[1px] bg-slate-800"></div>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Incidents:</span>
          <span className="font-bold text-amber-400">{kpis.activeIncidents}</span>
        </div>
        <div className="h-4 w-[1px] bg-slate-800"></div>
        <div className="flex items-center space-x-2">
          <Octagon className="w-3.5 h-3.5 text-red-400" />
          <span className="text-slate-400">Closures:</span>
          <span className="font-bold text-red-400">{kpis.roadsClosed}</span>
        </div>
        <div className="h-4 w-[1px] bg-slate-800"></div>
        <div className="flex items-center space-x-2">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Commuters:</span>
          <span className="font-semibold text-slate-100">{kpis.affectedUsers.toLocaleString()}</span>
        </div>
      </div>

      {/* User Info & Logout */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
          <img src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt="Avatar" className="w-6 h-6 rounded-full border border-blue-500/40" />
          <div className="hidden sm:block text-left">
            <p className="text-[11px] font-semibold text-slate-100 leading-tight">{user?.name || 'Administrator'}</p>
            <p className="text-[9px] text-slate-400 leading-tight">{user?.department || 'Command Center'}</p>
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
