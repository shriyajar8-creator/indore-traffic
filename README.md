# 🚦 INDORE TRAFFIC INTELLIGENCE & RESPONSE PLATFORM

> **Smart India Hackathon (SIH) Flagship Project**  
> *An Urban Traffic Decision Support System connecting authorities and civilians in real time.*

---

## 📌 Executive Summary & Core Positioning

The **Indore Traffic Intelligence & Response Platform** is **NOT** a simple navigation clone. It is a production-grade, highly reactive command-and-control platform engineered specifically for **Indore, Madhya Pradesh, India**.

It bridges traffic police, municipal authorities, emergency services, and commuters into a unified real-time loop:

$$\text{MONITOR} \longrightarrow \text{DETECT} \longrightarrow \text{DECIDE} \longrightarrow \text{INTERVENE} \longrightarrow \text{REROUTE} \longrightarrow \text{NOTIFY} \longrightarrow \text{ANALYZE}$$

---

## 🔑 Demo Credentials (Quick Hackathon Verification)

The system includes pre-seeded demo accounts with role-based access control (RBAC):

| Role | Email | Password | Scope / Powers |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@indoretraffic.demo` | `Admin@123` | Full Command Center, Rerouting Approvals, Audits |
| **TRAFFIC POLICE** | `police@indoretraffic.demo` | `Police@123` | Incident Verification, Patrol Dispatch, Signal Overrides |
| **ROAD / MUNICIPAL**| `roads@indoretraffic.demo` | `Roads@123` | Construction Management, Work Zone Delays |
| **EMERGENCY (108)** | `emergency@indoretraffic.demo` | `Emergency@123` | Priority Green Corridors, Ambulance Routing |
| **CIVILIAN** | `user@indoretraffic.demo` | `User@123` | Realtime Route Guidance, Instant Reroute Modals |

---

## 🏗 System Architecture & Monorepo Structure

```
/indore-traffic-intelligence
├── /apps
│   ├── /web              # React + Vite + TypeScript + Tailwind CSS + Leaflet (GIS Layer) + Recharts
│   └── /api              # Node.js + Express + TypeScript + Socket.IO + In-Memory Store & PostGIS compatibility
├── /packages
│   └── /types            # Shared TypeScript interfaces (Roads, Incidents, ReroutePlans, AuditLogs)
├── /data
│   └── indore_traffic_dataset.json   # Seed spatial dataset for Indore's top corridors (AB Road, Ring Road, etc.)
├── /scripts
│   └── seed.js           # Seed runner script
├── docker-compose.yml    # Containerization setup for PostgreSQL/PostGIS, Redis, API, and Web
├── .env.example          # Environment variables template
└── README.md
```

---

## ⚡ Real-Time WebSocket Events

The platform uses WebSocket (`socket.io`) events to propagate state updates instantaneously across connected Admin Command Centers and Civilian applications:

- `traffic.updated`: Emitted whenever corridor velocity or congestion changes.
- `incident.created`: Triggered when an accident, breakdown, or hazard is reported.
- `road.closed` / `road.opened`: Broadcast when authorities close or open a road.
- `reroute.approved`: Published when an official diversion is approved by Command Director.
- `alert.broadcast`: Pushed directly to connected civilian devices with time-saved badges.
- `kpi.updated`: Real-time citywide KPI refresh.

---

## 🗺 GIS & Map Provider Abstraction Layer

The frontend incorporates a decoupled GIS service (`MapService.ts`) that decouples map rendering logic from UI components. It supports pluggable map providers:

- **OpenStreetMap** (Default free tile engine)
- **MapLibre GL JS**
- **ArcGIS Traffic Layers**
- **Mapbox**
- **Google Maps Platform**

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation Commands

```bash
# 1. Install dependencies across monorepo
npm install

# 2. Seed Indore spatial dataset
npm run seed

# 3. Launch Development Server (API on :4000, Web App on :5173)
npm run dev
```

Visit the application in your browser:
- **Web App / Command Center**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:4000/api/traffic/live`

---

## 🐳 Docker Deployment

To launch the complete production stack (PostgreSQL + PostGIS, Redis, API, Frontend):

```bash
docker-compose up --build -d
```

---

## 🧪 30-Second SIH Judge Demonstration Flow

1. Open `http://localhost:5173` in Admin Command Center mode.
2. Click the glowing **`SIMULATE ACCIDENT`** button in the top bar.
3. Observe live event flow:
   - AB Road corridor turns dark red (congestion spikes to 95%).
   - Accident marker appears on the map.
   - Event Timeline visualizer opens (10:32:04 Detected → ... → 10:33:10 Routes Recalculated).
   - Dynamic Reroute Engine generates Route C via Eastern Bypass (Save 11 min).
4. Click **`APPROVE OFFICIAL DIVERSION`**.
5. Switch role to **Civilian**.
6. The Civilian app instantly displays the **`🚨 ROAD CLOSURE ALERT`** modal with "New ETA: 18 min (Saved 11 min)" and automatically recalculates the route.

---

## 📊 REST API Reference Summary

- `POST /api/auth/login` - Authenticate user & get JWT token.
- `GET /api/traffic/live` - Retrieve live roads, KPIs, active incidents, and signal guidance.
- `GET /api/traffic/history` - Fetch 24-hour historical speed profiles.
- `GET /api/traffic/predictions` - Fetch +15m, +30m, +60m spatial predictions.
- `POST /api/incidents` - Create new official incident.
- `POST /api/closures` - Block or open a road corridor.
- `POST /api/routes/calculate` - Generate alternate routes for affected corridor.
- `POST /api/reroutes/:id/approve` - Approve dynamic diversion and broadcast to civilians.
- `POST /api/civilian/report` - Submit citizen hazard report for authority review.
- `POST /api/simulation/accident` - Trigger SIH demo accident cascade.

---

## 🔒 Security & Auditability

- **JWT Authentication** with password hashing (`bcryptjs`).
- **Role-Based Access Control (RBAC)** restricting road closure and reroute authority.
- **Timestamped Audit Logging** logging every administrative intervention for official record-keeping.

---

## 📄 License
Designed & Developed for Smart India Hackathon (SIH) 2026.
