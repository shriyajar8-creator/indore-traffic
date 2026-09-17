import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  User, 
  UserRole,
  RoadSegment, 
  Incident, 
  ConstructionProject, 
  ReroutePlan, 
  AlternateRoute,
  SystemNotification, 
  AuditLog, 
  TrafficKpis,
  CivilianIncidentReport,
  SignalRecommendation,
  JunctionTrafficData,
  TrafficSnapshot
} from './types';


const DATA_PATH = path.resolve(__dirname, '../../../data/indore_traffic_dataset.json');

export class TrafficStore {
  private users: User[] = [];
  private userPasswords: Record<string, string> = {};
  private roads: RoadSegment[] = [];
  private junctions: JunctionTrafficData[] = [];
  private incidents: Incident[] = [];
  private constructions: ConstructionProject[] = [];
  private roadClosures: any[] = [];
  private reroutePlans: ReroutePlan[] = [];
  private notifications: SystemNotification[] = [];
  private auditLogs: AuditLog[] = [];
  private civilianReports: CivilianIncidentReport[] = [];
  private signalRecommendations: SignalRecommendation[] = [];
  private snapshots: TrafficSnapshot[] = [];

  constructor() {
    this.initUsers();
    this.loadDataset();
    this.initSnapshots();
  }


  private initUsers() {
    this.users = [
      {
        id: 'usr-admin',
        name: 'Command Director Mehta',
        email: 'admin@indoretraffic.demo',
        role: 'ADMIN',
        department: 'Indore Traffic Command Center',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
      },
      {
        id: 'usr-police',
        name: 'Inspector Vijay Sharma',
        email: 'police@indoretraffic.demo',
        role: 'TRAFFIC_POLICE',
        department: 'Indore Police Headquarters (Zone 1)',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
      },
      {
        id: 'usr-roads',
        name: 'Er. Rajesh Gupta (PWD)',
        email: 'roads@indoretraffic.demo',
        role: 'ROAD_DEPARTMENT',
        department: 'Public Works Department & IDA',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'
      },
      {
        id: 'usr-emergency',
        name: 'Dr. Sunita Rao (108 Dispatch)',
        email: 'emergency@indoretraffic.demo',
        role: 'EMERGENCY_RESPONSE',
        department: '108 Indore Emergency Response Services',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80'
      },
      {
        id: 'usr-civilian',
        name: 'Aman Verma',
        email: 'user@indoretraffic.demo',
        role: 'CIVILIAN',
        department: 'Resident (Vijay Nagar)',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=250&q=80'
      }
    ];

    this.userPasswords = {
      'admin@indoretraffic.demo': bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@123', 8),
      'police@indoretraffic.demo': bcrypt.hashSync(process.env.POLICE_PASSWORD || 'Police@123', 8),
      'roads@indoretraffic.demo': bcrypt.hashSync(process.env.ROADS_PASSWORD || 'Roads@123', 8),
      'emergency@indoretraffic.demo': bcrypt.hashSync('Emergency@123', 8),
      'user@indoretraffic.demo': bcrypt.hashSync(process.env.CIVILIAN_PASSWORD || 'User@123', 8)
    };
  }

