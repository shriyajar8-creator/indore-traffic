import React, { useState } from 'react';
import { AuditLog } from '../../types';
import { FileText, Search, ShieldCheck, Plus, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ApiService } from '../../services/api';

interface ReportsLogsTabProps {
  auditLogs: AuditLog[];
  onRefreshLogs?: () => void;
}

const POPULAR_LOCATIONS = [
  { name: 'Palasia Square, AB Road', roadId: 'road-ab-north', lat: 22.7244, lng: 75.8839 },
  { name: 'Vijay Nagar Square, AB Road', roadId: 'road-ab-north', lat: 22.7533, lng: 75.8937 },
  { name: 'Rajwada Palace, City Center', roadId: 'road-mg-west', lat: 22.7196, lng: 75.8577 },
  { name: 'Bhawarkuan Square, A.B. Road', roadId: 'road-ab-south', lat: 22.6917, lng: 75.8672 },
  { name: 'LIG Square, Ring Road', roadId: 'road-ring-east', lat: 22.7380, lng: 75.8890 },
  { name: 'Geeta Bhawan Underpass', roadId: 'road-mg-west', lat: 22.7160, lng: 75.8800 },
  { name: 'MR-10 Ring Road Crossing', roadId: 'road-ring-east', lat: 22.7680, lng: 75.8980 }
];

