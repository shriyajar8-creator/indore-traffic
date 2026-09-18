export type UserRole = 'ADMIN' | 'TRAFFIC_POLICE' | 'ROAD_DEPARTMENT' | 'EMERGENCY_RESPONSE' | 'CIVILIAN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export type RoadCategory = 
  | 'HIGHWAY' 
  | 'ARTERIAL' 
  | 'COLLECTOR' 
  | 'LOCAL' 
  | 'RESIDENTIAL' 
  | 'BRIDGE' 
  | 'FLYOVER' 
  | 'SERVICE_ROAD';

export type TrafficStatus = 'FREE_FLOW' | 'MODERATE' | 'HEAVY' | 'SEVERE' | 'CRITICAL';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface JunctionTrafficData {
  id: string;
  junctionName: string;
  period: string;
  twoWheelerCount: number;
  threeWheelerCount: number;
  fourWheelerCount: number;
  totalVehicles: number;
  peakHourAvg: number;
  congestionLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  coordinates: GeoPoint;
}

export interface RoadSegment {
  id: string;
  name: string;
  category: RoadCategory;
  widthMeters: number;
  lanes: number;
  isOneWay: boolean;
  speedLimit: number;
  freeFlowSpeed: number;
  currentSpeed: number;
  historicalAverageSpeed: number;
  congestionPercentage: number;
  congestionChangePercentage: number;
  travelTimeMinutes: number;
  historicalTravelTimeMinutes: number;
  trafficVolumeChangePercentage: number;
  status: TrafficStatus;
  isClosed: boolean;
  closureReason?: string;
  incidentCount: number;
  activeConstructionCount: number;
  coordinates: [number, number][];
  startIntersection: string;
  endIntersection: string;
  lastUpdated: string;
  predictions: {
    plus15Min: { congestion: number; speed: number; status: TrafficStatus };
    plus30Min: { congestion: number; speed: number; status: TrafficStatus };
    plus60Min: { congestion: number; speed: number; status: TrafficStatus };
    confidencePercentage: number;
  };
}

export type IncidentType = 
  | 'ACCIDENT' 
  | 'TRAFFIC_JAM' 
  | 'ROAD_BLOCKAGE' 
  | 'CONSTRUCTION' 
  | 'ROAD_CLOSURE' 
  | 'VEHICLE_BREAKDOWN' 
  | 'WATERLOGGING' 
  | 'FIRE' 
  | 'PUBLIC_EVENT' 
  | 'WEATHER_HAZARD' 
  | 'OTHER';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Incident {
  id: string;
  title: string;
  type: IncidentType;
  category?: 'construction' | 'accident' | 'waterlogging' | 'roadblock' | 'other';
  severity: IncidentSeverity;
  description: string;
  roadId: string;
  roadName: string;
  location: GeoPoint;
  affectedLanes: number;
  startTime: string;
  expectedEndTime: string;
  expectedResolution?: string;
  imageUrl?: string;
  recommendedAction: string;
  status: 'ACTIVE' | 'RESOLVED' | 'UNDER_REVIEW';
  reportedByRole: UserRole;
  reportedByEmail?: string;
  verifiedByAdmin?: boolean;
}

export interface TrafficSnapshot {
  id: string;
  timestamp: string;
  hourLabel: string;
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  baseDurationSec: number;
  durationInTrafficSec: number;
  delayMinutes: number;
  congestionPercentage: number;
  congestionLevel: 'LOW' | 'MODERATE' | 'HEAVY' | 'SEVERE' | 'CRITICAL';
  avgSpeedKmH: number;
}


export interface ConstructionProject {
  id: string;
  projectName: string;
  roadId: string;
  roadName: string;
  location: GeoPoint;
  startDate: string;
  expectedEndDate: string;
  affectedLanes: number;
  expectedDelayMinutes: number;
  contractorDepartment: string;
  status: 'PLANNED' | 'ACTIVE' | 'DELAYED' | 'COMPLETED';
}

export interface AlternateRoute {
  id: string;
  routeName: string;
  distanceKm: number;
  estimatedTimeMinutes: number;
  congestionPercentage: number;
  capacityPercentage: number;
  affectedUsersEstimate: number;
  viaRoads: string[];
  isRecommended: boolean;
  recommendationReason: string;
  coordinates: [number, number][];
}

export interface ReroutePlan {
  id: string;
  affectedRoadId: string;
  affectedRoadName: string;
  incidentId?: string;
  alternateRoutes: AlternateRoute[];
  recommendedRouteId: string;
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'ACTIVE';
  approvedAt?: string;
  approvedBy?: string;
  targetUserCount: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'CONSTRUCTION' | 'ROAD_CLOSURE' | 'INFO' | 'HIGH';
  priority?: 'CRITICAL' | 'WARNING' | 'INFO';
  targetTab?: string;
  timestamp: string;
  affectedRoadId?: string;
  incidentId?: string;
  status?: string;
  location?: GeoPoint;
  reroutePlanId?: string;
  isRead?: boolean;
  audience: 'ALL' | 'CIVILIAN' | 'AUTHORITY';
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  adminRole: UserRole;
  action: string;
  targetObject: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface TrafficKpis {
  activeIncidents: number;
  congestedRoads: number;
  averageCitySpeed: number;
  roadsClosed: number;
  activeConstruction: number;
  averageCongestionPercentage: number;
  emergencyIncidents: number;
  affectedUsers: number;
  totalVehicleVolume: number;
  twoWheelerCount: number;
  threeWheelerCount: number;
  fourWheelerCount: number;
  lastUpdated: string;
}

export interface CivilianIncidentReport {
  id: string;
  incidentType: IncidentType;
  description: string;
  roadId?: string;
  roadName?: string;
  location: GeoPoint;
  reportedAt: string;
  reportedByEmail: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'RESOLVED';
  upvotes: number;
}

export interface SignalRecommendation {
  roadId: string;
  roadName: string;
  currentGreenTimeSec: number;
  recommendedGreenTimeSec: number;
  expectedQueueReductionPercentage: number;
  reason: string;
  confidencePercentage: number;
}
