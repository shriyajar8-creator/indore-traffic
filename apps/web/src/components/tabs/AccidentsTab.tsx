import React from 'react';
import { Incident, RoadSegment } from '../../types';
import { ShieldAlert, Siren, CheckCircle2, AlertOctagon, GitFork } from 'lucide-react';

interface AccidentsTabProps {
  incidents: Incident[];
  roads: RoadSegment[];
  onSimulateAccident: () => void;
  onBlockRoad: (roadId: string) => void;
  onCalculateReroute: (roadId: string) => void;
}

export const AccidentsTab: React.FC<AccidentsTabProps> = ({
  incidents,
  roads,
  onSimulateAccident,
  onBlockRoad,
  onCalculateReroute
}) => {
  const accidents = incidents.filter(i => i.type === 'ACCIDENT');
  const criticalAccidents = accidents.filter(a => a.severity === 'CRITICAL');

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#0F172A] border border-red-500/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
            <Siren className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">Emergency Accident & Collision Console</h2>
            <p className="text-xs text-slate-400">High-Priority Tactical Collision Response & Highway Clearance</p>
          </div>
        </div>

        <button
          onClick={onSimulateAccident}
          className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs py-2 px-4 rounded-lg shadow-lg flex items-center space-x-1.5 uppercase"
        >
          <Siren className="w-4 h-4" />
          <span>SIMULATE CRITICAL ACCIDENT</span>
        </button>
      </div>

      {/* Accident Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase">ACTIVE ACCIDENTS</span>
          <p className="text-2xl font-black text-red-400 font-sans mt-1">{accidents.filter(a => a.status === 'ACTIVE').length}</p>
          <span className="text-[10px] text-slate-500">Requires Emergency Unit</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase">CRITICAL COLLISIONS</span>
          <p className="text-2xl font-black text-rose-500 font-sans mt-1">{criticalAccidents.length}</p>
          <span className="text-[10px] text-rose-400 font-semibold">Immediate Reroute Required</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase">AVG RESPONSE TIME</span>
          <p className="text-2xl font-black text-emerald-400 font-sans mt-1">4.2 min</p>
          <span className="text-[10px] text-emerald-400">108 Ambulance Unit</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase">RESOLVED TODAY</span>
          <p className="text-2xl font-black text-blue-400 font-sans mt-1">6 Collisions</p>
          <span className="text-[10px] text-slate-500">Cleared from Corridors</span>
        </div>
      </div>

      {/* Accidents List & Action Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Accident Intervention Queue</h3>
        {accidents.map((acc) => (
          <div key={acc.id} className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                  {acc.id}
                </span>
                <h4 className="font-bold text-sm text-white">{acc.title}</h4>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                Location: {acc.roadName}
              </span>
            </div>

            <p className="text-xs text-slate-300">{acc.description}</p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-slate-400 space-x-3">
                <span>Lanes Blocked: <strong className="text-white">{acc.affectedLanes}</strong></span>
                <span>Reported By: <strong className="text-blue-400">{acc.reportedByRole}</strong></span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onBlockRoad(acc.roadId)}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center space-x-1 shadow"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>BLOCK ROAD</span>
                </button>

                <button
                  onClick={() => onCalculateReroute(acc.roadId)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center space-x-1 shadow"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>START REROUTE</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
