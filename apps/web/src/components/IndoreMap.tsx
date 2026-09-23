import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup
} from 'react-leaflet';
import L from 'leaflet';
import {
  RoadSegment,
  Incident,
  ConstructionProject,
  AlternateRoute,
  JunctionTrafficData
} from '../types';
import { mapService } from '../services/MapService';
import {
  AlertTriangle,
  Construction as ConstructionIcon,
  Activity,
  BarChart3,
  X
} from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const createIncidentIcon = (
  severity: string,
  type: string
) => {
  const isAccident = type === 'ACCIDENT';

  const color =
    severity === 'CRITICAL'
      ? '#DC2626'
      : '#F59E0B';

  const iconHtml = `
    <div style="
      background:${color};
      width:28px;
      height:28px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      border:2px solid #ffffff;
      box-shadow:0 0 10px ${color};
      cursor:pointer;
    " class="pulse-critical">
      <span style="
        color:#fff;
        font-weight:bold;
        font-size:14px;
      ">
        ${isAccident ? '💥' : '⚠️'}
      </span>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-incident-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const createConstructionIcon = () => {
  const iconHtml = `
    <div style="
      background:#EA580C;
      width:26px;
      height:26px;
      border-radius:6px;
      display:flex;
      align-items:center;
      justify-content:center;
      border:2px solid #ffffff;
      box-shadow:0 0 8px #EA580C;
    ">
      <span style="
        color:#fff;
        font-size:13px;
      ">
        🏗️
      </span>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-construction-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

const createJunctionIcon = (level: string) => {
  let bgColor = '#EAB308';

  if (level === 'SEVERE') {
    bgColor = '#DC2626';
  } else if (level === 'HIGH') {
    bgColor = '#F97316';
  }

  const iconHtml = `
    <div style="
      background:${bgColor};
      width:24px;
      height:24px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      border:2px solid #ffffff;
      box-shadow:0 0 8px ${bgColor};
      font-size:10px;
      font-weight:bold;
      color:#fff;
    ">
      🚦
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-junction-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

import { GoogleMapContainer } from './GoogleMapContainer';

interface IndoreMapProps {
  roads: RoadSegment[];
  junctions?: JunctionTrafficData[];
  incidents: Incident[];
  constructions: ConstructionProject[];
  activeAlternateRoutes?: AlternateRoute[];
  selectedRoad: RoadSegment | null;
  onSelectRoad: (road: RoadSegment) => void;
  onBlockRoad?: (roadId: string) => void;
  onGenerateReroute?: (roadId: string) => void;
  provider?:
    | 'OpenStreetMap'
    | 'MapLibre'
    | 'Mapbox'
    | 'ArcGIS'
    | 'GoogleMaps';
  directionsRoute?: any;
  onMapClick?: (coords: {
    lat: number;
    lng: number;
  }) => void;
  osmItems?: any[];
}

export const IndoreMap: React.FC<IndoreMapProps> = ({
  roads,
  junctions = [],
  incidents,
  constructions,
  activeAlternateRoutes = [],
  selectedRoad,
  onSelectRoad,
  provider = 'OpenStreetMap',
  directionsRoute,
  onMapClick,
  osmItems = []
}) => {
  /*
   * ============================================================
   * COLLAPSIBLE TRAFFIC LEGEND
   * ============================================================
   *
   * The legend is hidden by default so that the map remains
   * fully visible.
   *
   * Users can click LEGEND whenever they need traffic-flow
   * information.
   */
  const [showTrafficLegend, setShowTrafficLegend] =
    useState(false);

  const apiKey = (
    process.env.FRONTEND_MAPS_API_KEY ||
    process.env.VITE_FRONTEND_MAPS_API_KEY ||
    ''
  ).trim();

  if (provider === 'GoogleMaps' && apiKey) {
    return (
      <div className="relative w-full h-full">
        <GoogleMapContainer
          roads={roads}
          junctions={junctions}
          incidents={incidents}
          constructions={constructions}
          activeAlternateRoutes={activeAlternateRoutes}
          selectedRoad={selectedRoad}
          onSelectRoad={onSelectRoad}
          center={{
            lat: 22.7177623,
            lng: 75.8585458
          }}
          zoom={16.75}
          directionsRoute={directionsRoute}
          onMapClick={onMapClick}
          osmItems={osmItems}
        />
      </div>
    );
  }

  const layerConfig =
    mapService.getLayerConfig(provider);

  const indoreCenter: [number, number] = [
    22.7196,
    75.8577
  ];

  return (
    <div className="relative isolate w-full h-full min-h-[520px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">

      {/* ========================================================
          LEAFLET MAP
      ======================================================== */}
      <MapContainer
        center={indoreCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution={layerConfig.attribution}
          url={layerConfig.tileUrl}
          maxZoom={layerConfig.maxZoom}
        />

        {/* ======================================================
            RENDER ROAD NETWORK POLYLINES
        ====================================================== */}
        {roads.map((road) => {
          const isSelected =
            selectedRoad?.id === road.id;

          const strokeColor = road.isClosed
            ? '#991B1B'
            : mapService.getTrafficColor(
                road.status,
                road.congestionPercentage
              );

          return (
            <Polyline
              key={road.id}
              positions={road.coordinates}
              pathOptions={{
                color: strokeColor,
                weight: isSelected
                  ? 8
                  : road.isClosed
                  ? 6
                  : 5,
                opacity: road.isClosed
                  ? 0.9
                  : 0.85,
                dashArray: road.isClosed
                  ? '8, 8'
                  : undefined
              }}
              eventHandlers={{
                click: () => onSelectRoad(road)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[220px]">

                  <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">

                    <h3 className="font-bold text-sm text-white">
                      {road.name}
                    </h3>

                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      style={{
                        backgroundColor:
                          `${strokeColor}33`,
                        color: strokeColor
                      }}
                    >
                      {road.isClosed
                        ? 'CLOSED'
                        : road.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">

                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        Speed
                      </span>

                      <span className="font-bold text-white">
                        {road.currentSpeed} km/h
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        Congestion
                      </span>

                      <span className="font-bold text-amber-400">
                        {road.congestionPercentage}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      onSelectRoad(road)
                    }
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-1 px-2 rounded font-medium transition"
                  >
                    View Full Intelligence Panel
                  </button>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* ======================================================
            PRIMARY SELECTED DIRECTIONS ROUTE
        ====================================================== */}
        {(() => {
          const pts: [number, number][] =
            directionsRoute?.pathPoints ||
            directionsRoute?.routes?.[0]?.pathPoints ||
            directionsRoute?.coordinates ||
            [];

          if (pts.length === 0) {
            return null;
          }

          const startPt = pts[0];
          const endPt =
            pts[pts.length - 1];

          return (
            <>
              <Polyline
                positions={pts}
                pathOptions={{
                  color: '#10B981',
                  weight: 8,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[180px]">

                    <span className="font-bold text-xs text-emerald-400">
                      Selected Commuter Route
                    </span>

                    <p className="text-[11px] text-slate-300">
                      Optimal path calculated for active navigation
                    </p>
                  </div>
                </Popup>
              </Polyline>

              {startPt && (
                <Marker position={startPt}>
                  <Popup>
                    <div className="text-xs font-bold text-emerald-400">
                      📍 Origin Point
                    </div>
                  </Popup>
                </Marker>
              )}

              {endPt && (
                <Marker position={endPt}>
                  <Popup>
                    <div className="text-xs font-bold text-blue-400">
                      🏁 Destination Point
                    </div>
                  </Popup>
                </Marker>
              )}
            </>
          );
        })()}

        {/* ======================================================
            ALTERNATE ROUTES
        ====================================================== */}
        {activeAlternateRoutes.map(
          (route, idx) => (
            <Polyline
              key={`alt-route-${route.id || idx}`}
              positions={route.coordinates}
              pathOptions={{
                color: route.isRecommended
                  ? '#10B981'
                  : '#3B82F6',
                weight: 6,
                dashArray: '10, 6',
                opacity: 0.95
              }}
            >
              <Popup>
                <div className="p-1">

                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    {route.routeName}
                  </span>

                  <p className="text-xs text-slate-200 mt-1">
                    {route.recommendationReason}
                  </p>
                </div>
              </Popup>
            </Polyline>
          )
        )}

        {/* ======================================================
            OFFICIAL JUNCTION MARKERS
        ====================================================== */}
        {junctions.map((j) => (
          <Marker
            key={j.id}
            position={[
              j.coordinates.lat,
              j.coordinates.lng
            ]}
            icon={createJunctionIcon(
              j.congestionLevel
            )}
          >
            <Popup>
              <div className="p-1 min-w-[210px] space-y-1.5">

                <div className="flex items-center justify-between border-b border-slate-700 pb-1">

                  <h4 className="font-bold text-xs text-white">
                    {j.junctionName} Junction
                  </h4>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      j.congestionLevel === 'SEVERE'
                        ? 'bg-red-600 text-white'
                        : j.congestionLevel ===
                          'HIGH'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}
                  >
                    {j.congestionLevel}
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 font-mono">
                  Period: {j.period}
                </p>

                <div className="bg-slate-900 p-2 rounded text-xs space-y-1 border border-slate-800">

                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      Peak Hour Avg:
                    </span>

                    <span className="font-extrabold text-amber-400">
                      {j.peakHourAvg.toLocaleString()} veh/hr
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">
                      Total Count:
                    </span>

                    <span className="font-bold text-white">
                      {j.totalVehicles.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-1 text-[9px] text-center border-t border-slate-800">

                    <div>
                      <span className="text-emerald-400 block font-bold">
                        2W
                      </span>

                      <span className="text-slate-300">
                        {(
                          j.twoWheelerCount /
                          1000
                        ).toFixed(0)}
                        k
                      </span>
                    </div>

                    <div>
                      <span className="text-amber-400 block font-bold">
                        3W
                      </span>

                      <span className="text-slate-300">
                        {(
                          j.threeWheelerCount /
                          1000
                        ).toFixed(0)}
                        k
                      </span>
                    </div>

                    <div>
                      <span className="text-blue-400 block font-bold">
                        4W
                      </span>

                      <span className="text-slate-300">
                        {(
                          j.fourWheelerCount /
                          1000
                        ).toFixed(0)}
                        k
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ======================================================
            INCIDENT MARKERS
        ====================================================== */}
        {incidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[
              inc.location.lat,
              inc.location.lng
            ]}
            icon={createIncidentIcon(
              inc.severity,
              inc.type
            )}
          >
            <Popup>
              <div className="p-1 min-w-[200px]">

                <div className="flex items-center space-x-1.5 text-red-400 font-bold text-xs mb-1">

                  <AlertTriangle className="w-4 h-4" />

                  <span>
                    {inc.title}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-2">
                  {inc.description}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ======================================================
            CONSTRUCTION MARKERS
        ====================================================== */}
        {constructions.map((c) => (
          <Marker
            key={c.id}
            position={[
              c.location.lat,
              c.location.lng
            ]}
            icon={createConstructionIcon()}
          >
            <Popup>
              <div className="p-1 min-w-[190px]">

                <div className="flex items-center space-x-1.5 text-orange-400 font-bold text-xs mb-1">

                  <ConstructionIcon className="w-4 h-4" />

                  <span>
                    {c.projectName}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300">
                  Contractor: {c.contractorDepartment}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ========================================================
          COLLAPSIBLE TRAFFIC FLOW LEGEND
      ======================================================== */}

      {!showTrafficLegend ? (

        /*
         * COLLAPSED STATE
         *
         * Only a small button remains on the map.
         */
        <button
          type="button"
          onClick={() =>
            setShowTrafficLegend(true)
          }
          aria-label="Open traffic flow legend"
          className="
            absolute
            top-3
            right-3
            z-[30]
            flex
            items-center
            gap-2
            px-3
            py-2
            rounded-lg
            bg-slate-950/90
            border
            border-slate-700
            text-slate-200
            text-[11px]
            font-bold
            shadow-xl
            backdrop-blur-md
            hover:bg-slate-900
            hover:border-slate-500
            transition-all
          "
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />

          <span>LEGEND</span>
        </button>

      ) : (

        /*
         * EXPANDED STATE
         */
        <div
          className="
            absolute
            top-3
            right-3
            z-[30]
            w-[220px]
            rounded-xl
            bg-slate-950/95
            border
            border-slate-700
            shadow-2xl
            backdrop-blur-md
            overflow-hidden
          "
        >

          {/* Legend Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800">

            <div className="flex items-center gap-2">

              <BarChart3 className="w-4 h-4 text-emerald-400" />

              <span className="text-[10px] font-extrabold text-slate-200 uppercase tracking-wider">
                Traffic Flow
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowTrafficLegend(false)
              }
              aria-label="Close traffic flow legend"
              className="
                w-6
                h-6
                rounded-md
                flex
                items-center
                justify-center
                text-slate-400
                hover:text-white
                hover:bg-slate-800
                transition
              "
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Legend Items */}
          <div className="p-3 space-y-2">

            <div className="flex items-center space-x-2">

              <span className="w-3 h-1.5 rounded bg-emerald-500 flex-shrink-0" />

              <span className="text-slate-200 text-[11px]">
                Free Flow (&lt;35%)
              </span>
            </div>

            <div className="flex items-center space-x-2">

              <span className="w-3 h-1.5 rounded bg-yellow-500 flex-shrink-0" />

              <span className="text-slate-200 text-[11px]">
                Moderate (35-54%)
              </span>
            </div>

            <div className="flex items-center space-x-2">

              <span className="w-3 h-1.5 rounded bg-orange-500 flex-shrink-0" />

              <span className="text-slate-200 text-[11px]">
                Heavy (55-69%)
              </span>
            </div>

            <div className="flex items-center space-x-2">

              <span className="w-3 h-1.5 rounded bg-red-500 flex-shrink-0" />

              <span className="text-slate-200 text-[11px]">
                Severe (70-84%)
              </span>
            </div>

            <div className="flex items-center space-x-2">

              <span className="w-3 h-1.5 rounded bg-red-800 flex-shrink-0" />

              <span className="text-slate-200 text-[11px]">
                Critical / Blocked (85%+)
              </span>
            </div>

            {/* Junction Information */}
            <div className="pt-2 mt-1 border-t border-slate-700/80 flex items-center space-x-1.5">

              <span className="text-sm">
                🚦
              </span>

              <span className="text-[10px] text-amber-300 font-semibold">
                13 Official Audit Junctions
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
