import React, { useEffect, useRef, useState } from 'react';
import { RoadSegment, Incident, ConstructionProject, AlternateRoute, JunctionTrafficData } from '../types';
import { AlertCircle, Layers, MapPin, TrafficCone } from 'lucide-react';

interface GoogleMapContainerProps {
  roads?: RoadSegment[];
  junctions?: JunctionTrafficData[];
  incidents?: Incident[];
  constructions?: ConstructionProject[];
  activeAlternateRoutes?: AlternateRoute[];
  selectedRoad?: RoadSegment | null;
  onSelectRoad?: (road: RoadSegment) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  directionsRoute?: any;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  osmItems?: any[];
}

declare global {
  interface Window {
    google: any;
    initGoogleMapsPromise?: Promise<void>;
  }
}

export const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }

  if (window.initGoogleMapsPromise) {
    return window.initGoogleMapsPromise;
  }

  window.initGoogleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('google-maps-js-api');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-js-api';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return window.initGoogleMapsPromise;
};

export const GoogleMapContainer: React.FC<GoogleMapContainerProps> = ({
  roads = [],
  junctions = [],
  incidents = [],
  constructions = [],
  activeAlternateRoutes = [],
  selectedRoad,
  onSelectRoad,
  center = { lat: 22.7177623, lng: 75.8585458 },
  zoom = 16.75,
  directionsRoute,
  onMapClick,
  osmItems = []
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const onMapClickRef = useRef(onMapClick);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  const [mapLoaded, setMapLoaded] = useState(false);

  const [trafficEnabled, setTrafficEnabled] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const apiKey = (process.env.FRONTEND_MAPS_API_KEY || process.env.VITE_FRONTEND_MAPS_API_KEY || '').trim();

  useEffect(() => {
    if (!apiKey) {
      setLoadError('FRONTEND_MAPS_API_KEY is not configured in .env file.');
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (!mapRef.current) return;
        if (!mapInstanceRef.current) {
          const mapOptions = {
            center,
            zoom,
            mapTypeId: 'roadmap',
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
              { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1f2d4d' }] },
              { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c456b' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] }
            ],
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true
          };

          const map = new window.google.maps.Map(mapRef.current, mapOptions);
          mapInstanceRef.current = map;

          // Enable TrafficLayer on Google Map
          const trafficLayer = new window.google.maps.TrafficLayer();
          trafficLayer.setMap(map);
          trafficLayerRef.current = trafficLayer;

          infoWindowRef.current = new window.google.maps.InfoWindow();

          // Map Click Location Picker for Admin Mode
          map.addListener('click', (e: any) => {
            if (onMapClickRef.current && e.latLng) {
              onMapClickRef.current({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            }
          });

          setMapLoaded(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load Google Maps JavaScript API:', err);
        setLoadError('Failed to load Google Maps JS API. Check your FRONTEND_MAPS_API_KEY restriction / billing.');
      });
  }, [apiKey]);

  // Toggle Traffic Layer
  useEffect(() => {
    if (trafficLayerRef.current && mapInstanceRef.current) {
      trafficLayerRef.current.setMap(trafficEnabled ? mapInstanceRef.current : null);
    }
  }, [trafficEnabled]);

  // Update Center / Zoom
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.panTo(center);
      if (zoom) mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  // Render Incident Markers, OSM items & Directions Route
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google) return;

    // Clear old markers & polylines
    markersRef.current.forEach(m => m.setMap(null));
    polylinesRef.current.forEach(p => p.setMap(null));
    markersRef.current = [];
    polylinesRef.current = [];

    const map = mapInstanceRef.current;
    const infoWindow = infoWindowRef.current;

    // Add Incident Markers
    incidents.forEach(inc => {
      const color = inc.severity === 'CRITICAL' ? '#DC2626' : (inc.category === 'construction' || inc.type === 'CONSTRUCTION' ? '#EA580C' : '#F59E0B');
      const marker = new window.google.maps.Marker({
        position: { lat: inc.location.lat, lng: inc.location.lng },
        map,
        title: `${inc.title}: ${inc.description}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: color,
          fillOpacity: 0.95,
          strokeWeight: 2,
          strokeColor: '#FFFFFF'
        }
      });

      marker.addListener('click', () => {
        const contentStr = `
          <div style="color:#0f172a; font-family:sans-serif; padding:4px; max-width:240px;">
            <div style="font-weight:bold; font-size:14px; color:#1e293b; margin-bottom:4px;">${inc.title}</div>
            <div style="font-size:11px; color:#475569; margin-bottom:6px;">Category: <b>${(inc.category || inc.type).toUpperCase()}</b> | Status: <b>${inc.status}</b></div>
            <div style="font-size:12px; color:#334155; margin-bottom:6px;">${inc.description}</div>
            <div style="font-size:10px; color:#64748b;">Road: ${inc.roadName}</div>
          </div>
        `;
        infoWindow.setContent(contentStr);
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    // Render Supplementary OSM Construction Items
    osmItems.forEach(item => {
      const osmMarker = new window.google.maps.Marker({
        position: { lat: item.location.lat, lng: item.location.lng },
        map,
        title: item.name,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#3B82F6',
          fillOpacity: 0.85,
          strokeWeight: 1,
          strokeColor: '#FFFFFF'
        }
      });

      osmMarker.addListener('click', () => {
        infoWindow.setContent(`
          <div style="color:#0f172a; font-family:sans-serif; padding:4px;">
            <div style="font-weight:bold; font-size:13px; color:#1e3a8a;">${item.name}</div>
            <div style="font-size:10px; color:#2563eb; margin-top:2px;">${item.source}</div>
          </div>
        `);
        infoWindow.open(map, osmMarker);
      });

      markersRef.current.push(osmMarker);
    });


    // Add Route Polyline if directionsRoute is passed
    if (directionsRoute && directionsRoute.overview_polyline?.points) {
      const path = window.google.maps.geometry.encoding.decodePath(directionsRoute.overview_polyline.points);
      const routePolyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#10B981',
        strokeOpacity: 0.8,
        strokeWeight: 6,
        map
      });
      polylinesRef.current.push(routePolyline);

      // Fit bounds to route
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((pt: any) => bounds.extend(pt));
      map.fitBounds(bounds);
    }
  }, [mapLoaded, incidents, directionsRoute]);

  if (loadError) {
    return (
      <div className="relative w-full h-full min-h-[520px] bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center shadow-2xl">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-white mb-1">Google Maps Platform API Status</h3>
        <p className="text-xs text-slate-400 max-w-md mb-4">{loadError}</p>
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-left text-[11px] text-slate-300 font-mono space-y-1">
          <div><span className="text-emerald-400">FRONTEND_MAPS_API_KEY:</span> {apiKey ? `${apiKey.substring(0, 8)}...` : '(empty)'}</div>
          <div><span className="text-blue-400">Target Center:</span> Indore (22.7177623, 75.8585458)</div>
          <div><span className="text-purple-400">Traffic Layer:</span> google.maps.TrafficLayer</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Map Container Element */}
      <div ref={mapRef} className="w-full h-full z-10 min-h-[520px]" />

      {/* Floating Traffic Layer Badge Controls */}
      <div className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 shadow-xl flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${trafficEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'}`} />
          <span className="font-bold text-white flex items-center gap-1.5">
            <TrafficCone className="w-4 h-4 text-emerald-400" />
            Google Live Traffic Layer
          </span>
        </div>
        <button
          onClick={() => setTrafficEnabled(!trafficEnabled)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${
            trafficEnabled
              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {trafficEnabled ? 'Active' : 'Disabled'}
        </button>
      </div>

      {/* Indore Center Info Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-lg text-[10px] text-slate-300 flex items-center space-x-2">
        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
        <span>Centered: Indore City (22.7177623, 75.8585458) • Zoom 16</span>
      </div>
    </div>
  );
};
