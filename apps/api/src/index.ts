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

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = store.getUserByEmail(req.user!.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user });
});

app.post('/api/auth/logout', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
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

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 INDORE TRAFFIC INTELLIGENCE API LISTENING ON PORT ${PORT}`);
  console.log(`📡 WebSocket Bus Ready for Live Traffic Events`);
  console.log(`🔒 RBAC Authorization Enforced: Admin vs Civilian Scopes Active`);
  console.log(`=======================================================`);
});
