import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

interface ForbiddenProps {
  onReturnToCivilian?: () => void;
}

export const ForbiddenPage: React.FC<ForbiddenProps> = ({ onReturnToCivilian }) => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col items-center justify-center p-6 font-sans select-none relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="bg-[#0F172A]/90 border border-red-500/40 p-8 rounded-2xl max-w-md w-full text-center space-y-5 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/40 mx-auto flex items-center justify-center text-red-500">
          <ShieldAlert className="w-9 h-9 animate-pulse" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/30">
            ERROR 403 • FORBIDDEN
          </span>
          <h2 className="text-xl font-extrabold text-white font-sans mt-2">
            ACCESS DENIED
          </h2>
          <p className="text-xs text-slate-300">
            You do not have administrative permission to access the Indore Traffic Command Center.
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
          Logged in as: <strong className="text-white">{user?.email || 'Civilian Account'}</strong> <br />
          Role: <strong className="text-emerald-400">{user?.role || 'CIVILIAN'}</strong>
        </div>

        <div className="space-y-2 pt-2">
          {onReturnToCivilian && (
            <button
              onClick={onReturnToCivilian}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 uppercase tracking-wider shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO CIVILIAN NAVIGATION</span>
            </button>
          )}

          <button
            onClick={logout}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl border border-slate-700"
          >
            Logout & Switch Account
          </button>
        </div>
      </div>
    </div>
  );
};
