import React from 'react';
import { 
  LayoutDashboard, 
  Navigation, 
  AlertTriangle, 
  ShieldAlert, 
  Octagon, 
  Construction, 
  GitFork, 
  BrainCircuit, 
  Network, 
  Building2, 
  Siren, 
  FileText, 
  BarChart3, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-traffic', label: 'Live Traffic', icon: Navigation },
    { id: 'incidents', label: 'Traffic Incidents', icon: AlertTriangle },
    { id: 'accidents', label: 'Accidents', icon: ShieldAlert },
    { id: 'closures', label: 'Road Closures', icon: Octagon },
    { id: 'construction', label: 'Construction', icon: Construction },
    { id: 'rerouting', label: 'Rerouting', icon: GitFork },
    { id: 'predictions', label: 'Predictions', icon: BrainCircuit },
    { id: 'network', label: 'Road Network', icon: Network },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'emergency', label: 'Emergency Response', icon: Siren },
    { id: 'reports', label: 'Reports & Logs', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between select-none h-[calc(100vh-53px)] sticky top-[53px]">
      <div className="py-3 px-2 overflow-y-auto space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Command Controls
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-md font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50 text-[10px] text-slate-500">
        <div className="flex justify-between">
          <span>Engine v2.4</span>
          <span className="text-emerald-400 font-semibold">PostGIS Connected</span>
        </div>
        <p className="mt-0.5 truncate">Smart India Hackathon 2026 Core</p>
      </div>
    </aside>
  );
};
