import React from 'react';
import { RoadSegment } from '../../types';
import { Network, ArrowRight } from 'lucide-react';

interface RoadNetworkTabProps {
  roads: RoadSegment[];
}

export const RoadNetworkTab: React.FC<RoadNetworkTabProps> = ({ roads }) => {
  return (
    <div className="space-y-4">
      <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">Indore Digital Twin Road Network Explorer</h2>
            <p className="text-xs text-slate-400">Complete Database Inventory of Arterial Corridors, Widths & Flow Capacity</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          {roads.length} Corridors Cataloged
        </span>
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
              <tr>
                <th className="px-4 py-3">Corridor ID</th>
                <th className="px-4 py-3">Corridor Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Capacity / Width</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">Speed Limit</th>
                <th className="px-4 py-3">Free-Flow Speed</th>
                <th className="px-4 py-3">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {roads.map((road) => (
                <tr key={road.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-mono font-bold text-slate-400">{road.id}</td>
                  <td className="px-4 py-3 font-bold text-white">
                    {road.name}
                    <span className="block text-[10px] text-slate-400">{road.startIntersection} &rarr; {road.endIntersection}</span>
                  </td>
                  <td className="px-4 py-3 text-blue-400 font-semibold">{road.category}</td>
                  <td className="px-4 py-3 font-semibold text-white">{road.lanes} Lanes ({road.widthMeters}m)</td>
                  <td className="px-4 py-3 text-slate-300">{road.isOneWay ? 'One-Way' : 'Two-Way Dual'}</td>
                  <td className="px-4 py-3 font-bold text-white">{road.speedLimit} km/h</td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">{road.freeFlowSpeed} km/h</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      road.isClosed ? 'bg-red-600 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {road.isClosed ? 'CLOSED' : road.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
