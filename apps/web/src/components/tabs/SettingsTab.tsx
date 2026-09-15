import React from 'react';
import { Settings, ShieldCheck, Database, Wifi, Activity, Cpu } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">System Settings & Infrastructure Status</h2>
            <p className="text-xs text-slate-400">Telemetry Monitoring, Database Verification & API Configuration</p>
          </div>
        </div>

        <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 live-beacon"></span>
          <span>● SYSTEM LIVE</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center space-x-2 text-blue-400">
            <Cpu className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Backend API Server</h3>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-emerald-400">CONNECTED (Port 4000)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Authentication:</span>
              <span className="font-bold text-white">JWT + RBAC Enforced</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Environment:</span>
              <span className="font-bold text-slate-300">Production Node.js v24</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center space-x-2 text-purple-400">
            <Database className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Database & Spatial Store</h3>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-emerald-400">CONNECTED (PostGIS Ready)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dataset Baseline:</span>
              <span className="font-bold text-amber-400">Official Report (Dec 2024 - Apr 2025)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Junction Audit Rows:</span>
              <span className="font-bold text-white">13 Official Junctions (45.19M veh)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Wifi className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Real-Time Event Bus</h3>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Protocol:</span>
              <span className="font-bold text-emerald-400">Socket.IO WebSockets</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Auto Reconnect:</span>
              <span className="font-bold text-white">Enabled (10 Max Retries)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Bus Channels:</span>
              <span className="font-bold text-slate-300">11 Event Topics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
