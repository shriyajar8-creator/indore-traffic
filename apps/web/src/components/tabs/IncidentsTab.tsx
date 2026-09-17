import React, { useState } from 'react';
import { Incident, RoadSegment, IncidentSeverity, IncidentType } from '../../types';
import { AlertTriangle, Plus, Filter, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

  interface IncidentsTabProps {
  incidents: Incident[];
  roads: RoadSegment[];
  onCreateIncident: (data: any) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteIncident?: (id: string) => void;
  onEditIncident?: (id: string, updates: any) => void;
}

export const IncidentsTab: React.FC<IncidentsTabProps> = ({
  incidents,
  roads,
  onCreateIncident,
  onUpdateStatus,
  onDeleteIncident,
  onEditIncident
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<IncidentType>('ACCIDENT');
  const [category, setCategory] = useState<'construction' | 'accident' | 'waterlogging' | 'roadblock' | 'other'>('accident');
  const [severity, setSeverity] = useState<IncidentSeverity>('HIGH');
  const [roadId, setRoadId] = useState(roads[0]?.id || 'road-ab-north');
  const [description, setDescription] = useState('');
  const [affectedLanes, setAffectedLanes] = useState(2);
  const [lat, setLat] = useState('22.7533');
  const [lng, setLng] = useState('75.8937');

  // Crowdsourced Pending Verification Queue State
  const [pendingReports, setPendingReports] = useState<any[]>([
    {
      id: 'rep-civ-101',
      title: 'Oil Spill & Breakdown near Palasia Square',
      type: 'VEHICLE_BREAKDOWN',
      severity: 'HIGH',
      locationText: 'Palasia Square, Indore (22.7244, 75.8839)',
      description: 'Heavy truck breakdown leaking oil across 2 lanes. Traffic slowing rapidly.',
      reportedAt: new Date(Date.now() - 1200000).toISOString(),
      reporter: 'Commuter (Aman V.)',
      imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=300&q=80',
      status: 'PENDING_VERIFICATION'
    },
    {
      id: 'rep-civ-102',
      title: 'Waterlogging & Fallen Branch near Geeta Bhawan',
      type: 'WATERLOGGING',
      severity: 'MEDIUM',
      locationText: 'Geeta Bhawan Underpass (22.7160, 75.8800)',
      description: 'Stormwater accumulation blocking left lane.',
      reportedAt: new Date(Date.now() - 2400000).toISOString(),
      reporter: 'Citizen Dispatch',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&q=80',
      status: 'PENDING_VERIFICATION'
    }
  ]);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyAndPromote = (rep: any) => {
    onCreateIncident({
      title: `Verified Report: ${rep.title}`,
      type: rep.type,
      category: 'accident',
      severity: rep.severity,
      description: rep.description,
      roadId: roads[0]?.id || 'road-ab-north',
      roadName: rep.locationText.split('(')[0] || 'Arterial Corridor',
      location: { lat: 22.7244, lng: 75.8839 },
      affectedLanes: 2,
      imageUrl: rep.imageUrl,
      expectedEndTime: new Date(Date.now() + 7200000).toISOString(),
      recommendedAction: 'Verify scene and clear obstruction'
    });
    setPendingReports(prev => prev.filter(p => p.id !== rep.id));
  };

  const filteredIncidents = incidents.filter(i => {
    if (filterSeverity !== 'ALL' && i.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && i.status !== filterStatus) return false;
    if (filterType === 'ACCIDENT' && i.type !== 'ACCIDENT') return false;
    if (filterType === 'OTHER' && i.type === 'ACCIDENT') return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const road = roads.find(r => r.id === roadId);
    onCreateIncident({
      title,
      type,
      category,
      severity,
      description,
      roadId,
      roadName: road ? road.name : 'Target Corridor',
      location: { lat: parseFloat(lat) || 22.7533, lng: parseFloat(lng) || 75.8937 },
      affectedLanes,
      imageUrl: imagePreview || undefined,
      expectedEndTime: new Date(Date.now() + 7200000).toISOString(),
      recommendedAction: 'Divert traffic to alternate corridors'
    });
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
    setImagePreview(null);
  };


  const [sortBySla, setSortBySla] = useState<string>('OVERDUE_FIRST');

  const getSlaInfo = (startTimeStr: string) => {
    const elapsedMs = Date.now() - new Date(startTimeStr).getTime();
    const elapsedMins = Math.max(1, Math.floor(elapsedMs / 60000));

    let statusLabel = 'FRESH';
    let badgeStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (elapsedMins > 120) {
      statusLabel = 'OVERDUE';
      badgeStyle = 'bg-red-600 text-white font-extrabold border-red-400 animate-pulse';
    } else if (elapsedMins >= 30) {
      statusLabel = 'AGING';
      badgeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }

    const hrs = Math.floor(elapsedMins / 60);
    const mins = elapsedMins % 60;
    const timeDisplay = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

    return { elapsedMins, statusLabel, badgeStyle, timeDisplay };
  };

  const sortedAndFilteredIncidents = [...filteredIncidents].sort((a, b) => {
    const ageA = getSlaInfo(a.startTime).elapsedMins;
    const ageB = getSlaInfo(b.startTime).elapsedMins;

    if (sortBySla === 'OVERDUE_FIRST') return ageB - ageA;
    if (sortBySla === 'NEWEST') return ageA - ageB;
    if (sortBySla === 'OLDEST') return ageB - ageA;
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Top Header Controls */}
      <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">Incidents & Accidents Command Center</h2>
            <p className="text-xs text-slate-400">Unified Portal for Citywide Accidents, Crowdsourced Hazards & SLA Aging Response</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none font-semibold"
            >
              <option value="ALL">All Event Types</option>
              <option value="ACCIDENT">Accidents Only</option>
              <option value="OTHER">Incidents & Jams</option>
            </select>

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
              value={sortBySla}
              onChange={(e) => setSortBySla(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none font-bold"
            >
              <option value="OVERDUE_FIRST">SLA: Overdue First</option>
              <option value="NEWEST">SLA: Newest First</option>
              <option value="OLDEST">SLA: Oldest First</option>
            </select>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center space-x-1.5 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>REPORT NEW EVENT</span>
          </button>
        </div>
      </div>

      {/* Pending Crowdsourced Verification Queue */}
      {pendingReports.length > 0 && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                Pending Crowdsourced Verification Queue ({pendingReports.length} Reports)
              </h3>
            </div>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Needs Authority Review
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingReports.map(rep => {
              const sla = getSlaInfo(rep.reportedAt);
              return (
                <div key={rep.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-500/20 text-amber-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                        {rep.severity} • {rep.type}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${sla.badgeStyle}`}>
                        SLA: {sla.timeDisplay} ({sla.statusLabel})
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-white">{rep.title}</h4>
                    <p className="text-[11px] text-slate-300">{rep.description}</p>
                    <p className="text-[10px] text-blue-400 font-semibold">{rep.locationText}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {rep.imageUrl && (
                      <img src={rep.imageUrl} alt="Incident Upload" className="w-12 h-12 rounded object-cover border border-slate-700" />
                    )}
                    <button
                      onClick={() => handleVerifyAndPromote(rep)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] py-1 px-2.5 rounded shadow flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>VERIFY & PROMOTE</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                <th className="px-4 py-3">SLA Aging</th>
                <th className="px-4 py-3">Detected At</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sortedAndFilteredIncidents.map((inc) => {
                const sla = getSlaInfo(inc.startTime);
                return (
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
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sla.badgeStyle}`}>
                        {sla.timeDisplay} • {sla.statusLabel}
                      </span>
                    </td>
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
                );
              })}
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
