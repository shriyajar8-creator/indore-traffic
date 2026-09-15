import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RoadSegment, Incident, ConstructionProject, AlternateRoute } from '../types';
import { mapService } from '../services/MapService';
import { AlertTriangle, Construction as ConstructionIcon, ShieldAlert, Navigation, Octagon, ArrowRight } from 'lucide-react';

// Fix default leaflet marker icon issue in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom incident icons
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

interface IndoreMapProps {
  roads: RoadSegment[];
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
  incidents,
  constructions,
  activeAlternateRoutes = [],
  selectedRoad,
  onSelectRoad,
  onBlockRoad,
  onGenerateReroute,
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
                      <span className="text-[10px] text-slate-400"> (Limit {road.speedLimit})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Congestion</span>
                      <span className="font-bold text-amber-400">{road.congestionPercentage}%</span>
                      <span className="text-[10px] text-red-400"> (+{road.congestionChangePercentage}%)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Travel Time</span>
                      <span className="font-bold text-white">{road.travelTimeMinutes} min</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Free-Flow Speed</span>
                      <span className="font-bold text-emerald-400">{road.freeFlowSpeed} km/h</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <button
                      onClick={() => onSelectRoad(road)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-1 px-2 rounded font-medium transition"
                    >
                      View Full Intelligence Panel
                    </button>
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Render Active Alternate Routes Overlay if executing Reroute */}
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
                <p className="text-[10px] text-emerald-400 font-bold mt-1">Saves 11 min over main corridor</p>
              </div>
            </Popup>
          </Polyline>
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
                <div className="text-[10px] text-slate-400">
                  <span>Lanes Affected: <strong className="text-white">{inc.affectedLanes}</strong></span>
                </div>
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
                <p className="text-[10px] text-amber-400 mt-1 font-semibold">Expected Delay: +{c.expectedDelayMinutes} mins</p>
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
      </div>
    </div>
  );
};
