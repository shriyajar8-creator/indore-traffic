import React, { useState } from 'react';
import { AuditLog } from '../../types';
import { FileText, Search, ShieldCheck } from 'lucide-react';

interface ReportsLogsTabProps {
  auditLogs: AuditLog[];
}

export const ReportsLogsTab: React.FC<ReportsLogsTabProps> = ({ auditLogs }) => {
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase()) ||
    l.adminEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">Administrative System Audit Logs</h2>
            <p className="text-xs text-slate-400">Timestamped Record of All Authority Interventions & Rerouting Orders</p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit logs..."
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg pl-9 pr-3 py-1.5 focus:outline-none w-64"
          />
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
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-mono font-bold text-slate-400">{log.id}</td>
                  <td className="px-4 py-3 font-bold text-white">{log.adminEmail}</td>
                  <td className="px-4 py-3 text-blue-400 font-semibold">{log.adminRole}</td>
                  <td className="px-4 py-3 font-extrabold text-amber-400">{log.action}</td>
                  <td className="px-4 py-3 text-slate-200">{log.targetObject}</td>
                  <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{log.details}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-400 text-[11px]">{log.timestamp.slice(0, 19).replace('T', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
