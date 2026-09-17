import React, { useState, useEffect } from 'react';
import { RoadSegment, Incident, AlternateRoute, SystemNotification } from '../types';
import { IndoreMap } from './IndoreMap';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { 
  Search, 
  Navigation, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  GitFork, 
  CheckCircle2, 
  Bell, 
  Sparkles, 
  ShieldAlert, 
  Camera, 
  Send, 
  Moon, 
  Sun 
} from 'lucide-react';

const INDORE_HUBS = [
  'Vijay Nagar Square',
  'Palasia Square',
  'Rajwada City Center',
  'Bhawarkuan Square',
  'LIG Square',
  'Geeta Bhawan Square',
  'Indore Railway Station',
  'Indore Airport (IDR)',
  'Super Corridor'
];

interface CivilianAppProps {
  roads: RoadSegment[];
  incidents: Incident[];
  notifications: SystemNotification[];
  junctions?: any[];
  constructions?: any[];
}

export const CivilianApp: React.FC<CivilianAppProps> = ({ 
  roads, 
  incidents, 
  notifications,
  junctions = [],
  constructions = []
}) => {
  const { user, quickLogin } = useAuth();
  const [origin, setOrigin] = useState('Vijay Nagar Square');
  const [destination, setDestination] = useState('Rajwada City Center');
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [autoRerouteEnabled, setAutoRerouteEnabled] = useState(true);
  const [activeAlert, setActiveAlert] = useState<SystemNotification | null>(null);
  const [toastBanner, setToastBanner] = useState<string | null>(null);
  const [showRerouteModal, setShowRerouteModal] = useState(false);
  const [routeSwitched, setRouteSwitched] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('ACCIDENT');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSubmittedSuccess, setReportSubmittedSuccess] = useState(false);

  // Live Synchronized State
  const [liveRoads, setLiveRoads] = useState<RoadSegment[]>(roads);
  const [liveIncidents, setLiveIncidents] = useState<Incident[]>(incidents);
  const [liveNotifications, setLiveNotifications] = useState<SystemNotification[]>(notifications);

  useEffect(() => {
    setLiveRoads(roads);
    setLiveIncidents(incidents);
    setLiveNotifications(notifications);
  }, [roads, incidents, notifications]);

  // Route Planner & Directions State
  const [directionsData, setDirectionsData] = useState<any>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [loadingDirections, setLoadingDirections] = useState(false);

  const fetchDirectionsRoute = async (origStr: string, destStr: string) => {
    if (!origStr || !destStr) return;
    setLoadingDirections(true);
    setDirectionsError(null);

    try {
      const data = await ApiService.getDirections(origStr, destStr);
      setDirectionsData(data);
    } catch (err: any) {
      console.error('Failed to fetch directions route:', err);
      setDirectionsError(err.message || 'Failed to query directions engine');
      setDirectionsData(null);
    } finally {
      setLoadingDirections(false);
    }
  };

  const refreshLiveData = async () => {
    try {
      const data = await ApiService.getLiveTraffic();
      if (data.roads) setLiveRoads(data.roads);
      if (data.incidents) setLiveIncidents(data.incidents);
      const notifRes = await fetch('/api/notifications');
      const notifData = await notifRes.json();
      if (notifData.notifications) setLiveNotifications(notifData.notifications);
    } catch (err) {
      console.error('Error refreshing live traffic data:', err);
    }
  };

  // Initial Route Fetch & 10s Live Sync Polling
  useEffect(() => {
    fetchDirectionsRoute(origin, destination);
    refreshLiveData();

    const pollInterval = setInterval(() => {
      refreshLiveData();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleRoutePlannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRouteSwitched(false);
    fetchDirectionsRoute(origin, destination);
  };

  const handleSelectOrigin = (hub: string) => {
    setOrigin(hub);
    setShowOriginSuggestions(false);
    setRouteSwitched(false);
    fetchDirectionsRoute(hub, destination);
  };

  const handleSelectDest = (hub: string) => {
    setDestination(hub);
    setShowDestSuggestions(false);
    setRouteSwitched(false);
    fetchDirectionsRoute(origin, hub);
  };

  // Real-time Socket Listener for Admin Sync & Live Alerts
  useEffect(() => {
    const socket = ApiService.getSocket();

    socket.on('traffic.init', (data: any) => {
      if (data.roads) setLiveRoads(data.roads);
      if (data.incidents) setLiveIncidents(data.incidents);
      if (data.notifications) setLiveNotifications(data.notifications);
    });

    socket.on('traffic.updated', (data: any) => {
      if (data.roads) setLiveRoads(data.roads);
    });

    socket.on('alert.broadcast', (data: { notification: SystemNotification }) => {
      setActiveAlert(data.notification);
      setToastBanner(`🚨 DEPT ADVISORY: ${data.notification.title} - ${data.notification.message}`);
      setShowRerouteModal(true);
      if (autoRerouteEnabled) {
        setRouteSwitched(true);
      }
      refreshLiveData();
    });

    socket.on('road.closed', (data: any) => {
      setToastBanner(`⚠️ TRAFFIC ALERT: Corridor Blocked by Authority. Auto-Reroute active.`);
      setShowRerouteModal(true);
      if (autoRerouteEnabled) {
        setRouteSwitched(true);
      }
      refreshLiveData();
    });

    socket.on('road.opened', () => {
      setToastBanner(`✅ ROAD REOPENED: Corridor clear for traffic flow.`);
      refreshLiveData();
    });

    socket.on('incident.created', (data: any) => {
      setToastBanner(`🚨 LIVE INCIDENT: ${data.incident?.title || 'Obstacle reported on corridor'}`);
      refreshLiveData();
    });

    socket.on('incident.updated', () => {
      refreshLiveData();
    });

    socket.on('incident.deleted', () => {
      refreshLiveData();
    });

    return () => {
      socket.off('traffic.init');
      socket.off('traffic.updated');
      socket.off('alert.broadcast');
      socket.off('road.closed');
      socket.off('road.opened');
      socket.off('incident.created');
      socket.off('incident.updated');
      socket.off('incident.deleted');
    };
  }, [autoRerouteEnabled]);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiService.submitCivilianReport({
        incidentType: reportType,
        description: reportDesc,
        roadName: origin || 'AB Road Corridor',
        location: { lat: 22.7420, lng: 75.8900 }
      });
      setReportSubmittedSuccess(true);
      refreshLiveData();
      setTimeout(() => {
        setReportSubmittedSuccess(false);
        setShowReportModal(false);
        setReportDesc('');
      }, 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const activeAlternateCoordinates: [number, number][] = [
    [22.7533, 75.8937],
    [22.7400, 75.9450],
    [22.7200, 75.9130],
    [22.7196, 75.8577]
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Realtime Alert Banner Toast */}
      {toastBanner && (
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between shadow-xl z-40 animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{toastBanner}</span>
          </div>
          <button onClick={() => setToastBanner(null)} className="text-white hover:text-slate-200 text-xs font-black">✕</button>
        </div>
      )}

      {/* Civilian Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-2">
          <img src="/gatiraksha-logo.png" alt="GatiRaksha Logo" className="w-8 h-8 rounded-lg border border-emerald-500/40 object-cover shadow-md" />
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-wide uppercase font-sans flex items-center gap-1.5">
              <span className="text-emerald-400">GatiRaksha</span> Companion
            </h1>
            <p className="text-[10px] text-slate-400">Smart Commuter Navigation & Live Incident Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              window.location.hash = '';
              await quickLogin('ADMIN');
            }}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold shadow"
          >
            Switch to Admin Command Center
          </button>
          <button 
            onClick={() => setShowReportModal(true)}
            className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 shadow"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Incident</span>
          </button>
        </div>
      </header>

      {/* Main Civilian Navigation Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 relative">
        {/* Floating Route & Navigation Drawer (Left Overlay) */}
        <div className="md:col-span-4 lg:col-span-3 bg-slate-900/95 border-r border-slate-800 p-4 space-y-4 z-20 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Search inputs & Route Planner Form with Autocomplete */}
            <form onSubmit={handleRoutePlannerSubmit} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3 shadow-inner relative">
              <div className="relative">
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => { setOrigin(e.target.value); setShowOriginSuggestions(true); }}
                    onFocus={() => setShowOriginSuggestions(true)}
                    className="w-full bg-transparent border-b border-slate-800 focus:outline-none focus:border-emerald-500 pb-1 text-white font-semibold"
                    placeholder="Origin location (e.g. Vijay Nagar Square)"
                  />
                </div>
                {showOriginSuggestions && (
                  <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 max-h-36 overflow-y-auto divide-y divide-slate-800 text-xs">
                    {INDORE_HUBS.filter(h => h.toLowerCase().includes(origin.toLowerCase())).map((hub, idx) => (
                      <div key={idx} onClick={() => handleSelectOrigin(hub)} className="p-2 hover:bg-slate-800 cursor-pointer text-white">
                        {hub}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <Navigation className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => { setDestination(e.target.value); setShowDestSuggestions(true); }}
                    onFocus={() => setShowDestSuggestions(true)}
                    className="w-full bg-transparent border-b border-slate-800 focus:outline-none focus:border-blue-500 pb-1 text-white font-semibold"
                    placeholder="Destination location (e.g. Rajwada)"
                  />
                </div>
                {showDestSuggestions && (
                  <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 max-h-36 overflow-y-auto divide-y divide-slate-800 text-xs">
                    {INDORE_HUBS.filter(h => h.toLowerCase().includes(destination.toLowerCase())).map((hub, idx) => (
                      <div key={idx} onClick={() => handleSelectDest(hub)} className="p-2 hover:bg-slate-800 cursor-pointer text-white">
                        {hub}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loadingDirections}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-lg shadow transition flex items-center justify-center space-x-2 uppercase"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{loadingDirections ? 'Calculating Live Route...' : 'Find Optimal Route'}</span>
              </button>
            </form>

            {/* Error Banner when API call fails */}
            {directionsError && (
              <div className="bg-red-950/60 border border-red-500/50 p-3 rounded-xl text-xs space-y-1">
                <div className="flex items-center space-x-2 text-red-400 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Google Maps API Error</span>
                </div>
                <p className="text-red-300 text-[11px] font-mono">{directionsError}</p>
              </div>
            )}

            {/* Auto-Reroute Setting Toggle */}
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <GitFork className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="font-bold text-white block">Auto Reroute</span>
                  <span className="text-[10px] text-slate-400">Switch route automatically on block</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoRerouteEnabled}
                onChange={(e) => setAutoRerouteEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Civilian Primary Route Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">YOUR ROUTE</span>
                <span className="text-xs font-bold text-emerald-400 truncate max-w-[160px]">{origin} → {destination}</span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-white font-sans">
                    {directionsData?.duration_in_traffic?.text || directionsData?.duration?.text || (routeSwitched ? '18 min' : '24 min')}
                  </span>
                  <span className="text-xs text-slate-400 block">
                    {directionsData?.distance?.text || (routeSwitched ? '6.2 km (Via Eastern Bypass)' : '8.7 km (Via AB Road)')}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold ${routeSwitched ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {routeSwitched ? 'LOW TRAFFIC' : 'MODERATE TRAFFIC'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {directionsData?.duration ? `Base ETA: ${directionsData.duration.text}` : (routeSwitched ? 'Optimized Alternate' : '+7 min delay')}
                  </span>
                </div>
              </div>

              {/* Active Incident Warning Badge */}
              {liveIncidents.some(i => i.status === 'ACTIVE') && (
                <div className="bg-amber-500/10 border border-amber-500/40 p-2.5 rounded-lg flex items-center space-x-2 text-xs text-amber-400">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-pulse" />
                  <span>Active obstacle / construction zone reported on corridor.</span>
                </div>
              )}

              {/* Alternate Route Suggestion Badge */}
              {!routeSwitched ? (

                <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 block">ALTERNATE ROUTE</span>
                    <span className="text-[11px] text-slate-300">ETA: 18 min • Low Traffic</span>
                  </div>
                  <button
                    onClick={() => setRouteSwitched(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] py-1.5 px-3 rounded-lg shadow uppercase"
                  >
                    SAVE 6 MIN
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg flex items-center space-x-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Switched to optimal alternate route via Eastern Bypass.</span>
                </div>
              )}
            </div>

            {/* Active Notifications Drawer */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Route Alerts</span>
              </h3>
              {liveNotifications.slice(0, 4).map((n) => (
                <div key={n.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">{n.title}</span>
                    <span className="text-[9px] text-slate-500">Just now</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{n.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Connected to Google Maps Platform API Core
          </div>
        </div>

        {/* Map Display View */}
        <div className="md:col-span-8 lg:col-span-9 h-[calc(100vh-61px)]">
          <IndoreMap
            provider="GoogleMaps"
            roads={liveRoads}
            incidents={liveIncidents}
            constructions={[]}
            directionsRoute={directionsData?.routes?.[0]}
            activeAlternateRoutes={routeSwitched ? [{
              id: 'alt-civ-1',
              routeName: 'Eastern Bypass Alternate Route',
              distanceKm: 6.2,
              estimatedTimeMinutes: 18,
              congestionPercentage: 25,
              capacityPercentage: 90,
              affectedUsersEstimate: 2000,
              viaRoads: ['Eastern Bypass'],
              isRecommended: true,
              recommendationReason: 'Authority Diversion Active',
              coordinates: activeAlternateCoordinates
            }] : []}
            selectedRoad={null}
            onSelectRoad={() => {}}
          />
        </div>
      </div>


      {/* Real-time Reroute Alert Modal */}
      {showRerouteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-bounce-short">
            <div className="flex items-center space-x-3 text-red-400 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">🚨 ROAD CLOSURE ALERT</h3>
                <p className="text-xs text-red-400">Critical Incident Reported Ahead</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Authorities have reported a critical collision on AB Road. Your current route is affected. Alternative route found via Eastern Bypass.
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Previous ETA:</span>
                <span className="font-bold text-red-400 line-through">29 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">New Optimal ETA:</span>
                <span className="font-extrabold text-emerald-400 text-sm">18 min (Save 11 min)</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => {
                  setRouteSwitched(true);
                  setShowRerouteModal(false);
                }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg uppercase"
              >
                SWITCH TO ALTERNATE ROUTE
              </button>
              <button
                onClick={() => setShowRerouteModal(false)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Civilian Incident Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white">Report Road Hazard to Authorities</h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            {reportSubmittedSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-sm text-white">Report Submitted to Verification Queue!</h4>
                <p className="text-xs text-slate-400">Traffic police officers will inspect and update the live network.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hazard Category</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                  >
                    <option value="ACCIDENT">Accident / Collision</option>
                    <option value="TRAFFIC_JAM">Severe Unannounced Jam</option>
                    <option value="ROAD_BLOCKAGE">Debris / Road Blockage</option>
                    <option value="WATERLOGGING">Waterlogging / Flooding</option>
                    <option value="VEHICLE_BREAKDOWN">Stalled Vehicle</option>
                    <option value="OTHER">Other Hazard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Description / Location Details</label>
                  <textarea
                    rows={3}
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Describe obstacle, affected lanes, or landmarks..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowReportModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center space-x-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
