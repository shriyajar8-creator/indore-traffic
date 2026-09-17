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
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Car, Bike, Truck, ShieldAlert, BarChart3, Filter, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';


interface ReportProps {
  junctions: JunctionTrafficData[];
  analyticsData?: any;
}

export const JunctionTrafficReport: React.FC<ReportProps> = ({ junctions, analyticsData }) => {
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

  const hourlyLineData = analyticsData?.hourlyCongestion || [];
  const categoryBarData = analyticsData?.incidentCategoryData || [
    { name: 'CONSTRUCTION', count: 3 },
    { name: 'ACCIDENT', count: 2 },
    { name: 'WATERLOGGING', count: 1 },
    { name: 'ROADBLOCK', count: 2 },
    { name: 'OTHER', count: 1 }
  ];
  const busiestZones = analyticsData?.busiestZones || [
    { name: 'AB Road Corridor (Vijay Nagar -> Palasia)', congestion: 88, status: 'CRITICAL', avgDelayMin: 14 },
    { name: 'Bhawarkuan Square & University Link', congestion: 76, status: 'SEVERE', avgDelayMin: 9 },
    { name: 'Rajwada City Center & MG Road', congestion: 68, status: 'HEAVY', avgDelayMin: 7 },
    { name: 'Ring Road East (Bengali Sq -> MR-10)', congestion: 54, status: 'MODERATE', avgDelayMin: 4 },
    { name: 'Eastern Bypass Highway Link', congestion: 22, status: 'FREE_FLOW', avgDelayMin: 1 }
  ];

  const [comparativeTimeframe, setComparativeTimeframe] = useState<'THIS_WEEK' | 'LAST_WEEK' | 'LAST_MONTH'>('THIS_WEEK');

  const comparativeDataMap = {
    THIS_WEEK: { volume: 45197030, speed: 32, congestion: 58, label: 'Current Active Week', change: '+3.1% vs typical' },
    LAST_WEEK: { volume: 43820100, speed: 34, congestion: 54, label: 'Previous Week Baseline', change: '-1.4% vs typical' },
    LAST_MONTH: { volume: 41250900, speed: 37, congestion: 48, label: 'Same Period Last Month', change: '-5.2% vs typical' }
  };

  const selectedComp = comparativeDataMap[comparativeTimeframe];

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
                Historical & Comparative Traffic Analytics
              </h2>
              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/30">
                BASELINE NORMS OVERLAY
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-Week Volume Benchmarking & Typical Congestion Deviation Metrics</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">Compare:</span>
            <select
              value={comparativeTimeframe}
              onChange={(e) => setComparativeTimeframe(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-xs text-amber-400 font-bold rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="THIS_WEEK">This Week (Live)</option>
              <option value="LAST_WEEK">Vs. Last Week</option>
              <option value="LAST_MONTH">Vs. Same Week Last Month</option>
            </select>
          </div>

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
      </div>

      {/* Historical Comparison Cards Bar */}
      <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/30 space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
          <span className="font-extrabold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Comparative Benchmark Summary: {selectedComp.label}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            Deviation: {selectedComp.change}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">TOTAL NETWORK VOLUME</span>
            <span className="text-xl font-black text-white">{selectedComp.volume.toLocaleString()}</span>
            <span className="text-[10px] text-blue-400 block">Vehicles Counted Across 13 Junctions</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">AVERAGE CITYWIDE SPEED</span>
            <span className="text-xl font-black text-emerald-400">{selectedComp.speed} km/h</span>
            <span className="text-[10px] text-slate-400 block">Expected Baseline Norm: 35 km/h</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">AVERAGE CONGESTION SATURATION</span>
            <span className="text-xl font-black text-amber-400">{selectedComp.congestion}%</span>
            <span className="text-[10px] text-amber-300 block">Typical Expected Norm: 50%</span>
          </div>
        </div>
      </div>

      {/* Charts Section 1: Junction Volume & Vehicle Modal Split */}
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

      {/* Charts Section 2: 24-Hour Trend & Hazard Category Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Line Chart: 24-Hour Congestion Trend */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-2">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center justify-between">
            <span>24-Hour Citywide Corridor Congestion Index</span>
            <span className="text-[10px] text-emerald-400 font-mono">Reference Metric: Saturation %</span>
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyLineData.length > 0 ? hourlyLineData : [
                { hour: '06:00', abRoad: 25, ringRoad: 20, mgRoad: 30 },
                { hour: '09:00', abRoad: 85, ringRoad: 65, mgRoad: 75 },
                { hour: '12:00', abRoad: 55, ringRoad: 45, mgRoad: 60 },
                { hour: '15:00', abRoad: 60, ringRoad: 50, mgRoad: 65 },
                { hour: '18:00', abRoad: 92, ringRoad: 78, mgRoad: 88 },
                { hour: '21:00', abRoad: 40, ringRoad: 30, mgRoad: 42 }
              ]}>
                <XAxis dataKey="hour" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="abRoad" stroke="#EF4444" strokeWidth={2} name="AB Road Corridor" />
                <Line type="monotone" dataKey="ringRoad" stroke="#F59E0B" strokeWidth={2} name="Ring Road East" />
                <Line type="monotone" dataKey="mgRoad" stroke="#3B82F6" strokeWidth={2} name="MG Road Center" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Incident Category Distribution */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-2">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider">
            Incident Category & Hazard Distribution
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBarData} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="Reported Incidents" />
              </BarChart>
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
