import React, { useState } from 'react';
import { Incident } from '../../types';
import { Siren, CheckCircle2, Navigation, Zap, ShieldAlert } from 'lucide-react';

interface EmergencyTabProps {
  incidents: Incident[];
}

export const EmergencyTab: React.FC<EmergencyTabProps> = ({ incidents }) => {
  const [greenWaveActive, setGreenWaveActive] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-[#0F172A] border border-red-500/40 p-4 rounded-xl flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
            <Siren className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">108 Emergency Priority Corridor Command</h2>
            <p className="text-xs text-slate-400">Green Wave Signal Override & Emergency Vehicle Route Priority</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDispatched(true)}
            className="bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs py-2 px-4 rounded-lg shadow uppercase"
          >
            {dispatched ? 'AMBULANCE DISPATCHED' : 'DISPATCH 108 AMBULANCE'}
          </button>
        </div>
      </div>

      {/* Emergency Active Route Card */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
              ACTIVE EMERGENCY ROUTE #108-IND-04
            </span>
            <h3 className="text-base font-extrabold text-white mt-1">MYH Government Hospital &rarr; Vijay Nagar Square</h3>
            <p className="text-xs text-slate-400">Target ETA: <strong className="text-emerald-400 text-sm">7 min</strong> (Saves 14 minutes over regular traffic)</p>
          </div>

          <button
            onClick={() => setGreenWaveActive(!greenWaveActive)}
            className={`font-black text-xs py-2.5 px-5 rounded-xl shadow-xl flex items-center space-x-2 transition ${
              greenWaveActive 
                ? 'bg-emerald-600 text-white border border-emerald-400' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{greenWaveActive ? 'GREEN WAVE CORRIDOR ACTIVE' : 'CLEAR EMERGENCY GREEN CORRIDOR'}</span>
          </button>
        </div>

        {greenWaveActive && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl flex items-center space-x-3 text-xs text-emerald-400">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 animate-pulse" />
            <div>
              <span className="font-extrabold block text-sm">GREEN WAVE SIGNAL OVERRIDE ENFORCED</span>
              <p className="text-slate-300 mt-0.5">
                All 6 automated traffic signals along AB Road between Palasia Square and Vijay Nagar are locked in green phase (+35s green extension). Emergency vehicle clear path active.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block font-semibold">Assigned Emergency Unit</span>
            <span className="font-bold text-white">Indore 108 ALS Ambulance #14</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block font-semibold">Obstacles on Route</span>
            <span className="font-bold text-emerald-400">0 Blocked Corridors</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block font-semibold">Signal Synchronization</span>
            <span className="font-bold text-blue-400">100% Green Priority Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
