import React, { useState, useEffect } from 'react';
import { RoadSegment, Incident, ConstructionProject, TrafficKpis, ReroutePlan, SystemNotification, JunctionTrafficData } from '../types';
import { ApiService } from '../services/api';
import { AdminTopBar, DashboardRole } from '../components/AdminTopBar';
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
import { IncidentsTab } from '../components/tabs/IncidentsTab';
import { AccidentsTab } from '../components/tabs/AccidentsTab';
import { RoadClosuresTab } from '../components/tabs/RoadClosuresTab';
import { ConstructionTab } from '../components/tabs/ConstructionTab';
import { RoadNetworkTab } from '../components/tabs/RoadNetworkTab';
import { EmergencyTab } from '../components/tabs/EmergencyTab';
import { ReportsLogsTab } from '../components/tabs/ReportsLogsTab';
import { SettingsTab } from '../components/tabs/SettingsTab';
import { useAuth } from '../context/AuthContext';
import { Siren, Shield, Briefcase, Zap, AlertCircle } from 'lucide-react';
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
  const [activeRole, setActiveRole] = useState<DashboardRole>('EXECUTIVE');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [osmItems, setOsmItems] = useState<any[]>([]);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);

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

    socket.on('traffic.snapshot', (data) => {
      setAnalyticsData(data);
    });

    return () => {
      socket.off('traffic.init');
      socket.off('traffic.updated');
      socket.off('kpi.updated');
      socket.off('incident.created');
      socket.off('traffic.snapshot');
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

      const analytics = await ApiService.getAnalyticsData();
      setAnalyticsData(analytics);

      const osm = await ApiService.getOsmConstruction();
      setOsmItems(osm.items || []);
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

  const handleCreateIncident = async (incidentData: any) => {
    await ApiService.createIncident(incidentData);
    fetchInitialData();
  };

  const handleUpdateIncidentStatus = async (id: string, status: string) => {
    await ApiService.updateIncidentStatus(id, status);
    fetchInitialData();
  };

  const handleDeleteIncident = async (id: string) => {
    await ApiService.deleteIncident(id);
    fetchInitialData();
  };

  const handleEditIncident = async (id: string, updates: any) => {
    await ApiService.updateIncident(id, updates);
    fetchInitialData();
  };


  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0B0F19] text-slate-100' : 'bg-slate-950 text-slate-100'} flex flex-col font-sans select-none overflow-x-hidden transition-colors`}>
      {/* Top Command Bar */}
      <AdminTopBar
        kpis={kpis}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <AdminSidebar 
          activeTab={activeTab} 
          onSelectTab={setActiveTab} 
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 md:p-4 space-y-4 overflow-y-auto w-full md:max-w-[calc(100vw-256px)]">

          {/* Upper Section Header Cards - Only shown on Dashboard and Analytics tabs */}
          {(activeTab === 'dashboard' || activeTab === 'analytics') && (
            <KpiCardsSection kpis={kpis} />
          )}

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (

            <div className="space-y-4">
              {/* Main Map & Live Incident Feed Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 h-[580px]">
                  <IndoreMap
                    roads={roads}
                    junctions={junctions}
                    incidents={incidents}
                    constructions={constructions}
                    activeAlternateRoutes={[]}
                    selectedRoad={selectedRoad}
                    onSelectRoad={(road) => setSelectedRoad(road)}
                    onBlockRoad={(id) => handleToggleClosure(id, true)}
                  />
                </div>

                <div className="lg:col-span-4 bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-xl h-[580px] overflow-y-auto">
                  {selectedRoad ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="font-extrabold text-sm text-white">{selectedRoad.name}</h3>
                        <button onClick={() => setSelectedRoad(null)} className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded">
                          Back to Feed
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
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => handleToggleClosure(selectedRoad.id, !selectedRoad.isClosed)}
                          className={`w-full font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 ${
                            selectedRoad.isClosed ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
                          }`}
                        >
                          <span>{selectedRoad.isClosed ? 'OPEN ROAD' : 'BLOCK / CLOSE CORRIDOR'}</span>
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

                      <div className="space-y-2.5 overflow-y-auto max-h-[470px]">
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

              {/* Traffic Change Analytics Table */}
              <TrafficAnalyticsTable roads={roads} onSelectRoad={(r) => setSelectedRoad(r)} />
            </div>
          )}

          {/* TAB: INCIDENTS & ACCIDENTS */}
          {activeTab === 'incidents' && (
            <IncidentsTab
              incidents={incidents}
              roads={roads}
              onCreateIncident={handleCreateIncident}
              onUpdateStatus={handleUpdateIncidentStatus}
              onDeleteIncident={handleDeleteIncident}
              onEditIncident={handleEditIncident}
            />
          )}

          {/* TAB: ROAD CLOSURES */}
          {activeTab === 'closures' && (
            <RoadClosuresTab
              roads={roads}
              onToggleClosure={handleToggleClosure}
            />
          )}

          {/* TAB: CONSTRUCTION */}
          {activeTab === 'construction' && (
            <ConstructionTab
              constructions={constructions}
              roads={roads}
            />
          )}

          {/* TAB: PREDICTIONS */}
          {activeTab === 'predictions' && (
            <PredictionPanel roads={roads} />
          )}

          {/* TAB: ROAD NETWORK */}
          {activeTab === 'network' && (
            <RoadNetworkTab roads={roads} />
          )}

          {/* TAB: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <DepartmentDashboard
              role={user?.role || 'ADMIN'}
              roads={roads}
              incidents={incidents}
              constructions={constructions}
            />
          )}

          {/* TAB: EMERGENCY RESPONSE */}
          {activeTab === 'emergency' && (
            <EmergencyTab incidents={incidents} />
          )}

          {/* TAB: REPORTS & LOGS */}
          {activeTab === 'reports' && (
            <ReportsLogsTab auditLogs={auditLogs} onRefreshLogs={fetchInitialData} />
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === 'analytics' && (
            <JunctionTrafficReport 
              junctions={junctions} 
              analyticsData={analyticsData}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {/* TAB: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsTab />
          )}
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
