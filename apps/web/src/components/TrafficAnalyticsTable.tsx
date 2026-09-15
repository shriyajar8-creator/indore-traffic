import React from 'react';
import { RoadSegment } from '../types';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown } from 'lucide-react';

interface AnalyticsTableProps {
  roads: RoadSegment[];
  onSelectRoad: (road: RoadSegment) => void;
}

export const TrafficAnalyticsTable: React.FC<AnalyticsTableProps> = ({ roads, onSelectRoad }) => {
  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <h2 className="font-bold text-sm text-white">Live Traffic Change Analytics & Velocity Deltas</h2>
        </div>
        <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          Comparing Current vs Historical Sensor Baselines
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
            <tr>
              <th className="px-4 py-2.5">Corridor Name</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Current Speed</th>
              <th className="px-4 py-2.5">Historical Avg</th>
              <th className="px-4 py-2.5">Speed Delta</th>
              <th className="px-4 py-2.5">Congestion</th>
              <th className="px-4 py-2.5">Congestion Delta</th>
              <th className="px-4 py-2.5">Travel Time Diff</th>
              <th className="px-4 py-2.5">Status & Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {roads.map((road) => {
              const speedDiff = road.currentSpeed - road.historicalAverageSpeed;
              const isSpeedWorse = speedDiff < 0;
              const travelTimeDiff = road.travelTimeMinutes - road.historicalTravelTimeMinutes;

              let trendArrow = <Minus className="w-3.5 h-3.5 text-slate-400" />;
              let statusBadge = 'bg-slate-800 text-slate-300 border-slate-700';
              let trendText = 'STABLE';

              if (road.congestionChangePercentage > 10) {
                trendArrow = <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />;
                statusBadge = 'bg-red-500/10 text-red-400 border-red-500/30';
                trendText = 'WORSENING';
              } else if (road.congestionChangePercentage < -5) {
                trendArrow = <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />;
                statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                trendText = 'IMPROVING';
              }

              return (
                <tr 
                  key={road.id} 
                  onClick={() => onSelectRoad(road)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-white">
                    {road.name}
                    {road.isClosed && <span className="ml-2 text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">CLOSED</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px]">{road.category}</td>
                  <td className="px-4 py-3 font-bold text-white">{road.currentSpeed} km/h</td>
                  <td className="px-4 py-3 text-slate-400">{road.historicalAverageSpeed} km/h</td>
                  <td className={`px-4 py-3 font-semibold ${isSpeedWorse ? 'text-red-400' : 'text-emerald-400'}`}>
                    {speedDiff > 0 ? `+${speedDiff}` : speedDiff} km/h
                  </td>
                  <td className="px-4 py-3 font-bold text-amber-400">{road.congestionPercentage}%</td>
                  <td className={`px-4 py-3 font-semibold ${road.congestionChangePercentage > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {road.congestionChangePercentage > 0 ? `+${road.congestionChangePercentage}%` : `${road.congestionChangePercentage}%`}
                  </td>
                  <td className={`px-4 py-3 font-semibold ${travelTimeDiff > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {travelTimeDiff > 0 ? `+${travelTimeDiff} min` : `${travelTimeDiff} min`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge}`}>
                      {trendArrow}
                      <span>{trendText}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
