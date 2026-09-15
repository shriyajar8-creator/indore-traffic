// GIS Abstraction Layer
// Isolates map provider specific code from UI components.
// Allows seamless switching between OpenStreetMap, Leaflet, MapLibre GL, ArcGIS, Google Maps, or Mapbox.

export interface MapLayerConfig {
  provider: 'OpenStreetMap' | 'MapLibre' | 'Mapbox' | 'ArcGIS' | 'GoogleMaps';
  tileUrl: string;
  attribution: string;
  maxZoom: number;
}

export class MapService {
  private static instance: MapService;
  private currentProvider: MapLayerConfig['provider'] = 'OpenStreetMap';

  private constructor() {}

  public static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }
    return MapService.instance;
  }

  public getLayerConfig(provider?: MapLayerConfig['provider']): MapLayerConfig {
    const activeProvider = provider || this.currentProvider;

    switch (activeProvider) {
      case 'MapLibre':
        return {
          provider: 'MapLibre',
          tileUrl: 'https://demotiles.maplibre.org/style.json',
          attribution: '&copy; MapLibre &copy; OpenStreetMap contributors',
          maxZoom: 19
        };
      case 'Mapbox':
        return {
          provider: 'Mapbox',
          tileUrl: 'https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token={accessToken}',
          attribution: '&copy; Mapbox &copy; OpenStreetMap',
          maxZoom: 20
        };
      case 'ArcGIS':
        return {
          provider: 'ArcGIS',
          tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          maxZoom: 18
        };
      case 'OpenStreetMap':
      default:
        return {
          provider: 'OpenStreetMap',
          tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        };
    }
  }

  public setProvider(provider: MapLayerConfig['provider']) {
    this.currentProvider = provider;
  }

  public getTrafficColor(status: string, congestionPercentage: number): string {
    if (status === 'CRITICAL' || congestionPercentage >= 85) return '#DC2626'; // Dark Red
    if (status === 'SEVERE' || congestionPercentage >= 70) return '#EF4444';   // Red
    if (status === 'HEAVY' || congestionPercentage >= 55) return '#F97316';    // Orange
    if (status === 'MODERATE' || congestionPercentage >= 35) return '#EAB308'; // Yellow
    return '#10B981'; // Green (Free Flow)
  }
}

export const mapService = MapService.getInstance();
