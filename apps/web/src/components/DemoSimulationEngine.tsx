import React from 'react';
import { Sparkles, Siren, Octagon, Flame, Construction } from 'lucide-react';

interface SimulationProps {
  onSimulateAccident: () => void;
  onSimulateClosure: () => void;
  onSimulateSurge: () => void;
}

export const DemoSimulationEngine: React.FC<SimulationProps> = ({
  onSimulateAccident,
  onSimulateClosure,
  onSimulateSurge
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 p-3.5 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-3 select-none">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-400">
          <Sparkles className="w-4 h-4 animate-spin" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-xs text-white uppercase tracking-wider font-sans">
              SIH Interactive Demo Simulation Engine
            </h3>
            <span className="bg-amber-500/20 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
              30-SEC JUDGE SCENARIOS
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Trigger real-time incident cascades & observe immediate civilian rerouting</p>
        </div>
      </div>

      <div className="flex items-center space-x-2.5">
        <button
          onClick={onSimulateAccident}
          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-lg shadow-red-900/30 border border-red-400/40 transition active:scale-95"
        >
          <Siren className="w-3.5 h-3.5 animate-pulse" />
          <span>SIMULATE CRITICAL ACCIDENT</span>
        </button>

        <button
          onClick={onSimulateClosure}
          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-lg border border-amber-400/40 transition active:scale-95"
        >
          <Octagon className="w-3.5 h-3.5" />
          <span>SIMULATE ROAD CLOSURE</span>
        </button>

        <button
          onClick={onSimulateSurge}
          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-lg border border-purple-400/40 transition active:scale-95"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>SIMULATE TRAFFIC SURGE</span>
        </button>
      </div>
    </div>
  );
};