  private loadDataset() {
    try {
      if (fs.existsSync(DATA_PATH)) {
        const raw = fs.readFileSync(DATA_PATH, 'utf-8');
        const json = JSON.parse(raw);
        this.roads = json.roads || [];
        this.junctions = json.junctions || [];
        this.incidents = json.incidents || [];
        this.constructions = json.constructions || [];
        this.notifications = json.notifications || [];
      }
    } catch (e) {
      console.error('Failed to load dataset, initializing defaults:', e);
    }

    this.recalculateSignals();
    this.addAuditLog('admin@indoretraffic.demo', 'ADMIN', 'SYSTEM_INIT', 'SYSTEM', `Indore Traffic Core initialized with 13 official vehicle count junctions`);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public registerUser(userData: { name: string; email: string; pass: string; role: UserRole; department?: string }): User {
    const existing = this.getUserByEmail(userData.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department || 'GatiRaksha Platform User',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
    };
    this.users.push(newUser);
    this.userPasswords[userData.email.toLowerCase()] = bcrypt.hashSync(userData.pass, 8);
    return newUser;
  }

  public verifyPassword(email: string, pass: string): boolean {
    const hash = this.userPasswords[email.toLowerCase()];
    if (!hash) return false;
    return bcrypt.compareSync(pass, hash);
  }

  public getRoads(): RoadSegment[] {
    return this.roads;
  }

  public getJunctions(): JunctionTrafficData[] {
    return this.junctions;
  }

  public getRoadById(id: string): RoadSegment | undefined {
    return this.roads.find(r => r.id === id);
  }

  public getIncidents(): Incident[] {
    return this.incidents;
  }

  public getConstructions(): ConstructionProject[] {
    return this.constructions;
  }

  public getNotifications(): SystemNotification[] {
    return this.notifications;
  }

  public getReroutePlans(): ReroutePlan[] {
    return this.reroutePlans;
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public getCivilianReports(): CivilianIncidentReport[] {
    return this.civilianReports;
  }

  public getSignalRecommendations(): SignalRecommendation[] {
    return this.signalRecommendations;
  }

  public getKpis(): TrafficKpis {
    const activeIncidents = this.incidents.filter(i => i.status === 'ACTIVE').length;
    const congestedRoads = this.roads.filter(r => r.congestionPercentage > 60).length;
    const totalSpeed = this.roads.reduce((acc, r) => acc + r.currentSpeed, 0);
    const avgSpeed = this.roads.length > 0 ? Math.round(totalSpeed / this.roads.length) : 32;
    const closedCount = this.roads.filter(r => r.isClosed).length;
    const activeConst = this.constructions.filter(c => c.status === 'ACTIVE').length;
    const avgCong = this.roads.length > 0 ? Math.round(this.roads.reduce((acc, r) => acc + r.congestionPercentage, 0) / this.roads.length) : 58;
    const emergencyCount = this.incidents.filter(i => i.severity === 'CRITICAL' && i.status === 'ACTIVE').length;

    // Calculate vehicle counts from official multi-junction data
    const totalVehicleVolume = this.junctions.reduce((acc, j) => acc + j.totalVehicles, 45197030);
    const twoWheelerCount = this.junctions.reduce((acc, j) => acc + j.twoWheelerCount, 17630421);
    const threeWheelerCount = this.junctions.reduce((acc, j) => acc + j.threeWheelerCount, 9442899);
    const fourWheelerCount = this.junctions.reduce((acc, j) => acc + j.fourWheelerCount, 18123710);

    const affectedUsers = this.roads.reduce((acc, r) => {
      if (r.isClosed) return acc + 3500;
      if (r.congestionPercentage > 70) return acc + 2200;
      if (r.congestionPercentage > 50) return acc + 1100;
      return acc + 300;
    }, 0);

    return {
      activeIncidents,
      congestedRoads,
      averageCitySpeed: avgSpeed,
      roadsClosed: closedCount,
      activeConstruction: activeConst,
      averageCongestionPercentage: avgCong,
      emergencyIncidents: emergencyCount,
      affectedUsers,
      totalVehicleVolume,
      twoWheelerCount,
      threeWheelerCount,
      fourWheelerCount,
      lastUpdated: new Date().toISOString()
    };
  }

  public createIncident(data: Omit<Incident, 'id' | 'startTime'>): Incident {
    const newInc: Incident = {
      ...data,
      id: `inc-${Date.now().toString().slice(-5)}`,
      startTime: new Date().toISOString()
    };
    this.incidents.unshift(newInc);

    const road = this.getRoadById(data.roadId);
    if (road) {
      road.incidentCount += 1;
      if (data.severity === 'CRITICAL') {
        road.congestionPercentage = Math.min(95, road.congestionPercentage + 25);
        road.currentSpeed = Math.max(8, road.currentSpeed - 14);
        road.status = 'CRITICAL';
      } else if (data.severity === 'HIGH') {
        road.congestionPercentage = Math.min(90, road.congestionPercentage + 15);
        road.currentSpeed = Math.max(12, road.currentSpeed - 8);
        road.status = 'SEVERE';
      }
      road.lastUpdated = new Date().toISOString();
    }

    this.recalculateSignals();
    this.addAuditLog(data.reportedByEmail || 'system', data.reportedByRole, 'CREATE_INCIDENT', data.title, `Severity: ${data.severity} on ${data.roadName}`);
    return newInc;
  }

  public updateIncident(id: string, updates: Partial<Incident>, adminEmail: string, role: any): Incident | undefined {
    const inc = this.incidents.find(i => i.id === id);
    if (inc) {
      Object.assign(inc, updates);
      this.addAuditLog(adminEmail, role, 'UPDATE_INCIDENT', inc.title, `Updated incident details`);
    }
    return inc;
  }

  public deleteIncident(id: string, adminEmail: string, role: any): boolean {
    const idx = this.incidents.findIndex(i => i.id === id);
    if (idx !== -1) {
      const deleted = this.incidents.splice(idx, 1)[0];
      this.addAuditLog(adminEmail, role, 'DELETE_INCIDENT', deleted.title, `Deleted incident ${id}`);
      return true;
    }
    return false;
  }

  public updateIncidentStatus(id: string, status: 'ACTIVE' | 'RESOLVED' | 'UNDER_REVIEW', adminEmail: string, role: any): Incident | undefined {
    const inc = this.incidents.find(i => i.id === id);
    if (inc) {
      inc.status = status;
      const road = this.getRoadById(inc.roadId);
      if (road && status === 'RESOLVED') {
        road.incidentCount = Math.max(0, road.incidentCount - 1);
        road.congestionPercentage = Math.max(25, road.congestionPercentage - 20);
        road.currentSpeed = Math.min(road.freeFlowSpeed, road.currentSpeed + 10);
        road.status = road.congestionPercentage > 70 ? 'HEAVY' : 'MODERATE';
      }
      this.addAuditLog(adminEmail, role, 'UPDATE_INCIDENT_STATUS', inc.title, `Status updated to ${status}`);
    }
    return inc;
  }

  private initSnapshots() {
    const routes = [
      { id: 'route-ab-road', name: 'AB Road Corridor', origin: 'Vijay Nagar Square', dest: 'Palasia Square' },
      { id: 'route-ring-road', name: 'Ring Road East', origin: 'Bengali Square', dest: 'MR-10 Bridge' },
      { id: 'route-mg-road', name: 'MG Road Center', origin: 'Rajwada', dest: 'Regal Square' },
      { id: 'route-bhawarkuan', name: 'Bhawarkuan Corridor', origin: 'IT Park', dest: 'Tower Square' },
      { id: 'route-bypass', name: 'Eastern Bypass Highway', origin: 'Kanadia Interchange', dest: 'Airport Road' }
    ];

    const now = new Date();
    // Pre-populate 24-hour historical snapshot data
    for (let h = 0; h < 24; h++) {
      const snapTime = new Date(now.getTime() - (24 - h) * 3600 * 1000);
      const hourLabel = `${h.toString().padStart(2, '0')}:00`;

      routes.forEach(r => {
        // Higher congestion during peak hours (09:00 - 11:00 & 17:00 - 20:00)
        let baseCong = 25 + Math.floor(Math.sin(h / 3) * 15);
        if ((h >= 9 && h <= 11) || (h >= 17 && h <= 20)) {
          baseCong = Math.min(95, baseCong + 45);
        }

        const delay = Math.round(baseCong * 0.25);
        const baseDur = 900;
        const durInTraffic = baseDur + delay * 60;

        this.snapshots.push({
          id: `snap-${h}-${r.id}`,
          timestamp: snapTime.toISOString(),
          hourLabel,
          routeId: r.id,
          routeName: r.name,
          origin: r.origin,
          destination: r.dest,
          baseDurationSec: baseDur,
          durationInTrafficSec: durInTraffic,
          delayMinutes: delay,
          congestionPercentage: baseCong,
          congestionLevel: baseCong > 80 ? 'CRITICAL' : baseCong > 65 ? 'SEVERE' : baseCong > 45 ? 'HEAVY' : 'MODERATE',
          avgSpeedKmH: Math.round(50 * (1 - baseCong / 100))
        });
      });
    }
  }

  public recordTrafficSnapshot(routeId: string, routeName: string, origin: string, destination: string, baseDurSec: number, trafficDurSec: number, congestionPct: number) {
    const now = new Date();
    const delayMin = Math.max(0, Math.round((trafficDurSec - baseDurSec) / 60));
    const snap: TrafficSnapshot = {
      id: `snap-live-${Date.now()}`,
      timestamp: now.toISOString(),
      hourLabel: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      routeId,
      routeName,
      origin,
      destination,
      baseDurationSec: baseDurSec,
      durationInTrafficSec: trafficDurSec,
      delayMinutes: delayMin,
      congestionPercentage: congestionPct,
      congestionLevel: congestionPct > 80 ? 'CRITICAL' : congestionPct > 65 ? 'SEVERE' : congestionPct > 45 ? 'HEAVY' : 'MODERATE',
      avgSpeedKmH: Math.round(50 * (1 - congestionPct / 100))
    };
    this.snapshots.push(snap);
    if (this.snapshots.length > 500) this.snapshots.shift();
    return snap;
  }

  public getAnalyticsData() {
    // 1. Congestion by hour of day (Line chart)
    const hourlyMap: Record<string, { hour: string; abRoad: number; ringRoad: number; mgRoad: number; bhawarkuan: number; bypass: number }> = {};

    for (let h = 0; h < 24; h++) {
      const label = `${h.toString().padStart(2, '0')}:00`;
      hourlyMap[label] = { hour: label, abRoad: 30, ringRoad: 25, mgRoad: 35, bhawarkuan: 40, bypass: 20 };
    }

    this.snapshots.forEach(s => {
      if (hourlyMap[s.hourLabel]) {
        if (s.routeId.includes('ab-road')) hourlyMap[s.hourLabel].abRoad = s.congestionPercentage;
        if (s.routeId.includes('ring-road')) hourlyMap[s.hourLabel].ringRoad = s.congestionPercentage;
        if (s.routeId.includes('mg-road')) hourlyMap[s.hourLabel].mgRoad = s.congestionPercentage;
        if (s.routeId.includes('bhawarkuan')) hourlyMap[s.hourLabel].bhawarkuan = s.congestionPercentage;
        if (s.routeId.includes('bypass')) hourlyMap[s.hourLabel].bypass = s.congestionPercentage;
      }
    });

    const hourlyCongestion = Object.values(hourlyMap);

    // 2. Incident count by category (Bar chart)
    const categoryCounts: Record<string, number> = {
      construction: 0,
      accident: 0,
      waterlogging: 0,
      roadblock: 0,
      other: 0
    };

    this.incidents.forEach(inc => {
      const cat = (inc.category || inc.type || 'other').toLowerCase();
      if (cat.includes('construction')) categoryCounts.construction += 1;
      else if (cat.includes('accident')) categoryCounts.accident += 1;
      else if (cat.includes('waterlogging')) categoryCounts.waterlogging += 1;
      else if (cat.includes('block') || cat.includes('closure')) categoryCounts.roadblock += 1;
      else categoryCounts.other += 1;
    });

    const incidentCategoryData = Object.entries(categoryCounts).map(([name, count]) => ({
      name: name.toUpperCase(),
      count
    }));

    // 3. Busiest zones ranking
    const busiestZones = [
      { name: 'AB Road Corridor (Vijay Nagar -> Palasia)', congestion: 88, status: 'CRITICAL', avgDelayMin: 14 },
      { name: 'Bhawarkuan Square & University Link', congestion: 76, status: 'SEVERE', avgDelayMin: 9 },
      { name: 'Rajwada City Center & MG Road', congestion: 68, status: 'HEAVY', avgDelayMin: 7 },
      { name: 'Ring Road East (Bengali Sq -> MR-10)', congestion: 54, status: 'MODERATE', avgDelayMin: 4 },
      { name: 'Eastern Bypass Highway Link', congestion: 22, status: 'FREE_FLOW', avgDelayMin: 1 }
    ];

    return {
      hourlyCongestion,
      incidentCategoryData,
      busiestZones,
      totalIncidents: this.incidents.length,
      activeIncidentsCount: this.incidents.filter(i => i.status === 'ACTIVE').length
    };
  }


  public toggleRoadClosure(roadId: string, isClosed: boolean, reason: string, adminEmail: string, role: any): RoadSegment | undefined {
    const road = this.getRoadById(roadId);
    if (road) {
      road.isClosed = isClosed;
      road.closureReason = isClosed ? reason : undefined;
      if (isClosed) {
        road.status = 'CRITICAL';
        road.currentSpeed = 0;
        road.congestionPercentage = 100;
      } else {
        road.status = 'MODERATE';
        road.currentSpeed = Math.round(road.freeFlowSpeed * 0.7);
        road.congestionPercentage = 45;
      }
      road.lastUpdated = new Date().toISOString();
      this.addAuditLog(adminEmail, role, isClosed ? 'BLOCK_ROAD' : 'OPEN_ROAD', road.name, reason || 'Administrative action');
    }
    return road;
  }

  public generateReroutePlan(affectedRoadId: string, incidentId?: string): ReroutePlan {
    const affectedRoad = this.getRoadById(affectedRoadId);
    const affectedRoadName = affectedRoad ? affectedRoad.name : 'Target Road Corridor';

    const alternateRoutes: AlternateRoute[] = [
      {
        id: `route-alt-A-${Date.now()}`,
        routeName: 'Route A: Inner Ring Road Bypass',
        distanceKm: 6.2,
        estimatedTimeMinutes: 14,
        congestionPercentage: 32,
        capacityPercentage: 78,
        affectedUsersEstimate: 2400,
        viaRoads: ['Bengali Square', 'Ring Road East', 'MR-10 Bridge'],
        isRecommended: false,
        recommendationReason: 'Slightly longer distance but clean traffic flow',
        coordinates: [
          [22.7244, 75.8839],
          [22.7350, 75.9100],
          [22.7450, 75.9050],
          [22.7533, 75.8937]
        ]
      },
      {
        id: `route-alt-B-${Date.now()}`,
        routeName: 'Route B: Janjeerwala Square to Race Course Link',
        distanceKm: 7.1,
        estimatedTimeMinutes: 17,
        congestionPercentage: 24,
        capacityPercentage: 85,
        affectedUsersEstimate: 3100,
        viaRoads: ['Janjeerwala Square', 'Lantern Square', 'Race Course Rd'],
        isRecommended: false,
        recommendationReason: 'Bypasses construction corridor completely',
        coordinates: [
          [22.7244, 75.8839],
          [22.7320, 75.8780],
          [22.7420, 75.8800],
          [22.7533, 75.8937]
        ]
      },
      {
        id: `route-alt-C-${Date.now()}`,
        routeName: 'Route C: Eastern Bypass Highway Corridor',
        distanceKm: 8.4,
        estimatedTimeMinutes: 12,
        congestionPercentage: 18,
        capacityPercentage: 92,
        affectedUsersEstimate: 4200,
        viaRoads: ['Kanadia Road Interchange', 'Eastern Bypass', 'MR-10 Junction'],
        isRecommended: true,
        recommendationReason: 'FASTEST: Lowest congestion (18%) + Saves 11 minutes over blocked corridor',
        coordinates: [
          [22.7244, 75.8839],
          [22.7200, 75.9130],
          [22.7400, 75.9450],
          [22.7600, 75.8980],
          [22.7533, 75.8937]
        ]
      }
    ];

    const plan: ReroutePlan = {
      id: `reroute-${Date.now().toString().slice(-6)}`,
      affectedRoadId,
      affectedRoadName,
      incidentId,
      alternateRoutes,
      recommendedRouteId: alternateRoutes[2].id,
      status: 'PROPOSED',
      targetUserCount: 4200
    };

    this.reroutePlans.unshift(plan);
    return plan;
  }

  public approveReroutePlan(planId: string, adminEmail: string, role: any): ReroutePlan | undefined {
    const plan = this.reroutePlans.find(p => p.id === planId);
    if (plan) {
      plan.status = 'APPROVED';
      plan.approvedAt = new Date().toISOString();
      plan.approvedBy = adminEmail;

      this.toggleRoadClosure(plan.affectedRoadId, true, `Authorized dynamic reroute execution (Plan: ${plan.id})`, adminEmail, role);

      const notif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: '🚨 OFFICIAL TRAFFIC DIVERSION APPROVED',
        message: `Authorities have closed ${plan.affectedRoadName} due to critical incident. Switch to ${plan.alternateRoutes.find((r: AlternateRoute) => r.id === plan.recommendedRouteId)?.routeName || 'recommended alternate route'}. ETA saved: 11 mins.`,
        type: 'CRITICAL',
        timestamp: new Date().toISOString(),
        affectedRoadId: plan.affectedRoadId,
        reroutePlanId: plan.id,
        audience: 'ALL'
      };
      this.notifications.unshift(notif);

      this.addAuditLog(adminEmail, role, 'APPROVE_REROUTE', plan.affectedRoadName, `Approved dynamic reroute plan ${plan.id}`);
    }
    return plan;
  }

  public submitCivilianReport(report: Omit<CivilianIncidentReport, 'id' | 'reportedAt' | 'status' | 'upvotes'>): CivilianIncidentReport {
    const newRep: CivilianIncidentReport = {
      ...report,
      id: `civ-rep-${Date.now().toString().slice(-5)}`,
      reportedAt: new Date().toISOString(),
      status: 'SUBMITTED',
      upvotes: 1
    };
    this.civilianReports.unshift(newRep);
    this.addAuditLog(report.reportedByEmail, 'CIVILIAN', 'CIVILIAN_REPORT', report.incidentType, `Civilian reported incident near ${report.location.lat}, ${report.location.lng}`);
    return newRep;
  }

  public verifyCivilianReport(id: string, adminEmail: string, role: any): Incident | undefined {
    const rep = this.civilianReports.find(r => r.id === id);
    if (rep) {
      rep.status = 'VERIFIED';
      const inc = this.createIncident({
        title: `Verified Civilian Report: ${rep.incidentType}`,
        type: rep.incidentType,
        severity: 'MEDIUM',
        description: rep.description,
        roadId: rep.roadId || 'road-ab-north',
        roadName: rep.roadName || 'AB Road Corridor',
        location: rep.location,
        affectedLanes: 1,
        expectedEndTime: new Date(Date.now() + 7200000).toISOString(),
        recommendedAction: 'Proceed with caution',
        status: 'ACTIVE',
        reportedByRole: 'CIVILIAN',
        reportedByEmail: rep.reportedByEmail,
        verifiedByAdmin: true
      });
      return inc;
    }
    return undefined;
  }

  public simulateAccidentScenario(): { incident: Incident; plan: ReroutePlan; notification: SystemNotification } {
    const targetRoadId = 'road-ab-north';
    const targetRoad = this.getRoadById(targetRoadId);

    const inc = this.createIncident({
      title: '🚨 CRITICAL MULTI-VEHICLE COLLISION DETECTED',
      type: 'ACCIDENT',
      severity: 'CRITICAL',
      description: 'Major collision between tanker and multi-axle truck near Vijay Nagar Square junction. Oil spill on 3 northbound lanes.',
      roadId: targetRoadId,
      roadName: targetRoad ? targetRoad.name : 'AB Road (Palasia to Vijay Nagar)',
      location: { lat: 22.7500, lng: 75.8920 },
      affectedLanes: 3,
      expectedEndTime: new Date(Date.now() + 10800000).toISOString(),
      recommendedAction: 'Immediate closure of northbound AB Road segment. Divert traffic to Eastern Bypass Corridor.',
      status: 'ACTIVE',
      reportedByRole: 'TRAFFIC_POLICE',
      reportedByEmail: 'police@indoretraffic.demo',
      verifiedByAdmin: true
    });

    const plan = this.generateReroutePlan(targetRoadId, inc.id);

    const notification: SystemNotification = {
      id: `notif-sim-${Date.now()}`,
      title: '🚨 CRITICAL ACCIDENT AHEAD - REROUTE AVAILABLE',
      message: 'Severe collision on AB Road (Palasia -> Vijay Nagar). Alternate Route C via Eastern Bypass activated. Save 11 min.',
      type: 'CRITICAL',
      timestamp: new Date().toISOString(),
      affectedRoadId: targetRoadId,
      reroutePlanId: plan.id,
      audience: 'ALL'
    };
    this.notifications.unshift(notification);

    this.addAuditLog('admin@indoretraffic.demo', 'ADMIN', 'SIMULATE_ACCIDENT', 'AB Road Corridor', 'Triggered SIH Demo Critical Accident Simulation');

    return { incident: inc, plan, notification };
  }

  private recalculateSignals() {
    this.signalRecommendations = this.roads.map(r => {
      let recGreen = 35;
      let reduction = 5;
      let reason = 'Normal flow split balancing';

      if (r.congestionPercentage > 85) {
        recGreen = 65;
        reduction = 22;
        reason = 'Severe queue accumulation detected at signal approach';
      } else if (r.congestionPercentage > 70) {
        recGreen = 50;
        reduction = 14;
        reason = 'High volume surge; extending green cycle phase';
      } else if (r.congestionPercentage < 30) {
        recGreen = 25;
        reduction = 8;
        reason = 'Light traffic; reallocating green phase to cross arterial';
      }

      return {
        roadId: r.id,
        roadName: r.name,
        currentGreenTimeSec: 35,
        recommendedGreenTimeSec: recGreen,
        expectedQueueReductionPercentage: reduction,
        reason,
        confidencePercentage: 91
      };
    });
  }

  public addAuditLog(adminEmail: string, role: any, action: string, targetObject: string, details: string) {
    const log: AuditLog = {
      id: `log-${Date.now().toString().slice(-6)}`,
      adminEmail,
      adminRole: role,
      action,
      targetObject,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
  }
}

export const store = new TrafficStore();
