import React from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Octagon, 
  Construction, 
  BrainCircuit, 
  Network, 
  Building2, 
  Siren, 
  FileText, 
  BarChart3, 
  Settings,
  X,
  Shield,
  Briefcase
} from 'lucide-react';
import { DashboardRole } from './AdminTopBar';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  activeRole?: DashboardRole;
  mobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onSelectTab,
  mobileMenuOpen = false,
  onCloseMobileMenu
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents & Accidents', icon: AlertTriangle },
    { id: 'closures', label: 'Road Closures', icon: Octagon },
    { id: 'construction', label: 'Construction', icon: Construction },
    { id: 'predictions', label: 'Predictions', icon: BrainCircuit },
    { id: 'network', label: 'Road Network', icon: Network },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'emergency', label: 'Emergency Response', icon: Siren },
    { id: 'reports', label: 'Reports & Logs', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="py-3 px-2 overflow-y-auto space-y-2">
        {/* Mobile Header Close button */}
        <div className="md:hidden flex items-center justify-between pb-2 border-b border-slate-800 px-2">
          <span className="text-xs font-bold text-white">Menu Navigation</span>
          <button onClick={onCloseMobileMenu} className="p-1 rounded bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Command Controls (11 Tabs)
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
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
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#0F172A] border-r border-slate-800 flex-col select-none h-[calc(100vh-53px)] sticky top-[53px]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex">
          <div className="w-72 bg-[#0F172A] border-r border-slate-800 h-full p-2 flex flex-col shadow-2xl">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={onCloseMobileMenu}></div>
        </div>
      )}
    </>
  );
};

