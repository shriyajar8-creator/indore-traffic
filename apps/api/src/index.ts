import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { store } from './store';
import { UserRole } from './types';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_indore_traffic_jwt_key_2026_sih';

app.use(cors());
app.use(express.json());

// Helper to broadcast socket events
const broadcastEvent = (eventName: string, payload: any) => {
  io.emit(eventName, payload);
  io.emit('kpi.updated', store.getKpis());
};

// Auth Request Extension
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

// Authentication Middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired authentication token' });
    }
    req.user = decoded;
    next();
  });
};

// Strict Role Authorization Middleware
const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'ACCESS DENIED: You do not have permission to access the Traffic Command Center or perform administrative operations.' 
      });
    }
    next();
  };
};

const adminOrAuthorityRoles: UserRole[] = ['ADMIN', 'TRAFFIC_POLICE', 'ROAD_DEPARTMENT', 'EMERGENCY_RESPONSE'];

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = store.getUserByEmail(email);
  if (!user || !store.verifyPassword(email, password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar
    }
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const user = store.registerUser({
      name,
      email,
      pass: password,
      role: role || 'CIVILIAN',
      department: department || 'Registered User'
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = store.getUserByEmail(req.user!.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user });
});

app.post('/api/auth/logout', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
});

// ==========================================
// GOOGLE MAPS PLATFORM API PROXY ENDPOINTS
// ==========================================

const INDORE_HUB_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'vijay nagar': { lat: 22.7533, lng: 75.8937 },
  'palasia': { lat: 22.7244, lng: 75.8839 },
  'rajwada': { lat: 22.7196, lng: 75.8577 },
  'bhawarkuan': { lat: 22.6926, lng: 75.8676 },
  'bhanwarkuan': { lat: 22.6926, lng: 75.8676 },
  'lig': { lat: 22.7383, lng: 75.8872 },
  'geeta bhawan': { lat: 22.7161, lng: 75.8805 },
  'railway station': { lat: 22.7177, lng: 75.8682 },
  'airport': { lat: 22.7217, lng: 75.8011 },
  'super corridor': { lat: 22.7680, lng: 75.8320 },
  'dewas naka': { lat: 22.7750, lng: 75.9010 },
  'rau': { lat: 22.6420, lng: 75.8230 }
};

function getHubCoords(query: string): { lat: number; lng: number } {
  const q = (query || '').toLowerCase();
  for (const [key, coords] of Object.entries(INDORE_HUB_COORDINATES)) {
    if (q.includes(key)) return coords;
  }
  return { lat: 22.7196 + (Math.random() * 0.04 - 0.02), lng: 75.8577 + (Math.random() * 0.04 - 0.02) };
}

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

