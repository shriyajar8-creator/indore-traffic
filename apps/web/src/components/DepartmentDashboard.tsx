import React from 'react';
import { UserRole, RoadSegment, Incident, ConstructionProject } from '../types';
import { ShieldCheck, Building2, Siren, Construction, AlertTriangle, CheckCircle2, Navigation } from 'lucide-react';

interface DeptProps {
  role: UserRole;
  roads: RoadSegment[];
  incidents: Incident[];
  constructions: ConstructionProject[];
}

export const DepartmentDashboard: React.FC<DeptProps> = ({ role, roads, incidents, constructions }) => {
  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            {role === 'TRAFFIC_POLICE' && <ShieldCheck className="w-5 h-5" />}
            {role === 'ROAD_DEPARTMENT' && <Building2 className="w-5 h-5" />}
            {role === 'EMERGENCY_RESPONSE' && <Siren className="w-5 h-5 text-red-400 animate-pulse" />}
            {role === 'ADMIN' && <Navigation className="w-5 h-5 text-emerald-400" />}
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">
              {role === 'TRAFFIC_POLICE' && 'Indore Traffic Police Headquarters Operational Console'}
              {role === 'ROAD_DEPARTMENT' && 'Indore Municipal & Public Works (PWD) Maintenance Portal'}
              {role === 'EMERGENCY_RESPONSE' && '108 Emergency Ambulance Priority Clearance Command'}
              {role === 'ADMIN' && 'Multi-Department Coordination Overview'}
            </h2>
            <p className="text-xs text-slate-400">Role-Based Tactical Action Center</p>
          </div>
        </div>
        <span className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full font-semibold">
          Role: {role.replace('_', ' ')}
        </span>
      </div>

      {/* Police View */}
      {(role === 'TRAFFIC_POLICE' || role === 'ADMIN') && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Active Patrol & Traffic Police Deployment Queues</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incidents.slice(0, 4).map(inc => (
              <div key={inc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-start justify-between">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {inc.severity} • {inc.type}
                  </span>
                  <h4 className="font-bold text-xs text-white mt-1">{inc.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{inc.description}</p>
                  <p className="text-[10px] text-blue-400 mt-2 font-semibold">Location: {inc.roadName}</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1 px-2.5 rounded">
                  Dispatch Officer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Road Dept View */}
      {(role === 'ROAD_DEPARTMENT' || role === 'ADMIN') && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Construction className="w-4 h-4 text-orange-400" />
            <span>Active Municipal Construction & Infrastructure Projects</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {constructions.map(c => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-white">{c.projectName}</h4>
                  <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold px-2 py-0.5 rounded">
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Department: {c.contractorDepartment}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-slate-800">
                  <span>Affected Corridor: <strong className="text-white">{c.roadName}</strong></span>
                  <span className="text-amber-400 font-bold">Delay: +{c.expectedDelayMinutes} mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency View */}
      {(role === 'EMERGENCY_RESPONSE' || role === 'ADMIN') && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Siren className="w-4 h-4 text-red-500 animate-pulse" />
            <span>Emergency Ambulance Corridor Clearance Engine</span>
          </h3>
          <div className="bg-red-950/20 border border-red-800/40 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                EMERGENCY PRIORITY ACTIVATED
              </span>
              <h4 className="text-sm font-bold text-white mt-1">FASTEST EMERGENCY CORRIDOR: MYH Hospital → Vijay Nagar</h4>
              <p className="text-xs text-slate-300 mt-0.5">Calculated ETA: <strong className="text-emerald-400 text-sm">7 min</strong> (Saves 14 mins over regular traffic)</p>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 px-4 rounded-lg shadow-lg">
              CLEAR GREEN WAVE LIGHTS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
