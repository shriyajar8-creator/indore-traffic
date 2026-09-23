import React, { useState, useEffect, useRef } from 'react';
import {
  RoadSegment,
  Incident,
  AlternateRoute,
  SystemNotification
} from '../types';
import { IndoreMap } from './IndoreMap';
import { useAuth } from '../context/AuthContext';
import { ApiService, API_BASE } from '../services/api';
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
  LogOut,
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
  const { user, logout } = useAuth();

  const [origin, setOrigin] = useState('Vijay Nagar Square');
  const [destination, setDestination] = useState(
    'Rajwada City Center'
  );

  const [showOriginSuggestions, setShowOriginSuggestions] =
    useState(false);
  const [showDestSuggestions, setShowDestSuggestions] =
    useState(false);

  const [autoRerouteEnabled, setAutoRerouteEnabled] =
    useState(true);

  const [activeAlert, setActiveAlert] =
    useState<SystemNotification | null>(null);

  const [toastBanner, setToastBanner] =
    useState<string | null>(null);

  const [showRerouteModal, setShowRerouteModal] =
    useState(false);

  const [routeSwitched, setRouteSwitched] =
    useState(false);

  /*
   * Dynamic real-time alert information.
   */
  const [alertRoadName, setAlertRoadName] =
    useState<string | null>(null);

  const [alertReason, setAlertReason] =
    useState<string | null>(null);

  const [alertTitle, setAlertTitle] =
    useState('ROAD CLOSURE ALERT');

  const [alertMessage, setAlertMessage] = useState(
    'Authorities have reported a road closure affecting your route.'
  );

  const [showReportModal, setShowReportModal] =
    useState(false);

  const [reportType, setReportType] =
    useState('ACCIDENT');

  const [reportDesc, setReportDesc] =
    useState('');

  const [reportSubmittedSuccess, setReportSubmittedSuccess] =
    useState(false);

  // Live Synchronized State
  const [liveRoads, setLiveRoads] =
    useState<RoadSegment[]>(roads);

  const [liveIncidents, setLiveIncidents] =
    useState<Incident[]>(incidents);

  const [liveNotifications, setLiveNotifications] =
    useState<SystemNotification[]>(notifications);

  /*
   * Keep latest Auto Reroute setting available to
   * Socket.IO listeners.
   */
  const autoRerouteRef =
    useRef(autoRerouteEnabled);

  /*
   * Prevent duplicate alerts because backend can send:
   *
   * road.closed
   * alert.broadcast
   */
  const lastRealtimeAlertRef =
    useRef<string | null>(null);

  useEffect(() => {
    autoRerouteRef.current =
      autoRerouteEnabled;
  }, [autoRerouteEnabled]);

  useEffect(() => {
    setLiveRoads(roads);
    setLiveIncidents(incidents);
    setLiveNotifications(notifications);
  }, [roads, incidents, notifications]);

  // Route Planner & Directions State
  const [directionsData, setDirectionsData] =
    useState<any>(null);

  const [directionsError, setDirectionsError] =
    useState<string | null>(null);

  const [loadingDirections, setLoadingDirections] =
    useState(false);

  const fetchDirectionsRoute = async (
    origStr: string,
    destStr: string
  ) => {
    if (!origStr || !destStr) return;

    setLoadingDirections(true);
    setDirectionsError(null);

    try {
      const data =
        await ApiService.getDirections(
          origStr,
          destStr
        );

      setDirectionsData(data);
    } catch (err: any) {
      console.error(
        'Failed to fetch directions route:',
        err
      );

      setDirectionsError(
        err.message ||
          'Failed to query directions engine'
      );

      setDirectionsData(null);
    } finally {
      setLoadingDirections(false);
    }
  };

  const refreshLiveData = async () => {
    try {
      const data =
        await ApiService.getLiveTraffic();

      if (data.roads) {
        setLiveRoads(data.roads);
      }

      if (data.incidents) {
        setLiveIncidents(data.incidents);
      }

      const notifRes =
        await fetch(
          `${API_BASE}/notifications`
        );

      if (notifRes.ok) {
        const notifData =
          await notifRes.json();

        if (notifData.notifications) {
          setLiveNotifications(
            notifData.notifications
          );
        }
      }
    } catch (err) {
      console.error(
        'Error refreshing live traffic data:',
        err
      );
    }
  };

  // Initial Route Fetch & Backup Live Sync Polling
  useEffect(() => {
    fetchDirectionsRoute(
      origin,
      destination
    );

    refreshLiveData();

    /*
     * Socket.IO handles immediate alerts.
     * Polling remains as backup synchronization.
     */
    const pollInterval =
      setInterval(() => {
        refreshLiveData();
      }, 5000);

    return () =>
      clearInterval(pollInterval);
  }, []);

  const handleRoutePlannerSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setRouteSwitched(false);

    fetchDirectionsRoute(
      origin,
      destination
    );
  };

  const handleSelectOrigin = (
    hub: string
  ) => {
    setOrigin(hub);
    setShowOriginSuggestions(false);
    setRouteSwitched(false);

    fetchDirectionsRoute(
      hub,
      destination
    );
  };

  const handleSelectDest = (
    hub: string
  ) => {
    setDestination(hub);
    setShowDestSuggestions(false);
    setRouteSwitched(false);

    fetchDirectionsRoute(
      origin,
      hub
    );
  };

  /*
   * ============================================================
   * REAL-TIME ADMIN -> USER SOCKET.IO SYSTEM
   * ============================================================
   *
   * ADMIN DEVICE
   *      ↓
   * POST /api/closures
   *      ↓
   * RENDER BACKEND
   *      ↓
   * Socket.IO
   *      ↓
   * USER DEVICE
   *      ↓
   * Immediate Alert
   */

  useEffect(() => {
    const socket =
      ApiService.getSocket();

    const showRealtimeAlert = ({
      title,
      message,
      roadName,
      reason,
      notification,
      alertKey,
      shouldReroute = true
    }: {
      title: string;
      message: string;
      roadName?: string;
      reason?: string;
      notification?: SystemNotification;
      alertKey: string;
      shouldReroute?: boolean;
    }) => {
      /*
       * Ignore duplicate delivery.
       */
      if (
        lastRealtimeAlertRef.current ===
        alertKey
      ) {
        return;
      }

      lastRealtimeAlertRef.current =
        alertKey;

      if (notification) {
        setActiveAlert(notification);
      }

      setAlertTitle(title);
      setAlertMessage(message);
      setAlertRoadName(
        roadName || null
      );
      setAlertReason(
        reason || null
      );

      setToastBanner(
        roadName
          ? `${title}: ${roadName}${
              reason
                ? ` — ${reason}`
                : ''
            }`
          : message
      );

      if (shouldReroute) {
        setShowRerouteModal(true);

        if (autoRerouteRef.current) {
          setRouteSwitched(true);
        }
      }
    };

    /*
     * Initial synchronization.
     */
    socket.on(
      'traffic.init',
      (data: any) => {
        if (data.roads) {
          setLiveRoads(data.roads);
        }

        if (data.incidents) {
          setLiveIncidents(
            data.incidents
          );
        }

        if (data.notifications) {
          setLiveNotifications(
            data.notifications
          );
        }
      }
    );

    /*
     * General traffic updates.
     */
    socket.on(
      'traffic.updated',
      (data: any) => {
        if (data.roads) {
          setLiveRoads(data.roads);
        }
      }
    );

    /*
     * General alert broadcast.
     */
    socket.on(
      'alert.broadcast',
      (data: {
        notification: SystemNotification;
      }) => {
        const notification =
          data?.notification;

        if (!notification) {
          return;
        }

        const roadName =
          notification.affectedRoadId ||
          'Affected corridor';

        const alertKey =
          notification.id ||
          `${notification.title}-${
            notification.message
          }-${
            notification.affectedRoadId ||
            ''
          }`;

        /*
         * Avoid duplicate display.
         */
        if (
          lastRealtimeAlertRef.current ===
          alertKey
        ) {
          refreshLiveData();
          return;
        }

        showRealtimeAlert({
          title:
            notification.title ||
            'TRAFFIC ALERT',

          message:
            notification.message ||
            'Authorities have issued a live traffic alert.',

          roadName,

          reason:
            notification.message,

          notification,

          alertKey,

          shouldReroute:
            notification.type ===
              'CRITICAL' ||
            notification.type ===
              'HIGH'
        });

        refreshLiveData();
      }
    );

    /*
     * ============================================================
     * ADMIN CLOSED ROAD
     * ============================================================
     */
    socket.on(
      'road.closed',
      (data: any) => {
        const roadId =
          data?.roadId ||
          data?.road?.id ||
          '';

        const roadName =
          data?.road?.name ||
          data?.roadName ||
          data?.notification
            ?.affectedRoadId ||
          roadId ||
          'Road';

        const reason =
          data?.reason ||
          data?.notification
            ?.message ||
          'Road closed by authorities';

        const notification =
          data?.notification as
            | SystemNotification
            | undefined;

        const alertKey =
          notification?.id ||
          `road-closed-${roadId}-${roadName}-${reason}`;

        /*
         * Update road state immediately.
         */
        if (data?.road) {
          setLiveRoads(
            (currentRoads) => {
              const exists =
                currentRoads.some(
                  (road) =>
                    road.id ===
                    data.road.id
                );

              if (!exists) {
                return currentRoads;
              }

              return currentRoads.map(
                (road) =>
                  road.id ===
                  data.road.id
                    ? {
                        ...road,
                        ...data.road,
                        isClosed: true
                      }
                    : road
              );
            }
          );
        }

        showRealtimeAlert({
          title: 'ROAD CLOSED',

          message:
            data?.notification
              ?.message ||
            `${roadName} has been closed by traffic authorities.`,

          roadName,

          reason,

          notification,

          alertKey,

          shouldReroute: true
        });

        refreshLiveData();
      }
    );

    /*
     * Admin reopened a road.
     */
    socket.on(
      'road.opened',
      (data: any) => {
        const roadName =
          data?.road?.name ||
          data?.roadName ||
          data?.roadId ||
          'Road';

        const reason =
          data?.reason ||
          'Road reopened by authorities';

        setToastBanner(
          `ROAD REOPENED: ${roadName} — ${reason}`
        );

        setActiveAlert(null);
        setAlertRoadName(null);
        setAlertReason(null);

        refreshLiveData();
      }
    );

    /*
     * New incident created.
     */
    socket.on(
      'incident.created',
      (data: any) => {
        const inc =
          data?.incident;

        if (!inc) {
          return;
        }

        if (data?.notification) {
          refreshLiveData();
          return;
        }

        const title =
          inc.title ||
          'Live Incident Reported';

        const roadName =
          inc.roadName ||
          inc.roadId ||
          'Affected corridor';

        const locStr =
          inc.location &&
          typeof inc.location.lat ===
            'number' &&
          typeof inc.location.lng ===
            'number'
            ? ` (${inc.location.lat.toFixed(
                4
              )}, ${inc.location.lng.toFixed(
                4
              )})`
            : '';

        const message =
          inc.description ||
          `${title} reported on ${roadName}.`;

        const alertKey =
          `incident-${
            inc.id ||
            `${title}-${roadName}`
          }`;

        showRealtimeAlert({
          title:
            inc.severity ===
              'CRITICAL' ||
            inc.severity === 'HIGH'
              ? 'CRITICAL INCIDENT'
              : 'LIVE INCIDENT',

          message:
            `${message}${locStr}`,

          roadName,

          reason:
            inc.description ||
            undefined,

          alertKey,

          shouldReroute:
            inc.severity ===
              'CRITICAL' ||
            inc.severity === 'HIGH'
        });

        refreshLiveData();
      }
    );

    /*
     * Existing incident updated.
     */
    socket.on(
      'incident.updated',
      (data: any) => {
        const inc =
          data?.incident;

        if (!inc) {
          return;
        }

        if (
          inc.status ===
          'RESOLVED'
        ) {
          setToastBanner(
            `RESOLVED: ${
              inc.title ||
              'Incident'
            } on ${
              inc.roadName ||
              'corridor'
            } cleared by authorities`
          );
        } else {
          setToastBanner(
            `UPDATED INCIDENT: ${
              inc.title ||
              'Incident update'
            } on ${
              inc.roadName ||
              'corridor'
            }`
          );
        }

        refreshLiveData();
      }
    );

    /*
     * Incident deleted.
     */
    socket.on(
      'incident.deleted',
      () => {
        setToastBanner(
          'INCIDENT REMOVED: Incident record cleared by authority'
        );

        refreshLiveData();
      }
    );

    /*
     * Cleanup.
     */
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
  }, []);

  const handleReportSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await ApiService.submitCivilianReport(
        {
          incidentType: reportType,

          description: reportDesc,

          roadName:
            origin ||
            'Road Corridor',

          location: {
            lat: 22.7420,
            lng: 75.8900
          }
        }
      );

      setReportSubmittedSuccess(
        true
      );

      refreshLiveData();

      setTimeout(() => {
        setReportSubmittedSuccess(
          false
        );

        setShowReportModal(false);
        setReportDesc('');
      }, 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const activeAlternateCoordinates:
    [number, number][] = [
      [22.7533, 75.8937],
      [22.7400, 75.9450],
      [22.7200, 75.9130],
      [22.7196, 75.8577]
    ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">

      {/* ============================================================
          REAL-TIME ALERT BANNER
      ============================================================ */}

      {toastBanner && (
        <div className="sticky top-0 z-40 px-3 pt-2 pointer-events-none">

          <div className="mx-auto max-w-5xl bg-slate-950/95 backdrop-blur-md border border-red-500/50 rounded-xl shadow-2xl overflow-hidden pointer-events-auto">

            <div className="flex items-center gap-3 px-4 py-3">

              {/* Alert Icon */}
              <div className="w-9 h-9 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>

              {/* Alert Content */}
              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-2 mb-0.5">

                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400">
                    LIVE TRAFFIC ALERT
                  </span>

                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                    REAL-TIME
                  </span>

                </div>

                <p className="text-xs sm:text-sm text-white font-semibold truncate">
                  {toastBanner}
                </p>

              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() =>
                  setToastBanner(null)
                }
                aria-label="Dismiss traffic alert"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition flex-shrink-0"
              >
                ✕
              </button>

            </div>

            {/* Live Indicator */}
            <div className="h-0.5 bg-gradient-to-r from-red-500 via-amber-400 to-red-500" />

          </div>
        </div>
      )}

      {/* Civilian Top Bar */}

      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">

        <div className="flex items-center space-x-2">

          <img
            src="/gatiraksha-logo.png"
            alt="GatiRaksha Logo"
            className="w-8 h-8 rounded-lg border border-emerald-500/40 object-cover shadow-md"
          />

          <div>

            <h1 className="font-extrabold text-sm text-white tracking-wide uppercase font-sans flex items-center gap-1.5">

              <span className="text-emerald-400">
                GatiRaksha
              </span>

              Companion

            </h1>

            <p className="text-[10px] text-slate-400">
              Smart Commuter Navigation & Live Incident Platform
            </p>

          </div>

        </div>

        <div className="flex items-center space-x-3">

          <button
            onClick={() =>
              setShowReportModal(true)
            }
            className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 shadow"
          >

            <AlertTriangle className="w-3.5 h-3.5" />

            <span>
              Report Incident
            </span>

          </button>

          <button
            type="button"
            onClick={logout}
            className="text-xs bg-slate-800 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 shadow border border-slate-700 hover:border-red-500 transition"
            title="Logout"
          >

            <LogOut className="w-3.5 h-3.5" />

            <span>
              Logout
            </span>

          </button>

        </div>

      </header>

      {/* Main Civilian Navigation Grid */}

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 relative">

        {/* Floating Route & Navigation Drawer */}

        <div className="md:col-span-4 lg:col-span-3 bg-slate-900/95 border-r border-slate-800 p-4 space-y-4 z-20 flex flex-col justify-between overflow-y-auto">

          <div className="space-y-4">

            {/* Route Planner */}

            <form
              onSubmit={
                handleRoutePlannerSubmit
              }
              className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3 shadow-inner relative"
            >

              {/* Origin */}

              <div className="relative">

                <div className="flex items-center space-x-2 text-xs text-slate-300">

                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />

                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => {
                      setOrigin(
                        e.target.value
                      );
                      setShowOriginSuggestions(
                        true
                      );
                    }}
                    onFocus={() =>
                      setShowOriginSuggestions(
                        true
                      )
                    }
                    className="w-full bg-transparent border-b border-slate-800 focus:outline-none focus:border-emerald-500 pb-1 text-white font-semibold"
                    placeholder="Origin location (e.g. Vijay Nagar Square)"
                  />

                </div>

                {showOriginSuggestions && (
                  <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 max-h-36 overflow-y-auto divide-y divide-slate-800 text-xs">

                    {INDORE_HUBS
                      .filter((h) =>
                        h
                          .toLowerCase()
                          .includes(
                            origin.toLowerCase()
                          )
                      )
                      .map(
                        (
                          hub,
                          idx
                        ) => (
                          <div
                            key={idx}
                            onClick={() =>
                              handleSelectOrigin(
                                hub
                              )
                            }
                            className="p-2 hover:bg-slate-800 cursor-pointer text-white"
                          >
                            {hub}
                          </div>
                        )
                      )}

                  </div>
                )}

              </div>

              {/* Destination */}

              <div className="relative">

                <div className="flex items-center space-x-2 text-xs text-slate-300">

                  <Navigation className="w-4 h-4 text-blue-400 flex-shrink-0" />

                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => {
                      setDestination(
                        e.target.value
                      );
                      setShowDestSuggestions(
                        true
                      );
                    }}
                    onFocus={() =>
                      setShowDestSuggestions(
                        true
                      )
                    }
                    className="w-full bg-transparent border-b border-slate-800 focus:outline-none focus:border-blue-500 pb-1 text-white font-semibold"
                    placeholder="Destination location (e.g. Rajwada)"
                  />

                </div>

                {showDestSuggestions && (
                  <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 max-h-36 overflow-y-auto divide-y divide-slate-800 text-xs">

                    {INDORE_HUBS
                      .filter((h) =>
                        h
                          .toLowerCase()
                          .includes(
                            destination.toLowerCase()
                          )
                      )
                      .map(
                        (
                          hub,
                          idx
                        ) => (
                          <div
                            key={idx}
                            onClick={() =>
                              handleSelectDest(
                                hub
                              )
                            }
                            className="p-2 hover:bg-slate-800 cursor-pointer text-white"
                          >
                            {hub}
                          </div>
                        )
                      )}

                  </div>
                )}

              </div>

              <button
                type="submit"
                disabled={
                  loadingDirections
                }
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-lg shadow transition flex items-center justify-center space-x-2 uppercase"
              >

                <Search className="w-3.5 h-3.5" />

                <span>
                  {loadingDirections
                    ? 'Calculating Live Route...'
                    : 'Find Optimal Route'}
                </span>

              </button>

            </form>

            {/* Directions Error */}

            {directionsError && (
              <div className="bg-red-950/60 border border-red-500/50 p-3 rounded-xl text-xs space-y-1">

                <div className="flex items-center space-x-2 text-red-400 font-bold">

                  <ShieldAlert className="w-4 h-4" />

                  <span>
                    Google Maps API Error
                  </span>

                </div>

                <p className="text-red-300 text-[11px] font-mono">
                  {directionsError}
                </p>

              </div>
            )}

            {/* Auto Reroute */}

            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">

              <div className="flex items-center space-x-2">

                <GitFork className="w-4 h-4 text-purple-400" />

                <div>

                  <span className="font-bold text-white block">
                    Auto Reroute
                  </span>

                  <span className="text-[10px] text-slate-400">
                    Switch route automatically on block
                  </span>

                </div>

              </div>

              <input
                type="checkbox"
                checked={
                  autoRerouteEnabled
                }
                onChange={(e) =>
                  setAutoRerouteEnabled(
                    e.target.checked
                  )
                }
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />

            </div>

            {/* Primary Route Card */}

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">

                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  YOUR ROUTE
                </span>

                <span className="text-xs font-bold text-emerald-400 truncate max-w-[160px]">
                  {origin} → {destination}
                </span>

              </div>

              <div className="flex items-baseline justify-between">

                <div>

                  <span className="text-2xl font-black text-white font-sans">

                    {directionsData?.duration_in_traffic?.text ||
                      directionsData?.duration?.text ||
                      (routeSwitched
                        ? '18 min'
                        : '24 min')}

                  </span>

                  <span className="text-xs text-slate-400 block">

                    {directionsData?.distance?.text ||
                      (routeSwitched
                        ? '6.2 km (Via Eastern Bypass)'
                        : '8.7 km (Via AB Road)')}

                  </span>

                </div>

                <div className="text-right">

                  <span
                    className={`text-xs font-bold ${
                      routeSwitched
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >

                    {routeSwitched
                      ? 'LOW TRAFFIC'
                      : 'MODERATE TRAFFIC'}

                  </span>

                  <span className="text-[10px] text-slate-400 block">

                    {directionsData?.duration
                      ? `Base ETA: ${directionsData.duration.text}`
                      : routeSwitched
                      ? 'Optimized Alternate'
                      : '+7 min delay'}

                  </span>

                </div>

              </div>

              {/* Active Incident */}

              {liveIncidents.some(
                (i) =>
                  i.status ===
                  'ACTIVE'
              ) && (
                <div className="bg-amber-500/10 border border-amber-500/40 p-2.5 rounded-lg flex items-center space-x-2 text-xs text-amber-400">

                  <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-pulse" />

                  <span>
                    Active obstacle / construction zone reported on corridor.
                  </span>

                </div>
              )}

              {/* Alternate Route */}

              {!routeSwitched ? (
                <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-lg flex items-center justify-between">

                  <div>

                    <span className="text-xs font-bold text-emerald-400 block">
                      ALTERNATE ROUTE
                    </span>

                    <span className="text-[11px] text-slate-300">
                      ETA: 18 min • Low Traffic
                    </span>

                  </div>

                  <button
                    onClick={() =>
                      setRouteSwitched(
                        true
                      )
                    }
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] py-1.5 px-3 rounded-lg shadow uppercase"
                  >
                    SAVE 6 MIN
                  </button>

                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg flex items-center space-x-2 text-xs text-emerald-400">

                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />

                  <span>
                    Switched to optimal alternate route via Eastern Bypass.
                  </span>

                </div>
              )}

            </div>

            {/* Live Alerts */}

            <div className="space-y-2">

              <div className="flex items-center justify-between">

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">

                  <Bell className="w-3.5 h-3.5 text-amber-400" />

                  <span>
                    Live Route Alerts
                  </span>

                </h3>

                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  REAL-TIME SYNC
                </span>

              </div>

              {liveNotifications.length === 0 &&
              liveIncidents.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center text-xs text-slate-500">
                  No active incidents or advisories. Corridors clear.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">

                  {/* Notifications */}

                  {liveNotifications
                    .slice(0, 5)
                    .map((n) => {

                      const isResolved =
                        n.title.includes(
                          'RESOLVED'
                        ) ||
                        n.title.includes(
                          'REOPENED'
                        ) ||
                        n.status ===
                          'RESOLVED';

                      return (
                        <div
                          key={n.id}
                          className={`border p-3 rounded-xl text-xs space-y-1.5 transition-all ${
                            isResolved
                              ? 'bg-emerald-950/20 border-emerald-500/40'
                              : n.type ===
                                'CRITICAL'
                              ? 'bg-red-950/40 border-red-500/50'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >

                          <div className="flex items-center justify-between">

                            <span
                              className={`font-bold ${
                                isResolved
                                  ? 'text-emerald-400'
                                  : n.type ===
                                    'CRITICAL'
                                  ? 'text-red-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {n.title}
                            </span>

                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border ${
                                isResolved
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              }`}
                            >
                              {isResolved
                                ? 'RESOLVED'
                                : 'ACTIVE'}
                            </span>

                          </div>

                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {n.message}
                          </p>

                          <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-800/60">

                            <span>
                              Corridor:{' '}
                              {n.affectedRoadId ||
                                'Citywide'}
                            </span>

                            <span>
                              {n.timestamp
                                ? n.timestamp.slice(
                                    11,
                                    16
                                  )
                                : 'Just now'}
                            </span>

                          </div>

                        </div>
                      );
                    })}

                  {/* Incidents */}

                  {liveIncidents
                    .filter(
                      (inc) =>
                        !liveNotifications.some(
                          (n) =>
                            n.incidentId ===
                            inc.id
                        )
                    )
                    .slice(0, 3)
                    .map((inc) => {

                      const isResolved =
                        inc.status ===
                        'RESOLVED';

                      return (
                        <div
                          key={inc.id}
                          className={`border p-3 rounded-xl text-xs space-y-1.5 transition-all ${
                            isResolved
                              ? 'bg-emerald-950/20 border-emerald-500/40'
                              : inc.severity ===
                                'CRITICAL'
                              ? 'bg-red-950/40 border-red-500/50'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >

                          <div className="flex items-center justify-between">

                            <span className="font-bold text-white flex items-center gap-1">

                              <span className="text-amber-400">
                                {inc.type}:
                              </span>

                              {inc.title}

                            </span>

                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border ${
                                isResolved
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              }`}
                            >
                              {inc.status}
                            </span>

                          </div>

                          <p className="text-slate-300 text-[11px]">
                            {inc.description}
                          </p>

                          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800/60">

                            <span className="font-mono text-blue-400">

                              {inc.roadName} (
                              {inc.location?.lat?.toFixed(
                                4
                              )}
                              ,{' '}
                              {inc.location?.lng?.toFixed(
                                4
                              )}
                              )

                            </span>

                            <span className="font-bold uppercase text-amber-400">
                              {inc.severity}
                            </span>

                          </div>

                        </div>
                      );
                    })}

                </div>
              )}

            </div>

          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Connected to Google Maps Platform API Core
          </div>

        </div>

        {/* Map */}

        <div className="md:col-span-8 lg:col-span-9 h-full min-h-0">

          <IndoreMap
            provider="GoogleMaps"
            roads={liveRoads}
            incidents={liveIncidents}
            constructions={[]}
            directionsRoute={
              directionsData?.routes?.[0]
            }
            activeAlternateRoutes={
              routeSwitched
                ? [
                    {
                      id: 'alt-civ-1',

                      routeName:
                        'Eastern Bypass Alternate Route',

                      distanceKm: 6.2,

                      estimatedTimeMinutes: 18,

                      congestionPercentage: 25,

                      capacityPercentage: 90,

                      affectedUsersEstimate: 2000,

                      viaRoads: [
                        'Eastern Bypass'
                      ],

                      isRecommended: true,

                      recommendationReason:
                        'Authority Diversion Active',

                      coordinates:
                        activeAlternateCoordinates
                    }
                  ]
                : []
            }
            selectedRoad={null}
            onSelectRoad={() => {}}
          />

        </div>

      </div>

      {/* ============================================================
          REAL-TIME DYNAMIC REROUTE ALERT MODAL
      ============================================================ */}

      {showRerouteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-slate-900 border border-red-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-bounce-short">

            {/* Header */}

            <div className="flex items-center space-x-3 text-red-400 border-b border-slate-800 pb-3">

              <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center">

                <ShieldAlert className="w-6 h-6 animate-pulse" />

              </div>

              <div>

                <h3 className="font-extrabold text-base text-white">
                  🚨 {alertTitle}
                </h3>

                <p className="text-xs text-red-400">
                  LIVE AUTHORITY ALERT
                </p>

              </div>

            </div>

            {/* Dynamic Road Name */}

            {alertRoadName && (
              <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-3">

                <span className="text-[10px] text-red-400 uppercase font-bold tracking-wider">
                  AFFECTED ROAD
                </span>

                <p className="text-white text-base font-extrabold mt-1">
                  {alertRoadName}
                </p>

              </div>
            )}

            {/* Dynamic Message */}

            <p className="text-xs text-slate-300 leading-relaxed">
              {alertMessage}
            </p>

            {/* Dynamic Reason */}

            {alertReason && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">

                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  REASON / AUTHORITY MESSAGE
                </span>

                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {alertReason}
                </p>

              </div>
            )}

            {/* Route Information */}

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">

              <div className="flex justify-between">

                <span className="text-slate-400">
                  Current Route:
                </span>

                <span className="font-bold text-red-400">
                  Affected
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-400">
                  Auto Reroute:
                </span>

                <span
                  className={`font-bold ${
                    autoRerouteEnabled
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {autoRerouteEnabled
                    ? 'ENABLED'
                    : 'MANUAL'}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-400">
                  Alternate Route:
                </span>

                <span className="font-extrabold text-emerald-400">
                  Available
                </span>

              </div>

            </div>

            {/* Actions */}

            <div className="flex space-x-2 pt-2">

              <button
                onClick={() => {
                  setRouteSwitched(
                    true
                  );

                  setShowRerouteModal(
                    false
                  );

                  setToastBanner(
                    alertRoadName
                      ? `Alternate route activated. Avoid ${alertRoadName}.`
                      : 'Alternate route activated.'
                  );
                }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg uppercase"
              >
                SWITCH TO ALTERNATE ROUTE
              </button>

              <button
                onClick={() =>
                  setShowRerouteModal(
                    false
                  )
                }
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

              <h3 className="font-extrabold text-sm text-white">
                Report Road Hazard to Authorities
              </h3>

              <button
                onClick={() =>
                  setShowReportModal(
                    false
                  )
                }
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>

            </div>

            {reportSubmittedSuccess ? (
              <div className="py-6 text-center space-y-2">

                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />

                <h4 className="font-bold text-sm text-white">
                  Report Submitted to Verification Queue!
                </h4>

                <p className="text-xs text-slate-400">
                  Traffic police officers will inspect and update the live network.
                </p>

              </div>
            ) : (
              <form
                onSubmit={
                  handleReportSubmit
                }
                className="space-y-3 text-xs"
              >

                <div>

                  <label className="block text-slate-300 font-semibold mb-1">
                    Hazard Category
                  </label>

                  <select
                    value={reportType}
                    onChange={(e) =>
                      setReportType(
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                  >

                    <option value="ACCIDENT">
                      Accident / Collision
                    </option>

                    <option value="TRAFFIC_JAM">
                      Severe Unannounced Jam
                    </option>

                    <option value="ROAD_BLOCKAGE">
                      Debris / Road Blockage
                    </option>

                    <option value="WATERLOGGING">
                      Waterlogging / Flooding
                    </option>

                    <option value="VEHICLE_BREAKDOWN">
                      Stalled Vehicle
                    </option>

                    <option value="OTHER">
                      Other Hazard
                    </option>

                  </select>

                </div>

                <div>

                  <label className="block text-slate-300 font-semibold mb-1">
                    Description / Location Details
                  </label>

                  <textarea
                    rows={3}
                    value={reportDesc}
                    onChange={(e) =>
                      setReportDesc(
                        e.target.value
                      )
                    }
                    placeholder="Describe obstacle, affected lanes, or landmarks..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                    required
                  />

                </div>

                <div className="pt-2 flex justify-end space-x-2">

                  <button
                    type="button"
                    onClick={() =>
                      setShowReportModal(
                        false
                      )
                    }
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center space-x-1.5"
                  >

                    <Send className="w-3.5 h-3.5" />

                    <span>
                      Submit Report
                    </span>

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