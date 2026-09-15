import React, { useState } from 'react';
import { ReroutePlan, RoadSegment, AlternateRoute } from '../types';
import { GitFork, CheckCircle2, ShieldAlert, Clock, ArrowRight, Zap, AlertCircle } from 'lucide-react';

interface RerouteDrawerProps {
  plan: ReroutePlan | null;
  roads: RoadSegment[];
  onCalculatePlan: (roadId: string) => void;
  onApprovePlan: (planId: string) => void;
  onClose: () => void;
}

export const RerouteEngineDrawer: React.FC<RerouteDrawerProps> = ({
  plan,
  roads,
  onCalculatePlan,
  onApprovePlan,
  onClose
}) => {
  const [selectedRoadId, setSelectedRoadId] = useState<string>(roads[0]?.id || 'road-ab-north');

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white">Authority Traffic Rerouting Engine</h2>
            <p className="text-xs text-slate-400">Dynamic Traffic Diversion & Capacity Re-allocation System</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800">
          Close
        </button>
      </div>

      {/* Corridor Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Target Affected Corridor
          </label>
          <select
            value={selectedRoadId}
            onChange={(e) => setSelectedRoadId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {roads.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.congestionPercentage}% Congested - {r.status})
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => onCalculatePlan(selectedRoadId)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center space-x-2 shadow-lg transition"
        >
          <Zap className="w-4 h-4" />
          <span>CALCULATE ALTERNATES</span>
        </button>
      </div>

      {/* Generated Reroute Plan View */}
      {plan ? (
        <div className="space-y-4 pt-2">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Active Reroute Plan</span>
              <h3 className="text-sm font-bold text-white">{plan.affectedRoadName}</h3>
              <p className="text-xs text-slate-400">Estimated Target Commuters Affected: <strong className="text-white">{plan.targetUserCount.toLocaleString()}</strong></p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${plan.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
              Status: {plan.status}
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Generated Alternate Routes</h4>
            {plan.alternateRoutes.map((route: AlternateRoute) => (
              <div 
                key={route.id}
                className={`p-4 rounded-xl border transition-all ${
                  route.isRecommended 
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg' 
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-white">{route.routeName}</h4>
                      {route.isRecommended && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-500/40 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>RECOMMENDED BY SYSTEM</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Via: {route.viaRoads.join(' → ')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400 font-sans">{route.estimatedTimeMinutes} min</span>
                    <span className="block text-[10px] text-slate-400">{route.distanceKm} km</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Congestion</span>
                    <span className="font-bold text-emerald-400">{route.congestionPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Absorb Capacity</span>
                    <span className="font-bold text-blue-400">{route.capacityPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Commuters Shifted</span>
                    <span className="font-bold text-white">~{route.affectedUsersEstimate}</span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-300 bg-slate-950/50 p-2 rounded border border-slate-800/80">
                  <span className="font-bold text-amber-400">Rationale: </span>
                  {route.recommendationReason}
                </div>
              </div>
            ))}
          </div>

          {/* Explainable AI Decision Box */}
          <div className="bg-blue-950/30 border border-blue-800/40 p-3 rounded-lg text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-blue-400">
              <AlertCircle className="w-4 h-4" />
              <span>EXPLAINABLE INTELLIGENCE SUMMARY</span>
            </div>
            <p className="text-slate-300">
              Rerouting from {plan.affectedRoadName} → Alternate Route C via Eastern Bypass prevents cascading traffic lock at Vijay Nagar Chowk and saves commuters an average of 11 minutes. Confidence score: 91%.
            </p>
          </div>

          {/* Action buttons */}
          {plan.status !== 'APPROVED' && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onApprovePlan(plan.id)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs py-3 rounded-lg shadow-xl flex items-center justify-center space-x-2 uppercase tracking-wider"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>APPROVE OFFICIAL DIVERSION & BROADCAST TO USERS</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
          Select a corridor above and click &quot;Calculate Alternates&quot; to initialize dynamic rerouting analysis.
        </div>
      )}
    </div>
  );
};