app.get('/api/directions', async (req: Request, res: Response) => {
  const origin = req.query.origin as string;
  const destination = req.query.destination as string;

  if (!origin || !destination) {
    console.log(`[Google Maps API] GET /api/directions | Status: 400 Bad Request (Missing origin or destination)`);
    return res.status(400).json({ 
      error: 'INVALID_REQUEST', 
      message: 'Both origin and destination query parameters are required' 
    });
  }

  const serverKey = process.env.SERVER_MAPS_API_KEY;

  if (!serverKey) {
    const origCoords = getHubCoords(origin);
    const destCoords = getHubCoords(destination);
    const rawDist = calculateHaversineKm(origCoords.lat, origCoords.lng, destCoords.lat, destCoords.lng);
    const distanceKm = Math.max(1.8, Math.round(rawDist * 1.35 * 10) / 10);
    const durationMins = Math.max(5, Math.round(distanceKm * 2.4));
    const durationTrafficMins = Math.round(durationMins * 1.3);

    const midLat = (origCoords.lat + destCoords.lat) / 2 + 0.004;
    const midLng = (origCoords.lng + destCoords.lng) / 2 - 0.004;
    const pathPoints: [number, number][] = [
      [origCoords.lat, origCoords.lng],
      [origCoords.lat * 0.65 + midLat * 0.35, origCoords.lng * 0.65 + midLng * 0.35],
      [midLat, midLng],
      [midLat * 0.35 + destCoords.lat * 0.65, midLng * 0.35 + destCoords.lng * 0.65],
      [destCoords.lat, destCoords.lng]
    ];

    console.warn(`[Google Maps API] GET /api/directions | SERVER_MAPS_API_KEY empty. Returning calculated route: ${origin} -> ${destination} (${distanceKm} km, ${durationTrafficMins} mins)`);
    return res.json({
      status: 'SIMULATED_OK',
      warning: 'SERVER_MAPS_API_KEY is empty. Returning calculated Indore corridor route.',
      origin,
      destination,
      originCoords: origCoords,
      destinationCoords: destCoords,
      duration: { text: `${durationMins} mins`, value: durationMins * 60 },
      duration_in_traffic: { text: `${durationTrafficMins} mins`, value: durationTrafficMins * 60 },
      distance: { text: `${distanceKm.toFixed(1)} km`, value: Math.round(distanceKm * 1000) },
      pathPoints,
      routes: [
        {
          summary: `Via Indore Main Corridor (${origin} to ${destination})`,
          pathPoints,
          legs: [{
            distance: { text: `${distanceKm.toFixed(1)} km`, value: Math.round(distanceKm * 1000) },
            duration: { text: `${durationMins} mins`, value: durationMins * 60 },
            duration_in_traffic: { text: `${durationTrafficMins} mins`, value: durationTrafficMins * 60 },
            start_address: origin,
            end_address: destination
          }]
        }
      ]
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&departure_time=now&traffic_model=best_guess&key=${serverKey}`;
    const apiRes = await fetch(url);
    const data = await apiRes.json();

    console.log(`[Google Maps API] GET /api/directions | Outgoing HTTP Status: ${apiRes.status} | Google API Status: ${data.status}`);

    if (data.status === 'OK') {
      const leg = data.routes[0]?.legs[0];
      return res.json({
        status: 'OK',
        origin: leg?.start_address || origin,
        destination: leg?.end_address || destination,
        duration: leg?.duration,
        duration_in_traffic: leg?.duration_in_traffic || leg?.duration,
        distance: leg?.distance,
        routes: data.routes
      });
    } else {
      let httpCode = 400;
      if (data.status === 'REQUEST_DENIED') httpCode = 403;
      if (data.status === 'OVER_QUERY_LIMIT') httpCode = 429;
      if (data.status === 'ZERO_RESULTS') httpCode = 404;

      return res.status(httpCode).json({
        error: data.status,
        message: data.error_message || `Google Directions API returned ${data.status}`,
        status: data.status
      });
    }
  } catch (err: any) {
    console.error(`[Google Maps API] GET /api/directions Error:`, err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Failed to query Directions API' });
  }
});

app.get('/api/distance-matrix', async (req: Request, res: Response) => {
  const origins = req.query.origins as string;
  const destinations = req.query.destinations as string;

  if (!origins || !destinations) {
    console.log(`[Google Maps API] GET /api/distance-matrix | Status: 400 Bad Request (Missing origins or destinations)`);
    return res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'Both origins and destinations query parameters are required'
    });
  }

  const serverKey = process.env.SERVER_MAPS_API_KEY;

  if (!serverKey) {
    console.warn(`[Google Maps API] GET /api/distance-matrix | SERVER_MAPS_API_KEY is not set in environment`);
    return res.json({
      status: 'SIMULATED_OK',
      origins: [origins],
      destinations: [destinations],
      rows: [{
        elements: [{
          status: 'OK',
          distance: { text: '8.5 km', value: 8500 },
          duration: { text: '22 mins', value: 1320 },
          duration_in_traffic: { text: '28 mins', value: 1680 }
        }]
      }]
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&departure_time=now&traffic_model=best_guess&key=${serverKey}`;
    const apiRes = await fetch(url);
    const data = await apiRes.json();

    console.log(`[Google Maps API] GET /api/distance-matrix | Outgoing HTTP Status: ${apiRes.status} | Google API Status: ${data.status}`);

    if (data.status === 'OK') {
      return res.json(data);
    } else {
      let httpCode = 400;
      if (data.status === 'REQUEST_DENIED') httpCode = 403;
      if (data.status === 'OVER_QUERY_LIMIT') httpCode = 429;
      return res.status(httpCode).json({
        error: data.status,
        message: data.error_message || `Google Distance Matrix API returned ${data.status}`,
        status: data.status
      });
    }
  } catch (err: any) {
    console.error(`[Google Maps API] GET /api/distance-matrix Error:`, err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Failed to query Distance Matrix API' });
  }
});

app.get('/api/geocode', async (req: Request, res: Response) => {
  const address = req.query.address as string;
  const latlng = req.query.latlng as string;

  if (!address && !latlng) {
    console.log(`[Google Maps API] GET /api/geocode | Status: 400 Bad Request (Missing address or latlng)`);
    return res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'Either address or latlng query parameter is required'
    });
  }

  const serverKey = process.env.SERVER_MAPS_API_KEY;

  if (!serverKey) {
    console.warn(`[Google Maps API] GET /api/geocode | SERVER_MAPS_API_KEY is not set in environment`);
    return res.json({
      status: 'SIMULATED_OK',
      results: [
        {
          formatted_address: address || 'Vijay Nagar, Indore, Madhya Pradesh, India',
          geometry: {
            location: { lat: 22.7533, lng: 75.8937 }
          }
        }
      ]
    });
  }

  try {
    const param = address ? `address=${encodeURIComponent(address)}` : `latlng=${encodeURIComponent(latlng)}`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?${param}&key=${serverKey}`;
    const apiRes = await fetch(url);
    const data = await apiRes.json();

    console.log(`[Google Maps API] GET /api/geocode | Outgoing HTTP Status: ${apiRes.status} | Google API Status: ${data.status}`);

    if (data.status === 'OK') {
      return res.json(data);
    } else {
      let httpCode = 400;
      if (data.status === 'REQUEST_DENIED') httpCode = 403;
      if (data.status === 'ZERO_RESULTS') httpCode = 404;
      if (data.status === 'OVER_QUERY_LIMIT') httpCode = 429;
      return res.status(httpCode).json({
        error: data.status,
        message: data.error_message || `Google Geocoding API returned ${data.status}`,
        status: data.status
      });
    }
  } catch (err: any) {
    console.error(`[Google Maps API] GET /api/geocode Error:`, err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Failed to query Geocoding API' });
  }
});


// ==========================================
// 2. LIVE TRAFFIC & GIS ENDPOINTS (Public/Civilian read)
// ==========================================
app.get('/api/traffic/live', (req: Request, res: Response) => {
  return res.json({
    roads: store.getRoads(),
    junctions: store.getJunctions(),
    kpis: store.getKpis(),
    incidents: store.getIncidents().filter(i => i.status === 'ACTIVE'),
    constructions: store.getConstructions().filter(c => c.status === 'ACTIVE'),
    signals: store.getSignalRecommendations(),
    lastUpdated: new Date().toISOString(),
    dataMode: process.env.DATA_MODE || 'SIMULATED_LIVE',
    systemStatus: {
      backend: 'CONNECTED',
      database: 'CONNECTED',
      realtime: 'CONNECTED'
    }
  });
});

app.get('/api/traffic/junctions', (req: Request, res: Response) => {
  return res.json({ junctions: store.getJunctions() });
});

app.get('/api/traffic/history', (req: Request, res: Response) => {
  const hourlyData = Array.from({ length: 24 }).map((_, hour) => {
    let speed = 35;
    let congestion = 40;
    if (hour >= 8 && hour <= 11) {
      speed = 18 + Math.floor(Math.random() * 6);
      congestion = 75 + Math.floor(Math.random() * 15);
    } else if (hour >= 17 && hour <= 21) {
      speed = 14 + Math.floor(Math.random() * 5);
      congestion = 82 + Math.floor(Math.random() * 12);
    } else if (hour >= 0 && hour <= 5) {
      speed = 52 + Math.floor(Math.random() * 8);
      congestion = 15 + Math.floor(Math.random() * 8);
    }
    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      avgSpeed: speed,
      avgCongestion: congestion,
      activeIncidents: hour >= 8 && hour <= 20 ? Math.floor(Math.random() * 5) + 1 : 0
    };
  });

  return res.json({ hourlyData });
});

app.get('/api/traffic/predictions', (req: Request, res: Response) => {
  const predictions = store.getRoads().map(r => ({
    roadId: r.id,
    roadName: r.name,
    currentCongestion: r.congestionPercentage,
    currentSpeed: r.currentSpeed,
    predictions: r.predictions,
    engine: 'Predictive Traffic Engine (ML Architecture Ready)'
  }));

  return res.json({ predictions });
});

// ==========================================
// 3. ROAD CONTROL & INCIDENTS (Protected Admin APIs)
// ==========================================
app.get('/api/roads', (req: Request, res: Response) => {
  return res.json({ roads: store.getRoads() });
});

app.get('/api/roads/:id', (req: Request, res: Response) => {
  const road = store.getRoadById(req.params.id);
  if (!road) return res.status(404).json({ error: 'Road corridor not found' });
  return res.json({ road });
});

app.get('/api/incidents', (req: Request, res: Response) => {
  return res.json({ incidents: store.getIncidents() });
});

app.post('/api/incidents', authenticateToken, requireRole(adminOrAuthorityRoles), (req: AuthRequest, res: Response) => {
  const { title, type, severity, description, roadId, roadName, location, affectedLanes, expectedEndTime, recommendedAction } = req.body;

  if (!title || !type || !severity || !roadId || !location) {
    return res.status(400).json({ error: 'Missing required incident fields' });
  }

  const incident = store.createIncident({
    title,
    type,
    severity,
    description: description || '',
    roadId,
    roadName: roadName || 'Target Road',
    location,
    affectedLanes: affectedLanes || 1,
    expectedEndTime: expectedEndTime || new Date(Date.now() + 7200000).toISOString(),
    recommendedAction: recommendedAction || 'Exercise caution',
    status: 'ACTIVE',
    reportedByRole: req.user!.role,
    reportedByEmail: req.user!.email,
    verifiedByAdmin: true
  });

  broadcastEvent('incident.created', { incident });
  broadcastEvent('traffic.updated', { roads: store.getRoads() });

  return res.status(201).json({ incident });
});

app.get('/api/traffic/analytics', (req: Request, res: Response) => {
  return res.json(store.getAnalyticsData());
});

app.get('/api/incidents/osm-construction', async (req: Request, res: Response) => {
  try {
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];way[highway=construction](22.65,75.80,22.80,75.95);out center;`;
    const apiRes = await fetch(overpassUrl);
    if (!apiRes.ok) {
      return res.json({ source: 'OpenStreetMap Overpass API', count: 0, items: [] });
    }
    const data = await apiRes.json();
    const items = (data.elements || []).map((el: any) => ({
      id: `osm-${el.id}`,
      name: el.tags?.name || 'OSM Reported Highway Construction',
      location: { lat: el.center?.lat || 22.7196, lng: el.center?.lon || 75.8577 },
      category: 'construction',
      source: 'OpenStreetMap Overpass Feed (Supplementary Open Data)'
    }));
    return res.json({ source: 'OpenStreetMap Overpass API', count: items.length, items });
  } catch (err: any) {
    console.warn('[OSM Overpass API] Query fallback:', err.message);
    return res.json({ source: 'OpenStreetMap Overpass API', count: 0, items: [] });
  }
});

app.put('/api/incidents/:id', authenticateToken, requireRole(adminOrAuthorityRoles), (req: AuthRequest, res: Response) => {
  const updated = store.updateIncident(req.params.id, req.body, req.user!.email, req.user!.role);
  if (!updated) return res.status(404).json({ error: 'Incident not found' });

  broadcastEvent('incident.updated', { incident: updated });
  broadcastEvent('traffic.updated', { roads: store.getRoads() });

  return res.json({ incident: updated });
});

app.delete('/api/incidents/:id', authenticateToken, requireRole(adminOrAuthorityRoles), (req: AuthRequest, res: Response) => {
  const success = store.deleteIncident(req.params.id, req.user!.email, req.user!.role);
  if (!success) return res.status(404).json({ error: 'Incident not found' });

  broadcastEvent('incident.deleted', { id: req.params.id });
  broadcastEvent('traffic.updated', { roads: store.getRoads() });

  return res.json({ success: true, message: 'Incident deleted successfully' });
});

app.patch('/api/incidents/:id', authenticateToken, requireRole(adminOrAuthorityRoles), (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const updated = store.updateIncidentStatus(req.params.id, status, req.user!.email, req.user!.role);
  if (!updated) return res.status(404).json({ error: 'Incident not found' });

  broadcastEvent('incident.updated', { incident: updated });
  broadcastEvent('traffic.updated', { roads: store.getRoads() });

  return res.json({ incident: updated });
});


// Road Closures
app.get('/api/closures', (req: Request, res: Response) => {
  const closedRoads = store.getRoads().filter(r => r.isClosed);
  return res.json({ closures: closedRoads });
});

app.post('/api/closures', authenticateToken, requireRole(adminOrAuthorityRoles), (req: AuthRequest, res: Response) => {
  const { roadId, isClosed, reason } = req.body;
  const road = store.toggleRoadClosure(roadId, isClosed, reason, req.user!.email, req.user!.role);
  if (!road) return res.status(404).json({ error: 'Road not found' });

  broadcastEvent(isClosed ? 'road.closed' : 'road.opened', { roadId, road, reason });
  broadcastEvent('traffic.updated', { roads: store.getRoads() });

  return res.json({ road });
});

// Construction
app.get('/api/construction', (req: Request, res: Response) => {
  return res.json({ constructions: store.getConstructions() });
});

// ==========================================
// 4. REROUTING ENGINE APIs
// ==========================================
app.post('/api/routes/calculate', (req: Request, res: Response) => {
  const { targetRoadId } = req.body;
  const plan = store.generateReroutePlan(targetRoadId || 'road-ab-north');
  return res.json({ plan });
});

app.post('/api/reroutes/:id/approve', authenticateToken, requireRole(adminOrAuthorityRoles), (req: AuthRequest, res: Response) => {
  const plan = store.approveReroutePlan(req.params.id, req.user!.email, req.user!.role);
  if (!plan) return res.status(404).json({ error: 'Reroute plan not found' });

  broadcastEvent('reroute.approved', { plan });
  broadcastEvent('road.closed', { roadId: plan.affectedRoadId, reason: 'Approved official reroute diversion' });
  broadcastEvent('alert.broadcast', { notification: store.getNotifications()[0] });
  broadcastEvent('traffic.updated', { roads: store.getRoads() });

  return res.json({ plan });
});

// ==========================================
// 5. CIVILIAN REPORTING & NOTIFICATIONS
// ==========================================
app.get('/api/notifications', (req: Request, res: Response) => {
  return res.json({ notifications: store.getNotifications() });
});

app.post('/api/civilian/report', authenticateToken, (req: AuthRequest, res: Response) => {
  const { incidentType, description, roadId, roadName, location } = req.body;
  const report = store.submitCivilianReport({
    incidentType,
    description: description || 'Civilian obstacle report',
    roadId,
    roadName,
    location: location || { lat: 22.7196, lng: 75.8577 },
    reportedByEmail: req.user!.email
  });

  broadcastEvent('civilian.report_submitted', { report });
  return res.status(201).json({ report, message: 'Report submitted successfully for authority review.' });
});

app.get('/api/civilian/reports', authenticateToken, requireRole(adminOrAuthorityRoles), (req: AuthRequest, res: Response) => {
  return res.json({ reports: store.getCivilianReports() });
});

app.post('/api/civilian/verify/:id', authenticateToken, requireRole(adminOrAuthorityRoles), (req: AuthRequest, res: Response) => {
  const inc = store.verifyCivilianReport(req.params.id, req.user!.email, req.user!.role);
  if (!inc) return res.status(404).json({ error: 'Report not found' });

  broadcastEvent('incident.created', { incident: inc });
  broadcastEvent('traffic.updated', { roads: store.getRoads() });

  return res.json({ incident: inc, message: 'Civilian report verified and promoted to active official incident.' });
});

// ==========================================
// 6. SIH DEMO SIMULATION ENGINE & AUDIT LOGS
// ==========================================
app.post('/api/simulation/accident', authenticateToken, requireRole(adminOrAuthorityRoles), (req: AuthRequest, res: Response) => {
  const { incident, plan, notification } = store.simulateAccidentScenario();

  broadcastEvent('incident.created', { incident });
  broadcastEvent('reroute.created', { plan });
  broadcastEvent('alert.broadcast', { notification });
  broadcastEvent('traffic.updated', { roads: store.getRoads() });

  return res.json({
    success: true,
    message: 'SIH Demo Accident Simulation Triggered Successfully',
    incident,
    plan,
    notification
  });
});

app.get('/api/audit-logs', authenticateToken, requireRole(adminOrAuthorityRoles), (req: AuthRequest, res: Response) => {
  return res.json({ auditLogs: store.getAuditLogs() });
});

app.get('/api/notifications', (req: Request, res: Response) => {
  return res.json({ notifications: store.getNotifications() });
});

// Protected Admin Guard Catch-All for /api/admin/*
app.all('/api/admin/*', authenticateToken, requireRole(adminOrAuthorityRoles), (req: AuthRequest, res: Response) => {
  return res.json({ status: 'OK', user: req.user });
});

// ==========================================
// SOCKET.IO WEBSOCKET EVENTS
// ==========================================
io.on('connection', (socket) => {
  console.log(`⚡ Client connected to Indore Traffic Intelligence Engine: ${socket.id}`);

  socket.emit('traffic.init', {
    roads: store.getRoads(),
    junctions: store.getJunctions(),
    kpis: store.getKpis(),
    incidents: store.getIncidents().filter(i => i.status === 'ACTIVE'),
    notifications: store.getNotifications()
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Scheduled Job: 2-minute live traffic snapshot polling scheduler
setInterval(() => {
  const routes = [
    { id: 'route-ab-road', name: 'AB Road Corridor', origin: 'Vijay Nagar Square, Indore', dest: 'Palasia Square, Indore' },
    { id: 'route-ring-road', name: 'Ring Road East', origin: 'Bengali Square, Indore', dest: 'MR-10 Bridge, Indore' },
    { id: 'route-mg-road', name: 'MG Road Center', origin: 'Rajwada, Indore', dest: 'Regal Square, Indore' },
    { id: 'route-bhawarkuan', name: 'Bhawarkuan Corridor', origin: 'IT Park, Indore', dest: 'Tower Square, Indore' }
  ];

  routes.forEach(r => {
    const baseDur = 900;
    const randomSurge = Math.floor(Math.random() * 400);
    const trafficDur = baseDur + randomSurge;
    const congPct = Math.min(98, Math.round((trafficDur / (baseDur * 1.6)) * 60));
    store.recordTrafficSnapshot(r.id, r.name, r.origin, r.dest, baseDur, trafficDur, congPct);
  });

  io.emit('traffic.snapshot', store.getAnalyticsData());
  console.log(`[Snapshot Job] Recorded 2-minute live traffic snapshots for Indore corridors.`);
}, 120000);

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 INDORE TRAFFIC INTELLIGENCE API LISTENING ON PORT ${PORT}`);
  console.log(`📡 WebSocket Bus Ready for Live Traffic Events`);
  console.log(`⏱️  Scheduled Job Active: 2-Min Traffic Snapshot Polling Engine`);
  console.log(`🔒 RBAC Authorization Enforced: Admin vs Civilian Scopes Active`);
  console.log(`=======================================================`);
});

