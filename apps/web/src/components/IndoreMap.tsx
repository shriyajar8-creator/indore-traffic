import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { RoadSegment, Incident, ConstructionProject, AlternateRoute, JunctionTrafficData } from '../types';
import { mapService } from '../services/MapService';
import { AlertTriangle, Construction as ConstructionIcon, Activity } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createIncidentIcon = (severity: string, type: string) => {
  const isAccident = type === 'ACCIDENT';
  const color = severity === 'CRITICAL' ? '#DC2626' : '#F59E0B';
  const iconHtml = `
    <div style="background:${color}; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #ffffff; box-shadow:0 0 10px ${color}; cursor:pointer;" class="pulse-critical">
      <span style="color:#fff; font-weight:bold; font-size:14px;">${isAccident ? '💥' : '⚠️'}</span>
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
    <div style="background:#EA580C; width:26px; height:26px; border-radius:6px; display:flex; align-items:center; justify-content:center; border:2px solid #ffffff; box-shadow:0 0 8px #EA580C;">
      <span style="color:#fff; font-size:13px;">🏗️</span>
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
  let bgColor = '#EAB308'; // Moderate Yellow
  if (level === 'SEVERE') bgColor = '#DC2626'; // Severe Red
  else if (level === 'HIGH') bgColor = '#F97316'; // High Orange

  const iconHtml = `
    <div style="background:${bgColor}; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #ffffff; box-shadow:0 0 8px ${bgColor}; font-size:10px; font-weight:bold; color:#fff;">
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
  provider?: 'OpenStreetMap' | 'MapLibre' | 'Mapbox' | 'ArcGIS';
}

export const IndoreMap: React.FC<IndoreMapProps> = ({
  roads,
  junctions = [],
  incidents,
  constructions,
  activeAlternateRoutes = [],
  selectedRoad,
  onSelectRoad,
  provider = 'OpenStreetMap'
}) => {
  const layerConfig = mapService.getLayerConfig(provider);
  const indoreCenter: [number, number] = [22.7196, 75.8577];

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
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

        {/* Render Road Network Polylines */}
        {roads.map((road) => {
          const isSelected = selectedRoad?.id === road.id;
          const strokeColor = road.isClosed ? '#991B1B' : mapService.getTrafficColor(road.status, road.congestionPercentage);

          return (
            <Polyline
              key={road.id}
              positions={road.coordinates}
              pathOptions={{
                color: strokeColor,
                weight: isSelected ? 8 : (road.isClosed ? 6 : 5),
                opacity: road.isClosed ? 0.9 : 0.85,
                dashArray: road.isClosed ? '8, 8' : undefined
              }}
              eventHandlers={{
                click: () => onSelectRoad(road)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
                    <h3 className="font-bold text-sm text-white">{road.name}</h3>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      style={{ backgroundColor: `${strokeColor}33`, color: strokeColor }}
                    >
                      {road.isClosed ? 'CLOSED' : road.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Speed</span>
                      <span className="font-bold text-white">{road.currentSpeed} km/h</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Congestion</span>
                      <span className="font-bold text-amber-400">{road.congestionPercentage}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectRoad(road)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-1 px-2 rounded font-medium transition"
                  >
                    View Full Intelligence Panel
                  </button>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Render Alternate Routes Overlay */}
        {activeAlternateRoutes.map((route, idx) => (
          <Polyline
            key={`alt-route-${route.id || idx}`}
            positions={route.coordinates}
            pathOptions={{
              color: route.isRecommended ? '#10B981' : '#3B82F6',
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
                <p className="text-xs text-slate-200 mt-1">{route.recommendationReason}</p>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Render Official Multi-Junction Markers */}
        {junctions.map((j) => (
          <Marker
            key={j.id}
            position={[j.coordinates.lat, j.coordinates.lng]}
            icon={createJunctionIcon(j.congestionLevel)}
          >
            <Popup>
              <div className="p-1 min-w-[210px] space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                  <h4 className="font-bold text-xs text-white">{j.junctionName} Junction</h4>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    j.congestionLevel === 'SEVERE' ? 'bg-red-600 text-white' : 
                    j.congestionLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {j.congestionLevel}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Period: {j.period}</p>
                <div className="bg-slate-900 p-2 rounded text-xs space-y-1 border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Peak Hour Avg:</span>
                    <span className="font-extrabold text-amber-400">{j.peakHourAvg.toLocaleString()} veh/hr</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Total Count:</span>
                    <span className="font-bold text-white">{j.totalVehicles.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1 text-[9px] text-center border-t border-slate-800">
                    <div>
                      <span className="text-emerald-400 block font-bold">2W</span>
                      <span className="text-slate-300">{(j.twoWheelerCount / 1000).toFixed(0)}k</span>
                    </div>
                    <div>
                      <span className="text-amber-400 block font-bold">3W</span>
                      <span className="text-slate-300">{(j.threeWheelerCount / 1000).toFixed(0)}k</span>
                    </div>
                    <div>
                      <span className="text-blue-400 block font-bold">4W</span>
                      <span className="text-slate-300">{(j.fourWheelerCount / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Incident Markers */}
        {incidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.location.lat, inc.location.lng]}
            icon={createIncidentIcon(inc.severity, inc.type)}
          >
            <Popup>
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center space-x-1.5 text-red-400 font-bold text-xs mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{inc.title}</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">{inc.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Construction Markers */}
        {constructions.map((c) => (
          <Marker
            key={c.id}
            position={[c.location.lat, c.location.lng]}
            icon={createConstructionIcon()}
          >
            <Popup>
              <div className="p-1 min-w-[190px]">
                <div className="flex items-center space-x-1.5 text-orange-400 font-bold text-xs mb-1">
                  <ConstructionIcon className="w-4 h-4" />
                  <span>{c.projectName}</span>
                </div>
                <p className="text-[11px] text-slate-300">Contractor: {c.contractorDepartment}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Control HUD Overlay */}
      <div className="absolute top-3 right-3 z-[400] glass-panel px-3 py-2 rounded-lg text-xs space-y-1.5 select-none shadow-xl border border-slate-700">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Traffic Flow Legend</div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-1.5 rounded bg-emerald-500"></span>
          <span className="text-slate-200 text-[11px]">Free Flow (&lt;35%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-1.5 rounded bg-yellow-500"></span>
          <span className="text-slate-200 text-[11px]">Moderate (35-54%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-1.5 rounded bg-orange-500"></span>
          <span className="text-slate-200 text-[11px]">Heavy (55-69%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-1.5 rounded bg-red-500"></span>
          <span className="text-slate-200 text-[11px]">Severe (70-84%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-1.5 rounded bg-red-800"></span>
          <span className="text-slate-200 text-[11px]">Critical / Blocked (85%+)</span>
        </div>
        <div className="pt-1 border-t border-slate-700/80 flex items-center space-x-1 text-[10px] text-amber-300 font-semibold">
          <span>🚦 = 13 Official Audit Junctions</span>
        </div>
      </div>
    </div>
  );
};