export const ReportsLogsTab: React.FC<ReportsLogsTabProps> = ({ auditLogs, onRefreshLogs }) => {
  const [search, setSearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Form State with Live Binding Fix (Task 5)
  const [reportTitle, setReportTitle] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; roadId: string; lat: number; lng: number } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [issueType, setIssueType] = useState('ROAD_BLOCKAGE');
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase()) ||
    l.adminEmail.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSuggestions = POPULAR_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(locationQuery.toLowerCase())
  );

  const handleSelectLocation = (loc: { name: string; roadId: string; lat: number; lng: number }) => {
    setLocationQuery(loc.name);
    setSelectedLocation(loc);
    setShowSuggestions(false);
  };

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocationQuery(val);
    setShowSuggestions(true);
    // Bind current custom string value if not selecting from dropdown
    setSelectedLocation({
      name: val,
      roadId: 'road-ab-north',
      lat: 22.7244,
      lng: 75.8839
    });
  };

  const handleSubmitIssueReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationQuery.trim() || !description.trim()) return;

    setSubmitting(true);
    setSuccessMsg(null);
    try {
      const activeLoc = selectedLocation || {
        name: locationQuery,
        roadId: 'road-ab-north',
        lat: 22.7244,
        lng: 75.8839
      };

      await ApiService.createIncident({
        title: reportTitle || `Reported Issue: ${issueType.replace('_', ' ')}`,
        type: issueType,
        category: 'other',
        severity,
        description: `${description} [Location: ${activeLoc.name}]`,
        roadId: activeLoc.roadId,
        roadName: activeLoc.name,
        location: { lat: activeLoc.lat, lng: activeLoc.lng },
        affectedLanes: 1,
        expectedEndTime: new Date(Date.now() + 7200000).toISOString(),
        recommendedAction: 'Dispatch field patrol for hazard inspection'
      });

      setSuccessMsg(`Issue successfully reported & persisted for ${activeLoc.name}!`);
      setTimeout(() => {
        setShowReportModal(false);
        setReportTitle('');
        setLocationQuery('');
        setSelectedLocation(null);
        setDescription('');
        setSuccessMsg(null);
        if (onRefreshLogs) onRefreshLogs();
      }, 1200);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => prev === id ? null : id);
  };

  const getLogSlaInfo = (timestampStr: string) => {
    const elapsedMs = Date.now() - new Date(timestampStr).getTime();
    const elapsedMins = Math.max(1, Math.floor(elapsedMs / 60000));
    let badgeStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    let label = 'FRESH';
    if (elapsedMins > 120) {
      badgeStyle = 'bg-red-500/20 text-red-400 border-red-500/30 font-bold';
      label = 'OVERDUE';
    } else if (elapsedMins >= 30) {
      badgeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      label = 'AGING';
    }
    const hrs = Math.floor(elapsedMins / 60);
    const mins = elapsedMins % 60;
    const timeDisplay = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    return { timeDisplay, label, badgeStyle };
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">Administrative System Audit & Activity Reports</h2>
            <p className="text-xs text-slate-400">Timestamped Record of All Authority Interventions, SLA Response & System Logs</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit logs..."
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg pl-9 pr-3 py-1.5 focus:outline-none w-56 sm:w-64"
            />
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>REPORT ISSUE</span>
          </button>
        </div>
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
              <tr>
                <th className="px-4 py-3">Log ID</th>
                <th className="px-4 py-3">Authority User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target Object</th>
                <th className="px-4 py-3">SLA Age</th>
                <th className="px-4 py-3">Status / Inspect</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const sla = getLogSlaInfo(log.timestamp);
                return (
                  <React.Fragment key={log.id}>
                    <tr className={`hover:bg-slate-800/40 transition ${isExpanded ? 'bg-slate-800/50' : ''}`}>
                      <td className="px-4 py-3 font-mono font-bold text-slate-400">{log.id}</td>
                      <td className="px-4 py-3 font-bold text-white">{log.adminEmail}</td>
                      <td className="px-4 py-3 text-blue-400 font-semibold">{log.adminRole}</td>
                      <td className="px-4 py-3 font-extrabold text-amber-400">{log.action}</td>
                      <td className="px-4 py-3 text-slate-200">{log.targetObject}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sla.badgeStyle}`}>
                          {sla.timeDisplay} • {sla.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleExpand(log.id)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold border transition flex items-center space-x-1 ${
                            isExpanded
                              ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{isExpanded ? 'HIDE DETAILS' : 'VIEW DETAILS'}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400 text-[11px]">{log.timestamp.slice(0, 19).replace('T', ' ')}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-950/80 border-y border-blue-500/30">
                        <td colSpan={8} className="p-4">
                          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                              <span className="font-bold text-blue-400 text-xs">Full Log Details • ID: {log.id}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Timestamp: {log.timestamp}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-300">
                              <div><strong className="text-slate-400">User Email:</strong> {log.adminEmail}</div>
                              <div><strong className="text-slate-400">Assigned Role:</strong> {log.adminRole}</div>
                              <div><strong className="text-slate-400">Action Type:</strong> {log.action}</div>
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-200">
                              <strong className="text-amber-400 text-[11px] block mb-0.5">Description & Payload Details:</strong>
                              <p className="text-slate-300 font-mono text-[11px]">{log.details || 'No additional payload notes recorded.'}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Issue Modal (Task 4 & Task 5 Location State Binding) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm text-white">Report New Traffic / Road Issue</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
            </div>

            {successMsg ? (
              <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-white">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitIssueReport} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Issue Title (Optional)</label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="e.g. Signal failure at Palasia Crossing"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Location Selection Input with Autocomplete (Task 4 & 5 Fix) */}
                <div className="relative">
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Location (Search or Select Junction)</span>
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  </label>
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={handleLocationInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type location e.g. Palasia, Vijay Nagar..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                    required
                  />

                  {/* Autocomplete Suggestions Dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl z-50 max-h-44 overflow-y-auto divide-y divide-slate-800">
                      {filteredSuggestions.map((loc, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectLocation(loc)}
                          className="p-2.5 hover:bg-slate-800 cursor-pointer flex items-center space-x-2 text-xs transition"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <div>
                            <span className="font-bold text-white block">{loc.name}</span>
                            <span className="text-[10px] text-slate-400">Coords: {loc.lat}, {loc.lng}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Issue Type</label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                    >
                      <option value="ROAD_BLOCKAGE">Road Blockage</option>
                      <option value="ACCIDENT">Accident</option>
                      <option value="WATERLOGGING">Waterlogging</option>
                      <option value="VEHICLE_BREAKDOWN">Vehicle Breakdown</option>
                      <option value="CONSTRUCTION">Construction Hazard</option>
                      <option value="OTHER">Other Issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Severity</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
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
                  <label className="block text-slate-300 font-semibold mb-1">Issue Description & Impact</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide description of traffic obstruction, lanes affected..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !locationQuery.trim() || !description.trim()}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-bold shadow-lg flex items-center space-x-1.5"
                  >
                    <span>{submitting ? 'Submitting...' : 'Submit & Save Issue'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

