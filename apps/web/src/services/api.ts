import { io, Socket } from 'socket.io-client';

const API_BASE = '/api';

export class ApiService {
  private static socket: Socket | null = null;

  public static getSocket(): Socket {
    if (!ApiService.socket) {
      ApiService.socket = io(window.location.origin, {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      });
    }
    return ApiService.socket;
  }

  private static getHeaders() {
    const token = localStorage.getItem('indore_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  public static async login(email: string, pass: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  }

  public static async getLiveTraffic() {
    const res = await fetch(`${API_BASE}/traffic/live`, { headers: this.getHeaders() });
    return res.json();
  }

  public static async getTrafficHistory() {
    const res = await fetch(`${API_BASE}/traffic/history`, { headers: this.getHeaders() });
    return res.json();
  }

  public static async getPredictions() {
    const res = await fetch(`${API_BASE}/traffic/predictions`, { headers: this.getHeaders() });
    return res.json();
  }

  public static async createIncident(data: any) {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create incident');
    }
    return res.json();
  }

  public static async updateIncidentStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  }

  public static async toggleRoadClosure(roadId: string, isClosed: boolean, reason: string) {
    const res = await fetch(`${API_BASE}/closures`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ roadId, isClosed, reason })
    });
    return res.json();
  }

  public static async calculateReroute(targetRoadId: string) {
    const res = await fetch(`${API_BASE}/routes/calculate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ targetRoadId })
    });
    return res.json();
  }

  public static async approveReroute(planId: string) {
    const res = await fetch(`${API_BASE}/reroutes/${planId}/approve`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async submitCivilianReport(data: any) {
    const res = await fetch(`${API_BASE}/civilian/report`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async simulateAccident() {
    const res = await fetch(`${API_BASE}/simulation/accident`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async getAuditLogs() {
    const res = await fetch(`${API_BASE}/audit-logs`, { headers: this.getHeaders() });
    return res.json();
  }
}
