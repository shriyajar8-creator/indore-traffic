import React from 'react';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  Octagon, 
  Flame, 
  Siren, 
  Search, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TrafficKpis } from '../types';

interface AdminTopBarProps {
  kpis: TrafficKpis;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onSimulateAccident: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ kpis, activeTab, onSelectTab, onSimulateAccident }) => {
  const { user, logout, quickLogin } = useAuth();

  return (
    <header className="bg-[#0F172A] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between select-none shadow-lg z-30 sticky top-0">
      {/* Brand & Live Indicator */}
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
                <span>LIVE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Department of Urban Traffic & Public Safety • MP Govt
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Metrics Pill */}
      <div className="hidden lg:flex items-center space-x-6 bg-slate-900/80 px-4 py-1.5 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Users:</span>
          <span className="font-semibold text-slate-100">12,438</span>
        </div>
        <div className="h-4 w-[1px] bg-slate-800"></div>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Active Incidents:</span>
          <span className="font-semibold text-amber-400">{kpis.activeIncidents}</span>
        </div>
        <div className="h-4 w-[1px] bg-slate-800"></div>
        <div className="flex items-center space-x-2">
          <Octagon className="w-3.5 h-3.5 text-red-400" />
          <span className="text-slate-400">Road Closures:</span>
          <span className="font-semibold text-red-400">{kpis.roadsClosed}</span>
        </div>
        <div className="h-4 w-[1px] bg-slate-800"></div>
        <div className="flex items-center space-x-2">
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-slate-400">Critical Congestion:</span>
          <span className="font-semibold text-rose-400">{kpis.congestedRoads}</span>
        </div>
        <div className="h-4 w-[1px] bg-slate-800"></div>
        <div className="flex items-center space-x-2">
          <Siren className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400">Emergency:</span>
          <span className="font-semibold text-purple-400">{kpis.emergencyIncidents}</span>
        </div>
      </div>

      {/* Controls & Quick Role Selector */}
      <div className="flex items-center space-x-3">
        {/* SIH Quick Trigger Button */}
        <button
          onClick={onSimulateAccident}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-red-900/30 border border-red-400/30 transition-all transform active:scale-95"
          title="Trigger 30-Second Hackathon Demo Accident Flow"
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>SIMULATE ACCIDENT</span>
        </button>

        {/* Role Switcher */}
        <div className="relative group">
          <button className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center space-x-2 hover:bg-slate-750">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="capitalize">{user?.role?.replace('_', ' ') || 'Switch Role'}</span>
          </button>
          <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-1 hidden group-hover:block z-50 text-xs">
            <div className="px-3 py-1 text-[10px] text-slate-500 font-semibold uppercase">Switch Role Demo</div>
            <button onClick={() => quickLogin('ADMIN')} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200">Admin Command</button>
            <button onClick={() => quickLogin('TRAFFIC_POLICE')} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200">Traffic Police</button>
            <button onClick={() => quickLogin('ROAD_DEPARTMENT')} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200">Municipal / Road Dept</button>
            <button onClick={() => quickLogin('EMERGENCY_RESPONSE')} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200">Emergency 108 Corps</button>
            <button onClick={() => quickLogin('CIVILIAN')} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-emerald-400 font-semibold">Civilian App</button>
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
          <img src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt="Avatar" className="w-6 h-6 rounded-full border border-blue-500/40" />
          <div className="hidden sm:block text-left">
            <p className="text-[11px] font-semibold text-slate-100 leading-tight">{user?.name || 'Administrator'}</p>
            <p className="text-[9px] text-slate-400 leading-tight">{user?.department || 'Command Center'}</p>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-red-400 ml-1">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
