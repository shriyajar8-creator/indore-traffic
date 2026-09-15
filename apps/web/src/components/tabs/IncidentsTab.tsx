import React, { useState } from 'react';
import { Incident, RoadSegment, IncidentSeverity, IncidentType } from '../../types';
import { AlertTriangle, Plus, Filter, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

interface IncidentsTabProps {
  incidents: Incident[];
  roads: RoadSegment[];
  onCreateIncident: (data: any) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export const IncidentsTab: React.FC<IncidentsTabProps> = ({
  incidents,
  roads,
  onCreateIncident,
  onUpdateStatus
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<IncidentType>('ACCIDENT');
  const [severity, setSeverity] = useState<IncidentSeverity>('HIGH');
  const [roadId, setRoadId] = useState(roads[0]?.id || 'road-ab-north');
  const [description, setDescription] = useState('');
  const [affectedLanes, setAffectedLanes] = useState(2);

  const filteredIncidents = incidents.filter(i => {
    if (filterSeverity !== 'ALL' && i.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && i.status !== filterStatus) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const road = roads.find(r => r.id === roadId);
    onCreateIncident({
      title,
      type,
      severity,
      description,
      roadId,
      roadName: road ? road.name : 'Target Corridor',
      location: road?.coordinates[0] ? { lat: road.coordinates[0][0], lng: road.coordinates[0][1] } : { lat: 22.7196, lng: 75.8577 },
      affectedLanes,
      expectedEndTime: new Date(Date.now() + 7200000).toISOString(),
      recommendedAction: 'Divert traffic to alternate corridors'
    });
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-4">
      {/* Top Header Controls */}
      <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">Traffic Incident Management Center</h2>
            <p className="text-xs text-slate-400">Monitor, Dispatch, and Resolve Citywide Traffic Obstacles</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="RESOLVED">Resolved</option>
              <option value="UNDER_REVIEW">Under Review</option>
            </select>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center space-x-1.5 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>REPORT NEW INCIDENT</span>
          </button>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
              <tr>
                <th className="px-4 py-3">Incident ID</th>
                <th className="px-4 py-3">Title & Type</th>
                <th className="px-4 py-3">Corridor</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Lanes Blocked</th>
                <th className="px-4 py-3">Detected At</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-mono font-bold text-slate-400">{inc.id}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-white block">{inc.title}</span>
                    <span className="text-[10px] text-slate-400">{inc.type}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-400">{inc.roadName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      inc.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-white">{inc.affectedLanes} Lanes</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{inc.startTime.slice(11, 16)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.status === 'ACTIVE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inc.status === 'ACTIVE' ? (
                      <button
                        onClick={() => onUpdateStatus(inc.id, 'RESOLVED')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] py-1 px-3 rounded shadow"
                      >
                        RESOLVE
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white">Create Official Traffic Incident</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Incident Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Tanker Stall near LIG Circle"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as IncidentType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="ACCIDENT">Accident</option>
                    <option value="TRAFFIC_JAM">Traffic Jam</option>
                    <option value="ROAD_BLOCKAGE">Road Blockage</option>
                    <option value="VEHICLE_BREAKDOWN">Vehicle Breakdown</option>
                    <option value="WATERLOGGING">Waterlogging</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Affected Road Corridor</label>
                <select
                  value={roadId}
                  onChange={(e) => setRoadId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                >
                  {roads.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details regarding obstacle and lanes affected..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold">
                  Publish Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
