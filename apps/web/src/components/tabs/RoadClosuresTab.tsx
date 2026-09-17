import React from 'react';
import { RoadSegment } from '../../types';
import { Octagon, ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react';

interface RoadClosuresTabProps {
  roads: RoadSegment[];
  onToggleClosure: (roadId: string, isClosed: boolean) => void;
}

export const RoadClosuresTab: React.FC<RoadClosuresTabProps> = ({ roads, onToggleClosure }) => {
  const closedRoads = roads.filter(r => r.isClosed);
  const openRoads = roads.filter(r => !r.isClosed);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Octagon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">Road Closures Management</h2>
            <p className="text-xs text-slate-400">Enforce Administrative Blockades & Manage Corridor Closures</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-bold uppercase">CURRENTLY CLOSED</span>
          <span className="text-xl font-black text-red-400 font-sans">{closedRoads.length} Corridors</span>
        </div>
      </div>

      {/* Closed Roads List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Road Closures</h3>
        {closedRoads.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-center text-xs text-slate-500">
            No active road closures enforced. All corridors operating normally.
          </div>
        ) : (
          closedRoads.map((road) => (
            <div key={road.id} className="bg-slate-900 border border-red-500/40 p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-white">{road.name}</h4>
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">CLOSED</span>
                </div>
                <p className="text-xs text-red-300 mt-1">Reason: {road.closureReason || 'Authority Order'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{road.category} • {road.lanes} Lanes ({road.widthMeters}m)</p>
              </div>

              <button
                onClick={() => onToggleClosure(road.id, false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 px-4 rounded-lg shadow uppercase"
              >
                OPEN ROAD & CLEAR DIVERSION
              </button>
            </div>
          ))
        )}
      </div>

      {/* Open Roads Control Grid */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Open Network Corridors (Enforce Closure)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {openRoads.map((road) => (
            <div key={road.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-white">{road.name}</h4>
                <p className="text-[10px] text-slate-400">{road.category} • Speed Limit: {road.speedLimit} km/h</p>
                <span className="text-[10px] text-amber-400 font-semibold">Congestion: {road.congestionPercentage}%</span>
              </div>

              <button
                onClick={() => onToggleClosure(road.id, true)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow"
              >
                BLOCK CORRIDOR
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
