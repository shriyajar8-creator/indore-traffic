import React, { useState } from 'react';
import { JunctionTrafficData } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Car, Bike, Truck, ShieldAlert, BarChart3, Filter, CheckCircle2 } from 'lucide-react';

interface ReportProps {
  junctions: JunctionTrafficData[];
}

export const JunctionTrafficReport: React.FC<ReportProps> = ({ junctions }) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const filteredJunctions = junctions.filter(j => 
    filterLevel === 'ALL' ? true : j.congestionLevel === filterLevel
  );

  const total2W = junctions.reduce((acc, j) => acc + j.twoWheelerCount, 0);
  const total3W = junctions.reduce((acc, j) => acc + j.threeWheelerCount, 0);
  const total4W = junctions.reduce((acc, j) => acc + j.fourWheelerCount, 0);
  const grandTotal = junctions.reduce((acc, j) => acc + j.totalVehicles, 0);

  const vehiclePieData = [
    { name: 'Four Wheeler', value: total4W, color: '#3B82F6' },
    { name: 'Two Wheeler', value: total2W, color: '#10B981' },
    { name: 'Three Wheeler', value: total3W, color: '#F59E0B' }
  ];

  const congestionDistributionData = [
    { name: 'HIGH (72%)', value: 9, color: '#F97316' },
    { name: 'MODERATE (19%)', value: 4, color: '#EAB308' },
    { name: 'SEVERE (9%)', value: 1, color: '#DC2626' }
  ];

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-base text-white tracking-wide uppercase font-sans">
                Official Vehicle Count Traffic Analysis Report
              </h2>
              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/30">
                OFFICIAL REPORT DATA
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-Junction Traffic Summary • Dec 2024 – Apr 2025 (45.19 Million Vehicle Audit)</p>
          </div>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Congestion Levels (13 Junctions)</option>
            <option value="SEVERE">Severe (&ge; 3,000 peak)</option>
            <option value="HIGH">High (2,000 - 2,999 peak)</option>
            <option value="MODERATE">Moderate (1,200 - 1,999 peak)</option>
          </select>
        </div>
      </div>

      {/* Aggregate Volume KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-blue-500/30 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>GRAND TOTAL VEHICLES</span>
            <Car className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-sans mt-1">{grandTotal.toLocaleString()}</p>
          <span className="text-[10px] text-blue-400 font-semibold">13 Key Indore Junctions</span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>TWO WHEELER TOTAL</span>
            <Bike className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-sans mt-1">{total2W.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">39.0% Modal Share</span>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/30 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>THREE WHEELER TOTAL</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-sans mt-1">{total3W.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">20.9% Modal Share</span>
        </div>

        <div className="bg-slate-900/90 border border-purple-500/30 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>FOUR WHEELER TOTAL</span>
            <Car className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 font-sans mt-1">{total4W.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">40.1% Modal Share</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Bar Chart: Peak Hour Volume by Junction */}
        <div className="lg:col-span-8 bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-2">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider">
            Average Peak Hour Traffic Volume by Junction
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredJunctions}>
                <XAxis dataKey="junctionName" stroke="#64748B" fontSize={10} angle={-25} textAnchor="end" height={45} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="peakHourAvg" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Peak Hour Avg Vehicles" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Vehicle Composition Split */}
        <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-2">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider">
            Vehicle Category Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehiclePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehiclePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Multi-Junction Traffic Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
            <tr>
              <th className="px-4 py-3">Junction</th>
              <th className="px-4 py-3">Audit Period</th>
              <th className="px-4 py-3">Two Wheeler</th>
              <th className="px-4 py-3">Three Wheeler</th>
              <th className="px-4 py-3">Four Wheeler</th>
              <th className="px-4 py-3">Total Vehicles</th>
              <th className="px-4 py-3">Peak Hour (Avg)</th>
              <th className="px-4 py-3">Congestion Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredJunctions.map((j) => {
              let badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
              if (j.congestionLevel === 'SEVERE') badgeColor = 'bg-red-600 text-white font-extrabold';
              else if (j.congestionLevel === 'HIGH') badgeColor = 'bg-orange-500/20 text-orange-400 border-orange-500/30';

              return (
                <tr key={j.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-bold text-white">{j.junctionName}</td>
                  <td className="px-4 py-3 text-slate-400 text-[11px] font-mono">{j.period}</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold">{j.twoWheelerCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-amber-400 font-semibold">{j.threeWheelerCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-blue-400 font-semibold">{j.fourWheelerCount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-black text-white">{j.totalVehicles.toLocaleString()}</td>
                  <td className="px-4 py-3 font-extrabold text-amber-300">{j.peakHourAvg.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                      {j.congestionLevel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-950 font-bold border-t border-slate-800 text-xs">
            <tr>
              <td className="px-4 py-3 text-white uppercase" colSpan={2}>GRAND TOTAL</td>
              <td className="px-4 py-3 text-emerald-400">{total2W.toLocaleString()}</td>
              <td className="px-4 py-3 text-amber-400">{total3W.toLocaleString()}</td>
              <td className="px-4 py-3 text-blue-400">{total4W.toLocaleString()}</td>
              <td className="px-4 py-3 text-white text-sm">{grandTotal.toLocaleString()}</td>
              <td className="px-4 py-3 text-slate-400" colSpan={2}>Audit Threshold Engine Verified</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Threshold Classification Legend Rules */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
        <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Report Congestion Threshold Rules:</span>
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span><strong>LOW:</strong> &lt; 1,200 avg peak</span>
          </span>
          <span className="flex items-center space-x-1.5 text-yellow-400">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span><strong>MODERATE:</strong> 1,200 – 1,999 avg peak</span>
          </span>
          <span className="flex items-center space-x-1.5 text-orange-400">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span><strong>HIGH:</strong> 2,000 – 2,999 avg peak</span>
          </span>
          <span className="flex items-center space-x-1.5 text-red-500 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span><strong>SEVERE:</strong> &ge; 3,000 avg peak</span>
          </span>
        </div>
      </div>
    </div>
  );
};
