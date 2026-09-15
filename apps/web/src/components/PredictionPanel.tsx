import React from 'react';
import { RoadSegment } from '../types';
import { BrainCircuit, Clock, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface PredictionPanelProps {
  roads: RoadSegment[];
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({ roads }) => {
  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-base text-white">Predictive Traffic Engine</h2>
              <span className="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500/30">
                ML-Ready Spatial Model
              </span>
            </div>
            <p className="text-xs text-slate-400">Forecasting Saturation & Speed Horizons (+15m, +30m, +60m)</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 block">Model Confidence</span>
          <span className="text-sm font-extrabold text-emerald-400">89.4% Avg</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roads.slice(0, 6).map((road) => {
          const p = road.predictions;
          return (
            <div key={road.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between border-b border-slate-800/80 pb-2">
                <div>
                  <h3 className="font-bold text-xs text-white truncate max-w-[180px]">{road.name}</h3>
                  <span className="text-[10px] text-slate-400">{road.category}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {p.confidencePercentage}% Conf.
                </span>
              </div>

              {/* Time Horizon Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block font-bold">NOW</span>
                  <span className="font-extrabold text-amber-400 text-sm">{road.congestionPercentage}%</span>
                  <span className="text-[9px] text-slate-400 block">{road.currentSpeed} km/h</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block font-bold">+15 MIN</span>
                  <span className="font-extrabold text-amber-400 text-sm">{p.plus15Min.congestion}%</span>
                  <span className="text-[9px] text-slate-400 block">{p.plus15Min.speed} km/h</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block font-bold">+30 MIN</span>
                  <span className={`font-extrabold text-sm ${p.plus30Min.congestion > 80 ? 'text-red-400' : 'text-amber-400'}`}>
                    {p.plus30Min.congestion}%
                  </span>
                  <span className="text-[9px] text-slate-400 block">{p.plus30Min.speed} km/h</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block font-bold">+60 MIN</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{p.plus60Min.congestion}%</span>
                  <span className="text-[9px] text-slate-400 block">{p.plus60Min.speed} km/h</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Supported External AI Integration Interfaces: <strong>Random Forest, XGBoost, LSTM Time-Series Pipeline</strong></span>
        </div>
        <span className="text-emerald-400 font-semibold text-[10px]">Deterministic Engine Active</span>
      </div>
    </div>
  );
};
