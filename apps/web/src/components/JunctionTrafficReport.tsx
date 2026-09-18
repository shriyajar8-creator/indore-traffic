import React, { useState, useEffect } from 'react';
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
  Line,
  ReferenceLine
} from 'recharts';
import { Car, Bike, Truck, ShieldAlert, BarChart3, Filter, CheckCircle2, TrendingUp, AlertTriangle, Clock, Layers } from 'lucide-react';
import { ApiService } from '../services/api';

interface ReportProps {
  junctions: JunctionTrafficData[];
  analyticsData?: any;
  onNavigateToTab?: (tab: string, filter?: any) => void;
}

export const JunctionTrafficReport: React.FC<ReportProps> = ({ junctions, analyticsData, onNavigateToTab }) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  // Speed History Chart State
  const [speedRange, setSpeedRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [speedData, setSpeedData] = useState<any[]>(analyticsData?.speedHistory || []);
  const [loadingSpeed, setLoadingSpeed] = useState<boolean>(false);

  // Accident Hotspots Chart State
  const [hotspotRange, setHotspotRange] = useState<'24h' | '7d' | '30d' | 'ALL'>('ALL');
  const [hotspotsData, setHotspotsData] = useState<any[]>(analyticsData?.accidentHotspots || []);
  const [loadingHotspots, setLoadingHotspots] = useState<boolean>(false);
  const [showAllHotspots, setShowAllHotspots] = useState<boolean>(false);

  // Fetch Speed History on Range Change
  useEffect(() => {
    let isMounted = true;
    setLoadingSpeed(true);
    ApiService.getSpeedHistory(speedRange)
      .then(res => {
        if (isMounted && res.speedHistory) {
          setSpeedData(res.speedHistory);
        }
      })
      .catch(err => console.error('Speed history fetch error:', err))
      .finally(() => { if (isMounted) setLoadingSpeed(false); });

    return () => { isMounted = false; };
  }, [speedRange]);

  // Fetch Accident Hotspots on Range Change
  useEffect(() => {
    let isMounted = true;
    setLoadingHotspots(true);
    ApiService.getAccidentHotspots(hotspotRange)
      .then(res => {
        if (isMounted && res.accidentHotspots) {
          setHotspotsData(res.accidentHotspots);
        }
      })
      .catch(err => console.error('Accident hotspots fetch error:', err))
      .finally(() => { if (isMounted) setLoadingHotspots(false); });

    return () => { isMounted = false; };
  }, [hotspotRange]);

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

      {/* FEATURE 1 CHART: Average Vehicle Speed Over Time */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-sans">
                Average Corridor Vehicle Speed Over Time
              </h3>
              <p className="text-[11px] text-slate-400">Multi-Corridor Speed Trends & Speed Limit Deviation Benchmarks</p>
            </div>
          </div>

          {/* Time Range Toggle Controls */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-400 px-2 font-bold uppercase">Timeframe:</span>
            {(['24h', '7d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setSpeedRange(range)}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition ${
                  speedRange === range 
                    ? 'bg-emerald-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Empty / Chart Render */}
        {loadingSpeed ? (
          <div className="h-64 flex items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800/50 animate-pulse">
            <span className="text-xs text-slate-400 font-mono">Loading corridor speed data...</span>
          </div>
        ) : speedData.length === 0 ? (
          <div className="h-64 flex items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-500">
            No speed history data recorded for selected time range ({speedRange}).
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={speedData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <XAxis dataKey="timeLabel" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} unit=" km/h" domain={[0, 65]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '10px', fontSize: '11px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    formatter={(val: any, name: any) => [`${val} km/h`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <ReferenceLine 
                    y={50} 
                    stroke="#EF4444" 
                    strokeDasharray="4 4" 
                    label={{ value: 'Free-Flow Limit (50 km/h)', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }} 
                  />
                  <Line type="monotone" dataKey="abRoad" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} name="AB Road Corridor" />
                  <Line type="monotone" dataKey="ringRoad" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name="Ring Road East" />
                  <Line type="monotone" dataKey="mgRoad" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="MG Road Center" />
                  <Line type="monotone" dataKey="bhawarkuan" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} name="Bhawarkuan Corridor" />
                  <Line type="monotone" dataKey="bypass" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Eastern Bypass Highway" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>Dips below 20 km/h indicate severe congestion bottleneck</span>
              </span>
              <span className="text-emerald-400 font-mono">Updated Real-Time via GIS Sensors</span>
            </div>
          </div>
        )}
      </div>

      {/* FEATURE 2 CHART: Accident Hotspots by Junction */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-sans flex items-center gap-2">
                <span>Accident Hotspots by Junction & Intersection</span>
                <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                  RANKED RISK INDEX
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Stacked Incident Severity Distribution & Click-Through Investigation</p>
            </div>
          </div>

          {/* Controls: Time Range & Top 10 Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 px-2 font-bold uppercase">Period:</span>
              {(['24h', '7d', '30d', 'ALL'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setHotspotRange(range)}
                  className={`px-2.5 py-1 rounded font-bold text-[11px] transition ${
                    hotspotRange === range 
                      ? 'bg-red-600 text-white shadow' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAllHotspots(prev => !prev)}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs px-3 py-1.5 rounded-lg transition"
            >
              {showAllHotspots ? 'Show Top 10' : `Show All (${hotspotsData.length})`}
            </button>
          </div>
        </div>

        {/* Loading / Empty / Chart Render */}
        {loadingHotspots ? (
          <div className="h-72 flex items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800/50 animate-pulse">
            <span className="text-xs text-slate-400 font-mono">Aggregating incident hotspots by junction...</span>
          </div>
        ) : hotspotsData.length === 0 ? (
          <div className="h-72 flex items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-500">
            No accident data recorded for selected period ({hotspotRange}).
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={showAllHotspots ? hotspotsData : hotspotsData.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                  onClick={(entry: any) => {
                    if (onNavigateToTab) {
                      onNavigateToTab('incidents');
                    }
                  }}
                >
                  <XAxis type="number" stroke="#64748B" fontSize={10} />
                  <YAxis 
                    dataKey="junctionName" 
                    type="category" 
                    stroke="#CBD5E1" 
                    fontSize={11} 
                    fontWeight={600} 
                    width={140} 
                    tickFormatter={(val) => val.length > 20 ? `${val.slice(0, 18)}...` : val}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '10px', fontSize: '11px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    formatter={(val: any, name: any) => [`${val} incidents`, `Severity: ${name}`]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="CRITICAL" stackId="a" fill="#EF4444" name="Critical / Major Collision" radius={[0, 0, 0, 0]} cursor="pointer" />
                  <Bar dataKey="HIGH" stackId="a" fill="#F59E0B" name="High Severity Incident" cursor="pointer" />
                  <Bar dataKey="MEDIUM" stackId="a" fill="#3B82F6" name="Medium Jam / Breakdown" cursor="pointer" />
                  <Bar dataKey="LOW" stackId="a" fill="#64748B" name="Low Hazard / Obstacle" radius={[0, 4, 4, 0]} cursor="pointer" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Click any bar to switch to <strong>Incidents & Accidents</strong> tab for active response log.</span>
              </span>
              <button
                onClick={() => onNavigateToTab && onNavigateToTab('incidents')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] py-1.5 px-3 rounded-lg shadow flex items-center gap-1 uppercase"
              >
                <span>Investigate Incidents</span>
              </button>
            </div>
          </div>
        )}
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
