import React, { useState, useEffect } from 'react';
import { RoadSegment, Incident, ConstructionProject, TrafficKpis, ReroutePlan, SystemNotification, JunctionTrafficData } from '../types';
import { ApiService } from '../services/api';
import { AdminTopBar } from '../components/AdminTopBar';
import { AdminSidebar } from '../components/AdminSidebar';
import { KpiCardsSection } from '../components/KpiCard';
import { IndoreMap } from '../components/IndoreMap';
import { TrafficAnalyticsTable } from '../components/TrafficAnalyticsTable';
import { RerouteEngineDrawer } from '../components/RerouteEngineDrawer';
import { PredictionPanel } from '../components/PredictionPanel';
import { DepartmentDashboard } from '../components/DepartmentDashboard';
import { DemoSimulationEngine } from '../components/DemoSimulationEngine';
import { AccidentWorkflowModal } from '../components/AccidentWorkflowModal';
import { JunctionTrafficReport } from '../components/JunctionTrafficReport';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [roads, setRoads] = useState<RoadSegment[]>([]);
  const [junctions, setJunctions] = useState<JunctionTrafficData[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [constructions, setConstructions] = useState<ConstructionProject[]>([]);
  const [kpis, setKpis] = useState<TrafficKpis>({
    activeIncidents: 2,
    congestedRoads: 4,
    averageCitySpeed: 32,
    roadsClosed: 0,
    activeConstruction: 2,
    averageCongestionPercentage: 58,
    emergencyIncidents: 1,
    affectedUsers: 8421,
    totalVehicleVolume: 45197030,
    twoWheelerCount: 17630421,
    threeWheelerCount: 9442899,
    fourWheelerCount: 18123710,
    lastUpdated: new Date().toISOString()
  });
  const [activeReroutePlan, setActiveReroutePlan] = useState<ReroutePlan | null>(null);
  const [showRerouteDrawer, setShowRerouteDrawer] = useState(false);
  const [selectedRoad, setSelectedRoad] = useState<RoadSegment | null>(null);
  const [simulatedIncident, setSimulatedIncident] = useState<Incident | null>(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();

    const socket = ApiService.getSocket();

    socket.on('traffic.init', (data) => {
      setRoads(data.roads || []);
      setJunctions(data.junctions || []);
      setIncidents(data.incidents || []);
      if (data.kpis) setKpis(data.kpis);
    });

    socket.on('traffic.updated', (data) => {
      if (data.roads) setRoads(data.roads);
    });

    socket.on('kpi.updated', (newKpis) => {
      setKpis(newKpis);
    });

    socket.on('incident.created', (data) => {
      setIncidents(prev => [data.incident, ...prev]);
    });

    socket.on('reroute.created', (data) => {
      setActiveReroutePlan(data.plan);
    });

    return () => {
      socket.off('traffic.init');
      socket.off('traffic.updated');
      socket.off('kpi.updated');
      socket.off('incident.created');
      socket.off('reroute.created');
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const live = await ApiService.getLiveTraffic();
      setRoads(live.roads || []);
      setJunctions(live.junctions || []);
      setIncidents(live.incidents || []);
      setConstructions(live.constructions || []);
      if (live.kpis) setKpis(live.kpis);

      const hist = await ApiService.getTrafficHistory();
      setHourlyData(hist.hourlyData || []);

      const logs = await ApiService.getAuditLogs();
      setAuditLogs(logs.auditLogs || []);
    } catch (e) {
      console.error('Failed to load live traffic:', e);
    }
  };

  const handleSimulateAccident = async () => {
    try {
      const res = await ApiService.simulateAccident();
      setSimulatedIncident(res.incident);
      setActiveReroutePlan(res.plan);
      setShowTimelineModal(true);
      setShowRerouteDrawer(true);
      fetchInitialData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCalculatePlan = async (roadId: string) => {
    const res = await ApiService.calculateReroute(roadId);
    setActiveReroutePlan(res.plan);
    setShowRerouteDrawer(true);
  };

  const handleApprovePlan = async (planId: string) => {
    const res = await ApiService.approveReroute(planId);
    setActiveReroutePlan(res.plan);
    fetchInitialData();
  };

  const handleToggleClosure = async (roadId: string, isClosed: boolean) => {
    await ApiService.toggleRoadClosure(roadId, isClosed, 'Administrative manual action');
    fetchInitialData();
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Bar */}
      <AdminTopBar
        kpis={kpis}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSimulateAccident={handleSimulateAccident}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 space-y-4 overflow-y-auto max-w-[calc(100vw-256px)]">
          {/* Live KPI Header Cards */}
          <KpiCardsSection kpis={kpis} />

          {/* SIH Judge Demo Simulation Bar */}
          <DemoSimulationEngine
            onSimulateAccident={handleSimulateAccident}
            onSimulateClosure={() => handleToggleClosure('road-mg-city', true)}
            onSimulateSurge={() => fetchInitialData()}
          />

          {/* Main Map & Live Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Interactive Map */}
            <div className="lg:col-span-8 h-[550px]">
              <IndoreMap
                roads={roads}
                junctions={junctions}
                incidents={incidents}
                constructions={constructions}
                activeAlternateRoutes={activeReroutePlan?.alternateRoutes || []}
                selectedRoad={selectedRoad}
                onSelectRoad={(road) => setSelectedRoad(road)}
                onBlockRoad={(id) => handleToggleClosure(id, true)}
                onGenerateReroute={(id) => handleCalculatePlan(id)}
              />
            </div>

            {/* Right Live Incident / Selected Road Panel */}
            <div className="lg:col-span-4 bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-xl h-[550px] overflow-y-auto">
              {selectedRoad ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-extrabold text-sm text-white">{selectedRoad.name}</h3>
                    <button onClick={() => setSelectedRoad(null)} className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded">
                      Back to Incidents
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Current Velocity</span>
                      <span className="text-base font-bold text-white">{selectedRoad.currentSpeed} km/h</span>
                      <span className="text-[10px] text-emerald-400 block">Free-flow: {selectedRoad.freeFlowSpeed} km/h</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Congestion Level</span>
                      <span className="text-base font-bold text-amber-400">{selectedRoad.congestionPercentage}%</span>
                      <span className="text-[10px] text-red-400 block">+{selectedRoad.congestionChangePercentage}% vs avg</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Road Type:</span>
                      <span className="font-bold text-white">{selectedRoad.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lanes & Width:</span>
                      <span className="font-bold text-white">{selectedRoad.lanes} Lanes ({selectedRoad.widthMeters}m)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Travel Time:</span>
                      <span className="font-bold text-white">{selectedRoad.travelTimeMinutes} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Historical Avg Time:</span>
                      <span className="font-bold text-slate-400">{selectedRoad.historicalTravelTimeMinutes} min</span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => handleToggleClosure(selectedRoad.id, !selectedRoad.isClosed)}
                      className={`w-full font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 ${
                        selectedRoad.isClosed ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
                      }`}
                    >
                      <span>{selectedRoad.isClosed ? 'OPEN ROAD DIVERSION' : 'BLOCK / CLOSE CORRIDOR'}</span>
                    </button>

                    <button
                      onClick={() => handleCalculatePlan(selectedRoad.id)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5"
                    >
                      <span>CALCULATE DYNAMIC REROUTE</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Live Incident Feed</h3>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {incidents.length} Active
                    </span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto max-h-[440px]">
                    {incidents.map((inc) => (
                      <div key={inc.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                            {inc.severity} • {inc.type}
                          </span>
                          <span className="text-[9px] text-slate-500">Active</span>
                        </div>
                        <h4 className="font-bold text-white">{inc.title}</h4>
                        <p className="text-[11px] text-slate-400">{inc.description}</p>
                        <p className="text-[10px] text-blue-400 font-semibold">{inc.roadName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reroute Engine Drawer */}
          {showRerouteDrawer && (
            <RerouteEngineDrawer
              plan={activeReroutePlan}
              roads={roads}
              onCalculatePlan={handleCalculatePlan}
              onApprovePlan={handleApprovePlan}
              onClose={() => setShowRerouteDrawer(false)}
            />
          )}

          {/* Traffic Analytics Delta Table */}
          <TrafficAnalyticsTable roads={roads} onSelectRoad={(r) => setSelectedRoad(r)} />

          {/* Official Vehicle Count Traffic Analysis Report Module */}
          <JunctionTrafficReport junctions={junctions} />

          {/* Predictive Traffic Engine Panel */}
          <PredictionPanel roads={roads} />

          {/* Department-Specific Dashboard */}
          <DepartmentDashboard
            role={user?.role || 'ADMIN'}
            roads={roads}
            incidents={incidents}
            constructions={constructions}
          />

          {/* Bottom Analytics & Hourly Speed Graphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
              <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">24-Hour Velocity & Congestion Profile</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData}>
                    <XAxis dataKey="hour" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="avgSpeed" stroke="#3B82F6" strokeWidth={3} name="Avg Speed (km/h)" />
                    <Line type="monotone" dataKey="avgCongestion" stroke="#EF4444" strokeWidth={2} name="Congestion (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
              <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Administrative Intervention Audit Logs</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-blue-400">{log.action}</span>
                      <p className="text-[11px] text-slate-300">{log.details}</p>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">{log.timestamp.slice(11, 19)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Accident Event Timeline Modal */}
      {showTimelineModal && (
        <AccidentWorkflowModal
          incident={simulatedIncident}
          plan={activeReroutePlan}
          onClose={() => setShowTimelineModal(false)}
        />
      )}
    </div>
  );
};
